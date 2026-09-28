import assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as auth from './admin-auth.ts';
import * as upload from './admin-upload.ts';

// Exercise the actual actions without importing Next request context or contacting SMTP/Spaces.
const compiled = ts.transpileModule(readFileSync(new URL('../app/actions.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;

function createHarness(overrides = {}) {
  const env = {
    NODE_ENV: 'production',
    ADMIN_PASSWORD: 'test-only password',
    ADMIN_SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: '465',
    SMTP_SECURE: 'true',
    SMTP_USER: 'owner@example.test',
    SMTP_PASS: 'test-only mail password',
    ...overrides,
  };
  const cookieValues = new Map();
  const cookieWrites = [];
  const documents = new Map();
  const calls = { reads: [], writes: [], uploads: [], emails: [] };
  const actions = {};
  const dependencies = {
    'node:crypto': crypto,
    'next/headers': {
      cookies: async () => ({
        get: (name) => cookieValues.has(name) ? { value: cookieValues.get(name) } : undefined,
        set: (name, value, options) => {
          cookieWrites.push({ name, value, options });
          if (options.maxAge === 0) cookieValues.delete(name);
          else cookieValues.set(name, value);
        },
      }),
    },
    '@/lib/admin-auth': { ...auth, getAdminConfig: () => auth.getAdminConfig(env) },
    '@/lib/admin-upload': upload,
    '@/lib/spaces': {
      getJSON: async (key) => {
              calls.reads.push(key);
              if (calls.readError) throw calls.readError;
              return documents.get(key) ?? null;
            },
      putJSON: async (key, value) => { calls.writes.push({ key, value }); documents.set(key, value); },
      uploadFile: async (key, buffer, contentType) => {
        calls.uploads.push({ key, buffer, contentType });
        return `https://images.example.test/${key}`;
      },
    },
    '@/data/featured.json': {},
    '@/data/projects.json': [],
    nodemailer: { createTransport: () => ({ sendMail: async (mail) => { calls.emails.push(mail); } }) },
  };
  runInNewContext(compiled, {
    exports: actions,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    process: { env }, Buffer, File, FormData,
    console: { error: () => {} },
  });
  return { actions, env, cookieValues, cookieWrites, calls, documents };
}

async function assertWritesDenied(harness) {
  for (const request of [
    () => harness.actions.saveFeatured(null),
    () => harness.actions.saveProject(null),
    () => harness.actions.deleteProject('project-id'),
    () => harness.actions.uploadImage(null),
  ]) {
    const result = await request();
    assert.equal(result.success, false);
    assert.equal(result.code, 'UNAUTHORIZED');
  }
  assert.equal(harness.calls.reads.length, 0);
  assert.equal(harness.calls.writes.length, 0);
  assert.equal(harness.calls.uploads.length, 0);
}

test('all privileged actions deny signed-out requests before touching storage or input', async () => {
  const harness = createHarness();
  assert.equal((await harness.actions.getAdminSession()).authenticated, false);
  await assertWritesDenied(harness);
});

test('missing config, expired cookies, and tampered cookies fail closed', async () => {
  for (const mode of ['missing-password', 'short-secret', 'expired', 'tampered']) {
    const harness = createHarness();
    const config = auth.getAdminConfig(harness.env);
    let token = auth.createAdminSession(config);
    if (mode === 'missing-password') delete harness.env.ADMIN_PASSWORD;
    if (mode === 'short-secret') harness.env.ADMIN_SESSION_SECRET = 'short';
    if (mode === 'expired') token = auth.createAdminSession(config, Date.now() - auth.ADMIN_SESSION_SECONDS * 1000);
    if (mode === 'tampered') token += 'x';
    harness.cookieValues.set('__Host-portfolio-admin', token);
    assert.equal((await harness.actions.getAdminSession()).authenticated, false);
    await assertWritesDenied(harness);
    if (mode === 'missing-password' || mode === 'short-secret') {
      assert.equal((await harness.actions.verifyAdmin(config.password)).success, false);
      assert.equal(harness.cookieWrites.length, 0);
    }
  }
});

test('login sets a secure expiring HttpOnly cookie, enables editing, and logout clears it', async () => {
  const harness = createHarness();
  const { actions, cookieWrites, calls } = harness;
  assert.equal((await actions.verifyAdmin(harness.env.ADMIN_PASSWORD)).success, true);
  const cookie = cookieWrites[0];
  assert.equal(cookie.name, '__Host-portfolio-admin');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, true);
  assert.equal(cookie.options.sameSite, 'strict');
  assert.equal(cookie.options.path, '/');
  assert.equal(cookie.options.maxAge, auth.ADMIN_SESSION_SECONDS);
  assert.equal((await actions.getAdminSession()).authenticated, true);
  assert.equal((await actions.saveProject({ id: 'one', title: 'Example', mode: 'tech' })).success, true);
  assert.equal((await actions.saveFeatured({ title: 'Featured' })).success, true);
  assert.equal((await actions.deleteProject('one')).success, true);
  assert.equal(calls.writes.length, 3);
  assert.equal((await actions.logoutAdmin()).success, true);
  assert.equal(cookieWrites[1].options.maxAge, 0);
  assert.equal(cookieWrites[1].options.httpOnly, true);
  assert.equal((await actions.getAdminSession()).authenticated, false);
  calls.reads.length = 0;
  calls.writes.length = 0;
  await assertWritesDenied(harness);
});

test('storage read failures cannot overwrite remote projects with fallback content', async () => {
  const harness = createHarness();
  await harness.actions.verifyAdmin(harness.env.ADMIN_PASSWORD);
  harness.calls.readError = new Error('Storage unavailable');
  assert.equal((await harness.actions.saveProject({ id: 'one', title: 'Example', mode: 'tech' })).success, false);
  assert.equal((await harness.actions.deleteProject('one')).success, false);
  assert.equal(harness.calls.writes.length, 0);
  assert.equal((await harness.actions.getProjects()).length, 0, 'Public reads may still use local fallback.');
});

test('Vex Atlas source stays out of public reads and subsequent project writes', async () => {
  const harness = createHarness();
  const privateProject = { id: 'vex-atlas', title: 'Vex Atlas', mode: 'tech', githubLink: 'https://github.com/example/internal-app', link: 'https://internal.example.test' };
  harness.documents.set('data/projects.json', [privateProject, { id: 'public', title: 'Public', mode: 'tech', githubLink: 'https://github.com/example/public' }]);

  const projects = await harness.actions.getProjects();
  assert.equal(projects.length, 2);
  assert.equal('githubLink' in projects[0], false);
  assert.equal('link' in projects[0], false);
  assert.equal(projects[1].githubLink, 'https://github.com/example/public');
  assert.equal(privateProject.githubLink, 'https://github.com/example/internal-app', 'The read does not mutate the stored document.');

  await harness.actions.verifyAdmin(harness.env.ADMIN_PASSWORD);
  assert.equal((await harness.actions.saveProject({ id: 'public', title: 'Edited', mode: 'tech' })).success, true);
  assert.equal('githubLink' in harness.documents.get('data/projects.json')[0], false, 'Editing another project also clears the stale private link.');
  assert.equal((await harness.actions.saveProject(privateProject)).success, true);
  assert.equal('githubLink' in harness.documents.get('data/projects.json')[0], false, 'Admin edits cannot re-publish this repository.');
});

test('wrong passwords are rejected and login attempts are limited before issuing a cookie', async () => {
  const harness = createHarness();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal((await harness.actions.verifyAdmin('wrong')).success, false);
  }
  const blocked = await harness.actions.verifyAdmin(harness.env.ADMIN_PASSWORD);
  assert.equal(blocked.success, false);
  assert.match(blocked.error, /Too many/);
  assert.equal(harness.cookieWrites.length, 0);
});

test('uploads enforce size and magic bytes and never trust filename or supplied MIME', async () => {
  const harness = createHarness();
  await harness.actions.verifyAdmin(harness.env.ADMIN_PASSWORD);
  for (const value of [
    'not a file', new File([], 'empty.png'),
    new File([Buffer.alloc(upload.MAX_IMAGE_BYTES + 1)], 'large.png'),
    new File(['<script>alert(1)</script>'], 'fake.png', { type: 'image/png' }),
  ]) {
    const form = new FormData();
    form.set('file', value);
    assert.equal((await harness.actions.uploadImage(form)).success, false);
  }
  assert.equal(harness.calls.uploads.length, 0);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuoAAAAASUVORK5CYII=', 'base64');
  const form = new FormData();
  form.set('file', new File([png], '../../untrusted.html', { type: 'text/html' }));
  assert.equal((await harness.actions.uploadImage(form)).success, true);
  const uploaded = harness.calls.uploads[0];
  assert.match(uploaded.key, /^uploads\/[a-f0-9-]{36}\.png$/);
  assert.equal(uploaded.contentType, 'image/png');
  assert.deepEqual(uploaded.buffer, png);
});

test('contact runtime validation rejects malformed and oversized input before sending mail', async () => {
  const harness = createHarness();
  const valid = { email: 'visitor@example.test', message: 'A useful contact message.' };
  for (const data of [
    null, undefined, [], 'invalid', {},
    { ...valid, email: 123 }, { ...valid, message: null },
    { ...valid, name: {} }, { ...valid, company: [] },
    { ...valid, name: 'a'.repeat(101) }, { ...valid, company: 'a'.repeat(201) },
    { ...valid, email: 'a'.repeat(255) }, { ...valid, message: 'a'.repeat(5001) },
    { ...valid, email: 'visitor@example.test\r\nBcc: other@example.test' },
    { ...valid, name: 'Name\nBcc: other@example.test' }, { ...valid, email: 'Name <visitor@example.test>' },
    { ...valid, message: 'too short' }, { ...valid, message: 'Null character\0 in message' },
  ]) {
    const result = await harness.actions.sendEmail(data);
    assert.equal(result.success, false);
    assert.equal(typeof result.error, 'string');
  }
  assert.equal(harness.calls.emails.length, 0);
});

test('contact keeps the existing signature, provides replyTo, and escapes human-readable mail', async () => {
  const harness = createHarness();
  assert.equal((await harness.actions.sendEmail({
    name: 'Pat <Visitor>', company: 'A & B', email: 'visitor+portfolio@example.test',
    message: 'Hello, could we discuss <script> safely?',
  })).success, true);
  const mail = harness.calls.emails[0];
  assert.equal(mail.from.name, 'Portfolio contact');
  assert.equal(mail.replyTo.address, 'visitor+portfolio@example.test');
  assert.match(mail.subject, /^Portfolio contact/);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.html, /A &amp; B/);
  assert.doesNotMatch(mail.html, /<script>|transmission/i);
  assert.equal((await harness.actions.sendEmail({ email: 'visitor@example.test', message: 'A message without optional fields.' })).success, true);
  assert.equal(harness.calls.emails[1].replyTo.name, 'Portfolio visitor');
});
