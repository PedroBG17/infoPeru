// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limiter';
import { createClient as createSupabaseClient } from '@/utils/supabase/middleware';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth-constants';

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             '127.0.0.1';
  const path = request.nextUrl.pathname;

  const hasAdminSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (path === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = hasAdminSessionCookie ? '/admin/dashboard' : '/admin/login';
    url.search = hasAdminSessionCookie ? '?tab=portal' : '';
    return NextResponse.redirect(url);
  }

  if (path.startsWith('/admin/dashboard') && !hasAdminSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (path === '/api/v1/media/upload' && !hasAdminSessionCookie) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }


  // 1. Rate Limiting para Endpoints de API
  if (path.startsWith('/api/')) {
    const { success, limit, remaining, reset } = await rateLimit(`api:${ip}`, 30, 60);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Demasiadas solicitudes. Por favor intente más tarde.',
          code: 'ERR_TOO_MANY_REQUESTS',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // 2. Sincronización e Invalidation de cookies de Supabase (Auth refresh)
  const response = createSupabaseClient(request);

  // 3. Definición Estricta de CSP y Cabeceras de Seguridad
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagservices.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://challenges.cloudflare.com https://*.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com;
    connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.upstash.io https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://adservice.google.com https://fundingchoicesmessages.google.com;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Asignar cabeceras enterprise al response de Supabase
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto las estáticas:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
