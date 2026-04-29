import { useState, useRef, useCallback } from "react";
import type { PricePoint } from "@/shared/types";

interface Props {
  data: PricePoint[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: PricePoint | null;
  index: number | null;
}

export function CandlestickChart({ data }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
    index: null,
  });
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 800,
    H = 200,
    PT = 16,
    PR = 56,
    PB = 24,
    PL = 10;

  const minVal = Math.min(...data.map(d => d.low));
  const maxVal = Math.max(...data.map(d => d.high));
  const valRange = maxVal - minVal || 1;

  const toY = useCallback(
    (val: number) => PT + ((maxVal - val) / valRange) * (H - PT - PB),
    [maxVal, valRange]
  );

  const chartW = W - PL - PR;
  const step = chartW / data.length;
  const barW = Math.max(step * 0.6, 3);
  const toX = useCallback((i: number) => PL + i * step + step / 2, [step]);

  const ma5: { x: number; y: number }[] = [];
  data.forEach((_, i) => {
    if (i < 4) return;
    const avg = data.slice(i - 4, i + 1).reduce((s, d) => s + d.close, 0) / 5;
    ma5.push({ x: toX(i), y: toY(avg) });
  });
  const ma5Path =
    ma5.length > 0
      ? `M ${ma5[0].x} ${ma5[0].y} ` +
        ma5
          .slice(1)
          .map(p => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const lastClose = data[data.length - 1]?.close ?? 0;
  const lastY = toY(lastClose);

  const yTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round(minVal + (valRange / 5) * i)
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const svgX = ((e.clientX - rect.left) / rect.width) * W;
      const idx = Math.round((svgX - PL - step / 2) / step);
      const clamped = Math.max(0, Math.min(data.length - 1, idx));
      const d = data[clamped];
      if (!d) return;
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data: d,
        index: clamped,
      });
    },
    [data, step]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null, index: null });
  }, []);

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {yTicks.map(tick => (
          <line
            key={tick}
            x1={PL}
            x2={W - PR}
            y1={toY(tick)}
            y2={toY(tick)}
            stroke="#e2e8f0"
            strokeWidth={0.5}
            strokeDasharray="4 3"
          />
        ))}
        {yTicks.map(tick => (
          <text
            key={`yl-${tick}`}
            x={W - PR + 4}
            y={toY(tick) + 4}
            fontSize={9}
            fill="#9ca3af"
            textAnchor="start"
          >
            {(tick / 1000).toFixed(0)}k
          </text>
        ))}
        {data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0)
          .map((d, idx) => (
            <text
              key={`xl-${idx}`}
              x={toX(idx * Math.ceil(data.length / 6))}
              y={H - 6}
              fontSize={9}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {d.date.slice(0, 7)}
            </text>
          ))}
        {ma5Path && (
          <path
            d={ma5Path}
            stroke="#f6ad55"
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
          />
        )}
        {data.map((d, i) => {
          const isUp = d.close >= d.open;
          const color = isUp ? "#e53e3e" : "#3182ce";
          const x = toX(i);
          const bodyTop = toY(Math.max(d.open, d.close));
          const bodyBot = toY(Math.min(d.open, d.close));
          const bodyH = Math.max(bodyBot - bodyTop, 1);
          const isHov = tooltip.index === i;
          return (
            <g key={i} opacity={tooltip.visible && !isHov ? 0.55 : 1}>
              <line
                x1={x}
                x2={x}
                y1={toY(d.high)}
                y2={toY(d.low)}
                stroke={color}
                strokeWidth={1}
              />
              <rect
                x={x - barW / 2}
                y={bodyTop}
                width={barW}
                height={bodyH}
                fill={color}
                stroke={color}
                strokeWidth={1}
                rx={0.5}
              />
            </g>
          );
        })}
        {(() => {
          const activeData =
            tooltip.visible && tooltip.data
              ? tooltip.data
              : data[data.length - 1];
          const activeClose = activeData?.close ?? lastClose;
          const activeY = toY(activeClose);
          const isUp = activeData ? activeData.close >= activeData.open : true;
          const lineColor =
            tooltip.visible && tooltip.data
              ? isUp
                ? "#e53e3e"
                : "#3182ce"
              : "#3182ce";
          return (
            <>
              <line
                x1={PL}
                x2={W - PR}
                y1={activeY}
                y2={activeY}
                stroke={lineColor}
                strokeWidth={0.8}
                strokeDasharray="3 3"
              />
              <rect
                x={W - PR + 2}
                y={activeY - 9}
                width={50}
                height={16}
                fill={lineColor}
                rx={3}
              />
              <text
                x={W - PR + 27}
                y={activeY + 3.5}
                fontSize={9}
                fill="#fff"
                textAnchor="middle"
                fontWeight="600"
              >
                {activeClose.toLocaleString()}
              </text>
            </>
          );
        })()}
        {tooltip.visible && tooltip.index !== null && (
          <line
            x1={toX(tooltip.index)}
            x2={toX(tooltip.index)}
            y1={PT}
            y2={H - PB}
            stroke="#6b7280"
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {tooltip.visible &&
        tooltip.data &&
        (() => {
          const d = tooltip.data!;
          const isUp = d.close >= d.open;
          const upColor = "#ef4444",
            downColor = "#3b82f6";
          const priceColor = isUp ? upColor : downColor;
          return (
            <div
              className="absolute pointer-events-none z-50 rounded-md text-xs"
              style={{
                left: tooltip.x > 400 ? tooltip.x - 150 : tooltip.x + 12,
                top: Math.max(tooltip.y - 75, 0),
                background: "#1a202c",
                border: "1px solid #2d3748",
                padding: "8px 12px",
                minWidth: 130,
                color: "#e2e8f0",
              }}
            >
              <div
                className="font-semibold mb-1.5"
                style={{ color: "#f7fafc", fontSize: 11 }}
              >
                {d.date}
              </div>
              {(
                [
                  { label: "고가", val: d.high, color: upColor },
                  { label: "시가", val: d.open, color: priceColor },
                  { label: "종가", val: d.close, color: priceColor },
                  { label: "저가", val: d.low, color: downColor },
                ] as const
              ).map(({ label, val, color }) => (
                <div key={label} className="flex justify-between gap-3 mb-0.5">
                  <span style={{ color: "#718096" }}>{label}</span>
                  <span
                    style={{ color, fontWeight: label === "종가" ? 600 : 400 }}
                  >
                    {val.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
    </div>
  );
}
