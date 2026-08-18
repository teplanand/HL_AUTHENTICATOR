import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

import { Page } from "../../../shared/components/common/Page";
import { LocationSidebar } from "./components/LocationSidebar";
import { MachineDetailsPanel } from "./components/MachineDetailsPanel";
import { MachineDataProvider, useMachineData } from "./context/MachineDataContext";
import { Machine } from "./data";
import { getMonitoringRouteUiPermissions } from "./utils/monitoringAccess";

type Severity = "normal" | "warning" | "critical";

const getVisualSeverity = (machine: Machine): Severity => {
  if (machine.alertCount >= 8) return "critical";
  if (machine.status === "warning" || machine.alertCount > 0) return "warning";
  return "normal";
};

const getSeverityLabel = (severity: Severity) => {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Healthy";
};

const getSeverityStyles = (severity: Severity) => {
  if (severity === "critical") {
    return {
      color: "#BE123C",
      background: "#FFF1F2",
    };
  }

  if (severity === "warning") {
    return {
      color: "#B45309",
      background: "#FFF7ED",
    };
  }

  return {
    color: "#0F766E",
    background: "#ECFDF5",
  };
};

const getPrimaryMetricSummary = (machine: Machine) => {
  const primary =
    machine.monitoringParams.find((param) => typeof param.value === "number") ||
    machine.monitoringParams[0];

  if (!primary) {
    return "Awaiting telemetry";
  }

  if (primary.value === null) {
    return `${primary.label} · No ${primary.unit} feed`;
  }

  return `${primary.label} · ${primary.value.toFixed(primary.value >= 10 ? 1 : 2)} ${primary.unit}`;
};

export default function GearMonitoringDashboard() {
  return (
    <MachineDataProvider>
      <GearMonitoringMain />
    </MachineDataProvider>
  );
}

function GearMonitoringMain() {
  const { locations } = useMachineData();
  const dashboardRoutePermissions = useMemo(
    () => getMonitoringRouteUiPermissions("/monitoring/dashboard"),
    [],
  );
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [machineSearch, setMachineSearch] = useState("");

  const filteredLocations = useMemo(() => {
    if (!locationSearch) {
      return locations;
    }

    const search = locationSearch.toLowerCase();
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(search) ||
        location.clientName.toLowerCase().includes(search)
    );
  }, [locationSearch, locations]);

  useEffect(() => {
    if (!filteredLocations.length) {
      setSelectedLocationName(null);
      return;
    }

    const hasSelectedLocation = filteredLocations.some(
      (location) => location.name === selectedLocationName
    );

    if (hasSelectedLocation) {
      return;
    }

    setSelectedLocationName(filteredLocations[0].name);
  }, [filteredLocations, selectedLocationName]);

  const selectedLocationIndex = useMemo(
    () => filteredLocations.findIndex((location) => location.name === selectedLocationName),
    [filteredLocations, selectedLocationName]
  );

  const selectedLocation =
    filteredLocations[selectedLocationIndex >= 0 ? selectedLocationIndex : 0] || null;

  const visibleMachines = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    if (!machineSearch) {
      return selectedLocation.machines;
    }

    const search = machineSearch.toLowerCase();
    return selectedLocation.machines.filter(
      (machine) =>
        machine.id.toLowerCase().includes(search) ||
        machine.name.toLowerCase().includes(search)
    );
  }, [machineSearch, selectedLocation]);

  useEffect(() => {
    if (!visibleMachines.length) {
      setSelectedMachineId(null);
      return;
    }

    const hasSelectedMachine = visibleMachines.some((machine) => machine.id === selectedMachineId);
    if (hasSelectedMachine) {
      return;
    }

    setSelectedMachineId(visibleMachines[0].id);
  }, [selectedMachineId, visibleMachines]);

  const handleLocationSelect = useCallback(
    (index: number) => {
      const nextLocation = filteredLocations[index];
      if (!nextLocation) {
        return;
      }

      setSelectedLocationName(nextLocation.name);
      setSelectedMachineId(nextLocation.machines[0]?.id || null);
      setMachineSearch("");
    },
    [filteredLocations]
  );

  return (
    <Page module="monitoring">
      <Box sx={{ display: "grid", gap: 2.5 }}>
        {!dashboardRoutePermissions.view && (
          <Alert severity="info">
            Gear Monitoring dashboard mate view access available nathi.
          </Alert>
        )}

        <Card
          sx={{
            display: "flex",
            height: "calc(100vh - 64px)",
            overflow: "hidden",
          }}
        >
          <LocationSidebar
            locations={filteredLocations}
            selectedIndex={Math.max(selectedLocationIndex, 0)}
            onSelect={handleLocationSelect}
            searchValue={locationSearch}
            onSearchChange={setLocationSearch}
          />

          <Box
            sx={{
              width: 290,
              minWidth: 290,
              borderRight: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedLocation?.name || "Machines"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mb: 1.5 }}>
                {selectedLocation?.clientName || "Select a location to inspect its machines."}
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Search machine..."
                value={machineSearch}
                onChange={(event) => setMachineSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#0D9488" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    py: 0.9,
                  },
                }}
              />
            </Box>

            <Box sx={{ px: 1.25, py: 1.25, overflowY: "auto", flex: 1 }}>
              {visibleMachines.length ? (
                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {visibleMachines.map((machine) => {
                    const severity = getVisualSeverity(machine);
                    const severityStyles = getSeverityStyles(severity);
                    const isSelected = selectedMachineId === machine.id;

                    return (
                      <ListItemButton
                        key={machine.id}
                        selected={isSelected}
                        onClick={() => setSelectedMachineId(machine.id)}
                        sx={{
                          display: "block",
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: isSelected ? "rgba(13,148,136,0.32)" : "rgba(15,23,42,0.08)",
                          background: isSelected
                            ? "linear-gradient(180deg, rgba(240,253,250,0.92) 0%, rgba(255,255,255,1) 100%)"
                            : "#FFFFFF",
                          boxShadow: isSelected
                            ? "0 14px 28px -24px rgba(13,148,136,0.45)"
                            : "0 10px 20px -24px rgba(15,23,42,0.28)",
                          px: 1.5,
                          py: 1.4,
                          alignItems: "stretch",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A" }}>
                              {machine.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748B",
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                              }}
                            >
                              {machine.id}
                            </Typography>
                          </Box>

                          <Chip
                            label={getSeverityLabel(severity)}
                            size="small"
                            sx={{
                              bgcolor: severityStyles.background,
                              color: severityStyles.color,
                              fontWeight: 800,
                              fontSize: "0.68rem",
                              alignSelf: "flex-start",
                            }}
                          />
                        </Stack>

                        <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
                          {getPrimaryMetricSummary(machine)}
                        </Typography>

                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.15 }}>
                          <NotificationsActiveOutlinedIcon
                            sx={{
                              fontSize: 16,
                              color:
                                severity === "critical"
                                  ? "#E11D48"
                                  : severity === "warning"
                                    ? "#D97706"
                                    : "#0369A1",
                            }}
                          />
                          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                            {machine.alertCount > 0 ? `${machine.alertCount} alerts` : "No alerts"}
                          </Typography>
                        </Stack>
                      </ListItemButton>
                    );
                  })}
                </List>
              ) : (
                <Card
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#F8FAFC",
                    boxShadow: "none",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                    No machines found for this location.
                  </Typography>
                </Card>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: "#FCFDFD",
            }}
          >
            <MachineDetailsPanel machineId={selectedMachineId} />
          </Box>
        </Card>
      </Box>
    </Page>
  );
}
