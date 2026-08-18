import { forwardRef, memo, useCallback, useEffect, useImperativeHandle } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { Stack } from "@mui/material";

import { MuiDatePicker, MuiTextField } from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";
import { useUpdateOrderMutation } from "../../api/ordertracking";
 
type PlanDateFormValues = {
  planDate: Dayjs | null;
  actualDate: Dayjs | null;
  notes: string;
};

type AddEditPlandateProps = {
  rowData?: Record<string, any>;
  field?: string;
  defaultValues?: Partial<{
    planDate: string | Date | Dayjs | null;
    actualDate: string | Date | Dayjs | null;
    notes: string;
  }>;
  onSubmitSection?: (
    payload: {
      planDate: string | null;
      actualDate: string | null;
      notes: string;
    }
  ) => void | Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
  onSuccess?: () => void | Promise<void>;
};

export type AddEditPlandateRef = {
  submit: () => Promise<void>;
};

const toDayjsValue = (value: string | Date | Dayjs | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

function Index(
  {
    rowData,
    field,
    defaultValues,
    onSubmitSection,
    setDisplayTitle,
    setDataChanged,
    setHideFooter,
    setWidth,
    onSuccess,
  }: AddEditPlandateProps,
  ref: React.Ref<AddEditPlandateRef>
) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const [updateOrder] = useUpdateOrderMutation();

  const resolveFields = useCallback(() => {
    if (!field) {
      return { planField: "", actualField: "" };
    }

    if (field.endsWith("_actual")) {
      return {
        planField: field.replace("_actual", "_plan"),
        actualField: field,
      };
    }

    if (field.endsWith("_plan")) {
      return {
        planField: field,
        actualField: field.replace("_plan", "_actual"),
      };
    }

    return { planField: field, actualField: field };
  }, [field]);

  const { planField, actualField } = resolveFields();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PlanDateFormValues>({
    defaultValues: {
      planDate: toDayjsValue(defaultValues?.planDate),
      actualDate: toDayjsValue(defaultValues?.actualDate),
      notes: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    reset({
      planDate: toDayjsValue((planField && rowData?.[planField]) ?? defaultValues?.planDate),
      actualDate: toDayjsValue((actualField && rowData?.[actualField]) ?? defaultValues?.actualDate),
      notes: "",
    });
  }, [actualField, defaultValues?.actualDate, defaultValues?.notes, defaultValues?.planDate, planField, reset, rowData]);

  useEffect(() => {
    setDisplayTitle?.("Update Plan Dates");
    setHideFooter?.(false);
    setWidth?.("300px");
  }, [setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const onSubmit = useCallback(async (data: PlanDateFormValues) => {
    const payload = {
      planDate: data.planDate ? data.planDate.format("YYYY-MM-DD") : null,
      actualDate: data.actualDate ? data.actualDate.format("YYYY-MM-DD") : null,
      notes: "",
    };

    if (rowData?.id) {
      await updateOrder({
        ...rowData,
        ...(planField ? { [planField]: payload.planDate ? `${payload.planDate}T00:00:00` : null } : {}),
        ...(actualField ? { [actualField]: payload.actualDate ? `${payload.actualDate}T00:00:00` : null } : {}),
        remarks: "",
        id: rowData.id,
      }).unwrap();
    } else if (onSubmitSection) {
      await onSubmitSection(payload);
    } else {
      console.log("plan-date-payload", payload);
    }

    showToast("Plan dates updated successfully", "success");
    setDataChanged?.(false);
    if (onSuccess) {
      await onSuccess();
    } else {
      closeModal();
    }
  }, [actualField, closeModal, onSubmitSection, onSuccess, planField, rowData, setDataChanged, showToast, updateOrder]);

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
          title=""
          
          accentColor="#1D4ED8"
        >
          <FormStackGrid columns={1}>
            <Controller
              name="planDate"
              control={control}
              rules={{
                validate: (value) => (value ? true : "Plan date is required"),
              }}
              render={({ field }) => (
                <MuiDatePicker
                  label="Plan Date"
                  value={field.value}
                  readOnly={true}
                  onChange={field.onChange}
                  onClose={field.onBlur}
                  error={!!errors.planDate}
                  helperText={errors.planDate?.message}
                  required
                />
              )}
            />

            <Controller
              name="actualDate"
              control={control}
              rules={{
                validate: (value) => (value ? true : "Actual date is required"),
              }}
              render={({ field }) => (
                <MuiDatePicker
                  label="Actual Date"
                  value={field.value}
                  readOnly={true}
                  onChange={field.onChange}
                  onClose={field.onBlur}
                  error={!!errors.actualDate}
                  helperText={errors.actualDate?.message}
                  required
                />
              )}
            />

            <MuiTextField
              id="notes"
              label="Notes (Optional)"
              multiline
              minRows={4}
              placeholder="Optional notes for handling, timing, access rules, etc."
              {...register("notes")}
              fullWidth
            />
          </FormStackGrid>
        </FormSection>
      </Stack>
    </form>
  );
}

export const AddEditPlandate = memo(forwardRef(Index));
