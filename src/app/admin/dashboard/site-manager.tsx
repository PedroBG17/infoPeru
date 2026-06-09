'use client';

import React, { useMemo, useState, useTransition } from 'react';
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Database,
  Edit,
  FileSearch,
  FileText,
  Globe2,
  Hospital,
  Layers3,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  SearchCheck,
  Trash2,
} from 'lucide-react';
import {
  deleteCiudadAction,
  deleteDepartamentoAction,
  deleteHospitalAction,
  deleteJobListingAction,
  deleteProcedimientoAction,
  deleteProcedimientoCiudadAction,
  deleteSedeOficinaAction,
  revalidateSiteAction,
  saveCiudadAction,
  saveDepartamentoAction,
  saveHospitalAction,
  saveJobListingAction,
  saveProcedimientoAction,
  saveProcedimientoCiudadAction,
  saveSedeOficinaAction,
  saveSiteSettingsAction,
} from './actions';
import type { SiteSettings } from '@/types/site-settings';

type CmsActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

type Departamento = {
  id: string;
  name: string;
  slug: string;
  _count?: { ciudades: number };
};

type Ciudad = {
  id: string;
  name: string;
  slug: string;
  departamentoId: string;
  departamento: { id: string; name: string };
  _count?: { procedimientos: number; hospitales: number; leads: number };
};

type Procedimiento = {
  id: string;
  title: string;
  slug: string;
  description: string;
  requisitos: string[];
  seoConfigId: string | null;
  seoConfig?: {
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[];
    robotsDirective: string;
  } | null;
  _count?: { ciudadesRel: number };
};

type ProcedimientoCiudad = {
  id: string;
  procedimientoId: string;
  ciudadId: string;
  costo: number;
  pasos: unknown;
  faq: unknown;
  procedimiento: { id: string; title: string; slug: string };
  ciudad: { id: string; name: string; slug: string; departamento?: { name: string } };
  sedes?: { id: string }[];
};

type HospitalItem = {
  id: string;
  nombre: string;
  slug: string;
  tipo: string;
  direccion: string;
  telefono: string | null;
  horario24h: boolean;
  ciudadId: string;
  ciudad: { id: string; name: string; slug: string; departamento?: { name: string } };
};

type SedeOficinaCms = {
  id: string;
  nombre: string;
  direccion: string;
  horario: string;
  contacto: string | null;
  latitud: number | null;
  longitud: number | null;
  ciudadId: string;
  procedimientoCiudadId: string | null;
  ciudad: { id: string; name: string; slug: string };
  procedimientoCiudad?: {
    id: string;
    procedimiento: { title: string; slug: string };
    ciudad: { name: string; slug: string };
  } | null;
};

type PostSeo = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImage: string | null;
};

type JobListingCms = {
  id: string;
  title: string;
  slug: string;
  company: string;
  sectorId: string;
  sectorName: string;
  description: string;
  salaryRange: string;
  requirements: string[];
  type: string;
  published: boolean;
  cityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  city: { id: string; name: string; slug: string; departamento?: { name: string } };
};

type SiteManagerProps = {
  departamentos: Departamento[];
  ciudades: Ciudad[];
  procedimientos: Procedimiento[];
  relaciones: ProcedimientoCiudad[];
  sedes: SedeOficinaCms[];
  hospitales: HospitalItem[];
  posts: PostSeo[];
  jobListings: JobListingCms[];
  siteSettings: SiteSettings;
};

type TabKey = 'resumen' | 'sitio' | 'territorio' | 'tramites' | 'pseo' | 'salud' | 'seo' | 'empleo';

const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: 'resumen', label: 'Resumen', icon: <Activity className="h-3.5 w-3.5" /> },
  { key: 'sitio', label: 'Sitio', icon: <Globe2 className="h-3.5 w-3.5" /> },
  { key: 'territorio', label: 'Territorio', icon: <MapPin className="h-3.5 w-3.5" /> },
  { key: 'tramites', label: 'Trámites', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'pseo', label: 'pSEO', icon: <Layers3 className="h-3.5 w-3.5" /> },
  { key: 'salud', label: 'Salud', icon: <Hospital className="h-3.5 w-3.5" /> },
  { key: 'seo', label: 'SEO', icon: <SearchCheck className="h-3.5 w-3.5" /> },
  { key: 'empleo', label: 'Empleo', icon: <Briefcase className="h-3.5 w-3.5" /> },
];

const employmentSectors = [
  { id: 'sec-mineria', name: 'Minería e Ingeniería' },
  { id: 'sec-agro', name: 'Agroindustria y Pesca' },
  { id: 'sec-comercio', name: 'Comercio y Retail' },
  { id: 'sec-salud', name: 'Salud y Medicina' },
  { id: 'sec-educacion', name: 'Educación y Academia' },
  { id: 'sec-turismo', name: 'Turismo y Gastronomía' },
  { id: 'sec-admin', name: 'Administración y Finanzas' },
  { id: 'sec-construccion', name: 'Construcción e Infraestructura' },
];

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function jsonToPipeLines(value: unknown, firstKey: string, secondKey: string) {
  if (!Array.isArray(value)) return '';
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const record = item as Record<string, string>;
      return `${record[firstKey] || ''} | ${record[secondKey] || ''}`.trim();
    })
    .filter((line) => line !== '|')
    .join('\n');
}

function truncate(value: string, max = 90) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function seoScoreForProcedure(item: Procedimiento) {
  let score = 0;
  if (item.title.length >= 20 && item.title.length <= 70) score += 20;
  if (item.description.length >= 120) score += 20;
  if (item.requisitos.length >= 2) score += 15;
  if ((item._count?.ciudadesRel || 0) > 0) score += 20;
  if (item.seoConfig?.metaTitle) score += 10;
  if (item.seoConfig?.metaDescription) score += 10;
  if ((item.seoConfig?.keywords || []).length > 0) score += 5;
  return score;
}

function seoScoreForPost(item: PostSeo) {
  let score = 0;
  if (item.metaTitle && item.metaTitle.length >= 30 && item.metaTitle.length <= 65) score += 30;
  if (item.metaDescription && item.metaDescription.length >= 110 && item.metaDescription.length <= 160) score += 30;
  if (item.coverImage) score += 25;
  if (item.published) score += 15;
  return score;
}

function scoreLabel(score: number) {
  if (score >= 80) return { label: 'Óptimo', className: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
  if (score >= 55) return { label: 'Mejorable', className: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
  return { label: 'Crítico', className: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
}

export function SiteManager({
  departamentos,
  ciudades,
  procedimientos,
  relaciones,
  sedes,
  hospitales,
  posts,
  jobListings,
  siteSettings,
}: SiteManagerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('resumen');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null);
  const [editingCiudad, setEditingCiudad] = useState<Ciudad | null>(null);
  const [editingProcedimiento, setEditingProcedimiento] = useState<Procedimiento | null>(null);
  const [editingRelacion, setEditingRelacion] = useState<ProcedimientoCiudad | null>(null);
  const [editingSede, setEditingSede] = useState<SedeOficinaCms | null>(null);
  const [editingHospital, setEditingHospital] = useState<HospitalItem | null>(null);
  const [editingJob, setEditingJob] = useState<JobListingCms | null>(null);

  const audit = useMemo(() => {
    const tramiteIssues = procedimientos.filter((item) => seoScoreForProcedure(item) < 80).length;
    const postIssues = posts.filter((item) => seoScoreForPost(item) < 80).length;
    const hospitalIssues = hospitales.filter((item) => !item.telefono || item.direccion.length < 12).length;
    const ciudadIssues = ciudades.filter((item) => (item._count?.procedimientos || 0) === 0 && (item._count?.hospitales || 0) === 0).length;
    const jobIssues = jobListings.filter((item) => !item.published || item.requirements.length === 0 || !item.metaTitle || !item.metaDescription).length;
    const pseoMissing = Math.max(0, procedimientos.length * Math.min(ciudades.length, 5) - relaciones.length);

    return {
      totalIssues: tramiteIssues + postIssues + hospitalIssues + ciudadIssues + jobIssues,
      tramiteIssues,
      postIssues,
      hospitalIssues,
      ciudadIssues,
      jobIssues,
      pseoMissing,
      coverage: procedimientos.length > 0 && ciudades.length > 0
        ? Math.round((relaciones.length / (procedimientos.length * ciudades.length)) * 100)
        : 0,
    };
  }, [ciudades, hospitales, jobListings, posts, procedimientos, relaciones]);

  const runAction = (action: (formData: FormData) => Promise<CmsActionResult>, formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const res = await action(formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: res?.message || 'Cambios guardados.' });
        window.setTimeout(() => window.location.reload(), 650);
      }
    });
  };

  const runDelete = (action: (id: string) => Promise<CmsActionResult>, id: string, label: string) => {
    if (!confirm(`¿Eliminar "${label}"? Esta acción puede afectar rutas públicas.`)) return;
    setMessage(null);
    startTransition(async () => {
      const res = await action(id);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: res?.message || 'Registro eliminado.' });
        window.setTimeout(() => window.location.reload(), 650);
      }
    });
  };

  const runMaintenance = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await revalidateSiteAction();
      setMessage(res?.error
        ? { type: 'error', text: res.error }
        : { type: 'success', text: res?.message || 'Sitio revalidado.' }
      );
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-xl border p-4 text-sm font-semibold ${
          message.type === 'success'
            ? 'border-emerald-800/40 bg-emerald-950/30 text-emerald-300'
            : 'border-rose-800/40 bg-rose-950/30 text-rose-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label="Ciudades" value={ciudades.length} icon={<MapPin className="h-5 w-5" />} />
            <MetricCard label="Trámites" value={procedimientos.length} icon={<FileText className="h-5 w-5" />} />
            <MetricCard label="pSEO activas" value={relaciones.length} icon={<Layers3 className="h-5 w-5" />} />
            <MetricCard label="Hospitales" value={hospitales.length} icon={<Hospital className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">Auditoría ejecutiva del portal</h3>
                  <p className="mt-1 text-xs text-slate-400">Prioriza lo que afecta indexación, cobertura programática y confianza editorial.</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${audit.totalIssues > 0 ? 'border-amber-800/40 bg-amber-950/30 text-amber-300' : 'border-emerald-800/40 bg-emerald-950/30 text-emerald-300'}`}>
                  {audit.totalIssues} alertas
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AuditItem label="Trámites con SEO incompleto" value={audit.tramiteIssues} />
                <AuditItem label="Noticias con metadatos débiles" value={audit.postIssues} />
                <AuditItem label="Hospitales sin teléfono/dirección fuerte" value={audit.hospitalIssues} />
                <AuditItem label="Ciudades sin cobertura útil" value={audit.ciudadIssues} />
                <AuditItem label="Vacantes sin SEO/publicación completa" value={audit.jobIssues} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-heading text-lg font-bold text-white">Cobertura pSEO</h3>
              <div className="mt-5">
                <div className="flex items-end gap-2">
                  <span className="font-heading text-4xl font-black text-teal-400">{audit.coverage}%</span>
                  <span className="pb-1 text-xs text-slate-500">matriz trámite x ciudad</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
                  <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, audit.coverage)}%` }} />
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">
                  Próxima palanca: crear combinaciones con intención local antes de expandir más secciones editoriales.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'sitio' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <Panel title="Portada y mensajes globales" description="Controla el primer impacto editorial: hero, llamadas a la acción, confianza, ticker y footer.">
              <SiteSettingsForm
                settings={siteSettings}
                isPending={isPending}
                onSubmit={(formData) => runAction((fd) => saveSiteSettingsAction(null, fd), formData)}
              />
            </Panel>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <Panel title="Estado de publicación" description="Resumen ejecutivo de los elementos gestionados desde esta pantalla.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <MetricCard label="Mensajes ticker" value={siteSettings.tickerItems.length} icon={<Activity className="h-5 w-5" />} />
                <MetricCard label="Badges hero" value={siteSettings.home.trustBadges.length} icon={<CheckCircle className="h-5 w-5" />} />
                <MetricCard label="CTAs portada" value={2} icon={<Globe2 className="h-5 w-5" />} />
              </div>
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Titular activo</p>
                <p className="mt-2 text-sm font-bold leading-6 text-white">
                  {siteSettings.home.titleLine1} {siteSettings.home.titleLine2} {siteSettings.home.accent}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{truncate(siteSettings.home.description, 150)}</p>
              </div>
            </Panel>
          </div>
        </section>
      )}

      {activeTab === 'territorio' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel title="Departamentos" description="Base territorial para ciudades, directorios y cobertura SEO.">
            <DepartamentoForm
              item={editingDepartamento}
              isPending={isPending}
              onCancel={() => setEditingDepartamento(null)}
              onSubmit={(formData) => runAction((fd) => saveDepartamentoAction(null, fd), formData)}
            />
            <div className="mt-5 space-y-2">
              {departamentos.map((item) => (
                <ListRow
                  key={item.id}
                  title={item.name}
                  subtitle={`/${item.slug} · ${item._count?.ciudades || 0} ciudades`}
                  onEdit={() => setEditingDepartamento(item)}
                  onDelete={() => runDelete(deleteDepartamentoAction, item.id, item.name)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Ciudades" description="Controla las páginas locales de trámites, salud y empleo.">
            <CiudadForm
              item={editingCiudad}
              departamentos={departamentos}
              isPending={isPending}
              onCancel={() => setEditingCiudad(null)}
              onSubmit={(formData) => runAction((fd) => saveCiudadAction(null, fd), formData)}
            />
            <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {ciudades.map((item) => (
                <ListRow
                  key={item.id}
                  title={item.name}
                  subtitle={`${item.departamento.name} · /${item.slug} · ${item._count?.procedimientos || 0} trámites · ${item._count?.hospitales || 0} hospitales`}
                  onEdit={() => setEditingCiudad(item)}
                  onDelete={() => runDelete(deleteCiudadAction, item.id, item.name)}
                />
              ))}
            </div>
          </Panel>
        </section>
      )}

      {activeTab === 'tramites' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Panel title="Editor de trámites" description="Gestiona contenido evergreen, requisitos y metadatos SEO.">
              <ProcedimientoForm
                item={editingProcedimiento}
                isPending={isPending}
                onCancel={() => setEditingProcedimiento(null)}
                onSubmit={(formData) => runAction((fd) => saveProcedimientoAction(null, fd), formData)}
              />
            </Panel>
          </div>
          <div className="xl:col-span-3">
            <Panel title="Inventario de trámites" description="Cada trámite puede tener páginas locales pSEO por ciudad.">
              <div className="space-y-3">
                {procedimientos.map((item) => {
                  const score = seoScoreForProcedure(item);
                  const label = scoreLabel(score);
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-100">{item.title}</h4>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${label.className}`}>{label.label} · {score}%</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">/{item.slug} · {item._count?.ciudadesRel || 0} páginas locales</p>
                          <p className="mt-2 text-xs leading-5 text-slate-400">{truncate(item.description, 140)}</p>
                        </div>
                        <div className="flex gap-2">
                          <IconButton title="Editar" onClick={() => setEditingProcedimiento(item)} icon={<Edit className="h-3.5 w-3.5" />} />
                          <IconButton title="Eliminar" danger onClick={() => runDelete(deleteProcedimientoAction, item.id, item.title)} icon={<Trash2 className="h-3.5 w-3.5" />} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </section>
      )}

      {activeTab === 'pseo' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Panel title="Matriz trámite x ciudad" description="Crea páginas locales con costo, pasos y FAQ para rich snippets.">
              <RelacionForm
                item={editingRelacion}
                procedimientos={procedimientos}
                ciudades={ciudades}
                isPending={isPending}
                onCancel={() => setEditingRelacion(null)}
                onSubmit={(formData) => runAction((fd) => saveProcedimientoCiudadAction(null, fd), formData)}
              />
            </Panel>
            <div className="mt-6">
              <Panel title="Sedes y oficinas" description="Direcciones físicas que aparecen en páginas locales de trámites.">
                <SedeForm
                  item={editingSede}
                  ciudades={ciudades}
                  relaciones={relaciones}
                  isPending={isPending}
                  onCancel={() => setEditingSede(null)}
                  onSubmit={(formData) => runAction((fd) => saveSedeOficinaAction(null, fd), formData)}
                />
              </Panel>
            </div>
          </div>
          <div className="xl:col-span-3">
            <Panel title="Páginas pSEO publicadas" description="Controla cobertura local y contenido estructurado.">
              <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                {relaciones.map((item) => (
                  <ListRow
                    key={item.id}
                    title={`${item.procedimiento.title} en ${item.ciudad.name}`}
                    subtitle={`S/ ${item.costo.toFixed(2)} · ${Array.isArray(item.pasos) ? item.pasos.length : 0} pasos · ${Array.isArray(item.faq) ? item.faq.length : 0} FAQs · ${item.sedes?.length || 0} sedes`}
                    href={`/tramites/${item.procedimiento.slug}/${item.ciudad.slug}`}
                    onEdit={() => setEditingRelacion(item)}
                    onDelete={() => runDelete(deleteProcedimientoCiudadAction, item.id, `${item.procedimiento.title} en ${item.ciudad.name}`)}
                  />
                ))}
              </div>
            </Panel>
            <div className="mt-6">
              <Panel title="Sedes registradas" description="Oficinas conectadas a ciudades y, opcionalmente, a una página pSEO.">
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {sedes.map((item) => (
                    <ListRow
                      key={item.id}
                      title={item.nombre}
                      subtitle={`${item.ciudad.name} · ${item.horario} · ${item.procedimientoCiudad ? item.procedimientoCiudad.procedimiento.title : 'sede general'}`}
                      href={item.procedimientoCiudad ? `/tramites/${item.procedimientoCiudad.procedimiento.slug}/${item.procedimientoCiudad.ciudad.slug}` : undefined}
                      onEdit={() => setEditingSede(item)}
                      onDelete={() => runDelete(deleteSedeOficinaAction, item.id, item.nombre)}
                    />
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'salud' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Panel title="Centros de salud" description="Gestiona hospitales, clínicas y directorio médico regional.">
              <HospitalForm
                item={editingHospital}
                ciudades={ciudades}
                isPending={isPending}
                onCancel={() => setEditingHospital(null)}
                onSubmit={(formData) => runAction((fd) => saveHospitalAction(null, fd), formData)}
              />
            </Panel>
          </div>
          <div className="xl:col-span-3">
            <Panel title="Directorio médico" description="Datos que alimentan /hospitales y /hospitales/[ciudad].">
              <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                {hospitales.map((item) => (
                  <ListRow
                    key={item.id}
                    title={item.nombre}
                    subtitle={`${item.tipo} · ${item.ciudad.name} · ${item.telefono || 'sin teléfono'} · ${item.horario24h ? '24 horas' : 'horario regular'}`}
                    href={`/hospitales/${item.ciudad.slug}`}
                    onEdit={() => setEditingHospital(item)}
                    onDelete={() => runDelete(deleteHospitalAction, item.id, item.nombre)}
                  />
                ))}
              </div>
            </Panel>
          </div>
        </section>
      )}

      {activeTab === 'seo' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label="URLs sitemap" value={relaciones.length + procedimientos.length + hospitales.length + posts.length + 7} icon={<Globe2 className="h-5 w-5" />} />
            <MetricCard label="Alertas SEO" value={audit.totalIssues} icon={<AlertTriangle className="h-5 w-5" />} />
            <MetricCard label="Noticias SEO débil" value={audit.postIssues} icon={<FileSearch className="h-5 w-5" />} />
            <MetricCard label="pSEO faltante" value={audit.pseoMissing} icon={<Database className="h-5 w-5" />} />
          </div>

          <Panel title="Mantenimiento técnico SEO" description="Revalida caché, sitemap y rutas estratégicas después de campañas o cargas masivas.">
            <button
              type="button"
              onClick={runMaintenance}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Revalidar sitio estratégico
            </button>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {posts.slice(0, 10).map((post) => {
                const score = seoScoreForPost(post);
                const label = scoreLabel(score);
                return (
                  <div key={post.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-100">{truncate(post.title, 80)}</p>
                        <p className="mt-1 text-xs text-slate-500">/{post.slug}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${label.className}`}>{score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>
      )}

      {activeTab === 'empleo' && (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Panel title="Editor de vacantes" description="Gestiona empleo formal con datos listos para Google Jobs.">
              <JobListingForm
                item={editingJob}
                ciudades={ciudades}
                isPending={isPending}
                onCancel={() => setEditingJob(null)}
                onSubmit={(formData) => runAction((fd) => saveJobListingAction(null, fd), formData)}
              />
            </Panel>
          </div>

          <div className="xl:col-span-3 space-y-6">
          <Panel title="Estado del módulo empleo" description="Si no hay vacantes CMS para una ciudad, la página mantiene su fallback programático SEO." className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard label="Ciudades cubiertas" value={ciudades.length} icon={<MapPin className="h-5 w-5" />} />
              <MetricCard label="Vacantes CMS" value={jobListings.length} icon={<Briefcase className="h-5 w-5" />} />
              <MetricCard label="Publicadas" value={jobListings.filter((job) => job.published).length} icon={<CheckCircle className="h-5 w-5" />} />
            </div>
          </Panel>

          <Panel title="Vacantes administradas" description="Estas vacantes reemplazan al fallback programático en la ciudad correspondiente.">
            <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {jobListings.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
                  Aún no hay vacantes CMS. Crea la primera para controlar empleo desde el panel.
                </div>
              ) : jobListings.map((job) => (
                <ListRow
                  key={job.id}
                  title={job.title}
                  subtitle={`${job.company} · ${job.city.name} · ${job.sectorName} · ${job.published ? 'Publicado' : 'Borrador'}`}
                  href={`/trabajos/${job.city.slug}`}
                  onEdit={() => setEditingJob(job)}
                  onDelete={() => runDelete(deleteJobListingAction, job.id, job.title)}
                />
              ))}
            </div>
          </Panel>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-teal-400">{icon}</span>
      </div>
      <div className="mt-3 font-heading text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function AuditItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <span className="text-xs font-semibold text-slate-350">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-black ${value > 0 ? 'bg-amber-950/50 text-amber-300' : 'bg-emerald-950/50 text-emerald-300'}`}>{value}</span>
    </div>
  );
}

function Panel({ title, description, className = '', children }: { title: string; description: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm ${className}`}>
      <div className="mb-5">
        <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 outline-none transition focus:border-teal-500';
const textareaClass = `${inputClass} min-h-24 resize-y leading-5`;

function SubmitBar({ isPending, editing, onCancel }: { isPending: boolean; editing: boolean; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      {editing && (
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-800 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">
          Cancelar
        </button>
      )}
      <button disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-teal-400 disabled:opacity-50">
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        {editing ? 'Guardar cambios' : 'Crear registro'}
      </button>
    </div>
  );
}

function SiteSettingsForm({ settings, isPending, onSubmit }: { settings: SiteSettings; isPending: boolean; onSubmit: (fd: FormData) => void }) {
  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Eyebrow hero">
          <input name="homeEyebrow" defaultValue={settings.home.eyebrow} className={inputClass} required />
        </Field>
        <Field label="Acento visual del H1">
          <input name="homeAccent" defaultValue={settings.home.accent} className={inputClass} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Título H1 línea 1">
          <input name="homeTitleLine1" defaultValue={settings.home.titleLine1} className={inputClass} required />
        </Field>
        <Field label="Título H1 línea 2">
          <input name="homeTitleLine2" defaultValue={settings.home.titleLine2} className={inputClass} required />
        </Field>
      </div>

      <Field label="Descripción principal">
        <textarea name="homeDescription" defaultValue={settings.home.description} className={textareaClass} required />
      </Field>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="CTA principal">
          <input name="homePrimaryCtaLabel" defaultValue={settings.home.primaryCtaLabel} className={inputClass} required />
        </Field>
        <Field label="URL CTA principal">
          <input name="homePrimaryCtaHref" defaultValue={settings.home.primaryCtaHref} className={inputClass} required />
        </Field>
        <Field label="CTA secundario">
          <input name="homeSecondaryCtaLabel" defaultValue={settings.home.secondaryCtaLabel} className={inputClass} required />
        </Field>
        <Field label="URL CTA secundario">
          <input name="homeSecondaryCtaHref" defaultValue={settings.home.secondaryCtaHref} className={inputClass} required />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4">
          <h4 className="font-heading text-sm font-bold text-white">Navegación principal</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">Controla la marca, enlaces del menú y botón principal del header público.</p>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Marca bloque">
              <input name="navBrandPrefix" defaultValue={settings.navigation.brandPrefix} className={inputClass} required />
            </Field>
            <Field label="Nombre marca">
              <input name="navBrandName" defaultValue={settings.navigation.brandName} className={inputClass} required />
            </Field>
            <Field label="Acento marca">
              <input name="navBrandAccent" defaultValue={settings.navigation.brandAccent} className={inputClass} required />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="CTA header">
              <input name="navCtaLabel" defaultValue={settings.navigation.ctaLabel} className={inputClass} required />
            </Field>
            <Field label="URL CTA header">
              <input name="navCtaHref" defaultValue={settings.navigation.ctaHref} className={inputClass} required />
            </Field>
          </div>
          <Field label="Enlaces: Etiqueta | URL">
            <textarea
              name="navLinks"
              defaultValue={settings.navigation.links.map((link) => `${link.label} | ${link.href}`).join('\n')}
              className={textareaClass}
              required
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Badges de confianza, uno por línea">
          <textarea name="trustBadges" defaultValue={settings.home.trustBadges.join('\n')} className={textareaClass} required />
        </Field>
        <Field label="Ticker superior, uno por línea">
          <textarea name="tickerItems" defaultValue={settings.tickerItems.join('\n')} className={textareaClass} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Descripción footer">
          <textarea name="footerDescription" defaultValue={settings.footerDescription} className={textareaClass} required />
        </Field>
        <Field label="Texto legal footer">
          <textarea name="footerLegalText" defaultValue={settings.footerLegalText} className={textareaClass} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Etiqueta link legal">
          <input name="footerLegalLinkLabel" defaultValue={settings.footerLegalLinkLabel} className={inputClass} required />
        </Field>
        <Field label="URL link legal">
          <input name="footerLegalLinkHref" defaultValue={settings.footerLegalLinkHref} className={inputClass} required />
        </Field>
        <Field label="Sello de seguridad">
          <input name="footerSecurityLabel" defaultValue={settings.footerSecurityLabel} className={inputClass} required />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4">
          <h4 className="font-heading text-sm font-bold text-white">SEO global</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">Metadatos base para portada, Open Graph, Twitter Card y nombre público del portal.</p>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Nombre del sitio">
              <input name="seoSiteName" defaultValue={settings.seo.siteName} className={inputClass} required />
            </Field>
            <Field label="Template de título">
              <input name="seoTitleTemplate" defaultValue={settings.seo.titleTemplate} className={inputClass} required />
            </Field>
          </div>
          <Field label="Título por defecto">
            <input name="seoTitleDefault" defaultValue={settings.seo.titleDefault} className={inputClass} required />
          </Field>
          <Field label="Descripción SEO">
            <textarea name="seoDescription" defaultValue={settings.seo.description} className={textareaClass} required />
          </Field>
          <Field label="Keywords separadas por coma">
            <input name="seoKeywords" defaultValue={settings.seo.keywords.join(', ')} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="OG title">
              <input name="seoOgTitle" defaultValue={settings.seo.ogTitle} className={inputClass} required />
            </Field>
            <Field label="Imagen OG">
              <input name="seoOgImage" defaultValue={settings.seo.ogImage} className={inputClass} required />
            </Field>
          </div>
          <Field label="OG description">
            <textarea name="seoOgDescription" defaultValue={settings.seo.ogDescription} className={textareaClass} required />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Twitter title">
              <input name="seoTwitterTitle" defaultValue={settings.seo.twitterTitle} className={inputClass} required />
            </Field>
            <Field label="Twitter description">
              <input name="seoTwitterDescription" defaultValue={settings.seo.twitterDescription} className={inputClass} required />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-teal-400 disabled:opacity-50">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
          Guardar configuración
        </button>
      </div>
    </form>
  );
}

function DepartamentoForm({ item, isPending, onSubmit, onCancel }: { item: Departamento | null; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [slug, setSlug] = useState(item?.slug || '');

  React.useEffect(() => {
    setName(item?.name || '');
    setSlug(item?.slug || '');
  }, [item]);

  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Nombre">
        <input name="name" value={name} onChange={(e) => { setName(e.target.value); if (!item) setSlug(generateSlug(e.target.value)); }} className={inputClass} required />
      </Field>
      <Field label="Slug">
        <input name="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className={inputClass} required />
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function CiudadForm({ item, departamentos, isPending, onSubmit, onCancel }: { item: Ciudad | null; departamentos: Departamento[]; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [slug, setSlug] = useState(item?.slug || '');

  React.useEffect(() => {
    setName(item?.name || '');
    setSlug(item?.slug || '');
  }, [item]);

  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Ciudad">
        <input name="name" value={name} onChange={(e) => { setName(e.target.value); if (!item) setSlug(generateSlug(e.target.value)); }} className={inputClass} required />
      </Field>
      <Field label="Slug">
        <input name="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className={inputClass} required />
      </Field>
      <Field label="Departamento">
        <select name="departamentoId" defaultValue={item?.departamentoId || departamentos[0]?.id || ''} className={inputClass} required>
          {departamentos.map((dep) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
        </select>
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function ProcedimientoForm({ item, isPending, onSubmit, onCancel }: { item: Procedimiento | null; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(item?.title || '');
  const [slug, setSlug] = useState(item?.slug || '');

  React.useEffect(() => {
    setTitle(item?.title || '');
    setSlug(item?.slug || '');
  }, [item]);

  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Título">
        <input name="title" value={title} onChange={(e) => { setTitle(e.target.value); if (!item) setSlug(generateSlug(e.target.value)); }} className={inputClass} required />
      </Field>
      <Field label="Slug">
        <input name="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className={inputClass} required />
      </Field>
      <Field label="Descripción">
        <textarea name="description" defaultValue={item?.description || ''} className={textareaClass} required />
      </Field>
      <Field label="Requisitos, uno por línea">
        <textarea name="requisitos" defaultValue={(item?.requisitos || []).join('\n')} className={textareaClass} required />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Meta title">
          <input name="metaTitle" defaultValue={item?.seoConfig?.metaTitle || ''} className={inputClass} maxLength={70} />
        </Field>
        <Field label="Robots">
          <select name="robotsDirective" defaultValue={item?.seoConfig?.robotsDirective || 'index, follow'} className={inputClass}>
            <option value="index, follow">index, follow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </Field>
      </div>
      <Field label="Meta description">
        <input name="metaDescription" defaultValue={item?.seoConfig?.metaDescription || ''} className={inputClass} maxLength={170} />
      </Field>
      <Field label="Keywords separadas por coma">
        <input name="keywords" defaultValue={(item?.seoConfig?.keywords || []).join(', ')} className={inputClass} />
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function RelacionForm({ item, procedimientos, ciudades, isPending, onSubmit, onCancel }: { item: ProcedimientoCiudad | null; procedimientos: Procedimiento[]; ciudades: Ciudad[]; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Trámite">
        <select name="procedimientoId" defaultValue={item?.procedimientoId || procedimientos[0]?.id || ''} className={inputClass} required>
          {procedimientos.map((proc) => <option key={proc.id} value={proc.id}>{proc.title}</option>)}
        </select>
      </Field>
      <Field label="Ciudad">
        <select name="ciudadId" defaultValue={item?.ciudadId || ciudades[0]?.id || ''} className={inputClass} required>
          {ciudades.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
      </Field>
      <Field label="Costo TUPA">
        <input name="costo" type="number" step="0.01" min="0" defaultValue={item?.costo ?? 0} className={inputClass} />
      </Field>
      <Field label="Pasos: Título | Descripción">
        <textarea name="pasos" defaultValue={jsonToPipeLines(item?.pasos, 'titulo', 'descripcion')} className={textareaClass} placeholder="Paga la tasa | Realiza el pago en el Banco de la Nación..." />
      </Field>
      <Field label="FAQ: Pregunta | Respuesta">
        <textarea name="faq" defaultValue={jsonToPipeLines(item?.faq, 'question', 'answer')} className={textareaClass} placeholder="¿Cuánto demora? | El trámite suele demorar..." />
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function SedeForm({ item, ciudades, relaciones, isPending, onSubmit, onCancel }: { item: SedeOficinaCms | null; ciudades: Ciudad[]; relaciones: ProcedimientoCiudad[]; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Nombre de sede">
        <input name="nombre" defaultValue={item?.nombre || ''} className={inputClass} required />
      </Field>
      <Field label="Dirección">
        <input name="direccion" defaultValue={item?.direccion || ''} className={inputClass} required />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Ciudad">
          <select name="ciudadId" defaultValue={item?.ciudadId || ciudades[0]?.id || ''} className={inputClass} required>
            {ciudades.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </Field>
        <Field label="Página pSEO asociada">
          <select name="procedimientoCiudadId" defaultValue={item?.procedimientoCiudadId || ''} className={inputClass}>
            <option value="">Sede general de ciudad</option>
            {relaciones.map((rel) => (
              <option key={rel.id} value={rel.id}>{rel.procedimiento.title} en {rel.ciudad.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Horario">
          <input name="horario" defaultValue={item?.horario || ''} className={inputClass} placeholder="Lun-Vie 8:00 a 17:00" required />
        </Field>
        <Field label="Contacto">
          <input name="contacto" defaultValue={item?.contacto || ''} className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Latitud">
          <input name="latitud" defaultValue={item?.latitud ?? ''} className={inputClass} />
        </Field>
        <Field label="Longitud">
          <input name="longitud" defaultValue={item?.longitud ?? ''} className={inputClass} />
        </Field>
      </div>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function HospitalForm({ item, ciudades, isPending, onSubmit, onCancel }: { item: HospitalItem | null; ciudades: Ciudad[]; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [nombre, setNombre] = useState(item?.nombre || '');
  const [slug, setSlug] = useState(item?.slug || '');

  React.useEffect(() => {
    setNombre(item?.nombre || '');
    setSlug(item?.slug || '');
  }, [item]);

  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Nombre">
        <input name="nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); if (!item) setSlug(generateSlug(e.target.value)); }} className={inputClass} required />
      </Field>
      <Field label="Slug">
        <input name="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className={inputClass} required />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Tipo">
          <select name="tipo" defaultValue={item?.tipo || 'MINSA'} className={inputClass}>
            <option value="MINSA">MINSA</option>
            <option value="ESSALUD">EsSalud</option>
            <option value="Privado">Privado</option>
            <option value="Clínica">Clínica</option>
            <option value="Centro Médico">Centro Médico</option>
          </select>
        </Field>
        <Field label="Ciudad">
          <select name="ciudadId" defaultValue={item?.ciudadId || ciudades[0]?.id || ''} className={inputClass} required>
            {ciudades.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Dirección">
        <input name="direccion" defaultValue={item?.direccion || ''} className={inputClass} required />
      </Field>
      <Field label="Teléfono">
        <input name="telefono" defaultValue={item?.telefono || ''} className={inputClass} />
      </Field>
      <Field label="Horario">
        <select name="horario24h" defaultValue={item?.horario24h ? 'true' : 'false'} className={inputClass}>
          <option value="true">Atención 24 horas</option>
          <option value="false">Horario regular</option>
        </select>
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function JobListingForm({ item, ciudades, isPending, onSubmit, onCancel }: { item: JobListingCms | null; ciudades: Ciudad[]; isPending: boolean; onSubmit: (fd: FormData) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(item?.title || '');
  const [slug, setSlug] = useState(item?.slug || '');

  React.useEffect(() => {
    setTitle(item?.title || '');
    setSlug(item?.slug || '');
  }, [item]);

  return (
    <form action={onSubmit} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Título de la vacante">
        <input name="title" value={title} onChange={(e) => { setTitle(e.target.value); if (!item) setSlug(generateSlug(e.target.value)); }} className={inputClass} required />
      </Field>
      <Field label="Slug">
        <input name="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className={inputClass} required />
      </Field>
      <Field label="Empresa">
        <input name="company" defaultValue={item?.company || ''} className={inputClass} required />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Ciudad">
          <select name="cityId" defaultValue={item?.cityId || ciudades[0]?.id || ''} className={inputClass} required>
            {ciudades.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </Field>
        <Field label="Sector">
          <select name="sectorId" defaultValue={item?.sectorId || employmentSectors[0].id} className={inputClass} required>
            {employmentSectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Modalidad">
          <select name="type" defaultValue={item?.type || 'Full-time'} className={inputClass}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Temporal">Temporal</option>
            <option value="Prácticas">Prácticas</option>
          </select>
        </Field>
        <Field label="Estado">
          <select name="published" defaultValue={item?.published === false ? 'false' : 'true'} className={inputClass}>
            <option value="true">Publicado</option>
            <option value="false">Borrador</option>
          </select>
        </Field>
      </div>
      <Field label="Rango salarial">
        <input name="salaryRange" defaultValue={item?.salaryRange || ''} className={inputClass} placeholder="S/ 2,500 - S/ 3,000" required />
      </Field>
      <Field label="Descripción">
        <textarea name="description" defaultValue={item?.description || ''} className={textareaClass} required />
      </Field>
      <Field label="Requisitos, uno por línea">
        <textarea name="requirements" defaultValue={(item?.requirements || []).join('\n')} className={textareaClass} required />
      </Field>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Meta title">
          <input name="metaTitle" defaultValue={item?.metaTitle || ''} className={inputClass} maxLength={70} />
        </Field>
        <Field label="Expira el">
          <input name="expiresAt" type="date" defaultValue={item?.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 10) : ''} className={inputClass} />
        </Field>
      </div>
      <Field label="Meta description">
        <input name="metaDescription" defaultValue={item?.metaDescription || ''} className={inputClass} maxLength={170} />
      </Field>
      <SubmitBar isPending={isPending} editing={Boolean(item)} onCancel={onCancel} />
    </form>
  );
}

function IconButton({ icon, title, onClick, danger = false }: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border p-2 transition ${
        danger
          ? 'border-slate-800 bg-slate-900 text-slate-500 hover:border-rose-900/50 hover:bg-rose-950/40 hover:text-rose-400'
          : 'border-slate-800 bg-slate-900 text-slate-350 hover:bg-slate-800 hover:text-teal-400'
      }`}
    >
      {icon}
    </button>
  );
}

function ListRow({ title, subtitle, href, onEdit, onDelete }: { title: string; subtitle: string; href?: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-100">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-350 transition hover:bg-slate-800 hover:text-teal-400">
            <Globe2 className="h-3.5 w-3.5" />
          </a>
        )}
        <IconButton title="Editar" onClick={onEdit} icon={<Edit className="h-3.5 w-3.5" />} />
        <IconButton title="Eliminar" danger onClick={onDelete} icon={<Trash2 className="h-3.5 w-3.5" />} />
      </div>
    </div>
  );
}
