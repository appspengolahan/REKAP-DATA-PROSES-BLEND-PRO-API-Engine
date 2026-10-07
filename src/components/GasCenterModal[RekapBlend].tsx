import React, { useState } from 'react';
import {
  DEFAULT_GAS_URL,
  SPREADSHEET_ID,
  getSavedGasUrl,
  saveGasUrl,
  syncWithGasServer,
} from '../api[RekapBlend]';
import {
  Settings,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Database,
  ExternalLink,
  Code,
  Copy,
  CheckCheck,
} from 'lucide-react';

interface GasCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetCache: () => void;
}

export const GasCenterModalRekapBlend: React.FC<GasCenterModalProps> = ({
  isOpen,
  onClose,
  onResetCache,
}) => {
  if (!isOpen) return null;

  const [gasUrl, setGasUrl] = useState(getSavedGasUrl());
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    rowCount?: number;
  } | null>(null);

  const scriptSnippet = `/**
 * Tambahkan penanganan parameter REST JSON pada fungsi doGet(e)
 * di file Code[RekapBlend].gs agar dapat dibaca langsung oleh React Web App:
 */
function doGet(e) {
  // 1. Jalur REST API JSON untuk React Web App
  if (e && e.parameter && (e.parameter.action === 'getDataMaster' || e.parameter.format === 'json')) {
    var rawData = getRawData_();
    return ContentService.createTextOutput(JSON.stringify(rawData))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Tampilan HTML bawaan Google Apps Script
  return HtmlService.createTemplateFromFile('Index[RekapBlend]')
    .evaluate()
    .setTitle('Monitoring Board — Rekap Data Proses Blend')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveGasUrl(gasUrl);
    setTestResult({
      success: true,
      message: 'URL Headless GAS berhasil disimpan ke konfigurasi browser.',
    });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const rows = await syncWithGasServer(gasUrl);
      setTestResult({
        success: true,
        message: `Koneksi berhasil! Terbaca ${rows.length} baris data riil dari Google Sheets.`,
        rowCount: rows.length,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message || 'Cek izin deployment Web App ("Anyone")'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">⚙️ Headless GAS Center & Sumber Data</h2>
            <p className="text-xs text-slate-500">
              Integrasi langsung ke Spreadsheet DATAMASTER PT Batu Karang PP1
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Endpoint Input */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Google Apps Script REST Web App URL:
            </label>
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition shadow-sm"
            >
              Simpan URL
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 border border-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi Langsung'}</span>
            </button>
            <button
              onClick={() => {
                setGasUrl(DEFAULT_GAS_URL);
                saveGasUrl(DEFAULT_GAS_URL);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 ml-auto"
            >
              Reset Default
            </button>
          </div>

          {/* Test Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium">{testResult.message}</div>
            </div>
          )}

          {/* Tautan Langsung Spreadsheet & Apps Script */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition group text-slate-700"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-blue-700">
                  Buka Spreadsheet Sumber
                </div>
                <div className="text-[10px] text-slate-500">ID: {SPREADSHEET_ID.substring(0, 12)}…</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </a>

            <a
              href="https://script.google.com/u/0/home/projects/1G8d7iowRq9HlxpB1G9KhbPQ5iU_uKtfcDvzQZCoyKUN1dCXIOkYcY9Qa/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition group text-slate-700"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-amber-800">
                  Buka Apps Script Project
                </div>
                <div className="text-[10px] text-slate-500">Editor Code[RekapBlend]</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </a>
          </div>

          {/* Tombol Lihat Kode doGet(e) untuk Apps Script */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600" />
                Penyesuaian doGet(e) pada Code[RekapBlend].gs
              </span>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {showCode ? 'Sembunyikan' : 'Lihat Kode'}
              </button>
            </div>

            {showCode && (
              <div className="mt-2.5 space-y-2">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Agar Google Apps Script dapat mengembalikan JSON langsung saat diminta oleh React Web
                  App tanpa mengganggu halaman HTML lama, pastikan fungsi <code>doGet(e)</code> memiliki
                  percabangan berikut:
                </p>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10.5px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                    {scriptSnippet}
                  </pre>
                  <button
                    onClick={handleCopySnippet}
                    className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded text-[10px] font-semibold border border-slate-700"
                  >
                    {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Cache */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Bersihkan cache lokal di peramban:</span>
            <button
              onClick={onResetCache}
              className="text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded bg-rose-50 border border-rose-200 transition"
            >
              Hapus Cache & Muat Ulang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
