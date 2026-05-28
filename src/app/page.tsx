// src/app/page.tsx
import React from 'react';
import { prisma } from '@/lib/db';
import { Post } from '@prisma/client';
import { BuscadorPrincipal } from '@/components/common/buscador-principal';
import { 
  FileText, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const revalidate = 3600; // ISR: Revalidar la página de inicio cada 1 hora para nuevas noticias

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

export default async function HomePage() {
  // Consultar las últimas 6 noticias publicadas desde Supabase PostgreSQL
  let posts: Post[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  } catch (error) {
    console.error('[HOMEPAGE_POSTS_ERROR] Fallo al recuperar noticias en inicio:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Hero Section Premium con Gradientes y Cristalografía (Glassmorphism) */}
      <section className="relative overflow-visible bg-slate-900 py-16 lg:py-24 text-white border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/35 via-slate-900 to-slate-950 -z-10" />
        <div className="absolute inset-0 bg-grid-white/[0.015] -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-[11px] font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider border border-primary/25 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Portal de Información Pública Regional del Perú
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Noticias, Trámites y Salud en un <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Solo Lugar</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-350 max-w-2xl mx-auto font-light mb-8">
            Mantente al día con las últimas noticias del acontecer nacional, guías del TUPA, directorios médicos del MINSA y EsSalud, y vacantes de empleo.
          </p>

          {/* Buscador de Trámites Autocomplete Integrado */}
          <BuscadorPrincipal />
        </div>
      </section>

      {/* SECCIÓN PRINCIPAL: ÚLTIMAS NOTICIAS (Ahora primero) */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <span className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest block mb-1">Guías y Actualidad</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Últimas Noticias y Artículos</h2>
          </div>
          {posts.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 md:mt-0 font-medium">
              Mostrando {posts.length} artículos del portal
            </span>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No hay artículos publicados</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
              Ingresa al panel de administración para redactar tu primera noticia y verla reflejada aquí al instante de forma segura.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Si hay al menos un post, mostramos el primero en formato destacado */}
            {posts.slice(0, 1).map((post) => (
              <article 
                key={post.id} 
                className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-xs hover:shadow-md transition-all group relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between"
              >
                {post.coverImage && (
                  <div className="w-full md:w-2/5 shrink-0 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-850 dark:border-slate-800 shadow-sm">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full min-h-[220px] object-cover aspect-video hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Destacado
                      </span>
                      <span className="text-xs text-slate-550 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(post.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight">
                      <a href={`/${post.slug}`}>{post.title}</a>
                    </h3>

                    {post.excerpt && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-light">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span>Por <strong className="text-slate-700 dark:text-slate-350">{post.author}</strong></span>
                    </div>

                    <a 
                      href={`/${post.slug}`} 
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 dark:bg-slate-850 px-5 text-xs font-bold text-white hover:bg-teal-600 dark:hover:bg-teal-600 transition-all gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      Leer Artículo Completo
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </article>
            ))}

            {/* Listado de los siguientes artículos en formato de tarjetas compactas */}
            {posts.slice(1).map((post) => (
              <article 
                key={post.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  {post.coverImage && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-850 dark:border-slate-800 shadow-xs h-44">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover aspect-video group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(post.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {post.author.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                      <a href={`/${post.slug}`}>{post.title}</a>
                    </h4>

                    {post.excerpt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <a 
                  href={`/${post.slug}`} 
                  className="mt-6 inline-flex h-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-teal-600 dark:bg-slate-850 dark:hover:bg-teal-600 text-slate-700 dark:text-slate-355 hover:text-white dark:hover:text-white border border-slate-150 hover:border-teal-600 dark:border-slate-800 py-2.5 text-xs font-bold transition-all gap-1 active:scale-95"
                >
                  Continuar leyendo
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN SECUNDARIA: REGIONES DE BÚSQUEDA */}
      <section className="bg-slate-100 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest block mb-1">Localización Geográfica</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Buscar Trámites por Región o Ciudad</h2>
              <p className="text-slate-500 mt-2 text-sm">Selecciona una ciudad para consultar sedes físicas, requisitos locales y centros médicos de atención.</p>
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
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      {dept.count}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform group-hover:translate-x-1`}>
                    →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN SECUNDARIA: TRÁMITES POPULARES */}
      <section className="bg-white dark:bg-slate-950 py-16 border-t border-slate-200 dark:border-slate-800 w-full">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center">
            <span className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest block mb-1">TUPA Nacional</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Guías de Trámites Más Consultadas
            </h2>
            <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">
              Accede a guías oficiales optimizadas con el paso a paso, tarifas vigentes y requisitos indispensables para tus gestiones públicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_TRAMITES.map((t) => (
              <div
                key={t.slug}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      Popular
                    </span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {t.cost}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mb-4 leading-relaxed">
                    Requisitos oficiales detallados y sedes físicas regionales de atención.
                  </p>
                </div>
                <a
                  href={`/tramites/${t.slug}/lima`}
                  className="mt-4 block w-full text-center bg-slate-50 hover:bg-teal-600 hover:text-white dark:bg-slate-850 dark:hover:bg-teal-600 border border-slate-200 dark:border-slate-800 hover:border-teal-600 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition-all active:scale-95"
                >
                  Ver Guía de Trámite
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
