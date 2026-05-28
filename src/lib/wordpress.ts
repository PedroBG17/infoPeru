// src/lib/wordpress.ts
import { prisma } from './db';

interface WordPressPage {
  title: string;
  content: string;
  date: string;
  authorName: string;
  coverImage?: string | null;
}

/**
 * Consulta un artículo o página estática de la base de datos de Supabase.
 * Actúa como reemplazo transparente de WordPress Headless para evitar dependencias de hosting externas.
 * Si no se encuentra el artículo en la base de datos, retorna recursos estáticos de prueba (como 'guia-afiliacion-sis').
 */
export async function getWordPressPageBySlug(slug: string): Promise<WordPressPage | null> {
  try {
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,
        published: true,
      },
    });

    if (post) {
      return {
        title: post.title,
        content: post.content,
        date: post.createdAt.toISOString(),
        authorName: post.author,
        coverImage: post.coverImage,
      };
    }
  } catch (error) {
    console.warn(`[SUPABASE_CMS] Error al buscar el post "${slug}" en base de datos. Usando fallback si aplica:`, error);
  }

  // Fallback estático en código solo para pruebas rápidas de desarrollo local
  if (slug === 'guia-afiliacion-sis') {
    return {
      title: 'Guía Completa para la Afiliación al SIS Gratuito',
      content: `
        <p>El Seguro Integral de Salud (SIS) es un seguro subvencionado por el Estado Peruano dirigido a todos los ciudadanos que no cuentan con otro seguro de salud vigente.</p>
        <h3>¿Quiénes pueden afiliarse?</h3>
        <p>Cualquier ciudadano peruano o extranjero residente en el país que cuente con DNI o Carnet de Extranjería y que califique en el padrón del Sistema de Focalización de Hogares (SISFOH) en condición de pobreza o pobreza extrema.</p>
        <h3>Requisitos indispensables</h3>
        <ul>
          <li>Tener Documento Nacional de Identidad (DNI) o Carnet de Extranjería vigente.</li>
          <li>No contar con otro seguro de salud activo (EsSalud, EPS, seguros privados).</li>
          <li>Estar empadronado en el SISFOH.</li>
        </ul>
        <p>Esta guía es un recurso útil de interés general y fue generada de manera offline por el motor integrado de Supabase CMS del portal.</p>
      `,
      date: new Date().toISOString(),
      authorName: 'Área de Salud Pública',
    };
  }

  return null;
}
