// src/app/(public)/tramites/[tramite]/[ciudad]/page.tsx
import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { SimuladorExamen } from '@/modules/tramites/components/simulador-examen';



export const revalidate = 86400; // ISR: Regenerar cada 24 horas

interface PageProps {
  params: Promise<{
    tramite: string;
    ciudad: string;
  }>;
}

// Pre-compilación estática de combinaciones de alto volumen
export async function generateStaticParams() {
  const topCiudades = ['lima', 'arequipa', 'trujillo', 'chiclayo', 'piura'];
  const topTramites = ['licencia-de-conducir', 'dni-duplicado', 'antecedentes-penales'];

  const paths = [];
  for (const t of topTramites) {
    for (const c of topCiudades) {
      paths.push({ tramite: t, ciudad: c });
    }
  }
  return paths;
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
    description: `Guía paso a paso para tramitar ${tramiteData.title} en ${ciudadData.name}. Conoce los requisitos oficiales, costos (TUPA), direcciones de sedes y horarios de atención actualizados.`,
    slug: `/tramites/${tramite}/${ciudad}`,
  });
}

export default async function Page({ params }: PageProps) {
  const { tramite, ciudad } = await params;

  // Cargar datos consolidados de la base de datos relacional
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

  // Mapear arrays seguros para el renderizado
  const requisitos = data.procedimiento.requisitos || [];
  
  // Tipar dinámicamente campos JSON guardados en Postgres
  const pasos = (data.pasos as unknown as Array<{ titulo: string; descripcion: string }>) || [];
  const faqRaw = (data.faq as unknown as Array<{ question: string; answer: string }>) || [];

  const breadcrumbs = [
    { name: 'Inicio', url: 'https://dataperu.pe' },
    { name: 'Trámites', url: 'https://dataperu.pe/tramites' },
    { name: data.procedimiento.title, url: `https://dataperu.pe/tramites/${data.procedimiento.slug}` },
    { name: data.ciudad.name, url: `https://dataperu.pe/tramites/${data.procedimiento.slug}/${data.ciudad.slug}` },
  ];

  return (
    <>
      <StructuredData type="Breadcrumb" data={breadcrumbs} />
      {faqRaw.length > 0 && <StructuredData type="FAQ" data={faqRaw} />}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb Visual */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((b, i) => (
            <span key={b.url} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-400">/</span>}
              <a href={b.url} className="hover:text-primary transition-colors">
                {b.name}
              </a>
            </span>
          ))}
        </nav>

        {/* Hero Section */}
        <header className="mb-8">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3, py-1 rounded-full mb-3">
            Trámites en {data.ciudad.name}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Cómo tramitar {data.procedimiento.title} en {data.ciudad.name}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl">
            {data.procedimiento.description}
          </p>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Requisitos obligatorios</h2>
              {requisitos.length > 0 ? (
                <ul className="space-y-3">
                  {requisitos.map((req, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300">
                      <span className="text-primary font-bold">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No se requieren requisitos previos complejos.</p>
              )}
            </section>

            {/* Pasos de Tramitación */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Guía paso a paso</h2>
              <div className="space-y-4">
                {pasos.length > 0 ? (
                  pasos.map((p, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex gap-4 shadow-xs">
                      <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.titulo}</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{p.descripcion}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Consulte directamente en las oficinas locales descritas en la columna lateral.</p>
                )}
              </div>
            </section>

            {/* Simulador Interactivo Exclusivo para Licencia de Conducir (Brevete) */}
            {data.procedimiento.slug === 'licencia-de-conducir' && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Simulador de Examen de Reglas MTC</h2>
                <p className="text-slate-500 text-sm">
                  Pon a prueba tus conocimientos sobre la normativa de tránsito peruana antes de rendir el examen oficial del Touring en {data.ciudad.name}.
                </p>
                <SimuladorExamen />
              </section>
            )}

            {/* Enlazado Interno Inteligente */}
            <section className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Otros trámites útiles en {data.ciudad.name}</h3>
              {/* @ts-ignore */}
              <LinkAutomatico type="tramites" ciudadSlug={data.ciudad.slug} excludeSlug={data.procedimiento.slug} />
            </section>
          </div>

          {/* Sidebar / Sedes de Atención */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Costos y Oficinas</h3>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                <span className="text-xs text-slate-500 block">Costo según el TUPA regional:</span>
                <span className="text-3xl font-extrabold text-primary">S/ {data.costo.toFixed(2)}</span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Sedes Físicas en {data.ciudad.name}
              </h4>
              <div className="space-y-4">
                {data.sedes.length > 0 ? (
                  data.sedes.map((s) => (
                    <div key={s.id} className="border-t border-slate-100 dark:border-slate-800 pt-4 first:border-t-0 first:pt-0">
                      <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{s.nombre}</h5>
                      <p className="text-xs text-slate-500 mt-1">{s.direccion}</p>
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded mt-2">
                        {s.horario}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No hay sedes presenciales especificadas. Este trámite se realiza mayoritariamente de manera virtual.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
