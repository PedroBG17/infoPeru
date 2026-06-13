import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Cron Worker para actualizar costos TUPA oficialmente.
 * Ejecutado periódicamente (ej. vía Vercel Crons o GitHub Actions).
 * 
 * Ruta: /api/v1/cron/update-costs
 */
export async function GET(request: Request) {
  try {
    // 1. Verificación de Seguridad vía Token Secreto en Cabeceras
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET no configurado.' },
        { status: 503 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado. Token de seguridad inválido o ausente.' },
        { status: 401 }
      );
    }

    console.log('[CRON_START] Iniciando verificación segura de costos TUPA...');

    // 2. Obtener todos los ProcedimientoCiudad registrados.
    // Produccion no debe modificar tasas sin una fuente oficial estructurada.
    // Este cron se limita a revisar registros y refrescar rutas ISR.
    const rels = await prisma.procedimientoCiudad.findMany({
      include: {
        procedimiento: true,
        ciudad: true,
      },
    });

    const revalidatedPaths = [];

    // 3. Revalidar paginas publicas dependientes de costos.
    for (const rel of rels) {
      const path = `/tramites/${rel.procedimiento.slug}/${rel.ciudad.slug}`;
      revalidatePath(path);
      revalidatedPaths.push(path);
    }

    revalidatePath('/tramites');
    revalidatePath('/todos');

    // 4. Registrar en el log de auditoría (AnalyticsLog)
    await prisma.analyticsLog.create({
      data: {
        path: '/api/v1/cron/update-costs',
        referrer: 'Vercel Cron Worker',
        device: 'Serverless Worker',
        ciudadIp: 'AWS/Vercel Edge',
      },
    });

    console.log(`[CRON_SUCCESS] Verificación completa. Se revisaron ${rels.length} páginas locales.`);

    return NextResponse.json({
      success: true,
      mode: 'safe-cache-refresh',
      message: 'Verificación segura completada. No se modifican tasas sin fuente oficial estructurada.',
      checkedCount: rels.length,
      updatedCount: 0,
      revalidatedCount: revalidatedPaths.length + 2,
      revalidatedPaths: revalidatedPaths.slice(0, 50),
    });
  } catch (error) {
    console.error('[CRON_ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor durante la ejecución del cron.' },
      { status: 500 }
    );
  }
}
