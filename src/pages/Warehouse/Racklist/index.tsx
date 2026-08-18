import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import {
    useCreateRackMutation,
    useDeleteRackMutation,
    useListRacksQuery,
    useListWarehousesQuery,
    useListZonesQuery,
    useUpdateRackMutation,
} from "../api/warehouse";
import { AddEditRack, AddEditRackRef, type RackSubmitPayload } from "./addeditrack";
import { openEntityFormModal } from "../shared/openEntityFormModal";
import { buildGridApiParams, extractApiRows, extractApiTotalCount } from "../shared/gridApiHelpers";
import { buildRackCreatePayload, buildRackUpdatePayload } from "../shared/payloadBuilders";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";

const RacklistPage: React.FC = () => {
    const routePermissions = useMemo(
        () => getStaticModuleRouteUiPermissions("/Warehouse/racklist"),
        [],
    );
    const { openModal } = useModal();
    const { showToast } = useToast();
    const [createRack, { isLoading: isCreating }] = useCreateRackMutation();
    const [updateRack, { isLoading: isUpdating }] = useUpdateRackMutation();
    const [deleteRack, { isLoading: isDeleting }] = useDeleteRackMutation();

    const handleSubmitRack = useCallback(async (payload: RackSubmitPayload) => {
        try {
            if (payload.id) {
                await updateRack({
                    id: payload.id,
                    ...(buildRackUpdatePayload({
                        warehouse_id: payload.warehouse_id,
                        zone_id: payload.zone_id,
                        rack_code: payload.rack_code,
                        rack_description: payload.rack_description,
                        status: payload.status,
                    }) as any),
                }).unwrap();
            } else {
                await createRack(buildRackCreatePayload(payload) as any).unwrap();
            }
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to save rack", "error");
            throw error;
        }
    }, [createRack, showToast, updateRack]);

    const handleDeleteRack = useCallback(async (id: string | number) => {
        try {
            await deleteRack(id).unwrap();
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to delete rack", "error");
            throw error;
        }
    }, [deleteRack, showToast]);

    const handleAddRack = () => {
        openEntityFormModal<AddEditRackRef>({
            openModal,
            entityLabel: "Rack",
            width: 560,
            FormComponent: AddEditRack,
            extraProps: {
                onSubmitRack: handleSubmitRack,
                onDeleteRack: handleDeleteRack,
            },
        });
    };

    const handleEditRack = (row: any) => {
        openEntityFormModal<AddEditRackRef>({
            openModal,
            entityLabel: "Rack",
            width: 520,
            FormComponent: AddEditRack,
            defaultValues: row,
            extraProps: {
                onSubmitRack: handleSubmitRack,
                onDeleteRack: handleDeleteRack,
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

    const { data, error, isLoading, isFetching, refetch } = useListRacksQuery(apiParams);
    const { data: zonesData } = useListZonesQuery();
    const { data: warehousesData } = useListWarehousesQuery();

    const zoneMap = useMemo(() => {
        const entries = extractApiRows(zonesData).map((zone: any) => [
            String(zone.id),
            zone.zone_code || zone.zone_title || zone.name || `Zone ${zone.id}`,
        ]);
        return new Map(entries);
    }, [zonesData]);

    const warehouseMap = useMemo(() => {
        const entries = extractApiRows(warehousesData).map((warehouse: any) => [
            String(warehouse.id),
            warehouse.warehouse_name || warehouse.warehouseName || warehouse.name || `Warehouse ${warehouse.id}`,
        ]);
        return new Map(entries);
    }, [warehousesData]);

    const rows = useMemo(
        () =>
            extractApiRows(data).map((rack: any, index: number) => ({
                ...rack,
                id: rack.id ?? index + 1,
                warehouse_id: rack.warehouse_id,
                zone_id: rack.zone_id,
                warehouseName: warehouseMap.get(String(rack.warehouse_id)) || `Warehouse ${rack.warehouse_id ?? ""}`,
                zoneName:
                    rack.zone_code ||
                    rack.zoneName ||
                    zoneMap.get(String(rack.zone_id)) ||
                    `Zone ${rack.zone_id ?? ""}`,
                rack_code: rack.rack_code || rack.name || "",
                rack_description: rack.rack_description || "",
                name: rack.rack_code || rack.name || "",
                status: rack.status || (rack.is_active === false ? "INACTIVE" : "ACTIVE"),
                pallets_count: Number(rack.pallets_count ?? rack.shelves_count ?? 0),
            })),
        [data, warehouseMap, zoneMap]
    );

    const totalCount = useMemo(() => extractApiTotalCount(data, rows.length), [data, rows.length]);
    const loading = isLoading || isFetching || isCreating || isUpdating || isDeleting;

    useEffect(() => {
        if (!error) {
            return;
        }

        showToast(
            (error as any)?.data?.message || (error as any)?.message || "Failed to fetch racks",
            "error"
        );
    }, [error, showToast]);

    const columns: GridColDef[] = [
        { field: "rack_code", headerName: "Rack Code", flex: 1, minWidth: 160 },
        { field: "warehouseName", headerName: "Warehouse", flex: 1, minWidth: 160 },
        { field: "zoneName", headerName: "Zone", flex: 1, minWidth: 160 },
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
        // { field: "pallets_count", headerName: "Pallet Count", flex: 0.9, minWidth: 140, type: "number" },
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
                    setFilterModel={setFilterModel}
                    height={"calc(100vh - 120px)"}
                    title="Rack List"
                    permissions={{
                        create: routePermissions.create,
                        edit: routePermissions.edit,
                        delete: routePermissions.delete,
                        download: routePermissions.download,
                        view: routePermissions.view,
                    }}
                    refetch={refetch}
                    onAdd={handleAddRack}
                    onRowClick={handleEditRack}
                />
            </Box>
        </Page>
    );
};

export default RacklistPage;
