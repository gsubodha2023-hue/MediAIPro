import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // more slices get added here as we build features (appointments, etc.)
  },
});
