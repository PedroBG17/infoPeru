import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { FileText, MapPin, ChevronRight, Check } from 'lucide-react';

export const revalidate = 86400; // ISR: 24 horas

interface PageProps {
  params: Promise<{
    tramite: string;
  }>;
}

// Pre-generar los slugs de trámites conocidos para el build
export async function generateStaticParams() {
  const tramites = await prisma.procedimiento.findMany({
    select: { slug: true },
  });
  return tramites.map((t) => ({ tramite: t.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { tramite } = await params;
  const tramiteData = await prisma.procedimiento.findUnique({
    where: { slug: tramite },
  });

  if (!tramiteData) return {};

  return getMetadata({
    title: `${tramiteData.title} en el Perú - Requisitos y Sedes por Ciudad`,
    description: `Conoce los requisitos, costos de la tasa oficial y guía de pasos para tramitar tu ${tramiteData.title}. Selecciona tu ciudad para conocer las sedes de atención físicas locales.`,
    slug: `/tramites/${tramite}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { tramite } = await params;

  // Obtener el trámite y las ciudades asociadas
  const tramiteData = await prisma.procedimiento.findUnique({
    where: { slug: tramite },
    include: {
      ciudadesRel: {
        include: {
          ciudad: {
            include: {
              departamento: true,
            },
          },
        },
      },
    },
  });

  if (!tramiteData) notFound();

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Trámites', url: '/tramites' },
    { name: tramiteData.title, url: `/tramites/${tramite}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center space-x-2 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.url}>
              {i > 0 && <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>}
              <a href={b.url} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                {b.name}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* Hero Header */}
        <header className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-teal-800 to-cyan-900 text-white p-8 md:p-12 shadow-xl border border-teal-700/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-600/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-500/30 mb-4 backdrop-blur-sm">
              Guía de Trámites Oficial
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
              Trámite de {tramiteData.title}
            </h1>
            <p className="text-lg text-teal-100/90 leading-relaxed">
              {tramiteData.description}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - general requirements */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-slate-850 dark:text-slate-100 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-teal-500" />
                Requisitos Generales
              </h2>
              <ul className="space-y-3">
                {tramiteData.requisitos.map((req, idx) => (
                  <li key={idx} className="flex items-start text-slate-600 dark:text-slate-400 text-sm">
                    <span className="w-5 h-5 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar - Choose City */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-slate-850 dark:text-slate-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-500" />
                Sedes y Horarios por Ciudad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Selecciona una ciudad para consultar las oficinas locales, costos TUPA y pasos específicos de tramitación.
              </p>
              <ul className="space-y-2">
                {tramiteData.ciudadesRel.map((rel) => (
                  <li key={rel.ciudad.id}>
                    <a
                      href={`/tramites/${tramite}/${rel.ciudad.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:bg-teal-500/5 hover:border-teal-500/30 transition-all group"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {rel.ciudad.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                          Tasa oficial: S/ {rel.costo.toFixed(2)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-350 dark:text-slate-650 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-transform group-hover:translate-x-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
