import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth-constants';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

export function POST(request: Request) {
  return GET(request);
}
