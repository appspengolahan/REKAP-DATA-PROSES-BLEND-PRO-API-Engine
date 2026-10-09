import React from 'react';
import { RingkasanData } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtSuhu, fmtInt, MONTH_ORDER } from '../api[RekapBlend]';
import {
  Calendar,
  Layers,
  Scale,
  TrendingDown,
  Thermometer,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SummaryCardsProps {
  tahunGlobal: string;
  onTahunGlobalChange: (t: string) => void;
  availableTahun: string[];
  bulanRingkasan: string;
  onBulanRingkasanChange: (b: string) => void;
  periodeAwal: { bulan: string; tahun: string };
  onPeriodeAwalChange: (p: { bulan: string; tahun: string }) => void;
  periodeAkhir: { bulan: string; tahun: string };
  onPeriodeAkhirChange: (p: { bulan: string; tahun: string }) => void;
  onApplyPeriode?: () => void;
  ringkasanTahunan: RingkasanData;
  ringkasanBulanan: RingkasanData;
  ringkasanPeriode: RingkasanData;
}

export const SummaryCardsRekapBlend: React.FC<SummaryCardsProps> = ({
  tahunGlobal,
  onTahunGlobalChange,
  availableTahun,
  bulanRingkasan,
  onBulanRingkasanChange,
  periodeAwal,
  onPeriodeAwalChange,
  periodeAkhir,
  onPeriodeAkhirChange,
  onApplyPeriode,
  ringkasanTahunan,
  ringkasanBulanan,
  ringkasanPeriode,
}) => {
  // Render grid 3 kolom x 2 baris agar seluruh angka muat lapang tanpa tumpang tindih
  const renderKpiGrid3x2 = (r: RingkasanData) => {
    const isSusutHigh = r.susutRataPct > 0.5;
    const isSusutLow = r.susutRataPct <= 0.15;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-3">
        {/* Baris 1 - Kartu 1: JUMLAH DATA */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            JUMLAH DATA
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black text-slate-900 mt-1.5 flex items-baseline whitespace-nowrap">
            <span>{fmtInt(r.jumlahData)}</span>
            <span className="text-[11px] font-semibold text-slate-500 ml-1.5">Camp</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Batch terproses</div>
        </div>

        {/* Baris 1 - Kartu 2: BAHAN BAKU */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            BAHAN BAKU
          </div>
          <div className="text-sm sm:text-[15px] lg:text-base xl:text-lg font-black tracking-tight text-blue-700 mt-1.5 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.bahanDiproses)}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Netto awal (1 dec)</div>
        </div>

        {/* Baris 1 - Kartu 3: HASIL JADI */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            HASIL JADI
          </div>
          <div className="text-sm sm:text-[15px] lg:text-base xl:text-lg font-black tracking-tight text-emerald-700 mt-1.5 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.hasilProses)}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-900 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Hasil proses (1 dec)</div>
        </div>

        {/* Baris 2 - Kartu 4: SUSUT RATA² */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between ${
            isSusutHigh
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : isSusutLow
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
            <span>SUSUT RATA²</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/70 border border-current/20">
              MIN/MAX
            </span>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black mt-1.5 flex items-baseline whitespace-nowrap">
            <span className="mr-1 text-sm">{r.susutRataPct < 0 ? '↗' : '↘'}</span>
            <span>{fmtPct(r.susutRataPct)}</span>
            <span className="text-xs font-bold ml-0.5">%</span>
          </div>
          <div className="text-[10px] sm:text-[11px] opacity-80 mt-1 truncate">
            Min {fmtPct(r.susutMinPct)}% · Max {fmtPct(r.susutMaxPct)}%
          </div>
        </div>

        {/* Baris 2 - Kartu 5: SUSUT PROSES (KG) */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>SUSUT PROSES (KG)</span>
          </div>
          <div className="text-sm sm:text-[15px] lg:text-base xl:text-lg font-black tracking-tight text-slate-800 mt-1.5 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.susutKg)}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Selisih Input-Output</div>
        </div>

        {/* Baris 2 - Kartu 6: SUHU RATA² */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>SUHU RATA²</span>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black text-sky-800 mt-1.5 flex items-baseline whitespace-nowrap">
            <span>{r.suhuRata !== null ? fmtSuhu(r.suhuRata) : '-'}</span>
            <span className="text-xs font-semibold text-sky-600 ml-1">°C</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">Telemetri Molen</div>
        </div>
      </div>
    );
  };

  // Render untuk Card Rentang Periode (Full Width)
  const renderKpiGridFullWidth = (r: RingkasanData) => {
    const isSusutHigh = r.susutRataPct > 0.5;
    const isSusutLow = r.susutRataPct <= 0.15;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-3">
        {/* 1. JUMLAH DATA */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            JUMLAH DATA
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-baseline whitespace-nowrap">
            <span>{fmtInt(r.jumlahData)}</span>
            <span className="text-[11px] font-semibold text-slate-500 ml-1">Camp</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Batch terproses</div>
        </div>

        {/* 2. BAHAN BAKU */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            BAHAN BAKU
          </div>
          <div className="text-sm sm:text-base font-black tracking-tight text-blue-700 mt-1 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.bahanDiproses)}</span>
            <span className="text-[10px] font-bold text-blue-900 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Netto awal (1 dec)</div>
        </div>

        {/* 3. HASIL JADI */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            HASIL JADI
          </div>
          <div className="text-sm sm:text-base font-black tracking-tight text-emerald-700 mt-1 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.hasilProses)}</span>
            <span className="text-[10px] font-bold text-emerald-900 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Hasil proses (1 dec)</div>
        </div>

        {/* 4. SUSUT RATA² */}
        <div
          className={`border rounded-xl p-3 flex flex-col justify-between ${
            isSusutHigh
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : isSusutLow
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
            <span>SUSUT RATA²</span>
            <span className="text-[9px] font-bold px-1 rounded bg-white/70 border border-current/20">
              MIN/MAX
            </span>
          </div>
          <div className="text-base sm:text-lg font-black mt-1 flex items-baseline whitespace-nowrap">
            <span className="mr-0.5 text-xs">{r.susutRataPct < 0 ? '↗' : '↘'}</span>
            <span>{fmtPct(r.susutRataPct)}</span>
            <span className="text-xs font-bold ml-0.5">%</span>
          </div>
          <div className="text-[10px] opacity-80 mt-0.5 truncate">
            Min {fmtPct(r.susutMinPct)}% · Max {fmtPct(r.susutMaxPct)}%
          </div>
        </div>

        {/* 5. SUSUT (KG) */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>SUSUT (KG)</span>
          </div>
          <div className="text-sm sm:text-base font-black tracking-tight text-slate-800 mt-1 flex items-baseline whitespace-nowrap">
            <span>{fmtKg(r.susutKg)}</span>
            <span className="text-[10px] font-bold text-slate-500 ml-1 shrink-0">Kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Selisih Input-Output</div>
        </div>

        {/* 6. SUHU RATA² */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>SUHU RATA²</span>
          </div>
          <div className="text-base sm:text-lg font-black text-sky-800 mt-1 flex items-baseline whitespace-nowrap">
            <span>{r.suhuRata !== null ? fmtSuhu(r.suhuRata) : '-'}</span>
            <span className="text-xs font-semibold text-sky-600 ml-1">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Telemetri Molen</div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4 mb-6">
      {/* Global Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Filter Tahun Global</div>
            <div className="text-[10px] text-slate-500">
              Mengatur cakupan data Rekap Tahunan, Bulanan & Telemetri Molen
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Tahun:</label>
          <select
            value={tahunGlobal}
            onChange={(e) => onTahunGlobalChange(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="Semua">Semua Tahun</option>
            {availableTahun
              .filter((t) => t !== 'Semua')
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Grid: Card Tahunan & Card Bulanan (Clean 3x2 Grid di masing-masing Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: REKAP TAHUNAN */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Rekap Tahunan</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">
                {ringkasanTahunan.periodeLabel}
              </span>
              <select
                value={tahunGlobal}
                onChange={(e) => onTahunGlobalChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer no-print"
              >
                <option value="Semua">Semua Tahun</option>
                {availableTahun
                  .filter((t) => t !== 'Semua')
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* 3 Columns x 2 Rows */}
          {renderKpiGrid3x2(ringkasanTahunan)}
        </div>

        {/* CARD 2: REKAP BULANAN */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Rekap Bulanan</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                {ringkasanBulanan.periodeLabel}
              </span>
              <select
                value={bulanRingkasan}
                onChange={(e) => onBulanRingkasanChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer no-print"
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

          {/* 3 Columns x 2 Rows */}
          {renderKpiGrid3x2(ringkasanBulanan)}
        </div>
      </div>

      {/* CARD 3: REKAP RENTANG PERIODE (CUSTOM FULL WIDTH) */}
      <div
        id="periodeCardAnchor"
        className="bg-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Rekap Rentang Periode{' '}
                <span className="font-normal text-xs text-slate-500">(Kuartalan / Periode Bebas)</span>
              </h2>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>🔗 Rentang ini otomatis mengatur tabel & matriks di tab</span>
              <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                Rekap per Merk
              </span>
            </div>
          </div>

          {/* Period Range Picker Controls */}
          <div className="flex items-center gap-2 flex-wrap no-print">
            <span className="text-xs text-slate-500 font-medium">Dari</span>
            <select
              value={periodeAwal.bulan}
              onChange={(e) => onPeriodeAwalChange({ ...periodeAwal, bulan: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              {MONTH_ORDER.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={periodeAwal.tahun}
              onChange={(e) => onPeriodeAwalChange({ ...periodeAwal, tahun: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              {availableTahun.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <span className="text-xs text-slate-500 font-medium">Sampai</span>
            <select
              value={periodeAkhir.bulan}
              onChange={(e) => onPeriodeAkhirChange({ ...periodeAkhir, bulan: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              {MONTH_ORDER.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={periodeAkhir.tahun}
              onChange={(e) => onPeriodeAkhirChange({ ...periodeAkhir, tahun: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              {availableTahun.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300/80 px-3 py-1 rounded-full">
            {ringkasanPeriode.periodeLabel}
          </span>
        </div>

        {/* Full width 6 cards dengan padding luas */}
        {renderKpiGridFullWidth(ringkasanPeriode)}
      </div>
    </section>
  );
};
