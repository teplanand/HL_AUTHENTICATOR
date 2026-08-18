type AppScopeLike = {
  appCode?: string | number | null;
  appTitle?: string | number | null;
  frontUrl?: string | number | null;
};

type ModuleScopeLike = AppScopeLike & {
  moduleCode?: string | number | null;
  moduleTitle?: string | number | null;
  route?: string | number | null;
};

const USERS_AND_ROLES_TITLE = "Users & Roles";

const normalizeValue = (value?: string | number | null) => String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number | null) =>
  normalizeValue(value).replace(/[^a-z0-9]+/g, "");

export const isAuthenticatorAppScope = (app?: AppScopeLike | null) => {
  if (!app) {
    return false;
  }

  const candidates = [
    normalizeValue(app.appCode),
    normalizeValue(app.appTitle),
    normalizeValue(app.frontUrl),
    normalizeLooseValue(app.appCode),
    normalizeLooseValue(app.appTitle),
    normalizeLooseValue(app.frontUrl),
  ].filter(Boolean);

  return candidates.some(
    (candidate) =>
      candidate === "authenticator" ||
      candidate.includes("authenticator") ||
      candidate.endsWith("/authenticator") ||
      candidate.includes("/authenticator/"),
  );
};

export const getAuthenticatorScopedModuleTitle = ({
  appCode,
  appTitle,
  frontUrl,
  moduleCode,
  moduleTitle,
  route,
}: ModuleScopeLike) => {
  if (!isAuthenticatorAppScope({ appCode, appTitle, frontUrl })) {
    return String(moduleTitle ?? moduleCode ?? "Module").trim();
  }

  const normalizedModuleCode = normalizeValue(moduleCode);
  const normalizedModuleTitle = normalizeValue(moduleTitle);
  const normalizedRoute = normalizeValue(route);

  if (
    normalizedModuleCode === "dashboard" ||
    normalizedModuleTitle === "dashboard" ||
    normalizedRoute === "/authenticator/dashboard" ||
    normalizedRoute.endsWith("/dashboard")
  ) {
    return USERS_AND_ROLES_TITLE;
  }

  return String(moduleTitle ?? moduleCode ?? "Module").trim();
};

export { USERS_AND_ROLES_TITLE };
