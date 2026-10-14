import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  Globe,
  Sparkles,
  Link as LinkIcon,
  FolderPlus,
} from 'lucide-react';

export interface AppBoardItem {
  id: string;
  name: string;
  desc: string;
  category: 'komoditas' | 'ekosistem' | 'kustom';
  url: string;
  isCurrent?: boolean;
}

const DEFAULT_APP_BOARDS: AppBoardItem[] = [
  {
    id: 'blend',
    name: 'Rekap Proses Blend',
    desc: 'Pencampuran & Molen Proses (Sedang Dibuka)',
    category: 'komoditas',
    url: 'https://rekap-data-proses-blend-pro-api-eng.vercel.app/',
    isCurrent: true,
  },
  {
    id: 'krosok',
    name: 'Rekap Proses Krosok',
    desc: 'Grading & Cupping Daun Krosok',
    category: 'komoditas',
    url: 'https://rekap-data-krosok-api-phi.vercel.app/',
    isCurrent: false,
  },
  {
    id: 'tembakau',
    name: 'Rekap Proses Tembakau',
    desc: 'Rotary & Destem Tembakau',
    category: 'komoditas',
    url: 'https://rekap-dataproses-tembakau-pro.vercel.app/',
    isCurrent: false,
  },
  {
    id: 'cengkeh',
    name: 'Rekap Proses Cengkeh',
    desc: 'Sortasi & Rajang Cengkeh',
    category: 'komoditas',
    url: 'https://rekap-data-proses-cengkeh-pro-api-l.vercel.app/',
    isCurrent: false,
  },
  {
    id: 'stock-pp1',
    name: 'Monitoring Stock Persediaan PP1',
    desc: 'Data stok Cengkeh, Tembakau, Krosok & Blend',
    category: 'ekosistem',
    url: 'https://monitoring-stock-pp-1-pro-api.vercel.app/',
    isCurrent: false,
  },
];

const STORAGE_KEY = 'PP1_SWITCHBOARD_SUSUT_MODULES_V2';

interface SwitchBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchBoardModalRekapBlend: React.FC<SwitchBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [appBoards, setAppBoards] = useState<AppBoardItem[]>(DEFAULT_APP_BOARDS);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingItem, setEditingItem] = useState<AppBoardItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<'komoditas' | 'ekosistem' | 'kustom'>('komoditas');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAppBoards(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setAppBoards(DEFAULT_APP_BOARDS);
  }, []);

  // Save to LocalStorage
  const saveToStorage = (items: AppBoardItem[]) => {
    setAppBoards(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Reset to Default
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh daftar URL dan Modul ke posisi default PP1?')) {
      saveToStorage(DEFAULT_APP_BOARDS);
      setIsEditingMode(false);
      setEditingItem(null);
      setIsAddingNew(false);
      showToast('Konfigurasi dikembalikan ke default');
    }
  };

  // Open Edit Dialog
  const handleStartEdit = (item: AppBoardItem) => {
    setEditingItem(item);
    setIsAddingNew(false);
    setFormName(item.name);
    setFormDesc(item.desc);
    setFormUrl(item.url);
    setFormCategory(item.category);
  };

  // Open Add Dialog
  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormUrl('https://');
    setFormCategory('kustom');
  };

  // Save Edited Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formName.trim() || !formUrl.trim()) {
      alert('Nama Modul dan URL wajib diisi');
      return;
    }

    let finalUrl = formUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && finalUrl !== '#') {
      finalUrl = 'https://' + finalUrl;
    }

    const updated = appBoards.map((app) => {
      if (app.id === editingItem.id) {
        return {
          ...app,
          name: formName.trim(),
          desc: formDesc.trim(),
          url: finalUrl,
          category: formCategory,
        };
      }
      return app;
    });

    saveToStorage(updated);
    setEditingItem(null);
    showToast(`Modul "${formName.trim()}" berhasil diperbarui`);
  };

  // Save New Item
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) {
      alert('Nama Modul dan URL wajib diisi');
      return;
    }

    let finalUrl = formUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newItem: AppBoardItem = {
      id: 'custom-' + Date.now(),
      name: formName.trim(),
      desc: formDesc.trim() || 'Modul Operasional Tambahan',
      url: finalUrl,
      category: formCategory,
      isCurrent: false,
    };

    const updated = [...appBoards, newItem];
    saveToStorage(updated);
    setIsAddingNew(false);
    showToast(`Modul baru "${newItem.name}" berhasil ditambahkan`);
  };

  // Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Hapus modul "${name}" dari Switchboard?`)) {
      const updated = appBoards.filter((app) => app.id !== id);
      saveToStorage(updated);
      showToast(`Modul "${name}" telah dihapus`);
    }
  };

  if (!isOpen) return null;

  const komoditasItems = appBoards.filter((item) => item.category === 'komoditas');
  const ekosistemItems = appBoards.filter((item) => item.category === 'ekosistem');
  const customItems = appBoards.filter((item) => item.category === 'kustom');

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/90 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  🔀 Switchboard Susut
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  PP1 Ekosistem
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pindah cepat antar aplikasi operasional Divisi Produksi I
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsEditingMode(!isEditingMode);
                setEditingItem(null);
                setIsAddingNew(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                isEditingMode
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingMode ? 'Selesai Kelola' : 'Kelola / Edit'}</span>
            </button>

            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Modul</span>
            </button>
          </div>

          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition cursor-pointer"
            title="Reset semua URL ke pengaturan standar"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Toast Notifikasi */}
        {saveToast && (
          <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Form Modal: Tambah Modul Baru */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveNew}
              className="p-4 rounded-xl border-2 border-blue-400 bg-blue-50/50 space-y-3 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-blue-600" />
                  Tambah Modul / Link Web App Baru
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Modul / Sistem:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rekap Proses Sortasi Baru"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as 'komoditas' | 'ekosistem' | 'kustom')
                    }
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="komoditas">Modul Komoditas Pengolahan</option>
                    <option value="ekosistem">Sistem Persediaan & Ekosistem PP1</option>
                    <option value="kustom">Modul Tambahan / Kustom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Deskripsi Singkat:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Unit Pengolahan Khusus"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tautan URL Web App:
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                >
                  Simpan Modul Baru
                </button>
              </div>
            </form>
          )}

          {/* Form Modal: Edit Modul Eksisting */}
          {editingItem && (
            <form
              onSubmit={handleSaveEdit}
              className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/60 space-y-3 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-amber-600" />
                  Edit Modul: {editingItem.name}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Modul:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as 'komoditas' | 'ekosistem' | 'kustom')
                    }
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="komoditas">Modul Komoditas Pengolahan</option>
                    <option value="ekosistem">Sistem Persediaan & Ekosistem PP1</option>
                    <option value="kustom">Modul Tambahan / Kustom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Deskripsi:
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tautan URL:
                </label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* Bagian 1: Modul Komoditas Pengolahan */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Modul Komoditas Pengolahan (Fase 2)</span>
              <span className="text-[9px] text-slate-400 font-normal">
                {komoditasItems.length} Modul
              </span>
            </div>

            <div className="space-y-2">
              {komoditasItems.map((app) => (
                <div
                  key={app.id}
                  className={`p-3 rounded-xl border transition ${
                    app.isCurrent
                      ? 'bg-blue-50/80 border-blue-200/90 text-blue-950'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {app.isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0"></span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold truncate">{app.name}</span>
                          {app.isCurrent && (
                            <span className="text-[9px] font-bold bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-full">
                              Sedang dibuka
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{app.desc}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                          {app.url}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditingMode && (
                        <button
                          onClick={() => handleStartEdit(app)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                          title="Edit Modul & URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isEditingMode && !app.isCurrent && (
                        <button
                          onClick={() => handleDeleteItem(app.id, app.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!app.isCurrent && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer ml-1"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 2: Sistem Persediaan & Ekosistem PP1 */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Sistem Persediaan & Ekosistem PP1</span>
              <span className="text-[9px] text-slate-400 font-normal">
                {ekosistemItems.length} Sistem
              </span>
            </div>

            <div className="space-y-2">
              {ekosistemItems.map((app) => (
                <div
                  key={app.id}
                  className="p-3 rounded-xl border bg-amber-50/40 border-amber-200/70 hover:bg-amber-50/70 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{app.name}</span>
                        <span className="text-[9px] font-semibold bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded-sm">
                          Ekosistem
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{app.desc}</div>
                      <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                        {app.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditingMode && (
                        <button
                          onClick={() => handleStartEdit(app)}
                          className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                          title="Edit Modul & URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isEditingMode && (
                        <button
                          onClick={() => handleDeleteItem(app.id, app.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer ml-1"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 3: Modul Kustom Tambahan (Jika ada) */}
          {customItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                <span>Modul Tambahan / Kustom</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  {customItems.length} Modul
                </span>
              </div>

              <div className="space-y-2">
                {customItems.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border bg-white border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{app.name}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{app.desc}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                          {app.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditingMode && (
                          <button
                            onClick={() => handleStartEdit(app)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                            title="Edit Modul & URL"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteItem(app.id, app.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition shadow-xs cursor-pointer ml-1"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-center text-[10px] text-slate-500 shrink-0">
          PT Batu Karang — Divisi Produksi I (PP1) Master Workspace OS
        </div>
      </div>
    </div>
  );
};
