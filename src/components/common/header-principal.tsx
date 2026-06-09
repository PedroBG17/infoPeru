// src/components/common/header-principal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/app/providers';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { SiteSettings } from '@/types/site-settings';

type HeaderPrincipalProps = {
  navigation: SiteSettings['navigation'];
};

export function HeaderPrincipal({ navigation }: HeaderPrincipalProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      };
      let dateStr = now.toLocaleDateString('es-PE', optionsDate);
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      const timeFormatted = now.toLocaleTimeString('es-PE', optionsTime).toLowerCase();

      setTimeStr(`${dateStr} | ${timeFormatted}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-45 w-full bg-[#0B1528] text-white border-b border-slate-800/80 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex h-18 items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 group select-none shrink-0">
          <div className="bg-[#B91C1C] px-2.5 py-1 rounded text-white text-xs font-black tracking-wider uppercase shadow-xs">
            {navigation.brandPrefix}
          </div>
          <span className="font-heading font-black text-lg tracking-tight text-white flex items-center">
            {navigation.brandName}
            <span className="text-[#FF5A1F] text-xs font-bold ml-0.5 select-none transition-transform group-hover:scale-110 duration-200">
              {navigation.brandAccent}
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-7">
          {navigation.links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-200 ${
                  isActive
                    ? 'text-[#FF5A1F]'
                    : 'text-slate-350 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4.5 shrink-0">
          {mounted && timeStr && (
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-400 border-r border-slate-800/60 pr-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>{timeStr}</span>
            </div>
          )}

          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          )}

          <Link
            href={navigation.ctaHref}
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#B91C1C] hover:bg-[#a11818] active:bg-[#8f1515] px-4.5 text-[10px] font-extrabold tracking-wider text-white shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap uppercase gap-1"
          >
            {navigation.ctaLabel}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
