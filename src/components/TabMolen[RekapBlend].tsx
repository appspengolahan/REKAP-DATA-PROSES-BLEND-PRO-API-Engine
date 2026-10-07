import React, { useState } from 'react';
import { RekapMolenItem } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtSuhu, fmtInt, getPctBadgeClass, MONTH_ORDER } from '../api[RekapBlend]';
import {
  FileText,
  Search,
  Maximize2,
  Cpu,
  Thermometer,
  Layers,
  Settings,
} from 'lucide-react';

interface TabMolenProps {
  data: RekapMolenItem[];
  selectedBulan: string;
  onBulanChange: (bulan: string) => void;
  onExportPdf: () => void;
  onZoomChart: (title: string, chartType: 'bar_molen', data: any) => void;
}

export const TabMolenRekapBlend: React.FC<TabMolenProps> = ({
  data,
  selectedBulan,
  onBulanChange,
  onExportPdf,
  onZoomChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = data.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartHeight = 270;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxSusut = Math.max(...data.map((m) => m.susutRataPct), 0.45);
  const minSusut = Math.min(...data.map((m) => m.susutRataPct), 0);
  const susutRange = maxSusut - minSusut || 1;

  return (
    <div className="space-y-5">
      {/* Top Bar with Month Subfilter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Kinerja Telemetri Mesin Pencampur (Molen Blend)
          </h3>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-slate-500 font-medium">Bulan:</span>
            <select
              value={selectedBulan}
              onChange={(e) => onBulanChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Bulan</option>
              {MONTH_ORDER.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onExportPdf}
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>📄 Export Tab Ini (PDF)</span>
        </button>
      </div>

      {/* Grafik Perbandingan Molen (Clickable to Maximize) */}
      <div
        onClick={() =>
          onZoomChart('Perbandingan Susut Rata-rata (%) Antar Molen', 'bar_molen', data)
        }
        className="bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs relative group cursor-pointer transition-all"
        title="Klik untuk memperbesar grafik ke tengah layar"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-purple-700 transition">
              <Cpu className="w-4 h-4 text-purple-600" />
              Perbandingan Susut Rata-rata (%) Antar Molen
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Efisiensi mekanis dan kesusutan masing-masing unit</p>
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

            {(() => {
              const usableWidth = 500 - paddingLeft - paddingRight;
              const colW = usableWidth / Math.max(data.length, 1);
              const barWidth = Math.min(colW * 0.45, 50);

              return data.map((m, idx) => {
                const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                const h =
                  ((m.susutRataPct - minSusut) / susutRange) * (chartHeight - paddingTop - paddingBottom);
                const y = chartHeight - paddingBottom - Math.max(h, 4);

                return (
                  <g key={m.label}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(h, 4)}
                      fill="#7c3aed"
                      rx="3"
                    />
                    {/* Nilai persentase */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="bold"
                      fill="#6d28d9"
                    >
                      {fmtPct(m.susutRataPct)}%
                    </text>
                    {/* Label Molen */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontWeight="600"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>
      </div>

      {/* TABEL REKAP MOLEN */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi per Molen</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filtered.length} Unit Molen
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
                <th className="py-2.5 px-3 text-center">Status</th>
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
