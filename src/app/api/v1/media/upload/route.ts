import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { uploadMediaObject } from '@/lib/media-storage';

export const dynamic = 'force-dynamic';

const allowedImageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(req);
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
    }

    const extension = allowedImageTypes[file.type];
    if (!extension) {
      return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG, WebP o GIF.' }, { status: 400 });
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'La imagen excede el límite permitido de 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await uploadMediaObject({
      buffer,
      originalName: file.name || 'imagen',
      mimeType: file.type,
      extension,
    });

    const media = await prisma.media.create({
      data: {
        filename: file.name || upload.key,
        url: upload.url,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({ success: true, url: upload.url, media, provider: upload.provider });
  } catch (error) {
    console.error('[MEDIA_UPLOAD_API_ERROR]', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la carga.' }, { status: 500 });
  }
}
