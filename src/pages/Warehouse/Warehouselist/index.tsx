import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import {
    GridColDef,
    GridFilterItem,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
} from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import {
    useCreateWarehouseMutation,
    useDeleteWarehouseMutation,
    useListWarehousesQuery,
    useUpdateWarehouseMutation,
} from "../api/warehouse";
import { useAppSelector } from "../../../../shared/redux/hooks";
import {
    buildWarehouseCreatePayload,
    buildWarehouseUpdatePayload,
} from "../shared/payloadBuilders";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";
import {
    AddEditWarehouse,
    AddEditWarehouseRef,
    type WarehouseSubmitPayload,
} from "./addeditwarehouse";
import { openEntityFormModal } from "../shared/openEntityFormModal";

const toWarehouseCode = (value: string) => {
    const cleaned = value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return cleaned ? `WH-${cleaned}` : "WH-001";
};

const extractWarehouseRows = (response: any) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    if (Array.isArray(response?.rows)) {
        return response.rows;
    }

    if (Array.isArray(response?.data?.rows)) {
        return response.data.rows;
    }

    return [];
};

const extractTotalCount = (response: any, fallbackCount: number) =>
    response?.total ??
    response?.data?.total ??
    response?.count ??
    response?.data?.count ??
    fallbackCount;

const WarehouselistPage: React.FC = () => {
    const routePermissions = useMemo(
        () => getStaticModuleRouteUiPermissions("/Warehouse/warehouselist"),
        [],
    );
    const { openModal } = useModal();
    const { showToast } = useToast();
    const authUserId = useAppSelector((state) => state.auth.id);
    const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();
    const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();
    const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

    const handleSubmitWarehouse = useCallback(async (payload: WarehouseSubmitPayload) => {
        try {
            const warehouseCode = payload.warehouseCode || toWarehouseCode(payload.warehouseName);

            if (payload.id) {
                await updateWarehouse({
                    id: payload.id,
                    ...(buildWarehouseUpdatePayload({
                        warehouseCode,
                        warehouseName: payload.warehouseName,
                        managerName: payload.managerName,
                        contactNo: payload.contact_no,
                        email: payload.email,
                        address: payload.address,
                        notes: payload.notes,
                        status: payload.status,
                    }, authUserId ? String(authUserId) : "admin") as any),
                }).unwrap();
            } else {
                await createWarehouse(
                    buildWarehouseCreatePayload({
                        warehouseCode,
                        warehouseName: payload.warehouseName,
                        managerName: payload.managerName,
                        contactNo: payload.contact_no,
                        email: payload.email,
                        address: payload.address,
                        notes: payload.notes,
                        status: payload.status,
                    }, authUserId ? String(authUserId) : "admin") as any
                ).unwrap();
            }
        } catch (error: any) {
            showToast(
                error?.data?.message || error?.message || "Failed to save warehouse",
                "error"
            );
            throw error;
        }
    }, [authUserId, createWarehouse, showToast, updateWarehouse]);

    const handleDeleteWarehouse = useCallback(async (id: string | number) => {
        try {
            await deleteWarehouse(id).unwrap();
        } catch (error: any) {
            showToast(
                error?.data?.message || error?.message || "Failed to delete warehouse",
                "error"
            );
            throw error;
        }
    }, [deleteWarehouse, showToast]);

    const handleAddWarehouse = () => {
        openEntityFormModal<AddEditWarehouseRef>({
            openModal,
            entityLabel: "Warehouse",
            width: 720,
            FormComponent: AddEditWarehouse,
            extraProps: {
                onSubmitWarehouse: handleSubmitWarehouse,
                onDeleteWarehouse: handleDeleteWarehouse,
            },
        });
    };

    const handleEditWarehouse = (row: any) => {
        openEntityFormModal<AddEditWarehouseRef>({
            openModal,
            entityLabel: "Warehouse",
            width: 720,
            FormComponent: AddEditWarehouse,
            defaultValues: row,
            extraProps: {
                onSubmitWarehouse: handleSubmitWarehouse,
                onDeleteWarehouse: handleDeleteWarehouse,
            },
        });
    };

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 15,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
        quickFilterValues: [],
    });

    const buildApiParams = useCallback((currentFilterModel: GridFilterModel) => {
        const params: Record<string, unknown> = {};

        if (
            currentFilterModel.quickFilterValues &&
            currentFilterModel.quickFilterValues.length > 0
        ) {
            params.search = currentFilterModel.quickFilterValues.join(" ");
        }

        currentFilterModel.items.forEach((item: GridFilterItem) => {
            if (
                item.value === undefined ||
                item.value === null ||
                item.value === ""
            ) {
                return;
            }

            params[item.field] = item.value;
        });

        return params;
    }, []);

    const apiParams = useMemo(() => {
        const params = buildApiParams(filterModel);

        return {
            skip: paginationModel.page * paginationModel.pageSize,
            limit: paginationModel.pageSize,
            sort_by: sortModel.length > 0 ? String(sortModel[0].field) : "id",
            sort_order: sortModel.length > 0 ? sortModel[0].sort || "desc" : "desc",
            ...params,
        };
    }, [buildApiParams, filterModel, paginationModel, sortModel]);

    const {
        data,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useListWarehousesQuery(apiParams);

    const rows = useMemo(
        () =>
            extractWarehouseRows(data).map((warehouse: any, index: number) => ({
                ...warehouse,
                warehouse_info: warehouse.warehouse_info ?? {},
                id: warehouse.id ?? warehouse.warehouse_id ?? warehouse.wh_id ?? index + 1,
                warehouseCode:
                    warehouse.warehouseCode ??
                    warehouse.warehouse_code ??
                    toWarehouseCode(
                        warehouse.name ??
                        warehouse.warehouse_name ??
                        warehouse.warehouseName ??
                        ""
                    ),
                name:
                    warehouse.name ??
                    warehouse.warehouse_name ??
                    warehouse.warehouseName ??
                    "",
                warehouseName:
                    warehouse.warehouseName ??
                    warehouse.warehouse_name ??
                    warehouse.name ??
                    "",
                managerName:
                    warehouse.managerName ??
                    warehouse.manager_name ??
                    warehouse.warehouse_info?.manager_name ??
                    "",
                contactNumber:
                    warehouse.contactNumber ??
                    warehouse.contact_no ??
                    warehouse.contact_number ??
                    warehouse.warehouse_info?.contact_no ??
                    "",
                email:
                    warehouse.email ??
                    warehouse.warehouse_info?.email ??
                    "",
                address:
                    warehouse.address ??
                    warehouse.warehouse_info?.address ??
                    "",
                notes:
                    warehouse.notes ??
                    warehouse.warehouse_info?.notes ??
                    "",
                status: warehouse.status ?? (warehouse.is_active === false ? "INACTIVE" : "ACTIVE"),
                sections_count: Number(
                    warehouse.sections_count ??
                    warehouse.section_count ??
                    warehouse.zones_count ??
                    warehouse.zone_count ??
                    warehouse.total_sections ??
                    warehouse.total_zones ??
                    0
                ),
            })),
        [data]
    );

    const totalCount = useMemo(() => extractTotalCount(data, rows.length), [data, rows.length]);

    const loading = isLoading || isFetching || isCreating || isUpdating || isDeleting;

    useEffect(() => {
        if (!error) {
            return;
        }

        const message =
            (error as any)?.data?.message ||
            (error as any)?.message ||
            "Failed to fetch warehouses";

        showToast(message, "error");
    }, [error, showToast]);

    const columns: GridColDef[] = useMemo(
        () => [
            { field: "warehouseCode", headerName: "Code", flex: 0.9, minWidth: 140 },
            { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
            { field: "managerName", headerName: "Manager", flex: 1, minWidth: 180 },
            { field: "contactNumber", headerName: "Contact No", flex: 1, minWidth: 160 },
            { field: "address", headerName: "Address", flex: 1, minWidth: 180 },
            {
                field: "status",
                headerName: "Status",
                flex: 0.8,
                minWidth: 140,
                renderCell: (params) => {
                    const isActive = params.value === "ACTIVE";

                    return (
                        <Chip
                            label={isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                color: isActive ? "#166534" : "#991B1B",
                                bgcolor: isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                borderRadius: "999px",
                            }}
                        />
                    );
                },
            },
            // {
            //     field: "sections_count",
            //     headerName: "Zones Count",
            //     flex: 0.8,
            //     minWidth: 150,
            //     type: "string",
            // },
        ],
        []
    );

    return (
        <Page module="Warehouse">
            <Box
                className="p-0"
                sx={{
                    "& .MuiDataGrid-row:hover": {
                        cursor: "pointer",
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
                    title="Warehouse List"
                    height={"calc(100vh - 120px)"}
                    refetch={refetch}
                    permissions={{
                        create: routePermissions.create,
                        edit: routePermissions.edit,
                        delete: routePermissions.delete,
                        download: routePermissions.download,
                        view: routePermissions.view,
                    }}
                    onAdd={handleAddWarehouse}
                    onRowClick={handleEditWarehouse}

                />
            </Box>
        </Page>
    );
};

export default WarehouselistPage;
