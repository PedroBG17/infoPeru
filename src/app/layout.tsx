// src/app/layout.tsx
import '@/styles/globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Providers } from './providers';
import { adsConfig } from '@/config/ads';
import { siteConfig } from '@/config/site';
import { Montserrat, Open_Sans } from 'next/font/google';
import { HeaderPrincipal } from '@/components/common/header-principal';
import { getSiteSettings } from '@/lib/site-settings';
import Link from 'next/link';

const fontSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const fontHeading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
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
        className={`${fontSans.variable} ${fontHeading.variable} min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300`}
      >
        {adsConfig.adsense.enabled && (
          <Script
            id="google-adsense-auto-ads"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.adsense.client}`}
            crossOrigin="anonymous"
          />
        )}
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {/* Header / Navbar Editorial */}
            <HeaderPrincipal navigation={siteSettings.navigation} />

            {/* Area de Contenido */}
            <main className="flex-1">{children}</main>

            {/* Footer Editorial */}
            <footer className="bg-[#0B1528] text-white border-t border-slate-800 py-16">
              <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="font-heading font-black text-white text-lg">
                    Clave<span className="text-[#FF5A1F]">Perú</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {siteSettings.footerDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white mb-4">
                    Enlaces de Utilidad
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-450">
                    <li>
                      <Link href="/tramites" className="hover:text-[#FF5A1F] transition-colors">
                        Guías del TUPA
                      </Link>
                    </li>
                    <li>
                      <Link href="/hospitales" className="hover:text-[#FF5A1F] transition-colors">
                        Directorio de Clínicas e Hospitales
                      </Link>
                    </li>
                    <li>
                      <Link href="/trabajos" className="hover:text-[#FF5A1F] transition-colors">
                        Convocatorias Laborales
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white mb-4">
                    Seguridad y Descargo Legal
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    {siteSettings.footerLegalText}{' '}
                    <a
                      href={siteSettings.footerLegalLinkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#FF5A1F] hover:text-[#e04f18] font-medium"
                    >
                      {siteSettings.footerLegalLinkLabel}
                    </a>.
                  </p>
                </div>
              </div>
              <div className="max-w-6xl mx-auto px-4 border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-[10px] text-slate-500">
                  © {new Date().getFullYear()} ClavePerú. Todos los derechos reservados.
                </p>
                <p className="text-[10px] text-slate-550 flex items-center gap-1.5 justify-center">
                  <span>{siteSettings.footerSecurityLabel}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
