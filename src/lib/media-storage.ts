import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export type MediaStorageUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  extension: string;
};

export type MediaStorageUploadResult = {
  url: string;
  key: string;
  provider: 'local' | 'supabase';
};

function storageProvider(): 'local' | 'supabase' {
  return process.env.MEDIA_STORAGE_PROVIDER === 'supabase' ? 'supabase' : 'local';
}

function supabaseStorageConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
  const publicUrl = (process.env.SUPABASE_STORAGE_PUBLIC_URL || '').replace(/\/$/, '');

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
    publicUrl,
    configured: Boolean(supabaseUrl && serviceRoleKey && bucket),
  };
}

function createSupabaseStorageClient() {
  const config = supabaseStorageConfig();
  if (!config.configured) {
    throw new Error('Supabase Storage no esta configurado. Revisa SUPABASE_SERVICE_ROLE_KEY y SUPABASE_STORAGE_BUCKET.');
  }

  return {
    config,
    client: createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

function safeObjectName(originalName: string, extension: string) {
  const baseName = (
    path
      .basename(originalName || 'imagen', path.extname(originalName || 'imagen'))
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'imagen'
  );

  return `${baseName}-${randomUUID()}${extension}`;
}

export async function uploadMediaObject(input: MediaStorageUploadInput): Promise<MediaStorageUploadResult> {
  const filename = safeObjectName(input.originalName, input.extension);

  if (storageProvider() === 'supabase') {
    return uploadToSupabase(input, filename);
  }

  return uploadToLocal(input, filename);
}

export async function deleteMediaObject(url: string) {
  if (url.startsWith('/uploads/')) {
    const filepath = path.join(process.cwd(), 'public', url);
    await fs.unlink(filepath);
    return;
  }

  if (storageProvider() !== 'supabase') return;

  const key = extractSupabaseStorageKey(url);
  if (!key) return;

  const { config, client } = createSupabaseStorageClient();
  const { error } = await client.storage.from(config.bucket).remove([key]);
  if (error) throw error;
}

async function uploadToLocal(input: MediaStorageUploadInput, filename: string): Promise<MediaStorageUploadResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, input.buffer);

  return {
    url: `/uploads/${filename}`,
    key: `uploads/${filename}`,
    provider: 'local',
  };
}

async function uploadToSupabase(input: MediaStorageUploadInput, filename: string): Promise<MediaStorageUploadResult> {
  const { config, client } = createSupabaseStorageClient();
  const key = `uploads/${filename}`;

  const { error } = await client.storage.from(config.bucket).upload(key, input.buffer, {
    contentType: input.mimeType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const url = config.publicUrl
    ? `${config.publicUrl}/${key}`
    : client.storage.from(config.bucket).getPublicUrl(key).data.publicUrl;

  return {
    url,
    key,
    provider: 'supabase',
  };
}

function extractSupabaseStorageKey(url: string) {
  const config = supabaseStorageConfig();

  if (config.publicUrl && url.startsWith(`${config.publicUrl}/`)) {
    return decodeURIComponent(url.slice(`${config.publicUrl}/`.length));
  }

  const publicMarker = `/storage/v1/object/public/${config.bucket}/`;
  const markerIndex = url.indexOf(publicMarker);
  if (markerIndex !== -1) {
    return decodeURIComponent(url.slice(markerIndex + publicMarker.length));
  }

  return null;
}
