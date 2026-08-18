import React from "react";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import { ProjectStatusBadge } from "./components";
import { invoiceRecords, paymentHistory, projectRecords, type InvoiceRecord } from "./mockData";
import { useProjectManagementGridState } from "./ui";
import {
  buildInitialInvoiceFormValues,
  InvoiceDetailDrawer,
  InvoiceFormDrawer,
  type InvoiceFormValues,
} from "./workspaceDrawers";

type InvoiceStatusFilter = "all" | "Sent" | "Paid" | "Partially Paid" | "Overdue";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const buildNextInvoiceNumber = (rows: InvoiceRecord[]) => {
  const nextNumber =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.invoiceNo.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 2390) + 1;

  return `INV-${nextNumber}`;
};

const ProjectManagementInvoicesPage = () => {
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/invoices"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<InvoiceRecord[]>(invoiceRecords);
  const [customerFilter, setCustomerFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatusFilter>("all");
  const [selectedId, setSelectedId] = React.useState(invoiceRecords[0]?.id ?? "");
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingInvoiceId, setEditingInvoiceId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<InvoiceFormValues>(
    buildInitialInvoiceFormValues(),
  );

  const selectedInvoice = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesCustomer = customerFilter === "all" || row.customer === customerFilter;
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        return matchesCustomer && matchesStatus;
      }),
    [customerFilter, rows, statusFilter],
  );

  const customerOptions = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.customer))),
    [rows],
  );

  const projectOptions = React.useMemo(
    () => Array.from(new Set(projectRecords.map((project) => project.name))),
    [],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingInvoiceId(null);
    setFormValues({
      ...buildInitialInvoiceFormValues(),
      invoiceNo: buildNextInvoiceNumber(rows),
      status: "Sent",
      paidAmount: "0",
    });
    setFormDrawerOpen(true);
  }, [rows]);

  const openEditDrawer = React.useCallback((invoice: InvoiceRecord) => {
    setSelectedId(invoice.id);
    setEditingInvoiceId(invoice.id);
    setFormMode("edit");
    setFormValues(buildInitialInvoiceFormValues(invoice));
    setFormDrawerOpen(true);
  }, []);

  const openDetailDrawer = React.useCallback((invoice: InvoiceRecord) => {
    setSelectedId(invoice.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleSubmit = React.useCallback(() => {
    const nextPayload: InvoiceRecord = {
      id: editingInvoiceId ?? `inv-${Date.now()}`,
      invoiceNo: formValues.invoiceNo || buildNextInvoiceNumber(rows),
      project: formValues.project,
      customer: formValues.customer,
      type: formValues.type,
      amount: Number(formValues.amount) || 0,
      dueDate: formValues.dueDate,
      status: formValues.status,
      paidAmount: Number(formValues.paidAmount) || 0,
    };

    if (formMode === "edit" && editingInvoiceId) {
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === editingInvoiceId ? nextPayload : row)),
      );
      setSelectedId(editingInvoiceId);
      setFormDrawerOpen(false);
      return;
    }

    setRows((currentRows) => [nextPayload, ...currentRows]);
    setSelectedId(nextPayload.id);
    setFormDrawerOpen(false);
  }, [editingInvoiceId, formMode, formValues, rows]);

  const columns = React.useMemo<GridColDef<InvoiceRecord>[]>(
    () => [
      { field: "invoiceNo", headerName: "Invoice No", minWidth: 120, flex: 0.8 },
      { field: "project", headerName: "Project", minWidth: 170, flex: 1 },
      { field: "customer", headerName: "Customer", minWidth: 160, flex: 0.9 },
      { field: "type", headerName: "Type", minWidth: 110, flex: 0.7 },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 130,
        flex: 0.8,
        renderCell: (params: GridRenderCellParams<InvoiceRecord>) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatCurrency(params.row.amount)}
          </Typography>
        ),
      },
      { field: "dueDate", headerName: "Due Date", minWidth: 120, flex: 0.7 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<InvoiceRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Box
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: permissions.view ? "pointer" : "default",
          },
        }}
      >
        <ReusableDataGrid
          rows={filteredRows}
          columns={columns}
          totalCount={filteredRows.length}
          loading={false}
          paginationModel={gridState.paginationModel}
          setPaginationModel={gridState.setPaginationModel}
          sortModel={gridState.sortModel}
          setSortModel={gridState.setSortModel}
          filterModel={gridState.filterModel}
          setFilterModel={gridState.setFilterModel}
          title="Invoice List"
          uniqueIdField="id"
          permissions={{
            create: permissions.create,
            edit: false,
            delete: false,
            view: false,
            download: permissions.download,
          }}
          onAdd={permissions.create ? openCreateDrawer : undefined}
          onRowClick={permissions.view ? openDetailDrawer : undefined}
          searchableFields={["invoiceNo", "project", "customer", "status", "type"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Customer"
                value={customerFilter}
                onChange={(event) => setCustomerFilter(event.target.value)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Customers</MenuItem>
                {customerOptions.map((customer) => (
                  <MenuItem key={customer} value={customer}>
                    {customer}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as InvoiceStatusFilter)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <InvoiceFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmit}
        projectOptions={projectOptions}
      />

      <InvoiceDetailDrawer
        open={detailDrawerOpen}
        invoice={selectedInvoice}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedInvoice) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedInvoice);
        }}
        paymentHistory={paymentHistory}
        formatCurrency={formatCurrency}
      />
    </>
  );
};

export default ProjectManagementInvoicesPage;
