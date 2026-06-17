import Link from 'next/link';
import { Briefcase, FileText, HeartPulse, Layers, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import {
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  LinkCard,
  PortalShell,
  SectionHeader,
  TrustPanel,
} from '@/components/public/portal-ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getMetadata({
    title: 'Todos los servicios ciudadanos de ClavePeru',
    description: 'Mapa general de tramites, hospitales, empleo y directorios ciudadanos disponibles en ClavePeru, con fuentes oficiales citadas.',
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
      [...pageSources.tramites, ...pageSources.salud, ...pageSources.empleo].map((source) => [source.url, source])
    ).values()
  );

  const serviceGroups = [
    {
      title: 'Tramites oficiales',
      description: 'Guias ciudadanas con requisitos, costos, pagos, sedes y pasos por ciudad.',
      href: '/tramites',
      icon: FileText,
      stat: `${tramites.length} guias`,
    },
    {
      title: 'Salud y hospitales',
      description: 'Directorio de centros de salud, orientacion SIS, emergencias y canales MINSA.',
      href: '/hospitales',
      icon: HeartPulse,
      stat: `${hospitales} centros`,
    },
    {
      title: 'Empleo regional',
      description: 'Bolsa laboral, registro de postulantes, CUL y seguridad al postular.',
      href: '/trabajos',
      icon: Briefcase,
      stat: `${trabajos} registros`,
    },
  ];

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Todo', url: '/todos' },
        ]}
      />

      <EditorialHero
        eyebrow="Mapa completo del portal"
        title="Todos los servicios ciudadanos"
        description="Una vista de servicios permanentes, tramites, directorios y recursos de orientacion. Las noticias viven en su propia seccion editorial."
        icon={Layers}
        stats={[
          { label: 'Guias', value: tramites.length },
          { label: 'Ciudades', value: ciudades.length },
          { label: 'Fuentes', value: allSources.length },
        ]}
      />

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {serviceGroups.map((group) => (
          <LinkCard
            key={group.href}
            href={group.href}
            title={group.title}
            description={group.description}
            meta={group.stat}
            icon={group.icon}
          />
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <EditorialPanel>
          <SectionHeader
            title="Cobertura por ciudad"
            description="Las ciudades activas conectan tramites, hospitales y registros laborales."
            icon={MapPin}
          />

          <div className="grid gap-3 md:grid-cols-2">
            {ciudades.map((ciudad) => (
              <div key={ciudad.id} className="border border-[#E8E4DE] bg-white p-4 shadow-[0_1px_3px_rgba(10,15,30,.08)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center bg-[#0A0F1E] text-white">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#1A1A2E]">{ciudad.name}</h3>
                    <p className="text-xs text-[#6B7280]">{ciudad.departamento.name}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                  <Link href={`/tramites/licencia-de-conducir/${ciudad.slug}`} className="border border-[#E8E4DE] px-3 py-1 text-[#6B7280] hover:border-[#C8102E]/40 hover:text-[#C8102E]">
                    Tramites
                  </Link>
                  <Link href={`/hospitales/${ciudad.slug}`} className="border border-[#E8E4DE] px-3 py-1 text-[#6B7280] hover:border-[#C8102E]/40 hover:text-[#C8102E]">
                    Salud
                  </Link>
                  <Link href={`/trabajos/${ciudad.slug}`} className="border border-[#E8E4DE] px-3 py-1 text-[#6B7280] hover:border-[#C8102E]/40 hover:text-[#C8102E]">
                    Empleo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </EditorialPanel>

        <aside className="space-y-6">
          <TrustPanel
            title="Servicios permanentes"
            description="Esta vista funciona como mapa operativo del portal para que el usuario no dependa de la portada."
            items={['Rutas principales.', 'Recursos por ciudad.', 'Fuentes citadas.']}
          />
          <SourceList title="Fuentes publicas usadas" sources={allSources} image={editorialImages.directorios} />
        </aside>
      </div>
    </PortalShell>
  );
}
