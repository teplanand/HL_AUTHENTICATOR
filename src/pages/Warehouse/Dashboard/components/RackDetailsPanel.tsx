import { createRef, memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Breadcrumbs,
  Card,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SouthWestOutlinedIcon from "@mui/icons-material/SouthWestOutlined";
import NorthEastOutlinedIcon from "@mui/icons-material/NorthEastOutlined";

import { Pallet, Rack, Section, Shelf, Warehouse } from "../types";
import { getRackTotals, getShelfUsagePercent, getStatusColor } from "../utils";
import { useModal } from "../../../../../shared/hooks/useModal";
import IconActionButton from "../../../../../shared/components/common/IconActionButton";
import CompactAccordion from "../../../../../shared/components/common/CompactAccordion";
import ApiActionButton from "../../../../../shared/components/common/ApiActionButton";
import { openEntityFormModal } from "../../shared/openEntityFormModal";
import {
  AddEditItem,
  AddEditItemRef,
  type ItemSubmitPayload,
} from "../../Itemlist/addedititem";
import {
  AddEditWarehouse,
  AddEditWarehouseRef,
  type WarehouseSubmitPayload,
} from "../../Warehouselist/addeditwarehouse";
import {
  AddEditZone,
  AddEditZoneRef,
  type ZoneSubmitPayload,
} from "../../Zonelist/addeditzone";
import {
  AddEditRack,
  AddEditRackRef,
  type RackSubmitPayload,
} from "../../Racklist/addeditrack";
import {
  AddEditPallet,
  AddEditPalletRef,
  type PalletSubmitPayload,
} from "../../Palletlist/addeditpallet";
import {
  ItemTransactionDrawer,
  type ItemTransactionDrawerRef,
  type ItemTransactionPayload,
} from "./ItemTransactionDrawer";
import { useCreateTransactionMutation } from "../../api/warehouse";

type Props = {
  warehouse: Warehouse;
  section: Section | null;
  selectedRack: Rack | null;
  setDisplayTitle?: (title: string) => void;
  onSubmitWarehouse?: (payload: WarehouseSubmitPayload) => Promise<void> | void;
  onDeleteWarehouse?: (id: string | number) => Promise<void>;
  onSubmitZone?: (payload: ZoneSubmitPayload) => Promise<void> | void;
  onDeleteZone?: (id: string | number) => Promise<void>;
  onSubmitRack?: (payload: RackSubmitPayload) => Promise<void> | void;
  onDeleteRack?: (id: string | number) => Promise<void>;
  onSubmitPallet?: (payload: PalletSubmitPayload) => Promise<void> | void;
  onDeletePallet?: (id: string | number) => Promise<void>;
  onSubmitItem?: (payload: ItemSubmitPayload) => Promise<void> | void;
  onDeleteItem?: (id: string | number) => Promise<void>;
  onAdjustItemQty?: (
    shelf: Shelf,
    item: Pallet,
    direction: "in" | "out"
  ) => Promise<void> | void;
};

type PalletRowProps = {
  shelf: Shelf;
  expanded: boolean;
  onToggle: () => void;
  onEditPallet: (shelf: Shelf) => void;
  onAddItem: (shelf: Shelf) => void;
  onEditItem: (shelf: Shelf, item: Pallet) => void;
  onOpenTransaction: (shelf: Shelf, item: Pallet, operation: "1" | "2") => void;
};

type DetailFieldProps = {
  label: string;
  value: string | number;
  onEdit?: () => void;
  tooltip?: string;
};

type ActionCardProps = {
  title: string;
  value?: string | number;
  action?: ReactNode;
};

type ItemRowProps = {
  item: Pallet;
  name: string;
  totalQty: number;
  onEdit: () => void;
  onOpenIn: () => void;
  onOpenOut: () => void;
};

const getShelfUsed = (shelf: Shelf) => shelf.pallets.reduce((total, item) => total + item.qty, 0);

const nextItemLabel = (shelf: Shelf) => `Item ${shelf.pallets.length + 1}`;

function ActionCard({ title, value, action }: ActionCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 2,
        backgroundColor: "#F8FAFC",
        borderColor: "rgba(15,23,42,0.06)",
        boxShadow: "none",
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        {action ? (
          <Box sx={{ display: "flex", alignItems: "center", mt: -0.5, mr: -0.5 }}>{action}</Box>
        ) : null}
      </Stack>
      <Typography variant="body2" sx={{ mt: 0.375, fontWeight: 700, color: "#334155" }}>
        {value}
      </Typography>
    </Card>
  );
}

function DetailField({ label, value, onEdit, tooltip = "Edit" }: DetailFieldProps) {
  return (
    <ActionCard
      title={label}
      value={value}
      action={
        onEdit ? (
          <IconActionButton
            ariaLabel={`Edit ${label}`}
            tooltip={tooltip}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconActionButton>
        ) : undefined
      }
    />
  );
}

function ItemRow({
  item,
  name,
  totalQty,
  onEdit,
  onOpenIn,
  onOpenOut,
}: ItemRowProps) {
  return (
    <Box
      sx={{
        px: 0.875,
        py: 0.75,
        borderRadius: 1.5,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", minWidth: 0 }}>
          {name}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
          <IconActionButton
            ariaLabel={`In transaction for ${item.id}`}
            tooltip="IN Transaction"
            onClick={(event) => {
              event.stopPropagation();
              onOpenIn();
            }}
            sx={{
              bgcolor: "rgba(22,163,74,0.1)",
              color: "#15803D",
              "&:hover": { bgcolor: "rgba(22,163,74,0.18)" },
            }}
          >
            <NorthEastOutlinedIcon fontSize="small" />
          </IconActionButton>
          <IconActionButton
            ariaLabel={`Out transaction for ${item.id}`}
            tooltip="OUT Transaction"
            onClick={(event) => {
              event.stopPropagation();
              onOpenOut();
            }}
            sx={{
              bgcolor: "rgba(234,88,12,0.1)",
              color: "#C2410C",
              "&:hover": { bgcolor: "rgba(234,88,12,0.18)" },
            }}
          >
            <SouthWestOutlinedIcon fontSize="small" />
          </IconActionButton>
          <Box
            sx={{
              px: 0.85,
              py: 0.55,
              borderRadius: 99,
              backgroundColor: "rgba(255,138,61,0.12)",
            }}
          >
            <Typography variant="caption" sx={{ color: "#9A3412", fontWeight: 700 }}>
              Total:{" "}
              <Box component="span" sx={{ color: "#C2410C", fontWeight: 800 }}>
                {totalQty}
              </Box>
            </Typography>
          </Box>
          <IconActionButton
            ariaLabel={`Edit item ${item.id}`}
            tooltip="Edit"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            sx={{ ml: 0.25 }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconActionButton>
        </Stack>
      </Stack>
    </Box>
  );
}

const PalletRow = memo(function PalletRow({
  shelf,
  expanded,
  onToggle,
  onEditPallet,
  onAddItem,
  onEditItem,
  onOpenTransaction,
}: PalletRowProps) {
  const usage = getShelfUsagePercent(shelf.used, shelf.capacity);
  const status = getStatusColor(shelf.used, shelf.capacity);

  return (
    <CompactAccordion
      expanded={expanded}
      onToggle={onToggle}
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", minWidth: 72 }}>
              {shelf.id}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={usage}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: "#E2E8F0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: status,
                    borderRadius: 999,
                  },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "#64748B", fontWeight: 700, minWidth: 40 }}
            >
              {Math.round(usage)}%
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.25} alignItems="center">
            <IconActionButton
              ariaLabel={`Edit pallet ${shelf.id}`}
              tooltip="Edit"
              onClick={(event) => {
                event.stopPropagation();
                onEditPallet(shelf);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconActionButton>
            <IconButton size="small" sx={{ p: 0.5 }}>
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Stack>
      }
    >
      <Box sx={{ px: 0.25 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Capacity: {shelf.used} / {shelf.capacity}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Items: {shelf.pallets.length}
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 0.875,
            borderRadius: 1.75,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
                Items
              </Typography>
              <IconActionButton
                ariaLabel={`Add item to ${shelf.id}`}
                tooltip="Add Item"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddItem(shelf);
                }}
              >
                <AddOutlinedIcon fontSize="small" />
              </IconActionButton>
            </Stack>
            {shelf.pallets.length ? (
              shelf.pallets.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  name={item.product}
                  totalQty={item.qty}
                  onEdit={() => onEditItem(shelf, item)}
                  onOpenIn={() => onOpenTransaction(shelf, item, "1")}
                  onOpenOut={() => onOpenTransaction(shelf, item, "2")}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled">
                No items in this pallet.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </CompactAccordion>
  );
});

function RackDetailsPanelComponent({
  warehouse,
  section,
  selectedRack,
  setDisplayTitle,
  onSubmitWarehouse,
  onDeleteWarehouse,
  onSubmitZone,
  onDeleteZone,
  onSubmitRack,
  onDeleteRack,
  onSubmitPallet,
  onDeletePallet,
  onSubmitItem,
  onDeleteItem,
}: Props) {
  const { openModal } = useModal();
  const [createTransaction] = useCreateTransactionMutation();
  const [warehouseState, setWarehouseState] = useState(warehouse);
  const [sectionId, setSectionId] = useState<string | null>(section?.id || null);
  const [rackId, setRackId] = useState<string | null>(selectedRack?.id || null);
  const [expandedShelfId, setExpandedShelfId] = useState<string | null>(
    selectedRack?.shelves[0]?.id || null
  );

  useEffect(() => {
    setWarehouseState(warehouse);
    setSectionId(section?.id || null);
    setRackId(selectedRack?.id || null);
    setExpandedShelfId(selectedRack?.shelves[0]?.id || null);
  }, [warehouse, section, selectedRack]);

  const currentSection = useMemo(
    () => warehouseState.sections.find((sectionItem) => sectionItem.id === sectionId) || null,
    [sectionId, warehouseState.sections]
  );

  const currentRack = useMemo(
    () =>
      currentSection?.racks.find((rackItem) => rackItem.id === rackId) ||
      warehouseState.sections
        .flatMap((sectionItem) => sectionItem.racks)
        .find((rackItem) => rackItem.id === rackId) ||
      null,
    [currentSection, rackId, warehouseState.sections]
  );

  const totals = currentRack ? getRackTotals(currentRack) : null;

  useEffect(() => {
    if (currentRack) {
      setDisplayTitle?.(`Rack Details - ${currentRack.name}`);
    }
  }, [currentRack, setDisplayTitle]);

  useEffect(() => {
    if (!currentRack) {
      setExpandedShelfId(null);
      return;
    }

    if (expandedShelfId && currentRack.shelves.some((shelf) => shelf.id === expandedShelfId)) {
      return;
    }

    setExpandedShelfId(currentRack.shelves[0]?.id || null);
  }, [currentRack, expandedShelfId]);

  const replaceRackLocal = useCallback(
    (updater: (rack: Rack) => Rack) => {
      if (!sectionId || !rackId) {
        return;
      }

      setWarehouseState((prev) => ({
        ...prev,
        sections: prev.sections.map((sectionItem) =>
          sectionItem.id === sectionId
            ? {
                ...sectionItem,
                racks: sectionItem.racks.map((rackItem) =>
                  rackItem.id === rackId ? updater(rackItem) : rackItem
                ),
              }
            : sectionItem
        ),
      }));
    },
    [rackId, sectionId]
  );

  const editWarehouse = useCallback(() => {
    openEntityFormModal<AddEditWarehouseRef>({
      openModal,
      entityLabel: "Warehouse",
      width: 720,
      FormComponent: AddEditWarehouse,
      defaultValues: {
        id: warehouseState.recordId,
        warehouseCode: warehouseState.id,
        warehouseName: warehouseState.name,
        managerName: warehouseState.managerName || "",
        contact_no: warehouseState.contact_no || "",
        email: warehouseState.email || "",
        address: warehouseState.address,
        notes: warehouseState.notes || "",
        status: warehouseState.status || "ACTIVE",
      },
      extraProps: {
        onSubmitWarehouse: async (payload: WarehouseSubmitPayload) => {
          await onSubmitWarehouse?.(payload);
          setWarehouseState((prev) => ({
            ...prev,
            id: payload.warehouseCode || prev.id,
            name: payload.warehouseName.trim() || prev.name,
            managerName: payload.managerName.trim() || prev.managerName,
            contact_no: payload.contact_no.trim() || prev.contact_no,
            email: payload.email.trim() || prev.email,
            address: payload.address.trim() || prev.address,
            notes: payload.notes.trim() || prev.notes,
            status: payload.status || prev.status,
          }));
        },
        onDeleteWarehouse,
      },
    });
  }, [onDeleteWarehouse, onSubmitWarehouse, openModal, warehouseState]);

  const editZone = useCallback(() => {
    if (!currentSection) {
      return;
    }

    openEntityFormModal<AddEditZoneRef>({
      openModal,
      entityLabel: "Zone",
      width: 720,
      FormComponent: AddEditZone,
      defaultValues: {
        id: currentSection.recordId,
        warehouse_id: currentSection.warehouse_id || warehouseState.recordId,
        zone_code: currentSection.id,
        zone_title: currentSection.name,
        status: "ACTIVE",
      },
      extraProps: {
        onSubmitZone: async (payload: ZoneSubmitPayload) => {
          await onSubmitZone?.(payload);
          setWarehouseState((prev) => ({
            ...prev,
            sections: prev.sections.map((sectionItem) =>
              sectionItem.id === currentSection.id
                ? {
                    ...sectionItem,
                    id: payload.zone_code || sectionItem.id,
                    name: payload.zone_title.trim() || sectionItem.name,
                  }
                : sectionItem
            ),
          }));
          if (payload.zone_code && payload.zone_code !== currentSection.id) {
            setSectionId(payload.zone_code);
          }
        },
        onDeleteZone,
      },
    });
  }, [currentSection, onDeleteZone, onSubmitZone, openModal, warehouseState.recordId]);

  const editRack = useCallback(() => {
    if (!currentRack || !currentSection) {
      return;
    }

    openEntityFormModal<AddEditRackRef>({
      openModal,
      entityLabel: "Rack",
      width: 560,
      FormComponent: AddEditRack,
      defaultValues: {
        id: currentRack.recordId,
        warehouse_id: warehouseState.recordId,
        zone_id: currentSection.recordId,
        section_id: currentSection.recordId,
        rack_code: currentRack.id,
        rack_description: currentRack.name,
        status: "ACTIVE",
      },
      extraProps: {
        onSubmitRack: async (payload: RackSubmitPayload) => {
          await onSubmitRack?.(payload);

          let nextSectionDisplayId = currentSection.id;

          setWarehouseState((prev) => {
            const nextRack = {
              ...currentRack,
              id: payload.rack_code || currentRack.id,
              name: payload.rack_description?.trim() || payload.rack_code || currentRack.name,
            };

            if (!payload.zone_id || String(payload.zone_id) === String(currentSection.recordId)) {
              return {
                ...prev,
                sections: prev.sections.map((sectionItem) =>
                  sectionItem.id === currentSection.id
                    ? {
                        ...sectionItem,
                        racks: sectionItem.racks.map((rackItem) =>
                          rackItem.id === currentRack.id ? nextRack : rackItem
                        ),
                      }
                    : sectionItem
                ),
              };
            }

            const sectionsWithoutRack = prev.sections.map((sectionItem) =>
              sectionItem.id === currentSection.id
                ? {
                    ...sectionItem,
                    racks: sectionItem.racks.filter((rackItem) => rackItem.id !== currentRack.id),
                  }
                : sectionItem
            );

            return {
              ...prev,
              sections: sectionsWithoutRack.map((sectionItem) => {
                if (String(sectionItem.recordId) !== String(payload.zone_id)) {
                  return sectionItem;
                }

                nextSectionDisplayId = sectionItem.id;
                return {
                  ...sectionItem,
                  racks: [...sectionItem.racks, nextRack],
                };
              }),
            };
          });

          setSectionId(nextSectionDisplayId);
          setRackId(payload.rack_code || currentRack.id);
        },
        onDeleteRack,
      },
    });
  }, [
    currentRack,
    currentSection,
    onDeleteRack,
    onSubmitRack,
    openModal,
    warehouseState.recordId,
  ]);

  const addPallet = useCallback(() => {
    if (!currentRack || !currentSection) {
      return;
    }

    openEntityFormModal<AddEditPalletRef>({
      openModal,
      entityLabel: "Pallet",
      width: 520,
      FormComponent: AddEditPallet,
      defaultValues: {
        warehouse_id: warehouseState.recordId,
        zone_id: currentSection.recordId,
        rack_id: currentRack.recordId,
        pallet_code: `${currentRack.id}-PALLET-${currentRack.shelves.length + 1}`,
      },
      extraProps: {
        onSubmitPallet: async (payload: PalletSubmitPayload) => {
          await onSubmitPallet?.(payload);
          replaceRackLocal((rackItem) => ({
            ...rackItem,
            shelves: [
              ...rackItem.shelves,
              {
                id: payload.pallet_code,
                capacity: payload.max_capacity,
                used: 0,
                pallets: [],
              },
            ],
          }));
        },
        onDeletePallet,
      },
    });
  }, [
    currentRack,
    currentSection,
    onDeletePallet,
    onSubmitPallet,
    openModal,
    replaceRackLocal,
    warehouseState.recordId,
  ]);

  const editPallet = useCallback(
    (shelf: Shelf) => {
      if (!currentRack || !currentSection) {
        return;
      }

      openEntityFormModal<AddEditPalletRef>({
        openModal,
        entityLabel: "Pallet",
        width: 520,
        FormComponent: AddEditPallet,
        defaultValues: {
          id: shelf.recordId,
          warehouse_id: warehouseState.recordId,
          zone_id: currentSection.recordId,
          rack_id: currentRack.recordId,
          pallet_code: shelf.id,
          max_capacity: shelf.capacity,
        },
        extraProps: {
          onSubmitPallet: async (payload: PalletSubmitPayload) => {
            await onSubmitPallet?.(payload);
            replaceRackLocal((rackItem) => ({
              ...rackItem,
              shelves: rackItem.shelves.map((entry) =>
                entry.id === shelf.id
                  ? {
                      ...entry,
                      id: payload.pallet_code,
                      capacity: payload.max_capacity,
                      used: getShelfUsed(entry),
                    }
                  : entry
              ),
            }));
            setExpandedShelfId(payload.pallet_code);
          },
          onDeletePallet,
        },
      });
    },
    [
      currentRack,
      currentSection,
      onDeletePallet,
      onSubmitPallet,
      openModal,
      replaceRackLocal,
      warehouseState.recordId,
    ]
  );

  const openAddItem = useCallback(
    (shelf: Shelf) => {
      openEntityFormModal<AddEditItemRef>({
        openModal,
        entityLabel: "Item",
        width: 640,
        FormComponent: AddEditItem,
        defaultValues: {
          pallet_id: String(shelf.recordId || ""),
          rack_id: currentRack?.recordId || "",
          sub_loc_id: "",
          oracle_code: "",
          item_desc: "",
          item_category: "",
          locator: "",
          sub_inventory: "",
          detail_qty: "",
          in_qty: "",
          out_qty: "",
        },
        extraProps: {
          onSubmitItem: async (payload: ItemSubmitPayload) => {
            await onSubmitItem?.(payload);
            replaceRackLocal((rackItem) => ({
              ...rackItem,
              shelves: rackItem.shelves.map((entry) => {
                if (entry.id !== shelf.id) {
                  return entry;
                }

                const nextShelf = {
                  ...entry,
                  pallets: [
                    ...entry.pallets,
                    {
                      id: payload.oracle_code || nextItemLabel(entry),
                      product: payload.oracle_code,
                      qty: payload.qty,
                      inQty: payload.in_qty ?? 0,
                      outQty: payload.out_qty ?? 0,
                      pallet_id: payload.pallet_id,
                      rack_id: payload.rack_id,
                      sub_loc_id: payload.sub_loc_id,
                      oracle_code: payload.oracle_code,
                      item_desc: payload.item_desc,
                      item_category: payload.item_category,
                      locator: payload.locator,
                      description: payload.item_desc,
                      sub_inventory: payload.sub_inventory,
                      has_expiry_date: payload.has_expiry,
                      expiry_date: payload.expiry_date,
                      item_image_document_id: payload.item_image_document_id ?? null,
                      item_image_name: payload.item_image_name ?? null,
                      item_image_path: payload.item_image_path ?? null,
                      qr_code: payload.qr_code,
                    },
                  ],
                };

                return { ...nextShelf, used: getShelfUsed(nextShelf) };
              }),
            }));
            setExpandedShelfId(shelf.id);
          },
          onDeleteItem,
        },
      });
    },
    [onDeleteItem, onSubmitItem, openModal, replaceRackLocal]
  );

  const openEditItem = useCallback(
    (shelf: Shelf, item: Pallet) => {
      openEntityFormModal<AddEditItemRef>({
        openModal,
        entityLabel: "Item",
        width: 640,
        FormComponent: AddEditItem,
        defaultValues: {
          id: item.recordId,
          pallet_id: String(shelf.recordId || item.pallet_id || ""),
          rack_id: currentRack?.recordId || item.rack_id || "",
          sub_loc_id: item.sub_loc_id || "",
          oracle_code: item.oracle_code || item.product,
          item_desc: item.item_desc || item.description || "",
          item_category: item.item_category || "",
          locator: item.locator || "",
          sub_inventory: item.sub_inventory || "",
          detail_qty: item.qty,
          in_qty: "",
          out_qty: "",
          has_expiry: item.has_expiry_date || false,
          expiry_date: item.expiry_date || null,
          item_image_document_id: item.item_image_document_id ?? null,
          item_image_name: item.item_image_name ?? null,
          item_image_path: item.item_image_path || null,
        },
        extraProps: {
          onSubmitItem: async (payload: ItemSubmitPayload) => {
            await onSubmitItem?.(payload);
            replaceRackLocal((rackItem) => ({
              ...rackItem,
              shelves: rackItem.shelves.map((entry) => {
                if (entry.id !== shelf.id) {
                  return entry;
                }

                const nextShelf = {
                  ...entry,
                  pallets: entry.pallets.map((existingItem) =>
                    existingItem.id === item.id
                      ? {
                          ...existingItem,
                          id: payload.oracle_code || existingItem.id,
                          product: payload.oracle_code,
                          qty: payload.qty,
                          inQty: payload.in_qty ?? existingItem.inQty ?? existingItem.qty,
                          outQty: payload.out_qty ?? existingItem.outQty ?? 0,
                          pallet_id: payload.pallet_id,
                          rack_id: payload.rack_id,
                          sub_loc_id: payload.sub_loc_id,
                          oracle_code: payload.oracle_code,
                          item_desc: payload.item_desc,
                          item_category: payload.item_category,
                          locator: payload.locator,
                          description: payload.item_desc,
                          sub_inventory: payload.sub_inventory,
                          has_expiry_date: payload.has_expiry,
                          expiry_date: payload.expiry_date,
                          item_image_document_id: payload.item_image_document_id ?? null,
                          item_image_name: payload.item_image_name ?? null,
                          item_image_path: payload.item_image_path ?? null,
                          qr_code: payload.qr_code,
                        }
                      : existingItem
                  ),
                };

                return { ...nextShelf, used: getShelfUsed(nextShelf) };
              }),
            }));
            setExpandedShelfId(shelf.id);
          },
          onDeleteItem,
        },
      });
    },
    [onDeleteItem, onSubmitItem, openModal, replaceRackLocal]
  );

  const openTransactionDrawer = useCallback(
    (shelf: Shelf, item: Pallet, defaultOperation: "1" | "2") => {
      const transactionRef = createRef<ItemTransactionDrawerRef>();

      openModal({
        title: `Item ${defaultOperation === "1" ? "IN" : "OUT"} Transaction`,
        width: 480,
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <ItemTransactionDrawer
            ref={transactionRef}
            {...modalProps}
            shelf={shelf}
            item={item}
            rackId={currentRack?.recordId || currentRack?.id || item.rack_id || ""}
            defaultOperation={defaultOperation}
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

              const transactionQty = Number(payload.qty || 0);
              const isInOperation = payload.operation === "1";

              replaceRackLocal((rackItem) => ({
                ...rackItem,
                shelves: rackItem.shelves.map((entry) => {
                  if (entry.id !== shelf.id) {
                    return entry;
                  }

                  const pallets = entry.pallets.map((existingItem) => {
                    if (existingItem.id !== item.id) {
                      return existingItem;
                    }

                    const nextQty = isInOperation
                      ? existingItem.qty + transactionQty
                      : Math.max(existingItem.qty - transactionQty, 0);

                    return {
                      ...existingItem,
                      qty: nextQty,
                      inQty: isInOperation
                        ? (existingItem.inQty ?? 0) + transactionQty
                        : existingItem.inQty ?? 0,
                      outQty: isInOperation
                        ? existingItem.outQty ?? 0
                        : (existingItem.outQty ?? 0) + transactionQty,
                      has_expiry_date: payload.has_expiry ?? existingItem.has_expiry_date,
                      expiry_date:
                        payload.has_expiry && payload.expiry_date
                          ? payload.expiry_date
                          : existingItem.expiry_date,
                    };
                  });

                  const nextShelf = { ...entry, pallets };
                  return { ...nextShelf, used: getShelfUsed(nextShelf) };
                }),
              }));
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
    },
    [createTransaction, openModal, replaceRackLocal]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#E2E8F0",
          borderRadius: "4px",
        },
      }}
    >
      {currentRack && currentSection ? (
        <>
          <Box sx={{ px: 1, pb: 1 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ "& .MuiBreadcrumbs-li": { fontSize: "0.75rem", fontWeight: 500 } }}
            >
              <Typography color="text.secondary">{warehouseState.name}</Typography>
              <Typography color="text.secondary">{currentSection.name}</Typography>
              <Typography color="text.primary">{currentRack.id}</Typography>
            </Breadcrumbs>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 1,
                mt: 1,
              }}
            >
              <DetailField label="Warehouse" value={warehouseState.name} onEdit={editWarehouse} />
              <DetailField label="Zone" value={currentSection.name} onEdit={editZone} />
              <DetailField label="Rack" value={currentRack.id} onEdit={editRack} />
              <ActionCard
                title="Pallets"
                value={currentRack.shelves.length}
                action={
                  <IconActionButton
                    ariaLabel="Add pallet"
                    tooltip="Add Pallet"
                    onClick={(event) => {
                      event.stopPropagation();
                      addPallet();
                    }}
                  >
                    <AddOutlinedIcon fontSize="small" />
                  </IconActionButton>
                }
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Capacity Usage
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                {totals?.used} / {totals?.capacity} units
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(((totals?.used || 0) / (totals?.capacity || 1)) * 100, 100)}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  mt: 0.75,
                  backgroundColor: "#F6D3C2",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#FF8A3D" },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 1, flex: 1 }}>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", px: 0.25 }}>
                Pallet List
              </Typography>
              {currentRack.shelves.map((shelf) => (
                <PalletRow
                  key={shelf.id}
                  shelf={shelf}
                  expanded={expandedShelfId === shelf.id}
                  onToggle={() => setExpandedShelfId((prev) => (prev === shelf.id ? null : shelf.id))}
                  onEditPallet={editPallet}
                  onAddItem={openAddItem}
                  onEditItem={openEditItem}
                  onOpenTransaction={openTransactionDrawer}
                />
              ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
          <Typography color="text.secondary">Select a rack from the grid to view details</Typography>
        </Box>
      )}
    </Box>
  );
}

export const RackDetailsPanel = memo(RackDetailsPanelComponent);
