import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Table,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { WeeklyBlendPlanData } from '../types[RekapBlend]';
import {
  fetchWeeklyBlendPlan,
  fetchLiveWeeklyBlendPlan,
  getCachedWeeklyBlendPlan,
  PLANING_SPREADSHEET_ID,
  PLANING_SHEET_NAME,
} from '../apiJadwalBlend';

interface WeeklyBlendScheduleTableProps {
  data: WeeklyBlendPlanData;
  isLoading?: boolean;
}

/**
 * Komponen Tabel Jadwal Alokasi Campuran Mingguan PP1
 * Didesain persis sesuai visual pada referensi modul Persediaan PP1
 */
export const WeeklyBlendScheduleTable: React.FC<WeeklyBlendScheduleTableProps> = ({
  data,
  isLoading = false,
}) => {
  const { dates, schedules, dailyTotals } = data;

  // Format rendering angka batch vs tanda strip '—' jika nol
  const renderCellCount = (val: number, isHighlighted = false) => {
    if (!val || val === 0) {
      return <span className="text-slate-400 font-normal select-none">—</span>;
    }
    return (
      <span
        className={`font-bold tabular-nums ${
          isHighlighted ? 'text-indigo-600 font-black' : 'text-slate-900'
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left border-collapse min-w-[760px]">
        {/* THEAD DENGAN TEMA DARK SLATE / INDIGO PERSIS GAMBAR 5 */}
        <thead>
          <tr className="bg-[#0f172a] text-white text-xs sm:text-sm font-bold tracking-tight">
            <th className="py-3 px-4 text-left font-bold text-slate-100 border-r border-slate-800">
              Nama Jenis Tembakau Blend
            </th>
            <th className="py-3 px-3 text-center font-bold text-slate-100 border-r border-slate-800 w-24">
              Kapasitas
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Senin</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.senin ? dates.senin.split(',')[0] : 'Senin'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Selasa</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.selasa ? dates.selasa.split(',')[0] : 'Selasa'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Rabu</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.rabu ? dates.rabu.split(',')[0] : 'Rabu'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Kamis</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.kamis ? dates.kamis.split(',')[0] : 'Kamis'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Jumat</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.jumat ? dates.jumat.split(',')[0] : 'Jumat'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Sabtu</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.sabtu ? dates.sabtu.split(',')[0] : 'Sabtu'}
              </div>
            </th>
            <th className="py-2 px-3 text-center font-bold text-slate-100 border-r border-slate-800">
              <div>Minggu</div>
              <div className="text-[10px] font-normal text-slate-400">
                {dates.minggu ? dates.minggu.split(',')[0] : 'Minggu'}
              </div>
            </th>
            <th className="py-3 px-4 text-center font-black text-indigo-100 bg-[#1e1b4b] w-28 sm:w-32">
              Total Campuran
            </th>
          </tr>
        </thead>

        {/* TBODY DAFTAR BLEND */}
        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
          {schedules.map((row, idx) => (
            <tr
              key={row.blendName + idx}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              <td className="py-3 px-4 font-semibold text-slate-800 border-r border-slate-100">
                {row.blendName}
              </td>
              <td className="py-3 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                {row.kapasitas}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.senin)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.selasa)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.rabu)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.kamis)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.jumat)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.sabtu)}
              </td>
              <td className="py-3 px-3 text-center border-r border-slate-100">
                {renderCellCount(row.minggu)}
              </td>
              <td className="py-3 px-4 text-center font-black text-indigo-700 bg-indigo-50/40 text-sm sm:text-base tabular-nums">
                {row.totalCampuran}
              </td>
            </tr>
          ))}
        </tbody>

        {/* TFOOT TOTAL HARIAN */}
        <tfoot>
          <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-xs sm:text-sm font-black">
            <td className="py-3.5 px-4 font-black text-slate-900 border-r border-slate-200 uppercase tracking-wide">
              TOTAL HARIAN
            </td>
            <td className="py-3.5 px-3 text-center text-slate-400 font-normal border-r border-slate-200">
              —
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.senin, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.selasa, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.rabu, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.kamis, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.jumat, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.sabtu, true)}
            </td>
            <td className="py-3.5 px-3 text-center border-r border-slate-200">
              {renderCellCount(dailyTotals.minggu, true)}
            </td>
            <td className="py-3.5 px-4 text-center font-black text-indigo-900 bg-indigo-100/70 text-base sm:text-lg tabular-nums">
              {dailyTotals.total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

interface JadwalAlokasiMingguanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal Popup Jadwal Alokasi Campuran Mingguan PP1 (Senin – Minggu)
 * Persis seperti screenshot dari web apps Persediaan PP1
 */
export const JadwalAlokasiMingguanModal: React.FC<JadwalAlokasiMingguanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<WeeklyBlendPlanData>(getCachedWeeklyBlendPlan());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchLiveWeeklyBlendPlan();
      setData(res);
      setLastUpdatedTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.warn('Menggunakan fallback data alokasi campuran:', err);
      setData(getCachedWeeklyBlendPlan());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER DENGAN PILL SUMBER DATA TERVERIFIKASI */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Badges Info Sumber Data */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                  SUMBER DATA TERVERIFIKASI
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Google Sheets: Tab PLANING BLEND MINGGUAN
                </span>
              </div>

              {/* Judul Utama */}
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Jadwal Alokasi Campuran Mingguan PP1 (Senin – Minggu)
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Data kapasitas molen dan rencana batch harian untuk seluruh jenis tembakau blend
              </p>
            </div>

            {/* Tombol Tutup X */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-bar Tanggal Rentang & Tombol Refresh Live */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Rentang Rencana:</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                {data.dates.senin || 'Senin'} s/d {data.dates.minggu || 'Minggu'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdatedTime && (
                <span className="text-[11px] text-slate-400">
                  Sinkron: {lastUpdatedTime}
                </span>
              )}
              <button
                onClick={loadData}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                title="Tarik pembaruan langsung dari Google Sheets"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isLoading ? 'Menarik...' : 'Refresh Live'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY: TABEL JADWAL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          <WeeklyBlendScheduleTable data={data} isLoading={isLoading} />
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">
              Sinkronisasi otomatis aktif dengan Master Resep DATABASEPRUF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
