import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { Calendar, Clock, Search } from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata() {
  return getMetadata({
    title: 'Noticias y Guías Públicas del Perú',
    description: 'Últimas noticias, guías ciudadanas y artículos útiles sobre trámites, salud, empleo y servicios públicos en Perú.',
    slug: '/noticias',
  });
}

export default async function NoticiasPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    readingTime: number | null;
    category: { name: string; slug: string } | null;
  }> = [];

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
  const remainingPosts = posts.slice(1);

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-950">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-12 md:py-16">
          <div className="md:col-span-7">
            <span className="mb-3 inline-flex items-center gap-2 rounded-md border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              <Search className="h-3.5 w-3.5" />
              Centro editorial
            </span>
            <h1 className="font-heading text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Noticias y guías útiles para tomar mejores decisiones
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-350">
              Información pública organizada para ciudadanos: trámites, salud, empleo y actualidad regional con lectura clara y enfoque práctico.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="block font-heading text-2xl font-black text-slate-950 dark:text-white">{posts.length}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Publicadas</span>
                </div>
                <div>
                  <span className="block font-heading text-2xl font-black text-teal-600 dark:text-teal-400">
                    {posts.filter((post) => post.category).length}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Con categoría</span>
                </div>
                <div>
                  <span className="block font-heading text-2xl font-black text-cyan-600 dark:text-cyan-400">
                    {posts.filter((post) => post.coverImage).length}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Con portada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-heading text-2xl font-bold text-slate-950 dark:text-white">Aún no hay noticias publicadas</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Cuando publiques desde el CMS, los artículos aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {featuredPost && (
              <article className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-12">
                <a href={`/${featuredPost.slug}`} className="block bg-slate-900 lg:col-span-7">
                  {featuredPost.coverImage ? (
                    <img src={featuredPost.coverImage} alt={featuredPost.title} className="aspect-video h-full w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video h-full w-full items-center justify-center bg-slate-900 text-sm font-bold uppercase tracking-widest text-teal-300">
                      ClavePerú Noticias
                    </div>
                  )}
                </a>
                <div className="flex flex-col justify-center p-6 md:p-8 lg:col-span-5">
                  {featuredPost.category && (
                    <span className="mb-3 inline-flex w-fit rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {featuredPost.category.name}
                    </span>
                  )}
                  <h2 className="font-heading text-2xl font-black leading-tight text-slate-950 dark:text-white md:text-3xl">
                    <a href={`/${featuredPost.slug}`} className="hover:text-teal-600 dark:hover:text-teal-400">
                      {featuredPost.title}
                    </a>
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-350">{featuredPost.excerpt}</p>
                  )}
                  <PostMeta date={featuredPost.createdAt} readingTime={featuredPost.readingTime} />
                </div>
              </article>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <a href={`/${post.slug}`} className="block bg-slate-900">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="aspect-video w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-slate-900 text-xs font-bold uppercase tracking-widest text-teal-300">
                        ClavePerú
                      </div>
                    )}
                  </a>
                  <div className="p-5">
                    {post.category && (
                      <span className="mb-3 inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="font-heading text-lg font-bold leading-snug text-slate-950 dark:text-white">
                      <a href={`/${post.slug}`} className="hover:text-teal-600 dark:hover:text-teal-400">
                        {post.title}
                      </a>
                    </h3>
                    {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{post.excerpt}</p>}
                    <PostMeta date={post.createdAt} readingTime={post.readingTime} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function PostMeta({ date, readingTime }: { date: Date; readingTime: number | null }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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
