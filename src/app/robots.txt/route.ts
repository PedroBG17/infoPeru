// src/app/robots.txt/route.ts
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dataperu.pe';
const IS_PROD = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

export async function GET() {
  let robotsTxtContent = '';

  if (IS_PROD) {
    robotsTxtContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /search

Sitemap: ${SITE_URL}/sitemap.xml
`;
  } else {
    robotsTxtContent = `User-agent: *
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  }

  return new NextResponse(robotsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
export const dynamic = 'force-dynamic';
