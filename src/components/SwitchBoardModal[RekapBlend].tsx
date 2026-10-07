import React from 'react';
import { X, Layers, ExternalLink, Check, Sparkles } from 'lucide-react';

interface SwitchBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchBoardModalRekapBlend: React.FC<SwitchBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const appBoards = [
    {
      name: 'Rekap Susut Blend',
      desc: 'Pencampuran & Molen Proses',
      isCurrent: true,
      url: '#',
    },
    {
      name: 'Rekap Susut Cengkeh',
      desc: 'Sortasi & Rajang Cengkeh',
      isCurrent: false,
      url: 'https://appspengolahan.github.io/Rekap-proses-cengkeh/',
    },
    {
      name: 'Rekap Susut Tembakau',
      desc: 'Rotary & Destem Tembakau',
      isCurrent: false,
      url: 'https://appspengolahan.github.io/Rekap-Proses-Tembakau/',
    },
    {
      name: 'Rekap Susut Krosok',
      desc: 'Grading & Cupping Daun Krosok',
      isCurrent: false,
      url: 'https://appspengolahan.github.io/Rekap-Proses-Krosok/',
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">🔀 Switch App Board</h2>
            <p className="text-xs text-slate-500">
              Pindah cepat antar aplikasi operasional Divisi Produksi I
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Modul 4 Komoditas Pengolahan (Fase 2)
          </div>

          {appBoards.map((app) => (
            <div key={app.name}>
              {app.isCurrent ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-900">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                    <div>
                      <div className="text-xs font-bold">{app.name}</div>
                      <div className="text-[10px] text-blue-600">{app.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded-full">
                    Sedang dibuka
                  </span>
                </div>
              ) : (
                <a
                  href={app.url}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group text-slate-700"
                >
                  <div>
                    <div className="text-xs font-bold group-hover:text-blue-600 transition">
                      {app.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{app.desc}</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                </a>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Sistem Persediaan & Ekosistem PP1
            </div>

            <a
              href="https://script.google.com/macros/s/AKfycbywAsu-wvbBxWwl2P9YojeZgR13U3BR9cS8THDCGE9EMINUXIIcR1HjoAK59W1Aqm1lYQ/exec"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/50 border border-amber-200/40 transition group text-slate-800"
            >
              <div>
                <div className="text-xs font-bold group-hover:text-amber-700 transition">
                  Monitoring Stock Persediaan PP1
                </div>
                <div className="text-[10px] text-slate-400">
                  Data stok Cengkeh, Tembakau, Krosok & Blend
                </div>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                ↗ Tab Baru
              </span>
            </a>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          PT Batu Karang — Divisi Produksi I (PP1) Master Workspace OS
        </div>
      </div>
    </div>
  );
};
