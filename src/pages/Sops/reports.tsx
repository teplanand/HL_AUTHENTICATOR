import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { Page } from "../../../shared/components/common/Page";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useSopsGridState, surfaceSx } from "./ui";
import { sopReportRecords } from "./mockData";
import type { SopReportRecord } from "./types";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";

const reportStatusColorMap = {
  Ready: { bg: "#DCFCE7", color: "#166534" },
  Scheduled: { bg: "#DBEAFE", color: "#1D4ED8" },
  "Needs Review": { bg: "#FEF3C7", color: "#92400E" },
};

const SopsReportsPage = () => {
  const grid = useSopsGridState();
  const routePermissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/sops/reports"),
    [],
  );

  const columns = React.useMemo<GridColDef<SopReportRecord>[]>(
    () => [
      { field: "reportName", headerName: "Report", minWidth: 180, flex: 1.1 },
      { field: "description", headerName: "Description", minWidth: 260, flex: 1.8 },
      { field: "frequency", headerName: "Frequency", minWidth: 110, flex: 0.8 },
      { field: "owner", headerName: "Owner", minWidth: 130, flex: 0.9 },
      { field: "lastGenerated", headerName: "Last Generated", minWidth: 150, flex: 1 },
      { field: "format", headerName: "Format", minWidth: 90, flex: 0.7 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: GridRenderCellParams<SopReportRecord>) => {
          const tone = reportStatusColorMap[params.row.status];
          return (
            <Chip
              label={params.row.status}
              size="small"
              sx={{ bgcolor: tone.bg, color: tone.color, fontWeight: 700 }}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Page module="sops">
      <Stack spacing={1}>
      <Grid container spacing={1}>
        {sopReportRecords.map((report) => (
          <Grid size={{ xs: 12, md: 3 }} key={report.id}>
            <Card sx={surfaceSx}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {report.reportName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                      {report.description}
                    </Typography>
                  </Box>
                  <AssessmentRoundedIcon color="primary" />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={report.frequency} size="small" />
                  <Chip label={report.format} size="small" />
                  <Chip label={report.status} size="small" color="primary" variant="outlined" />
                </Stack>
                <Button
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  disabled={!routePermissions.download}
                  sx={{ mt: 2 }}
                >
                  Generate Mock Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ReusableDataGrid
        rows={sopReportRecords}
        columns={columns}
        totalCount={sopReportRecords.length}
        loading={false}
        paginationModel={grid.paginationModel}
        setPaginationModel={grid.setPaginationModel}
        sortModel={grid.sortModel}
        setSortModel={grid.setSortModel}
        filterModel={grid.filterModel}
        setFilterModel={grid.setFilterModel}
        title="Scheduled & On-demand Reports"
        uniqueIdField="id"
        permissions={{
          create: false,
          edit: routePermissions.edit,
          delete: false,
          view: routePermissions.view,
          download: routePermissions.download,
        }}
        searchableFields={["reportName", "description", "owner", "status", "format"]}
      />
    </Stack>
    </Page>
  );
};

export default SopsReportsPage;
