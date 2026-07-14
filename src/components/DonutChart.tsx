import React, { useState } from 'react';

interface Segment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel = 'Total',
  centerValue,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const segments = data.map((item, idx) => {
    const percent = total > 0 ? item.value / total : 0;
    const strokeDash = percent * circumference;
    const strokeOffset =
      circumference - accumulatedPercent * circumference + circumference * 0.25; // Rotate by 90deg start
    accumulatedPercent += percent;

    return {
      ...item,
      strokeDash,
      strokeOffset,
      percent,
      idx,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
      <div className="relative h-44 w-44">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90 transform"
        >
          {/* Base track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/40"
          />

          {/* Data segments */}
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.idx;
            return (
              <circle
                key={seg.name}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${seg.strokeDash} ${circumference}`}
                strokeDashoffset={seg.strokeOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: isHovered
                    ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))'
                    : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            {hoveredIdx !== null ? segments[hoveredIdx].name : centerLabel}
          </span>
          <span className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-slate-100">
            {hoveredIdx !== null
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(segments[hoveredIdx].value)
              : centerValue ||
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(total)}
          </span>
          {total > 0 && (
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {hoveredIdx !== null
                ? `${(segments[hoveredIdx].percent * 100).toFixed(1)}%`
                : '100%'}
            </span>
          )}
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-col gap-2.5">
        {segments.map((seg) => {
          const isHovered = hoveredIdx === seg.idx;
          return (
            <div
              key={seg.name}
              className={`flex items-center gap-3 rounded-lg px-2 py-1 transition-all ${
                isHovered ? 'bg-slate-100 dark:bg-white/5' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(seg.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {seg.name}
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(seg.value)}{' '}
                  <span className="font-normal text-slate-400 dark:text-slate-500">
                    ({(seg.percent * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
