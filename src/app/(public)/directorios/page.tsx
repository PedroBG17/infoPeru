import React from 'react';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { FileText, Hospital, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

export const revalidate = 86400; // ISR: 24 horas

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorios de Información Regional y Servicios en el Perú',
    description: 'Accede a los directorios regionales de DataPerú: trámites oficiales del TUPA, redes de hospitales y clínicas del MINSA y EsSalud, y bolsa de empleo por ciudad.',
    slug: '/directorios',
  });
}

export default function Page() {
  const directorios = [
    {
      title: 'Guías y Trámites TUPA',
      description: 'Consulta los requisitos indispensables, costos oficiales del TUPA y el paso a paso de los trámites públicos más buscados del país (RENIEC, MTC, SUNAT).',
      href: '/tramites',
      icon: FileText,
      color: 'from-cyan-500 to-teal-500',
      badge: 'Trámites del Estado',
    },
    {
      title: 'Hospitales y Centros de Salud',
      description: 'Directorio completo de centros médicos, clínicas privadas y hospitales del MINSA y EsSalud organizados por provincia con teléfonos de emergencia y mapas de ruta.',
      href: '/hospitales',
      icon: Hospital,
      color: 'from-teal-500 to-emerald-500',
      badge: 'Directorio de Salud',
    },
    {
      title: 'Bolsa de Empleo Regional',
      description: 'Explora ofertas laborales de empresas locales en todo el Perú. Convocatorias vigentes verificadas por sectores como minería, retail, ingeniería y administración.',
      href: '/trabajos',
      icon: Briefcase,
      color: 'from-amber-500 to-rose-500',
      badge: 'Convocatorias Laborales',
    },
  ];

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Directorios', url: '/directorios' },
  ];
  const directorySources = [...pageSources.tramites, ...pageSources.salud, ...pageSources.empleo];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center space-x-2 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.url}>
              {i > 0 && <span className="mx-2 text-slate-350 dark:text-slate-700">/</span>}
              <a href={b.url} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                {b.name}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* Hero Header */}
        <header className="relative mb-12 rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-slate-900 to-slate-950 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Portal de Utilidad Pública Regional
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
              Directorios de Consulta Regional
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Simplificamos el acceso a la información pública digital del Perú. Explora guías oficiales del TUPA, centros de salud de emergencia y oportunidades de empleo formales por provincia.
            </p>
          </div>
        </header>

        {/* Grid de Directorios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {directorios.map((dir) => {
            const Icon = dir.icon;
            return (
              <a
                key={dir.href}
                href={dir.href}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-3xl p-8 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-250/20 dark:border-slate-850/20">
                      {dir.badge}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dir.color} text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105 duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {dir.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      {dir.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-1.5 font-bold text-xs text-slate-950 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 group-hover:translate-x-1 transition-transform w-fit">
                  Acceder al Directorio
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cómo se organiza la información
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              DataPerú agrupa servicios ciudadanos por intención: trámites para resolver gestiones con el Estado, salud para ubicar atención y cobertura, y empleo para orientar postulaciones formales. Cada sección combina contenido editorial propio con fuentes públicas oficiales y material visual con licencia abierta o uso permitido.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4">
                Verifica la fuente oficial antes de pagar tasas o reservar citas.
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4">
                Usa líneas públicas de orientación cuando haya síntomas, urgencias o dudas de cobertura.
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4">
                Evita procesos laborales que cobren por postular, capacitar o validar documentos.
              </div>
            </div>
          </div>
          <SourceList
            title="Fuentes editoriales del portal"
            sources={directorySources}
            image={editorialImages.directorios}
          />
        </section>
      </main>
    </div>
  );
}
