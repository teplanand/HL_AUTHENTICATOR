import { createSlice } from "@reduxjs/toolkit";
import {t} from "i18next";

export const components = createSlice({
  name: "components",
  initialState: {
    modal: [],
    confirmation: {
      visible: false,
      message: t("Are you sure want to delete?"),
      title: t("Delete Confirmation"),
      action: undefined,
      positiveButtonProps: {},
      negativeButtonProps: {},
      isDoubleConfirm: false,
    },
    alert: {
      visible: false,
      message: "Hello",
      title: "Ok",
      action: undefined,
    },
    dialog: [],
    loader: {
      visible: false,
    },
  },
  reducers: {
    setModal: (state, action) => {
      state.modal = action.payload;
      return state;
    },
    removeModal: (state, action) => {
      state.modal = state.modal.filter((value: any) => {
        return value.modalkey !== action.payload;
      });
      return state;
    },
    setDialog: (state, action) => {
      state.dialog = action.payload;
      return state;
    },
    removeDialog: (state, action) => {
      state.dialog = state.dialog.filter((value: any) => {
        return value.dialogKey !== action.payload;
      });
      return state;
    },
    setConfirmation: (state, action) => {
      state.confirmation = { ...state.confirmation, ...action.payload };
      return state;
    },
    setAlert: (state, action) => {
      state.alert = { ...state.alert, ...action.payload };
      return state;
    },
    showLoader: (state) => {
      state.loader = { visible: true };
      return state;
    },
    hideLoader: (state) => {
      state.loader = { visible: false };
      return state;
    },
  },
});

export const {
  setModal,
  removeModal,
  setDialog,
  removeDialog,
  setConfirmation,
  setAlert,
  showLoader,
  hideLoader,
} = components.actions;

export default components.reducer;
