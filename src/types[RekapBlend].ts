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
  bobot: number;   // Kg (Bahan Diproses)
  hasil: number;   // Kg (Hasil Proses)
  susutKg: number; // Kg
  susutPct: number;// %
  molen: string;   // 'A', 'B', dll.
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

export type ActiveTab = 'dashboard' | 'bulan' | 'merk' | 'molen' | 'explorer';
