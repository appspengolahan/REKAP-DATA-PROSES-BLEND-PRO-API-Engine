import React from 'react';
import { ActiveTab, UserRole } from '../types[RekapBlend]';
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Cpu,
  Database,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  HelpCircle,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  cachedRowsCount: number;
  onOpenSwitchApp?: () => void;
  onOpenGasCenter?: () => void;
  onOpenHelp?: () => void;
}

export const SidebarRekapBlend: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  currentRole,
  onRoleChange,
  cachedRowsCount,
  onOpenSwitchApp,
  onOpenGasCenter,
  onOpenHelp,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      sublabel: 'KPI Eksekutif & Summary',
      icon: LayoutDashboard,
      badge: 'KPI',
    },
    {
      id: 'bulan' as ActiveTab,
      label: 'Rekap per Bulan',
      sublabel: 'Analisis Tren Waktu',
      icon: CalendarDays,
      badge: '10 Bln',
    },
    {
      id: 'merk' as ActiveTab,
      label: 'Rekap per Jenis',
      sublabel: 'Katalog & Efisiensi Resep',
      icon: Layers,
      badge: '6 Varian',
    },
    {
      id: 'molen' as ActiveTab,
      label: 'Rekap per Molen',
      sublabel: 'Telemetri Mesin Campur',
      icon: Cpu,
      badge: '6 Unit',
    },
    {
      id: 'explorer' as ActiveTab,
      label: 'Data Explorer',
      sublabel: 'Audit Baris DATAMASTER',
      icon: Database,
      badge: `${cachedRowsCount} Baris`,
    },
  ];

  return (
    <aside
      className={`hidden sm:flex shrink-0 h-full overflow-y-auto bg-slate-900 border-r border-slate-800 text-slate-300 flex-col transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header inside sidebar */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              BK
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white tracking-wide truncate">DIVISI PRODUKSI I</div>
              <div className="text-[10px] text-slate-400 truncate">Sistem Rekap Blend</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto text-amber-400 font-bold text-xs">PP1</div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isCollapsed ? 'Perlebar Sidebar' : 'Kecilkan ke Rail Mode (68px)'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="p-2 space-y-1 flex-1">
        <div
          className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
            isCollapsed ? 'text-center' : ''
          }`}
        >
          {isCollapsed ? 'NAV' : 'MODUL PEMANTAUAN'}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition relative group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition z-50">
                  {item.label}
                  <div className="text-[10px] text-slate-400">{item.sublabel}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Information & Control Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 text-xs space-y-2.5">
        {!isCollapsed ? (
          <>
            {/* Toleransi card */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  Batas Toleransi:
                </span>
                <span className="text-emerald-400 font-bold">≤ 0,50%</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Kinerja susut blend PP1 optimal pada 0,25% – 0,32%.
              </div>
            </div>

            {/* Quick Actions (Switch App & Bantuan) */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onOpenSwitchApp}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700/80 transition cursor-pointer"
                title="Pindah Board"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch App</span>
              </button>

              <button
                onClick={onOpenHelp}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700/80 transition cursor-pointer"
                title="Bantuan & Panduan"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Bantuan</span>
              </button>
            </div>

            {/* Role Switcher in Sidebar */}
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Hak Akses:
                </span>
                {(currentRole === 'Super Admin' || currentRole === 'Project Manager (Lalu M.)') && onOpenGasCenter && (
                  <button
                    onClick={onOpenGasCenter}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                    title="GAS Center Settings"
                  >
                    <Settings className="w-3 h-3" />
                    <span>GAS</span>
                  </button>
                )}
              </div>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange?.(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Project Manager (Lalu M.)">PM: Lalu M.</option>
                <option value="Site Engineer / QC">Site Engineer / QC</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Vendor">Vendor</option>
                <option value="Client Hub">Client Hub</option>
              </select>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={onOpenSwitchApp}
              className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 transition cursor-pointer"
              title="Switch App"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700 transition cursor-pointer"
              title="Bantuan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
