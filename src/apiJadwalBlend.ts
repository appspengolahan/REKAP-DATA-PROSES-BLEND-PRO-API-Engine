import { WeeklyBlendPlanData, DailyBlendScheduleItem } from './types[RekapBlend]';

export const PLANING_SPREADSHEET_ID = '1qnTh5PL0oitFtH7tx7pI1r4jBnWk9vgVuUVJnWUAvk4';
export const PLANING_SHEET_NAME = 'PLANING BLEND MINGGUAN';
export const PLANING_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${PLANING_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
  PLANING_SHEET_NAME
)}`;

const CACHE_KEY = 'rekap_blend_weekly_plan_cache_v1';

export const DEFAULT_WEEKLY_PLAN_DATA: WeeklyBlendPlanData = {
  dates: {
    senin: 'Senin, 09 November 2026',
    selasa: 'Selasa, 10 November 2026',
    rabu: 'Rabu, 11 November 2026',
    kamis: 'Kamis, 12 November 2026',
    jumat: 'Jumat, 13 November 2026',
    sabtu: 'Sabtu, 14 November 2026',
    minggu: 'Minggu, 15 November 2026',
  },
  schedules: [
    {
      blendName: '153 - BK',
      kapasitas: '@ 600',
      senin: 7,
      selasa: 3,
      rabu: 9,
      kamis: 6,
      jumat: 10,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 35,
    },
    {
      blendName: 'SP 153 - BK',
      kapasitas: '@ 600',
      senin: 0,
      selasa: 0,
      rabu: 0,
      kamis: 0,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 0,
    },
    {
      blendName: 'KARANG - BK',
      kapasitas: '@ 600',
      senin: 0,
      selasa: 4,
      rabu: 0,
      kamis: 3,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 7,
    },
    {
      blendName: 'F REGULER (LN, AVE)',
      kapasitas: '@ 300',
      senin: 1,
      selasa: 0,
      rabu: 0,
      kamis: 0,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 1,
    },
    {
      blendName: 'F REGULER LA BOLD-BK',
      kapasitas: '@ 300',
      senin: 0,
      selasa: 0,
      rabu: 0,
      kamis: 0,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 0,
    },
    {
      blendName: 'F REGULER',
      kapasitas: '-',
      senin: 0,
      selasa: 0,
      rabu: 0,
      kamis: 0,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 0,
    },
    {
      blendName: 'TIS KBT24',
      kapasitas: '@ 140',
      senin: 0,
      selasa: 1,
      rabu: 0,
      kamis: 0,
      jumat: 0,
      sabtu: 0,
      minggu: 0,
      totalCampuran: 1,
    },
  ],
  dailyTotals: {
    senin: 8,
    selasa: 8,
    rabu: 9,
    kamis: 9,
    jumat: 10,
    sabtu: 0,
    minggu: 0,
    total: 44,
  },
};

/**
 * Helper parsing string CSV dengan aman menangani tanda kutip ganda dan koma
 */
export function parseCsvRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/);
  const result: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const row: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        row.push(cur.replace(/^"|"$/g, '').trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    row.push(cur.replace(/^"|"$/g, '').trim());
    result.push(row);
  }

  return result;
}

/**
 * Mengambil data perencanaan blend mingguan ter-cache dari localStorage
 */
export function getCachedWeeklyBlendPlan(): WeeklyBlendPlanData {
  if (typeof window === 'undefined') return DEFAULT_WEEKLY_PLAN_DATA;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schedules && parsed.dailyTotals) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca cache jadwal alokasi blend:', err);
  }
  return DEFAULT_WEEKLY_PLAN_DATA;
}

/**
 * Menyimpan data perencanaan blend mingguan ke localStorage
 */
export function saveCachedWeeklyBlendPlan(data: WeeklyBlendPlanData): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Gagal menyimpan cache jadwal alokasi blend:', err);
    }
  }
}

/**
 * Tarik data live langsung dari sheet "PLANING BLEND MINGGUAN"
 */
export async function fetchLiveWeeklyBlendPlan(): Promise<WeeklyBlendPlanData> {
  const url = `${PLANING_GVIZ_URL}&v=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal menghubungi Google Sheets (HTTP ${response.status})`);
  }

  const csvText = await response.text();
  const rows = parseCsvRows(csvText);

  if (!rows || rows.length < 3) {
    throw new Error('Data sheet PLANING BLEND MINGGUAN tidak memiliki baris yang cukup');
  }

  // Baris 2 (indeks 1): Tanggal Harian
  // Kolom D (3) s/d Kolom J (9): Senin s/d Minggu
  const dateRow = rows[1] || [];
  const dates = {
    senin: dateRow[3] || 'Senin, 09 November 2026',
    selasa: dateRow[4] || 'Selasa, 10 November 2026',
    rabu: dateRow[5] || 'Rabu, 11 November 2026',
    kamis: dateRow[6] || 'Kamis, 12 November 2026',
    jumat: dateRow[7] || 'Jumat, 13 November 2026',
    sabtu: dateRow[8] || 'Sabtu, 14 November 2026',
    minggu: dateRow[9] || 'Minggu, 15 November 2026',
  };

  const schedules: DailyBlendScheduleItem[] = [];
  const dailyTotals = {
    senin: 0,
    selasa: 0,
    rabu: 0,
    kamis: 0,
    jumat: 0,
    sabtu: 0,
    minggu: 0,
    total: 0,
  };

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  };

  // Baris 3 ke bawah: Item Blend
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 3) continue;

    const rawName = String(row[1] || '').trim();
    if (!rawName) continue;

    // Bersihkan nama merk: jika tertulis "F REGULERGG – BK" rapikan jadi "F REGULER"
    let cleanName = rawName;
    if (/f\s*regulergg/i.test(cleanName)) {
      cleanName = 'F REGULER';
    } else if (/tis\s+kbt24/i.test(cleanName)) {
      cleanName = 'TIS KBT24';
    }

    const kapasitas = String(row[2] || '').trim() || '-';

    // Cek apakah ini baris TOTAL
    if (rawName.toUpperCase().includes('TOTAL')) {
      dailyTotals.senin = parseNum(row[3]);
      dailyTotals.selasa = parseNum(row[4]);
      dailyTotals.rabu = parseNum(row[5]);
      dailyTotals.kamis = parseNum(row[6]);
      dailyTotals.jumat = parseNum(row[7]);
      dailyTotals.sabtu = parseNum(row[8]);
      dailyTotals.minggu = parseNum(row[9]);
      dailyTotals.total = parseNum(row[10]) || (
        dailyTotals.senin + dailyTotals.selasa + dailyTotals.rabu + dailyTotals.kamis +
        dailyTotals.jumat + dailyTotals.sabtu + dailyTotals.minggu
      );
      continue;
    }

    const senin = parseNum(row[3]);
    const selasa = parseNum(row[4]);
    const rabu = parseNum(row[5]);
    const kamis = parseNum(row[6]);
    const jumat = parseNum(row[7]);
    const sabtu = parseNum(row[8]);
    const minggu = parseNum(row[9]);
    const totalCampuran = parseNum(row[10]) || (senin + selasa + rabu + kamis + jumat + sabtu + minggu);

    schedules.push({
      blendName: cleanName,
      kapasitas,
      senin,
      selasa,
      rabu,
      kamis,
      jumat,
      sabtu,
      minggu,
      totalCampuran,
    });
  }

  // Jika baris total tidak ditemukan, kalkulasi dari schedules
  if (dailyTotals.total === 0 && schedules.length > 0) {
    schedules.forEach((s) => {
      dailyTotals.senin += s.senin;
      dailyTotals.selasa += s.selasa;
      dailyTotals.rabu += s.rabu;
      dailyTotals.kamis += s.kamis;
      dailyTotals.jumat += s.jumat;
      dailyTotals.sabtu += s.sabtu;
      dailyTotals.minggu += s.minggu;
      dailyTotals.total += s.totalCampuran;
    });
  }

  const finalData: WeeklyBlendPlanData = {
    dates,
    schedules,
    dailyTotals,
  };

  saveCachedWeeklyBlendPlan(finalData);
  return finalData;
}
