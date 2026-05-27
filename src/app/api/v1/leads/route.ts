// src/app/api/v1/leads/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^9[0-9]{8}$/, 'Teléfono móvil inválido en Perú'),
  message: z.string().max(500).optional(),
  cityId: z.string().uuid(),
  sectorId: z.string(),
  consent: z.literal(true),
});

// Función nativa y ligera de sanitización para entornos serverless (evita emulaciones de DOM pesadas)
function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Eliminar etiquetas HTML
    .replace(/[&<>"']/g, (m) => {
      // Codificar caracteres HTML especiales
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return m;
      }
    })
    .trim();
}

/**
 * Route Handler para registrar prospectos (Leads) de monetización.
 * Valida de forma estricta los datos usando Zod, sanitiza inyecciones XSS
 * y previene ataques de envío masivo (Antispam) consultando envíos previos en cortos rangos de tiempo.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validación estricta con Zod
    const validation = leadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación de campos fallida', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Sanitización completa de strings sensibles
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedEmail = data.email.toLowerCase().trim();
    const sanitizedPhone = data.phone.trim();
    const sanitizedMessage = data.message ? sanitizeInput(data.message) : '';


    // 3. Control Antispam: Verificar si existe el mismo correo enviado hace menos de 5 minutos
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: sanitizedEmail,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Ventana de 5 minutos
        },
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Ya has enviado una solicitud recientemente. Por favor, intenta de nuevo en unos minutos.' },
        { status: 429 }
      );
    }

    // 4. Inserción parametrizada en PostgreSQL
    const lead = await prisma.lead.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        cityId: data.cityId,
        sectorId: data.sectorId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Prospecto registrado exitosamente.', leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[LEADS_ROUTE_HANDLER_ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Intente de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
