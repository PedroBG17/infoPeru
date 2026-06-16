// src/app/page.tsx
import React from 'react';
import { prisma } from '@/lib/db';
import { Post } from '@prisma/client';
import { getSiteSettings } from '@/lib/site-settings';
import { Activity, AlertTriangle, Apple, Heart } from 'lucide-react';
import { HomeClient } from '@/components/home/home-client';

export const revalidate = 3600;

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

  const mockNews = [
    {
      id: 'mock-1',
      title: 'Municipalidad de Talara invertira S/ 12 millones en nueva infraestructura vial',
      category: 'Regiones',
      excerpt:
        'El plan incluye pavimentacion de avenidas principales, veredas y mejoramiento de zonas con alta circulacion vecinal.',
      author: 'Redaccion ClavePeru',
      timeText: 'Hace 2 horas',
      readTime: '5 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
      slug: 'municipalidad-talara-inversion',
    },
    {
      id: 'mock-2',
      title: 'UNP abre 1,200 vacantes para el examen de admision 2025-II',
      category: 'Educacion',
      excerpt:
        'La casa de estudios publico el calendario de inscripciones, requisitos y sedes de evaluacion.',
      author: 'Admision UNP',
      timeText: 'Hace 4 horas',
      readTime: '4 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
      slug: 'unp-admision-vacantes',
    },
    {
      id: 'mock-3',
      title: 'Minsa refuerza brigadas de salud en zonas rurales de Piura ante lluvias',
      category: 'Salud',
      excerpt:
        'Equipos itinerantes priorizan vacunacion, control de dengue y atencion preventiva en centros poblados.',
      author: 'Minsa Piura',
      timeText: 'Hace 6 horas',
      readTime: '3 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&q=80',
      slug: 'minsa-brigadas-piura',
    },
    {
      id: 'mock-4',
      title: 'Refineria de Talara incrementa produccion en 18% durante el trimestre',
      category: 'Economia',
      excerpt:
        'La actividad energetica impulsa demanda de servicios logisticos y empleo tecnico en la provincia.',
      author: 'Petroperu',
      timeText: 'Ayer',
      readTime: '4 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      slug: 'refineria-talara-produccion',
    },
    {
      id: 'mock-5',
      title: 'PNP Piura realiza operativo contra banda dedicada al robo de vehiculos',
      category: 'Seguridad',
      excerpt:
        'La intervencion se realizo con apoyo de unidades de inteligencia y fiscalia provincial.',
      author: 'PNP Region Piura',
      timeText: 'Ayer',
      readTime: '3 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200&q=80',
      slug: 'pnp-piura-operativo',
    },
    {
      id: 'mock-6',
      title: 'Sunat simplifica declaracion mensual para pequenos negocios regionales',
      category: 'Tramites',
      excerpt:
        'La nueva orientacion busca reducir errores frecuentes en contribuyentes que recien formalizan actividades.',
      author: 'Redaccion ClavePeru',
      timeText: 'Ayer',
      readTime: '5 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
      slug: 'sunat-declaracion-mypes',
    },
    {
      id: 'mock-7',
      title: 'EsSalud anuncia nuevas citas digitales para asegurados en regiones',
      category: 'Salud',
      excerpt:
        'El sistema prioriza consultas ambulatorias y reduce colas en agencias de mayor demanda.',
      author: 'Redaccion Salud',
      timeText: 'Hace 1 dia',
      readTime: '3 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
      slug: 'essalud-citas-digitales-regiones',
    },
    {
      id: 'mock-8',
      title: 'Empresas agroindustriales abren convocatoria para operarios y tecnicos',
      category: 'Empleo',
      excerpt:
        'Las oportunidades se concentran en produccion, mantenimiento, control de calidad y logistica.',
      author: 'Bolsa ClavePeru',
      timeText: 'Hace 1 dia',
      readTime: '4 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
      slug: 'convocatoria-agroindustria-tecnicos',
    },
    {
      id: 'mock-9',
      title: 'Migraciones recuerda pasos para obtener pasaporte electronico sin tramitadores',
      category: 'Tramites',
      excerpt:
        'La entidad pidio revisar tasas oficiales, citas disponibles y canales de atencion verificados.',
      author: 'Redaccion ClavePeru',
      timeText: 'Hace 2 dias',
      readTime: '4 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
      slug: 'pasaporte-electronico-sin-tramitadores',
    },
    {
      id: 'mock-10',
      title: 'Hospitales de Lima refuerzan emergencia por infecciones respiratorias',
      category: 'Salud',
      excerpt:
        'Especialistas recomiendan vacunacion, abrigo adecuado y atencion temprana ante signos de alarma.',
      author: 'Redaccion Salud',
      timeText: 'Hace 2 dias',
      readTime: '3 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80',
      slug: 'hospitales-lima-emergencia-respiratoria',
    },
    {
      id: 'mock-11',
      title: 'MTPE actualiza orientacion para solicitar el Certificado Unico Laboral',
      category: 'Empleo',
      excerpt:
        'El documento gratuito permite validar antecedentes, experiencia y formacion para postulaciones.',
      author: 'Redaccion Empleo',
      timeText: 'Hace 3 dias',
      readTime: '4 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      slug: 'certificado-unico-laboral-mtpe',
    },
    {
      id: 'mock-12',
      title: 'Gobiernos locales digitalizan licencias y pagos administrativos',
      category: 'Servicios',
      excerpt:
        'Municipalidades priorizan plataformas de consulta para reducir tiempos de espera y pagos duplicados.',
      author: 'Redaccion ClavePeru',
      timeText: 'Hace 3 dias',
      readTime: '5 min lectura',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      slug: 'municipalidades-digitalizan-licencias',
    },
  ];

  const newsList = [...mockNews];
  if (dbPosts.length > 0) {
    dbPosts.forEach((dbPost, idx) => {
      if (idx < newsList.length) {
        newsList[idx] = {
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
          coverImage: dbPost.coverImage || mockNews[idx].coverImage,
          slug: dbPost.slug,
        };
      }
    });
  }

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
    { title: 'Dengue en Piura: sintomas y que hacer', desc: 'Guia actualizada para identificar senales de alarma y actuar rapido', icon: <AlertTriangle className="h-5 w-5 text-[#C8102E]" /> },
    { title: 'Como prevenir la hipertension arterial', desc: 'Habitos simples que marcan la diferencia cada dia', icon: <Heart className="h-5 w-5 text-rose-600" /> },
    { title: 'Salud mental: donde pedir ayuda gratis', desc: 'Centros de atencion gratuita en Lima, Piura y regiones', icon: <Activity className="h-5 w-5 text-indigo-600" /> },
    { title: 'Alimentacion saludable con presupuesto bajo', desc: 'Recetas nutritivas con ingredientes de mercado local', icon: <Apple className="h-5 w-5 text-emerald-600" /> },
    { title: 'Diabetes: senales que no debes ignorar', desc: 'Detecta a tiempo y conoce donde hacerte analisis', icon: <Activity className="h-5 w-5 text-cyan-600" /> },
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
