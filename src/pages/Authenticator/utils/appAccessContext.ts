import {
  resolveDevelopedAppDefinition,
  resolveDevelopedAppLaunchUrl,
} from "../../../../shared/data/developedApps";
import type { AuthenticatorApp } from "../api/authenticator";
import { getStoredAccessibleApps } from "../../../../shared/utils/auth";

export type ResolvedAccessibleApp = Pick<AuthenticatorApp, "appId" | "appTitle"> &
  Partial<Pick<AuthenticatorApp, "appCode" | "frontUrl" | "appDesc">> & {
  path?: string;
};

const normalizeRoute = (value?: string | number | null) =>
  String(value ?? "").trim().replace(/\/+$/, "");

const getTopLevelSegment = (value?: string | number | null) =>
  normalizeRoute(value)
    .split("/")
    .filter(Boolean)[0]
    ?.toLowerCase() ?? "";

const resolveDevelopedApp = (app: Partial<AuthenticatorApp>) => {
  return resolveDevelopedAppDefinition(app);
};

export const resolveAccessibleAppForPath = (
  pathname: string,
): ResolvedAccessibleApp | null => {
  const currentTopLevelSegment = getTopLevelSegment(pathname);

  if (!currentTopLevelSegment) {
    return null;
  }

  const accessibleApps = getStoredAccessibleApps() as AuthenticatorApp[];

  return (
    accessibleApps
      .map((app) => {
        const matchedTemplate = resolveDevelopedApp(app);
        return {
          ...app,
          path: normalizeRoute(
            resolveDevelopedAppLaunchUrl(app, matchedTemplate?.path),
          ),
        } satisfies ResolvedAccessibleApp;
      })
      .find((app) => getTopLevelSegment(app.path) === currentTopLevelSegment) ?? null
  );
};
