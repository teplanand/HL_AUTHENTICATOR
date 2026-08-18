import type {
  EvidenceApiRecord,
  EvidenceCategoryOption,
  EvidenceMediaItem,
  EvidenceMediaKind,
  EvidenceReferenceOption,
  EvidenceRemarkOption,
  EvidenceViewerProfile,
} from "./types";


// {
//     "username":"TPLSR0140",
//     "password":"elecon"
// }


const ARRAY_SEARCH_DEPTH = 4;

const MEDIA_URL_KEYS = [
  "Url",
  "URL",
  "ImageUrl",
  "ImageURL",
  "VideoUrl",
  "AudioUrl",
  "MediaUrl",
  "MediaURL",
  "Path",
  "FilePath",
  "FileUrl",
  "DocumentUrl",
  "Src",
];

const TITLE_KEYS = [
  "Title",
  "FileName",
  "Name",
  "ImageName",
  "DocumentName",
  "OriginalFileName",
  "RefNo",
  "ReferenceNo",
];

const DATE_KEYS = [
  "createdAt",
  "CreatedDate",
  "UploadedAt",
  "UploadDate",
  "Date",
  "CreatedOn",
];

const REMARK_KEYS = ["remark", "Remark", "remarks", "Comments", "Description"];

const CATEGORY_ID_KEYS = ["CategoryId","categoryId", "CatId", "Id", "id"];
const CATEGORY_NAME_KEYS = ["CategoryName","categoryName", "Name", "Label", "Category"];
const CHILD_CATEGORY_COLLECTION_KEYS = [
  "childDatas",
  "ChildDatas",
  "childCategories",
  "ChildCategories",
  "children",
  "Children",
];
const CHILD_CATEGORY_NAME_KEYS = [
  "childName",
  "ChildName",
  "ChildCategoryName",
  "childCategoryName",
  "SubChildCategoryName",
  "subChildCategoryName",
  "SubCategoryName",
  "subCategoryName",
];
const REFERENCE_KEYS = ["RefNo", "ReferenceNo", "ReferenceNumber", "RefNumber", "Name","referenceNumbersList"];

const isRecord = (value: unknown): value is EvidenceApiRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isPrimitive = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

export const extractArrayPayload = (
  value: unknown,
  depth = 0,
): EvidenceApiRecord[] => {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value) || depth >= ARRAY_SEARCH_DEPTH) {
    return [];
  }

  const priorityKeys = ["data", "items", "records", "result", "table", "list"];

  for (const key of priorityKeys) {
    if (key in value) {
      const result = extractArrayPayload(value[key], depth + 1);
      if (result.length) {
        return result;
      }
    }
  }

  for (const nestedValue of Object.values(value)) {
    const result = extractArrayPayload(nestedValue, depth + 1);
    if (result.length) {
      return result;
    }
  }

  return [];
};

export const extractPrimitiveArrayPayload = (
  value: unknown,
  depth = 0,
): Array<string | number> => {
  if (Array.isArray(value)) {
    return value.filter(isPrimitive);
  }

  if (!isRecord(value) || depth >= ARRAY_SEARCH_DEPTH) {
    return [];
  }

  const priorityKeys = [
    "referenceNumbersList",
    "remarksList",
    "data",
    "items",
    "records",
    "result",
    "table",
    "list",
  ];

  for (const key of priorityKeys) {
    if (key in value) {
      const result = extractPrimitiveArrayPayload(value[key], depth + 1);
      if (result.length) {
        return result;
      }
    }
  }

  for (const nestedValue of Object.values(value)) {
    const result = extractPrimitiveArrayPayload(nestedValue, depth + 1);
    if (result.length) {
      return result;
    }
  }

  return [];
};

export const extractRecordPayload = (
  value: unknown,
  depth = 0,
): EvidenceApiRecord | null => {
  if (isRecord(value)) {
    return value;
  }

  if (!value || typeof value !== "object" || depth >= ARRAY_SEARCH_DEPTH) {
    return null;
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    const result = extractRecordPayload(nestedValue, depth + 1);
    if (result) {
      return result;
    }
  }

  return null;
};

export const extractMessage = (value: unknown) => {
  if (!isRecord(value)) {
    return "";
  }

  const message = value.message ?? value.Message ?? value.detail ?? value.error;
  return typeof message === "string" ? message : "";
};

export const extractSuccess = (value: unknown) => {
  if (!isRecord(value)) {
    return false;
  }

  const status = value.status ?? value.Status ?? value.success ?? value.Success;

  if (typeof status === "boolean") {
    return status;
  }

  if (typeof status === "number") {
    return status > 0;
  }

  if (typeof status === "string") {
    return /^(true|success|ok|1)$/i.test(status);
  }

  return false;
};

const pickString = (record: EvidenceApiRecord | null, keys: string[]) => {
  if (!record) {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const pickNumber = (record: EvidenceApiRecord | null, keys: string[]) => {
  const value = pickString(record, keys);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickNestedArrayRecord = (record: EvidenceApiRecord | null, keys: string[]) => {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) {
      continue;
    }

    const nestedRecord = value.find(isRecord);
    if (nestedRecord) {
      return nestedRecord;
    }
  }

  return null;
};

const normalizePrimitiveOption = (
  value: unknown,
  prefix: string,
): EvidenceApiRecord | null => {
  if (typeof value === "string" || typeof value === "number") {
    return {
      id: `${prefix}-${value}`,
      Name: String(value),
    };
  }

  return isRecord(value) ? value : null;
};

export const normalizeCategories = (value: unknown): EvidenceCategoryOption[] => {
  const records = Array.isArray(value)
    ? value.map((entry) => normalizePrimitiveOption(entry, "category")).filter(isRecord)
    : extractArrayPayload(value);

  return records
    .map((record, index) => {
      const label = pickString(record, CATEGORY_NAME_KEYS) || `Category ${index + 1}`;
      const rawId = pickString(record, CATEGORY_ID_KEYS) || `${index + 1}`;
      return {
        id: rawId,
        numericId: pickNumber(record, CATEGORY_ID_KEYS),
        label,
        childLabel: pickString(
          pickNestedArrayRecord(record, CHILD_CATEGORY_COLLECTION_KEYS),
          CHILD_CATEGORY_NAME_KEYS,
        ),
        subtitle:
          pickString(record, ["DivisionName", "Division", "CompanyName", "Company"]) ||
          "Evidence category",
        raw: record,
      };
    })
    .filter(
      (category, index, collection) =>
        collection.findIndex((entry) => entry.id === category.id) === index,
    );
};

export const normalizeReferences = (value: unknown): EvidenceReferenceOption[] => {
  const primitiveMatches = extractPrimitiveArrayPayload(value);
  const input = primitiveMatches.length
    ? primitiveMatches
        .map((entry) => normalizePrimitiveOption(entry, "reference"))
        .filter(isRecord)
    : Array.isArray(value)
      ? value.map((entry) => normalizePrimitiveOption(entry, "reference")).filter(isRecord)
      : extractArrayPayload(value);

  return input
    .map((record, index) => {
      const refNo = pickString(record, REFERENCE_KEYS) || `REF-${index + 1}`;
      const title = pickString(record, ["Title", "DisplayName", "Label"]) || refNo;

      return {
        id: `${refNo}-${index}`,
        refNo,
        label: title,
        subtitle: "",
        raw: record,
      };
    })
    .filter(
      (reference, index, collection) =>
        collection.findIndex((entry) => entry.refNo === reference.refNo) === index,
    );
};

export const normalizeRemarks = (value: unknown): EvidenceRemarkOption[] => {
  const primitiveMatches = extractPrimitiveArrayPayload(value);
  const rawValues = primitiveMatches.length
    ? primitiveMatches
    : Array.isArray(value)
      ? value
      : extractArrayPayload(value);

  const normalized = rawValues
    .map((entry, index) => {
      const record = normalizePrimitiveOption(entry, "remark");
      const label =
        pickString(record, ["Remarks", "Remark", "Name", "Label", "Value"]) ||
        `Remark ${index + 1}`;

      return {
        id: `${label}-${index}`,
        label,
        value: label,
      };
    })
    .filter(
      (remark, index, collection) =>
        collection.findIndex((entry) => entry.value === remark.value) === index,
    );

  return [
    {
      id: "all-remarks",
      label: "All remarks",
      value: "",
    },
    ...normalized,
  ];
};

const toDataUrl = (value: string) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 80) {
    return `data:image/jpeg;base64,${value}`;
  }

  return value;
};

const inferMediaKind = (url: string, fallback: EvidenceMediaKind): EvidenceMediaKind => {
  const normalizedUrl = url.toLowerCase();

  if (/\.(png|jpe?g|gif|bmp|webp|svg)(\?|$)/.test(normalizedUrl)) {
    return "image";
  }

  if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/.test(normalizedUrl)) {
    return "video";
  }

  if (/\.(mp3|wav|aac|ogg|m4a)(\?|$)/.test(normalizedUrl)) {
    return "audio";
  }

  return fallback;
};

const fileNameFromUrl = (value: string) => {
  const cleanValue = value.split("?")[0];
  const segments = cleanValue.split("/");
  return segments[segments.length - 1] || "Evidence file";
};

export const normalizeMediaItems = (
  value: unknown,
  fallbackKind: EvidenceMediaKind,
): EvidenceMediaItem[] => {
  const records = Array.isArray(value)
    ? value.map((entry) => normalizePrimitiveOption(entry, "media")).filter(isRecord)
    : extractArrayPayload(value);

  return records
    .map((record, index) => {
      const discoveredString = Object.values(record).find(
        (entry) => typeof entry === "string" && /(http|\/|data:)/i.test(entry),
      );
      const rawUrl =
        pickString(record, MEDIA_URL_KEYS) ||
        (typeof discoveredString === "string" ? discoveredString : "");

      const url = toDataUrl(rawUrl);
      const kind = inferMediaKind(url, fallbackKind);
      const title =
        pickString(record, TITLE_KEYS) ||
        (url ? fileNameFromUrl(url) : `${kind} ${index + 1}`);

      return {
        id: `${kind}-${index}-${title}`,
        kind,
        title,
        url,
        previewUrl: kind === "image" ? url : "",
        remark: pickString(record, REMARK_KEYS),
        createdAt: pickString(record, DATE_KEYS),
        sourceLabel: pickString(record, ["UploadedBy", "UserName", "CreatedBy", "Name"]),
        raw: record,
      };
    })
    .filter((item) => Boolean(item.url));
};

export const normalizeViewerProfile = (
  tokenPayload: EvidenceApiRecord | null,
  value: unknown,
): EvidenceViewerProfile => {
  const record = extractRecordPayload(value);
  const role =
    pickString(record, ["Role", "RoleName", "UserRole"]) ||
    pickString(tokenPayload, ["role", "Role"]) ||
    "Authorized User";
  const name =
    pickString(record, ["UserName", "Name", "FullName"]) ||
    pickString(tokenPayload, ["name", "unique_name"]) ||
    "Authorized User";
  const hrmsId =
    pickString(record, ["HrmsId", "HRMSID", "EmployeeCode"]) ||
    pickString(tokenPayload, ["hrmsid", "employeeId"]) ||
    "";
  const company = pickString(record, ["CompanyName", "Company"]) || "";
  const companyId =
    pickNumber(record, ["CompanyId", "companyId", "CompId"]) ||
    pickNumber(tokenPayload, ["companyId", "CompanyId", "compId"]);
  const division = pickString(record, ["DivisionName", "Division"]) || "";
  const normalizedRole = role.toLowerCase();
  const canUpload = !/(client|viewer|read only|readonly)/i.test(normalizedRole);

  return {
    name,
    hrmsId,
    role,
    company,
    companyId,
    division,
    canUpload,
    canView: true,
  };
};

export const buildUploadRemarksPayload = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  return { remarks: trimmedValue };
};

export const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatMediaDate = (value: string) => {
  if (!value) {
    return "Recently uploaded";
  }

  const parsedValue = new Date(value);
  if (Number.isNaN(parsedValue.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedValue);
};

export const getNumericCategoryId = (category: EvidenceCategoryOption | null) =>
  category?.numericId ?? (category ? Number(category.id) || null : null);
