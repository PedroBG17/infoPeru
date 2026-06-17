import { Briefcase, FileText, Hospital, Layers, ShieldCheck } from 'lucide-react';
import { getMetadata } from '@/lib/seo';
import { SourceList } from '@/components/common/source-list';
import { editorialImages, pageSources } from '@/lib/editorial-sources';
import {
  Breadcrumbs,
  EditorialHero,
  EditorialPanel,
  LinkCard,
  PortalShell,
  SectionHeader,
  TrustPanel,
} from '@/components/public/portal-ui';

export const revalidate = 86400;

export async function generateMetadata() {
  return getMetadata({
    title: 'Directorios de Informacion Regional y Servicios en el Peru',
    description: 'Accede a directorios regionales de ClavePeru: tramites oficiales, redes de hospitales y bolsa de empleo por ciudad.',
    slug: '/directorios',
  });
}

export default function Page() {
  const directorios = [
    {
      title: 'Guias y tramites TUPA',
      description: 'Requisitos, costos oficiales y pasos de los tramites publicos mas buscados.',
      href: '/tramites',
      icon: FileText,
      meta: 'Tramites',
    },
    {
      title: 'Hospitales y centros de salud',
      description: 'Centros medicos, hospitales, clinicas y orientacion de cobertura por ciudad.',
      href: '/hospitales',
      icon: Hospital,
      meta: 'Salud',
    },
    {
      title: 'Bolsa de empleo regional',
      description: 'Convocatorias, registro de postulantes y alertas contra cobros indebidos.',
      href: '/trabajos',
      icon: Briefcase,
      meta: 'Empleo',
    },
  ];

  const directorySources = [...pageSources.tramites, ...pageSources.salud, ...pageSources.empleo];

  return (
    <PortalShell>
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Directorios', url: '/directorios' },
        ]}
      />

      <EditorialHero
        eyebrow="Portal de utilidad publica"
        title="Directorios de consulta regional"
        description="Accede a guias oficiales, centros de salud, empleo formal y recursos ciudadanos organizados por intencion de busqueda."
        icon={Layers}
        stats={[
          { label: 'Modulos', value: directorios.length },
          { label: 'Fuentes', value: directorySources.length },
          { label: 'CMS', value: 'Activo' },
        ]}
      />

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {directorios.map((directory) => (
          <LinkCard
            key={directory.href}
            href={directory.href}
            title={directory.title}
            description={directory.description}
            meta={directory.meta}
            icon={directory.icon}
          />
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <EditorialPanel>
          <SectionHeader title="Como se organiza la informacion" icon={ShieldCheck} />
          <p className="text-sm leading-7 text-[#6B7280]">
            ClavePeru agrupa servicios ciudadanos por necesidad: tramites para resolver gestiones con el Estado,
            salud para ubicar atencion y cobertura, y empleo para orientar postulaciones formales. Cada seccion
            combina contenido editorial propio, datos gestionados desde el CMS y fuentes publicas citadas.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              'Verifica la fuente oficial antes de pagar tasas o reservar citas.',
              'Usa canales publicos de orientacion ante sintomas, urgencias o dudas de cobertura.',
              'Evita procesos laborales que cobren por postular, capacitar o validar documentos.',
            ].map((item) => (
              <div key={item} className="border border-[#E8E4DE] bg-[#F8F5F0] p-4 text-sm leading-6 text-[#6B7280]">
                {item}
              </div>
            ))}
          </div>
        </EditorialPanel>

        <aside className="space-y-6">
          <TrustPanel
            title="Un portal, una misma experiencia"
            description="Los directorios mantienen una interfaz consistente para que el usuario compare, escanee y llegue al recurso correcto sin perder contexto."
            items={['Modulos por ciudad.', 'Fuentes visibles.', 'Gestion desde CMS.']}
          />
          <SourceList title="Fuentes editoriales del portal" sources={directorySources} image={editorialImages.directorios} />
        </aside>
      </div>
    </PortalShell>
  );
}
