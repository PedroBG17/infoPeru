// src/app/api/v1/webhooks/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Endpoint de Webhook seguro para revalidación de caché bajo demanda (On-Demand ISR).
 * Es accionado por webhooks externos provenientes de Headless WordPress (o Supabase) 
 * cuando hay publicaciones actualizadas, eliminando la caché de la tag 'cms-content'.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATION_SECRET;

    // Validación de seguridad para prevenir llamadas no autorizadas
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ message: 'Token de revalidación inválido.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tagToRevalidate = body.tag || 'cms-content';
    const pathToRevalidate = body.path;

    if (pathToRevalidate) {
      // Revalidar una ruta específica (ej: /guia-afiliacion-sis)
      revalidatePath(pathToRevalidate);
      console.log(`[REVALIDATION] Ruta purgada con éxito: ${pathToRevalidate}`);
    } else {
      // Revalidar una etiqueta de caché global
      revalidateTag(tagToRevalidate);
      console.log(`[REVALIDATION] Tag purgada con éxito: ${tagToRevalidate}`);
    }

    return NextResponse.json({ 
      revalidated: true, 
      tag: pathToRevalidate ? null : tagToRevalidate,
      path: pathToRevalidate || null,
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('Error during cache revalidation webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
