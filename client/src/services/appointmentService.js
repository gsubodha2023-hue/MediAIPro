import api from "./api.js";

// Patient
export const bookAppointment = (payload) => api.post("/appointments", payload);
export const getMyAppointments = () => api.get("/appointments/mine");
export const cancelAppointment = (id, reason) =>
  api.patch(`/appointments/${id}/cancel`, { reason });

// Doctor
export const getDoctorAppointments = (status = "") =>
  api.get("/appointments/doctor", { params: status ? { status } : {} });
export const updateAppointmentStatus = (id, status, notes) =>
  api.patch(`/appointments/${id}/status`, { status, notes });
