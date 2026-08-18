import type { AuthenticatorApp } from "../api/authenticator";
import { filterAuthenticatorDropdownApps } from "./authenticatorAppVisibility";

const LOCAL_AUTHENTICATOR_APPS_STORAGE_KEY = "authenticator-managed-apps";

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

export const readLocalManagedAuthenticatorApps = (): AuthenticatorApp[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(LOCAL_AUTHENTICATOR_APPS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as AuthenticatorApp[]) : [];
  } catch (error) {
    console.error("Failed to parse authenticator-managed apps from local storage", error);
    window.localStorage.removeItem(LOCAL_AUTHENTICATOR_APPS_STORAGE_KEY);
    return [];
  }
};

export const mergeAuthenticatorApps = (apps: AuthenticatorApp[]) => {
  const seen = new Set<string>();

  return apps.filter((app) => {
    const identityKey = normalizeValue(app.appCode) || String(app.appId ?? "").trim();

    if (!identityKey || seen.has(identityKey)) {
      return false;
    }

    seen.add(identityKey);
    return true;
  });
};

export const buildAuthenticatorDropdownApps = (
  remoteApps: AuthenticatorApp[],
  localApps: AuthenticatorApp[] = readLocalManagedAuthenticatorApps(),
  options?: {
    restrictToAccessibleApps?: boolean;
  },
) => {
  const mergedApps = mergeAuthenticatorApps([...remoteApps, ...localApps]).filter((app) =>
    Boolean(String(app.appId ?? "").trim()),
  );
  const visibleApps = options?.restrictToAccessibleApps
    ? filterAuthenticatorDropdownApps(mergedApps)
    : mergedApps;

  return visibleApps.sort((first, second) => (first.appTitle || "").localeCompare(second.appTitle || ""));
};
