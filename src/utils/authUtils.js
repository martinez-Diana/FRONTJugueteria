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
/**
 * ========================================
 * PROTECCIÓN CONTRA XSS
 * ========================================
 */

/**
 * Sanitiza un string eliminando caracteres peligrosos para XSS
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizado
 */
export const sanitizeInput = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  // Eliminar etiquetas HTML y scripts
  let sanitized = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Eliminar <script>
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Eliminar <iframe>
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Eliminar <object>
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Eliminar <embed>
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Eliminar eventos onclick, onload, etc.
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/<[^>]*>/g, ''); // Eliminar todas las etiquetas HTML restantes
  
  // Convertir caracteres especiales a entidades HTML
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

/**
 * Sanitiza un objeto completo (útil para formularios)
 * @param {object} data - Objeto con datos del formulario
 * @returns {object} - Objeto sanitizado
 */
export const sanitizeFormData = (data) => {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized = {};
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Si es string, sanitizar
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      }
      // Si es número o booleano, mantener igual
      else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
      // Si es objeto, sanitizar recursivamente
      else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeFormData(value);
      }
      // Cualquier otro tipo, mantener igual
      else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Valida que un email sea seguro (sin caracteres peligrosos)
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Patrón de email seguro (sin scripts ni caracteres raros)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(email);
};

/**
 * Valida que un username sea seguro (solo alfanumérico, guiones y guiones bajos)
 * @param {string} username - Username a validar
 * @returns {boolean} - true si es válido
 */
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  
  // Solo letras, números, guiones y guiones bajos, entre 3 y 20 caracteres
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  
  return usernameRegex.test(username);
};

/**
 * Valida que un nombre sea seguro (solo letras y espacios)
 * @param {string} name - Nombre a validar
 * @returns {boolean} - true si es válido
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Solo letras (incluyendo acentos) y espacios, entre 2 y 50 caracteres
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
  
  return nameRegex.test(name.trim());
};