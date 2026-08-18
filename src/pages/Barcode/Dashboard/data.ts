import type {
  BarcodeApiResponse,
  BarcodeImportResponseData,
  BarcodeSalesOrderDetailsRaw,
} from "../api/barcode";
import {
  mapSalesOrderDetails,
  mapSalesOrdersList,
  type BarcodeSalesOrderDetailsViewModel,
} from "./barcodeAdapters";

export type BarcodeSalesOrderStatus =
  | "New Sales Order"
  | "HOD Review"
  | "Planning"
  | "Dispatched";

export type BarcodeLineStatusCode = "PL" | "SH" | "MI" | "PK" | "BOOKED";

export type BarcodeWorkflowStageStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Done";

export type BarcodeActionConfig = {
  visible: boolean;
  enabled: boolean;
  mode: string;
  label: string;
};

export type BarcodeSerialItem = {
  serial_no: string;
  ass_rel_date: string | null;
  ac_ua_date: string | null;
  ac_comp_date: string | null;
  ac_pk_date: string | null;
  ac_ds_date: string | null;
  tent_rel_date: string | null;
  status: BarcodeLineStatusCode;
  sh_type: string | null;
  sh_item: string | null;
  rpm: string | null;
  motor_serial_no: string | null;
  ac_ho_date: string | null;
  ac_ca_date: string | null;
};

export type BarcodeLineItem = {
  line_no: string;
  item_code: string;
  description: string;
  quantity: number;
  list_price: number;
  discount_percent: number;
  selling_price: number;
  amount: number;
  ship_to_location: string;
  road_permit: boolean;
  wo_no: string;
  wo_date: string;
  client_delivery_date: string | null;
  delivery_month: string | null;
  con_auth: string | null;
  status: BarcodeLineStatusCode;
  mail_status: string;
  actions?: Record<string, BarcodeActionConfig>;
  quantitys: BarcodeSerialItem[];
};

export type BarcodeSalesOrder = {
  order: {
    order_number: string;
    order_type: string;
    status: string;
    order_date: string;
    currency: string;
    tax_category: string;
  };
  order_information: {
    main: {
      customer: {
        name: string;
        customer_number: string;
        customer_po: string;
        contact: string;
      };
      addresses: {
        shipping: {
          location: string;
          address_line_1: string;
          address_line_2: string;
          city: string;
          pincode: string;
          state: string;
        };
        billing: {
          location: string;
          address_line_1: string;
          address_line_2: string;
          city: string;
          pincode: string;
          state: string;
        };
      };
      sales: {
        sales_person: string;
        price_list: string;
      };
      amount: {
        sub_total: number;
        tax: number;
        total: number;
      };
      bank_details: {
        context_value: string;
        bank_address: string;
        lc_no: string;
        delivery_condition: string;
        destination: string;
        group_proj_ref: string;
        proj_title: string;
        insurance_by: string;
        bank_name: string;
        contact_name: string;
        email_address_and_phone: string;
      };
    };
    other_details: {
      payment_terms: string;
      warehouse: string;
      line_set: string;
      fob: string;
      shipping_instructions: string;
      tax_handling: string;
      exempt_reason: string;
      amount: string;
      credit_card_type: string;
      card_holder: string;
      approval_code: string;
      order_source: string;
      sales_channel: string;
      shipping_method: string;
      freight_terms: string;
      shipment_priority: string;
      packing_instruction: string;
      tax_exempt_number: string;
      payment_type: string;
      cheque_number: string;
      credit_card_number: string;
      card_expiry_date: string;
      prepaid_amount: string;
      order_source_reference: string;
    };
  };
  line_items: BarcodeLineItem[];
};

export type BarcodeInspectionAccessories = {
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

export type BarcodeGearMotorLookup = {
  gearedMotorSerialNumber: string;
  finalInspection: {
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
    accessories: BarcodeInspectionAccessories;
  };
  orderCompletion: {
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
};

export type BarcodeReportDefinition = {
  id: string;
  name: string;
  apiKey: string;
  formats: Array<"xls" | "pdf">;
};

const defaultAccessories: BarcodeInspectionAccessories = {
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

const statusActionMap: Record<
  BarcodeLineStatusCode,
  {
    statusLabel: string;
    badgeVariant: "warning" | "success" | "info" | "secondary";
    actions: {
      workOrder: BarcodeActionConfig;
      serialNumber: BarcodeActionConfig;
      issueMaterial: BarcodeActionConfig;
      printLabel: BarcodeActionConfig;
      edit: BarcodeActionConfig;
    };
  }
> = {
  BOOKED: {
    statusLabel: "Booked",
    badgeVariant: "warning",
    actions: {
      workOrder: { visible: true, enabled: true, mode: "create", label: "Work Order" },
      serialNumber: { visible: true, enabled: false, mode: "manage", label: "Serial Number" },
      issueMaterial: { visible: true, enabled: false, mode: "issue", label: "Issue Material" },
      printLabel: { visible: true, enabled: false, mode: "print", label: "Print Label" },
      edit: { visible: true, enabled: true, mode: "edit", label: "Edit" },
    },
  },
  PL: {
    statusLabel: "In Planning",
    badgeVariant: "warning",
    actions: {
      workOrder: { visible: true, enabled: true, mode: "create", label: "Work Order" },
      serialNumber: { visible: true, enabled: false, mode: "manage", label: "Serial Number" },
      issueMaterial: { visible: true, enabled: false, mode: "issue", label: "Issue Material" },
      printLabel: { visible: true, enabled: false, mode: "print", label: "Print Label" },
      edit: { visible: true, enabled: true, mode: "edit", label: "Edit" },
    },
  },
  SH: {
    statusLabel: "Shop Floor Ready",
    badgeVariant: "success",
    actions: {
      workOrder: { visible: true, enabled: true, mode: "view", label: "Work Order" },
      serialNumber: { visible: true, enabled: true, mode: "manage", label: "Serial Number" },
      issueMaterial: { visible: true, enabled: true, mode: "issue", label: "Issue Material" },
      printLabel: { visible: true, enabled: false, mode: "print", label: "Print Label" },
      edit: { visible: true, enabled: true, mode: "edit", label: "Edit" },
    },
  },
  MI: {
    statusLabel: "Material Issued",
    badgeVariant: "info",
    actions: {
      workOrder: { visible: true, enabled: true, mode: "view", label: "Work Order" },
      serialNumber: { visible: true, enabled: true, mode: "manage", label: "Serial Number" },
      issueMaterial: { visible: true, enabled: true, mode: "issue", label: "Issue Material" },
      printLabel: { visible: true, enabled: true, mode: "print", label: "Print Label" },
      edit: { visible: true, enabled: true, mode: "edit", label: "Edit" },
    },
  },
  PK: {
    statusLabel: "Packed",
    badgeVariant: "secondary",
    actions: {
      workOrder: { visible: true, enabled: true, mode: "view", label: "Work Order" },
      serialNumber: { visible: true, enabled: true, mode: "manage", label: "Serial Number" },
      issueMaterial: { visible: true, enabled: true, mode: "issue", label: "Issue Material" },
      printLabel: { visible: true, enabled: true, mode: "print", label: "Print Label" },
      edit: { visible: true, enabled: true, mode: "edit", label: "Edit" },
    },
  },
};

const barcodeImportSalesOrdersResponse: BarcodeApiResponse<BarcodeImportResponseData[]> = {
  status: true,
  message: "Success",
  data: [
    {
      order_booked_date: "2026-04-24 12:15:36",
      order_type_id: 4046,
      header_id: 10554758,
      ordernumber: 16371,
      customer_name: "TRANSTECH EQUIPMENTS PVT LTD",
      customer_number: "396559",
    },
    {
      order_booked_date: "2026-04-24 12:14:20",
      order_type_id: 4046,
      header_id: 10554757,
      ordernumber: 16370,
      customer_name: "AMMANN INDIA PVT LTD",
      customer_number: "118800",
    },
  ],
  records: 2,
};

const barcodeSalesOrdersResponse: BarcodeApiResponse = {
  status: true,
  message: "Success",
  data: [
    {
      header_id: 10554759,
      oracle_order_no: 16372,
      order_booked_date: "2026-04-24T06:49:14.000Z",
      import_status: true,
      generate_status: false,
      organization_id: 43,
      division_id: 374,
      order_status: "OPEN",
    },
    {
      header_id: 10554758,
      oracle_order_no: 16371,
      order_booked_date: "2026-04-24T06:45:36.000Z",
      import_status: true,
      generate_status: false,
      organization_id: 43,
      division_id: 374,
      order_status: "OPEN",
    },
    {
      header_id: 10554757,
      oracle_order_no: 16370,
      order_booked_date: "2026-04-24T06:44:20.000Z",
      import_status: true,
      generate_status: false,
      organization_id: 43,
      division_id: 374,
      order_status: "OPEN",
    },
  ],
  records: 3,
};

const barcodeSalesOrderDetailsByNumber: Record<string, BarcodeSalesOrderDetailsRaw> = {
  "16363": {
    header_id: 10550750,
    order: {
      order_number: 16363,
      order_type: "PBGPRLS",
      status: "BOOKED",
      order_date: "2026-04-20T04:00:24.000Z",
      currency: "INR",
      tax_category: null,
    },
    customer: {
      name: "NOBLE INDUSTRIAL EQUIPMENTS PVT LTD",
      customer_number: "77509",
      customer_po: "NIEPL/PO/25-26/271 DTD-12.03.2026",
      contact: null,
    },
    billing_address: {
      location: null,
      address_line_1: "S/F- 2, 2ND FLOOR,",
      address_line_2: "NARAYAN PLAZA",
      city: "BHUBANESHWAR",
      pincode: "751009",
      state: "ORISSA",
    },
    shipping_address: {
      location: null,
      address_line_1: "S/F- 2, 2ND FLOOR,",
      address_line_2: "NARAYAN PLAZA",
      city: "BHUBANESHWAR",
      pincode: "751009",
      state: "ORISSA",
    },
    sales: {
      sales_person: "EMTICI-KOLKATA(PBL)",
      price_list: "PBL PBG Products Price List-2025-26",
      sales_channel: "BRANCH",
    },
    amounts: {
      sub_total: "33428.00",
      tax: "0.00",
      total: "33428.00",
    },
    shipping: {
      shipping_method: "ANY RELIABLE TRANSPORTER",
      freight_terms: "TOPAY",
    },
    payment: {
      payment_terms: "100-10days-CD",
    },
    bank_details: {
      context_value: "Bank Details",
      bank_address: ".",
      bank_name: "Axis Bank",
      delivery_condition: "EX-WORKS",
      destination: "AS PER PO",
      group_proj_ref: null,
      proj_title: null,
      insurance_by: "BYUS",
      contact_name: "S.K.KHADANGA",
      email_address_and_phone: "-",
    },
    other_details: {
      payment_terms: "100-10days-CD",
      warehouse: "PBG",
      fob: null,
      shipping_method: "ANY RELIABLE TRANSPORTER",
      freight_terms: "TOPAY",
      shipment_priority: "Standard",
      packing_instruction: "VERY WELL PACKED AND ROAD WORTHY",
      order_source: null,
      order_source_reference: null,
    },
    line_items: [
      {
        id: null,
        line_no: null,
        lineId: 11984867,
        headerId: 10550750,
        orgId: 43,
        item_code: "SK.AM1.020.AMH020S7_5",
        description: "Foot Mounted Motor Mount Reducer AMH020S7.5",
        quantity: 1,
        list_price: 79590,
        discount_percent: 58,
        selling_price: 33428,
        amount: 33428,
        ship_to_location: 115821,
        road_permit: false,
        wo_no: 10205160,
        wo_date: "2026-04-21T04:09:03.000Z",
        client_delivery_date: null,
        delivery_month: null,
        con_auth: null,
        status: null,
        mail_status: null,
        model: "SK.AM1.020.AMH020S7_5",
        model_type: "AM1",
        ratio: 0,
        kw: 0,
        quantitys: [
          {
            id: 45,
            serial_no: "26/4",
            LINE_ID: 11984867,
            ORACLE_LINE_NO: "1.1.115821",
            status: "PL",
            FULLSTATUS: "IN PLANNING",
            rpm: null,
            motor_serial_no: null,
            ass_rel_date: "2026-04-28T11:51:33.627Z",
            ac_ua_date: null,
            ac_comp_date: null,
            ac_pk_date: null,
            ac_ds_date: null,
            tent_rel_date: null,
            sh_type: null,
            sh_item: null,
            REASON_FOR_STATUS: null,
            ac_ho_date: null,
            ac_ca_date: null,
            WF_INSTANCE_ID: 2470,
          },
        ],
      },
    ],
  },
  "16372": {
    header_id: 10554759,
    order: {
      order_number: 16372,
      order_type: null,
      status: "BOOKED",
      order_date: "2026-04-24T12:17:51.000Z",
      currency: "INR",
      tax_category: null,
    },
    customer: {
      customer_name: "UNITED MARKETING COMPANY",
      customer_number: "23000",
      customer_po: "UMC/446/25-26",
      contact: null,
    },
    billing_address: {
      city: "AHMEDABAD",
      state: "GUJARAT",
      pincode: "380009",
    },
    shipping_address: {
      city: "DIST:AHMEDABAD",
      state: "GUJARAT",
      pincode: "382427",
    },
    sales: {
      sales_person: "EMTICI-AHMEDABAD-1 (PBL)",
      price_list: "PBL PBG Products Price List-2025-26",
      sales_channel: "BRANCH",
    },
    amounts: {
      sub_total: "49840.00",
      tax: "0.00",
      total: "49840.00",
    },
    shipping: {
      shipping_method: "Client Transport",
      freight_terms: "TOPAY",
    },
    payment: {
      payment_terms: "PAY WTN 30 DAYS",
    },
    bank_details: {
      bank_name: null,
      bank_address: null,
      contact_name: null,
      email_address_and_phone: null,
      delivery_condition: null,
      destination: null,
      group_proj_ref: null,
      proj_title: null,
      insurance_by: null,
      context_value: "Bank Details",
    },
    other_details: {
      payment_terms: "PAY WTN 30 DAYS",
      warehouse: "PBG",
      shipping_method: "Client Transport",
      freight_terms: "TOPAY",
      shipment_priority: "Standard",
      packing_instruction: "",
      order_source: null,
      order_source_reference: null,
    },
    line_items: [
      {
        LINE_ID: 11988886,
        HEADER_ID: 10554759,
        ORG_ID: 43,
        ORDERED_ITEM: "SK.AM1.045.AMG045S3_7",
        ORDERED_QUANTITY: 2,
        UNIT_LIST_PRICE: 75524,
        UNIT_SELLING_PRICE: 24920,
        SHIP_FROM_ORG_ID: 374,
        SHIP_TO_ORG_ID: 658180,
        AMOUNT: 49840,
        DISCOUNT: 67,
        DESCRIPTION: "Foot Mounted Motor Mount Reducer AMG045S3.7",
        MODEL: "SK.AM1.045.AMG045S3_7",
        MODEL_TYPE: "AM1",
        KW: 0,
        RATIO: 0,
        WIP_ENTITY_NAME: null,
        CREATION_DATE: null,
        serial_line_items: [],
      },
    ],
  },
  "16371": {
    header_id: 10554758,
    order: {
      order_number: 16371,
      order_type: "PBGPRLS",
      status: "BOOKED",
      order_date: "2026-04-24T12:15:36.000Z",
      currency: "INR",
      tax_category: null,
    },
    customer: {
      customer_name: "TRANSTECH EQUIPMENTS PVT LTD",
      customer_number: "396559",
      customer_po: "",
      contact: null,
    },
    billing_address: {
      city: "AHMEDABAD",
      state: "GUJARAT",
      pincode: "380001",
    },
    shipping_address: {
      city: "AHMEDABAD",
      state: "GUJARAT",
      pincode: "380001",
    },
    sales: {
      sales_person: "EMTICI-AHMEDABAD-1 (PBL)",
      price_list: "PBL PBG Products Price List-2025-26",
      sales_channel: "BRANCH",
    },
    amounts: {
      sub_total: "33428.00",
      tax: "0.00",
      total: "33428.00",
    },
    shipping: {
      shipping_method: "ANY RELIABLE TRANSPORTER",
      freight_terms: "TOPAY",
    },
    payment: {
      payment_terms: "100-10days-CD",
    },
    bank_details: {
      context_value: "Bank Details",
      bank_address: ".",
      bank_name: "Axis Bank",
      delivery_condition: "EX-WORKS",
      destination: "AS PER PO",
      group_proj_ref: null,
      proj_title: null,
      insurance_by: "BYUS",
      contact_name: "S.K.KHADANGA",
      email_address_and_phone: "-",
    },
    other_details: {
      payment_terms: "100-10days-CD",
      warehouse: "PBG",
      fob: null,
      shipping_method: "ANY RELIABLE TRANSPORTER",
      freight_terms: "TOPAY",
      shipment_priority: "Standard",
      packing_instruction: "VERY WELL PACKED AND ROAD WORTHY",
      order_source: null,
      order_source_reference: null,
    },
    line_items: [
      {
        lineId: 11984868,
        headerId: 10554758,
        orgId: 43,
        item_code: "SK.AM1.020.AMH020S7_5",
        description: "Foot Mounted Motor Mount Reducer AMH020S7.5",
        quantity: 1,
        list_price: 79590,
        discount_percent: 58,
        selling_price: 33428,
        amount: 33428,
        ship_to_location: 115821,
        road_permit: false,
        wo_no: null,
        wo_date: null,
        client_delivery_date: null,
        delivery_month: null,
        con_auth: null,
        status: null,
        mail_status: null,
        model: "SK.AM1.020.AMH020S7_5",
        model_type: "AM1",
        ratio: 0,
        kw: 0,
        quantitys: [],
      },
    ],
  },
};

const salesOrderViewModels: BarcodeSalesOrderDetailsViewModel[] = Object.values(
  barcodeSalesOrderDetailsByNumber
)
  .map((salesOrder) => mapSalesOrderDetails(salesOrder))
  .filter((salesOrder): salesOrder is BarcodeSalesOrderDetailsViewModel => Boolean(salesOrder));

const recentSalesOrders = mapSalesOrdersList(barcodeSalesOrdersResponse);

const orderTracking = [
   
];

const gearMotorLookups: Record<string, BarcodeGearMotorLookup> = {
  M480527: {
    gearedMotorSerialNumber: "M480527",
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
        ...defaultAccessories,
        breatherPlug: true,
        oilLevelIndicator: true,
        stickerOilLevel: true,
        stickerCaution: true,
        namePlate: true,
        shaftProtector: true,
        eyeBolt: true,
        endCover: true,
        springWasher: true,
        circlip: true,
        hexBolt: true,
        washer: true,
        singleExeShaft: true,
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
  M480528: {
    gearedMotorSerialNumber: "M480528",
    finalInspection: {
      mountType: "Flange Mount",
      model: "EDF-FM-112M",
      workOrderNumber: "WO-240528",
      rpm: "960",
      motorSerialNumber: "MS-480528",
      pole: "6",
      electricMotorMake: "BBL",
      boreSize: "55",
      holdBackType: "ACW",
      remarks: "Awaiting final paint check and name plate verification.",
      accessories: {
        ...defaultAccessories,
        breatherPlug: true,
        oilLevelIndicator: true,
        namePlate: true,
        shaftProtector: true,
        adaptorCover: true,
        eyeBolt: true,
        torqueArm: true,
        motorMountingRing: true,
      },
    },
    orderCompletion: {
      mountType: "Flange Mount",
      model: "EDF-FM-112M",
      workOrderNumber: "WO-240528",
      rpm: "960",
      motorSerialNumber: "MS-480528",
      pole: "6",
      electricMotorMake: "BBL",
      inputRpm: "1440",
      actualRatio: "30",
      noiseLevelDb: "67",
      paint: "Accreylated Alkyd Gear Blue Semi Glossy",
      status: "PI",
    },
  },
};

const reportCategories: Array<{
  id: string;
  title: string;
  reports: BarcodeReportDefinition[];
}> = [
  {
    id: "order-booking",
    title: "Order Booking",
    reports: [
      { id: "branch-wise-order-booking", name: "Branch Wise Order Booking", apiKey: "branchWiseOrderBooking", formats: ["xls", "pdf"] },
      { id: "customer-wise-order-booking", name: "Customer Wise Order Booking", apiKey: "customerWiseOrderBooking", formats: ["xls", "pdf"] },
      { id: "consolidated", name: "Consolidated", apiKey: "consolidatedOrderBooking", formats: ["xls", "pdf"] },
      { id: "generate-serial-details", name: "Generate SerialNo Details", apiKey: "generateSerialNoDetails", formats: ["xls", "pdf"] },
      { id: "sono-wise-generate-serial", name: "SONO wise Generate SerialNo", apiKey: "sonoWiseGenerateSerial", formats: ["xls", "pdf"] },
      { id: "date-wise-mi-status", name: "Date Wise MI Status", apiKey: "dateWiseMiStatus", formats: ["xls", "pdf"] },
    ],
  },
  {
    id: "shortages-process",
    title: "Shortages and Process",
    reports: [
      { id: "customer-wise-shortages", name: "Customer Wise Shortages", apiKey: "customerWiseShortages", formats: ["xls", "pdf"] },
      { id: "order-under-packing", name: "Order Under Packing", apiKey: "orderUnderPacking", formats: ["xls", "pdf"] },
      { id: "order-under-painting", name: "Order Under Painting", apiKey: "orderUnderPainting", formats: ["xls", "pdf"] },
      { id: "final-inspection-report", name: "Final Inspection Report", apiKey: "finalInspectionReport", formats: ["xls", "pdf"] },
      { id: "manufacturing-plan-quantity", name: "Manufacturing Plan Quantity", apiKey: "manufacturingPlanQuantity", formats: ["xls", "pdf"] },
      { id: "name-plate-printing-details", name: "Name Plate Printing Details", apiKey: "namePlatePrintingDetails", formats: ["xls", "pdf"] },
    ],
  },
  {
    id: "dispatch-status",
    title: "Dispatch and Status",
    reports: [
      { id: "work-order", name: "Work Order", apiKey: "workOrder", formats: ["xls", "pdf"] },
      { id: "vat-402-detail-report", name: "Vat 402 Detail Report", apiKey: "vat402DetailReport", formats: ["xls", "pdf"] },
      { id: "order-status-history", name: "Order Status History", apiKey: "orderStatusHistory", formats: ["xls", "pdf"] },
      { id: "date-wise-packing", name: "Date Wise Packing", apiKey: "dateWisePacking", formats: ["xls", "pdf"] },
      { id: "delivery-id-wise-dispatched", name: "Delivery Id Wise Dispatched", apiKey: "deliveryIdWiseDispatched", formats: ["xls", "pdf"] },
      { id: "transporter-waybill-details", name: "Transporter WayBill Details", apiKey: "transporterWaybillDetails", formats: ["xls", "pdf"] },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    reports: [
      { id: "material-issue-slip", name: "Material Issue Slip", apiKey: "materialIssueSlip", formats: ["xls", "pdf"] },
      { id: "on-hand-quantity", name: "On-Hand Quantity", apiKey: "onHandQuantity", formats: ["xls", "pdf"] },
      { id: "part-list-slip", name: "Part List Slip", apiKey: "partListSlip", formats: ["xls", "pdf"] },
      { id: "invoice-report", name: "Invoice Report", apiKey: "invoiceReport", formats: ["xls", "pdf"] },
    ],
  },
];

const importedSalesOrders = barcodeImportSalesOrdersResponse.data || [];

export const barcodeMockData = {
  recentSalesOrders,
  importedSalesOrders,
  orderTracking,
  salesOrdersResponse: barcodeSalesOrdersResponse,
  importSalesOrdersResponse: barcodeImportSalesOrdersResponse,
  salesOrderDetailsByNumber: barcodeSalesOrderDetailsByNumber,
  salesOrders: Object.values(barcodeSalesOrderDetailsByNumber),
  editSalesOrder: {
    statusOptions: [
      { value: "Hold", label: "Hold" },
      { value: "Planning", label: "Planning" },
      { value: "Sortage", label: "Sortage" },
      { value: "Actual Release", label: "Actual Release" },
      { value: "Cancel", label: "Cancel" },
    ],
    editableFields: [
      "road_permit",
      "delivery_month",
      "status",
      "shipping_instructions",
      "packing_instruction",
    ],
    lineItemDrafts: salesOrderViewModels.flatMap((salesOrder) =>
      salesOrder.line_items.map((lineItem) => ({
        order_number: salesOrder.order.order_number,
        line_no: lineItem.line_no,
        road_permit: lineItem.road_permit,
        delivery_month: lineItem.delivery_month,
        status: lineItem.status,
      }))
    ),
  },
  finalInspection: {
    lookupBySerial: gearMotorLookups,
    defaultAccessories,
  },
  orderCompletion: {
    lookupBySerial: gearMotorLookups,
    statusOptions: ["PK", "PI"],
  },
  reports: {
    downloadableFormats: ["xls", "pdf"] as const,
    categories: reportCategories,
  },
};

export const ordertrackingdata = barcodeMockData.orderTracking;

export const salesorderslineitems = {
  statusActionMap,
  salesOrders: salesOrderViewModels,
};

export const barcodeSalesOrderRows = mapSalesOrdersList(barcodeSalesOrdersResponse);

export const barcodeRecentSalesOrders = barcodeMockData.recentSalesOrders;
export const barcodeImportedSalesOrders = barcodeMockData.importedSalesOrders;
export const barcodeReportCategories = barcodeMockData.reports.categories;
export const barcodeGearMotorLookups = barcodeMockData.finalInspection.lookupBySerial;
export const barcodeEditSalesOrderConfig = barcodeMockData.editSalesOrder;
