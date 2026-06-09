import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * Webhook seguro para revalidación bajo demanda.
 * Acepta token por query (?secret=) o Authorization: Bearer <token>.
 */
export async function POST(request: NextRequest) {
  try {
    const querySecret = request.nextUrl.searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;
    const providedSecret = bearerSecret || querySecret;
    const expectedSecret = process.env.REVALIDATION_SECRET;

    if (!expectedSecret) {
      return NextResponse.json({ message: 'REVALIDATION_SECRET no configurado.' }, { status: 503 });
    }

    if (providedSecret !== expectedSecret) {
      return NextResponse.json({ message: 'Token de revalidación inválido.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tagToRevalidate = typeof body.tag === 'string' && body.tag.trim() ? body.tag.trim() : 'cms-content';
    const pathToRevalidate = typeof body.path === 'string' && body.path.startsWith('/') ? body.path : null;

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
      console.log(`[REVALIDATION] Ruta purgada: ${pathToRevalidate}`);
    } else {
      revalidateTag(tagToRevalidate);
      console.log(`[REVALIDATION] Tag purgada: ${tagToRevalidate}`);
    }

    return NextResponse.json({
      revalidated: true,
      tag: pathToRevalidate ? null : tagToRevalidate,
      path: pathToRevalidate,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[REVALIDATION_WEBHOOK_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
