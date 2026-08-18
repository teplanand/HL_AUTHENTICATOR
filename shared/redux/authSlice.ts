import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: any;
  id: any; // Ensure this type matches how you use `id`
}

const initialState: AuthState = {
  token: null,
  id: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setId(state, action: PayloadAction<string | null>) {
      state.id = action.payload;
    },
    getToken(state) {
      return state.token;
    },
    getId(state) {
      return state.id;
    },
    clearToken: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, setId, getToken, getId, clearToken } =
  authSlice.actions;

export default authSlice.reducer;