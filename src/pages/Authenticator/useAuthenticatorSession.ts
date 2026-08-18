import React from "react";
import { useAuthenticatorLoginMutation } from "./api/authenticator";
import {
  extractAuthRoles,
  extractAuthToken,
  extractAuthUserProfile,
  extractRefreshSession,
  getToken,
  setStoredAuthRoles,
  setStoredRefreshSession,
  setStoredUserProfile,
  setToken as setAuthToken,
} from "../../../shared/utils/auth";

export const AUTHENTICATOR_AUTO_LOGIN_CREDENTIALS = {
  username: "",
  password: "",
};

let authenticatorBootstrapPromise: Promise<string> | null = null;

export const useAuthenticatorSession = () => {
  const [sessionReady, setSessionReady] = React.useState(false);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [autoLoginError, setAutoLoginError] = React.useState("");
  const [authenticatorLogin] = useAuthenticatorLoginMutation();

  React.useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        setAutoLoginError("");

        const existingToken = getToken();
        if (existingToken) {
          const existingRoles = extractAuthRoles(null, existingToken);
          const existingProfile = extractAuthUserProfile(null, existingToken);

          setStoredAuthRoles(existingRoles);
          setStoredUserProfile(existingProfile);

          if (existingRoles.length > 0 || existingProfile) {
            if (isMounted) {
              setSessionReady(true);
            }
            return;
          }
        }

        if (!authenticatorBootstrapPromise) {
          authenticatorBootstrapPromise = authenticatorLogin(
            AUTHENTICATOR_AUTO_LOGIN_CREDENTIALS,
          )
            .unwrap()
            .then((loginResponse) => {
              const token =
                extractAuthToken(loginResponse) ||
                loginResponse?.data?.token ||
                getToken();

              if (!token) {
                throw new Error("Authenticator auto-login token not found.");
              }

              setAuthToken(token);
              setStoredAuthRoles(extractAuthRoles(loginResponse, token));
              setStoredRefreshSession(extractRefreshSession(loginResponse, token));
              setStoredUserProfile(extractAuthUserProfile(loginResponse, token));

              return token;
            })
            .finally(() => {
              authenticatorBootstrapPromise = null;
            });
        }

        await authenticatorBootstrapPromise;

        if (isMounted) {
          setSessionReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize authenticator module", error);

        if (isMounted) {
          setAutoLoginError("Authenticator auto-login failed.");
          setSessionReady(false);
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [authenticatorLogin]);

  return {
    sessionReady,
    bootstrapping,
    autoLoginError,
  };
};
