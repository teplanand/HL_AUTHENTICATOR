const normalizeSegment = (value?: string | number | null) =>
  String(value ?? "")
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

export const buildAuthenticatorModuleCode = ({
  appCode,
  appTitle,
  moduleCode,
  moduleTitle,
}: {
  appCode?: string | number | null;
  appTitle?: string | number | null;
  moduleCode?: string | number | null;
  moduleTitle?: string | number | null;
}) => {
  const appPrefix = normalizeSegment(appCode) || normalizeSegment(appTitle);
  const rawModuleCode = normalizeSegment(moduleCode) || normalizeSegment(moduleTitle);

  if (!appPrefix) {
    return rawModuleCode;
  }

  if (!rawModuleCode) {
    return appPrefix;
  }

  if (rawModuleCode === appPrefix || rawModuleCode.startsWith(`${appPrefix}_`)) {
    return rawModuleCode;
  }

  return `${appPrefix}_${rawModuleCode}`;
};
