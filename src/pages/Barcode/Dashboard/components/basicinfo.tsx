import { useEffect, useMemo } from "react";
import { Box, Checkbox, FormControlLabel, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { MuiTextField } from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import { formatDateOnly } from "../../../../../shared/utils/FormatDate";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { BarcodeSalesOrderDetailsViewModel } from "../barcodeAdapters";

type OrderFormProps = {
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null;
};

type AddressFields = {
  location: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  pincode: string;
  state: string;
};

type RawAddressFields = Partial<AddressFields> | null | undefined;

const EMPTY_ADDRESS: AddressFields = {
  location: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  pincode: "",
  state: "",
};

const normalizeAddress = (address?: RawAddressFields): AddressFields => ({
  location: address?.location || address?.city || "",
  address_line_1: address?.address_line_1 || "",
  address_line_2: address?.address_line_2 || "",
  city: address?.city || "",
  pincode: address?.pincode || "",
  state: address?.state || "",
});

const formatDisplayDate = (value?: string) => formatDateOnly(value || "")?.replace(/\//g, "-") || "";

const areAddressesSame = (first: AddressFields, second: AddressFields) =>
  first.location === second.location &&
  first.address_line_1 === second.address_line_1 &&
  first.address_line_2 === second.address_line_2 &&
  first.city === second.city &&
  first.pincode === second.pincode &&
  first.state === second.state;

const getAddresses = (orderDetails?: BarcodeSalesOrderDetailsViewModel | null) => {
  const mappedAddresses = orderDetails?.order_information?.main?.addresses;
  const rawAddresses = orderDetails as (BarcodeSalesOrderDetailsViewModel & {
    billing_address?: RawAddressFields;
    shipping_address?: RawAddressFields;
  }) | null | undefined;

  const shipping = normalizeAddress(
    mappedAddresses?.shipping || rawAddresses?.shipping_address || EMPTY_ADDRESS
  );
  const billing = normalizeAddress(
    mappedAddresses?.billing || rawAddresses?.billing_address || EMPTY_ADDRESS
  );

  return { shipping, billing };
};

const getDefaultValues = (orderDetails?: BarcodeSalesOrderDetailsViewModel | null) => {
  const addresses = getAddresses(orderDetails);

  return {
    customer: orderDetails?.order_information?.main?.customer || {},
    addresses,
    order: {
      ...(orderDetails?.order || {}),
      order_date: formatDisplayDate(orderDetails?.order?.order_date),
    },
    sales: orderDetails?.order_information?.main?.sales || {},
    amount: orderDetails?.order_information?.main?.amount || {},
    sameAsShipping: areAddressesSame(addresses.shipping, addresses.billing),
  };
};

export default function OrderForm({ orderDetails }: OrderFormProps) {
  const defaultValues = useMemo(() => getDefaultValues(orderDetails), [orderDetails]);
  const { register, handleSubmit, watch, setValue, reset } = useForm<any>({
    defaultValues,
  });

  const sameAsShippingValue = watch("sameAsShipping");
  const shipTo = watch("addresses.shipping");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (sameAsShippingValue) {
      setValue("addresses.billing", shipTo);
      return;
    }

    setValue("addresses.billing", defaultValues.addresses.billing);
  }, [defaultValues.addresses.billing, sameAsShippingValue, setValue, shipTo]);

  const onSubmit = (data: any) => {
    console.log("Submit Order Payload:", data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <FormSection
          title="Customer Information"
          description="Basic customer identification and contact"
          icon={<PersonOutlinedIcon fontSize="small" />}
        >
          <FormStackGrid>
            <MuiTextField label="Customer Name" {...register("customer.name")} fullWidth />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <MuiTextField
                label="Customer Number"
                {...register("customer.customer_number")}
                fullWidth
              />
              <MuiTextField label="Customer PO" {...register("customer.customer_po")} fullWidth />
            </Box>
            <MuiTextField label="Customer Contact" {...register("customer.contact")} fullWidth />
          </FormStackGrid>
        </FormSection>

        <FormStackGrid columns={2} gap={3}>
          <FormSection
            title="Shipping Address"
            description="Delivery destination"
            icon={<LocalShippingOutlinedIcon fontSize="small" />}
            accentColor="#0891B2"
          >
            <FormStackGrid columns={1}>
              <MuiTextField
                label="Location"
                {...register("addresses.shipping.location")}
                fullWidth
              />
              <MuiTextField
                label="Address Line 1"
                {...register("addresses.shipping.address_line_1")}
                fullWidth
              />
              <MuiTextField
                label="Address Line 2"
                {...register("addresses.shipping.address_line_2")}
                fullWidth
              />
              <FormStackGrid columns={2}>
                <MuiTextField label="City" {...register("addresses.shipping.city")} fullWidth />
                <MuiTextField label="State" {...register("addresses.shipping.state")} fullWidth />
              </FormStackGrid>
              <MuiTextField
                label="Pincode"
                {...register("addresses.shipping.pincode")}
                fullWidth
              />
            </FormStackGrid>
          </FormSection>

          <FormSection
            title="Billing Address"
            description="Invoice billing destination"
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            accentColor="#7C3AED"
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, mt: -1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameAsShippingValue}
                    {...register("sameAsShipping")}
                    size="small"
                  />
                }
                label="Same as Shipping"
                slotProps={{ typography: { variant: "body2" } }}
              />
            </Box>
            <FormStackGrid columns={1}>
              <MuiTextField
                label="Location"
                {...register("addresses.billing.location")}
                fullWidth
                disabled={sameAsShippingValue}
              />
              <MuiTextField
                label="Address Line 1"
                {...register("addresses.billing.address_line_1")}
                fullWidth
                disabled={sameAsShippingValue}
              />
              <MuiTextField
                label="Address Line 2"
                {...register("addresses.billing.address_line_2")}
                fullWidth
                disabled={sameAsShippingValue}
              />
              <FormStackGrid columns={2}>
                <MuiTextField
                  label="City"
                  {...register("addresses.billing.city")}
                  fullWidth
                  disabled={sameAsShippingValue}
                />
                <MuiTextField
                  label="State"
                  {...register("addresses.billing.state")}
                  fullWidth
                  disabled={sameAsShippingValue}
                />
              </FormStackGrid>
              <MuiTextField
                label="Pincode"
                {...register("addresses.billing.pincode")}
                fullWidth
                disabled={sameAsShippingValue}
              />
            </FormStackGrid>
          </FormSection>
        </FormStackGrid>

        <FormSection
          title="Order Details"
          description="Sales order metadata and configuration"
          icon={<ShoppingCartOutlinedIcon fontSize="small" />}
          accentColor="#D97706"
        >
          <FormStackGrid>
            <MuiTextField label="Order Number" {...register("order.order_number")} fullWidth />
            <MuiTextField label="Order Type" {...register("order.order_type")} fullWidth />
            <MuiTextField label="Date of Order" {...register("order.order_date")} fullWidth />
            <MuiTextField label="Currency" {...register("order.currency")} fullWidth />
            <Box sx={{ gridColumn: { md: "span 2" } }}>
              <MuiTextField label="Price List" {...register("sales.price_list")} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { md: "span 3" } }}>
              <MuiTextField label="Sales Person" {...register("sales.sales_person")} fullWidth />
            </Box>
            <MuiTextField label="Status" {...register("order.status")} fullWidth />
            <MuiTextField label="Tax Category" {...register("order.tax_category")} fullWidth />
          </FormStackGrid>
        </FormSection>
      </Stack>
    </Box>
  );
}
