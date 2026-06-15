import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';

const loadedEnvKeys = new Set<string>();

function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (process.env[key] === undefined || loadedEnvKeys.has(key)) {
      process.env[key] = value;
      loadedEnvKeys.add(key);
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const prisma = new PrismaClient();

type StepSeed = {
  titulo: string;
  descripcion: string;
};

type FaqSeed = {
  question: string;
  answer: string;
};

type ProcedureSeed = {
  title: string;
  slug: string;
  description: string;
  requisitos: string[];
  costo: number;
  pasos: StepSeed[];
  faq: FaqSeed[];
  channel: {
    nombre: string;
    direccion: string;
    horario: string;
    contacto?: string;
  };
};

const cities = [
  { name: 'Lima Metropolitana', slug: 'lima', departmentName: 'Lima', departmentSlug: 'lima' },
  { name: 'Arequipa', slug: 'arequipa', departmentName: 'Arequipa', departmentSlug: 'arequipa' },
  { name: 'Trujillo', slug: 'trujillo', departmentName: 'La Libertad', departmentSlug: 'la-libertad' },
  { name: 'Piura', slug: 'piura', departmentName: 'Piura', departmentSlug: 'piura' },
  { name: 'Cusco', slug: 'cusco', departmentName: 'Cusco', departmentSlug: 'cusco' },
];

const procedures: ProcedureSeed[] = [
  {
    title: 'Duplicado de DNI',
    slug: 'dni-duplicado',
    description:
      'Trámite de RENIEC para solicitar un nuevo Documento Nacional de Identidad por pérdida, robo, deterioro o necesidad de reposición. Puede iniciarse por canal digital y el recojo se realiza en la agencia elegida.',
    requisitos: [
      'DNI vigente o datos personales del titular para validar identidad.',
      'Pago de la tasa oficial: S/ 21.00 para DNI azul o S/ 33.00 para DNI electrónico, según corresponda.',
      'Seleccionar agencia RENIEC de recojo y conservar la constancia de solicitud.',
      'Consultar el estado del trámite antes de acercarse a recoger el documento.',
    ],
    costo: 21,
    pasos: [
      {
        titulo: 'Paga la tasa oficial',
        descripcion:
          'Realiza el pago por el canal autorizado. RENIEC informa códigos diferenciados para DNI azul y DNI electrónico, además de pago por web, Págalo.pe o entidades habilitadas.',
      },
      {
        titulo: 'Registra la solicitud',
        descripcion:
          'Ingresa al servicio de duplicado de RENIEC, valida tus datos y elige la agencia de recojo más conveniente para {city}.',
      },
      {
        titulo: 'Consulta el estado',
        descripcion:
          'Antes de acudir a la oficina, revisa si el documento está listo. Lleva tu constancia y evita intermediarios no autorizados.',
      },
    ],
    faq: [
      {
        question: '¿El duplicado de DNI se puede iniciar por internet?',
        answer:
          'Sí. RENIEC promueve el duplicado vía web y permite elegir agencia de recojo. La disponibilidad puede variar según el documento y validaciones del titular.',
      },
      {
        question: '¿La tasa cambia si tengo DNI electrónico?',
        answer:
          'Sí. RENIEC informa una tasa distinta para DNI azul y DNI electrónico. Verifica el código y monto oficial antes de pagar.',
      },
    ],
    channel: {
      nombre: 'RENIEC - canal web y agencia seleccionada',
      direccion: 'Trámite virtual; la oficina de recojo se elige en el portal oficial de RENIEC.',
      horario: 'Canal web disponible según disponibilidad del servicio; recojo en horario de la agencia elegida.',
      contacto: 'https://www.reniec.gob.pe',
    },
  },
  {
    title: 'Licencia de Conducir A-I',
    slug: 'licencia-de-conducir',
    description:
      'Licencia básica para conducir vehículos particulares de la clase A categoría I. Requiere evaluación médica, examen de reglas, examen de manejo y pago de emisión.',
    requisitos: [
      'Tener 18 años o más.',
      'Contar con secundaria completa.',
      'Aprobar el examen médico psicosomático en un centro autorizado.',
      'Aprobar el examen de reglas de tránsito y el examen práctico de manejo.',
      'Pagar la tasa administrativa de emisión indicada por el MTC o la autoridad regional competente.',
    ],
    costo: 24.5,
    pasos: [
      {
        titulo: 'Evalúa tu aptitud médica',
        descripcion:
          'Realiza el examen psicosomático en un centro médico autorizado por el MTC. Este costo suele ser independiente de la tasa de emisión.',
      },
      {
        titulo: 'Rinde los exámenes',
        descripcion:
          'Agenda y aprueba el examen de reglas y la prueba de manejo en el centro autorizado correspondiente a {city}.',
      },
      {
        titulo: 'Solicita la emisión',
        descripcion:
          'Con los exámenes aprobados, paga la tasa administrativa y solicita la licencia física o electrónica según disponibilidad.',
      },
    ],
    faq: [
      {
        question: '¿La tasa de S/ 24.50 cubre todo el proceso?',
        answer:
          'No necesariamente. Esa tasa corresponde a la emisión indicada por el MTC; los exámenes médicos y evaluaciones pueden tener costos propios.',
      },
      {
        question: '¿Puedo hacer el trámite en cualquier ciudad?',
        answer:
          'Debes seguir el canal del MTC o del gobierno regional competente. Revisa la sede autorizada y disponibilidad de citas para {city}.',
      },
    ],
    channel: {
      nombre: 'MTC / Gobierno Regional de Transportes',
      direccion: 'Canal oficial de licencias; confirme centro de evaluación y oficina competente para su ciudad.',
      horario: 'Atención según disponibilidad de citas y oficina autorizada.',
      contacto: 'https://portal.mtc.gob.pe',
    },
  },
  {
    title: 'Pasaporte Electrónico',
    slug: 'pasaporte-electronico',
    description:
      'Documento de viaje emitido por Migraciones. El trámite requiere pago de tasa, reserva de cita cuando corresponda y verificación biométrica en sede autorizada.',
    requisitos: [
      'DNI vigente y en buen estado.',
      'Pago de la tasa oficial de S/ 120.90 por canal autorizado.',
      'Cita o atención en sede de Migraciones según disponibilidad.',
      'No se requieren formularios, fotocopias ni fotografías físicas para el trámite regular informado por Migraciones.',
    ],
    costo: 120.9,
    pasos: [
      {
        titulo: 'Paga la tasa',
        descripcion:
          'Realiza el pago oficial por Banco de la Nación, Págalo.pe o el canal que Migraciones tenga habilitado.',
      },
      {
        titulo: 'Reserva o confirma atención',
        descripcion:
          'Verifica disponibilidad de citas y elige la sede más cercana a {city}. No entregues datos ni pagos a intermediarios.',
      },
      {
        titulo: 'Acude a la sede',
        descripcion:
          'Presenta tu DNI, completa la validación biométrica y sigue las indicaciones de entrega del pasaporte electrónico.',
      },
    ],
    faq: [
      {
        question: '¿Debo llevar foto física para pasaporte?',
        answer:
          'Migraciones informó que no se requieren fotografías físicas, formularios ni fotocopias para el trámite regular.',
      },
      {
        question: '¿Cuál es la tasa oficial del pasaporte electrónico?',
        answer:
          'Migraciones informa la tasa de S/ 120.90. Verifica siempre el monto vigente en el portal oficial antes de pagar.',
      },
    ],
    channel: {
      nombre: 'Migraciones - citas y sedes oficiales',
      direccion: 'Seleccione sede y cita en los canales oficiales de Migraciones.',
      horario: 'Atención según cita y disponibilidad de la sede elegida.',
      contacto: 'https://www.migraciones.gob.pe',
    },
  },
  {
    title: 'Inscripción al RUC Persona Natural',
    slug: 'inscripcion-ruc-persona-natural',
    description:
      'Registro tributario administrado por SUNAT para personas naturales que realizan actividades económicas, emiten comprobantes o deben formalizar obligaciones tributarias.',
    requisitos: [
      'DNI, carné de extranjería o documento de identidad válido.',
      'Datos de domicilio fiscal y actividad económica.',
      'Acceso a canal SUNAT o mesa de partes según el caso.',
      'Mantener actualizada la información declarada ante SUNAT.',
    ],
    costo: 0,
    pasos: [
      {
        titulo: 'Define tu actividad',
        descripcion:
          'Identifica la actividad económica y el régimen tributario que corresponde antes de iniciar la inscripción.',
      },
      {
        titulo: 'Registra tus datos',
        descripcion:
          'Completa la información de identidad, domicilio fiscal y actividad en el canal de SUNAT habilitado para {city}.',
      },
      {
        titulo: 'Activa tu operación formal',
        descripcion:
          'Guarda tu número de RUC, revisa obligaciones y conserva tus accesos para declaraciones, comprobantes y actualizaciones.',
      },
    ],
    faq: [
      {
        question: '¿Inscribirme al RUC tiene costo?',
        answer:
          'La inscripción como tal es gratuita. Pueden existir obligaciones tributarias posteriores según actividad y régimen.',
      },
      {
        question: '¿SUNAT puede inscribir de oficio?',
        answer:
          'SUNAT ha informado supuestos de inscripción de oficio para personas naturales que generan obligaciones, por lo que conviene regularizar datos oportunamente.',
      },
    ],
    channel: {
      nombre: 'SUNAT - canal virtual RUC',
      direccion: 'Canal virtual de SUNAT y centros de servicios al contribuyente según disponibilidad local.',
      horario: 'Canal virtual permanente; atención presencial según oficina.',
      contacto: 'https://www.sunat.gob.pe',
    },
  },
  {
    title: 'Afiliación al SIS Gratuito',
    slug: 'afiliacion-sis-gratuito',
    description:
      'Seguro público subsidiado para personas residentes en el Perú que no cuentan con otro seguro de salud y cumplen condiciones de elegibilidad.',
    requisitos: [
      'DNI, carné de extranjería u otro documento válido.',
      'No contar con otro seguro de salud activo.',
      'Cumplir la clasificación socioeconómica o condición aplicable según evaluación del SIS.',
      'Verificar afiliación en línea, aplicación oficial o canales de atención SIS.',
    ],
    costo: 0,
    pasos: [
      {
        titulo: 'Verifica tu estado',
        descripcion:
          'Consulta si ya tienes SIS activo o si registras otro seguro antes de iniciar una nueva afiliación.',
      },
      {
        titulo: 'Solicita afiliación',
        descripcion:
          'Usa los canales oficiales del SIS o acude a un establecimiento de salud cercano en {city} para orientación.',
      },
      {
        titulo: 'Revisa cobertura',
        descripcion:
          'Confirma qué prestaciones, medicamentos, análisis, hospitalización y traslados aplican según tu afiliación.',
      },
    ],
    faq: [
      {
        question: '¿El SIS Gratuito cubre emergencias?',
        answer:
          'El SIS informa cobertura para múltiples prestaciones, incluidas emergencias, hospitalización, medicamentos y traslados según el caso.',
      },
      {
        question: '¿Puedo afiliarme si tengo EsSalud?',
        answer:
          'El SIS Gratuito está orientado a personas sin otro seguro de salud activo. Verifica tu situación antes de solicitar afiliación.',
      },
    ],
    channel: {
      nombre: 'SIS - afiliación y consulta oficial',
      direccion: 'Canales virtuales SIS y establecimientos de salud cercanos.',
      horario: 'Canales virtuales y atención según establecimiento.',
      contacto: 'https://www.gob.pe/sis',
    },
  },
  {
    title: 'Certificado Literal SUNARP',
    slug: 'certificado-literal-sunarp',
    description:
      'Copia certificada de una partida registral emitida por SUNARP. Suele solicitarse para revisar antecedentes registrales de predios, vehículos, personas jurídicas u otros actos inscritos.',
    requisitos: [
      'Número de partida, ficha, tomo, folio o dato registral que permita ubicar la inscripción.',
      'Pago de la tasa correspondiente: SUNARP informa S/ 14.00 por las dos primeras páginas y S/ 6.00 por cada página adicional.',
      'Solicitud verbal hasta 10 páginas o formulario cuando excede ese rango, según el canal de atención.',
      'Verificar que el certificado corresponda al registro y oficina correcta.',
    ],
    costo: 14,
    pasos: [
      {
        titulo: 'Ubica la partida',
        descripcion:
          'Ten a la mano el número de partida o dato registral exacto para evitar solicitar un certificado equivocado.',
      },
      {
        titulo: 'Solicita el certificado',
        descripcion:
          'Ingresa al canal de SUNARP o acude a la oficina competente. Para {city}, confirma la oficina registral y disponibilidad del servicio.',
      },
      {
        titulo: 'Paga según páginas',
        descripcion:
          'La tasa depende de la cantidad de páginas certificadas. Revisa el cálculo antes de confirmar la solicitud.',
      },
    ],
    faq: [
      {
        question: '¿Cuánto cuesta un certificado literal?',
        answer:
          'SUNARP informa S/ 14.00 por las dos primeras páginas y S/ 6.00 por cada página adicional.',
      },
      {
        question: '¿Qué dato necesito para pedirlo?',
        answer:
          'Necesitas identificar la partida registral, ficha, tomo, folio u otro dato suficiente para ubicar el asiento solicitado.',
      },
    ],
    channel: {
      nombre: 'SUNARP - Servicio de Certificado Registral',
      direccion: 'Canal SCR de SUNARP y oficinas registrales según competencia.',
      horario: 'Canal virtual permanente; atención presencial según oficina.',
      contacto: 'https://scr.sunarp.gob.pe',
    },
  },
  {
    title: 'Certificado Único Laboral',
    slug: 'certificado-unico-laboral',
    description:
      'Documento gratuito del MTPE para postulantes. Integra información útil para procesos de selección, como identidad, antecedentes, formación y experiencia formal disponible.',
    requisitos: [
      'DNI y datos personales del postulante.',
      'Cuenta o acceso al portal Empleos Perú.',
      'Correo y número de contacto actualizados.',
      'Revisar que la información laboral y educativa figure correctamente antes de usarlo en postulaciones.',
    ],
    costo: 0,
    pasos: [
      {
        titulo: 'Ingresa a Empleos Perú',
        descripcion:
          'Accede al portal oficial, registra o actualiza tu perfil y valida tus datos personales.',
      },
      {
        titulo: 'Genera el certificado',
        descripcion:
          'Solicita el Certificado Único Laboral desde el portal. El MTPE informa que es gratuito para postulantes.',
      },
      {
        titulo: 'Adjunta en postulaciones',
        descripcion:
          'Usa el certificado junto con tu CV al postular a oportunidades en {city}. No pagues por intermediación laboral.',
      },
    ],
    faq: [
      {
        question: '¿El Certificado Único Laboral es gratis?',
        answer:
          'Sí. El MTPE lo presenta como un servicio gratuito disponible desde el portal Empleos Perú.',
      },
      {
        question: '¿Reemplaza mi CV?',
        answer:
          'No. Complementa tu CV con información validable, pero igual debes presentar experiencia, logros y datos de contacto actualizados.',
      },
    ],
    channel: {
      nombre: 'MTPE - Empleos Perú',
      direccion: 'Canal virtual Empleos Perú y centros de empleo regionales.',
      horario: 'Portal disponible en línea; atención presencial según sede.',
      contacto: 'https://www.empleosperu.gob.pe',
    },
  },
];

const hospitals = [
  {
    nombre: 'Hospital Nacional Edgardo Rebagliati Martins',
    slug: 'hospital-rebagliati-lima',
    tipo: 'ESSALUD',
    direccion: 'Av. Edgardo Rebagliati 490, Jesús María, Lima',
    telefono: '(01) 265-4900',
    ciudadSlug: 'lima',
  },
  {
    nombre: 'Hospital Nacional Guillermo Almenara Irigoyen',
    slug: 'hospital-almenara-lima',
    tipo: 'ESSALUD',
    direccion: 'Av. Grau 800, La Victoria, Lima',
    telefono: null,
    ciudadSlug: 'lima',
  },
  {
    nombre: 'Hospital de Lima Este - Vitarte',
    slug: 'hospital-lima-este-vitarte',
    tipo: 'MINSA',
    direccion: 'Ate Vitarte, Lima Este',
    telefono: null,
    ciudadSlug: 'lima',
  },
  {
    nombre: 'Hospital Regional Honorio Delgado',
    slug: 'hospital-honorio-delgado-arequipa',
    tipo: 'MINSA',
    direccion: 'Av. Daniel Alcides Carrión 505, Arequipa',
    telefono: '(054) 219702',
    ciudadSlug: 'arequipa',
  },
  {
    nombre: 'Hospital Regional Docente de Trujillo',
    slug: 'hospital-regional-docente-trujillo',
    tipo: 'MINSA',
    direccion: 'Av. Mansiche 795, Urb. Sánchez Carrión, Trujillo',
    telefono: null,
    ciudadSlug: 'trujillo',
  },
  {
    nombre: 'Hospital de la Amistad Perú-Corea Santa Rosa II-2',
    slug: 'hospital-santa-rosa-piura',
    tipo: 'MINSA',
    direccion: 'Av. Grau 1221, Piura',
    telefono: '(073) 311860',
    ciudadSlug: 'piura',
  },
  {
    nombre: 'Hospital Regional Cusco',
    slug: 'hospital-regional-cusco',
    tipo: 'MINSA',
    direccion: 'Av. La Cultura S/N, Cusco',
    telefono: '084-227661',
    ciudadSlug: 'cusco',
  },
];

const jobs = [
  {
    title: 'Registro de postulantes - Administración y atención al cliente',
    slug: 'registro-postulantes-administracion-lima',
    company: 'ClavePerú Bolsa de Talentos',
    sectorId: 'sec-admin',
    sectorName: 'Administración y Finanzas',
    description:
      'Registro gratuito para postulantes con experiencia administrativa, atención al cliente, caja, facturación, digitación o asistencia documentaria. Prepara tu CV y Certificado Único Laboral antes de postular.',
    salaryRange: 'Según convocatoria formal',
    requirements: ['CV actualizado', 'Certificado Único Laboral recomendado', 'Disponibilidad para entrevistas verificables'],
    type: 'Full-time',
    ciudadSlug: 'lima',
  },
  {
    title: 'Registro de postulantes - Turismo, gastronomía y servicios',
    slug: 'registro-postulantes-turismo-arequipa',
    company: 'ClavePerú Bolsa de Talentos',
    sectorId: 'sec-turismo',
    sectorName: 'Turismo y Gastronomía',
    description:
      'Registro gratuito para perfiles de atención turística, cocina, mozos, recepción, guías y servicios. Evita procesos que soliciten pagos por capacitación o entrevistas.',
    salaryRange: 'Según convocatoria formal',
    requirements: ['Experiencia o formación relacionada', 'Disponibilidad horaria', 'Referencias laborales verificables'],
    type: 'Full-time',
    ciudadSlug: 'arequipa',
  },
  {
    title: 'Registro de postulantes - Agroindustria y operaciones',
    slug: 'registro-postulantes-agroindustria-trujillo',
    company: 'ClavePerú Bolsa de Talentos',
    sectorId: 'sec-agro',
    sectorName: 'Agroindustria y Pesca',
    description:
      'Registro gratuito para postulantes de campo, almacén, producción, control de calidad y operaciones agroindustriales. Mantén tus documentos listos para convocatorias formales.',
    salaryRange: 'Según convocatoria formal',
    requirements: ['DNI vigente', 'Experiencia deseable en campo o planta', 'Disponibilidad para turnos'],
    type: 'Temporal',
    ciudadSlug: 'trujillo',
  },
  {
    title: 'Registro de postulantes - Comercio, ventas y logística',
    slug: 'registro-postulantes-comercio-piura',
    company: 'ClavePerú Bolsa de Talentos',
    sectorId: 'sec-comercio',
    sectorName: 'Comercio y Retail',
    description:
      'Registro gratuito para perfiles comerciales, ventas de campo, almacén, reparto y atención en tienda. Ninguna postulación debe exigir pagos al candidato.',
    salaryRange: 'Según convocatoria formal',
    requirements: ['CV actualizado', 'Disponibilidad para trabajo presencial o campo', 'Celular y correo activos'],
    type: 'Full-time',
    ciudadSlug: 'piura',
  },
  {
    title: 'Registro de postulantes - Educación, turismo y servicios locales',
    slug: 'registro-postulantes-servicios-cusco',
    company: 'ClavePerú Bolsa de Talentos',
    sectorId: 'sec-educacion',
    sectorName: 'Educación y Academia',
    description:
      'Registro gratuito para perfiles educativos, asistentes, atención al visitante, guías, soporte administrativo y servicios locales. Adjunta constancias y experiencia comprobable.',
    salaryRange: 'Según convocatoria formal',
    requirements: ['Formación o experiencia relacionada', 'Certificado Único Laboral recomendado', 'Disponibilidad para procesos gratuitos'],
    type: 'Full-time',
    ciudadSlug: 'cusco',
  },
];

function localize<T extends StepSeed | FaqSeed>(items: T[], cityName: string): T[] {
  return items.map((item) => {
    const localized: Record<string, string> = {};
    for (const [key, value] of Object.entries(item)) {
      localized[key] = String(value).replaceAll('{city}', cityName);
    }
    return localized as T;
  });
}

async function upsertSede(
  procedimientoCiudadId: string,
  ciudadId: string,
  channel: ProcedureSeed['channel']
) {
  const existing = await prisma.sedeOficina.findFirst({
    where: {
      nombre: channel.nombre,
      ciudadId,
      procedimientoCiudadId,
    },
  });

  const data = {
    nombre: channel.nombre,
    direccion: channel.direccion,
    horario: channel.horario,
    contacto: channel.contacto,
    ciudadId,
    procedimientoCiudadId,
  };

  if (existing) {
    return prisma.sedeOficina.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.sedeOficina.create({ data });
}

async function main() {
  console.log('Enriqueciendo contenido público de ClavePerú sin modificar noticias...');

  const departmentBySlug = new Map<string, { id: string }>();
  const cityBySlug = new Map<string, { id: string; name: string; slug: string }>();

  for (const city of cities) {
    const department = await prisma.departamento.upsert({
      where: { slug: city.departmentSlug },
      update: { name: city.departmentName },
      create: {
        name: city.departmentName,
        slug: city.departmentSlug,
      },
      select: { id: true },
    });
    departmentBySlug.set(city.departmentSlug, department);
  }

  for (const city of cities) {
    const department = departmentBySlug.get(city.departmentSlug);
    if (!department) throw new Error(`Departamento no encontrado: ${city.departmentSlug}`);

    const record = await prisma.ciudad.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        departamentoId: department.id,
      },
      create: {
        name: city.name,
        slug: city.slug,
        departamentoId: department.id,
      },
      select: { id: true, name: true, slug: true },
    });
    cityBySlug.set(city.slug, record);
  }

  for (const procedure of procedures) {
    const procedureRecord = await prisma.procedimiento.upsert({
      where: { slug: procedure.slug },
      update: {
        title: procedure.title,
        description: procedure.description,
        requisitos: procedure.requisitos,
      },
      create: {
        title: procedure.title,
        slug: procedure.slug,
        description: procedure.description,
        requisitos: procedure.requisitos,
      },
      select: { id: true, slug: true },
    });

    for (const city of cityBySlug.values()) {
      const localizedSteps = localize(procedure.pasos, city.name) as unknown as Prisma.InputJsonValue;
      const localizedFaq = localize(procedure.faq, city.name) as unknown as Prisma.InputJsonValue;

      const procedureCity = await prisma.procedimientoCiudad.upsert({
        where: {
          procedimientoId_ciudadId: {
            procedimientoId: procedureRecord.id,
            ciudadId: city.id,
          },
        },
        update: {
          costo: procedure.costo,
          pasos: localizedSteps,
          faq: localizedFaq,
        },
        create: {
          procedimientoId: procedureRecord.id,
          ciudadId: city.id,
          costo: procedure.costo,
          pasos: localizedSteps,
          faq: localizedFaq,
        },
        select: { id: true, ciudadId: true },
      });

      await upsertSede(procedureCity.id, procedureCity.ciudadId, procedure.channel);
    }
  }

  for (const hospital of hospitals) {
    const city = cityBySlug.get(hospital.ciudadSlug);
    if (!city) throw new Error(`Ciudad no encontrada para hospital: ${hospital.ciudadSlug}`);

    await prisma.hospital.upsert({
      where: { slug: hospital.slug },
      update: {
        nombre: hospital.nombre,
        tipo: hospital.tipo,
        direccion: hospital.direccion,
        telefono: hospital.telefono,
        horario24h: true,
        ciudadId: city.id,
      },
      create: {
        nombre: hospital.nombre,
        slug: hospital.slug,
        tipo: hospital.tipo,
        direccion: hospital.direccion,
        telefono: hospital.telefono,
        horario24h: true,
        ciudadId: city.id,
      },
    });
  }

  const expiresAt = new Date('2027-12-31T23:59:59.000Z');
  for (const job of jobs) {
    const city = cityBySlug.get(job.ciudadSlug);
    if (!city) throw new Error(`Ciudad no encontrada para empleo: ${job.ciudadSlug}`);

    await prisma.jobListing.upsert({
      where: { slug: job.slug },
      update: {
        title: job.title,
        company: job.company,
        sectorId: job.sectorId,
        sectorName: job.sectorName,
        description: job.description,
        salaryRange: job.salaryRange,
        requirements: job.requirements,
        type: job.type,
        published: true,
        cityId: city.id,
        expiresAt,
        metaTitle: `${job.title} en ${city.name}`,
        metaDescription: job.description.slice(0, 155),
      },
      create: {
        title: job.title,
        slug: job.slug,
        company: job.company,
        sectorId: job.sectorId,
        sectorName: job.sectorName,
        description: job.description,
        salaryRange: job.salaryRange,
        requirements: job.requirements,
        type: job.type,
        published: true,
        cityId: city.id,
        expiresAt,
        metaTitle: `${job.title} en ${city.name}`,
        metaDescription: job.description.slice(0, 155),
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: 'global' },
    update: {
      value: {
        tickerItems: [
          'Guías de trámites con fuentes oficiales y tasas verificables',
          'Directorio de hospitales por ciudad con orientación SIS y MINSA',
          'Bolsa de empleo con registro gratuito y alertas contra cobros indebidos',
          'CMS preparado para gestionar noticias, contenido público, medios y SEO',
          'Imágenes con licencia abierta y créditos visibles en secciones clave',
        ],
        footerDescription:
          'Portal ciudadano independiente con noticias, trámites, salud, empleo y directorios regionales del Perú. La información se resume desde fuentes oficiales citadas.',
        footerLegalText:
          'ClavePerú es una plataforma informativa independiente. No reemplaza a las entidades públicas; confirme siempre requisitos y pagos en',
        footerLegalLinkLabel: 'Gob.pe',
        footerLegalLinkHref: 'https://www.gob.pe',
        footerSecurityLabel: 'CMS seguro y almacenamiento Supabase',
        home: {
          eyebrow: 'Portal ciudadano de información pública del Perú',
          titleLine1: 'Trámites, salud',
          titleLine2: 'empleo y noticias',
          accent: 'en un solo lugar',
          description:
            'Consulta guías de trámites, hospitales por ciudad, orientación de empleo y noticias desde una plataforma clara, gestionable por CMS y respaldada con fuentes oficiales.',
          primaryCtaLabel: 'Explorar trámites',
          primaryCtaHref: '/tramites',
          secondaryCtaLabel: 'Ver todos los servicios',
          secondaryCtaHref: '/todos',
          trustBadges: ['Fuentes citadas', 'Contenido gestionable', 'Acceso gratuito'],
        },
        navigation: {
          brandPrefix: 'DATA',
          brandName: 'Perú',
          brandAccent: '+',
          ctaLabel: 'Ver servicios',
          ctaHref: '/todos',
          links: [
            { label: 'INICIO', href: '/' },
            { label: 'TRÁMITES', href: '/tramites' },
            { label: 'HOSPITALES', href: '/hospitales' },
            { label: 'EMPLEO', href: '/trabajos' },
            { label: 'TODO', href: '/todos' },
          ],
        },
        seo: {
          siteName: 'ClavePerú',
          titleDefault: 'ClavePerú | Trámites, salud, empleo y noticias del Perú',
          titleTemplate: '%s | ClavePerú',
          description:
            'Portal ciudadano peruano con guías de trámites, directorio de hospitales, empleo regional y noticias, con fuentes oficiales citadas.',
          keywords: [
            'claveperu',
            'trámites Perú',
            'hospitales Perú',
            'SIS gratuito',
            'licencia de conducir Perú',
            'duplicado DNI',
            'pasaporte electrónico',
            'certificado único laboral',
            'empleos Perú',
          ],
          ogTitle: 'ClavePerú - Servicios ciudadanos del Perú',
          ogDescription:
            'Trámites, salud, empleo y noticias con contenido gestionable y fuentes oficiales citadas.',
          ogImage: 'https://dataperu.pe/assets/default-og.png',
          twitterTitle: 'ClavePerú',
          twitterDescription: 'Portal ciudadano de trámites, salud, empleo y noticias del Perú.',
        },
      },
    },
    create: {
      key: 'global',
      value: {
        tickerItems: [
          'Guías de trámites con fuentes oficiales y tasas verificables',
          'Directorio de hospitales por ciudad con orientación SIS y MINSA',
          'Bolsa de empleo con registro gratuito y alertas contra cobros indebidos',
          'CMS preparado para gestionar noticias, contenido público, medios y SEO',
          'Imágenes con licencia abierta y créditos visibles en secciones clave',
        ],
        footerDescription:
          'Portal ciudadano independiente con noticias, trámites, salud, empleo y directorios regionales del Perú. La información se resume desde fuentes oficiales citadas.',
        footerLegalText:
          'ClavePerú es una plataforma informativa independiente. No reemplaza a las entidades públicas; confirme siempre requisitos y pagos en',
        footerLegalLinkLabel: 'Gob.pe',
        footerLegalLinkHref: 'https://www.gob.pe',
        footerSecurityLabel: 'CMS seguro y almacenamiento Supabase',
        home: {
          eyebrow: 'Portal ciudadano de información pública del Perú',
          titleLine1: 'Trámites, salud',
          titleLine2: 'empleo y noticias',
          accent: 'en un solo lugar',
          description:
            'Consulta guías de trámites, hospitales por ciudad, orientación de empleo y noticias desde una plataforma clara, gestionable por CMS y respaldada con fuentes oficiales.',
          primaryCtaLabel: 'Explorar trámites',
          primaryCtaHref: '/tramites',
          secondaryCtaLabel: 'Ver todos los servicios',
          secondaryCtaHref: '/todos',
          trustBadges: ['Fuentes citadas', 'Contenido gestionable', 'Acceso gratuito'],
        },
        navigation: {
          brandPrefix: 'DATA',
          brandName: 'Perú',
          brandAccent: '+',
          ctaLabel: 'Ver servicios',
          ctaHref: '/todos',
          links: [
            { label: 'INICIO', href: '/' },
            { label: 'TRÁMITES', href: '/tramites' },
            { label: 'HOSPITALES', href: '/hospitales' },
            { label: 'EMPLEO', href: '/trabajos' },
            { label: 'TODO', href: '/todos' },
          ],
        },
        seo: {
          siteName: 'ClavePerú',
          titleDefault: 'ClavePerú | Trámites, salud, empleo y noticias del Perú',
          titleTemplate: '%s | ClavePerú',
          description:
            'Portal ciudadano peruano con guías de trámites, directorio de hospitales, empleo regional y noticias, con fuentes oficiales citadas.',
          keywords: [
            'claveperu',
            'trámites Perú',
            'hospitales Perú',
            'SIS gratuito',
            'licencia de conducir Perú',
            'duplicado DNI',
            'pasaporte electrónico',
            'certificado único laboral',
            'empleos Perú',
          ],
          ogTitle: 'ClavePerú - Servicios ciudadanos del Perú',
          ogDescription:
            'Trámites, salud, empleo y noticias con contenido gestionable y fuentes oficiales citadas.',
          ogImage: 'https://dataperu.pe/assets/default-og.png',
          twitterTitle: 'ClavePerú',
          twitterDescription: 'Portal ciudadano de trámites, salud, empleo y noticias del Perú.',
        },
      },
    },
  });

  console.log('Contenido público enriquecido: ciudades, trámites, sedes, hospitales, empleo y configuración global.');
}

main()
  .catch((error) => {
    console.error('Error enriqueciendo contenido público:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
