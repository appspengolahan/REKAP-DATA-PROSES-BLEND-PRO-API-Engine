import React, { useState, useMemo, useEffect } from 'react';
import {
  DeviasiVarianItem,
  RawBlendRow,
  UserRole,
} from '../types[RekapBlend]';
import {
  fmtKg,
  fmtPct,
  fmtInt,
  fmtSuhu,
  MONTH_ORDER,
  getActiveStandarAcuan,
  saveActiveStandarAcuan,
  getActiveStandarAcuanLabel,
  computeDeviasiBulan,
  generateExecutiveNaratifDeviasi,
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
} from 'lucide-react';

interface TabDeviasiProps {
  allRows: RawBlendRow[];
  currentRole: UserRole;
  currentYear?: string;
  currentMonth?: string;
}

export const TabDeviasiRekapBlend: React.FC<TabDeviasiProps> = ({
  allRows,
  currentRole,
  currentYear = '2026',
  currentMonth = 'Oktober',
}) => {
  // 1. Filter Evaluasi Bulanan
  const [selectedBulan, setSelectedBulan] = useState<string>(currentMonth || 'Oktober');
  const [selectedTahun, setSelectedTahun] = useState<string>(currentYear || '2026');

  // 2. Standar Acuan Baseline State
  const [activeStandards, setActiveStandards] = useState<Record<string, number>>(() =>
    getActiveStandarAcuan()
  );
  const [activeLabel, setActiveLabel] = useState<string>(() =>
    getActiveStandarAcuanLabel()
  );
  const [isEditingBaseline, setIsEditingBaseline] = useState<boolean>(false);
  const [customStandards, setCustomStandards] = useState<Record<string, number>>(() =>
    getActiveStandarAcuan()
  );
  const [selectedPreset, setSelectedPreset] = useState<string>('agu_sep');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // 3. Narasi State
  const [copiedNarasi, setCopiedNarasi] = useState<boolean>(false);
  const [isEditingNarasi, setIsEditingNarasi] = useState<boolean>(false);
  const [customNarasiText, setCustomNarasiText] = useState<string>('');

  // 4. Modal Print / PDF Preview
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Sinkronisasi saat komponen mount
  useEffect(() => {
    setActiveStandards(getActiveStandarAcuan());
    setActiveLabel(getActiveStandarAcuanLabel());
  }, []);

  // Preset Standar Acuan Berbasis Periode Historis
  const presets = useMemo(
    () => [
      {
        id: 'agu_sep',
        label: 'Rata-rata Tertimbang Agustus – September 2026 (Rekomendasi)',
        standards: DEFAULT_STANDAR_ACUAN,
      },
      {
        id: 'jan_sep',
        label: 'Rata-rata Kumulatif Januari – September 2026',
        standards: {
          '153 - BK': 0.31,
          'KARANG - BK': 0.14,
          'FR LN - AVE': -0.07,
          'SP 153 - BK': 0.28,
          'FR LA BOLD - BK': 0.10,
          'TIS - KBT24': -0.07,
        },
      },
      {
        id: 'agustus_only',
        label: 'Khusus Bulan Agustus 2026 Saja',
        standards: {
          '153 - BK': 0.25,
          'KARANG - BK': 0.14,
          'FR LN - AVE': -0.09,
          'SP 153 - BK': 0.26,
          'FR LA BOLD - BK': 0.10,
          'TIS - KBT24': -0.06,
        },
      },
      {
        id: 'september_only',
        label: 'Khusus Bulan September 2026 Saja',
        standards: {
          '153 - BK': 0.28,
          'KARANG - BK': 0.11,
          'FR LN - AVE': -0.07,
          'SP 153 - BK': 0.28,
          'FR LA BOLD - BK': 0.10,
          'TIS - KBT24': -0.07,
        },
      },
    ],
    []
  );

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setCustomStandards({ ...found.standards });
    }
  };

  const handleApplyNewBaseline = () => {
    const found = presets.find((p) => p.id === selectedPreset);
    const label = found ? found.label : 'Standar Kustom Divisi Produksi I';
    saveActiveStandarAcuan(customStandards, label);
    setActiveStandards({ ...customStandards });
    setActiveLabel(label);
    setIsEditingBaseline(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  const handleResetToDefault = () => {
    saveActiveStandarAcuan(DEFAULT_STANDAR_ACUAN, DEFAULT_STANDAR_LABEL);
    setActiveStandards({ ...DEFAULT_STANDAR_ACUAN });
    setCustomStandards({ ...DEFAULT_STANDAR_ACUAN });
    setActiveLabel(DEFAULT_STANDAR_LABEL);
    setSelectedPreset('agu_sep');
    setIsEditingBaseline(false);
  };

  // 5. Kalkulasi Matriks Deviasi
  const deviasiList: DeviasiVarianItem[] = useMemo(() => {
    return computeDeviasiBulan(allRows, selectedBulan, selectedTahun, activeStandards);
  }, [allRows, selectedBulan, selectedTahun, activeStandards]);

  // Total Ringkasan
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

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Filter */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Sistem Kendali Mutu & Evaluasi Strategis · Divisi Produksi I</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Analisis Deviasi Susut vs Standar Acuan Referensi
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Membandingkan realisasi susut riil per varian tembakau blend terhadap rata-rata tertimbang
              historis acuan, mendeteksi penyimpangan teknis per batch, dan merumuskan laporan naratif evaluasi.
            </p>
          </div>

          {/* Month / Year Selector */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 self-start lg:self-center no-print">
            <Calendar className="w-4 h-4 text-amber-400 ml-1.5" />
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-slate-800/90 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
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
              className="bg-slate-800/90 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Export Laporan Evaluasi Bulanan (PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Standar Acuan Aktif */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              STANDAR ACUAN AKTIF
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {fmtPct(summaryMetrics.avgAcuan)}%
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1" title={activeLabel}>
              {activeLabel}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Weighted Avg</span>
            <button
              onClick={() => setIsEditingBaseline(true)}
              className="text-blue-600 font-bold hover:text-blue-800 cursor-pointer no-print"
            >
              Ubah Acuan
            </button>
          </div>
        </div>

        {/* Card 2: Susut Riil Periode */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              SUSUT RIIL AKTUAL
            </span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight">
              {fmtPct(summaryMetrics.avgSusut)}%
            </div>
            <div className="text-[11px] font-semibold text-slate-600 mt-1">
              {fmtKg(summaryMetrics.totSusut)} Kg dari {fmtKg(summaryMetrics.totBahan)} Kg
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Volume Terproses</span>
            <span className="font-bold text-slate-700">{summaryMetrics.totCamp} Camp Batch</span>
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
            <div className="text-xl sm:text-2xl font-black tracking-tight">
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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
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

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Standar Acuan Baru Berhasil Ditetapkan dan Berlaku untuk Seluruh Perhitungan!</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
            Aktif Sekarang
          </span>
        </div>
      )}

      {/* 3. Panel 1: Kontrol Acuan (Baseline Setting) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panel 1: Kontrol Standar Acuan Susut (Baseline Configuration)
              </h3>
              <p className="text-[11px] text-slate-500">
                Tentukan periode acuan yang dijadikan patokan pembanding untuk proses blend bulan berjalan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            {!isEditingBaseline ? (
              <button
                onClick={() => setIsEditingBaseline(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Atur Ulang Acuan</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                  title="Kembalikan ke Rata-rata Agustus-September 2026"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  onClick={() => setIsEditingBaseline(false)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleApplyNewBaseline}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Terapkan Standar Acuan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preset Selection & Current Targets Display */}
        <div className="mt-4 space-y-4">
          {isEditingBaseline && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Sumber Periode Standar Acuan:</span>
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6 Blend Variants Standard Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.keys(activeStandards).map((merk) => {
              const currentVal = activeStandards[merk];
              const editVal = customStandards[merk] ?? currentVal;

              return (
                <div
                  key={merk}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between"
                >
                  <div className="text-[11px] font-bold text-slate-800 truncate" title={merk}>
                    {merk}
                  </div>
                  <div className="mt-2">
                    {isEditingBaseline ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={editVal}
                          onChange={(e) =>
                            setCustomStandards({
                              ...customStandards,
                              [merk]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-white border border-blue-400 rounded px-1.5 py-1 text-xs font-black text-blue-900 text-center"
                        />
                        <span className="text-[11px] font-bold text-slate-500">%</span>
                      </div>
                    ) : (
                      <div className="text-base sm:text-lg font-black text-slate-900 text-center">
                        {fmtPct(currentVal)}%
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-center text-slate-400 mt-1">
                    {currentVal < 0 ? 'Karakteristik Gain' : 'Target Toleransi'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Panel 2: Dashboard Komparasi Multi-Varian (Grafik & Matriks) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panel 2: Dashboard Komparasi Multi-Varian (Grafik & Matriks Deviasi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Perbandingan bersanding (*Side-by-Side*) persentase susut acuan vs susut riil per varian tembakau blend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 no-print">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
              <span>Susut Acuan (%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
              <span>Susut Riil Aktual (%)</span>
            </span>
          </div>
        </div>

        {/* Side-by-Side Bar Chart SVG */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>Grafik Komparasi Bersanding (% Susut Acuan vs % Susut Riil):</span>
            <span className="text-[11px] font-normal text-slate-500">
              Evaluasi: {selectedBulan} {selectedTahun}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {deviasiList.map((item) => {
              const maxScale = 0.8;
              const acuanHeight = Math.min(Math.max(Math.abs(item.susutAcuanPct) / maxScale, 0.05), 1) * 100;
              const riilHeight = Math.min(Math.max(Math.abs(item.susutRiilPct) / maxScale, 0.05), 1) * 100;

              return (
                <div
                  key={item.merk}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block truncate" title={item.merk}>
                      {item.merk}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.status === 'normal'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'waspada'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.deviasiPct >= 0 ? '+' : ''}
                      {fmtPct(item.deviasiPct)}% Δ
                    </span>
                  </div>

                  {/* Dual Bar Graphic */}
                  <div className="h-28 flex items-end justify-center gap-2 my-2 pt-2 border-b border-slate-100">
                    {/* Bar Acuan */}
                    <div className="w-5 flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-bold text-emerald-700 tabular-nums">
                        {fmtPct(item.susutAcuanPct)}
                      </span>
                      <div
                        className="w-full bg-emerald-500 rounded-t transition-all duration-300 group-hover:bg-emerald-600"
                        style={{ height: `${acuanHeight}%` }}
                        title={`Acuan: ${fmtPct(item.susutAcuanPct)}%`}
                      ></div>
                    </div>

                    {/* Bar Riil */}
                    <div className="w-5 flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-bold text-blue-700 tabular-nums">
                        {fmtPct(item.susutRiilPct)}
                      </span>
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all duration-300 group-hover:bg-blue-700"
                        style={{ height: `${riilHeight}%` }}
                        title={`Riil: ${fmtPct(item.susutRiilPct)}%`}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500">
                    <div>{fmtKg(item.bobotRiilKg)} Kg</div>
                    <div className="font-semibold text-slate-700">
                      Selisih: {item.deviasiKg >= 0 ? '+' : ''}
                      {fmtKg(item.deviasiKg)} Kg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Matriks Deviasi Multi-Varian Lengkap */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">JENIS TEMBAKAU BLEND</th>
                  <th className="py-2.5 px-2 text-center">BATCH</th>
                  <th className="py-2.5 px-3 text-right">BOBOT BAKU (KG)</th>
                  <th className="py-2.5 px-3 text-right">HASIL (KG)</th>
                  <th className="py-2.5 px-3 text-right">SUSUT RIIL (KG)</th>
                  <th className="py-2.5 px-3 text-right text-blue-700">% RIIL</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">% ACUAN</th>
                  <th className="py-2.5 px-3 text-right">SELISIH (KG)</th>
                  <th className="py-2.5 px-3 text-right">SELISIH (%)</th>
                  <th className="py-2.5 px-3 text-center">STATUS MUTU</th>
                  <th className="py-2.5 px-3 text-right">KONTRIBUSI Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deviasiList.map((item) => (
                  <tr key={item.merk} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.merk}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600 bg-slate-50/50">
                      {item.jumlahBatch}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800 tabular-nums">
                      {fmtKg(item.bobotRiilKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-900 tabular-nums">
                      {fmtKg(item.hasilRiilKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800 tabular-nums">
                      {fmtKg(item.susutRiilKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-900 tabular-nums">
                      {fmtPct(item.susutRiilPct)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                      {fmtPct(item.susutAcuanPct)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-black tabular-nums ${
                        item.deviasiKg > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {item.deviasiKg >= 0 ? '+' : ''}
                      {fmtKg(item.deviasiKg)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-black tabular-nums ${
                        item.deviasiPct > 0.05
                          ? 'text-rose-700'
                          : item.deviasiPct < -0.05
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {item.deviasiPct >= 0 ? '+' : ''}
                      {fmtPct(item.deviasiPct)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'waspada'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status === 'normal'
                          ? 'Normal'
                          : item.status === 'waspada'
                          ? 'Waspada'
                          : 'OOS'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 tabular-nums">
                      {item.kontribusiDeviasiPct > 0
                        ? `${fmtPct(item.kontribusiDeviasiPct)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                  <td className="py-2.5 px-3 uppercase text-[11px]">TOTAL / RATA-RATA:</td>
                  <td className="py-2.5 px-2 text-center font-mono">{summaryMetrics.totCamp}</td>
                  <td className="py-2.5 px-3 text-right text-blue-900 font-extrabold tabular-nums">
                    {fmtKg(summaryMetrics.totBahan)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-900 font-extrabold tabular-nums">
                    {fmtKg(summaryMetrics.totHasil)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-900 font-extrabold tabular-nums">
                    {fmtKg(summaryMetrics.totSusut)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-blue-900 tabular-nums">
                    {fmtPct(summaryMetrics.avgSusut)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-800 tabular-nums">
                    {fmtPct(summaryMetrics.avgAcuan)}%
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-black tabular-nums ${
                      summaryMetrics.deltaKgTotal >= 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {summaryMetrics.deltaKgTotal >= 0 ? '+' : ''}
                    {fmtKg(summaryMetrics.deltaKgTotal)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-black tabular-nums ${
                      summaryMetrics.deltaAvg >= 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {summaryMetrics.deltaAvg >= 0 ? '+' : ''}
                    {fmtPct(summaryMetrics.deltaAvg)}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        summaryMetrics.overallStatus === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {summaryMetrics.overallStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">100,00%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Panel 3: Executive Summary Naratif (Otomatis) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panel 3: Executive Summary Naratif (Otomatis untuk Rapat Evaluasi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Sintesis narasi formal berbasis data riil, korelasi suhu molen, dan rekomendasi perbaikan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleCopyNarasi}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedNarasi ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks Narasi</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="prose prose-xs max-w-none text-slate-800 text-xs leading-relaxed space-y-3 whitespace-pre-line font-serif">
            {activeNarasi}
          </div>
        </div>
      </div>

      {/* 6. Panel 4: Tombol Export Laporan Evaluasi Bulanan (PDF) */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print shadow-xs">
        <div>
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">
            DOKUMEN RESMI DIVISI PRODUKSI I
          </div>
          <h4 className="text-base font-bold text-white">
            Export Dokumen Laporan Evaluasi Susut Bulanan (PDF)
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Format cetak standar lengkap dengan kop resmi PT Batu Karang, tabel deviasi, narasi eksekutif, dan blok tanda tangan.
          </p>
        </div>
        <button
          onClick={() => setIsPdfModalOpen(true)}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Buka Format Cetak & Simpan PDF</span>
        </button>
      </div>

      {/* MODAL PRINT PREVIEW / PDF DOKUMEN RESMI */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Dokumen Resmi: Laporan Evaluasi & Deviasi Susut Blend</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 text-xs bg-white print:p-0">
              {/* Kop Dokumen Resmi */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">
                    PT BATU KARANG · DIVISI PRODUKSI I (PP1)
                  </div>
                  <div className="text-xs font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                    SISTEM KENDALI MUTU & REKAPITULASI PROSES TEMBAKAU BLEND
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Jl. Industri Karanganyar · Telp. (0341) 801-700 · Malang, Jawa Timur
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <div className="font-bold text-slate-900">NO. DOKUMEN: EVAL-BLD/2026/10</div>
                  <div className="text-slate-500 mt-0.5">
                    Tanggal Terbit: 24 Oktober 2026
                  </div>
                  <div className="font-semibold text-emerald-800 mt-0.5">Status: Terverifikasi QC</div>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  LAPORAN EVALUASI & ANALISIS DEVIASI SUSUT PROSES BLEND
                </h2>
                <div className="text-xs font-semibold text-slate-600">
                  PERIODE: {selectedBulan.toUpperCase()} {selectedTahun} · STANDAR ACUAN: {activeLabel}
                </div>
              </div>

              {/* Ringkasan Angka Kunci */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">TOTAL BAHAN BAKU</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {fmtKg(summaryMetrics.totBahan)} Kg
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">REALISASI SUSUT RIIL</div>
                  <div className="text-sm font-black text-blue-900 mt-0.5">
                    {fmtPct(summaryMetrics.avgSusut)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">TARGET STANDAR ACUAN</div>
                  <div className="text-sm font-black text-emerald-800 mt-0.5">
                    {fmtPct(summaryMetrics.avgAcuan)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">SELISIH DEVIASI</div>
                  <div
                    className={`text-sm font-black mt-0.5 ${
                      summaryMetrics.deltaAvg >= 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {summaryMetrics.deltaAvg >= 0 ? '+' : ''}
                    {fmtPct(summaryMetrics.deltaAvg)}%
                  </div>
                </div>
              </div>

              {/* Tabel Evaluasi Komparasi Multi-Varian */}
              <div>
                <div className="font-bold text-xs text-slate-900 mb-1.5 uppercase">
                  1. Matriks Evaluasi Komparasi Antar Varian Tembakau Blend
                </div>
                <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300">JENIS TBK BLEND</th>
                      <th className="p-2 border border-slate-300 text-center">BATCH</th>
                      <th className="p-2 border border-slate-300 text-right">BAHAN (KG)</th>
                      <th className="p-2 border border-slate-300 text-right">HASIL (KG)</th>
                      <th className="p-2 border border-slate-300 text-right">% RIIL</th>
                      <th className="p-2 border border-slate-300 text-right">% ACUAN</th>
                      <th className="p-2 border border-slate-300 text-right">SELISIH (KG)</th>
                      <th className="p-2 border border-slate-300 text-right">DEVIASI (%)</th>
                      <th className="p-2 border border-slate-300 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviasiList.map((item) => (
                      <tr key={item.merk} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-bold">{item.merk}</td>
                        <td className="p-2 border border-slate-300 text-center font-mono">{item.jumlahBatch}</td>
                        <td className="p-2 border border-slate-300 text-right">{fmtKg(item.bobotRiilKg)}</td>
                        <td className="p-2 border border-slate-300 text-right">{fmtKg(item.hasilRiilKg)}</td>
                        <td className="p-2 border border-slate-300 text-right font-bold text-blue-900">
                          {fmtPct(item.susutRiilPct)}%
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-bold text-emerald-800">
                          {fmtPct(item.susutAcuanPct)}%
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-bold">
                          {item.deviasiKg >= 0 ? '+' : ''}
                          {fmtKg(item.deviasiKg)}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-bold">
                          {item.deviasiPct >= 0 ? '+' : ''}
                          {fmtPct(item.deviasiPct)}%
                        </td>
                        <td className="p-2 border border-slate-300 text-center uppercase font-bold text-[10px]">
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                      <td className="p-2 border border-slate-300">TOTAL / RATA-RATA</td>
                      <td className="p-2 border border-slate-300 text-center">{summaryMetrics.totCamp}</td>
                      <td className="p-2 border border-slate-300 text-right">{fmtKg(summaryMetrics.totBahan)}</td>
                      <td className="p-2 border border-slate-300 text-right">{fmtKg(summaryMetrics.totHasil)}</td>
                      <td className="p-2 border border-slate-300 text-right font-black text-blue-900">
                        {fmtPct(summaryMetrics.avgSusut)}%
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-black text-emerald-800">
                        {fmtPct(summaryMetrics.avgAcuan)}%
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-black">
                        {summaryMetrics.deltaKgTotal >= 0 ? '+' : ''}
                        {fmtKg(summaryMetrics.deltaKgTotal)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-black">
                        {summaryMetrics.deltaAvg >= 0 ? '+' : ''}
                        {fmtPct(summaryMetrics.deltaAvg)}%
                      </td>
                      <td className="p-2 border border-slate-300 text-center uppercase">
                        {summaryMetrics.overallStatus}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Narasi Executive Summary */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs text-slate-900 uppercase">
                  2. Kesimpulan Analisis & Rekomendasi Teknis
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-[11px] leading-relaxed whitespace-pre-line font-serif">
                  {activeNarasi}
                </div>
              </div>

              {/* Blok Tanda Tangan Pengesahan (3 Pihak) */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="text-[11px] text-slate-500 mb-12">Disusun Oleh (Lantai Pabrik):</div>
                  <div className="font-bold text-slate-900 underline">Mandor / Operator Blend</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Divisi Pengolahan PP1</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-12">Diperiksa Oleh:</div>
                  <div className="font-bold text-slate-900 underline">Quality Control (QC)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Pengendalian Mutu Susut</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-12">Disetujui Oleh:</div>
                  <div className="font-bold text-slate-900 underline">Lalu M.</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Project Manager (PM)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
