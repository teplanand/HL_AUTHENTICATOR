import React from "react";
import { useLocation } from "react-router";
import { canAccessAuthenticatorRoute } from "../Authenticator/utils/authenticatorAccess";
import { canAccessEvidanceRoute } from "../EvidanceCollection/utils/evidanceAccess";
import { canAccessMonitoringRoute } from "../GearMonitoring/utils/monitoringAccess";
import { canAccessStaticModuleRoute } from "../../../shared/utils/staticModuleAccess";

interface PermissionGuardProps {
    module: string;
    right: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    module,
    right,
    children,
    fallback = null,
}) => {
    const location = useLocation();

    if (module.toLowerCase() === "authenticator") {
        return canAccessAuthenticatorRoute(location.pathname, right)
            ? <>{children}</>
            : <>{fallback}</>;
    }

    if (module.toLowerCase() === "evidance") {
        return canAccessEvidanceRoute(location.pathname, right)
            ? <>{children}</>
            : <>{fallback}</>;
    }

    if (module.toLowerCase() === "monitoring") {
        return canAccessMonitoringRoute(location.pathname, right)
            ? <>{children}</>
            : <>{fallback}</>;
    }

    if (
        module.toLowerCase() === "order-tracking" ||
        module.toLowerCase() === "barcode" ||
        module.toLowerCase() === "sops" ||
        module.toLowerCase() === "warehouse" ||
        module.toLowerCase() === "project-management"
    ) {
        return canAccessStaticModuleRoute(location.pathname, right)
            ? <>{children}</>
            : <>{fallback}</>;
    }

    // Retrieve permissions from localStorage
    const permissionsStr = localStorage.getItem("permissions");
    let permissions: Record<string, string[]> = {};

    try {
        if (permissionsStr) {
            permissions = JSON.parse(permissionsStr);
        }
    } catch (error) {
        console.error("Failed to parse permissions", error);
    }

    // Check if user has the right
    // We check if the module exists in permissions and if the right is in the list
    if (permissions[module] && permissions[module].includes(right)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
