// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el sembrado de la base de datos de DataPerú...');

  // 1. Limpieza de datos existentes para evitar duplicados
  await prisma.lead.deleteMany();
  await prisma.sedeOficina.deleteMany();
  await prisma.procedimientoCiudad.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.ciudad.deleteMany();
  await prisma.departamento.deleteMany();
  await prisma.procedimiento.deleteMany();
  await prisma.sEOConfig.deleteMany();

  console.log('✓ Base de datos limpia de registros previos.');

  // 2. Creación de Departamentos
  const depLima = await prisma.departamento.create({
    data: { name: 'Lima', slug: 'lima' },
  });
  const depArequipa = await prisma.departamento.create({
    data: { name: 'Arequipa', slug: 'arequipa' },
  });
  const depLaLibertad = await prisma.departamento.create({
    data: { name: 'La Libertad', slug: 'la-libertad' },
  });

  console.log('✓ Departamentos creados.');

  // 3. Creación de Ciudades
  const lima = await prisma.ciudad.create({
    data: { name: 'Lima Metropolitana', slug: 'lima', departamentoId: depLima.id },
  });
  const arequipa = await prisma.ciudad.create({
    data: { name: 'Arequipa', slug: 'arequipa', departamentoId: depArequipa.id },
  });
  await prisma.ciudad.create({
    data: { name: 'Trujillo', slug: 'trujillo', departamentoId: depLaLibertad.id },
  });

  console.log('✓ Ciudades creadas.');

  // 4. Creación de Configuraciones SEO
  const seoDni = await prisma.sEOConfig.create({
    data: {
      metaTitle: 'Duplicado de DNI en Perú - Pasos y Requisitos',
      metaDescription: 'Conoce cómo solicitar el duplicado de tu DNI de forma presencial o virtual. Requisitos y costos actualizados.',
      keywords: ['dni', 'duplicado', 'reniec', 'tramites peru'],
    },
  });

  const seoBrevete = await prisma.sEOConfig.create({
    data: {
      metaTitle: 'Licencia de Conducir A1 - Requisitos oficiales del MTC',
      metaDescription: 'Guía paso a paso para obtener tu brevete por primera vez en cualquier región de Perú.',
      keywords: ['brevete A1', 'licencia de conducir', 'mtc', 'examen medico brevete'],
    },
  });

  // 5. Creación de Procedimientos Core
  const proDni = await prisma.procedimiento.create({
    data: {
      title: 'Duplicado de DNI',
      slug: 'dni-duplicado',
      description: 'El duplicado del Documento Nacional de Identidad (DNI) es un trámite oficial que se realiza ante el RENIEC en caso de pérdida, robo o deterioro grave del documento.',
      requisitos: [
        'Haber cumplido los 18 años de edad.',
        'Contar con una cuenta de usuario en el portal web de RENIEC (si se hace virtual).',
        'Realizar el pago correspondiente de la tasa en el Banco de la Nación o Págalo.pe.'
      ],
      seoConfigId: seoDni.id,
    },
  });

  const proBrevete = await prisma.procedimiento.create({
    data: {
      title: 'Licencia de Conducir A1',
      slug: 'licencia-de-conducir',
      description: 'La licencia de conducir de Clase A Categoría 1 es el brevete básico y obligatorio que te permite manejar vehículos particulares (sedán, hatchback, SUV) en todo el territorio nacional.',
      requisitos: [
        'Ser mayor de 18 años.',
        'Aprobar el examen médico de aptitud psicosomática en un centro autorizado por el MTC.',
        'Aprobar el examen de normas de tránsito (teórico).',
        'Aprobar el examen de manejo práctico.'
      ],
      seoConfigId: seoBrevete.id,
    },
  });

  console.log('✓ Procedimientos core creados.');

  // 6. Relaciones Intermedias pSEO (Trámite por Ciudad)
  // 6.1 DNI en Lima
  const pcDniLima = await prisma.procedimientoCiudad.create({
    data: {
      procedimientoId: proDni.id,
      ciudadId: lima.id,
      costo: 21.0,
      pasos: [
        { titulo: 'Pago de Tasa', descripcion: 'Paga la tasa de S/ 21.00 utilizando el código 00681 en Págalo.pe o en cualquier sucursal del Banco de la Nación.' },
        { titulo: 'Solicitud Virtual', descripcion: 'Ingresa al portal oficial de RENIEC, completa tus datos biométricos mediante la app móvil y solicita el duplicado.' },
        { titulo: 'Recojo', descripcion: 'Espera la confirmación de entrega y acércate a la oficina seleccionada en Lima Metropolitana a recoger tu documento.' }
      ],
      faq: [
        { question: '¿Cuánto demora el duplicado de DNI en Lima?', answer: 'Por vía virtual tarda entre 3 a 5 días hábiles. En modalidad presencial puede demorar hasta 10 días.' },
        { question: '¿Puedo mandar a un tercero a recoger mi DNI?', answer: 'Sí, mediante una carta poder simple firmada y con huella digital del titular.' }
      ]
    },
  });

  // 6.2 DNI en Arequipa
  await prisma.procedimientoCiudad.create({
    data: {
      procedimientoId: proDni.id,
      ciudadId: arequipa.id,
      costo: 21.0,
      pasos: [
        { titulo: 'Pago de Tasa', descripcion: 'Paga la tasa de S/ 21.00 en el Banco de la Nación de la Av. La Merced o vía virtual en Págalo.pe.' },
        { titulo: 'Trámite', descripcion: 'Presenta tu solicitud vía web de RENIEC o asiste de forma presencial a la sede del centro histórico de Arequipa.' },
        { titulo: 'Recojo', descripcion: 'Recoge tu DNI presentando tu ticket en la sede de RENIEC seleccionada.' }
      ],
      faq: [
        { question: '¿Dónde recojo mi DNI en Arequipa?', answer: 'En la sede principal de RENIEC ubicada en la Calle Santo Domingo.' }
      ]
    },
  });

  // 6.3 Brevete en Lima
  const pcBreveteLima = await prisma.procedimientoCiudad.create({
    data: {
      procedimientoId: proBrevete.id,
      ciudadId: lima.id,
      costo: 24.50,
      pasos: [
        { titulo: 'Examen Médico', descripcion: 'Realiza tu evaluación médica en cualquier clínica autorizada en Lima por el MTC (costo promedio entre S/ 80 y S/ 150).' },
        { titulo: 'Examen de Reglas y Manejo', descripcion: 'Agenda tu cita teórica y de manejo en el centro de evaluación oficial de Touring y Automóvil Club del Perú en Conchán o Lince.' },
        { titulo: 'Emisión del Brevete', descripcion: 'Paga la tasa de emisión de S/ 24.50 y recoge tu licencia física en las sedes del MTC en Lince o Cercado.' }
      ],
      faq: [
        { question: '¿Dónde se da el examen de manejo en Lima?', answer: 'El examen oficial se rinde en el centro de evaluaciones del Touring en Conchán (Panamericana Sur).' },
        { question: '¿Puedo tramitar el brevete electrónico en Lima?', answer: 'Sí, tiene un costo menor (S/ 6.70) y se descarga de manera instantánea tras aprobar los exámenes.' }
      ]
    },
  });

  // 6.4 Brevete en Arequipa
  const pcBreveteArequipa = await prisma.procedimientoCiudad.create({
    data: {
      procedimientoId: proBrevete.id,
      ciudadId: arequipa.id,
      costo: 35.0,
      pasos: [
        { titulo: 'Evaluación Psicosomática', descripcion: 'Rinde tu examen médico en un centro autorizado en Arequipa.' },
        { titulo: 'Examen del Gobierno Regional', descripcion: 'Agenda y aprueba las pruebas de reglas y destreza en la Gerencia Regional de Transportes de Arequipa.' },
        { titulo: 'Solicitud de Licencia', descripcion: 'Efectúa el pago del trámite regional de S/ 35.00 y reclama tu documento físico.' }
      ],
      faq: [
        { question: '¿Dónde queda la Gerencia de Transportes de Arequipa?', answer: 'Está ubicada en la Av. Kennedy, distrito de Paucarpata.' }
      ]
    },
  });

  console.log('✓ Relaciones pSEO (ProcedimientoCiudad) sembradas.');

  // 7. Creación de Oficinas Físicas (Sedes)
  // Sedes DNI Lima
  await prisma.sedeOficina.create({
    data: {
      nombre: 'RENIEC Sede Central Lima',
      direccion: 'Jr. Cusco 653, Cercado de Lima',
      latitud: -12.0521,
      longitud: -77.0298,
      horario: 'Lunes a Viernes de 8:45 AM a 4:45 PM',
      ciudadId: lima.id,
      procedimientoCiudadId: pcDniLima.id,
    },
  });
  await prisma.sedeOficina.create({
    data: {
      nombre: 'RENIEC Miraflores',
      direccion: 'Av. Ernesto Diez Canseco 230, Miraflores',
      horario: 'Lunes a Viernes de 8:45 AM a 4:45 PM',
      ciudadId: lima.id,
      procedimientoCiudadId: pcDniLima.id,
    },
  });

  // Sedes Brevete Lima
  await prisma.sedeOficina.create({
    data: {
      nombre: 'Touring Club del Perú - Conchán',
      direccion: 'Km 21.5 de la Panamericana Sur, Villa El Salvador',
      horario: 'Lunes a Sábado de 7:00 AM a 4:00 PM',
      ciudadId: lima.id,
      procedimientoCiudadId: pcBreveteLima.id,
    },
  });

  // Sedes Brevete Arequipa
  await prisma.sedeOficina.create({
    data: {
      nombre: 'Gerencia Regional de Transportes y Comunicaciones',
      direccion: 'Av. Kennedy s/n, Paucarpata, Arequipa',
      horario: 'Lunes a Viernes de 8:00 AM a 3:00 PM',
      ciudadId: arequipa.id,
      procedimientoCiudadId: pcBreveteArequipa.id,
    },
  });

  console.log('✓ Sedes de oficinas físicas asignadas.');

  // 8. Directorio de Hospitales
  await prisma.hospital.create({
    data: {
      nombre: 'Hospital Nacional Edgardo Rebagliati Martins',
      slug: 'hospital-rebagliati-lima',
      tipo: 'ESSALUD',
      direccion: 'Av. Edgardo Rebagliati 490, Jesús María, Lima',
      telefono: '(01) 265-4900',
      horario24h: true,
      ciudadId: lima.id,
    },
  });

  await prisma.hospital.create({
    data: {
      nombre: 'Hospital Nacional Guillermo Almenara Irigoyen',
      slug: 'hospital-almenara-lima',
      tipo: 'ESSALUD',
      direccion: 'Av. Grau 800, La Victoria, Lima',
      horario24h: true,
      ciudadId: lima.id,
    },
  });

  await prisma.hospital.create({
    data: {
      nombre: 'Hospital de Apoyo Departamental Honorio Delgado',
      slug: 'hospital-honorio-delgado-arequipa',
      tipo: 'MINSA',
      direccion: 'Av. Alcides Carrión s/n, Arequipa',
      telefono: '(054) 231-818',
      horario24h: true,
      ciudadId: arequipa.id,
    },
  });

  console.log('✓ Directorio de hospitales sembrado con éxito.');
  console.log('----------------------------------------------------');
  console.log('Base de datos sembrada perfectamente. ¡Listo para pruebas localmente!');
}

main()
  .catch((e) => {
    console.error('Error durante el sembrado de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
