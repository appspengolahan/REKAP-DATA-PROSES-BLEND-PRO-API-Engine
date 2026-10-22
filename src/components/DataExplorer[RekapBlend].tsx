import React, { useState, useMemo } from 'react';
import { RawBlendRow, UserRole } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtSuhu, getPctBadgeClass } from '../api[RekapBlend]';
import {
  Database,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
} from 'lucide-react';

interface DataExplorerProps {
  rows: RawBlendRow[];
  currentRole: UserRole;
  onExportCsv: () => void;
}

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format tanggal dari "YYYY-MM-DD" menjadi "Hari, Tanggal Bulan Tahun"
 * Contoh: "2026-10-16" -> "Jumat, 16 Oktober 2026"
 */
export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month, day, 12, 0, 0);
      const dayName = NAMA_HARI[d.getDay()];
      const monthName = NAMA_BULAN[month] || parts[1];
      return `${dayName}, ${day} ${monthName} ${year}`;
    }
  }
  return dateStr;
}

export const DataExplorerRekapBlend: React.FC<DataExplorerProps> = ({
  rows,
  currentRole,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerk, setSelectedMerk] = useState('Semua');
  const [selectedMolen, setSelectedMolen] = useState('Semua');
  // Default sort: 'desc' (data terbaru di posisi paling atas, data terlama di posisi paling bawah)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const merks = useMemo(
    () => Array.from(new Set(rows.map((r) => r.merk))).filter(Boolean).sort(),
    [rows]
  );
  const molens = useMemo(
    () => Array.from(new Set(rows.map((r) => r.molen))).filter(Boolean).sort(),
    [rows]
  );

  // 1. Filter rows
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (selectedMerk !== 'Semua' && r.merk !== selectedMerk) return false;
      if (selectedMolen !== 'Semua' && r.molen !== selectedMolen) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTanggal = r.tanggal && r.tanggal.toLowerCase().includes(term);
        const formattedTgl = formatTanggalLengkap(r.tanggal).toLowerCase();
        const matchFormattedTanggal = formattedTgl.includes(term);
        const matchMerk = r.merk && r.merk.toLowerCase().includes(term);
        const matchNoMolen = r.noMolen !== undefined && String(r.noMolen).toLowerCase().includes(term);
        const matchMolen = r.molen && r.molen.toLowerCase().includes(term);
        const matchMolenDetail = r.molenDetail && r.molenDetail.toLowerCase().includes(term);
        const matchRow = String(r.srcRow).includes(term);
        const matchBulan = r.bulan && r.bulan.toLowerCase().includes(term);
        const matchTahun = r.tahun && String(r.tahun).includes(term);
        if (
          !matchTanggal &&
          !matchFormattedTanggal &&
          !matchMerk &&
          !matchNoMolen &&
          !matchMolen &&
          !matchMolenDetail &&
          !matchRow &&
          !matchBulan &&
          !matchTahun
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rows, selectedMerk, selectedMolen, searchTerm]);

  // 2. Sort rows: 'desc' (terbaru di atas) atau 'asc' (terlama di atas)
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      // Prioritas 1: Bandingkan tanggal (format ISO: YYYY-MM-DD)
      const dateA = a.tanggal || '';
      const dateB = b.tanggal || '';
      if (dateA !== dateB) {
        return sortOrder === 'desc'
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      }
      // Prioritas 2: Jika tanggal sama, bandingkan nomor baris spreadsheet (srcRow lebih besar = entri lebih baru)
      const rowA = a.srcRow || 0;
      const rowB = b.srcRow || 0;
      return sortOrder === 'desc' ? rowB - rowA : rowA - rowB;
    });
    return list;
  }, [filtered, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Log Data Harian & Audit Baris DATAMASTER</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {sortOrder === 'desc' ? (
                    <>
                      <ArrowDown className="w-3 h-3 text-blue-600" />
                      <span>Data Terbaru di Atas</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3 h-3 text-amber-600" />
                      <span>Data Terlama di Atas</span>
                    </>
                  )}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemeriksaan entri harian proses blend · Posisi urutan data:{' '}
                {sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Pembalik Urutan Data */}
            <button
              onClick={toggleSortOrder}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                sortOrder === 'desc'
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="Klik untuk membalik posisi urutan data"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Urutan: Terbaru di Atas ⬇️' : 'Urutan: Terlama di Atas ⬆️'}</span>
            </button>

            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh CSV Raw</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor baris, hari/tanggal (misal: Jumat, 16 Oktober), merk, molen..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Merk Filter */}
          <div>
            <select
              value={selectedMerk}
              onChange={(e) => {
                setSelectedMerk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Merk</option>
              {merks.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Molen Filter */}
          <div>
            <select
              value={selectedMolen}
              onChange={(e) => {
                setSelectedMolen(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Molen</option>
              {molens.map((mo) => (
                <option key={mo} value={mo}>
                  {mo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <span className="font-bold text-slate-900">{sorted.length}</span> baris
              (Halaman {currentPage} dari {totalPages})
            </span>
            <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium hidden sm:inline">
              {sortOrder === 'desc' ? 'Entri terbaru di baris pertama' : 'Entri terlama di baris pertama'}
            </span>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1 no-print">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1}
              className="px-2 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer disabled:cursor-not-allowed"
              title="Ke Halaman Pertama"
            >
              Awal
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer disabled:cursor-not-allowed"
              title="Ke Halaman Terakhir"
            >
              Akhir
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th
                  onClick={toggleSortOrder}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-700 select-none group w-24"
                  title="Klik untuk membalik urutan"
                >
                  <div className="flex items-center gap-1">
                    <span>No. Baris</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </th>
                <th
                  onClick={toggleSortOrder}
                  className="py-2.5 px-3 cursor-pointer hover:text-blue-700 select-none group"
                  title="Klik untuk membalik urutan"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal & Hari</span>
                    {sortOrder === 'desc' ? (
                      <ArrowDown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-amber-600" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3">Merk Blend</th>
                <th className="py-2.5 px-3 text-center">No. Molen</th>
                <th className="py-2.5 px-3 text-right">Bobot Baku (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                <th className="py-2.5 px-3 text-right">% Susut</th>
                <th className="py-2.5 px-3">Molen</th>
                <th className="py-2.5 px-3 text-right">Suhu (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((r, idx) => {
                const badge = getPctBadgeClass(r.susutPct);
                return (
                  <tr
                    key={`${r.srcRow}-${r.tanggal}-${idx}`}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-2 px-3 font-mono text-slate-400 font-medium">#{r.srcRow}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {formatTanggalLengkap(r.tanggal)}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{r.merk}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 bg-slate-50/60">
                      {r.noMolen !== undefined && r.noMolen !== null && r.noMolen !== '' ? r.noMolen : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-blue-900">
                      {fmtKg(r.bobot)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-900">
                      {fmtKg(r.hasil)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-700">
                      {fmtKg(r.susutKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span className={`${badge.color}`}>{fmtPct(r.susutPct)}%</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-semibold">
                      {r.molenDetail || r.molen}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {r.suhu !== null ? `${fmtSuhu(r.suhu)} °C` : '-'}
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
