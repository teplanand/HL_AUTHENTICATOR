import type { AuthenticatorManagedModule } from "../../src/pages/Authenticator/api/authenticator";
import { clearStoredDynamicAppAccessPayloads } from "../../src/pages/Authenticator/utils/appPermissionAccess";

// src/utils/tokenUtils.ts
type AuthResponseLike = {
  token?: string | null;
  access_token?: string | null;
  refreshToken?: string | null;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  employee_id?: string | null;
  employeeId?: string | null;
  role?: string | null;
  role_name?: string | null;
  roles?: unknown[] | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  user?: Record<string, unknown> | null;
  profile?: Record<string, unknown> | null;
  data?: {
    token?: string | null;
    access_token?: string | null;
    refreshToken?: string | null;
    userId?: string | null;
    name?: string | null;
    email?: string | null;
    employee_id?: string | null;
    employeeId?: string | null;
    role?: string | null;
    role_name?: string | null;
    roles?: unknown[] | null;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    user?: Record<string, unknown> | null;
    profile?: Record<string, unknown> | null;
  } | null;
} | null | undefined;

export type AuthUserProfile = {
  id?: string | number;
  name?: string;
  email?: string;
  employee_id?: string;
  employeeId?: string;
  role?: string;
  role_name?: string;
  roleId?: string | number;
  role_id?: string | number;
  roles?: string[];
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type AccessibleApp = {
  appId?: string;
  appTitle?: string;
  appDesc?: string;
  appCode?: string;
  modules?: AuthenticatorManagedModule[];
};

export type StoredRefreshSession = {
  userId: string;
  refreshToken: string;
};

type DecodedTokenClaims = {
  exp?: number;
  nbf?: number;
} & Record<string, unknown>;

const AUTH_USER_PROFILE_KEY = "userInfo";
const LEGACY_AUTH_USER_PROFILE_KEY = "authUserProfile";
const ACCESSIBLE_APPS_KEY = "accessibleApps";
const AUTH_USER_ROLES_KEY = "authRoles";
const AUTH_REFRESH_TOKEN_KEY = "authRefreshToken";
const AUTH_USER_ID_KEY = "authUserId";
const LEGACY_PERMISSIONS_KEY = "permissions";
const LOCAL_AUTHENTICATOR_APPS_STORAGE_KEY = "authenticator-managed-apps";
const LOCAL_AUTHENTICATOR_MODULES_STORAGE_KEY = "authenticator-managed-modules";
const LOCAL_AUTHENTICATOR_PERMISSION_MATRIX_STORAGE_KEY =
  "authenticator-permission-matrix";
const LOCAL_AUTHENTICATOR_ROLE_ACCESS_STORAGE_KEY =
  "authenticator-role-permission-access";
const APP_ROLE_ASSIGNMENTS_STORAGE_KEY = "authenticator-app-role-assignments";

const USER_SCOPED_STORAGE_KEYS = [
  "authToken",
  "selectedBranches",
  AUTH_USER_PROFILE_KEY,
  LEGACY_AUTH_USER_PROFILE_KEY,
  ACCESSIBLE_APPS_KEY,
  AUTH_USER_ROLES_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_ID_KEY,
  LEGACY_PERMISSIONS_KEY,
  LOCAL_AUTHENTICATOR_APPS_STORAGE_KEY,
  LOCAL_AUTHENTICATOR_MODULES_STORAGE_KEY,
  LOCAL_AUTHENTICATOR_PERMISSION_MATRIX_STORAGE_KEY,
  LOCAL_AUTHENTICATOR_ROLE_ACCESS_STORAGE_KEY,
  APP_ROLE_ASSIGNMENTS_STORAGE_KEY,
];

const getRecordValue = (source: Record<string, unknown> | null | undefined, key: string) => {
  const value = source?.[key];
  return typeof value === "string" || typeof value === "number" ? value : undefined;
};

const firstFilled = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const toTrimmedString = (value: unknown): string => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const toUniqueStringList = (values: Array<unknown>) =>
  Array.from(new Set(values.map((value) => toTrimmedString(value)).filter(Boolean)));

export const setToken = (token: string): void => {
  // Set in localStorage
  localStorage.setItem("authToken", token);

  // Set in cookie that expires in 7 days
  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `authToken=${token};${expires};path=/;SameSite=Strict`;
};

const getCookieToken = (): string | null =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("authToken="))
    ?.split("=")[1] || null;

const isTokenExpired = (decodedToken: DecodedTokenClaims | null): boolean => {
  if (!decodedToken) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (typeof decodedToken.nbf === "number" && decodedToken.nbf > nowInSeconds) {
    return true;
  }

  if (typeof decodedToken.exp === "number" && decodedToken.exp <= nowInSeconds) {
    return true;
  }

  return false;
};

const getValidToken = (token: string | null): string | null => {
  if (!token) {
    return null;
  }

  const decodedToken = decodeToken<DecodedTokenClaims>(token);

  if (isTokenExpired(decodedToken)) {
    return null;
  }

  return token;
};

export const getToken = (): string | null => {
  const localStorageToken = getValidToken(localStorage.getItem("authToken"));
  if (localStorageToken) {
    return localStorageToken;
  }

  const cookieToken = getValidToken(getCookieToken());
  if (cookieToken) {
    localStorage.setItem("authToken", cookieToken);
    return cookieToken;
  }

  if (localStorage.getItem("authToken") || getCookieToken()) {
    removeToken();
  }

  return null;
};

export const removeToken = (): void => {
  USER_SCOPED_STORAGE_KEYS.forEach((storageKey) => {
    localStorage.removeItem(storageKey);
  });
  clearStoredDynamicAppAccessPayloads();

  // Remove cookie by setting past expiration
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const setStoredAccessibleApps = (apps: AccessibleApp[]): void => {
  localStorage.setItem(ACCESSIBLE_APPS_KEY, JSON.stringify(apps));
};

export const setStoredAuthRoles = (roles: string[] | null | undefined): void => {
  if (!roles?.length) {
    localStorage.removeItem(AUTH_USER_ROLES_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_ROLES_KEY, JSON.stringify(roles));
};

export const setStoredRefreshSession = (
  session: StoredRefreshSession | null | undefined
): void => {
  if (!session?.userId?.trim() || !session.refreshToken?.trim()) {
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_ID_KEY, session.userId.trim());
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken.trim());
};

export const getStoredRefreshSession = (): StoredRefreshSession | null => {
  const userId = localStorage.getItem(AUTH_USER_ID_KEY)?.trim();
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)?.trim();

  if (!userId || !refreshToken) {
    return null;
  }

  return {
    userId,
    refreshToken,
  };
};

export const getStoredAuthRoles = (): string[] => {
  const raw = localStorage.getItem(AUTH_USER_ROLES_KEY);

  if (!raw) {
    return [];
  }

  try {
    return toStringArray(JSON.parse(raw));
  } catch (error) {
    console.error("Error parsing stored auth roles:", error);
    localStorage.removeItem(AUTH_USER_ROLES_KEY);
    return [];
  }
};

export const getStoredAccessibleApps = (): AccessibleApp[] => {
  const raw = localStorage.getItem(ACCESSIBLE_APPS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AccessibleApp[]) : [];
  } catch (error) {
    console.error("Error parsing stored accessible apps:", error);
    localStorage.removeItem(ACCESSIBLE_APPS_KEY);
    return [];
  }
};

export const extractAuthToken = (response: AuthResponseLike): string | null => {
  return (
    response?.token ||
    response?.access_token ||
    response?.data?.token ||
    response?.data?.access_token ||
    null
  );
};

export const extractRefreshSession = (
  response: AuthResponseLike,
  fallbackToken?: string | null
): StoredRefreshSession | null => {
  const token = fallbackToken || extractAuthToken(response);
  const decodedToken = token ? (decodeToken<Record<string, unknown>>(token) ?? {}) : {};
  const responseUser =
    (response?.user as Record<string, unknown> | undefined) ||
    (response?.profile as Record<string, unknown> | undefined) ||
    (response?.data?.user as Record<string, unknown> | undefined) ||
    (response?.data?.profile as Record<string, unknown> | undefined) ||
    {};
  const responseData = (response?.data as Record<string, unknown> | undefined) || {};

  const userId = firstFilled(
    response?.userId,
    response?.data?.userId,
    getRecordValue(responseUser, "userId"),
    getRecordValue(responseUser, "id"),
    getRecordValue(responseData, "userId"),
    getRecordValue(responseData, "id"),
    getRecordValue(decodedToken, "userId"),
    getRecordValue(decodedToken, "id"),
    getRecordValue(decodedToken, "sub"),
    getStoredRefreshSession()?.userId
  );
  const refreshToken = firstFilled(
    response?.refreshToken,
    response?.data?.refreshToken,
    getRecordValue(responseUser, "refreshToken"),
    getRecordValue(responseData, "refreshToken"),
    getStoredRefreshSession()?.refreshToken
  );

  if (!userId || !refreshToken) {
    return null;
  }

  return {
    userId,
    refreshToken,
  };
};

export const extractAuthRoles = (
  response: AuthResponseLike,
  fallbackToken?: string | null
): string[] => {
  const token = fallbackToken || extractAuthToken(response);
  const decodedToken = token ? (decodeToken<Record<string, unknown>>(token) ?? {}) : {};
  const responseUser =
    (response?.user as Record<string, unknown> | undefined) ||
    (response?.profile as Record<string, unknown> | undefined) ||
    (response?.data?.user as Record<string, unknown> | undefined) ||
    (response?.data?.profile as Record<string, unknown> | undefined) ||
    {};

  const roles = [
    ...toStringArray(response?.roles),
    ...toStringArray(response?.data?.roles),
    ...toStringArray(responseUser.roles),
    ...toStringArray(decodedToken.roles),
  ];

  const singleRole = firstFilled(
    getRecordValue(responseUser, "role"),
    getRecordValue(responseUser, "role_name"),
    getRecordValue(decodedToken, "role"),
    getRecordValue(decodedToken, "role_name"),
    response?.role,
    response?.role_name,
    response?.data?.role,
    response?.data?.role_name
  );

  if (singleRole) {
    roles.push(singleRole);
  }

  return Array.from(new Set(roles.map((role) => role.trim()).filter(Boolean)));
};

export const decodeToken = <T = any>(token: string): T | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const setStoredUserProfile = (profile: AuthUserProfile | null | undefined): void => {
  if (!profile) {
    localStorage.removeItem(AUTH_USER_PROFILE_KEY);
    localStorage.removeItem(LEGACY_AUTH_USER_PROFILE_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(LEGACY_AUTH_USER_PROFILE_KEY, JSON.stringify(profile));
};

export const getStoredUserProfile = (): AuthUserProfile | null => {
  const raw =
    localStorage.getItem(AUTH_USER_PROFILE_KEY) ||
    localStorage.getItem(LEGACY_AUTH_USER_PROFILE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUserProfile;
  } catch (error) {
    console.error("Error parsing stored user profile:", error);
    localStorage.removeItem(AUTH_USER_PROFILE_KEY);
    localStorage.removeItem(LEGACY_AUTH_USER_PROFILE_KEY);
    return null;
  }
};

export const extractAuthUserProfile = (
  response: AuthResponseLike,
  fallbackToken?: string | null
): AuthUserProfile | null => {
  const token = fallbackToken || extractAuthToken(response);
  const decodedToken = token ? (decodeToken<Record<string, unknown>>(token) ?? {}) : {};
  const responseUser =
    (response?.user as Record<string, unknown> | undefined) ||
    (response?.profile as Record<string, unknown> | undefined) ||
    (response?.data?.user as Record<string, unknown> | undefined) ||
    (response?.data?.profile as Record<string, unknown> | undefined) ||
    {};

  const name =
    firstFilled(
      getRecordValue(responseUser, "name"),
      getRecordValue(decodedToken, "name"),
      response?.name,
      response?.data?.name,
      firstFilled(
        getRecordValue(responseUser, "first_name"),
        getRecordValue(responseUser, "last_name")
      ),
      firstFilled(
        getRecordValue(decodedToken, "first_name"),
        getRecordValue(decodedToken, "last_name")
      ),
      response?.username,
      response?.data?.username,
      getRecordValue(responseUser, "username"),
      getRecordValue(decodedToken, "username")
    ) || undefined;

  const email =
    firstFilled(
      getRecordValue(responseUser, "email"),
      getRecordValue(decodedToken, "email"),
      response?.email,
      response?.data?.email
    ) || undefined;

  const employeeId =
    firstFilled(
      getRecordValue(responseUser, "employee_id"),
      getRecordValue(responseUser, "employeeId"),
      getRecordValue(decodedToken, "employee_id"),
      getRecordValue(decodedToken, "employeeId"),
      response?.employee_id,
      response?.employeeId,
      response?.data?.employee_id,
      response?.data?.employeeId
    ) || undefined;

  const role =
    firstFilled(
      getRecordValue(responseUser, "role"),
      getRecordValue(responseUser, "role_name"),
      getRecordValue(decodedToken, "role"),
      getRecordValue(decodedToken, "role_name"),
      response?.role,
      response?.role_name,
      response?.data?.role,
      response?.data?.role_name
    ) || undefined;
  const roleId =
    firstFilled(
      getRecordValue(responseUser, "roleId"),
      getRecordValue(responseUser, "role_id"),
      getRecordValue(decodedToken, "roleId"),
      getRecordValue(decodedToken, "role_id"),
      getRecordValue(response?.data as Record<string, unknown> | undefined, "roleId"),
      getRecordValue(response?.data as Record<string, unknown> | undefined, "role_id")
    ) || undefined;
  const roles = extractAuthRoles(response, token);

  const id =
    firstFilled(
      getRecordValue(responseUser, "id"),
      getRecordValue(responseUser, "userId"),
      getRecordValue(decodedToken, "id"),
      getRecordValue(decodedToken, "userId"),
      getRecordValue(decodedToken, "sub"),
      getRecordValue(response?.data as Record<string, unknown> | undefined, "id"),
      getRecordValue(response?.data as Record<string, unknown> | undefined, "userId")
    ) || undefined;

  if (!name && !email && !employeeId && !role && !id) {
    return null;
  }

  return {
    id,
    name,
    email,
    employee_id: employeeId,
    employeeId,
    role,
    role_name: role,
    roleId,
    role_id: roleId,
    roles,
    username:
      firstFilled(
        getRecordValue(responseUser, "username"),
        getRecordValue(decodedToken, "username"),
        response?.username,
        response?.data?.username
      ) || undefined,
    first_name:
      firstFilled(
        getRecordValue(responseUser, "first_name"),
        getRecordValue(decodedToken, "first_name"),
        response?.first_name,
        response?.data?.first_name
      ) || undefined,
    last_name:
      firstFilled(
        getRecordValue(responseUser, "last_name"),
        getRecordValue(decodedToken, "last_name"),
        response?.last_name,
        response?.data?.last_name
      ) || undefined,
  };
};

export const getStoredAuthRoleId = (): string => {
  const trustedProfile = getTrustedAuthUserProfile();
  const decodedToken = getDecodedToken<Record<string, unknown> & {
    user?: Record<string, unknown>;
    data?: Record<string, unknown>;
    profile?: Record<string, unknown>;
  }>();

  return firstFilled(
    trustedProfile?.roleId,
    trustedProfile?.role_id,
    getRecordValue(decodedToken, "roleId"),
    getRecordValue(decodedToken, "role_id"),
    getRecordValue(decodedToken?.user, "roleId"),
    getRecordValue(decodedToken?.user, "role_id"),
    getRecordValue(decodedToken?.data, "roleId"),
    getRecordValue(decodedToken?.data, "role_id"),
    getRecordValue(decodedToken?.profile, "roleId"),
    getRecordValue(decodedToken?.profile, "role_id")
  );
};

export const getDecodedToken = <T = any>(): T | null => {
  const token = getToken();
  if (!token) return null;

  return decodeToken<T>(token);
};

export const getTrustedAuthRoles = (): string[] => {
  const token = getToken();

  if (!token) {
    return [];
  }

  return extractAuthRoles(null, token);
};

export const getTrustedAuthUserProfile = (): AuthUserProfile | null => {
  const token = getToken();

  if (!token) {
    return null;
  }

  return extractAuthUserProfile(null, token);
};

export const getTrustedAuthRoleCandidates = (): string[] => {
  const trustedProfile = getTrustedAuthUserProfile();

  return toUniqueStringList([
    ...getTrustedAuthRoles(),
    trustedProfile?.role,
    trustedProfile?.role_name,
    ...(trustedProfile?.roles ?? []),
  ]);
};


