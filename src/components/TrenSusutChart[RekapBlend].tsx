import React, { useState, useId, useRef } from 'react';
import { RekapBulanItem } from '../types[RekapBlend]';
import { fmtKg, fmtPct, fmtInt } from '../api[RekapBlend]';
import { TrendingDown, Maximize2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface TrenSusutChartProps {
  data: RekapBulanItem[];
  isModal?: boolean;
  onExpand?: () => void;
}

export const TrenSusutChartRekapBlend: React.FC<TrenSusutChartProps> = ({
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
        Data grafik tren susut tidak tersedia
      </div>
    );
  }

  // Dimension scaling
  const chartWidth = isModal ? 880 : 680;
  const chartHeight = isModal ? 380 : 270;
  const paddingLeft = isModal ? 60 : 52;
  const paddingRight = isModal ? 35 : 25;
  const paddingTop = isModal ? 45 : 32;
  const paddingBottom = isModal ? 45 : 36;

  const usableW = chartWidth - paddingLeft - paddingRight;
  const usableH = chartHeight - paddingTop - paddingBottom;
  const step = usableW / Math.max(data.length - 1, 1);

  // Dynamic Y-range with clean grid intervals (typically 0.00% s/d 0.60%)
  const susutVals = data.map((d) => d.susutRataPct);
  const maxVal = Math.max(...susutVals, 0.50);
  const minVal = Math.min(...susutVals, 0.15);

  const yMax = Math.max(0.60, Math.ceil((maxVal + 0.06) * 10) / 10);
  const yMin = Math.max(0.00, Math.floor((minVal - 0.05) * 10) / 10);
  const yRange = yMax - yMin || 1;

  // Grid steps (e.g. 0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60)
  const yTicks: number[] = [];
  const tickStep = yRange > 0.5 ? 0.10 : 0.05;
  for (let t = yMin; t <= yMax + 0.001; t += tickStep) {
    yTicks.push(Math.round(t * 100) / 100);
  }

  // Calculate coordinates for data points
  const points = data.map((d, i) => {
    const x = paddingLeft + i * step;
    const y = paddingTop + ((yMax - d.susutRataPct) / yRange) * usableH;
    return { x, y, data: d, index: i };
  });

  // Catmull-Rom to Cubic Bezier curve path generator
  const buildSmoothCurve = (pts: { x: number; y: number }[]): string => {
    if (pts.length <= 1) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : '';
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Bezier control points calculation (tension = 0.5)
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const curvePath = buildSmoothCurve(points);
  const bottomY = chartHeight - paddingBottom;
  const areaPath = points.length > 0
    ? `${curvePath} L ${points[points.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${points[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`
    : '';

  // Batas toleransi Y coordinate
  const thresholdPct = 0.50;
  const thresholdY = paddingTop + ((yMax - thresholdPct) / yRange) * usableH;

  // Key KPI summary badges
  const totalBahan = data.reduce((s, d) => s + d.bahanDiproses, 0);
  const totalSusut = data.reduce((s, d) => s + d.susutKg, 0);
  const avgSusut = totalBahan ? (totalSusut / totalBahan) * 100 : 0.30;
  const minItem = [...data].sort((a, b) => a.susutRataPct - b.susutRataPct)[0];
  const maxItem = [...data].sort((a, b) => b.susutRataPct - a.susutRataPct)[0];

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div
      className={`relative select-none ${
        isModal ? 'w-full' : 'bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md rounded-2xl p-4 sm:p-5 shadow-xs transition-all'
      }`}
      onClick={!isModal && onExpand ? onExpand : undefined}
    >
      {/* Chart Top Header & Summary Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                TREN SUSUT RATA-RATA (%) PER BULAN
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Grafik Kontur Mutu Susut Proses Blend · Batas Toleransi Maksimal 0,50%
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Rata-rata: {fmtPct(avgSusut)}%</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Optimal: {minItem ? `${minItem.bulan.substring(0, 3)} (${fmtPct(minItem.susutRataPct)}%)` : '-'}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Toleransi Max: 0,50%</span>
          </div>

          {!isModal && onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="Perbesar Grafik ke Tengah Layar"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Container */}
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
            {/* Linear Gradient for Area Fill */}
            <linearGradient id={`susutAreaGrad_${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.01" />
            </linearGradient>

            {/* Filter for subtle line shadow */}
            <filter id={`lineGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1d4ed8" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = paddingTop + ((yMax - tick) / yRange) * usableH;
            const isThreshold = Math.abs(tick - thresholdPct) < 0.001;

            if (isThreshold) return null; // Rendered distinctly below

            return (
              <g key={`ytick-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {tick.toFixed(2)}%
                </text>
              </g>
            );
          })}

          {/* 0.50% Red Threshold Line */}
          {thresholdY >= paddingTop && thresholdY <= bottomY && (
            <g>
              <line
                x1={paddingLeft}
                y1={thresholdY}
                x2={chartWidth - paddingRight}
                y2={thresholdY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
              <rect
                x={chartWidth - paddingRight - (isModal ? 150 : 130)}
                y={thresholdY - 18}
                width={isModal ? 145 : 125}
                height="16"
                rx="4"
                fill="#ffe4e6"
                stroke="#fecdd3"
                strokeWidth="1"
              />
              <text
                x={chartWidth - paddingRight - (isModal ? 77 : 67)}
                y={thresholdY - 6.5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#e11d48"
              >
                Toleransi Max 0,50%
              </text>
            </g>
          )}

          {/* Baseline X-Axis */}
          <line
            x1={paddingLeft}
            y1={bottomY}
            x2={chartWidth - paddingRight}
            y2={bottomY}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Area Gradient Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#susutAreaGrad_${uniqueId})`}
              className="transition-all duration-300"
            />
          )}

          {/* Smooth Curved Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth={isModal ? "4" : "3.5"}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#lineGlow_${uniqueId})`}
            />
          )}

          {/* Active Hover Crosshair Line */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={bottomY}
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Highlight Halo */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="10"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          )}

          {/* Data Points, Badges, and Month Labels */}
          {points.map((pt) => {
            const isHigh = pt.data.susutRataPct > 0.50;
            const isHovered = hoveredIdx === pt.index;

            return (
              <g key={`pt-${pt.data.label}`}>
                {/* Data Point Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '7.5' : isHigh ? '6' : '5.5'}
                  fill={isHovered ? '#1d4ed8' : '#ffffff'}
                  stroke={isHigh ? '#e11d48' : '#2563eb'}
                  strokeWidth={isHovered ? '3' : '2.5'}
                  className="transition-all duration-150"
                />

                {/* Value Tag Badge above the node */}
                <g transform={`translate(${pt.x - 20}, ${pt.y - 25})`}>
                  <rect
                    width="40"
                    height="18"
                    rx="4"
                    fill={isHigh ? '#ffe4e6' : isHovered ? '#1e3a8a' : '#eff6ff'}
                    stroke={isHigh ? '#f43f5e' : isHovered ? '#1e3a8a' : '#bfdbfe'}
                    strokeWidth="1"
                    className="shadow-xs transition-colors"
                  />
                  <text
                    x="20"
                    y="12.5"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fill={isHigh ? '#e11d48' : isHovered ? '#ffffff' : '#1e40af'}
                  >
                    {fmtPct(pt.data.susutRataPct)}%
                  </text>
                </g>

                {/* Month Name on X-Axis */}
                <text
                  x={pt.x}
                  y={bottomY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? '#1e293b' : '#64748b'}
                  className="transition-colors"
                >
                  {pt.data.bulan.substring(0, 3)}
                </text>

                {/* Year note on X-Axis in Modal mode */}
                {isModal && (
                  <text
                    x={pt.x}
                    y={bottomY + 28}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="500"
                    fill="#94a3b8"
                  >
                    {pt.data.tahun || '2026'}
                  </text>
                )}

                {/* Transparent Mouse Target Column for smooth hover */}
                <rect
                  x={pt.x - step / 2}
                  y={paddingTop}
                  width={step}
                  height={usableH + 30}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredIdx(pt.index);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Dark Tooltip (Dynamically positioned above or below cursor to never obstruct points) */}
        {activePoint && (() => {
          const containerW = containerRef.current?.clientWidth || chartWidth;
          const containerH = containerRef.current?.clientHeight || chartHeight;

          // If mousePos is available use exact mouse coordinates, otherwise use point scaled coordinates
          const posX = mousePos ? mousePos.x : (activePoint.x / chartWidth) * containerW;
          const posY = mousePos ? mousePos.y : (activePoint.y / chartHeight) * containerH;
          const relativeY = mousePos ? mousePos.relativeY : activePoint.y / chartHeight;

          // When cursor/point is in the lower half (>0.46), place tooltip ABOVE (with extra margin so dot and badge are visible)
          // When cursor/point is in the upper half (<=0.46), place tooltip BELOW
          const placeAbove = relativeY > 0.46;

          return (
            <div
              className={`absolute z-30 pointer-events-none transition-transform duration-75 ease-out ${
                activePoint.index <= 1
                  ? 'translate-x-0'
                  : activePoint.index >= points.length - 2
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
            <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-xl p-3 min-w-[210px] text-xs">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 mb-2">
                <span className="font-bold text-slate-200">
                  📅 {activePoint.data.bulan} {activePoint.data.tahun || '2026'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {fmtInt(activePoint.data.jumlahData)} Camp
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-300 font-medium">Susut Rata-rata:</span>
                <span className="text-amber-300 font-black text-sm tracking-wide">
                  {fmtPct(activePoint.data.susutRataPct)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9.5px]">Bahan Diproses</div>
                  <div className="font-semibold text-cyan-300">{fmtKg(activePoint.data.bahanDiproses)} Kg</div>
                </div>
                <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9.5px]">Hasil Proses</div>
                  <div className="font-semibold text-emerald-300">{fmtKg(activePoint.data.hasilProses)} Kg</div>
                </div>
                <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9.5px]">Selisih Susut</div>
                  <div className="font-semibold text-rose-300">{fmtKg(activePoint.data.susutKg)} Kg</div>
                </div>
                <div className="bg-slate-800/50 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9.5px]">Status Mutu</div>
                  <div className={`font-semibold ${activePoint.data.susutRataPct <= 0.50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activePoint.data.susutRataPct <= 0.50 ? '✅ Aman' : '⚠️ Melebihi'}
                  </div>
                </div>
              </div>
            </div>
            </div>
          );
        })()}
      </div>

      {/* Footer Info Legend */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            Garis Kontur Susut (%)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-600">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
            Batas Maksimal (0,50%)
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          💡 Arahkan kursor / sentuh titik untuk melihat detail data blend
        </span>
      </div>
    </div>
  );
};
