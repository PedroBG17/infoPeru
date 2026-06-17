import { notFound } from 'next/navigation';
import { Check, FileText, Landmark, MapPin, ShieldCheck } from 'lucide-react';
import { getMetadata } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { SimuladorExamen } from '@/modules/tramites/components/simulador-examen';
import { SourceList } from '@/components/common/source-list';
import { pageSources, procedureSources } from '@/lib/editorial-sources';
import {
  Badge,
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
    tramite: string;
    ciudad: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { tramite, ciudad } = await params;
  const tramiteData = await prisma.procedimiento.findUnique({
    where: { slug: tramite },
  });
  const ciudadData = await prisma.ciudad.findUnique({
    where: { slug: ciudad },
  });

  if (!tramiteData || !ciudadData) return {};

  return getMetadata({
    title: `${tramiteData.title} en ${ciudadData.name} - Requisitos y Sedes`,
    description: `Guia paso a paso para tramitar ${tramiteData.title} en ${ciudadData.name}. Conoce requisitos, costos TUPA, direcciones y horarios.`,
    slug: `/tramites/${tramite}/${ciudad}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { tramite, ciudad } = await params;

  const data = await prisma.procedimientoCiudad.findFirst({
    where: {
      procedimiento: { slug: tramite },
      ciudad: { slug: ciudad },
    },
    include: {
      procedimiento: true,
      ciudad: true,
      sedes: true,
    },
  });

  if (!data) notFound();

  const requisitos = data.procedimiento.requisitos || [];
  const pasos = (data.pasos as unknown as Array<{ titulo: string; descripcion: string }>) || [];
  const faqRaw = (data.faq as unknown as Array<{ question: string; answer: string }>) || [];

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Tramites', url: '/tramites' },
    { name: data.procedimiento.title, url: `/tramites/${data.procedimiento.slug}` },
    { name: data.ciudad.name, url: `/tramites/${data.procedimiento.slug}/${data.ciudad.slug}` },
  ];
  const sources = procedureSources[data.procedimiento.slug] ?? pageSources.tramites;

  return (
    <>
      <StructuredData type="Breadcrumb" data={breadcrumbs} />
      {faqRaw.length > 0 && <StructuredData type="FAQ" data={faqRaw} />}

      <PortalShell>
        <Breadcrumbs items={breadcrumbs} />

        <EditorialHero
          eyebrow={`Tramites en ${data.ciudad.name}`}
          title={`Como tramitar ${data.procedimiento.title} en ${data.ciudad.name}`}
          description={data.procedimiento.description}
          icon={Landmark}
          stats={[
            { label: 'Costo', value: `S/ ${data.costo.toFixed(2)}` },
            { label: 'Sedes', value: data.sedes.length },
            { label: 'Pasos', value: pasos.length || 'Info' },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <EditorialPanel>
              <SectionHeader title="Requisitos obligatorios" icon={FileText} />
              {requisitos.length > 0 ? (
                <ul className="space-y-3">
                  {requisitos.map((req, index) => (
                    <li key={`${req}-${index}`} className="flex gap-3 text-sm leading-6 text-[#6B7280]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#C8102E] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-[#6B7280]">No se requieren requisitos previos complejos.</p>
              )}
            </EditorialPanel>

            <section>
              <SectionHeader title="Guia paso a paso" description={`Orden recomendado para completar el tramite en ${data.ciudad.name}.`} />
              <div className="space-y-4">
                {pasos.length > 0 ? (
                  pasos.map((step, index) => (
                    <article key={`${step.titulo}-${index}`} className="flex gap-4 border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#C8102E] font-heading text-lg font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-[#1A1A2E]">{step.titulo}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{step.descripcion}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <EditorialPanel>
                    <p className="text-sm leading-6 text-[#6B7280]">
                      Consulta directamente en las oficinas locales descritas o en el portal oficial correspondiente.
                    </p>
                  </EditorialPanel>
                )}
              </div>
            </section>

            <EditorialPanel>
              <SectionHeader title="Verificacion antes de pagar" icon={ShieldCheck} />
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  'Confirma el codigo o concepto de pago en el portal oficial.',
                  `Revisa si la cita es obligatoria para la sede de ${data.ciudad.name}.`,
                  'Conserva constancias y numero de solicitud hasta finalizar el tramite.',
                ].map((item) => (
                  <div key={item} className="border border-[#E8E4DE] bg-[#F8F5F0] p-4 text-sm leading-6 text-[#6B7280]">
                    {item}
                  </div>
                ))}
              </div>
            </EditorialPanel>

            {data.procedimiento.slug === 'licencia-de-conducir' && (
              <EditorialPanel>
                <SectionHeader title="Simulador de examen de reglas MTC" />
                <p className="mb-5 text-sm leading-6 text-[#6B7280]">
                  Practica antes de rendir el examen oficial en {data.ciudad.name}.
                </p>
                <SimuladorExamen />
              </EditorialPanel>
            )}

            <EditorialPanel>
              <SectionHeader title={`Otros tramites utiles en ${data.ciudad.name}`} />
              <LinkAutomatico type="tramites" ciudadSlug={data.ciudad.slug} excludeSlug={data.procedimiento.slug} />
            </EditorialPanel>
          </div>

          <aside className="space-y-6">
            <EditorialPanel>
              <SectionHeader title="Costos y oficinas" icon={MapPin} />
              <div className="mb-5 border border-[#E8E4DE] bg-[#F8F5F0] p-4">
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                  Costo segun TUPA
                </span>
                <span className="mt-1 block font-heading text-4xl font-black text-[#C8102E]">
                  S/ {data.costo.toFixed(2)}
                </span>
              </div>

              <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1A2E]">
                Sedes fisicas en {data.ciudad.name}
              </h3>
              <div className="space-y-4">
                {data.sedes.length > 0 ? (
                  data.sedes.map((sede) => (
                    <div key={sede.id} className="border-t border-[#E8E4DE] pt-4 first:border-t-0 first:pt-0">
                      <h4 className="font-heading text-lg font-bold text-[#1A1A2E]">{sede.nombre}</h4>
                      <p className="mt-1 text-xs leading-5 text-[#6B7280]">{sede.direccion}</p>
                      <Badge>{sede.horario}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-6 text-[#6B7280]">
                    No hay sedes presenciales especificadas. Este tramite puede ser mayoritariamente virtual.
                  </p>
                )}
              </div>
            </EditorialPanel>

            <TrustPanel
              title="Atencion antes de iniciar"
              description="La entidad oficial puede cambiar plazos, horarios o disponibilidad. Confirma antes de trasladarte."
              items={['Revisa fuente oficial.', 'No pagues a intermediarios.', 'Guarda constancias.']}
            />

            <SourceList title="Fuente oficial consultada" sources={sources} />
          </aside>
        </div>
      </PortalShell>
    </>
  );
}
