import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import {
  useApproveRejectRequestMutation,
  useGetRegistrationDataQuery,
} from "../api/evidancecollection";
import { useToast } from "../../../../shared/hooks/useToast";
import {
  extractEvidenceErrorMessage,
  formatEvidenceDateTime,
  normalizeEvidenceRegistrations,
} from "../adminUtils";
import { getEvidanceRouteUiPermissions } from "../utils/evidanceAccess";

const APPROVED_STATUS_CODE = 1;
const REJECTED_STATUS_CODE = 2;

const UserRegistrationPage = () => {
  const { showToast } = useToast();
  const [processingHrmsId, setProcessingHrmsId] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetRegistrationDataQuery();
  const [approveRejectRequest] = useApproveRejectRequestMutation();
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
      [...normalizeEvidenceRegistrations(data)].sort((first, second) => {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondTime - firstTime;
      }),
    [data],
  );
  const routePermissions = useMemo(
    () => getEvidanceRouteUiPermissions("/evidance/user-registration"),
    [],
  );
  const canApproveRegistrations = routePermissions.approve;

  const handleAction = async (hrmsId: string, status: number) => {
    setProcessingHrmsId(hrmsId);

    try {
      await approveRejectRequest({
        HrmsId: hrmsId,
        Status: status,
      }).unwrap();

      showToast(
        status === APPROVED_STATUS_CODE
          ? `Registration ${hrmsId} approved successfully`
          : `Registration ${hrmsId} rejected successfully`,
        status === APPROVED_STATUS_CODE ? "success" : "warning",
      );

      refetch();
    } catch (actionError) {
      showToast(
        extractEvidenceErrorMessage(actionError) || "Unable to update registration status.",
        "error",
      );
    } finally {
      setProcessingHrmsId("");
    }
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        minWidth: 90,
        flex: 0.55,
      },
      {
        field: "hrmsId",
        headerName: "HRMS ID",
        minWidth: 150,
        flex: 0.9,
      },
      {
        field: "mobileNo",
        headerName: "Mobile No",
        minWidth: 150,
        flex: 0.95,
      },
      {
        field: "androidId",
        headerName: "Android ID",
        minWidth: 260,
        flex: 1.5,
      },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 190,
        flex: 1,
        valueFormatter: (value) => formatEvidenceDateTime(String(value ?? "")),
      },
      {
        field: "isActive",
        headerName: "Active",
        minWidth: 120,
        flex: 0.75,
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
      {
        field: "statusLabel",
        headerName: "Status",
        minWidth: 130,
        flex: 0.8,
        sortable: false,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.statusLabel}
            color={
              params.row.statusCode === APPROVED_STATUS_CODE
                ? "success"
                : params.row.statusCode === REJECTED_STATUS_CODE
                  ? "error"
                  : "warning"
            }
            variant="outlined"
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 220,
        flex: 1.2,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isProcessing = processingHrmsId === params.row.hrmsId;
          const isApproved = params.row.statusCode === APPROVED_STATUS_CODE;
          const isRejected = params.row.statusCode === REJECTED_STATUS_CODE;

          return (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={isProcessing || isApproved || !canApproveRegistrations}
                onClick={() => handleAction(params.row.hrmsId, APPROVED_STATUS_CODE)}
              >
                {isProcessing ? "Saving..." : "Approve"}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                disabled={isProcessing || isRejected || !canApproveRegistrations}
                onClick={() => handleAction(params.row.hrmsId, REJECTED_STATUS_CODE)}
              >
                {isProcessing ? "Saving..." : "Reject"}
              </Button>
            </Stack>
          );
        },
      },
    ],
    [canApproveRegistrations, processingHrmsId],
  );

  const headerControls = useMemo(
    () => (
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Chip
          size="small"
          label={`${rows.length} total`}
          sx={{ fontWeight: 700, bgcolor: "rgba(59,130,246,0.12)", color: "#1D4ED8" }}
        />
        <Chip
          size="small"
          label={`${rows.filter((row) => row.statusCode === APPROVED_STATUS_CODE).length} approved`}
          sx={{ fontWeight: 700, bgcolor: "rgba(34,197,94,0.12)", color: "#166534" }}
        />
        <Chip
          size="small"
          label={`${rows.filter((row) => row.statusCode === REJECTED_STATUS_CODE).length} rejected`}
          sx={{ fontWeight: 700, bgcolor: "rgba(239,68,68,0.12)", color: "#991B1B" }}
        />
        <Chip
          size="small"
          label={`${rows.filter((row) => row.statusCode !== APPROVED_STATUS_CODE && row.statusCode !== REJECTED_STATUS_CODE).length} pending`}
          sx={{ fontWeight: 700, bgcolor: "rgba(245,158,11,0.12)", color: "#B45309" }}
        />
      </Stack>
    ),
    [rows],
  );

  return (
    <Page module="evidance">
      <>
       
        {!canApproveRegistrations && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Approval actions are not available. This page is in read-only mode.
          </Alert>
        )}

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
            title="User Registration List"
            height="calc(100vh - 120px)"
            refetch={refetch}
            searchableFields={["id", "hrmsId", "mobileNo", "androidId", "createdAt", "statusLabel"]}
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
      </>
    </Page>
  );
};

export default UserRegistrationPage;
