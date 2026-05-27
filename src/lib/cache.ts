// src/lib/cache.ts
import { Redis } from '@upstash/redis';

/**
 * Cliente de Upstash Redis inicializado para ser compatible con Edge Runtimes y funciones serverless normales.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
