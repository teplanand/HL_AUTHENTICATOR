import { memo, useEffect } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  MuiTextField,
  MuiRadioGroup,
  MuiSelect,
} from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import CheckboxGrid, {
  CheckboxField,
} from "../../../../../shared/components/ui/form/CheckboxGrid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import { useToast } from "../../../../../shared/hooks/useToast";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useAppSelector } from "../../../../../shared/redux/hooks";
import {
  useLazyGetQualityCheckDetailsQuery,
  useLazyGetUnderAssemblyDetailsQuery,
  useQualityCheckSaveMutation,
} from "../../api/barcode";

const poleOptions = ["2", "4", "6", "8"].map((value) => ({ value, label: value }));

const electricMotorMakeOptions = ["PBL", "BBL", "Megha", "Simens", "Crompton"].map(
  (value) => ({ value, label: value })
);

type FinalInspectionFormValues = {
  gearedMotorSerialNumber: string;
  mountType: string;
  model: string;
  workOrderNumber: string;
  rpm: string;
  motorSerialNumber: string;
  pole: string;
  electricMotorMake: string;
  remarks: string;
  accessories: {
    additionalReq: boolean;
    breatherPlug: boolean;
    oilLevelIndicator: boolean;
    stickerOilLevel: boolean;
    stickerCaution: boolean;
    namePlate: boolean;
    shaftProtector: boolean;
    adaptorCover: boolean;
    eyeBolt: boolean;
    torqueBrush: boolean;
    endCover: boolean;
    springWasher: boolean;
    circlip: boolean;
    hexBolt: boolean;
    washer: boolean;
    outputFlange: boolean;
    singleExeShaft: boolean;
    doubleExeShaft: boolean;
    torqueArm: boolean;
    motorMountingRing: boolean;
    mountingFeet: boolean;
  };
  holdBack: {
    type: string;
    options: string[];
  };
  boreSize: string;
};

type FinalInspectionProps = {
  serialNumber?: string;
  onSaved?: (payload: { serialNo: string; savedAt: string }) => void;
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

const defaultValues: FinalInspectionFormValues = {
  gearedMotorSerialNumber: "",
  mountType: "",
  model: "",
  workOrderNumber: "",
  rpm: "",
  motorSerialNumber: "",
  pole: "",
  electricMotorMake: "",
  remarks: "",
  accessories: {
    additionalReq: false,
    breatherPlug: false,
    oilLevelIndicator: false,
    stickerOilLevel: false,
    stickerCaution: false,
    namePlate: false,
    shaftProtector: false,
    adaptorCover: false,
    eyeBolt: false,
    torqueBrush: false,
    endCover: false,
    springWasher: false,
    circlip: false,
    hexBolt: false,
    washer: false,
    outputFlange: false,
    singleExeShaft: false,
    doubleExeShaft: false,
    torqueArm: false,
    motorMountingRing: false,
    mountingFeet: false,
  },
  holdBack: {
    type: "",
    options: ["CW", "ACW"],
  },
  boreSize: "",
};

const accessoryFields: CheckboxField[] = [
  { name: "additionalReq", label: "Additional Req" },
  { name: "breatherPlug", label: "Breather Plug" },
  { name: "oilLevelIndicator", label: "Oil Level Indicator" },
  { name: "stickerOilLevel", label: "Sticker Oil Level" },
  { name: "stickerCaution", label: "Sticker Caution" },
  { name: "namePlate", label: "Name Plate" },
  { name: "shaftProtector", label: "Shaft Protector" },
  { name: "adaptorCover", label: "Adaptor Cover" },
  { name: "eyeBolt", label: "Eye Bolt" },
  { name: "torqueBrush", label: "Torque Brush" },
  { name: "endCover", label: "End Cover" },
  { name: "springWasher", label: "Spring Washer" },
  { name: "circlip", label: "Circlip" },
  { name: "hexBolt", label: "Hex Bolt" },
  { name: "washer", label: "Washer" },
  { name: "outputFlange", label: "Output Flange" },
  { name: "singleExeShaft", label: "Single Exe Shaft" },
  { name: "doubleExeShaft", label: "Double Exe Shaft" },
  { name: "torqueArm", label: "Torque Arm" },
  { name: "motorMountingRing", label: "Motor Mounting Ring" },
  { name: "mountingFeet", label: "Mounting Feet" },
];

const recentAutoFetchMap = new Map<string, number>();

const asString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

function FinalInspectionForm({
  serialNumber,
  onSaved,
  setDisplayTitle,
  setHideFooter,
  setWidth,
}: FinalInspectionProps) {
  const { showToast } = useToast();
  const { closeModal } = useModal();
  const authUserId = useAppSelector((state) => state.auth.id);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
  } = useForm<FinalInspectionFormValues>({ defaultValues });
  const [triggerQualityCheck] = useLazyGetQualityCheckDetailsQuery();
  const [triggerUnderAssembly] = useLazyGetUnderAssemblyDetailsQuery();
  const [qualityCheckSave, { isLoading: isSaving }] = useQualityCheckSaveMutation();
  const watchedValues = watch();
  const watchedAccessories = watchedValues.accessories || defaultValues.accessories;

  const handleAccessoryChange = (name: string, checked: boolean) => {
    setValue(`accessories.${name}` as keyof FinalInspectionFormValues, checked as never, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  useEffect(() => {
    setDisplayTitle?.("Quality Check");
    setHideFooter?.(true);
    setWidth?.(980);
  }, [setDisplayTitle, setHideFooter, setWidth]);

  const fillLookupValues = (lookup: Record<string, unknown>, nextSerialNumber: string) => {
    setValue("gearedMotorSerialNumber", nextSerialNumber, { shouldDirty: true });
    setValue("model", asString(lookup.Model ?? lookup.model), { shouldDirty: true });
    setValue("workOrderNumber", asString(lookup.wo_no), { shouldDirty: true });
    setValue("rpm", asString(lookup.rpm), { shouldDirty: true });
    setValue("motorSerialNumber", asString(lookup.motor_serial_no), { shouldDirty: true });
    setValue("pole", asString(lookup.pole), { shouldDirty: true });
    setValue("electricMotorMake", asString(lookup.MotorMake ?? lookup.make), { shouldDirty: true });
    setValue("mountType", asString(lookup.position ?? lookup.mountType), { shouldDirty: true });
    setValue("boreSize", asString(lookup.bore_size ?? lookup.boreSize), { shouldDirty: true });
    setValue("holdBack.type", asString(lookup.hold_back_cw_acw ?? lookup.holdBackType), {
      shouldDirty: true,
    });
    setValue("remarks", asString(lookup.remarks), { shouldDirty: true });

    setValue("accessories.additionalReq", Boolean(lookup.additional_requirement), {
      shouldDirty: true,
    });
    setValue("accessories.breatherPlug", Boolean(lookup.breather_plug), {
      shouldDirty: true,
    });
    setValue("accessories.oilLevelIndicator", Boolean(lookup.oil_level_indicator), {
      shouldDirty: true,
    });
    setValue("accessories.stickerOilLevel", Boolean(lookup.oil_level_sticker), {
      shouldDirty: true,
    });
    setValue("accessories.stickerCaution", Boolean(lookup.caution_sticker), {
      shouldDirty: true,
    });
    setValue("accessories.namePlate", Boolean(lookup.name_plate), { shouldDirty: true });
    setValue("accessories.shaftProtector", Boolean(lookup.shaft_protector), {
      shouldDirty: true,
    });
    setValue("accessories.adaptorCover", Boolean(lookup.adaptor_cover), {
      shouldDirty: true,
    });
    setValue("accessories.eyeBolt", Boolean(lookup.eye_bolt), { shouldDirty: true });
    setValue("accessories.torqueBrush", Boolean(lookup.torque_brush), {
      shouldDirty: true,
    });
    setValue("accessories.endCover", Boolean(lookup.end_cover), { shouldDirty: true });
    setValue("accessories.springWasher", Boolean(lookup.spring_washer), {
      shouldDirty: true,
    });
    setValue("accessories.circlip", Boolean(lookup.circlip), { shouldDirty: true });
    setValue("accessories.hexBolt", Boolean(lookup.hex_bolt), { shouldDirty: true });
    setValue("accessories.washer", Boolean(lookup.washer), { shouldDirty: true });
    setValue("accessories.outputFlange", Boolean(lookup.output_flange), {
      shouldDirty: true,
    });
    setValue("accessories.singleExeShaft", Boolean(lookup.single_exe_shaft), {
      shouldDirty: true,
    });
    setValue("accessories.doubleExeShaft", Boolean(lookup.double_exe_shaft), {
      shouldDirty: true,
    });
    setValue("accessories.torqueArm", Boolean(lookup.torque_arm), { shouldDirty: true });
    setValue("accessories.motorMountingRing", Boolean(lookup.motor_mounting_ring), {
      shouldDirty: true,
    });
    setValue("accessories.mountingFeet", Boolean(lookup.mountingfeet), {
      shouldDirty: true,
    });
  };

  const handleGetDetails = async (prefilledSerialNumber?: string) => {
    const serialValue = prefilledSerialNumber ?? getValues("gearedMotorSerialNumber");
    const nextSerialNumber = String(serialValue || "").trim();

    if (!nextSerialNumber) {
      showToast("Enter geared motor serial number first", "warning");
      return;
    }

    try {
      let response = await triggerQualityCheck({
        serial_no: nextSerialNumber,
      }).unwrap();

      if (!response?.data) {
        response = await triggerUnderAssembly({
          serial_no: nextSerialNumber,
          id: 0,
        }).unwrap();
      }

      const lookup = response?.data as Record<string, unknown> | null | undefined;
      if (!lookup) {
        showToast("No quality check details found from API", "warning");
        return;
      }

      fillLookupValues(lookup, nextSerialNumber);
      showToast("Quality check details loaded", "success");
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || "Unable to load quality check details";
      showToast(message, "error");
    }
  };

  useEffect(() => {
    if (!serialNumber?.trim()) {
      return;
    }

    const normalizedSerialNumber = serialNumber.trim();
    const lastFetchedAt = recentAutoFetchMap.get(normalizedSerialNumber) || 0;
    const now = Date.now();

    if (now - lastFetchedAt < 1500) {
      setValue("gearedMotorSerialNumber", normalizedSerialNumber, { shouldDirty: false });
      return;
    }

    recentAutoFetchMap.set(normalizedSerialNumber, now);
    setValue("gearedMotorSerialNumber", serialNumber, { shouldDirty: false });
    void handleGetDetails(normalizedSerialNumber);
  }, [serialNumber, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const serialNo = String(values.gearedMotorSerialNumber || "").trim();

    if (!serialNo) {
      showToast("Serial number is required", "warning");
      return;
    }

    try {
      await qualityCheckSave({
        serial_no: serialNo,
        position: values.mountType,
        pole: values.pole,
        make: values.electricMotorMake,
        additional_requirement: Boolean(values.accessories.additionalReq),
        breather_plug: Boolean(values.accessories.breatherPlug),
        oil_level_indicator: Boolean(values.accessories.oilLevelIndicator),
        oil_level_sticker: Boolean(values.accessories.stickerOilLevel),
        caution_sticker: Boolean(values.accessories.stickerCaution),
        name_plate: Boolean(values.accessories.namePlate),
        shaft_protector: Boolean(values.accessories.shaftProtector),
        adaptor_cover: Boolean(values.accessories.adaptorCover),
        eye_bolt: Boolean(values.accessories.eyeBolt),
        torque_brush: Boolean(values.accessories.torqueBrush),
        end_cover: Boolean(values.accessories.endCover),
        spring_washer: Boolean(values.accessories.springWasher),
        circlip: Boolean(values.accessories.circlip),
        hex_bolt: Boolean(values.accessories.hexBolt),
        washer: Boolean(values.accessories.washer),
        output_flange: Boolean(values.accessories.outputFlange),
        single_exe_shaft: Boolean(values.accessories.singleExeShaft),
        double_exe_shaft: Boolean(values.accessories.doubleExeShaft),
        torque_arm: Boolean(values.accessories.torqueArm),
        motor_mounting_ring: Boolean(values.accessories.motorMountingRing),
        mountingfeet: Boolean(values.accessories.mountingFeet),
        hold_back_cw_acw: values.holdBack.type,
        bore_size: values.boreSize,
        remarks: values.remarks,
        created_by: String(authUserId || "SYSTEM"),
      }).unwrap();

      const savedAt = new Date().toISOString();
      onSaved?.({ serialNo, savedAt });
      showToast("Quality check saved successfully", "success");
      closeModal();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || "Unable to save quality check";
      showToast(message, "error");
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1}>
        <FormSection
          title="General Information"
          description="Motor and gearbox identification details"
          icon={<InfoOutlinedIcon fontSize="small" />}
        >
          <FormStackGrid columns={3}>
            <Box
              sx={{
                gridColumn: "1 / -1",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "warning.main",
                bgcolor: "rgba(245, 158, 11, 0.08)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#92400E", mb: 0.5 }}>
                Start Here
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#B45309", display: "block", mb: 1.25 }}
              >
                Enter geared motor serial number and click Get to load inspection details
                from barcode API.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <MuiTextField
                  label="Geared Motor Serial Number"
                  {...register("gearedMotorSerialNumber")}
                  value={watchedValues.gearedMotorSerialNumber || ""}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={() => void handleGetDetails()}
                  sx={{ minWidth: 72, height: 35 }}
                >
                  Get
                </Button>
              </Box>
            </Box>
            <MuiTextField label="Position" {...register("mountType")} value={watchedValues.mountType || ""} />
            <MuiTextField label="Model" {...register("model")} value={watchedValues.model || ""} />
            <MuiTextField
              label="Work Order Number"
              {...register("workOrderNumber")}
              value={watchedValues.workOrderNumber || ""}
            />
            <MuiTextField label="RPM" {...register("rpm")} value={watchedValues.rpm || ""} />
            <MuiTextField
              label="Motor Serial Number"
              {...register("motorSerialNumber")}
              value={watchedValues.motorSerialNumber || ""}
            />
            <MuiSelect
              label="Pole"
              placeholder="Select pole"
              displayEmpty
              value={watchedValues.pole || ""}
              options={poleOptions}
              {...register("pole")}
            />
            <MuiSelect
              label="Make"
              placeholder="Select electric motor make"
              displayEmpty
              value={watchedValues.electricMotorMake || ""}
              options={electricMotorMakeOptions}
              {...register("electricMotorMake")}
            />
            <MuiTextField label="Bore Size" {...register("boreSize")} value={watchedValues.boreSize || ""} />
          </FormStackGrid>

          <Divider sx={{ my: 2 }} />

          <MuiRadioGroup
            label="Hold Back Type"
            row
            options={defaultValues.holdBack.options.map((opt) => ({
              value: opt,
              label: opt,
            }))}
            value={watchedValues.holdBack?.type || ""}
            onChange={(event) => {
              setValue("holdBack.type", event.target.value, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
        </FormSection>

        <FormSection
          title="Accessories"
          description="Select all applicable accessories for this unit"
          icon={<BuildOutlinedIcon fontSize="small" />}
          accentColor="#1D4ED8"
        >
          <CheckboxGrid
            fields={accessoryFields}
            register={register}
            checkedValues={watchedAccessories}
            onCheckedChange={handleAccessoryChange}
            prefix="accessories"
          />
        </FormSection>

        <FormSection
          title="Other Details"
          description="Additional remarks or observations"
          icon={<NotesOutlinedIcon fontSize="small" />}
          accentColor="#059669"
        >
          <MuiTextField
            label="Remarks"
            multiline
            rows={3}
            {...register("remarks")}
            value={watchedValues.remarks || ""}
            fullWidth
          />
        </FormSection>

        <Box>
          <Button type="submit" variant="contained" size="large" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Quality Check"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export const FinalInspection = memo(FinalInspectionForm);
