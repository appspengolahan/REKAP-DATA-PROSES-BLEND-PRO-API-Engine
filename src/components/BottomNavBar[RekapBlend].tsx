import React from 'react';
import { ActiveTab } from '../types[RekapBlend]';
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Cpu,
  Database,
  Gauge,
  HelpCircle,
  ArrowLeftRight,
} from 'lucide-react';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenIntegrasiDhp: () => void;
  onOpenHelp: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const BottomNavBarRekapBlend: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenIntegrasiDhp,
  onOpenHelp,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bulan' as ActiveTab, label: 'Bulan', icon: CalendarDays },
    { id: 'merk' as ActiveTab, label: 'Jenis', icon: Layers },
    { id: 'molen' as ActiveTab, label: 'Molen', icon: Cpu },
    { id: 'deviasi' as ActiveTab, label: 'Deviasi', icon: Gauge },
    { id: 'explorer' as ActiveTab, label: 'Audit', icon: Database },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 sm:px-3 py-1.5 flex items-center justify-around shadow-2xl no-print pb-[calc(0.4rem+env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 rounded-xl transition cursor-pointer min-w-0 ${
              isActive
                ? 'text-amber-400 font-bold bg-slate-800/90'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate">{tab.label}</span>
          </button>
        );
      })}

      {/* Tombol INTEGRASI DATA DHP BLEND (Menggantikan toggle sync) */}
      <button
        onClick={onOpenIntegrasiDhp}
        className="flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 rounded-xl text-blue-400 hover:text-white hover:bg-blue-900/40 transition group cursor-pointer relative min-w-0"
        title="Buka Integrasi Data DHP Blend"
      >
        <div className="relative">
          <ArrowLeftRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        </div>
        <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-bold text-blue-300 group-hover:text-white truncate">
          DHP Blend
        </span>
      </button>

      {/* Tombol Bantuan / Info */}
      <button
        onClick={onOpenHelp}
        className="flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 rounded-xl text-slate-400 hover:text-amber-400 transition cursor-pointer min-w-0"
        title="Bantuan & Petunjuk Sistem"
      >
        <HelpCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate">Info</span>
      </button>
    </nav>
  );
};
