import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { useForm } from "react-hook-form";
import { Box, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

import ConfirmDeleteButton from "../../../../shared/components/common/ConfirmDeleteButton";
import { MuiSelect, MuiTextField } from "../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../shared/components/ui/form/stack";
import FormSection from "../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import { useListWarehousesQuery } from "../api/warehouse";
import { extractApiRows } from "../shared/gridApiHelpers";
import { buildWarehouseCode, buildZoneCode, normalizeCodeValue } from "../shared/codeGeneration";

type ZoneFormValues = {
  warehouse_id: string;
  zone_code: string;
  zone_title: string;
  zone_description: string;
  status: "ACTIVE" | "INACTIVE";
};

export type ZoneSubmitPayload = {
  id?: string | number;
  warehouse_id: number;
  zone_code: string;
  zone_title: string;
  zone_description?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

type AddEditZoneProps = {
  defaultValues?: Partial<ZoneFormValues> & {
    id?: string | number;
    name?: string;
    warehouseName?: string;
    warehouse_id?: number | string;
    zone_code?: string;
    zone_title?: string;
    zone_description?: string | null;
  };
  onSubmitZone?: (payload: ZoneSubmitPayload) => void | Promise<void>;
  onDeleteZone?: (id: string | number) => Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type AddEditZoneRef = {
  submit: () => Promise<void>;
};

function Index({
  defaultValues,
  onSubmitZone,
  onDeleteZone,
  setDisplayTitle,
  setDataChanged,
  setHideFooter,
  setWidth,
}: AddEditZoneProps, ref: Ref<AddEditZoneRef>) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const isEditMode = Boolean(defaultValues?.id);
  const { data: warehousesData } = useListWarehousesQuery();
  const initialWarehouseId = String(defaultValues?.warehouse_id || "");
  const initialZoneTitle = defaultValues?.zone_title || defaultValues?.name || "";
  const initialZoneCode = defaultValues?.zone_code || "";
  const warehouses = useMemo(() => extractApiRows(warehousesData), [warehousesData]);
  const initialWarehouse = useMemo(
    () => warehouses.find((warehouse: any) => String(warehouse.id) === initialWarehouseId),
    [initialWarehouseId, warehouses]
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
  const initialGeneratedZoneCode = useMemo(
    () => buildZoneCode(initialWarehouseCode, initialZoneTitle),
    [initialWarehouseCode, initialZoneTitle]
  );
  const zoneCodeManuallyEditedRef = useRef(
    Boolean(
      initialZoneCode &&
      normalizeCodeValue(initialZoneCode) !== normalizeCodeValue(initialGeneratedZoneCode)
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
  } = useForm<ZoneFormValues>({
    defaultValues: {
      warehouse_id: String(defaultValues?.warehouse_id || ""),
      zone_code: defaultValues?.zone_code || "",
      zone_title: defaultValues?.zone_title || defaultValues?.name || "",
      zone_description: defaultValues?.zone_description || "",
      status: defaultValues?.status || "ACTIVE",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.(isEditMode ? "Edit Zone" : "Add Zone");
    setHideFooter?.(false);
    setWidth?.(720);
  }, [isEditMode, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const selectedStatus = watch("status");
  const selectedWarehouseId = watch("warehouse_id");
  const zoneTitle = watch("zone_title");
  const zoneCode = watch("zone_code");
  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse: any) => String(warehouse.id) === String(selectedWarehouseId)),
    [selectedWarehouseId, warehouses]
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
  const generatedZoneCode = useMemo(
    () => buildZoneCode(selectedWarehouseCode, zoneTitle),
    [selectedWarehouseCode, zoneTitle]
  );

  useEffect(() => {
    if (zoneCodeManuallyEditedRef.current) {
      return;
    }

    if (normalizeCodeValue(zoneCode) === normalizeCodeValue(generatedZoneCode)) {
      return;
    }

    setValue("zone_code", generatedZoneCode, {
      shouldDirty: normalizeCodeValue(generatedZoneCode) !== normalizeCodeValue(initialZoneCode),
      shouldValidate: true,
    });
  }, [generatedZoneCode, initialZoneCode, setValue, zoneCode]);

  const onSubmit = useCallback(async (data: ZoneFormValues) => {
    const payload: ZoneSubmitPayload = {
      ...(defaultValues?.id ? { id: defaultValues.id } : {}),
      warehouse_id: Number(data.warehouse_id),
      zone_code: data.zone_code.trim().toUpperCase(),
      zone_title: data.zone_title.trim(),
      zone_description: data.zone_description.trim() || null,
      status: data.status,
    };

    if (onSubmitZone) {
      await onSubmitZone(payload);
    }

    showToast(
      isEditMode ? "Zone updated successfully" : "Zone created successfully",
      "success"
    );
    setDataChanged?.(false);
    closeModal();
  }, [closeModal, defaultValues?.id, isEditMode, onSubmitZone, setDataChanged, showToast]);

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
          title="Zone Identity"
          
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
              })}
              error={!!errors.warehouse_id}
              helperText={errors.warehouse_id?.message}
            />
            <MuiTextField
              id="zone_code"
              label="Zone Code"
              placeholder="ZONE-A"
              {...register("zone_code", {
                required: "Zone code is required",
                onChange: (event) => {
                  zoneCodeManuallyEditedRef.current =
                    normalizeCodeValue(event.target.value) !== normalizeCodeValue(generatedZoneCode);
                },
              })}
              error={!!errors.zone_code}
              helperText={errors.zone_code?.message}
            />
            <MuiTextField
              id="zone_title"
              label="Zone Title"
              placeholder="Zone A"
              {...register("zone_title", {
                required: "Zone title is required",
              })}
              error={!!errors.zone_title}
              helperText={errors.zone_title?.message}
            />
            <Box sx={{ minWidth: 0 }}>
             
              <input
                type="hidden"
                {...register("status", {
                  required: "Status is required",
                })}
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
              id="zone_description"
              label="Zone Description"
              multiline
              minRows={4}
              placeholder="Fast moving items zone"
              {...register("zone_description")}
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
            entityLabel="Zone"
            successMessage="Zone deleted successfully"
            onDelete={async () => {
              if (!defaultValues?.id || !onDeleteZone) {
                return;
              }

              await onDeleteZone(defaultValues.id);
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

export const AddEditZone = memo(forwardRef(Index));
