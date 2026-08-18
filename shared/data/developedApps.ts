export type DevelopedAppDefinition = {
  appId: string;
  appTitle: string;
  appDesc: string;
  appCode: string;
  path: string;
  color: string;
  iconKey: string;
  imageKey?: string;
  remoteUrlEnvKey?: string;
};

export const DEVELOPED_APPS: DevelopedAppDefinition[] = [
  {
    appId: "advance-voucher-app",
    appTitle: "Advance Voucher",
    appDesc: "Advance voucher workflow dashboard.",
    appCode: "advance-voucher",
    path: "/advance-voucher/dashboard",
    color: "#F37440",
    iconKey: "apps",
    imageKey: "advanceVoucher",
    remoteUrlEnvKey: "VITE_ADVANCE_VOUCHER_APP_URL",
  },
  {
    appId: "purchase-order-app",
    appTitle: "Purchase Order",
    appDesc: "Purchase order management dashboard.",
    appCode: "purchase-order",
    path: "/purchase-order/dashboard",
    color: "#3B82F6",
    iconKey: "shoppingCart",
    remoteUrlEnvKey: "VITE_PURCHASE_ORDER_APP_URL",
  },
  {
    appId: "supplier-portal-app",
    appTitle: "Supplier Portal",
    appDesc: "Supplier-facing dashboard and actions.",
    appCode: "supplier-portal",
    path: "/supplier-portal/dashboard",
    color: "#10B981",
    iconKey: "store",
    remoteUrlEnvKey: "VITE_SUPPLIER_PORTAL_APP_URL",
  },
  {
    appId: "warehouse-app",
    appTitle: "Warehouse",
    appDesc: "Warehouse operations dashboard.",
    appCode: "warehouse",
    path: "/Warehouse/dashboard",
    color: "#8B5CF6",
    iconKey: "inventory",
    remoteUrlEnvKey: "VITE_WAREHOUSE_APP_URL",
  },
  {
    appId: "hr-management-app",
    appTitle: "HR Management",
    appDesc: "HR operations dashboard.",
    appCode: "hr-management",
    path: "/hr-management/dashboard",
    color: "#EC4899",
    iconKey: "people",
    remoteUrlEnvKey: "VITE_HR_MANAGEMENT_APP_URL",
  },
  {
    appId: "order-tracking-app",
    appTitle: "Order Tracking",
    appDesc: "Order tracking overview and planning.",
    appCode: "order-tracking",
    path: "/order-tracking/dashboard",
    color: "#0F766E",
    iconKey: "timeline",
    remoteUrlEnvKey: "VITE_ORDER_TRACKING_APP_URL",
  },
  {
    appId: "barcode-app",
    appTitle: "PBL Barcode",
    appDesc: "Barcode generation and inspection.",
    appCode: "barcode",
    path: "/barcode/dashboard",
    color: "#1D4ED8",
    iconKey: "qrCode",
    remoteUrlEnvKey: "VITE_BARCODE_APP_URL",
  },
  {
    appId: "evidance-collection-app",
    appTitle: "Evidance Collection",
    appDesc: "Evidence collection client dashboard.",
    appCode: "evidance",
    path: "/evidance/client-dashboard",
    color: "#7C3AED",
    iconKey: "factCheck",
    remoteUrlEnvKey: "VITE_EVIDANCE_APP_URL",
  },
  {
    appId: "gear-monitoring-app",
    appTitle: "Gear Monitoring",
    appDesc: "Gearbox monitoring dashboard.",
    appCode: "monitoring",
    path: "/monitoring/dashboard",
    color: "#B45309",
    iconKey: "precision",
    remoteUrlEnvKey: "VITE_MONITORING_APP_URL",
  },
  {
    appId: "authenticator-app",
    appTitle: "Authenticator",
    appDesc: "Access management and security console.",
    appCode: "AUTH",
    path: "/authenticator/dashboard",
    color: "#C2410C",
    iconKey: "security",
    remoteUrlEnvKey: "VITE_AUTHENTICATOR_APP_URL",
  },
  {
    appId: "sops-app",
    appTitle: "SOPs",
    appDesc: "Standard operating procedure dashboard.",
    appCode: "sops",
    path: "/sops/dashboard",
    color: "#0F766E",
    iconKey: "description",
    remoteUrlEnvKey: "VITE_SOPS_APP_URL",
  },
  // {
  //   appId: "project-management-app",
  //   appTitle: "Project Management",
  //   appDesc: "Inquiry-to-invoice project delivery workspace.",
  //   appCode: "project-management",
  //   path: "/project-management/dashboard",
  //   color: "#2563EB",
  //   iconKey: "apps",
  // },
];

type DevelopedAppLookup = Partial<
  Pick<DevelopedAppDefinition, "appId" | "appTitle" | "appCode" | "appDesc" | "path">
> & {
  frontUrl?: string;
};

const normalizeValue = (value?: string | number | null) =>
  String(value ?? "").trim().toLowerCase();

const normalizeLooseValue = (value?: string | number | null) =>
  normalizeValue(value)
    .replace(/[^a-z0-9]+/g, "")
    .replace(/evidence/g, "evidance")
    .replace(/gearbox/g, "gear");

const buildAliases = (values: Array<string | number | null | undefined>) => {
  const aliases = new Set<string>();

  values.forEach((value) => {
    const normalizedValue = normalizeValue(value);
    const looseValue = normalizeLooseValue(value);

    if (normalizedValue) {
      aliases.add(normalizedValue);
    }

    if (looseValue) {
      aliases.add(looseValue);
    }
  });

  return aliases;
};

export const isAbsoluteUrl = (value?: string | null) =>
  /^https?:\/\//i.test(String(value ?? "").trim());

const normalizeUrl = (value?: string | null) => String(value ?? "").trim().replace(/\/+$/, "");

const getEnvValue = (key?: string) => {
  if (!key) {
    return "";
  }

  const envValue = (import.meta.env as Record<string, string | undefined>)[key];
  return normalizeUrl(envValue);
};

export const resolveDevelopedAppDefinition = (
  app: DevelopedAppLookup,
): DevelopedAppDefinition | null => {
  const candidates = buildAliases([
    app.appId,
    app.appTitle,
    app.appCode,
    app.appDesc,
    app.frontUrl,
    app.path,
  ]);

  return (
    DEVELOPED_APPS.find((template) => {
      const templateAliases = buildAliases([
        template.appId,
        template.appTitle,
        template.appCode,
        template.appDesc,
        template.path,
      ]);

      return Array.from(candidates).some(
        (candidate) =>
          templateAliases.has(candidate) ||
          Array.from(templateAliases).some(
            (alias) =>
              candidate === alias ||
              candidate.includes(alias) ||
              alias.includes(candidate),
          ),
      );
    }) ?? null
  );
};

export const resolveDevelopedAppLaunchUrl = (
  app: DevelopedAppLookup,
  fallbackPath?: string,
) => {
  const matchedTemplate = resolveDevelopedAppDefinition(app);
  const configuredRemoteUrl = getEnvValue(matchedTemplate?.remoteUrlEnvKey);
  const frontUrl = normalizeUrl(app.frontUrl);
  const path = normalizeUrl(app.path);
  const defaultPath = normalizeUrl(fallbackPath);

  if (configuredRemoteUrl) {
    return configuredRemoteUrl;
  }

  if (frontUrl) {
    return frontUrl;
  }

  if (path) {
    return path;
  }

  return normalizeUrl(matchedTemplate?.path) || defaultPath;
};
