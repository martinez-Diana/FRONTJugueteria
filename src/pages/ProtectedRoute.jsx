import { Navigate } from "react-router-dom";
import { isTokenExpired, isValidTokenStructure, clearSession } from "../utils/authUtils";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ NUEVA VALIDACIÓN: Verificar estructura del token
  if (!token || !isValidTokenStructure(token)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  // ✅ NUEVA VALIDACIÓN: Verificar si el token expiró
  if (isTokenExpired(token)) {
    clearSession();
    alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
    return <Navigate to="/login" replace />;
  }

  // ✅ Verificar roles permitidos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/home" replace />;
  }

  // ✅ NUEVO: Monitoreo continuo de expiración
  useEffect(() => {
  const checkTokenExpiration = setInterval(() => {
    const currentToken = localStorage.getItem("token");
    
    if (!currentToken || isTokenExpired(currentToken)) {
      clearSession();
      alert("Tu sesión ha expirado por inactividad.");
      window.location.href = "/login";
    }
  }, 10000); // ✅ 10 segundos

  return () => clearInterval(checkTokenExpiration);
}, []);
  return children;
};

export default ProtectedRoute;