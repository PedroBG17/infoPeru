import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const requiredRuntimeEnv = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CRON_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
  'REVALIDATION_SECRET',
  'MEDIA_STORAGE_PROVIDER',
];

export async function GET() {
  const started = Date.now();
  const missingEnv = getMissingRuntimeEnv();
  let database = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = 'error';
    console.error('[HEALTH_DATABASE_ERROR]', error);
  }

  const ok = database === 'ok' && missingEnv.length === 0;

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      checks: {
        database,
        env: missingEnv.length === 0 ? 'ok' : 'missing',
      },
      missingEnv: process.env.NODE_ENV === 'production' ? undefined : missingEnv,
      uptimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
}

function getMissingRuntimeEnv() {
  const missing = requiredRuntimeEnv.filter((key) => !process.env[key]);

  if (process.env.MEDIA_STORAGE_PROVIDER === 'supabase') {
    for (const key of [
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_STORAGE_BUCKET',
    ]) {
      if (!process.env[key]) missing.push(key);
    }
  }

  return missing;
}
