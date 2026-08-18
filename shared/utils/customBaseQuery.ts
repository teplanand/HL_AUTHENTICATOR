import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import {
  extractAuthRoles,
  extractAuthToken,
  extractAuthUserProfile,
  extractRefreshSession,
  getStoredRefreshSession,
  getToken,
  removeToken,
  setStoredAuthRoles,
  setStoredRefreshSession,
  setStoredUserProfile,
  setToken,
} from "./auth";

const PUBLIC_AUTH_PATHS = [
  "/users/login",
  "/api/auth/login",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/forgot-password",
  "/auth/getAccessToken",
];

type AuthRefreshResponse = {
  response?: boolean;
  success?: boolean;
  message?: string;
  data?: unknown;
};

let refreshPromise: Promise<string | null> | null = null;

const getRequestUrl = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url;

const isPublicAuthRequest = (args: string | FetchArgs) =>
  PUBLIC_AUTH_PATHS.some((path) => getRequestUrl(args).includes(path));

const isSuccessfulAuthResponse = (response: AuthRefreshResponse | undefined) => {
  if (!response || typeof response !== "object") {
    return false;
  }

  if (response.response === false || response.success === false) {
    return false;
  }

  return true;
};

const extractErrorMessage = (error: FetchBaseQueryError | undefined) => {
  const data = error?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const messageCandidates = [
      record.message,
      record.error,
      record.details,
      record.title,
    ];

    for (const candidate of messageCandidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  }

  return "";
};

const hasExpiredTokenMessage = (error: FetchBaseQueryError | undefined) => {
  const message = extractErrorMessage(error).toLowerCase();

  if (!message) {
    return false;
  }

  return [
    "token expired",
    "jwt expired",
    "expired token",
    "invalid token",
    "unauthorized",
    "unauthenticated",
    "authentication failed",
    "authorization denied",
    "forbidden",
    "login again",
    "please login",
  ].some((pattern) => message.includes(pattern));
};

const shouldRedirectToSignIn = (
  args: string | FetchArgs,
  error: FetchBaseQueryError | undefined
) => {
  if (!error || isPublicAuthRequest(args)) {
    return false;
  }

  if (error.status === 401) {
    return true;
  }

  if (error.status === 403 && hasExpiredTokenMessage(error)) {
    return true;
  }

  return hasExpiredTokenMessage(error);
};

const shouldAttemptTokenRefresh = (
  args: string | FetchArgs,
  error: FetchBaseQueryError | undefined
) => {
  if (!error || isPublicAuthRequest(args) || !getStoredRefreshSession()) {
    return false;
  }

  if (error.status === 401) {
    return true;
  }

  if (error.status === 403 && hasExpiredTokenMessage(error)) {
    return true;
  }

  return hasExpiredTokenMessage(error);
};

const redirectToSignIn = () => {
  removeToken();

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/signin") {
    window.location.assign("/signin");
  }
};

type CreateAppBaseQueryOptions = {
  baseUrl: string;
  includeAuthHeader?: boolean;
  refreshBaseUrl?: string;
  redirectOnAuthFailure?: boolean;
  prepareHeaders?: (headers: Headers) => Headers | void;
};

export const createAppBaseQuery = ({
  baseUrl,
  includeAuthHeader = true,
  refreshBaseUrl =
    import.meta.env.VITE_AUTH_REFRESH_BASE_URL ||
    import.meta.env.VITE_AUTHENTICATOR_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    baseUrl,
  redirectOnAuthFailure = true,
  prepareHeaders,
}: CreateAppBaseQueryOptions): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      if (includeAuthHeader) {
        const token = getToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      const preparedHeaders = prepareHeaders?.(headers);
      return preparedHeaders ?? headers;
    },
  });

  const refreshBaseQuery = fetchBaseQuery({
    baseUrl: refreshBaseUrl,
  });

  const refreshAccessToken = async (
    api: Parameters<typeof rawBaseQuery>[1],
    extraOptions: Parameters<typeof rawBaseQuery>[2]
  ) => {
    const refreshSession = getStoredRefreshSession();

    if (!refreshSession) {
      return null;
    }

    const refreshResult = await refreshBaseQuery(
      {
        url: "/auth/getAccessToken",
        method: "POST",
        body: refreshSession,
      },
      api,
      extraOptions
    );

    if (refreshResult.error) {
      return null;
    }

    const refreshResponse = refreshResult.data as AuthRefreshResponse | undefined;
    if (!isSuccessfulAuthResponse(refreshResponse)) {
      return null;
    }

    const refreshedToken = extractAuthToken(refreshResponse);
    if (!refreshedToken) {
      return null;
    }

    setToken(refreshedToken);

    const nextRefreshSession =
      extractRefreshSession(refreshResponse, refreshedToken) || refreshSession;
    setStoredRefreshSession(nextRefreshSession);

    const refreshedRoles = extractAuthRoles(refreshResponse, refreshedToken);
    setStoredAuthRoles(refreshedRoles);

    const refreshedProfile = extractAuthUserProfile(refreshResponse, refreshedToken);
    setStoredUserProfile(refreshedProfile);

    return refreshedToken;
  };

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (includeAuthHeader && shouldAttemptTokenRefresh(args, result.error)) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(api, extraOptions).finally(() => {
          refreshPromise = null;
        });
      }

      const refreshedToken = await refreshPromise;

      if (refreshedToken) {
        return rawBaseQuery(args, api, extraOptions);
      }
    }

    if (redirectOnAuthFailure && shouldRedirectToSignIn(args, result.error)) {
      redirectToSignIn();
    }

    return result;
  };
};

export const baseQueryWithReauth = createAppBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});

export default baseQueryWithReauth;
