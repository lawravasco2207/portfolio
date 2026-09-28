import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
export const ADMIN_PASSWORD_MAX_LENGTH = 1024;

export interface AdminConfig {
  password: string;
  secret: string;
}

export function getAdminConfig(env: {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
} = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
}): AdminConfig | null {
  const password = env.ADMIN_PASSWORD;
  const secret = env.ADMIN_SESSION_SECRET;
  if (
    !password?.trim() ||
    password.length > ADMIN_PASSWORD_MAX_LENGTH ||
    !secret ||
    secret.trim().length < 32
  ) {
    return null;
  }
  return { password, secret };
}

export function matchesAdminPassword(password: unknown, config: AdminConfig): boolean {
  if (typeof password !== 'string' || password.length > ADMIN_PASSWORD_MAX_LENGTH) {
    return false;
  }
  // Hash both values to compare fixed-length buffers even for different-length passwords.
  return timingSafeEqual(
    createHash('sha256').update(password).digest(),
    createHash('sha256').update(config.password).digest(),
  );
}

function sign(payload: string, config: AdminConfig): Buffer {
  // Binding to both credentials invalidates sessions when either credential is rotated.
  return createHmac('sha256', config.secret)
    .update('portfolio-admin-session\0')
    .update(config.password)
    .update('\0')
    .update(payload)
    .digest();
}

export function createAdminSession(config: AdminConfig, now = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const payload = `v1.${issuedAt}.${issuedAt + ADMIN_SESSION_SECONDS}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${sign(payload, config).toString('base64url')}`;
}

export function verifyAdminSession(
  token: unknown,
  config: AdminConfig | null,
  now = Date.now(),
): boolean {
  if (!config || typeof token !== 'string' || token.length > 256) return false;
  const match = /^v1\.(\d{1,12})\.(\d{1,12})\.([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match || match[0] !== token) return false;

  const signature = Buffer.from(match[4], 'base64url');
  const expected = sign(token.slice(0, token.lastIndexOf('.')), config);
  if (
    signature.length !== expected.length ||
    signature.toString('base64url') !== match[4] ||
    !timingSafeEqual(signature, expected)
  ) {
    return false;
  }

  const issuedAt = Number(match[1]);
  const expiresAt = Number(match[2]);
  const current = Math.floor(now / 1000);
  return issuedAt <= current && expiresAt > current && expiresAt - issuedAt === ADMIN_SESSION_SECONDS;
}

export function createAdminLoginLimiter() {
  let attempts = 0;
  let windowEndsAt = 0;
  // Shared by all visitors to this process only. Restarts/replicas do not share this limit.
  return (now = Date.now()) => {
    if (now >= windowEndsAt) {
      attempts = 0;
      windowEndsAt = now + 15 * 60 * 1000;
    }
    if (attempts >= 10) {
      return { allowed: false, retryAfterSeconds: Math.ceil((windowEndsAt - now) / 1000) };
    }
    attempts += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
