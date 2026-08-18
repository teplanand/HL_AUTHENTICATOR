import type { AuthenticatorRole } from "../api/authenticator";
import { getTrustedAuthRoleCandidates } from "../../../../shared/utils/auth";

export type StoredAppRoleAssignment = {
  appId: string;
  roleId: string;
  roleName: string;
};

const APP_ROLE_ASSIGNMENTS_STORAGE_KEY = "authenticator-app-role-assignments";

const normalizeValue = (value?: string | number | null) =>
  String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number | null) =>
  normalizeValue(value).replace(/[^a-z0-9]+/g, "");

const readStoredAssignments = (): StoredAppRoleAssignment[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(APP_ROLE_ASSIGNMENTS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as StoredAppRoleAssignment[]) : [];
  } catch (error) {
    console.error("Failed to parse stored app role assignments.", error);
    window.localStorage.removeItem(APP_ROLE_ASSIGNMENTS_STORAGE_KEY);
    return [];
  }
};

const writeStoredAssignments = (assignments: StoredAppRoleAssignment[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_ROLE_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
};

export const getStoredAppRoleAssignment = (appId?: string) => {
  const normalizedAppId = normalizeValue(appId);

  if (!normalizedAppId) {
    return null;
  }

  return (
    readStoredAssignments().find(
      (assignment) => normalizeValue(assignment.appId) === normalizedAppId,
    ) ?? null
  );
};

export const saveStoredAppRoleAssignment = (assignment: StoredAppRoleAssignment) => {
  const currentAssignments = readStoredAssignments().filter(
    (item) => normalizeValue(item.appId) !== normalizeValue(assignment.appId),
  );
  const nextAssignments = [assignment, ...currentAssignments];

  writeStoredAssignments(nextAssignments);
  return nextAssignments;
};

const getCurrentUserRoleCandidates = () => {
  const roleCandidates = getTrustedAuthRoleCandidates()
    .map((role) => normalizeValue(role))
    .filter(Boolean);

  return Array.from(new Set(roleCandidates));
};

export const resolveMatchingAppRole = (
  appId: string,
  availableRoles: AuthenticatorRole[],
) => {
  const cachedAssignment = getStoredAppRoleAssignment(appId);

  if (cachedAssignment) {
    const matchedCachedRole =
      availableRoles.find(
        (role) => normalizeValue(role.roleId) === normalizeValue(cachedAssignment.roleId),
      ) ?? null;

    if (matchedCachedRole) {
      return {
        roleId: String(matchedCachedRole.roleId),
        roleName: String(matchedCachedRole.roleName ?? cachedAssignment.roleName),
      };
    }
  }

  const roleCandidates = getCurrentUserRoleCandidates();
  const matchedRole =
    availableRoles.find((role) => {
      const normalizedRoleName = normalizeValue(role.roleName);
      const normalizedLooseRoleName = normalizeLooseValue(role.roleName);

      return roleCandidates.some(
        (candidate) =>
          candidate === normalizedRoleName ||
          normalizeLooseValue(candidate) === normalizedLooseRoleName ||
          candidate.includes(normalizedRoleName) ||
          normalizedRoleName.includes(candidate) ||
          normalizeLooseValue(candidate).includes(normalizedLooseRoleName) ||
          normalizedLooseRoleName.includes(normalizeLooseValue(candidate)),
      );
    }) ??
    (availableRoles.length === 1 ? availableRoles[0] : null);

  if (!matchedRole) {
    return null;
  }

  const resolvedAssignment = {
    appId,
    roleId: String(matchedRole.roleId),
    roleName: String(matchedRole.roleName ?? ""),
  };

  saveStoredAppRoleAssignment(resolvedAssignment);
  return resolvedAssignment;
};
