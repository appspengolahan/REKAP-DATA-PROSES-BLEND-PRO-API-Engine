import React from 'react';
import { BUILD_VERSION } from '../api[RekapBlend]';
import { HelpCircle, X, CheckCircle, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModalRekapBlend: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              📊 Monitoring Board — Rekap Data Proses Blend
            </h2>
            <div className="text-xs text-slate-500 font-medium">
              Versi build server (live):{' '}
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                {BUILD_VERSION}
              </span>
            </div>
          </div>
        </div>

        {/* Content: Cara Penggunaan */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            Cara Penggunaan Aplikasi:
          </h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Pilih <strong>Tahun</strong> di filter atas untuk mengatur periode Rekap Tahunan, Rekap
              Bulanan, dan tabel per Bulan / per Molen.
            </li>
            <li>
              Gunakan dropdown <strong>Bulan</strong> di card Rekap Bulanan untuk melihat data satu
              bulan tertentu.
            </li>
            <li>
              Di card <strong>Rekap Rentang Periode</strong>, atur &ldquo;Dari Bulan/Tahun – Sampai Bulan/Tahun&rdquo;
              lalu klik <strong>Terapkan</strong> untuk melihat rekap kuartalan atau periode bebas
              lainnya — rentang ini otomatis juga mengatur tabel di tab Rekap per Merk.
            </li>
            <li>
              Klik tab <strong>Rekap per Bulan / per Merk / per Molen</strong> untuk melihat rincian
              data & grafik masing-masing.
            </li>
            <li>
              Di dalam tab Rekap per Molen, gunakan dropdown Bulan untuk menyaring lebih spesifik
              (mengikuti Tahun global).
            </li>
            <li>
              Klik <strong>📄 Export Ringkasan (PDF)</strong> di atas untuk mencetak ringkasan, atau{' '}
              <strong>📄 Export Tab Ini (PDF)</strong> di dalam tab untuk mencetak isi tab yang sedang
              aktif.
            </li>
            <li>
              Klik <strong>🔄 Refresh Data</strong> kapan saja untuk menarik data terbaru dari
              spreadsheet.
            </li>
            <li>
              Gunakan tombol <strong>🔀 Switch App</strong> di pojok kanan atas untuk berpindah ke
              Monitoring Board komoditas lain.
            </li>
            <li>
              Klik tombol <strong>Install App</strong> atau banner biru di atas untuk memasang aplikasi langsung ke layar utama Smartphone (Android/iOS) atau Laptop/PC agar dapat dibuka cepat (0.01 detik) seperti aplikasi native.
            </li>
          </ol>
        </div>

        {/* Footer Note sesuai ketentuan */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">
            Monitoring Board — Rekap Data Proses Blend All Rights Reserved . Divisi Produksi I .
            Developed by Lalu Mahendra
          </div>
          <div className="text-slate-400">
            Jika menemukan bug atau kendala teknis, silahkan hubungi Developer [Lalu Mahendra]
          </div>
        </div>
      </div>
    </div>
  );
};
