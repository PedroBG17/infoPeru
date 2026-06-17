import { Briefcase, CheckCircle, MapPin, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { SECTORES } from '@/modules/empleo/services';
import {
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  LinkCard,
  PortalShell,
  SectionHeader,
  TrustPanel,
} from '@/components/public/portal-ui';

export const revalidate = 86400;

export async function generateMetadata() {
  return getMetadata({
    title: 'Bolsa de Empleo y Ofertas de Trabajo - Peru',
    description: 'Encuentra ofertas laborales de empresas locales en el Peru. Explora vacantes vigentes en mineria, retail, administracion e ingenieria.',
    slug: '/trabajos',
  });
}

export default async function Page() {
  const ciudades = await prisma.ciudad.findMany({
    include: {
      departamento: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Directorios', url: '/directorios' },
          { name: 'Empleo', url: '/trabajos' },
        ]}
      />

      <EditorialHero
        eyebrow="Empleabilidad nacional"
        title="Convocatorias de trabajo por ciudad"
        description="Explora oportunidades laborales formales y orientacion para postular sin pagos indebidos, con recursos gratuitos del Estado y alertas de seguridad."
        icon={Briefcase}
        stats={[
          { label: 'Ciudades', value: ciudades.length },
          { label: 'Sectores', value: SECTORES.length },
          { label: 'Fuentes', value: pageSources.empleo.length },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <EditorialPanel>
            <SectionHeader
              title="Vacantes de trabajo por ubicacion"
              description="Selecciona una ciudad para revisar convocatorias disponibles y registrar tu perfil."
              icon={MapPin}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {ciudades.map((ciudad) => (
                <LinkCard
                  key={ciudad.id}
                  href={`/trabajos/${ciudad.slug}`}
                  title={ciudad.name}
                  description={`Bolsa de empleo y convocatorias en ${ciudad.departamento.name}`}
                  meta="Ciudad"
                  icon={MapPin}
                />
              ))}
            </div>
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Herramientas gratuitas para postular mejor" icon={CheckCircle} />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Certificado Unico Laboral',
                  text: 'Documento gratuito con datos de identidad, antecedentes, formacion y experiencia formal.',
                },
                {
                  title: 'Empleos Peru',
                  text: 'Bolsa virtual del Estado para registrar CV y acceder a orientacion laboral.',
                },
                {
                  title: 'Centro de Empleo',
                  text: 'Servicios gratuitos de intermediacion, asesorias para CV y ferias laborales.',
                },
              ].map((tool) => (
                <article key={tool.title} className="border border-[#E8E4DE] bg-[#F8F5F0] p-4">
                  <h3 className="font-heading text-lg font-bold text-[#1A1A2E]">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{tool.text}</p>
                </article>
              ))}
            </div>
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Sectores laborales con mayor busqueda" icon={TrendingUp} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SECTORES.map((sector) => (
                <div key={sector.id} className="border border-[#E8E4DE] bg-[#F8F5F0] p-3 text-center">
                  <span className="text-xs font-bold text-[#1A1A2E]">{sector.name}</span>
                </div>
              ))}
            </div>
          </EditorialPanel>
        </div>

        <aside className="space-y-6">
          <TrustPanel
            title="Postular debe ser gratis"
            description="Las oportunidades y registros de postulantes no deben cobrar por evaluaciones, capacitaciones de ingreso ni validaciones administrativas."
            items={['No pagues por postular.', 'Verifica empresa y RUC.', 'Guarda evidencia de comunicaciones.']}
          />
          <SourceList title="Fuentes oficiales de empleo" sources={pageSources.empleo} image={editorialImages.empleo} />
        </aside>
      </div>
    </PortalShell>
  );
}
