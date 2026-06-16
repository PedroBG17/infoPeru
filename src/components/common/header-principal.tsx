'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/app/providers';
import { Moon, Newspaper, Search, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { SiteSettings } from '@/types/site-settings';

type HeaderPrincipalProps = {
  navigation: SiteSettings['navigation'];
  tickerItems?: string[];
};

function titleCaseBrand(value: string) {
  if (!value) return 'Clave';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function HeaderPrincipal({ navigation, tickerItems = [] }: HeaderPrincipalProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [progress, setProgress] = useState(0);

  const brandPrefix = titleCaseBrand(navigation.brandPrefix);
  const ticker = useMemo(
    () =>
      tickerItems.length > 0
        ? tickerItems
        : [
            'Guias oficiales para tramites del Estado',
            'Directorios de hospitales por ciudad',
            'Bolsa de empleo con alertas contra cobros',
            'Noticias y servicios ciudadanos actualizados',
          ],
    [tickerItems]
  );

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const timeFormatted = now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setTimeStr(`${dateStr} | Lima | ${timeFormatted}`);
    };

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };

    updateTime();
    updateProgress();

    const interval = setInterval(updateTime, 60_000);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <>
      <div
        className="fixed left-0 top-0 z-[70] h-0.5 bg-[#C8102E] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />

      <div className="bg-[#0A0F1E] text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white/55 sm:px-6">
          <span className="truncate">{mounted ? timeStr : 'ClavePeru | Lima'}</span>
          <div className="hidden items-center gap-5 sm:flex">
            <Link href="/noticias" className="transition hover:text-[#F59E0B]">
              Noticias
            </Link>
            <Link href="/directorios" className="transition hover:text-[#F59E0B]">
              Directorios
            </Link>
            <Link href="/admin/login" className="transition hover:text-[#F59E0B]">
              CMS
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden h-9 items-center overflow-hidden bg-[#C8102E] text-white md:flex">
        <span className="z-10 flex h-full shrink-0 items-center bg-[#0A0F1E] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F59E0B]">
          En vivo
        </span>
        <div className="flex w-max animate-[marquee-scroll_42s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
          {[...ticker, ...ticker].map((item, index) => (
            <span key={`${item}-${index}`} className="px-7 text-xs font-semibold tracking-[0.01em]">
              <span className="mr-3 text-[8px] opacity-70">●</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b-2 border-[#C8102E] bg-[#0A0F1E] text-white shadow-[0_10px_30px_rgba(10,15,30,.18)]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#C8102E] text-white">
              <Newspaper className="h-5 w-5" />
            </span>
            <span className="font-heading text-2xl font-black leading-none tracking-tight text-white">
              {brandPrefix}
              <span className="text-[#C8102E]">{navigation.brandName}</span>
              {navigation.brandAccent && (
                <span className="ml-0.5 text-base text-[#F59E0B]">{navigation.brandAccent}</span>
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={`rounded px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition ${
                    isActive
                      ? 'bg-[#C8102E] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <form
              action="/todos"
              className="hidden w-[210px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 transition focus-within:border-white/25 focus-within:bg-white/[0.13] md:flex"
            >
              <Search className="h-3.5 w-3.5 text-white/45" />
              <input
                name="q"
                type="search"
                placeholder="Buscar"
                className="w-full border-0 bg-transparent p-0 text-[12px] text-white outline-none placeholder:text-white/35 focus:ring-0"
              />
            </form>

            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-[#F59E0B]" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}

            <Link
              href={navigation.ctaHref}
              className="hidden rounded-full bg-[#C8102E] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9B0B22] sm:inline-flex"
            >
              {navigation.ctaLabel}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
