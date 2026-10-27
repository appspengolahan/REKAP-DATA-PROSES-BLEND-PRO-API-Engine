import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../usePWAInstall[RekapBlend]';
import { Download, Smartphone, Monitor, X, Share, PlusSquare, CheckCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'banner' | 'modal' | 'dropdown' | 'sidebar';
}

export const PWAInstallButtonRekapBlend: React.FC<PWAInstallButtonProps> = ({
  variant = 'floating',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('rekap_blend_pwa_dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('rekap_blend_pwa_dismissed', 'true');
  };

  // If already running inside standalone installed PWA, hide install triggers or show subtle badge
  if (isInstalled) {
    if (variant === 'floating' || variant === 'banner') return null;
    return (
      <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold">App Terpasang</span>
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

  const renderGuideModal = () => (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={() => setShowGuideModal(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowGuideModal(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
          className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Mengerti & Tutup
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Floating Action Card (Pojok Kanan Bawah, 0px overhead di atas dashboard) */}
      {variant === 'floating' && !isDismissed && (
        <aside
          aria-label="Notifikasi Instalasi PWA"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-300 no-print"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Pasang di HP / Laptop</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                    PWA
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Tutup & Jangan Tampilkan Lagi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Buka langsung tanpa browser dalam 0.01 detik & offline-ready.
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Install Sekarang</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-800/80 transition cursor-pointer font-medium"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Header Action Button (Sleek pill di jajaran tombol atas) */}
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-xs transition active:scale-95 cursor-pointer"
          title="Install aplikasi ke Layar Utama Handphone atau Desktop (PWA)"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden md:inline">Install PWA</span>
          <span className="text-[9px] bg-slate-950/20 text-slate-950 font-black px-1 rounded">
            PWA
          </span>
        </button>
      )}

      {/* 3. Dropdown Menu Item */}
      {variant === 'dropdown' && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
            <span>Pasang Aplikasi (PWA)</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
            Install
          </span>
        </button>
      )}

      {/* 4. Sidebar Item */}
      {variant === 'sidebar' && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center gap-2 py-1.5 px-2 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 hover:text-white rounded-lg text-[11px] font-semibold border border-blue-500/30 transition cursor-pointer"
          title="Pasang Aplikasi (PWA)"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Install PWA</span>
        </button>
      )}

      {/* Modal Petunjuk Instalasi (Android, PC, & iOS) */}
      {showGuideModal && renderGuideModal()}
    </>
  );
};
