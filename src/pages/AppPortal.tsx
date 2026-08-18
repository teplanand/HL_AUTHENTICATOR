import React, { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  CircularProgress,
  Container,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import TimelineIcon from "@mui/icons-material/Timeline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FolderSpecialRoundedIcon from "@mui/icons-material/FolderSpecialRounded";
import UserDropdown from "../../shared/components/header/UserDropdown";
import ThemeToggleButton from "../../shared/components/header/ThemeToggleButton";
import NotificationDropdown from "../../shared/components/header/NotificationDropdown";
import logo from "../../shared/assets/logo1.png";
import AdvaceVoucher from "../../shared/assets/advace_voucher.png";
import {
  type AuthenticatorApp,
  useGetAuthenticatorDashboardAppsQuery,
  useLazyGetAuthenticatorAppPermissionByRoleQuery,
} from "./Authenticator/api/authenticator";
import {
  getStoredAccessibleApps,
  getToken,
  setStoredAccessibleApps,
} from "../../shared/utils/auth";
import { applyDynamicAppPermissions } from "./Authenticator/utils/appPermissionAccess";
import { resolveDevelopedAppLaunchUrl } from "../../shared/data/developedApps";

type AppCatalogEntry = {
  matchers: string[];
  defaultPath?: string;
  color: string;
  icon?: React.ElementType;
  image?: string;
};

type PortalApp = AuthenticatorApp & {
  launchUrl?: string;
  color: string;
  icon?: React.ElementType;
  image?: string;
  launchable: boolean;
};

const APP_CATALOG: AppCatalogEntry[] = [
  {
    matchers: ["advance voucher", "advance-voucher"],
    defaultPath: "/advance-voucher/dashboard",
    color: "#F37440",
    image: AdvaceVoucher,
  },
  {
    matchers: ["purchase order", "purchase-order"],
    defaultPath: "/purchase-order/dashboard",
    color: "#3B82F6",
    icon: ShoppingCartIcon,
  },
  {
    matchers: ["supplier portal", "supplier-portal"],
    defaultPath: "/supplier-portal/dashboard",
    color: "#10B981",
    icon: StoreIcon,
  },
  {
    matchers: ["warehouse"],
    defaultPath: "/Warehouse/dashboard",
    color: "#8B5CF6",
    icon: Inventory2Icon,
  },
  {
    matchers: ["hr management", "hr-management"],
    defaultPath: "/hr-management/dashboard",
    color: "#EC4899",
    icon: PeopleIcon,
  },
  {
    matchers: ["order tracking", "order-tracking"],
    defaultPath: "/order-tracking/dashboard",
    color: "#0F766E",
    icon: TimelineIcon,
  },
  {
    matchers: ["pbl barcode", "barcode"],
    defaultPath: "/barcode/dashboard",
    color: "#1D4ED8",
    icon: QrCode2Icon,
  },
  {
    matchers: ["evidance collection", "evidence collection", "evidance"],
    defaultPath: "/evidance/client-dashboard",
    color: "#7C3AED",
    icon: FactCheckIcon,
  },
  {
    matchers: ["gearbox monitoring", "gear monitoring", "monitoring"],
    defaultPath: "/monitoring/dashboard",
    color: "#B45309",
    icon: PrecisionManufacturingIcon,
  },
  {
    matchers: ["authenticator"],
    defaultPath: "/authenticator/dashboard",
    color: "#C2410C",
    icon: SecurityRoundedIcon,
  },
  {
    matchers: ["sops", "sop"],
    defaultPath: "/sops/dashboard",
    color: "#0F766E",
    icon: DescriptionRoundedIcon,
  },
  // {
  //   matchers: ["project management", "project-management"],
  //   path: "/project-management/dashboard",
  //   color: "#2563EB",
  //   icon: FolderSpecialRoundedIcon,
  // },
];

const normalizeValue = (value?: string) => String(value ?? "").trim().toLowerCase();

const appendTokenToLaunchUrl = (launchUrl: string, token: string) => {
  const trimmedUrl = String(launchUrl ?? "").trim();
  const trimmedToken = String(token ?? "").trim();

  if (!trimmedUrl || !trimmedToken) {
    return trimmedUrl;
  }

  try {
    const url = new URL(trimmedUrl, window.location.origin);
    url.searchParams.set("token", trimmedToken);

    if (/^https?:\/\//i.test(trimmedUrl)) {
      return url.toString();
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const [urlWithoutHash, hashFragment = ""] = trimmedUrl.split("#", 2);
    const querySeparator = urlWithoutHash.includes("?") ? "&" : "?";
    const nextUrl = `${urlWithoutHash}${querySeparator}token=${encodeURIComponent(trimmedToken)}`;
    return hashFragment ? `${nextUrl}#${hashFragment}` : nextUrl;
  }
};

const resolveAppCatalog = (app: AuthenticatorApp) => {
  const candidates = [
    normalizeValue(app.appTitle),
    normalizeValue(app.appCode),
    normalizeValue(app.appDesc),
  ].filter(Boolean);

  return (
    APP_CATALOG.find((entry) =>
      entry.matchers.some((matcher) => {
        const normalizedMatcher = normalizeValue(matcher);
        return candidates.some(
          (candidate) =>
            candidate === normalizedMatcher || candidate.includes(normalizedMatcher),
        );
      }),
    ) ?? null
  );
};

const AppPortal = () => {
  const theme = useTheme();
  const [storedApps, setStoredApps] = useState<AuthenticatorApp[]>(() =>
    getStoredAccessibleApps() as AuthenticatorApp[],
  );
  const [loadingAppId, setLoadingAppId] = useState("");

  const { data: appsResponse, isLoading, isFetching, isError } =
    useGetAuthenticatorDashboardAppsQuery();
  const [fetchAppPermissions] = useLazyGetAuthenticatorAppPermissionByRoleQuery();

  useEffect(() => {
    if (!appsResponse?.data) {
      return;
    }

    setStoredAccessibleApps(appsResponse.data);
    setStoredApps(appsResponse.data);
  }, [appsResponse]);

  const accessibleApps = appsResponse?.data ?? storedApps;

  const portalApps = useMemo<PortalApp[]>(() => {
    return accessibleApps.map((app) => {
      const catalog = resolveAppCatalog(app);
      const launchUrl = resolveDevelopedAppLaunchUrl(app, catalog?.defaultPath);

      return {
        ...app,
        color: catalog?.color || "#475569",
        icon: catalog?.icon || AppsRoundedIcon,
        image: catalog?.image,
        launchUrl,
        launchable: Boolean(launchUrl),
      };
    });
  }, [accessibleApps]);

  const sortedApps = useMemo(() => {
    return [...portalApps].sort((first, second) =>
      (first.appTitle || "").localeCompare(second.appTitle || ""),
    );
  }, [portalApps]);

  const handleAppClick = async (app: PortalApp) => {
    if (!app.launchable || !app.launchUrl || !app.appId || loadingAppId) {
      return;
    }

    const launchWindow = window.open("", "_blank");

    if (!launchWindow) {
      toast.error("Browser e new tab open karva allow nathi karyu. Please popup allow karo.");
      return;
    }

    try {
      launchWindow.opener = null;
      launchWindow.document.title = app.appTitle || "Opening application...";
      launchWindow.document.body.innerHTML =
        "<div style=\"font-family: Arial, sans-serif; padding: 24px; color: #0f172a;\">Opening application...</div>";
    } catch {
      // Ignore cross-origin/document access issues for the placeholder tab.
    }

    setLoadingAppId(app.appId);

    try {
      const permissionResponse = await fetchAppPermissions(app.appId).unwrap();
      const appliedPermissions = applyDynamicAppPermissions({
        app,
        raw: permissionResponse,
      });

      if (!appliedPermissions) {
        launchWindow.close();
        toast.error("Selected app mate permissions load thai nathi.");
        return;
      }

      const token = getToken();

      if (!token) {
        launchWindow.close();
        toast.error("Session token malyo nathi. Please login again.");
        return;
      }

      launchWindow.location.assign(appendTokenToLaunchUrl(app.launchUrl, token));
    } catch (error) {
      launchWindow.close();
      console.error("App permission fetch failed:", error);
      toast.error("App permissions load kari shakya nathi. Please retry.");
    } finally {
      setLoadingAppId("");
    }
  };

  const isInitialLoading = (isLoading || isFetching) && accessibleApps.length === 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease",
      }}
    >
      <Box
        sx={{
          height: 64,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <img src={logo} alt="Logo" className="h-8" />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <NotificationDropdown />
          <ThemeToggleButton />
          <UserDropdown />
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ flex: 1, py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
        {isInitialLoading ? (
          <Box
            sx={{
              minHeight: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography color="text.secondary">Loading applications...</Typography>
          </Box>
        ) : portalApps.length === 0 ? (
          <Box
            sx={{
              borderRadius: 4,
              border: "1px dashed",
              borderColor: "divider",
              p: 5,
              textAlign: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              No applications assigned
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {isError
                ? "Application access could not be loaded right now."
                : "No app access was returned for this user."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, sm: 1.75, md: 2 },
            }}
          >
            {sortedApps.map((app) => {
              const IconComponent = app.icon || AppsRoundedIcon;
              const tooltipTitle = app.launchable
                ? app.appTitle
                : `${app.appTitle} (route not configured yet)`;

              return (
                <Tooltip key={app.appId} title={tooltipTitle} arrow>
                  <Box
                    component={motion.button}
                    type="button"
                    whileHover={app.launchable ? { y: -4, scale: 1.02 } : undefined}
                    whileTap={app.launchable ? { scale: 0.97 } : undefined}
                    onClick={() => void handleAppClick(app)}
                    sx={{
                      appearance: "none",
                      border: "none",
                      p: 0,
                      m: 0,
                      bgcolor: "transparent",
                      textAlign: "center",
                      cursor:
                        app.launchable && !loadingAppId
                          ? "pointer"
                          : app.launchable
                            ? "progress"
                            : "default",
                      opacity: app.launchable ? 1 : 0.56,
                      minWidth: 0,
                    }}
                    disabled={Boolean(loadingAppId)}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        minHeight: { xs: 132, sm: 152, md: 164 },
                        mx: "auto",
                        mb: 0.75,
                        px: { xs: 1.25, sm: 1.5 },
                        py: { xs: 1.5, sm: 1.75, md: 2 },
                        borderRadius: { xs: 2.5, sm: 3 },
                        bgcolor: alpha(theme.palette.background.paper, 0.96),
                        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 10px 24px rgba(15, 23, 42, 0.22)"
                            : "0 10px 24px rgba(15, 23, 42, 0.06)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        color: app.color,
                        position: "relative",
                      }}
                    >
                      {loadingAppId === app.appId && (
                        <CircularProgress
                          size={22}
                          sx={{
                            position: "absolute",
                            color: app.color,
                          }}
                        />
                      )}
                      {app.image ? (
                        <Box
                          component="img"
                          src={app.image}
                          alt={app.appTitle}
                          sx={{
                            width: { xs: 42, sm: 48, md: 52 },
                            height: { xs: 42, sm: 48, md: 52 },
                            objectFit: "contain",
                            opacity: loadingAppId === app.appId ? 0.24 : 1,
                          }}
                        />
                      ) : (
                        <IconComponent
                          sx={{
                            fontSize: { xs: 42, sm: 48, md: 52 },
                            opacity: loadingAppId === app.appId ? 0.24 : 1,
                          }}
                        />
                      )}

                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.92rem", sm: "1rem" },
                          
                          fontWeight: 700,
                          color: "text.primary",
                          textAlign: "center",
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          minHeight: "2em",
                        }}
                      >
                        {app.appTitle}
                      </Typography>

                      
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AppPortal;
