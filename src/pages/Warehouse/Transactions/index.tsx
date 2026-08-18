import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../../shared/hooks/useToast";
import { useListTransactionsQuery } from "../api/warehouse";
import { formatDateTime } from "../../../../shared/utils/FormatDate";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";
import { buildGridApiParams, extractApiRows, extractApiTotalCount } from "../shared/gridApiHelpers";

const normalizeOperation = (value: unknown) => {
  const rawValue = String(value || "").trim().toUpperCase();

  if (rawValue === "1" || rawValue === "IN") {
    return "IN";
  }

  if (rawValue === "2" || rawValue === "OUT") {
    return "OUT";
  }

  return rawValue || "-";
};

const TransactionsPage: React.FC = () => {
  const { showToast } = useToast();
  const routePermissions = useMemo(
    () => getStaticModuleRouteUiPermissions("/Warehouse/transactions"),
    [],
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 15,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "transaction_date", sort: "desc" },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const apiParams = useMemo(
    () => buildGridApiParams({ paginationModel, sortModel, filterModel }),
    [filterModel, paginationModel, sortModel]
  );

  const { data, error, isLoading, isFetching, refetch } = useListTransactionsQuery(apiParams);

  const rows = useMemo(
    () =>
      extractApiRows(data).map((transaction: any, index: number) => {
        const transactionDateRaw =
          transaction.transaction_date ||
          transaction.transactionDate ||
          transaction.created_at ||
          transaction.created_date ||
          transaction.createdAt ||
          "";

        return {
          ...transaction,
          id:
            transaction.id ??
            transaction.transaction_id ??
            transaction.transactionId ??
            transaction.reference_id ??
            index + 1,
          oracleCode: transaction.oracle_code ?? transaction.oracleCode ?? transaction.item_code ?? "-",
          operation: normalizeOperation(
            transaction.operation ?? transaction.transaction_type ?? transaction.type
          ),
          qty: Number(transaction.qty ?? transaction.quantity ?? transaction.total_qty ?? 0),
          rackId: transaction.rack_id ?? transaction.rackId ?? "-",
          palletId: transaction.pallet_id ?? transaction.palletId ?? "-",
          subLocId: transaction.sub_loc_id ?? transaction.subLocId ?? "-",
          supplierId: transaction.supplier_id ?? transaction.supplierId ?? "-",
          transaction_date: transactionDateRaw,
          transactionDate: transactionDateRaw ? formatDateTime(transactionDateRaw) : "-",
          createdBy:
            transaction.created_by_name ??
            transaction.created_by ??
            transaction.user_name ??
            transaction.username ??
            "-",
        };
      }),
    [data]
  );

  const totalCount = useMemo(() => extractApiTotalCount(data, rows.length), [data, rows.length]);
  const loading = isLoading || isFetching;

  useEffect(() => {
    if (!error) {
      return;
    }

    showToast(
      (error as any)?.data?.message || (error as any)?.message || "Failed to fetch transactions",
      "error"
    );
  }, [error, showToast]);

  const columns: GridColDef[] = [
    {
      field: "operation",
      headerName: "Operation",
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => {
        const isIn = params.value === "IN";

        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              minWidth: 72,
              fontWeight: 700,
              color: isIn ? "#166534" : "#B45309",
              bgcolor: isIn ? "#DCFCE7" : "#FEF3C7",
              borderRadius: "999px",
            }}
          />
        );
      },
    },
    { field: "oracleCode", headerName: "Oracle Code", flex: 1, minWidth: 160 },
    { field: "qty", headerName: "Qty", flex: 0.6, minWidth: 90, type: "string" },
    { field: "rackId", headerName: "Rack ID", flex: 0.8, minWidth: 110 },
    { field: "palletId", headerName: "Pallet ID", flex: 0.8, minWidth: 120 },
    { field: "subLocId", headerName: "Sub Location", flex: 0.9, minWidth: 130 },
    { field: "supplierId", headerName: "Supplier ID", flex: 0.9, minWidth: 130 },
    { field: "createdBy", headerName: "Created By", flex: 0.9, minWidth: 130 },
    {
      field: "transactionDate",
      headerName: "Transaction Date",
      flex: 1.05,
      minWidth: 170,
      renderCell: (params) => params.row.transactionDate,
    },
  ];

  return (
    <Page module="Warehouse">
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
          totalCount={totalCount}
          loading={loading}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          filterModel={filterModel}
          setFilterModel={setFilterModel}
          title="Transaction History"
          permissions={{
            create: false,
            edit: false,
            delete: false,
            download: routePermissions.download,
            view: routePermissions.view,
          }}
          refetch={refetch}
          height="calc(100vh - 120px)"
        />
      </Box>
    </Page>
  );
};

export default TransactionsPage;
