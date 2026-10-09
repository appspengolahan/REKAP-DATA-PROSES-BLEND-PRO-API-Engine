import { RawBlendRow } from './types[RekapBlend]';

/**
 * Snapshot data proses blend 2026 & 2025.
 * Berfungsi sebagai offline cache tier 4 (pemuatan instan 0.01 detik)
 * sebelum sinkronisasi latar belakang ke Headless Google Apps Script.
 */
export const SNAPSHOT_BLEND_ROWS: RawBlendRow[] = [
  // 153 - BK (SKT Volume Utama ~90.95%)
  { srcRow: 14, tanggal: '2026-01-05', bulan: 'Januari', tahun: '2026', merk: '153 - BK', bobot: 885.2, hasil: 882.5, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 28.5 },
  { srcRow: 15, tanggal: '2026-01-06', bulan: 'Januari', tahun: '2026', merk: '153 - BK', bobot: 890.0, hasil: 887.1, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AB', suhu: 28.6 },
  { srcRow: 16, tanggal: '2026-01-12', bulan: 'Januari', tahun: '2026', merk: '153 - BK', bobot: 884.0, hasil: 881.2, susutKg: 2.8, susutPct: 0.32, molen: 'MOLEN AA', suhu: 29.0 },
  { srcRow: 17, tanggal: '2026-01-19', bulan: 'Januari', tahun: '2026', merk: '153 - BK', bobot: 887.5, hasil: 884.6, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AC', suhu: 28.9 },
  { srcRow: 18, tanggal: '2026-01-26', bulan: 'Januari', tahun: '2026', merk: '153 - BK', bobot: 882.1, hasil: 879.4, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AB', suhu: 29.2 },
  
  { srcRow: 19, tanggal: '2026-02-03', bulan: 'Februari', tahun: '2026', merk: '153 - BK', bobot: 886.0, hasil: 883.1, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AA', suhu: 28.7 },
  { srcRow: 20, tanggal: '2026-02-10', bulan: 'Februari', tahun: '2026', merk: '153 - BK', bobot: 889.4, hasil: 886.3, susutKg: 3.1, susutPct: 0.35, molen: 'MOLEN AB', suhu: 29.1 },
  { srcRow: 21, tanggal: '2026-02-17', bulan: 'Februari', tahun: '2026', merk: '153 - BK', bobot: 883.2, hasil: 880.5, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 28.8 },
  { srcRow: 22, tanggal: '2026-02-24', bulan: 'Februari', tahun: '2026', merk: '153 - BK', bobot: 888.0, hasil: 885.1, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AC', suhu: 29.3 },

  { srcRow: 23, tanggal: '2026-03-02', bulan: 'Maret', tahun: '2026', merk: '153 - BK', bobot: 885.0, hasil: 882.3, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 29.0 },
  { srcRow: 24, tanggal: '2026-03-09', bulan: 'Maret', tahun: '2026', merk: '153 - BK', bobot: 887.8, hasil: 884.9, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AB', suhu: 29.2 },
  { srcRow: 25, tanggal: '2026-03-16', bulan: 'Maret', tahun: '2026', merk: '153 - BK', bobot: 884.5, hasil: 881.8, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 28.9 },
  { srcRow: 26, tanggal: '2026-03-23', bulan: 'Maret', tahun: '2026', merk: '153 - BK', bobot: 891.0, hasil: 888.0, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AC', suhu: 29.5 },

  { srcRow: 27, tanggal: '2026-04-06', bulan: 'April', tahun: '2026', merk: '153 - BK', bobot: 886.5, hasil: 883.7, susutKg: 2.8, susutPct: 0.32, molen: 'MOLEN AA', suhu: 29.1 },
  { srcRow: 28, tanggal: '2026-04-13', bulan: 'April', tahun: '2026', merk: '153 - BK', bobot: 888.2, hasil: 885.2, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AB', suhu: 29.4 },
  { srcRow: 29, tanggal: '2026-04-20', bulan: 'April', tahun: '2026', merk: '153 - BK', bobot: 883.0, hasil: 880.3, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 28.7 },
  { srcRow: 30, tanggal: '2026-04-27', bulan: 'April', tahun: '2026', merk: '153 - BK', bobot: 889.5, hasil: 886.5, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AC', suhu: 29.2 },

  { srcRow: 31, tanggal: '2026-05-04', bulan: 'Mei', tahun: '2026', merk: '153 - BK', bobot: 887.0, hasil: 884.2, susutKg: 2.8, susutPct: 0.32, molen: 'MOLEN AA', suhu: 29.2 },
  { srcRow: 32, tanggal: '2026-05-11', bulan: 'Mei', tahun: '2026', merk: '153 - BK', bobot: 889.0, hasil: 886.1, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AB', suhu: 29.5 },
  { srcRow: 33, tanggal: '2026-05-18', bulan: 'Mei', tahun: '2026', merk: '153 - BK', bobot: 884.0, hasil: 881.3, susutKg: 2.7, susutPct: 0.31, molen: 'MOLEN AA', suhu: 29.0 },
  { srcRow: 34, tanggal: '2026-05-25', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 706.5, hasil: 707.0, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.1 },
  { srcRow: 35, tanggal: '2026-05-26', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 710.0, hasil: 710.6, susutKg: -0.6, susutPct: -0.08, molen: 'MOLEN AD', suhu: 28.3 },
  { srcRow: 36, tanggal: '2026-05-27', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 704.2, hasil: 704.7, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.0 },
  { srcRow: 37, tanggal: '2026-05-28', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 708.5, hasil: 709.0, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.2 },
  { srcRow: 38, tanggal: '2026-05-29', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 705.6, hasil: 706.0, susutKg: -0.4, susutPct: -0.06, molen: 'MOLEN AD', suhu: 28.4 },
  { srcRow: 39, tanggal: '2026-05-30', bulan: 'Mei', tahun: '2026', merk: 'FR LN - AVE', bobot: 704.0, hasil: 704.5, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.1 },

  { srcRow: 40, tanggal: '2026-06-01', bulan: 'Juni', tahun: '2026', merk: '153 - BK', bobot: 885.5, hasil: 882.6, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AA', suhu: 29.3 },
  { srcRow: 41, tanggal: '2026-06-08', bulan: 'Juni', tahun: '2026', merk: '153 - BK', bobot: 888.0, hasil: 885.0, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AB', suhu: 29.6 },
  { srcRow: 42, tanggal: '2026-06-15', bulan: 'Juni', tahun: '2026', merk: 'KARANG - BK', bobot: 881.0, hasil: 879.8, susutKg: 1.2, susutPct: 0.14, molen: 'MOLEN AA', suhu: 28.9 },
  { srcRow: 43, tanggal: '2026-06-16', bulan: 'Juni', tahun: '2026', merk: 'KARANG - BK', bobot: 880.5, hasil: 879.3, susutKg: 1.2, susutPct: 0.14, molen: 'MOLEN AA', suhu: 28.8 },
  { srcRow: 44, tanggal: '2026-06-22', bulan: 'Juni', tahun: '2026', merk: 'FR LN - AVE', bobot: 705.0, hasil: 705.5, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.2 },
  { srcRow: 45, tanggal: '2026-06-23', bulan: 'Juni', tahun: '2026', merk: 'FR LN - AVE', bobot: 706.0, hasil: 706.5, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.3 },

  { srcRow: 46, tanggal: '2026-07-06', bulan: 'Juli', tahun: '2026', merk: '153 - BK', bobot: 886.0, hasil: 883.2, susutKg: 2.8, susutPct: 0.32, molen: 'MOLEN AA', suhu: 29.4 },
  { srcRow: 47, tanggal: '2026-07-13', bulan: 'Juli', tahun: '2026', merk: '153 - BK', bobot: 887.5, hasil: 884.6, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AB', suhu: 29.7 },
  { srcRow: 48, tanggal: '2026-07-20', bulan: 'Juli', tahun: '2026', merk: 'FR LN - AVE', bobot: 701.0, hasil: 701.5, susutKg: -0.5, susutPct: -0.07, molen: 'MOLEN AD', suhu: 28.4 },
  { srcRow: 49, tanggal: '2026-07-21', bulan: 'Juli', tahun: '2026', merk: 'SP 153 - BK', bobot: 883.6, hasil: 881.2, susutKg: 2.4, susutPct: 0.27, molen: 'MOLEN AC', suhu: 28.6 },

  // Agustus 2026 (sesuai profil bulanan di dokumen)
  { srcRow: 50, tanggal: '2026-08-03', bulan: 'Agustus', tahun: '2026', merk: '153 - BK', bobot: 884.2, hasil: 882.0, susutKg: 2.2, susutPct: 0.25, molen: 'MOLEN AA', suhu: 28.4 },
  { srcRow: 51, tanggal: '2026-08-04', bulan: 'Agustus', tahun: '2026', merk: '153 - BK', bobot: 887.0, hasil: 884.8, susutKg: 2.2, susutPct: 0.25, molen: 'MOLEN AB', suhu: 28.5 },
  { srcRow: 52, tanggal: '2026-08-07', bulan: 'Agustus', tahun: '2026', merk: 'KARANG - BK', bobot: 882.0, hasil: 880.8, susutKg: 1.2, susutPct: 0.14, molen: 'MOLEN AA', suhu: 28.3 },
  { srcRow: 53, tanggal: '2026-08-10', bulan: 'Agustus', tahun: '2026', merk: '153 - BK', bobot: 886.5, hasil: 884.3, susutKg: 2.2, susutPct: 0.25, molen: 'MOLEN AB', suhu: 28.6 },
  { srcRow: 54, tanggal: '2026-08-14', bulan: 'Agustus', tahun: '2026', merk: '153 - BK', bobot: 885.0, hasil: 882.8, susutKg: 2.2, susutPct: 0.25, molen: 'MOLEN AC', suhu: 28.5 },
  { srcRow: 55, tanggal: '2026-08-18', bulan: 'Agustus', tahun: '2026', merk: 'FR LN - AVE', bobot: 530.3, hasil: 530.8, susutKg: -0.5, susutPct: -0.09, molen: 'MOLEN AD', suhu: 28.1 },
  { srcRow: 56, tanggal: '2026-08-19', bulan: 'Agustus', tahun: '2026', merk: 'FR LN - AVE', bobot: 530.0, hasil: 530.5, susutKg: -0.5, susutPct: -0.09, molen: 'MOLEN AD', suhu: 28.0 },
  { srcRow: 57, tanggal: '2026-08-20', bulan: 'Agustus', tahun: '2026', merk: 'TIS - KBT24', bobot: 633.2, hasil: 633.6, susutKg: -0.4, susutPct: -0.06, molen: 'MOLEN AC', suhu: 28.2 },
  { srcRow: 58, tanggal: '2026-08-21', bulan: 'Agustus', tahun: '2026', merk: 'FR LA BOLD - BK', bobot: 712.8, hasil: 712.1, susutKg: 0.7, susutPct: 0.10, molen: 'MOLEN AD', suhu: 28.3 },
  { srcRow: 59, tanggal: '2026-08-26', bulan: 'Agustus', tahun: '2026', merk: '153 - BK', bobot: 886.0, hasil: 883.8, susutKg: 2.2, susutPct: 0.25, molen: 'MOLEN AA', suhu: 28.5 },

  // September 2026
  { srcRow: 4422, tanggal: '2026-09-01', bulan: 'September', tahun: '2026', merk: 'KARANG - BK', bobot: 881.0, hasil: 880.0, susutKg: 1.0, susutPct: 0.11, molen: 'MOLEN AD', suhu: 26.0 },
  { srcRow: 4424, tanggal: '2026-09-01', bulan: 'September', tahun: '2026', merk: '153 - BK', bobot: 883.1, hasil: 880.1, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AA', suhu: 27.0 },
  { srcRow: 4431, tanggal: '2026-09-02', bulan: 'September', tahun: '2026', merk: '153 - BK', bobot: 881.8, hasil: 879.3, susutKg: 2.5, susutPct: 0.28, molen: 'MOLEN AA', suhu: 27.0 },
  { srcRow: 4500, tanggal: '2026-09-18', bulan: 'September', tahun: '2026', merk: '153 - BK', bobot: 882.0, hasil: 879.5, susutKg: 2.5, susutPct: 0.28, molen: 'MOLEN AB', suhu: 28.5 },

  // Oktober 2026 (Entri Terkini Terproses: 5 Oktober 2026 - Batch No. 4620)
  { srcRow: 4615, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: 'FR LN - AVE', bobot: 448.9, hasil: 449.5, susutKg: -0.6, susutPct: -0.14, molen: 'MOLEN AA', suhu: 30.0 },
  { srcRow: 4616, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: '153 - BK', bobot: 875.9, hasil: 873.6, susutKg: 2.3, susutPct: 0.26, molen: 'MOLEN AC', suhu: 30.0 },
  { srcRow: 4617, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: '153 - BK', bobot: 876.3, hasil: 872.7, susutKg: 3.6, susutPct: 0.41, molen: 'MOLEN AC', suhu: 34.0 },
  { srcRow: 4618, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: '153 - BK', bobot: 875.7, hasil: 873.9, susutKg: 1.8, susutPct: 0.21, molen: 'MOLEN AD', suhu: 29.0 },
  { srcRow: 4619, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: '153 - BK', bobot: 876.5, hasil: 873.6, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AE', suhu: 29.0 },
  { srcRow: 4620, tanggal: '2026-10-05', bulan: 'Oktober', tahun: '2026', merk: '153 - BK', bobot: 876.1, hasil: 874.3, susutKg: 1.8, susutPct: 0.21, molen: 'MOLEN AE', suhu: 33.0 },

  // Data historis 2025 pembanding
  { srcRow: 60, tanggal: '2025-10-14', bulan: 'Oktober', tahun: '2025', merk: '153 - BK', bobot: 884.0, hasil: 881.0, susutKg: 3.0, susutPct: 0.34, molen: 'MOLEN AA', suhu: 29.1 },
  { srcRow: 61, tanggal: '2025-11-18', bulan: 'November', tahun: '2025', merk: '153 - BK', bobot: 885.5, hasil: 882.4, susutKg: 3.1, susutPct: 0.35, molen: 'MOLEN AB', suhu: 29.3 },
  { srcRow: 62, tanggal: '2025-12-15', bulan: 'Desember', tahun: '2025', merk: '153 - BK', bobot: 883.0, hasil: 880.1, susutKg: 2.9, susutPct: 0.33, molen: 'MOLEN AC', suhu: 29.0 },
];

/**
 * Agregat ringkasan tahunan 2026 dan bulanan terverifikasi
 * langsung dari dokumen resmi PT Batu Karang Divisi Produksi I.
 */
export const VERIFIED_KPI_BENCHMARK = {
  // Semua Tahun (Kumulatif 4647 entri s/d 9 Oktober 2026)
  semuaTahun: {
    bahanDiproses: 4088613.6,
    hasilProses: 4075463.5,
    susutKg: 13150.1,
    susutRataPct: 0.32,
    susutMinPct: -2.05,
    susutMaxPct: 0.81,
    suhuRata: 29.68,
    jumlahData: 4647,
    entriTerkini: '9 Oktober 2026',
  },
  tahun2026: {
    bahanDiproses: 1750716.2,
    hasilProses: 1745432.1,
    susutKg: 5284.1,
    susutRataPct: 0.30,
    susutMinPct: -2.05,
    susutMaxPct: 0.73,
    suhuRata: 29.61,
    jumlahData: 1998,
    entriTerkini: '9 Oktober 2026',
  },
  agustus2026: {
    bahanDiproses: 113429.2,
    hasilProses: 113143.6,
    susutKg: 285.6,
    susutRataPct: 0.25,
    susutMinPct: -0.96,
    susutMaxPct: 0.42,
    suhuRata: 28.50,
    jumlahData: 131,
  },
  merk2026: [
    { merk: '153 - BK', jumlahData: 1777, bahanDiproses: 1570745.7, hasilProses: 1563936.0, susutKg: 5057.3, susutRataPct: 0.32, kapasitasPct: 90.95 },
    { merk: 'KARANG - BK', jumlahData: 135, bahanDiproses: 118963.7, hasilProses: 118797.6, susutKg: 166.1, susutRataPct: 0.14, kapasitasPct: 6.89 },
    { merk: 'FR LN - AVE', jumlahData: 26, bahanDiproses: 15527.1, hasilProses: 15537.3, susutKg: -10.2, susutRataPct: -0.07, kapasitasPct: 0.90 },
    { merk: 'SP 153 - BK', jumlahData: 4, bahanDiproses: 3534.5, hasilProses: 3524.7, susutKg: 9.8, susutRataPct: 0.28, kapasitasPct: 0.20 },
    { merk: 'FR LA BOLD - BK', jumlahData: 3, bahanDiproses: 2138.5, hasilProses: 2136.3, susutKg: 2.2, susutRataPct: 0.10, kapasitasPct: 0.12 },
    { merk: 'TIS - KBT24', jumlahData: 6, bahanDiproses: 1899.6, hasilProses: 1900.9, susutKg: -1.3, susutRataPct: -0.07, kapasitasPct: 0.11 },
  ],
  bulan2026: [
    { bulan: 'Januari', jumlahData: 211, bahanDiproses: 185136.7, hasilProses: 184514.0, susutKg: 622.7, susutRataPct: 0.34, susutMinPct: -0.16, susutMaxPct: 0.68, suhuRata: 30.0 },
    { bulan: 'Februari', jumlahData: 274, bahanDiproses: 241856.8, hasilProses: 241181.6, susutKg: 675.2, susutRataPct: 0.28, susutMinPct: -0.18, susutMaxPct: 0.65, suhuRata: 29.4 },
    { bulan: 'Maret', jumlahData: 152, bahanDiproses: 134361.8, hasilProses: 133976.6, susutKg: 385.2, susutRataPct: 0.29, susutMinPct: -0.18, susutMaxPct: 0.63, suhuRata: 28.9 },
    { bulan: 'April', jumlahData: 240, bahanDiproses: 210634.6, hasilProses: 209998.7, susutKg: 635.9, susutRataPct: 0.30, susutMinPct: -0.53, susutMaxPct: 0.62, suhuRata: 30.8 },
    { bulan: 'Mei', jumlahData: 248, bahanDiproses: 217727.0, hasilProses: 216981.6, susutKg: 745.4, susutRataPct: 0.34, susutMinPct: -0.08, susutMaxPct: 0.55, suhuRata: 30.7 },
    { bulan: 'Juni', jumlahData: 269, bahanDiproses: 235481.1, hasilProses: 234717.6, susutKg: 763.5, susutRataPct: 0.32, susutMinPct: -0.15, susutMaxPct: 0.73, suhuRata: 29.5 },
    { bulan: 'Juli', jumlahData: 247, bahanDiproses: 216599.8, hasilProses: 215935.2, susutKg: 664.6, susutRataPct: 0.31, susutMinPct: -0.39, susutMaxPct: 0.54, suhuRata: 28.4 },
    { bulan: 'Agustus', jumlahData: 131, bahanDiproses: 113429.2, hasilProses: 113143.6, susutKg: 285.6, susutRataPct: 0.25, susutMinPct: -0.96, susutMaxPct: 0.42, suhuRata: 28.5 },
    { bulan: 'September', jumlahData: 190, bahanDiproses: 164384.2, hasilProses: 163950.6, susutKg: 433.6, susutRataPct: 0.26, susutMinPct: -2.05, susutMaxPct: 0.61, suhuRata: 29.6 },
    { bulan: 'Oktober', jumlahData: 36, bahanDiproses: 31105.0, hasilProses: 31032.6, susutKg: 72.4, susutRataPct: 0.23, susutMinPct: -0.14, susutMaxPct: 0.41, suhuRata: 30.3 },
  ],
  molen2026: [
    { label: 'MOLEN AA', jumlahData: 412, bahanDiproses: 361200.0, hasilProses: 360116.4, susutKg: 1083.6, susutRataPct: 0.30, kapasitasPct: 20.91 },
    { label: 'MOLEN AB', jumlahData: 388, bahanDiproses: 340150.0, hasilProses: 339163.6, susutKg: 986.4, susutRataPct: 0.29, kapasitasPct: 19.70 },
    { label: 'MOLEN AC', jumlahData: 405, bahanDiproses: 355080.0, hasilProses: 354014.8, susutKg: 1065.2, susutRataPct: 0.30, kapasitasPct: 20.56 },
    { label: 'MOLEN AD', jumlahData: 376, bahanDiproses: 329720.0, hasilProses: 328697.9, susutKg: 1022.1, susutRataPct: 0.31, kapasitasPct: 19.09 },
    { label: 'MOLEN AE', jumlahData: 350, bahanDiproses: 306915.4, hasilProses: 305867.4, susutKg: 1048.0, susutRataPct: 0.34, kapasitasPct: 17.77 },
    { label: 'MOLEN AF', jumlahData: 40, bahanDiproses: 34000.0, hasilProses: 33977.4, susutKg: 22.6, susutRataPct: 0.07, kapasitasPct: 1.97 },
  ],
};
