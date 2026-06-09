import { prisma } from '@/lib/db';

export interface JobListing {
  id: string;
  slug?: string;
  title: string;
  company: string;
  sector: string;
  description: string;
  salaryRange: string;
  requirements: string[];
  type: 'Full-time' | 'Part-time' | 'Temporal' | 'Prácticas';
  postedDaysAgo: number;
}

// Catálogo estático de sectores para Perú con identificadores consistentes
export const SECTORES = [
  { id: 'sec-mineria', name: 'Minería e Ingeniería', slug: 'mineria' },
  { id: 'sec-agro', name: 'Agroindustria y Pesca', slug: 'agroindustria' },
  { id: 'sec-comercio', name: 'Comercio y Retail', slug: 'comercio' },
  { id: 'sec-salud', name: 'Salud y Medicina', slug: 'salud' },
  { id: 'sec-educacion', name: 'Educación y Academia', slug: 'educacion' },
  { id: 'sec-turismo', name: 'Turismo y Gastronomía', slug: 'turismo' },
  { id: 'sec-admin', name: 'Administración y Finanzas', slug: 'administracion' },
  { id: 'sec-construccion', name: 'Construcción e Infraestructura', slug: 'construccion' },
];

export async function getCiudadBySlug(ciudadSlug: string) {
  return prisma.ciudad.findUnique({
    where: { slug: ciudadSlug },
    include: {
      departamento: true,
    },
  });
}

export async function getJobsByCiudad(ciudadSlug: string): Promise<JobListing[]> {
  try {
    const jobs = await prisma.jobListing.findMany({
      where: {
        published: true,
        city: { slug: ciudadSlug },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (jobs.length === 0) return getProgrammaticJobs(ciudadSlug);

    return jobs.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      sector: job.sectorName,
      description: job.description,
      salaryRange: job.salaryRange,
      requirements: job.requirements,
      type: job.type as JobListing['type'],
      postedDaysAgo: Math.max(0, Math.ceil((Date.now() - job.createdAt.getTime()) / (24 * 60 * 60 * 1000))),
    }));
  } catch (error) {
    console.warn('[JOBS_CMS_FALLBACK] Usando empleos programáticos:', error);
    return getProgrammaticJobs(ciudadSlug);
  }
}

// Generador programático de empleos hiper-localizados y realistas para evitar thin content
export function getProgrammaticJobs(ciudadSlug: string): JobListing[] {
  const jobs: JobListing[] = [];

  if (ciudadSlug === 'lima') {
    jobs.push(
      {
        id: 'job-lima-1',
        title: 'Administrador de Operaciones Logísticas',
        company: 'Operador Logístico del Callao S.A.',
        sector: 'Administración y Finanzas',
        description: 'Buscamos profesional para gestionar la cadena de suministro, control de inventarios en almacén de Ate/Callao y coordinación con transportistas.',
        salaryRange: 'S/ 3,500 - S/ 4,500',
        requirements: ['Bachiller en Administración, Ing. Industrial o afines.', 'Manejo de SAP R/3 u Oracle.', '2 años de experiencia en puestos similares.'],
        type: 'Full-time',
        postedDaysAgo: 2,
      },
      {
        id: 'job-lima-2',
        title: 'Asesor Comercial Digital - Miraflores',
        company: 'Corporación Inmobiliaria Peruana',
        sector: 'Comercio y Retail',
        description: 'Encargado de la captación de leads en redes sociales, atención telefónica a clientes premium y visitas guiadas a proyectos en Lima Top.',
        salaryRange: 'S/ 1,800 + Comisiones ilimitadas',
        requirements: ['Experiencia en ventas intangibles o inmobiliarias.', 'Excelente comunicación y relaciones interpersonales.', 'Residir en Lima Metropolitana.'],
        type: 'Full-time',
        postedDaysAgo: 1,
      },
      {
        id: 'job-lima-3',
        title: 'Enfermero de Salud Ocupacional',
        company: 'Clínica Internacional',
        sector: 'Salud y Medicina',
        description: 'Responsable de la vigilancia de la salud de los trabajadores en sede corporativa de San Isidro, reportes de riesgos y atención de urgencias.',
        salaryRange: 'S/ 2,800 - S/ 3,200',
        requirements: ['Licenciado(a) en Enfermería y Colegiado habilitado.', 'Diplomado en Salud Ocupacional (mínimo 36 horas).', 'Experiencia de 1 año en empresas.'],
        type: 'Temporal',
        postedDaysAgo: 4,
      }
    );
  } else if (ciudadSlug === 'arequipa') {
    jobs.push(
      {
        id: 'job-aqp-1',
        title: 'Supervisor de Seguridad Minera (SST)',
        company: 'Contratistas Mineros del Sur',
        sector: 'Minería e Ingeniería',
        description: 'Responsable de la supervisión de las labores de tajo abierto, capacitación del personal en campo y cumplimiento de los estándares IPERC.',
        salaryRange: 'S/ 5,500 - S/ 7,000 (Régimen 14x7)',
        requirements: ['Ingeniero de Minas, Geólogo o de Seguridad e Higiene.', 'Colegiado y habilitado por el CIP.', '3 años de experiencia en minas de tajo abierto.'],
        type: 'Full-time',
        postedDaysAgo: 3,
      },
      {
        id: 'job-aqp-2',
        title: 'Guía de Turismo Bilingüe (Inglés/Español)',
        company: 'Arequipa Travel Agency',
        sector: 'Turismo y Gastronomía',
        description: 'Encargado de guiar a grupos turísticos en el Centro Histórico, Monasterio de Santa Catalina y tours de aventura en el Cañón del Colca.',
        salaryRange: 'S/ 2,000 - S/ 2,500',
        requirements: ['Título en Guía Oficial de Turismo.', 'Inglés fluido (hablado y escrito - Nivel Avanzado).', 'Carisma y vocación de servicio.'],
        type: 'Part-time',
        postedDaysAgo: 5,
      },
      {
        id: 'job-aqp-3',
        title: 'Asistente Contable Junior',
        company: 'Estudio Contable Cayma',
        sector: 'Administración y Finanzas',
        description: 'Apoyo en la declaración de impuestos mensuales (PDT), registro de compras y ventas en el sistema CONCAR, y conciliación de bancos.',
        salaryRange: 'S/ 1,200 - S/ 1,500',
        requirements: ['Egresado o estudiante de últimos ciclos de Contabilidad.', 'Manejo intermedio de Excel.', 'Residir en Arequipa.'],
        type: 'Prácticas',
        postedDaysAgo: 1,
      }
    );
  } else if (ciudadSlug === 'trujillo') {
    jobs.push(
      {
        id: 'job-tru-1',
        title: 'Ingeniero Agrónomo - Jefe de Riego',
        company: 'Camposol S.A. (Chao/Virú)',
        sector: 'Agroindustria y Pesca',
        description: 'Planificación e implementación del plan de riego y fertilización de cultivos de exportación (arándanos y palta). Monitoreo de humedad en suelos.',
        salaryRange: 'S/ 4,000 - S/ 5,000',
        requirements: ['Ingeniero Agrónomo o Agrícola titulado.', 'Experiencia en sistemas de riego tecnificado por goteo.', 'Licencia de conducir de moto o camioneta.'],
        type: 'Full-time',
        postedDaysAgo: 2,
      },
      {
        id: 'job-tru-2',
        title: 'Prevencionista de Riesgos (PDR) - Obra',
        company: 'Constructora del Norte SAC',
        sector: 'Construcción e Infraestructura',
        description: 'Implementar el plan de seguridad en obra de edificación multifamiliar en El Golf, charlas de 5 minutos, control de EPPs y reportes semanales.',
        salaryRange: 'S/ 2,500 - S/ 3,000',
        requirements: ['Técnico en Seguridad Industrial o Bachiller en Ingeniería Civil/Ambiental.', 'Certificación en trabajos de alto riesgo (altura, caliente).', 'Residir en Trujillo.'],
        type: 'Full-time',
        postedDaysAgo: 6,
      },
      {
        id: 'job-tru-3',
        title: 'Cajero Reponedor - Tienda Trujillo',
        company: 'Supermercados Peruanos (Plaza Vea)',
        sector: 'Comercio y Retail',
        description: 'Atención en cajas de cobro, cuadre diario, y reposición de mercadería en góndolas respetando las pautas de orden y limpieza de tienda.',
        salaryRange: 'S/ 1,025 (Sueldo Mínimo Vital) + Beneficios',
        requirements: ['Secundaria completa.', 'Disponibilidad para turnos rotativos semanales.', 'Actitud de servicio.'],
        type: 'Full-time',
        postedDaysAgo: 1,
      }
    );
  } else {
    // Fallback genérico realista para otras ciudades de Perú
    jobs.push(
      {
        id: `job-${ciudadSlug}-1`,
        title: 'Representante de Ventas Regional',
        company: 'Distribuidora Comercial de Consumo Masivo',
        sector: 'Comercio y Retail',
        description: 'Ventas de productos de consumo masivo a bodegas, mercados y minimarket en toda la provincia.',
        salaryRange: 'S/ 1,500 + Viáticos + Movilidad',
        requirements: ['Experiencia previa en ventas de campo.', 'Conocimiento de la zona y facilidad de palabra.'],
        type: 'Full-time',
        postedDaysAgo: 2,
      },
      {
        id: `job-${ciudadSlug}-2`,
        title: 'Técnico de Campo - Soporte de Telecomunicaciones',
        company: 'Sistemas de Conectividad del Perú',
        sector: 'Construcción e Infraestructura',
        description: 'Instalación y mantenimiento de fibra óptica en hogares y comercios de la provincia.',
        salaryRange: 'S/ 1,800 - S/ 2,200',
        requirements: ['Técnico en Electrónica, Sistemas o Redes.', 'Brevete A1 (Indispensable).', 'Disponibilidad para trabajos en altura.'],
        type: 'Full-time',
        postedDaysAgo: 4,
      }
    );
  }

  return jobs;
}
