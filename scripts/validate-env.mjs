import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const productionMode = args.has('--production') || process.env.NODE_ENV === 'production';
const envFiles = productionMode
  ? ['.env', '.env.local', '.env.production', '.env.production.local', path.join('.vercel', '.env.production.local')]
  : ['.env', '.env.local'];
const env = {
  ...Object.assign({}, ...envFiles.map((file) => loadDotEnv(file))),
  ...process.env,
};

const requiredBase = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CRON_SECRET',
  'REVALIDATION_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
  'MEDIA_STORAGE_PROVIDER',
];

const requiredSupabaseStorage = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
];

const missing = [];
const warnings = [];

for (const key of requiredBase) {
  if (!hasRealValue(env[key])) missing.push(key);
}

if (env.DATABASE_URL && !String(env.DATABASE_URL).startsWith('postgresql://')) {
  warnings.push('DATABASE_URL no parece ser una URL PostgreSQL.');
}

if (env.NEXT_PUBLIC_SITE_URL && !String(env.NEXT_PUBLIC_SITE_URL).startsWith('https://')) {
  warnings.push('NEXT_PUBLIC_SITE_URL deberia usar HTTPS en produccion.');
}

if (env.ADMIN_SESSION_SECRET && String(env.ADMIN_SESSION_SECRET).length < 32) {
  missing.push('ADMIN_SESSION_SECRET (minimo 32 caracteres)');
}

if (env.ADMIN_PASSWORD_HASH && !String(env.ADMIN_PASSWORD_HASH).startsWith('scrypt:')) {
  missing.push('ADMIN_PASSWORD_HASH (debe usar formato scrypt)');
}

const mediaProvider = env.MEDIA_STORAGE_PROVIDER || 'local';
if (!['local', 'supabase'].includes(mediaProvider)) {
  missing.push('MEDIA_STORAGE_PROVIDER (local o supabase)');
}

if (mediaProvider === 'supabase' || productionMode) {
  for (const key of requiredSupabaseStorage) {
    if (!hasRealValue(env[key])) missing.push(key);
  }
}

if (productionMode && mediaProvider !== 'supabase') {
  missing.push('MEDIA_STORAGE_PROVIDER (debe ser supabase para produccion)');
}

if (env.SUPABASE_STORAGE_PUBLIC_URL && !String(env.SUPABASE_STORAGE_PUBLIC_URL).startsWith('https://')) {
  warnings.push('SUPABASE_STORAGE_PUBLIC_URL deberia usar HTTPS.');
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (missing.length > 0) {
  console.error('FAIL Variables invalidas o faltantes:');
  for (const key of [...new Set(missing)]) {
    console.error(`- ${key}`);
  }
  process.exitCode = 1;
} else {
  console.log(`PASS entorno ${productionMode ? 'produccion' : 'local'} validado`);
}

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
    const key = trimmed.slice(0, index).trim();
    const value = stripQuotes(trimmed.slice(index + 1).trim());
    if (value) result[key] = value;
  }

  return result;
}

function hasRealValue(value) {
  const normalized = stripQuotes(value);
  return Boolean(
    normalized &&
      !normalized.includes('YOUR_') &&
      !normalized.includes('CHANGE_ME') &&
      !normalized.includes('TU_') &&
      !normalized.includes('PROJECT_ID') &&
      !normalized.includes('PASSWORD')
  );
}

function stripQuotes(value) {
  return String(value || '').replace(/^["']|["']$/g, '');
}
