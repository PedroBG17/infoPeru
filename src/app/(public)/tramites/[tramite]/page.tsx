import { notFound } from 'next/navigation';
import { Check, FileText, MapPin, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { pageSources, procedureSources } from '@/lib/editorial-sources';
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

interface PageProps {
  params: Promise<{
    tramite: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const tramites = await prisma.procedimiento.findMany({
      select: { slug: true },
    });
    return tramites.map((tramite) => ({ tramite: tramite.slug }));
  } catch (error) {
    console.warn('[generateStaticParams] DB no disponible en build-time, fallback a ISR dinamico:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { tramite } = await params;
  const tramiteData = await prisma.procedimiento.findUnique({
    where: { slug: tramite },
  });

  if (!tramiteData) return {};

  return getMetadata({
    title: `${tramiteData.title} en el Peru - Requisitos y Sedes por Ciudad`,
    description: `Conoce requisitos, costos de tasa oficial y pasos para tramitar ${tramiteData.title}. Selecciona tu ciudad para ver sedes locales.`,
    slug: `/tramites/${tramite}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { tramite } = await params;

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

  const sources = procedureSources[tramiteData.slug] ?? pageSources.tramites;

  return (
    <PortalShell maxWidth="5xl">
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Tramites', url: '/tramites' },
          { name: tramiteData.title, url: `/tramites/${tramite}` },
        ]}
      />

      <EditorialHero
        eyebrow="Guia de tramite"
        title={`Tramite de ${tramiteData.title}`}
        description={tramiteData.description}
        icon={FileText}
        stats={[
          { label: 'Ciudades', value: tramiteData.ciudadesRel.length },
          { label: 'Requisitos', value: tramiteData.requisitos.length },
          { label: 'Fuentes', value: sources.length },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <EditorialPanel>
            <SectionHeader title="Requisitos generales" icon={FileText} />
            <ul className="space-y-3">
              {tramiteData.requisitos.map((req, index) => (
                <li key={`${req}-${index}`} className="flex gap-3 text-sm leading-6 text-[#6B7280]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#C8102E] text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Antes de iniciar este tramite" icon={ShieldCheck} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-[#E8E4DE] bg-[#F8F5F0] p-4 text-sm leading-6 text-[#6B7280]">
                Revisa si el pago se hace con codigo de tasa, plataforma oficial o entidad bancaria autorizada.
              </div>
              <div className="border border-[#E8E4DE] bg-[#F8F5F0] p-4 text-sm leading-6 text-[#6B7280]">
                Guarda constancia de pago, cita y numero de solicitud para consultar estado o recoger documentos.
              </div>
            </div>
          </EditorialPanel>
        </div>

        <aside className="space-y-6">
          <EditorialPanel>
            <SectionHeader title="Sedes y horarios por ciudad" icon={MapPin} />
            <p className="mb-4 text-xs leading-6 text-[#6B7280]">
              Selecciona una ciudad para consultar costos, sedes y pasos especificos.
            </p>
            <div className="space-y-2">
              {tramiteData.ciudadesRel.map((rel) => (
                <LinkCard
                  key={rel.ciudad.id}
                  href={`/tramites/${tramite}/${rel.ciudad.slug}`}
                  title={rel.ciudad.name}
                  description={`Tasa oficial: S/ ${rel.costo.toFixed(2)}`}
                  meta={rel.ciudad.departamento.name}
                  icon={MapPin}
                />
              ))}
            </div>
          </EditorialPanel>

          <TrustPanel
            title="Gestion sin intermediarios"
            description="Verifica los datos oficiales antes de pagar o acudir a una sede."
            items={['Revisa requisitos.', 'Confirma tasa oficial.', 'Guarda constancias.']}
          />

          <SourceList title="Fuente principal del tramite" sources={sources} />
        </aside>
      </div>
    </PortalShell>
  );
}
