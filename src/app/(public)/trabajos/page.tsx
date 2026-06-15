import React from 'react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { SECTORES } from '@/modules/empleo/services';
import { Briefcase, MapPin, ChevronRight, CheckCircle, TrendingUp } from 'lucide-react';

export const revalidate = 86400; // ISR: 24 horas

export async function generateMetadata() {
  return getMetadata({
    title: 'Bolsa de Empleo y Ofertas de Trabajo - Perú',
    description: 'Encuentra ofertas laborales de empresas locales en todo el Perú. Explora vacantes de empleo vigentes en minería, retail, administración e ingeniería.',
    slug: '/trabajos',
  });
}

export default async function Page() {
  // Obtener todas las ciudades registradas
  const ciudades = await prisma.ciudad.findMany({
    include: {
      departamento: true,
    },
    orderBy: { name: 'asc' },
  });

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Directorios', url: '/directorios' },
    { name: 'Bolsa de Empleo', url: '/trabajos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center space-x-2 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.url}>
              {i > 0 && <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>}
              <a href={b.url} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                {b.name}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* Hero Header */}
        <header className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 to-rose-900 text-white p-8 md:p-12 shadow-xl border border-amber-600/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30 mb-4 backdrop-blur-sm">
              Empleabilidad Nacional
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
              Convocatorias de Trabajo en el Perú
            </h1>
            <p className="text-lg text-amber-100/90 leading-relaxed">
              Explora las mejores oportunidades de empleo formal de empresas locales. Encuentra puestos vacantes y envía tu CV de manera segura en tu región.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List of Cities */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center">
                <Briefcase className="w-6 h-6 mr-2.5 text-amber-500" />
                Vacantes de Trabajo por Ubicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ciudades.map((c) => (
                  <a
                    key={c.id}
                    href={`/trabajos/${c.slug}`}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-850 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {c.name}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Bolsa de empleo y convocatorias
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-amber-500 dark:group-hover:text-amber-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-850 dark:text-slate-100">
                Herramientas gratuitas para postular mejor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <article className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">Certificado Único Laboral</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Documento gratuito que reúne datos de identidad, antecedentes, formación y experiencia formal para procesos de selección.
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">Empleos Perú</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Bolsa virtual del Estado para registrar CV, revisar oportunidades y acceder a servicios de orientación laboral.
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">Centro de Empleo</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Servicios gratuitos de intermediación, asesoría para CV, ferias laborales y orientación para buscadores de empleo.
                  </p>
                </article>
              </div>
            </section>

            {/* Popular Sectors Section */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
                Sectores Laborales con Mayor Crecimiento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SECTORES.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 rounded-xl text-center"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-250 block">
                      {sec.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Safety Instructions */}
          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white p-6 rounded-3xl shadow-xl border border-amber-500/20 space-y-4">
              <h3 className="font-bold text-lg text-amber-300">Garantía de Seguridad</h3>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Todas las convocatorias de empleo e intermediaciones de hojas de vida (CV) publicadas en ClavePerú son gratuitas para el postulante.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-amber-100">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sin cobros administrativos</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-amber-100">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Verificación de empresas</span>
                </div>
              </div>
            </div>
            <SourceList
              title="Fuentes oficiales de empleo"
              sources={pageSources.empleo}
              image={editorialImages.empleo}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
