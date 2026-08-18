import { isAuthenticatorSuperAdmin } from "../../Authenticator/utils/authenticatorAccess";
import { getStoredDynamicAppAccessModuleByRoute } from "../../Authenticator/utils/appPermissionAccess";

export type MonitoringRouteUiPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  update: boolean;
  delete: boolean;
  download: boolean;
  approve: boolean;
  assign: boolean;
};

type MonitoringAccessModule = {
  moduleCode: string;
  moduleTitle: string;
  route: string;
  permissions: Partial<Record<string, boolean>>;
};

type MonitoringAccessPayload = {
  appId: string;
  appTitle: string;
  modules: MonitoringAccessModule[];
};

const EMPTY_MONITORING_ROUTE_UI_PERMISSIONS: MonitoringRouteUiPermissions = {
  view: false,
  create: false,
  edit: false,
  update: false,
  delete: false,
  download: false,
  approve: false,
  assign: false,
};

const FULL_MONITORING_ROUTE_UI_PERMISSIONS: MonitoringRouteUiPermissions = {
  view: true,
  create: true,
  edit: true,
  update: true,
  delete: true,
  download: true,
  approve: true,
  assign: true,
};

const DEFAULT_MONITORING_ACCESS_PAYLOAD: MonitoringAccessPayload = {
  appId: "1ffa3947-d39a-42af-bb1c-e078b239b633",
  appTitle: "Gear Monitoring",
  modules: [
    {
      moduleCode: "MONITORING_DASHBOARD",
      moduleTitle: "Dashboard",
      route: "/monitoring/dashboard",
      permissions: {
        view: true,
      },
    },
  ],
};

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

const normalizeAction = (action: string) => {
  const normalized = normalizeValue(action);

  if (normalized === "edit") {
    return "update";
  }

  if (normalized === "add") {
    return "create";
  }

  return normalized;
};

const findModuleByRoute = (pathname: string, payload: MonitoringAccessPayload) =>
  payload.modules.find((module) => normalizeValue(module.route) === normalizeValue(pathname)) ?? null;

export const getStaticMonitoringAccessPayload = () => DEFAULT_MONITORING_ACCESS_PAYLOAD;

export const getMonitoringRouteUiPermissions = (
  pathname: string,
): MonitoringRouteUiPermissions => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return {
      ...EMPTY_MONITORING_ROUTE_UI_PERMISSIONS,
      ...dynamicMatchedModule.permissions,
      update: Boolean(dynamicMatchedModule.permissions.update),
      edit: Boolean(dynamicMatchedModule.permissions.update),
    };
  }

  if (isAuthenticatorSuperAdmin()) {
    return { ...FULL_MONITORING_ROUTE_UI_PERMISSIONS };
  }

  const matchedModule = findModuleByRoute(pathname, getStaticMonitoringAccessPayload());

  if (!matchedModule) {
    return { ...EMPTY_MONITORING_ROUTE_UI_PERMISSIONS };
  }

  return {
    ...EMPTY_MONITORING_ROUTE_UI_PERMISSIONS,
    ...matchedModule.permissions,
    update: Boolean(matchedModule.permissions.update),
    edit: Boolean(matchedModule.permissions.update),
  };
};

export const canAccessMonitoringRoute = (pathname: string, action = "view") => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return Boolean(dynamicMatchedModule.permissions[normalizeAction(action)]);
  }

  if (isAuthenticatorSuperAdmin()) {
    return true;
  }

  const matchedModule = findModuleByRoute(pathname, getStaticMonitoringAccessPayload());

  if (!matchedModule) {
    return false;
  }

  return Boolean(matchedModule.permissions[normalizeAction(action)]);
};
