import React, { useState, useRef } from 'react';

interface Dataset {
  label: string;
  data: number[];
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
}

interface AreaChartProps {
  labels: string[];
  datasets: Dataset[];
  yAxisFormatter?: (value: number) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  labels,
  datasets,
  yAxisFormatter = (val) => `$${Math.round(val).toLocaleString()}`,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const maxPoints = Math.max(...datasets.map((d) => d.data.length), 1);
  const maxValue = Math.max(
    ...datasets.flatMap((d) => d.data),
    100 // Safe default minimum max
  );

  // SVG viewport size
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Helpers to get X and Y coordinates
  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (total - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return paddingTop + chartHeight - (value / maxValue) * chartHeight;
  };

  // Generate paths for line and area fill
  const charts = datasets.map((dataset, dIdx) => {
    const data = dataset.data;
    const len = data.length;

    if (len === 0) return null;

    const points = data.map((val, idx) => ({
      x: getX(idx, len),
      y: getY(val),
      val,
      idx,
    }));

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaPath =
      len > 0
        ? `${linePath} L ${points[len - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
        : '';

    return {
      dataset,
      points,
      linePath,
      areaPath,
      dIdx,
    };
  });

  // Thin out labels to display (e.g. 5 intervals)
  const numLabels = 5;
  const labelInterval = Math.max(1, Math.ceil(labels.length / numLabels));
  const renderedLabels = labels.filter(
    (_, idx) => idx % labelInterval === 0 || idx === labels.length - 1
  );

  // Y-axis gridlines helper (e.g. 4 divisions)
  const numYLines = 4;
  const yLines = Array.from({ length: numYLines + 1 }, (_, idx) => {
    const val = (maxValue / numYLines) * idx;
    return {
      value: val,
      y: getY(val),
    };
  });

  // Handle interactive hover tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xInSvg = ((e.clientX - rect.left) / rect.width) * svgWidth;

    // Find nearest point index across datasets
    const xInChart = xInSvg - paddingLeft;
    const ratio = Math.max(0, Math.min(1, xInChart / chartWidth));
    const nearestIndex = Math.round(ratio * (maxPoints - 1));

    if (nearestIndex >= 0 && nearestIndex < labels.length) {
      setHoveredIndex(nearestIndex);

      // Tooltip position
      const tooltipX =
        e.clientX - containerRef.current.getBoundingClientRect().left;
      const tooltipY =
        e.clientY - containerRef.current.getBoundingClientRect().top - 80;
      setTooltipPos({ x: tooltipX, y: tooltipY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG Rendering */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="h-auto w-full overflow-visible select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {datasets.map((dataset, idx) => (
            <linearGradient
              key={`gradient-${idx}`}
              id={`gradient-${idx}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={dataset.gradientFrom || dataset.color}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={dataset.gradientTo || dataset.color}
                stopOpacity="0.0"
              />
            </linearGradient>
          ))}
        </defs>

        {/* Y Axis Gridlines */}
        {yLines.map((line, idx) => (
          <g key={idx} className="opacity-40">
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={svgWidth - paddingRight}
              y2={line.y}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="text-slate-200 dark:text-slate-800"
            />
            <text
              x={paddingLeft - 8}
              y={line.y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px] font-bold dark:fill-slate-500"
            >
              {yAxisFormatter(line.value)}
            </text>
          </g>
        ))}

        {/* X Axis Line */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={svgWidth - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-200 dark:text-slate-800"
        />

        {/* X Axis Labels */}
        {labels.map((lbl, idx) => {
          if (idx % labelInterval !== 0 && idx !== labels.length - 1)
            return null;
          const x = getX(idx, labels.length);
          return (
            <text
              key={idx}
              x={x}
              y={svgHeight - 16}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-bold dark:fill-slate-500"
            >
              {lbl}
            </text>
          );
        })}

        {/* Plotting Areas & Lines */}
        {charts.map((c) => {
          if (!c) return null;
          return (
            <g key={c.dataset.label}>
              {/* Area Fill */}
              {c.areaPath && (
                <path
                  d={c.areaPath}
                  fill={`url(#gradient-${c.dIdx})`}
                  className="transition-all duration-300"
                />
              )}

              {/* Line path */}
              <path
                d={c.linePath}
                fill="none"
                stroke={c.dataset.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* Tooltip Cursor Line & Value Dots */}
        {hoveredIndex !== null && hoveredIndex < labels.length && (
          <g>
            {/* Vertical cursor line */}
            <line
              x1={getX(hoveredIndex, labels.length)}
              y1={paddingTop}
              x2={getX(hoveredIndex, labels.length)}
              y2={paddingTop + chartHeight}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-indigo-500 dark:text-indigo-400"
            />

            {/* Dots representing the value at cursor index */}
            {charts.map((c) => {
              if (!c) return null;
              const pt = c.points.find((p) => p.idx === hoveredIndex);
              if (!pt) return null;
              return (
                <circle
                  key={c.dataset.label}
                  cx={pt.x}
                  cy={pt.y}
                  r="5.5"
                  fill={c.dataset.color}
                  stroke="white"
                  strokeWidth="2"
                  className="shadow-md shadow-slate-900/10"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Floating Tooltip Box */}
      {hoveredIndex !== null && hoveredIndex < labels.length && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-slate-200 bg-white/95 p-3.5 text-left shadow-xl backdrop-blur-md transition-all duration-75 dark:border-slate-800 dark:bg-[#111219]/95"
          style={{
            left: `${Math.min(
              containerRef.current
                ? containerRef.current.clientWidth - 160
                : 400,
              Math.max(10, tooltipPos.x - 70)
            )}px`,
            top: `${Math.max(10, tooltipPos.y)}px`,
          }}
        >
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            {labels[hoveredIndex]}
          </div>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {datasets.map((d) => {
              const val =
                d.data[hoveredIndex] !== undefined ? d.data[hoveredIndex] : 0;
              return (
                <div
                  key={d.label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {d.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {yAxisFormatter(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
