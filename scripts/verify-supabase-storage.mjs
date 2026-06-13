import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = {
  ...loadDotEnv('.env'),
  ...loadDotEnv('.env.local'),
  ...loadDotEnv('.env.production.local'),
  ...loadDotEnv(path.join('.vercel', '.env.production.local')),
  ...process.env,
};

const supabaseUrl = stripQuotes(env.NEXT_PUBLIC_SUPABASE_URL);
const serviceRoleKey = stripQuotes(env.SUPABASE_SERVICE_ROLE_KEY);
const bucket = stripQuotes(env.SUPABASE_STORAGE_BUCKET || 'media');

if (!supabaseUrl || !serviceRoleKey || !bucket) {
  console.error('FAIL faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o SUPABASE_STORAGE_BUCKET.');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data, error } = await client.storage.getBucket(bucket);

if (error || !data) {
  console.error(`FAIL no se pudo acceder al bucket "${bucket}".`);
  if (error?.message) console.error(error.message);
  process.exit(1);
}

if (!data.public) {
  console.error(`FAIL el bucket "${bucket}" existe, pero no es publico. Las imagenes del CMS no renderizaran publicamente.`);
  process.exit(1);
}

const key = `_health/dataperu-storage-check-${Date.now()}.txt`;
const { error: uploadError } = await client.storage.from(bucket).upload(key, new Blob(['ok'], { type: 'text/plain' }), {
  contentType: 'text/plain',
  upsert: false,
});

if (uploadError) {
  console.error(`FAIL no se pudo subir un objeto temporal al bucket "${bucket}".`);
  console.error(uploadError.message);
  process.exit(1);
}

const publicUrl = client.storage.from(bucket).getPublicUrl(key).data.publicUrl;
const publicResponse = await fetch(publicUrl).catch(() => null);

const { error: removeError } = await client.storage.from(bucket).remove([key]);
if (removeError) {
  console.error(`FAIL se subio el objeto temporal, pero no se pudo borrar: ${key}`);
  console.error(removeError.message);
  process.exit(1);
}

if (!publicResponse?.ok) {
  console.error(`FAIL el bucket "${bucket}" sube archivos, pero la URL publica no responde correctamente.`);
  process.exit(1);
}

console.log(`PASS bucket Supabase Storage publico con escritura, lectura y borrado: ${bucket}`);

function loadDotEnv(file) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return {};

  const result = {};
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const value = stripQuotes(trimmed.slice(index + 1).trim());
    if (value) result[trimmed.slice(0, index).trim()] = value;
  }
  return result;
}

function stripQuotes(value) {
  return String(value || '').replace(/^["']|["']$/g, '');
}
