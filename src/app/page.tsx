// src/app/page.tsx
import React from 'react';
import { prisma } from '@/lib/db';
import { Post } from '@prisma/client';
import { getSiteSettings } from '@/lib/site-settings';
import { 
  AlertTriangle,
  Heart,
  Activity,
  Apple
} from 'lucide-react';

import { HomeClient } from '@/components/home/home-client';

export const revalidate = 3600; // ISR: Revalidar la página de inicio cada 1 hora para nuevas noticias

export default async function HomePage() {
  const siteSettings = await getSiteSettings();

  // Consultar las últimas 6 noticias publicadas desde Supabase PostgreSQL
  let dbPosts: Post[] = [];
  try {
    dbPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  } catch (error) {
    console.error('[HOMEPAGE_POSTS_ERROR] Fallo al recuperar noticias en inicio:', error);
  }

  // Combinar posts reales de la BD con noticias estáticas regionales para garantizar que el diseño esté 100% lleno y sea vistoso
  const mockNews = [
    {
      id: 'mock-1',
      title: 'Municipalidad de Talara invertirá S/ 12 millones en nueva infraestructura vial para el 2025',
      category: 'NOTICIAS',
      categoryColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      excerpt: 'El alcalde provincial anunció el plan de obras que incluirá pavimentación de 8 avenidas principales y construcción de veredas en los sectores más afectados.',
      author: 'Redacción InfoPerú',
      timeText: 'Hace 2 horas',
      readTime: '5 min lectura',
      coverImage: null as string | null,
      slug: 'municipalidad-talara-inversion',
      headerBg: 'bg-[#1E5F9E]', // Color azul vivo del header en la captura
      icon: <span className="text-4xl">🏗️</span>
    },
    {
      id: 'mock-2',
      title: 'UNP abre 1,200 vacantes para el examen de admisión 2025-II',
      category: 'EDUCACIÓN',
      categoryColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      author: 'Admisión UNP',
      timeText: 'Hace 4 horas',
      headerBg: 'bg-[#AB47BC]', // Morado vivo de la captura
      icon: <span className="text-3xl">🎓</span>,
      slug: 'unp-admision-vacantes'
    },
    {
      id: 'mock-3',
      title: 'Minsa refuerza brigadas de salud en zonas rurales de Piura ante temporada de lluvias',
      category: 'SALUD',
      categoryColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      author: 'Minsa Piura',
      timeText: 'Hace 6 horas',
      headerBg: 'bg-[#2E7D32]', // Verde vivo de la captura
      icon: <span className="text-3xl">🌿</span>,
      slug: 'minsa-brigadas-piura'
    },
    {
      id: 'mock-4',
      title: 'Refinería de Talara incrementa producción en 18% during el primer trimestre',
      category: 'ECONOMÍA',
      categoryColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      author: 'Petroperú',
      timeText: 'Ayer',
      headerBg: 'bg-[#E65100]', // Naranja/ámbar de la captura
      icon: <span className="text-3xl">⚡</span>,
      slug: 'refineria-talara-produccion'
    },
    {
      id: 'mock-5',
      title: 'PNP Piura realiza operativo y captura a banda dedicada al robo de vehículos',
      category: 'SEGURIDAD',
      categoryColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      author: 'PNP Región Piura',
      timeText: 'Ayer',
      headerBg: 'bg-[#1565C0]', // Azul fuerte de la captura
      icon: <span className="text-3xl">🚓</span>,
      slug: 'pnp-piura-operativo'
    }
  ];

  // Si hay posts en la BD, reemplazamos los elementos del feed por los reales de la BD
  const newsList = [...mockNews];
  if (dbPosts.length > 0) {
    dbPosts.forEach((dbPost, idx) => {
      if (idx < newsList.length) {
        newsList[idx] = {
          id: dbPost.id,
          title: dbPost.title,
          category: 'NOTICIAS',
          categoryColor: 'bg-rose-500/10 text-rose-655 dark:text-rose-400 border-rose-500/20',
          excerpt: dbPost.excerpt || '',
          author: dbPost.author || 'Redacción InfoPerú',
          timeText: new Date(dbPost.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
          readTime: '3 min lectura',
          coverImage: dbPost.coverImage,
          slug: dbPost.slug,
          headerBg: 'bg-[#1E5F9E]',
          icon: <span className="text-4xl">📰</span>
        };
      }
    });
  }

  // 8 Trámites del Estado
  const tramitesList = [
    { title: 'RENIEC', desc: 'Duplicado de DNI, pago de tasa y recojo en agencia seleccionada.', icon: <span className="text-xl">🪪</span>, href: '/tramites/dni-duplicado/lima' },
    { title: 'SUNAT', desc: 'Inscripción al RUC para persona natural y formalización tributaria.', icon: <span className="text-xl">💰</span>, href: '/tramites/inscripcion-ruc-persona-natural/lima' },
    { title: 'SIS Gratuito', desc: 'Afiliación, cobertura, requisitos y canales oficiales de atención.', icon: <span className="text-xl">🏥</span>, href: '/tramites/afiliacion-sis-gratuito/lima' },
    { title: 'SUNARP', desc: 'Certificado literal, costos por páginas y datos registrales necesarios.', icon: <span className="text-xl">🏛️</span>, href: '/tramites/certificado-literal-sunarp/lima' },
    { title: 'MTC', desc: 'Licencia de conducir A-I, exámenes, tasa y emisión del brevete.', icon: <span className="text-xl">🚗</span>, href: '/tramites/licencia-de-conducir/lima' },
    { title: 'Migraciones', desc: 'Pasaporte electrónico, tasa oficial, cita y atención sin intermediarios.', icon: <span className="text-xl">🛂</span>, href: '/tramites/pasaporte-electronico/lima' },
    { title: 'MTPE', desc: 'Certificado Único Laboral gratuito para postulaciones y CV.', icon: <span className="text-xl">⚖️</span>, href: '/tramites/certificado-unico-laboral/lima' },
    { title: 'Todos los trámites', desc: 'Explora el directorio completo de guías oficiales disponibles.', icon: <span className="text-xl">📚</span>, href: '/tramites' },
  ];

  // 5 Guías de salud
  const saludList = [
    { title: 'Dengue en Piura: síntomas y qué hacer', desc: 'Guía actualizada 2025 para identificar y actuar rápido', icon: <AlertTriangle className="w-5 h-5 text-[#B91C1C]" /> },
    { title: 'Cómo prevenir la hipertensión arterial', desc: 'Hábitos simples que marcan la diferencia cada día', icon: <Heart className="w-5 h-5 text-rose-500" /> },
    { title: 'Salud mental: dónde pedir ayuda gratis en Perú', desc: 'Centros de atención gratuita en Piura y alrededores', icon: <Activity className="w-5 h-5 text-indigo-500" /> },
    { title: 'Alimentación saludable con presupuesto bajo', desc: 'Recetas nutritivas con ingredientes de mercado local', icon: <Apple className="w-5 h-5 text-emerald-500" /> },
    { title: 'Diabetes: señales de alerta que no debes ignorar', desc: 'Detecta a tiempo y conoce dónde hacerte análisis gratis', icon: <Activity className="w-5 h-5 text-cyan-500" /> },
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
