import React, { useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";

import { ViewDetails } from "./viewdetails";
import ReusableDataGrid from "../../../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../../../shared/hooks/useModal";
import {
  BarcodeRecentOrderRow,
  mapSalesOrderDetails,
  mapSalesOrdersList,
} from "../barcodeAdapters";
import {
  getBarcodeDefaultContext,
  useGetSalesOrdersQuery,
  useLazyGetSalesOrderDetailsQuery,
} from "../../api/barcode";

type RecentSalesOrder = BarcodeRecentOrderRow;
const EMPTY_SALES_ORDERS: RecentSalesOrder[] = [];

const getStatusColor = (status: RecentSalesOrder["status"]) => {
  switch (status) {
    case "New Sales Order":
      return { bg: "#E1EFFE", color: "#1E429F" };
    case "HOD Review":
      return { bg: "#FEF3C7", color: "#92400E" };
    case "Planning":
      return { bg: "#E0F2FE", color: "#0369A1" };
    case "Dispatched":
      return { bg: "#DEF7EC", color: "#03543F" };
    default:
      return { bg: "#F3F4F6", color: "#374151" };
  }
};

const formatDate = (value?: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
};

interface SalesOrdersProps {
  salesOrders?: RecentSalesOrder[];
  title?: string;
  loading?: boolean;
  headerControls?: React.ReactNode;
  headerControlsPlacement?: "below" | "inline";
  summaryBadges?: Array<{
    key: string;
    title: string;
    count: string | number;
    color?: string;
  }>;
  noRowsMessage?: string;
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
}

const SalesOrders = ({
  salesOrders,
  title,
  loading = false,
  headerControls,
  headerControlsPlacement = "below",
  summaryBadges = [],
  noRowsMessage,
}: SalesOrdersProps) => {
  const { openModal } = useModal();
  const [triggerOrderDetails] = useLazyGetSalesOrderDetailsQuery();
  const { data: salesOrdersResponse, isLoading: isSalesOrdersLoading } = useGetSalesOrdersQuery(
    undefined,
    {
      skip: salesOrders !== undefined,
    }
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const salesOrderRows = useMemo(() => {
    if (salesOrders !== undefined) {
      return salesOrders;
    }

    if (!salesOrdersResponse) {
      return EMPTY_SALES_ORDERS;
    }

    return mapSalesOrdersList(salesOrdersResponse?.data ?? salesOrdersResponse);
  }, [salesOrders, salesOrdersResponse]);

  const openQuickView = async (order: RecentSalesOrder): Promise<void> => {
    let prefetchedDetails = null;

    try {
      const response = await triggerOrderDetails({
        ...getBarcodeDefaultContext(),
        order_number: order.orderNumber,
      }).unwrap();

      prefetchedDetails = mapSalesOrderDetails(response?.data);
    } catch {
      prefetchedDetails = null;
    }

    openModal({
      title: "Sales Order View",
      width: "calc(100% - 100px)",
      showCloseButton: true,
      askDataChangeConfirm: false,
      component: (modalProps: any) => (
        <ViewDetails
          {...modalProps}
          orderNumber={order.orderNumber}
          defaultValues={prefetchedDetails}
        />
      ),
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "orderNumber",
        headerName: "Oracle Order No",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "orderId",
        headerName: "Order ID",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "createdAt",
        headerName: "Booked Date",
        flex: 1,
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<RecentSalesOrder>) =>
          formatDate(String(params.value || "")),
      },
      {
        field: "rawOrderStatus",
        headerName: "Order Status",
        flex: 1,
        minWidth: 160,
        renderCell: (params: GridRenderCellParams<RecentSalesOrder>) => {
          const statusStyle = getStatusColor(
            params.row.status as RecentSalesOrder["status"]
          );

          return (
            <Chip
              label={String(params.value || "--")}
              size="small"
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                fontWeight: 600,
              }}
            />
          );
        },
      },
       
    ],
    []
  );

  const summaryHeaderControls = useMemo(
    () => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {summaryBadges.map((badge) => (
          <Chip
            key={badge.key}
            size="small"
            label={`${badge.count} ${badge.title.toLowerCase()}`}
            sx={{
              fontWeight: 700,
              bgcolor: badge.color ? `${badge.color}1F` : "rgba(59,130,246,0.12)",
              color: badge.color || "#1D4ED8",
            }}
          />
        ))}
      </Box>
    ),
    [summaryBadges],
  );

  const effectiveHeaderControls = useMemo(() => {
    if (!summaryBadges.length && !headerControls) {
      return undefined;
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        {summaryBadges.length ? summaryHeaderControls : null}
        {headerControls}
      </Box>
    );
  }, [headerControls, summaryBadges.length, summaryHeaderControls]);

  return (
    <Box  sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "default",
            },
          }}>
      <ReusableDataGrid
        rows={salesOrderRows}
        columns={columns}
        totalCount={salesOrderRows.length}
        loading={loading || isSalesOrdersLoading}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title={title || "Sales Orders"}
        refetch={() => undefined}
        headerControls={effectiveHeaderControls}
        headerControlsPlacement={headerControlsPlacement}
        enableViewToggle={false}
        height={'calc(100vh - 250px)'}
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: true,
          download: true,
        }}
        noRowsMessage={noRowsMessage}
        uniqueIdField="id"
        onRowClick={openQuickView}
      />
    </Box>
  );
};

export default SalesOrders;
