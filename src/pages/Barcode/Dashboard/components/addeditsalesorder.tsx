import { memo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@mui/material";

import { MuiDatePicker, MuiTextField } from "../../../../../shared/components/mui/input";

import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";

type PlanDateFormValues = {
  planDate: Dayjs | null;
  actualDate: Dayjs | null;
  notes: string;
};

type AddEditPlandateProps = {
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
};

const toDayjsValue = (value: string | Date | Dayjs | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

function Index({
  defaultValues,
  onSubmitSection,
  setDisplayTitle,
  setDataChanged,
  setHideFooter,
  setWidth,
}: AddEditPlandateProps) {
  const { closeModal } = useModal();
  const { showToast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PlanDateFormValues>({
    defaultValues: {
      planDate: toDayjsValue(defaultValues?.planDate),
      actualDate: toDayjsValue(defaultValues?.actualDate),
      notes: defaultValues?.notes || "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setDisplayTitle?.("Update Plan Dates");
    setHideFooter?.(true);
    setWidth?.("300px");
  }, [setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const onSubmit = async (data: PlanDateFormValues) => {
    const payload = {
      planDate: data.planDate ? data.planDate.format("YYYY-MM-DD") : null,
      actualDate: data.actualDate ? data.actualDate.format("YYYY-MM-DD") : null,
      notes: data.notes.trim(),
    };

    if (onSubmitSection) {
      await onSubmitSection(payload);
    } else {
      console.log("plan-date-payload", payload);
    }

    showToast("Plan dates ready for posting", "success");
    setDataChanged?.(false);
    closeModal();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column",  }}
    >
      <div
        style={{
          display: "grid",
           
          gap: 16,
        }}
      >
        <div>
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
                onChange={field.onChange}
                onClose={field.onBlur}
                error={!!errors.planDate}
                helperText={errors.planDate?.message}
                required
              />
            )}
          />
        </div>

        <div>
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
                onChange={field.onChange}
                onClose={field.onBlur}
                error={!!errors.actualDate}
                helperText={errors.actualDate?.message}
                required
              />
            )}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <MuiTextField
            id="notes"
            label="Notes"
            multiline
            minRows={4}
            placeholder="Optional notes for handling, timing, access rules, etc."
            {...register("notes")}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
             
            flexWrap: "wrap",
          }}
        >
          
          
        </div>
      </div>
    </form>
  );
}

export const AddEditPlandate = memo(Index);
