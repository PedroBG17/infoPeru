'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock,
  FileText,
  HeartPulse,
  Landmark,
  Newspaper,
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

function getNewsHref(news: PostItem) {
  return `/${news.slug}`;
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
  className,
  loading = 'lazy',
}: {
  news: PostItem;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  if (news.coverImage) {
    return <img src={news.coverImage} alt={news.title} className={className} loading={loading} />;
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(200,16,46,0.28),transparent_32%),linear-gradient(135deg,#0A0F1E,#1A1A2E)]`}
      aria-label={news.title}
      role="img"
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10">
          <Newspaper className="h-6 w-6" />
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {news.category || 'ClavePeru'}
        </span>
      </div>
    </div>
  );
}

function EmptyNewsHero({ homeContent }: { homeContent: SiteHomeSettings }) {
  return (
    <section className="py-8">
      <div className="grid gap-8 bg-[#0A0F1E] p-6 text-white sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F59E0B]">
            <ShieldCheck className="h-4 w-4" />
            {homeContent.eyebrow}
          </div>
          <h1 className="mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {homeContent.titleLine1} {homeContent.titleLine2} {homeContent.accent}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            {homeContent.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={homeContent.primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#C8102E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:bg-[#9B0B22]"
            >
              {homeContent.primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/noticias"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Ver noticias
            </Link>
          </div>
        </div>

        <div className="rounded-sm border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#F59E0B]" />
            <h2 className="font-heading text-xl font-bold">Buscar servicios</h2>
          </div>
          <p className="mb-4 text-sm leading-6 text-white/65">
            Encuentra tramites, hospitales, empleos y directorios por ciudad.
          </p>
          <BuscadorPrincipal />
        </div>
      </div>
    </section>
  );
}

function TrustCard() {
  return (
    <div className="rounded bg-gradient-to-br from-[#0A0F1E] to-[#17213F] p-5 text-white">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#F59E0B]">
        <ShieldCheck className="h-4 w-4" />
        Informacion verificada
      </div>
      <h3 className="font-heading text-2xl font-bold leading-tight">
        Usa canales oficiales y evita cobros indebidos.
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/68">
        ClavePeru organiza enlaces, requisitos y guias para que compares tasas,
        documentos y pasos antes de iniciar una gestion.
      </p>
      <Link
        href="/tramites"
        className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:text-[#F59E0B]"
      >
        Ver guias oficiales
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function HomeClient({ newsList, tramitesList, saludList, homeContent }: HomeClientProps) {
  const posts = newsList;
  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 3);
  const gridPosts = posts.slice(3, 6);
  const listPosts = posts.slice(6, 10);
  const recentPosts = posts.slice(0, 5);
  const orientationPosts = posts.slice(5, 8);
  const morePosts = posts.slice(8, 11);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A2E]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {mainPost ? (
          <section className="py-8">
            <div
              className={`grid gap-1 bg-[#E8E4DE] ${
                sidePosts.length > 0 ? 'lg:grid-cols-[1fr_340px]' : ''
              }`}
            >
              <Link
                href={getNewsHref(mainPost)}
                className="group relative min-h-[430px] overflow-hidden bg-[#0A0F1E] lg:row-span-2 lg:min-h-[500px]"
              >
                <span className="absolute inset-y-0 left-0 z-10 w-1 bg-[#C8102E]" />
                <NewsImage
                  news={mainPost}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
                  <span className="inline-flex rounded-sm bg-[#C8102E] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                    Actualidad
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

              {sidePosts.map((post) => (
                <Link
                  key={post.id}
                  href={getNewsHref(post)}
                  className="group relative min-h-[245px] overflow-hidden bg-white"
                >
                  <span className="absolute inset-y-0 left-0 z-10 w-[3px] bg-[#C8102E]" />
                  <div className="h-[140px] overflow-hidden">
                    <NewsImage
                      news={post}
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
        ) : (
          <EmptyNewsHero homeContent={homeContent} />
        )}

        {mainPost && (
          <section className="py-9">
            <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
              <div>
                {(gridPosts.length > 0 || listPosts.length > 0) && (
                  <div className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8102E]">
                    <span>Ultimas noticias</span>
                    <span className="h-px w-10 bg-[#C8102E]/40" />
                  </div>
                )}

                {gridPosts.length > 0 && (
                  <div className="grid gap-1 bg-[#E8E4DE] md:grid-cols-3">
                    {gridPosts.map((news) => (
                      <Link
                        key={news.id}
                        href={getNewsHref(news)}
                        className="group relative overflow-hidden bg-white transition hover:shadow-[0_8px_32px_rgba(10,15,30,.16)]"
                      >
                        <span className="absolute inset-y-0 left-0 z-10 w-[3px] origin-bottom scale-y-0 bg-[#C8102E] transition group-hover:scale-y-100" />
                        <div className="h-[180px] overflow-hidden bg-[#E5E1DA]">
                          <NewsImage
                            news={news}
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
                )}

                {listPosts.length > 0 && (
                  <div className="mt-1 bg-white px-5">
                    {listPosts.map((news) => (
                      <Link
                        key={news.id}
                        href={getNewsHref(news)}
                        className="group flex gap-4 border-b border-[#E8E4DE] py-4 last:border-b-0"
                      >
                        <div className="h-[74px] w-[96px] shrink-0 overflow-hidden rounded bg-[#E5E1DA]">
                          <NewsImage
                            news={news}
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
                            {news.timeText} | {news.readTime || '3 min lectura'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <aside className="space-y-7">
                {recentPosts.length > 0 && (
                  <div className="overflow-hidden rounded bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)]">
                    <div className="flex items-center gap-2 bg-[#0A0F1E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" />
                      Actualidad reciente
                    </div>
                    <div>
                      {recentPosts.map((news, index) => (
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
                              {news.category}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <TrustCard />

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
        )}

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

        {orientationPosts.length > 0 && (
          <section className="border-t border-[#E8E4DE] py-8">
            <SectionTitle title="Analisis y orientacion" href="/noticias" linkLabel="Leer mas" />
            <div className="grid gap-4 md:grid-cols-3">
              {orientationPosts.map((post) => (
                <Link
                  key={post.id}
                  href={getNewsHref(post)}
                  className="group bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
                >
                  <div className="h-44 overflow-hidden">
                    <NewsImage
                      news={post}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8102E]">
                      Orientacion ciudadana
                    </div>
                    <h3 className="mt-2 font-heading text-xl font-bold leading-snug group-hover:text-[#C8102E]">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {morePosts.length > 0 && (
          <section className="border-t border-[#E8E4DE] py-8">
            <SectionTitle title="Mas actualidad" href="/noticias" />
            <div className="grid gap-1 bg-[#E8E4DE] lg:grid-cols-3">
              {morePosts.map((news) => (
                <Link
                  key={news.id}
                  href={getNewsHref(news)}
                  className="group relative min-h-[260px] overflow-hidden bg-[#0A0F1E]"
                >
                  <NewsImage
                    news={news}
                    className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/95 via-[#0A0F1E]/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="mb-3 inline-flex rounded-sm bg-[#C8102E] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                      {news.category}
                    </div>
                    <h3 className="font-heading text-xl font-bold leading-snug">{news.title}</h3>
                    <p className="mt-2 font-mono text-[10px] text-white/55">{news.timeText}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
