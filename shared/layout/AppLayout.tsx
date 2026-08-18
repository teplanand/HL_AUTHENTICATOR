import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AppProvider } from "@toolpad/core";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { isPageVisibleInNavigation, moduleRoutes, navItems } from "../sidebarNavItems";
import {
    useLazyGetAuthenticatorDashboardAppsQuery,
    useLazyGetAuthenticatorAppPermissionByRoleQuery,
} from "../../src/pages/Authenticator/api/authenticator";

import UserDropdown from "../components/header/UserDropdown";
import ThemeToggleButton from "../components/header/ThemeToggleButton";
import AppsIcon from "@mui/icons-material/Apps";
import {
    Box,
    IconButton,
    useTheme,
    Tooltip,
} from "@mui/material";
import { Navigation } from "@toolpad/core/AppProvider";
import Loader from "../components/Loader/loader";
import { useSidebarSubmenuScroll } from "./useSidebarSubmenuScroll";
import logo from "../assets/logo1.png";
import NotificationDropdown from "../components/header/NotificationDropdown";
import {
    getToken,
    setStoredAccessibleApps,
} from "../utils/auth";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { givePermission } from "../utils/givePermission";
import { canAccessAuthenticatorRoute } from "../../src/pages/Authenticator/utils/authenticatorAccess";
import { canAccessEvidanceRoute } from "../../src/pages/EvidanceCollection/utils/evidanceAccess";
import { canAccessMonitoringRoute } from "../../src/pages/GearMonitoring/utils/monitoringAccess";
import { canAccessStaticModuleRoute } from "../utils/staticModuleAccess";
import { applyDynamicAppPermissions } from "../../src/pages/Authenticator/utils/appPermissionAccess";
import { resolveAccessibleAppForPath } from "../../src/pages/Authenticator/utils/appAccessContext";

function CustomToolbar() {
    const navigate = useNavigate();
    // ... (rest of logic)

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            <Tooltip title="All Apps">
                <IconButton onClick={() => navigate("/apps")} color="inherit">
                    <AppsIcon />
                </IconButton>
            </Tooltip>
            <NotificationDropdown />
            <ThemeToggleButton />
            <UserDropdown />
        </Box>
    );
}

const AppLayout: React.FC = () => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    useSidebarSubmenuScroll();
    const token = getToken();
    const [currentApp, setCurrentApp] = React.useState(() =>
        resolveAccessibleAppForPath(location.pathname),
    );
    const shouldBootstrapPermissions = Boolean(
        token &&
        currentApp?.appId &&
        location.pathname !== "/apps",
    );
    const permissionRequestKey = shouldBootstrapPermissions
        ? `${currentApp?.appId}::${location.pathname}`
        : `skip::${location.pathname}`;
    const [completedPermissionRequestKey, setCompletedPermissionRequestKey] =
        React.useState(permissionRequestKey);
    const [fetchDashboardApps] = useLazyGetAuthenticatorDashboardAppsQuery();
    const [fetchAppPermissions] = useLazyGetAuthenticatorAppPermissionByRoleQuery();

    const router = React.useMemo(() => {
        return {
            pathname: location.pathname,
            searchParams: new URLSearchParams(location.search),
            navigate: (path: string | URL) => navigate(path),
        };
    }, [location, navigate]);

    React.useEffect(() => {
        const resolvedFromStorage = resolveAccessibleAppForPath(location.pathname);

        if (resolvedFromStorage || !token || location.pathname === "/apps") {
            setCurrentApp(resolvedFromStorage);
            return;
        }

        let isMounted = true;

        const loadAccessibleApps = async () => {
            try {
                const response = await fetchDashboardApps().unwrap();
                setStoredAccessibleApps(response?.data ?? []);

                if (isMounted) {
                    setCurrentApp(resolveAccessibleAppForPath(location.pathname));
                }
            } catch (error) {
                console.error("Dashboard apps refresh failed during permission bootstrap:", error);

                if (isMounted) {
                    setCurrentApp(null);
                }
            }
        };

        void loadAccessibleApps();

        return () => {
            isMounted = false;
        };
    }, [fetchDashboardApps, location.pathname, token]);

    React.useEffect(() => {
        if (!shouldBootstrapPermissions || !currentApp?.appId) {
            setCompletedPermissionRequestKey(permissionRequestKey);
            return;
        }

        let isMounted = true;

        const bootstrapPermissions = async () => {
            try {
                const response = await fetchAppPermissions(currentApp.appId).unwrap();

                applyDynamicAppPermissions({
                    app: {
                        ...currentApp,
                        path: currentApp.path,
                    },
                    raw: response,
                });
            } catch (error) {
                console.error("Role-based permission bootstrap failed:", error);
            } finally {
                if (isMounted) {
                    setCompletedPermissionRequestKey(permissionRequestKey);
                }
            }
        };

        void bootstrapPermissions();

        return () => {
            isMounted = false;
        };
    }, [
        currentApp,
        fetchAppPermissions,
        permissionRequestKey,
        shouldBootstrapPermissions,
    ]);

    const isPermissionBootstrapPending =
        shouldBootstrapPermissions &&
        completedPermissionRequestKey !== permissionRequestKey;

    // Compute navigation structure based on permissions
    const navigation = React.useMemo(() => {
        // Get current module from URL path (e.g., /advance-voucher/dashboard -> "advance-voucher")
        const currentModule = location.pathname.split('/')[1];
        const toNavigationSegment = (path: string) => path.replace(/^\/+/, "");

        const currentModuleRoutes = moduleRoutes.find(
            (moduleConfig) => moduleConfig.module === currentModule,
        );

        if (currentModuleRoutes) {
            return currentModuleRoutes.children
                .filter((route) => {
                    if (!isPageVisibleInNavigation(route)) {
                        return false;
                    }

                    const routePath = `/${currentModuleRoutes.module}${route.path}`;

                    if (currentModuleRoutes.module === "authenticator") {
                        return canAccessAuthenticatorRoute(routePath, "view");
                    }

                    if (currentModuleRoutes.module === "evidance") {
                        return canAccessEvidanceRoute(routePath, "view");
                    }

                    if (currentModuleRoutes.module === "monitoring") {
                        return canAccessMonitoringRoute(routePath, "view");
                    }

                    if (
                        currentModuleRoutes.module === "order-tracking" ||
                        currentModuleRoutes.module === "barcode" ||
                        currentModuleRoutes.module === "sops" ||
                        currentModuleRoutes.module === "Warehouse" ||
                        currentModuleRoutes.module === "project-management"
                    ) {
                        return canAccessStaticModuleRoute(routePath, "view");
                    }

                    return givePermission(currentModuleRoutes.module, "view");
                })
                .map((route) => ({
                    kind: "page" as const,
                    title: route.name,
                    segment: toNavigationSegment(`/${currentModuleRoutes.module}${route.path}`),
                    icon: route.icon,
                }));
        }

        const filterNavItems = (items: any[]): any[] => {
            return items
                .filter((item) => {
                    if (item.module) {
                        if (!givePermission(item.module, "view")) {
                            return false;
                        }
                        // Filter by current module in URL
                        if (currentModule && item.module !== currentModule) {
                            return false;
                        }
                    }
                    return true;
                })
                .map((item) => {
                    const newItem = { ...item };
                    if (newItem.subItems) {
                        newItem.subItems = filterNavItems(newItem.subItems);
                    }
                    // If a parent has no visible children and no path, hide it (optional UI polish)
                    // But for now, let's just stick to the requested permission logic
                    return newItem;
                });
        };

        const filteredItems = filterNavItems(navItems);

        // Transform to Toolpad Navigation format
        const transformToNavigation = (items: any[]): Navigation => {
            return items.map((item) => ({
                kind: "page",
                title: item.name,
                segment: item.path ? toNavigationSegment(item.path) : undefined,
                icon: item.icon,
                children: item.subItems
                    ? transformToNavigation(item.subItems)
                    : undefined,
            }));
        };

        return transformToNavigation(filteredItems);
    }, [location.pathname]);

    if (token && isPermissionBootstrapPending) {
        return <Loader />;
    }

    
    return (
        <AppProvider
            navigation={navigation}
            router={router}
            theme={theme}
            branding={{
                logo: <img src={logo} alt="eelcon Logo" className="w-full max-w-xs h-auto" />,
                title: "",
            }}
        >
              
            <DashboardLayout
                slots={{ toolbarActions: CustomToolbar }}
                sidebarExpandedWidth={260}
                defaultSidebarCollapsed={true}
            >
                
                <div className="p-4 w-full md:p-3">
                    <Breadcrumbs />
                    <Outlet />
                </div>
            </DashboardLayout> 

        </AppProvider>
    );
};

export default AppLayout;


