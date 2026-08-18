import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { useForm } from "react-hook-form";
import { Stack, Box, FormControlLabel, Switch, Typography } from "@mui/material";

import ConfirmDeleteButton from "../../../../shared/components/common/ConfirmDeleteButton";
import { MuiSelect, MuiTextField } from "../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../shared/components/ui/form/stack";
import FormSection from "../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import { useListWarehousesQuery, useListZonesQuery } from "../api/warehouse";
import { extractApiRows } from "../shared/gridApiHelpers";
import {
  buildRackCode,
  buildWarehouseCode,
  buildZoneCode,
  normalizeCodeValue,
} from "../shared/codeGeneration";

type RackFormValues = {
  warehouse_id: string;
  zone_id: string;
  rack_code: string;
  rack_description: string;
  status: "ACTIVE" | "INACTIVE";
};

export type RackSubmitPayload = {
  id?: string | number;
  warehouse_id?: number;
  zone_id?: number;
  rack_code: string;
  rack_description?: string;
  status: "ACTIVE" | "INACTIVE";
};

type AddEditRackProps = {
  defaultValues?: Partial<RackFormValues> & {
    id?: string | number;
    name?: string;
    zoneName?: string;
    warehouse_id?: string | number;
    zone_id?: string | number;
    section_id?: string | number;
    rack_description?: string;
    rack_code?: string;
  };
  onSubmitRack?: (payload: RackSubmitPayload) => void | Promise<void>;
  onDeleteRack?: (id: string | number) => Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type AddEditRackRef = {
  submit: () => Promise<void>;
};

function Index({
  defaultValues,
  onSubmitRack,
  onDeleteRack,
  setDisplayTitle,
  setDataChanged,
  setHideFooter,
  setWidth,
}: AddEditRackProps, ref: Ref<AddEditRackRef>) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const isEditMode = Boolean(defaultValues?.id);
  const { data: warehousesData } = useListWarehousesQuery();
  const { data: zonesData } = useListZonesQuery();
  const initialWarehouseId = String(defaultValues?.warehouse_id || "");
  const initialZoneId = String(defaultValues?.zone_id || defaultValues?.section_id || "");
  const initialRackDescription = defaultValues?.rack_description || "";
  const initialRackCode = defaultValues?.rack_code || defaultValues?.name || "";
  const warehouses = useMemo(() => extractApiRows(warehousesData), [warehousesData]);
  const zones = useMemo(() => extractApiRows(zonesData), [zonesData]);
  const initialWarehouse = useMemo(
    () => warehouses.find((warehouse: any) => String(warehouse.id) === initialWarehouseId),
    [initialWarehouseId, warehouses]
  );
  const initialZone = useMemo(
    () => zones.find((zone: any) => String(zone.id) === initialZoneId),
    [initialZoneId, zones]
  );
  const initialWarehouseCode = useMemo(
    () =>
      normalizeCodeValue(
        initialWarehouse?.warehouse_code ||
        initialWarehouse?.code ||
        buildWarehouseCode(
          initialWarehouse?.warehouse_name ||
          initialWarehouse?.warehouseName ||
          initialWarehouse?.name
        )
      ),
    [initialWarehouse]
  );
  const initialZoneCode = useMemo(
    () =>
      normalizeCodeValue(
        initialZone?.zone_code ||
        initialZone?.code ||
        buildZoneCode(
          initialWarehouseCode,
          initialZone?.zone_title || initialZone?.name || initialZone?.zone_code
        )
      ),
    [initialWarehouseCode, initialZone]
  );
  const initialGeneratedRackCode = useMemo(
    () => buildRackCode(initialZoneCode, initialRackDescription),
    [initialRackDescription, initialZoneCode]
  );
  const rackCodeManuallyEditedRef = useRef(
    Boolean(
      initialRackCode &&
      normalizeCodeValue(initialRackCode) !== normalizeCodeValue(initialGeneratedRackCode)
    )
  );

  const warehouseOptions = useMemo(
    () => [
      { value: "", label: "Select warehouse" },
      ...warehouses.map((warehouse: any) => ({
        value: String(warehouse.id),
        label:
          warehouse.warehouse_name ||
          warehouse.warehouseName ||
          warehouse.name ||
          `Warehouse ${warehouse.id}`,
      })),
    ],
    [warehouses]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<RackFormValues>({
    defaultValues: {
      warehouse_id: String(defaultValues?.warehouse_id || ""),
      zone_id: String(defaultValues?.zone_id || defaultValues?.section_id || ""),
      rack_code: defaultValues?.rack_code || defaultValues?.name || "",
      rack_description: defaultValues?.rack_description || "",
      status: defaultValues?.status || "ACTIVE",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.(isEditMode ? "Edit Rack" : "Add Rack");
    setHideFooter?.(false);
    setWidth?.(560);
  }, [isEditMode, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const selectedWarehouseId = watch("warehouse_id");
  const selectedZoneId = watch("zone_id");
  const selectedStatus = watch("status");
  const rackDescription = watch("rack_description");
  const rackCode = watch("rack_code");

  const filteredZones = useMemo(
    () =>
      zones.filter(
        (zone: any) =>
          !selectedWarehouseId || String(zone.warehouse_id) === String(selectedWarehouseId)
      ),
    [selectedWarehouseId, zones]
  );

  const zoneOptions = useMemo(
    () => [
      { value: "", label: "Select zone" },
      ...filteredZones.map((zone: any) => ({
        value: String(zone.id),
        label: zone.zone_code || zone.zone_title || zone.name || `Zone ${zone.id}`,
      })),
    ],
    [filteredZones]
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse: any) => String(warehouse.id) === String(selectedWarehouseId)),
    [selectedWarehouseId, warehouses]
  );
  const selectedZone = useMemo(
    () => zones.find((zone: any) => String(zone.id) === String(selectedZoneId)),
    [selectedZoneId, zones]
  );
  const selectedWarehouseCode = useMemo(
    () =>
      normalizeCodeValue(
        selectedWarehouse?.warehouse_code ||
        selectedWarehouse?.code ||
        buildWarehouseCode(
          selectedWarehouse?.warehouse_name ||
          selectedWarehouse?.warehouseName ||
          selectedWarehouse?.name
        )
      ),
    [selectedWarehouse]
  );
  const selectedZoneCode = useMemo(
    () =>
      normalizeCodeValue(
        selectedZone?.zone_code ||
        selectedZone?.code ||
        buildZoneCode(
          selectedWarehouseCode,
          selectedZone?.zone_title || selectedZone?.name || selectedZone?.zone_code
        )
      ),
    [selectedWarehouseCode, selectedZone]
  );
  const generatedRackCode = useMemo(
    () => buildRackCode(selectedZoneCode, rackDescription),
    [rackDescription, selectedZoneCode]
  );

  useEffect(() => {
    if (!selectedZoneId) {
      return;
    }

    const zoneStillValid = filteredZones.some(
      (zone: any) => String(zone.id) === String(selectedZoneId)
    );

    if (!zoneStillValid) {
      setValue("zone_id", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [filteredZones, selectedZoneId, setValue]);

  useEffect(() => {
    if (rackCodeManuallyEditedRef.current) {
      return;
    }

    if (normalizeCodeValue(rackCode) === normalizeCodeValue(generatedRackCode)) {
      return;
    }

    setValue("rack_code", generatedRackCode, {
      shouldDirty: normalizeCodeValue(generatedRackCode) !== normalizeCodeValue(initialRackCode),
      shouldValidate: true,
    });
  }, [generatedRackCode, initialRackCode, rackCode, setValue]);

  const onSubmit = useCallback(async (data: RackFormValues) => {
    const payload: RackSubmitPayload = {
      ...(defaultValues?.id ? { id: defaultValues.id } : {}),
      warehouse_id: data.warehouse_id ? Number(data.warehouse_id) : undefined,
      zone_id: data.zone_id ? Number(data.zone_id) : undefined,
      rack_code: data.rack_code.trim().toUpperCase(),
      rack_description: data.rack_description.trim(),
      status: data.status,
    };

    if (onSubmitRack) {
      await onSubmitRack(payload);
    }

    showToast(
      isEditMode ? "Rack updated successfully" : "Rack created successfully",
      "success"
    );
    setDataChanged?.(false);
    closeModal();
  }, [closeModal, defaultValues?.id, isEditMode, onSubmitRack, setDataChanged, showToast]);

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        await handleSubmit(onSubmit)();
      },
    }),
    [handleSubmit, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <FormSection
          title="Rack Details"
        
        >
          <FormStackGrid columns={1}>
            <MuiSelect
              id="warehouse_id"
              label="Warehouse"
              placeholder="Select warehouse"
              displayEmpty
              defaultValue={String(defaultValues?.warehouse_id || "")}
              options={warehouseOptions}
              {...register("warehouse_id", {
                required: "Warehouse is required",
                onChange: (event) => {
                  const nextWarehouseId = String(event.target.value || "");
                  const activeZone = zones.find(
                    (zone: any) => String(zone.id) === String(selectedZoneId)
                  );

                  if (
                    activeZone &&
                    String(activeZone.warehouse_id) !== nextWarehouseId
                  ) {
                    setValue("zone_id", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                },
              })}
              error={!!errors.warehouse_id}
              helperText={errors.warehouse_id?.message}
            />
            <MuiSelect
              id="zone_id"
              label="Zone"
              placeholder="Select zone"
              displayEmpty
              defaultValue={String(defaultValues?.zone_id || defaultValues?.section_id || "")}
              options={zoneOptions}
              {...register("zone_id", { required: "Zone is required" })}
              error={!!errors.zone_id}
              helperText={errors.zone_id?.message}
            />
            <MuiTextField
              id="rack_code"
              label="Rack Code"
              placeholder="RACK-001"
              {...register("rack_code", {
                required: "Rack code is required",
                onChange: (event) => {
                  rackCodeManuallyEditedRef.current =
                    normalizeCodeValue(event.target.value) !== normalizeCodeValue(generatedRackCode);
                },
              })}
              error={!!errors.rack_code}
              helperText={errors.rack_code?.message}
            />
            <Box sx={{ minWidth: 0 }}>
              
              <input
                type="hidden"
                {...register("status", { required: "Status is required" })}
              />
              <FormControlLabel
                sx={{
                  m: 0,
                  px: 1,
                  py: 0.4,
                  width: "100%",
                  border: "1px solid rgba(15,23,42,0.12)",
                  borderRadius: 1.5,
                  justifyContent: "space-between",
                  backgroundColor:
                    selectedStatus === "ACTIVE" ? "rgba(34,197,94,0.08)" : "rgba(148,163,184,0.08)",
                  "& .MuiFormControlLabel-label": {
                    fontWeight: 700,
                    color: "text.primary",
                  },
                }}
                control={
                  <Switch
                    checked={selectedStatus === "ACTIVE"}
                    onChange={(event) => {
                      setValue("status", event.target.checked ? "ACTIVE" : "INACTIVE", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    color="success"
                  />
                }
                label={selectedStatus === "ACTIVE" ? "Active" : "Inactive"}
                labelPlacement="start"
              />
              {errors.status ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.75, display: "block" }}>
                  {errors.status.message}
                </Typography>
              ) : null}
            </Box>
          </FormStackGrid>
        </FormSection>

        <FormSection
          title="Description"
          
          accentColor="#1D4ED8"
        >
          <FormStackGrid columns={1}>
            <MuiTextField
              id="rack_description"
              label="Rack Description"
              placeholder="Optional description"
              multiline
              minRows={4}
              {...register("rack_description")}
              fullWidth
            />
          </FormStackGrid>
        </FormSection>
      </Stack>

      {isEditMode ? (
        <Box
          sx={{
            mt: 3,
            textAlign: "right",
          }}
        >
          <ConfirmDeleteButton
            entityLabel="Rack"
            successMessage="Rack deleted successfully"
            onDelete={async () => {
              if (!defaultValues?.id || !onDeleteRack) {
                return;
              }

              await onDeleteRack(defaultValues.id);
              closeModal();
            }}
          >
            Delete
          </ConfirmDeleteButton>
        </Box>
      ) : null}
    </form>
  );
}

export const AddEditRack = memo(forwardRef(Index));
