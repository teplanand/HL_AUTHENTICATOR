import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { Page } from "../../../../shared/components/common/Page";
import ReusableDataGrid from "../../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import {
    useCreatePalletMutation,
    useDeletePalletMutation,
    useListPalletsQuery,
    useListRacksQuery,
    useListWarehousesQuery,
    useListZonesQuery,
    useUpdatePalletMutation,
} from "../api/warehouse";
import { AddEditPallet, AddEditPalletRef, type PalletSubmitPayload } from "./addeditpallet";
import { openEntityFormModal } from "../shared/openEntityFormModal";
import { buildGridApiParams, extractApiRows, extractApiTotalCount } from "../shared/gridApiHelpers";
import { buildPalletCreatePayload, buildPalletUpdatePayload } from "../shared/payloadBuilders";
import { getStaticModuleRouteUiPermissions } from "../../../../shared/utils/staticModuleAccess";

const PalletlistPage: React.FC = () => {
    const routePermissions = useMemo(
        () => getStaticModuleRouteUiPermissions("/Warehouse/palletlist"),
        [],
    );
    const { openModal } = useModal();
    const { showToast } = useToast();
    const [createPallet, { isLoading: isCreating }] = useCreatePalletMutation();
    const [updatePallet, { isLoading: isUpdating }] = useUpdatePalletMutation();
    const [deletePallet, { isLoading: isDeleting }] = useDeletePalletMutation();

    const handleSubmitPallet = useCallback(async (payload: PalletSubmitPayload) => {
        try {
            if (payload.id) {
                await updatePallet({
                    id: payload.id,
                    ...(buildPalletUpdatePayload({
                        warehouse_id: payload.warehouse_id,
                        zone_id: payload.zone_id,
                        rack_id: payload.rack_id,
                        pallet_code: payload.pallet_code,
                        max_capacity: payload.max_capacity,
                        status: payload.status,
                    }) as any),
                }).unwrap();
            } else {
                await createPallet(buildPalletCreatePayload(payload) as any).unwrap();
            }
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to save pallet", "error");
            throw error;
        }
    }, [createPallet, showToast, updatePallet]);

    const handleDeletePallet = useCallback(async (id: string | number) => {
        try {
            await deletePallet(id).unwrap();
        } catch (error: any) {
            showToast(error?.data?.message || error?.message || "Failed to delete pallet", "error");
            throw error;
        }
    }, [deletePallet, showToast]);

    const handleAddPallet = () => {
        openEntityFormModal<AddEditPalletRef>({
            openModal,
            entityLabel: "Pallet",
            width: 520,
            FormComponent: AddEditPallet,
            extraProps: {
                onSubmitPallet: handleSubmitPallet,
                onDeletePallet: handleDeletePallet,
            },
        });
    };

    const handleEditPallet = (row: any) => {
        openEntityFormModal<AddEditPalletRef>({
            openModal,
            entityLabel: "Pallet",
            width: 520,
            FormComponent: AddEditPallet,
            defaultValues: row,
            extraProps: {
                onSubmitPallet: handleSubmitPallet,
                onDeletePallet: handleDeletePallet,
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

    const { data, error, isLoading, isFetching, refetch } = useListPalletsQuery(apiParams);
    const { data: racksData } = useListRacksQuery();
    const { data: zonesData } = useListZonesQuery();
    const { data: warehousesData } = useListWarehousesQuery();

    const rackMap = useMemo(() => {
        const entries = extractApiRows(racksData).map((rack: any) => [
            String(rack.id),
            rack.rack_code || rack.name || `Rack ${rack.id}`,
        ]);
        return new Map(entries);
    }, [racksData]);

    const zoneMap = useMemo(() => {
        const entries = extractApiRows(zonesData).map((zone: any) => [
            String(zone.id),
            zone.zone_code || zone.zone_title || `Zone ${zone.id}`,
        ]);
        return new Map(entries);
    }, [zonesData]);

    const warehouseMap = useMemo(() => {
        const entries = extractApiRows(warehousesData).map((warehouse: any) => [
            String(warehouse.id),
            warehouse.warehouse_name || warehouse.name || `Warehouse ${warehouse.id}`,
        ]);
        return new Map(entries);
    }, [warehousesData]);

    const rows = useMemo(
        () =>
            extractApiRows(data).map((pallet: any, index: number) => ({
                ...pallet,
                id: pallet.id ?? index + 1,
                warehouse_id: pallet.warehouse_id,
                zone_id: pallet.zone_id,
                rack_id: pallet.rack_id,
                warehouseName: warehouseMap.get(String(pallet.warehouse_id)) || `Warehouse ${pallet.warehouse_id ?? ""}`,
                zoneName:
                    pallet.zone_code ||
                    zoneMap.get(String(pallet.zone_id)) ||
                    `Zone ${pallet.zone_id ?? ""}`,
                rackName: rackMap.get(String(pallet.rack_id)) || `Rack ${pallet.rack_id ?? ""}`,
                pallet_code:
                    pallet.pallet_code ||
                    pallet.pallet_name ||
                    pallet.palletName ||
                    pallet.name ||
                    `Pallet ${pallet.id ?? index + 1}`,
                max_capacity: Number(pallet.max_capacity ?? pallet.capacity ?? 0),
                status: pallet.status || "AVAILABLE",
                items_count: Number(pallet.items_count ?? pallet.pallets_count ?? 0),
            })),
        [data, rackMap, warehouseMap, zoneMap]
    );

    const totalCount = useMemo(() => extractApiTotalCount(data, rows.length), [data, rows.length]);
    const loading = isLoading || isFetching || isCreating || isUpdating || isDeleting;

    useEffect(() => {
        if (!error) {
            return;
        }

        showToast(
            (error as any)?.data?.message || (error as any)?.message || "Failed to fetch pallets",
            "error"
        );
    }, [error, showToast]);

    const columns: GridColDef[] = [
        { field: "pallet_code", headerName: "Pallet Code", flex: 1, minWidth: 170 },
        { field: "warehouseName", headerName: "Warehouse", flex: 1, minWidth: 150 },
        { field: "zoneName", headerName: "Zone", flex: 1, minWidth: 150 },
        { field: "rackName", headerName: "Rack", flex: 1, minWidth: 150 },
        { field: "max_capacity", headerName: "Capacity", flex: 0.9, minWidth: 120, type: "string" },
        {
            field: "status",
            headerName: "Status",
            flex: 0.9,
            minWidth: 140,
            renderCell: (params) => {
                const isAvailable = params.value === "AVAILABLE";

                return (
                    <Chip
                        label={isAvailable ? "Available" : "Occupied"}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            color: isAvailable ? "#166534" : "#9A3412",
                            bgcolor: isAvailable ? "rgba(34,197,94,0.12)" : "rgba(251,146,60,0.16)",
                            borderRadius: "999px",
                        }}
                    />
                );
            },
        },
        // { field: "items_count", headerName: "Items Count", flex: 0.9, minWidth: 120, type: "number" },
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
                    title="Pallet List"
                    permissions={{
                        create: routePermissions.create,
                        edit: routePermissions.edit,
                        delete: routePermissions.delete,
                        download: routePermissions.download,
                        view: routePermissions.view,
                    }}
                    refetch={refetch}
                    onAdd={handleAddPallet}
                    onRowClick={handleEditPallet}
                />
            </Box>
        </Page>
    );
};

export default PalletlistPage;
