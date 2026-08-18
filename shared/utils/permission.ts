import { getDecodedToken } from "./auth";

export const hasPermission = (module: string, right: string): boolean => {
  const token = getDecodedToken();
  console.log(module);
  if (!token?.permissions) return false;
  console.log(token.permissions);

  return token.permissions[module]?.includes(right) ?? false;
};
