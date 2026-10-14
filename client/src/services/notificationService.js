import api from "./api.js";

export const getNotifications = () => api.get("/notifications");
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch("/notifications/read-all");
