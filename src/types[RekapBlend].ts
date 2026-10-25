export type UserRole = 
  | 'Project Manager (Lalu M.)'
  | 'Site Engineer / QC'
  | 'Super Admin'
  | 'Vendor'
  | 'Client Hub';

export interface RawBlendRow {
  srcRow: number;
  tanggal: string; // yyyy-MM-dd
  bulan: string;   // 'Januari'..'Desember'
  tahun: string;   // '2025', '2026'
  merk: string;
  noMolen?: string | number; // Nomer Molen (Camp urut harian: 1, 2, 3...)
  bobot: number;   // Kg (Bahan Diproses)
  hasil: number;   // Kg (Hasil Proses)
  susutKg: number; // Kg
  susutPct: number;// %
  molen: string;   // 'MOLEN AA'..'MOLEN AF' (agregasi untuk Tab Rekap Molen)
  molenDetail?: string; // 'MOLEN AA 1', 'MOLEN AA 2' (siklus putaran kerja untuk Log Data Harian)
  suhu: number | null; // °C
}

export interface RingkasanData {
  mode: 'tahunan' | 'bulanan' | 'periode';
  periodeLabel: string;
  jumlahData: number;
  bahanDiproses: number;
  hasilProses: number;
  susutKg: number;
  susutRataPct: number;
  susutMinPct: number;
  susutMaxPct: number;
  suhuRata: number | null;
}

export interface RekapBulanItem {
  label: string;
  bulan: string;
  tahun: string;
  jumlahData: number;
  bahanDiproses: number;
  hasilProses: number;
  susutKg: number;
  susutRataPct: number;
  susutMinPct: number;
  susutMaxPct: number;
  suhuRata: number | null;
  kapasitasPct: number;
}

export interface RekapMerkItem {
  label: string; // Merk
  jumlahData: number;
  bahanDiproses: number;
  hasilProses: number;
  susutKg: number;
  susutRataPct: number;
  susutMinPct: number;
  susutMaxPct: number;
  suhuRata: number | null;
  kapasitasPct: number;
}

export interface RekapMolenItem {
  label: string; // Molen
  jumlahData: number;
  bahanDiproses: number;
  hasilProses: number;
  susutKg: number;
  susutRataPct: number;
  susutMinPct: number;
  susutMaxPct: number;
  suhuRata: number | null;
  kapasitasPct: number;
}

export interface TrendMerkData {
  merk: string;
  data: {
    label: string;
    bulan: string;
    tahun: string;
    susutRataPct: number;
    bahanDiproses: number;
    hasilProses: number;
  }[];
}

export type DataSourceMode = 'gas' | 'direct_sheet';

export interface DashboardDataset {
  filterOptions: {
    tahun: string[];
    bulan: string[];
    merk: string[];
    molen: string[];
  };
  entriTerkini: string | null;
  ringkasanTahunan: RingkasanData;
  ringkasanBulanan: RingkasanData;
  ringkasanPeriode: RingkasanData;
  rekapBulan: RekapBulanItem[];
  rekapMerkPeriode: {
    periodeLabel: string;
    list: RekapMerkItem[];
  };
  rekapMolen: RekapMolenItem[];
  trendMerk: TrendMerkData;
  allRows: RawBlendRow[];
  sourceInfo: {
    loadedFrom: 'gas_api' | 'direct_sheet' | 'localStorage' | 'bundled_snapshot';
    timestamp: string;
    cachedRowsCount: number;
    syncStatus: 'synced' | 'syncing' | 'offline_cached' | 'error';
    errorMessage?: string;
  };
}

export type ActiveTab = 'dashboard' | 'bulan' | 'merk' | 'molen' | 'deviasi' | 'explorer';

export interface StandarAcuanItem {
  merk: string;
  susutTargetPct: number;
  toleransiMinPct: number;
  toleransiMaxPct: number;
  sumberPeriode: string;
  catatan?: string;
}

export interface DeviasiVarianItem {
  merk: string;
  bobotRiilKg: number;
  hasilRiilKg: number;
  susutRiilKg: number;
  susutRiilPct: number;
  susutAcuanPct: number;
  deviasiPct: number;
  deviasiKg: number;
  status: 'normal' | 'waspada' | 'oos';
  kontribusiDeviasiPct: number;
  jumlahBatch: number;
  suhuRata: number | null;
}

export interface QuickBatchTag {
  batchId: string;
  tag: string;
  kategori: 'kadar_air' | 'suhu' | 'molen' | 'cleaning' | 'cuaca' | 'lainnya';
  catatan?: string;
  timestamp: string;
}
