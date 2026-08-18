import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { roleApi } from "../../src/pages/Authenticator/api/roles";

import authSlice from "./authSlice";
import themeConfigSlice from "./themeConfigSlice";
import { userApi } from "../../src/pages/Authenticator/api/user";
import { loginApi } from "../../src/pages/AuthPages/api/login";
import { evidanceCollectionApi } from "../../src/pages/EvidanceCollection/api/evidancecollection";
import { orderTrackingApi } from "../../src/pages/OrderTracking/api/ordertracking";
import { warehouseApi } from "../../src/pages/Warehouse/api/warehouse";
import { barcodeApi } from "../../src/pages/Barcode/api/barcode";
import { authenticatorApi } from "../../src/pages/Authenticator/api/authenticator";
import { components } from "./components";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    themeConfig: themeConfigSlice,
    components: components.reducer,

    [roleApi.reducerPath]: roleApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [evidanceCollectionApi.reducerPath]: evidanceCollectionApi.reducer,
    [orderTrackingApi.reducerPath]: orderTrackingApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [barcodeApi.reducerPath]: barcodeApi.reducer,
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
    })
      .concat(loginApi.middleware)
      .concat(roleApi.middleware)
      .concat(userApi.middleware)
      .concat(evidanceCollectionApi.middleware)
      .concat(orderTrackingApi.middleware)
      .concat(warehouseApi.middleware)
      .concat(barcodeApi.middleware)
      .concat(authenticatorApi.middleware)
    });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

export const resetAllState = () => {
  store.dispatch(roleApi.util.resetApiState());
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(loginApi.util.resetApiState());
  store.dispatch(evidanceCollectionApi.util.resetApiState());
  store.dispatch(orderTrackingApi.util.resetApiState());
  store.dispatch(warehouseApi.util.resetApiState());
  store.dispatch(barcodeApi.util.resetApiState());
  store.dispatch(authenticatorApi.util.resetApiState());
};


