import { isAuthenticatorSuperAdmin } from "../../Authenticator/utils/authenticatorAccess";
import { getStoredDynamicAppAccessModuleByRoute } from "../../Authenticator/utils/appPermissionAccess";

export type EvidanceRouteUiPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  update: boolean;
  delete: boolean;
  download: boolean;
  approve: boolean;
  assign: boolean;
};

type EvidanceAccessModule = {
  moduleCode: string;
  moduleTitle: string;
  route: string;
  permissions: Partial<Record<string, boolean>>;
};

type EvidanceAccessPayload = {
  appId: string;
  appTitle: string;
  modules: EvidanceAccessModule[];
};

const EMPTY_EVIDANCE_ROUTE_UI_PERMISSIONS: EvidanceRouteUiPermissions = {
  view: false,
  create: false,
  edit: false,
  update: false,
  delete: false,
  download: false,
  approve: false,
  assign: false,
};

const FULL_EVIDANCE_ROUTE_UI_PERMISSIONS: EvidanceRouteUiPermissions = {
  view: true,
  create: true,
  edit: true,
  update: true,
  delete: true,
  download: true,
  approve: true,
  assign: true,
};

const DEFAULT_EVIDANCE_ACCESS_PAYLOAD: EvidanceAccessPayload = {
  appId: "58320d9c-13c8-4c97-ae86-f1f3fd4a104d",
  appTitle: "Evidance Collection",
  modules: [
    {
      moduleCode: "EVIDANCE_CLIENT_DASHBOARD",
      moduleTitle: "Client Dashboard",
      route: "/evidance/client-dashboard",
      permissions: {
        view: true,
        create: true,
        download: true,
      },
    },
    {
      moduleCode: "EVIDANCE_ADMIN_DASHBOARD",
      moduleTitle: "Admin Dashboard",
      route: "/evidance/admin-dashboard",
      permissions: {
        view: true,
      },
    },
    {
      moduleCode: "EVIDANCE_USER_REGISTRATION",
      moduleTitle: "User Registration",
      route: "/evidance/user-registration",
      permissions: {
        view: true,
        download: true,
        approve: true,
      },
    },
    {
      moduleCode: "EVIDANCE_COMPANIES",
      moduleTitle: "Companies List",
      route: "/evidance/companies",
      permissions: {
        view: true,
        download: true,
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

const findModuleByRoute = (pathname: string, payload: EvidanceAccessPayload) =>
  payload.modules.find((module) => normalizeValue(module.route) === normalizeValue(pathname)) ?? null;

export const getStaticEvidanceAccessPayload = () => DEFAULT_EVIDANCE_ACCESS_PAYLOAD;

export const getEvidanceRouteUiPermissions = (pathname: string): EvidanceRouteUiPermissions => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return {
      ...EMPTY_EVIDANCE_ROUTE_UI_PERMISSIONS,
      ...dynamicMatchedModule.permissions,
      update: Boolean(dynamicMatchedModule.permissions.update),
      edit: Boolean(dynamicMatchedModule.permissions.update),
    };
  }

  if (isAuthenticatorSuperAdmin()) {
    return { ...FULL_EVIDANCE_ROUTE_UI_PERMISSIONS };
  }

  const matchedModule = findModuleByRoute(pathname, getStaticEvidanceAccessPayload());

  if (!matchedModule) {
    return { ...EMPTY_EVIDANCE_ROUTE_UI_PERMISSIONS };
  }

  return {
    ...EMPTY_EVIDANCE_ROUTE_UI_PERMISSIONS,
    ...matchedModule.permissions,
    update: Boolean(matchedModule.permissions.update),
    edit: Boolean(matchedModule.permissions.update),
  };
};

export const canAccessEvidanceRoute = (pathname: string, action = "view") => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return Boolean(dynamicMatchedModule.permissions[normalizeAction(action)]);
  }

  if (isAuthenticatorSuperAdmin()) {
    return true;
  }

  const matchedModule = findModuleByRoute(pathname, getStaticEvidanceAccessPayload());

  if (!matchedModule) {
    return false;
  }

  return Boolean(matchedModule.permissions[normalizeAction(action)]);
};
