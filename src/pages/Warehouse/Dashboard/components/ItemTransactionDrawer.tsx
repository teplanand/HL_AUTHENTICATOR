import { forwardRef, useEffect, useImperativeHandle, useMemo, type Ref } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import { MuiCheckbox, MuiDatePicker, MuiRadioGroup, MuiTextField } from "../../../../../shared/components/mui/input";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";
import { getDecodedToken } from "../../../../../shared/utils/auth";
import type { Pallet, Shelf } from "../types";

export type ItemTransactionPayload = {
  oracle_code: string;
  sub_loc_id: string;
  pallet_id: string;
  rack_id: string;
  supplier_id: string;
  operation: "1" | "2";
  qty: string;
  created_by: string;
  has_expiry?: boolean;
  expiry_date?: string | null;
};

type TransactionFormValues = {
  qty: number | string;
  rack_id: string;
  supplier_id: string;
  operation: "1" | "2";
  has_expiry: boolean;
  expiry_date: Dayjs | null;
};

type DecodedUserToken = {
  employee_id?: string;
  name?: string;
  email?: string;
  user?: {
    employee_id?: string;
    name?: string;
    email?: string;
  };
};

type ItemTransactionDrawerProps = {
  item: Pallet;
  shelf: Shelf;
  rackId?: string | number;
  defaultOperation?: "1" | "2";
  onSubmitTransaction?: (payload: ItemTransactionPayload) => Promise<void> | void;
  setDisplayTitle?: (title: string) => void;
  setDataChanged?: (changed: boolean) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

export type ItemTransactionDrawerRef = {
  submit: () => Promise<void>;
};

const toPreviewUrl = (path: string | null | undefined) => {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || "https://wmsapi.techelecon.in");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

function ItemTransactionDrawerComponent(
  {
    item,
    shelf,
    rackId,
    defaultOperation = "1",
    onSubmitTransaction,
    setDisplayTitle,
    setDataChanged,
    setHideFooter,
    setWidth,
  }: ItemTransactionDrawerProps,
  ref: Ref<ItemTransactionDrawerRef>
) {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const token = getDecodedToken<DecodedUserToken>();

  const createdBy =
    token?.employee_id ||
    token?.user?.employee_id ||
    token?.name ||
    token?.user?.name ||
    token?.email ||
    token?.user?.email ||
    "admin_user";

  const previewUrl = useMemo(() => toPreviewUrl(item.item_image_path), [item.item_image_path]);
  const resolvedRackId = String(rackId || item.rack_id || "");

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      qty: "",
      rack_id: resolvedRackId,
      supplier_id: String(item.supplier_id ?? item.supplierId ?? ""),
      operation: defaultOperation,
      has_expiry: false,
      expiry_date: item.expiry_date ? dayjs(item.expiry_date) : null,
    },
    mode: "onBlur",
  });

  const hasExpiry = watch("has_expiry");
  const currentOperation = watch("operation");

  useEffect(() => {
    setDisplayTitle?.(`Item ${currentOperation === "1" ? "IN" : "OUT"} Transaction`);
    setHideFooter?.(false);
    setWidth?.(480);
  }, [currentOperation, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setDataChanged?.(isDirty);
  }, [isDirty, setDataChanged]);

  const onSubmit = async (values: TransactionFormValues) => {
    const quantity = Number(values.qty);

    if (!quantity || quantity <= 0) {
      showToast("Quantity must be greater than 0", "warning");
      return;
    }

    if (values.operation === "2" && quantity > Number(item.qty || 0)) {
      showToast("Out quantity cannot be greater than available stock", "warning");
      return;
    }

    const payload: ItemTransactionPayload = {
      oracle_code: String(item.oracle_code || item.product || ""),
      sub_loc_id: String(item.sub_loc_id || ""),
      pallet_id: String(shelf.recordId || item.pallet_id || ""),
      rack_id: values.rack_id.trim(),
      supplier_id: values.supplier_id.trim(),
      operation: values.operation,
      qty: String(quantity),
      created_by: createdBy,
      has_expiry: Boolean(values.has_expiry),
      expiry_date: values.has_expiry && values.expiry_date ? values.expiry_date.format("YYYY-MM-DD") : null,
    };

    try {
      await onSubmitTransaction?.(payload);
      showToast(`Item ${values.operation === "1" ? "IN" : "OUT"} transaction saved`, "success");
      setDataChanged?.(false);
      closeModal();
    } catch (error: any) {
      showToast(error?.message || "Failed to save transaction", "error");
      throw error;
    }
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
    <form onSubmit={handleSubmit(onSubmit)} style={{padding:10}}>
      <input type="hidden" {...register("rack_id", { required: "Rack ID is required" })} />
      <Stack spacing={3}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            borderColor: "rgba(15,23,42,0.08)",
            background: "linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ p: 2, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: 132 },
                minWidth: { sm: 132 },
                height: 132,
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
                border: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt={item.product}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              )}
            </Box>

            <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1} useFlexGap flexWrap="wrap">
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
                  {item.product}
                </Typography>
                <Chip
                  size="small"
                  label={`Stock: ${item.qty}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(255,138,61,0.14)",
                    color: "#C2410C",
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Oracle Code: {item.oracle_code || "-"}
              </Typography>
              {(item.item_desc || item.description) ? (
                <Typography variant="body2" color="text.secondary">
                  {item.item_desc || item.description}
                </Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                Pallet: {shelf.id} | Rack ID: {resolvedRackId || "-"}
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Stack spacing={3}>
          <MuiTextField
            id="qty"
            type="number"
            label="Quantity"
            placeholder="Enter quantity"
            {...register("qty", {
              valueAsNumber: true,
              required: "Quantity is required",
              min: { value: 1, message: "Quantity must be greater than 0" },
            })}
            error={!!errors.qty}
            helperText={errors.qty?.message}
            inputProps={{ min: 1 }}
          />

          <MuiTextField
            id="supplier_id"
            label="Supplier ID"
            placeholder="Enter supplier ID"
            {...register("supplier_id", {
              required: "Supplier ID is required",
            })}
            error={!!errors.supplier_id}
            helperText={errors.supplier_id?.message}
          />

          <Controller
            name="operation"
            control={control}
            rules={{ required: "Operation is required" }}
            render={({ field }) => (
              <MuiRadioGroup
                row
                label="Transaction Type"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                error={!!errors.operation}
                helperText={errors.operation?.message}
                options={[
                  { value: "1", label: "IN" },
                  { value: "2", label: "OUT" },
                ]}
              />
            )}
          />

          <Controller
            name="has_expiry"
            control={control}
            render={({ field }) => (
              <MuiCheckbox
                label="Expiry applicable"
                checked={Boolean(field.value)}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />

          {hasExpiry ? (
            <Controller
              name="expiry_date"
              control={control}
              rules={{
                validate: (value) =>
                  !hasExpiry || value ? true : "Expiry date is required when checkbox is selected",
              }}
              render={({ field }) => (
                <MuiDatePicker
                  label="Expiry Date"
                  value={field.value}
                  onChange={field.onChange}
                  onClose={field.onBlur}
                  error={!!errors.expiry_date}
                  helperText={errors.expiry_date?.message}
                  required
                  textFieldSx={{ width: "100%" }}
                />
              )}
            />
          ) : null}
        </Stack>
      </Stack>
    </form>
  );
}

export const ItemTransactionDrawer = forwardRef(ItemTransactionDrawerComponent);
