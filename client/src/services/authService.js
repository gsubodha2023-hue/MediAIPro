import api from "./api.js";

export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const logoutUser = () => api.post("/auth/logout");
export const fetchCurrentUser = () => api.get("/auth/me");
export const refreshAccessToken = () => api.post("/auth/refresh");
