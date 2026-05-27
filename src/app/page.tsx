// src/app/page.tsx
import React from 'react';
import { BuscadorPrincipal } from '@/components/common/buscador-principal';

const POPULAR_DEPARTMENTS = [
  { name: 'Lima', slug: 'lima', count: '142 trámites', color: 'from-cyan-500 to-teal-600' },
  { name: 'Arequipa', slug: 'arequipa', count: '94 trámites', color: 'from-teal-600 to-emerald-600' },
  { name: 'La Libertad', slug: 'trujillo', count: '87 trámites', color: 'from-emerald-600 to-green-600' },
  { name: 'Lambayeque', slug: 'chiclayo', count: '76 trámites', color: 'from-sky-500 to-blue-600' },
  { name: 'Piura', slug: 'piura', count: '81 trámites', color: 'from-blue-600 to-indigo-600' },
  { name: 'Cusco', slug: 'cusco', count: '89 trámites', color: 'from-indigo-600 to-purple-600' },
];

const POPULAR_TRAMITES = [
  { title: 'Duplicado de DNI', slug: 'dni-duplicado', cost: 'S/ 21.00', time: '1 día' },
  { title: 'Licencia de Conducir A1', slug: 'licencia-de-conducir', cost: 'S/ 24.50', time: '2 días' },
  { title: 'Antecedentes Penales', slug: 'antecedentes-penales', cost: 'S/ 52.80', time: '10 minutos' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Premium con Gradientes y Cristalografía (Glassmorphism) */}
      <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-slate-900 to-slate-950 -z-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider border border-primary/20">
            Plataforma Digital de Utilidad Pública para el Perú
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Trámites, Salud y Empleo en un <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Solo Lugar</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light mb-10">
            Encuentra requisitos actualizados de trámites TUPA, directorio de hospitales de MINSA y EsSalud, y convocatorias de trabajo en todas las regiones del país.
          </p>

          {/* Buscador de Trámites Autocomplete Integrado */}
          <BuscadorPrincipal />
        </div>
      </section>

      {/* Grid de Regiones - Punto de Entrada pSEO */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Buscar por Región o Ciudad</h2>
            <p className="text-slate-500 mt-2 text-sm">Selecciona una ciudad para ver los trámites, sedes locales y hospitales específicos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_DEPARTMENTS.map((dept) => (
            <a
              key={dept.slug}
              href={`/tramites/licencia-de-conducir/${dept.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    {dept.count}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-white font-bold text-sm shadow-xs`}>
                  →
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Tarjetas de Trámites Populares */}
      <section className="bg-slate-100 dark:bg-slate-900/40 py-16 border-t border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Guías de Trámites Más Consultadas
            </h2>
            <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
              Accede a guías oficiales optimizadas paso a paso para trámites habituales y costos asociados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_TRAMITES.map((t) => (
              <div
                key={t.slug}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                      Popular
                    </span>
                    <span className="text-xs font-bold text-emerald-500">{t.cost}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Requisitos detallados para personas naturales y jurídicas.
                  </p>
                </div>
                <a
                  href={`/tramites/${t.slug}/lima`}
                  className="mt-4 block w-full text-center bg-slate-50 hover:bg-primary hover:text-white border border-slate-100 hover:border-primary py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary"
                >
                  Ver Guía Completa
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
