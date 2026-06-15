import { notFound } from 'next/navigation';
import { getWordPressPageBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/seo';
import { safeSanitizeHtml } from '@/utils/security';
import { StructuredData } from '@/components/common/structured-data';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function toPlainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getWordPressPageBySlug(slug);

  if (!page) return {};

  const seoTitle = page.metaTitle || page.title;
  const seoDescription = page.metaDescription || `${toPlainText(page.content).substring(0, 155)}...`;

  return getMetadata({
    title: seoTitle,
    description: seoDescription,
    slug: `/${slug}`,
    ogType: 'article',
    ogImage: page.coverImage || undefined,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getWordPressPageBySlug(slug);

  if (!page) notFound();

  const sanitizedContent = safeSanitizeHtml(page.content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dataperu.pe';
  const articleUrl = `${siteUrl}/${slug}`;
  const description = page.metaDescription || toPlainText(page.content).substring(0, 155);

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <StructuredData
        type="Breadcrumb"
        data={[
          { name: 'Inicio', url: siteUrl },
          { name: 'Noticias', url: `${siteUrl}/noticias` },
          { name: page.title, url: articleUrl },
        ]}
      />
      <StructuredData
        type="Article"
        data={{
          headline: page.metaTitle || page.title,
          description,
          image: page.coverImage || null,
          authorName: page.authorName,
          datePublished: page.date,
          url: articleUrl,
        }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Link
          href="/noticias"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:p-10">
          {page.category && (
            <div className="mb-4">
              <span className="inline-flex items-center rounded-md border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {page.category.name}
              </span>
            </div>
          )}

          {page.coverImage && (
            <div className="mb-8 overflow-hidden rounded-lg border border-slate-100 shadow-sm dark:border-slate-800">
              <img
                src={page.coverImage}
                alt={page.title}
                className="aspect-video max-h-[420px] w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
              />
            </div>
          )}

          <header className="mb-8 border-b border-slate-100 pb-6 dark:border-slate-800">
            <h1 className="font-heading text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
              {page.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Por <strong className="text-slate-700 dark:text-slate-300">{page.authorName}</strong>
              </span>
              <span aria-hidden="true">-</span>
              <span>
                {new Date(page.date).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span aria-hidden="true">-</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {page.readingTime || 1} {(page.readingTime || 1) === 1 ? 'min' : 'mins'} de lectura
              </span>
              {page.viewCount !== undefined && (
                <>
                  <span aria-hidden="true">-</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    {page.viewCount} visitas
                  </span>
                </>
              )}
            </div>
          </header>

          <div
            className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:leading-8 prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {page.tags && page.tags.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
              <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Etiquetas relacionadas
              </span>
              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="mx-auto max-w-4xl px-4 pb-14">
        <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:flex-row">
          <div>
            <h4 className="font-bold text-slate-950 dark:text-white">¿Te resultó útil este artículo?</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              ClavePerú compila información pública y guías oficiales de forma simple y gratuita.
            </p>
          </div>
          <Link
            href="/tramites"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/95"
          >
            Consultar guías oficiales
          </Link>
        </div>
      </section>
    </main>
  );
}
