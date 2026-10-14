import axios from "axios";
import { store } from "../redux/store.js";
import { setCredentials, logout } from "../redux/slices/authSlice.js";

const isPublicAuthRequest = (url = "") =>
  /\/auth\/(?:login|register|refresh|forgot-password|reset-password|verify-email)(?:\/|$)/.test(url);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
});

// Attach the current access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a request fails with 401 (expired access token), try to silently refresh
// it once and retry the original request. If refresh also fails, log the user out.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        store.dispatch(
          setCredentials({
            user: store.getState().auth.user,
            accessToken: data.accessToken,
          })
        );
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
