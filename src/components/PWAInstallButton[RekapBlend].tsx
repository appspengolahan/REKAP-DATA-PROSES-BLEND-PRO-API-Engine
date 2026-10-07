import React, { useState } from 'react';
import { usePWAInstall } from '../usePWAInstall[RekapBlend]';
import { Download, Smartphone, Monitor, X, Share, PlusSquare, CheckCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'modal' | 'dropdown';
}

export const PWAInstallButtonRekapBlend: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running inside standalone installed PWA, hide install trigger
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Aplikasi Terpasang</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-3 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 mb-4 no-print border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Pasang di Layar Utama HP / Laptop</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded">
                  PWA
                </span>
              </div>
              <div className="text-[11px] text-blue-100">
                Akses cepat tanpa browser, buka dalam 0.01 detik & offline-ready.
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-blue-900 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Install Sekarang</span>
          </button>
        </div>
      ) : variant === 'dropdown' ? (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Pasang Aplikasi (PWA)</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition active:scale-95"
          title="Install aplikasi ke Layar Utama Handphone atau Desktop"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {/* Modal Petunjuk Instalasi (Android, PC, & iOS) */}
      {showGuideModal && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {isIOS ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isIOS ? 'Install di iPhone / iPad' : 'Install Aplikasi di HP & PC'}
                </h3>
                <div className="text-[11px] text-slate-500">Monitoring Board Rekap Blend</div>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>Untuk memasang aplikasi ini di layar utama iOS Safari:</p>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> di bilah bawah Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Gulir ke bawah dan ketuk <strong>&ldquo;Tambah ke Layar Utama&rdquo;</strong> (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" />.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>Pasang sebagai aplikasi mandiri untuk kemudahan akses operasional:</p>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      A
                    </span>
                    <span>
                      <strong>Android (Chrome):</strong> Ketuk menu titik tiga (⋮) di pojok kanan atas, lalu pilih <strong>&ldquo;Pasang aplikasi&rdquo;</strong> atau <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      B
                    </span>
                    <span>
                      <strong>Laptop/PC (Chrome/Edge):</strong> Klik ikon install ⊕ di sisi kanan kolom alamat URL (address bar) browser.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
