import axios from "axios";

const API = axios.create({
  baseURL: "https://back-jugueteria.vercel.app/",
  //baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// 🔒 Interceptor para agregar token automáticamente
// ========================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// ✅ Interceptor para manejar tokens revocados/expirados
// ========================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data || {};
      
      // Si el token fue revocado o expiró
      if (errorData.revoked || errorData.expired) {
        // Limpiar sesión local
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirigir al login
        window.location.href = "/login";
        
        // Mostrar mensaje
        alert(errorData.error || "Tu sesión ha finalizado. Por favor, inicia sesión nuevamente.");
      }
    }
    return Promise.reject(error);
  }
);

export default API;