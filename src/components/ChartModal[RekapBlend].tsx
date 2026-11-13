import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2, TrendingDown, Scale, BarChart2, Cpu, Calendar } from 'lucide-react';
import { fmtKg, fmtPct } from '../api[RekapBlend]';
import { TrenSusutChartRekapBlend } from './TrenSusutChart[RekapBlend]';
import { BarBahanHasilChartRekapBlend } from './BarBahanHasilChart[RekapBlend]';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chartType: 'line_susut' | 'bar_bahan_hasil' | 'bar_merk' | 'line_trend_merk' | 'bar_molen' | null;
  data: any;
}

export const ChartModalRekapBlend: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  title,
  chartType,
  data,
}) => {
  // Support Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !chartType || !data) return null;

  const chartHeight = 420;
  const paddingLeft = 55;
  const paddingRight = 35;
  const paddingTop = 40;
  const paddingBottom = 55;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 md:backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full p-4 sm:p-7 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl border border-slate-200/90 relative max-h-[92dvh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Mode Presentasi & Zoom Grafik
              </div>
              <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Tutup</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Chart Presentation Canvas */}
        <div className="w-full flex-1 min-h-[260px] sm:min-h-[400px] select-none bg-slate-50/70 p-2.5 sm:p-6 rounded-2xl border border-slate-200/80 mt-3 sm:mt-4 relative overflow-x-auto flex flex-col justify-center">
          {/* 1. LINE CHART SUSUT BULAN (Model Grafik Garis Sesuai Gambar Referensi) */}
          {chartType === 'line_susut' && (
            <div className="w-full flex-1 flex flex-col justify-center">
              <TrenSusutChartRekapBlend data={data} isModal={true} />
            </div>
          )}

          {/* 2. BAR CHART BAHAN DIPROSES VS HASIL PROSES */}
          {chartType === 'bar_bahan_hasil' && (
            <div className="w-full flex-1 flex flex-col justify-center">
              <BarBahanHasilChartRekapBlend data={data} isModal={true} />
            </div>
          )}

          {/* 3. BAR CHART MERK / MOLEN */}
          {(chartType === 'bar_merk' || chartType === 'bar_molen') && (
            <svg className="w-full h-full" viewBox={`0 0 900 ${chartHeight}`} preserveAspectRatio="none">
              {(() => {
                const list = data as any[];
                const maxVal = Math.max(...list.map((m) => m.susutRataPct), 0.5);
                const minVal = Math.min(...list.map((m) => m.susutRataPct), -0.15);
                const vRange = maxVal - minVal || 1;
                const usableW = 900 - paddingLeft - paddingRight;
                const colW = usableW / Math.max(list.length, 1);
                const barWidth = Math.min(colW * 0.52, 75);
                const zeroY =
                  paddingTop + ((maxVal - 0) / vRange) * (chartHeight - paddingTop - paddingBottom);

                return (
                  <>
                    {/* Zero Line */}
                    <line
                      x1={paddingLeft}
                      y1={zeroY}
                      x2={900 - paddingRight}
                      y2={zeroY}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {list.map((m, idx) => {
                      const x = paddingLeft + idx * colW + (colW - barWidth) / 2;
                      const yVal =
                        paddingTop +
                        ((maxVal - m.susutRataPct) / vRange) * (chartHeight - paddingTop - paddingBottom);
                      const isNegative = m.susutRataPct < 0;
                      const barH = Math.max(Math.abs(zeroY - yVal), 5);
                      const barY = isNegative ? zeroY : yVal;
                      const barColor = isNegative
                        ? '#10b981'
                        : chartType === 'bar_molen'
                        ? '#7c3aed'
                        : '#1a56c4';

                      return (
                        <g key={m.label}>
                          <rect
                            x={x}
                            y={barY}
                            width={barWidth}
                            height={barH}
                            fill={barColor}
                            rx="5"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={isNegative ? barY + barH + 15 : barY - 9}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="900"
                            fill={barColor}
                          >
                            {fmtPct(m.susutRataPct)}%
                          </text>
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight - 18}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#1e293b"
                            fontWeight="bold"
                          >
                            {m.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          )}

          {/* 4. LINE TREND SATU MERK */}
          {chartType === 'line_trend_merk' && (
            <svg className="w-full h-full" viewBox={`0 0 900 ${chartHeight}`} preserveAspectRatio="none">
              {(() => {
                const trend = data as { merk: string; data: any[] };
                const points = trend.data;
                const maxVal = Math.max(...points.map((d) => d.susutRataPct), 0.45);
                const minVal = Math.min(...points.map((d) => d.susutRataPct), -0.15);
                const vRange = maxVal - minVal || 1;
                const usableW = 900 - paddingLeft - paddingRight;
                const step = usableW / Math.max(points.length - 1, 1);

                const polyPoints = points
                  .map((d, i) => {
                    const x = paddingLeft + i * step;
                    const y =
                      paddingTop +
                      ((maxVal - d.susutRataPct) / vRange) * (chartHeight - paddingTop - paddingBottom);
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <>
                    <line
                      x1={paddingLeft}
                      y1={chartHeight - paddingBottom}
                      x2={900 - paddingRight}
                      y2={chartHeight - paddingBottom}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <polyline
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="4"
                      points={polyPoints}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((d, i) => {
                      const x = paddingLeft + i * step;
                      const y =
                        paddingTop +
                        ((maxVal - d.susutRataPct) / vRange) * (chartHeight - paddingTop - paddingBottom);

                      return (
                        <g key={d.label}>
                          <line
                            x1={x}
                            y1={y}
                            x2={x}
                            y2={chartHeight - paddingBottom}
                            stroke="#fde68a"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <circle cx={x} cy={y} r="6" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" />
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#92400e"
                            fontWeight="900"
                          >
                            {fmtPct(d.susutRataPct)}%
                          </text>
                          <text
                            x={x}
                            y={chartHeight - 18}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#475569"
                            fontWeight="bold"
                          >
                            {d.bulan}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          )}
        </div>

        {/* Footer info in modal */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>💡 Tips: Klik di luar jendela atau tekan tombol ESC pada keyboard untuk kembali.</div>
          <div className="font-semibold text-slate-700">PT Batu Karang · Divisi Produksi I</div>
        </div>
      </div>
    </div>
  );
};
