import React from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useToast } from "../../../shared/hooks/useToast";
import {
  type AuthenticatorApp,
  type AuthenticatorManagedModule,
  type AuthenticatorPermission,
  type AuthenticatorRole,
  type SaveAuthenticatorRolePermissionAccessPayload,
  useCreateAuthenticatorRoleMutation,
  useGetAuthenticatorAppsListQuery,
  useGetAuthenticatorModulesByAppQuery,
  useGetAuthenticatorPermissionsByAppQuery,
  useGetAuthenticatorPermissionsByRoleQuery,
  useGetAuthenticatorRolesByAppQuery,
  useSaveAuthenticatorRolePermissionAccessMutation,
} from "./api/authenticator";
import { moduleRoutes } from "../../../shared/sidebarNavItems";
import { useAuthenticatorSession } from "./useAuthenticatorSession";
import {
  getAuthenticatorRouteUiPermissions,
} from "./utils/authenticatorAccess";
import { getAuthenticatorScopedModuleTitle } from "./utils/authenticatorModuleLabels";
import { buildAuthenticatorDropdownApps } from "./utils/authenticatorManagedApps";

const MATRIX_ACTION_ORDER = [
  "view",
  "create",
  "update",
  "delete",
  "download",
  "approve",
  "assign",
] as const;

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Add",
  update: "Update",
  delete: "Delete",
  download: "Download",
  approve: "Approve",
  assign: "Assign",
};

const cardSurface = {
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

type ModulePermissionRow = {
  appId: string;
  moduleKey: string;
  moduleId?: string;
  moduleCode: string;
  moduleLabel: string;
  permissionsByAction: Partial<Record<string, PermissionRecord>>;
};

type AppPermissionGroup = {
  appId: string;
  appTitle: string;
  modules: ModulePermissionRow[];
  permissionIds: string[];
};

type RoleFormState = {
  roleId?: string;
  appId: string;
  roleName: string;
  roleDesc: string;
  roleCode: string;
};

type RoleDrawerMode = "create" | "edit";

type PermissionRecord = {
  permissionId: string;
  appId: string;
  moduleId?: string;
  moduleTitle?: string;
  moduleCode: string;
  permissionCode: string;
  permissionName: string;
  description: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type RoleListItem = {
  roleId: string;
  appId: string;
  roleName: string;
  roleDesc: string;
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

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number | null) =>
  normalizeValue(value)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/evidence/g, "evidance")
    .replace(/gearbox/g, "gear");

const normalizeActionKey = (action: string) => normalizeValue(action);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseRoleIdForApi = (roleId?: string | number | null) => {
  const normalizedValue = String(roleId ?? "").trim();

  if (!normalizedValue) {
    return "";
  }

  return /^\d+$/.test(normalizedValue) ? Number(normalizedValue) : normalizedValue;
};

const buildRoleCode = (roleName: string) =>
  roleName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const findRouteConfigForApp = (app: {
  appCode?: string;
  appTitle?: string;
  appDesc?: string;
  frontUrl?: string;
}) => {
  const routeCandidates = [
    normalizeValue(app.appCode),
    normalizeValue(app.appTitle),
    normalizeValue(app.frontUrl),
    normalizeLooseValue(app.appCode),
    normalizeLooseValue(app.appTitle),
    normalizeLooseValue(app.frontUrl),
  ].filter(Boolean);

  return (
    moduleRoutes.find((route) => {
      const moduleValue = normalizeValue(route.module);
      const looseModuleValue = normalizeLooseValue(route.module);

      return routeCandidates.some(
        (candidate) =>
          candidate === moduleValue ||
          candidate === looseModuleValue ||
          candidate.includes(moduleValue) ||
          moduleValue.includes(candidate) ||
          candidate.includes(looseModuleValue) ||
          looseModuleValue.includes(candidate),
      );
    }) ?? null
  );
};

const mapRemoteRoleToRecord = (
  role: AuthenticatorRole,
  appId: string,
): RoleListItem => ({
  roleId: String(role.roleId),
  appId,
  roleName: role.roleName,
  roleDesc: "",
});

const toModuleLabel = (
  moduleCode: string,
  records: PermissionRecord[],
  app?: Pick<AuthenticatorApp, "appCode" | "appTitle" | "frontUrl"> | null,
) => {
  const explicitModuleTitle = records[0]?.moduleTitle?.trim();
  if (explicitModuleTitle) {
    return getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode,
      moduleTitle: explicitModuleTitle,
    });
  }

  const sampleName = records[0]?.permissionName || moduleCode;
  const suffixPattern = new RegExp(
    `\\s+(${Object.values(ACTION_LABELS).join("|")})$`,
    "i",
  );

  return getAuthenticatorScopedModuleTitle({
    appCode: app?.appCode,
    appTitle: app?.appTitle,
    frontUrl: app?.frontUrl,
    moduleCode,
    moduleTitle: sampleName.replace(suffixPattern, "").trim() || moduleCode,
  });
};

const resolveModuleLabel = ({
  moduleId,
  moduleCode,
  records,
  moduleTitleLookup,
  app,
}: {
  moduleId?: string;
  moduleCode?: string;
  records: PermissionRecord[];
  moduleTitleLookup?: Map<string, string>;
  app?: Pick<AuthenticatorApp, "appCode" | "appTitle" | "frontUrl"> | null;
}) => {
  const lookupTitle =
    moduleTitleLookup?.get(normalizeValue(moduleId)) ||
    moduleTitleLookup?.get(normalizeValue(moduleCode));

  if (lookupTitle) {
    return getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode,
      moduleTitle: lookupTitle,
    });
  }

  const explicitModuleTitle = records[0]?.moduleTitle?.trim();
  if (explicitModuleTitle && !UUID_PATTERN.test(explicitModuleTitle)) {
    return getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode,
      moduleTitle: explicitModuleTitle,
    });
  }

  return toModuleLabel(moduleCode ?? "", records, app);
};

const createInitialRoleForm = (): RoleFormState => ({
  roleId: "",
  appId: "",
  roleName: "",
  roleDesc: "",
  roleCode: "",
});

const buildRolePermissionAccessPayload = ({
  app,
  role,
  moduleRows,
  selectedPermissionIds,
}: {
  app: AuthenticatorApp;
  role: RoleListItem;
  moduleRows: ModulePermissionRow[];
  selectedPermissionIds: string[];
}): SaveAuthenticatorRolePermissionAccessPayload => {
  const routeConfig = findRouteConfigForApp(app);

  return {
    appId: app.appId,
    appTitle: app.appTitle || app.appId,
    roleId: parseRoleIdForApi(role.roleId),
    roleName: role.roleName,
    modules: moduleRows.map((moduleRow) => {
      const routeFromConfig =
        routeConfig?.children.find(
          (child) =>
            normalizeValue(child.moduleCode) === normalizeValue(moduleRow.moduleCode) ||
            normalizeValue(child.name) === normalizeValue(moduleRow.moduleLabel),
        )?.path ?? "";

      const permissions = Object.fromEntries(
        MATRIX_ACTION_ORDER.map((action) => [
          normalizeActionKey(action),
          Boolean(
            moduleRow.permissionsByAction[action] &&
              selectedPermissionIds.includes(
                moduleRow.permissionsByAction[action]!.permissionId,
              ),
          ),
        ]),
      );

      return {
        moduleId: moduleRow.moduleId ?? "",
        moduleCode: moduleRow.moduleCode,
        moduleTitle: moduleRow.moduleLabel,
        route: routeFromConfig && routeConfig ? `/${routeConfig.module}${routeFromConfig}` : "",
        permissions,
      };
    }),
  };
};

const inferModuleTitleFromPermission = (permission: AuthenticatorPermission) => {
  const suffixPattern = new RegExp(
    `\\s+(${Object.values(ACTION_LABELS).join("|")})$`,
    "i",
  );

  return (
    String(permission.permissionName ?? "")
      .replace(suffixPattern, "")
      .trim() ||
    String(permission.moduleCode ?? permission.moduleId ?? "Module").trim()
  );
};

const buildModuleTitleLookup = (
  modules: AuthenticatorManagedModule[],
  app?: Pick<AuthenticatorApp, "appCode" | "appTitle" | "frontUrl"> | null,
) => {
  const lookup = new Map<string, string>();

  modules.forEach((module) => {
    const moduleTitle = getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode: module.moduleCode,
      moduleTitle: module.moduleTitle,
    });
    const moduleId = String(module.moduleId ?? "").trim();
    const moduleCode = String(module.moduleCode ?? "").trim();

    if (!moduleTitle) {
      return;
    }

    if (moduleId) {
      lookup.set(normalizeValue(moduleId), moduleTitle);
    }

    if (moduleCode) {
      lookup.set(normalizeValue(moduleCode), moduleTitle);
    }
  });

  return lookup;
};

const mapRemotePermissionToRecord = (
  permission: AuthenticatorPermission,
  moduleTitleLookup?: Map<string, string>,
  app?: Pick<AuthenticatorApp, "appCode" | "appTitle" | "frontUrl"> | null,
): PermissionRecord => {
  const timestamp = new Date().toISOString();
  const moduleCode = String(permission.moduleCode ?? permission.moduleId ?? "").trim();
  const moduleId = String(permission.moduleId ?? "").trim();
  const mappedModuleTitle =
    moduleTitleLookup?.get(normalizeValue(moduleId)) ||
    moduleTitleLookup?.get(normalizeValue(moduleCode)) ||
    "";

  return {
    permissionId:
      String(permission.permissionId ?? "").trim() ||
      `permission-${normalizeValue(permission.appId)}-${normalizeValue(moduleCode)}-${normalizeActionKey(permission.action)}`,
    appId: String(permission.appId ?? "").trim(),
    moduleId: moduleId || undefined,
    moduleTitle: getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode,
      moduleTitle: mappedModuleTitle || inferModuleTitleFromPermission(permission),
    }),
    moduleCode,
    permissionCode:
      String(permission.permissionCode ?? "").trim() ||
      `${moduleCode}_${normalizeActionKey(permission.action)}`
        .replace(/[^a-z0-9]+/gi, "_")
        .toUpperCase(),
    permissionName:
      String(permission.permissionName ?? "").trim() ||
      `${getAuthenticatorScopedModuleTitle({
        appCode: app?.appCode,
        appTitle: app?.appTitle,
        frontUrl: app?.frontUrl,
        moduleCode,
        moduleTitle: inferModuleTitleFromPermission(permission),
      })} ${ACTION_LABELS[permission.action] || permission.action}`,
    description: String(permission.permissionDesc ?? "").trim(),
    action: normalizeValue(permission.action),
    isActive: coerceBoolean(permission.isActive),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const buildPermissionRecordKey = (permission: PermissionRecord) => {
  const moduleKey =
    permission.moduleId?.trim() ||
    permission.moduleCode?.trim() ||
    permission.moduleTitle?.trim() ||
    permission.permissionCode?.trim() ||
    permission.permissionId;

  return [
    normalizeValue(permission.appId),
    normalizeValue(moduleKey),
    normalizeActionKey(permission.action),
  ].join("::");
};

const dedupePermissionRecords = (permissions: PermissionRecord[]) => {
  const lookup = new Map<string, PermissionRecord>();

  permissions.forEach((permission) => {
    const recordKey = buildPermissionRecordKey(permission);
    const previous = lookup.get(recordKey);

    lookup.set(recordKey, {
      ...previous,
      ...permission,
      permissionId:
        String(previous?.permissionId ?? "").trim() ||
        String(permission.permissionId ?? "").trim() ||
        `permission-${recordKey.replace(/[^a-z0-9]+/gi, "-")}`,
      moduleId: permission.moduleId ?? previous?.moduleId,
      moduleTitle:
        String(permission.moduleTitle ?? "").trim() ||
        String(previous?.moduleTitle ?? "").trim() ||
        undefined,
      moduleCode:
        String(permission.moduleCode ?? "").trim() ||
        String(previous?.moduleCode ?? "").trim(),
      permissionCode:
        String(permission.permissionCode ?? "").trim() ||
        String(previous?.permissionCode ?? "").trim(),
      permissionName:
        String(permission.permissionName ?? "").trim() ||
        String(previous?.permissionName ?? "").trim() ||
        "Permission",
      description:
        String(permission.description ?? "").trim() ||
        String(previous?.description ?? "").trim(),
      action: normalizeActionKey(permission.action),
      isActive:
        previous === undefined
          ? coerceBoolean(permission.isActive)
          : previous.isActive || coerceBoolean(permission.isActive),
      createdAt: permission.createdAt || previous?.createdAt || new Date().toISOString(),
      updatedAt: permission.updatedAt || previous?.updatedAt || new Date().toISOString(),
    });
  });

  return Array.from(lookup.values());
};

const buildPermissionRecordsFromAccessPayload = ({
  accessPayload,
  moduleTitleLookup,
  app,
}: {
  accessPayload?: SaveAuthenticatorRolePermissionAccessPayload | null;
  moduleTitleLookup?: Map<string, string>;
  app?: Pick<AuthenticatorApp, "appCode" | "appTitle" | "frontUrl"> | null;
}) => {
  if (!accessPayload) {
    return [];
  }

  const timestamp = new Date().toISOString();

  return accessPayload.modules.flatMap((module) => {
    const moduleId = String(module.moduleId ?? "").trim();
    const moduleCode = String(module.moduleCode ?? module.moduleId ?? "").trim();
    const mappedModuleTitle =
      moduleTitleLookup?.get(normalizeValue(moduleId)) ||
      moduleTitleLookup?.get(normalizeValue(moduleCode)) ||
      "";
    const moduleTitle = getAuthenticatorScopedModuleTitle({
      appCode: app?.appCode,
      appTitle: app?.appTitle,
      frontUrl: app?.frontUrl,
      moduleCode,
      moduleTitle:
        String(module.moduleTitle ?? "").trim() ||
        mappedModuleTitle ||
        moduleCode ||
        moduleId ||
        "Module",
    });

    return Object.keys(module.permissions ?? {}).flatMap((action) => {
      const normalizedAction = normalizeActionKey(action);

      if (!normalizedAction) {
        return [];
      }

      const fallbackPermissionId = [
        "permission",
        normalizeValue(accessPayload.appId),
        normalizeValue(moduleCode || moduleId || moduleTitle),
        normalizedAction,
      ]
        .filter(Boolean)
        .join("-");

      return [
        {
          permissionId: fallbackPermissionId,
          appId: String(accessPayload.appId ?? "").trim(),
          moduleId: moduleId || undefined,
          moduleTitle,
          moduleCode,
          permissionCode:
            `${moduleCode || moduleId || moduleTitle}_${normalizedAction}`
              .replace(/[^a-z0-9]+/gi, "_")
              .toUpperCase(),
          permissionName:
            `${moduleTitle} ${ACTION_LABELS[normalizedAction] || normalizedAction}`.trim(),
          description: "",
          action: normalizedAction,
          // Role API booleans represent assignment, not master permission availability.
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        } satisfies PermissionRecord,
      ];
    });
  });
};

const buildSelectedPermissionIdsFromAccessPayload = ({
  accessPayload,
  permissions,
}: {
  accessPayload: SaveAuthenticatorRolePermissionAccessPayload | null;
  permissions: PermissionRecord[];
}) => {
  if (!accessPayload) {
    return [];
  }

  return permissions
    .filter((permission) => {
      const matchedModule =
        accessPayload.modules.find(
          (module) =>
            normalizeValue(module.moduleCode) === normalizeValue(permission.moduleCode) ||
            normalizeValue(module.moduleTitle) === normalizeValue(permission.moduleTitle),
        ) ?? null;

      if (!matchedModule) {
        return false;
      }

      return coerceBoolean(matchedModule.permissions[normalizeActionKey(permission.action)]);
    })
    .map((permission) => permission.permissionId);
};

const buildPermissionAvailabilityLookup = (permissions: PermissionRecord[]) => {
  const lookup = new Map<string, Record<string, boolean>>();

  permissions.forEach((permission) => {
    const aliases = [
      `id:${normalizeValue(permission.moduleId)}`,
      `code:${normalizeValue(permission.moduleCode)}`,
      `title:${normalizeValue(permission.moduleTitle)}`,
      `title:${normalizeValue(toModuleLabel(permission.moduleCode, [permission]))}`,
    ].filter((alias) => !alias.endsWith(":"));

    if (aliases.length === 0) {
      return;
    }

    aliases.forEach((alias) => {
      const lookupKey = `${normalizeValue(permission.appId)}::${alias}`;
      const current = lookup.get(lookupKey) ?? {};
      current[normalizeActionKey(permission.action)] = coerceBoolean(permission.isActive);
      lookup.set(lookupKey, current);
    });
  });

  return lookup;
};

const resolvePermissionAvailability = ({
  appId,
  moduleId,
  moduleCode,
  moduleTitle,
  lookup,
}: {
  appId?: string;
  moduleId?: string;
  moduleCode?: string;
  moduleTitle?: string;
  lookup: Map<string, Record<string, boolean>>;
}) => {
  const appKey = normalizeValue(appId);
  const aliases = [
    `id:${normalizeValue(moduleId)}`,
    `code:${normalizeValue(moduleCode)}`,
    `title:${normalizeValue(moduleTitle)}`,
  ].filter((alias) => !alias.endsWith(":"));

  for (const alias of aliases) {
    const matchedPermissions = lookup.get(`${appKey}::${alias}`);

    if (matchedPermissions) {
      return {
        matched: true,
        permissions: matchedPermissions,
      };
    }
  }

  return {
    matched: false,
    permissions: {} as Record<string, boolean>,
  };
};

const RolePermissionMappingPage = () => {
  const { showToast } = useToast();
  const { sessionReady, bootstrapping, autoLoginError } = useAuthenticatorSession();
  const [createAuthenticatorRole, { isLoading: isCreatingRole }] =
    useCreateAuthenticatorRoleMutation();
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<string[]>([]);
  const [roleDrawerOpen, setRoleDrawerOpen] = React.useState(false);
  const [roleDrawerMode, setRoleDrawerMode] = React.useState<RoleDrawerMode>("create");
  const [roleForm, setRoleForm] = React.useState<RoleFormState>(createInitialRoleForm);
  const [roleFormError, setRoleFormError] = React.useState("");
  const roleMappingRoutePermissions = React.useMemo(
    () => getAuthenticatorRouteUiPermissions("/authenticator/role-permission-mapping"),
    [],
  );
  const canCreateRole = roleMappingRoutePermissions.create;
  const canEditRole = roleMappingRoutePermissions.update;
  const canAssignRolePermissions =
    roleMappingRoutePermissions.assign || roleMappingRoutePermissions.update;

  const { data: appsResponse } = useGetAuthenticatorAppsListQuery(undefined, {
    skip: !sessionReady,
  });
  const applications = React.useMemo(
    () => buildAuthenticatorDropdownApps(appsResponse?.data ?? []),
    [appsResponse?.data],
  );
  const applicationTitleLookup = React.useMemo(
    () =>
      new Map<string, string>(
        applications.map((app) => [app.appId, app.appTitle]),
      ),
    [applications],
  );
  const { currentData: currentRolesResponse, isFetching: isFetchingRoles } =
    useGetAuthenticatorRolesByAppQuery(selectedAppId, {
      skip: !sessionReady || !selectedAppId,
    });
  const {
    data: permissionsResponse,
    isFetching: isFetchingPermissions,
    isLoading: isLoadingPermissions,
  } = useGetAuthenticatorPermissionsByAppQuery(selectedAppId, {
    skip: !sessionReady || !selectedAppId,
    refetchOnMountOrArgChange: true,
  });
  const { data: modulesResponse } = useGetAuthenticatorModulesByAppQuery(selectedAppId, {
    skip: !sessionReady || !selectedAppId,
    refetchOnMountOrArgChange: true,
  });
  const {
    currentData: currentRolePermissionsResponse,
    isFetching: isFetchingRolePermissions,
    isLoading: isLoadingRolePermissions,
  } = useGetAuthenticatorPermissionsByRoleQuery(
    {
      appId: selectedAppId,
      roleId: parseRoleIdForApi(selectedRoleId),
    },
    {
      skip: !sessionReady || !selectedAppId || !selectedRoleId,
      refetchOnMountOrArgChange: true,
    },
  );
  const [saveAuthenticatorRolePermissionAccess, { isLoading: isSavingMapping }] =
    useSaveAuthenticatorRolePermissionAccessMutation();
  const isRoleFormSubmitting = isCreatingRole;

  React.useEffect(() => {
    if (applications.length === 0) {
      if (selectedAppId) {
        setSelectedAppId("");
      }
      return;
    }

    if (!applications.some((app) => app.appId === selectedAppId)) {
      setSelectedAppId(applications[0].appId);
    }
  }, [applications, selectedAppId]);

  const remoteRoles = React.useMemo(
    () =>
      (currentRolesResponse?.data ?? []).map((role) => mapRemoteRoleToRecord(role, selectedAppId)),
    [currentRolesResponse?.data, selectedAppId],
  );
  const selectedApp = React.useMemo(
    () => applications.find((app) => app.appId === selectedAppId) ?? null,
    [applications, selectedAppId],
  );
  const moduleTitleLookup = React.useMemo(
    () => buildModuleTitleLookup(modulesResponse?.data ?? [], selectedApp),
    [modulesResponse?.data, selectedApp],
  );

  const permissions = React.useMemo(
    () => {
      const remotePermissions = (permissionsResponse?.data ?? []).map((permission) =>
        mapRemotePermissionToRecord(permission, moduleTitleLookup, selectedApp),
      );
      const fallbackPermissions = buildPermissionRecordsFromAccessPayload({
        accessPayload: currentRolePermissionsResponse?.data,
        moduleTitleLookup,
        app: selectedApp,
      });

      return dedupePermissionRecords([...remotePermissions, ...fallbackPermissions]);
    },
    [currentRolePermissionsResponse?.data, moduleTitleLookup, permissionsResponse?.data, selectedApp],
  );
  const permissionAvailabilityLookup = React.useMemo(
    () => buildPermissionAvailabilityLookup(permissions),
    [permissions],
  );

  const availableRoles = React.useMemo(
    () =>
      [...remoteRoles].sort((first, second) =>
        `${applicationTitleLookup.get(first.appId) ?? first.appId}-${first.roleName}`.localeCompare(
          `${applicationTitleLookup.get(second.appId) ?? second.appId}-${second.roleName}`,
        ),
      ),
    [applicationTitleLookup, remoteRoles],
  );

  React.useEffect(() => {
    setSelectedRoleId("");
  }, [selectedAppId]);

  React.useEffect(() => {
    if (!availableRoles.some((role) => role.roleId === selectedRoleId)) {
      setSelectedRoleId(availableRoles[0]?.roleId ?? "");
    }
  }, [availableRoles, selectedRoleId]);

  const availablePermissions = React.useMemo(
    () => permissions.filter((permission) => permission.isActive),
    [permissions],
  );
  const visibleActions = React.useMemo(
    () =>
      MATRIX_ACTION_ORDER.filter((action) =>
        availablePermissions.some((permission) => permission.action === action),
      ),
    [availablePermissions],
  );
  const tableColumnCount = 2 + visibleActions.length;

  const moduleRows = React.useMemo<ModulePermissionRow[]>(() => {
    const groups = new Map<string, PermissionRecord[]>();

    availablePermissions.forEach((permission) => {
      const moduleKey =
        permission.moduleId?.trim() ||
        permission.moduleCode?.trim() ||
        permission.moduleTitle?.trim() ||
        permission.permissionId;
      const groupKey = `${permission.appId}::${moduleKey}`;
      const current = groups.get(groupKey) ?? [];
      current.push(permission);
      groups.set(groupKey, current);
    });

    return Array.from(groups.values())
      .map((records) => {
        const permissionsByAction: Partial<Record<string, PermissionRecord>> = {};
        const appId = records[0]?.appId ?? "";
        const moduleId = records[0]?.moduleId;
        const moduleCode = records[0]?.moduleCode ?? "";
        const moduleKey =
          records[0]?.moduleId?.trim() ||
          records[0]?.moduleCode?.trim() ||
          records[0]?.moduleTitle?.trim() ||
          records[0]?.permissionId;

        records.forEach((permission) => {
          permissionsByAction[permission.action] = permission;
        });

        return {
          appId,
          moduleKey,
          moduleId,
          moduleCode,
          moduleLabel: resolveModuleLabel({
            moduleId,
            moduleCode,
            records,
            moduleTitleLookup,
            app: selectedApp,
          }),
          permissionsByAction,
        };
      })
      .sort((first, second) =>
        `${
          applicationTitleLookup.get(first.appId) ?? first.appId
        }-${first.moduleLabel}`.localeCompare(
          `${applicationTitleLookup.get(second.appId) ?? second.appId}-${second.moduleLabel}`,
        ),
      );
  }, [applicationTitleLookup, availablePermissions, moduleTitleLookup, selectedApp]);

  const appPermissionGroups = React.useMemo<AppPermissionGroup[]>(
    () => {
      const grouped = new Map<string, ModulePermissionRow[]>();

      moduleRows.forEach((moduleRow) => {
        const current = grouped.get(moduleRow.appId) ?? [];
        current.push(moduleRow);
        grouped.set(moduleRow.appId, current);
      });

      return Array.from(grouped.entries())
        .map(([appId, modules]) => ({
          appId,
          appTitle: applicationTitleLookup.get(appId) ?? appId,
          modules,
          permissionIds: modules.flatMap((moduleRow) =>
            Object.values(moduleRow.permissionsByAction)
              .filter(Boolean)
              .map((permission) => permission.permissionId),
          ),
        }))
        .sort((first, second) => first.appTitle.localeCompare(second.appTitle));
    },
    [applicationTitleLookup, moduleRows],
  );

  const selectedRole = React.useMemo(
    () => availableRoles.find((role) => role.roleId === selectedRoleId) ?? null,
    [availableRoles, selectedRoleId],
  );

  const activeMapping = React.useMemo(() => {
    const mapping = currentRolePermissionsResponse?.data ?? null;

    if (!mapping) {
      return null;
    }

    return {
      ...mapping,
      modules: mapping.modules.map((module) => {
        const availability = resolvePermissionAvailability({
          appId: mapping.appId || selectedAppId,
          moduleId: module.moduleId,
          moduleCode: module.moduleCode,
          moduleTitle: module.moduleTitle,
          lookup: permissionAvailabilityLookup,
        });

        if (!availability.matched) {
          return module;
        }

        return {
          ...module,
          permissions: Object.fromEntries(
            MATRIX_ACTION_ORDER.map((action) => {
              const normalizedAction = normalizeActionKey(action);
              return [
                normalizedAction,
                Boolean(
                  coerceBoolean(module.permissions[normalizedAction]) &&
                    availability.permissions[normalizedAction],
                ),
              ];
            }),
          ),
        };
      }),
    };
  }, [
    currentRolePermissionsResponse?.data,
    permissionAvailabilityLookup,
    selectedAppId,
  ]);

  React.useEffect(() => {
    setSelectedPermissionIds([]);
  }, [selectedAppId, selectedRoleId]);

  React.useEffect(() => {
    setSelectedPermissionIds(
      buildSelectedPermissionIdsFromAccessPayload({
        accessPayload: activeMapping,
        permissions: availablePermissions,
      }),
    );
  }, [activeMapping, availablePermissions]);

  const allPermissionIds = React.useMemo(
    () => availablePermissions.map((permission) => permission.permissionId),
    [availablePermissions],
  );

  const isAllSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((permissionId) => selectedPermissionIds.includes(permissionId));

  const toggleAllPermissions = (checked: boolean) => {
    setSelectedPermissionIds(checked ? allPermissionIds : []);
  };

  const toggleActionColumn = (action: string, checked: boolean) => {
    const actionPermissionIds = availablePermissions
      .filter((permission) => permission.action === action)
      .map((permission) => permission.permissionId);

    setSelectedPermissionIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...actionPermissionIds]));
      }

      return current.filter((permissionId) => !actionPermissionIds.includes(permissionId));
    });
  };

  const toggleAppGroup = (permissionIds: string[], checked: boolean) => {
    setSelectedPermissionIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...permissionIds]));
      }

      return current.filter((permissionId) => !permissionIds.includes(permissionId));
    });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((item) => item !== permissionId)
        : [...current, permissionId],
    );
  };

  const handleModuleToggle = (permissionIds: string[], checked: boolean) => {
    setSelectedPermissionIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...permissionIds]));
      }

      return current.filter((permissionId) => !permissionIds.includes(permissionId));
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId || !selectedRole?.appId) {
      showToast("Please select a role.", "warning");
      return;
    }

    const accessPayload = buildRolePermissionAccessPayload({
      app:
        applications.find((application) => application.appId === selectedRole.appId) ?? {
          appId: selectedRole.appId,
          appTitle: selectedRole.appId,
          appDesc: "",
        },
      role: selectedRole,
      moduleRows,
      selectedPermissionIds,
    });

    try {
      const response = await saveAuthenticatorRolePermissionAccess(accessPayload).unwrap();
      showToast(
        response?.message || "Role permission mapping was saved successfully.",
        "success",
      );
    } catch (error: any) {
      console.error("Role permission save failed", error);
      showToast(
        error?.data?.message || error?.message || "There was a problem saving the role permission mapping.",
        "error",
      );
    }
  };

  const roleAppOptions = React.useMemo(
    () => applications.map((app) => ({ appId: app.appId, appTitle: app.appTitle })),
    [applications],
  );

  const openAddRoleDrawer = () => {
    setRoleDrawerMode("create");
    setRoleForm({
      ...createInitialRoleForm(),
      appId: selectedAppId || roleAppOptions[0]?.appId || "",
    });
    setRoleFormError("");
    setRoleDrawerOpen(true);
  };

  const openEditRoleDrawer = () => {
    if (!selectedRole) {
      showToast("Please select a role to edit.", "warning");
      return;
    }

    setRoleDrawerMode("edit");
    setRoleForm({
      roleId: selectedRole.roleId,
      appId: selectedRole.appId,
      roleName: selectedRole.roleName,
      roleDesc: selectedRole.roleDesc || "",
      roleCode: buildRoleCode(selectedRole.roleName),
    });
    setRoleFormError("");
    setRoleDrawerOpen(true);
  };

  const closeRoleDrawer = () => {
    setRoleDrawerOpen(false);
    setRoleDrawerMode("create");
    setRoleFormError("");
    setRoleForm(createInitialRoleForm());
  };

  const handleSaveRole = async (event: React.FormEvent) => {
    event.preventDefault();

    const derivedRoleCode = buildRoleCode(roleForm.roleName);

    if (!roleForm.appId || !roleForm.roleName.trim()) {
      setRoleFormError("Application and role name are required.");
      return;
    }

    if (!derivedRoleCode) {
      setRoleFormError("A role code could not be generated from the role name.");
      return;
    }

    if (roleDrawerMode === "edit" && !String(roleForm.roleId ?? "").trim()) {
      setRoleFormError("Role ID is missing. Please close the drawer and try editing again.");
      return;
    }

    const duplicateRole = availableRoles.find((role) => {
      return (
        role.appId === roleForm.appId &&
        role.roleId !== String(roleForm.roleId ?? "") &&
        role.roleName.trim().toLowerCase() === roleForm.roleName.trim().toLowerCase()
      );
    });

    if (duplicateRole) {
      setRoleFormError("This role name already exists in the selected application.");
      return;
    }

    try {
      const payload = {
        roleId:
          roleDrawerMode === "edit" ? parseRoleIdForApi(roleForm.roleId) : undefined,
        appId: roleForm.appId,
        roleName: roleForm.roleName.trim(),
        roleDesc: roleForm.roleDesc.trim(),
        roleCode: derivedRoleCode,
      };
      const response = await createAuthenticatorRole(payload).unwrap();

      setSelectedAppId(roleForm.appId);
      if (roleForm.roleId) {
        setSelectedRoleId(String(roleForm.roleId));
      }
      closeRoleDrawer();
      showToast(
        response.message ||
          (roleDrawerMode === "edit"
            ? "Role updated successfully."
            : "Role created successfully."),
        "success",
      );
    } catch (error: any) {
      console.error(roleDrawerMode === "edit" ? "Role save API failed" : "Role create API failed", error);
      setRoleFormError(
        error?.data?.message ||
          error?.message ||
          (roleDrawerMode === "edit" ? "Role save API failed." : "Role create API failed."),
      );
    }
  };

  if (bootstrapping) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Initializing authenticator session...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{   display: "grid", gap: 3 }}>
    

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(260px, 25%) minmax(0, 70%)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Card sx={{ ...cardSurface, minHeight: 560 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 2.5, py: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                spacing={1}
              >
                <Stack spacing={1} sx={{ flex: 1 }}>
                  
                  <TextField
                    select
                    size="small"
                    label="Application"
                    value={selectedAppId}
                    onChange={(event) => setSelectedAppId(event.target.value)}
                    sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    disabled={applications.length === 0}
                  >
                    {applications.map((app) => (
                      <MenuItem key={app.appId} value={app.appId}>
                        {app.appTitle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                {canCreateRole && (
                  <Tooltip title="Add Role">
                    <IconButton
                      onClick={openAddRoleDrawer}
                      size="small"
                      sx={{
                        alignSelf: { xs: "flex-start", sm: "center" },
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                        width: 36,
                        height: 36,
                      }}
                    >
                      <AddRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
            <Divider />
            <Stack spacing={0} sx={{ p: 1 }}>
              {isFetchingRoles ? (
                <Box sx={{ px: 2, py: 1 }}>
                  <LinearProgress />
                </Box>
              ) : availableRoles.length > 0 ? (
                availableRoles.map((role) => {
                  const isSelected = role.roleId === selectedRoleId;

                  return (
                    <Box
                      key={role.roleId}
                      onClick={() => setSelectedRoleId(role.roleId)}
                      sx={{
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? alpha("#1976D2", 0.08) : "transparent",
                        px: 2,
                        py: 1.5,
                        mb:1,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: alpha("#1976D2", 0.06),
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography fontWeight={800}>{role.roleName}</Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {isSelected && (
                              <ShieldRoundedIcon color="primary" fontSize="small" />
                            )}
                          </Stack>
                        </Stack>
                         
                      </Stack>
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ p: 2 }}>
                  <Alert severity="info">No roles are available for the selected application.</Alert>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          <Card sx={{ ...cardSurface, minHeight: 560 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Permissions : {selectedRole?.roleName || "No role selected"}
                    </Typography>
                   
                  </Box>
                  {(canAssignRolePermissions || canEditRole) && (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {canEditRole && (
                        <Button
                          variant="outlined"
                          startIcon={<EditRoundedIcon />}
                          onClick={openEditRoleDrawer}
                          disabled={!selectedRoleId}
                          sx={{ borderRadius: 999 }}
                        >
                          Edit Role
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<SaveRoundedIcon />}
                        onClick={() => void handleSave()}
                        disabled={isSavingMapping || !selectedRoleId}
                        sx={{ borderRadius: 999 }}
                      >
                        {isSavingMapping ? "Saving..." : "Save Mapping"}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Box>
              <Divider />

              {!canAssignRolePermissions && (
                <Alert severity="info" sx={{ m: 2 }}>
                  This role permission matrix is currently read-only.
                </Alert>
              )}

              {(isFetchingPermissions ||
                isLoadingPermissions ||
                isFetchingRolePermissions ||
                isLoadingRolePermissions) && (
                <LinearProgress sx={{ mx: 2, mt: 2 }} />
              )}

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 180, fontWeight: 800 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Checkbox
                            checked={isAllSelected}
                            indeterminate={
                              selectedPermissionIds.length > 0 && !isAllSelected
                            }
                            disabled={!canAssignRolePermissions}
                            onChange={(event) => toggleAllPermissions(event.target.checked)}
                          />
                          <span>Apps</span>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180, fontWeight: 800 }}>Module</TableCell>
                      {visibleActions.map((action) => (
                        <TableCell
                          key={action}
                          align="center"
                          sx={{ minWidth: 90, fontWeight: 800 }}
                        >
                          <Stack
                            spacing={0.4}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Checkbox
                              size="small"
                              checked={
                                availablePermissions
                                  .filter((permission) => permission.action === action)
                                  .every((permission) =>
                                    selectedPermissionIds.includes(permission.permissionId),
                                  ) &&
                                availablePermissions.some(
                                  (permission) => permission.action === action,
                                )
                              }
                              indeterminate={
                                availablePermissions
                                  .filter((permission) => permission.action === action)
                                  .some((permission) =>
                                    selectedPermissionIds.includes(permission.permissionId),
                                  ) &&
                                !availablePermissions
                                  .filter((permission) => permission.action === action)
                                  .every((permission) =>
                                    selectedPermissionIds.includes(permission.permissionId),
                                  )
                              }
                              disabled={!canAssignRolePermissions}
                              onChange={(event) =>
                                toggleActionColumn(action, event.target.checked)
                              }
                            />
                            <span>{ACTION_LABELS[action] || action}</span>
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isSavingMapping ? (
                      <TableRow>
                        <TableCell colSpan={tableColumnCount}>
                          <LinearProgress sx={{ my: 1 }} />
                        </TableCell>
                      </TableRow>
                    ) : appPermissionGroups.length > 0 ? (
                      appPermissionGroups.map((appGroup) => {
                        const isAppSelected =
                          appGroup.permissionIds.length > 0 &&
                          appGroup.permissionIds.every((permissionId) =>
                            selectedPermissionIds.includes(permissionId),
                          );
                        const isAppIndeterminate =
                          appGroup.permissionIds.some((permissionId) =>
                            selectedPermissionIds.includes(permissionId),
                          ) && !isAppSelected;

                        return (
                          <React.Fragment key={appGroup.appId}>
                            <TableRow
                              sx={{
                                bgcolor: alpha("#1976D2", 0.06),
                                "& td": {
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                },
                              }}
                            >
                              <TableCell colSpan={tableColumnCount}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                  <Checkbox
                                    checked={isAppSelected}
                                    indeterminate={isAppIndeterminate}
                                    disabled={!canAssignRolePermissions}
                                    onChange={(event) =>
                                      toggleAppGroup(
                                        appGroup.permissionIds,
                                        event.target.checked,
                                      )
                                    }
                                  />
                                  <Chip label={appGroup.appTitle} color="primary" size="small" />
                                  
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {appGroup.modules.map((moduleRow) => {
                              const modulePermissionIds = Object.values(
                                moduleRow.permissionsByAction,
                              )
                                .filter(Boolean)
                                .map((permission) => permission.permissionId);
                              const allSelected =
                                modulePermissionIds.length > 0 &&
                                modulePermissionIds.every((permissionId) =>
                                  selectedPermissionIds.includes(permissionId),
                                );

                              return (
                                <TableRow key={`${appGroup.appId}-${moduleRow.moduleKey}`} hover>
                                  <TableCell />
                                  <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Checkbox
                                        checked={allSelected}
                                        indeterminate={
                                          modulePermissionIds.some((permissionId) =>
                                            selectedPermissionIds.includes(permissionId),
                                          ) && !allSelected
                                        }
                                        disabled={!canAssignRolePermissions}
                                        onChange={(event) =>
                                          handleModuleToggle(
                                            modulePermissionIds,
                                            event.target.checked,
                                          )
                                        }
                                      />
                                      <Stack spacing={0.8}>
                                        <Typography fontWeight={700}>
                                          {moduleRow.moduleLabel}
                                        </Typography>
                                        
                                      </Stack>
                                    </Stack>
                                  </TableCell>
                                  {visibleActions.map((action) => {
                                    const permission = moduleRow.permissionsByAction[action];
                                    const checked =
                                      !!permission &&
                                      selectedPermissionIds.includes(permission.permissionId);

                                    return (
                                      <TableCell key={action} align="center">
                                        {permission ? (
                                          <Checkbox
                                            checked={checked}
                                            disabled={!canAssignRolePermissions}
                                            onChange={() =>
                                              togglePermission(permission.permissionId)
                                            }
                                          />
                                        ) : (
                                          <Typography variant="body2" color="text.disabled">
                                            -
                                          </Typography>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={tableColumnCount}>
                          <Alert severity="info" sx={{ my: 1 }}>
                            No permission records are available for this application. Please add
                            permissions on the Permission CRUD page first.
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

           
 
        </Stack>
      </Box>

      <Drawer
        anchor="right"
        open={roleDrawerOpen}
        onClose={closeRoleDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420, lg: 480 },
            maxWidth: "100%",
          },
        }}
      >
        <Box sx={{ p: 3, mt: 6 }}>
          <Box component="form" onSubmit={handleSaveRole}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {roleDrawerMode === "edit" ? "Edit Role" : "Add Role"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                  {roleDrawerMode === "edit"
                    ? "The selected role will be updated directly through the API."
                    : "A new role will be created directly through the API."}
                </Typography>
              </Box>

              {roleFormError && <Alert severity="warning">{roleFormError}</Alert>}

              <TextField
                select
                label="Application"
                value={roleForm.appId}
                onChange={(event) =>
                  setRoleForm((current) => ({ ...current, appId: event.target.value }))
                }
                disabled={roleDrawerMode === "edit"}
                fullWidth
              >
                {roleAppOptions.map((app) => (
                  <MenuItem key={app.appId} value={app.appId}>
                    {app.appTitle}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Role Name"
                value={roleForm.roleName}
                onChange={(event) =>
                  setRoleForm((current) => {
                    const roleName = event.target.value;
                    return {
                      ...current,
                      roleName,
                      roleCode: buildRoleCode(roleName),
                    };
                  })
                }
                fullWidth
              />

              <TextField
                label="Role Code"
                value={roleForm.roleCode}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Auto-generated from the role name."
              />

              <TextField
                label="Role Description"
                value={roleForm.roleDesc}
                onChange={(event) =>
                  setRoleForm((current) => ({ ...current, roleDesc: event.target.value }))
                }
                fullWidth
                multiline
                minRows={4}
              />

              <Stack direction="row" spacing={1}>
                {(roleDrawerMode === "edit" ? canEditRole : canCreateRole) && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isRoleFormSubmitting}
                    sx={{ borderRadius: 999 }}
                  >
                    {isRoleFormSubmitting
                      ? "Saving..."
                      : roleDrawerMode === "edit"
                        ? "Update Role"
                        : "Create Role"}
                  </Button>
                )}
                <Button variant="outlined" onClick={closeRoleDrawer} sx={{ borderRadius: 999 }}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default RolePermissionMappingPage;
