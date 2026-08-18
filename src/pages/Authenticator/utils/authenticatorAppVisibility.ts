import type { AuthenticatorApp } from "../api/authenticator";
import { getStoredAccessibleApps } from "../../../../shared/utils/auth";
import { isAuthenticatorSuperAdmin } from "./authenticatorAccess";

type AppLike = Pick<AuthenticatorApp, "appId" | "appTitle"> &
  Partial<Pick<AuthenticatorApp, "appCode" | "frontUrl">>;

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

export const isAuthenticatorAppRecord = (app?: Partial<AppLike> | null) => {
  if (!app) {
    return false;
  }

  return (
    normalizeValue(app.appCode) === "auth" ||
    normalizeValue(app.appCode) === "authenticator" ||
    normalizeValue(app.appTitle).includes("authenticator") ||
    normalizeValue(app.frontUrl).startsWith("/authenticator/")
  );
};

export const filterAuthenticatorDropdownApps = <T extends AppLike>(apps: T[]) => {
  const isSuperAdmin = isAuthenticatorSuperAdmin();

  if (isSuperAdmin) {
    return apps;
  }

  const accessibleAppIds = new Set(
    getStoredAccessibleApps()
      .map((app) => String(app.appId ?? "").trim())
      .filter(Boolean),
  );

  return apps.filter((app) => {
    const appId = String(app.appId ?? "").trim();

    if (!appId || !accessibleAppIds.has(appId)) {
      return false;
    }

    return !isAuthenticatorAppRecord(app);
  });
};
