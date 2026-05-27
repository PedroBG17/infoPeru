import { prisma } from '@/lib/db';

export async function getHospitalesByCiudad(ciudadSlug: string) {
  return prisma.hospital.findMany({
    where: {
      ciudad: { slug: ciudadSlug },
    },
    include: {
      ciudad: {
        include: {
          departamento: true,
        },
      },
    },
    orderBy: {
      nombre: 'asc',
    },
  });
}

export async function getCiudadWithDepartamento(ciudadSlug: string) {
  return prisma.ciudad.findUnique({
    where: { slug: ciudadSlug },
    include: {
      departamento: true,
    },
  });
}

export async function getHospitalBySlug(slug: string) {
  return prisma.hospital.findUnique({
    where: { slug },
    include: {
      ciudad: true,
    },
  });
}
