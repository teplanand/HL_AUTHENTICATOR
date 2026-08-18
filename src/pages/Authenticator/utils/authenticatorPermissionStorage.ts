export type AuthenticatorAccessModule = {
  moduleCode: string;
  moduleTitle: string;
  route: string;
  permissions: Record<string, boolean>;
};

export type AuthenticatorPermissionMatrixPayload = {
  appId: string;
  appTitle: string;
  modules: AuthenticatorAccessModule[];
};

export type AuthenticatorAccessPayload = AuthenticatorPermissionMatrixPayload & {
  roleId: string;
  roleName: string;
};

export const LOCAL_AUTHENTICATOR_PERMISSION_MATRIX_STORAGE_KEY =
  "authenticator-permission-matrix";
export const LOCAL_AUTHENTICATOR_ROLE_ACCESS_STORAGE_KEY =
  "authenticator-role-permission-access";

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();
const normalizeRoute = (value?: string | number | null) =>
  normalizeValue(value).replace(/\/+$/, "");

const readStorageArray = <T,>(storageKey: string) => {
  if (typeof window === "undefined") {
    return [] as T[];
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return [] as T[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(`Failed to parse local storage key: ${storageKey}`, error);
    window.localStorage.removeItem(storageKey);
    return [] as T[];
  }
};

const writeStorageArray = <T,>(storageKey: string, value: T[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
};

const upsertRecords = <T,>(
  records: T[],
  nextRecord: T,
  getKey: (record: T) => string,
) => {
  const nextKey = getKey(nextRecord);
  const nextRecords = records.filter((record) => getKey(record) !== nextKey);

  return [nextRecord, ...nextRecords];
};

const getPermissionMatrixRecordKey = (record: AuthenticatorPermissionMatrixPayload) =>
  normalizeValue(record.appId);

const getRoleAccessRecordKey = (record: AuthenticatorAccessPayload) =>
  `${normalizeValue(record.appId)}::${normalizeValue(record.roleId || record.roleName)}`;

export const getStoredAuthenticatorPermissionMatrices = () =>
  readStorageArray<AuthenticatorPermissionMatrixPayload>(
    LOCAL_AUTHENTICATOR_PERMISSION_MATRIX_STORAGE_KEY,
  );

export const getStoredAuthenticatorPermissionMatrix = (appId: string) =>
  getStoredAuthenticatorPermissionMatrices().find(
    (record) => normalizeValue(record.appId) === normalizeValue(appId),
  ) ?? null;

export const getStoredAuthenticatorPermissionModuleByRoute = (pathname: string) => {
  const normalizedPathname = normalizeRoute(pathname);

  if (!normalizedPathname) {
    return null;
  }

  for (const record of getStoredAuthenticatorPermissionMatrices()) {
    const matchedModule =
      record.modules.find(
        (module) => normalizeRoute(module.route) === normalizedPathname,
      ) ?? null;

    if (matchedModule) {
      return matchedModule;
    }
  }

  return null;
};

export const saveStoredAuthenticatorPermissionMatrix = (
  payload: AuthenticatorPermissionMatrixPayload,
) => {
  const nextRecords = upsertRecords(
    getStoredAuthenticatorPermissionMatrices(),
    payload,
    getPermissionMatrixRecordKey,
  );

  writeStorageArray(LOCAL_AUTHENTICATOR_PERMISSION_MATRIX_STORAGE_KEY, nextRecords);
  return nextRecords;
};

export const getStoredAuthenticatorRoleAccessPayloads = () =>
  readStorageArray<AuthenticatorAccessPayload>(
    LOCAL_AUTHENTICATOR_ROLE_ACCESS_STORAGE_KEY,
  );

export const getStoredAuthenticatorRoleAccessPayload = ({
  appId,
  roleId,
  roleName,
}: {
  appId?: string;
  roleId?: string;
  roleName?: string;
}) =>
  getStoredAuthenticatorRoleAccessPayloads().find(
    (record) =>
      (!appId || normalizeValue(record.appId) === normalizeValue(appId)) &&
      ((!roleId && !roleName) ||
        normalizeValue(record.roleId) === normalizeValue(roleId) ||
        normalizeValue(record.roleName) === normalizeValue(roleName)),
  ) ?? null;

export const saveStoredAuthenticatorRoleAccessPayload = (
  payload: AuthenticatorAccessPayload,
) => {
  const nextRecords = upsertRecords(
    getStoredAuthenticatorRoleAccessPayloads(),
    payload,
    getRoleAccessRecordKey,
  );

  writeStorageArray(LOCAL_AUTHENTICATOR_ROLE_ACCESS_STORAGE_KEY, nextRecords);
  return nextRecords;
};
