// src/app/(public)/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getWordPressPageBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/seo';

export const revalidate = 86400; // ISR: Revalidar cada 24 horas

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getWordPressPageBySlug(slug);

  if (!page) return {};

  // Remover HTML para la descripción corta del SEO
  const textDescription = page.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 155) + '...';

  return getMetadata({
    title: page.title,
    description: textDescription,
    slug: `/${slug}`,
    ogType: 'article',
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getWordPressPageBySlug(slug);

  if (!page) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-2xl shadow-xs overflow-hidden">
        {/* Imagen de Portada Premium */}
        {page.coverImage && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 dark:border-slate-800 shadow-md">
            <img 
              src={page.coverImage} 
              alt={page.title} 
              className="w-full max-h-[420px] object-cover aspect-video hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        )}

        {/* Encabezado del Artículo */}
        <header className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {page.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Por <strong className="text-slate-700 dark:text-slate-300">{page.authorName}</strong></span>
            <span>•</span>
            <span>Publicado el {new Date(page.date).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</span>
          </div>
        </header>

        {/* Contenido HTML Inyectado y Estilizado con Prose */}
        <div 
          className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:underline prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>

      {/* Caja de Utilidad Pública */}
      <section className="mt-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-950 dark:text-white">¿Te resultó de utilidad este artículo?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            DataPerú compila información oficial del Estado de forma simplificada y gratuita.
          </p>
        </div>
        <a 
          href="/tramites" 
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/95 transition-all whitespace-nowrap"
        >
          Consultar Guías Oficiales
        </a>
      </section>
    </main>
  );
}
