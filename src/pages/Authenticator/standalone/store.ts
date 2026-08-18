import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import authSlice from "../../../../shared/redux/authSlice";
import themeConfigSlice from "../../../../shared/redux/themeConfigSlice";
import { components } from "../../../../shared/redux/components";
import { authenticatorApi } from "../api/authenticator";

export const authenticatorStandaloneStore = configureStore({
  reducer: {
    auth: authSlice,
    themeConfig: themeConfigSlice,
    components: components.reducer,
    [authenticatorApi.reducerPath]: authenticatorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          components.actions.setModal.type,
          components.actions.setDialog.type,
          components.actions.setConfirmation.type,
          components.actions.setAlert.type,
        ],
        ignoredPaths: [
          "components.modal",
          "components.dialog",
          "components.confirmation.action",
          "components.confirmation.positiveButtonProps",
          "components.confirmation.negativeButtonProps",
          "components.alert.action",
        ],
      },
    }).concat(authenticatorApi.middleware),
});

setupListeners(authenticatorStandaloneStore.dispatch);
