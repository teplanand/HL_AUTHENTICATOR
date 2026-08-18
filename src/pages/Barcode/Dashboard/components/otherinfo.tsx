import { Box, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MuiTextField } from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { BarcodeSalesOrderDetailsViewModel } from "../barcodeAdapters";

type OtherInfoFormProps = {
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null;
};

const getDefaultValues = (orderDetails?: BarcodeSalesOrderDetailsViewModel | null) =>
  orderDetails?.order_information?.other_details || {};

export default function OtherinfoForm({ orderDetails }: OtherInfoFormProps) {
  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: getDefaultValues(orderDetails),
  });

  useEffect(() => {
    reset(getDefaultValues(orderDetails));
  }, [orderDetails, reset]);

  const onSubmit = (data: any) => {
    console.log("Other Info Payload:", data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <FormSection
          title="General Information"
          description="Order source, warehouse, and channel details"
          icon={<InfoOutlinedIcon fontSize="small" />}
        >
          <FormStackGrid columns={3}>
            <MuiTextField label="Payment Terms" {...register("payment_terms")} fullWidth />
            <MuiTextField label="Warehouse" {...register("warehouse")} fullWidth />
            <MuiTextField label="Line Set" {...register("line_set")} fullWidth />
            <MuiTextField label="FOB" {...register("fob")} fullWidth />
            <MuiTextField label="Sales Channel" {...register("sales_channel")} fullWidth />
            <MuiTextField label="Order Source" {...register("order_source")} fullWidth />
            <Box sx={{ gridColumn: { md: "span 3" } }}>
              <MuiTextField
                label="Order Source Reference"
                {...register("order_source_reference")}
                fullWidth
              />
            </Box>
          </FormStackGrid>
        </FormSection>

        <FormSection
          title="Shipping & Packing"
          description="Freight, shipping method, and packing instructions"
          icon={<LocalShippingOutlinedIcon fontSize="small" />}
          accentColor="#0891B2"
        >
          <FormStackGrid columns={3}>
            <MuiTextField
              label="Shipping Method"
              {...register("shipping_method")}
              fullWidth
            />
            <MuiTextField label="Freight Terms" {...register("freight_terms")} fullWidth />
            <MuiTextField
              label="Shipment Priority"
              {...register("shipment_priority")}
              fullWidth
            />
            <Box sx={{ gridColumn: { md: "span 3" } }}>
              <MuiTextField
                label="Shipping Instructions"
                multiline
                rows={2}
                {...register("shipping_instructions")}
                fullWidth
              />
            </Box>
            <Box sx={{ gridColumn: { md: "span 3" } }}>
              <MuiTextField
                label="Packing Instruction"
                multiline
                rows={2}
                {...register("packing_instruction")}
                fullWidth
              />
            </Box>
          </FormStackGrid>
        </FormSection>

        <FormSection
          title="Tax & Amount"
          description="Tax handling and exemption details"
          icon={<ReceiptOutlinedIcon fontSize="small" />}
          accentColor="#D97706"
        >
          <FormStackGrid columns={3}>
            <MuiTextField label="Tax Handling" {...register("tax_handling")} fullWidth />
            <MuiTextField
              label="Tax Exempt Number"
              {...register("tax_exempt_number")}
              fullWidth
            />
            <MuiTextField label="Amount" {...register("amount")} fullWidth />
            <Box sx={{ gridColumn: { md: "span 3" } }}>
              <MuiTextField label="Exempt Reason" {...register("exempt_reason")} fullWidth />
            </Box>
          </FormStackGrid>
        </FormSection>

        <FormStackGrid columns={2} gap={3}>
          <FormSection
            title="Credit Card Details"
            description="Card payment information"
            icon={<CreditCardOutlinedIcon fontSize="small" />}
            accentColor="#7C3AED"
          >
            <FormStackGrid columns={2}>
              <Box sx={{ gridColumn: { md: "span 2" } }}>
                <MuiTextField label="Card Type" {...register("credit_card_type")} fullWidth />
              </Box>
              <MuiTextField label="Card Number" {...register("credit_card_number")} fullWidth />
              <MuiTextField label="Holder Name" {...register("card_holder")} fullWidth />
              <MuiTextField label="Expiry Date" {...register("card_expiry_date")} fullWidth />
              <Box sx={{ gridColumn: { md: "span 2" } }}>
                <MuiTextField label="Approval Code" {...register("approval_code")} fullWidth />
              </Box>
            </FormStackGrid>
          </FormSection>

          <FormSection
            title="Other Payment Details"
            description="Cheque and prepaid amounts"
            icon={<PaymentsOutlinedIcon fontSize="small" />}
            accentColor="#059669"
          >
            <FormStackGrid columns={1}>
              <MuiTextField label="Payment Type" {...register("payment_type")} fullWidth />
              <MuiTextField label="Cheque Number" {...register("cheque_number")} fullWidth />
              <MuiTextField label="Prepaid Amount" {...register("prepaid_amount")} fullWidth />
            </FormStackGrid>
          </FormSection>
        </FormStackGrid>
      </Stack>
    </Box>
  );
}
