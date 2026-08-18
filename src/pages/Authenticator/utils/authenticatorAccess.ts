import {
  getStoredAuthenticatorRoleAccessPayload,
  type AuthenticatorAccessPayload,
} from "./authenticatorPermissionStorage";
import { getTrustedAuthRoleCandidates } from "../../../../shared/utils/auth";
import { getStoredDynamicAppAccessModuleByRoute } from "./appPermissionAccess";

export type { AuthenticatorAccessModule, AuthenticatorAccessPayload } from "./authenticatorPermissionStorage";

export type AuthenticatorRouteUiPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  update: boolean;
  delete: boolean;
  download: boolean;
  approve: boolean;
  assign: boolean;
};

const EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS: AuthenticatorRouteUiPermissions = {
  view: false,
  create: false,
  edit: false,
  update: false,
  delete: false,
  download: false,
  approve: false,
  assign: false,
};

export const AUTHENTICATOR_TEMP_SETTINGS = {
  showAllSidebarMenus: false,
} as const;

const EMPTY_AUTHENTICATOR_ACCESS_PAYLOAD: AuthenticatorAccessPayload = {
  appId: "",
  appTitle: "",
  roleId: "",
  roleName: "",
  modules: [],
};

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();
const AUTHENTICATOR_APPS_ROUTE = "/authenticator/apps";
const ADMIN_ROLE_PATTERN = /^admin$/i;
const SUPERADMIN_ROLE_PATTERN = /^super[\s_-]*admin$/i;

const FULL_AUTHENTICATOR_ROUTE_UI_PERMISSIONS: AuthenticatorRouteUiPermissions = {
  view: true,
  create: true,
  edit: true,
  update: true,
  delete: true,
  download: true,
  approve: true,
  assign: true,
};

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

const findModuleByRoute = (pathname: string, payload: AuthenticatorAccessPayload) =>
  payload.modules.find((module) => normalizeValue(module.route) === normalizeValue(pathname)) ?? null;

const findModuleByCode = (moduleCode: string, payload: AuthenticatorAccessPayload) =>
  payload.modules.find((module) => normalizeValue(module.moduleCode) === normalizeValue(moduleCode)) ??
  null;

const findModuleByTitle = (moduleTitle: string, payload: AuthenticatorAccessPayload) =>
  payload.modules.find((module) => normalizeValue(module.moduleTitle) === normalizeValue(moduleTitle)) ??
  null;

export const isAuthenticatorSuperAdmin = () => {
  const rolesToCheck = getTrustedAuthRoleCandidates()
    .map((role) => normalizeValue(role))
    .filter(Boolean);

  return rolesToCheck.some((role) => SUPERADMIN_ROLE_PATTERN.test(role));
};

export const isAuthenticatorAdminOrSuperAdmin = () => {
  const rolesToCheck = getTrustedAuthRoleCandidates()
    .map((role) => normalizeValue(role))
    .filter(Boolean);

  return rolesToCheck.some(
    (role) => SUPERADMIN_ROLE_PATTERN.test(role) || ADMIN_ROLE_PATTERN.test(role),
  );
};

export const getStaticAuthenticatorAccessPayload = () =>
  getStoredAuthenticatorRoleAccessPayload({}) ?? EMPTY_AUTHENTICATOR_ACCESS_PAYLOAD;

export const getAuthenticatorRouteUiPermissions = (
  pathname: string,
): AuthenticatorRouteUiPermissions => {
  if (normalizeValue(pathname) === AUTHENTICATOR_APPS_ROUTE) {
    return isAuthenticatorSuperAdmin()
      ? { ...FULL_AUTHENTICATOR_ROUTE_UI_PERMISSIONS }
      : { ...EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS };
  }

  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return {
      ...EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS,
      ...dynamicMatchedModule.permissions,
      update: Boolean(dynamicMatchedModule.permissions.update),
      edit: Boolean(dynamicMatchedModule.permissions.update),
    };
  }

  if (isAuthenticatorSuperAdmin()) {
    return { ...FULL_AUTHENTICATOR_ROUTE_UI_PERMISSIONS };
  }

  if (
    AUTHENTICATOR_TEMP_SETTINGS.showAllSidebarMenus &&
    normalizeValue(pathname).startsWith("/authenticator/")
  ) {
    return {
      ...EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS,
      view: true,
    };
  }

  const matchedModule = findModuleByRoute(pathname, getStaticAuthenticatorAccessPayload());

  if (!matchedModule) {
    return { ...EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS };
  }

  return {
    ...EMPTY_AUTHENTICATOR_ROUTE_UI_PERMISSIONS,
    ...matchedModule.permissions,
    update: Boolean(matchedModule.permissions.update),
    edit: Boolean(matchedModule.permissions.update),
  };
};

export const canAccessAuthenticatorRoute = (pathname: string, action = "view") => {
  if (normalizeValue(pathname) === AUTHENTICATOR_APPS_ROUTE) {
    return isAuthenticatorSuperAdmin();
  }

  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return Boolean(dynamicMatchedModule.permissions[normalizeAction(action)]);
  }

  if (isAuthenticatorSuperAdmin()) {
    return true;
  }

  if (
    AUTHENTICATOR_TEMP_SETTINGS.showAllSidebarMenus &&
    normalizeValue(pathname).startsWith("/authenticator/") &&
    normalizeAction(action) === "view"
  ) {
    return true;
  }

  const matchedModule = findModuleByRoute(pathname, getStaticAuthenticatorAccessPayload());

  if (!matchedModule) {
    return false;
  }

  return Boolean(matchedModule.permissions[normalizeAction(action)]);
};

export const canAccessAuthenticatorModule = ({
  moduleCode,
  moduleTitle,
  route,
  action = "view",
}: {
  moduleCode?: string;
  moduleTitle?: string;
  route?: string;
  action?: string;
}) => {
  const isAuthenticatorAppsModule =
    normalizeValue(route) === AUTHENTICATOR_APPS_ROUTE ||
    normalizeValue(moduleCode) === "apps" ||
    normalizeValue(moduleTitle) === "apps";

  if (isAuthenticatorAppsModule) {
    return isAuthenticatorSuperAdmin();
  }

  if (isAuthenticatorSuperAdmin()) {
    return true;
  }

  const payload = getStaticAuthenticatorAccessPayload();
  const matchedModule =
    (route ? findModuleByRoute(route, payload) : null) ||
    (moduleCode ? findModuleByCode(moduleCode, payload) : null) ||
    (moduleTitle ? findModuleByTitle(moduleTitle, payload) : null);

  if (!matchedModule) {
    return false;
  }

  return Boolean(matchedModule.permissions[normalizeAction(action)]);
};
