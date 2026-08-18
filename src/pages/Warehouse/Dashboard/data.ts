import { extractApiRows } from "../shared/gridApiHelpers";
import { Pallet, Rack, Section, Shelf, Warehouse } from "./types";

const SECTION_COLORS = ["#FF8A3D", "#4CAF50", "#1D4ED8", "#F44336", "#7C3AED", "#0EA5E9"];

const firstString = (...values: unknown[]) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0) as
    | string
    | undefined;

const firstId = (...values: unknown[]) =>
  values.find(
    (value): value is string | number =>
      (typeof value === "string" || typeof value === "number") &&
      value !== ""
  );

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown) => value === true || value === 1 || value === "1";

const buildItem = (item: any, index: number): Pallet => ({
  id:
    firstString(item.oracle_code, item.item_code, item.name, item.product) ||
    `Item ${firstId(item.id, index + 1)}`,
  recordId: firstId(item.id, item.item_id),
  pallet_id: item.pallet_id,
  rack_id: item.rack_id,
  sub_loc_id: item.sub_loc_id,
  product:
    firstString(item.product, item.item_name, item.item_title, item.oracle_code, item.name) ||
    `Item ${firstId(item.id, index + 1)}`,
  qty: toNumber(item.qty),
  inQty: toNumber(item.in_qty ?? item.inQty ?? item.qty),
  outQty: toNumber(item.out_qty ?? item.outQty),
  oracle_code: firstString(item.oracle_code, item.item_code, item.product),
  item_desc: firstString(item.item_desc, item.item_description, item.description),
  item_category: firstString(item.item_category, item.category, item.item_group),
  locator: firstString(item.locator, item.locator_code, item.loc_code),
  description: firstString(item.description, item.item_description),
  sub_inventory: firstString(item.sub_inventory, item.subInventory),
  supplier_id: firstId(item.supplier_id, item.supplierId, item.vendor_id, item.vendorId),
  supplierId: firstId(item.supplierId, item.supplier_id, item.vendorId, item.vendor_id),
  has_expiry_date: toBoolean(item.has_expiry ?? item.has_expiry_date),
  expiry_date: item.expiry_date ? String(item.expiry_date) : null,
  item_image_document_id: toNumber(item.item_image_document_id ?? item.document_id) || null,
  item_image_name: firstString(item.item_image_name, item.file_name, item.image_name),
  item_image_path:
    firstString(item.file_url, item.item_image_path, item.image_path, item.path, item.image_url) ||
    null,
  qr_code: firstString(item.qr_code, item.barcode),
});

const buildShelf = (pallet: any, index: number, items: any[]): Shelf => {
  const palletItems = items
    .filter((item) => String(item.pallet_id) === String(pallet.id))
    .map(buildItem);

  const capacity = toNumber(pallet.max_capacity ?? pallet.capacity, 100);
  const used = palletItems.reduce((total, item) => total + item.qty, 0);

  return {
    id:
      firstString(pallet.pallet_code, pallet.code, pallet.name) ||
      `Pallet ${firstId(pallet.id, index + 1)}`,
    recordId: firstId(pallet.id, pallet.pallet_id),
    capacity,
    used,
    pallets: palletItems,
  };
};

const buildRack = (rack: any, index: number, pallets: any[], items: any[]): Rack => ({
  id: firstString(rack.rack_code, rack.code, rack.name) || `R${firstId(rack.id, index + 1)}`,
  recordId: firstId(rack.id, rack.rack_id),
  name:
    firstString(rack.rack_description, rack.rack_code, rack.name) ||
    `Rack ${firstId(rack.id, index + 1)}`,
  shelves: pallets
    .filter((pallet) => String(pallet.rack_id) === String(rack.id))
    .map((pallet, palletIndex) => buildShelf(pallet, palletIndex, items)),
});

const buildSection = (
  zone: any,
  index: number,
  racks: any[],
  pallets: any[],
  items: any[]
): Section => ({
  id: firstString(zone.zone_code, zone.code, zone.name) || `ZONE-${firstId(zone.id, index + 1)}`,
  recordId: firstId(zone.id, zone.zone_id),
  warehouse_id: zone.warehouse_id,
  name:
    firstString(zone.zone_title, zone.name, zone.zone_code) ||
    `Zone ${firstId(zone.id, index + 1)}`,
  color: SECTION_COLORS[index % SECTION_COLORS.length],
  racks: racks
    .filter((rack) => String(rack.zone_id) === String(zone.id))
    .map((rack, rackIndex) => buildRack(rack, rackIndex, pallets, items)),
});

export const buildWarehouseHierarchy = ({
  warehousesResponse,
  zonesResponse,
  racksResponse,
  palletsResponse,
  itemsResponse,
}: {
  warehousesResponse: unknown;
  zonesResponse: unknown;
  racksResponse: unknown;
  palletsResponse: unknown;
  itemsResponse: unknown;
}): Warehouse[] => {
  const warehouses = extractApiRows(warehousesResponse);
  const zones = extractApiRows(zonesResponse);
  const racks = extractApiRows(racksResponse);
  const pallets = extractApiRows(palletsResponse);
  const items = extractApiRows(itemsResponse);

  return warehouses.map((warehouse: any, index: number) => ({
    id:
      firstString(warehouse.warehouse_code, warehouse.code, warehouse.name) ||
      `WH-${firstId(warehouse.id, index + 1)}`,
    recordId: firstId(warehouse.id, warehouse.warehouse_id),
    orgId: firstString(warehouse.orgId, warehouse.org_id),
    name:
      firstString(warehouse.warehouse_name, warehouse.warehouseName, warehouse.name) ||
      `Warehouse ${firstId(warehouse.id, index + 1)}`,
    managerName: firstString(
      warehouse.managerName,
      warehouse.manager_name,
      warehouse.warehouse_info?.manager_name,
      warehouse.warehouseInfo?.manager_name
    ),
    contact_no: firstString(
      warehouse.contact_no,
      warehouse.contact_number,
      warehouse.contactNumber,
      warehouse.warehouse_info?.contact_no,
      warehouse.warehouseInfo?.contact_no
    ),
    email: firstString(
      warehouse.email,
      warehouse.warehouse_info?.email,
      warehouse.warehouseInfo?.email
    ),
    address:
      firstString(
        warehouse.address,
        warehouse.warehouse_info?.address,
        warehouse.warehouseInfo?.address,
        warehouse.city,
        warehouse.warehouse_info?.city,
        warehouse.warehouseInfo?.city
      ) || "Address not available",
    notes: firstString(
      warehouse.notes,
      warehouse.warehouse_info?.notes,
      warehouse.warehouseInfo?.notes
    ),
    status: firstString(warehouse.status) as "ACTIVE" | "INACTIVE" | undefined,
    sections: zones
      .filter((zone: any) => String(zone.warehouse_id) === String(warehouse.id))
      .map((zone: any, sectionIndex: number) =>
        buildSection(zone, sectionIndex, racks, pallets, items)
      ),
  }));
};
