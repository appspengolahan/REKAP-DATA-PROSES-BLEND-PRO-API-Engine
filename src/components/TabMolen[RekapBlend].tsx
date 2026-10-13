import React, { useState, useMemo, useRef } from 'react';
import { RekapMolenItem, RawBlendRow } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtSuhu, fmtInt, getPctBadgeClass, MONTH_ORDER, computeRekapMolen } from '../api[RekapBlend]';
import {
  FileText,
  Search,
  Maximize2,
  Cpu,
  Thermometer,
  Layers,
  Settings,
  Filter,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertTriangle,
  Scale,
  Gauge,
  BarChart2,
} from 'lucide-react';

interface TabMolenProps {
  allRows?: RawBlendRow[];
  data: RekapMolenItem[];
  onExportPdf: () => void;
  onZoomChart: (title: string, chartType: 'bar_molen', data: any) => void;
}

export const TabMolenRekapBlend: React.FC<TabMolenProps> = ({
  allRows = [],
  data: fallbackData,
  onExportPdf,
  onZoomChart,
}) => {
  // 1. Available Years dari dataset (dengan default 2026 & 2025)
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    if (allRows && allRows.length > 0) {
      allRows.forEach((r) => {
        if (r.tahun) set.add(r.tahun);
      });
    }
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

  // Search filter tabel
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Hover states for Charts (Pop-up Dinamis Bebas Halang)
  const chart1Ref = useRef<HTMLDivElement>(null);
  const [hoveredMolenIdx, setHoveredMolenIdx] = useState<number | null>(null);
  const [molenMousePos, setMolenMousePos] = useState<{ x: number; y: number; relativeY: number } | null>(null);

  const chart2Ref = useRef<HTMLDivElement>(null);
  const [hoveredVolIdx, setHoveredVolIdx] = useState<number | null>(null);
  const [volMousePos, setVolMousePos] = useState<{ x: number; y: number; relativeY: number } | null>(null);

  // Label periode dinamis
  const headerPeriodeLabel = useMemo(() => {
    const thText = tahunFilter === 'Semua' ? 'Semua Tahun' : tahunFilter;
    if (bulanAwal === bulanAkhir) {
      return `${bulanAwal} ${thText}`;
    }
    return `${bulanAwal} – ${bulanAkhir} ${thText}`;
  }, [bulanAwal, bulanAkhir, tahunFilter]);

  // Tombol Reset Default (2026): Mengembalikan filter ke Januari – Oktober 2026
  const handleResetFilter = () => {
    setTahunFilter('2026');
    setBulanAwal('Januari');
    setBulanAkhir('Oktober');
  };

  // 3. SINKRONISASI OTOMATIS DATA PER MOLEN BERDASARKAN FILTER PERIODE
  const displayMolenList = useMemo(() => {
    return computeRekapMolen(
      allRows || [],
      tahunFilter,
      bulanAwal,
      bulanAkhir
    );
  }, [allRows, tahunFilter, bulanAwal, bulanAkhir]);

  // Filter tabel pencarian
  const filtered = displayMolenList.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartHeight = 270;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Chart 1: Susut per Molen
  const maxSusut = Math.max(...displayMolenList.map((m) => m.susutRataPct), 0.45);
  const minSusut = Math.min(...displayMolenList.map((m) => m.susutRataPct), 0);
  const susutRange = maxSusut - minSusut || 1;

  // Chart 2: Beban Bahan Diproses per Molen
  const maxBobot = Math.max(...displayMolenList.map((m) => m.bahanDiproses), 50000);
  const minBobot = 0;
  const bobotRange = maxBobot - minBobot || 1;

  // 4. KEY INSIGHTS MOLEN (SINKRON DENGAN PERIODE TERPILIH)
  const sortedByYield = [...displayMolenList].sort((a, b) => a.susutRataPct - b.susutRataPct);
  const bestMolen = sortedByYield[0];
  const worstMolen = sortedByYield[sortedByYield.length - 1];

  const sortedByVol = [...displayMolenList].sort((a, b) => b.bahanDiproses - a.bahanDiproses);
  const topVolMolen = sortedByVol[0];

  const totalBahanMolen = displayMolenList.reduce((acc, m) => acc + m.bahanDiproses, 0);
  const totalCampMolen = displayMolenList.reduce((acc, m) => acc + m.jumlahData, 0);

  const validSuhu = displayMolenList.filter((m) => m.suhuRata !== null).map((m) => m.suhuRata as number);
  const avgSuhuMolen = validSuhu.length ? validSuhu.reduce((a, b) => a + b, 0) / validSuhu.length : 29.6;

  // Active hover items
  const activeMolen = hoveredMolenIdx !== null && displayMolenList[hoveredMolenIdx] ? { item: displayMolenList[hoveredMolenIdx], index: hoveredMolenIdx } : null;
  const activeVol = hoveredVolIdx !== null && displayMolenList[hoveredVolIdx] ? { item: displayMolenList[hoveredVolIdx], index: hoveredVolIdx } : null;

  return (
    <div className="space-y-5">
      {/* Tab Top Bar & Period Filter Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Kinerja Telemetri Mesin Pencampur (Molen Blend)</span>
                <span className="text-xs bg-purple-50 border border-purple-200 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {headerPeriodeLabel}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {displayMolenList.length} Unit Mesin
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                💡 Evaluasi efisiensi mekanis, kesusutan, dan keseimbangan kapasitas per mesin pencampur sesuai rentang periode
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
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            <span>Filter Periode:</span>
          </div>

          {/* Bulan Awal */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Bulan Awal:</span>
            <select
              value={bulanAwal}
              onChange={(e) => setBulanAwal(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
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
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
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
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
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
                : 'text-purple-800 bg-purple-50 border-purple-300 hover:bg-purple-100 font-bold shadow-xs'
            }`}
            title="Kembalikan ke periode default tahun berjalan (Januari – Oktober 2026)"
          >
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Reset Default (2026)</span>
          </button>

          <div className="ml-auto text-[11px] text-slate-400 hidden lg:block">
            Periode aktif: <strong className="text-slate-700">{headerPeriodeLabel}</strong>
          </div>
        </div>
      </div>

      {/* 4 Molen Insight Cards (Tersinkronisasi Otomatis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Molen Paling Efisien */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              MOLEN PALING EFISIEN
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-950 truncate">
              {bestMolen ? bestMolen.label : '-'}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-baseline gap-1">
              <span>Susut Rata²:</span>
              <span className="font-extrabold text-emerald-900">
                {bestMolen ? fmtPct(bestMolen.susutRataPct) : '-'}%
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                Mekanik Terbaik
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Molen Volume Terbesar */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              VOLUME BEBAN TERBESAR
            </span>
            <Trophy className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-blue-950 truncate">
              {topVolMolen ? topVolMolen.label : '-'}
            </div>
            <div className="text-[11px] text-blue-700 mt-1 flex items-baseline gap-1">
              <span className="font-extrabold">{topVolMolen ? fmtKg(topVolMolen.bahanDiproses) : '-'} Kg</span>
              <span className="text-[10px] opacity-80">({topVolMolen ? topVolMolen.kapasitasPct : 0}% beban)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Molen Susut Tertinggi */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              SUSUT TERTINGGI (PERHATIAN)
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-amber-950 truncate">
              {worstMolen ? worstMolen.label : '-'}
            </div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-baseline gap-1">
              <span>Susut Rata²:</span>
              <span className="font-extrabold text-amber-900">
                {worstMolen ? fmtPct(worstMolen.susutRataPct) : '-'}%
              </span>
              <span className="text-[10px] opacity-80">(Batas max 0,50%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Rata-rata Telemetri Molen */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              TELEMETRI SUHU MESIN
            </span>
            <Thermometer className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{fmtSuhu(avgSuhuMolen)}</span>
              <span className="text-xs font-semibold text-slate-500">°C rata-rata</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total olah: <span className="font-bold text-slate-800">{fmtKg(totalBahanMolen)} Kg</span> ({fmtInt(totalCampMolen)} Camp)
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Grafik Molen (Sinkron & Dilengkapi Pop-up Dinamis Bebas Halang) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: PERBANDINGAN SUSUT RATA-RATA (%) ANTAR MOLEN */}
        <div
          ref={chart1Ref}
          onMouseMove={(e) => {
            if (!chart1Ref.current) return;
            const rect = chart1Ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMolenMousePos({ x, y, relativeY: y / rect.height });
          }}
          onMouseLeave={() => {
            setHoveredMolenIdx(null);
            setMolenMousePos(null);
          }}
          onClick={() =>
            onZoomChart(
              `Perbandingan Susut Rata-rata (%) Antar Molen (${headerPeriodeLabel})`,
              'bar_molen',
              displayMolenList
            )
          }
          className="bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all flex flex-col justify-between"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-purple-700 transition">
                <Cpu className="w-4 h-4 text-purple-600" />
                Perbandingan Susut Rata-rata (%) Antar Molen
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Efisiensi mekanis dan kesusutan masing-masing unit · {headerPeriodeLabel}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-bold text-purple-800 bg-purple-50 group-hover:bg-purple-100 px-2 py-0.5 rounded-md transition">
                Klik untuk Expand ⤢
              </span>
              <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 relative select-none">
            <svg className="w-full h-full" viewBox={`0 0 500 ${chartHeight}`} preserveAspectRatio="none">
              {/* Baseline */}
              <line
                x1={paddingLeft}
                y1={chartHeight - paddingBottom}
                x2={500 - paddingRight}
                y2={chartHeight - paddingBottom}
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Threshold line 0.50% jika dalam jangkauan */}
              {(() => {
                const threshPct = 0.50;
                if (threshPct <= maxSusut) {
                  const threshY =
                    chartHeight -
                    paddingBottom -
                    ((threshPct - minSusut) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                  return (
                    <g>
                      <line
                        x1={paddingLeft}
                        y1={threshY}
                        x2={500 - paddingRight}
                        y2={threshY}
                        stroke="#f43f5e"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={500 - paddingRight}
                        y={threshY - 3}
                        textAnchor="end"
                        fontSize="8.5"
                        fill="#f43f5e"
                        fontWeight="bold"
                      >
                        Batas Max 0,50%
                      </text>
                    </g>
                  );
                }
                return null;
              })()}

              {(() => {
                const usableWidth = 500 - paddingLeft - paddingRight;
                const colW = usableWidth / Math.max(displayMolenList.length, 1);
                const barWidth = Math.min(colW * 0.48, 52);

                return displayMolenList.map((m, idx) => {
                  const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                  const h =
                    ((m.susutRataPct - minSusut) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                  const y = chartHeight - paddingBottom - Math.max(h, 4);
                  const isHovered = hoveredMolenIdx === idx;
                  const barColor = m.susutRataPct > 0.5 ? '#e11d48' : '#7c3aed';

                  return (
                    <g
                      key={m.label}
                      onMouseEnter={() => setHoveredMolenIdx(idx)}
                      className="cursor-pointer transition-opacity"
                    >
                      {/* Transparent hit area */}
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
                        y={y}
                        width={barWidth}
                        height={Math.max(h, 4)}
                        fill={barColor}
                        opacity={hoveredMolenIdx !== null && !isHovered ? 0.45 : 1}
                        rx="3.5"
                        stroke={isHovered ? '#ffffff' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                      />

                      {/* Nilai persentase */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill={barColor}
                      >
                        {fmtPct(m.susutRataPct)}%
                      </text>

                      {/* Label Molen */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHovered ? '#1e293b' : '#64748b'}
                        fontWeight={isHovered ? 'bold' : '600'}
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>

            {/* Interactive Floating Dark Tooltip (Dinamis di Atas / Bawah Kursor) */}
            {activeMolen && molenMousePos && (() => {
              const containerW = chart1Ref.current?.clientWidth || 500;
              const containerH = chart1Ref.current?.clientHeight || chartHeight;
              const placeAbove = molenMousePos.relativeY > 0.46;
              const badge = getPctBadgeClass(activeMolen.item.susutRataPct);

              return (
                <div
                  className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                    activeMolen.index <= 1
                      ? 'translate-x-0'
                      : activeMolen.index >= displayMolenList.length - 2
                      ? '-translate-x-full'
                      : '-translate-x-1/2'
                  } ${placeAbove ? '-translate-y-full mb-3' : 'translate-y-0 mt-3'}`}
                  style={{
                    left: `${Math.max(12, Math.min(molenMousePos.x, containerW - 12))}px`,
                    top: placeAbove
                      ? `${Math.max(10, molenMousePos.y - 14)}px`
                      : `${Math.min(containerH - 10, molenMousePos.y + 14)}px`,
                  }}
                >
                  <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[220px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        ⚙️ {activeMolen.item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fmtInt(activeMolen.item.jumlahData)} Camp
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-300 font-medium">Susut Rata²:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-300 font-black text-sm">
                          {fmtPct(activeMolen.item.susutRataPct)}%
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Bahan Masuk</div>
                        <div className="font-semibold text-cyan-300">{fmtKg(activeMolen.item.bahanDiproses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Hasil Jadi</div>
                        <div className="font-semibold text-emerald-300">{fmtKg(activeMolen.item.hasilProses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Selisih Susut</div>
                        <div className="font-semibold text-rose-300">{fmtKg(activeMolen.item.susutKg)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Suhu Mesin</div>
                        <div className="font-semibold text-amber-300">
                          {activeMolen.item.suhuRata !== null ? `${fmtSuhu(activeMolen.item.suhuRata)} °C` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* CHART 2: DISTRIBUSI BEBAN BAHAN DIPROSES ANTAR MOLEN */}
        <div
          ref={chart2Ref}
          onMouseMove={(e) => {
            if (!chart2Ref.current) return;
            const rect = chart2Ref.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setVolMousePos({ x, y, relativeY: y / rect.height });
          }}
          onMouseLeave={() => {
            setHoveredVolIdx(null);
            setVolMousePos(null);
          }}
          onClick={() =>
            onZoomChart(
              `Perbandingan Beban Olah (Kg) Antar Molen (${headerPeriodeLabel})`,
              'bar_molen',
              displayMolenList
            )
          }
          className="bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all flex flex-col justify-between"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-blue-700 transition">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Distribusi Bahan Diproses (Kg) Antar Molen
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Keseimbangan utilisasi beban kerja per unit mesin · {headerPeriodeLabel}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-bold text-blue-800 bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded-md transition">
                Klik untuk Expand ⤢
              </span>
              <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72 relative select-none">
            <svg className="w-full h-full" viewBox={`0 0 500 ${chartHeight}`} preserveAspectRatio="none">
              {/* Baseline */}
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
                const colW = usableWidth / Math.max(displayMolenList.length, 1);
                const barWidth = Math.min(colW * 0.48, 52);

                return displayMolenList.map((m, idx) => {
                  const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                  const h =
                    ((m.bahanDiproses - minBobot) / bobotRange) * (chartHeight - paddingTop - paddingBottom);
                  const y = chartHeight - paddingBottom - Math.max(h, 4);
                  const isHovered = hoveredVolIdx === idx;
                  const barColor = '#2563eb';

                  return (
                    <g
                      key={`vol-${m.label}`}
                      onMouseEnter={() => setHoveredVolIdx(idx)}
                      className="cursor-pointer transition-opacity"
                    >
                      {/* Transparent hit area */}
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
                        y={y}
                        width={barWidth}
                        height={Math.max(h, 4)}
                        fill={barColor}
                        opacity={hoveredVolIdx !== null && !isHovered ? 0.45 : 1}
                        rx="3.5"
                        stroke={isHovered ? '#ffffff' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                      />

                      {/* Nilai Kg (dalam ribuan) */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill={barColor}
                      >
                        {Math.round(m.bahanDiproses / 1000)} rb
                      </text>

                      {/* Label Molen */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHovered ? '#1e293b' : '#64748b'}
                        fontWeight={isHovered ? 'bold' : '600'}
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>

            {/* Interactive Floating Dark Tooltip (Dinamis di Atas / Bawah Kursor) */}
            {activeVol && volMousePos && (() => {
              const containerW = chart2Ref.current?.clientWidth || 500;
              const containerH = chart2Ref.current?.clientHeight || chartHeight;
              const placeAbove = volMousePos.relativeY > 0.46;

              return (
                <div
                  className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                    activeVol.index <= 1
                      ? 'translate-x-0'
                      : activeVol.index >= displayMolenList.length - 2
                      ? '-translate-x-full'
                      : '-translate-x-1/2'
                  } ${placeAbove ? '-translate-y-full mb-3' : 'translate-y-0 mt-3'}`}
                  style={{
                    left: `${Math.max(12, Math.min(volMousePos.x, containerW - 12))}px`,
                    top: placeAbove
                      ? `${Math.max(10, volMousePos.y - 14)}px`
                      : `${Math.min(containerH - 10, volMousePos.y + 14)}px`,
                  }}
                >
                  <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[210px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        🏭 {activeVol.item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Porsi: {fmtPct(activeVol.item.kapasitasPct)}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-300 font-medium">Bahan Diproses:</span>
                      <span className="text-cyan-300 font-black text-sm">
                        {fmtKg(activeVol.item.bahanDiproses)} Kg
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Jumlah Camp</div>
                        <div className="font-semibold text-slate-200">{fmtInt(activeVol.item.jumlahData)} Camp</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-400 text-[9.5px]">Hasil Proses</div>
                        <div className="font-semibold text-emerald-300">{fmtKg(activeVol.item.hasilProses)} Kg</div>
                      </div>
                      <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800 col-span-2 flex items-center justify-between">
                        <span className="text-slate-400 text-[9.5px]">Susut Rata-rata</span>
                        <span className="font-bold text-amber-300">{fmtPct(activeVol.item.susutRataPct)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* TABEL REKAP MOLEN (Sinkron dengan Filter Periode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi per Molen</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filtered.length} Unit Molen
            </span>
            <span className="text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
              Periode: {headerPeriodeLabel}
            </span>
          </div>

          <div className="relative no-print">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari molen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 sm:w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[680px] text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Unit Molen</th>
                <th className="py-2.5 px-3 text-right">Jumlah Data</th>
                <th className="py-2.5 px-3 text-right">Bahan Diproses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil Proses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut Rata² (%)</th>
                <th className="py-2.5 px-3 text-right">Kapasitas (%)</th>
                <th className="py-2.5 px-3 text-right">Suhu (°C)</th>
                <th className="py-2.5 px-3 text-center">Status Toleransi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const badge = getPctBadgeClass(item.susutRataPct);

                return (
                  <tr key={item.label} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" />
                      <span>{item.label}</span>
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
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {item.suhuRata !== null ? `${fmtSuhu(item.suhuRata)} °C` : '-'}
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
