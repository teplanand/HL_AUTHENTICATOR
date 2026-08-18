import { isAuthenticatorSuperAdmin } from "../../src/pages/Authenticator/utils/authenticatorAccess";
import { getStoredDynamicAppAccessModuleByRoute } from "../../src/pages/Authenticator/utils/appPermissionAccess";

export type StaticRouteUiPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  update: boolean;
  delete: boolean;
  download: boolean;
  approve: boolean;
  assign: boolean;
};

const EMPTY_STATIC_ROUTE_UI_PERMISSIONS: StaticRouteUiPermissions = {
  view: false,
  create: false,
  edit: false,
  update: false,
  delete: false,
  download: false,
  approve: false,
  assign: false,
};

const FULL_STATIC_ROUTE_UI_PERMISSIONS: StaticRouteUiPermissions = {
  view: true,
  create: true,
  edit: true,
  update: true,
  delete: true,
  download: true,
  approve: true,
  assign: true,
};

const ROUTE_PERMISSION_MAP: Record<string, Partial<StaticRouteUiPermissions>> = {
  "/order-tracking/dashboard": {
    view: true,
    update: true,
    download: true,
  },
  "/order-tracking/itemplan": {
    view: true,
    update: true,
    download: true,
  },
  "/barcode/dashboard": {
    view: true,
    create: true,
    update: true,
    download: true,
  },
  "/barcode/salesorders": {
    view: true,
    create: true,
    update: true,
    download: true,
  },
  "/barcode/finalinspection": {
    view: true,
    create: true,
    update: true,
  },
  "/barcode/ordercompletion": {
    view: true,
    create: true,
    update: true,
  },
  "/barcode/po": {
    view: true,
    download: true,
  },
  "/sops/dashboard": {
    view: true,
    create: true,
    update: true,
    download: true,
    approve: true,
  },
  "/sops/register": {
    view: true,
    create: true,
    update: true,
    download: true,
    approve: true,
  },
  "/sops/viewer": {
    view: true,
    download: true,
  },
  "/sops/released": {
    view: true,
    download: true,
  },
  "/sops/reports": {
    view: true,
    download: true,
  },
  "/sops/audit-trail": {
    view: true,
    download: true,
  },
  "/sops/category": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/dashboard": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/warehouselist": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/zonelist": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/racklist": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/palletlist": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/itemlist": {
    view: true,
    create: true,
    update: true,
    delete: true,
    download: true,
  },
  "/Warehouse/transactions": {
    view: true,
    download: true,
  },
  "/project-management/inquiries": {
    view: true,
    create: true,
    update: true,
    download: true,
    approve: true,
  },
  "/project-management/scope-documents": {
    view: true,
    create: true,
    update: true,
    download: true,
    approve: true,
  },
  "/project-management/projects": {
    view: true,
    create: true,
    update: true,
    download: true,
    assign: true,
  },
  "/project-management/backlogs": {
    view: true,
    create: true,
    update: true,
    download: true,
    assign: true,
  },
  "/project-management/kanban-board": {
    view: true,
    update: true,
    download: true,
    assign: true,
  },
  "/project-management/support": {
    view: true,
    create: true,
    update: true,
    download: true,
    assign: true,
  },
  "/project-management/invoices": {
    view: true,
    create: true,
    update: true,
    download: true,
    approve: true,
  },
  "/project-management/reports": {
    view: true,
    download: true,
  },
};

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim();

const normalizeAction = (action: string) => {
  const normalized = normalizeValue(action).toLowerCase();

  if (normalized === "edit") {
    return "update";
  }

  if (normalized === "add") {
    return "create";
  }

  return normalized;
};

const normalizePathname = (pathname: string) => normalizeValue(pathname).replace(/\/+$/, "");

export const getStaticModuleRouteUiPermissions = (pathname: string): StaticRouteUiPermissions => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return {
      ...EMPTY_STATIC_ROUTE_UI_PERMISSIONS,
      ...dynamicMatchedModule.permissions,
      edit: Boolean(dynamicMatchedModule.permissions.update),
      update: Boolean(dynamicMatchedModule.permissions.update),
    };
  }

  if (isAuthenticatorSuperAdmin()) {
    return { ...FULL_STATIC_ROUTE_UI_PERMISSIONS };
  }

  const matchedPermissions = ROUTE_PERMISSION_MAP[normalizePathname(pathname)];

  if (!matchedPermissions) {
    return { ...EMPTY_STATIC_ROUTE_UI_PERMISSIONS };
  }

  return {
    ...EMPTY_STATIC_ROUTE_UI_PERMISSIONS,
    ...matchedPermissions,
    edit: Boolean(matchedPermissions.update),
    update: Boolean(matchedPermissions.update),
  };
};

export const canAccessStaticModuleRoute = (pathname: string, action = "view") => {
  const dynamicMatchedModule = getStoredDynamicAppAccessModuleByRoute(pathname);

  if (dynamicMatchedModule) {
    return Boolean(dynamicMatchedModule.permissions[normalizeAction(action)]);
  }

  if (isAuthenticatorSuperAdmin()) {
    return true;
  }

  const permissions = getStaticModuleRouteUiPermissions(pathname);
  return Boolean(permissions[normalizeAction(action) as keyof StaticRouteUiPermissions]);
};


