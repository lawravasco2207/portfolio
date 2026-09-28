import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// A bounded, dependency-free Chromium smoke test. No SMTP, Spaces writes, or real credentials.

const root = path.resolve(import.meta.dirname, '..');
const port = 3107;
const debugPort = 9317;
const base = `http://127.0.0.1:${port}`;
const candidates = [
  process.env.BROWSER_PATH,
  ...[process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean).flatMap((dir) => [path.join(dir, 'Microsoft/Edge/Application/msedge.exe'), path.join(dir, 'Google/Chrome/Application/chrome.exe')]),
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const executable = candidates.find((candidate) => candidate && existsSync(candidate));
assert.ok(executable, 'Install Chrome/Edge/Chromium or set BROWSER_PATH to its executable.');
assert.ok(existsSync(path.join(root, '.next/BUILD_ID')), 'Run pnpm build before the browser smoke test.');
const profile = mkdtempSync(path.join(tmpdir(), 'portfolio-smoke-'));
const screenshots = path.join(root, '.next/screenshots');
mkdirSync(screenshots, { recursive: true });
const password = randomBytes(24).toString('hex');
const env = { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NEXT_TELEMETRY_DISABLED: '1', ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'), DO_SPACES_ENDPOINT: '', DO_SPACES_REGION: '', DO_SPACES_KEY: '', DO_SPACES_SECRET: '', DO_SPACES_BUCKET: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', GITHUB_TOKEN: '' };
const processes = [];
let socket;
let logs = '';
let completed = false;

function start(command, args, options = {}) {
  const child = spawn(command, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  processes.push(child);
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  child.on('error', (error) => { logs += error.message; });
  return child;
}
async function waitFor(url) {
  for (let attempt = 0; attempt < 120; attempt++) {
    try { const response = await fetch(url, { signal: AbortSignal.timeout(1000) }); if (response.ok) return response; } catch { /* startup */ }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function stop(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      killer.on('close', resolve);
      killer.on('error', resolve);
    });
  } else {
    child.kill('SIGTERM');
    await delay(200);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
}

try {
  // Refuse to attach to an unrelated service using these test ports.
  for (const url of [base, `http://127.0.0.1:${debugPort}/json/version`]) {
    let occupied = false;
    try { await fetch(url, { signal: AbortSignal.timeout(500) }); occupied = true; } catch { /* free */ }
    assert.equal(occupied, false, `Test port already in use: ${url}`);
  }
  const standalone = path.join(root, '.next/standalone');
  cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true });
  cpSync(path.join(root, '.next/static'), path.join(standalone, '.next/static'), { recursive: true });
  start(process.execPath, [path.join(standalone, 'server.js')]);
  const html = await (await waitFor(base)).text();
  assert.match(html, /Software engineer/);
  assert.match(html, /Talosys/);
  assert.match(html, /Synthetic dataset/);
  start(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank']);
  await waitFor(`http://127.0.0.1:${debugPort}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0;
  const pending = new Map();
  const runtimeErrors = [];
  let sourceRequests = 0;
  let sourceSucceeds = false;
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      clearTimeout(task.timeout);
      pending.delete(message.id);
      if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') runtimeErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
    if (message.method === 'Fetch.requestPaused') {
      sourceRequests++;
      await call('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: sourceSucceeds ? 200 : 503, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ generatedAt: '2026-01-01T00:00:00Z', repositories: [{ id: 'test-repo', label: 'Test repository', status: 'fallback', htmlUrl: 'https://github.com/lawravasco2207' }] })).toString('base64') });
    }
  });
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = async (expression) => {
    for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Browser condition timed out: ${expression}`);
  };
  const clickText = async (selector, text) => {
    await evaluate(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.textContent.includes(${JSON.stringify(text)})); if (!el) throw new Error('Missing control: ' + ${JSON.stringify(text)}); el.click(); })()`);
    await delay(150);
  };
  const fill = async (selector, text) => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`); await call('Input.insertText', { text }); };
  const resize = async (width, height = 1000) => { await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }); await delay(100); };
  const screenshot = async (name) => { const shot = await call('Page.captureScreenshot', { format: 'png' }); writeFileSync(path.join(screenshots, name), Buffer.from(shot.data, 'base64')); };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await call('Fetch.enable', { patterns: [{ urlPattern: '*api/mission-control*', requestStage: 'Request' }] });
  await resize(1440);
  await call('Page.navigate', { url: base });
  await wait('document.readyState === "complete" && document.querySelectorAll("#work article").length === 6');
  await delay(800);
  assert.equal(sourceRequests, 0, 'No unsolicited repository telemetry requests.');
  assert.equal(await evaluate('document.querySelector("[data-motion-enabled]").dataset.motionEnabled'), 'false');
  assert.equal(await evaluate('document.querySelector("[data-motion-toggle]").disabled'), true);
  assert.ok(await evaluate('[...document.querySelectorAll("[data-hero-line]")].every(el => !el.style.transform)'));
  assert.equal(await evaluate('window.scrollY'), 0, 'Landing page must not auto-scroll to the terminal.');
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
  assert.equal(await evaluate('document.querySelector("#main-content").getAttribute("tabindex")'), '-1');
  assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'), 'auto');
  assert.ok(await evaluate('[...document.querySelectorAll("#contact input, #contact textarea")].every(el => el.labels.length > 0)'));
  assert.deepEqual(await evaluate('[...document.links].map(el => el.getAttribute("href")).filter(href => href.startsWith("#")).map(href => href.slice(1)).filter(id => id && !document.getElementById(id))'), []);
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await evaluate('document.activeElement.textContent'), 'Skip to content');
  await evaluate('document.activeElement.blur()');
  await screenshot('desktop.png');
  console.log('PASS: server-rendered personal story, semantic structure, reduced motion, skip link, no auto-scroll.');

  await clickText('aside[aria-labelledby=work-map-title] button', 'Systems');
  assert.match(await evaluate('document.querySelector("#work-map-detail").textContent'), /Parsers, local services/);
  await clickText('aside[aria-labelledby=work-map-title] button', 'AI & automation');
  assert.match(await evaluate('document.querySelector("#work-map-detail").textContent'), /Anthropic API/);
  assert.equal(await evaluate('document.querySelector("#lab-delivery-panel").hidden'), false);
  assert.equal(await evaluate('document.querySelector("#delivery-retry").disabled'), true);
  await clickText('#delivery-lab button', 'Send request');
  await clickText('#delivery-lab button', 'Retry same request');
  assert.equal(await evaluate('document.querySelector("#delivery-naive-count").textContent'), '2');
  assert.equal(await evaluate('document.querySelector("#delivery-idempotent-count").textContent'), '1');
  await clickText('#delivery-lab button', 'Change payload');
  assert.equal(await evaluate('document.querySelector("#delivery-naive-count").textContent'), '3');
  assert.equal(await evaluate('document.querySelector("#delivery-idempotent-count").textContent'), '1');
  assert.match(await evaluate('document.querySelector("#delivery-status").textContent'), /Rejected: key conflict/);
  await clickText('#delivery-lab button', 'New request');
  await clickText('#delivery-lab button', 'Send request');
  assert.equal(await evaluate('document.querySelector("#delivery-naive-count").textContent'), '4');
  assert.equal(await evaluate('document.querySelector("#delivery-idempotent-count").textContent'), '2');
  for (const width of [320, 390, 768, 1440]) {
    await resize(width);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), `Delivery lab overflow at ${width}px`);
  }
  await clickText('#lab button', 'Model revisions');
  assert.equal(await evaluate('document.querySelector("#lab-delivery-panel").hidden'), true);
  await clickText('#thinking button', 'Before');
  const before = await evaluate('document.querySelector("#thinking svg").innerHTML');
  await clickText('#thinking button', 'After');
  assert.notEqual(await evaluate('document.querySelector("#thinking svg").innerHTML'), before);
  await clickText('#thinking button', 'A doorway widens');
  assert.match(await evaluate('document.querySelector("#thinking [role=region]").textContent'), /1,200 mm/);
  await clickText('#thinking button', 'A room gets a new use');
  assert.match(await evaluate('document.querySelector("#thinking [role=region]").textContent'), /Project room/);
  await clickText('#thinking button', 'Changes');
  await clickText('#thinking summary', 'Inspect the illustrative record');
  assert.ok(await evaluate('document.querySelector("#thinking [role=region] details").open'));
  await clickText('#lab button', 'Delivery & retries');
  assert.equal(await evaluate('document.querySelector("#delivery-idempotent-count").textContent'), '2');
  await clickText('#delivery-lab button', 'Reset');
  assert.equal(await evaluate('document.querySelector("#delivery-naive-count").textContent'), '0');
  await clickText('#lab button', 'Model revisions');
  assert.match(await evaluate('document.querySelector("#thinking [role=region]").textContent'), /Project room/);
  await clickText('#work button', 'Applications');
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 4);
  await clickText('#work button', 'Systems');
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 2);
  await clickText('#work button', 'AI & automation');
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 2);
  await clickText('#work button', 'APIs & data');
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 4);
  await clickText('#work button', 'All work');
  await fill('#work-search', 'portfolio');
  await wait('document.querySelectorAll("#work article").length === 1');
  assert.match(await evaluate('document.querySelector("#work article").textContent'), /Portfolio & notebook/);
  await evaluate('document.querySelector("button[aria-label=\\\"Clear project search\\\"]").click()');
  await fill('#work-search', 'no-such-project');
  await wait('document.querySelectorAll("#work article").length === 0');
  await clickText('#work button', 'Clear filters');
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 6);
  await clickText('#work article summary', 'Implementation notes');
  assert.ok(await evaluate('document.querySelector("#work article details").open'));
  console.log('PASS: engineering map, delivery/retry/conflict/reset behavior, both state-preserving lab panels, searchable work and area filters.');

  for (const width of [320, 390, 768, 1440]) {
    await resize(width, width < 768 ? 844 : 1000);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), `Horizontal overflow at ${width}px`);
  }
  await resize(390, 844);
  await evaluate('window.scrollTo(0,0)');
  assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-signal-sculpture]").parentElement).display'), 'none', 'Mobile keeps the map controls but skips the tall decorative sculpture.');
  assert.ok(await evaluate('document.querySelector(".hero-stage .button-primary").getBoundingClientRect().bottom < window.innerHeight'), 'The case-study link is visible in the first mobile viewport.');
  await screenshot('mobile.png');
  await evaluate('document.querySelector("button[aria-controls=mobile-navigation]").click()');
  assert.equal(await evaluate('document.querySelector("button[aria-controls=mobile-navigation]").getAttribute("aria-expanded")'), 'true');
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await wait('document.querySelector("button[aria-controls=mobile-navigation]").getAttribute("aria-expanded") === "false"');
  assert.equal(await evaluate('document.activeElement.getAttribute("aria-controls")'), 'mobile-navigation');
  await evaluate('document.querySelector("#thinking").scrollIntoView()');
  await screenshot('mobile-study.png');
  await resize(1440);
  await evaluate('document.querySelector("#thinking").scrollIntoView()');
  await screenshot('desktop-study.png');
  await evaluate('document.querySelector("#thinking figure").scrollIntoView()');
  await screenshot('desktop-plan.png');
  console.log('PASS: no overflow at 320/390/768/1440px; mobile menu Escape closes and restores focus.');

  await clickText('#work summary', 'Prefer source');
  await clickText('#work button', 'Fetch source snapshot');
  await wait('document.querySelector("#work [role=status]").textContent.includes("could not be refreshed")');
  sourceSucceeds = true;
  await clickText('#work button', 'Fetch source snapshot');
  await wait('document.querySelector("#work [role=status]").textContent.includes("Snapshot generated")');
  assert.equal(sourceRequests, 2);
  assert.match(await evaluate('document.querySelector("#work").textContent'), /No activity or release claims are inferred/);
  for (const [name, text] of [['name', 'Browser test'], ['email', 'test@example.com'], ['message', 'A test message that must not leave this machine.']]) await fill(`#contact [name="${name}"]`, text);
  await clickText('#contact button', 'Send');
  await wait('document.querySelector("#contact").textContent.includes("not configured")');
  assert.equal(await evaluate('document.querySelector("#contact textarea").value'), 'A test message that must not leave this machine.');
  console.log('PASS: snapshot failure/retry/fallback and contact error preserve user state (no real email sent).');

  await resize(1440);
  await evaluate('window.scrollTo({ top: 0, behavior: "instant" })');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await wait('document.querySelector("[data-motion-enabled]").dataset.motionEnabled === "true"');
  await delay(1100);
  const progressAtTop = await evaluate('getComputedStyle(document.querySelector("[data-motion-progress]")).transform');
  await evaluate('window.scrollTo({ top: 1800, behavior: "instant" })');
  await delay(450);
  assert.notEqual(await evaluate('getComputedStyle(document.querySelector("[data-motion-progress]")).transform'), progressAtTop, 'GSAP scroll progress must respond to scroll.');
  await evaluate('window.scrollTo({ top: 0, behavior: "instant" })');
  await clickText('aside[aria-labelledby=work-map-title] button', 'Applications');
  const sculptureDuring = await evaluate('document.querySelector("[data-signal-form]").getAttribute("transform")');
  await delay(850);
  assert.notEqual(await evaluate('document.querySelector("[data-signal-form]").getAttribute("transform")'), sculptureDuring, 'Sculpture transition must animate, not only swap content.');
  assert.match(await evaluate('document.querySelector("#work-map-detail").textContent'), /Web interfaces/);
  if (await evaluate('matchMedia("(hover: hover) and (pointer: fine)").matches')) {
    const box = await evaluate('(() => { const r = document.querySelector("[data-signal-sculpture]").getBoundingClientRect(); return { x: r.left + r.width * .85, y: r.top + r.height * .25 }; })()');
    const restingTilt = await evaluate('getComputedStyle(document.querySelector("[data-signal-tilt]")).transform');
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y });
    await delay(500);
    assert.notEqual(await evaluate('getComputedStyle(document.querySelector("[data-signal-tilt]")).transform'), restingTilt);
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 90 });
  }
  await screenshot('desktop-motion.png');
  for (let cycle = 0; cycle < 3; cycle++) {
    await evaluate('document.querySelector("[data-motion-toggle]").click()');
    await wait('document.querySelector("[data-motion-enabled]").dataset.motionEnabled === "false"');
    assert.equal(await evaluate('document.querySelector("[data-motion-progress]").style.transform'), '');
    assert.equal(await evaluate('document.querySelector("[data-signal-tilt]").style.transform'), '');
    assert.ok(await evaluate('[...document.querySelectorAll("[data-hero-line], [data-reveal], [data-project-card]")].every(el => !el.style.transform && !el.style.opacity)'));
    await evaluate('document.querySelector("[data-motion-toggle]").click()');
    await wait('document.querySelector("[data-motion-enabled]").dataset.motionEnabled === "true"');
    await delay(200);
    assert.ok(await evaluate('[...document.querySelectorAll("[data-hero-line]")].every(el => !el.style.transform)'), 'Motion toggles must not replay the hero intro.');
  }
  await evaluate('document.querySelector("#work").scrollIntoView({ behavior: "instant" })');
  await delay(800);
  await screenshot('desktop-gallery.png');
  await clickText('#work button', 'Systems');
  await delay(700);
  assert.equal(await evaluate('document.querySelectorAll("#work article").length'), 2);
  assert.ok(await evaluate('[...document.querySelectorAll("[data-project-card]")].every(el => !el.style.opacity && !el.style.transform)'));
  await clickText('#work button', 'All work');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await wait('document.querySelector("[data-motion-enabled]").dataset.motionEnabled === "false"');
  assert.equal(await evaluate('document.querySelector("[data-motion-toggle]").disabled'), true);
  assert.equal(await evaluate('document.querySelector("[data-motion-progress]").style.transform'), '');
  assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'), 'auto');
  console.log('PASS: actual GSAP scroll/sculpture motion, fine-pointer tilt, animated filters, repeated pause/resume cleanup, live reduced-motion changes.');

  await clickText('nav[aria-label="Main navigation"] a', 'Work');
  await wait('location.pathname === "/work" && !!document.querySelector("#work-search")');
  assert.equal(await evaluate('location.hash'), '');
  assert.equal(await evaluate('document.querySelector("nav[aria-label=\\"Main navigation\\"] [aria-current=page]").textContent'), 'Work');
  for (const [route, selector] of [['practice', '#practice'], ['lab', '#lab'], ['about', '#story'], ['contact', '#contact'], ['work', '#work']]) {
    await call('Page.navigate', { url: `${base}/${route}` });
    await wait(`document.readyState === "complete" && !!document.querySelector(${JSON.stringify(selector)})`);
    assert.equal(await evaluate('location.hash'), '', `/${route} must not need a fragment.`);
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.equal(await evaluate('document.querySelector("link[rel=canonical]").href.endsWith(location.pathname)'), true);
    for (const width of [320, 1440]) {
      await resize(width);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), `Section overflow for ${route} at ${width}px`);
    }
  }
  assert.equal((await fetch(`${base}/not-a-section`)).status, 404);
  console.log('PASS: fragment-free client navigation and direct section routes render meaningful content at mobile and desktop widths.');

  await call('Page.navigate', { url: `${base}/notes` });
  await wait('document.readyState === "complete" && document.querySelectorAll("main ol > li").length === 3');
  for (const slug of ['idempotency-and-retries', 'localhost-trust-boundaries', 'ai-output-validation']) {
    await call('Page.navigate', { url: `${base}/notes/${slug}` });
    await wait('document.readyState === "complete" && !!document.querySelector("#note-title")');
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.equal(await evaluate('document.querySelector("link[rel=canonical]").href.endsWith(location.pathname)'), true);
    assert.equal(await evaluate('document.querySelectorAll("nav[aria-label=\\\"On this page\\\"] ol li").length'), 7);
    assert.ok(await evaluate('document.querySelectorAll("pre[tabindex=\\\"0\\\"]").length > 0'));
    assert.deepEqual(await evaluate('[...document.links].map(el => el.getAttribute("href")).filter(href => href.startsWith("#")).map(href => href.slice(1)).filter(id => id && !document.getElementById(id))'), []);
    for (const width of [320, 390, 1440]) {
      await resize(width);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), `Note overflow for ${slug} at ${width}px`);
    }
  }
  assert.equal((await fetch(`${base}/notes/not-a-real-note`)).status, 404);
  await evaluate('window.scrollTo(0,0)');
  await screenshot('desktop-note.png');
  console.log('PASS: notebook index, three complete notes, contents anchors, readable code regions, canonical metadata, responsive layout, unknown-note 404.');

  for (const slug of ['portfolio', 'vex']) {
    await call('Page.navigate', { url: `${base}/work/${slug}` });
    await wait('document.readyState === "complete" && !!document.querySelector("#case-title")');
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
    assert.equal(await evaluate('document.querySelector("link[rel=canonical]").href.endsWith(location.pathname)'), true);
    assert.match(await evaluate('document.querySelector("main").textContent'), /My contribution/);
    assert.match(await evaluate('document.querySelector("main").textContent'), /Limits/);
    for (const width of [320, 390, 1440]) {
      await resize(width);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), `Case study overflow for ${slug} at ${width}px`);
    }
    await evaluate('window.scrollTo(0,0)');
    await screenshot(`desktop-case-${slug}.png`);
  }
  assert.equal((await fetch(`${base}/work/not-a-project`)).status, 404);
  assert.equal((await fetch(`${base}/assets/portfolio-home.png`)).status, 200);
  console.log('PASS: case studies have evidence and limits, canonical metadata, responsive layouts, and unknown-work 404.');

  await call('Page.navigate', { url: `${base}/resume` });
  await wait('document.readyState === "complete" && !!document.querySelector("#resume-document")');
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
  assert.match(await evaluate('document.querySelector("main").textContent'), /Professional summary/);
    await call('Emulation.setEmulatedMedia', { media: 'print' });
    assert.notEqual(await evaluate('getComputedStyle(document.querySelector("main > header")).display'), 'none');
    assert.equal(await evaluate('getComputedStyle(document.querySelector("main h1")).color'), 'rgb(17, 17, 17)');
    await call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const asset of ['/assets/resume.pdf', '/assets/LawrenceMusyoka_Resume.docx', '/opengraph-image', '/brand-mark.svg']) {
    const response = await fetch(`${base}${asset}`);
    assert.equal(response.status, 200, asset);
    assert.ok(Number(response.headers.get('content-length')) > 0 || (await response.arrayBuffer()).byteLength > 0);
  }
  await call('Page.navigate', { url: `${base}/admin` });
  await wait('!!document.querySelector("input[name=password]")');
  await evaluate('sessionStorage.setItem("admin_auth", "true")');
  await call('Page.reload');
  await wait('!!document.querySelector("input[name=password]")');
  await fill('input[name=password]', password);
  await clickText('button', 'Sign in');
  await wait('document.body.textContent.includes("ADMIN // DASHBOARD")');
  assert.equal(await evaluate('document.cookie.includes("portfolio-admin")'), false, 'Admin cookie is HttpOnly.');
  await call('Page.reload');
  await wait('document.body.textContent.includes("ADMIN // DASHBOARD")');
  await clickText('button', 'Logout');
  await wait('!!document.querySelector("input[name=password]")');
  assert.deepEqual(runtimeErrors, []);
  console.log('PASS: résumé/assets/social image, signed admin login, session restoration, logout; no runtime errors.');
  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await call('Page.navigate', { url: base });
  await delay(900);
  const plainDocument = await call('DOM.getDocument', { depth: 0 });
  for (const selector of ['#hero-title', '#work', '#lab', '#contact']) {
    const node = await call('DOM.querySelector', { nodeId: plainDocument.root.nodeId, selector });
    assert.ok(node.nodeId, `Server-rendered ${selector} exists without JavaScript.`);
    const box = await call('DOM.getBoxModel', { nodeId: node.nodeId });
    assert.ok(box.model.width > 0 && box.model.height > 0, `${selector} remains laid out without JavaScript.`);
  }
  await screenshot('desktop-no-js.png');
  await call('Page.navigate', { url: `${base}/work` });
  await delay(900);
  const workDocument = await call('DOM.getDocument', { depth: 0 });
  const workNode = await call('DOM.querySelector', { nodeId: workDocument.root.nodeId, selector: '#work' });
  assert.ok(workNode.nodeId, 'The clean /work URL serves work without JavaScript.');
  assert.ok((await call('DOM.getBoxModel', { nodeId: workNode.nodeId })).model.height > 0);
  await call('Emulation.setScriptExecutionDisabled', { value: false });
  console.log('PASS: homepage sections and the direct work route remain readable without JavaScript.');
  console.log(`Screenshots: ${screenshots}`);
  completed = true;
} finally {
  socket?.close();
  for (const child of processes.reverse()) await stop(child);
  await delay(300);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { console.warn(`Temporary browser profile could not be removed: ${profile}`); }
  if (!completed) console.error(logs);
}
