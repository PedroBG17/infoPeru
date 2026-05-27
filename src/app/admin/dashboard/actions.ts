// src/app/admin/dashboard/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to create a new post in Supabase and trigger instant Next.js cache revalidation.
 */
export async function createPostAction(prevState: any, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slugRaw = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const author = formData.get('author') as string;

    if (!title || !slugRaw || !content) {
      return { error: 'El título, slug y contenido son campos obligatorios.' };
    }

    // Clean and validate slug
    const slug = slugRaw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    if (slug.length < 3) {
      return { error: 'El slug debe tener al menos 3 caracteres válidos.' };
    }

    // Check if slug is already taken
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return { error: `Ya existe una noticia con el slug "${slug}". Elige otro slug.` };
    }

    // Create the post in Supabase
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt ? excerpt.trim() : null,
        author: author ? author.trim() : 'Redacción Central',
        published: true,
      },
    });

    // Revalidate paths to clear Next.js cache
    revalidatePath(`/${slug}`);
    revalidatePath('/');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Noticia publicada exitosamente.', slug: post.slug };
  } catch (error) {
    console.error('[CREATE_POST_ACTION_ERROR]', error);
    return { error: 'Ocurrió un error inesperado al intentar publicar la noticia.' };
  }
}

/**
 * Server Action to delete a post from Supabase and revalidate the dashboard cache.
 */
export async function deletePostAction(id: string) {
  try {
    const post = await prisma.post.delete({
      where: { id },
    });

    // Revalidate the deleted post's slug and dashboard
    revalidatePath(`/${post.slug}`);
    revalidatePath('/');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Noticia eliminada correctamente.' };
  } catch (error) {
    console.error('[DELETE_POST_ACTION_ERROR]', error);
    return { error: 'Error al intentar eliminar la noticia.' };
  }
}
