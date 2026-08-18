// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getToken } from "../../utils/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  routeType: "public" | "private";
}

export const ProtectedRoute = ({
  children,
  routeType,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = Boolean(getToken());

  // Public route rules
  if (routeType === "public") {
    // If authenticated, redirect to home
    if (isAuthenticated) {
      return <Navigate to="/apps" replace />;
    }
    // If unauthenticated, show public route
    return <>{children}</>;
  }

  // Private route rules
  if (routeType === "private") {
    // If unauthenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/signin" replace state={{ from: location }} />;
    }
    // If authenticated, show protected content
    return <>{children}</>;
  }

  // Fallback (should never reach here)
  return <Navigate to="/signin" replace />;
};
