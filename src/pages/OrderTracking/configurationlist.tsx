import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";

import ApiActionButton from "../../../shared/components/common/ApiActionButton";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../shared/hooks/useModal";
import { AddItemPlan, AddItemPlanRef } from "./Dashboard/components/additemplan";
import {
  SysConfigurationRecord,
  useGetSysConfigurationsMutation,
} from "./api/ordertracking";
import { formatDateWithShortMonth } from "../../../shared/utils/FormatDate";

type DivisionTab = "EP" | "CP";

const divisionCardClassMap: Record<
  DivisionTab,
  { card: string; active: string; value: string; numberColor: string }
> = {
  EP: {
    card: "dashboard-stat-card dashboard-stat-card--approved",
    active: "dashboard-stat-card--approved-active",
    value: "dashboard-stat-value--approved",
    numberColor: "#10b981",
  },
  CP: {
    card: "dashboard-stat-card dashboard-stat-card--pending",
    active: "dashboard-stat-card--pending-active",
    value: "dashboard-stat-value--pending",
    numberColor: "#f59e0b",
  },
};

const formatDate = (value: unknown) => {
  if (!value) {
    return "-";
  }

  return formatDateWithShortMonth(String(value)) || "-";
};

const ConfigurationListPage = () => {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<DivisionTab>("EP");
  const [divisionRows, setDivisionRows] = useState<Record<DivisionTab, SysConfigurationRecord[]>>({
    EP: [],
    CP: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [getSysConfigurations] = useGetSysConfigurationsMutation();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 15,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "config_title", sort: "asc" },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const fetchDivisionConfigurations = useCallback(
    async (division: DivisionTab) => {
      const payload = await getSysConfigurations({
        division,
        whCon: `1=1 and  division = '${division}'`,
      }).unwrap();

      return (payload.data ?? []).map((item, index) => ({
        ...item,
        id: item.id ?? `${division}-${index}`,
      }));
    },
    [getSysConfigurations]
  );

  const refreshConfigurations = useCallback(async () => {
    setIsLoading(true);

    try {
      const epRows = await fetchDivisionConfigurations("EP");
      const cpRows = await fetchDivisionConfigurations("CP");

      setDivisionRows({
        EP: epRows,
        CP: cpRows,
      });
    } catch (error) {
      console.error("Failed to fetch configurations", error);
      setDivisionRows({
        EP: [],
        CP: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDivisionConfigurations]);

  useEffect(() => {
    refreshConfigurations();
  }, [refreshConfigurations]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [activeTab]);

  const handleRowClick = useCallback(
    (row: SysConfigurationRecord) => {
      const addItemPlanRef = React.createRef<AddItemPlanRef>();

      openModal({
        title: row.config_title || "Edit Configuration",
        width: "520px",
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <AddItemPlan
            {...modalProps}
            ref={addItemPlanRef}
            rowData={row}
            onSaved={refreshConfigurations}
          />
        ),
        action: (
          <ApiActionButton
            onApiCall={() => addItemPlanRef.current?.submit?.() ?? Promise.resolve()}
            loadingText="Updating..."
          >
            Update
          </ApiActionButton>
        ),
      });
    },
    [openModal, refreshConfigurations]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "config_title",
        headerName: "Config Title",
         flex: 1.2,
      },
      {
        field: "config_description",
        headerName: "Config Description",
         flex: 1.5,
      },
      {
        field: "config_value",
        headerName: "Config Value",
         flex: 1,
      },
      {
        field: "division",
        headerName: "Division",
         flex: 0.7,
        
      },
      {
        field: "start_date",
        headerName: "Start Date",
        filterable: false,
         flex: 0.9,
        valueFormatter: (value) => formatDate(value),
      },
      {
        field: "end_date",
        headerName: "End Date",
        filterable: false,
         flex: 0.9,
        valueFormatter: (value) => formatDate(value),
      },
    ],
    []
  );

  const rows = divisionRows[activeTab];
  const totalCount = rows.length;

  return (
    <Box>
      <Grid container spacing={2} className="mb-4">
        {([
          { key: "EP" as const, label: "EP" },
          { key: "CP" as const, label: "CP" },
        ]).map((tab) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tab.key}>
            <Card
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                divisionCardClassMap[tab.key].card,
                activeTab === tab.key && divisionCardClassMap[tab.key].active
              )}
              sx={{ cursor: "pointer" }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                  className="dashboard-stat-title"
                >
                  {tab.label}
                </Typography>
                <Typography
                  variant="h4"
                  className={clsx(
                    "dashboard-stat-value",
                    divisionCardClassMap[tab.key].value
                  )}
                  sx={{ color: divisionCardClassMap[tab.key].numberColor }}
                >
                  {divisionRows[tab.key].length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ReusableDataGrid
        rows={rows}
        columns={columns}
        totalCount={totalCount}
        loading={isLoading}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title="Configuration List"
        refetch={refreshConfigurations}
        enableViewToggle={false}
        permissions={{
          create: false,
          edit: false,
          delete: false,
          download: true,
          view: false,
        }}
        uniqueIdField="id"
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default ConfigurationListPage;
