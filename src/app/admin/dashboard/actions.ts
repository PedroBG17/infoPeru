// src/app/admin/dashboard/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { defaultSiteSettings, mergeSiteSettings, SITE_SETTINGS_KEY } from '@/lib/site-settings';
import type { SiteSettings } from '@/types/site-settings';
import { assertAdminSession } from '@/lib/admin-auth';
import { deleteMediaObject } from '@/lib/media-storage';

type FormActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

// Helper to generate clean slugs
function generateCleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/ñ/g, 'n')              // replace ñ with n
    .replace(/[^a-z0-9-_]/g, '-')    // remove special chars
    .replace(/-+/g, '-');            // merge multiple dashes
}

// Helper to calculate reading time
function calculateReadingTime(htmlContent: string): number {
  const textOnly = htmlContent.replace(/<[^>]*>/g, ' '); // Strip HTML tags
  const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed 200 words per minute
}

function parseLineList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsvList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePipeJsonList(value: FormDataEntryValue | null, firstKey: string, secondKey: string) {
  return parseLineList(value).map((line) => {
    const [first, ...rest] = line.split('|').map((part) => part.trim());
    return {
      [firstKey]: first,
      [secondKey]: rest.join(' | ') || '',
    };
  }).filter((item) => item[firstKey] && item[secondKey]);
}

function revalidateCoreContentPaths() {
  revalidatePath('/');
  revalidatePath('/tramites');
  revalidatePath('/hospitales');
  revalidatePath('/trabajos');
  revalidatePath('/directorios');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/dashboard');
}

const sectorNameMap: Record<string, string> = {
  'sec-mineria': 'Minería e Ingeniería',
  'sec-agro': 'Agroindustria y Pesca',
  'sec-comercio': 'Comercio y Retail',
  'sec-salud': 'Salud y Medicina',
  'sec-educacion': 'Educación y Academia',
  'sec-turismo': 'Turismo y Gastronomía',
  'sec-admin': 'Administración y Finanzas',
  'sec-construccion': 'Construcción e Infraestructura',
};

async function revalidateProcedimientoPath(procedimientoId: string) {
  const procedimiento = await prisma.procedimiento.findUnique({
    where: { id: procedimientoId },
    select: {
      slug: true,
      ciudadesRel: {
        select: { ciudad: { select: { slug: true } } },
      },
    },
  });

  if (!procedimiento) return;

  revalidatePath(`/tramites/${procedimiento.slug}`);
  procedimiento.ciudadesRel.forEach((rel) => {
    revalidatePath(`/tramites/${procedimiento.slug}/${rel.ciudad.slug}`);
  });
}

async function revalidateCiudadPath(ciudadId: string) {
  const ciudad = await prisma.ciudad.findUnique({
    where: { id: ciudadId },
    select: { slug: true },
  });

  if (!ciudad) return;

  revalidatePath(`/hospitales/${ciudad.slug}`);
  revalidatePath(`/trabajos/${ciudad.slug}`);
}

/**
 * Server Action to create a new post in Supabase with taxonomies and SEO metadata.
 */
export async function createPostAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const title = formData.get('title') as string;
    const slugRaw = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const author = formData.get('author') as string;
    const coverImage = formData.get('coverImage') as string;
    const publishedVal = formData.get('published') as string; // 'true' or 'false'
    const categoryId = formData.get('categoryId') as string;
    const tagIdsRaw = formData.get('tagIds') as string; // JSON string of string[]
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;

    if (!title || !slugRaw || !content) {
      return { error: 'El título, slug y contenido son campos obligatorios.' };
    }

    const slug = generateCleanSlug(slugRaw);

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

    // Parse tags
    let tagConnect: { id: string }[] = [];
    if (tagIdsRaw) {
      try {
        const tagIds = JSON.parse(tagIdsRaw) as string[];
        tagConnect = tagIds.map(id => ({ id }));
      } catch (e) {
        console.error('Error parsing tagIds:', e);
      }
    }

    const readingTime = calculateReadingTime(content);

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt ? excerpt.trim() : null,
        coverImage: coverImage ? coverImage.trim() : null,
        author: author ? author.trim() : 'Redacción Central',
        published: publishedVal === 'true',
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        readingTime,
        categoryId: categoryId || null,
        tags: {
          connect: tagConnect
        }
      },
    });

    // Revalidate paths
    revalidatePath(`/${slug}`);
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Noticia creada exitosamente.', slug: post.slug };
  } catch (error) {
    console.error('[CREATE_POST_ACTION_ERROR]', error);
    return { error: 'Ocurrió un error inesperado al intentar crear la noticia.' };
  }
}

/**
 * Server Action to update an existing post.
 */
export async function updatePostAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slugRaw = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const author = formData.get('author') as string;
    const coverImage = formData.get('coverImage') as string;
    const publishedVal = formData.get('published') as string; // 'true' or 'false'
    const categoryId = formData.get('categoryId') as string;
    const tagIdsRaw = formData.get('tagIds') as string; // JSON string of string[]
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;

    if (!id || !title || !slugRaw || !content) {
      return { error: 'El ID, título, slug y contenido son campos obligatorios.' };
    }

    const slug = generateCleanSlug(slugRaw);

    if (slug.length < 3) {
      return { error: 'El slug debe tener al menos 3 caracteres válidos.' };
    }

    // Check if slug is already taken by another post
    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        id: { not: id }
      },
    });

    if (existingPost) {
      return { error: `Ya existe otra noticia con el slug "${slug}". Elige otro slug.` };
    }

    // Parse tags
    let tagConnect: { id: string }[] = [];
    if (tagIdsRaw) {
      try {
        const tagIds = JSON.parse(tagIdsRaw) as string[];
        tagConnect = tagIds.map(tagId => ({ id: tagId }));
      } catch (e) {
        console.error('Error parsing tagIds:', e);
      }
    }

    const readingTime = calculateReadingTime(content);

    // Get current post to disconnect tags
    const currentPost = await prisma.post.findUnique({
      where: { id },
      include: { tags: true }
    });

    const disconnectedTags = currentPost?.tags.map(t => ({ id: t.id })) || [];

    // Update post
    await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt ? excerpt.trim() : null,
        coverImage: coverImage ? coverImage.trim() : null,
        author: author ? author.trim() : 'Redacción Central',
        published: publishedVal === 'true',
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        readingTime,
        categoryId: categoryId || null,
        tags: {
          disconnect: disconnectedTags,
          connect: tagConnect
        }
      },
    });

    revalidatePath(`/${slug}`);
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Noticia actualizada exitosamente.', slug };
  } catch (error) {
    console.error('[UPDATE_POST_ACTION_ERROR]', error);
    return { error: 'Ocurrió un error inesperado al intentar actualizar la noticia.' };
  }
}

/**
 * Server Action to delete a single post.
 */
export async function deletePostAction(id: string) {
  try {
    await assertAdminSession();
    const post = await prisma.post.delete({
      where: { id },
    });

    revalidatePath(`/${post.slug}`);
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Noticia eliminada correctamente.' };
  } catch (error) {
    console.error('[DELETE_POST_ACTION_ERROR]', error);
    return { error: 'Error al intentar eliminar la noticia.' };
  }
}

/**
 * Server Action to create a new Category.
 */
export async function createCategoryAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const name = formData.get('name') as string;
    const slugRaw = formData.get('slug') as string;

    if (!name) {
      return { error: 'El nombre de la categoría es obligatorio.' };
    }

    const slug = slugRaw ? generateCleanSlug(slugRaw) : generateCleanSlug(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: `La categoría con slug "${slug}" ya existe.` };
    }

    await prisma.category.create({
      data: { name: name.trim(), slug }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Categoría creada con éxito.' };
  } catch (e) {
    console.error('[CREATE_CATEGORY_ERROR]', e);
    return { error: 'Error al crear la categoría.' };
  }
}

/**
 * Server Action to update a Category.
 */
export async function updateCategoryAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slugRaw = formData.get('slug') as string;

    if (!id || !name) {
      return { error: 'El ID y el nombre son campos obligatorios.' };
    }

    const slug = slugRaw ? generateCleanSlug(slugRaw) : generateCleanSlug(name);

    const existing = await prisma.category.findFirst({
      where: { slug, id: { not: id } }
    });
    if (existing) {
      return { error: `La categoría con slug "${slug}" ya existe para otro registro.` };
    }

    await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Categoría actualizada con éxito.' };
  } catch (e) {
    console.error('[UPDATE_CATEGORY_ERROR]', e);
    return { error: 'Error al actualizar la categoría.' };
  }
}

/**
 * Server Action to delete a Category.
 */
export async function deleteCategoryAction(id: string) {
  try {
    await assertAdminSession();
    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Categoría eliminada con éxito.' };
  } catch (e) {
    console.error('[DELETE_CATEGORY_ERROR]', e);
    return { error: 'Error al eliminar la categoría.' };
  }
}

/**
 * Server Action to create a new Tag.
 */
export async function createTagAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const name = formData.get('name') as string;
    const slugRaw = formData.get('slug') as string;

    if (!name) {
      return { error: 'El nombre de la etiqueta es obligatorio.' };
    }

    const slug = slugRaw ? generateCleanSlug(slugRaw) : generateCleanSlug(name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return { error: `La etiqueta con slug "${slug}" ya existe.` };
    }

    await prisma.tag.create({
      data: { name: name.trim(), slug }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Etiqueta creada con éxito.' };
  } catch (e) {
    console.error('[CREATE_TAG_ERROR]', e);
    return { error: 'Error al crear la etiqueta.' };
  }
}

/**
 * Server Action to update a Tag.
 */
export async function updateTagAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slugRaw = formData.get('slug') as string;

    if (!id || !name) {
      return { error: 'El ID y el nombre son obligatorios.' };
    }

    const slug = slugRaw ? generateCleanSlug(slugRaw) : generateCleanSlug(name);

    const existing = await prisma.tag.findFirst({
      where: { slug, id: { not: id } }
    });
    if (existing) {
      return { error: `La etiqueta con slug "${slug}" ya existe para otro registro.` };
    }

    await prisma.tag.update({
      where: { id },
      data: { name: name.trim(), slug }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Etiqueta actualizada con éxito.' };
  } catch (e) {
    console.error('[UPDATE_TAG_ERROR]', e);
    return { error: 'Error al actualizar la etiqueta.' };
  }
}

/**
 * Server Action to delete a Tag.
 */
export async function deleteTagAction(id: string) {
  try {
    await assertAdminSession();
    await prisma.tag.delete({
      where: { id }
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Etiqueta eliminada con éxito.' };
  } catch (e) {
    console.error('[DELETE_TAG_ERROR]', e);
    return { error: 'Error al eliminar la etiqueta.' };
  }
}

/**
 * Bulk Action: Delete multiple posts.
 */
export async function bulkDeletePostsAction(ids: string[]) {
  try {
    await assertAdminSession();
    if (!ids || ids.length === 0) return { error: 'No se seleccionaron artículos.' };

    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      select: { slug: true }
    });

    await prisma.post.deleteMany({
      where: { id: { in: ids } }
    });

    posts.forEach(p => revalidatePath(`/${p.slug}`));
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/sitemap.xml');
    revalidatePath('/admin/dashboard');

    return { success: true, message: `${ids.length} artículos eliminados con éxito.` };
  } catch (e) {
    console.error('[BULK_DELETE_ERROR]', e);
    return { error: 'Error al eliminar los artículos por lote.' };
  }
}

/**
 * Bulk Action: Change publication status of multiple posts.
 */
export async function bulkPublishPostsAction(ids: string[], publish: boolean) {
  try {
    await assertAdminSession();
    if (!ids || ids.length === 0) return { error: 'No se seleccionaron artículos.' };

    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { published: publish }
    });

    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      select: { slug: true }
    });

    posts.forEach(p => revalidatePath(`/${p.slug}`));
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/sitemap.xml');
    revalidatePath('/admin/dashboard');

    return { success: true, message: `${ids.length} artículos ${publish ? 'publicados' : 'despublicados'} con éxito.` };
  } catch (e) {
    console.error('[BULK_PUBLISH_ERROR]', e);
    return { error: 'Error al cambiar estado de publicación por lote.' };
  }
}

/**
 * Bulk Action: Change category of multiple posts.
 */
export async function bulkChangeCategoryAction(ids: string[], categoryId: string | null) {
  try {
    await assertAdminSession();
    if (!ids || ids.length === 0) return { error: 'No se seleccionaron artículos.' };

    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { categoryId: categoryId || null }
    });

    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      select: { slug: true }
    });

    posts.forEach(p => revalidatePath(`/${p.slug}`));
    revalidatePath('/');
    revalidatePath('/noticias');
    revalidatePath('/sitemap.xml');
    revalidatePath('/admin/dashboard');

    return { success: true, message: `Categoría de ${ids.length} artículos modificada con éxito.` };
  } catch (e) {
    console.error('[BULK_CATEGORY_ERROR]', e);
    return { error: 'Error al cambiar la categoría por lote.' };
  }
}

/**
 * Delete media resource (from disk and database).
 */
export async function deleteMediaAction(id: string, url: string) {
  try {
    await assertAdminSession();
    // Delete from database
    await prisma.media.delete({
      where: { id }
    });

    try {
      await deleteMediaObject(url);
    } catch (err) {
      console.warn(`[DELETE_MEDIA_STORAGE_WARNING] No se pudo borrar el archivo "${url}":`, err);
    }

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Archivo eliminado con éxito de la biblioteca.' };
  } catch (e) {
    console.error('[DELETE_MEDIA_ERROR]', e);
    return { error: 'Error al eliminar el recurso multimedia.' };
  }
}

/**
 * CMS Global: create or update a Departamento.
 */
export async function saveDepartamentoAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const name = String(formData.get('name') || '').trim();
    const slugRaw = String(formData.get('slug') || name);

    if (!name) return { error: 'El nombre del departamento es obligatorio.' };

    const slug = generateCleanSlug(slugRaw);

    const existing = await prisma.departamento.findFirst({
      where: { slug, id: id ? { not: id } : undefined },
    });

    if (existing) return { error: `Ya existe un departamento con el slug "${slug}".` };

    if (id) {
      await prisma.departamento.update({
        where: { id },
        data: { name, slug },
      });
    } else {
      await prisma.departamento.create({
        data: { name, slug },
      });
    }

    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Departamento actualizado.' : 'Departamento creado.' };
  } catch (error) {
    console.error('[SAVE_DEPARTAMENTO_ERROR]', error);
    return { error: 'No se pudo guardar el departamento.' };
  }
}

export async function deleteDepartamentoAction(id: string) {
  try {
    await assertAdminSession();
    await prisma.departamento.delete({ where: { id } });
    revalidateCoreContentPaths();
    return { success: true, message: 'Departamento eliminado.' };
  } catch (error) {
    console.error('[DELETE_DEPARTAMENTO_ERROR]', error);
    return { error: 'No se pudo eliminar. Revisa si aún tiene ciudades asociadas.' };
  }
}

/**
 * CMS Global: create or update a Ciudad.
 */
export async function saveCiudadAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const name = String(formData.get('name') || '').trim();
    const slugRaw = String(formData.get('slug') || name);
    const departamentoId = String(formData.get('departamentoId') || '');

    if (!name || !departamentoId) {
      return { error: 'La ciudad y el departamento son obligatorios.' };
    }

    const slug = generateCleanSlug(slugRaw);

    const existing = await prisma.ciudad.findFirst({
      where: { slug, id: id ? { not: id } : undefined },
    });

    if (existing) return { error: `Ya existe una ciudad con el slug "${slug}".` };

    if (id) {
      await prisma.ciudad.update({
        where: { id },
        data: { name, slug, departamentoId },
      });
      await revalidateCiudadPath(id);
    } else {
      const ciudad = await prisma.ciudad.create({
        data: { name, slug, departamentoId },
      });
      await revalidateCiudadPath(ciudad.id);
    }

    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Ciudad actualizada.' : 'Ciudad creada.' };
  } catch (error) {
    console.error('[SAVE_CIUDAD_ERROR]', error);
    return { error: 'No se pudo guardar la ciudad.' };
  }
}

export async function deleteCiudadAction(id: string) {
  try {
    await assertAdminSession();
    await prisma.ciudad.delete({ where: { id } });
    revalidateCoreContentPaths();
    return { success: true, message: 'Ciudad eliminada.' };
  } catch (error) {
    console.error('[DELETE_CIUDAD_ERROR]', error);
    return { error: 'No se pudo eliminar. La ciudad puede tener trámites, hospitales o leads asociados.' };
  }
}

/**
 * CMS Global: create or update a Procedimiento.
 */
export async function saveProcedimientoAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const title = String(formData.get('title') || '').trim();
    const slugRaw = String(formData.get('slug') || title);
    const description = String(formData.get('description') || '').trim();
    const requisitos = parseLineList(formData.get('requisitos'));
    const metaTitle = String(formData.get('metaTitle') || '').trim();
    const metaDescription = String(formData.get('metaDescription') || '').trim();
    const keywords = parseCsvList(formData.get('keywords'));
    const robotsDirective = String(formData.get('robotsDirective') || 'index, follow').trim();

    if (!title || !description || requisitos.length === 0) {
      return { error: 'Título, descripción y al menos un requisito son obligatorios.' };
    }

    const slug = generateCleanSlug(slugRaw);

    const existing = await prisma.procedimiento.findFirst({
      where: { slug, id: id ? { not: id } : undefined },
    });

    if (existing) return { error: `Ya existe un trámite con el slug "${slug}".` };

    const seoPayload = {
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords,
      robotsDirective: robotsDirective || 'index, follow',
    };

    if (id) {
      const current = await prisma.procedimiento.findUnique({
        where: { id },
        select: { slug: true, seoConfigId: true },
      });

      const data: Prisma.ProcedimientoUpdateInput = {
        title,
        slug,
        description,
        requisitos,
      };

      if (current?.seoConfigId) {
        data.seoConfig = { update: seoPayload };
      } else if (metaTitle || metaDescription || keywords.length > 0) {
        data.seoConfig = { create: seoPayload };
      }

      await prisma.procedimiento.update({
        where: { id },
        data,
      });

      if (current?.slug && current.slug !== slug) {
        revalidatePath(`/tramites/${current.slug}`);
      }

      await revalidateProcedimientoPath(id);
    } else {
      const data: Prisma.ProcedimientoCreateInput = {
        title,
        slug,
        description,
        requisitos,
      };

      if (metaTitle || metaDescription || keywords.length > 0) {
        data.seoConfig = { create: seoPayload };
      }

      const procedimiento = await prisma.procedimiento.create({ data });
      await revalidateProcedimientoPath(procedimiento.id);
    }

    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Trámite actualizado.' : 'Trámite creado.' };
  } catch (error) {
    console.error('[SAVE_PROCEDIMIENTO_ERROR]', error);
    return { error: 'No se pudo guardar el trámite.' };
  }
}

export async function deleteProcedimientoAction(id: string) {
  try {
    await assertAdminSession();
    const procedimiento = await prisma.procedimiento.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.procedimiento.delete({ where: { id } });

    if (procedimiento) revalidatePath(`/tramites/${procedimiento.slug}`);
    revalidateCoreContentPaths();
    return { success: true, message: 'Trámite eliminado.' };
  } catch (error) {
    console.error('[DELETE_PROCEDIMIENTO_ERROR]', error);
    return { error: 'No se pudo eliminar el trámite.' };
  }
}

/**
 * CMS Global: create or update a pSEO relationship (Procedimiento x Ciudad).
 */
export async function saveProcedimientoCiudadAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const procedimientoId = String(formData.get('procedimientoId') || '');
    const ciudadId = String(formData.get('ciudadId') || '');
    const costo = Number(String(formData.get('costo') || '0').replace(',', '.'));
    const pasos = parsePipeJsonList(formData.get('pasos'), 'titulo', 'descripcion');
    const faq = parsePipeJsonList(formData.get('faq'), 'question', 'answer');

    if (!procedimientoId || !ciudadId) {
      return { error: 'Selecciona trámite y ciudad.' };
    }

    if (Number.isNaN(costo) || costo < 0) {
      return { error: 'El costo debe ser un número válido.' };
    }

    const payload = {
      procedimientoId,
      ciudadId,
      costo,
      pasos: pasos as Prisma.InputJsonValue,
      faq: faq as Prisma.InputJsonValue,
    };

    if (id) {
      await prisma.procedimientoCiudad.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.procedimientoCiudad.create({
        data: payload,
      });
    }

    await revalidateProcedimientoPath(procedimientoId);
    await revalidateCiudadPath(ciudadId);
    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Página pSEO actualizada.' : 'Página pSEO creada.' };
  } catch (error) {
    console.error('[SAVE_PROCEDIMIENTO_CIUDAD_ERROR]', error);
    return { error: 'No se pudo guardar la relación pSEO. Revisa si ya existe esa combinación.' };
  }
}

export async function deleteProcedimientoCiudadAction(id: string) {
  try {
    await assertAdminSession();
    const rel = await prisma.procedimientoCiudad.findUnique({
      where: { id },
      select: { procedimientoId: true, ciudadId: true },
    });

    await prisma.sedeOficina.updateMany({
      where: { procedimientoCiudadId: id },
      data: { procedimientoCiudadId: null },
    });

    await prisma.procedimientoCiudad.delete({ where: { id } });

    if (rel) {
      await revalidateProcedimientoPath(rel.procedimientoId);
      await revalidateCiudadPath(rel.ciudadId);
    }

    revalidateCoreContentPaths();
    return { success: true, message: 'Página pSEO eliminada.' };
  } catch (error) {
    console.error('[DELETE_PROCEDIMIENTO_CIUDAD_ERROR]', error);
    return { error: 'No se pudo eliminar la página pSEO.' };
  }
}

/**
 * CMS Global: create or update an office / physical service location.
 */
export async function saveSedeOficinaAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const nombre = String(formData.get('nombre') || '').trim();
    const direccion = String(formData.get('direccion') || '').trim();
    const horario = String(formData.get('horario') || '').trim();
    const contacto = String(formData.get('contacto') || '').trim();
    const ciudadId = String(formData.get('ciudadId') || '');
    const procedimientoCiudadId = String(formData.get('procedimientoCiudadId') || '');
    const latitudRaw = String(formData.get('latitud') || '').trim();
    const longitudRaw = String(formData.get('longitud') || '').trim();

    if (!nombre || !direccion || !horario || !ciudadId) {
      return { error: 'Nombre, dirección, horario y ciudad son obligatorios.' };
    }

    const latitud = latitudRaw ? Number(latitudRaw.replace(',', '.')) : null;
    const longitud = longitudRaw ? Number(longitudRaw.replace(',', '.')) : null;

    if ((latitudRaw && Number.isNaN(latitud)) || (longitudRaw && Number.isNaN(longitud))) {
      return { error: 'Latitud y longitud deben ser números válidos.' };
    }

    const payload = {
      nombre,
      direccion,
      horario,
      contacto: contacto || null,
      ciudadId,
      procedimientoCiudadId: procedimientoCiudadId || null,
      latitud,
      longitud,
    };

    if (id) {
      await prisma.sedeOficina.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.sedeOficina.create({
        data: payload,
      });
    }

    await revalidateCiudadPath(ciudadId);
    if (procedimientoCiudadId) {
      const rel = await prisma.procedimientoCiudad.findUnique({
        where: { id: procedimientoCiudadId },
        select: { procedimientoId: true },
      });
      if (rel) await revalidateProcedimientoPath(rel.procedimientoId);
    }
    revalidateCoreContentPaths();

    return { success: true, message: id ? 'Sede actualizada.' : 'Sede creada.' };
  } catch (error) {
    console.error('[SAVE_SEDE_OFICINA_ERROR]', error);
    return { error: 'No se pudo guardar la sede.' };
  }
}

export async function deleteSedeOficinaAction(id: string) {
  try {
    await assertAdminSession();
    const sede = await prisma.sedeOficina.findUnique({
      where: { id },
      select: {
        ciudadId: true,
        procedimientoCiudad: {
          select: { procedimientoId: true },
        },
      },
    });

    await prisma.sedeOficina.delete({ where: { id } });

    if (sede) {
      await revalidateCiudadPath(sede.ciudadId);
      if (sede.procedimientoCiudad) {
        await revalidateProcedimientoPath(sede.procedimientoCiudad.procedimientoId);
      }
    }
    revalidateCoreContentPaths();
    return { success: true, message: 'Sede eliminada.' };
  } catch (error) {
    console.error('[DELETE_SEDE_OFICINA_ERROR]', error);
    return { error: 'No se pudo eliminar la sede.' };
  }
}

/**
 * CMS Global: create or update a Hospital.
 */
export async function saveHospitalAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const nombre = String(formData.get('nombre') || '').trim();
    const slugRaw = String(formData.get('slug') || nombre);
    const tipo = String(formData.get('tipo') || '').trim();
    const direccion = String(formData.get('direccion') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const ciudadId = String(formData.get('ciudadId') || '');
    const horario24h = String(formData.get('horario24h') || '') === 'true';

    if (!nombre || !tipo || !direccion || !ciudadId) {
      return { error: 'Nombre, tipo, dirección y ciudad son obligatorios.' };
    }

    const slug = generateCleanSlug(slugRaw);

    const existing = await prisma.hospital.findFirst({
      where: { slug, id: id ? { not: id } : undefined },
    });

    if (existing) return { error: `Ya existe un hospital con el slug "${slug}".` };

    const payload = {
      nombre,
      slug,
      tipo,
      direccion,
      telefono: telefono || null,
      horario24h,
      ciudadId,
    };

    if (id) {
      await prisma.hospital.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.hospital.create({
        data: payload,
      });
    }

    await revalidateCiudadPath(ciudadId);
    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Centro de salud actualizado.' : 'Centro de salud creado.' };
  } catch (error) {
    console.error('[SAVE_HOSPITAL_ERROR]', error);
    return { error: 'No se pudo guardar el centro de salud.' };
  }
}

export async function deleteHospitalAction(id: string) {
  try {
    await assertAdminSession();
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      select: { ciudadId: true },
    });

    await prisma.hospital.delete({ where: { id } });

    if (hospital) await revalidateCiudadPath(hospital.ciudadId);
    revalidateCoreContentPaths();
    return { success: true, message: 'Centro de salud eliminado.' };
  } catch (error) {
    console.error('[DELETE_HOSPITAL_ERROR]', error);
    return { error: 'No se pudo eliminar el centro de salud.' };
  }
}

/**
 * CMS Global: technical SEO maintenance.
 */
export async function revalidateSiteAction() {
  try {
    await assertAdminSession();
    revalidateCoreContentPaths();
    revalidatePath('/noticias');
    revalidatePath('/robots.txt');
    return { success: true, message: 'Caché principal, sitemap y páginas estratégicas revalidadas.' };
  } catch (error) {
    console.error('[REVALIDATE_SITE_ERROR]', error);
    return { error: 'No se pudo revalidar el sitio.' };
  }
}

/**
 * CMS Global: editable copy, ticker and footer for the public site.
 */
export async function saveSiteSettingsAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const fallback = mergeSiteSettings(defaultSiteSettings);
    const takeString = (key: string, fallbackValue: string) => {
      const value = String(formData.get(key) || '').trim();
      return value || fallbackValue;
    };

    const tickerItems = parseLineList(formData.get('tickerItems'));
    const trustBadges = parseLineList(formData.get('trustBadges'));
    const seoKeywords = parseCsvList(formData.get('seoKeywords'));
    const navLinks = parsePipeJsonList(formData.get('navLinks'), 'label', 'href')
      .map((item) => ({
        label: String(item.label || '').trim(),
        href: String(item.href || '').trim(),
      }))
      .filter((item) => item.label && item.href);

    const settings: SiteSettings = {
      tickerItems: tickerItems.length > 0 ? tickerItems : fallback.tickerItems,
      footerDescription: takeString('footerDescription', fallback.footerDescription),
      footerLegalText: takeString('footerLegalText', fallback.footerLegalText),
      footerLegalLinkLabel: takeString('footerLegalLinkLabel', fallback.footerLegalLinkLabel),
      footerLegalLinkHref: takeString('footerLegalLinkHref', fallback.footerLegalLinkHref),
      footerSecurityLabel: takeString('footerSecurityLabel', fallback.footerSecurityLabel),
      home: {
        eyebrow: takeString('homeEyebrow', fallback.home.eyebrow),
        titleLine1: takeString('homeTitleLine1', fallback.home.titleLine1),
        titleLine2: takeString('homeTitleLine2', fallback.home.titleLine2),
        accent: takeString('homeAccent', fallback.home.accent),
        description: takeString('homeDescription', fallback.home.description),
        primaryCtaLabel: takeString('homePrimaryCtaLabel', fallback.home.primaryCtaLabel),
        primaryCtaHref: takeString('homePrimaryCtaHref', fallback.home.primaryCtaHref),
        secondaryCtaLabel: takeString('homeSecondaryCtaLabel', fallback.home.secondaryCtaLabel),
        secondaryCtaHref: takeString('homeSecondaryCtaHref', fallback.home.secondaryCtaHref),
        trustBadges: trustBadges.length > 0 ? trustBadges : fallback.home.trustBadges,
      },
      navigation: {
        brandPrefix: takeString('navBrandPrefix', fallback.navigation.brandPrefix),
        brandName: takeString('navBrandName', fallback.navigation.brandName),
        brandAccent: takeString('navBrandAccent', fallback.navigation.brandAccent),
        ctaLabel: takeString('navCtaLabel', fallback.navigation.ctaLabel),
        ctaHref: takeString('navCtaHref', fallback.navigation.ctaHref),
        links: navLinks.length > 0 ? navLinks : fallback.navigation.links,
      },
      seo: {
        siteName: takeString('seoSiteName', fallback.seo.siteName),
        titleDefault: takeString('seoTitleDefault', fallback.seo.titleDefault),
        titleTemplate: takeString('seoTitleTemplate', fallback.seo.titleTemplate),
        description: takeString('seoDescription', fallback.seo.description),
        keywords: seoKeywords.length > 0 ? seoKeywords : fallback.seo.keywords,
        ogTitle: takeString('seoOgTitle', fallback.seo.ogTitle),
        ogDescription: takeString('seoOgDescription', fallback.seo.ogDescription),
        ogImage: takeString('seoOgImage', fallback.seo.ogImage),
        twitterTitle: takeString('seoTwitterTitle', fallback.seo.twitterTitle),
        twitterDescription: takeString('seoTwitterDescription', fallback.seo.twitterDescription),
      },
    };

    await prisma.siteSetting.upsert({
      where: { key: SITE_SETTINGS_KEY },
      create: {
        key: SITE_SETTINGS_KEY,
        value: settings as unknown as Prisma.InputJsonValue,
      },
      update: {
        value: settings as unknown as Prisma.InputJsonValue,
      },
    });

    revalidateCoreContentPaths();
    revalidatePath('/noticias');
    return { success: true, message: 'Configuración global del sitio guardada.' };
  } catch (error) {
    console.error('[SAVE_SITE_SETTINGS_ERROR]', error);
    return { error: 'No se pudo guardar la configuración global del sitio.' };
  }
}

/**
 * CMS Global: create or update a job listing.
 */
export async function saveJobListingAction(_prevState: FormActionState, formData: FormData) {
  try {
    await assertAdminSession();
    const id = formData.get('id') as string;
    const title = String(formData.get('title') || '').trim();
    const slugRaw = String(formData.get('slug') || title);
    const company = String(formData.get('company') || '').trim();
    const cityId = String(formData.get('cityId') || '');
    const sectorId = String(formData.get('sectorId') || '');
    const type = String(formData.get('type') || 'Full-time').trim();
    const salaryRange = String(formData.get('salaryRange') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const requirements = parseLineList(formData.get('requirements'));
    const published = String(formData.get('published') || '') === 'true';
    const metaTitle = String(formData.get('metaTitle') || '').trim();
    const metaDescription = String(formData.get('metaDescription') || '').trim();
    const expiresAtRaw = String(formData.get('expiresAt') || '').trim();

    if (!title || !company || !cityId || !sectorId || !salaryRange || !description || requirements.length === 0) {
      return { error: 'Completa título, empresa, ciudad, sector, salario, descripción y requisitos.' };
    }

    const slug = generateCleanSlug(slugRaw);
    const existing = await prisma.jobListing.findFirst({
      where: { slug, id: id ? { not: id } : undefined },
    });

    if (existing) return { error: `Ya existe una vacante con el slug "${slug}".` };

    const payload = {
      title,
      slug,
      company,
      cityId,
      sectorId,
      sectorName: sectorNameMap[sectorId] || sectorId,
      type,
      salaryRange,
      description,
      requirements,
      published,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    };

    if (id) {
      await prisma.jobListing.update({
        where: { id },
        data: payload,
      });
    } else {
      await prisma.jobListing.create({
        data: payload,
      });
    }

    await revalidateCiudadPath(cityId);
    revalidateCoreContentPaths();
    return { success: true, message: id ? 'Vacante actualizada.' : 'Vacante creada.' };
  } catch (error) {
    console.error('[SAVE_JOB_LISTING_ERROR]', error);
    return { error: 'No se pudo guardar la vacante.' };
  }
}

export async function deleteJobListingAction(id: string) {
  try {
    await assertAdminSession();
    const job = await prisma.jobListing.findUnique({
      where: { id },
      select: { cityId: true },
    });

    await prisma.jobListing.delete({ where: { id } });

    if (job) await revalidateCiudadPath(job.cityId);
    revalidateCoreContentPaths();
    return { success: true, message: 'Vacante eliminada.' };
  } catch (error) {
    console.error('[DELETE_JOB_LISTING_ERROR]', error);
    return { error: 'No se pudo eliminar la vacante.' };
  }
}
