// src/app/layout.tsx
import '@/styles/globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import { Providers } from './providers';
import { siteConfig } from '@/config/site';
import { HeaderPrincipal } from '@/components/common/header-principal';
import { getSiteSettings } from '@/lib/site-settings';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const fontHeading = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  const seo = siteSettings.seo;
  const ogImage = seo.ogImage || siteConfig.ogImage;

  return {
    title: {
      default: seo.titleDefault,
      template: seo.titleTemplate,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: seo.siteName, url: siteConfig.url }],
    creator: seo.siteName,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      url: siteConfig.url,
      title: seo.ogTitle,
      description: seo.ogDescription,
      siteName: seo.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [ogImage],
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <HeaderPrincipal
              navigation={siteSettings.navigation}
              tickerItems={siteSettings.tickerItems}
            />

            <main className="flex-1">{children}</main>

            <footer className="bg-[#0A0F1E] pt-12 text-white">
              <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 border-b border-white/10 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <h3 className="font-heading text-3xl font-black text-white">
                    Clave<span className="text-[#C8102E]">Perú</span>
                  </h3>
                  <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
                    {siteSettings.footerDescription}
                  </p>
                </div>

                <div>
                  <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                    Secciones
                  </h4>
                  <ul className="space-y-3 text-sm text-white/60">
                    <li>
                      <Link href="/noticias" className="transition hover:text-white">
                        Noticias
                      </Link>
                    </li>
                    <li>
                      <Link href="/tramites" className="transition hover:text-white">
                        Tramites
                      </Link>
                    </li>
                    <li>
                      <Link href="/hospitales" className="transition hover:text-white">
                        Hospitales
                      </Link>
                    </li>
                    <li>
                      <Link href="/trabajos" className="transition hover:text-white">
                        Empleo
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                    Servicios
                  </h4>
                  <ul className="space-y-3 text-sm text-white/60">
                    <li>
                      <Link href="/directorios" className="transition hover:text-white">
                        Directorios
                      </Link>
                    </li>
                    <li>
                      <Link href="/todos" className="transition hover:text-white">
                        Todos los servicios
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/login" className="transition hover:text-white">
                        CMS
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
                    Legal
                  </h4>
                  <p className="text-sm leading-7 text-white/55">
                    {siteSettings.footerLegalText}{' '}
                    <a
                      href={siteSettings.footerLegalLinkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#F59E0B] underline transition hover:text-white"
                    >
                      {siteSettings.footerLegalLinkLabel}
                    </a>.
                  </p>
                </div>
              </div>

              <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-white/30 sm:flex-row sm:px-6 sm:text-left">
                <p>© {new Date().getFullYear()} ClavePerú. Todos los derechos reservados.</p>
                <p className="flex items-center justify-center gap-2">
                  <span>{siteSettings.footerSecurityLabel}</span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
