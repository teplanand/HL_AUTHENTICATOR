import { extractArrayPayload, extractMessage } from "./Dashboard/selectors";

export type EvidenceAdminRecord = Record<string, unknown>;

export interface EvidenceRegistrationRow {
  id: number;
  hrmsId: string;
  mobileNo: string;
  androidId: string;
  createdAt: string;
  isActive: boolean;
  statusCode: number | null;
  statusLabel: string;
  raw: EvidenceAdminRecord;
}

export interface EvidenceCompanyRow {
  id: number;
  companyName: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  raw: EvidenceAdminRecord;
}

const REGISTRATION_ID_KEYS = ["Id", "ID", "RegistrationId", "UserId"];
const REGISTRATION_HRMS_KEYS = ["HrmsId", "HRMSID", "HrmsID", "EmployeeCode"];
const REGISTRATION_MOBILE_KEYS = ["MobileNo", "Mobile", "PhoneNo", "PhoneNumber"];
const REGISTRATION_ANDROID_KEYS = ["AndroidId", "AndroidID", "DeviceId", "DeviceID"];
const REGISTRATION_CREATED_KEYS = ["CreatedAt", "CreatedDate", "CreatedOn", "RequestedAt"];
const REGISTRATION_ACTIVE_KEYS = ["IsActive", "isActive", "Active"];
const REGISTRATION_STATUS_KEYS = ["Status", "RequestStatus", "ApprovalStatus"];

const COMPANY_ID_KEYS = ["Id", "ID", "CompanyId", "CompId"];
const COMPANY_NAME_KEYS = ["CompanyName", "Name", "CompName"];
const COMPANY_EMAIL_KEYS = ["Email", "EmailId", "CompanyEmail"];
const COMPANY_CREATED_KEYS = ["CreatedAt", "CreatedDate", "CreatedOn"];
const COMPANY_ACTIVE_KEYS = ["IsActive", "isActive", "Active", "Status"];

const isRecord = (value: unknown): value is EvidenceAdminRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const pickString = (record: EvidenceAdminRecord, keys: string[]) => {
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

const pickNumber = (record: EvidenceAdminRecord, keys: string[]) => {
  const value = pickString(record, keys);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickBoolean = (record: EvidenceAdminRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "active", "yes", "approved"].includes(normalized)) {
        return true;
      }

      if (["false", "0", "inactive", "no", "rejected"].includes(normalized)) {
        return false;
      }
    }
  }

  return false;
};

const getStatusMeta = (value: unknown) => {
  if (typeof value === "number") {
    if (value === 1) {
      return { code: 1, label: "Approved" };
    }

    if (value === 2) {
      return { code: 2, label: "Rejected" };
    }

    if (value === 0) {
      return { code: 0, label: "Pending" };
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized.includes("approve") || normalized === "1") {
      return { code: 1, label: "Approved" };
    }

    if (normalized.includes("reject") || normalized === "2") {
      return { code: 2, label: "Rejected" };
    }

    if (normalized.includes("pending") || normalized === "0") {
      return { code: 0, label: "Pending" };
    }
  }

  return { code: null, label: "Pending" };
};

export const formatEvidenceDateTime = (value: string) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
};

export const normalizeEvidenceRegistrations = (payload: unknown) => {
  const records = extractArrayPayload(payload).filter(isRecord);

  return records.map<EvidenceRegistrationRow>((record, index) => {
    const status = getStatusMeta(record.Status ?? record.RequestStatus ?? record.ApprovalStatus);

    return {
      id: pickNumber(record, REGISTRATION_ID_KEYS) ?? index + 1,
      hrmsId: pickString(record, REGISTRATION_HRMS_KEYS) || `REG-${index + 1}`,
      mobileNo: pickString(record, REGISTRATION_MOBILE_KEYS) || "-",
      androidId: pickString(record, REGISTRATION_ANDROID_KEYS) || "-",
      createdAt: pickString(record, REGISTRATION_CREATED_KEYS),
      isActive: pickBoolean(record, REGISTRATION_ACTIVE_KEYS),
      statusCode: status.code,
      statusLabel: status.label,
      raw: record,
    };
  });
};

export const normalizeEvidenceCompanies = (payload: unknown) => {
  const records = extractArrayPayload(payload).filter(isRecord);

  return records.map<EvidenceCompanyRow>((record, index) => ({
    id: pickNumber(record, COMPANY_ID_KEYS) ?? index + 1,
    companyName: pickString(record, COMPANY_NAME_KEYS) || `Company ${index + 1}`,
    email: pickString(record, COMPANY_EMAIL_KEYS) || "-",
    createdAt: pickString(record, COMPANY_CREATED_KEYS),
    isActive: pickBoolean(record, COMPANY_ACTIVE_KEYS),
    raw: record,
  }));
};

export const extractEvidenceErrorMessage = (error: unknown) => {
  if (isRecord(error)) {
    const directMessage = extractMessage(error);
    if (directMessage) {
      return directMessage;
    }

    const data = error.data;
    if (isRecord(data)) {
      return extractMessage(data);
    }
  }

  return "";
};
