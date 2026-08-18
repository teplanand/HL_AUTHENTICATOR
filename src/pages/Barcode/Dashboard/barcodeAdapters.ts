import {
  BarcodeSalesOrderDetailsRaw,
  BarcodeSalesOrderLineRaw,
  BarcodeSalesOrderLineSerialRaw,
  BarcodeSerialLookupResponseData,
} from "../api/barcode";

export type BarcodeSalesOrderStatus =
  | "New Sales Order"
  | "HOD Review"
  | "Planning"
  | "Dispatched";

export type BarcodeLineStatusCode = "PL" | "SH" | "MI" | "PI" | "PK" | "BOOKED";

export type BarcodeRecentOrderRow = {
  id: string;
  orderId: string;
  customerName: string;
  customerId: string;
  status: BarcodeSalesOrderStatus;
  createdAt: string;
  orderNumber: string;
  headerId?: number | null;
  rawOrderStatus?: string;
  importStatus?: boolean | null;
  generateStatus?: boolean | null;
  organizationId?: number | null;
  divisionId?: number | null;
};

export type BarcodeSerialItemViewModel = {
  id?: number | null;
  serial_no: string;
  ass_rel_date: string | null;
  ac_ua_date: string | null;
  ac_qc_date: string | null;
  ac_comp_date: string | null;
  ac_pi_date: string | null;
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

export type BarcodeLineItemViewModel = {
  id: string;
  lineId: number;
  headerId: number | null;
  orgId: number | null;
  shipFromOrgId: number | null;
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
  wo_date: string | null;
  client_delivery_date: string | null;
  delivery_month: string | null;
  con_auth: string | null;
  status: BarcodeLineStatusCode;
  mail_status: string;
  model: string;
  model_type: string;
  ratio: number;
  kw: number;
  quantitys: BarcodeSerialItemViewModel[];
};

export type BarcodeSalesOrderDetailsViewModel = {
  header_id: number | null;
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
  line_items: BarcodeLineItemViewModel[];
};

export type BarcodeSerialLookupViewModel = {
  rpm: string;
  motorSerialNumber: string;
  model: string;
  workOrderNumber: string;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumberValue = (value: unknown, fallback = 0): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const deriveLineStatus = (lineItem: BarcodeSalesOrderLineRaw): BarcodeLineStatusCode => {
  const serialItems = lineItem.quantitys || lineItem.serial_line_items || [];
  const workOrderNumber = toStringValue(lineItem.wo_no ?? lineItem.WIP_ENTITY_NAME);

  if (serialItems.some((serialItem) => toStringValue(serialItem.status).toUpperCase() === "PK")) {
    return "PK";
  }

  if (
    serialItems.some((serialItem) => {
      const status = toStringValue(serialItem.status).toUpperCase();
      return status === "MI" || Boolean(serialItem.ac_comp_date || serialItem.ac_ua_date);
    })
  ) {
    return "MI";
  }

  if (serialItems.some((serialItem) => toStringValue(serialItem.status).toUpperCase() === "PL")) {
    return "PL";
  }

  if (!serialItems.length && !workOrderNumber) {
    return "BOOKED";
  }

  return "SH";
};

const deriveSalesOrderStatus = (
  lineItems: BarcodeLineItemViewModel[]
): BarcodeSalesOrderStatus => {
  const statuses = lineItems.map((lineItem) => lineItem.status);

  if (statuses.some((status) => status === "PK")) {
    return "Dispatched";
  }

  if (statuses.some((status) => status === "MI")) {
    return "Planning";
  }

  if (statuses.some((status) => status === "SH")) {
    return "HOD Review";
  }

  return "New Sales Order";
};

const getMailStatus = (status: BarcodeLineStatusCode) => {
  switch (status) {
    case "PK":
      return "Ready for label print";
    case "MI":
      return "Material issued";
    case "SH":
      return "Serial number available";
    case "BOOKED":
    default:
      return "Awaiting work order";
  }
};

export const mapSerialItem = (
  serialItem: BarcodeSalesOrderLineSerialRaw
): BarcodeSerialItemViewModel => ({
  id: (() => {
    const resolvedId = toNumberValue(
      serialItem.id ?? (serialItem as Record<string, unknown>).ID,
      0
    );
    return resolvedId > 0 ? resolvedId : null;
  })(),
  serial_no: toStringValue(serialItem.serial_no ?? serialItem.SERIAL_NO),
  ass_rel_date: toStringValue(serialItem.ass_rel_date ?? serialItem.ASS_REL_DATE) || null,
  ac_ua_date: toStringValue(serialItem.ac_ua_date ?? serialItem.AC_UA_DATE) || null,
  ac_qc_date: toStringValue(serialItem.ac_qc_date ?? serialItem.AC_QC_DATE) || null,
  ac_comp_date: toStringValue(serialItem.ac_comp_date ?? serialItem.AC_COMP_DATE) || null,
  ac_pi_date: toStringValue(serialItem.ac_pi_date ?? serialItem.AC_PI_DATE) || null,
  ac_pk_date: toStringValue(serialItem.ac_pk_date ?? serialItem.AC_PK_DATE) || null,
  ac_ds_date: toStringValue(serialItem.ac_ds_date ?? serialItem.AC_DS_DATE) || null,
  tent_rel_date: toStringValue(serialItem.tent_rel_date ?? serialItem.TENT_REL_DATE) || null,
  status:
    (toStringValue(serialItem.status ?? serialItem.STATUS).toUpperCase() as BarcodeLineStatusCode) ||
    "SH",
  sh_type: toStringValue(serialItem.sh_type ?? serialItem.SH_TYPE) || null,
  sh_item: toStringValue(serialItem.sh_item ?? serialItem.SH_ITEM) || null,
  rpm: toStringValue(serialItem.rpm ?? serialItem.RPM) || null,
  motor_serial_no:
    toStringValue(serialItem.motor_serial_no ?? serialItem.MOTOR_SERIAL_NO) || null,
  ac_ho_date: toStringValue(serialItem.ac_ho_date ?? serialItem.AC_HO_DATE) || null,
  ac_ca_date: toStringValue(serialItem.ac_ca_date ?? serialItem.AC_CA_DATE) || null,
});

const mapLineItem = (
  lineItem: BarcodeSalesOrderLineRaw,
  index: number,
  shippingCity: string
): BarcodeLineItemViewModel => {
  const status = deriveLineStatus(lineItem);
  const lineId = toNumberValue(lineItem.lineId ?? lineItem.LINE_ID ?? lineItem.id);
  const quantity = toNumberValue(lineItem.quantity ?? lineItem.ORDERED_QUANTITY);
  const serialItems = (lineItem.quantitys || lineItem.serial_line_items || []).map(
    mapSerialItem
  );

  return {
    id: String(lineId || `${index + 1}`),
    lineId,
    headerId: toNumberValue(lineItem.headerId ?? lineItem.HEADER_ID, 0) || null,
    orgId: toNumberValue(lineItem.orgId ?? lineItem.ORG_ID, 0) || null,
    shipFromOrgId: toNumberValue(lineItem.SHIP_FROM_ORG_ID, 0) || null,
    line_no: toStringValue(lineItem.line_no, `${index + 1}`),
    item_code: toStringValue(lineItem.item_code ?? lineItem.ORDERED_ITEM),
    description: toStringValue(
      lineItem.description ?? lineItem.DESCRIPTION,
      "Description not available"
    ),
    quantity,
    list_price: toNumberValue(lineItem.list_price ?? lineItem.UNIT_LIST_PRICE),
    discount_percent: toNumberValue(lineItem.discount_percent ?? lineItem.DISCOUNT),
    selling_price: toNumberValue(lineItem.selling_price ?? lineItem.UNIT_SELLING_PRICE),
    amount: toNumberValue(lineItem.amount ?? lineItem.AMOUNT),
    ship_to_location:
      toStringValue(lineItem.ship_to_location) ||
      shippingCity ||
      toStringValue(lineItem.SHIP_TO_ORG_ID, "--"),
    road_permit: Boolean(lineItem.road_permit),
    wo_no: toStringValue(lineItem.wo_no ?? lineItem.WIP_ENTITY_NAME),
    wo_date: toStringValue(lineItem.wo_date ?? lineItem.CREATION_DATE) || null,
    client_delivery_date: toStringValue(lineItem.client_delivery_date) || null,
    delivery_month: toStringValue(lineItem.delivery_month) || null,
    con_auth: toStringValue(lineItem.con_auth) || null,
    status,
    mail_status: toStringValue(lineItem.mail_status) || getMailStatus(status),
    model: toStringValue(lineItem.model ?? lineItem.MODEL),
    model_type: toStringValue(lineItem.model_type ?? lineItem.MODEL_TYPE),
    ratio: toNumberValue(lineItem.ratio ?? lineItem.RATIO),
    kw: toNumberValue(lineItem.kw ?? lineItem.KW),
    quantitys: serialItems,
  };
};

export const mapSalesOrderDetails = (
  rawDetails?: BarcodeSalesOrderDetailsRaw | null
): BarcodeSalesOrderDetailsViewModel | null => {
  if (!rawDetails?.order?.order_number) {
    return null;
  }

  const shippingCity = toStringValue(rawDetails.shipping_address?.city);
  const lineItems = (rawDetails.line_items || []).map((lineItem, index) =>
    mapLineItem(lineItem, index, shippingCity)
  );

  return {
    header_id: rawDetails.header_id ?? null,
    order: {
      order_number: toStringValue(rawDetails.order?.order_number),
      order_type: toStringValue(rawDetails.order?.order_type),
      status: toStringValue(rawDetails.order?.status),
      order_date: toStringValue(rawDetails.order?.order_date),
      currency: toStringValue(rawDetails.order?.currency),
      tax_category: toStringValue(rawDetails.order?.tax_category),
    },
    order_information: {
      main: {
        customer: {
          name: toStringValue(rawDetails.customer?.name ?? rawDetails.customer?.customer_name),
          customer_number: toStringValue(rawDetails.customer?.customer_number),
          customer_po: toStringValue(rawDetails.customer?.customer_po),
          contact: toStringValue(rawDetails.customer?.contact),
        },
        addresses: {
          shipping: {
            location:
              toStringValue(rawDetails.shipping_address?.location) ||
              toStringValue(rawDetails.shipping_address?.city),
            address_line_1: toStringValue(rawDetails.shipping_address?.address_line_1),
            address_line_2: toStringValue(rawDetails.shipping_address?.address_line_2),
            city: toStringValue(rawDetails.shipping_address?.city),
            pincode: toStringValue(rawDetails.shipping_address?.pincode),
            state: toStringValue(rawDetails.shipping_address?.state),
          },
          billing: {
            location:
              toStringValue(rawDetails.billing_address?.location) ||
              toStringValue(rawDetails.billing_address?.city),
            address_line_1: toStringValue(rawDetails.billing_address?.address_line_1),
            address_line_2: toStringValue(rawDetails.billing_address?.address_line_2),
            city: toStringValue(rawDetails.billing_address?.city),
            pincode: toStringValue(rawDetails.billing_address?.pincode),
            state: toStringValue(rawDetails.billing_address?.state),
          },
        },
        sales: {
          sales_person: toStringValue(rawDetails.sales?.sales_person),
          price_list: toStringValue(rawDetails.sales?.price_list),
        },
        amount: {
          sub_total: toNumberValue(rawDetails.amounts?.sub_total),
          tax: toNumberValue(rawDetails.amounts?.tax),
          total: toNumberValue(rawDetails.amounts?.total),
        },
        bank_details: {
          context_value: toStringValue(rawDetails.bank_details?.context_value, "Bank Details"),
          bank_address: toStringValue(rawDetails.bank_details?.bank_address),
          lc_no: "",
          delivery_condition: toStringValue(rawDetails.bank_details?.delivery_condition),
          destination:
            toStringValue(rawDetails.bank_details?.destination) ||
            toStringValue(rawDetails.shipping_address?.city),
          group_proj_ref: toStringValue(rawDetails.bank_details?.group_proj_ref),
          proj_title: toStringValue(rawDetails.bank_details?.proj_title),
          insurance_by: toStringValue(rawDetails.bank_details?.insurance_by),
          bank_name: toStringValue(rawDetails.bank_details?.bank_name),
          contact_name: toStringValue(rawDetails.bank_details?.contact_name),
          email_address_and_phone: toStringValue(
            rawDetails.bank_details?.email_address_and_phone
          ),
        },
      },
      other_details: {
        payment_terms: toStringValue(
          rawDetails.other_details?.payment_terms ?? rawDetails.payment?.payment_terms
        ),
        warehouse: toStringValue(rawDetails.other_details?.warehouse),
        line_set: "",
        fob: toStringValue(rawDetails.other_details?.fob),
        shipping_instructions: "",
        tax_handling: "",
        exempt_reason: "",
        amount: toStringValue(rawDetails.amounts?.total),
        credit_card_type: "",
        card_holder: "",
        approval_code: "",
        order_source: toStringValue(rawDetails.other_details?.order_source),
        sales_channel: toStringValue(rawDetails.sales?.sales_channel),
        shipping_method: toStringValue(
          rawDetails.other_details?.shipping_method ?? rawDetails.shipping?.shipping_method
        ),
        freight_terms: toStringValue(
          rawDetails.other_details?.freight_terms ?? rawDetails.shipping?.freight_terms
        ),
        shipment_priority: toStringValue(rawDetails.other_details?.shipment_priority),
        packing_instruction: toStringValue(rawDetails.other_details?.packing_instruction),
        tax_exempt_number: "",
        payment_type: "",
        cheque_number: "",
        credit_card_number: "",
        card_expiry_date: "",
        prepaid_amount: "",
        order_source_reference: toStringValue(rawDetails.other_details?.order_source_reference),
      },
    },
    line_items: lineItems,
  };
};

export const mapSalesOrderSummaryRow = (
  orderDetails?: BarcodeSalesOrderDetailsRaw | null
): BarcodeRecentOrderRow | null => {
  const mappedDetails = mapSalesOrderDetails(orderDetails);
  if (!mappedDetails) {
    return null;
  }

  return {
    id: mappedDetails.order.order_number,
    orderId: `SO-${mappedDetails.order.order_number}`,
    customerName: mappedDetails.order_information.main.customer.name || "Unknown Customer",
    customerId: mappedDetails.order_information.main.customer.customer_number || "--",
    status: deriveSalesOrderStatus(mappedDetails.line_items),
    createdAt: mappedDetails.order.order_date,
    orderNumber: mappedDetails.order.order_number,
    headerId: mappedDetails.header_id,
    rawOrderStatus: mappedDetails.order.status,
  };
};

const extractSalesOrdersArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  const nestedArrayCandidates = [
    value.data,
    value.rows,
    value.items,
    value.results,
    value.salesOrders,
    value.orders,
  ];

  for (const candidate of nestedArrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const mapGenericSalesOrderRow = (item: unknown, index: number): BarcodeRecentOrderRow | null => {
  if (!isRecord(item)) {
    return null;
  }

  const orderNumber = toStringValue(
    item.oracle_order_no ??
      item.order_number ??
      item.orderNumber ??
      item.ordernumber ??
      item.order_no ??
      item.orderId
  );

  if (!orderNumber) {
    return null;
  }

  const rawStatus = toStringValue(item.order_status ?? item.status);
  let normalizedStatus: BarcodeSalesOrderStatus = "New Sales Order";

  if (rawStatus.toUpperCase().includes("DISPATCH") || rawStatus.toUpperCase().includes("CLOSE")) {
    normalizedStatus = "Dispatched";
  } else if (item.generate_status === true) {
    normalizedStatus = "Planning";
  } else if (item.import_status === true) {
    normalizedStatus = "HOD Review";
  }

  return {
    id: toStringValue(item.id, orderNumber || `${index + 1}`),
    orderId: toStringValue(item.orderId, `SO-${orderNumber}`),
    customerName: toStringValue(
      item.customer_name ?? item.customerName ?? item.customer ?? item.customer_name1,
      "Unknown Customer"
    ),
    customerId: toStringValue(
      item.customer_number ?? item.customerId ?? item.customer_id ?? item.cust_code,
      "--"
    ),
    status: normalizedStatus,
    createdAt: toStringValue(
      item.order_booked_date ??
        item.order_date ??
        item.createdAt ??
        item.creation_date ??
        item.booked_date
    ),
    orderNumber,
    headerId:
      item.header_id !== undefined && item.header_id !== null
        ? toNumberValue(item.header_id)
        : null,
    rawOrderStatus: rawStatus,
    importStatus: typeof item.import_status === "boolean" ? item.import_status : null,
    generateStatus:
      typeof item.generate_status === "boolean" ? item.generate_status : null,
    organizationId:
      item.organization_id !== undefined && item.organization_id !== null
        ? toNumberValue(item.organization_id)
        : null,
    divisionId:
      item.division_id !== undefined && item.division_id !== null
        ? toNumberValue(item.division_id)
        : null,
  };
};

export const mapSalesOrdersList = (payload: unknown): BarcodeRecentOrderRow[] => {
  return extractSalesOrdersArray(payload)
    .map((item, index) => {
      if (isRecord(item) && (isRecord(item.order) || Array.isArray(item.line_items))) {
        return mapSalesOrderSummaryRow(item as BarcodeSalesOrderDetailsRaw);
      }

      return mapGenericSalesOrderRow(item, index);
    })
    .filter((item): item is BarcodeRecentOrderRow => Boolean(item));
};

export const mapSerialLookup = (
  data?: BarcodeSerialLookupResponseData | null,
  serialNumber?: string
): BarcodeSerialLookupViewModel => ({
  rpm: toStringValue(data?.rpm),
  motorSerialNumber: toStringValue(data?.motor_serial_no),
  model: toStringValue(data?.Model ?? data?.model, serialNumber ? `GM-${serialNumber}` : ""),
  workOrderNumber: toStringValue(data?.wo_no),
});
