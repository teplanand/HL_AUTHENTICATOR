import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Page } from "../../../shared/components/common/Page";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import { MetricCard } from "./components";
import { useSopsGridState, surfaceSx } from "./ui";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import type { SopAuditRecord } from "./types";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";

const SopsAuditTrailPage = () => {
  const grid = useSopsGridState();
  const { audits } = useSopsWorkflowData();
  const routePermissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/sops/audit-trail"),
    [],
  );

  const columns = React.useMemo<GridColDef<SopAuditRecord>[]>(
    () => [
      { field: "timestamp", headerName: "Timestamp", minWidth: 140, flex: 0.9 },
      { field: "user", headerName: "User", minWidth: 130, flex: 0.9 },
      { field: "role", headerName: "Role", minWidth: 120, flex: 0.8 },
      { field: "action", headerName: "Action", minWidth: 150, flex: 0.9 },
      { field: "module", headerName: "Module", minWidth: 150, flex: 1 },
      { field: "sopNumber", headerName: "SOP Number", minWidth: 130, flex: 0.9 },
      { field: "oldValue", headerName: "Old Value", minWidth: 160, flex: 1.1 },
      { field: "newValue", headerName: "New Value", minWidth: 180, flex: 1.2 },
      { field: "ipAddress", headerName: "IP Address", minWidth: 120, flex: 0.8 },
      { field: "device", headerName: "Device", minWidth: 150, flex: 1 },
    ],
    [],
  );

  return (
    <Page module="sops">
      <Stack spacing={3}>
     
    

      <ReusableDataGrid
        rows={audits}
        columns={columns}
        totalCount={audits.length}
        loading={false}
        paginationModel={grid.paginationModel}
        setPaginationModel={grid.setPaginationModel}
        sortModel={grid.sortModel}
        setSortModel={grid.setSortModel}
        filterModel={grid.filterModel}
        setFilterModel={grid.setFilterModel}
        height={580}
        title="Audit History"
        uniqueIdField="id"
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: routePermissions.view,
          download: routePermissions.download,
        }}
        searchableFields={["user", "role", "action", "module", "sopNumber", "device", "ipAddress"]}
      />
    </Stack>
    </Page>
  );
};

export default SopsAuditTrailPage;
