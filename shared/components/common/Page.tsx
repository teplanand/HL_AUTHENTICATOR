import React from "react";
import { PermissionGuard } from "../../../src/pages/AuthPages/PermissionGuard";
import AccessDenied from "../../OtherPage/AccessDenied";

interface PageProps {
  module?: string;
  children: React.ReactNode;
}

/**
 * A wrapper component that checks for "view" permission on a module.
 * If module is not provided, it simply renders children.
 * If module is provided, it checks if the current user has "view" permission for that module.
 * If not, it renders the AccessDenied page.
 */
export const Page: React.FC<PageProps> = ({ module, children }) => {
  if (!module) {
    return <>{children}</>;
  }

  return (
    <PermissionGuard module={module} right="view" fallback={<AccessDenied />}>
      {children}
    </PermissionGuard>
  );
};


