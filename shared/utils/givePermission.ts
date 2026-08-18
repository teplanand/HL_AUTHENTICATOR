import {
  getStaticAuthenticatorAccessPayload,
  isAuthenticatorSuperAdmin,
} from "../../src/pages/Authenticator/utils/authenticatorAccess";

export const givePermission = (module: string, right: string): boolean => {
  try {
    if (module.toLowerCase() === "authenticator") {
      if (isAuthenticatorSuperAdmin()) {
        return true;
      }

      const normalizedRight = right.trim().toLowerCase();

      return getStaticAuthenticatorAccessPayload().modules.some(
        (item) => Boolean(item.permissions[normalizedRight]),
      );
    }

    const raw = localStorage.getItem("permissions");
    if (!raw) return false;

    const permissions = JSON.parse(raw);
    const normalizedModule = module.trim().toLowerCase();
    const normalizedRight = right.trim().toLowerCase();

    // Backwards compatibility: some auth responses return a flat array of rights
    // (e.g. ["add", "edit", "view", "delete"]). In that case, treat it as
    // a global permission set (module is ignored).
    if (Array.isArray(permissions)) {
      return permissions.some(
        (permission) => String(permission ?? "").trim().toLowerCase() === normalizedRight,
      );
    }

    // Modern structure: permissions are indexed by module name.
    if (!permissions || typeof permissions !== "object") {
      return false;
    }

    const matchedEntry = Object.entries(permissions).find(
      ([moduleName]) => String(moduleName ?? "").trim().toLowerCase() === normalizedModule,
    );

    if (!matchedEntry || !Array.isArray(matchedEntry[1])) {
      return false;
    }

    return matchedEntry[1].some(
      (permission) => String(permission ?? "").trim().toLowerCase() === normalizedRight,
    );
  } catch {
    return false;
  }
};


