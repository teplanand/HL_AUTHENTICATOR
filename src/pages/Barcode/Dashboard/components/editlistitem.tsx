import { forwardRef, memo, useEffect, useImperativeHandle, type Ref } from "react";
import { Stack } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { MuiCheckbox, MuiSelect, MuiTextField } from "../../../../../shared/components/mui/input";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";

type EditLineItemFormValues = {
  roadPermit: boolean;
  deliveryMonth: string;
  status: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type EditListItemProps = {
  defaultValues?: Partial<EditLineItemFormValues>;
  statusOptions?: SelectOption[];
  onSubmitSection?: (payload: EditLineItemFormValues) => void | Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type EditListItemRef = {
  submit: () => Promise<void>;
};

function Index(
  {
    defaultValues,
    statusOptions = [],
    onSubmitSection,
    setDisplayTitle,
    setDataChanged,
    setHideFooter,
    setWidth,
  }: EditListItemProps,
  ref: Ref<EditListItemRef>
) {
  const { closeModal } = useModal();
  const { showToast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditLineItemFormValues>({
    defaultValues: {
      roadPermit: Boolean(defaultValues?.roadPermit),
      deliveryMonth: defaultValues?.deliveryMonth || "",
      status: defaultValues?.status || "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.("Edit Line Item");
    setHideFooter?.(false);
    setWidth?.(520);
  }, [setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const onSubmit = async (data: EditLineItemFormValues) => {
    const payload = {
      roadPermit: data.roadPermit,
      deliveryMonth: data.deliveryMonth.trim(),
      status: data.status,
    };

    if (onSubmitSection) {
      await onSubmitSection(payload);
    } else {
      console.log("edit-line-item-payload", payload);
    }

    showToast("Line item updated successfully", "success");
    setDataChanged?.(false);
    closeModal();
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        await handleSubmit(onSubmit)();
      },
    }),
    [handleSubmit]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          name="roadPermit"
          control={control}
          render={({ field }) => (
            <MuiCheckbox
              label="Road Permit Required"
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />
        <MuiTextField
          label="Del Month"
          placeholder="2603"
          {...register("deliveryMonth")}
          error={!!errors.deliveryMonth}
          helperText={errors.deliveryMonth?.message}
        />
        <MuiSelect
          label="Status"
          placeholder="Select status"
          displayEmpty
          defaultValue={defaultValues?.status || ""}
          options={statusOptions}
          {...register("status", {
            required: "Status is required",
          })}
          error={!!errors.status}
          helperText={errors.status?.message}
        />
      </Stack>
    </form>
  );
}

export const EditListItem = memo(forwardRef(Index));
