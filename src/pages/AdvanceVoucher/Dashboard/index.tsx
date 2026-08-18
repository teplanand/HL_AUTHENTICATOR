import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Box,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Pagination,
  Button,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../../shared/hooks/useToast";
import { requisitionsData, dashboardStats } from "../../../../shared/services/mockData";
import { useNavigate } from "react-router";
import CreateRequisitionModal from "./CreateRequisitionModal";
import { useDialog } from "../../../../shared/hooks/useDialog";
import { useModal } from "../../../../shared/hooks/useModal";

interface DashboardProps {
  type: "supplier" | "internal";
}

const summaryCardClassMap: Record<
  string,
  { card: string; active: string; value: string }
> = {
  requested: {
    card: "dashboard-stat-card dashboard-stat-card--requested",
    active: "dashboard-stat-card--requested-active",
    value: "dashboard-stat-value--requested",
  },
  pending: {
    card: "dashboard-stat-card dashboard-stat-card--pending",
    active: "dashboard-stat-card--pending-active",
    value: "dashboard-stat-value--pending",
  },
  approved: {
    card: "dashboard-stat-card dashboard-stat-card--approved",
    active: "dashboard-stat-card--approved-active",
    value: "dashboard-stat-value--approved",
  },
  rejected: {
    card: "dashboard-stat-card dashboard-stat-card--rejected",
    active: "dashboard-stat-card--rejected-active",
    value: "dashboard-stat-value--rejected",
  },
};

const gridStatusChipClassMap: Record<string, string> = {
  Approved: "dashboard-grid-status-chip dashboard-grid-status-chip--approved",
  Rejected: "dashboard-grid-status-chip dashboard-grid-status-chip--rejected",
  Pending: "dashboard-grid-status-chip dashboard-grid-status-chip--pending",
  Requested: "dashboard-grid-status-chip dashboard-grid-status-chip--requested",
};

const requestCardStatusClassMap: Record<
  string,
  { strip: string; chip: string }
> = {
  Approved: {
    strip: "dashboard-request-card__strip--approved",
    chip: "dashboard-request-card__chip--approved",
  },
  Rejected: {
    strip: "dashboard-request-card__strip--rejected",
    chip: "dashboard-request-card__chip--rejected",
  },
  Pending: {
    strip: "dashboard-request-card__strip--pending",
    chip: "dashboard-request-card__chip--pending",
  },
};

const statValueClassFromColor = (color: string) => {
  switch (color) {
    case "#64748b":
      return "dashboard-stat-value dashboard-stat-value--requested";
    case "#F59E0B":
      return "dashboard-stat-value dashboard-stat-value--pending";
    case "#10B981":
      return "dashboard-stat-value dashboard-stat-value--approved";
    case "#EF4444":
      return "dashboard-stat-value dashboard-stat-value--rejected";
    default:
      return "dashboard-stat-value";
  }
};

const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) => (
  <Card className="dashboard-stat-card">
    <CardContent>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="h4"
        className={statValueClassFromColor(color)}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Helper for Mock Data details
const getCheckDetails = (id: string) => [
  {
    name: `Industrial Valve - ${id}`,
    poQty: 100,
    reqQty: 50,
    pendingQty: 50,
    price: 1200,
    total: 60000,
  },
  {
    name: "Safety Gasket",
    poQty: 200,
    reqQty: 100,
    pendingQty: 100,
    price: 500,
    total: 50000,
  },
];

const AdvancePaymentDashboard: React.FC<DashboardProps> = ({ type }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // View Mode State
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Details Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<
    string | null
  >(null);

  // Card View Search & Pagination State
  const [cardSearch, setCardSearch] = useState("");
  const [cardPage, setCardPage] = useState(1);
  const CARD_PAGE_SIZE = 9;

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "table" | "card" | null,
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  // Grid state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 15,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "date", sort: "desc" },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const [activeTab, setActiveTab] = useState("pending");

  // Since we are mocking, we just use the mock data as 'rows'
  const rows = useMemo(() => {
    return requisitionsData.map((item) => ({ ...item, id: item.id }));
  }, []);

  const filteredRows = useMemo(() => {
    // Filter by active tab status (case-insensitive)
    return rows.filter(
      (r) => r.status.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [rows, activeTab]);

  const activeRowsCount = filteredRows.length;

  // Dynamically calculate counts based on rows
  const statusCounts = useMemo(() => {
    return {
      requested: rows.filter((r) => r.status.toLowerCase() === "requested")
        .length,
      pending: rows.filter((r) => r.status.toLowerCase() === "pending").length,
      approved: rows.filter((r) => r.status.toLowerCase() === "approved")
        .length,
      rejected: rows.filter((r) => r.status.toLowerCase() === "rejected")
        .length,
    };
  }, [rows]);

  // --- Card View Logic ---
  const filteredCardRows = useMemo(() => {
    // Apply Tab Filter AND Search
    let data = rows.filter(
      (r) => r.status.toLowerCase() === activeTab.toLowerCase(),
    );

    if (!cardSearch) return data;
    const lowerSearch = cardSearch.toLowerCase();
    return data.filter(
      (r) =>
        r.supplierName.toLowerCase().includes(lowerSearch) ||
        r.requestRef.toLowerCase().includes(lowerSearch) ||
        r.poNo.includes(cardSearch),
    );
  }, [rows, cardSearch, activeTab]);

  const paginatedCardRows = useMemo(() => {
    const start = (cardPage - 1) * CARD_PAGE_SIZE;
    return filteredCardRows.slice(start, start + CARD_PAGE_SIZE);
  }, [filteredCardRows, cardPage]);

  const cardTotalPages = Math.ceil(filteredCardRows.length / CARD_PAGE_SIZE);

  const totalCount = filteredRows.length;
  const isLoading = false;

  const { openModal } = useModal();

  const handleOpenForm = (id?: string) => {
    if (id) {
      showToast(`Edit functionality mock for ID: ${id}`, "info");
    } else {


      //   openModal({
      //       title: 'ADdd',
      //       widthprops: '500px',
      //       askDataChangeConfirm: true,
      //       component: (modelProps: any) =>  <CreateRequisitionModal
      //   open={true}
      //   onClose={handleCloseModal} 
      //   onSubmit={handleFormSubmit}
      // />,
      //       action:  '',
      //       action2:  '',
      //     })

      setIsCreateModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleFormSubmit = (data: any) => {
    console.log("Submitted Data:", data);
    showToast("Requisition Created Successfully!", "success");
    setIsCreateModalOpen(false);
  };

  const handleDeleteClick = (id: string, ref: string) => {
    if (confirm(`Are you sure you want to delete requisition ${ref}?`)) {
      showToast("Mock delete successful", "success");
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedRequisitionId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequisitionId(null);
  };

  const handleAccept = React.useCallback(
    (id: string) => () => {
      showToast(`Accepted requisition ${id}`, "success");
    },
    [showToast],
  );

  const handleReject = React.useCallback(
    (id: string) => () => {
      showToast(`Rejected requisition ${id}`, "error");
    },
    [showToast],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "requestRef",
        headerName: "Request Ref",
        flex: 1,
        minWidth: 200,
        filterable: true,
      },
      {
        field: "supplierName",
        headerName: "Supplier Name",
        flex: 1,
        minWidth: 200,
        filterable: true,
      },
      {
        field: "poNo",
        headerName: "PO No",
        flex: 1,
        minWidth: 150,
        filterable: true,
      },
      {
        field: "poAmount",
        headerName: "PO Amount",
        flex: 1,
        minWidth: 150,
        type: "number",
        filterable: true,
        renderCell: (params: GridRenderCellParams) => (
          <span>₹{params.value?.toLocaleString()}</span>
        ),
      },
      {
        field: "advanceAmount",
        headerName: "Advance Amount",
        flex: 1,
        minWidth: 150,
        type: "number",
        filterable: true,
        renderCell: (params: GridRenderCellParams) => (
          <span>₹{params.value?.toLocaleString()}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 120,
        filterable: true,
        renderCell: (params: GridRenderCellParams) => {
          let color:
            | "default"
            | "primary"
            | "secondary"
            | "error"
            | "info"
            | "success"
            | "warning" = "default";
          let bgcolor = "#eee";
          let textcolor = "#333";

          switch (params.value) {
            case "Approved":
              color = "success";
              bgcolor = "#DEF7EC";
              textcolor = "#03543F";
              break;
            case "Rejected":
              color = "error";
              bgcolor = "#FDE8E8";
              textcolor = "#9B1C1C";
              break;
            case "Pending":
              color = "warning";
              bgcolor = "#FEF3C7";
              textcolor = "#92400E";
              break;
            default:
              bgcolor = "#E1EFFE";
              textcolor = "#1E429F";
          }

          return (
            <Chip
              label={params.value}
              size="small"
              sx={{
                backgroundColor: bgcolor,
                color: textcolor,
                fontWeight: 600,
              }}
            />
          );
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Action",
        width: 150,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<VisibilityIcon color="info" />}
            label="View Details"
            onClick={() => handleViewDetails(params.id as string)}
            showInMenu={false}
          />,
          // <GridActionsCellItem
          //     icon={<EditIcon color="primary" />}
          //     label="Edit"
          //     onClick={() => handleOpenForm(params.id as string)}
          //     showInMenu
          // />,
          // <GridActionsCellItem
          //     icon={<DeleteIcon color="error" />}
          //     label="Delete"
          //     onClick={() => handleDeleteClick(params.id as string, params.row.requestRef)}
          //     showInMenu
          // />,
          <GridActionsCellItem
            icon={<CheckCircleIcon color="success" />}
            label="Accept"
            onClick={handleAccept(params.id as string)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<CancelIcon color="error" />}
            label="Reject"
            onClick={handleReject(params.id as string)}
            showInMenu={false}
          />,
        ],
      },
    ],
    [handleAccept, handleReject],
  );

  return (
    <Box>
      {/* Status Tabs & Create Action */}
      <Grid container spacing={2} className="mb-4">
        {[
          {
            key: "requested",
            label: "Requested",
            color: "#64748b",
            count: statusCounts.requested,
          },
          {
            key: "pending",
            label: "Pending",
            color: "#F59E0B",
            count: statusCounts.pending,
          },
          {
            key: "approved",
            label: "Approved",
            color: "#10B981",
            count: statusCounts.approved,
          },
          {
            key: "rejected",
            label: "Rejected",
            color: "#EF4444",
            count: statusCounts.rejected,
          },
        ].map((tab) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tab.key}>
            <Card
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                summaryCardClassMap[tab.key].card,
                activeTab === tab.key && summaryCardClassMap[tab.key].active,
              )}
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
                    summaryCardClassMap[tab.key].value,
                  )}
                >
                  {tab.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>


      <ReusableDataGrid
        rows={filteredRows}
        columns={columns}
        totalCount={totalCount}
        loading={isLoading}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title={type === "supplier" ? "Supplier Payment" : "Internal Payment"}
        addButtonLabel=" "
        onAdd={() => handleOpenForm()}
        refetch={() => { }}

        enableViewToggle={true}

        permissions={{
          create: true,
          edit: false,
          delete: false,
          download: true,
          view: true,
        }}

        renderRowCard={(row) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={row.id}>
            <Card className="dashboard-request-card">
              {/* Status Strip */}
              <Box
                className={clsx(
                  "dashboard-request-card__strip",
                  (
                    requestCardStatusClassMap[row.status] ??
                    requestCardStatusClassMap.Pending
                  ).strip,
                )}
              />

              <CardContent className="dashboard-request-card__content">
                <Box className="dashboard-request-card__header">
                  <Chip
                    label={row.status}
                    size="small"
                    className={clsx(
                      "dashboard-request-card__chip",
                      (
                        requestCardStatusClassMap[row.status] ??
                        requestCardStatusClassMap.Pending
                      ).chip,
                    )}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(row.date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  gutterBottom
                  noWrap
                  title={row.supplierName}
                  className="dashboard-request-card__supplier"
                >
                  {row.supplierName}
                </Typography>

                <Stack spacing={1} className="dashboard-request-card__meta">
                  <Box className="dashboard-request-card__row">
                    <Typography variant="body2" className="dashboard-request-card__label">
                      PO Number
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {row.poNo}
                    </Typography>
                  </Box>
                  <Box className="dashboard-request-card__row">
                    <Typography variant="body2" className="dashboard-request-card__label">
                      Date
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(row.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Divider className="dashboard-request-card__divider" />
                  <Box className="dashboard-request-card__row">
                    <Typography variant="body2" className="dashboard-request-card__label">
                      Total PO Value
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      ₹{row.poAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box className="dashboard-request-card__row">
                    <Typography variant="body2" className="dashboard-request-card__label">
                      Advance Reqd
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      className="dashboard-request-card__accent-value"
                    >
                      ₹{row.advanceAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <Box className="dashboard-request-card__footer">
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(row.id)}
                  >
                    <VisibilityIcon
                      fontSize="small"
                      className="dashboard-icon-muted"
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenForm(row.id)}
                  >
                    <EditIcon
                      fontSize="small"
                      className="dashboard-icon-muted"
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton size="small" onClick={handleReject(row.id)}>
                    <CancelIcon
                      fontSize="small"
                      className="dashboard-icon-danger"
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve">
                  <IconButton size="small" onClick={handleAccept(row.id)}>
                    <CheckCircleIcon
                      fontSize="small"
                      className="dashboard-icon-success"
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        )}

        uniqueIdField="id"
      />



      {/* Create Requisition Modal */}
      <CreateRequisitionModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      {/* View Details Modal */}
      <Dialog
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "dashboard-detail-paper",
        }}
      >
        <DialogTitle className="dashboard-detail-title">
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Requisition Details
          </Typography>
          <IconButton onClick={handleCloseDetailModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="dashboard-detail-content">
          {selectedRequisitionId && (
            <Box className="dashboard-detail-table-shell">
              <TableContainer>
                <Table size="small">
                  <TableHead className="dashboard-detail-head">
                    <TableRow className="dashboard-detail-head-row">
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">PO Qty</TableCell>
                      <TableCell align="right">Request Qty</TableCell>
                      <TableCell align="right">Pending Qty</TableCell>
                      <TableCell align="right">PO Price</TableCell>
                      <TableCell align="right">Total Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCheckDetails(selectedRequisitionId).map(
                      (detailRow, index) => (
                        <TableRow key={index} className="dashboard-detail-row">
                          <TableCell
                            component="th"
                            scope="row"
                            className="dashboard-detail-product"
                          >
                            {detailRow.name}
                          </TableCell>
                          <TableCell align="right">{detailRow.poQty}</TableCell>
                          <TableCell align="right">
                            {detailRow.reqQty}
                          </TableCell>
                          <TableCell align="right">
                            {detailRow.pendingQty}
                          </TableCell>
                          <TableCell align="right">
                            ₹{detailRow.price.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ₹{detailRow.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {!selectedRequisitionId && (
            <Typography color="textSecondary" align="center" className="dashboard-detail-empty">
              No details available
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdvancePaymentDashboard;
