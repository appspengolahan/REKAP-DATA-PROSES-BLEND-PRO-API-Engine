import React, { useState, useMemo, useEffect } from 'react';
import {
  DeviasiVarianItem,
  RawBlendRow,
  UserRole,
  StandarAcuanDetailItem,
} from '../types[RekapBlend]';
import {
  fmtKg,
  fmtPct,
  fmtInt,
  fmtSuhu,
  round2,
  MONTH_ORDER,
  getActiveStandarAcuan,
  saveActiveStandarAcuan,
  getActiveStandarAcuanLabel,
  computeDeviasiBulan,
  generateExecutiveNaratifDeviasi,
  calculateWeightedStandardFromRows,
  DEFAULT_STANDAR_ACUAN,
  DEFAULT_STANDAR_LABEL,
} from '../api[RekapBlend]';
import {
  Sliders,
  Scale,
  Gauge,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  CheckCheck,
  Printer,
  Calendar,
  Layers,
  Thermometer,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  FileText,
  X,
  ExternalLink,
  Search,
  Filter,
  Check,
  Edit3,
} from 'lucide-react';

interface TabDeviasiProps {
  allRows: RawBlendRow[];
  currentRole: UserRole;
  currentYear?: string;
  currentMonth?: string;
}

export const VARIANT_METADATA: Record<string, { jalur: 'SKT' | 'SKM'; defaultTol: number }> = {
  '153 - BK': { jalur: 'SKT', defaultTol: 0.05 },
  'KARANG - BK': { jalur: 'SKT', defaultTol: 0.05 },
  'SP 153 - BK': { jalur: 'SKT', defaultTol: 0.05 },
  'FR LN - AVE': { jalur: 'SKM', defaultTol: 0.10 },
  'FR LA BOLD - BK': { jalur: 'SKM', defaultTol: 0.08 },
  'TIS - KBT24': { jalur: 'SKM', defaultTol: 0.10 },
};

export const TabDeviasiRekapBlend: React.FC<TabDeviasiProps> = ({
  allRows,
  currentRole,
  currentYear = '2026',
  currentMonth = 'Oktober',
}) => {
  // Main Sub-tab (matching reference: Evaluasi Bulanan vs Manajemen Standar Acuan)
  const [subTab, setSubTab] = useState<'evaluasi' | 'manajemen'>('manajemen');

  // Sub-tab 1: Evaluasi Bulanan States
  const [selectedBulan, setSelectedBulan] = useState<string>(currentMonth || 'Oktober');
  const [selectedTahun, setSelectedTahun] = useState<string>(currentYear || '2026');

  // Sub-tab 2: Manajemen Standar Acuan States
  const [calcBulanMulai, setCalcBulanMulai] = useState<string>('Agustus');
  const [calcBulanSampai, setCalcBulanSampai] = useState<string>('September');
  const [calcTahun, setCalcTahun] = useState<string>('2026');
  const [viewTableMode, setViewTableMode] = useState<'periode' | 'aktif'>('periode');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterJalur, setFilterJalur] = useState<'Semua' | 'SKT' | 'SKM'>('Semua');

  // Active Standard Reference State
  const [activeStandards, setActiveStandards] = useState<Record<string, number>>(() =>
    getActiveStandarAcuan()
  );
  const [activeLabel, setActiveLabel] = useState<string>(() =>
    getActiveStandarAcuanLabel()
  );
  const [customTolerances, setCustomTolerances] = useState<Record<string, number>>({
    '153 - BK': 0.05,
    'KARANG - BK': 0.05,
    'SP 153 - BK': 0.05,
    'FR LN - AVE': 0.10,
    'FR LA BOLD - BK': 0.08,
    'TIS - KBT24': 0.10,
  });

  // Modal Ubah Standar per Varian
  const [editingVariant, setEditingVariant] = useState<StandarAcuanDetailItem | null>(null);
  const [editTargetInput, setEditTargetInput] = useState<number>(0);
  const [editTolInput, setEditTolInput] = useState<number>(0.05);

  // Narasi State
  const [copiedNarasi, setCopiedNarasi] = useState<boolean>(false);
  const [isEditingNarasi, setIsEditingNarasi] = useState<boolean>(false);
  const [customNarasiText, setCustomNarasiText] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modal Print / PDF Preview
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Sinkronisasi saat komponen mount
  useEffect(() => {
    setActiveStandards(getActiveStandarAcuan());
    setActiveLabel(getActiveStandarAcuanLabel());
  }, []);

  // Hitung Data Standar Acuan untuk Periode Tertentu
  const periodData = useMemo(() => {
    const sIdx = MONTH_ORDER.findIndex((m) => m.toLowerCase() === calcBulanMulai.toLowerCase());
    const eIdx = MONTH_ORDER.findIndex((m) => m.toLowerCase() === calcBulanSampai.toLowerCase());
    const minIdx = Math.min(sIdx, eIdx);
    const maxIdx = Math.max(sIdx, eIdx);

    const matchingRows = allRows.filter((r) => {
      if (calcTahun !== 'Semua' && r.tahun !== calcTahun) return false;
      const mIdx = MONTH_ORDER.findIndex((m) => m.toLowerCase() === r.bulan.toLowerCase());
      return mIdx >= minIdx && mIdx <= maxIdx;
    });

    const groups: Record<string, { baku: number; hasil: number; susut: number; count: number }> = {};
    const standardBrands = [
      '153 - BK',
      'KARANG - BK',
      'FR LN - AVE',
      'SP 153 - BK',
      'FR LA BOLD - BK',
      'TIS - KBT24',
    ];

    standardBrands.forEach((b) => {
      groups[b] = { baku: 0, hasil: 0, susut: 0, count: 0 };
    });

    matchingRows.forEach((r) => {
      if (!groups[r.merk]) {
        groups[r.merk] = { baku: 0, hasil: 0, susut: 0, count: 0 };
      }
      groups[r.merk].baku += r.bobot;
      groups[r.merk].hasil += r.hasil;
      groups[r.merk].susut += r.susutKg;
      groups[r.merk].count += 1;
    });

    let totalBakuPeriod = 0;
    let totalSusutPeriod = 0;
    let totalBatchPeriod = 0;
    let countBrandsWithData = 0;

    const list: StandarAcuanDetailItem[] = standardBrands.map((merk, idx) => {
      const g = groups[merk] || { baku: 0, hasil: 0, susut: 0, count: 0 };
      const meta = VARIANT_METADATA[merk] || { jalur: 'SKT', defaultTol: 0.05 };
      const calculatedPct = g.baku > 0 ? round2((g.susut / g.baku) * 100) : (DEFAULT_STANDAR_ACUAN[merk] ?? 0.28);
      const activePct = activeStandards[merk] !== undefined ? activeStandards[merk] : calculatedPct;
      const displayedPct = viewTableMode === 'aktif' ? activePct : calculatedPct;

      if (g.baku > 0) {
        totalBakuPeriod += g.baku;
        totalSusutPeriod += g.susut;
        totalBatchPeriod += g.count;
        countBrandsWithData += 1;
      }

      const periodeLabel = `${calcBulanMulai} - ${calcBulanSampai} ${calcTahun}`;
      const keterangan = g.baku > 0
        ? `Dihitung otomatis dari ${g.count} batch (Total olah ${g.baku.toLocaleString('id-ID', { maximumFractionDigits: 1 })} Kg) periode ${periodeLabel}`
        : `Belum ada data olah di rentang ini. Menggunakan acuan standar formula (${(DEFAULT_STANDAR_ACUAN[merk] ?? 0.28).toFixed(2)}%)`;

      return {
        no: idx + 1,
        merk,
        jalur: meta.jalur,
        standarSusutPct: displayedPct,
        toleransiPct: customTolerances[merk] ?? meta.defaultTol,
        totalBakuKg: round2(g.baku),
        jumlahBatch: g.count,
        periodeAcuan: viewTableMode === 'aktif' ? activeLabel : periodeLabel,
        keterangan,
      };
    });

    const agregatSusutPct = totalBakuPeriod > 0 ? round2((totalSusutPeriod / totalBakuPeriod) * 100) : 0.28;

    return {
      items: list,
      totalBakuPeriod: round2(totalBakuPeriod),
      totalSusutPeriod: round2(totalSusutPeriod),
      totalBatchPeriod,
      countBrandsWithData,
      agregatSusutPct,
    };
  }, [allRows, calcBulanMulai, calcBulanSampai, calcTahun, activeStandards, activeLabel, customTolerances, viewTableMode]);

  // Status apakah periode yang sedang dipilih sama dengan acuan aktif
  const currentPeriodLabel = `${calcBulanMulai} - ${calcBulanSampai} ${calcTahun}`;
  const isPeriodActive = activeLabel.toLowerCase().includes(currentPeriodLabel.toLowerCase()) ||
    (calcBulanMulai === 'Agustus' && calcBulanSampai === 'September' && activeLabel.includes('Agustus – September'));

  // Terapkan Standar Acuan dari Periode Ini
  const handleApplyPeriodStandards = () => {
    const newStandards: Record<string, number> = {};
    periodData.items.forEach((it) => {
      newStandards[it.merk] = it.standarSusutPct;
    });

    const newLabel = `Rata-rata Tertimbang ${calcBulanMulai} – ${calcBulanSampai} ${calcTahun}`;
    saveActiveStandarAcuan(newStandards, newLabel);
    setActiveStandards(newStandards);
    setActiveLabel(newLabel);

    setSaveSuccessMsg(`Standar Acuan Periode ${calcBulanMulai} - ${calcBulanSampai} ${calcTahun} berhasil diaktifkan!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Reset Standar Acuan ke Default (Agustus - September 2026)
  const handleResetDefaultStandards = () => {
    saveActiveStandarAcuan(DEFAULT_STANDAR_ACUAN, DEFAULT_STANDAR_LABEL);
    setActiveStandards({ ...DEFAULT_STANDAR_ACUAN });
    setActiveLabel(DEFAULT_STANDAR_LABEL);
    setCalcBulanMulai('Agustus');
    setCalcBulanSampai('September');
    setCalcTahun('2026');

    setSaveSuccessMsg('Standar acuan dikembalikan ke default: Rata-rata Tertimbang Agustus – September 2026');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Simpan Penyesuaian Standar Satuan (Modal Ubah Standar)
  const handleSaveVariantEdit = () => {
    if (!editingVariant) return;
    const updated = {
      ...activeStandards,
      [editingVariant.merk]: round2(editTargetInput),
    };
    const updatedTol = {
      ...customTolerances,
      [editingVariant.merk]: round2(editTolInput),
    };
    const newLabel = activeLabel.includes('Disesuaikan')
      ? activeLabel
      : `${activeLabel} (Disesuaikan Manual)`;

    saveActiveStandarAcuan(updated, newLabel);
    setActiveStandards(updated);
    setActiveLabel(newLabel);
    setCustomTolerances(updatedTol);
    setEditingVariant(null);

    setSaveSuccessMsg(`Standar acuan ${editingVariant.merk} berhasil diperbarui menjadi ${editTargetInput.toFixed(2)}%!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Filter tabel manajemen standar
  const filteredManagementItems = useMemo(() => {
    return periodData.items.filter((it) => {
      const matchSearch = it.merk.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJalur = filterJalur === 'Semua' || it.jalur === filterJalur;
      return matchSearch && matchJalur;
    });
  }, [periodData.items, searchQuery, filterJalur]);

  // Kalkulasi Matriks Deviasi untuk Sub-tab Evaluasi Bulanan
  const deviasiList: DeviasiVarianItem[] = useMemo(() => {
    return computeDeviasiBulan(allRows, selectedBulan, selectedTahun, activeStandards);
  }, [allRows, selectedBulan, selectedTahun, activeStandards]);

  // Total Ringkasan Evaluasi Bulanan
  const summaryMetrics = useMemo(() => {
    const totBahan = deviasiList.reduce((s, it) => s + it.bobotRiilKg, 0);
    const totHasil = deviasiList.reduce((s, it) => s + it.hasilRiilKg, 0);
    const totSusut = deviasiList.reduce((s, it) => s + it.susutRiilKg, 0);
    const totCamp = deviasiList.reduce((s, it) => s + it.jumlahBatch, 0);
    const avgSusut = totBahan > 0 ? (totSusut / totBahan) * 100 : 0;

    const totSusutAcuan = deviasiList.reduce(
      (s, it) => s + (it.bobotRiilKg * it.susutAcuanPct) / 100,
      0
    );
    const avgAcuan = totBahan > 0 ? (totSusutAcuan / totBahan) * 100 : 0;
    const deltaAvg = avgSusut - avgAcuan;
    const deltaKgTotal = totSusut - totSusutAcuan;

    const oosCount = deviasiList.filter((it) => it.status === 'oos').length;
    const waspadaCount = deviasiList.filter((it) => it.status === 'waspada').length;

    let overallStatus: 'optimal' | 'waspada' | 'oos' = 'optimal';
    if (oosCount > 0 || deltaAvg > 0.15) {
      overallStatus = 'oos';
    } else if (waspadaCount > 0 || deltaAvg > 0.05) {
      overallStatus = 'waspada';
    }

    return {
      totBahan,
      totHasil,
      totSusut,
      totCamp,
      avgSusut,
      avgAcuan,
      deltaAvg,
      deltaKgTotal,
      oosCount,
      waspadaCount,
      overallStatus,
    };
  }, [deviasiList]);

  // Narasi Otomatis
  const generatedNarasi = useMemo(() => {
    return generateExecutiveNaratifDeviasi(
      deviasiList,
      selectedBulan,
      selectedTahun,
      activeLabel
    );
  }, [deviasiList, selectedBulan, selectedTahun, activeLabel]);

  const activeNarasi = isEditingNarasi ? customNarasiText : generatedNarasi;

  const handleCopyNarasi = () => {
    navigator.clipboard.writeText(activeNarasi);
    setCopiedNarasi(true);
    setTimeout(() => setCopiedNarasi(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Analisis Deviasi & Standar Acuan Susut
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Kontrol Kualitas Mutu
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Komparasi susut riil seluruh varian tembakau blend terhadap standar acuan, dekomposisi fraksi limbah, dan evaluasi berkala Divisi Produksi I
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0 no-print">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/30"
              title="Export Laporan Evaluasi Bulanan (PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF Evaluasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Navigation (Exact match with reference image) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200 no-print">
        <button
          onClick={() => setSubTab('evaluasi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'evaluasi'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Evaluasi Bulanan Komparasi Seluruh Bahan</span>
        </button>

        <button
          onClick={() => setSubTab('manajemen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'manajemen'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Manajemen Standar Acuan Susut (6 Varian Terhitung)</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
            Aktif di Sistem
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MANAJEMEN STANDAR ACUAN SUSUT (MATCHING REFERENCE EXACTLY) */}
      {/* ========================================================================= */}
      {subTab === 'manajemen' && (
        <div className="space-y-5">
          {/* Panel Kalkulasi Standar Acuan Dari Periode Produksi Nyata */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>KALKULASI STANDAR ACUAN DARI PERIODE PRODUKSI NYATA</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pilih rentang bulan dan tahun acuan. Sistem secara otomatis menghitung rata-rata tertimbang seluruh tembakau blend yang diproses pada rentang tersebut.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleApplyPeriodStandards}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isPeriodActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isPeriodActive ? 'Acuan Periode Ini Aktif (Perbarui)' : 'Terapkan Acuan Periode Ini'}
                  </span>
                </button>
              </div>
            </div>

            {/* Selector Rentang Bulan & Tahun Acuan */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Bulan Mulai:</span>
                  <select
                    value={calcBulanMulai}
                    onChange={(e) => setCalcBulanMulai(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {MONTH_ORDER.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Sampai Bulan:</span>
                  <select
                    value={calcBulanSampai}
                    onChange={(e) => setCalcBulanSampai(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {MONTH_ORDER.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Tahun:</span>
                  <select
                    value={calcTahun}
                    onChange={(e) => setCalcTahun(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="Semua">Semua</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                  6 Jenis Tembakau Terhitung Otomatis
                </span>
                {isPeriodActive && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aktif di Sistem</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4 Metric Cards for Calculation (Matches Reference exactly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Varian Ada Data */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                JENIS TEMBAKAU ADA DATA
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {periodData.countBrandsWithData} Varian
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Total 6 aturan proses formula blend
              </div>
            </div>

            {/* Card 2: Total Batch Terolah */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                TOTAL BATCH TEROLAH
              </div>
              <div className="text-2xl font-black text-blue-600 tracking-tight">
                {periodData.totalBatchPeriod} Batch
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Periode {calcBulanMulai} - {calcBulanSampai} {calcTahun}
              </div>
            </div>

            {/* Card 3: Total Bahan Baku Diolah */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                TOTAL BAHAN BAKU DIOLAH
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {fmtKg(periodData.totalBakuPeriod)} Kg
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Dasar pembobotan rata-rata tertimbang
              </div>
            </div>

            {/* Card 4: Rata-Rata Susut Agregat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                RATA-RATA SUSUT AGREGAT
              </div>
              <div className="text-2xl font-black text-amber-600 tracking-tight">
                {fmtPct(periodData.agregatSusutPct)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Toleransi wajar operasional ±0,15%
              </div>
            </div>
          </div>

          {/* Table Container with Controls & Search */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              {/* Toggles View Mode */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                <button
                  onClick={() => setViewTableMode('periode')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewTableMode === 'periode'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tembakau Periode Ini (6)
                </button>
                <button
                  onClick={() => setViewTableMode('aktif')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewTableMode === 'aktif'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Acuan Aktif Sistem (6)
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jenis tembakau..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-52"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                  {(['Semua', 'SKT', 'SKM'] as const).map((j) => (
                    <button
                      key={j}
                      onClick={() => setFilterJalur(j)}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        filterJalur === j ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResetDefaultStandards}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  title="Kembalikan standar acuan ke default pabrik"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Detailed Standards Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] sm:text-xs">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-3.5">Jenis Tembakau</th>
                    <th className="py-3 px-3 text-center">Jalur</th>
                    <th className="py-3 px-3.5 text-right text-amber-900 font-extrabold">Standar Susut (%)</th>
                    <th className="py-3 px-3 text-center">Toleransi (± %)</th>
                    <th className="py-3 px-3.5 text-right">Total Baku (Kg)</th>
                    <th className="py-3 px-3 text-center">Jumlah Batch</th>
                    <th className="py-3 px-3.5">Periode Acuan</th>
                    <th className="py-3 px-4 min-w-[260px]">Keterangan / Rationale</th>
                    <th className="py-3 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredManagementItems.map((item) => (
                    <tr key={item.merk} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-semibold text-[11px]">
                        {item.no}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {item.merk}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.jalur === 'SKT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.jalur}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-black text-amber-700 text-sm tabular-nums">
                        {fmtPct(item.standarSusutPct)}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-semibold text-[11px]">
                        ±{item.toleransiPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-slate-800 tabular-nums">
                        {item.totalBakuKg > 0 ? fmtKg(item.totalBakuKg) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium">
                        {item.jumlahBatch > 0 ? `${item.jumlahBatch} batch` : '-'}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                        {item.periodeAcuan}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] leading-relaxed">
                        {item.keterangan}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setEditingVariant(item);
                            setEditTargetInput(item.standarSusutPct);
                            setEditTolInput(item.toleransiPct);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Ubah Standar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: EVALUASI BULANAN KOMPARASI SELURUH BAHAN */}
      {/* ========================================================================= */}
      {subTab === 'evaluasi' && (
        <div className="space-y-6">
          {/* Quick Month & Year Picker for Evaluation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Periode Evaluasi Bulanan Komparasi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Membandingkan susut riil bulan terpilih terhadap standar acuan aktif ({activeLabel})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {MONTH_ORDER.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Standar Acuan Aktif */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  STANDAR ACUAN AKTIF
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {fmtPct(summaryMetrics.avgAcuan)}%
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1" title={activeLabel}>
                  {activeLabel}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target Weighted Avg</span>
                <button
                  onClick={() => setSubTab('manajemen')}
                  className="text-blue-600 font-bold hover:text-blue-800 cursor-pointer"
                >
                  Kelola Acuan
                </button>
              </div>
            </div>

            {/* Card 2: Susut Riil Periode */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  SUSUT RIIL AKTUAL
                </span>
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black text-blue-900 tracking-tight">
                  {fmtPct(summaryMetrics.avgSusut)}%
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  {fmtKg(summaryMetrics.totSusut)} Kg dari {fmtKg(summaryMetrics.totBahan)} Kg
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Volume Terproses</span>
                <span className="font-bold text-slate-700">{summaryMetrics.totCamp} Batch</span>
              </div>
            </div>

            {/* Card 3: Selisih Deviasi Netto */}
            <div
              className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between ${
                summaryMetrics.deltaAvg > 0.05
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : summaryMetrics.deltaAvg < -0.05
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between opacity-80 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  SELISIH DEVIASI NETTO
                </span>
                {summaryMetrics.deltaAvg > 0 ? (
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="mt-1">
                <div className="text-2xl font-black tracking-tight">
                  {summaryMetrics.deltaAvg >= 0 ? '+' : ''}
                  {fmtPct(summaryMetrics.deltaAvg)}%
                </div>
                <div className="text-[11px] font-semibold opacity-90 mt-1">
                  {summaryMetrics.deltaKgTotal >= 0 ? '+' : ''}
                  {fmtKg(summaryMetrics.deltaKgTotal)} Kg vs Target
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-current/15 flex items-center justify-between text-[11px]">
                <span className="opacity-75">Toleransi Normal</span>
                <span className="font-bold">± 0,05%</span>
              </div>
            </div>

            {/* Card 4: Status Kepatuhan Mutu */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  STATUS KEPATUHAN MUTU
                </span>
                <Gauge className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  {summaryMetrics.overallStatus === 'optimal' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span className="text-lg font-black text-emerald-700">Terkendali</span>
                    </>
                  ) : summaryMetrics.overallStatus === 'waspada' ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <span className="text-lg font-black text-amber-700">Waspada Deviasi</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                      <span className="text-lg font-black text-rose-700">Out of Spec (OOS)</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {summaryMetrics.oosCount} varian OOS · {summaryMetrics.waspadaCount} varian Waspada
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Periode Evaluasi</span>
                <span className="font-bold text-slate-800">
                  {selectedBulan} {selectedTahun}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side SVG Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Grafik Komparasi Bersanding: Standar Acuan vs Realisasi Bulanan
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  <span>Standar Acuan (%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-600"></span>
                  <span>Realisasi Bulanan (%)</span>
                </span>
              </div>
            </div>

            {/* SVG Side-by-side Chart */}
            <div className="pt-2 pb-4 overflow-x-auto">
              <div className="min-w-[620px] h-60 flex items-end justify-between gap-4 px-4 border-b border-slate-200">
                {deviasiList.map((item) => {
                  const maxVal = 0.8;
                  const acuanHeight = Math.max(8, Math.min(200, (Math.abs(item.susutAcuanPct) / maxVal) * 180));
                  const riilHeight = Math.max(8, Math.min(200, (Math.abs(item.susutRiilPct) / maxVal) * 180));

                  return (
                    <div key={item.merk} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="flex items-end gap-1.5 w-full justify-center">
                        {/* Acuan Bar */}
                        <div className="flex flex-col items-center w-5 sm:w-7">
                          <span className="text-[10px] font-mono text-emerald-700 font-bold mb-1 opacity-0 group-hover:opacity-100 transition">
                            {item.susutAcuanPct.toFixed(2)}%
                          </span>
                          <div
                            style={{ height: `${acuanHeight}px` }}
                            className="w-full bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition"
                            title={`Acuan: ${item.susutAcuanPct.toFixed(2)}%`}
                          ></div>
                        </div>

                        {/* Riil Bar */}
                        <div className="flex flex-col items-center w-5 sm:w-7">
                          <span className="text-[10px] font-mono text-blue-700 font-bold mb-1 opacity-0 group-hover:opacity-100 transition">
                            {item.susutRiilPct.toFixed(2)}%
                          </span>
                          <div
                            style={{ height: `${riilHeight}px` }}
                            className={`w-full rounded-t-md transition ${
                              item.status === 'oos'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : item.status === 'waspada'
                                ? 'bg-amber-500 hover:bg-amber-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            title={`Riil: ${item.susutRiilPct.toFixed(2)}% (Δ ${item.deviasiPct >= 0 ? '+' : ''}${item.deviasiPct.toFixed(2)}%)`}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-2 text-center">
                        <div className="text-[11px] font-bold text-slate-800 truncate max-w-[90px]" title={item.merk}>
                          {item.merk}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.bobotRiilKg > 0 ? `${item.jumlahBatch} btc` : '0 btc'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deviation Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Matriks Evaluasi Deviasi Susut Multi-Varian ({selectedBulan} {selectedTahun})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Toleransi: <strong className="text-slate-700">± 0,05%</strong> (Normal) ·{' '}
                <strong className="text-amber-700">± 0,15%</strong> (Waspada)
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px] sm:text-xs">
                    <th className="py-2.5 px-3">Jenis Tbk Blend</th>
                    <th className="py-2.5 px-3 text-right">Baku (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Hasil (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                    <th className="py-2.5 px-3 text-right">% Riil</th>
                    <th className="py-2.5 px-3 text-right text-emerald-800">Acuan %</th>
                    <th className="py-2.5 px-3 text-right">Deviasi %</th>
                    <th className="py-2.5 px-3 text-right">Deviasi (Kg)</th>
                    <th className="py-2.5 px-3 text-center">Status Mutu</th>
                    <th className="py-2.5 px-3 text-right">% Kontribusi</th>
                    <th className="py-2.5 px-3 text-center">Suhu Molen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deviasiList.map((item) => (
                    <tr key={item.merk} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.merk}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtKg(item.bobotRiilKg)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{fmtKg(item.hasilRiilKg)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">{fmtKg(item.susutRiilKg)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-blue-900">{fmtPct(item.susutRiilPct)}%</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">{fmtPct(item.susutAcuanPct)}%</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-black">
                        <span className={item.deviasiPct > 0.05 ? 'text-rose-600' : item.deviasiPct < -0.05 ? 'text-emerald-600' : 'text-slate-700'}>
                          {item.deviasiPct >= 0 ? '+' : ''}{fmtPct(item.deviasiPct)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-800">
                        {item.deviasiKg >= 0 ? '+' : ''}{fmtKg(item.deviasiKg)} Kg
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'normal' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Normal
                          </span>
                        )}
                        {item.status === 'waspada' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Waspada
                          </span>
                        )}
                        {item.status === 'oos' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            OOS
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        {item.kontribusiDeviasiPct > 0 ? `${item.kontribusiDeviasiPct.toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.suhuRata !== null ? `${item.suhuRata.toFixed(1)} °C` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Executive Summary Narrative Memo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Executive Summary Naratif (Otomatis untuk Laporan Evaluasi Bulanan)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyNarasi}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedNarasi ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNarasi ? 'Tersalin!' : 'Salin Narasi'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
              {activeNarasi}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: UBAH STANDAR PER VARIAN */}
      {editingVariant && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setEditingVariant(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold">Ubah Standar Susut Referensi</h3>
                  <p className="text-[11px] text-slate-300">{editingVariant.merk} ({editingVariant.jalur})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingVariant(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Target Standar Susut (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editTargetInput}
                    onChange={(e) => setEditTargetInput(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-500 text-sm">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Patokan resmi untuk perhitungan deviasi batch dan rekap bulanan.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Toleransi Normal (± %)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editTolInput}
                    onChange={(e) => setEditTolInput(parseFloat(e.target.value) || 0.05)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-500 text-sm">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Batas deviasi sebelum status naik ke Waspada atau Out of Spec (OOS).
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <strong>Catatan:</strong> Perubahan standar ini akan langsung disimpan ke sistem acuan aktif dan diterapkan pada evaluasi bulanan serta modal integrasi DHP.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingVariant(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveVariantEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU CETAK / PDF LAPORAN EVALUASI BULANAN */}
      {isPdfModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in"
          onClick={() => setIsPdfModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold">
                  Pratinjau Dokumen Cetak Evaluasi Deviasi Bulanan (.PDF)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Formatted like an Official Factory Audit Memo) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white">
              {/* Kop Surat */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black tracking-wider text-slate-900">
                    PT BATU KARANG — DIVISI PRODUKSI I
                  </h1>
                  <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                    LAPORAN AUDIT & EVALUASI STRATEGIS DEVIASI SUSUT TEMBAKAU BLEND
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Departemen Pengolahan Tembakau · Sistem Terpadu Rekap Blend
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <div><strong>Periode Audit:</strong> {selectedBulan} {selectedTahun}</div>
                  <div><strong>Acuan Standar:</strong> {activeLabel}</div>
                  <div><strong>Dicetak Pada:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                </div>
              </div>

              {/* Matriks Deviasi */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  I. Matriks Komparasi Volume & Susut Multi-Varian
                </h4>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2">Jenis Tbk Blend</th>
                      <th className="p-2 text-right">Baku (Kg)</th>
                      <th className="p-2 text-right">Hasil (Kg)</th>
                      <th className="p-2 text-right">Susut (Kg)</th>
                      <th className="p-2 text-right">% Riil</th>
                      <th className="p-2 text-right">Acuan %</th>
                      <th className="p-2 text-right">Deviasi %</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {deviasiList.map((it) => (
                      <tr key={it.merk}>
                        <td className="p-2 font-bold">{it.merk}</td>
                        <td className="p-2 text-right">{fmtKg(it.bobotRiilKg)}</td>
                        <td className="p-2 text-right">{fmtKg(it.hasilRiilKg)}</td>
                        <td className="p-2 text-right font-medium">{fmtKg(it.susutRiilKg)}</td>
                        <td className="p-2 text-right font-bold">{fmtPct(it.susutRiilPct)}%</td>
                        <td className="p-2 text-right text-emerald-700 font-semibold">{fmtPct(it.susutAcuanPct)}%</td>
                        <td className="p-2 text-right font-bold">
                          {it.deviasiPct >= 0 ? '+' : ''}{fmtPct(it.deviasiPct)}%
                        </td>
                        <td className="p-2 text-center font-bold text-[10px] uppercase">
                          {it.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                    <tr>
                      <td className="p-2">TOTAL AGREGAT:</td>
                      <td className="p-2 text-right">{fmtKg(summaryMetrics.totBahan)}</td>
                      <td className="p-2 text-right">{fmtKg(summaryMetrics.totHasil)}</td>
                      <td className="p-2 text-right">{fmtKg(summaryMetrics.totSusut)}</td>
                      <td className="p-2 text-right text-blue-900">{fmtPct(summaryMetrics.avgSusut)}%</td>
                      <td className="p-2 text-right text-emerald-800">{fmtPct(summaryMetrics.avgAcuan)}%</td>
                      <td className="p-2 text-right">
                        {summaryMetrics.deltaAvg >= 0 ? '+' : ''}{fmtPct(summaryMetrics.deltaAvg)}%
                      </td>
                      <td className="p-2 text-center uppercase">{summaryMetrics.overallStatus}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Ringkasan Naratif */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  II. Sintesis Naratif & Rekomendasi Teknis
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed whitespace-pre-line text-slate-800">
                  {activeNarasi}
                </div>
              </div>

              {/* 3 Kolom Tanda Tangan Resmi */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="text-slate-500 text-[11px] mb-12">Disiapkan Oleh:</div>
                  <div className="font-bold border-b border-slate-400 pb-1 mx-4">Mandor Operasional Blend</div>
                  <div className="text-[10px] text-slate-400 mt-1">Divisi Produksi I</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] mb-12">Diverifikasi Oleh:</div>
                  <div className="font-bold border-b border-slate-400 pb-1 mx-4">QC & Laboratorium Susut</div>
                  <div className="text-[10px] text-slate-400 mt-1">Pengendalian Mutu</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px] mb-12">Disetujui Oleh:</div>
                  <div className="font-bold border-b border-slate-400 pb-1 mx-4">Lalu Mahendra</div>
                  <div className="text-[10px] text-slate-400 mt-1">Project Manager Divisi I</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
