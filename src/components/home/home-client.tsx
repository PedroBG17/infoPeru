// src/components/home/home-client.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { BuscadorPrincipal } from '@/components/common/buscador-principal';
import type { SiteHomeSettings } from '@/types/site-settings';
import Link from 'next/link';

interface PostItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  excerpt?: string;
  author: string;
  timeText: string;
  readTime?: string;
  coverImage?: string | null;
  slug: string;
  headerBg?: string;
  icon?: React.ReactNode;
}

interface HomeClientProps {
  newsList: PostItem[];
  tramitesList: Array<{ title: string; desc: string; icon: React.ReactNode; href: string }>;
  saludList: Array<{ title: string; desc: string; icon: React.ReactNode }>;
  homeContent: SiteHomeSettings;
}

export function HomeClient({ newsList, tramitesList, saludList, homeContent }: HomeClientProps) {
  // Elements references for GSAP
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const tramiteSectionRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  // Pagination state for news
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  
  // Exclude the featured post (index 0) from the paginated list if needed,
  // or just paginate all news. Let's paginate newsList starting from index 1 (secondary news)
  const secondaryNews = newsList.slice(1);
  const currentPosts = secondaryNews.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(secondaryNews.length / postsPerPage);

  const featuredNews = newsList[0];
  const getNewsHref = (news: PostItem) => news.id.startsWith('mock-') ? '/noticias' : `/${news.slug}`;

  // GSAP Animations on mount
  useEffect(() => {
    // Hero Animations
    const ctx = gsap.context(() => {
      // Fade in hero elements with fromTo to prevent React StrictMode opacity glitches
      gsap.fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.hero-title-part', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power4.out', delay: 0.2 });
      gsap.fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
      gsap.fromTo('.hero-cta', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 });
      
      // Right search panel animation
      gsap.fromTo('.search-card', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.75)', delay: 0.4 });
      gsap.fromTo('.map-outline', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out', delay: 0.6 });
      
      // Stagger entrance animation for carousel cards (CSS marquee handles continuous movement)
      gsap.fromTo('.carousel-card', 
        { opacity: 0, y: 40, scale: 0.95 }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          stagger: 0.05, 
          duration: 0.7, 
          ease: 'power3.out', 
          delay: 0.8,
          clearProps: 'all'
        }
      );
    });

    return () => ctx.revert();
  }, []);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to news section
    if (newsRef.current) {
      newsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full">
      {/* SECCIÓN 1: HERO EDITORIAL PREMIUM (Estilo exacto de la captura) */}
      <section className="relative bg-[#0B1528] text-white pt-12 pb-24 md:py-20 lg:py-28 overflow-visible border-b border-slate-900">
        
        {/* Glowing Grid Background & Radial Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.08),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Lado Izquierdo (Textos y CTAs) */}
          <div ref={heroLeftRef} className="lg:col-span-7 space-y-6 md:space-y-8">
            <span className="hero-badge inline-flex items-center gap-1.5 bg-teal-500/10 text-teal-400 text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-teal-500/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {homeContent.eyebrow}
            </span>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08] max-w-2xl">
              <div className="hero-title-part text-white">{homeContent.titleLine1}</div>
              {' '}
              <div className="hero-title-part text-white">{homeContent.titleLine2}</div>
              {' '}
              <div className="hero-title-part font-serif italic text-teal-400 uppercase tracking-wide bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(45,212,191,0.45)] mt-1.5">
                {homeContent.accent}
              </div>
            </h1>
            
            <p className="hero-desc max-w-xl text-slate-350 text-sm sm:text-base font-light leading-relaxed">
              {homeContent.description}
            </p>

            {/* Botones de acción directos */}
            <div className="hero-cta flex flex-wrap items-center gap-5 pt-3">
              <Link 
                href={homeContent.primaryCtaHref} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-550 shadow-lg text-white font-extrabold text-[11px] px-6 py-3.5 rounded-xl transition duration-200 uppercase tracking-widest active:scale-98 shadow-teal-900/20"
              >
                {homeContent.primaryCtaLabel}
              </Link>
              <Link 
                href={homeContent.secondaryCtaHref} 
                className="text-xs font-bold text-slate-200 hover:text-teal-400 flex items-center gap-1 transition-colors duration-200 group"
              >
                {homeContent.secondaryCtaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Lado Derecho (Buscador y Mapa de Perú) */}
          <div ref={heroRightRef} className="lg:col-span-5 relative">
            {/* Mapa de Perú con estilo Glowing Line (Outline vectorizado interactivo) */}
            <div className="map-outline absolute -top-16 -right-16 w-80 h-96 opacity-25 pointer-events-none z-0 hidden lg:block">
              <svg className="w-full h-full text-teal-500 filter drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                {/* Delineado abstracto de la costa, sierra y selva de Perú */}
                <path d="M45,20 C42,22 40,25 38,28 C37,30 35,32 34,34 C33,36 34,38 35,39 C36,41 38,42 39,44 C41,46 42,48 43,50 C44,52 46,55 48,57 C50,59 52,61 54,63 C55,64 56,66 57,67 C58,68 59,70 60,72 C61,74 62,76 63,78 C64,80 65,82 67,84 C68,85 70,86 71,87 L72,88 L70,87 C68,85 66,83 65,80 C64,78 62,75 61,72 C60,70 59,68 58,66 C57,64 56,62 55,60 C54,58 53,56 52,54 C51,52 50,50 49,48 C48,46 47,44 46,42 C45,40 44,38 45,36 C46,34 47,32 48,30 C49,28 50,26 51,24 Z" strokeLinejoin="round" />
                <circle cx="45" cy="22" r="1.5" fill="currentColor" />
                <circle cx="34" cy="34" r="1" fill="currentColor" />
                <circle cx="43" cy="50" r="1.5" fill="currentColor" />
                <circle cx="57" cy="67" r="1" fill="currentColor" />
                <circle cx="67" cy="84" r="2" fill="currentColor" />
              </svg>
            </div>

            {/* Caja de Búsqueda Autocomplete */}
            <div className="search-card bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative z-10 space-y-6">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-400" />
                Consulta rápida y actualizada
              </h3>
              
              <BuscadorPrincipal />

              {/* Badges de Confianza bajo el buscador */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                {homeContent.trustBadges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1">
                    <CheckCircle2 className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                    <span className="text-[9px] text-slate-450 font-bold tracking-tight leading-tight">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN 2: CAROUSEL DE TRÁMITES (Marquee infinito premium) */}
      <section ref={tramiteSectionRef} className="bg-slate-50 dark:bg-slate-950 py-16 transition-colors duration-300 w-full border-b border-slate-200/50 dark:border-slate-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-teal-600 dark:text-teal-400 text-[10px] font-extrabold uppercase tracking-widest block">
                TUPA NACIONAL
              </span>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Guías de Trámites Rápidos
              </h2>
            </div>
            
            <Link 
              href="/tramites"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 flex items-center gap-1.5 group/all uppercase tracking-widest transition-colors"
            >
              Ver Todos
              <ArrowRight className="w-3.5 h-3.5 group-hover/all:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Marquee Container con gradient fades laterales */}
        <div className="relative mt-8">
          <div className="marquee-fade-left" />
          <div className="marquee-fade-right" />
          
          <div className="marquee-track">
            {[...tramitesList, ...tramitesList].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="carousel-card shrink-0 w-[280px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 dark:hover:border-teal-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/8 transition-all duration-300 flex flex-col justify-between group/card cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/10 shadow-xs group-hover/card:scale-110 group-hover/card:bg-teal-500/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light line-clamp-3">
                    {item.desc}
                  </p>
                </div>
                <span className="mt-6 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 flex items-center gap-1.5 group/link">
                  Ver Requisitos 
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: NOTICIAS RECIENTES GRID CON PAGINACIÓN PREMIUM */}
      <section ref={newsRef} className="max-w-6xl mx-auto px-4 py-16 sm:py-24 w-full space-y-12 bg-background">
        
        {/* Cabecera de Sección */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-1">
            <span className="text-teal-600 dark:text-teal-400 text-xs font-extrabold uppercase tracking-widest block flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Guías y Actualidad
            </span>
            <h2 className="font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Últimas Noticias y Artículos
            </h2>
          </div>
          <Link 
            href="/noticias" 
            className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors"
          >
            Ver Todas las Noticias →
          </Link>
        </div>

        {/* Grid de Noticias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Tarjeta Destacada de la Izquierda (Ocupa 7 de 12 columnas) */}
          <div className="lg:col-span-7">
            <article className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-350 flex flex-col h-full group relative">
              
              {/* Encabezado o Imagen (Estilo Azul/Icono de Captura) */}
              <div className={`relative w-full aspect-[16/9.5] flex items-center justify-center text-white ${featuredNews.headerBg || 'bg-[#1E5F9E]'} overflow-hidden`}>
                {featuredNews.coverImage ? (
                  <img 
                    src={featuredNews.coverImage} 
                    alt={featuredNews.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                    {featuredNews.icon}
                  </div>
                )}
              </div>

              {/* Cuerpo del Artículo */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {featuredNews.category}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">
                      • {featuredNews.timeText}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                    <Link href={getNewsHref(featuredNews)}>{featuredNews.title}</Link>
                  </h3>

                  {featuredNews.excerpt && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light line-clamp-3">
                      {featuredNews.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      R
                    </div>
                    <span className="font-semibold text-slate-650 dark:text-slate-350">{featuredNews.author}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                    {featuredNews.readTime || '3 min lectura'}
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* Tarjetas Secundarias de la Derecha con Paginación Activa (Ocupa 5 de 12 columnas) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              {currentPosts.map((news) => (
                <article 
                  key={news.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex items-stretch group"
                >
                  {/* Imagen o Cabecera Pequeña de Color */}
                  <div className={`w-24 shrink-0 flex items-center justify-center text-white ${news.headerBg} relative overflow-hidden`}>
                    {news.coverImage ? (
                      <img 
                        src={news.coverImage} 
                        alt={news.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      news.icon
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-5 flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border ${news.categoryColor || 'bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-450 dark:border-slate-800'}`}>
                        {news.category}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {news.timeText}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={getNewsHref(news)}>{news.title}</Link>
                    </h4>
                  </div>
                </article>
              ))}
            </div>

            {/* Paginación Premium y Optimizada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/60 w-full">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-teal-500/10 hover:border-teal-500/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isSelected = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-teal-500/10 hover:border-teal-500/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-colors"
                  aria-label="Siguiente página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* SECCIÓN 4: BANDA DE BÚSQUEDA ESPECIAL CON GRADIENTE TEAL/DARK */}
      <section className="bg-gradient-to-r from-slate-900 via-[#0B1528] to-slate-900 border-t border-b border-slate-850 py-16 w-full text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/25 px-3.5 py-1 rounded">
            🔎 Buscador Inteligente
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
            ¿Qué trámite necesitas realizar hoy?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-light">
            Escribe el nombre del trámite y te guiaremos en cada paso de manera gratuita.
          </p>

          {/* Caja de Autocomplete Principal */}
          <div className="pt-2">
            <BuscadorPrincipal />
          </div>

          {/* Tags rápidos de búsqueda */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { label: 'DNI por primera vez', url: '/tramites/dni-duplicado/lima' },
              { label: 'RUC negocio', url: '/tramites/inscripcion-ruc-persona-natural/lima' },
              { label: 'Afiliación SIS', url: '/tramites/afiliacion-sis-gratuito/lima' },
              { label: 'Pasaporte electrónico', url: '/tramites/pasaporte-electronico/lima' },
              { label: 'Certificado literal', url: '/tramites/certificado-literal-sunarp/lima' },
              { label: 'Certificado laboral', url: '/tramites/certificado-unico-laboral/lima' },
            ].map((tag, idx) => (
              <Link 
                key={idx} 
                href={tag.url}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-slate-200 hover:text-white transition"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: SALUD Y BIENESTAR (Estilo de dos columnas asimétricas) */}
      <section className="max-w-6xl mx-auto px-4 py-20 w-full space-y-12 bg-background">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-1">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest block flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Salud y Bienestar
            </span>
            <h2 className="font-heading text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Cuida tu salud con información confiable
            </h2>
          </div>
          <Link 
            href="/hospitales" 
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-250 dark:border-slate-800 px-5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500 transition-colors"
          >
            Ver más →
          </Link>
        </div>

        {/* Dos columnas asimétricas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Lado Izquierdo: Tarjeta Verde Especial (Ocupa 5 de 12) */}
          <div className="lg:col-span-5">
            <div className="bg-[#1C543A] text-white rounded-3xl p-8 shadow-md flex flex-col justify-between h-full relative overflow-hidden group">
              {/* Abstract plant/green overlay shadow */}
              <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-105 transition-transform duration-300">
                <span className="text-7xl">🌿</span>
              </div>
              <div className="space-y-4">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[9px] font-extrabold px-3 py-1 rounded uppercase tracking-wider">
                  Especial
                </span>
                <h3 className="font-heading text-2xl font-bold leading-tight pt-4">
                  Plantas medicinales del norte del Perú que curan de verdad
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-light">
                  La sabiduría ancestral de la costa y sierra piurana al alcance de todos, con respaldo científico.
                </p>
              </div>
              <Link 
                href="/hospitales" 
                className="mt-12 text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 group/link"
              >
                Leer guía completa 
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Lado Derecho: Lista de 5 Guías (Ocupa 7 de 12) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {saludList.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 flex items-center justify-between gap-4 hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-650 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
