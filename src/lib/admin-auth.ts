import 'server-only';

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_SECONDS } from '@/lib/admin-auth-constants';

export type AdminSession = {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
};

type CookieTarget = Pick<NextResponse, 'cookies'>;

function base64url(input: Buffer | string) {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input;
  return buffer.toString('base64url');
}

function fromBase64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function configuredEmail() {
  return (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

function configuredPasswordHash() {
  return (process.env.ADMIN_PASSWORD_HASH || '').trim();
}

export function isAdminAuthConfigured() {
  return Boolean(configuredEmail() && configuredPasswordHash() && sessionSecret());
}

export function hashAdminPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function safeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function verifyPassword(password: string, encodedHash: string) {
  const [scheme, salt, expectedHex] = encodedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return safeEqual(actual, expected);
}

function signBody(body: string) {
  return createHmac('sha256', sessionSecret()).update(body).digest('base64url');
}

export function createAdminSessionToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    email: email.toLowerCase(),
    role: 'admin',
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
  };
  const body = base64url(JSON.stringify(session));
  const signature = signBody(body);
  return `${body}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token || !sessionSecret()) return null;

  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = signBody(body);
  if (!safeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const session = JSON.parse(fromBase64url(body)) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (session.role !== 'admin' || !session.email || session.exp <= now) return null;
    return session;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  if (!isAdminAuthConfigured()) {
    return { ok: false as const, code: 'setup' as const };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== configuredEmail()) {
    return { ok: false as const, code: 'credentials' as const };
  }

  const passwordOk = verifyPassword(password, configuredPasswordHash());
  if (!passwordOk) {
    return { ok: false as const, code: 'credentials' as const };
  }

  return { ok: true as const, email: normalizedEmail };
}

export function setAdminSessionCookie(response: CookieTarget, email: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getAdminSessionFromRequest(request: NextRequest) {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login?next=/admin/dashboard');
  return session;
}

export async function assertAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('No autorizado.');
  }
  return session;
}
