// The API base URL includes '/api' (e.g. http://localhost:5000/api), but
// uploaded files are served from the server root (e.g. http://localhost:5000/uploads/...).
// This strips '/api' off so we can build a working link to the file.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "");

export const fileUrl = (relativePath) => `${SERVER_ROOT}${relativePath}`;
