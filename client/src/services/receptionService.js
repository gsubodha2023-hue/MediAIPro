import api from "./api.js";

export const registerPatient = (payload) => api.post("/reception/patients", payload);
export const getAllAppointments = (params = {}) => api.get("/reception/appointments", { params });
