import Link from 'next/link';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export type BreadcrumbItem = {
  name: string;
  url: string;
};

type PortalShellProps = {
  children: React.ReactNode;
  maxWidth?: '5xl' | '6xl' | '7xl';
};

const maxWidthClass = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function PortalShell({ children, maxWidth = '6xl' }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A2E]">
      <main className={`mx-auto ${maxWidthClass[maxWidth]} px-4 py-8 sm:px-6 md:py-10`}>
        {children}
      </main>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
      {items.map((item, index) => (
        <span key={`${item.url}-${item.name}`} className="flex items-center gap-2">
          {index > 0 && <span className="text-[#C8102E]/55">/</span>}
          <Link href={item.url} className="transition hover:text-[#C8102E]">
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}

type HeroStat = {
  label: string;
  value: string | number;
};

type EditorialHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  stats?: HeroStat[];
  action?: {
    href: string;
    label: string;
  };
};

export function EditorialHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats = [],
  action,
}: EditorialHeroProps) {
  return (
    <header className="relative mb-8 overflow-hidden bg-[#0A0F1E] text-white shadow-[0_12px_40px_rgba(10,15,30,.18)]">
      <span className="absolute inset-y-0 left-0 z-10 w-1 bg-[#C8102E]" />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px] lg:items-end">
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F59E0B]">
            {Icon && <Icon className="h-4 w-4" />}
            {eyebrow}
          </div>
          <h1 className="max-w-4xl font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
            {description}
          </p>
          {action && (
            <Link
              href={action.href}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#C8102E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#9B0B22]"
            >
              {action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {stats.length > 0 && (
          <div className="relative z-10 grid grid-cols-3 gap-1 border border-white/10 bg-white/[0.06] p-1">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#0A0F1E]/65 p-4 text-center">
                <span className="block font-heading text-2xl font-black leading-none text-white">
                  {stat.value}
                </span>
                <span className="mt-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/48">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-1 h-7 w-1 shrink-0 rounded-full bg-[#C8102E]" />
      <div>
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold leading-tight tracking-tight text-[#1A1A2E]">
          {Icon && <Icon className="h-5 w-5 text-[#C8102E]" />}
          {title}
        </h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">{description}</p>}
      </div>
    </div>
  );
}

export function EditorialPanel({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function TrustPanel({
  title,
  description,
  items = [],
}: {
  title: string;
  description: string;
  items?: string[];
}) {
  return (
    <div className="bg-[#0A0F1E] p-5 text-white shadow-[0_8px_28px_rgba(10,15,30,.16)]">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F59E0B]">
        ClavePeru verificado
      </div>
      <h3 className="font-heading text-xl font-bold leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/68">{description}</p>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2 text-xs text-white/72">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8102E]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LinkCard({
  href,
  title,
  description,
  meta,
  icon: Icon,
}: {
  href: string;
  title: string;
  description?: string | null;
  meta?: string;
  icon?: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[132px] gap-4 border border-[#E8E4DE] bg-white p-4 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-0.5 hover:border-[#C8102E]/40 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
    >
      <span className="absolute inset-y-0 left-0 w-[3px] origin-bottom scale-y-0 bg-[#C8102E] transition group-hover:scale-y-100" />
      {Icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0A0F1E] text-white transition group-hover:bg-[#C8102E]">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        {meta && (
          <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E]">
            {meta}
          </span>
        )}
        <span className="block font-heading text-lg font-bold leading-snug text-[#1A1A2E] transition group-hover:text-[#C8102E]">
          {title}
        </span>
        {description && <span className="mt-2 line-clamp-3 block text-sm leading-6 text-[#6B7280]">{description}</span>}
      </span>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#C8102E] transition group-hover:translate-x-1" />
    </Link>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex border border-[#C8102E]/20 bg-[#C8102E]/[0.06] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E]">
      {children}
    </span>
  );
}
