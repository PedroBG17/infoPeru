import React from 'react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { Hospital, Heart, Shield, Clock } from 'lucide-react';
import { CiudadesList } from '@/components/salud/ciudades-list';

export const dynamic = 'force-dynamic'; // No pre-renderizar en build (requiere BD)

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorio de Hospitales y Clínicas en el Perú',
    description: 'Encuentra teléfonos de emergencia, direcciones y horarios de atención de clínicas, hospitales de EsSalud y MINSA organizados por ciudad en el Perú.',
    slug: '/hospitales',
  });
}

export default async function Page() {
  // Obtener todas las ciudades que tienen hospitales registrados
  const ciudadesConHospitales = await prisma.ciudad.findMany({
    where: {
      hospitales: {
        some: {},
      },
    },
    include: {
      departamento: true,
      hospitales: true,
    },
    orderBy: { name: 'asc' },
  });

  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Directorios', url: '/directorios' },
    { name: 'Salud y Hospitales', url: '/hospitales' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumbs */}
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
              Directorio Médico Regional
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
              Hospitales y Clínicas del Perú
            </h1>
            <p className="text-lg text-teal-100/90 leading-relaxed">
              Encuentra centros de atención médica organizados por provincia. Consulta teléfonos de emergencia, direcciones geolocalizadas y horarios de atención al paciente.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List of Cities */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center">
                <Hospital className="w-6 h-6 mr-2.5 text-teal-500" />
                Buscar Directorio de Salud por Ciudad
              </h2>
              
              <CiudadesList initialCiudades={ciudadesConHospitales} />
            </section>

            {/* Informative Content for Health Systems */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-850 dark:text-slate-100 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-teal-500" />
                Sistemas de Cobertura en el Perú
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-4 font-light">
                <p>
                  El sistema hospitalario en el Perú comprende prestadores públicos pertenecientes al Ministerio de Salud (<strong>MINSA</strong>) y al Seguro Social de Salud (<strong>EsSalud</strong>) que cubren a los trabajadores afiliados. También existen redes privadas de clínicas que atienden a usuarios particulares o a través de Entidades Prestadoras de Salud (EPS).
                </p>
                <p>
                  En caso de emergencias graves que pongan en peligro la vida, cualquier establecimiento de salud del país (incluyendo clínicas privadas) está obligado legalmente por la <strong>Ley de Emergencia N° 27604</strong> a brindar atención inmediata a cualquier paciente, sin condicionar la misma al pago de garantías económicas o la tenencia de un seguro activo.
                </p>
                <p>
                  Para usuarios sin seguro de salud, el SIS Gratuito puede cubrir consultas, medicamentos, análisis, hospitalización, traslados de emergencia y sepelio según evaluación y condiciones del asegurado. En casos de dengue, fiebre persistente, dolor abdominal intenso, vómitos repetidos o sangrado son señales para buscar atención inmediata.
                </p>
                <p>
                  La orientación en salud del Estado también se apoya en la Línea 113. Para salud mental, el MINSA informa atención por establecimientos de primer nivel y derivación a Centros de Salud Mental Comunitaria cuando corresponde.
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

          {/* Sidebar Info/Benefits */}
          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-teal-900 to-cyan-950 text-white p-6 rounded-3xl shadow-xl border border-teal-500/20 space-y-4">
              <h3 className="font-bold text-lg text-teal-200">Asistencia de Consultas</h3>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                ¿Tienes dudas sobre cómo afiliarte de forma gratuita al SIS o qué clínicas atienden con tu póliza de EsSalud? Ingresa a la ciudad correspondiente y ponte en contacto con nuestro equipo de asesoría local.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-teal-250 text-teal-100">
                  <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Datos oficiales verificados</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-teal-250 text-teal-100">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Atención continuada</span>
                </div>
              </div>
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
  );
}
