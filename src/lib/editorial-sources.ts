export type EditorialSource = {
  label: string;
  url: string;
  note?: string;
};

export type EditorialImage = {
  src: string;
  alt: string;
  credit: string;
  sourceUrl: string;
  license: string;
};

export const officialSources = {
  reniecDni: {
    label: 'RENIEC - Duplicado de DNI via web',
    url: 'https://www.gob.pe/institucion/reniec/noticias/895551-reniec-obtenga-el-duplicado-del-dni-facil-rapida-y-segura-via-web',
    note: 'Tasas, codigos de pago y flujo digital del duplicado de DNI.',
  },
  mtcLicenciaA1: {
    label: 'MTC - Licencia de conducir clase A categoria I',
    url: 'https://portal.mtc.gob.pe/page_english/front-end/landtransport/A-1.html',
    note: 'Requisitos generales, examenes y tasa administrativa.',
  },
  migracionesPasaporte: {
    label: 'Migraciones - Pasaporte electronico',
    url: 'https://www.gob.pe/institucion/migraciones/noticias/1400896-atencion-no-se-requieren-formularios-fotocopias-ni-fotografias-fisicas-para-tramitar-el-pasaporte',
    note: 'Tasa oficial y advertencias contra tramitadores.',
  },
  sunatRuc: {
    label: 'SUNAT - Inscripcion en el RUC de personas naturales',
    url: 'https://www.gob.pe/institucion/sunat/noticias/1290681-sunat-inicio-inscripcion-de-oficio-en-el-ruc-de-personas-naturales',
    note: 'Supuestos de obligacion de inscripcion y formalizacion tributaria.',
  },
  sunarpLiteral: {
    label: 'SUNARP - Certificado literal de partida registral',
    url: 'https://scr.sunarp.gob.pe/certificado-literal-de-partida-registral-de-predio/',
    note: 'Requisitos, tasa por paginas y canales de orientacion.',
  },
  sisGratuito: {
    label: 'SIS - Afiliacion al SIS Gratuito',
    url: 'https://www.gob.pe/133-afiliarte-al-sis-gratuito',
    note: 'Requisitos generales y canales de afiliacion.',
  },
  sisCobertura: {
    label: 'SIS - Cobertura del SIS Gratuito',
    url: 'https://www.gob.pe/149-sis-gratuito-cobertura',
    note: 'Cobertura financiera y tipos de condiciones incluidas.',
  },
  minsaDengue: {
    label: 'MINSA - Dengue: sintomas y signos de alarma',
    url: 'https://www.gob.pe/es/41804-que-es-el-dengue-sintomas-y-signos',
    note: 'Sintomas, signos de alarma y canales de orientacion 113 Salud.',
  },
  minsaMental: {
    label: 'MINSA - Cuidado de la salud mental',
    url: 'https://www.gob.pe/institucion/minsa/campa%C3%B1as/6388-campana-de-salud-mental',
    note: 'Centros comunitarios y linea 113 opcion 5.',
  },
  minsaHospitalDirectory: {
    label: 'MINSA BVS - Directorio de hospitales por departamentos',
    url: 'https://bvs.minsa.gob.pe/blog/vhl/directorios/directorio-de-establecimientos-de-salud/directorio-de-hospitales/',
    note: 'Directorio nacional con direcciones, telefonos y portales por region.',
  },
  mtpeCentroEmpleo: {
    label: 'MTPE - Centro de Empleo',
    url: 'https://www.gob.pe/institucion/mtpe/campa%C3%B1as/126666-centro-de-empleo',
    note: 'Servicios gratuitos de bolsa de trabajo, orientacion y CUL.',
  },
  mtpeCul: {
    label: 'MTPE - Certificado Unico Laboral',
    url: 'https://www.gob.pe/institucion/mtpe/noticias/684499-obten-tu-certificado-unico-laboral-a-traves-del-portal-empleos-peru-y-ahorra-tiempo-y-dinero',
    note: 'Documento gratuito para postulantes en Empleos Peru.',
  },
  hrdt: {
    label: 'Hospital Regional Docente de Trujillo',
    url: 'https://www.hrdt.gob.pe/site/',
    note: 'Servicios, emergencia y direccion institucional.',
  },
  hrcusco: {
    label: 'Hospital Regional Cusco - sedes',
    url: 'https://www.gob.pe/institucion/hospital-regional-cusco/sedes',
    note: 'Direccion, central telefonica y contacto oficial.',
  },
  hSantaRosaPiura: {
    label: 'Hospital Santa Rosa Piura - sedes',
    url: 'https://www.gob.pe/institucion/hsantarosa/sedes',
    note: 'Direccion, central telefonica y sedes de atencion.',
  },
  honorioDelgado: {
    label: 'Hospital Regional Honorio Delgado - contacto institucional',
    url: 'https://www.hrhdaqp.gob.pe/pages/vision.php',
    note: 'Direccion y canales oficiales del hospital regional.',
  },
};

export const procedureSources: Record<string, EditorialSource[]> = {
  'dni-duplicado': [officialSources.reniecDni],
  'licencia-de-conducir': [officialSources.mtcLicenciaA1],
  'pasaporte-electronico': [officialSources.migracionesPasaporte],
  'inscripcion-ruc-persona-natural': [officialSources.sunatRuc],
  'afiliacion-sis-gratuito': [officialSources.sisGratuito, officialSources.sisCobertura],
  'certificado-literal-sunarp': [officialSources.sunarpLiteral],
  'certificado-unico-laboral': [officialSources.mtpeCentroEmpleo, officialSources.mtpeCul],
};

export const pageSources = {
  tramites: [
    officialSources.reniecDni,
    officialSources.mtcLicenciaA1,
    officialSources.migracionesPasaporte,
    officialSources.sunatRuc,
    officialSources.sunarpLiteral,
    officialSources.sisGratuito,
    officialSources.mtpeCentroEmpleo,
  ],
  salud: [
    officialSources.sisGratuito,
    officialSources.sisCobertura,
    officialSources.minsaDengue,
    officialSources.minsaMental,
    officialSources.minsaHospitalDirectory,
    officialSources.hrdt,
    officialSources.hrcusco,
    officialSources.hSantaRosaPiura,
    officialSources.honorioDelgado,
  ],
  empleo: [officialSources.mtpeCentroEmpleo, officialSources.mtpeCul],
};

export const editorialImages = {
  tramites: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/SUNAT.%20Jpg.jpg',
    alt: 'Fachada de una oficina publica de SUNAT en Lima',
    credit: 'Carlos Conislla / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:SUNAT._Jpg.jpg',
    license: 'CC BY-SA 4.0',
  },
  salud: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/El%20Hospital%20de%20Lima%20Este-Vitarte.jpg',
    alt: 'Hospital publico de Lima Este - Vitarte',
    credit: 'Stephaniedayana / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:El_Hospital_de_Lima_Este-Vitarte.jpg',
    license: 'CC BY-SA 4.0',
  },
  empleo: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/PCM-Trabajo.png',
    alt: 'Identidad visual del Ministerio de Trabajo y Promocion del Empleo del Peru',
    credit: 'CanalesQuintanilla / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:PCM-Trabajo.png',
    license: 'Dominio publico - simbolo oficial',
  },
  directorios: {
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lima%20Palacio%20del%20gobierno%20del%20Per%C3%BA.jpg',
    alt: 'Palacio de Gobierno del Peru en Lima',
    credit: 'Rodolfo pimentel / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lima_Palacio_del_gobierno_del_Per%C3%BA.jpg',
    license: 'CC BY-SA 4.0',
  },
};
