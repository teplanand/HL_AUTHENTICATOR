import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { Controller, useForm } from "react-hook-form";
import { Stack, Box, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";

import ConfirmDeleteButton from "../../../../shared/components/common/ConfirmDeleteButton";
import { MuiSelect, MuiTextField } from "../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../shared/components/ui/form/stack";
import FormSection from "../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import { useListRacksQuery, useListZonesQuery } from "../api/warehouse";
import { extractApiRows } from "../shared/gridApiHelpers";
import { buildPalletCode, buildRackCode, buildZoneCode, normalizeCodeValue } from "../shared/codeGeneration";

type PalletFormValues = {
  zone_id: string;
  rack_id: string;
  pallet_code: string;
  max_capacity: number | string;
  status: "AVAILABLE" | "OCCUPIED";
};

export type PalletSubmitPayload = {
  id?: string | number;
  warehouse_id?: number;
  zone_id: number;
  rack_id: number;
  pallet_code: string;
  max_capacity: number;
  status: "AVAILABLE" | "OCCUPIED";
};

type AddEditPalletProps = {
  defaultValues?: Partial<PalletFormValues> & {
    id?: string | number;
    zone_id?: string | number;
    rack_id?: string | number;
    warehouse_id?: string | number;
    pallet_code?: string;
    pallet_name?: string;
    palletName?: string;
    name?: string;
    max_capacity?: number;
    capacity?: number | string;
  };
  onSubmitPallet?: (payload: PalletSubmitPayload) => void | Promise<void>;
  onDeletePallet?: (id: string | number) => Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type AddEditPalletRef = {
  submit: () => Promise<void>;
};

function Index({
  defaultValues,
  onSubmitPallet,
  onDeletePallet,
  setDisplayTitle,
  setDataChanged,
  setHideFooter,
  setWidth,
}: AddEditPalletProps, ref: Ref<AddEditPalletRef>) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const isEditMode = Boolean(defaultValues?.id);
  const { data: zonesData } = useListZonesQuery();
  const { data: racksData } = useListRacksQuery();
  const initialZoneId = String(defaultValues?.zone_id || "");
  const initialRackId = String(defaultValues?.rack_id || "");
  const initialPalletCode =
    defaultValues?.pallet_code ||
    defaultValues?.pallet_name ||
    defaultValues?.palletName ||
    defaultValues?.name ||
    "";

  const zones = useMemo(() => extractApiRows(zonesData), [zonesData]);
  const racks = useMemo(() => extractApiRows(racksData), [racksData]);
  const initialZone = useMemo(
    () => zones.find((zone: any) => String(zone.id) === initialZoneId),
    [initialZoneId, zones]
  );
  const initialRack = useMemo(
    () => racks.find((rack: any) => String(rack.id) === initialRackId),
    [initialRackId, racks]
  );
  const initialZoneCode = useMemo(
    () =>
      normalizeCodeValue(
        initialZone?.zone_code ||
        initialZone?.code ||
        buildZoneCode(undefined, initialZone?.zone_title || initialZone?.name || initialZone?.zone_code)
      ),
    [initialZone]
  );
  const initialRackCode = useMemo(
    () =>
      normalizeCodeValue(
        initialRack?.rack_code ||
        initialRack?.code ||
        buildRackCode(
          initialZoneCode,
          initialRack?.rack_description || initialRack?.name || initialRack?.rack_code
        )
      ),
    [initialRack, initialZoneCode]
  );
  const initialGeneratedPalletCode = useMemo(
    () => buildPalletCode(initialRackCode),
    [initialRackCode]
  );
  const palletCodeManuallyEditedRef = useRef(
    Boolean(
      initialPalletCode &&
      normalizeCodeValue(initialPalletCode) !== normalizeCodeValue(initialGeneratedPalletCode)
    )
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PalletFormValues>({
    defaultValues: {
      zone_id: String(defaultValues?.zone_id || ""),
      rack_id: String(defaultValues?.rack_id || ""),
      pallet_code:
        defaultValues?.pallet_code ||
        defaultValues?.pallet_name ||
        defaultValues?.palletName ||
        defaultValues?.name ||
        "",
      max_capacity: defaultValues?.max_capacity ?? defaultValues?.capacity ?? "",
      status: defaultValues?.status || "AVAILABLE",
    },
    mode: "onBlur",
  });

  const selectedZoneId = watch("zone_id");
  const selectedRackId = watch("rack_id");
  const palletCode = watch("pallet_code");

  const zoneOptions = useMemo(
    () =>
      zones.map((zone: any) => ({
        value: String(zone.id),
        label: zone.zone_code || zone.zone_title || `Zone ${zone.id}`,
      })),
    [zones]
  );

  const rackOptions = useMemo(
    () =>
      racks
        .filter(
          (rack: any) =>
            !selectedZoneId || String(rack.zone_id) === String(selectedZoneId)
        )
        .map((rack: any) => ({
          value: String(rack.id),
          label: rack.rack_code || rack.name || `Rack ${rack.id}`,
        })),
    [racks, selectedZoneId]
  );

  const selectedZone = useMemo(
    () => zones.find((zone: any) => String(zone.id) === String(selectedZoneId)),
    [selectedZoneId, zones]
  );
  const selectedRack = useMemo(
    () => racks.find((rack: any) => String(rack.id) === String(selectedRackId)),
    [racks, selectedRackId]
  );
  const selectedZoneCode = useMemo(
    () =>
      normalizeCodeValue(
        selectedZone?.zone_code ||
        selectedZone?.code ||
        buildZoneCode(undefined, selectedZone?.zone_title || selectedZone?.name || selectedZone?.zone_code)
      ),
    [selectedZone]
  );
  const selectedRackCode = useMemo(
    () =>
      normalizeCodeValue(
        selectedRack?.rack_code ||
        selectedRack?.code ||
        buildRackCode(
          selectedZoneCode,
          selectedRack?.rack_description || selectedRack?.name || selectedRack?.rack_code
        )
      ),
    [selectedRack, selectedZoneCode]
  );
  const generatedPalletCode = useMemo(
    () => buildPalletCode(selectedRackCode),
    [selectedRackCode]
  );

  useEffect(() => {
    setDisplayTitle?.(isEditMode ? "Edit Pallet" : "Add Pallet");
    setHideFooter?.(false);
    setWidth?.(520);
  }, [isEditMode, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  useEffect(() => {
    if (!selectedRackId) {
      return;
    }

    const rackStillValid = racks.some(
      (rack: any) =>
        String(rack.id) === String(selectedRackId) &&
        (!selectedZoneId || String(rack.zone_id) === String(selectedZoneId))
    );

    if (!rackStillValid) {
      setValue("rack_id", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [racks, selectedRackId, selectedZoneId, setValue]);

  useEffect(() => {
    if (palletCodeManuallyEditedRef.current) {
      return;
    }

    if (normalizeCodeValue(palletCode) === normalizeCodeValue(generatedPalletCode)) {
      return;
    }

    setValue("pallet_code", generatedPalletCode, {
      shouldDirty:
        normalizeCodeValue(generatedPalletCode) !== normalizeCodeValue(initialPalletCode),
      shouldValidate: true,
    });
  }, [generatedPalletCode, initialPalletCode, palletCode, setValue]);

  const onSubmit = useCallback(async (data: PalletFormValues) => {
    const selectedZone = zones.find((zone: any) => String(zone.id) === data.zone_id);
    const selectedRack = racks.find((rack: any) => String(rack.id) === data.rack_id);

    const payload: PalletSubmitPayload = {
      ...(defaultValues?.id ? { id: defaultValues.id } : {}),
      warehouse_id: Number(
        defaultValues?.warehouse_id ||
        selectedZone?.warehouse_id ||
        selectedRack?.warehouse_id
      ),
      zone_id: Number(data.zone_id),
      rack_id: Number(data.rack_id),
      pallet_code: data.pallet_code.trim(),
      max_capacity: Number(data.max_capacity),
      status: data.status,
    };

    if (onSubmitPallet) {
      await onSubmitPallet(payload);
    }

    showToast(
      isEditMode ? "Pallet updated successfully" : "Pallet created successfully",
      "success"
    );
    setDataChanged?.(false);
    closeModal();
  }, [closeModal, defaultValues?.id, defaultValues?.warehouse_id, isEditMode, onSubmitPallet, racks, setDataChanged, showToast, zones]);

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
          title="Pallet Details"
         
        >
          <FormStackGrid columns={1}>
            <MuiSelect
              id="zone_id"
              label="Zone"
              placeholder="Select zone"
              displayEmpty
              defaultValue={String(defaultValues?.zone_id || "")}
              options={zoneOptions}
              {...register("zone_id", {
                required: "Zone is required",
                onChange: (event) => {
                  const nextZoneId = String(event.target.value || "");
                  const activeRack = racks.find(
                    (rack: any) => String(rack.id) === String(selectedRackId)
                  );

                  if (
                    activeRack &&
                    String(activeRack.zone_id) !== nextZoneId
                  ) {
                    setValue("rack_id", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                },
              })}
              error={!!errors.zone_id}
              helperText={errors.zone_id?.message}
            />
            <MuiSelect
              id="rack_id"
              label="Rack"
              placeholder="Select rack"
              displayEmpty
              defaultValue={String(defaultValues?.rack_id || "")}
              options={rackOptions}
              {...register("rack_id", { required: "Rack is required" })}
              error={!!errors.rack_id}
              helperText={errors.rack_id?.message}
            />
            <MuiTextField
              id="pallet_code"
              label="Pallet Code"
              placeholder="RACK-A-PALLET"
              {...register("pallet_code", {
                required: "Pallet code is required",
                onChange: (event) => {
                  palletCodeManuallyEditedRef.current =
                    normalizeCodeValue(event.target.value) !== normalizeCodeValue(generatedPalletCode);
                },
              })}
              error={!!errors.pallet_code}
              helperText={errors.pallet_code?.message}
            />
            <MuiTextField
              id="max_capacity"
              type="number"
              label="Max Capacity"
              placeholder="500"
              {...register("max_capacity", {
                required: "Capacity is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1" },
              })}
              error={!!errors.max_capacity}
              helperText={errors.max_capacity?.message}
              inputProps={{ min: 1 }}
            />
            <Box sx={{ minWidth: 0 }}>
              
              <input
                type="hidden"
                {...register("status", { required: "Status is required" })}
              />
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <RadioGroup
                    row
                    {...field}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "nowrap",
                      px: 1,
                      py: 0.25,
                      border: "1px solid rgba(15,23,42,0.12)",
                      borderRadius: 1.5,
                      backgroundColor: "rgba(248,250,252,0.9)",
                      gap: 1.5,
                    }}
                  >
                    <FormControlLabel
                      value="AVAILABLE"
                      control={<Radio color="success" />}
                      label="Available"
                      sx={{
                        m: 0,
                        whiteSpace: "nowrap",
                        "& .MuiFormControlLabel-label": {
                          fontWeight: 700,
                          color: "text.primary",
                        },
                      }}
                    />
                    <FormControlLabel
                      value="OCCUPIED"
                      control={<Radio color="warning" />}
                      label="Occupied"
                      sx={{
                        m: 0,
                        whiteSpace: "nowrap",
                        "& .MuiFormControlLabel-label": {
                          fontWeight: 700,
                          color: "text.primary",
                        },
                      }}
                    />
                  </RadioGroup>
                )}
              />
              {errors.status ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.75, display: "block" }}>
                  {errors.status.message}
                </Typography>
              ) : null}
            </Box>
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
            entityLabel="Pallet"
            successMessage="Pallet deleted successfully"
            onDelete={async () => {
              if (!defaultValues?.id || !onDeletePallet) {
                return;
              }

              await onDeletePallet(defaultValues.id);
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

export const AddEditPallet = memo(forwardRef(Index));
