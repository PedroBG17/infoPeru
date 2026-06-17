import { BookOpen, FileText, HelpCircle, Landmark, MapPin } from 'lucide-react';
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

export const revalidate = 86400;

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorio de Tramites y Guias TUPA - Peru',
    description: 'Encuentra guias paso a paso de los tramites publicos mas buscados en el Peru. Requisitos, costos oficiales y sedes por ciudad.',
    slug: '/tramites',
  });
}

export default async function Page() {
  const [tramites, ciudades] = await Promise.all([
    prisma.procedimiento.findMany({ orderBy: { title: 'asc' } }),
    prisma.ciudad.findMany({
      include: {
        departamento: true,
        procedimientos: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const officialGuides = [
    {
      title: 'Identidad y documentos',
      text: 'DNI, pasaporte, certificados y pagos asociados a documentos personales.',
    },
    {
      title: 'Licencias y registros',
      text: 'Brevete, RUC, certificados registrales y validaciones previas.',
    },
    {
      title: 'Salud y empleo ciudadano',
      text: 'Afiliacion SIS, Certificado Unico Laboral y servicios gratuitos del Estado.',
    },
  ];

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Tramites', url: '/tramites' },
        ]}
      />

      <EditorialHero
        eyebrow="TUPA nacional"
        title="Guias de tramites del Estado Peruano"
        description="Consulta requisitos, tasas oficiales y sedes autorizadas para realizar gestiones publicas con menos friccion y sin intermediarios."
        icon={Landmark}
        stats={[
          { label: 'Guias', value: tramites.length },
          { label: 'Ciudades', value: ciudades.length },
          { label: 'Fuentes', value: pageSources.tramites.length },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <EditorialPanel>
            <SectionHeader
              title="Tramites disponibles"
              description="Accesos directos a guias gestionadas desde el CMS y la base de datos."
              icon={FileText}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {tramites.map((tramite) => (
                <LinkCard
                  key={tramite.id}
                  href={`/tramites/${tramite.slug}/lima`}
                  title={tramite.title}
                  description={tramite.description}
                  meta="Guia oficial"
                  icon={FileText}
                />
              ))}
            </div>
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Guias oficiales priorizadas" icon={BookOpen} />
            <div className="grid gap-4 md:grid-cols-3">
              {officialGuides.map((guide) => (
                <article key={guide.title} className="border border-[#E8E4DE] bg-[#F8F5F0] p-4">
                  <h3 className="font-heading text-lg font-bold text-[#1A1A2E]">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{guide.text}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6B7280]">
              Cada guia separa requisitos, pagos, pasos y alertas para evitar cobros indebidos,
              intermediarios no autorizados o errores comunes al reservar citas.
            </p>
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Que es el TUPA en el Peru" icon={HelpCircle} />
            <div className="space-y-4 text-sm leading-7 text-[#6B7280]">
              <p>
                El Texto Unico de Procedimientos Administrativos organiza los tramites de cada entidad
                publica, sus requisitos, costos, plazos y canales de atencion.
              </p>
              <p>
                Antes de pagar una tasa, verifica el concepto, el codigo de pago y la entidad autorizada.
                Guarda constancias, numero de solicitud y datos de cita hasta finalizar el tramite.
              </p>
            </div>
          </EditorialPanel>
        </div>

        <aside className="space-y-6">
          <TrustPanel
            title="Evita tramitadores y pagos no oficiales"
            description="Las guias estan pensadas para ayudarte a revisar fuentes oficiales antes de iniciar cualquier gestion."
            items={[
              'Confirma tasas en canales oficiales.',
              'No deposites a cuentas personales.',
              'Conserva tu constancia y codigo de solicitud.',
            ]}
          />

          <EditorialPanel>
            <SectionHeader title="Buscar por ubicacion" icon={MapPin} />
            <p className="mb-4 text-xs leading-6 text-[#6B7280]">
              Selecciona una ciudad para revisar servicios frecuentes y sedes disponibles.
            </p>
            <div className="space-y-2">
              {ciudades.map((ciudad) => (
                <LinkCard
                  key={ciudad.id}
                  href={`/tramites/licencia-de-conducir/${ciudad.slug}`}
                  title={ciudad.name}
                  description={ciudad.departamento.name}
                  meta="Ciudad"
                  icon={MapPin}
                />
              ))}
            </div>
          </EditorialPanel>

          <TrustPanel
            title="Consulta con criterio"
            description="ClavePeru organiza informacion publica; la entidad oficial siempre tiene la decision final sobre tasas, plazos y disponibilidad."
            items={['Verifica fecha de actualizacion.', 'Revisa requisitos antes de ir a sede.']}
          />

          <SourceList title="Fuentes oficiales de tramites" sources={pageSources.tramites} image={editorialImages.tramites} />
        </aside>
      </div>
    </PortalShell>
  );
}
