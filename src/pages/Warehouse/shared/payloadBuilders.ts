type StringLike = string | number | boolean | null | undefined;

const normalizeString = (value: StringLike) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : undefined;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const compactObject = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const resolveActor = (actor?: string | null) => normalizeString(actor) || "admin";

const appendFormValue = (formData: FormData, key: string, value: StringLike) => {
  const normalized = normalizeString(value);
  if (normalized !== undefined) {
    formData.append(key, normalized);
  }
};

const isClientPreviewPath = (value: StringLike) =>
  typeof value === "string" && /^(data:|blob:)/i.test(value);

export const buildWarehouseCreatePayload = (
  payload: {
    warehouseCode?: StringLike;
    warehouseName?: StringLike;
    managerName?: StringLike;
    contactNo?: StringLike;
    email?: StringLike;
    address?: StringLike;
    notes?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_code: normalizeString(payload.warehouseCode),
    warehouse_name: normalizeString(payload.warehouseName),
    manager_name: normalizeString(payload.managerName),
    contact_no: normalizeString(payload.contactNo),
    email: normalizeString(payload.email),
    address: normalizeString(payload.address),
    notes: normalizeString(payload.notes),
    status: normalizeString(payload.status),
    created_by: resolveActor(actor),
  });

export const buildWarehouseUpdatePayload = (
  payload: {
    warehouseCode?: StringLike;
    warehouseName?: StringLike;
    managerName?: StringLike;
    contactNo?: StringLike;
    email?: StringLike;
    address?: StringLike;
    notes?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_code: normalizeString(payload.warehouseCode),
    warehouse_name: normalizeString(payload.warehouseName),
    manager_name: normalizeString(payload.managerName),
    contact_no: normalizeString(payload.contactNo),
    email: normalizeString(payload.email),
    address: normalizeString(payload.address),
    notes: normalizeString(payload.notes),
    status: normalizeString(payload.status),
    updated_by: resolveActor(actor),
  });

export const buildZoneCreatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_code?: StringLike;
    zone_title?: StringLike;
    zone_description?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_code: normalizeString(payload.zone_code),
    zone_title: normalizeString(payload.zone_title),
    zone_description: normalizeString(payload.zone_description),
    status: normalizeString(payload.status),
    created_by: resolveActor(actor),
  });

export const buildZoneUpdatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_code?: StringLike;
    zone_title?: StringLike;
    zone_description?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_code: normalizeString(payload.zone_code),
    zone_title: normalizeString(payload.zone_title),
    zone_description: normalizeString(payload.zone_description),
    status: normalizeString(payload.status),
    updated_by: resolveActor(actor),
  });

export const buildRackCreatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_id?: StringLike;
    rack_code?: StringLike;
    rack_description?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_id: normalizeString(payload.zone_id),
    rack_code: normalizeString(payload.rack_code),
    rack_description: normalizeString(payload.rack_description),
    status: normalizeString(payload.status),
    created_by: resolveActor(actor),
  });

export const buildRackUpdatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_id?: StringLike;
    rack_code?: StringLike;
    rack_description?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_id: normalizeString(payload.zone_id),
    rack_code: normalizeString(payload.rack_code),
    rack_description: normalizeString(payload.rack_description),
    status: normalizeString(payload.status),
    updated_by: resolveActor(actor),
  });

export const buildPalletCreatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_id?: StringLike;
    rack_id?: StringLike;
    pallet_code?: StringLike;
    max_capacity?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_id: normalizeString(payload.zone_id),
    rack_id: normalizeString(payload.rack_id),
    pallet_code: normalizeString(payload.pallet_code),
    max_capacity: normalizeString(payload.max_capacity),
    status: normalizeString(payload.status),
    created_by: resolveActor(actor),
  });

export const buildPalletUpdatePayload = (
  payload: {
    warehouse_id?: StringLike;
    zone_id?: StringLike;
    rack_id?: StringLike;
    pallet_code?: StringLike;
    max_capacity?: StringLike;
    status?: StringLike;
  },
  actor?: string | null
) =>
  compactObject({
    warehouse_id: normalizeString(payload.warehouse_id),
    zone_id: normalizeString(payload.zone_id),
    rack_id: normalizeString(payload.rack_id),
    pallet_code: normalizeString(payload.pallet_code),
    max_capacity: normalizeString(payload.max_capacity),
    status: normalizeString(payload.status),
    updated_by: resolveActor(actor),
  });

export const buildWarehouseItemCreateFormData = (payload: {
  oracle_code?: StringLike;
  sub_loc_id?: StringLike;
  pallet_id?: StringLike;
  rack_id?: StringLike;
  qty?: StringLike;
  has_expiry?: StringLike;
  expiry_date?: StringLike;
  item_desc?: StringLike;
  item_category?: StringLike;
  locator?: StringLike;
  sub_inventory?: StringLike;
  detail_qty?: StringLike;
  in_qty?: StringLike;
  out_qty?: StringLike;
  item_image_document_id?: StringLike;
  item_image_name?: StringLike;
  item_image_path?: StringLike;
  file_name?: StringLike;
  qr_code?: StringLike;
  item_image_file?: File | null;
}) => {
  const formData = new FormData();

  appendFormValue(formData, "oracle_code", payload.oracle_code);
  appendFormValue(formData, "sub_loc_id", payload.sub_loc_id);
  appendFormValue(formData, "pallet_id", payload.pallet_id);
  appendFormValue(formData, "rack_id", payload.rack_id);
  appendFormValue(formData, "qty", payload.qty);
  appendFormValue(formData, "has_expiry", payload.has_expiry);
  appendFormValue(formData, "expiry_date", payload.expiry_date);
  appendFormValue(formData, "item_desc", payload.item_desc);
  appendFormValue(formData, "item_category", payload.item_category);
  appendFormValue(formData, "locator", payload.locator);
  appendFormValue(formData, "sub_inventory", payload.sub_inventory);
  appendFormValue(formData, "detail_qty", payload.detail_qty);
  appendFormValue(formData, "in_qty", payload.in_qty);
  appendFormValue(formData, "out_qty", payload.out_qty);
  appendFormValue(formData, "item_image_document_id", payload.item_image_document_id);
  appendFormValue(formData, "item_image_name", payload.item_image_name);
  if (!isClientPreviewPath(payload.item_image_path)) {
    appendFormValue(formData, "item_image_path", payload.item_image_path);
  }
  appendFormValue(formData, "file_name", payload.file_name);
  appendFormValue(formData, "qr_code", payload.qr_code);

  if (payload.item_image_file instanceof File) {
    formData.append("file", payload.item_image_file);
  }

  return formData;
};

export const buildWarehouseItemUpdateFormData = (payload: {
  sub_loc_id?: StringLike;
  pallet_id?: StringLike;
  rack_id?: StringLike;
  oracle_code?: StringLike;
  qty?: StringLike;
  has_expiry?: StringLike;
  expiry_date?: StringLike;
  item_desc?: StringLike;
  item_category?: StringLike;
  locator?: StringLike;
  sub_inventory?: StringLike;
  detail_qty?: StringLike;
  in_qty?: StringLike;
  out_qty?: StringLike;
  item_image_document_id?: StringLike;
  item_image_name?: StringLike;
  item_image_path?: StringLike;
  file_name?: StringLike;
  qr_code?: StringLike;
  item_image_file?: File | null;
}) => {
  const formData = new FormData();

  appendFormValue(formData, "sub_loc_id", payload.sub_loc_id);
  appendFormValue(formData, "pallet_id", payload.pallet_id);
  appendFormValue(formData, "rack_id", payload.rack_id);
  appendFormValue(formData, "oracle_code", payload.oracle_code);
  appendFormValue(formData, "qty", payload.qty);
  appendFormValue(formData, "has_expiry", payload.has_expiry);
  appendFormValue(formData, "expiry_date", payload.expiry_date);
  appendFormValue(formData, "item_desc", payload.item_desc);
  appendFormValue(formData, "item_category", payload.item_category);
  appendFormValue(formData, "locator", payload.locator);
  appendFormValue(formData, "sub_inventory", payload.sub_inventory);
  appendFormValue(formData, "detail_qty", payload.detail_qty);
  appendFormValue(formData, "in_qty", payload.in_qty);
  appendFormValue(formData, "out_qty", payload.out_qty);
  appendFormValue(formData, "item_image_document_id", payload.item_image_document_id);
  appendFormValue(formData, "file_name", payload.file_name);

  if (payload.item_image_file instanceof File) {
    formData.append("file", payload.item_image_file);
  }

  return formData;
};
