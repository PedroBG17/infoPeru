import { prisma } from '@/lib/db';

export async function getProcedimientoBySlug(slug: string) {
  return prisma.procedimiento.findUnique({
    where: { slug },
    include: {
      seoConfig: true,
    },
  });
}

export async function getProcedimientoCiudad(tramiteSlug: string, ciudadSlug: string) {
  return prisma.procedimientoCiudad.findFirst({
    where: {
      procedimiento: { slug: tramiteSlug },
      ciudad: { slug: ciudadSlug },
    },
    include: {
      procedimiento: true,
      ciudad: {
        include: {
          departamento: true,
        },
      },
      sedes: true,
    },
  });
}

export async function getOtherProcedimientosInCiudad(ciudadSlug: string, excludeSlug?: string) {
  return prisma.procedimientoCiudad.findMany({
    where: {
      ciudad: { slug: ciudadSlug },
      NOT: excludeSlug ? { procedimiento: { slug: excludeSlug } } : undefined,
    },
    include: {
      procedimiento: true,
      ciudad: true,
    },
    take: 6,
  });
}
