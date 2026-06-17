// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://info-peru.vercel.app';

type SitemapEntry = {
  loc: string;
  lastmod?: Date | string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
};

const staticEntries: SitemapEntry[] = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/noticias', changefreq: 'daily', priority: '0.9' },
  { loc: '/tramites', changefreq: 'weekly', priority: '0.9' },
  { loc: '/hospitales', changefreq: 'weekly', priority: '0.8' },
  { loc: '/trabajos', changefreq: 'weekly', priority: '0.8' },
  { loc: '/directorios', changefreq: 'monthly', priority: '0.7' },
  { loc: '/todos', changefreq: 'monthly', priority: '0.6' },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname === '/' ? '' : pathname}`;
}

function renderSitemap(entries: SitemapEntry[]) {
  const now = new Date().toISOString();
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.loc, entry])).values()
  );

  const urls = uniqueEntries.map((entry) => {
    const lastmod = entry.lastmod
      ? new Date(entry.lastmod).toISOString()
      : now;

    return `  <url>
    <loc>${escapeXml(absoluteUrl(entry.loc))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function sitemapResponse(entries: SitemapEntry[]) {
  return new NextResponse(renderSitemap(entries), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}

export async function GET() {
  try {
    const [relaciones, tramites, ciudadesConHospitales, ciudadesConTrabajos, posts] = await Promise.all([
      prisma.procedimientoCiudad.findMany({
        include: {
          procedimiento: { select: { slug: true, createdAt: true } },
          ciudad: { select: { slug: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 1000,
      }),
      prisma.procedimiento.findMany({
        select: { slug: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.ciudad.findMany({
        where: { hospitales: { some: {} } },
        select: { slug: true, createdAt: true },
        orderBy: { name: 'asc' },
        take: 500,
      }),
      prisma.ciudad.findMany({
        select: { slug: true, createdAt: true },
        orderBy: { name: 'asc' },
        take: 500,
      }),
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, createdAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 1000,
      }),
    ]);

    const dynamicEntries: SitemapEntry[] = [
      ...tramites.map((tramite) => ({
        loc: `/tramites/${tramite.slug}`,
        lastmod: tramite.createdAt,
        changefreq: 'weekly' as const,
        priority: '0.8',
      })),
      ...relaciones.map((rel) => ({
        loc: `/tramites/${rel.procedimiento.slug}/${rel.ciudad.slug}`,
        lastmod: rel.updatedAt,
        changefreq: 'weekly' as const,
        priority: '0.8',
      })),
      ...ciudadesConHospitales.map((ciudad) => ({
        loc: `/hospitales/${ciudad.slug}`,
        lastmod: ciudad.createdAt,
        changefreq: 'weekly' as const,
        priority: '0.7',
      })),
      ...ciudadesConTrabajos.map((ciudad) => ({
        loc: `/trabajos/${ciudad.slug}`,
        lastmod: ciudad.createdAt,
        changefreq: 'weekly' as const,
        priority: '0.7',
      })),
      ...posts.map((post) => ({
        loc: `/${post.slug}`,
        lastmod: post.updatedAt || post.createdAt,
        changefreq: 'weekly' as const,
        priority: '0.7',
      })),
    ];

    return sitemapResponse([...staticEntries, ...dynamicEntries]);
  } catch (error) {
    console.error('[SITEMAP_ERROR] Fallback estatico activado:', error);
    return sitemapResponse(staticEntries);
  }
}

export const dynamic = 'force-dynamic';
