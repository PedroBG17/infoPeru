'use client';

type DashboardTab = 'leads' | 'noticias' | 'portal';

interface DashboardTabsProps {
  activeTab: DashboardTab;
}

const tabs: Array<{ key: DashboardTab; label: string; href: string }> = [
  { key: 'leads', label: 'Leads y Auditoría', href: '/admin/dashboard?tab=leads' },
  { key: 'noticias', label: 'Gestión de Noticias', href: '/admin/dashboard?tab=noticias' },
  { key: 'portal', label: 'Gestión del Portal', href: '/admin/dashboard?tab=portal' },
];

export function DashboardTabs({ activeTab }: DashboardTabsProps) {
  return (
    <div className="flex border-b border-slate-900 gap-6" role="tablist" aria-label="Secciones del panel">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (!isActive) window.location.assign(tab.href);
            }}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              isActive
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
