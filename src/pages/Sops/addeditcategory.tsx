import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, type Ref } from "react";
import { useForm } from "react-hook-form";
import { Box, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

import ConfirmDeleteButton from "../../../shared/components/common/ConfirmDeleteButton";
import { MuiTextField } from "../../../shared/components/mui/input";
import { FormStackGrid } from "../../../shared/components/ui/form/stack";
import FormSection from "../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../shared/hooks/useModal";
import { useToast } from "../../../shared/hooks/useToast";

type CategoryFormValues = {
  name: string;
  code: string;
  status: "Active" | "Draft";
  contentHeaders: string;
  notes: string;
};

type CategoryDefaultValues = Omit<CategoryFormValues, "contentHeaders"> & {
  contentHeaders: string[];
};

export type CategorySubmitPayload = Omit<CategoryFormValues, "contentHeaders"> & {
  contentHeaders: string[];
  id?: string;
};

type AddEditCategoryProps = {
  defaultValues?: Partial<CategoryDefaultValues> & {
    id?: string;
  };
  onSubmitCategory?: (payload: CategorySubmitPayload) => boolean | Promise<boolean>;
  onDeleteCategory?: (id: string) => Promise<void> | void;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type AddEditCategoryRef = {
  submit: () => Promise<void>;
};

function Index(
  {
    defaultValues,
    onSubmitCategory,
    onDeleteCategory,
    setDisplayTitle,
    setDataChanged,
    setHideFooter,
    setWidth,
  }: AddEditCategoryProps,
  ref: Ref<AddEditCategoryRef>,
) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const isEditMode = Boolean(defaultValues?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      status: defaultValues?.status || "Active",
      contentHeaders: defaultValues?.contentHeaders?.join("\n") || "",
      notes: defaultValues?.notes || "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.(isEditMode ? "Edit Category" : "Add Category");
    setHideFooter?.(false);
    setWidth?.(560);
  }, [isEditMode, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const selectedStatus = watch("status");

  const onSubmit = useCallback(
    async (data: CategoryFormValues) => {
      const payload: CategorySubmitPayload = {
        ...(defaultValues?.id ? { id: defaultValues.id } : {}),
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        status: data.status,
        contentHeaders: data.contentHeaders
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        notes: data.notes.trim(),
      };

      const success = onSubmitCategory ? await onSubmitCategory(payload) : true;

      if (!success) {
        return;
      }

      showToast(
        isEditMode ? "Category updated successfully" : "Category created successfully",
        "success",
      );
      setDataChanged?.(false);
      closeModal();
    },
    [closeModal, defaultValues?.id, isEditMode, onSubmitCategory, setDataChanged, showToast],
  );

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        await handleSubmit(onSubmit)();
      },
    }),
    [handleSubmit, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <FormSection title="Category Details">
          <FormStackGrid columns={1}>
            <MuiTextField
              id="name"
              label="Category Name"
              placeholder="Process Instructions"
              {...register("name", {
                required: "Category name is required",
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <MuiTextField
              id="code"
              label="Category Code"
              placeholder="PROC-INSTR"
              {...register("code", {
                required: "Category code is required",
                onChange: (event) => {
                  const normalized = String(event.target.value || "").toUpperCase();
                  if (normalized !== event.target.value) {
                    setValue("code", normalized, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                },
              })}
              error={!!errors.code}
              helperText={errors.code?.message}
            />
            <Box sx={{ minWidth: 0 }}>
              <input type="hidden" {...register("status", { required: "Status is required" })} />
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
                    selectedStatus === "Active"
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(245,158,11,0.10)",
                  "& .MuiFormControlLabel-label": {
                    fontWeight: 700,
                    color: "text.primary",
                  },
                }}
                control={
                  <Switch
                    checked={selectedStatus === "Active"}
                    onChange={(event) => {
                      setValue("status", event.target.checked ? "Active" : "Draft", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    color="success"
                  />
                }
                label={selectedStatus === "Active" ? "Active" : "Draft"}
                labelPlacement="start"
              />
              {errors.status ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.75, display: "block" }}>
                  {errors.status.message}
                </Typography>
              ) : null}
            </Box>
            <MuiTextField
              id="contentHeaders"
              label="Content Headers"
              placeholder={"Header 1\nHeader 2\nHeader 3"}
              multiline
              minRows={6}
              {...register("contentHeaders")}
              helperText="Paste or type one header per line."
            />
          </FormStackGrid>
        </FormSection>

        <FormSection title="Notes" accentColor="#1D4ED8">
          <FormStackGrid columns={1}>
            <MuiTextField
              id="notes"
              label="Notes"
              placeholder="Optional notes"
              multiline
              minRows={4}
              {...register("notes")}
            />
          </FormStackGrid>
        </FormSection>
      </Stack>

      {isEditMode ? (
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <ConfirmDeleteButton
            entityLabel="Category"
            successMessage="Category deleted successfully"
            onDelete={async () => {
              if (!defaultValues?.id || !onDeleteCategory) {
                return;
              }

              await onDeleteCategory(defaultValues.id);
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

export const AddEditCategory = memo(forwardRef(Index));
