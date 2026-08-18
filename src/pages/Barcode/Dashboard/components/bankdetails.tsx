import { Box, Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MuiTextField } from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { BarcodeSalesOrderDetailsViewModel } from "../barcodeAdapters";

type BankDetailsProps = {
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null;
};

const getDefaultValues = (orderDetails?: BarcodeSalesOrderDetailsViewModel | null) =>
  orderDetails?.order_information?.main?.bank_details || {};

export function BankDetails({ orderDetails }: BankDetailsProps) {
  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: getDefaultValues(orderDetails),
  });

  useEffect(() => {
    reset(getDefaultValues(orderDetails));
  }, [orderDetails, reset]);

  const onSubmit = (data: any) => {
    console.log("Bank Details Payload:", data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <FormSection
          title="Bank Account & Insurance Details"
          description="Payment and settlement account information"
          icon={<AccountBalanceOutlinedIcon fontSize="small" />}
          accentColor="#1D4ED8"
        >
          <FormStackGrid columns={2}>
            <MuiTextField label="Context Value" {...register("context_value")} fullWidth />
            <MuiTextField label="Bank Name" {...register("bank_name")} fullWidth />
            <Box sx={{ gridColumn: { md: "span 2" } }}>
              <MuiTextField label="Bank Address" {...register("bank_address")} fullWidth />
            </Box>
            <MuiTextField label="Contact Name" {...register("contact_name")} fullWidth />
            <MuiTextField
              label="Email & Phone"
              {...register("email_address_and_phone")}
              fullWidth
            />
            <MuiTextField label="LC No" {...register("lc_no")} fullWidth />
            <MuiTextField
              label="Delivery Condition"
              {...register("delivery_condition")}
              fullWidth
            />
            <MuiTextField label="Destination" {...register("destination")} fullWidth />
            <MuiTextField label="Insurance By" {...register("insurance_by")} fullWidth />
            <Box sx={{ gridColumn: { md: "span 2" } }}>
              <MuiTextField label="Group Proj Ref" {...register("group_proj_ref")} fullWidth />
            </Box>
            <Box sx={{ gridColumn: { md: "span 2" } }}>
              <MuiTextField label="Proj Title" {...register("proj_title")} fullWidth />
            </Box>
          </FormStackGrid>
        </FormSection>
      </Stack>
    </Box>
  );
}
