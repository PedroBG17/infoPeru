import Link from 'next/link';
import { Briefcase, ChevronRight, FileText, HeartPulse, Layers, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getMetadata({
    title: 'Todos los servicios ciudadanos de ClavePerú',
    description: 'Mapa general de trámites, hospitales, empleo y directorios ciudadanos disponibles en ClavePerú, con fuentes oficiales citadas.',
    slug: '/todos',
  });
}

export default async function Page() {
  const [tramites, ciudades, hospitales, trabajos] = await Promise.all([
    prisma.procedimiento.findMany({ orderBy: { title: 'asc' } }),
    prisma.ciudad.findMany({
      include: { departamento: true },
      orderBy: { name: 'asc' },
    }),
    prisma.hospital.count(),
    prisma.jobListing.count({ where: { published: true } }),
  ]);

  const allSources = Array.from(
    new Map(
      [...pageSources.tramites, ...pageSources.salud, ...pageSources.empleo].map((source) => [
        source.url,
        source,
      ])
    ).values()
  );

  const serviceGroups = [
    {
      title: 'Trámites oficiales',
      description: 'Guías ciudadanas con requisitos, costos, pagos, sedes y pasos por ciudad.',
      href: '/tramites',
      icon: FileText,
      stat: `${tramites.length} guías`,
    },
    {
      title: 'Salud y hospitales',
      description: 'Directorio de centros de salud, orientación SIS, emergencias y canales MINSA.',
      href: '/hospitales',
      icon: HeartPulse,
      stat: `${hospitales} centros`,
    },
    {
      title: 'Empleo regional',
      description: 'Bolsa laboral, registro de postulantes, Certificado Único Laboral y seguridad al postular.',
      href: '/trabajos',
      icon: Briefcase,
      stat: `${trabajos} registros CMS`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="relative mb-10 rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/25 via-slate-900 to-slate-950 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-500/30 mb-4">
              <Layers className="w-3.5 h-3.5" />
              Mapa completo del portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Todos los servicios ciudadanos
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Explora en una sola vista las secciones informativas de ClavePerú. Esta página no lista noticias: solo servicios permanentes, trámites, directorios y recursos de orientación ciudadana.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {serviceGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Link
                key={group.href}
                href={group.href}
                className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/45 text-teal-600 dark:text-teal-300 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1">
                    {group.stat}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                  {group.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {group.description}
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-bold text-teal-600 dark:text-teal-300">
                  Abrir sección
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Cobertura por ciudad
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Las ciudades activas conectan trámites, sedes, hospitales y registros laborales. Cuando un trámite no tiene sede local específica, se indica el canal oficial para confirmar cita, recojo o atención virtual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ciudades.map((ciudad) => (
                <div key={ciudad.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">{ciudad.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{ciudad.departamento.name}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                    <Link href={`/tramites/licencia-de-conducir/${ciudad.slug}`} className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 text-slate-600 dark:text-slate-300 hover:text-teal-600">
                      Trámites
                    </Link>
                    <Link href={`/hospitales/${ciudad.slug}`} className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 text-slate-600 dark:text-slate-300 hover:text-teal-600">
                      Salud
                    </Link>
                    <Link href={`/trabajos/${ciudad.slug}`} className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 text-slate-600 dark:text-slate-300 hover:text-teal-600">
                      Empleo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SourceList
            title="Fuentes públicas usadas"
            sources={allSources}
            image={editorialImages.directorios}
          />
        </section>
      </main>
    </div>
  );
}
