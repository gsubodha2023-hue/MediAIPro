import api from "./api.js";

export const getHealthLogs = () => api.get("/health-logs");
export const createHealthLog = (payload) => api.post("/health-logs", payload);
export const deleteHealthLog = (id) => api.delete(`/health-logs/${id}`);
export const getPrescriptions = () => api.get("/prescriptions");
export const getHospitals = () => api.get("/operations/hospitals");
export const getAnalytics = () => api.get("/operations/analytics");
export const getPayments = () => api.get("/operations/payments");
export const getAuditLogs = () => api.get("/operations/audit");
export const updateProfile = (payload) => api.patch("/auth/me", payload);
export const setTwoFactor = (enabled) => api.patch("/auth/2fa", { enabled });
