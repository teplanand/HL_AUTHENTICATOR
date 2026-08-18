import { extractAuthUserProfile, getDecodedToken, getTrustedAuthUserProfile } from "../../../shared/utils/auth";
import type { SopDocumentRecord, SopWorkflowTask } from "./types";

export type SopSessionActor = {
  name: string;
  role: string;
  isAdmin: boolean;
  hasSopEditPermission: boolean;
};

export type SopAllowedEditor = {
  role: SopWorkflowTask["role"] | "Admin";
  name: string;
  label: string;
};

const ADMIN_ROLE_PATTERN =
  /(super\s*admin|superadmin|admin|document\s*control|qa\s*systems|compliance\s*head|security\s*admin)/i;

const normalizeValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";

const parsePermissions = (): Record<string, string[]> => {
  if (typeof window === "undefined") {
    return {};
  }

  const rawPermissions = window.localStorage.getItem("permissions");
  if (!rawPermissions) {
    return {};
  }

  try {
    const parsedPermissions = JSON.parse(rawPermissions) as unknown;
    if (Array.isArray(parsedPermissions)) {
      return { all_modules: parsedPermissions.map((entry) => normalizeValue(entry)).filter(Boolean) };
    }

    if (!parsedPermissions || typeof parsedPermissions !== "object") {
      return {};
    }

    return Object.entries(parsedPermissions as Record<string, unknown>).reduce<
      Record<string, string[]>
    >((accumulator, [moduleKey, modulePermissions]) => {
      if (Array.isArray(modulePermissions)) {
        accumulator[moduleKey] = modulePermissions
          .map((entry) => normalizeValue(entry).toLowerCase())
          .filter(Boolean);
      }
      return accumulator;
    }, {});
  } catch {
    return {};
  }
};

const hasModulePermission = (
  permissions: Record<string, string[]>,
  moduleKeys: string[],
  right: string,
) =>
  moduleKeys.some((moduleKey) =>
    (permissions[moduleKey] ?? []).map((entry) => entry.toLowerCase()).includes(right.toLowerCase()),
  );

const getResponsibleRole = (
  document: SopDocumentRecord,
): SopAllowedEditor => {
  switch (document.status) {
    case "Checker Review":
      return { role: "Checker", name: document.checker, label: `Checker (${document.checker})` };
    case "Approver Review":
      return { role: "Approver", name: document.approver, label: `Approver (${document.approver})` };
    case "Authorizer Review":
    case "Authorized":
      return {
        role: "Authorizer",
        name: document.authorizer,
        label: `Authorizer (${document.authorizer})`,
      };
    case "Released":
    case "Archived":
      return { role: "Admin", name: "Document Control / Admin", label: "Document Control / Admin" };
    case "Draft":
    case "Rejected":
    default:
      return { role: "Creator", name: document.owner, label: `Creator (${document.owner})` };
  }
};

export const getSopSessionActor = (): SopSessionActor => {
  const decodedToken = getDecodedToken<Record<string, unknown>>();
  const trustedProfile = getTrustedAuthUserProfile();
  const derivedProfile = decodedToken ? extractAuthUserProfile({ user: decodedToken }) : null;
  const sources = [trustedProfile, derivedProfile, decodedToken];
  const name =
    sources.map((source) => normalizeValue(source?.name)).find(Boolean) ||
    sources
      .map((source) =>
        [normalizeValue(source?.first_name), normalizeValue(source?.last_name)]
          .filter(Boolean)
          .join(" ")
          .trim(),
      )
      .find(Boolean) ||
    sources.map((source) => normalizeValue(source?.username)).find(Boolean) ||
    sources.map((source) => normalizeValue(source?.employee_id)).find(Boolean) ||
    sources.map((source) => normalizeValue(source?.employeeId)).find(Boolean) ||
    "Current User";
  const role =
    sources.map((source) => normalizeValue(source?.role)).find(Boolean) ||
    sources.map((source) => normalizeValue(source?.role_name)).find(Boolean) ||
    "User";
  const permissions = parsePermissions();
  const isAdmin = ADMIN_ROLE_PATTERN.test(role);
  const hasSopEditPermission = hasModulePermission(
    permissions,
    ["sops", "sops-new", "all_modules", "*"],
    "edit",
  );

  return {
    name,
    role,
    isAdmin,
    hasSopEditPermission,
  };
};

export const getAllowedEditorForDocument = (document: SopDocumentRecord) =>
  getResponsibleRole(document);

export const canEditSopDocument = (
  _document: SopDocumentRecord,
  _actor: SopSessionActor,
) => {
  return true;
};
