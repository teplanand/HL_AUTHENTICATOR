type FinalInspectionLookup = {
  mountType: string;
  model: string;
  workOrderNumber: string;
  rpm: string;
  motorSerialNumber: string;
  pole: string;
  electricMotorMake: string;
  boreSize: string;
  holdBackType: string;
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
};

type OrderCompletionLookup = {
  mountType: string;
  model: string;
  workOrderNumber: string;
  rpm: string;
  motorSerialNumber: string;
  pole: string;
  electricMotorMake: string;
  inputRpm: string;
  actualRatio: string;
  noiseLevelDb: string;
  paint: string;
  status: string;
};

export type GearMotorLookupResult = {
  gearedMotorSerialNumber: string;
  finalInspection: FinalInspectionLookup;
  orderCompletion: OrderCompletionLookup;
};

const presets: Record<string, Partial<GearMotorLookupResult>> = {
  M480527: {
    finalInspection: {
      mountType: "Foot Mount",
      model: "EDR-FM-90L",
      workOrderNumber: "WO-240527",
      rpm: "1440",
      motorSerialNumber: "MS-480527",
      pole: "4",
      electricMotorMake: "PBL",
      boreSize: "40",
      holdBackType: "CW",
      remarks: "Inspected and ready for dispatch.",
      accessories: {
        additionalReq: false,
        breatherPlug: true,
        oilLevelIndicator: true,
        stickerOilLevel: true,
        stickerCaution: true,
        namePlate: true,
        shaftProtector: true,
        adaptorCover: false,
        eyeBolt: true,
        torqueBrush: false,
        endCover: true,
        springWasher: true,
        circlip: true,
        hexBolt: true,
        washer: true,
        outputFlange: false,
        singleExeShaft: true,
        doubleExeShaft: false,
        torqueArm: false,
        motorMountingRing: false,
        mountingFeet: true,
      },
    },
    orderCompletion: {
      mountType: "Foot Mount",
      model: "EDR-FM-90L",
      workOrderNumber: "WO-240527",
      rpm: "1440",
      motorSerialNumber: "MS-480527",
      pole: "4",
      electricMotorMake: "PBL",
      inputRpm: "1440",
      actualRatio: "20",
      noiseLevelDb: "64",
      paint: "GOOD",
      status: "PK",
    },
  },
};

const baseAccessories: FinalInspectionLookup["accessories"] = {
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
};

export const getGearMotorLookup = (serialInput: string): GearMotorLookupResult | null => {
  const serial = serialInput.trim().toUpperCase();
  if (!serial) {
    return null;
  }

  const preset = presets[serial];

  return {
    gearedMotorSerialNumber: serial,
    finalInspection: {
      mountType: preset?.finalInspection?.mountType || "Foot Mount",
      model: preset?.finalInspection?.model || `GM-${serial.slice(-4)}`,
      workOrderNumber: preset?.finalInspection?.workOrderNumber || `WO-${serial.slice(-6)}`,
      rpm: preset?.finalInspection?.rpm || "1440",
      motorSerialNumber: preset?.finalInspection?.motorSerialNumber || `MS-${serial}`,
      pole: preset?.finalInspection?.pole || "4",
      electricMotorMake: preset?.finalInspection?.electricMotorMake || "PBL",
      boreSize: preset?.finalInspection?.boreSize || "40",
      holdBackType: preset?.finalInspection?.holdBackType || "CW",
      remarks: preset?.finalInspection?.remarks || `Auto-loaded from geared motor serial ${serial}.`,
      accessories: {
        ...baseAccessories,
        ...(preset?.finalInspection?.accessories || {
          breatherPlug: true,
          oilLevelIndicator: true,
          namePlate: true,
          shaftProtector: true,
          mountingFeet: true,
        }),
      },
    },
    orderCompletion: {
      mountType: preset?.orderCompletion?.mountType || "Foot Mount",
      model: preset?.orderCompletion?.model || `GM-${serial.slice(-4)}`,
      workOrderNumber: preset?.orderCompletion?.workOrderNumber || `WO-${serial.slice(-6)}`,
      rpm: preset?.orderCompletion?.rpm || "1440",
      motorSerialNumber: preset?.orderCompletion?.motorSerialNumber || `MS-${serial}`,
      pole: preset?.orderCompletion?.pole || "4",
      electricMotorMake: preset?.orderCompletion?.electricMotorMake || "PBL",
      inputRpm: preset?.orderCompletion?.inputRpm || "1440",
      actualRatio: preset?.orderCompletion?.actualRatio || "20",
      noiseLevelDb: preset?.orderCompletion?.noiseLevelDb || "64",
      paint: preset?.orderCompletion?.paint || "GOOD",
      status: preset?.orderCompletion?.status || "PK",
    },
  };
};
