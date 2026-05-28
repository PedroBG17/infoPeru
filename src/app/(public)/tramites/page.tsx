import React from 'react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { FileText, MapPin, ChevronRight, HelpCircle } from 'lucide-react';

export const revalidate = 86400; // ISR: 24 horas

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorio de Trámites y Guías TUPA - Perú',
    description: 'Encuentra guías paso a paso de los trámites públicos más buscados en el Perú (RENIEC, MTC, SUNAT). Requisitos, costos oficiales del TUPA y sedes por ciudad.',
    slug: '/tramites',
  });
}

export default async function Page() {
  // Obtener todos los trámites
  const tramites = await prisma.procedimiento.findMany({
    orderBy: { title: 'asc' },
  });

  // Obtener todas las ciudades activas
  const ciudades = await prisma.ciudad.findMany({
    include: {
      departamento: true,
      procedimientos: true,
    },
    orderBy: { name: 'asc' },
  });

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Trámites', url: '/tramites' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
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
              TUPA Nacional
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
              Guías de Trámites del Estado Peruano
            </h1>
            <p className="text-lg text-teal-100/90 leading-relaxed">
              Consulta los requisitos, tasas de pago oficiales y las sedes de atención autorizadas para realizar tus gestiones públicas de forma rápida y sencilla.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Procedures */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center">
                <FileText className="w-6 h-6 mr-2.5 text-teal-500" />
                Trámites Disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tramites.map((t) => (
                  <a
                    key={t.id}
                    href={`/tramites/${t.slug}/lima`}
                    className="group flex items-start p-4 rounded-2xl border border-slate-100 dark:border-slate-850 dark:border-slate-800 hover:border-teal-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/45 text-teal-600 dark:text-teal-400 flex items-center justify-center mr-3 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-850 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 dark:group-hover:text-teal-400 self-center ml-2 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </section>

            {/* General state procedures information to prevent thin content */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-teal-500" />
                ¿Qué es el TUPA en el Perú?
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                <p>
                  El <strong>Texto Único de Procedimientos Administrativos (TUPA)</strong> es el documento unificado que compila todos los trámites requeridos ante cualquier entidad del Estado Peruano (como ministerios, municipalidades o dependencias autónomas).
                </p>
                <p>
                  En el TUPA se especifican con carácter legal los requisitos obligatorios, el costo de las tasas de pago oficiales (basadas en la Unidad Impositiva Tributaria - UIT), los plazos de aprobación automática o evaluación previa, y las oficinas de recojo habilitadas.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar - Enter by City */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-slate-850 dark:text-slate-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-500" />
                Buscar por Ubicación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Selecciona tu provincia o región para conocer las sedes de atención físicas locales, horarios y tasas regionales de pago.
              </p>
              <ul className="space-y-2">
                {ciudades.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`/tramites/licencia-de-conducir/${c.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:bg-teal-500/5 hover:border-teal-500/30 transition-all group"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {c.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                          Región: {c.departamento.name}
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
