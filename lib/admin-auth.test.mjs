import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import {
  ADMIN_PASSWORD_MAX_LENGTH,
  ADMIN_SESSION_SECONDS,
  createAdminLoginLimiter,
  createAdminSession,
  getAdminConfig,
  matchesAdminPassword,
  verifyAdminSession,
} from './admin-auth.ts';

const config = { password: 'test-only password', secret: randomBytes(32).toString('hex') };
const now = 1_800_000_000_000;

test('configuration fails closed without both credentials and a 32-character secret', () => {
  for (const env of [
    {},
    { ADMIN_PASSWORD: config.password },
    { ADMIN_SESSION_SECRET: config.secret },
    { ADMIN_PASSWORD: ' ', ADMIN_SESSION_SECRET: config.secret },
    { ADMIN_PASSWORD: config.password, ADMIN_SESSION_SECRET: 'a'.repeat(31) },
    { ADMIN_PASSWORD: config.password, ADMIN_SESSION_SECRET: ' '.repeat(32) },
    { ADMIN_PASSWORD: 'a'.repeat(ADMIN_PASSWORD_MAX_LENGTH + 1), ADMIN_SESSION_SECRET: config.secret },
  ]) {
    assert.equal(getAdminConfig(env), null);
  }
  assert.deepEqual(getAdminConfig({
    ADMIN_PASSWORD: config.password,
    ADMIN_SESSION_SECRET: config.secret,
  }), config);
  assert.notEqual(getAdminConfig({ ADMIN_PASSWORD: config.password, ADMIN_SESSION_SECRET: 'a'.repeat(32) }), null);
});

test('password verification rejects wrong values and malformed runtime input', () => {
  assert.equal(matchesAdminPassword(config.password, config), true);
  for (const value of ['', 'wrong', null, undefined, {}, 123, 'a'.repeat(ADMIN_PASSWORD_MAX_LENGTH + 1)]) {
    assert.equal(matchesAdminPassword(value, config), false);
  }
});

test('signed sessions are unique, valid for eight hours, and expire exactly at the deadline', () => {
  const token = createAdminSession(config, now);
  assert.notEqual(token, createAdminSession(config, now));
  assert.equal(verifyAdminSession(token, config, now), true);
  assert.equal(verifyAdminSession(token, config, now + ADMIN_SESSION_SECONDS * 1000 - 1), true);
  assert.equal(verifyAdminSession(token, config, now + ADMIN_SESSION_SECONDS * 1000), false);
  assert.equal(verifyAdminSession(token, config, now - 1000), false);
  assert.equal(verifyAdminSession(token, null, now), false);
});

test('tampering and malformed tokens are rejected without throwing', () => {
  const token = createAdminSession(config, now);
  const parts = token.split('.');
  const changedExpiry = [...parts];
  changedExpiry[2] = String(Number(parts[2]) + 1);
  const changedNonce = [...parts];
  changedNonce[3] = parts[3][0] === 'a' ? 'b'.repeat(32) : 'a'.repeat(32);
  const changedSignature = [...parts];
  changedSignature[4] = (parts[4][0] === 'A' ? 'B' : 'A') + parts[4].slice(1);
  for (const value of [
    null, undefined, {}, 123, '', 'true', 'a'.repeat(257),
    token + '.extra', token + '\n', token + '\r\n', token.replace('v1', 'v2'), token.slice(0, -1),
    changedExpiry.join('.'), changedNonce.join('.'), changedSignature.join('.'),
  ]) {
    assert.equal(verifyAdminSession(value, config, now), false);
  }
});

test('rotating either the password or secret invalidates existing sessions', () => {
  const token = createAdminSession(config, now);
  assert.equal(verifyAdminSession(token, { ...config, password: 'replacement test password' }, now), false);
  assert.equal(verifyAdminSession(token, { ...config, secret: randomBytes(32).toString('hex') }, now), false);
});

test('login limiter allows ten attempts per process window and then resets', () => {
  const consume = createAdminLoginLimiter();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.deepEqual(consume(now), { allowed: true, retryAfterSeconds: 0 });
  }
  assert.deepEqual(consume(now), { allowed: false, retryAfterSeconds: 900 });
  assert.deepEqual(consume(now + 899_001), { allowed: false, retryAfterSeconds: 1 });
  assert.deepEqual(consume(now + 900_000), { allowed: true, retryAfterSeconds: 0 });
  // A new process/module has independent state; this is intentionally not a distributed limiter.
  assert.equal(createAdminLoginLimiter()(now).allowed, true);
});
