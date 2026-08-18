// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Page } from "./components/common/Page";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "../src/pages/AuthPages/SignIn";

// import { getDecodedToken } from "./utils/auth";
import NotFound from "./OtherPage/NotFound";
import AppPortal from "../src/pages/AppPortal";
import ForgotPassword from "../src/pages/AuthPages/ForgetPassword";

import { moduleRoutes } from "./sidebarNavItems";
import OrderTrackingTimelinePage from "../src/pages/OrderTracking/timeline";

export default function App() {
  // const decodedToken = getDecodedToken();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/signin"
          element={
            <ProtectedRoute routeType="public">
              <SignIn />
            </ProtectedRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute routeType="public">
              <ForgotPassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apps"
          element={
            <ProtectedRoute routeType="private">
              <AppPortal />
            </ProtectedRoute>
          }
        />

         <Route
          path="/"
          element={
            <ProtectedRoute routeType="private">
              <AppPortal />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute routeType="private">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/project-management/dashboard"
            element={<Navigate to="/project-management/inquiries" replace />}
          />
          <Route
            path="/order-tracking/timeline"
            element={
              <Page module="order-tracking">
                <OrderTrackingTimelinePage />
              </Page>
            }
          />
          {moduleRoutes.map((moduleConfig) =>
            moduleConfig.children.map((routeConfig) => (
              <Route
                key={routeConfig.path}
                path={`/${moduleConfig.module}${routeConfig.path}`}
                element={
                  <Page module={moduleConfig.module}>
                    {routeConfig.element}
                  </Page>
                }
              />
            )),
          )}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}


