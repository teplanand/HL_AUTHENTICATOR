import React, { useMemo, useState } from "react";
import { Box, Button, Card, Grid, Stack, Typography } from "@mui/material";

import { Page } from "../../../../shared/components/common/Page";
import SalesOrders from "./components/salesorders";
import { useDialog } from "../../../../shared/hooks/useDialog";
import Importsalesorders from "./components/importsalesorders";
import { mapSalesOrdersList } from "./barcodeAdapters";
import { useToast } from "../../../../shared/hooks/useToast";
import {
  barcodeDefaults,
  BarcodeSalesOrderInitCounter,
  useGetSalesOrdersInitQuery,
  useGetSalesOrdersQuery,
  useLazyGetSalesOrdersByStatusQuery,
} from "../api/barcode";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";

const counterLabelMap: Record<string, string> = {
  totalsalesorder: "Total Sales Orders",
  imported: "Imported",
  generated: "Generated",
  openorders: "Open Orders",
  newimportsalse: "New Import Sales",
  newimportcount: "New Imports",
  ar: "Assembly Release",
  cl: "Canceled",
  ho: "Hold",
  cr: "Completion",
  pi: "Painting",
};

const counterColorMap: Record<string, string> = {
  totalsalesorder: "#1D4ED8",
  imported: "#D97706",
  generated: "#0891B2",
  openorders: "#059669",
  newimportsalse: "#7C3AED",
  newimportcount: "#7C3AED",
  pl: "#D97706",
  ar: "#2563EB",
  cl: "#DC2626",
  ho: "#7C3AED",
  sh: "#EA580C",
  mi: "#0891B2",
  ua: "#0F766E",
  qc: "#4F46E5",
  cr: "#16A34A",
  pi: "#DB2777",
  pk: "#9333EA",
};

const normalizeCounterKey = (key: string) => key.replace(/[\s_-]/g, "").toLowerCase();

const resolveStatusFromCard = (key: string, title: string) => {
  const normalizedKey = normalizeCounterKey(key || title);
  const normalizedTitle = normalizeCounterKey(title);
  const source = normalizedKey || normalizedTitle;

  const statusMap: Record<string, string> = {
    qc: "QC",
    qualitycheck: "QC",
    ua: "UA",
    underassembly: "UA",
    accomp: "CP",
    cp: "CP",
    acpk: "PK",
    packing: "PK",
    pk: "PK",
    acds: "DS",
    dispatch: "DS",
    ds: "DS",
    sh: "SH",
    shopfloorready: "SH",
    mi: "MI",
    materialissued: "MI",
    ar: "AR",
    assemblyrelease: "AR",
    cl: "CL",
    canceled: "CL",
    cancelled: "CL",
    ho: "HO",
    hold: "HO",
    pl: "PL",
    planning: "PL",
    cr: "CR",
    completion: "CR",
    pi: "PI",
    painting: "PI",
    booked: "BOOKED",
  };

  if (statusMap[normalizedKey]) {
    return statusMap[normalizedKey];
  }

  if (statusMap[normalizedTitle]) {
    return statusMap[normalizedTitle];
  }

  if (/^[a-z]{2,6}$/i.test(normalizedKey)) {
    return normalizedKey.toUpperCase();
  }

  if (/^[a-z]{2,6}$/i.test(normalizedTitle)) {
    return normalizedTitle.toUpperCase();
  }

  return "";
};

const getCounterLabel = (key: string) => {
  const normalizedKey = normalizeCounterKey(key);
  if (counterLabelMap[normalizedKey]) {
    return counterLabelMap[normalizedKey];
  }

  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const toCounterValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return 0;
};

const isInitCounter = (item: unknown): item is BarcodeSalesOrderInitCounter =>
  typeof item === "object" && item !== null;

const BarcodeDashboard = () => {
  const { openDialog } = useDialog();
  const { showToast } = useToast();
  const routePermissions = useMemo(
    () => getStaticModuleRouteUiPermissions("/barcode/dashboard"),
    [],
  );
  const [triggerSalesOrdersByStatus] = useLazyGetSalesOrdersByStatusQuery();
  const [filteredSalesOrders, setFilteredSalesOrders] = useState<ReturnType<typeof mapSalesOrdersList>>();
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [gridNoRowsMessage, setGridNoRowsMessage] = useState("No records found");
  const {
    data: salesOrdersResponse,
    isLoading,
    refetch: refetchSalesOrders,
  } = useGetSalesOrdersQuery();
  const {
    data: initResponse,
    isLoading: isInitLoading,
    refetch: refetchInit,
  } = useGetSalesOrdersInitQuery();
  const salesOrders = useMemo(
    () => mapSalesOrdersList(salesOrdersResponse?.data ?? salesOrdersResponse),
    [salesOrdersResponse]
  );
  const gridRows = filteredSalesOrders ?? salesOrders;

  const fallbackDashboardStats = useMemo(() => {
    const totalOrders = salesOrders.length;
    const importedCount = salesOrders.filter((order) => order.importStatus === true).length;
    const generatedCount = salesOrders.filter((order) => order.generateStatus === true).length;
    const openOrderCount = salesOrders.filter(
      (order) => String(order.rawOrderStatus || "").toUpperCase() === "OPEN"
    ).length;

    return [
      {
        key: "total-sales-order",
        title: "Total Sales Orders",
        count: totalOrders,
        color: "#1D4ED8",
      },
      {
        key: "imported",
        title: "Imported",
        count: importedCount,
        color: "#D97706",
      },
      {
        key: "generated",
        title: "Generated",
        count: generatedCount,
        color: "#0891B2",
      },
      {
        key: "open-orders",
        title: "Open Orders",
        count: openOrderCount,
        color: "#059669",
      },
    ];
  }, [salesOrders]);

  const dashboardStats = useMemo(() => {
    const initCounters = initResponse?.data;
    if (!initCounters) {
      return fallbackDashboardStats;
    }

    if (Array.isArray(initCounters)) {
      const mappedCounters = initCounters
        .filter(isInitCounter)
        .map((counter, index) => {
          const key = String(counter.key || `counter-${index + 1}`);
          const title = String(counter.label || getCounterLabel(key));
          const normalizedKey = normalizeCounterKey(key);
          const count = toCounterValue(counter.value);

          return {
            key,
            title,
            count,
            color: counterColorMap[normalizedKey] || "#1D4ED8",
            showImport: normalizedKey === "newimportcount" && Number(count || 0) > 0,
          };
        });

      return mappedCounters.length ? mappedCounters : fallbackDashboardStats;
    }

    if (typeof initCounters !== "object") {
      return fallbackDashboardStats;
    }

    return Object.entries(initCounters).map(([key, value]) => {
      const normalizedKey = normalizeCounterKey(key);
      const count = toCounterValue(value);

      return {
        key,
        title: getCounterLabel(key),
        count,
        color: counterColorMap[normalizedKey] || "#1D4ED8",
        showImport:
          ["newimportsalse", "newimportcount"].includes(normalizedKey) && Number(count || 0) > 0,
      };
    });
  }, [fallbackDashboardStats, initResponse]);

  const handleCounterCardClick = async (card: {
    key: string;
    title: string;
    showImport?: boolean;
  }) => {
    const status = resolveStatusFromCard(card.key, card.title);

    if (!status) {
      showToast(`Status not available for ${card.title}`, "warning");
      return;
    }

    setIsStatusLoading(true);
    setActiveCardKey(card.key);
    setFilteredSalesOrders([]);
    setGridNoRowsMessage("Sales order not found");

    try {
      const response = await triggerSalesOrdersByStatus(
        {
          DIVISION_ID: barcodeDefaults.divisionId,
          STATUS: status,
        },
        false
      ).unwrap();

      const nextRows = mapSalesOrdersList(response?.data ?? response);
      setFilteredSalesOrders(nextRows);
      setGridNoRowsMessage(nextRows.length ? "No records found" : "Sales order not found");
    } catch (error: any) {
      setFilteredSalesOrders([]);
      setGridNoRowsMessage("Sales order not found");
      const message =
        error?.data?.message || error?.error || `Unable to load ${card.title} sales orders`;
      showToast(message, "error");
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handleResetStatusFilter = () => {
    setActiveCardKey(null);
    setFilteredSalesOrders(undefined);
    setGridNoRowsMessage("No records found");
    setIsStatusLoading(false);
  };

  return (
    <Page module="barcode">
      <Box>
      <Grid container spacing={1} className="mb-2">
        {dashboardStats.map((card) => (
          <Grid size={{ xs: 6, sm: 3, md: 2 }} key={card.key}>
            <Card
              onClick={() => void handleCounterCardClick(card)}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  activeCardKey === card.key ? `0 0 0 1px ${card.color} inset` : "none",
                bgcolor: activeCardKey === card.key ? `${card.color}08` : "#fff",
                "&:hover": {
                  borderColor: card.color,
                },
              }}
            >
              <Box sx={{p:1.5}}>
                <Stack spacing={1}>
                  <Box>
                    

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        
                      }}
                    >

<Box sx={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 1 }}>
                        <Typography
                        variant="h4"
                        sx={{ color: card.color, fontWeight: 700 }}
                      >
                        {card.count}
                      </Typography>

                       <Typography
                      variant="subtitle2"
                      sx={{ color: "text.secondary"  }}
                    >
                      {card.title}
                    </Typography>

                   </Box> 

                     

                      {card.showImport ? (
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!routePermissions.create}
                            onClick={(event) => {
                              event.stopPropagation();
                              openDialog({
                                title: "Import Sales Orders",
                                width: 520,
                                showCloseButton: true,
                                component: (modalProps: any) => (
                                  <Importsalesorders
                                    {...modalProps}
                                    onImportCompleted={async () => {
                                      await Promise.all([refetchInit(), refetchSalesOrders()]);
                                    }}
                                  />
                                ),
                              });
                            }}
                          >
                            Import
                          </Button>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SalesOrders
        salesOrders={gridRows}
        loading={isLoading || isInitLoading || isStatusLoading}
        headerControlsPlacement="inline"
        headerControls={
          activeCardKey ? (
            <Button size="small" variant="outlined" onClick={handleResetStatusFilter}>
              Clear status filter
            </Button>
          ) : undefined
        }
        title={
          activeCardKey
            ? `${dashboardStats.find((card) => card.key === activeCardKey)?.title || "Sales Orders"} Sales Orders`
            : "Sales Orders"
        }
        noRowsMessage={gridNoRowsMessage}
        // summaryBadges={dashboardStats.map((card) => ({
        //   key: card.key,
        //   title: card.title,
        //   count: card.count,
        //   color: card.color,
        // }))}
      />
    </Box>
    </Page>
  );
};

export default BarcodeDashboard;
