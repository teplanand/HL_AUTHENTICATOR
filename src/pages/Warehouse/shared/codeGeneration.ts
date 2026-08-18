const toWords = (value?: string | null) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const joinCodeParts = (...parts: Array<string | null | undefined>) =>
  parts
    .map((part) => normalizeCodeValue(part))
    .filter((part): part is string => Boolean(part))
    .join("-");

export const normalizeCodeValue = (value?: string | null) => {
  const words = toWords(value);
  return words.length ? words.join("-") : "";
};

export const buildWarehouseCode = (warehouseName?: string | null) =>
  joinCodeParts("WH", normalizeCodeValue(warehouseName) || "WAREHOUSE");

export const buildZoneCode = (warehouseCode?: string | null, zoneTitle?: string | null) =>
  joinCodeParts(warehouseCode, normalizeCodeValue(zoneTitle) || "ZONE");

export const buildRackCode = (zoneCode?: string | null, rackLabel?: string | null) =>
  joinCodeParts(zoneCode, normalizeCodeValue(rackLabel) || "RACK");

export const buildPalletCode = (rackCode?: string | null, palletLabel?: string | null) =>
  joinCodeParts(rackCode, normalizeCodeValue(palletLabel) || "PALLET");
