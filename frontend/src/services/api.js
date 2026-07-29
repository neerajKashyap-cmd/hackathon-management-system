import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token to requests
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("hms_user");
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Error parsing saved user token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
