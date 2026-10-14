import api from "./api.js";

export const getDoctors = (specialization = "") =>
  api.get("/doctors", { params: specialization ? { specialization } : {} });

export const getDoctorById = (id) => api.get(`/doctors/${id}`);
