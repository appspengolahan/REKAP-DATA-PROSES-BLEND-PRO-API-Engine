import { WeeklyBlendPlanData, DailyBlendScheduleItem } from './types[RekapBlend]';
import { isHtmlPayload } from './api[RekapBlend]';

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
    { blendName: '153 - BK', kapasitas: '@ 600', senin: 7, selasa: 3, rabu: 9, kamis: 6, jumat: 10, sabtu: 0, minggu: 0, totalCampuran: 35 },
    { blendName: 'SP 153 - BK', kapasitas: '@ 600', senin: 0, selasa: 0, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 0 },
    { blendName: 'KARANG - BK', kapasitas: '@ 600', senin: 0, selasa: 4, rabu: 0, kamis: 3, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 7 },
    { blendName: 'F REGULER (LN, AVE)', kapasitas: '@ 300', senin: 1, selasa: 0, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 1 },
    { blendName: 'F REGULER LA BOLD-BK', kapasitas: '@ 300', senin: 0, selasa: 0, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 0 },
    { blendName: 'F REGULER', kapasitas: '—', senin: 0, selasa: 0, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 0 },
    { blendName: 'TIS KBT24', kapasitas: '@ 140', senin: 0, selasa: 1, rabu: 0, kamis: 0, jumat: 0, sabtu: 0, minggu: 0, totalCampuran: 1 },
  ],
  dailyTotals: { senin: 8, selasa: 8, rabu: 9, kamis: 9, jumat: 10, sabtu: 0, minggu: 0, total: 44 },
};

let _inMemoryWeeklyPlanCache: WeeklyBlendPlanData | null = null;

/**
 * Mengambil data perencanaan blend mingguan ter-cache dari memori / localStorage
 */
export function getCachedWeeklyBlendPlan(): WeeklyBlendPlanData {
  if (_inMemoryWeeklyPlanCache !== null) return _inMemoryWeeklyPlanCache;
  if (typeof window === 'undefined') return DEFAULT_WEEKLY_PLAN_DATA;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schedules && parsed.dailyTotals) {
        _inMemoryWeeklyPlanCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca cache jadwal alokasi blend:', err);
  }
  _inMemoryWeeklyPlanCache = DEFAULT_WEEKLY_PLAN_DATA;
  return DEFAULT_WEEKLY_PLAN_DATA;
}

/**
 * Menyimpan data perencanaan blend mingguan ke memori & localStorage
 */
export function saveCachedWeeklyBlendPlan(data: WeeklyBlendPlanData): void {
  _inMemoryWeeklyPlanCache = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Gagal menyimpan cache jadwal alokasi blend:', err);
    }
  }
}

/**
 * Logika Pengambilan & Parsing Data (Service Function)
 * Berdasarkan referensi implementasi dari modul Persediaan PP1
 */
export async function fetchWeeklyBlendPlan(): Promise<WeeklyBlendPlanData> {
  const SPREADSHEET_ID = '1qnTh5PL0oitFtH7tx7pI1r4jBnWk9vgVuUVJnWUAvk4';
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    'PLANING BLEND MINGGUAN'
  )}&t=${Date.now()}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal fetch GViz');
    const csv = await res.text();
    if (isHtmlPayload(res, csv) || csv.trim().startsWith('<')) {
      throw new Error('Endpoint mengembalikan HTML (bukan CSV GViz)');
    }

    // Parsing CSV Sederhana
    const lines = csv.split('\n').filter((l) => l.trim().length > 0);
    const parseCsvRow = (line: string) => {
      const row: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push(cur.replace(/^"|"$/g, '').trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      row.push(cur.replace(/^"|"$/g, '').trim());
      return row;
    };

    const parseNum = (v: any) => {
      if (!v) return 0;
      const clean = String(v).replace(/[^\d.,]/g, '').replace(',', '.');
      const n = parseFloat(clean);
      return isNaN(n) ? 0 : n;
    };

    if (lines.length >= 2) {
      const dateRow = parseCsvRow(lines[1]);
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
      let dailyTotals = {
        senin: 0,
        selasa: 0,
        rabu: 0,
        kamis: 0,
        jumat: 0,
        sabtu: 0,
        minggu: 0,
        total: 0,
      };

      for (let i = 2; i < lines.length; i++) {
        const r = parseCsvRow(lines[i]);
        const blendName = (r[1] || '').trim();
        if (!blendName) continue;
        if (blendName.toUpperCase() === 'TOTAL') {
          dailyTotals = {
            senin: parseNum(r[3]),
            selasa: parseNum(r[4]),
            rabu: parseNum(r[5]),
            kamis: parseNum(r[6]),
            jumat: parseNum(r[7]),
            sabtu: parseNum(r[8]),
            minggu: parseNum(r[9]),
            total: parseNum(r[10]),
          };
        } else {
          schedules.push({
            blendName,
            kapasitas: (r[2] || '').trim() || '—',
            senin: parseNum(r[3]),
            selasa: parseNum(r[4]),
            rabu: parseNum(r[5]),
            kamis: parseNum(r[6]),
            jumat: parseNum(r[7]),
            sabtu: parseNum(r[8]),
            minggu: parseNum(r[9]),
            totalCampuran: parseNum(r[10]),
          });
        }
      }

      const result: WeeklyBlendPlanData = { dates, schedules, dailyTotals };
      saveCachedWeeklyBlendPlan(result);
      return result;
    }
  } catch (err) {
    console.warn('Menggunakan baseline fallback jadwal alokasi:', err);
  }

  // Fallback Baseline Data jika jaringan offline
  return getCachedWeeklyBlendPlan();
}

/**
 * Alias untuk kompatibilitas
 */
export const fetchLiveWeeklyBlendPlan = fetchWeeklyBlendPlan;
