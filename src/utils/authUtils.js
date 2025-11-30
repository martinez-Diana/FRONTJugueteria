// src/utils/authUtils.js

/**
 * Decodifica un token JWT sin verificar la firma
 * (La verificación de firma se hace en el backend)
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Verifica si el token ha expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si expiró, false si aún es válido
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // exp viene en segundos, Date.now() en milisegundos
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Obtiene el tiempo restante del token en segundos
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;

  const currentTime = Date.now() / 1000;
  const remaining = decoded.exp - currentTime;
  return remaining > 0 ? remaining : 0;
};

/**
 * Limpia la sesión del usuario (logout)
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Si tienes más datos en localStorage relacionados con la sesión, límpialos aquí
  // Por ejemplo: localStorage.removeItem('preferences');
};

/**
 * Valida la estructura básica del token JWT
 */
export const isValidTokenStructure = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  // Un JWT válido tiene 3 partes: header.payload.signature
  return parts.length === 3;
};