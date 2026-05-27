// src/app/layout.tsx
import '@/styles/globals.css';
import React from 'react';
import { Providers } from './providers';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-50">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {/* Header / Navbar Premium */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
              <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                  <a href="/" className="flex items-center gap-2">
                    <span className="bg-primary text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wider">
                      DATA
                    </span>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                      Perú
                    </span>
                  </a>
                  <nav className="hidden md:flex gap-6">
                    {siteConfig.mainNav.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors dark:text-slate-300 dark:hover:text-primary"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="/tramites"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary/95 transition-colors"
                  >
                    Buscador de Trámites
                  </a>
                </div>
              </div>
            </header>

            {/* Main Application Area */}
            <div className="flex-1">{children}</div>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
              <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3">DataPerú</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Plataforma regional peruana de utilidad pública. Trámites oficiales, directorios de salud, convocatorias laborales y herramientas locales actualizadas.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Enlaces Útiles</h4>
                  <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <li><a href="/tramites" className="hover:underline">Buscador de Trámites</a></li>
                    <li><a href="/hospitales" className="hover:underline">Directorio de Salud</a></li>
                    <li><a href="/trabajos" className="hover:underline">Convocatorias de Empleo</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Nota Legal</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Esta es una plataforma agregadora de información pública. No representamos a ninguna entidad del Estado Peruano. Para realizar trámites oficiales diríjase siempre a Gob.pe.
                  </p>
                </div>
              </div>
              <div className="max-w-6xl mx-auto px-4 border-t border-slate-100 dark:border-slate-900 mt-6 pt-4 text-center">
                <p className="text-[10px] text-slate-400">
                  © {new Date().getFullYear()} DataPerú. Todos los derechos reservados.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
