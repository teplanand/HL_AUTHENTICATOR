import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState, type Ref } from "react";
import dayjs from "dayjs";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import { MuiDatePicker, MuiTextField } from "../../../../../shared/components/mui/input";
import { useForm } from "../../../../../shared/hooks/useForm";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";
import {
  SysConfigurationRecord,
  useGetSysConfigurationByIdMutation,
  useUpdateSysConfigurationsMutation,
} from "../../api/ordertracking";

type ItemPlanFormValues = {
  config_title: string;
  config_description: string;
  config_value: string;
  division: string;
  start_date: string;
  end_date: string;
};

type AddItemPlanProps = {
  rowData?: Record<string, unknown>;
  onSaved?: () => void | Promise<void>;
  setDisplayTitle?: (title: string) => void;
  setWidth?: (width: number | string) => void;
  setHideFooter?: (hidden: boolean) => void;
};

export type AddItemPlanRef = {
  submit: () => Promise<void>;
};

const initialValues: ItemPlanFormValues = {
  config_title: "",
  config_description: "",
  config_value: "",
  division: "",
  start_date: "",
  end_date: "",
};

const normalizeDateInput = (value: unknown) => {
  if (!value) {
    return "";
  }

  const normalized = String(value);
  if (normalized.startsWith("0001-01-01")) {
    return "";
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const toApiDateTime = (value: string) => (value ? `${value}T00:00:00` : null);

const extractConfiguration = (payload?: {
  data?: SysConfigurationRecord[] | SysConfigurationRecord | null;
}) => {
  if (!payload?.data) {
    return null;
  }

  if (Array.isArray(payload.data)) {
    return payload.data[0] ?? null;
  }

  return payload.data;
};

function Index({
  rowData,
  onSaved,
  setDisplayTitle,
  setWidth,
  setHideFooter,
}: AddItemPlanProps,
ref: Ref<AddItemPlanRef>) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const [message, setMessage] = useState<{
    type: "error" | "info";
    text: string;
  } | null>(null);
  const [configuration, setConfiguration] = useState<SysConfigurationRecord | null>(null);

  const configurationId = useMemo(() => {
    const rawId = rowData?.id;
    if (typeof rawId === "number") {
      return rawId;
    }

    if (typeof rawId === "string" && rawId.trim()) {
      const parsed = Number(rawId);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }, [rowData?.id]);

  const [getSysConfigurationById, { isLoading: isFetchingConfiguration }] =
    useGetSysConfigurationByIdMutation();
  const [updateSysConfigurations, { isLoading: isUpdatingConfiguration }] =
    useUpdateSysConfigurationsMutation();

  const {
    values,
    handleSubmit,
    handleBlur,
    register,
    setValues,
    setErrors,
  } = useForm(initialValues);

  useEffect(() => {
    setDisplayTitle?.(String(rowData?.config_title || "Update Configuration"));
    setWidth?.("540px");
    setHideFooter?.(false);
  }, [rowData?.config_title, setDisplayTitle, setHideFooter, setWidth]);

  const applyConfiguration = useCallback(
    (record: SysConfigurationRecord | null) => {
      setConfiguration(record);
      setValues({
        config_title: String(record?.config_title ?? ""),
        config_description: String(record?.config_description ?? ""),
        config_value: String(record?.config_value ?? ""),
        division: String(record?.division ?? ""),
        start_date: normalizeDateInput(record?.start_date),
        end_date: normalizeDateInput(record?.end_date),
      });
      setErrors({});
    },
    [setErrors, setValues]
  );

  useEffect(() => {
    let isMounted = true;

    const loadConfiguration = async () => {
      if (!configurationId) {
        applyConfiguration(null);
        setMessage({
          type: "error",
          text: "Configuration id is missing for this record.",
        });
        return;
      }

      try {
        setMessage(null);
        const response = await getSysConfigurationById(configurationId).unwrap();
        const record = extractConfiguration(response);

        if (!isMounted) {
          return;
        }

        if (!record) {
          applyConfiguration(null);
          setMessage({
            type: "error",
            text: "No configuration details found for the selected record.",
          });
          return;
        }

        applyConfiguration(record);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        applyConfiguration(null);
        setMessage({
          type: "error",
          text: "Failed to load configuration details.",
        });
      }
    };

    loadConfiguration();

    return () => {
      isMounted = false;
    };
  }, [applyConfiguration, configurationId, getSysConfigurationById]);

  const submitForm = handleSubmit(async (formValues) => {
    if (!configuration) {
      setMessage({
        type: "error",
        text: "Configuration details are not available yet.",
      });
      return;
    }

    const payload: SysConfigurationRecord = {
      ...configuration,
      config_title: formValues.config_title.trim(),
      config_description: formValues.config_description.trim(),
      config_value: formValues.config_value.trim(),
      division: formValues.division.trim(),
      start_date: toApiDateTime(formValues.start_date),
      end_date: toApiDateTime(formValues.end_date),
    };

    await updateSysConfigurations(payload).unwrap();
    showToast("Configuration updated successfully", "success");
    await onSaved?.();
    closeModal();
  });

  const titleFieldProps = register("config_title", {
    required: "Config title is required.",
  });

  const descriptionFieldProps = register("config_description", {
    required: "Config description is required.",
  });

  const valueFieldProps = register("config_value", {
    required: "Config value is required.",
  });

  const divisionFieldProps = register("division", {
    required: "Division is required.",
  });

  const startDateFieldProps = register("start_date", {
    required: "Start date is required.",
  });

  const endDateFieldProps = register("end_date");

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        await submitForm({ preventDefault: () => undefined });
      },
    }),
    [submitForm]
  );

  return (
    <Box>
      <Stack spacing={1.5}>
        {message?.type === "error" || message?.type === "info" ? (
          <Alert severity={message.type}>{message.text}</Alert>
        ) : null}

        <FormSection
          title="Configuration Details"
          description="Update configuration values for the selected plan."
          icon={<SettingsOutlinedIcon fontSize="small" />}
          accentColor="#1D4ED8"
        >
          {isFetchingConfiguration ? (
            <Box className="flex min-h-[240px] items-center justify-center">
              <CircularProgress size={28} />
            </Box>
          ) : (
            <form onSubmit={submitForm}>
              <Stack spacing={2}>
                <MuiTextField
                  label="Config Title"
                  placeholder="Enter config title"
                  {...titleFieldProps}
                />

                <MuiTextField
                  label="Config Description"
                  placeholder="Enter config description"
                  {...descriptionFieldProps}
                />

                <MuiTextField
                  label="Config Value"
                  placeholder="Enter config value"
                  {...valueFieldProps}
                />

                <MuiTextField
                  label="Division"
                  placeholder="Enter division"
                  {...divisionFieldProps}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <MuiDatePicker
                    label="Start Date"
                    value={values.start_date ? dayjs(values.start_date) : null}
                    onChange={(value) =>
                      setValues((prev) => ({
                        ...prev,
                        start_date: value && dayjs(value).isValid()
                          ? dayjs(value).format("YYYY-MM-DD")
                          : "",
                      }))
                    }
                    onClose={() => handleBlur("start_date")}
                    error={startDateFieldProps.error}
                    helperText={startDateFieldProps.helperText}
                    required
                  />

                  <MuiDatePicker
                    label="End Date"
                    value={values.end_date ? dayjs(values.end_date) : null}
                    onChange={(value) =>
                      setValues((prev) => ({
                        ...prev,
                        end_date: value && dayjs(value).isValid()
                          ? dayjs(value).format("YYYY-MM-DD")
                          : "",
                      }))
                    }
                    onClose={() => handleBlur("end_date")}
                    error={endDateFieldProps.error}
                    helperText={endDateFieldProps.helperText}
                  />
                </Stack>

                 
              </Stack>
            </form>
          )}
        </FormSection>
      </Stack>
    </Box>
  );
}

export const AddItemPlan = memo(forwardRef(Index));
