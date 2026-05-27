import React from 'react';
import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/seo';
import { getHospitalesByCiudad, getCiudadWithDepartamento } from '@/modules/salud/services';
import { StructuredData } from '@/components/common/structured-data';
import { LinkAutomatico } from '@/components/common/link-automatico';
import { prisma } from '@/lib/db';
import { Phone, MapPin, Clock, Hospital as HospitalIcon, Shield, Search } from 'lucide-react';

export const revalidate = 86400; // ISR: Regenerar cada 24 horas

interface PageProps {
  params: Promise<{
    ciudad: string;
  }>;
}

// Pre-compilar las top ciudades en el build para maximizar LCP
export async function generateStaticParams() {
  const topCiudades = ['lima', 'arequipa', 'trujillo'];
  return topCiudades.map((c) => ({ ciudad: c }));
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
    { name: 'Inicio', url: 'https://dataperu.pe' },
    { name: 'Directorios', url: 'https://dataperu.pe/directorios' },
    { name: 'Salud', url: 'https://dataperu.pe/hospitales' },
    { name: ciudadData.name, url: `https://dataperu.pe/hospitales/${ciudad}` },
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
          image: 'https://images.unsplash.com/photo-1586773860418-d3b3de97e663?auto=format&fit=crop&q=80&w=800',
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

              {hospitales.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
                  <HospitalIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">No se encontraron centros de salud</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Actualmente estamos ampliando nuestro catálogo para esta región.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {hospitales.map((h) => {
                    const isEsSalud = h.tipo.toUpperCase() === 'ESSALUD';
                    const isMinsa = h.tipo.toUpperCase() === 'MINSA';
                    
                    return (
                      <article
                        key={h.id}
                        className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isEsSalud
                                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/30'
                                    : isMinsa
                                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/30'
                                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/30'
                                }`}
                              >
                                {h.tipo}
                              </span>
                              {h.horario24h && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/20">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Atención 24h Emergency
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {h.nombre}
                            </h3>

                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                <span>{h.direccion}</span>
                              </div>
                              {h.telefono && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{h.telefono}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                            {h.telefono && (
                              <a
                                href={`tel:${h.telefono.replace(/\s+/g, '')}`}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-sm transition-all text-center"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Llamar de Emergencia
                              </a>
                            )}
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(h.nombre + ' ' + h.direccion)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all text-center"
                            >
                              <MapPin className="w-4 h-4 mr-2" />
                              Ver Mapa de Ruta
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Informative block of the health system to avoid SEO thin content */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ¿Cómo funciona el Sistema de Salud en {ciudadData.name}?
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4">
                  <p>
                    En la región de <strong>{ciudadData.name}</strong>, el sistema de salud pública está principalmente dividido en dos subsistemas principales: el Seguro Integral de Salud (<strong>SIS</strong>) gestionado por el Ministerio de Salud (<strong>MINSA</strong>) y el Seguro Social de Salud (<strong>EsSalud</strong>) para trabajadores formales cotizantes.
                  </p>
                  <p>
                    Para emergencias extremas de salud, todos los hospitales con unidades de cuidados intensivos y choque de esta lista están en la obligación legal de atender a cualquier paciente en peligro de muerte inminente según la <strong>Ley de Emergencia Médica Nº 27604</strong> de la República del Perú, sin importar su tipo de afiliación o seguro.
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
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
