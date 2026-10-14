import api from "./api.js";

export const sendChatMessage = (message) => api.post("/ai/chat", { message });
export const getChatHistory = () => api.get("/ai/chat/history");
export const checkSymptoms = (payload) => api.post("/ai/symptom-checker", payload);
