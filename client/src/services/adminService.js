import api from "./api.js";

export const getAllUsers = (role = "") => api.get("/admin/users", { params: role ? { role } : {} });
export const createStaffUser = (payload) => api.post("/admin/users", payload);
export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/status`);
