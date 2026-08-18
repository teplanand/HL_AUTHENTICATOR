import type { AuthenticatorApp } from "../api/authenticator";
import { DEVELOPED_APPS } from "../../../../shared/data/developedApps";

export type DynamicAppAccessModule = {
  moduleCode: string;
  moduleTitle: string;
  route: string;
  permissions: Record<string, boolean>;
};

export type DynamicAppAccessPayload = {
  appId: string;
  appTitle: string;
  modules: DynamicAppAccessModule[];
};

const DYNAMIC_APP_ACCESS_STORAGE_KEY = "dynamic-app-route-permissions";
const ROUTE_HINTS_BY_MODULE: Record<
  string,
  Array<{ route: string; moduleCode: string; moduleTitle: string }>
> = {
  "advance-voucher": [
    { route: "/advance-voucher/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
    { route: "/advance-voucher/supplier", moduleCode: "SUPPLIER", moduleTitle: "Supplier" },
    { route: "/advance-voucher/po", moduleCode: "PO", moduleTitle: "PO" },
  ],
  "purchase-order": [
    { route: "/purchase-order/dashboard", moduleCode: "DASHBOARD", moduleTitle: "PO Dashboard" },
    { route: "/purchase-order/supplier", moduleCode: "SUPPLIER", moduleTitle: "PO Supplier" },
    { route: "/purchase-order/po", moduleCode: "PO", moduleTitle: "PO PO" },
  ],
  "supplier-portal": [
    { route: "/supplier-portal/dashboard", moduleCode: "DASHBOARD", moduleTitle: "SP Dashboard" },
    { route: "/supplier-portal/supplier", moduleCode: "SUPPLIER", moduleTitle: "SP Supplier" },
    { route: "/supplier-portal/po", moduleCode: "PO", moduleTitle: "SP PO" },
  ],
  warehouse: [
    { route: "/Warehouse/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
    { route: "/Warehouse/warehouselist", moduleCode: "WAREHOUSELIST", moduleTitle: "Warehouse" },
    { route: "/Warehouse/zonelist", moduleCode: "ZONELIST", moduleTitle: "Zones" },
    { route: "/Warehouse/racklist", moduleCode: "RACKLIST", moduleTitle: "Rack" },
    { route: "/Warehouse/palletlist", moduleCode: "PALLETLIST", moduleTitle: "Pallets" },
    { route: "/Warehouse/itemlist", moduleCode: "ITEMLIST", moduleTitle: "Items" },
    { route: "/Warehouse/transactions", moduleCode: "TRANSACTIONS", moduleTitle: "Transactions" },
  ],
  "hr-management": [
    { route: "/hr-management/dashboard", moduleCode: "DASHBOARD", moduleTitle: "HR Dashboard" },
    { route: "/hr-management/supplier", moduleCode: "SUPPLIER", moduleTitle: "HR Supplier" },
    { route: "/hr-management/po", moduleCode: "PO", moduleTitle: "HR PO" },
  ],
  "order-tracking": [
    { route: "/order-tracking/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
    { route: "/order-tracking/itemplan", moduleCode: "ITEMPLAN", moduleTitle: "Plan Configuration" },
  ],
  barcode: [
    { route: "/barcode/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
    { route: "/barcode/salesorders", moduleCode: "SALESORDERS", moduleTitle: "Sales Orders" },
    {
      route: "/barcode/finalinspection",
      moduleCode: "FINALINSPECTION",
      moduleTitle: "Final Inspection",
    },
    {
      route: "/barcode/ordercompletion",
      moduleCode: "ORDERCOMPLETION",
      moduleTitle: "Order Completion",
    },
    { route: "/barcode/po", moduleCode: "PO", moduleTitle: "Reports" },
  ],
  evidance: [
    {
      route: "/evidance/client-dashboard",
      moduleCode: "CLIENT_DASHBOARD",
      moduleTitle: "Client Dashboard",
    },
    {
      route: "/evidance/admin-dashboard",
      moduleCode: "ADMIN_DASHBOARD",
      moduleTitle: "Admin Dashboard",
    },
    {
      route: "/evidance/user-registration",
      moduleCode: "USER_REGISTRATION",
      moduleTitle: "User Registration",
    },
    { route: "/evidance/companies", moduleCode: "COMPANIES", moduleTitle: "Companies List" },
  ],
  monitoring: [
    { route: "/monitoring/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
  ],
  authenticator: [
    {
      route: "/authenticator/dashboard",
      moduleCode: "DASHBOARD",
      moduleTitle: "Users & Roles",
    },
    { route: "/authenticator/apps", moduleCode: "APPS", moduleTitle: "Apps" },
    { route: "/authenticator/modules", moduleCode: "MODULES", moduleTitle: "Modules" },
    {
      route: "/authenticator/permissions",
      moduleCode: "PERMISSIONS",
      moduleTitle: "Permission",
    },
    {
      route: "/authenticator/role-permission-mapping",
      moduleCode: "ROLE_PERMISSION_MAPPING",
      moduleTitle: "Role Permission Mapping",
    },
  ],
  sops: [
    { route: "/sops/dashboard", moduleCode: "DASHBOARD", moduleTitle: "Dashboard" },
    { route: "/sops/register", moduleCode: "REGISTER", moduleTitle: "SOP Register" },
    { route: "/sops/viewer", moduleCode: "VIEWER", moduleTitle: "Secure Viewer" },
    { route: "/sops/released", moduleCode: "RELEASED", moduleTitle: "SOP Released" },
    { route: "/sops/reports", moduleCode: "REPORTS", moduleTitle: "Reports" },
    { route: "/sops/audit-trail", moduleCode: "AUDIT_TRAIL", moduleTitle: "Audit Trail" },
    { route: "/sops/category", moduleCode: "CATEGORY", moduleTitle: "Category" },
  ],
};

const normalizeValue = (value?: unknown) => String(value ?? "").trim();
const normalizeKey = (value?: unknown) => normalizeValue(value).toLowerCase();
const normalizeRoute = (value?: unknown) =>
  normalizeValue(value).replace(/\/+$/, "");

const getLastPathSegment = (value?: string) => {
  const segments = String(value ?? "")
    .split("/")
    .filter(Boolean);

  return segments.length > 0 ? segments[segments.length - 1] : "";
};

const normalizeAction = (action?: unknown) => {
  const normalizedAction = normalizeKey(action);

  if (normalizedAction === "add") {
    return "create";
  }

  if (normalizedAction === "edit") {
    return "update";
  }

  return normalizedAction;
};

const coerceBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return false;
    }

    if (["true", "1", "yes", "y", "on"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "0", "no", "n", "off", "null", "undefined"].includes(normalizedValue)) {
      return false;
    }
  }

  return Boolean(value);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getAppDefaultPath = (app: Pick<AuthenticatorApp, "appId" | "appCode" | "appTitle" | "frontUrl">) => {
  const matchedApp =
    DEVELOPED_APPS.find((item) => {
      const candidates = [
        normalizeKey(item.appId),
        normalizeKey(item.appCode),
        normalizeKey(item.appTitle),
      ];

      return candidates.some(
        (candidate) =>
          candidate &&
          [
            normalizeKey(app.appId),
            normalizeKey(app.appCode),
            normalizeKey(app.appTitle),
            normalizeKey(app.frontUrl),
          ].includes(candidate),
      );
    }) ?? null;

  return normalizeRoute(app.frontUrl) || normalizeRoute(matchedApp?.path);
};

const getRouteHintsForApp = (defaultPath: string) => {
  const topLevelSegment = defaultPath.split("/").filter(Boolean)[0] ?? "";
  return ROUTE_HINTS_BY_MODULE[normalizeKey(topLevelSegment)] ?? [];
};

const inferRouteFromModule = ({
  rawModule,
  defaultPath,
}: {
  rawModule: Record<string, unknown>;
  defaultPath: string;
}) => {
  const routeHints = getRouteHintsForApp(defaultPath);
  const rawRoute = normalizeRoute(rawModule.route ?? rawModule.path ?? rawModule.frontUrl);

  if (rawRoute) {
    if (rawRoute.startsWith("/")) {
      return rawRoute;
    }

    if (routeHints.length > 0) {
      const matchedChild = routeHints.find((child) => {
        const childCandidates = [
          normalizeKey(child.route),
          normalizeKey(child.moduleCode),
          normalizeKey(child.moduleTitle),
          normalizeKey(getLastPathSegment(child.route)),
        ];

        return childCandidates.includes(normalizeKey(rawRoute));
      });

      if (matchedChild) {
        return matchedChild.route;
      }
    }
  }

  if (routeHints.length > 0) {
    const rawCandidates = [
      normalizeKey(rawModule.moduleCode),
      normalizeKey(rawModule.moduleTitle),
      normalizeKey(rawModule.moduleName),
      normalizeKey(rawModule.permissionName),
      normalizeKey(rawModule.name),
      normalizeKey(rawModule.slug),
    ].filter(Boolean);

    const matchedChild = routeHints.find((child) => {
      const childCandidates = [
        normalizeKey(child.route),
        normalizeKey(child.moduleCode),
        normalizeKey(child.moduleTitle),
        normalizeKey(getLastPathSegment(child.route)),
      ];

      return rawCandidates.some((candidate) => childCandidates.includes(candidate));
    });

    if (matchedChild) {
      return matchedChild.route;
    }
  }

  return defaultPath;
};

const extractPermissionFlags = (rawModule: Record<string, unknown>) => {
  const nextPermissions: Record<string, boolean> = {};
  const permissionsValue =
    rawModule.permissions ?? rawModule.permission ?? rawModule.rights ?? rawModule.actions;

  if (Array.isArray(permissionsValue)) {
    permissionsValue.forEach((permission) => {
      const normalizedAction = normalizeAction(permission as string);

      if (normalizedAction) {
        nextPermissions[normalizedAction] = true;
      }
    });
  } else if (isRecord(permissionsValue)) {
    Object.entries(permissionsValue).forEach(([action, value]) => {
      const normalizedAction = normalizeAction(action);

      if (normalizedAction) {
        nextPermissions[normalizedAction] = coerceBoolean(value);
      }
    });
  }

  const directAction = normalizeAction(rawModule.action);
  if (directAction) {
    nextPermissions[directAction] = coerceBoolean(
      rawModule.isActive ?? rawModule.granted ?? rawModule.allowed ?? rawModule.value ?? true,
    );
  }

  return nextPermissions;
};

const extractModuleRecords = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractModuleRecords(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.modules)) {
    return value.modules.flatMap((item) => extractModuleRecords(item));
  }

  if ("data" in value) {
    return extractModuleRecords(value.data);
  }

  const looksLikeModuleRecord =
    "route" in value ||
    "path" in value ||
    "moduleCode" in value ||
    "moduleTitle" in value ||
    "moduleName" in value ||
    "permissions" in value ||
    "rights" in value ||
    "actions" in value ||
    "action" in value;

  if (looksLikeModuleRecord) {
    return [value];
  }

  const moduleEntries = Object.entries(value).filter(([, permissions]) => {
    return Array.isArray(permissions) || isRecord(permissions);
  });

  if (moduleEntries.length > 0) {
    return moduleEntries.map(([moduleTitle, permissions]) => ({
      moduleTitle,
      moduleCode: moduleTitle,
      permissions,
    }));
  }

  return [];
};

const buildModuleCodeFromRoute = (route: string) =>
  normalizeRoute(route)
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .toUpperCase();

export const normalizeDynamicAppAccessPayload = ({
  app,
  raw,
}: {
  app: Pick<AuthenticatorApp, "appId" | "appTitle" | "appCode" | "frontUrl"> & { path?: string };
  raw: unknown;
}): DynamicAppAccessPayload | null => {
  const defaultPath = normalizeRoute(app.path) || getAppDefaultPath(app);
  const rawModules = extractModuleRecords(raw);

  if (!defaultPath || rawModules.length === 0) {
    return null;
  }

  const moduleLookup = new Map<string, DynamicAppAccessModule>();

  rawModules.forEach((rawModule) => {
    const route = inferRouteFromModule({ rawModule, defaultPath });
    const permissions = extractPermissionFlags(rawModule);
    const hasKnownPermission = Object.keys(permissions).length > 0;

    if (!route || !hasKnownPermission) {
      return;
    }

    const matchedChild =
      getRouteHintsForApp(defaultPath).find(
        (child) => normalizeRoute(child.route) === normalizeRoute(route),
      ) ?? null;
    const lookupKey = normalizeRoute(route) || normalizeKey(rawModule.moduleCode) || normalizeKey(rawModule.moduleTitle);
    const previous = moduleLookup.get(lookupKey);

    moduleLookup.set(lookupKey, {
      moduleCode:
        normalizeValue(matchedChild?.moduleCode) ||
        normalizeValue(rawModule.moduleCode) ||
        buildModuleCodeFromRoute(route),
      moduleTitle:
        normalizeValue(matchedChild?.moduleTitle) ||
        normalizeValue(rawModule.moduleTitle) ||
        normalizeValue(rawModule.moduleName) ||
        normalizeValue(rawModule.name) ||
        normalizeValue(getLastPathSegment(route)) ||
        "Module",
      route,
      permissions: {
        ...(previous?.permissions ?? {}),
        ...permissions,
      },
    });
  });

  const modules = Array.from(moduleLookup.values());

  if (modules.length === 0) {
    return null;
  }

  return {
    appId: normalizeValue(app.appId),
    appTitle: normalizeValue(app.appTitle) || normalizeValue(app.appCode) || normalizeValue(app.appId),
    modules,
  };
};

export const buildLegacyPermissionsFromDynamicPayload = (
  payload: DynamicAppAccessPayload,
): Record<string, string[]> => {
  return payload.modules.reduce<Record<string, string[]>>((accumulator, module) => {
    const topLevelModule = normalizeRoute(module.route).split("/").filter(Boolean)[0];

    if (!topLevelModule) {
      return accumulator;
    }

    const grantedPermissions = Object.entries(module.permissions)
      .filter(([, isAllowed]) => Boolean(isAllowed))
      .map(([action]) => normalizeAction(action))
      .filter(Boolean);

    if (grantedPermissions.length === 0) {
      accumulator[topLevelModule.toLowerCase()] = accumulator[topLevelModule.toLowerCase()] ?? [];
      return accumulator;
    }

    const currentPermissions = new Set(accumulator[topLevelModule.toLowerCase()] ?? []);
    grantedPermissions.forEach((permission) => currentPermissions.add(permission));
    accumulator[topLevelModule.toLowerCase()] = Array.from(currentPermissions);
    return accumulator;
  }, {});
};

const readStoredPayloads = () => {
  if (typeof window === "undefined") {
    return [] as DynamicAppAccessPayload[];
  }

  const rawValue = window.localStorage.getItem(DYNAMIC_APP_ACCESS_STORAGE_KEY);

  if (!rawValue) {
    return [] as DynamicAppAccessPayload[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as DynamicAppAccessPayload[]) : [];
  } catch (error) {
    console.error("Failed to parse dynamic app permissions.", error);
    window.localStorage.removeItem(DYNAMIC_APP_ACCESS_STORAGE_KEY);
    return [] as DynamicAppAccessPayload[];
  }
};

const writeStoredPayloads = (payloads: DynamicAppAccessPayload[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DYNAMIC_APP_ACCESS_STORAGE_KEY, JSON.stringify(payloads));
};

export const getStoredDynamicAppAccessPayloads = () => readStoredPayloads();

export const clearStoredDynamicAppAccessPayloads = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DYNAMIC_APP_ACCESS_STORAGE_KEY);
};

export const saveStoredDynamicAppAccessPayload = (payload: DynamicAppAccessPayload) => {
  const currentPayloads = readStoredPayloads();
  const nextPayloads = [
    payload,
    ...currentPayloads.filter((item) => normalizeKey(item.appId) !== normalizeKey(payload.appId)),
  ];

  writeStoredPayloads(nextPayloads);
  return nextPayloads;
};

export const getStoredDynamicAppAccessModuleByRoute = (pathname: string) => {
  const normalizedPathname = normalizeRoute(pathname);

  if (!normalizedPathname) {
    return null;
  }

  for (const payload of readStoredPayloads()) {
    const matchedModule =
      payload.modules.find((module) => normalizeRoute(module.route) === normalizedPathname) ?? null;

    if (matchedModule) {
      return matchedModule;
    }
  }

  return null;
};

export const applyDynamicAppPermissions = ({
  app,
  raw,
}: {
  app: Pick<AuthenticatorApp, "appId" | "appTitle"> &
    Partial<Pick<AuthenticatorApp, "appCode" | "frontUrl">> & { path?: string };
  raw: unknown;
}) => {
  const payload = normalizeDynamicAppAccessPayload({ app, raw });

  if (!payload) {
    return null;
  }

  saveStoredDynamicAppAccessPayload(payload);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "permissions",
      JSON.stringify(buildLegacyPermissionsFromDynamicPayload(payload)),
    );
  }

  return payload;
};
