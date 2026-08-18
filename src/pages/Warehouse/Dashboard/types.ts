export type Pallet = {
  id: string;
  recordId?: string | number;
  product: string;
  qty: number;
  inQty?: number;
  outQty?: number;
  pallet_id?: number | string;
  rack_id?: number | string;
  sub_loc_id?: number | string;
  oracle_code?: string;
  supplier_id?: number | string;
  supplierId?: number | string;
  item_desc?: string;
  item_category?: string;
  locator?: string;
  description?: string;
  sub_inventory?: string;
  has_expiry_date?: boolean;
  expiry_date?: string | null;
  item_image_document_id?: number | null;
  item_image_name?: string | null;
  item_image_path?: string | null;
  qr_code?: string;
};

export type Shelf = {
  id: string;
  recordId?: string | number;
  capacity: number;
  used: number;
  pallets: Pallet[];
};

export type Rack = {
  id: string;
  recordId?: string | number;
  name: string;
  shelves: Shelf[];
};

export type Section = {
  id: string;
  recordId?: string | number;
  warehouse_id?: string | number;
  name: string;
  color: string;
  racks: Rack[];
};

export type Warehouse = {
  id: string;
  recordId?: string | number;
  orgId?: string;
  name: string;
  managerName?: string;
  contact_no?: string;
  email?: string;
  address: string;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE";
  sections: Section[];
};
