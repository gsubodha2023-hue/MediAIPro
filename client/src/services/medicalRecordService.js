import api from "./api.js";

// Uses FormData since this endpoint accepts an optional file upload
export const uploadRecord = (formValues) => {
  const formData = new FormData();
  Object.entries(formValues).forEach(([key, value]) => {
    if (value !== undefined && value !== "") formData.append(key, value);
  });
  return api.post("/records", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyRecords = () => api.get("/records/mine");
export const getPatientRecords = (patientId) => api.get(`/records/patient/${patientId}`);
