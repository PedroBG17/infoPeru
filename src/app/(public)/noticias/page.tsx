import Link from 'next/link';
import { Calendar, Clock, Newspaper, Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import {
  Badge,
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  PortalShell,
  SectionHeader,
} from '@/components/public/portal-ui';

export const revalidate = 3600;

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  readingTime: number | null;
  category: { name: string; slug: string } | null;
};

export async function generateMetadata() {
  return getMetadata({
    title: 'Noticias y Guias Publicas del Peru',
    description: 'Ultimas noticias, guias ciudadanas y articulos utiles sobre tramites, salud, empleo y servicios publicos en Peru.',
    slug: '/noticias',
  });
}

export default async function NoticiasPage() {
  let posts: NewsPost[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });
  } catch (error) {
    console.error('[NOTICIAS_PAGE_POSTS_ERROR] No se pudieron cargar noticias:', error);
  }

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  const remainingPosts = posts.slice(4);
  const withCategory = posts.filter((post) => post.category).length;
  const withCover = posts.filter((post) => post.coverImage).length;

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Noticias', url: '/noticias' },
        ]}
      />

      <EditorialHero
        eyebrow="Centro editorial"
        title="Noticias y guias utiles para tomar mejores decisiones"
        description="Informacion publica organizada para ciudadanos: tramites, salud, empleo y actualidad con lectura clara, contexto y enfoque practico."
        icon={Search}
        stats={[
          { label: 'Publicadas', value: posts.length },
          { label: 'Categorias', value: withCategory },
          { label: 'Portadas', value: withCover },
        ]}
      />

      {posts.length === 0 ? (
        <EditorialPanel className="text-center">
          <h2 className="font-heading text-2xl font-bold text-[#1A1A2E]">Aun no hay noticias publicadas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6B7280]">
            Cuando publiques desde el CMS, los articulos apareceran aqui automaticamente con el formato editorial del portal.
          </p>
        </EditorialPanel>
      ) : (
        <div className="space-y-8">
          {featuredPost && (
            <article className="grid overflow-hidden border border-[#E8E4DE] bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)] lg:grid-cols-[1.35fr_1fr]">
              <Link href={`/${featuredPost.slug}`} className="block min-h-[320px] bg-[#0A0F1E]">
                <NewsVisual post={featuredPost} prominent />
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <Badge>{featuredPost.category?.name || 'Actualidad'}</Badge>
                <h2 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-[#1A1A2E]">
                  <Link href={`/${featuredPost.slug}`} className="transition hover:text-[#C8102E]">
                    {featuredPost.title}
                  </Link>
                </h2>
                {featuredPost.excerpt && (
                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#6B7280]">{featuredPost.excerpt}</p>
                )}
                <PostMeta date={featuredPost.createdAt} readingTime={featuredPost.readingTime} />
              </div>
            </article>
          )}

          {secondaryPosts.length > 0 && (
            <section>
              <SectionHeader title="Actualidad reciente" description="Ultimas publicaciones creadas desde el CMS." />
              <div className="grid gap-4 md:grid-cols-3">
                {secondaryPosts.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {remainingPosts.length > 0 && (
            <section>
              <SectionHeader title="Mas articulos" description="Archivo editorial y guias publicas disponibles." />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((post) => (
                  <NewsCard key={post.id} post={post} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PortalShell>
  );
}

function NewsVisual({ post, prominent = false }: { post: NewsPost; prominent?: boolean }) {
  if (post.coverImage) {
    return (
      <img
        src={post.coverImage}
        alt={post.title}
        className={`${prominent ? 'h-full min-h-[320px]' : 'aspect-video'} w-full object-cover transition duration-500 hover:scale-[1.02]`}
        loading={prominent ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <div className={`${prominent ? 'h-full min-h-[320px]' : 'aspect-video'} flex w-full items-center justify-center bg-[#0A0F1E] text-white`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white/10">
          <Newspaper className="h-6 w-6" />
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62">
          ClavePeru Noticias
        </span>
      </div>
    </div>
  );
}

function NewsCard({ post, compact = false }: { post: NewsPost; compact?: boolean }) {
  return (
    <article className="group overflow-hidden border border-[#E8E4DE] bg-white shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]">
      <Link href={`/${post.slug}`} className="block bg-[#0A0F1E]">
        <NewsVisual post={post} />
      </Link>
      <div className="p-5">
        <Badge>{post.category?.name || 'Noticias'}</Badge>
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} mt-3 font-heading font-bold leading-snug text-[#1A1A2E] transition group-hover:text-[#C8102E]`}>
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6B7280]">{post.excerpt}</p>}
        <PostMeta date={post.createdAt} readingTime={post.readingTime} />
      </div>
    </article>
  );
}

function PostMeta({ date, readingTime }: { date: Date; readingTime: number | null }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#6B7280]">
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {readingTime || 1} min
      </span>
    </div>
  );
}
