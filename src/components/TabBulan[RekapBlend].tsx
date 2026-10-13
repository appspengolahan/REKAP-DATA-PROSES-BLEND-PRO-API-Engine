import React, { useState } from 'react';
import { RekapBulanItem } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtSuhu, fmtInt, getPctBadgeClass, MONTH_ORDER } from '../api[RekapBlend]';
import {
  FileText,
  Search,
  Maximize2,
  TrendingDown,
  BarChart2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Scale,
  Thermometer,
  Sparkles,
} from 'lucide-react';
import { TrenSusutChartRekapBlend } from './TrenSusutChart[RekapBlend]';
import { BarBahanHasilChartRekapBlend } from './BarBahanHasilChart[RekapBlend]';

interface TabBulanProps {
  data: RekapBulanItem[];
  onExportPdf: () => void;
  onZoomChart: (title: string, chartType: 'line_susut' | 'bar_bahan_hasil', data: any) => void;
}

export const TabBulanRekapBlend: React.FC<TabBulanProps> = ({
  data,
  onExportPdf,
  onZoomChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'bulan_desc' | 'bulan_asc' | 'bobot' | 'susutPct'>('bulan_desc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Sort
  const filtered = [...data].filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered.sort((a, b) => {
    if (sortBy === 'bobot') {
      return sortOrder === 'asc'
        ? a.bahanDiproses - b.bahanDiproses
        : b.bahanDiproses - a.bahanDiproses;
    }
    if (sortBy === 'susutPct') {
      return sortOrder === 'asc'
        ? a.susutRataPct - b.susutRataPct
        : b.susutRataPct - a.susutRataPct;
    }
    if (sortBy === 'bulan_asc') {
      const yearDiff = Number(a.tahun || 0) - Number(b.tahun || 0);
      if (yearDiff !== 0) return yearDiff;
      return MONTH_ORDER.indexOf(a.bulan) - MONTH_ORDER.indexOf(b.bulan);
    }
    // Default ('bulan_desc'): Periode bulan terbaru berada di posisi atas, terlama di paling bawah
    const yearDiff = Number(b.tahun || 0) - Number(a.tahun || 0);
    if (yearDiff !== 0) return yearDiff;
    return MONTH_ORDER.indexOf(b.bulan) - MONTH_ORDER.indexOf(a.bulan);
  });

  // Time-Series Key Insights (Analisis Deret Waktu Khusus)
  const sortedByEfficiency = [...data].sort((a, b) => a.susutRataPct - b.susutRataPct);
  const bestMonth = sortedByEfficiency[0];
  const worstMonth = sortedByEfficiency[sortedByEfficiency.length - 1];
  const totalBahan = data.reduce((acc, d) => acc + d.bahanDiproses, 0);
  const totalHasil = data.reduce((acc, d) => acc + d.hasilProses, 0);
  const validSuhu = data.filter((d) => d.suhuRata !== null).map((d) => d.suhuRata as number);
  const avgSuhu = validSuhu.length ? validSuhu.reduce((a, b) => a + b, 0) / validSuhu.length : 29.3;

  return (
    <div className="space-y-5">
      {/* Tab Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Kinerja Deret Waktu Bulanan (Januari – Oktober 2026)
          </h3>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2">
            💡 Analisis tren fluktuasi mutu dan akumulasi per bulan
          </span>
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

      {/* 4 Time-Series Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Bulan Paling Efisien */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              BULAN PALING HEMAT
            </span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-950 flex items-baseline gap-1.5">
              <span>{bestMonth ? bestMonth.bulan : '-'}</span>
              <span className="text-sm font-extrabold text-emerald-700">
                ({bestMonth ? fmtPct(bestMonth.susutRataPct) : '-'}%)
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Kesusutan terendah tahun ini
            </div>
          </div>
        </div>

        {/* Card 2: Bulan Susut Tertinggi */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              BULAN SUSUT TERTINGGI
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-950 flex items-baseline gap-1.5">
              <span>{worstMonth ? worstMonth.bulan : '-'}</span>
              <span className="text-sm font-extrabold text-amber-700">
                ({worstMonth ? fmtPct(worstMonth.susutRataPct) : '-'}%)
              </span>
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Peak loss bulanan (tetap di bawah 0,50%)
            </div>
          </div>
        </div>

        {/* Card 3: Total Olah Bulanan */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              AKUMULASI TOTAL BAHAN
            </span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-blue-950 flex items-baseline gap-1">
              <span className="truncate">{fmtKg(totalBahan)}</span>
              <span className="text-xs font-bold text-blue-700">Kg</span>
            </div>
            <div className="text-[11px] text-blue-700 mt-1">
              Hasil jadi: {fmtKg(totalHasil)} Kg
            </div>
          </div>
        </div>

        {/* Card 4: Suhu Rata-rata */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              SUHU RATA² TELEMETRI
            </span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{fmtSuhu(avgSuhu)}</span>
              <span className="text-xs font-bold text-slate-500">°C</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Suhu ruang molen campur stabil
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Grafik Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: TREN SUSUT % (Model Grafik Garis Sesuai Gambar Referensi) */}
        <TrenSusutChartRekapBlend
          data={data}
          onExpand={() => onZoomChart('Tren Susut Rata-rata (%) per Bulan', 'line_susut', data)}
        />

        {/* CHART 2: BAHAN DIPROSES VS HASIL PROSES (Grafik Balok dengan Pop Up Dinamis di Atas/Bawah Kursor) */}
        <BarBahanHasilChartRekapBlend
          data={data}
          onExpand={() =>
            onZoomChart(
              'Perbandingan Bahan Diproses vs Hasil Proses (Kg)',
              'bar_bahan_hasil',
              data
            )
          }
        />
      </div>

      {/* TABEL REKAP BULANAN */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Tabel Rekapitulasi per Bulan</h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filtered.length} Bulan
            </span>
          </div>

          <div className="flex items-center gap-2 no-print">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari bulan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-48"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="bulan_desc">Urutan Bulan (Terbaru di Atas)</option>
              <option value="bulan_asc">Urutan Bulan (Terlama di Atas)</option>
              <option value="bobot">Volume Baku (Kg)</option>
              <option value="susutPct">% Susut</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Jumlah Data</th>
                <th className="py-2.5 px-3 text-right">Bahan Diproses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil Proses (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut Rata² (%)</th>
                <th className="py-2.5 px-3 text-right">Min (%)</th>
                <th className="py-2.5 px-3 text-right">Max (%)</th>
                <th className="py-2.5 px-3 text-right">Suhu (°C)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const badge = getPctBadgeClass(item.susutRataPct);
                return (
                  <tr key={item.label} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.label}</td>
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
                    <td className="py-2.5 px-3 text-right text-slate-500">{fmtPct(item.susutMinPct)} %</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{fmtPct(item.susutMaxPct)} %</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {item.suhuRata !== null ? `${fmtSuhu(item.suhuRata)} °C` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.color} ${badge.border}`}
                      >
                        {item.susutRataPct > 0.5 ? (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        ) : (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        )}
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
