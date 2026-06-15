import React from 'react';
import { prisma } from '@/lib/db';
import { getMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';
import { requireAdminSession } from '@/lib/admin-auth';
import { DashboardTabs } from './dashboard-tabs';
import { PostManager } from './post-manager';
import { SiteManager } from './site-manager';
import type { Prisma } from '@prisma/client';
import { 
  Users, 
  ShieldAlert, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Mail, 
  Phone,
  FileText
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

type JobListingWithCity = Prisma.JobListingGetPayload<{
  include: {
    city: {
      select: {
        id: true;
        name: true;
        slug: true;
        departamento: {
          select: { name: true };
        };
      };
    };
  };
}>;

type DashboardTab = 'leads' | 'noticias' | 'portal';

function normalizeDashboardTab(tab: string | undefined): DashboardTab {
  return tab === 'noticias' || tab === 'portal' ? tab : 'leads';
}

async function getDashboardMetrics() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [
    totalLeads,
    leads24h,
    totalLogs,
    totalPosts,
    totalProcedimientos,
    totalHospitales,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: since24h } } }),
    prisma.analyticsLog.count(),
    prisma.post.count(),
    prisma.procedimiento.count(),
    prisma.hospital.count(),
  ]);

  return {
    totalLeads,
    leads24h,
    totalLogs,
    totalPosts,
    totalProcedimientos,
    totalHospitales,
  };
}

async function getLeadPanelData() {
  const [leadsBySector, recentLeads, recentLogs] = await Promise.all([
    prisma.lead.groupBy({
      by: ['sectorId'],
      _count: {
        id: true,
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        city: true,
      },
    }),
    prisma.analyticsLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  return {
    tab: 'leads' as const,
    leadsBySector,
    recentLeads,
    recentLogs,
  };
}

async function getNewsPanelData() {
  const [categories, tags, mediaFiles, posts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return {
    tab: 'noticias' as const,
    categories,
    tags,
    mediaFiles,
    posts,
  };
}

async function getPortalPanelData() {
  const jobListingsPromise: Promise<JobListingWithCity[]> = prisma.jobListing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
          departamento: {
            select: { name: true },
          },
        },
      },
    },
  }).catch((error) => {
    console.warn('[ADMIN_JOB_LISTINGS_WARNING] Tabla de vacantes no disponible todavia:', error);
    return [];
  });

  const [
    siteSettings,
    departamentos,
    ciudades,
    procedimientos,
    relaciones,
    sedes,
    hospitales,
    posts,
    jobListings,
  ] = await Promise.all([
    getSiteSettings(),
    prisma.departamento.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { ciudades: true },
        },
      },
    }),
    prisma.ciudad.findMany({
      orderBy: { name: 'asc' },
      include: {
        departamento: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            procedimientos: true,
            hospitales: true,
            leads: true,
          },
        },
      },
    }),
    prisma.procedimiento.findMany({
      orderBy: { title: 'asc' },
      include: {
        seoConfig: true,
        _count: {
          select: { ciudadesRel: true },
        },
      },
    }),
    prisma.procedimientoCiudad.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        procedimiento: {
          select: { id: true, title: true, slug: true },
        },
        ciudad: {
          select: {
            id: true,
            name: true,
            slug: true,
            departamento: {
              select: { name: true },
            },
          },
        },
        sedes: {
          select: { id: true },
        },
      },
    }),
    prisma.sedeOficina.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ciudad: {
          select: { id: true, name: true, slug: true },
        },
        procedimientoCiudad: {
          select: {
            id: true,
            procedimiento: {
              select: { title: true, slug: true },
            },
            ciudad: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.hospital.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        ciudad: {
          select: {
            id: true,
            name: true,
            slug: true,
            departamento: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        metaTitle: true,
        metaDescription: true,
        coverImage: true,
      },
    }),
    jobListingsPromise,
  ]);

  return {
    tab: 'portal' as const,
    siteSettings,
    departamentos,
    ciudades,
    procedimientos,
    relaciones,
    sedes,
    hospitales,
    posts,
    jobListings,
  };
}

function getTabData(tab: DashboardTab) {
  if (tab === 'noticias') return getNewsPanelData();
  if (tab === 'portal') return getPortalPanelData();
  return getLeadPanelData();
}

export async function generateMetadata() {
  return getMetadata({
    title: 'Panel de Administración - Leads y Noticias',
    description: 'Consola interna de ClavePerú para el seguimiento de leads de monetización y administración de noticias.',
    slug: '/admin/dashboard',
    noIndex: true // Los motores de búsqueda jamás deben indexar la administración
  });
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const adminSession = await requireAdminSession();
  const resolvedSearchParams = await searchParams;
  const activeTab = normalizeDashboardTab(resolvedSearchParams.tab);
  const isNoticiasTab = activeTab === 'noticias';
  const isPortalTab = activeTab === 'portal';

  const [metrics, tabData] = await Promise.all([
    getDashboardMetrics(),
    getTabData(activeTab),
  ]);

  const {
    totalLeads,
    leads24h,
    totalLogs,
    totalPosts,
    totalProcedimientos,
    totalHospitales,
  } = metrics;

  const sectorNames: Record<string, string> = {
    'sec-salud': 'Salud / Clínicas',
    'sec-empleo': 'Bolsa de Empleo',
    'sec-mineria': 'Minería e Ing.',
    'sec-comercio': 'Comercio & Retail',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Dashboard Layout Header */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              DP
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide uppercase text-teal-400">ClavePerú Admin</span>
              <span className="block text-[10px] text-slate-500">Panel de Control Interno v1.1</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950/60 text-teal-400 border border-teal-800/40">
              {adminSession.email}
            </span>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:border-rose-800/50 hover:bg-rose-950/30 hover:text-rose-300"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Consola de Control</h1>
          <p className="text-sm text-slate-400 mt-1">Supervisión y control de monetización regional, noticias en Supabase y accesos Edge.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Leads */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Leads Totales</span>
              <span className="text-3xl font-extrabold mt-2 block">{totalLeads}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Acumulados en base de datos</span>
            </div>
            <div className="w-12 h-12 bg-slate-800 text-teal-400 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Leads 24h */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Leads (24h)</span>
              <span className="text-3xl font-extrabold mt-2 block text-teal-400">+{leads24h}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Registrados el último día</span>
            </div>
            <div className="w-12 h-12 bg-teal-950/40 text-teal-400 rounded-xl flex items-center justify-center border border-teal-900/30">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Noticias / Artículos */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Artículos en DB</span>
              <span className="text-3xl font-extrabold mt-2 block text-cyan-400">{totalPosts}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Noticias creadas en Supabase</span>
            </div>
            <div className="w-12 h-12 bg-cyan-950/40 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-900/30">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Auditoría Logs */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Biblioteca & Taxón.</span>
              <span className="text-3xl font-extrabold mt-2 block text-amber-400">
                {totalProcedimientos} <span className="text-xs text-slate-500 font-normal">trám.</span> / {totalHospitales} <span className="text-xs text-slate-500 font-normal">salud</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">{totalLogs} eventos de auditorÃ­a registrados</span>
            </div>
            <div className="w-12 h-12 bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <DashboardTabs activeTab={isNoticiasTab ? 'noticias' : isPortalTab ? 'portal' : 'leads'} />

        {/* Tab Contents */}
        {tabData.tab === 'noticias' ? (
          <PostManager
            initialPosts={tabData.posts}
            categories={tabData.categories}
            tags={tabData.tags}
            mediaFiles={tabData.mediaFiles}
          />
        ) : tabData.tab === 'portal' ? (
          <SiteManager
            departamentos={tabData.departamentos}
            ciudades={tabData.ciudades}
            procedimientos={tabData.procedimientos}
            relaciones={tabData.relaciones}
            sedes={tabData.sedes}
            hospitales={tabData.hospitales}
            posts={tabData.posts}
            jobListings={tabData.jobListings}
            siteSettings={tabData.siteSettings}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Main Panel: Leads list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Prospectos Recientes (Leads)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Últimos envíos de usuarios interesados en servicios.</p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                    Exportar CSV
                  </button>
                </div>

                {tabData.recentLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No hay prospectos registrados actualmente en la base de datos.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Contacto</th>
                          <th className="px-6 py-4">Ubicación</th>
                          <th className="px-6 py-4">Sector</th>
                          <th className="px-6 py-4">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 divide-slate-800/60">
                        {tabData.recentLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-800/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-100">{lead.name}</div>
                              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {lead.email}</span>
                                <span>•</span>
                                <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {lead.phone}</span>
                              </div>
                              {lead.message && (
                                <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 border-slate-800/40">
                                  {lead.message}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center text-xs text-slate-400">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                {lead.city.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 text-teal-400 border border-teal-900/30">
                                {sectorNames[lead.sectorId] || lead.sectorId}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 text-slate-600" />
                                {new Date(lead.createdAt).toLocaleDateString('es-PE', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Audit Logs & Sectors */}
            <aside className="space-y-6">
              {/* Leads by Sector chart list */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-100">Distribución de Leads</h3>
                <div className="space-y-3">
                  {tabData.leadsBySector.map((sec) => {
                    const percent = totalLeads > 0 ? (sec._count.id / totalLeads) * 100 : 0;
                    return (
                      <div key={sec.sectorId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">{sectorNames[sec.sectorId] || sec.sectorId}</span>
                          <span>{sec._count.id} ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Log Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-100 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-cyan-400" />
                  Auditoría de Accesos
                </h3>
                <div className="space-y-3">
                  {tabData.recentLogs.length === 0 ? (
                    <p className="text-xs text-slate-500">No hay registros de auditoría.</p>
                  ) : (
                    tabData.recentLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 border-slate-800/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span className="text-cyan-400 uppercase tracking-wide truncate max-w-[120px]">{log.device}</span>
                          <span>
                            {new Date(log.createdAt).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-350 font-mono truncate">{log.path}</p>
                        <span className="text-[10px] text-slate-500 block">IP Geo: {log.ciudadIp || 'Desconocido'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
