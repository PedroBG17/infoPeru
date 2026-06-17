import { notFound } from 'next/navigation';
import { ArrowRight, Briefcase, Building, Calendar, DollarSign, MapPin, UserPlus } from 'lucide-react';
import { getMetadata } from '@/lib/seo';
import { getCiudadBySlug, getJobsByCiudad, SECTORES } from '@/modules/empleo/services';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
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
    ciudad: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadBySlug(ciudad);

  if (!ciudadData) return {};

  return getMetadata({
    title: `Bolsa de Trabajo en ${ciudadData.name} - Empleos Disponibles`,
    description: `Encuentra ofertas de trabajo y vacantes en ${ciudadData.name}. Postula a puestos en administracion, mineria, comercio, salud e ingenieria.`,
    slug: `/trabajos/${ciudad}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadBySlug(ciudad);

  if (!ciudadData) notFound();

  const trabajos = await getJobsByCiudad(ciudad);

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Directorios', url: '/directorios' },
    { name: 'Empleo', url: '/trabajos' },
    { name: ciudadData.name, url: `/trabajos/${ciudad}` },
  ];

  return (
    <>
      <StructuredData type="Breadcrumb" data={breadcrumbs} />

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
          datePosted: new Date(Date.now() - job.postedDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          salaryText: job.salaryRange.includes('S/') ? job.salaryRange.match(/\d+,\d+|\d+/)?.[0]?.replace(',', '') : undefined,
        };
        return <StructuredData key={job.id} type="JobPosting" data={jobData} />;
      })}

      <PortalShell maxWidth="7xl">
        <Breadcrumbs items={breadcrumbs} />

        <EditorialHero
          eyebrow="Bolsa de empleo regional"
          title={`Ofertas de trabajo en ${ciudadData.name}`}
          description={`Convocatorias disponibles en ${ciudadData.name}, registro de postulantes y alertas para evitar cobros indebidos durante procesos de seleccion.`}
          icon={Briefcase}
          stats={[
            { label: 'Vacantes', value: trabajos.length },
            { label: 'Region', value: ciudadData.departamento.name },
            { label: 'Sectores', value: SECTORES.length },
          ]}
          action={{ href: '#postular-form', label: 'Registrar CV' }}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <EditorialPanel>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#1A1A2E]">
                    {trabajos.length} convocatorias vigentes en {ciudadData.name}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Revisa sector, empresa, requisitos y rango salarial antes de postular.
                  </p>
                </div>
                <Badge>Convocatoria abierta</Badge>
              </div>
            </EditorialPanel>

            <div className="space-y-4">
              {trabajos.map((job) => (
                <article
                  key={job.id}
                  className="group border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge>{job.sector}</Badge>
                        <span className="border border-[#E8E4DE] bg-[#F8F5F0] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6B7280]">
                          <Calendar className="h-3.5 w-3.5" />
                          Hace {job.postedDaysAgo} {job.postedDaysAgo === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl font-bold leading-tight text-[#1A1A2E] transition group-hover:text-[#C8102E]">
                        {job.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-[#C8102E]" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#C8102E]" />
                          {ciudadData.name}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-[#6B7280]">{job.description}</p>

                      <div className="mt-4">
                        <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1A2E]">
                          Requisitos
                        </h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6B7280]">
                          {job.requirements.map((req, index) => (
                            <li key={`${req}-${index}`}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 md:w-[180px]">
                      <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                        <DollarSign className="h-4 w-4" />
                        {job.salaryRange}
                      </div>
                      <a
                        href="#postular-form"
                        className="inline-flex items-center justify-center gap-2 bg-[#C8102E] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9B0B22]"
                      >
                        Postular
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <EditorialPanel>
              <SectionHeader title={`Bolsa de empleo en ${ciudadData.name}`} />
              <div className="space-y-4 text-sm leading-7 text-[#6B7280]">
                <p>
                  La empleabilidad local depende de sectores activos, experiencia verificable y documentacion
                  ordenada. Mantener tu CV actualizado mejora la evaluacion inicial.
                </p>
                <p>
                  Todos los procesos de seleccion deben ser gratuitos para el postulante. Evita pagos por evaluaciones,
                  capacitaciones de ingreso o tramites administrativos.
                </p>
              </div>
            </EditorialPanel>
          </div>

          <aside className="space-y-6">
            <EditorialPanel className="scroll-mt-24" id="postular-form">
              <div className="mb-5 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#C8102E]" />
                <h2 className="font-heading text-xl font-bold text-[#1A1A2E]">Registro de postulante</h2>
              </div>
              <p className="mb-5 text-sm leading-6 text-[#6B7280]">
                Registra tu perfil para futuras vacantes en {ciudadData.name}.
              </p>

              <form action="/api/v1/leads" method="POST" className="space-y-4">
                <input type="hidden" name="cityId" value={ciudadData.id} />
                <input type="hidden" name="consent" value="true" />

                <Field label="Nombre completo" name="name" placeholder="Nombre y apellido" required />
                <Field label="Correo electronico" name="email" type="email" placeholder="correo@dominio.com" required />
                <Field label="Numero celular" name="phone" type="tel" placeholder="987654321" pattern="9[0-9]{8}" required />

                <label className="block">
                  <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    Sector de interes
                  </span>
                  <select
                    name="sectorId"
                    required
                    className="w-full border border-[#E8E4DE] bg-[#F8F5F0] px-3 py-3 text-sm text-[#1A1A2E] outline-none transition focus:border-[#C8102E] focus:bg-white"
                  >
                    <option value="">Selecciona tu rubro</option>
                    {SECTORES.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    Resumen profesional
                  </span>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Experiencia, oficio o disponibilidad"
                    className="w-full resize-none border border-[#E8E4DE] bg-[#F8F5F0] px-3 py-3 text-sm text-[#1A1A2E] outline-none transition placeholder:text-[#6B7280]/70 focus:border-[#C8102E] focus:bg-white"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full bg-[#C8102E] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#9B0B22]"
                >
                  Registrar CV
                </button>
              </form>
            </EditorialPanel>

            <TrustPanel
              title="Postula con seguridad"
              description="No pagues por postulaciones, evaluaciones ni capacitaciones de ingreso."
              items={['Verifica la empresa.', 'Conserva comunicaciones.', 'No compartas claves ni datos bancarios.']}
            />

            <EditorialPanel>
              <SectionHeader title={`Tramites en ${ciudadData.name}`} />
              <LinkAutomatico type="tramites" ciudadSlug={ciudadData.slug} />
            </EditorialPanel>

            <SourceList title="Fuentes oficiales de empleo" sources={pageSources.empleo} image={editorialImages.empleo} />
          </aside>
        </div>
      </PortalShell>
    </>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  pattern,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  pattern?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        pattern={pattern}
        placeholder={placeholder}
        className="w-full border border-[#E8E4DE] bg-[#F8F5F0] px-3 py-3 text-sm text-[#1A1A2E] outline-none transition placeholder:text-[#6B7280]/70 focus:border-[#C8102E] focus:bg-white"
      />
    </label>
  );
}
