import React from 'react';
import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/seo';
import { getHospitalesByCiudad, getCiudadWithDepartamento } from '@/modules/salud/services';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { Clock, Shield } from 'lucide-react';

export const revalidate = 86400; // ISR: Regenerar cada 24 horas

import { HospitalesList } from '@/components/salud/hospitales-list';

interface PageProps {
  params: Promise<{
    ciudad: string;
  }>;
}

// No pre-renderizar en build (las páginas se generan on-demand vía ISR)
// Evita fallos cuando la BD no está disponible durante `next build`
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { ciudad } = await params;
  const ciudadData = await getCiudadWithDepartamento(ciudad);

  if (!ciudadData) return {};

  return getMetadata({
    title: `Hospitales y Clínicas en ${ciudadData.name} - Teléfonos y Direcciones`,
    description: `Directorio completo y actualizado de centros de salud, hospitales y clínicas en ${ciudadData.name}. Encuentra números de emergencia, direcciones, horarios de atención 24h y aseguradoras (MINSA, ESSALUD).`,
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
      {/* 1. Datos Estructurados de Navegación */}
      <StructuredData type="Breadcrumb" data={breadcrumbs} />

      {/* 2. Datos Estructurados para cada Hospital en la Página */}
      {hospitales.map((h) => {
        const businessData = {
          subType: 'Hospital',
          name: h.nombre,
          telephone: h.telefono || 'No especificado',
          streetAddress: h.direccion,
          city: ciudadData.name,
          region: ciudadData.departamento.name,
          image: editorialImages.salud.src,
          url: `https://dataperu.pe/hospitales/${ciudad}`,
        };
        return <StructuredData key={h.id} type="LocalBusiness" data={businessData} />;
      })}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Breadcrumbs UI */}
          <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 flex items-center space-x-2 flex-wrap">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.url}>
                {i > 0 && <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>}
                <a href={b.url} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {b.name}
                </a>
              </React.Fragment>
            ))}
          </nav>

          {/* Hero Header */}
          <header className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-teal-800 to-cyan-900 text-white p-8 md:p-12 shadow-xl border border-teal-700/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-600/30 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-500/30 mb-4 backdrop-blur-sm">
                Perú Salud • Directorio Oficial
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
                Centros de Salud y Hospitales en {ciudadData.name}
              </h1>
              <p className="text-lg text-teal-100/90 leading-relaxed mb-6">
                Directorio completo de hospitales nacionales (MINSA y EsSalud), clínicas privadas y centros médicos de emergencia autorizados en la región de {ciudadData.name}. Datos verificados y actualizados.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-teal-200">
                <div className="flex items-center space-x-2 bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-700/30">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>Fuentes Oficiales SUSALUD</span>
                </div>
                <div className="flex items-center space-x-2 bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-700/30">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Urgencias 24 Horas</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Hospitals */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Mostrando {hospitales.length} centros de salud en {ciudadData.name}
                </span>
                <div className="text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping mr-1.5 inline-block" />
                  <span>Actualizado en tiempo real</span>
                </div>
              </div>

              <HospitalesList initialHospitales={hospitales} ciudadNombre={ciudadData.name} />

              {/* Informative block of the health system to avoid SEO thin content */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ¿Cómo funciona el Sistema de Salud en {ciudadData.name}?
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4 font-light">
                  <p>
                    En la región de <strong>{ciudadData.name}</strong>, el sistema de salud pública está principalmente dividido en dos subsistemas principales: el Seguro Integral de Salud (<strong>SIS</strong>) gestionado por el Ministerio de Salud (<strong>MINSA</strong>) y el Seguro Social de Salud (<strong>EsSalud</strong>) para trabajadores formales cotizantes.
                  </p>
                  <p>
                    Para emergencias extremas de salud, todos los hospitales con unidades de cuidados intensivos y choque de esta lista están en la obligación legal de atender a cualquier paciente en peligro de muerte inminente según la <strong>Ley de Emergencia Médica Nº 27604</strong> de la República del Perú, sin importar su tipo de afiliación o seguro.
                  </p>
                  <p>
                    Si no cuentas con seguro, revisa primero tu afiliación al SIS Gratuito y la cobertura vigente. Para orientación sanitaria, MINSA mantiene la Línea 113; ante síntomas compatibles con dengue y signos de alarma como dolor abdominal intenso, vómitos persistentes o sangrado, acude a un establecimiento de salud.
                  </p>
                  <p>
                    Para salud mental, inicia la atención en el establecimiento de salud más cercano. El personal puede evaluar el caso y derivar a un Centro de Salud Mental Comunitaria cuando sea necesario.
                  </p>
                </div>

                {/* Copyright disclaimer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-450 dark:text-slate-500 leading-relaxed font-light space-y-1">
                  <p>
                    <strong>Aviso de Copyright y Fuente de Datos:</strong>
                  </p>
                  <p>
                    Este directorio médico regional utiliza como referencia información de interés público recopilada de los portales de Datos Abiertos del Gobierno Peruano, el Ministerio de Salud (MINSA), la Superintendencia Nacional de Salud (SUSALUD) y Google Maps.
                  </p>
                  <p>
                    Los nombres de instituciones, marcas y logotipos de EsSalud, SIS, MINSA y clínicas particulares son propiedad registrada de sus respectivos dueños. Este portal recopila y organiza esta información únicamente con fines informativos y de orientación ciudadana, sin fines de suplantación ni atribución de derechos de propiedad intelectual.
                  </p>
                </div>
              </section>
            </div>

            {/* Sidebar with Lead Capture and Internal Linking */}
            <aside className="space-y-6">
              {/* Lead capture form for insurance consultations */}
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-teal-500/20">
                <h3 className="text-xl font-bold mb-2">Consulta Gratuita de Seguros</h3>
                <p className="text-sm text-teal-200/90 mb-4 leading-relaxed">
                  ¿Necesitas afiliarte al SIS, tramitar tu seguro de EsSalud o buscar un seguro privado local en {ciudadData.name}? Déjanos tus datos y un especialista te asesorará sin costo alguno.
                </p>

                <form action="/api/v1/leads" method="POST" className="space-y-4">
                  <input type="hidden" name="cityId" value={ciudadData.id} />
                  <input type="hidden" name="sectorId" value="sec-salud" />
                  <input type="hidden" name="consent" value="true" />
                  
                  <div>
                    <label className="block text-xs font-semibold text-teal-200 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-teal-800/60 focus:border-teal-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-200 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="juan@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-teal-800/60 focus:border-teal-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-200 mb-1">Número de Teléfono Celular</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="9[0-9]{8}"
                      placeholder="Ej. 912345678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-teal-800/60 focus:border-teal-400 focus:outline-none text-sm text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-teal-200 mb-1">Tu consulta o caso</label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Ej. Deseo saber si mi seguro EsSalud está activo..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-teal-800/60 focus:border-teal-400 focus:outline-none text-sm text-white transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-md text-center text-sm"
                  >
                    Enviar Solicitud
                  </button>
                </form>
              </div>

              {/* Internal Linking Widgets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                  <span className="w-2.5 h-2.5 bg-teal-500 rounded-full mr-2" />
                  Trámites en {ciudadData.name}
                </h3>
                <LinkAutomatico type="tramites" ciudadSlug={ciudadData.slug} />
              </div>
              <SourceList
                title="Fuentes oficiales de salud"
                sources={pageSources.salud}
                image={editorialImages.salud}
              />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
