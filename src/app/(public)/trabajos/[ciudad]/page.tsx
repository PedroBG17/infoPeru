import React from 'react';
import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/seo';
import { getCiudadBySlug, getProgrammaticJobs, SECTORES } from '@/modules/empleo/services';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { Briefcase, MapPin, Calendar, DollarSign, Building, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

export const revalidate = 86400; // ISR: Regenerar cada 24 horas

interface PageProps {
  params: Promise<{
    ciudad: string;
  }>;
}

// Pre-compilar las top ciudades en el build para maximizar LCP
export async function generateStaticParams() {
  const topCiudades = ['lima', 'arequipa', 'trujillo'];
  return topCiudades.map((c) => ({ ciudad: c }));
}

export async function generateMetadata({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadBySlug(ciudad);

  if (!ciudadData) return {};

  return getMetadata({
    title: `Bolsa de Trabajo en ${ciudadData.name} - Empleos Disponibles`,
    description: `Encuentra las mejores ofertas de trabajo y vacantes de empleo en ${ciudadData.name}. Postula hoy mismo a puestos en administración, minería, comercio, salud e ingeniería en la región.`,
    slug: `/trabajos/${ciudad}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadBySlug(ciudad);

  if (!ciudadData) notFound();

  const trabajos = getProgrammaticJobs(ciudad);

  const breadcrumbs = [
    { name: 'Inicio', url: 'https://dataperu.pe' },
    { name: 'Directorios', url: 'https://dataperu.pe/directorios' },
    { name: 'Bolsa de Empleo', url: 'https://dataperu.pe/trabajos' },
    { name: ciudadData.name, url: `https://dataperu.pe/trabajos/${ciudad}` },
  ];

  return (
    <>
      {/* 1. Datos Estructurados de Navegación */}
      <StructuredData type="Breadcrumb" data={breadcrumbs} />

      {/* 2. Datos Estructurados para Google Jobs */}
      {trabajos.map((job) => {
        const jobData = {
          title: job.title,
          description: `<p>${job.description}</p><h3>Requisitos:</h3><ul>${job.requirements
            .map((req) => `<li>${req}</li>`)
            .join('')}</ul>`,
          company: job.company,
          city: ciudadData.name,
          region: ciudadData.departamento.name,
          type: job.type,
          jobId: job.id,
          datePosted: new Date(Date.now() - job.postedDaysAgo * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          salaryText: job.salaryRange.includes('S/') ? job.salaryRange.match(/\d+,\d+|\d+/)?.[0]?.replace(',', '') : undefined,
        };
        return <StructuredData key={job.id} type="JobPosting" data={jobData} />;
      })}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
        <main className="container mx-auto px-4 py-12 max-w-7xl">
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

          {/* Hero Header Banner */}
          <header className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 to-rose-900 text-white p-8 md:p-12 shadow-xl border border-amber-600/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30 mb-4 backdrop-blur-sm">
                Bolsa de Empleo • Regional Perú
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
                Ofertas de Trabajo en {ciudadData.name}
              </h1>
              <p className="text-lg text-amber-100/90 leading-relaxed mb-6">
                Descubre vacantes de trabajo disponibles hoy mismo en {ciudadData.name}. Conéctate con las mejores empresas locales y postula en línea a empleos formales en diversos rubros comerciales e industriales.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-amber-200">
                <div className="flex items-center space-x-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-700/30">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Empleo Formal y Practicantes</span>
                </div>
                <div className="flex items-center space-x-2 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-700/30">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Vacantes Verificadas Diariamente</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jobs List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter / Meta bar */}
              <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Mostrando {trabajos.length} convocatorias vigentes en {ciudadData.name}
                </span>
                <div className="text-amber-600 dark:text-amber-400 text-sm font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-1 inline-block" />
                  <span>Convocatoria Abierta</span>
                </div>
              </div>

              {/* Jobs List Grid */}
              <div className="space-y-6">
                {trabajos.map((job) => (
                  <article
                    key={job.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/30">
                            {job.sector}
                          </span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {job.type}
                          </span>
                          <span className="inline-flex items-center text-xs text-slate-400 dark:text-slate-500">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Hace {job.postedDaysAgo} {job.postedDaysAgo === 1 ? 'día' : 'días'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {job.title}
                        </h3>

                        <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center">
                            <Building className="w-4 h-4 mr-1 text-slate-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                            {ciudadData.name}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {job.description}
                        </p>

                        <div className="pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Requisitos:</h4>
                          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                            {job.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto md:text-right md:items-end">
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/20 w-fit">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{job.salaryRange}</span>
                        </div>

                        <a
                          href={`#postular-form`}
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all w-full md:w-auto shadow-sm"
                        >
                          Postular Rápido
                          <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Informative text about local market */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Bolsa de Empleo en {ciudadData.name} - Estadísticas y Consejos
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4">
                  <p>
                    La empleabilidad en la región de <strong>{ciudadData.name}</strong> está impulsada por el dinamismo de sectores clave. En el mercado peruano, contar con habilidades blandas, manejo de herramientas ofimáticas y experiencia sectorial verificable son los factores decisivos para superar los procesos de reclutamiento de personal.
                  </p>
                  <p>
                    <strong>Nota de Seguridad:</strong> Todos los procesos de selección mostrados en DataPerú son 100% gratuitos para el postulante. Nunca realices ningún tipo de pago por concepto de evaluaciones médicas, capacitaciones de ingreso o trámites administrativos a empresas reclutadoras.
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar with Lead Capture Form and Internal Links */}
            <aside className="space-y-6">
              {/* Lead Capture for Job Hunters or Employers */}
              <div id="postular-form" className="bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-amber-500/20">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-amber-400" />
                  Registro de Postulante
                </h3>
                <p className="text-sm text-amber-200/90 mb-4 leading-relaxed">
                  ¿Buscas un empleo específico en {ciudadData.name}? Regístrate en nuestra base de talentos. Compartiremos tu perfil directamente con las empresas contratantes cuando se abran nuevas vacantes.
                </p>

                <form action="/api/v1/leads" method="POST" className="space-y-4">
                  <input type="hidden" name="cityId" value={ciudadData.id} />
                  <input type="hidden" name="consent" value="true" />

                  <div>
                    <label className="block text-xs font-semibold text-amber-200 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ej. María Condori"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-amber-800/60 focus:border-amber-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="maria@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-amber-800/60 focus:border-amber-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200 mb-1">Número Celular (Perú)</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="9[0-9]{8}"
                      placeholder="Ej. 987654321"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-amber-800/60 focus:border-amber-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200 mb-1">Sector de Interés</label>
                    <select
                      name="sectorId"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-850 bg-slate-800 border border-amber-800/60 focus:border-amber-400 focus:outline-none text-sm text-white transition"
                    >
                      <option value="">Selecciona tu rubro...</option>
                      {SECTORES.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-200 mb-1">Resumen Profesional / Oficio</label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Ej. Egresada técnica de administración con 1 año de experiencia en facturación e inventarios..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-amber-800/60 focus:border-amber-400 focus:outline-none text-sm text-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-md text-center text-sm"
                  >
                    Postularme / Registrar CV
                  </button>
                </form>
              </div>

              {/* Related content / Internal Linking */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2" />
                  Trámites en {ciudadData.name}
                </h3>
                <LinkAutomatico type="tramites" ciudadSlug={ciudadData.slug} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
