import React, { useState } from 'react';
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
} from 'lucide-react';

interface DataExplorerProps {
  rows: RawBlendRow[];
  currentRole: UserRole;
  onExportCsv: () => void;
}

export const DataExplorerRekapBlend: React.FC<DataExplorerProps> = ({
  rows,
  currentRole,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerk, setSelectedMerk] = useState('Semua');
  const [selectedMolen, setSelectedMolen] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const merks = Array.from(new Set(rows.map((r) => r.merk))).filter(Boolean).sort();
  const molens = Array.from(new Set(rows.map((r) => r.molen))).filter(Boolean).sort();

  const filtered = rows.filter((r) => {
    if (selectedMerk !== 'Semua' && r.merk !== selectedMerk) return false;
    if (selectedMolen !== 'Semua' && r.molen !== selectedMolen) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTanggal = r.tanggal.toLowerCase().includes(term);
      const matchMerk = r.merk.toLowerCase().includes(term);
      const matchMolen = r.molen.toLowerCase().includes(term);
      const matchRow = String(r.srcRow).includes(term);
      if (!matchTanggal && !matchMerk && !matchMolen && !matchRow) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Banner & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Data Explorer & Audit Baris DATAMASTER
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemeriksaan baris mentah proses blend (dimulai dari baris 14 spreadsheet)
              </p>
            </div>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Unduh CSV Raw</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor baris, tanggal (yyyy-mm-dd), merk..."
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
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
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{filtered.length}</span> baris
            (Halaman {currentPage} dari {totalPages})
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-slate-700">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[800px] text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">No. Baris</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Bulan / Tahun</th>
                <th className="py-2.5 px-3">Merk Blend</th>
                <th className="py-2.5 px-3 text-right">Bobot Baku (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil (Kg)</th>
                <th className="py-2.5 px-3 text-right">Susut (Kg)</th>
                <th className="py-2.5 px-3 text-right">% Susut</th>
                <th className="py-2.5 px-3">Molen</th>
                <th className="py-2.5 px-3 text-right">Suhu (°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((r) => {
                const badge = getPctBadgeClass(r.susutPct);
                return (
                  <tr key={`${r.srcRow}-${r.tanggal}`} className="hover:bg-slate-50/80 transition">
                    <td className="py-2 px-3 font-mono text-slate-400 font-medium">#{r.srcRow}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{r.tanggal}</td>
                    <td className="py-2 px-3 text-slate-600">
                      {r.bulan} {r.tahun}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{r.merk}</td>
                    <td className="py-2 px-3 text-right font-medium text-blue-900">{fmtKg(r.bobot)}</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-900">{fmtKg(r.hasil)}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-700">{fmtKg(r.susutKg)}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span className={`${badge.color}`}>{fmtPct(r.susutPct)}%</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">{r.molen}</td>
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
