import { memo, useId, useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

type MiniChartProps = {
  values: number[];
  severity: "normal" | "warning" | "critical";
  compact?: boolean;
};

type Point = {
  x: number;
  y: number;
};

const chartTheme = {
  normal: {
    shell: "from-sky-50/60 via-white/40 to-emerald-50/60",
    grid: "stroke-sky-100/80",
  },
  warning: {
    shell: "from-amber-50/60 via-white/40 to-orange-50/60",
    grid: "stroke-amber-100/80",
  },
  critical: {
    shell: "from-rose-50/60 via-white/40 to-orange-50/60",
    grid: "stroke-rose-100/80",
  },
} as const;

function buildPath(points: Point[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function buildAreaPath(points: Point[], height: number) {
  if (points.length === 0) return "";

  const line = buildPath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

function MiniChartComponent({ values, severity, compact = false }: MiniChartProps) {
  const gradientId = useId();
  const areaId = useId();
  const width = 320;
  const height = compact ? 72 : 104;
  const theme = chartTheme[severity];

  const { linePath, areaPath, latestPoint } = useMemo(() => {
    const safeValues = values.length > 1 ? values : [0, 0];
    const minValue = Math.min(...safeValues);
    const maxValue = Math.max(...safeValues);
    const range = maxValue - minValue || 1;

    const points = safeValues.map((value, index) => ({
      x: (index / (safeValues.length - 1)) * width,
      y: 12 + ((maxValue - value) / range) * (height - 24),
    }));

    return {
      linePath: buildPath(points),
      areaPath: buildAreaPath(points, height),
      latestPoint: points[points.length - 1],
    };
  }, [values]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-br p-1",
        theme.shell,
        compact && "rounded-2xl",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.85),transparent_42%)]" />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={clsx("relative w-full", compact ? "h-20" : "h-28")}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id={areaId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.22)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
          </linearGradient>
        </defs>

        <path
          d={`M 0 ${height * 0.38} L ${width} ${height * 0.38}`}
          className={clsx("fill-none stroke-[1.2]", theme.grid)}
          strokeDasharray="5 8"
        />
        <path
          d={`M 0 ${height * 0.68} L ${width} ${height * 0.68}`}
          className={clsx("fill-none stroke-[1.2]", theme.grid)}
          strokeDasharray="5 8"
        />

        <motion.path
          d={areaPath}
          animate={{ d: areaPath }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          fill={`url(#${areaId})`}
        />

        <motion.path
          d={linePath}
          animate={{ d: linePath }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={compact ? "2.5" : "3"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <motion.circle
          cx={latestPoint.x}
          cy={latestPoint.y}
          r={compact ? "4.5" : "5.5"}
          animate={{ cx: latestPoint.x, cy: latestPoint.y, scale: [1, 1.18, 1] }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          fill="#ffffff"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

export const MiniChart = memo(MiniChartComponent);
