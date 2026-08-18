import React from "react";
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Page } from "../../../shared/components/common/Page";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { StageChip } from "./components";
import { surfaceSx, useSopsGridState } from "./ui";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import { getSopSessionActor } from "./access";
import type { SopDocumentRecord, SopWorkflowTask } from "./types";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";

const counterColorMap = {
  total: "#1D4ED8",
  draft: "#D97706",
  review: "#7C3AED",
  released: "#059669",
} as const;

const summaryCardClassMap = [
  {
    key: "total",
    label: "Total SOPs",
    helper: "All SOP records",
    color: counterColorMap.total,
  },
  {
    key: "draft",
    label: "Draft / Returned",
    helper: "Need creator update",
    color: counterColorMap.draft,
  },
  {
    key: "review",
    label: "Pending Review",
    helper: "Waiting for action",
    color: counterColorMap.review,
  },
  {
    key: "released",
    label: "Released",
    helper: "Live for users",
    color: counterColorMap.released,
  },
] as const;

const SopsDashboardPage = () => {
  const navigate = useNavigate();
  const routePermissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/sops/dashboard"),
    [],
  );
  const registerGrid = useSopsGridState();
  const reviewGrid = useSopsGridState();
  const { documents, workflowTasks } = useSopsWorkflowData();
  const currentActor = React.useMemo(() => getSopSessionActor(), []);

  const counters = React.useMemo(
    () => ({
      total: documents.length,
      draft: documents.filter((item) => item.status === "Draft" || item.status === "Rejected")
        .length,
      review: documents.filter((item) =>
        [
          "Checker Review",
          "Approver Review",
          "Authorizer Review",
          "Authorized",
        ].includes(item.status),
      ).length,
      released: documents.filter((item) => item.status === "Released").length,
    }),
    [documents],
  );

  const registerColumns = React.useMemo<GridColDef<SopDocumentRecord>[]>(
    () => [
      { field: "sopNumber", headerName: "SOP Number", minWidth: 140, flex: 0.9 },
      { field: "title", headerName: "Title", minWidth: 240, flex: 1.4 },
      { field: "department", headerName: "Department", minWidth: 140, flex: 0.9 },
      { field: "owner", headerName: "Owner", minWidth: 140, flex: 0.9 },
      { field: "version", headerName: "Version", minWidth: 90, flex: 0.6 },
      { field: "effectiveDate", headerName: "Effective Date", minWidth: 130, flex: 0.8 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 160,
        flex: 0.9,
        renderCell: (params: GridRenderCellParams<SopDocumentRecord>) => (
          <StageChip stage={params.row.status} />
        ),
      },
    ],
    [],
  );

  const reviewColumns = React.useMemo<GridColDef<SopWorkflowTask>[]>(
    () => [
      { field: "sopNumber", headerName: "SOP Number", minWidth: 140, flex: 0.9 },
      { field: "title", headerName: "Title", minWidth: 220, flex: 1.4 },
      { field: "assignedTo", headerName: "Assigned To", minWidth: 150, flex: 0.95 },
      { field: "role", headerName: "Role", minWidth: 120, flex: 0.75 },
      {
        field: "stage",
        headerName: "Stage",
        minWidth: 160,
        flex: 0.9,
        renderCell: (params: GridRenderCellParams<SopWorkflowTask>) => (
          <StageChip stage={params.row.stage} />
        ),
      },
      { field: "dueDate", headerName: "Due Date", minWidth: 120, flex: 0.75 },
      {
        field: "slaStatus",
        headerName: "SLA",
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: GridRenderCellParams<SopWorkflowTask>) => (
          <Chip
            label={params.row.slaStatus}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor:
                params.row.slaStatus === "Breached"
                  ? "#FEE2E2"
                  : params.row.slaStatus === "Due Today"
                    ? "#FEF3C7"
                    : "#DBEAFE",
              color:
                params.row.slaStatus === "Breached"
                  ? "#B91C1C"
                  : params.row.slaStatus === "Due Today"
                    ? "#B45309"
                    : "#1D4ED8",
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <Page module="sops">
      <Stack spacing={2}>
      {/* <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            SOP Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Simple overview of SOP count, pending review and released documents.
          </Typography>
          <Chip
            label={`Current user: ${currentActor.name} (${currentActor.role})`}
            size="small"
            variant="outlined"
            sx={{ mt: 1.25 }}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/sops/register")}
          >
            Create SOP
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MenuBookRoundedIcon />}
            onClick={() => navigate("/sops/viewer")}
          >
            Secure Viewer
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsSuggestRoundedIcon />}
            onClick={() => navigate("/sops/category")}
          >
            Category
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryRoundedIcon />}
            onClick={() => navigate("/sops/audit-trail")}
          >
            Audit Trail
          </Button>
        </Stack>
      </Stack> */}

      <Grid container spacing={1.5}>
        {summaryCardClassMap.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.key}>
            <Card sx={surfaceSx}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 1.25, fontWeight: 900, color: card.color, lineHeight: 1 }}
                >
                  {counters[card.key]}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {card.helper}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ReusableDataGrid
        rows={workflowTasks}
        columns={reviewColumns}
        totalCount={workflowTasks.length}
        loading={false}
        paginationModel={reviewGrid.paginationModel}
        setPaginationModel={reviewGrid.setPaginationModel}
        sortModel={reviewGrid.sortModel}
        setSortModel={reviewGrid.setSortModel}
        filterModel={reviewGrid.filterModel}
        setFilterModel={reviewGrid.setFilterModel}
        title="Pending SOP Actions"
        uniqueIdField="id"
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: routePermissions.view,
          download: false,
        }}
        searchableFields={["sopNumber", "title", "assignedTo", "role", "stage", "slaStatus"]}
      />

      <ReusableDataGrid
        rows={documents}
        columns={registerColumns}
        totalCount={documents.length}
        loading={false}
        paginationModel={registerGrid.paginationModel}
        setPaginationModel={registerGrid.setPaginationModel}
        sortModel={registerGrid.sortModel}
        setSortModel={registerGrid.setSortModel}
        filterModel={registerGrid.filterModel}
        setFilterModel={registerGrid.setFilterModel}
        title="SOP Register Snapshot"
        uniqueIdField="id"
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: routePermissions.view,
          download: routePermissions.download,
        }}
        searchableFields={["sopNumber", "title", "department", "owner", "status", "version"]}
      />
    </Stack>
    </Page>
  );
};

export default SopsDashboardPage;
