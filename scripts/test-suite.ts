import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function testDatabase() {
  console.log('\n==================================================');
  console.log('🧪 TEST 1: Conectividad y Verificación de Base de Datos');
  console.log('==================================================');

  try {
    const depsCount = await prisma.departamento.count();
    const citiesCount = await prisma.ciudad.count();
    const procsCount = await prisma.procedimiento.count();
    const relsCount = await prisma.procedimientoCiudad.count();
    const officesCount = await prisma.sedeOficina.count();
    const hospCount = await prisma.hospital.count();

    console.log(`✓ Departamentos en DB: ${depsCount}`);
    console.log(`✓ Ciudades en DB: ${citiesCount}`);
    console.log(`✓ Procedimientos en DB: ${procsCount}`);
    console.log(`✓ Relaciones pSEO en DB: ${relsCount}`);
    console.log(`✓ Oficinas registradas: ${officesCount}`);
    console.log(`✓ Hospitales registrados: ${hospCount}`);

    if (depsCount === 0 || citiesCount === 0 || procsCount === 0) {
      throw new Error('La base de datos está vacía. Es necesario ejecutar prisma db seed.');
    }

    console.log('🎉 TEST 1 COMPLETADO: Base de Datos íntegra y conectada.');
  } catch (error) {
    console.error('❌ ERROR EN TEST 1:', error);
    process.exit(1);
  }
}

async function testEndpoints() {
  console.log('\n==================================================');
  console.log('🧪 TEST 2: Verificación de Endpoints HTTP e ISR');
  console.log('==================================================');

  const routes = [
    { path: '/', expectedStatus: 200, name: 'Página de Inicio' },
    { path: '/tramites', expectedStatus: 200, name: 'Índice de Trámites' },
    { path: '/tramites/dni-duplicado', expectedStatus: 200, name: 'Trámite de DNI' },
    { path: '/tramites/licencia-de-conducir/lima', expectedStatus: 200, name: 'pSEO Brevete en Lima' },
    { path: '/hospitales', expectedStatus: 200, name: 'Índice de Hospitales' },
    { path: '/hospitales/lima', expectedStatus: 200, name: 'Directorio de Salud Lima' },
    { path: '/trabajos', expectedStatus: 200, name: 'Índice de Bolsa de Empleo' },
    { path: '/trabajos/lima', expectedStatus: 200, name: 'Bolsa de Empleo Lima' },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route.path}`);
      if (res.status === route.expectedStatus) {
        console.log(`✓ [${res.status}] ${route.name} (${route.path})`);
      } else {
        console.error(`❌ [${res.status}] ${route.name} (${route.path}) - Esperado: ${route.expectedStatus}`);
        process.exit(1);
      }
    } catch (e) {
      console.error(`❌ Error al conectar a ${route.path}:`, e);
      process.exit(1);
    }
  }

  console.log('🎉 TEST 2 COMPLETADO: Todas las páginas clave cargan correctamente.');
}

async function testAPIs() {
  console.log('\n==================================================');
  console.log('🧪 TEST 3: Verificación de Seguridad y APIs (REST & Crons)');
  console.log('==================================================');

  // 1. Test Cron de Costos sin autorización
  try {
    const res = await fetch(`${BASE_URL}/api/v1/cron/update-costs`);
    if (res.status === 401) {
      console.log('✓ [401] Cron de costos deniega acceso anónimo (Seguridad)');
    } else {
      console.error(`❌ [${res.status}] Cron de costos debió denegar acceso anónimo.`);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error en Cron Auth Test:', e);
    process.exit(1);
  }

  // 2. Test Cron de Costos con autorización
  try {
    const res = await fetch(`${BASE_URL}/api/v1/cron/update-costs`, {
      headers: {
        'Authorization': 'Bearer dataperu_internal_cron_token_2026'
      }
    });
    if (res.status === 200) {
      const data = await res.json();
      console.log(`✓ [200] Cron de costos ejecutado y revalidado con éxito. Trámites actualizados: ${data.updatedCount}`);
    } else {
      console.error(`❌ [${res.status}] Cron de costos falló al procesarse con token.`);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error en Cron Exec Test:', e);
    process.exit(1);
  }

  // 3. Test Lead API - Validación fallida (Campos vacíos)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status === 400) {
      console.log('✓ [400] API de Leads rechaza inputs vacíos (Zod Validation)');
    } else {
      console.error(`❌ [${res.status}] API de Leads debió retornar Bad Request para inputs vacíos.`);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error en Lead Validation Test:', e);
    process.exit(1);
  }

  // 4. Test Lead API - Creación exitosa de Lead
  // Obtenemos una ciudad real
  const ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) {
    console.error('❌ No se encontró ninguna ciudad para simular Lead.');
    process.exit(1);
  }

  const randomEmail = `test.lead.${Date.now()}@example.com`;
  const leadPayload = {
    name: 'Juan Perez de Prueba',
    email: randomEmail,
    phone: '999999999',
    message: 'Consulta médica de prueba del simulador de testing.',
    cityId: ciudad.id,
    sectorId: 'sec-salud',
    consent: true,
  };

  try {
    const res = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload),
    });

    if (res.status === 201) {
      console.log('✓ [201] API de Leads crea y sanitiza prospecto correctamente.');
    } else {
      const errData = await res.json();
      console.error(`❌ [${res.status}] API de Leads falló al crear lead válido.`, errData);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error en Lead Creation Test:', e);
    process.exit(1);
  }

  // 5. Test Lead API - Spam Prevention (Envío duplicado en <5 min)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload),
    });

    if (res.status === 429) {
      console.log('✓ [429] API de Leads bloquea envío duplicado de spam (Rate Limit/Antispam)');
    } else {
      console.error(`❌ [${res.status}] API de Leads debió bloquear envío duplicado con código 429.`);
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error en Lead Spam Test:', e);
    process.exit(1);
  }

  console.log('🎉 TEST 3 COMPLETADO: Las APIs, esquemas de seguridad y validaciones funcionan perfectamente.');
}

async function run() {
  await testDatabase();
  await testEndpoints();
  await testAPIs();

  console.log('\n==================================================');
  console.log('🏆 TODOS LOS TESTS COMPLETIOS Y VERIFICADOS CON ÉXITO');
  console.log('==================================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error al correr el test suite:', err);
  process.exit(1);
});
