import { memo, useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloseIcon from "@mui/icons-material/Close";

import { Machine } from "../data";
import { useMachineData } from "../context/MachineDataContext";
import { MiniChart } from "./MiniChart";

type MachineDetailsPanelProps = {
  machineId: string | null;
  onClose?: () => void;
};

const HISTORY_LENGTH = 20;

function createSeedHistory(baseValue: number | null) {
  const base = baseValue ?? 0;
  const variance = Math.max(Math.abs(base) * 0.04, 0.35);

  return Array.from({ length: HISTORY_LENGTH }, (_, index) => {
    const drift = Math.sin(index * 0.7) * variance;
    return Number((base + drift).toFixed(2));
  });
}

function getVisualSeverity(machine: Machine): "normal" | "warning" | "critical" {
  if (machine.alertCount >= 8) return "critical";
  if (machine.status === "warning" || machine.alertCount > 0) return "warning";
  return "normal";
}

function getSeverityStyles(severity: "normal" | "warning" | "critical") {
  if (severity === "critical") {
    return {
      label: "critical",
      color: "#BE123C",
      background: "#FFF1F2",
    };
  }

  if (severity === "warning") {
    return {
      label: "warning",
      color: "#B45309",
      background: "#FFF7ED",
    };
  }

  return {
    label: "normal",
    color: "#0F766E",
    background: "#ECFDF5",
  };
}

function formatMetricValue(value: number | null) {
  if (value === null) return "--";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function buildAlertMessages(machine: Machine, severity: "normal" | "warning" | "critical") {
  if (machine.alertCount <= 0) {
    return ["No active alerts on this machine."];
  }

  const topMetric =
    machine.monitoringParams.find((param) => typeof param.value === "number") || machine.monitoringParams[0];

  const metricMessage = topMetric
    ? `${topMetric.label} is currently reading ${formatMetricValue(topMetric.value)} ${topMetric.unit}.`
    : "Telemetry feed is active for this machine.";

  if (severity === "critical") {
    return [
      `${machine.alertCount} active alerts need immediate attention.`,
      metricMessage,
      "Please inspect the machine and validate the safety condition.",
    ];
  }

  return [
    `${machine.alertCount} active alerts are being monitored.`,
    metricMessage,
    "Review the machine trend and plan intervention if values continue rising.",
  ];
}

function MachineDetailsPanelComponent({ machineId, onClose }: MachineDetailsPanelProps) {
  const { allMachines } = useMachineData();
  const machine = allMachines.find((entry) => entry.id === machineId) || null;

  if (!machine) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Typography color="text.secondary">Select a machine to view details</Typography>
      </Box>
    );
  }

  const severity = getVisualSeverity(machine);
  const severityStyles = getSeverityStyles(severity);
  const alertMessages = buildAlertMessages(machine, severity);

  const [paramHistories, setParamHistories] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      machine.monitoringParams.map((param) => [param.label, createSeedHistory(param.value)])
    )
  );

  useEffect(() => {
    setParamHistories(
      Object.fromEntries(
        machine.monitoringParams.map((param) => [param.label, createSeedHistory(param.value)])
      )
    );
  }, [machine.id, machine.monitoringParams]);

  useEffect(() => {
    setParamHistories((previous) =>
      Object.fromEntries(
        machine.monitoringParams.map((param) => {
          const previousSeries = previous[param.label] || createSeedHistory(param.value);

          if (param.value === null) {
            return [param.label, previousSeries];
          }

          const lastValue = previousSeries[previousSeries.length - 1];
          if (lastValue === param.value) {
            return [param.label, previousSeries];
          }

          return [param.label, [...previousSeries.slice(-(HISTORY_LENGTH - 1)), param.value]];
        })
      )
    );
  }, [machine.monitoringParams]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ "& .MuiBreadcrumbs-li": { fontSize: "0.75rem", fontWeight: 500 } }}
          >
            <Typography color="text.secondary">Monitoring</Typography>
            <Typography color="text.secondary">{machine.locationName}</Typography>
            <Typography color="text.primary">{machine.id}</Typography>
          </Breadcrumbs>
          {onClose ? (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          {machine.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={severityStyles.label}
            size="small"
            sx={{
              bgcolor: severityStyles.background,
              color: severityStyles.color,
              fontWeight: 800,
              fontSize: "0.7rem",
              textTransform: "capitalize",
            }}
          />
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
            Managed by {machine.clientName}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "grid",
          gridTemplateColumns: "1.25fr 1fr",
          gap: 1.25,
          alignItems: "stretch",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(15,23,42,0.08)",
            minHeight: 360,
            backgroundColor: "#E2E8F0",
          }}
        >
          <Box
            component="img"
            src={
              machine.image ||
              "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
            }
            alt={machine.name}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 360,
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1,
            alignContent: "start",
            maxHeight: 360,
            overflowY: "auto",
            pr: 0.25,
          }}
        >
          {machine.monitoringParams.map((param) => (
            <Box
              key={param.label}
              sx={{
                p: 1.1,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                minHeight: 102,
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}
                >
                  {param.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#0F172A", fontWeight: 800 }}>
                  {formatMetricValue(param.value)} {param.unit}
                </Typography>
              </Stack>

              <MiniChart
                values={paramHistories[param.label] || createSeedHistory(param.value)}
                severity={severity}
                compact
              />
            </Box>
          ))}

          {!machine.monitoringParams.length ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "rgba(15,23,42,0.03)",
                border: "1px solid rgba(15,23,42,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 700 }}>
                No live parameters
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A" }}>
            Alerts
          </Typography>
          <Chip
            label={machine.alertCount > 0 ? `${machine.alertCount} active` : "No alerts"}
            size="small"
            sx={{
              bgcolor: severityStyles.background,
              color: severityStyles.color,
              fontWeight: 800,
              fontSize: "0.72rem",
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 1,
          }}
        >
          {alertMessages.map((message, index) => (
            <Box
              key={`${machine.id}-alert-${index}`}
              sx={{
                px: 1.5,
                py: 1.15,
                borderRadius: 2.5,
                bgcolor: index === 0 ? severityStyles.background : "rgba(248,250,252,0.95)",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: index === 0 ? severityStyles.color : "#475569",
                  fontWeight: index === 0 ? 800 : 600,
                }}
              >
                {message}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export const MachineDetailsPanel = memo(MachineDetailsPanelComponent);
