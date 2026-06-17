import { notFound } from 'next/navigation';
import { Clock, Hospital, Shield } from 'lucide-react';
import { getMetadata } from '@/lib/seo';
import { getHospitalesByCiudad, getCiudadWithDepartamento } from '@/modules/salud/services';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { HospitalesList } from '@/components/salud/hospitales-list';
import {
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  PortalShell,
  SectionHeader,
  TrustPanel,
} from '@/components/public/portal-ui';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{
    ciudad: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadWithDepartamento(ciudad);

  if (!ciudadData) return {};

  return getMetadata({
    title: `Hospitales y Clinicas en ${ciudadData.name} - Telefonos y Direcciones`,
    description: `Directorio completo de centros de salud, hospitales y clinicas en ${ciudadData.name}. Telefonos, direcciones, horarios y aseguradoras.`,
    slug: `/hospitales/${ciudad}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadWithDepartamento(ciudad);

  if (!ciudadData) notFound();

  const hospitales = await getHospitalesByCiudad(ciudad);

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Directorios', url: '/directorios' },
    { name: 'Salud', url: '/hospitales' },
    { name: ciudadData.name, url: `/hospitales/${ciudad}` },
  ];

  return (
    <>
      <StructuredData type="Breadcrumb" data={breadcrumbs} />

      {hospitales.map((hospitalItem) => {
        const businessData = {
          subType: 'Hospital',
          name: hospitalItem.nombre,
          telephone: hospitalItem.telefono || 'No especificado',
          streetAddress: hospitalItem.direccion,
          city: ciudadData.name,
          region: ciudadData.departamento.name,
          image: editorialImages.salud.src,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://info-peru.vercel.app'}/hospitales/${ciudad}`,
        };
        return <StructuredData key={hospitalItem.id} type="LocalBusiness" data={businessData} />;
      })}

      <PortalShell maxWidth="7xl">
        <Breadcrumbs items={breadcrumbs} />

        <EditorialHero
          eyebrow="Directorio de salud"
          title={`Centros de salud y hospitales en ${ciudadData.name}`}
          description={`Directorio de hospitales, clinicas y centros medicos autorizados en ${ciudadData.name}, con filtros utiles para ubicar atencion y telefonos.`}
          icon={Hospital}
          stats={[
            { label: 'Centros', value: hospitales.length },
            { label: 'Region', value: ciudadData.departamento.name },
            { label: 'Fuentes', value: pageSources.salud.length },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <EditorialPanel>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#1A1A2E]">
                    {hospitales.length} centros registrados en {ciudadData.name}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Filtra por tipo, busca direccion o telefono y abre mapa cuando necesites orientarte.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8102E]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Directorio activo
                </div>
              </div>
            </EditorialPanel>

            <HospitalesList initialHospitales={hospitales} ciudadNombre={ciudadData.name} />

            <EditorialPanel>
              <SectionHeader title={`Como funciona el sistema de salud en ${ciudadData.name}`} icon={Shield} />
              <div className="space-y-4 text-sm leading-7 text-[#6B7280]">
                <p>
                  En {ciudadData.name}, la atencion de salud puede depender del SIS, EsSalud o redes privadas.
                  Para emergencias, prioriza acudir al centro disponible mas cercano o comunicarte por telefono.
                </p>
                <p>
                  Si no cuentas con seguro, revisa afiliacion al SIS y cobertura vigente. Para orientacion sanitaria,
                  MINSA mantiene canales publicos como la Linea 113.
                </p>
                <p>
                  Los nombres de instituciones y marcas pertenecen a sus titulares. ClavePeru organiza informacion
                  con fines informativos y de orientacion ciudadana.
                </p>
              </div>
            </EditorialPanel>
          </div>

          <aside className="space-y-6">
            <TrustPanel
              title="Antes de trasladarte"
              description="Confirma por telefono horario, emergencia disponible y requisitos de atencion."
              items={['Prioriza urgencias 24h.', 'Verifica direccion.', 'Consulta cobertura.']}
            />

            <EditorialPanel>
              <SectionHeader title={`Tramites en ${ciudadData.name}`} icon={Clock} />
              <LinkAutomatico type="tramites" ciudadSlug={ciudadData.slug} />
            </EditorialPanel>

            <SourceList title="Fuentes oficiales de salud" sources={pageSources.salud} image={editorialImages.salud} />
          </aside>
        </div>
      </PortalShell>
    </>
  );
}
