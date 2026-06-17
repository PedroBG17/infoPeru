import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Eye, Newspaper } from 'lucide-react';
import { getWordPressPageBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/seo';
import { safeSanitizeHtml } from '@/utils/security';
import { StructuredData } from '@/components/common/structured-data';
import { Badge, Breadcrumbs, EditorialPanel, PortalShell } from '@/components/public/portal-ui';

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://info-peru.vercel.app';
  const articleUrl = `${siteUrl}/${slug}`;
  const description = page.metaDescription || toPlainText(page.content).substring(0, 155);

  return (
    <PortalShell maxWidth="5xl">
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

      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Noticias', url: '/noticias' },
          { name: 'Articulo', url: `/${slug}` },
        ]}
      />

      <Link
        href="/noticias"
        className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280] transition hover:text-[#C8102E]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a noticias
      </Link>

      <article className="border border-[#E8E4DE] bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)]">
        {page.coverImage ? (
          <img src={page.coverImage} alt={page.title} className="aspect-video max-h-[460px] w-full object-cover" />
        ) : (
          <div className="flex aspect-video max-h-[460px] w-full items-center justify-center bg-[#0A0F1E] text-white">
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/10">
                <Newspaper className="h-7 w-7" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62">
                ClavePeru Noticias
              </span>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 md:p-10">
          {page.category && <Badge>{page.category.name}</Badge>}

          <header className="mt-5 border-b border-[#E8E4DE] pb-6">
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-[#1A1A2E] md:text-5xl">
              {page.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#6B7280]">
              <span>
                Por <strong className="text-[#1A1A2E]">{page.authorName}</strong>
              </span>
              <span>|</span>
              <span>
                {new Date(page.date).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {page.readingTime || 1} min de lectura
              </span>
              {page.viewCount !== undefined && (
                <>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {page.viewCount} visitas
                  </span>
                </>
              )}
            </div>
          </header>

          <div
            className="prose prose-slate mt-8 max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-[#C8102E] hover:prose-a:underline prose-img:border prose-img:border-[#E8E4DE]"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {page.tags && page.tags.length > 0 && (
            <div className="mt-8 border-t border-[#E8E4DE] pt-6">
              <span className="mb-3 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Etiquetas relacionadas
              </span>
              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span key={tag.slug} className="border border-[#E8E4DE] bg-[#F8F5F0] px-2.5 py-1 text-xs font-semibold text-[#6B7280]">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <EditorialPanel className="mt-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1A1A2E]">Consulta tambien los servicios ciudadanos</h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              ClavePeru organiza noticias, guias oficiales y directorios utiles en una sola experiencia.
            </p>
          </div>
          <Link
            href="/tramites"
            className="inline-flex items-center justify-center bg-[#C8102E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#9B0B22]"
          >
            Consultar guias
          </Link>
        </div>
      </EditorialPanel>
    </PortalShell>
  );
}
