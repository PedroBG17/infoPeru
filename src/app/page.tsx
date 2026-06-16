import React from 'react';
import { prisma } from '@/lib/db';
import { Post } from '@prisma/client';
import { getSiteSettings } from '@/lib/site-settings';
import { Activity, AlertTriangle, Apple, Heart } from 'lucide-react';
import { HomeClient } from '@/components/home/home-client';

export const revalidate = 3600;

type HomePost = {
  id: string;
  title: string;
  category: string;
  excerpt?: string;
  author: string;
  timeText: string;
  readTime?: string;
  coverImage?: string | null;
  slug: string;
};

function toHomePost(dbPost: Post): HomePost {
  return {
    id: dbPost.id,
    title: dbPost.title,
    category: 'Noticias',
    excerpt: dbPost.excerpt || '',
    author: dbPost.author || 'Redaccion ClavePeru',
    timeText: new Date(dbPost.createdAt).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    }),
    readTime: dbPost.readingTime ? `${dbPost.readingTime} min lectura` : '3 min lectura',
    coverImage: dbPost.coverImage || null,
    slug: dbPost.slug,
  };
}

export default async function HomePage() {
  const siteSettings = await getSiteSettings();

  let dbPosts: Post[] = [];
  try {
    dbPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
  } catch (error) {
    console.error('[HOMEPAGE_POSTS_ERROR] Fallo al recuperar noticias en inicio:', error);
  }

  const newsList = dbPosts.map(toHomePost);

  const tramitesList = [
    { title: 'RENIEC', desc: 'Duplicado de DNI, pago de tasa y recojo en agencia seleccionada.', href: '/tramites/dni-duplicado/lima' },
    { title: 'SUNAT', desc: 'Inscripcion al RUC para persona natural y formalizacion tributaria.', href: '/tramites/inscripcion-ruc-persona-natural/lima' },
    { title: 'SIS Gratuito', desc: 'Afiliacion, cobertura, requisitos y canales oficiales de atencion.', href: '/tramites/afiliacion-sis-gratuito/lima' },
    { title: 'SUNARP', desc: 'Certificado literal, costos por paginas y datos registrales necesarios.', href: '/tramites/certificado-literal-sunarp/lima' },
    { title: 'MTC', desc: 'Licencia de conducir A-I, examenes, tasa y emision del brevete.', href: '/tramites/licencia-de-conducir/lima' },
    { title: 'Migraciones', desc: 'Pasaporte electronico, tasa oficial, cita y atencion sin intermediarios.', href: '/tramites/pasaporte-electronico/lima' },
    { title: 'MTPE', desc: 'Certificado Unico Laboral gratuito para postulaciones y CV.', href: '/tramites/certificado-unico-laboral/lima' },
    { title: 'Todos los tramites', desc: 'Explora el directorio completo de guias oficiales disponibles.', href: '/tramites' },
  ];

  const saludList = [
    { title: 'Dengue en Piura: sintomas y que hacer', desc: 'Guia preventiva con senales de alarma y canales de atencion.', icon: <AlertTriangle className="h-5 w-5 text-[#C8102E]" /> },
    { title: 'Como prevenir la hipertension arterial', desc: 'Habitos diarios para reducir riesgos y consultar a tiempo.', icon: <Heart className="h-5 w-5 text-rose-600" /> },
    { title: 'Salud mental: donde pedir ayuda gratis', desc: 'Orientacion para ubicar servicios de apoyo en Lima y regiones.', icon: <Activity className="h-5 w-5 text-indigo-600" /> },
    { title: 'Alimentacion saludable con presupuesto bajo', desc: 'Ideas nutritivas usando productos accesibles del mercado local.', icon: <Apple className="h-5 w-5 text-emerald-600" /> },
    { title: 'Diabetes: senales que no debes ignorar', desc: 'Alertas tempranas y controles recomendados en centros de salud.', icon: <Activity className="h-5 w-5 text-cyan-600" /> },
  ];

  return (
    <HomeClient
      newsList={newsList}
      tramitesList={tramitesList}
      saludList={saludList}
      homeContent={siteSettings.home}
    />
  );
}
