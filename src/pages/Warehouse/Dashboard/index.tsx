import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";

import { Page } from "../../../../shared/components/common/Page";
import { buildWarehouseHierarchy } from "./data";
import { RackGrid } from "./components/RackGrid";
import { SectionTabs } from "./components/SectionTabs";
import { WarehouseSidebar } from "./components/WarehouseSidebar";
import { RackDetailsPanel } from "./components/RackDetailsPanel";
import ApiActionButton from "../../../../shared/components/common/ApiActionButton";
import {
  ItemTransactionDrawer,
  type ItemTransactionDrawerRef,
  type ItemTransactionPayload,
} from "./components/ItemTransactionDrawer";
import { Pallet,     Shelf } from "./types";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
 import { openEntityFormModal } from "../shared/openEntityFormModal";
import {
  useCreatePalletMutation,
  useCreateRackMutation,
  useCreateTransactionMutation,
  useCreateWarehouseItemMutation,
  useCreateWarehouseMutation,
  useCreateZoneMutation,
  useDeletePalletMutation,
  useDeleteRackMutation,
  useDeleteWarehouseItemMutation,
  useDeleteWarehouseMutation,
  useDeleteZoneMutation,
  useListPalletsQuery,
  useListRacksQuery,
  useListWarehouseItemsQuery,
  useListWarehousesQuery,
  useListZonesQuery,
  useUpdatePalletMutation,
  useUpdateRackMutation,
  useUpdateWarehouseItemMutation,
  useUpdateWarehouseMutation,
  useUpdateZoneMutation,
} from "../api/warehouse";
import { useAppSelector } from "../../../../shared/redux/hooks";
import {
  buildPalletCreatePayload,
  buildPalletUpdatePayload,
  buildRackCreatePayload,
  buildRackUpdatePayload,
  buildWarehouseCreatePayload,
  buildWarehouseItemCreateFormData,
  buildWarehouseItemUpdateFormData,
  buildWarehouseUpdatePayload,
  buildZoneCreatePayload,
  buildZoneUpdatePayload,
} from "../shared/payloadBuilders";
import {
  AddEditWarehouse,
  AddEditWarehouseRef,
  type WarehouseSubmitPayload,
} from "../Warehouselist/addeditwarehouse";
import {
  AddEditZone,
  AddEditZoneRef,
  type ZoneSubmitPayload,
} from "../Zonelist/addeditzone";
import {
  AddEditRack,
  AddEditRackRef,
  type RackSubmitPayload,
} from "../Racklist/addeditrack";
import {
  AddEditItem,
  AddEditItemRef,
  type ItemSubmitPayload,
} from "../Itemlist/addedititem";
import type { PalletSubmitPayload } from "../Palletlist/addeditpallet";

type SearchResultEntry = {
  key: string;
  type: "rack" | "item";
  warehouse: any;
  warehouseIndex: number;
  section: any;
  sectionIndex: number;
  rack: any;
  item?: Pallet;
  shelf?: Shelf;
};

const toWarehouseCode = (value: string) => {
  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned ? `WH-${cleaned}` : "WH-001";
};

export default function InventoryDashboard() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const authUserId = useAppSelector((state) => state.auth.id);

  const [activeWarehouseIndex, setActiveWarehouseIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [itemSearchText, setItemSearchText] = useState("");
  const [warehouseSearchText, setWarehouseSearchText] = useState("");
  const [qrSearchText, setQrSearchText] = useState("");

  const {
    data: warehousesResponse,
    error: warehousesError,
    isLoading: isWarehousesLoading,
    isFetching: isWarehousesFetching,
  } = useListWarehousesQuery();
  const {
    data: zonesResponse,
    error: zonesError,
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
  } = useListZonesQuery();
  const {
    data: racksResponse,
    error: racksError,
    isLoading: isRacksLoading,
    isFetching: isRacksFetching,
  } = useListRacksQuery();
  const {
    data: palletsResponse,
    error: palletsError,
    isLoading: isPalletsLoading,
    isFetching: isPalletsFetching,
  } = useListPalletsQuery();
  const {
    data: itemsResponse,
    error: itemsError,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
  } = useListWarehouseItemsQuery();

  const [createWarehouse, { isLoading: isCreatingWarehouse }] = useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdatingWarehouse }] = useUpdateWarehouseMutation();
  const [deleteWarehouse, { isLoading: isDeletingWarehouse }] = useDeleteWarehouseMutation();

  const [createZone, { isLoading: isCreatingZone }] = useCreateZoneMutation();
  const [updateZone, { isLoading: isUpdatingZone }] = useUpdateZoneMutation();
  const [deleteZone, { isLoading: isDeletingZone }] = useDeleteZoneMutation();

  const [createRack, { isLoading: isCreatingRack }] = useCreateRackMutation();
  const [updateRack, { isLoading: isUpdatingRack }] = useUpdateRackMutation();
  const [deleteRack, { isLoading: isDeletingRack }] = useDeleteRackMutation();

  const [createPallet, { isLoading: isCreatingPallet }] = useCreatePalletMutation();
  const [updatePallet, { isLoading: isUpdatingPallet }] = useUpdatePalletMutation();
  const [deletePallet, { isLoading: isDeletingPallet }] = useDeletePalletMutation();
  const [createTransaction, { isLoading: isCreatingTransaction }] = useCreateTransactionMutation();

  const [createItem, { isLoading: isCreatingItem }] = useCreateWarehouseItemMutation();
  const [updateItem, { isLoading: isUpdatingItem }] = useUpdateWarehouseItemMutation();
  const [deleteItem, { isLoading: isDeletingItem }] = useDeleteWarehouseItemMutation();

  const warehouseData = useMemo(
    () =>
      buildWarehouseHierarchy({
        warehousesResponse,
        zonesResponse,
        racksResponse,
        palletsResponse,
        itemsResponse,
      }),
    [itemsResponse, palletsResponse, racksResponse, warehousesResponse, zonesResponse]
  );

  const handleSubmitWarehouse = useCallback(
    async (payload: WarehouseSubmitPayload) => {
      try {
        const warehouseCode = payload.warehouseCode || toWarehouseCode(payload.warehouseName);

        if (payload.id) {
          await updateWarehouse({
            id: payload.id,
            ...(buildWarehouseUpdatePayload(
              {
                warehouseCode,
                warehouseName: payload.warehouseName,
                managerName: payload.managerName,
                contactNo: payload.contact_no,
                email: payload.email,
                address: payload.address,
                notes: payload.notes,
                status: payload.status,
              },
              authUserId ? String(authUserId) : "admin"
            ) as any),
          }).unwrap();
          return;
        }

        await createWarehouse(
          buildWarehouseCreatePayload(
            {
              warehouseCode,
              warehouseName: payload.warehouseName,
              managerName: payload.managerName,
              contactNo: payload.contact_no,
              email: payload.email,
              address: payload.address,
              notes: payload.notes,
              status: payload.status,
            },
            authUserId ? String(authUserId) : "admin"
          ) as any
        ).unwrap();
      } catch (error: any) {
        showToast(
          error?.data?.message || error?.message || "Failed to save warehouse",
          "error"
        );
        throw error;
      }
    },
    [authUserId, createWarehouse, showToast, updateWarehouse]
  );

  const handleDeleteWarehouse = useCallback(
    async (id: string | number) => {
      try {
        await deleteWarehouse(id).unwrap();
      } catch (error: any) {
        showToast(
          error?.data?.message || error?.message || "Failed to delete warehouse",
          "error"
        );
        throw error;
      }
    },
    [deleteWarehouse, showToast]
  );

  const handleSubmitZone = useCallback(
    async (payload: ZoneSubmitPayload) => {
      try {
        if (payload.id) {
          await updateZone({
            id: payload.id,
            ...(buildZoneUpdatePayload(
              {
                warehouse_id: payload.warehouse_id,
                zone_code: payload.zone_code,
                zone_title: payload.zone_title,
                zone_description: payload.zone_description,
                status: payload.status,
              },
              authUserId ? String(authUserId) : "admin"
            ) as any),
          }).unwrap();
          return;
        }

        await createZone(
          buildZoneCreatePayload(
            {
              warehouse_id: payload.warehouse_id,
              zone_code: payload.zone_code,
              zone_title: payload.zone_title,
              zone_description: payload.zone_description,
              status: payload.status,
            },
            authUserId ? String(authUserId) : "admin"
          ) as any
        ).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to save zone", "error");
        throw error;
      }
    },
    [authUserId, createZone, showToast, updateZone]
  );

  const handleDeleteZone = useCallback(
    async (id: string | number) => {
      try {
        await deleteZone(id).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to delete zone", "error");
        throw error;
      }
    },
    [deleteZone, showToast]
  );

  const handleSubmitRack = useCallback(
    async (payload: RackSubmitPayload) => {
      try {
        if (payload.id) {
          await updateRack({
            id: payload.id,
            ...(buildRackUpdatePayload(
              {
                warehouse_id: payload.warehouse_id,
                zone_id: payload.zone_id,
                rack_code: payload.rack_code,
                rack_description: payload.rack_description,
                status: payload.status,
              },
              authUserId ? String(authUserId) : "admin"
            ) as any),
          }).unwrap();
          return;
        }

        await createRack(
          buildRackCreatePayload(
            {
              warehouse_id: payload.warehouse_id,
              zone_id: payload.zone_id,
              rack_code: payload.rack_code,
              rack_description: payload.rack_description,
              status: payload.status,
            },
            authUserId ? String(authUserId) : "admin"
          ) as any
        ).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to save rack", "error");
        throw error;
      }
    },
    [authUserId, createRack, showToast, updateRack]
  );

  const handleDeleteRack = useCallback(
    async (id: string | number) => {
      try {
        await deleteRack(id).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to delete rack", "error");
        throw error;
      }
    },
    [deleteRack, showToast]
  );

  const handleSubmitPallet = useCallback(
    async (payload: PalletSubmitPayload) => {
      try {
        if (payload.id) {
          await updatePallet({
            id: payload.id,
            ...(buildPalletUpdatePayload(
              {
                warehouse_id: payload.warehouse_id,
                zone_id: payload.zone_id,
                rack_id: payload.rack_id,
                pallet_code: payload.pallet_code,
                max_capacity: payload.max_capacity,
                status: payload.status,
              },
              authUserId ? String(authUserId) : "admin"
            ) as any),
          }).unwrap();
          return;
        }

        await createPallet(
          buildPalletCreatePayload(
            {
              warehouse_id: payload.warehouse_id,
              zone_id: payload.zone_id,
              rack_id: payload.rack_id,
              pallet_code: payload.pallet_code,
              max_capacity: payload.max_capacity,
              status: payload.status,
            },
            authUserId ? String(authUserId) : "admin"
          ) as any
        ).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to save pallet", "error");
        throw error;
      }
    },
    [authUserId, createPallet, showToast, updatePallet]
  );

  const handleDeletePallet = useCallback(
    async (id: string | number) => {
      try {
        await deletePallet(id).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to delete pallet", "error");
        throw error;
      }
    },
    [deletePallet, showToast]
  );

  const handleSubmitItem = useCallback(
    async (payload: ItemSubmitPayload) => {
      try {
        if (payload.id !== undefined && payload.id !== null) {
          const { id, ...updatePayload } = payload;
          return await updateItem({
            id,
            body: buildWarehouseItemUpdateFormData(updatePayload),
          }).unwrap();
        }

        const createPayload = { ...payload } as Omit<ItemSubmitPayload, "id">;
        delete (createPayload as Partial<ItemSubmitPayload>).id;
        return await createItem(
          buildWarehouseItemCreateFormData(createPayload)
        ).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to save item", "error");
        throw error;
      }
    },
    [createItem, showToast, updateItem]
  );

  const handleDeleteItem = useCallback(
    async (id: string | number) => {
      try {
        await deleteItem(id).unwrap();
      } catch (error: any) {
        showToast(error?.data?.message || error?.message || "Failed to delete item", "error");
        throw error;
      }
    },
    [deleteItem, showToast]
  );

  const normalizedWarehouseSearch = warehouseSearchText.trim().toLowerCase();

  const filteredWarehouses = useMemo(() => {
    if (!normalizedWarehouseSearch) {
      return warehouseData;
    }

    return warehouseData.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(normalizedWarehouseSearch) ||
        warehouse.address.toLowerCase().includes(normalizedWarehouseSearch)
    );
  }, [normalizedWarehouseSearch, warehouseData]);

  useEffect(() => {
    if (activeWarehouseIndex < filteredWarehouses.length) {
      return;
    }

    setActiveWarehouseIndex(0);
  }, [activeWarehouseIndex, filteredWarehouses.length]);

  const currentWarehouse = filteredWarehouses[activeWarehouseIndex] || filteredWarehouses[0] || null;

  useEffect(() => {
    if (!currentWarehouse) {
      return;
    }

    if (activeSectionIndex < currentWarehouse.sections.length) {
      return;
    }

    setActiveSectionIndex(0);
  }, [activeSectionIndex, currentWarehouse]);

  const currentSection =
    currentWarehouse?.sections[activeSectionIndex] || currentWarehouse?.sections[0] || null;
  const normalizedItemSearch = itemSearchText.trim().toLowerCase();

  const globalSearchResults = useMemo<SearchResultEntry[]>(() => {
    if (!normalizedItemSearch) {
      return [];
    }

    const results: SearchResultEntry[] = [];

    warehouseData.forEach((warehouse, warehouseIndex) => {
      warehouse.sections.forEach((section, sectionIndex) => {
        section.racks.forEach((rack) => {
          const rackMatches =
            rack.name.toLowerCase().includes(normalizedItemSearch) ||
            rack.id.toLowerCase().includes(normalizedItemSearch);

          if (rackMatches) {
            results.push({
              key: `rack-${warehouseIndex}-${sectionIndex}-${rack.id}`,
              type: "rack",
              warehouse,
              warehouseIndex,
              section,
              sectionIndex,
              rack,
            });
          }

          rack.shelves.forEach((shelf) => {
            shelf.pallets.forEach((item) => {
              const productName = String(item.product || "").toLowerCase();
              const oracleCode = String(item.oracle_code || "").toLowerCase();
              const qrCode = String(item.qr_code || "").toLowerCase();
              const shelfId = String(shelf.id || "").toLowerCase();

              const itemMatches =
                productName.includes(normalizedItemSearch) ||
                oracleCode.includes(normalizedItemSearch) ||
                qrCode.includes(normalizedItemSearch) ||
                shelfId.includes(normalizedItemSearch);

              if (!itemMatches) {
                return;
              }

              results.push({
                key: `item-${warehouseIndex}-${sectionIndex}-${rack.id}-${shelf.id}-${item.id}`,
                type: "item",
                warehouse,
                warehouseIndex,
                section,
                sectionIndex,
                rack,
                item,
                shelf,
              });
            });
          });
        });
      });
    });

    return results.slice(0, 12);
  }, [normalizedItemSearch, warehouseData]);

  const handleWarehouseSelect = useCallback((index: number) => {
    setActiveWarehouseIndex(index);
    setActiveSectionIndex(0);
  }, []);

  const handleSectionTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number | string) => {
      if (typeof newValue !== "number") {
        return;
      }

      setActiveSectionIndex(newValue);
    },
    []
  );

  const handleOpenAddWarehouse = useCallback(() => {
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
  }, [handleDeleteWarehouse, handleSubmitWarehouse, openModal]);

  const handleOpenAddZone = useCallback(() => {
    if (!currentWarehouse?.recordId) {
      return;
    }

    openEntityFormModal<AddEditZoneRef>({
      openModal,
      entityLabel: "Zone",
      width: 720,
      FormComponent: AddEditZone,
      defaultValues: {
        warehouse_id: currentWarehouse.recordId,
      },
      extraProps: {
        onSubmitZone: handleSubmitZone,
        onDeleteZone: handleDeleteZone,
      },
    });
  }, [currentWarehouse, handleDeleteZone, handleSubmitZone, openModal]);

  const handleAddRack = useCallback(() => {
    if (!currentWarehouse?.recordId || !currentSection?.recordId) {
      return;
    }

    openEntityFormModal<AddEditRackRef>({
      openModal,
      entityLabel: "Rack",
      width: 500,
      FormComponent: AddEditRack,
      defaultValues: {
        warehouse_id: currentWarehouse.recordId,
        zone_id: currentSection.recordId,
        section_id: currentSection.recordId,
      },
      extraProps: {
        onSubmitRack: handleSubmitRack,
        onDeleteRack: handleDeleteRack,
      },
    });
  }, [currentSection, currentWarehouse, handleDeleteRack, handleSubmitRack, openModal]);

  const handleQrItemOpen = useCallback(() => {
    const query = qrSearchText.trim();
    if (!query) {
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const matchedEntry = warehouseData
      .flatMap((warehouse, warehouseIndex) =>
        warehouse.sections.flatMap((section, sectionIndex) =>
          section.racks.flatMap((rack) =>
            rack.shelves.flatMap((shelf) =>
              shelf.pallets.map((item) => ({
                warehouse,
                warehouseIndex,
                section,
                sectionIndex,
                rack,
                shelf,
                item,
              }))
            )
          )
        )
      )
      .find(({ item }) => {
        const qrCode = String(item.qr_code || "").trim().toLowerCase();
        const oracleCode = String(item.oracle_code || "").trim().toLowerCase();
        const productName = String(item.product || "").trim().toLowerCase();
        const itemId = String(item.id || "").trim().toLowerCase();

        return (
          qrCode === normalizedQuery ||
          oracleCode === normalizedQuery ||
          productName === normalizedQuery ||
          itemId === normalizedQuery ||
          qrCode.includes(normalizedQuery) ||
          oracleCode.includes(normalizedQuery)
        );
      });

    if (!matchedEntry) {
      showToast("QR item not found", "warning");
      return;
    }

    const transactionRef = createRef<ItemTransactionDrawerRef>();

    setWarehouseSearchText("");
    setItemSearchText("");
    setActiveWarehouseIndex(matchedEntry.warehouseIndex);
    setActiveSectionIndex(matchedEntry.sectionIndex);
    setQrSearchText("");

    openModal({
      title: "Item IN Transaction",
      width: 480,
      showCloseButton: true,
      askDataChangeConfirm: false,
      component: (modalProps: any) => (
        <ItemTransactionDrawer
          ref={transactionRef}
          {...modalProps}
          shelf={matchedEntry.shelf}
          item={matchedEntry.item}
          rackId={
            matchedEntry.rack.recordId ||
            matchedEntry.rack.id ||
            matchedEntry.item.rack_id ||
            ""
          }
          defaultOperation="1"
          onSubmitTransaction={async (payload: ItemTransactionPayload) => {
            try {
              await createTransaction({
                oracle_code: payload.oracle_code,
                sub_loc_id: payload.sub_loc_id,
                pallet_id: payload.pallet_id,
                rack_id: payload.rack_id,
                supplier_id: payload.supplier_id || undefined,
                operation: payload.operation,
                qty: payload.qty,
                created_by: payload.created_by,
              }).unwrap();
            } catch (error: any) {
              throw new Error(
                error?.data?.message || error?.message || "Failed to save transaction"
              );
            }
          }}
        />
      ),
      action: (
        <ApiActionButton
          onApiCall={() => transactionRef.current?.submit?.() ?? Promise.resolve()}
          loadingText="Saving..."
        >
          Submit Transaction
        </ApiActionButton>
      ),
    });
  }, [createTransaction, openModal, qrSearchText, showToast, warehouseData]);

  const handleAdjustItemQty = useCallback(
    async (shelf: Shelf, item: Pallet, direction: "in" | "out") => {
      if (!shelf.recordId || !item.recordId) {
        return;
      }

      const nextQty = direction === "in" ? item.qty + 1 : Math.max(item.qty - 1, 0);

      await handleSubmitItem({
        id: item.recordId,
        pallet_id: Number(shelf.recordId),
        rack_id: Number(item.rack_id ?? 0),
        sub_loc_id: Number(item.sub_loc_id ?? 1),
        oracle_code: item.oracle_code || item.product,
        qty: nextQty,
        item_desc: item.item_desc || item.description || "",
        item_category: item.item_category || "",
        locator: item.locator || "",
        sub_inventory: item.sub_inventory || "",
        detail_qty: item.qty,
        in_qty: direction === "in" ? 1 : 0,
        out_qty: direction === "out" ? 1 : 0,
        has_expiry: Boolean(item.has_expiry_date),
        expiry_date: item.expiry_date || null,
        item_image_document_id: item.item_image_document_id ?? null,
        item_image_path: item.item_image_path || null,
        qr_code: item.qr_code,
      });
    },
    [handleSubmitItem]
  );

  const openRackDetails = useCallback(
    (warehouse: any, section: any, rack: any) => {
      openModal({
        title: `Rack Details - ${rack.name}`,
        width: 560,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <RackDetailsPanel
            warehouse={warehouse}
            section={section}
            selectedRack={rack}
            onSubmitWarehouse={handleSubmitWarehouse}
            onDeleteWarehouse={handleDeleteWarehouse}
            onSubmitZone={handleSubmitZone}
            onDeleteZone={handleDeleteZone}
            onSubmitRack={handleSubmitRack}
            onDeleteRack={handleDeleteRack}
            onSubmitPallet={handleSubmitPallet}
            onDeletePallet={handleDeletePallet}
            onSubmitItem={handleSubmitItem}
            onDeleteItem={handleDeleteItem}
            onAdjustItemQty={handleAdjustItemQty}
            {...modalProps}
          />
        ),
      });
    },
    [
      handleAdjustItemQty,
      handleDeleteItem,
      handleDeletePallet,
      handleDeleteRack,
      handleDeleteWarehouse,
      handleDeleteZone,
      handleSubmitItem,
      handleSubmitPallet,
      handleSubmitRack,
      handleSubmitWarehouse,
      handleSubmitZone,
      openModal,
    ]
  );

  const handleSearchResultSelect = useCallback(
    (result: SearchResultEntry) => {
      setWarehouseSearchText("");
      setItemSearchText("");
      setActiveWarehouseIndex(result.warehouseIndex);
      setActiveSectionIndex(result.sectionIndex);
      openRackDetails(result.warehouse, result.section, result.rack);
    },
    [openRackDetails]
  );

  const handleSelectRack = useCallback(
    (rackId: string) => {
      const rack = currentSection?.racks.find((rackItem) => rackItem.id === rackId) || null;
      if (!rack || !currentWarehouse || !currentSection) {
        return;
      }

      openRackDetails(currentWarehouse, currentSection, rack);
    },
    [
      currentSection,
      currentWarehouse,
      openRackDetails,
    ]
  );

  const totalRacks = currentWarehouse
    ? currentWarehouse.sections.reduce((sum, section) => sum + section.racks.length, 0)
    : 0;

  const loading =
    isWarehousesLoading ||
    isZonesLoading ||
    isRacksLoading ||
    isPalletsLoading ||
    isItemsLoading ||
    isWarehousesFetching ||
    isZonesFetching ||
    isRacksFetching ||
    isPalletsFetching ||
    isItemsFetching ||
    isCreatingWarehouse ||
    isUpdatingWarehouse ||
    isDeletingWarehouse ||
    isCreatingZone ||
    isUpdatingZone ||
    isDeletingZone ||
    isCreatingRack ||
    isUpdatingRack ||
    isDeletingRack ||
    isCreatingPallet ||
    isUpdatingPallet ||
    isDeletingPallet ||
    isCreatingTransaction ||
    isCreatingItem ||
    isUpdatingItem ||
    isDeletingItem;

  useEffect(() => {
    const firstError = [
      warehousesError,
      zonesError,
      racksError,
      palletsError,
      itemsError,
    ].find(Boolean) as any;

    if (!firstError) {
      return;
    }

    showToast(
      firstError?.data?.message || firstError?.message || "Failed to fetch warehouse dashboard",
      "error"
    );
  }, [itemsError, palletsError, racksError, showToast, warehousesError, zonesError]);

  if (!currentWarehouse) {
    return (
      <Card sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
        <WarehouseSidebar
          warehouses={filteredWarehouses}
          selectedIndex={activeWarehouseIndex}
          onSelect={handleWarehouseSelect}
          searchValue={warehouseSearchText}
          onSearchChange={setWarehouseSearchText}
          onAddWarehouse={handleOpenAddWarehouse}
        />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              {loading ? "Loading warehouse dashboard..." : "No warehouse records found"}
            </Typography>
            <Typography color="text.disabled">
              {loading
                ? "Fetching warehouses, zones, racks, pallets, and items."
                : "Create a warehouse to start working from the dashboard."}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Page module="Warehouse">
      <Card sx={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <WarehouseSidebar
        warehouses={filteredWarehouses}
        selectedIndex={activeWarehouseIndex}
        onSelect={handleWarehouseSelect}
        searchValue={warehouseSearchText}
        onSearchChange={setWarehouseSearchText}
        onAddWarehouse={handleOpenAddWarehouse}
      />

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 2,
          py: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {currentWarehouse.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 500 }}
            >
              {currentWarehouse.address || "Address not available"}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <TextField
                size="small"
                placeholder="Scan QR..."
                value={qrSearchText}
                onChange={(event) => setQrSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }
                  event.preventDefault();
                  handleQrItemOpen();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeScannerOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 180,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#FF8A3D" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    py: 0.8,
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                
                onClick={handleQrItemOpen}
                disabled={!qrSearchText.trim()}
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  bgcolor: "#FF8A3D",
                  color: "#FFF",
                  height: 36,
                  minWidth: 80,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(255, 138, 61, 0.18)",
                  "&:hover": {
                    bgcolor: "#df6f22",
                  },
                }}
              >
                Get Item
              </Button>
            </Stack>

            <Box sx={{ width: 320, position: "relative" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Item / Rack..."
                value={itemSearchText}
                onChange={(event) => setItemSearchText(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#F8FAFC",
                    "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                    "&.Mui-focused fieldset": { borderColor: "#FF8A3D" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    py: 0.8,
                  },
                }}
              />

              {normalizedItemSearch ? (
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  {globalSearchResults.length ? (
                    <List disablePadding sx={{ maxHeight: 360, overflowY: "auto" }}>
                      {globalSearchResults.map((result) => (
                        <ListItemButton
                          key={result.key}
                          onClick={() => handleSearchResultSelect(result)}
                          sx={{
                            alignItems: "flex-start",
                            px: 1.5,
                            py: 1.15,
                            borderBottom: "1px solid rgba(15,23,42,0.06)",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Chip
                                size="small"
                                label={result.type === "item" ? "Item" : "Rack"}
                                sx={{
                                  height: 22,
                                  bgcolor:
                                    result.type === "item"
                                      ? "rgba(255,138,61,0.14)"
                                      : "rgba(59,130,246,0.12)",
                                  color: result.type === "item" ? "#C2410C" : "#1D4ED8",
                                  fontWeight: 700,
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                                {result.type === "item"
                                  ? result.item?.product || result.item?.oracle_code || result.item?.id
                                  : result.rack.name}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{ display: "block", mt: 0.5, color: "#475569", fontWeight: 600 }}
                            >
                              {result.warehouse.name} | {result.section.name} | {result.rack.name}
                              {result.shelf ? ` | ${result.shelf.id}` : ""}
                            </Typography>
                            {result.type === "item" ? (
                              <Typography
                                variant="caption"
                                sx={{ display: "block", mt: 0.25, color: "#64748B" }}
                              >
                                Oracle: {result.item?.oracle_code || "-"} | Stock: {result.item?.qty ?? 0}
                              </Typography>
                            ) : null}
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ px: 1.5, py: 1.25 }}>
                      <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                        No item or rack found
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        Search runs across all warehouses and zones.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ) : null}
            </Box>

            <Chip
              label={`${totalRacks} racks · ${currentWarehouse.sections.length} zones`}
              size="small"
              sx={{
                bgcolor: "#FF8A3D",
                color: "#FFF",
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 32,
                borderRadius: 2,
                px: 1,
                boxShadow: "0 2px 8px rgba(255, 138, 61, 0.2)",
              }}
            />
          </Stack>
        </Stack>

        {currentWarehouse.sections.length > 0 && currentSection ? (
          <>
            <SectionTabs
              sections={currentWarehouse.sections}
              activeSectionIndex={activeSectionIndex}
              onChange={handleSectionTabChange}
              onAddZone={handleOpenAddZone}
            />

            <Box sx={{ pt: 2 }}>
              <RackGrid
                section={currentSection}
                selectedRackId={null}
                onSelectRack={handleSelectRack}
                onAddRack={handleAddRack}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "#FFF",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {currentWarehouse.name}
            </Typography>
            <Typography color="text.disabled">No zones available in this warehouse.</Typography>
          </Box>
        )}
      </Box>
    </Card>
    </Page>
  );
}
