import { NextRequest, NextResponse } from 'next/server';
import { setAdminSessionCookie, verifyAdminCredentials } from '@/lib/admin-auth';
import { rateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const next = sanitizeNext(String(formData.get('next') || ''));
  const ip = getClientIp(request);
  const rateLimitKey = `admin-login:${ip}:${email.trim().toLowerCase() || 'unknown'}`;
  const rate = await rateLimit(rateLimitKey, 8, 15 * 60);

  if (!rate.success) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'rate-limit');
    url.searchParams.set('next', next);
    const response = NextResponse.redirect(url, { status: 303 });
    response.headers.set('X-RateLimit-Limit', rate.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rate.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rate.reset.toString());
    return response;
  }

  const result = await verifyAdminCredentials(email, password);
  if (!result.ok) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', result.code === 'setup' ? 'setup' : 'credentials');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  setAdminSessionCookie(response, result.email);
  return response;
}

function sanitizeNext(value: string) {
  if (!value || !value.startsWith('/admin') || value.startsWith('/admin/login')) {
    return '/admin/dashboard?tab=portal';
  }
  return value;
}

function getClientIp(request: NextRequest) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || '127.0.0.1';
}
