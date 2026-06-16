'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock,
  CloudSun,
  Eye,
  FileText,
  HeartPulse,
  Landmark,
  Play,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { BuscadorPrincipal } from '@/components/common/buscador-principal';
import type { SiteHomeSettings } from '@/types/site-settings';

interface PostItem {
  id: string;
  title: string;
  category: string;
  excerpt?: string;
  author: string;
  timeText: string;
  readTime?: string;
  coverImage?: string | null;
  slug: string;
}

interface HomeClientProps {
  newsList: PostItem[];
  tramitesList: Array<{ title: string; desc: string; href: string }>;
  saludList: Array<{ title: string; desc: string; icon: React.ReactNode }>;
  homeContent: SiteHomeSettings;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
];

const quickSections = [
  {
    title: 'Tramites oficiales',
    text: 'DNI, RUC, pasaporte, brevete y certificados laborales con pasos claros.',
    href: '/tramites',
    icon: FileText,
  },
  {
    title: 'Salud y hospitales',
    text: 'Directorios MINSA, EsSalud y guias de prevencion por ciudad.',
    href: '/hospitales',
    icon: HeartPulse,
  },
  {
    title: 'Bolsa de empleo',
    text: 'Convocatorias gratuitas, alertas contra cobros indebidos y CV formal.',
    href: '/trabajos',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Directorios utiles',
    text: 'Mapa de servicios ciudadanos para resolver gestiones sin intermediarios.',
    href: '/directorios',
    icon: Building2,
  },
];

const categoryRows = [
  {
    title: 'Politica y Estado',
    href: '/noticias',
    kicker: 'Gestion publica',
  },
  {
    title: 'Economia ciudadana',
    href: '/noticias',
    kicker: 'Costos y servicios',
  },
  {
    title: 'Regiones',
    href: '/noticias',
    kicker: 'Cobertura local',
  },
];

function getNewsHref(news: PostItem) {
  return news.id.startsWith('mock-') ? '/noticias' : `/${news.slug}`;
}

function getImage(news: PostItem, index: number) {
  return news.coverImage || fallbackImages[index % fallbackImages.length];
}

function AdPanel({ size = 'banner' }: { size?: 'banner' | 'square' }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center gap-2 rounded border border-dashed border-[#cfc6bb] bg-[#E5E1DA] text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7280] ${
        size === 'square' ? 'min-h-[250px] w-full' : 'my-7 min-h-[90px] w-full'
      }`}
      aria-label="Espacio publicitario"
    >
      <span className="text-lg text-[#C8102E]/55">ADS</span>
      <span>{size === 'square' ? 'Publicidad 300x250' : 'Publicidad responsiva'}</span>
    </div>
  );
}

function SectionTitle({
  title,
  href,
  linkLabel = 'Ver todo',
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-[#C8102E]" />
        <h2 className="font-heading text-2xl font-bold leading-none tracking-tight text-[#1A1A2E]">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C8102E] transition hover:text-[#9B0B22]"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function NewsImage({
  news,
  index,
  className,
  loading = 'lazy',
}: {
  news: PostItem;
  index: number;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  return (
    <img
      src={getImage(news, index)}
      alt={news.title}
      className={className}
      loading={loading}
    />
  );
}

export function HomeClient({ newsList, tramitesList, saludList, homeContent }: HomeClientProps) {
  const posts = newsList.length > 0 ? newsList : [];
  const [mainPost, secondPost, thirdPost, ...restPosts] = posts;
  const gridPosts = restPosts.slice(0, 3);
  const listPosts = restPosts.slice(3, 7);
  const trendingPosts = posts.slice(0, 5);
  const horizontalPosts = posts.slice(5, 10);
  const mediaPosts = posts.slice(0, 3);

  if (!mainPost) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A2E]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <section className="py-8">
          <div className="grid gap-1 bg-[#E8E4DE] lg:grid-cols-[1fr_340px]">
            <Link
              href={getNewsHref(mainPost)}
              className="group relative min-h-[430px] overflow-hidden bg-[#0A0F1E] lg:row-span-2 lg:min-h-[500px]"
            >
              <span className="absolute inset-y-0 left-0 z-10 w-1 bg-[#C8102E]" />
              <NewsImage
                news={mainPost}
                index={0}
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
                <span className="inline-flex rounded-sm bg-[#C8102E] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  Apertura
                </span>
                <h1 className="mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  {mainPost.title}
                </h1>
                {mainPost.excerpt && (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                    {mainPost.excerpt}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/60">
                  <span>{mainPost.category}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{mainPost.timeText}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{mainPost.readTime || '3 min lectura'}</span>
                </div>
              </div>
            </Link>

            {[secondPost, thirdPost].filter(Boolean).map((post, index) => (
              <Link
                key={post.id}
                href={getNewsHref(post)}
                className="group relative min-h-[245px] overflow-hidden bg-white"
              >
                <span className="absolute inset-y-0 left-0 z-10 w-[3px] bg-[#C8102E]" />
                <div className="h-[140px] overflow-hidden">
                  <NewsImage
                    news={post}
                    index={index + 1}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E]">
                    {post.category}
                  </span>
                  <h2 className="mt-2 line-clamp-2 font-heading text-lg font-bold leading-snug text-[#1A1A2E] transition group-hover:text-[#C8102E]">
                    {post.title}
                  </h2>
                  <p className="mt-2 font-mono text-[11px] text-[#6B7280]">{post.timeText}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <AdPanel />

        <section className="py-9">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8102E]">
                <span>Ultimas noticias</span>
                <span className="h-px w-10 bg-[#C8102E]/40" />
              </div>
              <div className="grid gap-1 bg-[#E8E4DE] md:grid-cols-3">
                {gridPosts.map((news, index) => (
                  <Link
                    key={news.id}
                    href={getNewsHref(news)}
                    className="group relative overflow-hidden bg-white transition hover:shadow-[0_8px_32px_rgba(10,15,30,.16)]"
                  >
                    <span className="absolute inset-y-0 left-0 z-10 w-[3px] origin-bottom scale-y-0 bg-[#C8102E] transition group-hover:scale-y-100" />
                    <div className="h-[180px] overflow-hidden bg-[#E5E1DA]">
                      <NewsImage
                        news={news}
                        index={index + 3}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E]">
                        {news.category}
                      </div>
                      <h3 className="mt-2 line-clamp-3 font-heading text-base font-bold leading-snug transition group-hover:text-[#9B0B22]">
                        {news.title}
                      </h3>
                      <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#6B7280]">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{news.timeText}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-1 bg-white px-5">
                {listPosts.map((news, index) => (
                  <Link
                    key={news.id}
                    href={getNewsHref(news)}
                    className="group flex gap-4 border-b border-[#E8E4DE] py-4 last:border-b-0"
                  >
                    <div className="h-[74px] w-[96px] shrink-0 overflow-hidden rounded bg-[#E5E1DA]">
                      <NewsImage
                        news={news}
                        index={index + 6}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#C8102E]">
                        {news.category}
                      </div>
                      <h3 className="mt-1 line-clamp-2 font-heading text-base font-bold leading-snug transition group-hover:text-[#9B0B22]">
                        {news.title}
                      </h3>
                      <p className="mt-2 font-mono text-[10px] text-[#6B7280]">
                        {news.timeText} · {news.readTime || '3 min lectura'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="space-y-7">
              <div className="overflow-hidden rounded bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)]">
                <div className="flex items-center gap-2 bg-[#0A0F1E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" />
                  Lo mas leido hoy
                </div>
                <div>
                  {trendingPosts.map((news, index) => (
                    <Link
                      key={news.id}
                      href={getNewsHref(news)}
                      className="group flex gap-4 border-b border-[#E8E4DE] px-5 py-4 last:border-b-0 hover:bg-[#C8102E]/[0.03]"
                    >
                      <span className="w-8 shrink-0 font-heading text-2xl font-black leading-none text-[#E5E1DA] transition group-hover:text-[#C8102E]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-[#9B0B22]">
                          {news.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1 font-mono text-[10px] text-[#6B7280]">
                          <Eye className="h-3 w-3" />
                          {news.category}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <AdPanel size="square" />

              <div className="rounded bg-gradient-to-br from-[#0A0F1E] to-[#1e2d5e] p-5 text-white">
                <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
                  <span>Lima, Peru</span>
                  <CloudSun className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-heading text-6xl font-bold leading-none tracking-tight">18°</div>
                    <p className="mt-2 text-sm text-white/70">Parcialmente nublado</p>
                  </div>
                  <div className="grid gap-2 text-right font-mono text-[10px] text-white/60">
                    <span>Humedad 82%</span>
                    <span>Viento 12 km/h</span>
                    <span>UV bajo</span>
                  </div>
                </div>
              </div>

              <div className="rounded border-t-4 border-[#C8102E] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)]">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#C8102E]" />
                  <h3 className="font-heading text-lg font-bold">Buscar servicios</h3>
                </div>
                <p className="mb-4 text-sm leading-6 text-[#6B7280]">
                  Encuentra tramites, hospitales y oportunidades por ciudad.
                </p>
                <BuscadorPrincipal />
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-[#E8E4DE] py-8">
          <SectionTitle title="Servicios ciudadanos" href="/todos" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickSections.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group border-t-4 border-[#C8102E] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded bg-[#0A0F1E] text-white transition group-hover:bg-[#C8102E]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold leading-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.text}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-[#E8E4DE] py-8">
          <SectionTitle title="Guias de tramites rapidos" href="/tramites" />
          <div className="flex snap-x gap-4 overflow-x-auto pb-3 scrollbar-none">
            {tramitesList.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group min-w-[260px] snap-start bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8102E]">
                    Guia {String(index + 1).padStart(2, '0')}
                  </span>
                  <Landmark className="h-4 w-4 text-[#C8102E]" />
                </div>
                <h3 className="font-heading text-lg font-bold group-hover:text-[#C8102E]">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6B7280]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <AdPanel />

        <section className="border-t border-[#E8E4DE] py-8">
          <SectionTitle title="Salud y prevencion" href="/hospitales" />
          <div className="grid gap-1 bg-[#E8E4DE] md:grid-cols-2 lg:grid-cols-3">
            {saludList.slice(0, 6).map((item) => (
              <Link
                key={item.title}
                href="/hospitales"
                className="group bg-white p-5 transition hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-[#F8F5F0]">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg font-bold leading-snug transition group-hover:text-[#C8102E]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[#E8E4DE] py-8">
          <SectionTitle title="Analisis y orientacion" href="/noticias" linkLabel="Leer mas" />
          <div className="grid gap-4 md:grid-cols-3">
            {categoryRows.map((row, index) => {
              const post = horizontalPosts[index] || posts[index + 1] || mainPost;
              return (
                <Link
                  key={row.title}
                  href={getNewsHref(post)}
                  className="group bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
                >
                  <div className="h-44 overflow-hidden">
                    <NewsImage
                      news={post}
                      index={index + 8}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8102E]">
                      {row.kicker}
                    </div>
                    <h3 className="mt-2 font-heading text-xl font-bold leading-snug group-hover:text-[#C8102E]">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-[#E8E4DE] py-8">
          <SectionTitle title="Video y multimedia" href="/noticias" />
          <div className="grid gap-1 bg-[#E8E4DE] lg:grid-cols-[1.4fr_1fr_1fr]">
            {mediaPosts.map((news, index) => (
              <Link
                key={news.id}
                href={getNewsHref(news)}
                className={`group relative min-h-[260px] overflow-hidden bg-[#0A0F1E] ${
                  index === 0 ? 'lg:min-h-[360px]' : ''
                }`}
              >
                <NewsImage
                  news={news}
                  index={index + 2}
                  className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/95 via-[#0A0F1E]/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C8102E]">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <h3 className="font-heading text-xl font-bold leading-snug">{news.title}</h3>
                  <p className="mt-2 font-mono text-[10px] text-white/55">{news.timeText}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="pb-10">
          <div className="flex flex-col gap-4 bg-[#0A0F1E] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F59E0B]">
                <ShieldCheck className="h-4 w-4" />
                {homeContent.eyebrow}
              </div>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                {homeContent.titleLine1} {homeContent.titleLine2} {homeContent.accent}
              </h2>
            </div>
            <Link
              href={homeContent.primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#C8102E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#9B0B22]"
            >
              {homeContent.primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
