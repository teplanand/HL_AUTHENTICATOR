import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "../../../../shared/utils/customBaseQuery";
import { DEVELOPED_APPS } from "../../../../shared/data/developedApps";

const AUTHENTICATOR_API_BASE_URL = (
  import.meta.env.VITE_AUTHENTICATOR_API_BASE_URL ||
  "https://authenticator.techelecon.in/"
).replace(/\/+$/, "");

export interface AuthenticatorApiResponse<TData> {
  response?: boolean;
  message?: string;
  data?: TData;
}
//test 123
export interface AuthenticatorLoginPayload {
  username: string;
  password: string;
}

export interface AuthenticatorLoginData {
  token?: string;
  refreshToken?: string;
  userId?: string;
  roles?: string[];
}

export interface AuthenticatorApp {
  appId: string;
  appDesc: string;
  appTitle: string;
  appCode?: string;
  hrmsId?: string;
  frontUrl?: string;
  backendUrl?: string;
  endDate?: string;
  isPublic?: boolean;
  orgIds?: string[] | string;
  orgs?: AuthenticatorAppOrganization[];
  modules?: AuthenticatorManagedModule[];
}

export interface AuthenticatorManagedModule {
  moduleId?: string | number;
  moduleTitle: string;
  moduleCode: string;
  moduleDesc: string;
  appId: string;
}

export interface AuthenticatorOrganization {
  orgTitle: string;
  orgId: string;
}

export interface AuthenticatorAppOrganization {
  orgId: string;
  orgTitle: string;
  isActive?: boolean;
}

export interface AuthenticatorDivision {
  divName: string;
  divId: string;
}

export interface AuthenticatorRole {
  roleName: string;
  roleId: number | string;
}

export interface AuthenticatorPermission {
  permissionId?: string;
  appId: string;
  moduleId?: string | number;
  moduleTitle?: string;
  moduleCode?: string;
  permissionCode?: string;
  permissionName: string;
  permissionDesc?: string;
  action: string;
  isActive: boolean;
}

export interface AuthenticatorPermissionListResponse
  extends AuthenticatorApiResponse<AuthenticatorPermission[]> {
  source?: "remote" | "unavailable";
}

type AuthenticatorPermissionMatrixResponseModule = {
  permissionId?: string;
  moduleId?: string | number;
  moduleCode?: string;
  moduleTitle?: string;
  route?: string;
  permissions?: Record<string, boolean>;
};

type AuthenticatorPermissionMatrixResponseRecord = {
  appId?: string;
  appTitle?: string;
  roleId?: string | number;
  roleName?: string;
  modules?: AuthenticatorPermissionMatrixResponseModule[];
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

    if (["false", "0", "no", "n", "off", "null", "undefined"].includes(normalizedValue)) {
      return false;
    }

    if (["true", "1", "yes", "y", "on"].includes(normalizedValue)) {
      return true;
    }
  }

  return Boolean(value);
};

const normalizePermissionAction = (action?: string | number | null) => {
  const normalizedAction = String(action ?? "").trim().toLowerCase();

  if (normalizedAction === "add") {
    return "create";
  }

  if (normalizedAction === "edit") {
    return "update";
  }

  return normalizedAction;
};

const flattenPermissionMatrixModules = ({
  appId,
  modules,
}: {
  appId?: string;
  modules: AuthenticatorPermissionMatrixResponseModule[];
}) =>
  modules.flatMap((module) =>
    Object.entries(module.permissions ?? {}).flatMap(([action, isActive]) => {
      const normalizedAction = normalizePermissionAction(action);

      if (!normalizedAction) {
        return [];
      }

      return [
        {
          permissionId: String(module.permissionId ?? "").trim() || undefined,
          appId: String(appId ?? "").trim(),
          moduleId: module.moduleId,
          moduleTitle: String(module.moduleTitle ?? "").trim() || undefined,
          moduleCode: String(module.moduleCode ?? "").trim() || undefined,
          permissionCode:
            `${String(module.moduleCode ?? module.moduleId ?? "module")
              .trim()}_${normalizedAction}`
              .replace(/[^a-z0-9]+/gi, "_")
              .toUpperCase(),
          permissionName: `${String(
            module.moduleTitle ?? module.moduleCode ?? module.moduleId ?? "Module",
          ).trim()} ${normalizedAction}`,
          action: normalizedAction,
          isActive: coerceBoolean(isActive),
        } satisfies AuthenticatorPermission,
      ];
    }),
  );

const isPermissionMatrixModule = (
  value: unknown,
): value is AuthenticatorPermissionMatrixResponseModule =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (
        Array.isArray((value as { permissions?: unknown }).permissions) ||
        Boolean(
          (value as { permissions?: unknown }).permissions &&
            typeof (value as { permissions?: unknown }).permissions === "object",
        )
      ),
  );

const isPermissionMatrixRecord = (
  value: unknown,
): value is AuthenticatorPermissionMatrixResponseRecord =>
  Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as AuthenticatorPermissionMatrixResponseRecord).modules),
  );

const flattenPermissionMatrixRecords = ({
  appId,
  records,
}: {
  appId?: string;
  records: unknown[];
}) =>
  records.flatMap((record) => {
    if (!isPermissionMatrixRecord(record)) {
      return [];
    }

    return flattenPermissionMatrixModules({
      appId: String(record.appId ?? appId ?? "").trim() || appId,
      modules: record.modules ?? [],
    });
  });

const dedupePermissionList = (permissions: AuthenticatorPermission[]) => {
  const lookup = new Map<string, AuthenticatorPermission>();

  permissions.forEach((permission) => {
    const moduleKey =
      String(permission.moduleId ?? "").trim() ||
      String(permission.moduleCode ?? "").trim() ||
      String(permission.moduleTitle ?? "").trim() ||
      String(permission.permissionName ?? "").trim();
    const actionKey = normalizePermissionAction(permission.action);

    if (!moduleKey || !actionKey) {
      return;
    }

    const key = `${String(permission.appId ?? "").trim()}::${moduleKey.toLowerCase()}::${actionKey}`;
    const previous = lookup.get(key);

    lookup.set(key, {
      ...previous,
      ...permission,
      action: actionKey,
      isActive:
        previous === undefined
          ? coerceBoolean(permission.isActive)
          : previous.isActive && coerceBoolean(permission.isActive),
      permissionId:
        String(permission.permissionId ?? "").trim() ||
        String(previous?.permissionId ?? "").trim() ||
        undefined,
      moduleId: permission.moduleId ?? previous?.moduleId,
      moduleCode:
        String(permission.moduleCode ?? "").trim() ||
        String(previous?.moduleCode ?? "").trim() ||
        undefined,
      moduleTitle:
        String(permission.moduleTitle ?? "").trim() ||
        String(previous?.moduleTitle ?? "").trim() ||
        undefined,
      permissionCode:
        String(permission.permissionCode ?? "").trim() ||
        String(previous?.permissionCode ?? "").trim() ||
        undefined,
      permissionDesc:
        String(permission.permissionDesc ?? "").trim() ||
        String(previous?.permissionDesc ?? "").trim() ||
        undefined,
      permissionName:
        String(permission.permissionName ?? "").trim() ||
        String(previous?.permissionName ?? "").trim() ||
        "Permission",
    });
  });

  return Array.from(lookup.values());
};

const normalizePermissionFlags = (permissions?: Record<string, boolean>) =>
  Object.entries(permissions ?? {}).reduce<Record<string, boolean>>((accumulator, [action, value]) => {
    const normalizedAction = normalizePermissionAction(action);

    if (!normalizedAction) {
      return accumulator;
    }

    accumulator[normalizedAction] = coerceBoolean(value);
    return accumulator;
  }, {});

const toRolePermissionAccessPayload = ({
  raw,
  appId,
  roleId,
}: {
  raw: AuthenticatorPermissionMatrixResponseRecord;
  appId: string;
  roleId: string | number;
}): SaveAuthenticatorRolePermissionAccessPayload => ({
  appId: String(raw.appId ?? appId).trim(),
  appTitle: String(raw.appTitle ?? raw.appId ?? appId).trim() || appId,
  roleId: String(raw.roleId ?? roleId).trim(),
  roleName: String(raw.roleName ?? "").trim(),
  modules: (raw.modules ?? []).map((module) => ({
    permissionId: String(module.permissionId ?? "").trim() || undefined,
    moduleId: String(module.moduleId ?? "").trim(),
    moduleCode: String(module.moduleCode ?? "").trim() || undefined,
    moduleTitle:
      String(module.moduleTitle ?? module.moduleCode ?? module.moduleId ?? "Module").trim(),
    route: String(module.route ?? "").trim(),
    permissions: normalizePermissionFlags(module.permissions),
  })),
});

const normalizeRolePermissionAccessResponse = ({
  raw,
  appId,
  roleId,
}: {
  raw: unknown;
  appId: string;
  roleId: string | number;
}): AuthenticatorApiResponse<SaveAuthenticatorRolePermissionAccessPayload | null> => {
  if (raw && typeof raw === "object") {
    const response = raw as AuthenticatorApiResponse<unknown> & Record<string, unknown>;

    const baseResponse = {
      response:
        "response" in response
          ? response.response
          : typeof response.success === "boolean"
            ? response.success
            : true,
      message: response.message ?? "Success",
    };

    if (isPermissionMatrixRecord(response)) {
      return {
        ...baseResponse,
        data: toRolePermissionAccessPayload({
          raw: response,
          appId,
          roleId,
        }),
      };
    }

    if (isPermissionMatrixRecord(response.data)) {
      return {
        ...baseResponse,
        data: toRolePermissionAccessPayload({
          raw: response.data,
          appId,
          roleId,
        }),
      };
    }

    if (Array.isArray(response.data)) {
      const matchedRecord =
        response.data.find((item) => {
          if (!isPermissionMatrixRecord(item)) {
            return false;
          }

          return (
            String(item.appId ?? "").trim() === String(appId).trim() ||
            String(item.roleId ?? "").trim() === String(roleId).trim()
          );
        }) ??
        response.data.find(isPermissionMatrixRecord) ??
        null;

      return {
        ...baseResponse,
        data: matchedRecord
          ? toRolePermissionAccessPayload({
              raw: matchedRecord,
              appId,
              roleId,
            })
          : null,
      };
    }
  }

  return normalizeMutationResponse<SaveAuthenticatorRolePermissionAccessPayload | null>(raw);
};

export interface AuthenticatorUser {
  name: string;
  hrmsId: string;
  userId: string;
  roles?: string[];
  roleData?: {
    roleId: string | number;
    roleTitle: string;
  }[];
}

export interface GetUsersPayload {
  orgId: string;
  divId: string;
}

export interface CreateAuthenticatorUserPayload {
  name: string;
  username: string;
  password: string;
  divId: string;
  orgId: string;
  hrmsId: string;
}

export interface CreateAuthenticatorRolePayload {
  roleId?: string | number;
  appId: string;
  roleName: string;
  roleDesc: string;
  roleCode: string;
}

export interface CreateAuthenticatorAppPayload {
  appId?: string;
  appTitle: string;
  appDesc: string;
  appCode: string;
  hrmsId?: string;
  frontUrl?: string;
  backendUrl?: string;
  orgIds: string[];
  isPublic: boolean;
}

export interface SaveAuthenticatorAppPayload extends CreateAuthenticatorAppPayload {}

export interface CreateAuthenticatorModulePayload {
  moduleTitle: string;
  moduleCode: string;
  moduleDesc: string;
  appId: string;
}

export interface SaveAuthenticatorModulePayload extends CreateAuthenticatorModulePayload {
  moduleId?: string | number;
}

export interface DeleteAuthenticatorAppPayload {
  appId: string;
}

export interface DeleteAuthenticatorModulePayload {
  appId: string;
  moduleId: string | number;
}

export interface AssignAuthenticatorModuleRolePayload {
  moduleId: string | number;
  roleId: string | number;
}

export interface AssignAuthenticatorUserRolePayload {
  appId: string;
  userId: string;
  roleId: string | number;
  endDate: string;
}

export interface RemoveAuthenticatorUserRolePayload {
  removeUserId: string;
  appId: string;
  removeRoleId: string | number;
}

export interface SaveAuthenticatorPermissionPayload {
  permissionId?: string;
  appId: string;
  moduleId: string;
  permissionName: string;
  permissionDesc?: string;
  action: string;
  isActive: boolean;
}

export interface SaveAuthenticatorPermissionMatrixModulePayload {
  permissionId?: string;
  moduleId: string;
  moduleCode?: string;
  moduleTitle: string;
  route: string;
  permissions: Record<string, boolean>;
}

export interface SaveAuthenticatorPermissionMatrixPayload {
  appId: string;
  appTitle: string;
  modules: SaveAuthenticatorPermissionMatrixModulePayload[];
}

export interface DeleteAuthenticatorPermissionPayload {
  appId: string;
  permissionId: string;
}

export interface SaveAuthenticatorRolePermissionMappingPayload {
  appId: string;
  roleId: string;
  roleName: string;
  permissionIds: string[];
  permissions: {
    permissionId: string;
    permissionCode: string;
    moduleCode: string;
    action: string;
  }[];
}

export interface SaveAuthenticatorRolePermissionAccessModulePayload {
  permissionId?: string;
  moduleId: string;
  moduleCode?: string;
  moduleTitle: string;
  route: string;
  permissions: Record<string, boolean>;
}

export interface SaveAuthenticatorRolePermissionAccessPayload {
  appId: string;
  appTitle: string;
  roleId: string | number;
  roleName: string;
  modules: SaveAuthenticatorRolePermissionAccessModulePayload[];
}

export interface GetAuthenticatorPermissionsByRolePayload {
  appId: string;
  roleId: string | number;
}

export interface AddAuthenticatorUsersToAppPayload {
  appId: string;
  users: string[];
  roleId: string | number;
  endDate: string;
}

export interface RemoveAuthenticatorUsersFromAppPayload {
  appId: string;
  users: string[];
  endDate: string;
}

export interface AuthenticatorModuleListResponse
  extends AuthenticatorApiResponse<AuthenticatorManagedModule[]> {
  source?: "remote" | "unavailable";
}

const normalizeMutationResponse = <TData>(
  raw: unknown,
): AuthenticatorApiResponse<TData> => {
  if (raw && typeof raw === "object") {
    const response = raw as AuthenticatorApiResponse<TData> & Record<string, unknown>;

    return {
      response:
        "response" in response
          ? response.response
          : typeof response.success === "boolean"
            ? response.success
            : true,
      message: response.message ?? "Success",
      data: ("data" in response ? response.data : null) as TData,
    };
  }

  return {
    response: true,
    message: "Success",
    data: raw as TData,
  };
};

const stripPermissionIdsFromRolePermissionMappingPayload = (
  payload: SaveAuthenticatorRolePermissionMappingPayload,
) => ({
  ...payload,
  permissions: payload.permissions.map(({ permissionId: _permissionId, ...permission }) => permission),
});

const stripPermissionIdsFromRolePermissionAccessPayload = (
  payload: SaveAuthenticatorRolePermissionAccessPayload,
) => ({
  ...payload,
  modules: payload.modules.map(({ permissionId: _permissionId, ...module }) => module),
});

type AuthenticatorAppApiRecord = Partial<AuthenticatorApp> & {
  end_date?: string;
  orgId?: string;
  hrmsId?: string;
};

const normalizeAppValue = (value?: string | number | null) =>
  String(value ?? "").trim().toLowerCase();

const normalizeLooseAppValue = (value?: string | number | null) =>
  normalizeAppValue(value)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/evidence/g, "evidance")
    .replace(/gearbox/g, "gear");

const buildManagedAppCode = (appTitle?: string) =>
  String(appTitle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractAppCodeFromUrl = (frontUrl?: string) => {
  const cleanUrl = String(frontUrl ?? "").trim();

  if (!cleanUrl) {
    return "";
  }

  const [pathOnly] = cleanUrl.split(/[?#]/);
  const segments = pathOnly
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments[0]?.toLowerCase() ?? "";
};

const buildDevelopedAppAliases = (app: {
  appId?: string;
  appTitle?: string;
  appCode?: string;
  appDesc?: string;
  path?: string;
}) => {
  const aliases = new Set<string>();
  const values = [app.appId, app.appTitle, app.appCode, app.appDesc, app.path];

  values.forEach((value) => {
    const normalizedValue = normalizeAppValue(value);
    const looseValue = normalizeLooseAppValue(value);

    if (normalizedValue) {
      aliases.add(normalizedValue);
    }

    if (looseValue) {
      aliases.add(looseValue);
    }
  });

  return aliases;
};

const resolveDevelopedApp = (app: AuthenticatorAppApiRecord) => {
  const candidates = buildDevelopedAppAliases({
    appId: app.appId,
    appTitle: app.appTitle,
    appCode: app.appCode || extractAppCodeFromUrl(app.frontUrl),
    appDesc: app.appDesc,
    path: app.frontUrl,
  });

  return (
    DEVELOPED_APPS.find((template) => {
      const aliases = buildDevelopedAppAliases(template);

      return Array.from(candidates).some(
        (candidate) =>
          aliases.has(candidate) ||
          Array.from(aliases).some(
            (alias) =>
              candidate === alias ||
              candidate.includes(alias) ||
              alias.includes(candidate),
          ),
      );
    }) ?? null
  );
};

const normalizeAuthenticatorApp = (raw: unknown): AuthenticatorApp | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const app = raw as AuthenticatorAppApiRecord;
  const matchedTemplate = resolveDevelopedApp(app);
  const normalizedOrgs = Array.isArray(app.orgs)
    ? app.orgs
        .filter(
          (org): org is AuthenticatorAppOrganization =>
            !!org &&
            typeof org === "object" &&
            Boolean(String(org.orgId ?? "").trim()),
        )
        .map((org) => ({
          orgId: String(org.orgId).trim(),
          orgTitle: String(org.orgTitle ?? org.orgId).trim(),
          isActive: typeof org.isActive === "boolean" ? org.isActive : true,
        }))
    : [];
  const normalizedOrgIds = Array.isArray(app.orgIds)
    ? app.orgIds.map((orgId) => String(orgId).trim()).filter(Boolean)
    : typeof app.orgIds === "string"
      ? app.orgIds
          .split(",")
          .map((orgId) => orgId.trim())
          .filter(Boolean)
      : normalizedOrgs
          .filter((org) => org.isActive !== false)
          .map((org) => org.orgId);
  const appTitle = String(app.appTitle ?? matchedTemplate?.appTitle ?? "").trim();
  const frontUrl = String(app.frontUrl ?? matchedTemplate?.path ?? "").trim();

  return {
    appId: String(app.appId ?? matchedTemplate?.appId ?? "").trim(),
    appTitle,
    appDesc: String(app.appDesc ?? matchedTemplate?.appDesc ?? "").trim(),
    appCode:
      String(app.appCode ?? "").trim() ||
      matchedTemplate?.appCode ||
      extractAppCodeFromUrl(frontUrl) ||
      buildManagedAppCode(appTitle),
    hrmsId: String(app.hrmsId ?? "").trim() || undefined,
    frontUrl: frontUrl || undefined,
    backendUrl: String(app.backendUrl ?? "").trim() || undefined,
    endDate: String(app.endDate ?? app.end_date ?? "").trim() || undefined,
    isPublic: typeof app.isPublic === "boolean" ? app.isPublic : undefined,
    orgIds: normalizedOrgIds,
    orgs: normalizedOrgs,
    modules: Array.isArray(app.modules)
      ? app.modules.filter((module): module is AuthenticatorManagedModule => !!module)
      : undefined,
  };
};

const normalizeAuthenticatorAppListResponse = (
  raw: unknown,
): AuthenticatorApiResponse<AuthenticatorApp[]> => {
  const normalizeApps = (apps: unknown[]) =>
    apps
      .map((app) => normalizeAuthenticatorApp(app))
      .filter((app): app is AuthenticatorApp => Boolean(app));

  if (Array.isArray(raw)) {
    return {
      response: true,
      message: "Success",
      data: normalizeApps(raw),
    };
  }

  if (raw && typeof raw === "object") {
    const response = raw as AuthenticatorApiResponse<unknown[]> & Record<string, unknown>;

    return {
      response:
        "response" in response
          ? response.response
          : typeof response.success === "boolean"
            ? response.success
            : true,
      message: response.message ?? "Success",
      data: Array.isArray(response.data) ? normalizeApps(response.data) : [],
    };
  }

  return {
    response: true,
    message: "Success",
    data: [],
  };
};

export const authenticatorApi = createApi({
  reducerPath: "authenticatorApi",
  baseQuery: createAppBaseQuery({
    baseUrl: AUTHENTICATOR_API_BASE_URL,
  }),
  tagTypes: [
    "AuthenticatorApps",
    "AuthenticatorOrganizations",
    "AuthenticatorDivisions",
    "AuthenticatorRoles",
    "AuthenticatorUsers",
    "AuthenticatorModules",
    "AuthenticatorPermissions",
    "AuthenticatorRolePermissionMappings",
  ],
  endpoints: (builder) => ({
    authenticatorLogin: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorLoginData>,
      AuthenticatorLoginPayload
    >({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    getAuthenticatorDashboardApps: builder.query<
      AuthenticatorApiResponse<AuthenticatorApp[]>,
      void
    >({
      keepUnusedDataFor: 0,
      query: () => ({
        url: "/api/dashboard",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: unknown) =>
        normalizeAuthenticatorAppListResponse(response),
      providesTags: ["AuthenticatorApps"],
    }),
    getAuthenticatorAppPermissionByRole: builder.query<
      AuthenticatorApiResponse<unknown>,
      string
    >({
      query: (appId) => ({
        url: "/api/permissions/getPermissionByRole",
        method: "POST",
        body: {
          appId,
        },
      }),
      transformResponse: (response: unknown) =>
        normalizeMutationResponse<unknown>(response),
    }),
    getAuthenticatorAppsList: builder.query<
      AuthenticatorApiResponse<AuthenticatorApp[]>,
      void
    >({
      keepUnusedDataFor: 0,
      query: () => ({
        url: "/api/apps/getList",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeAuthenticatorAppListResponse(response),
      providesTags: ["AuthenticatorApps"],
    }),
    getAuthenticatorOrganizations: builder.query<
      AuthenticatorApiResponse<AuthenticatorOrganization[]>,
      void
    >({
      query: () => ({
        url: "/api/organizations/getOrganizations",
        method: "GET",
      }),
      providesTags: ["AuthenticatorOrganizations"],
    }),
    getAuthenticatorDivisions: builder.query<
      AuthenticatorApiResponse<AuthenticatorDivision[]>,
      string
    >({
      query: (orgId) => ({
        url: `/api/organizations/getDivision/${orgId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, orgId) => [
        { type: "AuthenticatorDivisions", id: orgId },
      ],
    }),
    getAuthenticatorRolesByApp: builder.query<
      AuthenticatorApiResponse<AuthenticatorRole[]>,
      string
    >({
      query: (appId) => ({
        url: `/api/roles/getRoles/${appId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, appId) => [{ type: "AuthenticatorRoles", id: appId }],
    }),
    createAuthenticatorRole: builder.mutation<
      AuthenticatorApiResponse<null>,
      CreateAuthenticatorRolePayload
    >({
      query: (body) => ({
        url: "/api/roles/createRole",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRoles", id: arg.appId },
      ],
    }),
    saveAuthenticatorPermission: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorPermission | null>,
      SaveAuthenticatorPermissionPayload
    >({
      query: (body) => ({
        url: "/api/permissions/save",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorPermissions", id: arg.appId },
      ],
    }),
    saveAuthenticatorPermissionMatrix: builder.mutation<
      AuthenticatorApiResponse<null>,
      SaveAuthenticatorPermissionMatrixPayload
    >({
      query: (body) => ({
        url: "/api/permissions/save",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorPermissions", id: arg.appId },
      ],
    }),
    getAuthenticatorPermissionsByApp: builder.query<
      AuthenticatorPermissionListResponse,
      string
    >({
      async queryFn(appId, _api, _extraOptions, fetchWithBQ) {
        const normalizeResponse = (raw: unknown): AuthenticatorPermissionListResponse => {
          if (Array.isArray(raw)) {
            if (raw.some(isPermissionMatrixModule)) {
              return {
                response: true,
                message: "Success",
                data: dedupePermissionList(
                  flattenPermissionMatrixModules({
                    appId,
                    modules: raw.filter(isPermissionMatrixModule),
                  }),
                ),
                source: "remote",
              };
            }

            if (raw.some(isPermissionMatrixRecord)) {
              return {
                response: true,
                message: "Success",
                data: dedupePermissionList(
                  flattenPermissionMatrixRecords({
                    appId,
                    records: raw,
                  }),
                ),
                source: "remote",
              };
            }

            return {
              response: true,
              message: "Success",
              data: dedupePermissionList(
                raw.filter(
                  (item): item is AuthenticatorPermission =>
                    !!item && typeof item === "object",
                ),
              ),
              source: "remote",
            };
          }

          if (raw && typeof raw === "object") {
            const response = raw as AuthenticatorPermissionListResponse &
              Record<string, unknown>;

            if (Array.isArray((response as { modules?: unknown[] }).modules)) {
              return {
                response:
                  "response" in response
                    ? response.response
                    : typeof response.success === "boolean"
                      ? response.success
                      : true,
                message: response.message ?? "Success",
                data: dedupePermissionList(
                  flattenPermissionMatrixModules({
                    appId,
                    modules: (
                      response as { modules: AuthenticatorPermissionMatrixResponseModule[] }
                    ).modules,
                  }),
                ),
                source: "remote",
              };
            }

            if (Array.isArray(response.data)) {
              if (response.data.some(isPermissionMatrixModule)) {
                return {
                  response:
                    "response" in response
                      ? response.response
                      : typeof response.success === "boolean"
                        ? response.success
                        : true,
                  message: response.message ?? "Success",
                  data: dedupePermissionList(
                    flattenPermissionMatrixModules({
                      appId,
                      modules: response.data.filter(isPermissionMatrixModule),
                    }),
                  ),
                  source: "remote",
                };
              }

              if (response.data.some(isPermissionMatrixRecord)) {
                return {
                  response:
                    "response" in response
                      ? response.response
                      : typeof response.success === "boolean"
                        ? response.success
                        : true,
                  message: response.message ?? "Success",
                  data: dedupePermissionList(
                    flattenPermissionMatrixRecords({
                      appId,
                      records: response.data,
                    }),
                  ),
                  source: "remote",
                };
              }

              return {
                response:
                  "response" in response
                    ? response.response
                    : typeof response.success === "boolean"
                      ? response.success
                      : true,
                message: response.message ?? "Success",
                data: dedupePermissionList(
                  response.data.filter(
                    (item): item is AuthenticatorPermission =>
                      !!item && typeof item === "object",
                  ),
                ),
                source: "remote",
              };
            }

            if (
              response.data &&
              typeof response.data === "object" &&
              Array.isArray(
                (response.data as { modules?: AuthenticatorPermissionMatrixResponseModule[] })
                  .modules,
              )
            ) {
              return {
                response:
                  "response" in response
                    ? response.response
                    : typeof response.success === "boolean"
                      ? response.success
                      : true,
                message: response.message ?? "Success",
                data: dedupePermissionList(
                  flattenPermissionMatrixModules({
                    appId,
                    modules: (
                      response.data as {
                        modules: AuthenticatorPermissionMatrixResponseModule[];
                      }
                    ).modules,
                  }),
                ),
                source: "remote",
              };
            }
          }

          return {
            response: true,
            message: "Success",
            data: [],
            source: "remote",
          };
        };

        const result = await fetchWithBQ({
          url: `/api/permissions/get/${appId}`,
          method: "GET",
        });

        if (result.data) {
          return {
            data: normalizeResponse(result.data),
          };
        }

        const error = result.error as FetchBaseQueryError | undefined;
        if (error?.status === 404) {
          return {
            data: {
              response: false,
              message: "Permission list endpoint is not available in the current API.",
              data: [],
              source: "unavailable",
            },
          };
        }

        return { error: error as FetchBaseQueryError };
      },
      providesTags: (_result, _error, appId) => [
        { type: "AuthenticatorPermissions", id: appId },
      ],
    }),
    deleteAuthenticatorPermission: builder.mutation<
      AuthenticatorApiResponse<null>,
      DeleteAuthenticatorPermissionPayload
    >({
      query: (body) => ({
        url: "/api/permissions/delete",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorPermissions", id: arg.appId },
      ],
    }),
    saveAuthenticatorRolePermissionMapping: builder.mutation<
      AuthenticatorApiResponse<null>,
      SaveAuthenticatorRolePermissionMappingPayload
    >({
      query: (body) => ({
        url: "/api/permissions/mapPermissions",
        method: "POST",
        body: stripPermissionIdsFromRolePermissionMappingPayload(body),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRolePermissionMappings", id: arg.appId },
        { type: "AuthenticatorRoles", id: arg.appId },
        { type: "AuthenticatorPermissions", id: arg.appId },
      ],
    }),
    saveAuthenticatorRolePermissionAccess: builder.mutation<
      AuthenticatorApiResponse<null>,
      SaveAuthenticatorRolePermissionAccessPayload
    >({
      query: (body) => ({
        url: "/api/permissions/mapPermissions",
        method: "POST",
        body: stripPermissionIdsFromRolePermissionAccessPayload(body),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRolePermissionMappings", id: arg.appId },
        { type: "AuthenticatorPermissions", id: arg.appId },
      ],
    }),
    getAuthenticatorPermissionsByRole: builder.query<
      AuthenticatorApiResponse<SaveAuthenticatorRolePermissionAccessPayload | null>,
      GetAuthenticatorPermissionsByRolePayload
    >({
      query: ({ appId, roleId }) => ({
        url: "/api/permissions/getPermissionsByRoleByAdmins",
        method: "POST",
        body: {
          appId,
          roleId,
        },
      }),
      transformResponse: (response: unknown, _meta, arg) =>
        normalizeRolePermissionAccessResponse({
          raw: response,
          appId: arg.appId,
          roleId: arg.roleId,
        }),
      providesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRolePermissionMappings", id: arg.appId },
      ],
    }),
    createAuthenticatorApp: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorApp | null>,
      CreateAuthenticatorAppPayload
    >({
      query: (body) => ({
        url: "/api/apps/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AuthenticatorApps"],
    }),
    saveAuthenticatorApp: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorApp | null>,
      SaveAuthenticatorAppPayload
    >({
      async queryFn(body, _api, _extraOptions, fetchWithBQ) {
        const candidates: FetchArgs[] = [{ url: "/api/apps/create", method: "POST", body }];

        for (const candidate of candidates) {
          const result = await fetchWithBQ(candidate);

          if (result.data) {
            return {
              data: normalizeMutationResponse<AuthenticatorApp | null>(result.data),
            };
          }

          const error = result.error as FetchBaseQueryError | undefined;
          if (error?.status !== 404) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          error: {
            status: 404,
            data: {
              message: "Application create endpoint is not available in the current API.",
            },
          } as FetchBaseQueryError,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        "AuthenticatorApps",
        { type: "AuthenticatorApps", id: arg.appId || "new" },
      ],
    }),
    deleteAuthenticatorApp: builder.mutation<
      AuthenticatorApiResponse<null>,
      DeleteAuthenticatorAppPayload
    >({
      async queryFn(body, _api, _extraOptions, fetchWithBQ) {
        const candidates: FetchArgs[] = [
          { url: "/api/apps/delete", method: "POST", body },
          { url: "/api/apps/remove", method: "POST", body },
        ];

        for (const candidate of candidates) {
          const result = await fetchWithBQ(candidate);

          if (result.data) {
            return {
              data: normalizeMutationResponse<null>(result.data),
            };
          }

          const error = result.error as FetchBaseQueryError | undefined;
          if (error?.status !== 404) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          error: {
            status: 404,
            data: {
              message: "Application delete endpoint is not available in the current API.",
            },
          } as FetchBaseQueryError,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        "AuthenticatorApps",
        { type: "AuthenticatorApps", id: arg.appId },
      ],
    }),
    getAuthenticatorModulesByApp: builder.query<AuthenticatorModuleListResponse, string>({
      async queryFn(appId, _api, _extraOptions, fetchWithBQ) {
        const normalizeResponse = (raw: unknown): AuthenticatorModuleListResponse => {
          if (Array.isArray(raw)) {
            return {
              response: true,
              message: "Success",
              data: raw.filter(
                (item): item is AuthenticatorManagedModule =>
                  !!item && typeof item === "object",
              ),
              source: "remote",
            };
          }

          if (raw && typeof raw === "object") {
            const response = raw as AuthenticatorModuleListResponse &
              Record<string, unknown>;

            if (Array.isArray(response.data)) {
              return {
                response:
                  "response" in response
                    ? response.response
                    : typeof response.success === "boolean"
                      ? response.success
                      : true,
                message: response.message ?? "Success",
                data: response.data.filter(
                  (item): item is AuthenticatorManagedModule =>
                    !!item && typeof item === "object",
                ),
                source: "remote",
              };
            }
          }

          return {
            response: true,
            message: "Success",
            data: [],
            source: "remote",
          };
        };

        const candidates: FetchArgs[] = [
          { url: `/api/modules/getModules/${appId}`, method: "GET" },
      
        ];

        for (const candidate of candidates) {
          const result = await fetchWithBQ(candidate);

          if (result.data) {
            const normalized = normalizeResponse(result.data);
            const filteredData = normalized.data?.filter((module) => {
              if (!appId) {
                return true;
              }

              return !module.appId || module.appId === appId;
            });

            return {
              data: {
                ...normalized,
                data: filteredData ?? [],
              },
            };
          }

          const error = result.error as FetchBaseQueryError | undefined;
          if (error?.status !== 404) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          data: {
            response: false,
            message: "Module list endpoint is not available in the current API.",
            data: [],
            source: "unavailable",
          },
        };
      },
      providesTags: (_result, _error, appId) => [{ type: "AuthenticatorModules", id: appId }],
    }),
    createAuthenticatorModule: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorManagedModule | null>,
      CreateAuthenticatorModulePayload
    >({
      query: (body) => ({
        url: "/api/modules/addModule",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorModules", id: arg.appId },
      ],
    }),
    saveAuthenticatorModule: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorManagedModule | null>,
      SaveAuthenticatorModulePayload
    >({
      async queryFn(body, _api, _extraOptions, fetchWithBQ) {
        const candidates: FetchArgs[] = [{ url: "/api/modules/addModule", method: "POST", body }];

        for (const candidate of candidates) {
          const result = await fetchWithBQ(candidate);

          if (result.data) {
            return {
              data: normalizeMutationResponse<AuthenticatorManagedModule | null>(result.data),
            };
          }

          const error = result.error as FetchBaseQueryError | undefined;
          if (error?.status !== 404) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          error: {
            status: 404,
            data: {
              message: "Module create endpoint is not available in the current API.",
            },
          } as FetchBaseQueryError,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorModules", id: arg.appId },
      ],
    }),
    deleteAuthenticatorModule: builder.mutation<
      AuthenticatorApiResponse<null>,
      DeleteAuthenticatorModulePayload
    >({
      async queryFn(body, _api, _extraOptions, fetchWithBQ) {
        const candidates: FetchArgs[] = [
          { url: "/api/apps/deleteModule", method: "POST", body },
          { url: "/api/apps/removeModule", method: "POST", body },
          { url: "/api/modules/delete", method: "POST", body },
        ];

        for (const candidate of candidates) {
          const result = await fetchWithBQ(candidate);

          if (result.data) {
            return {
              data: normalizeMutationResponse<null>(result.data),
            };
          }

          const error = result.error as FetchBaseQueryError | undefined;
          if (error?.status !== 404) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          error: {
            status: 404,
            data: {
              message: "Module delete endpoint is not available in the current API.",
            },
          } as FetchBaseQueryError,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorModules", id: arg.appId },
      ],
    }),
    assignAuthenticatorModuleRole: builder.mutation<
      AuthenticatorApiResponse<null>,
      AssignAuthenticatorModuleRolePayload
    >({
      query: (body) => ({
        url: "/api/apps/assignModuleRole",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AuthenticatorModules", "AuthenticatorRoles"],
    }),
    assignAuthenticatorUserRole: builder.mutation<
      AuthenticatorApiResponse<null>,
      AssignAuthenticatorUserRolePayload
    >({
      query: (body) => ({
        url: "/api/auth/assignRole",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRoles", id: arg.appId },
      ],
    }),
    removeAuthenticatorUserRole: builder.mutation<
      AuthenticatorApiResponse<null>,
      RemoveAuthenticatorUserRolePayload
    >({
      query: (body) => ({
        url: "/api/user-role/removeRole",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AuthenticatorRoles", id: arg.appId },
        "AuthenticatorUsers",
      ],
    }),
    addAuthenticatorUsersToApp: builder.mutation<
      AuthenticatorApiResponse<null>,
      AddAuthenticatorUsersToAppPayload
    >({
      query: (body) => ({
        url: "/api/appsuser/addUserToApp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AuthenticatorApps", "AuthenticatorUsers"],
    }),
    removeAuthenticatorUsersFromApp: builder.mutation<
      AuthenticatorApiResponse<null>,
      RemoveAuthenticatorUsersFromAppPayload
    >({
      query: (body) => ({
        url: "/api/appsuser/removeUserFromApp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AuthenticatorApps", "AuthenticatorUsers"],
    }),
    createAuthenticatorUser: builder.mutation<
      AuthenticatorApiResponse<AuthenticatorUser | null>,
      CreateAuthenticatorUserPayload
    >({
      query: (body) => ({
        url: "/api/users/createCustomUser",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeMutationResponse<AuthenticatorUser | null>(response),
      invalidatesTags: (_result, _error, arg) => [
        "AuthenticatorUsers",
        { type: "AuthenticatorUsers", id: `${arg.orgId}-${arg.divId}` },
      ],
    }),
    getAuthenticatorUsersByApp: builder.query<
      AuthenticatorApiResponse<AuthenticatorUser[]>,
      string
    >({
      query: (appId) => ({
        url: `/api/appsuser/getUsersByApp/${appId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, appId) => [
        { type: "AuthenticatorUsers", id: `app-${appId}` },
      ],
    }),
    getAuthenticatorAllUsers: builder.query<
      AuthenticatorApiResponse<AuthenticatorUser[]>,
      void
    >({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const organizationsResult = await baseQuery({
          url: "/api/organizations/getOrganizations",
          method: "GET",
        } satisfies FetchArgs);

        if (organizationsResult.error) {
          return { error: organizationsResult.error };
        }

        const organizationsResponse = normalizeMutationResponse<AuthenticatorOrganization[]>(
          organizationsResult.data,
        );
        const organizations = Array.isArray(organizationsResponse.data)
          ? organizationsResponse.data
          : [];
        const userLookup = new Map<string, AuthenticatorUser>();

        for (const organization of organizations) {
          const divisionsResult = await baseQuery({
            url: `/api/organizations/getDivision/${organization.orgId}`,
            method: "GET",
          } satisfies FetchArgs);

          if (divisionsResult.error) {
            continue;
          }

          const divisionsResponse = normalizeMutationResponse<AuthenticatorDivision[]>(
            divisionsResult.data,
          );
          const divisions = Array.isArray(divisionsResponse.data) ? divisionsResponse.data : [];

          for (const division of divisions) {
            const usersResult = await baseQuery({
              url: "/api/users/getUsers",
              method: "POST",
              body: {
                orgId: organization.orgId,
                divId: division.divId,
              },
            } satisfies FetchArgs);

            if (usersResult.error) {
              continue;
            }

            const usersResponse = normalizeMutationResponse<AuthenticatorUser[]>(usersResult.data);
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];

            users.forEach((user) => {
              if (String(user.userId ?? "").trim()) {
                userLookup.set(user.userId, user);
              }
            });
          }
        }

        return {
          data: {
            response: true,
            message: "Success",
            data: Array.from(userLookup.values()).sort((a, b) => a.name.localeCompare(b.name)),
          },
        };
      },
      providesTags: ["AuthenticatorUsers"],
    }),
    getAuthenticatorUsers: builder.query<
      AuthenticatorApiResponse<AuthenticatorUser[]>,
      GetUsersPayload
    >({
      query: (body) => ({
        url: "/api/users/getUsers",
        method: "POST",
        body,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "AuthenticatorUsers", id: `${arg.orgId}-${arg.divId}` },
      ],
    }),
  }),
});

export const {
  useAuthenticatorLoginMutation,
  useGetAuthenticatorDashboardAppsQuery,
  useLazyGetAuthenticatorDashboardAppsQuery,
  useLazyGetAuthenticatorAppPermissionByRoleQuery,
  useGetAuthenticatorAppsListQuery,
  useLazyGetAuthenticatorAppsListQuery,
  useGetAuthenticatorOrganizationsQuery,
  useGetAuthenticatorDivisionsQuery,
  useGetAuthenticatorRolesByAppQuery,
  useLazyGetAuthenticatorRolesByAppQuery,
  useCreateAuthenticatorRoleMutation,
  useGetAuthenticatorPermissionsByAppQuery,
  useSaveAuthenticatorPermissionMutation,
  useSaveAuthenticatorPermissionMatrixMutation,
  useDeleteAuthenticatorPermissionMutation,
  useSaveAuthenticatorRolePermissionMappingMutation,
  useSaveAuthenticatorRolePermissionAccessMutation,
  useGetAuthenticatorPermissionsByRoleQuery,
  useLazyGetAuthenticatorPermissionsByRoleQuery,
  useCreateAuthenticatorAppMutation,
  useSaveAuthenticatorAppMutation,
  useDeleteAuthenticatorAppMutation,
  useGetAuthenticatorModulesByAppQuery,
  useCreateAuthenticatorModuleMutation,
  useSaveAuthenticatorModuleMutation,
  useDeleteAuthenticatorModuleMutation,
  useAssignAuthenticatorModuleRoleMutation,
  useAssignAuthenticatorUserRoleMutation,
  useRemoveAuthenticatorUserRoleMutation,
  useAddAuthenticatorUsersToAppMutation,
  useRemoveAuthenticatorUsersFromAppMutation,
  useCreateAuthenticatorUserMutation,
  useGetAuthenticatorAllUsersQuery,
  useGetAuthenticatorUsersByAppQuery,
  useGetAuthenticatorUsersQuery,
} = authenticatorApi;
