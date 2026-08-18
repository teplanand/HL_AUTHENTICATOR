import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { useForm } from "react-hook-form";
import { Box, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

import ConfirmDeleteButton from "../../../../shared/components/common/ConfirmDeleteButton";
import { MuiTextField } from "../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../shared/components/ui/form/stack";
import FormSection from "../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../shared/hooks/useModal";
import { useToast } from "../../../../shared/hooks/useToast";
import { buildWarehouseCode, normalizeCodeValue } from "../shared/codeGeneration";

type WarehouseFormValues = {
  warehouseCode: string;
  warehouseName: string;
  managerName: string;
  contact_no: string;
  email: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
};

export type WarehouseSubmitPayload = WarehouseFormValues & {
  id?: string | number;
};

type AddEditWarehouseProps = {
  defaultValues?: Partial<WarehouseFormValues> & {
    id?: string | number;
    name?: string;
    warehouse_name?: string;
    warehouse_code?: string;
    manager_name?: string;
    contactNumber?: string;
    contact_number?: string;
    contact_no?: string;
    email?: string;
    address?: string;
    notes?: string;
    status?: "ACTIVE" | "INACTIVE";
  };
  onSubmitWarehouse?: (
    payload: WarehouseSubmitPayload
  ) => void | Promise<void>;
  onDeleteWarehouse?: (id: string | number) => Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type AddEditWarehouseRef = {
  submit: () => Promise<void>;
};

function Index({
  defaultValues,
  onSubmitWarehouse,
  onDeleteWarehouse,
  setDisplayTitle,
  setDataChanged,
  setHideFooter,
  setWidth,
}: AddEditWarehouseProps, ref: Ref<AddEditWarehouseRef>) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const hasExistingWarehouse = Boolean(defaultValues?.id);
  const initialWarehouseName =
    defaultValues?.warehouseName ||
    (defaultValues as any)?.warehouse_name ||
    (defaultValues as any)?.name ||
    "";
  const initialWarehouseCode =
    defaultValues?.warehouseCode ||
    (defaultValues as any)?.warehouse_code ||
    "";
  const initialGeneratedWarehouseCode = useMemo(
    () => buildWarehouseCode(initialWarehouseName),
    [initialWarehouseName]
  );
  const warehouseCodeManuallyEditedRef = useRef(
    Boolean(
      initialWarehouseCode &&
      normalizeCodeValue(initialWarehouseCode) !== normalizeCodeValue(initialGeneratedWarehouseCode)
    )
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      warehouseCode:
        defaultValues?.warehouseCode ||
        (defaultValues as any)?.warehouse_code ||
        "",
      warehouseName:
        defaultValues?.warehouseName ||
        (defaultValues as any)?.warehouse_name ||
        (defaultValues as any)?.name ||
        "",
      managerName:
        defaultValues?.managerName ||
        (defaultValues as any)?.manager_name ||
        "",
      contact_no:
        defaultValues?.contact_no ||
        (defaultValues as any)?.contactNumber ||
        (defaultValues as any)?.contact_number ||
        (defaultValues as any)?.contact_no ||
        "",
      email:
        defaultValues?.email ||
        (defaultValues as any)?.email ||
        "",
      address:
        defaultValues?.address ||
        (defaultValues as any)?.address ||
        "",
      status: defaultValues?.status || "ACTIVE",
      notes:
        defaultValues?.notes ||
        (defaultValues as any)?.notes ||
        "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.(hasExistingWarehouse ? "Edit Warehouse" : "Add Warehouse");
    setHideFooter?.(false);
    setWidth?.(720);
  }, [hasExistingWarehouse, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const selectedStatus = watch("status");
  const warehouseName = watch("warehouseName");
  const warehouseCode = watch("warehouseCode");
  const generatedWarehouseCode = useMemo(
    () => buildWarehouseCode(warehouseName),
    [warehouseName]
  );

  useEffect(() => {
    if (warehouseCodeManuallyEditedRef.current) {
      return;
    }

    if (normalizeCodeValue(warehouseCode) === normalizeCodeValue(generatedWarehouseCode)) {
      return;
    }

    setValue("warehouseCode", generatedWarehouseCode, {
      shouldDirty:
        normalizeCodeValue(generatedWarehouseCode) !== normalizeCodeValue(initialWarehouseCode),
      shouldValidate: true,
    });
  }, [generatedWarehouseCode, initialWarehouseCode, setValue, warehouseCode]);

  const onSubmit = useCallback(async (data: WarehouseFormValues) => {
    const payload: WarehouseSubmitPayload = {
      ...(defaultValues?.id ? { id: defaultValues.id } : {}),
      ...data,
      warehouseCode: data.warehouseCode.trim(),
      warehouseName: data.warehouseName.trim(),
      managerName: data.managerName.trim(),
      contact_no: data.contact_no.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      notes: data.notes.trim(),
    };

    if (onSubmitWarehouse) {
      await onSubmitWarehouse(payload);
    } else {
      console.log("warehouse-payload", payload);
    }

    showToast(
      hasExistingWarehouse
        ? "Warehouse updated successfully"
        : "Warehouse created successfully",
      "success"
    );
    setDataChanged?.(false);
    closeModal();
  }, [closeModal, defaultValues?.id, hasExistingWarehouse, onSubmitWarehouse, setDataChanged, showToast]);

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
        {/* ══════════ Warehouse Identity ══════════ */}
        <FormSection
          title="Warehouse Identity"
         
        >
          <FormStackGrid columns={3}>
            <MuiTextField
              id="warehouseName"
              label="Warehouse Name"
              placeholder="Warehouse"
              {...register("warehouseName", {
                required: "Warehouse name is required",
              })}
              error={!!errors.warehouseName}
              helperText={errors.warehouseName?.message}
            />

            
            <MuiTextField
              id="warehouseCode"
              label="Warehouse Code"
              placeholder="WH-001"
              {...register("warehouseCode", {
                required: "Warehouse code is required",
                onChange: (event) => {
                  warehouseCodeManuallyEditedRef.current =
                    normalizeCodeValue(event.target.value) !==
                    normalizeCodeValue(generatedWarehouseCode);
                },
              })}
              error={!!errors.warehouseCode}
              helperText={errors.warehouseCode?.message}
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

        {/* ══════════ Contact Information ══════════ */}
        <FormSection
          title="Contact Information"
          
          accentColor="#1D4ED8"
        >
          <FormStackGrid columns={3}>
            <MuiTextField
              id="managerName"
              label="Manager Name"
              placeholder="Enter manager name"
              {...register("managerName", {
                required: "Manager name is required",
              })}
              error={!!errors.managerName}
              helperText={errors.managerName?.message}
            />
            <MuiTextField
              id="contact_no"
              type="tel"
              label="Contact Number"
              placeholder="9876543210"
              {...register("contact_no", {
                required: "Contact number is required",
                pattern: {
                  value: /^[0-9+\-\s]{8,15}$/,
                  message: "Enter a valid contact number",
                },
              })}
              error={!!errors.contact_no}
              helperText={errors.contact_no?.message}
            />
            <MuiTextField
              id="email"
              type="email"
              label="Email"
              placeholder="warehouse@company.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </FormStackGrid>
        </FormSection>

        {/* ══════════ Location & Notes ══════════ */}
        <FormSection
          title="Location & Notes"
          
          accentColor="#059669"
        >
          <FormStackGrid columns={2}>
            <MuiTextField
              id="address"
              label="Address"
              multiline
              minRows={3}
              placeholder="Enter complete warehouse address"
              {...register("address", {
                required: "Address is required",
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
              fullWidth
            />
            <MuiTextField
              id="notes"
              label="Notes"
              multiline
              minRows={3}
              placeholder="Optional notes for handling, timing, access rules, etc."
              {...register("notes")}
              fullWidth
            />
          </FormStackGrid>
        </FormSection>
      </Stack>

      {hasExistingWarehouse ? (
        <Box
          sx={{
            mt: 3,
            textAlign: "right",
          }}
        >
          <ConfirmDeleteButton
            entityLabel="Warehouse"
            successMessage="Warehouse deleted successfully"
            onDelete={async () => {
              if (!defaultValues?.id || !onDeleteWarehouse) {
                return;
              }

              await onDeleteWarehouse(defaultValues.id);
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

export const AddEditWarehouse = memo(forwardRef(Index));
