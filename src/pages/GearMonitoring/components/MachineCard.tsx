import { memo, useEffect, useMemo, useState } from "react";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { Machine } from "../data";
import { MiniChart } from "./MiniChart";

type MachineCardProps = {
  machine: Machine;
  onOpenDetail?: (machine: Machine) => void;
};

type VisualSeverity = "normal" | "warning" | "critical";

const HISTORY_LENGTH = 20;

const severityTheme: Record<
  VisualSeverity,
  {
    shell: string;
    badge: string;
    glow: string;
    accent: string;
    dot: string;
    button: string;
    label: string;
  }
> = {
  normal: {
    shell:
      "border-sky-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(238,248,255,0.92)_48%,rgba(234,247,244,0.96))]",
    badge: "border border-sky-200/70 bg-white/80 text-sky-700",
    glow: "from-sky-500/10 via-cyan-400/6 to-emerald-400/10",
    accent: "text-sky-700",
    dot: "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.16)]",
    button: "bg-slate-950 text-white hover:bg-slate-800",
    label: "Healthy",
  },
  warning: {
    shell:
      "border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,251,235,0.98),rgba(255,247,237,0.94)_52%,rgba(255,255,255,0.96))]",
    badge: "border border-amber-200/80 bg-white/75 text-amber-700",
    glow: "from-amber-500/12 via-orange-400/8 to-transparent",
    accent: "text-amber-700",
    dot: "bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.18)]",
    button: "bg-amber-500 text-slate-950 hover:bg-amber-400",
    label: "Warning",
  },
  critical: {
    shell:
      "border-rose-200/80 bg-[linear-gradient(145deg,rgba(255,241,242,0.98),rgba(255,247,237,0.94)_50%,rgba(255,255,255,0.96))]",
    badge: "border border-rose-200/80 bg-white/75 text-rose-700",
    glow: "from-rose-500/12 via-orange-400/10 to-transparent",
    accent: "text-rose-700",
    dot: "bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.16)]",
    button: "bg-rose-600 text-white hover:bg-rose-500",
    label: "Critical",
  },
};

function createSeedHistory(baseValue: number | null) {
  const base = baseValue ?? 0;
  const variance = Math.max(Math.abs(base) * 0.04, 0.35);

  return Array.from({ length: HISTORY_LENGTH }, (_, index) => {
    const drift = Math.sin(index * 0.7) * variance;
    return Number((base + drift).toFixed(2));
  });
}

function getPrimaryMetric(machine: Machine) {
  return machine.monitoringParams.find((param) => typeof param.value === "number") ?? machine.monitoringParams[0] ?? null;
}

function getVisualSeverity(machine: Machine): VisualSeverity {
  if (machine.alertCount >= 8) return "critical";
  if (machine.status === "warning" || machine.alertCount > 0) return "warning";
  return "normal";
}

function formatMetricSummary(value: number | null, unit: string) {
  if (value === null) return `No ${unit} feed`;
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

function MachineCardInner({ machine, onOpenDetail }: MachineCardProps) {
  const severity = getVisualSeverity(machine);
  const theme = severityTheme[severity];
  const primaryMetric = getPrimaryMetric(machine);
  const primaryValue = typeof primaryMetric?.value === "number" ? primaryMetric.value : null;

  const [history, setHistory] = useState<number[]>(() => createSeedHistory(primaryValue));

  useEffect(() => {
    if (primaryValue === null) return;

    setHistory((previous) => {
      const lastValue = previous[previous.length - 1];
      if (lastValue === primaryValue) return previous;
      return [...previous.slice(-(HISTORY_LENGTH - 1)), primaryValue];
    });
  }, [primaryValue]);

  const statLine = useMemo(() => {
    if (!primaryMetric) return "Awaiting telemetry";
    return `${primaryMetric.label} • ${formatMetricSummary(primaryValue, primaryMetric.unit)}`;
  }, [primaryMetric, primaryValue]);

  return (
    <motion.article
      layout
  
      className={clsx(
        "group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-xl   shadow-[0_16px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-300",
        theme.shell,
      )}
    >
      <div className={clsx("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 transition-opacity duration-300 group-hover:opacity-100", theme.glow)} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80" />

      <div className="relative flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                {machine.id}
              </span>
              <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em]", theme.badge)}>
                {theme.label}
              </span>
            </div>

            <h3 className="truncate font-[Nunito]   font-extrabold tracking-tight text-slate-900">
              {machine.name}
            </h3>
            <p className=" truncate text-sm font-medium text-gray-600">
              {machine.clientName}
            </p>
            <p className="  text-xs font-semibold uppercase   text-gray-400">
              {machine.locationName}
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-[10px] border border-white/70 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
           

          <div className="  ">
            {machine.monitoringParams.map((param) => (
              <p key={param.label} className={clsx("text-sm font-bold", theme.accent)}>
                {param.label} • {formatMetricSummary(param.value, param.unit)}
              </p>
            ))}
          </div>

          <MiniChart values={history} severity={severity} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <NotificationsActiveOutlinedIcon
              sx={{
                fontSize: 18,
                color: severity === "critical" ? "#e11d48" : severity === "warning" ? "#d97706" : "#0369a1",
              }}
            />
            <span className="font-semibold">
              {machine.alertCount > 0 ? `${machine.alertCount}   alerts` : "No   alerts"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenDetail?.(machine)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold tracking-[0.02em] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              theme.button,
            )}
          >
            Open detail
            <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export const MachineCard = memo(MachineCardInner);
