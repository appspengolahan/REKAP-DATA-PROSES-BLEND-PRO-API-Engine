import React, { useState, useRef, useEffect } from 'react';
import { UserRole, DashboardDataset } from '../types[RekapBlend]';
import {
  Layers,
  RefreshCw,
  FileText,
  HelpCircle,
  Settings,
  ShieldCheck,
  Calendar,
  ChevronDown,
  Check,
  Download,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { PWAInstallButtonRekapBlend } from './PWAInstallButton[RekapBlend]';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  dataset: DashboardDataset;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSwitchApp: () => void;
  onOpenGasCenter: () => void;
  onOpenHelp: () => void;
  onExportSummaryPdf: () => void;
}

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'Project Manager (Lalu M.)', label: 'PM: Lalu M.', desc: 'Akses penuh kontrol eksekutif & operasional' },
  { id: 'Site Engineer / QC', label: 'Site Engineer / QC', desc: 'Validasi toleransi mutu & telemetri molen' },
  { id: 'Super Admin', label: 'Super Admin', desc: 'Konfigurasi teknis GAS Center & arsitektur' },
  { id: 'Vendor', label: 'Vendor', desc: 'Pemantauan pengiriman & pasokan tembakau' },
  { id: 'Client Hub', label: 'Client Hub', desc: 'Pratinjau ringkasan hasil jadi & efisiensi' },
];

export const HeaderRekapBlend: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  dataset,
  onRefresh,
  isRefreshing,
  onOpenSwitchApp,
  onOpenGasCenter,
  onOpenHelp,
  onExportSummaryPdf,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const syncInfo = dataset.sourceInfo;

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Format short label for role pill
  const shortRoleLabel =
    currentRole === 'Project Manager (Lalu M.)'
      ? 'PM: Lalu M.'
      : currentRole === 'Site Engineer / QC'
      ? 'Site QC'
      : currentRole;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm sm:text-base shrink-0 shadow-inner">
            PP1
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate">
                PT Batu Karang · PP1
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {syncInfo.loadedFrom === 'gas_api' ? 'Live GAS' : '0.01s Cache'}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-1.5 mt-0.5 truncate">
              <span className="truncate">Monitoring Board Rekap Blend</span>
            </h1>
          </div>
        </div>

        {/* Right: Actions Bar (Sleek, Uncrowded & Single-Row) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 no-print">
          {/* Badge Entri Data Terkini */}
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold shadow-xs whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-200/80 font-normal hidden lg:inline">Entri Data Terkini:</span>
            <span className="font-bold">{dataset.entriTerkini || '5 Oktober 2026'}</span>
          </div>

          {/* Tombol Refresh Data */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            title="Tarik & Sinkronisasi Data Terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Tombol Export Ringkasan PDF (Desktop/Tablet) */}
          <button
            onClick={onExportSummaryPdf}
            className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Cetak Ringkasan Eksekutif ke PDF"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          {/* Profile & Tools Dropdown Menu (Menggantikan rentetan tombol yang berantakan) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shadow-xs ${
                isMenuOpen
                  ? 'bg-slate-800 text-white border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
              }`}
              title="Menu Profil, Hak Akses & Pengaturan Sistem"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="max-w-[85px] sm:max-w-[120px] truncate">{shortRoleLabel}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header Profile Info */}
                <div className="p-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{currentRole}</div>
                    <div className="text-[11px] text-slate-400 truncate">divisi1.BKR@gmail.com</div>
                  </div>
                </div>

                {/* Section 1: Ganti Peran (RBAC) */}
                <div className="p-3 border-b border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Ganti Hak Akses (RBAC):
                  </div>
                  <div className="space-y-1">
                    {ROLES.map((role) => {
                      const isSelected = currentRole === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => {
                            onRoleChange(role.id);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{role.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">
                              {role.desc}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Alat, Integrasi & Bantuan */}
                <div className="p-2 space-y-0.5 bg-slate-900/60">
                  {/* Export PDF (Mobile fallback) */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExportSummaryPdf();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Export Ringkasan (PDF)</span>
                  </button>

                  {/* Switch App Board */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSwitchApp();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Switch App (Sistem Lain PP1)</span>
                  </button>

                  {/* GAS Center (Khusus PM / Super Admin) */}
                  {(currentRole === 'Super Admin' ||
                    currentRole === 'Project Manager (Lalu M.)') && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenGasCenter();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      <span>Headless GAS Center (API)</span>
                    </button>
                  )}

                  {/* Install PWA Button */}
                  <div className="px-1 py-0.5">
                    <PWAInstallButtonRekapBlend variant="dropdown" />
                  </div>

                  {/* Panduan & Bantuan */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenHelp();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Pusat Bantuan & SOP Blend</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
