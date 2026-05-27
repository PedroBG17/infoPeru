// src/lib/rate-limiter.ts
import { redis } from './cache';

interface RateLimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate Limiter basado en Token Bucket optimizado para Vercel Edge Runtime.
 * @param identifier Identificador único (por ejemplo: IP o hash de usuario).
 * @param limit Número máximo de solicitudes permitidas dentro del periodo.
 * @param durationInSeconds Duración de la ventana de tiempo en segundos.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 60,
  durationInSeconds: number = 60
): Promise<RateLimitResponse> {
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const reset = now + durationInSeconds;

  try {
    const transaction = redis.multi();
    transaction.incr(key);
    transaction.ttl(key);

    const [countResult, ttlResult] = (await transaction.exec()) as [number, number];

    if (countResult === 1) {
      await redis.expire(key, durationInSeconds);
    }

    const remaining = Math.max(0, limit - countResult);

    return {
      success: countResult <= limit,
      limit,
      remaining,
      reset: ttlResult > 0 ? now + ttlResult : reset,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fallback permisivo en caso de error en Redis para no bloquear usuarios legítimos
    return {
      success: true,
      limit,
      remaining: 1,
      reset,
    };
  }
}
