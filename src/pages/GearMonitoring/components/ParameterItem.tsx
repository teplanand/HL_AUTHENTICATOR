import { memo, useEffect, useMemo, useState } from "react";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { MonitoringParam } from "../data";
import { usePrevious } from "../../../../shared/hooks/usePrevious";

type ParameterItemProps = {
  param: MonitoringParam;
  severity: "normal" | "warning" | "critical";
};

const pulseTheme: Record<
  ParameterItemProps["severity"],
  {
    shell: string;
    flash: string;
    glow: string;
  }
> = {
  normal: {
    shell: "border-sky-200/70 bg-white",
    flash: "bg-sky-400/12",
    glow: "0 0 0 1px rgba(56,189,248,0.14), 0 14px 30px -18px rgba(59,130,246,0.55)",
  },
  warning: {
    shell: "border-amber-200/80 bg-white",
    flash: "bg-amber-400/14",
    glow: "0 0 0 1px rgba(245,158,11,0.16), 0 16px 32px -20px rgba(245,158,11,0.65)",
  },
  critical: {
    shell: "border-rose-200/80 bg-white",
    flash: "bg-rose-400/14",
    glow: "0 0 0 1px rgba(244,63,94,0.16), 0 18px 34px -22px rgba(244,63,94,0.66)",
  },
};

function formatValue(value: number | null) {
  if (value === null) return "--";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function ParameterItemComponent({ param, severity }: ParameterItemProps) {
  const previousValue = usePrevious(param.value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tickVersion, setTickVersion] = useState(0);
  const theme = pulseTheme[severity];

  useEffect(() => {
    if (previousValue === undefined || previousValue === param.value) return;

    setIsAnimating(true);
    setTickVersion((value) => value + 1);

    const timeoutId = window.setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [param.value, previousValue]);

  const delta = useMemo(() => {
    if (typeof previousValue !== "number" || typeof param.value !== "number") return null;

    const difference = Number((param.value - previousValue).toFixed(2));
    return Object.is(difference, -0) ? 0 : difference;
  }, [param.value, previousValue]);

  const trend = delta === null || delta === 0 ? "stable" : delta > 0 ? "up" : "down";

  return (
    <motion.div
      animate={
        isAnimating
          ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 0 0 0 rgba(255,255,255,0)",
                theme.glow,
                "0 8px 20px -18px rgba(15,23,42,0.35)",
              ],
            }
          : {
              scale: 1,
              boxShadow: "0 8px 20px -18px rgba(15,23,42,0.35)",
            }
      }
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={clsx(
        "relative overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-sm transition-colors duration-300",
        theme.shell,
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
          theme.flash,
          isAnimating && "opacity-100",
        )}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase   ">
            {param.label}
          </p>

          <div className="mt-2 flex items-end gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${tickVersion}-${param.value ?? "na"}`}
                initial={{ y: 10, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -8, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="font-[Nunito] text-2xl font-extrabold tracking-tight text-slate-900"
              >
                {formatValue(param.value)}
              </motion.span>
            </AnimatePresence>

            <span className="pb-1 text-sm font-semibold text-slate-500">{param.unit}</span>
          </div>
        </div>

        <div className="flex min-w-[74px] justify-end">
          {trend !== "stable" && delta !== null ? (
            <div
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
              )}
            >
              {trend === "up" ? (
                <NorthRoundedIcon sx={{ fontSize: 14 }} />
              ) : (
                <SouthRoundedIcon sx={{ fontSize: 14 }} />
              )}
              {delta > 0 ? "+" : ""}
              {delta.toFixed(2)}
            </div>
          ) : (
            <span className="text-xs font-semibold uppercase  ">
              Stable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export const ParameterItem = memo(ParameterItemComponent);
