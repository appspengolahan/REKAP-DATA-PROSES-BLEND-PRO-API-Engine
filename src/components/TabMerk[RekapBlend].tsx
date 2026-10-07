import React, { useState } from 'react';
import { RekapMerkItem, TrendMerkData } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtInt, getPctBadgeClass } from '../api[RekapBlend]';
import {
  FileText,
  Search,
  Maximize2,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  Trophy,
  AlertTriangle,
  Scale,
  FlaskConical,
} from 'lucide-react';

interface TabMerkProps {
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
  periodeLabel,
  merkList,
  trendMerk,
  availableMerks,
  selectedTrendMerk,
  onSelectTrendMerk,
  onExportPdf,
  onZoomChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = merkList.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartHeight = 270;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Chart 1: Susut per Merk
  const maxSusut = Math.max(...merkList.map((m) => m.susutRataPct), 0.45);
  const minSusut = Math.min(...merkList.map((m) => m.susutRataPct), -0.15);
  const susutRange = maxSusut - minSusut || 1;

  // Chart 2: Trend satu Merk
  const trendPoints = trendMerk.data;
  const maxTrendSusut = Math.max(...trendPoints.map((d) => d.susutRataPct), 0.4);
  const minTrendSusut = Math.min(...trendPoints.map((d) => d.susutRataPct), -0.15);
  const trendRange = maxTrendSusut - minTrendSusut || 1;

  // 3. Variant / Resep Key Insights (Analisis Khusus Resep Blend)
  const sortedByVol = [...merkList].sort((a, b) => b.bahanDiproses - a.bahanDiproses);
  const topVolVariant = sortedByVol[0];
  const sortedByEfficiency = [...merkList].sort((a, b) => a.susutRataPct - b.susutRataPct);
  const bestYieldVariant = sortedByEfficiency[0];
  const worstYieldVariant = sortedByEfficiency[sortedByEfficiency.length - 1];
  const totalBahanMerk = merkList.reduce((acc, m) => acc + m.bahanDiproses, 0);

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">
            Katalog Jenis Resep & Efisiensi Bahan Blend
          </h3>
          <span className="text-xs bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
            {periodeLabel}
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2">
            💡 Peringkat efisiensi rendemen dan kontribusi volume per formula
          </span>
        </div>

        <button
          onClick={onExportPdf}
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>📄 Export Tab Ini (PDF)</span>
        </button>
      </div>

      {/* 4 Variant Insight Cards */}
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
              {merkList.length} <span className="text-xs font-semibold text-slate-500">Varian Formula</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Total olah: {fmtKg(totalBahanMerk)} Kg
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Grafik Merk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: PERBANDINGAN SUSUT RATA-RATA ANTAR MERK (Clickable to Maximize) */}
        <div
          onClick={() =>
            onZoomChart('Perbandingan Susut Rata-rata (%) Antar Merk', 'bar_merk', merkList)
          }
          className="bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-700 transition">
                <Layers className="w-4 h-4 text-amber-500" />
                Perbandingan Susut Rata-rata (%) Antar Merk
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Diurutkan berdasarkan total bobot olah</p>
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
                const colW = usableWidth / Math.max(merkList.length, 1);
                const barWidth = Math.min(colW * 0.55, 42);
                const zeroY =
                  paddingTop + ((maxSusut - 0) / susutRange) * (chartHeight - paddingTop - paddingBottom);

                return merkList.map((m, idx) => {
                  const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                  const yVal =
                    paddingTop +
                    ((maxSusut - m.susutRataPct) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                  const isNegative = m.susutRataPct < 0;
                  const barH = Math.max(Math.abs(zeroY - yVal), 4);
                  const barY = isNegative ? zeroY : yVal;
                  const barColor = isNegative ? '#10b981' : m.susutRataPct > 0.5 ? '#e11d48' : '#1a56c4';

                  return (
                    <g key={m.label}>
                      <rect
                        x={x}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill={barColor}
                        rx="3.5"
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
                        fill="#64748b"
                        className="font-medium"
                      >
                        {m.label.length > 9 ? `${m.label.substring(0, 8)}…` : m.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        </div>

        {/* CHART 2: TREND SATU MERK PER BULAN (Clickable to Maximize) */}
        <div
          onClick={() =>
            onZoomChart(
              `Trend Susut per Bulan — ${selectedTrendMerk}`,
              'line_trend_merk',
              trendMerk
            )
          }
          className="bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all"
          title="Klik untuk memperbesar grafik ke tengah layar"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-700 transition">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                Trend Susut per Bulan — {selectedTrendMerk}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Pilih merk di samping untuk evaluasi deret waktu</p>
            </div>

            <div className="flex items-center gap-1.5 no-print" onClick={(e) => e.stopPropagation()}>
              <select
                value={selectedTrendMerk}
                onChange={(e) => onSelectTrendMerk(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {availableMerks.map((m) => (
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
                Tidak ada data bulanan untuk merk ini
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
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        points={points}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {trendPoints.map((d, i) => {
                        const x = paddingLeft + i * step;
                        const y =
                          paddingTop +
                          ((maxTrendSusut - d.susutRataPct) / trendRange) *
                            (chartHeight - paddingTop - paddingBottom);

                        return (
                          <g key={d.label}>
                            <circle
                              cx={x}
                              cy={y}
                              r="3.5"
                              fill="#d97706"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                            <text
                              x={x}
                              y={y - 6}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#92400e"
                              fontWeight="bold"
                            >
                              {fmtPct(d.susutRataPct)}%
                            </text>
                            <text
                              x={x}
                              y={chartHeight - 12}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#64748b"
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
          </div>
        </div>
      </div>

      {/* TABEL REKAP MERK */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi per Merk</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filtered.length} Merk Terdata
            </span>
          </div>

          <div className="relative no-print">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari merk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-36 sm:w-48"
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
                      isSelected ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                      ></span>
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
