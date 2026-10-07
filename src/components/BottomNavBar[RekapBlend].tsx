import React from 'react';
import { ActiveTab } from '../types[RekapBlend]';
import { LayoutDashboard, CalendarDays, Layers, Cpu, Database, RefreshCw, HelpCircle } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHelp: () => void;
}

export const BottomNavBarRekapBlend: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  onOpenHelp,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bulan' as ActiveTab, label: 'Bulan', icon: CalendarDays },
    { id: 'merk' as ActiveTab, label: 'Jenis', icon: Layers },
    { id: 'molen' as ActiveTab, label: 'Molen', icon: Cpu },
    { id: 'explorer' as ActiveTab, label: 'Audit', icon: Database },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl no-print pb-[calc(0.4rem+env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive
                ? 'text-amber-400 font-bold bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-white transition"
        title="Refresh Data"
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Sync</span>
      </button>

      <button
        onClick={onOpenHelp}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-amber-400 transition"
        title="Bantuan"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">Info</span>
      </button>
    </nav>
  );
};
