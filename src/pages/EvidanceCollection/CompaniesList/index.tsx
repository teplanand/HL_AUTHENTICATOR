import { useMemo } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import {
  Apartment as ApartmentIcon,
  MarkEmailRead as MarkEmailReadIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useGetCompanyListQuery } from "../api/evidancecollection";
import {
  extractEvidenceErrorMessage,
  formatEvidenceDateTime,
  normalizeEvidenceCompanies,
} from "../adminUtils";
import { getEvidanceRouteUiPermissions } from "../utils/evidanceAccess";

const CompaniesListPage = () => {
  const { data, isLoading, isFetching, error, refetch } = useGetCompanyListQuery();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const rows = useMemo(
    () =>
      [...normalizeEvidenceCompanies(data)].sort((first, second) => {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondTime - firstTime;
      }),
    [data],
  );
  const routePermissions = useMemo(
    () => getEvidanceRouteUiPermissions("/evidance/companies"),
    [],
  );

  const activeCompanies = rows.filter((company) => company.isActive).length;
  const withEmail = rows.filter((company) => company.email && company.email !== "-").length;

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        minWidth: 90,
        flex: 0.5,
      },
      {
        field: "companyName",
        headerName: "Company Name",
        minWidth: 240,
        flex: 1.2,
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 240,
        flex: 1.1,
      },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 200,
        flex: 1,
        valueFormatter: (value) => formatEvidenceDateTime(String(value ?? "")),
      },
      {
        field: "isActive",
        headerName: "Status",
        minWidth: 140,
        flex: 0.8,
        sortable: false,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.isActive ? "Active" : "Inactive"}
            color={params.row.isActive ? "success" : "default"}
            variant={params.row.isActive ? "filled" : "outlined"}
          />
        ),
      },
    ],
    [],
  );

  const headerControls = useMemo(
    () => (
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Chip
          size="small"
          label={`${activeCompanies} active`}
          sx={{ fontWeight: 700, bgcolor: "rgba(34,197,94,0.12)", color: "#166534" }}
        />
        <Chip
          size="small"
          label={`${rows.length - activeCompanies} inactive`}
          sx={{ fontWeight: 700, bgcolor: "rgba(148,163,184,0.16)", color: "#475569" }}
        />
        <Chip
          size="small"
          label={`${withEmail} with email`}
          sx={{ fontWeight: 700, bgcolor: "rgba(249,115,22,0.12)", color: "#C2410C" }}
        />
      </Stack>
    ),
    [activeCompanies, rows.length, withEmail],
  );

  return (
    <Page module="evidance">
      <Stack spacing={2.5}>
        
    

        <Box
          className="p-0"
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "default",
            },
          }}
        >
          <ReusableDataGrid
            rows={rows}
            columns={columns}
            totalCount={rows.length}
            loading={isLoading || isFetching}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            sortModel={sortModel}
            setSortModel={setSortModel}
            filterModel={filterModel}
            setFilterModel={setFilterModel}
            title="Companies List"
            height="calc(100vh - 120px)"
            refetch={refetch}
            searchableFields={["id", "companyName", "email", "createdAt"]}
            pageSizeOptions={[10, 20, 50]}
            headerControls={headerControls}
            permissions={{
              create: false,
              edit: false,
              delete: false,
              download: routePermissions.download,
              view: false,
            }}
            showFilterButton
            disableColumnMenu={false}
          />
        </Box>
      </Stack>
    </Page>
  );
};

export default CompaniesListPage;
