import React, { useState, useMemo, useRef } from 'react';
import { RekapMerkItem, TrendMerkData, RawBlendRow } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtInt, getPctBadgeClass, MONTH_ORDER, computeTrendMerk, computeRekapMerkPeriode } from '../api[RekapBlend]';
import { VERIFIED_KPI_BENCHMARK } from '../snapshotData[RekapBlend]';
import {
  FileText,
  Search,
  Maximize2,
  TrendingDown,
  Layers,
  Sparkles,
  Filter,
  Trophy,
  AlertTriangle,
  Scale,
  FlaskConical,
  ArrowRight,
  RotateCcw,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface TabMerkProps {
  allRows?: RawBlendRow[];
  periodeLabel: string;
  merkList: RekapMerkItem[];
  trendMerk: TrendMerkData;
  availableMerks: string[];
  selectedTrendMerk: string;
  onSelectTrendMerk: (merk: string) => void;
  onExportPdf: () => void;
  onZoomChart: (title: string, chartType: 'bar_merk' | 'line_trend_merk', data: any) => void;
}

export const TabMerkRekapBlend: React.FC<TabMerkProps> = ({
  allRows = [],
  periodeLabel: initialPeriodeLabel,
  merkList,
  trendMerk,
  availableMerks,
  selectedTrendMerk,
  onSelectTrendMerk,
  onExportPdf,
  onZoomChart,
}) => {
  // 1. Available Years dari dataset (dengan default tahun berjalan & pembanding)
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    if (allRows && allRows.length > 0) {
      allRows.forEach((r) => {
        if (r.tahun) set.add(r.tahun);
      });
    }
    // Pastikan tahun berjalan 2026 dan 2025 ada
    ['2026', '2025'].forEach((y) => set.add(y));
    const sorted = Array.from(set).sort((a, b) => Number(b) - Number(a));
    return ['Semua', ...sorted];
  }, [allRows]);

  // 2. State Filter Periode:
  // - Bulan Awal: Januari s/d Desember (posisi default: Januari)
  // - Bulan Akhir: Januari s/d Desember (posisi default: Oktober)
  // - Tahun: Pilihan tahun berjalan (2026 sebagai default), 2025, dan opsi Semua
  const [tahunFilter, setTahunFilter] = useState<string>('2026');
  const [bulanAwal, setBulanAwal] = useState<string>('Januari');
  const [bulanAkhir, setBulanAkhir] = useState<string>('Oktober');

  // Table search
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Hover state for Chart 1 (Bar Susut Antar Merk)
  const chart1Ref = useRef<HTMLDivElement>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);
  const [barMousePos, setBarMousePos] = useState<{ x: number; y: number; relativeY: number } | null>(null);

  // Interactive Hover state for Chart 2 (Trend Bulanan Merk Terpilih)
  const chart2Ref = useRef<HTMLDivElement>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [pointMousePos, setPointMousePos] = useState<{ x: number; y: number; relativeY: number } | null>(null);

  // Dynamic header periode label
  const headerPeriodeLabel = useMemo(() => {
    const thText = tahunFilter === 'Semua' ? 'Semua Tahun' : tahunFilter;
    if (bulanAwal === bulanAkhir) {
      return `${bulanAwal} ${thText}`;
    }
    return `${bulanAwal} – ${bulanAkhir} ${thText}`;
  }, [bulanAwal, bulanAkhir, tahunFilter]);

  // Tombol Reset Default (2026): Mengembalikan ke Januari – Oktober 2026
  const handleResetFilter = () => {
    setTahunFilter('2026');
    setBulanAwal('Januari');
    setBulanAkhir('Oktober');
  };

  // 3. SINKRONISASI OTOMATIS DATA PER MERK BERDASARKAN FILTER PERIODE
  const displayMerkList = useMemo(() => {
    return computeRekapMerkPeriode(
      allRows || [],
      tahunFilter,
      bulanAwal,
      tahunFilter,
      bulanAkhir
    ).list;
  }, [allRows, tahunFilter, bulanAwal, bulanAkhir]);

  // 4. SINKRONISASI DATA TREND SATU MERK (CHART 2)
  const currentTrendData = useMemo(() => {
    return computeTrendMerk(
      allRows || [],
      tahunFilter,
      selectedTrendMerk,
      bulanAwal,
      bulanAkhir
    );
  }, [allRows, tahunFilter, selectedTrendMerk, bulanAwal, bulanAkhir]);

  // Daftar merk yang aktif di periode ini (atau fallback availableMerks)
  const activeAvailableMerks = useMemo(() => {
    const listFromDisplay = displayMerkList.map((m) => m.label);
    if (listFromDisplay.length > 0) return listFromDisplay;
    return availableMerks;
  }, [displayMerkList, availableMerks]);

  // Filter tabel berdasarkan search term
  const filtered = displayMerkList.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartHeight = 270;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Chart 1 Scaling: Susut per Merk
  const maxSusut = Math.max(...displayMerkList.map((m) => m.susutRataPct), 0.45);
  const minSusut = Math.min(...displayMerkList.map((m) => m.susutRataPct), -0.15);
  const susutRange = maxSusut - minSusut || 1;

  // Chart 2 Scaling: Trend satu Merk
  const trendPoints = currentTrendData.data;
  const maxTrendSusut = Math.max(...trendPoints.map((d) => d.susutRataPct), 0.4);
  const minTrendSusut = Math.min(...trendPoints.map((d) => d.susutRataPct), -0.15);
  const trendRange = maxTrendSusut - minTrendSusut || 1;

  // 5. VARIANT / RESEP KEY INSIGHTS (SINKRON DENGAN PERIODE TERPILIH)
  const sortedByVol = [...displayMerkList].sort((a, b) => b.bahanDiproses - a.bahanDiproses);
  const topVolVariant = sortedByVol[0];
  const sortedByEfficiency = [...displayMerkList].sort((a, b) => a.susutRataPct - b.susutRataPct);
  const bestYieldVariant = sortedByEfficiency[0];
  const worstYieldVariant = sortedByEfficiency[sortedByEfficiency.length - 1];
  const totalBahanMerk = displayMerkList.reduce((acc, m) => acc + m.bahanDiproses, 0);

  // Active hover items
  const activeBar = hoveredBarIdx !== null && displayMerkList[hoveredBarIdx] ? { item: displayMerkList[hoveredBarIdx], index: hoveredBarIdx } : null;
  const activePoint = hoveredPointIdx !== null && trendPoints[hoveredPointIdx] ? { data: trendPoints[hoveredPointIdx], index: hoveredPointIdx } : null;

  return (
    <div className="space-y-5">
      {/* Tab Top Bar & Period Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Katalog Jenis Resep & Efisiensi Bahan Blend</span>
                <span className="text-xs bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {headerPeriodeLabel}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {displayMerkList.length} Formula
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                💡 Peringkat efisiensi rendemen dan kontribusi volume per formula sesuai rentang periode yang dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>📄 Export Tab Ini (PDF)</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filter Bar: Bulan Awal, Bulan Akhir, Tahun, dan Tombol Reset */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Filter Periode:</span>
          </div>

          {/* Bulan Awal */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Bulan Awal:</span>
            <select
              value={bulanAwal}
              onChange={(e) => setBulanAwal(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {MONTH_ORDER.map((m) => (
                <option key={`awal-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />

          {/* Bulan Akhir */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Bulan Akhir:</span>
            <select
              value={bulanAkhir}
              onChange={(e) => setBulanAkhir(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {MONTH_ORDER.map((m) => (
                <option key={`akhir-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Tahun:</span>
            <select
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y === 'Semua' ? 'Semua Tahun' : y}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Reset Default (2026) */}
          <button
            onClick={handleResetFilter}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              tahunFilter === '2026' && bulanAwal === 'Januari' && bulanAkhir === 'Oktober'
                ? 'text-slate-500 bg-slate-100 border-slate-200 hover:text-slate-700'
                : 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 font-bold shadow-xs'
            }`}
            title="Kembalikan ke periode default tahun berjalan (Januari – Oktober 2026)"
          >
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>Reset Default (2026)</span>
          </button>

          <div className="ml-auto text-[11px] text-slate-400 hidden lg:block">
            Periode aktif: <strong className="text-slate-700">{headerPeriodeLabel}</strong>
          </div>
        </div>
      </div>

      {/* 4 Variant Insight Cards (Tersinkronisasi Otomatis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Varian Volume Terbesar */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              VARIAN VOLUME TERBESAR
            </span>
            <Trophy className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-blue-950 truncate">
              {topVolVariant ? topVolVariant.label : '-'}
            </div>
            <div className="text-[11px] text-blue-700 mt-1 flex items-baseline gap-1">
              <span className="font-extrabold">{topVolVariant ? fmtKg(topVolVariant.bahanDiproses) : '-'} Kg</span>
              <span className="text-[10px] opacity-80">({topVolVariant ? topVolVariant.kapasitasPct : 0}% olah)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Varian Paling Hemat / Efisien */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              VARIAN PALING EFISIEN
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-950 truncate">
              {bestYieldVariant ? bestYieldVariant.label : '-'}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-baseline gap-1">
              <span>Susut Rata²:</span>
              <span className="font-extrabold text-emerald-900">
                {bestYieldVariant ? fmtPct(bestYieldVariant.susutRataPct) : '-'}%
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                Yield Terbaik
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Varian Susut Tertinggi */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              SUSUT TERTINGGI (WASPADA)
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-amber-950 truncate">
              {worstYieldVariant ? worstYieldVariant.label : '-'}
            </div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-baseline gap-1">
              <span>Susut Rata²:</span>
              <span className="font-extrabold text-amber-900">
                {worstYieldVariant ? fmtPct(worstYieldVariant.susutRataPct) : '-'}%
              </span>
              <span className="text-[10px] opacity-80">(Batas max 0,50%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Varian Terdata */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              TOTAL RESEP AKTIF
            </span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {displayMerkList.length} <span className="text-xs font-semibold text-slate-500">Varian Formula</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total olah: <span className="font-bold text-slate-800">{fmtKg(totalBahanMerk)} Kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Grafik Merk (Sinkron & Dilengkapi Pop-up Dinamis Bebas Halang) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: PERBANDINGAN SUSUT RATA-RATA ANTAR MERK */}
        <div
          ref={chart1Ref}
          onMouseMove={(e) => {
            if (!chart1Ref.current) return;
            const rect = chart1Ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setBarMousePos({ x, y, relativeY: y / rect.height });
          }}
          onMouseLeave={() => {
            setHoveredBarIdx(null);
            setBarMousePos(null);
          }}
          onClick={() =>
            onZoomChart(
              `Perbandingan Susut Rata-rata (%) Antar Merk (${headerPeriodeLabel})`,
              'bar_merk',
              displayMerkList
            )
          }
          className="bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all flex flex-col justify-between"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-700 transition">
                <Layers className="w-4 h-4 text-amber-500" />
                Perbandingan Susut Rata-rata (%) Antar Merk
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Diurutkan berdasarkan total bobot olah · {headerPeriodeLabel}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-800 bg-amber-50 group-hover:bg-amber-100 px-2 py-0.5 rounded-md transition">
                Klik untuk Expand ⤢
              </span>
              <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 relative select-none">
            <svg className="w-full h-full" viewBox={`0 0 500 ${chartHeight}`} preserveAspectRatio="none">
              {/* Zero/Baseline */}
              {(() => {
                const zeroY =
                  paddingTop + ((maxSusut - 0) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                return (
                  <line
                    x1={paddingLeft}
                    y1={zeroY}
                    x2={500 - paddingRight}
                    y2={zeroY}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                );
              })()}

              {(() => {
                const usableWidth = 500 - paddingLeft - paddingRight;
                const colW = usableWidth / Math.max(displayMerkList.length, 1);
                const barWidth = Math.min(colW * 0.55, 42);
                const zeroY =
                  paddingTop + ((maxSusut - 0) / susutRange) * (chartHeight - paddingTop - paddingBottom);

                return displayMerkList.map((m, idx) => {
                  const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                  const yVal =
                    paddingTop +
                    ((maxSusut - m.susutRataPct) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                  const isNegative = m.susutRataPct < 0;
                  const barH = Math.max(Math.abs(zeroY - yVal), 4);
                  const barY = isNegative ? zeroY : yVal;
                  const isHovered = hoveredBarIdx === idx;
                  const barColor = isNegative ? '#10b981' : m.susutRataPct > 0.5 ? '#e11d48' : '#1a56c4';

                  return (
                    <g
                      key={m.label}
                      onMouseEnter={() => setHoveredBarIdx(idx)}
                      className="cursor-pointer transition-opacity"
                    >
                      {/* Transparent hit area for easy hover */}
                      <rect
                        x={x - 4}
                        y={paddingTop}
                        width={barWidth + 8}
                        height={chartHeight - paddingTop - paddingBottom}
                        fill="transparent"
                      />

                      {/* Batang Utama */}
                      <rect
                        x={x}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill={barColor}
                        opacity={hoveredBarIdx !== null && !isHovered ? 0.45 : 1}
                        rx="3.5"
                        stroke={isHovered ? '#ffffff' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                      />

                      {/* Nilai persentase di atas/bawah batang */}
                      <text
                        x={x + barWidth / 2}
                        y={isNegative ? barY + barH + 11 : barY - 5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill={barColor}
                      >
                        {fmtPct(m.susutRataPct)}%
                      </text>

                      {/* Nama Merk */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHovered ? '#1e293b' : '#64748b'}
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {m.label.length > 9 ? `${m.label.substring(0, 8)}…` : m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>

            {/* Interactive Floating Dark Tooltip (Diposisikan Dinamis di Atas atau di Bawah Kursor) */}
            {activeBar && barMousePos && (() => {
              const containerW = chart1Ref.current?.clientWidth || 500;
              const containerH = chart1Ref.current?.clientHeight || chartHeight;
              const placeAbove = barMousePos.relativeY > 0.46;
              const badge = getPctBadgeClass(activeBar.item.susutRataPct);

              return (
                <div
                  className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                    activeBar.index <= 1
                      ? 'translate-x-0'
                      : activeBar.index >= displayMerkList.length - 2
                      ? '-translate-x-full'
                      : '-translate-x-1/2'
                  } ${placeAbove ? '-translate-y-full mb-3' : 'translate-y-0 mt-3'}`}
                  style={{
                    left: `${Math.max(12, Math.min(barMousePos.x, containerW - 12))}px`,
                    top: placeAbove
                      ? `${Math.max(10, barMousePos.y - 14)}px`
                      : `${Math.min(containerH - 10, barMousePos.y + 14)}px`,
                  }}
                >
                  <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[220px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        🏷️ {activeBar.item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fmtInt(activeBar.item.jumlahData)} Camp
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-300 font-medium">Susut Rata²:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-300 font-black text-sm">
                          {fmtPct(activeBar.item.susutRataPct)}%
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Bahan Diproses</div>
                        <div className="font-semibold text-cyan-300">{fmtKg(activeBar.item.bahanDiproses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Hasil Jadi</div>
                        <div className="font-semibold text-emerald-300">{fmtKg(activeBar.item.hasilProses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Selisih Susut</div>
                        <div className="font-semibold text-rose-300">{fmtKg(activeBar.item.susutKg)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Porsi Produksi</div>
                        <div className="font-semibold text-amber-300">{fmtPct(activeBar.item.kapasitasPct)}% olah</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* CHART 2: TREND SATU MERK PER BULAN (Sinkron Rentang Bulan Terpilih) */}
        <div
          ref={chart2Ref}
          onMouseMove={(e) => {
            if (!chart2Ref.current) return;
            const rect = chart2Ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setPointMousePos({ x, y, relativeY: y / rect.height });
          }}
          onMouseLeave={() => {
            setHoveredPointIdx(null);
            setPointMousePos(null);
          }}
          onClick={() =>
            onZoomChart(
              `Trend Susut per Bulan — ${selectedTrendMerk} (${headerPeriodeLabel})`,
              'line_trend_merk',
              currentTrendData
            )
          }
          className="bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all flex flex-col justify-between"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-700 transition">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                Trend Susut per Bulan — {selectedTrendMerk}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deret waktu {headerPeriodeLabel} · Pilih formula di dropdown
              </p>
            </div>

            <div className="flex items-center gap-1.5 no-print" onClick={(e) => e.stopPropagation()}>
              <select
                value={selectedTrendMerk}
                onChange={(e) => onSelectTrendMerk(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {activeAvailableMerks.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 relative select-none">
            {trendPoints.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Tidak ada data bulanan untuk merk ini pada periode {headerPeriodeLabel}
              </div>
            ) : (
              <svg className="w-full h-full" viewBox={`0 0 500 ${chartHeight}`} preserveAspectRatio="none">
                <line
                  x1={paddingLeft}
                  y1={chartHeight - paddingBottom}
                  x2={500 - paddingRight}
                  y2={chartHeight - paddingBottom}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {(() => {
                  const usableWidth = 500 - paddingLeft - paddingRight;
                  const step = usableWidth / Math.max(trendPoints.length - 1, 1);
                  const points = trendPoints
                    .map((d, i) => {
                      const x = paddingLeft + i * step;
                      const y =
                        paddingTop +
                        ((maxTrendSusut - d.susutRataPct) / trendRange) *
                          (chartHeight - paddingTop - paddingBottom);
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      {/* Polyline Curve */}
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        points={points}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Titik & Hit Area */}
                      {trendPoints.map((d, i) => {
                        const x = paddingLeft + i * step;
                        const y =
                          paddingTop +
                          ((maxTrendSusut - d.susutRataPct) / trendRange) *
                            (chartHeight - paddingTop - paddingBottom);
                        const isHovered = hoveredPointIdx === i;

                        return (
                          <g
                            key={d.label}
                            onMouseEnter={() => setHoveredPointIdx(i)}
                            className="cursor-pointer"
                          >
                            {/* Hit Area vertikal */}
                            <rect
                              x={x - 12}
                              y={paddingTop}
                              width={24}
                              height={chartHeight - paddingTop - paddingBottom}
                              fill="transparent"
                            />

                            {/* Garis vertikal pemandu saat hover */}
                            {isHovered && (
                              <line
                                x1={x}
                                y1={paddingTop}
                                x2={x}
                                y2={chartHeight - paddingBottom}
                                stroke="#f59e0b"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                            )}

                            {/* Circle Dot */}
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 5.5 : 3.5}
                              fill={isHovered ? '#b45309' : '#d97706'}
                              stroke="#ffffff"
                              strokeWidth={isHovered ? 2 : 1.5}
                            />

                            {/* Nilai persentase */}
                            <text
                              x={x}
                              y={y - 7}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#92400e"
                              fontWeight="bold"
                            >
                              {fmtPct(d.susutRataPct)}%
                            </text>

                            {/* Label Bulan */}
                            <text
                              x={x}
                              y={chartHeight - 12}
                              textAnchor="middle"
                              fontSize="9"
                              fill={isHovered ? '#1e293b' : '#64748b'}
                              fontWeight={isHovered ? 'bold' : 'normal'}
                            >
                              {d.bulan.substring(0, 3)}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}

            {/* Interactive Floating Dark Tooltip (Diposisikan Dinamis di Atas atau di Bawah Kursor) */}
            {activePoint && pointMousePos && (() => {
              const containerW = chart2Ref.current?.clientWidth || 500;
              const containerH = chart2Ref.current?.clientHeight || chartHeight;
              const placeAbove = pointMousePos.relativeY > 0.46;

              return (
                <div
                  className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                    activePoint.index <= 1
                      ? 'translate-x-0'
                      : activePoint.index >= trendPoints.length - 2
                      ? '-translate-x-full'
                      : '-translate-x-1/2'
                  } ${placeAbove ? '-translate-y-full mb-3' : 'translate-y-0 mt-3'}`}
                  style={{
                    left: `${Math.max(12, Math.min(pointMousePos.x, containerW - 12))}px`,
                    top: placeAbove
                      ? `${Math.max(10, pointMousePos.y - 14)}px`
                      : `${Math.min(containerH - 10, pointMousePos.y + 14)}px`,
                  }}
                >
                  <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[210px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                      <span className="font-bold text-slate-100">
                        📅 {activePoint.data.bulan} {activePoint.data.tahun || tahunFilter}
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold truncate max-w-[100px]">
                        {selectedTrendMerk}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-300 font-medium">Susut Rata²:</span>
                      <span className="text-amber-300 font-black text-sm">
                        {fmtPct(activePoint.data.susutRataPct)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Bahan Diproses</div>
                        <div className="font-semibold text-cyan-300">{fmtKg(activePoint.data.bahanDiproses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Hasil Jadi</div>
                        <div className="font-semibold text-emerald-300">{fmtKg(activePoint.data.hasilProses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800 col-span-2 flex items-center justify-between">
                        <span className="text-slate-400 text-[9.5px]">Status Toleransi</span>
                        <span className={`font-bold ${activePoint.data.susutRataPct <= 0.50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {activePoint.data.susutRataPct <= 0.50 ? '✅ Normal (≤ 0.50%)' : '⚠️ Evaluasi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* TABEL REKAP MERK (Sinkron dengan Filter Periode Aktif) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi per Merk</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filtered.length} Merk Terdata
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              Periode: {headerPeriodeLabel}
            </span>
          </div>

          <div className="relative no-print">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari merk / formula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-40 sm:w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px] text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Merk / Formula Blend</th>
                <th className="py-2.5 px-3 text-right">Jumlah Data</th>
                <th className="py-2.5 px-3 text-right">Bahan Diproses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil Proses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut Rata² (%)</th>
                <th className="py-2.5 px-3 text-right">Kapasitas BDP (%)</th>
                <th className="py-2.5 px-3 text-center">Status Toleransi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const badge = getPctBadgeClass(item.susutRataPct);
                const isSelected = item.label === selectedTrendMerk;

                return (
                  <tr
                    key={item.label}
                    onClick={() => onSelectTrendMerk(item.label)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                    title="Klik untuk menampilkan grafik tren bulanan merk ini di samping"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full transition-transform ${
                          isSelected ? 'bg-amber-500 scale-125' : 'bg-slate-300'
                        }`}
                      ></span>
                      <span>{item.label}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold ml-1">
                          Aktif di Grafik
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                      {fmtInt(item.jumlahData)} Camp
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-900">
                      {fmtKg(item.bahanDiproses)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-900">
                      {fmtKg(item.hasilProses)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {fmtKg(item.susutKg)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                      {fmtPct(item.susutRataPct)} %
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {fmtPct(item.kapasitasPct)} %
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.color} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
