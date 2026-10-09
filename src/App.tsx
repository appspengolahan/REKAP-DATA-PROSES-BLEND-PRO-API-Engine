/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  ActiveTab,
  DashboardDataset,
  DataSourceMode,
} from './types[RekapBlend]';
import {
  loadInitialDataset,
  buildDashboardDataset,
  syncWithGasServer,
  syncDirectFromSheet,
  getEntriTerkini,
} from './api[RekapBlend]';
import { HeaderRekapBlend } from './components/Header[RekapBlend]';
import { SidebarRekapBlend } from './components/Sidebar[RekapBlend]';
import { SummaryCardsRekapBlend } from './components/SummaryCards[RekapBlend]';
import { TabDashboardRekapBlend } from './components/TabDashboard[RekapBlend]';
import { TabBulanRekapBlend } from './components/TabBulan[RekapBlend]';
import { TabMerkRekapBlend } from './components/TabMerk[RekapBlend]';
import { TabMolenRekapBlend } from './components/TabMolen[RekapBlend]';
import { DataExplorerRekapBlend } from './components/DataExplorer[RekapBlend]';
import { HelpModalRekapBlend } from './components/HelpModal[RekapBlend]';
import { SwitchBoardModalRekapBlend } from './components/SwitchBoardModal[RekapBlend]';
import { GasCenterModalRekapBlend } from './components/GasCenterModal[RekapBlend]';
import { ChartModalRekapBlend } from './components/ChartModal[RekapBlend]';
import { PWAInstallButtonRekapBlend } from './components/PWAInstallButton[RekapBlend]';
import { BottomNavBarRekapBlend } from './components/BottomNavBar[RekapBlend]';
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('Project Manager (Lalu M.)');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAutoSync, setIsAutoSync] = useState<boolean>(true);
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('gas');

  // Filter States
  const [tahunGlobal, setTahunGlobal] = useState<string>('Semua');
  const [bulanRingkasan, setBulanRingkasan] = useState<string>('Semua');
  const [periodeAwal, setPeriodeAwal] = useState({ bulan: 'Januari', tahun: '2026' });
  const [periodeAkhir, setPeriodeAkhir] = useState({ bulan: 'Desember', tahun: '2026' });

  // Subfilters
  const [selectedTrendMerk, setSelectedTrendMerk] = useState<string>('153 - BK');
  const [selectedBulanMolen, setSelectedBulanMolen] = useState<string>('Semua');

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSwitchAppOpen, setIsSwitchAppOpen] = useState(false);
  const [isGasCenterOpen, setIsGasCenterOpen] = useState(false);
  const [chartModal, setChartModal] = useState<{
    isOpen: boolean;
    title: string;
    chartType: any;
    data: any;
  }>({
    isOpen: false,
    title: '',
    chartType: null,
    data: null,
  });

  // 1. Initial Load: Local-First (0.01s instant boot) + Silent Background Sync
  useEffect(() => {
    // Restore sidebar preference
    const savedCollapse = localStorage.getItem('rekap_blend_sidebar_collapsed');
    if (savedCollapse !== null) {
      setIsCollapsed(savedCollapse === 'true');
    }

    // Restore role
    const savedRole = localStorage.getItem('rekap_blend_user_role') as UserRole;
    if (savedRole) {
      setCurrentRole(savedRole);
    }

    // Restore Auto Sync preference (default: true)
    const savedAutoSync = localStorage.getItem('rekap_blend_auto_sync_enabled');
    if (savedAutoSync !== null) {
      setIsAutoSync(savedAutoSync === 'true');
    }

    // Restore Data Source mode preference (default: 'gas')
    const savedSourceMode = localStorage.getItem('rekap_blend_data_source_mode') as DataSourceMode;
    if (savedSourceMode === 'gas' || savedSourceMode === 'direct_sheet') {
      setDataSourceMode(savedSourceMode);
    }

    // Load initial dataset immediately from memory / localStorage
    loadInitialDataset().then((data) => {
      setDataset(data);
      if (data.trendMerk && data.trendMerk.merk) {
        setSelectedTrendMerk(data.trendMerk.merk);
      }

      // Silent Background Sync (menggunakan jalur yang aktif)
      const fetchFn = savedSourceMode === 'direct_sheet' ? syncDirectFromSheet : syncWithGasServer;
      fetchFn()
        .then((freshRows) => {
          if (freshRows && freshRows.length > 0) {
            setDataset((prev) => {
              if (!prev) return prev;
              return buildDashboardDataset(
                freshRows,
                tahunGlobal,
                bulanRingkasan,
                periodeAwal,
                periodeAkhir,
                savedSourceMode === 'direct_sheet' ? 'direct_sheet' : 'gas_api'
              );
            });
          }
        })
        .catch((err) => {
          console.log('Background sync standby, using local cache:', err.message);
        });
    });
  }, []);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('rekap_blend_sidebar_collapsed', String(next));
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('rekap_blend_user_role', role);
  };

  // Recompute dataset when filters change
  const recompute = useCallback(
    (
      newTahun = tahunGlobal,
      newBulan = bulanRingkasan,
      pAwal = periodeAwal,
      pAkhir = periodeAkhir
    ) => {
      if (!dataset) return;
      const updated = buildDashboardDataset(
        dataset.allRows,
        newTahun,
        newBulan,
        pAwal,
        pAkhir,
        dataset.sourceInfo.loadedFrom
      );
      setDataset(updated);
    },
    [dataset, tahunGlobal, bulanRingkasan, periodeAwal, periodeAkhir]
  );

  const handleTahunChange = (t: string) => {
    setTahunGlobal(t);
    recompute(t, bulanRingkasan, periodeAwal, periodeAkhir);
  };

  const handleBulanRingkasanChange = (b: string) => {
    setBulanRingkasan(b);
    recompute(tahunGlobal, b, periodeAwal, periodeAkhir);
  };

  const handlePeriodeAwalChange = (val: { bulan: string; tahun: string }) => {
    setPeriodeAwal(val);
    recompute(tahunGlobal, bulanRingkasan, val, periodeAkhir);
  };

  const handlePeriodeAkhirChange = (val: { bulan: string; tahun: string }) => {
    setPeriodeAkhir(val);
    recompute(tahunGlobal, bulanRingkasan, periodeAwal, val);
  };

  const handleApplyPeriode = () => {
    recompute(tahunGlobal, bulanRingkasan, periodeAwal, periodeAkhir);
  };

  // Refresh & Sync Handler (Mendukung manual & background polling)
  const handleRefresh = useCallback(
    async (isSilent = false, overrideMode?: DataSourceMode) => {
      const activeMode = overrideMode || dataSourceMode;
      if (!isSilent) setIsRefreshing(true);
      try {
        let freshRows;
        let sourceLabel: 'gas_api' | 'direct_sheet';

        if (activeMode === 'direct_sheet') {
          freshRows = await syncDirectFromSheet();
          sourceLabel = 'direct_sheet';
        } else {
          freshRows = await syncWithGasServer();
          sourceLabel = 'gas_api';
        }

        if (freshRows && freshRows.length > 0) {
          setDataset((prev) => {
            if (!prev) return prev;
            return buildDashboardDataset(
              freshRows,
              tahunGlobal,
              bulanRingkasan,
              periodeAwal,
              periodeAkhir,
              sourceLabel
            );
          });
        }
      } catch (err: any) {
        if (!isSilent) {
          console.warn(`Sinkronisasi Google Sheets (${activeMode}):`, err.message);
        }
      } finally {
        if (!isSilent) setIsRefreshing(false);
      }
    },
    [dataSourceMode, tahunGlobal, bulanRingkasan, periodeAwal, periodeAkhir]
  );

  // Toggle Auto Sync / Auto Refresh
  const handleToggleAutoSync = () => {
    const next = !isAutoSync;
    setIsAutoSync(next);
    localStorage.setItem('rekap_blend_auto_sync_enabled', String(next));
  };

  // Toggle Tarik Dari Datasheet (Bypass GAS)
  const handleToggleDataSourceMode = () => {
    const nextMode: DataSourceMode = dataSourceMode === 'gas' ? 'direct_sheet' : 'gas';
    setDataSourceMode(nextMode);
    localStorage.setItem('rekap_blend_data_source_mode', nextMode);
    handleRefresh(false, nextMode);
  };

  // Auto Refresh Interval Timer (Live auto sync tiap 30 detik)
  useEffect(() => {
    if (!isAutoSync) return;

    const intervalId = setInterval(() => {
      handleRefresh(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAutoSync, handleRefresh]);

  const handleResetCache = () => {
    if (confirm('Bersihkan cache browser dan muat ulang data default?')) {
      localStorage.removeItem('rekap_blend_cache_v2');
      loadInitialDataset().then((d) => {
        setDataset(d);
        setIsGasCenterOpen(false);
      });
    }
  };

  // PDF Export Handlers with specific filename requirement: [Nama Project] - [Nama Tab/Field]
  const handleExportSummaryPdf = () => {
    const originalTitle = document.title;
    document.title = 'Monitoring Board Rekap Blend - Ringkasan Eksekutif';
    document.body.classList.add('print-summary-only');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-summary-only');
      document.title = originalTitle;
    }, 500);
  };

  const handleExportTabPdf = (tabName: string) => {
    const tabLabels: Record<string, string> = {
      bulan: 'Rekap per Bulan',
      merk: 'Rekap per Merk',
      molen: 'Rekap per Molen',
    };
    const originalTitle = document.title;
    document.title = `Monitoring Board Rekap Blend - ${tabLabels[tabName] || tabName}`;
    document.body.classList.add('print-tab-only');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-tab-only');
      document.title = originalTitle;
    }, 500);
  };

  // Export CSV for Raw Data
  const handleExportCsv = () => {
    if (!dataset) return;
    const headers = [
      'No Baris',
      'Tanggal',
      'Bulan',
      'Tahun',
      'Merk',
      'Bobot Baku (Kg)',
      'Hasil (Kg)',
      'Susut (Kg)',
      'Susut (%)',
      'Molen',
      'Suhu (°C)',
    ];
    const rows = dataset.allRows.map((r) => [
      r.srcRow,
      r.tanggal,
      r.bulan,
      r.tahun,
      `"${r.merk}"`,
      r.bobot,
      r.hasil,
      r.susutKg,
      r.susutPct,
      r.molen,
      r.suhu ?? '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DATAMASTER_Proses_Blend_PP1.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!dataset) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 font-bold mb-3 animate-pulse">
          PP1
        </div>
        <div className="text-sm font-semibold tracking-wide">Memuat Monitoring Board Rekap Blend...</div>
        <div className="text-xs text-slate-400 mt-1">Menginisialisasi LocalStorage Engine (0.01 detik)</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* 1. Header Pengendali Eksekutif (Pinned at top) */}
      <HeaderRekapBlend
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        dataset={dataset}
        onRefresh={() => handleRefresh(false)}
        isRefreshing={isRefreshing}
        onOpenSwitchApp={() => setIsSwitchAppOpen(true)}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onExportSummaryPdf={handleExportSummaryPdf}
        isAutoSync={isAutoSync}
        onToggleAutoSync={handleToggleAutoSync}
        dataSourceMode={dataSourceMode}
        onToggleDataSourceMode={handleToggleDataSourceMode}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* 2. Pinned Collapsible Sidebar (Does not scroll with content) */}
        <SidebarRekapBlend
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          cachedRowsCount={dataset.allRows.length}
          onOpenSwitchApp={() => setIsSwitchAppOpen(true)}
          onOpenGasCenter={() => setIsGasCenterOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* 3. Main Workspace Canvas (Scrolls independently) */}
        <main className="flex-1 h-full overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-12 max-w-7xl mx-auto w-full">
          {/* Print Watermark / Header */}
          <div className="hidden print:block pb-4 mb-4 border-b border-slate-300">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              PT BATU KARANG · DIVISI PRODUKSI I (PP1)
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Monitoring Board — Rekap Data Proses Blend
            </h1>
            <div className="text-xs text-slate-600 mt-1">
              Sumber Data: Sheet DATAMASTER · Entri Terkini: {dataset.entriTerkini} · Tanggal Cetak:{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* PWA Install Banner */}
          <PWAInstallButtonRekapBlend variant="banner" />

          {/* Quick Tab Selector for Mobile / Compact Devices */}
          <div className="flex sm:hidden overflow-x-auto gap-1.5 p-1 bg-white border border-slate-200 rounded-xl mb-4 no-print scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('bulan')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'bulan' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setActiveTab('merk')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'merk' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Per Jenis
            </button>
            <button
              onClick={() => setActiveTab('molen')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'molen' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Per Molen
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'explorer' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Audit Explorer
            </button>
          </div>

          {/* 4. Modul Konten Tab yang Sedang Aktif (Spesifik & Mendalam) */}
          <div className="tab-content-area mb-8">
            {activeTab === 'dashboard' && (
              <TabDashboardRekapBlend
                dataset={dataset}
                tahunGlobal={tahunGlobal}
                onTahunGlobalChange={handleTahunChange}
                bulanRingkasan={bulanRingkasan}
                onBulanRingkasanChange={handleBulanRingkasanChange}
                periodeAwal={periodeAwal}
                onPeriodeAwalChange={handlePeriodeAwalChange}
                periodeAkhir={periodeAkhir}
                onPeriodeAkhirChange={handlePeriodeAkhirChange}
                onApplyPeriode={handleApplyPeriode}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'bulan' && (
              <TabBulanRekapBlend
                data={dataset.rekapBulan}
                onExportPdf={() => handleExportTabPdf('bulan')}
                onZoomChart={(title, chartType, data) =>
                  setChartModal({ isOpen: true, title, chartType, data })
                }
              />
            )}

            {activeTab === 'merk' && (
              <TabMerkRekapBlend
                periodeLabel={dataset.rekapMerkPeriode.periodeLabel}
                merkList={dataset.rekapMerkPeriode.list}
                trendMerk={dataset.trendMerk}
                availableMerks={dataset.filterOptions.merk}
                selectedTrendMerk={selectedTrendMerk}
                onSelectTrendMerk={setSelectedTrendMerk}
                onExportPdf={() => handleExportTabPdf('merk')}
                onZoomChart={(title, chartType, data) =>
                  setChartModal({ isOpen: true, title, chartType, data })
                }
              />
            )}

            {activeTab === 'molen' && (
              <TabMolenRekapBlend
                data={dataset.rekapMolen}
                selectedBulan={selectedBulanMolen}
                onBulanChange={setSelectedBulanMolen}
                onExportPdf={() => handleExportTabPdf('molen')}
                onZoomChart={(title, chartType, data) =>
                  setChartModal({ isOpen: true, title, chartType, data })
                }
              />
            )}

            {activeTab === 'explorer' && (
              <DataExplorerRekapBlend
                rows={dataset.allRows}
                currentRole={currentRole}
                onExportCsv={handleExportCsv}
              />
            )}
          </div>

          {/* 6. Footer Web Apps Permanen (Ketentuan 2) */}
          <footer className="mt-12 pt-6 border-t border-slate-200/90 text-center text-xs text-slate-500 font-medium no-print">
            Monitoring Board — Rekap Data Proses Blend All Rights Reserved . Divisi Produksi I .
            Developed by Lalu Mahendra
          </footer>
        </main>
      </div>

      {/* 7. Footer Khusus Cetak .PDF (Ketentuan 1) */}
      <div className="print-pdf-footer">Divisi Produksi I - All Rights Reserved</div>

      {/* 8. Modals Terintegrasi */}
      <HelpModalRekapBlend isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SwitchBoardModalRekapBlend
        isOpen={isSwitchAppOpen}
        onClose={() => setIsSwitchAppOpen(false)}
      />

      <GasCenterModalRekapBlend
        isOpen={isGasCenterOpen}
        onClose={() => setIsGasCenterOpen(false)}
        onResetCache={handleResetCache}
      />

      <ChartModalRekapBlend
        isOpen={chartModal.isOpen}
        onClose={() => setChartModal({ isOpen: false, title: '', chartType: null, data: null })}
        title={chartModal.title}
        chartType={chartModal.chartType}
        data={chartModal.data}
      />

      {/* 9. Bottom Navigation Bar untuk Layar Smartphone */}
      <BottomNavBarRekapBlend
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => handleRefresh(false)}
        isRefreshing={isRefreshing}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
    </div>
  );
}
