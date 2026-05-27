// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dataperu.pe';

export async function GET() {
  try {
    // 1. Consultar combinaciones de trámites y ciudades de la base de datos
    const relaciones = await prisma.procedimientoCiudad.findMany({
      include: {
        procedimiento: true,
        ciudad: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1000, // Cota de seguridad para esta versión simplificada del sitemap
    });

    // 2. Armar XML de forma estructurada
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    relaciones.forEach((rel) => {
      xml += `
  <url>
    <loc>${SITE_URL}/tramites/${rel.procedimiento.slug}/${rel.ciudad.slug}</loc>
    <lastmod>${rel.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // Retornar XML con las cabeceras correspondientes y directivas de caché
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap.xml:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
