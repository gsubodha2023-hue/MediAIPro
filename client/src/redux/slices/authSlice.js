import { createSlice } from "@reduxjs/toolkit";

// This slice holds the logged-in user + access token in memory (Redux state).
// The access token is short-lived and kept in JS memory only (not localStorage)
// so it's not exposed to XSS attacks. The refresh token lives in an httpOnly
// cookie set by the backend, invisible to JS entirely.
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: true, // true until we've checked for an existing session on app load
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    finishInitialLoad: (state) => {
      state.loading = false;
    },
  },
});

export const { setCredentials, logout, finishInitialLoad } = authSlice.actions;
export default authSlice.reducer;
