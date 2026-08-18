import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import {
    useCreateZoneMutation,
    useDeleteZoneMutation,
    useListWarehousesQuery,
    useListZonesQuery,
    useUpdateZoneMutation,
} from "../api/warehouse";
import { AddEditZone, AddEditZoneRef, type ZoneSubmitPayload } from "./addeditzone";
import { openEntityFormModal } from "../shared/openEntityFormModal";
import { buildGridApiParams, extractApiRows, extractApiTotalCount } from "../shared/gridApiHelpers";
import { buildZoneCreatePayload, buildZoneUpdatePayload } from "../shared/payloadBuilders";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";

const ZonelistPage: React.FC = () => {
    const routePermissions = useMemo(
        () => getStaticModuleRouteUiPermissions("/Warehouse/zonelist"),
        [],
    );
    const { openModal } = useModal();
    const { showToast } = useToast();
    const [createZone, { isLoading: isCreating }] = useCreateZoneMutation();
    const [updateZone, { isLoading: isUpdating }] = useUpdateZoneMutation();
    const [deleteZone, { isLoading: isDeleting }] = useDeleteZoneMutation();

    const handleSubmitZone = useCallback(async (payload: ZoneSubmitPayload) => {
        try {
            if (payload.id) {
                await updateZone({
                    id: payload.id,
                    ...(buildZoneUpdatePayload({
                        warehouse_id: payload.warehouse_id,
                        zone_code: payload.zone_code,
                        zone_title: payload.zone_title,
                        zone_description: payload.zone_description,
                        status: payload.status,
                    }) as any),
                }).unwrap();
            } else {
                await createZone(buildZoneCreatePayload(payload) as any).unwrap();
            }
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to save zone", "error");
            throw error;
        }
    }, [createZone, showToast, updateZone]);

    const handleDeleteZone = useCallback(async (id: string | number) => {
        try {
            await deleteZone(id).unwrap();
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to delete zone", "error");
            throw error;
        }
    }, [deleteZone, showToast]);

    const handleAddZone = () => {
        openEntityFormModal<AddEditZoneRef>({
            openModal,
            entityLabel: "Zone",
            width: 720,
            FormComponent: AddEditZone,
            extraProps: {
                onSubmitZone: handleSubmitZone,
                onDeleteZone: handleDeleteZone,
            },
        });
    };

    const handleEditZone = (row: any) => {
        openEntityFormModal<AddEditZoneRef>({
            openModal,
            entityLabel: "Zone",
            width: 520,
            FormComponent: AddEditZone,
            defaultValues: row,
            extraProps: {
                onSubmitZone: handleSubmitZone,
                onDeleteZone: handleDeleteZone,
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

    const apiParams = useMemo(
        () => buildGridApiParams({ paginationModel, sortModel, filterModel }),
        [filterModel, paginationModel, sortModel]
    );

    const { data, error, isLoading, isFetching, refetch } = useListZonesQuery(apiParams);
    const { data: warehousesData } = useListWarehousesQuery();

    const warehouseMap = useMemo(() => {
        const entries = extractApiRows(warehousesData).map((warehouse: any) => [
            String(warehouse.id),
            warehouse.warehouse_name || warehouse.warehouseName || warehouse.name || `Warehouse ${warehouse.id}`,
        ]);
        return new Map(entries);
    }, [warehousesData]);

    const rows = useMemo(
        () =>
            extractApiRows(data).map((zone: any, index: number) => ({
                ...zone,
                id: zone.id ?? index + 1,
                warehouse_id: zone.warehouse_id,
                warehouseName:
                    zone.warehouseName ||
                    warehouseMap.get(String(zone.warehouse_id)) ||
                    `Warehouse ${zone.warehouse_id ?? ""}`,
                zone_code: zone.zone_code || "",
                zone_title: zone.zone_title || zone.name || "",
                zone_description: zone.zone_description || "",
                name: zone.zone_title || zone.name || "",
                status: zone.status || (zone.is_active === false ? "INACTIVE" : "ACTIVE"),
                rackCount: Number(zone.rackCount ?? zone.racks_count ?? zone.total_racks ?? 0),
            })),
        [data, warehouseMap]
    );

    const totalCount = useMemo(() => extractApiTotalCount(data, rows.length), [data, rows.length]);
    const loading = isLoading || isFetching || isCreating || isUpdating || isDeleting;

    useEffect(() => {
        if (!error) {
            return;
        }

        showToast(
            (error as any)?.data?.message || (error as any)?.message || "Failed to fetch zones",
            "error"
        );
    }, [error, showToast]);

    const columns: GridColDef[] = [
        { field: "zone_code", headerName: "Zone Code", flex: 0.9, minWidth: 140 },
        { field: "warehouseName", headerName: "Warehouse", flex: 1.1, minWidth: 180 },
        { field: "zone_title", headerName: "Zone Title", flex: 1.2, minWidth: 180 },
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
        // { field: "rackCount", headerName: "Rack Count", flex: 0.8, minWidth: 130, type: "string" },
    ];

    return (
        <Page module="Warehouse">
            <Box className="p-0"  sx={{
                    "& .MuiDataGrid-row:hover": {
                        cursor: "pointer",
                    },
                }}>
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
                    height={"calc(100vh - 120px)"}
                    setFilterModel={setFilterModel}
                    title="Zone List"
                    permissions={{
                        create: routePermissions.create,
                        edit: routePermissions.edit,
                        delete: routePermissions.delete,
                        download: routePermissions.download,
                        view: routePermissions.view,
                    }}
                    refetch={refetch}
                    onAdd={handleAddZone}
                    onRowClick={handleEditZone}
                />
            </Box>
        </Page>
    );
};

export default ZonelistPage;
