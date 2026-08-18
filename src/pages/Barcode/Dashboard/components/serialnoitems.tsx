import { memo, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import { MuiAutocomplete, MuiTextField } from "../../../../../shared/components/mui/input";
import { useForm } from "../../../../../shared/hooks/useForm";

type ItemOption = {
  value: string;
  label: string;
};

type ItemPlanFormValues = {
  itemCode: string;
  planPercentage: string;
  notes: string;
};

const itemOptions: ItemOption[] = [
  { value: "ED-17400", label: "ED-17400 - Geared Coupling Multi Crowned" },
  { value: "CDF-FCFB-7", label: "CDF/FCFB-7 - Flexible Coupling Spare Set" },
  { value: "CDF-FCFB-13", label: "CDF/FCFB-13 - Flexible Coupling Spare Set" },
  { value: "EFC-06", label: "EFC-06 - Flexible Coupling Assembly" },
  { value: "ED-4500", label: "ED-4500 - Spare Kit with Nut and Washer" },
  { value: "ES-29000", label: "ES-29000 - Spare Kit for Dispatch Batch" },
];

const initialValues: ItemPlanFormValues = {
  itemCode: "",
  planPercentage: "",
  notes: "",
};

function Index() {
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    handleSubmit,
    register,
    resetForm,
  } = useForm(initialValues);

  const selectedItem = useMemo(
    () => itemOptions.find((item) => item.value === values.itemCode) || null,
    [values.itemCode]
  );

  const itemFieldProps = register("itemCode", {
    validate: (value) =>
      !value ? "Please select an item from the list." : null,
  });

  const planFieldProps = register("planPercentage", {
    required: "Plan percentage is required.",
    validate: (value) => {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        return "Plan percentage must be a number.";
      }

      if (numericValue < 0 || numericValue > 100) {
        return "Plan percentage must be between 0 and 100.";
      }

      return null;
    },
  });

  const notesFieldProps = register("notes", {
    maxLength: {
      value: 500,
      message: "Notes cannot exceed 500 characters.",
    },
  });

  const submitForm = handleSubmit(async (formValues) => {
    console.log("add-item-plan-payload", formValues);
    setMessage({
      type: "success",
      text: "Item plan data is ready. Payload logged in console.",
    });
  });

  const validateForm = () => {
    const isValid = validateAll();
    setMessage({
      type: isValid ? "success" : "error",
      text: isValid
        ? "Validation passed."
        : "Validation failed. Please review the fields below.",
    });
  };

  return (
    <Box className="max-w-3xl mx-auto p-6">
      <Stack spacing={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Plan Update By Item
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Select an item from the dummy list below and capture plan percentage
            with notes.
          </Typography>
        </Box>

        {message ? <Alert severity={message.type}>{message.text}</Alert> : null}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={submitForm}>
            <Stack spacing={1}>
              <MuiAutocomplete
                label="Item"
                placeholder="Search item code or item name"
                options={itemOptions}
                value={selectedItem}
                onChange={(_, value) => handleChange("itemCode", value?.value || "")}
                onBlur={() => handleBlur("itemCode")}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                getOptionLabel={(option) => option.label}
                error={!!errors.itemCode}
                helperText={itemFieldProps.helperText}
                required
              />

              {selectedItem ? (
                <Alert severity="info">
                  Selected Item: {selectedItem.label}
                </Alert>
              ) : null}

              <MuiTextField
                label="Plan Percentage"
                type="number"
                placeholder="Enter plan percentage"
                {...planFieldProps}
                inputProps={{ min: 0, max: 100 }}
              />

              <MuiTextField
                id="notes"
                label="Notes"
                multiline
                minRows={4}
                placeholder="Optional notes for item planning, constraints, remarks, etc."
                {...notesFieldProps}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    resetForm();
                    setMessage(null);
                  }}
                >
                  Reset
                </Button>

                <Button type="submit" variant="contained">
                  Save Item Plan
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  );
}

export const AddItemPlan = memo(Index);
