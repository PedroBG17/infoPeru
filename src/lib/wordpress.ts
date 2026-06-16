import { prisma } from './db';

interface WordPressPage {
  title: string;
  content: string;
  date: string;
  authorName: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  readingTime?: number | null;
  viewCount?: number;
  category?: { name: string; slug: string } | null;
  tags?: { name: string; slug: string }[];
}

export async function getWordPressPageBySlug(slug: string): Promise<WordPressPage | null> {
  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!post) {
      return null;
    }

    prisma.post
      .update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((error) => console.warn(`[SUPABASE_CMS] Fallo incremento de vistas para "${slug}":`, error));

    return {
      title: post.title,
      content: post.content,
      date: post.createdAt.toISOString(),
      authorName: post.author,
      coverImage: post.coverImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      readingTime: post.readingTime,
      viewCount: post.viewCount + 1,
      category: post.category,
      tags: post.tags,
    };
  } catch (error) {
    console.warn(`[SUPABASE_CMS] Error al buscar el post "${slug}" en base de datos:`, error);
    return null;
  }
}
