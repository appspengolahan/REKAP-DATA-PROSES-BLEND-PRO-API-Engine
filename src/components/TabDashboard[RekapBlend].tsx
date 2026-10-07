import React from 'react';
import { SummaryCardsRekapBlend } from './SummaryCards[RekapBlend]';
import { DashboardDataset, ActiveTab } from '../types[RekapBlend]';
import { fmtKg, fmtPct } from '../api[RekapBlend]';
import {
  LayoutDashboard,
  CheckCircle2,
  TrendingDown,
  CalendarDays,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface TabDashboardProps {
  dataset: DashboardDataset;
  tahunGlobal: string;
  onTahunGlobalChange: (t: string) => void;
  bulanRingkasan: string;
  onBulanRingkasanChange: (b: string) => void;
  periodeAwal: { bulan: string; tahun: string };
  onPeriodeAwalChange: (p: { bulan: string; tahun: string }) => void;
  periodeAkhir: { bulan: string; tahun: string };
  onPeriodeAkhirChange: (p: { bulan: string; tahun: string }) => void;
  onApplyPeriode: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const TabDashboardRekapBlend: React.FC<TabDashboardProps> = ({
  dataset,
  tahunGlobal,
  onTahunGlobalChange,
  bulanRingkasan,
  onBulanRingkasanChange,
  periodeAwal,
  onPeriodeAwalChange,
  periodeAkhir,
  onPeriodeAkhirChange,
  onApplyPeriode,
  onNavigateTab,
}) => {
  const isLossCompliant = dataset.ringkasanTahunan.susutRataPct <= 0.5;

  return (
    <div className="space-y-5">
      {/* Executive Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Executive Monitoring Dashboard · Divisi Produksi I</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Rekapitulasi Proses Blend Komoditas & Efisiensi Bahan
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pemantauan performa akumulatif, rasio yield produk jadi, dan kesusutan proses dari{' '}
              <strong className="text-white font-bold">{dataset.allRows.length} baris</strong> data sheet DATAMASTER.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-2xl">
              <div className="text-[10px] text-slate-300 font-semibold uppercase">Status Mutu</div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLossCompliant ? 'Terkendali (< 0,50%)' : 'Waspada'}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-2xl">
              <div className="text-[10px] text-slate-300 font-semibold uppercase">Total Bahan Masuk</div>
              <div className="text-sm font-black text-amber-300 mt-0.5">
                {fmtKg(dataset.ringkasanTahunan.bahanDiproses)} Kg
              </div>
            </div>
          </div>
        </div>

        {/* Shortcut Quick Links to Specific Tabs */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigateTab('bulan')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left text-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              <div>
                <div className="font-bold text-white group-hover:text-blue-300">Analisis Tren Waktu</div>
                <div className="text-[10px] text-slate-400">12 Bulan Deret Waktu</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-300 transition" />
          </button>

          <button
            onClick={() => onNavigateTab('merk')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left text-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-bold text-white group-hover:text-amber-300">Katalog Jenis & Resep</div>
                <div className="text-[10px] text-slate-400">6 Varian Formula Blend</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-300 transition" />
          </button>

          <button
            onClick={() => onNavigateTab('molen')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left text-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-bold text-white group-hover:text-purple-300">Telemetri Mesin Molen</div>
                <div className="text-[10px] text-slate-400">4 Unit Mesin Campur</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-300 transition" />
          </button>
        </div>
      </div>

      {/* 3 Executive Summary Cards (Tahunan, Bulanan, Rentang Periode) */}
      <div className="summary-cards-area">
        <SummaryCardsRekapBlend
          tahunGlobal={tahunGlobal}
          onTahunGlobalChange={onTahunGlobalChange}
          availableTahun={dataset.filterOptions.tahun}
          bulanRingkasan={bulanRingkasan}
          onBulanRingkasanChange={onBulanRingkasanChange}
          periodeAwal={periodeAwal}
          onPeriodeAwalChange={onPeriodeAwalChange}
          periodeAkhir={periodeAkhir}
          onPeriodeAkhirChange={onPeriodeAkhirChange}
          onApplyPeriode={onApplyPeriode}
          ringkasanTahunan={dataset.ringkasanTahunan}
          ringkasanBulanan={dataset.ringkasanBulanan}
          ringkasanPeriode={dataset.ringkasanPeriode}
        />
      </div>
    </div>
  );
};
