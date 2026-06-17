import { Clock, HeartPulse, Hospital, Shield } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import { CiudadesList } from '@/components/salud/ciudades-list';
import {
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  PortalShell,
  SectionHeader,
  TrustPanel,
} from '@/components/public/portal-ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorio de Hospitales y Clinicas en el Peru',
    description: 'Encuentra telefonos de emergencia, direcciones y horarios de atencion de clinicas, hospitales de EsSalud y MINSA organizados por ciudad.',
    slug: '/hospitales',
  });
}

export default async function Page() {
  const ciudadesConHospitales = await prisma.ciudad.findMany({
    where: {
      hospitales: {
        some: {},
      },
    },
    include: {
      departamento: true,
      hospitales: true,
    },
    orderBy: { name: 'asc' },
  });

  const totalHospitales = ciudadesConHospitales.reduce((total, ciudad) => total + ciudad.hospitales.length, 0);

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Directorios', url: '/directorios' },
          { name: 'Hospitales', url: '/hospitales' },
        ]}
      />

      <EditorialHero
        eyebrow="Directorio medico regional"
        title="Hospitales y centros de salud del Peru"
        description="Encuentra centros de atencion medica por ciudad, con telefonos, direcciones, horarios y orientacion para ubicar servicios publicos y privados."
        icon={Hospital}
        stats={[
          { label: 'Ciudades', value: ciudadesConHospitales.length },
          { label: 'Centros', value: totalHospitales },
          { label: 'Fuentes', value: pageSources.salud.length },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <EditorialPanel>
            <SectionHeader
              title="Buscar directorio de salud por ciudad"
              description="Filtra la cobertura disponible y entra al directorio local de hospitales, clinicas y centros de salud."
              icon={Hospital}
            />
            <CiudadesList initialCiudades={ciudadesConHospitales} />
          </EditorialPanel>

          <EditorialPanel>
            <SectionHeader title="Sistemas de cobertura en el Peru" icon={HeartPulse} />
            <div className="space-y-4 text-sm leading-7 text-[#6B7280]">
              <p>
                El sistema hospitalario peruano combina prestadores publicos del MINSA, EsSalud y redes privadas.
                En emergencias graves, la prioridad debe ser recibir atencion inmediata y confirmar cobertura despues.
              </p>
              <p>
                Si no cuentas con seguro, revisa primero tu afiliacion SIS y la cobertura vigente. Para orientacion
                sanitaria, MINSA mantiene canales publicos como la Linea 113.
              </p>
              <p>
                Ante signos de alarma como dolor intenso, sangrado, vomitos persistentes o dificultad respiratoria,
                acude a un establecimiento de salud o llama a los numeros de emergencia oficiales.
              </p>
            </div>
          </EditorialPanel>
        </div>

        <aside className="space-y-6">
          <TrustPanel
            title="Datos para decidir rapido"
            description="La seccion prioriza datos utiles para ubicar atencion: ciudad, direccion, telefono, tipo de centro y disponibilidad 24h cuando existe."
            items={['Verifica telefono antes de trasladarte.', 'Confirma cobertura con la entidad oficial.', 'Usa emergencias para casos de riesgo.']}
          />

          <EditorialPanel>
            <SectionHeader title="Puntos de seguridad" icon={Shield} />
            <div className="space-y-3 text-sm leading-6 text-[#6B7280]">
              <p className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                Prioriza centros 24h cuando la atencion no puede esperar.
              </p>
              <p>
                Este portal organiza informacion publica con fines de orientacion ciudadana; no suplanta a MINSA,
                SIS, EsSalud, SUSALUD ni establecimientos privados.
              </p>
            </div>
          </EditorialPanel>

          <SourceList title="Fuentes oficiales de salud" sources={pageSources.salud} image={editorialImages.salud} />
        </aside>
      </div>
    </PortalShell>
  );
}
