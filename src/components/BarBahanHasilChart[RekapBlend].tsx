import React, { useState, useId, useRef } from 'react';
import { RekapBulanItem } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtInt, fmtSuhu } from '../api[RekapBlend]';
import { BarChart2, Maximize2, Scale, ArrowUpRight, TrendingDown } from 'lucide-react';

interface BarBahanHasilChartProps {
  data: RekapBulanItem[];
  isModal?: boolean;
  onExpand?: () => void;
}

export const BarBahanHasilChartRekapBlend: React.FC<BarBahanHasilChartProps> = ({
  data,
  isModal = false,
  onExpand,
}) => {
  const uniqueId = useId().replace(/:/g, '_');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; relativeY: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Data grafik balok tidak tersedia
      </div>
    );
  }

  // Dimension scaling
  const chartWidth = isModal ? 880 : 680;
  const chartHeight = isModal ? 380 : 270;
  const paddingLeft = isModal ? 65 : 52;
  const paddingRight = isModal ? 35 : 25;
  const paddingTop = isModal ? 42 : 30;
  const paddingBottom = isModal ? 45 : 36;

  const usableW = chartWidth - paddingLeft - paddingRight;
  const usableH = chartHeight - paddingTop - paddingBottom;
  const colWidth = usableW / Math.max(data.length, 1);
  const barW = Math.max(colWidth * 0.34, isModal ? 12 : 7);

  // Maximum weight scaling with headroom for numbers
  const maxBobotVal = Math.max(
    ...data.map((d) => Math.max(d.bahanDiproses, d.hasilProses)),
    100000
  );
  // Round up max to nice interval (e.g. 50k, 100k, 150k, 200k, 250k)
  const ceiling = Math.ceil((maxBobotVal * 1.18) / 25000) * 25000;
  const yMax = Math.max(ceiling, 100000);

  // Y-axis tick intervals (e.g. 4-5 ticks)
  const tickStep = yMax <= 150000 ? 25000 : 50000;
  const yTicks: number[] = [];
  for (let t = 0; t <= yMax + 1; t += tickStep) {
    yTicks.push(t);
  }

  const bottomY = chartHeight - paddingBottom;

  // Active hovered month item
  const activeItem = hoveredIdx !== null && data[hoveredIdx] ? { item: data[hoveredIdx], index: hoveredIdx } : null;

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-xs transition-all relative select-none flex flex-col justify-between ${
        isModal
          ? 'p-2 sm:p-4 border-none shadow-none bg-transparent'
          : 'p-4 sm:p-5 hover:border-emerald-400 hover:shadow-md'
      }`}
    >
      {/* Header Info */}
      {!isModal && (
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-700 transition">
              <BarChart2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perbandingan Bahan Diproses vs Hasil Proses</span>
            </h4>
            <div className="flex items-center gap-3 text-[11px] mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-blue-700 font-semibold">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span> Bahan Masuk (rb Kg)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span> Hasil Jadi (rb Kg)
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                • Angka di atas balok: Ribu Kg (rb)
              </span>
            </div>
          </div>

          {onExpand && (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition cursor-pointer" onClick={onExpand}>
                Klik untuk Expand ⤢
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                title="Perbesar Grafik ke Tengah Layar"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SVG Container with Mouse Tracking */}
      <div
        ref={containerRef}
        className={`w-full relative ${isModal ? 'h-[360px] sm:h-[420px]' : 'h-64 sm:h-72'}`}
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const relativeY = Math.max(0, Math.min(1, y / rect.height));
          setMousePos({ x, y, relativeY });
        }}
        onMouseLeave={() => {
          setHoveredIdx(null);
          setMousePos(null);
        }}
      >
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Subtle Gradient for Bahan Bars */}
            <linearGradient id={`barBahanGrad_${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Subtle Gradient for Hasil Bars */}
            <linearGradient id={`barHasilGrad_${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Active Glow Filter */}
            <filter id={`barGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = paddingTop + ((yMax - tick) / yMax) * usableH;
            const tickLabel = tick === 0 ? '0' : `${Math.round(tick / 1000)}k`;

            return (
              <g key={`ytick-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={tick === 0 ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth={tick === 0 ? '1.2' : '1'}
                  strokeDasharray={tick === 0 ? 'none' : '4 4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={isModal ? '10' : '9'}
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {tickLabel}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={bottomY}
            x2={chartWidth - paddingRight}
            y2={bottomY}
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Render Bars and Labels for each Month */}
          {data.map((d, i) => {
            const xBase = paddingLeft + i * colWidth;
            const isHovered = hoveredIdx === i;

            const hBahan = (d.bahanDiproses / yMax) * usableH;
            const hHasil = (d.hasilProses / yMax) * usableH;
            const yBahan = bottomY - hBahan;
            const yHasil = bottomY - hHasil;

            const spacing = isModal ? 5 : 3.5;
            const xBahan = xBase + colWidth * 0.12;
            const xHasil = xBahan + barW + spacing;

            const xBahanCenter = xBahan + barW / 2;
            const xHasilCenter = xHasil + barW / 2;
            const xMonthCenter = xBase + colWidth * 0.5;

            const textBahan = (d.bahanDiproses / 1000).toLocaleString('id-ID', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });
            const textHasil = (d.hasilProses / 1000).toLocaleString('id-ID', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });

            return (
              <g key={d.label || d.bulan}>
                {/* Column Background Highlight on Hover */}
                {isHovered && (
                  <rect
                    x={xBase + 2}
                    y={paddingTop - 6}
                    width={colWidth - 4}
                    height={usableH + 12}
                    fill="#3b82f6"
                    fillOpacity="0.07"
                    rx="6"
                  />
                )}

                {/* Bar Bahan (Blue) */}
                <rect
                  x={xBahan}
                  y={yBahan}
                  width={barW}
                  height={Math.max(hBahan, 3)}
                  fill={isHovered ? '#1d4ed8' : `url(#barBahanGrad_${uniqueId})`}
                  rx={isModal ? 3.5 : 2.5}
                  filter={isHovered ? `url(#barGlow_${uniqueId})` : undefined}
                  className="transition-all duration-150"
                />

                {/* Angka Indikator Bahan */}
                <text
                  x={xBahanCenter}
                  y={yBahan - (isModal ? 6 : 4)}
                  textAnchor="middle"
                  fontSize={isModal ? '9' : '7.5'}
                  fill={isHovered ? '#1d4ed8' : '#1e40af'}
                  fontWeight="800"
                >
                  {textBahan}
                </text>

                {/* Bar Hasil (Emerald) */}
                <rect
                  x={xHasil}
                  y={yHasil}
                  width={barW}
                  height={Math.max(hHasil, 3)}
                  fill={isHovered ? '#059669' : `url(#barHasilGrad_${uniqueId})`}
                  rx={isModal ? 3.5 : 2.5}
                  filter={isHovered ? `url(#barGlow_${uniqueId})` : undefined}
                  className="transition-all duration-150"
                />

                {/* Angka Indikator Hasil */}
                <text
                  x={xHasilCenter}
                  y={yHasil - (isModal ? 6 : 4)}
                  textAnchor="middle"
                  fontSize={isModal ? '9' : '7.5'}
                  fill={isHovered ? '#059669' : '#047857'}
                  fontWeight="800"
                >
                  {textHasil}
                </text>

                {/* X-Axis Month Label */}
                <text
                  x={xMonthCenter}
                  y={bottomY + (isModal ? 22 : 16)}
                  textAnchor="middle"
                  fontSize={isModal ? '11' : '9.5'}
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontWeight={isHovered ? '800' : '600'}
                >
                  {d.bulan.length > 3 ? d.bulan.substring(0, 3) : d.bulan}
                </text>

                {/* Interactive Transparent Column for Smooth Hover */}
                <rect
                  x={xBase}
                  y={paddingTop}
                  width={colWidth}
                  height={usableH + (isModal ? 35 : 25)}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredIdx(i);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Dark Tooltip (Dynamically positioned above or below cursor) */}
        {activeItem && (() => {
          const containerW = containerRef.current?.clientWidth || chartWidth;
          const containerH = containerRef.current?.clientHeight || chartHeight;

          const colCenterChart = paddingLeft + activeItem.index * colWidth + colWidth / 2;
          const posX = mousePos ? mousePos.x : (colCenterChart / chartWidth) * containerW;
          const posY = mousePos ? mousePos.y : containerH * 0.5;
          const relativeY = mousePos ? mousePos.relativeY : 0.5;

          // When cursor is in the lower half (>0.46), place tooltip ABOVE cursor
          // When cursor is in the upper half (<=0.46), place tooltip BELOW cursor
          const placeAbove = relativeY > 0.46;

          const yieldPct = activeItem.item.bahanDiproses > 0
            ? ((activeItem.item.hasilProses / activeItem.item.bahanDiproses) * 100).toFixed(2)
            : '100.00';

          return (
            <div
              className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                activeItem.index <= 1
                  ? 'translate-x-0'
                  : activeItem.index >= data.length - 2
                  ? '-translate-x-full'
                  : '-translate-x-1/2'
              } ${placeAbove ? '-translate-y-full mb-4' : 'translate-y-0 mt-4'}`}
              style={{
                left: `${Math.max(12, Math.min(posX, containerW - 12))}px`,
                top: placeAbove
                  ? `${Math.max(10, posY - 18)}px`
                  : `${Math.min(containerH - 10, posY + 18)}px`,
              }}
            >
              <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[230px] text-xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                  <span className="font-bold text-slate-200">
                    📅 {activeItem.item.bulan} {activeItem.item.tahun || '2026'}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    {fmtInt(activeItem.item.jumlahData)} Camp
                  </span>
                </div>

                {/* Primary Weight Comparison */}
                <div className="space-y-1.5 mb-2.5">
                  <div className="flex items-center justify-between bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-800/60">
                    <div className="flex items-center gap-1.5 text-blue-300 font-medium text-[11px]">
                      <span className="w-2 h-2 rounded-xs bg-blue-500"></span>
                      <span>Bahan Masuk:</span>
                    </div>
                    <span className="font-extrabold text-white text-[12px]">
                      {fmtKg(activeItem.item.bahanDiproses)} <span className="text-[10px] font-normal text-blue-300">Kg</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-800/60">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-medium text-[11px]">
                      <span className="w-2 h-2 rounded-xs bg-emerald-500"></span>
                      <span>Hasil Jadi:</span>
                    </div>
                    <span className="font-extrabold text-white text-[12px]">
                      {fmtKg(activeItem.item.hasilProses)} <span className="text-[10px] font-normal text-emerald-300">Kg</span>
                    </span>
                  </div>
                </div>

                {/* 2x2 Detail Metrics Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
                    <div className="text-slate-400 text-[9.5px]">Selisih Susut</div>
                    <div className="font-bold text-rose-300">
                      {fmtKg(activeItem.item.susutKg)} Kg
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
                    <div className="text-slate-400 text-[9.5px]">Susut Rata² (%)</div>
                    <div className="font-black text-amber-300">
                      {fmtPct(activeItem.item.susutRataPct)}%
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
                    <div className="text-slate-400 text-[9.5px]">Yield / Konversi</div>
                    <div className="font-bold text-cyan-300">{yieldPct}%</div>
                  </div>

                  <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
                    <div className="text-slate-400 text-[9.5px]">Status Mutu</div>
                    <div className={`font-semibold ${activeItem.item.susutRataPct <= 0.50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {activeItem.item.susutRataPct <= 0.50 ? '✅ Terkendali' : '⚠️ Melebihi'}
                    </div>
                  </div>
                </div>

                {activeItem.item.suhuRata !== null && activeItem.item.suhuRata !== undefined && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Suhu Rata-rata:</span>
                    <span className="font-semibold text-slate-200">{fmtSuhu(activeItem.item.suhuRata)}°C</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer Info Legend */}
      {!isModal && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-blue-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block"></span>
              Bahan Masuk
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
              Hasil Jadi
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            💡 Arahkan kursor ke balok untuk melihat rincian komparasi
          </span>
        </div>
      )}
    </div>
  );
};
