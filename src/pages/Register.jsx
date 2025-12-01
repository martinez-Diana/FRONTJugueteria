import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { sanitizeInput, sanitizeFormData, isValidEmail, isValidName } from "../utils/authUtils";

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

  body {
    margin: 0;
    font-family: "Poppins", sans-serif;
    background: #fef5fb;
  }

  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }

  .register-box {
    display: flex;
    background: #fff;
    width: 1300px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.08);
    overflow: hidden;
  }

  .register-left {
    background: #ec4899;
    color: white;
    flex: 0.9;
    padding: 60px 40px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 280px;
  }

  .register-left h1 {
    font-size: 24px;
    margin: 0;
    line-height: 1.4;
  }

  .register-left h2 {
    font-size: 28px;
    font-weight: 700;
    color: #fcd34d;
    margin-top: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  }

  .register-left p {
    font-size: 14px;
    margin-top: 20px;
  }

  .line {
    width: 50px;
    height: 3px;
    background-color: #67e8f9;
    margin: 15px auto;
    border-radius: 2px;
  }

  .circles {
    margin-top: 30px;
  }

  .circle {
    display: inline-block;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin: 0 6px;
  }

  .cyan {
    background-color: #67e8f9;
    box-shadow: 0 3px 8px rgba(103, 232, 249, 0.3);
  }

  .yellow {
    background-color: #fcd34d;
    box-shadow: 0 3px 8px rgba(252, 211, 77, 0.3);
  }

  .orange {
    background-color: #f472b6;
    box-shadow: 0 3px 8px rgba(244, 114, 182, 0.3);
  }

  .register-right {
    flex: 1.1;
    padding: 40px;
    background: #fff;
    overflow-y: auto;
    max-height: 95vh;
  }

  .register-right h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 5px;
    color: #ec4899;
  }

  .register-right p {
    color: #666;
    font-size: 14px;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 15px;
  }

  .form-row.three-cols {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-row.full {
    grid-template-columns: 1fr;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-input-wrapper input {
    flex: 1;
    padding-right: 40px;
  }

  .toggle-password {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-password:hover {
    color: #ec4899;
  }

  label {
    font-weight: 500;
    margin-bottom: 4px;
    color: #333;
    font-size: 13px;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="date"],
  select {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    font-family: "Poppins", sans-serif;
  }

  input:focus,
  select:focus {
    border-color: #c084fc;
    box-shadow: 0 0 6px rgba(192, 132, 252, 0.25);
  }

  input.input-error {
    border-color: #ef4444;
  }

  input.input-success {
    border-color: #10b981;
  }

  select {
    background-color: #fff;
    cursor: pointer;
  }

  .validation-message {
    font-size: 11px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .validation-message.error {
    color: #ef4444;
  }

  .validation-message.success {
    color: #10b981;
  }

  .validation-message.warning {
    color: #f59e0b;
  }

  .password-requirements {
    font-size: 11px;
    margin-top: 6px;
    padding: 8px;
    background: #f9fafb;
    border-radius: 6px;
    border-left: 3px solid #e5e7eb;
  }

  .password-requirements.active {
    border-left-color: #c084fc;
  }

  .requirement {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 3px 0;
  }

  .requirement.met {
    color: #10b981;
  }

  .requirement.unmet {
    color: #9ca3af;
  }

  .checkbox-group {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
    align-items: center;
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 220px;
  }

  .checkbox-container input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: #ec4899;
  }

  .checkbox-container label {
    margin: 0;
    font-size: 12px;
    cursor: pointer;
    line-height: 1.3;
  }

  .register-btn {
    background: #ec4899;
    color: #fff;
    font-weight: 600;
    padding: 11px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.3s;
    font-size: 15px;
    margin-top: 8px;
    box-shadow: 0 3px 12px rgba(236, 72, 153, 0.25);
  }

  .register-btn:hover {
    background: #db2777;
    box-shadow: 0 5px 16px rgba(219, 39, 119, 0.3);
    transform: translateY(-2px);
  }

  .register-btn:active {
    transform: scale(0.98);
  }

  .register-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    color: #dc2626;
    font-size: 13px;
    margin-bottom: 12px;
    padding: 8px;
    background-color: #fef2f2;
    border-radius: 6px;
    border-left: 4px solid #ef4444;
  }

  .success-message {
    color: #059669;
    font-size: 13px;
    margin-bottom: 12px;
    padding: 8px;
    background-color: #ecfdf5;
    border-radius: 6px;
    border-left: 4px solid #10b981;
  }

  .success-message a {
    color: #c084fc;
    text-decoration: none;
    font-weight: 600;
  }

  .success-message a:hover {
    text-decoration: underline;
  }

  @media (max-width: 1024px) {
    .register-box {
      flex-direction: column;
      width: 90%;
    }

    .register-left {
      padding: 40px 30px;
    }

    .register-right {
      padding: 25px;
      max-height: none;
    }

    .form-row,
    .form-row.three-cols {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .form-group {
      margin-bottom: 10px;
    }

    .checkbox-group {
      flex-direction: column;
      gap: 10px;
    }

    .checkbox-container {
      min-width: auto;
    }
  }
    .modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 750px;
  max-height: 90vh;
  border-radius: 16px;
  padding: 25px 30px;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
  font-family: Arial, sans-serif;
}

/* Encabezado */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #f2f2f2;
  margin-bottom: 15px;
  padding-bottom: 10px;
}

.modal-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff4d6d;
  margin: 0;
}

/* Botón cerrar */
.modal-close {
  background: #ff4d6d;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s ease;
}

.modal-close:hover {
  background: #e63950;
}

/* Títulos internos */
.modal-content h4 {
  margin-top: 18px;
  margin-bottom: 6px;
  color: #333;
  font-size: 1.05rem;
  font-weight: 700;
}

/* Texto */
.modal-content p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 8px;
}

/* Scroll bonito */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #ff4d6d;
  border-radius: 6px;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Link de términos y privacidad */
.privacy-link {
  color: #ff4d6d;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.privacy-link:hover {
  color: #e63950;
}
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    motherLastName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    username: "",
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nameValidation, setNameValidation] = useState({ valid: null, message: "" });
  const [lastNameValidation, setLastNameValidation] = useState({ valid: null, message: "" });
  const [motherLastNameValidation, setMotherLastNameValidation] = useState({ valid: null, message: "" });
  const [emailValidation, setEmailValidation] = useState({ valid: null, message: "" });
  const [birthDateValidation, setBirthDateValidation] = useState({ valid: null, message: "" });
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  // 🛡️ SANITIZAR EN TIEMPO REAL (solo para campos de texto)
  let sanitizedValue = value;
  if (type !== "checkbox" && typeof value === "string") {
    sanitizedValue = sanitizeInput(value);
  }
  
  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : sanitizedValue,
  });

  // Validaciones en tiempo real con el valor sanitizado
  if (name === "firstName") {
    validateName(sanitizedValue, setNameValidation, "nombre");
  }
  if (name === "lastName") {
    validateName(sanitizedValue, setLastNameValidation, "apellido paterno");
  }
  if (name === "motherLastName") {
    validateName(sanitizedValue, setMotherLastNameValidation, "apellido materno");
  }
  if (name === "email") {
    validateEmail(sanitizedValue);
  }
  if (name === "birthDate") {
    validateBirthDate(sanitizedValue);
  }
};

  const validateName = (name, setValidation, fieldName) => {
    if (!name) {
      setValidation({ valid: null, message: "" });
      return;
    }

    // Solo permite letras y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    if (!nameRegex.test(name)) {
      setValidation({ valid: false, message: `El ${fieldName} solo puede contener letras` });
      return;
    }

    if (name.trim().length < 2) {
      setValidation({ valid: false, message: `El ${fieldName} debe tener al menos 2 caracteres` });
      return;
    }

    if (name.trim().length > 50) {
      setValidation({ valid: false, message: `El ${fieldName} no puede exceder 50 caracteres` });
      return;
    }

    setValidation({ valid: true, message: `✓ ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} válido` });
  };

  const validateEmail = (email) => {
  if (!email) {
    setEmailValidation({ valid: null, message: "" });
    return;
  }

  // 🛡️ Usar la validación segura de authUtils
  if (!isValidEmail(email)) {
    setEmailValidation({ valid: false, message: "Formato de correo inválido o contiene caracteres no permitidos" });
    return;
  }

  setEmailValidation({ valid: true, message: "✓ Correo válido" });
};

  const validateBirthDate = (date) => {
    if (!date) {
      setBirthDateValidation({ valid: null, message: "" });
      return;
    }

    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

    if (birthDate > today) {
      setBirthDateValidation({ valid: false, message: "La fecha no puede ser futura" });
      return;
    }

    if (actualAge < 13) {
      setBirthDateValidation({ valid: false, message: "Debes tener al menos 13 años" });
      return;
    }

    if (actualAge > 120) {
      setBirthDateValidation({ valid: false, message: "Fecha no válida" });
      return;
    }

    setBirthDateValidation({ valid: true, message: `✓ Edad válida (${actualAge} años)` });
  };

  const getPasswordRequirements = () => {
    const password = formData.password;
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`-]/.test(password),
    };
  };

  const isPasswordValid = () => {
    const req = getPasswordRequirements();
    return req.length && req.uppercase && req.number && req.symbol;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      firstName,
      lastName,
      motherLastName,
      email,
      phone,
      birthDate,
      password,
      confirmPassword,
      username,
      termsAccepted,
      privacyAccepted,
    } = formData;

    if (!nameValidation.valid) {
      setError("El nombre no es válido");
      return;
    }

    if (!lastNameValidation.valid) {
      setError("El apellido paterno no es válido");
      return;
    }

    if (!motherLastNameValidation.valid) {
      setError("El apellido materno no es válido");
      return;
    }

    if (!username.trim()) {
      setError("El nombre de usuario es requerido");
      return;
    }

    if (!emailValidation.valid) {
      setError("Corrige el correo electrónico");
      return;
    }

    if (!birthDateValidation.valid) {
      setError("La fecha de nacimiento no es válida");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isPasswordValid()) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setError("Debes aceptar los términos y condiciones y la política de privacidad");
      return;
    }

    try {
  // 🛡️ Sanitizar todos los datos antes de enviar
  const sanitizedData = {
    first_name: sanitizeInput(firstName),
    last_name: sanitizeInput(lastName),
    mother_lastname: sanitizeInput(motherLastName),
    email: sanitizeInput(email),
    phone: sanitizeInput(phone),
    birthdate: birthDate, // Las fechas no necesitan sanitización
    username: sanitizeInput(username),
    password: password, // La contraseña se hashea en el backend
    role_id: 3
  };

  // Validaciones adicionales
  if (!isValidEmail(sanitizedData.email)) {
    setError("El formato del correo electrónico no es válido");
    return;
  }

  if (!isValidName(sanitizedData.first_name)) {
    setError("El nombre solo puede contener letras");
    return;
  }

  if (!isValidName(sanitizedData.last_name)) {
    setError("El apellido paterno solo puede contener letras");
    return;
  }

  if (!isValidName(sanitizedData.mother_lastname)) {
    setError("El apellido materno solo puede contener letras");
    return;
  }

  const response = await API.post("/api/register", sanitizedData);

      const data = response.data;
      setSuccess(data.message);
      
      // Redirigir al login después de 1.5 segundos
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || "Error en la conexión con el servidor");
    }
  };

  const passwordReq = getPasswordRequirements();

  return (
    <>
      <style>{styles}</style>
      <div className="register-container">
        <div className="register-box">
          <div className="register-left">
            <h1>
              JUGUETERÍA Y <br /> NOVEDADES
            </h1>
            <h2>MARTÍNEZ</h2>
            <div className="line"></div>
            <p>Sistema de Gestión Integral</p>
            <div className="circles">
              <span className="circle cyan"></span>
              <span className="circle yellow"></span>
              <span className="circle orange"></span>
            </div>
          </div>

          <div className="register-right">
            <h2>Crear Cuenta</h2>
            <p>Completa tus datos para registrarte</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">❌ {error}</div>}
              {success && (
                <div className="success-message">
                  ✅ {success} Redirigiendo al inicio de sesión...
                </div>
              )}

              <div className="form-row three-cols">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className={
                      nameValidation.valid === true ? "input-success" : 
                      nameValidation.valid === false ? "input-error" : ""
                    }
                    required
                  />
                  {nameValidation.message && (
                    <div className={`validation-message ${nameValidation.valid ? "success" : "error"}`}>
                      {nameValidation.message}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Apellido Paterno</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Apellido paterno"
                    className={
                      lastNameValidation.valid === true ? "input-success" : 
                      lastNameValidation.valid === false ? "input-error" : ""
                    }
                    required
                  />
                  {lastNameValidation.message && (
                    <div className={`validation-message ${lastNameValidation.valid ? "success" : "error"}`}>
                      {lastNameValidation.message}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="motherLastName">Apellido Materno</label>
                  <input
                    type="text"
                    id="motherLastName"
                    name="motherLastName"
                    value={formData.motherLastName}
                    onChange={handleChange}
                    placeholder="Apellido materno"
                    className={
                      motherLastNameValidation.valid === true ? "input-success" : 
                      motherLastNameValidation.valid === false ? "input-error" : ""
                    }
                    required
                  />
                  {motherLastNameValidation.message && (
                    <div className={`validation-message ${motherLastNameValidation.valid ? "success" : "error"}`}>
                      {motherLastNameValidation.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className={
                      emailValidation.valid === true ? "input-success" : 
                      emailValidation.valid === false ? "input-error" : ""
                    }
                    required
                  />
                  {emailValidation.message && (
                    <div className={`validation-message ${emailValidation.valid ? "success" : "error"}`}>
                      {emailValidation.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (123) 456-7890"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="birthDate">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={
                      birthDateValidation.valid === true ? "input-success" : 
                      birthDateValidation.valid === false ? "input-error" : ""
                    }
                    required
                  />
                  {birthDateValidation.message && (
                    <div className={`validation-message ${birthDateValidation.valid ? "success" : "error"}`}>
                      {birthDateValidation.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="username">Nombre de Usuario</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Tu usuario"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocus(true)}
                      placeholder="Min. 8 caracteres, mayúscula, número y símbolo"
                      className={isPasswordValid() ? "input-success" : ""}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {(passwordFocus || formData.password) && (
                    <div className={`password-requirements ${formData.password ? "active" : ""}`}>
                      <div className={`requirement ${passwordReq.length ? "met" : "unmet"}`}>
                        {passwordReq.length ? "✓" : "○"} Mínimo 8 caracteres
                      </div>
                      <div className={`requirement ${passwordReq.uppercase ? "met" : "unmet"}`}>
                        {passwordReq.uppercase ? "✓" : "○"} Una letra mayúscula
                      </div>
                      <div className={`requirement ${passwordReq.number ? "met" : "unmet"}`}>
                        {passwordReq.number ? "✓" : "○"} Un número
                      </div>
                      <div className={`requirement ${passwordReq.symbol ? "met" : "unmet"}`}>
                        {passwordReq.symbol ? "✓" : "○"} Un símbolo (!@#$%^&*)
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmar contraseña"
                      className={
                        formData.confirmPassword && formData.password === formData.confirmPassword 
                          ? "input-success" 
                          : formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "input-error"
                          : ""
                      }
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="validation-message error">
                      Las contraseñas no coinciden
                    </div>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="validation-message success">
                      ✓ Las contraseñas coinciden
                    </div>
                  )}
                </div>
              </div>

              <div className="checkbox-group">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                  />
                    <label htmlFor="terms">
                      Acepto <span className="privacy-link" onClick={() => setShowTerms(true)}>términos y condiciones</span>
                    </label>
                </div>

                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="privacy"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleChange}
                    required
                  />
<label htmlFor="privacy">
                    Acepto <span className="privacy-link" onClick={() => setShowPrivacy(true)}>política de privacidad</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="register-btn">
                Crear Cuenta
              </button>
            </form>
          </div>
        </div>


{showTerms && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>TÉRMINOS Y CONDICIONES DE SERVICIO</h3>
        <button className="modal-close" onClick={() => setShowTerms(false)}>Cerrar</button>
      </div>

      <p><strong>Última actualización: 25/09/2025</strong></p>

      <p>
        Bienvenido a Juguetería y Novedades Martínez. Estos Términos y Condiciones regulan el acceso, uso y compras realizadas
        en nuestra tienda en línea. Al utilizar este sitio web o efectuar una compra, usted manifiesta su consentimiento
        expreso de aceptar lo aquí establecido.
      </p>

      <h4>1. Información de la empresa</h4>
      <p>
        Nombre comercial: Juguetería y Novedades Martínez <br/>
        Razón social: Juguetería y Novedades Martínez S.A. de C.V. <br/>
        RFC: JNM250926ABC <br/>
        Domicilio fiscal: Av. López Mateos S/N, Barrio Achiyotl, Ahuatitla, Orizatlán, Hidalgo, México. <br/>
        Teléfono: 8110131113 <br/>
        Correo: grismartinez2016@gmail.com
      </p>

      <h4>2. Aceptación de los términos</h4>
      <p>
        Al navegar en el sitio o realizar una compra, el usuario acepta expresamente estos términos.
        La aceptación se realiza de manera electrónica al dar clic en “Aceptar” o “Finalizar compra”.
      </p>

      <h4>3. Proceso de compra y precios</h4>
      <p>
        Los precios se muestran en pesos mexicanos (MXN) e incluyen IVA.
        Se aceptan pagos con tarjetas, transferencias y pasarelas de pago autorizadas.
      </p>

      <h4>4. Envíos y entregas</h4>
      <p>
        Envíos de 3 a 7 días hábiles. Los costos se informan antes de confirmar la compra.
        Daños o faltantes deben reportarse dentro de las primeras 24 horas.
      </p>

      <h4>5. Cambios, devoluciones y cancelaciones</h4>
      <p>
        Cambios dentro de los 5 días hábiles conforme a la LFPC.
        No aplican en productos personalizados, de higiene o en liquidación.
      </p>

      <h4>6. Garantías</h4>
      <p>
        Garantía por defectos de fábrica conforme al fabricante.
        No cubre mal uso o daños por negligencia.
      </p>

      <h4>7. Propiedad intelectual</h4>
      <p>
        Todo el contenido del sitio es propiedad de Juguetería y Novedades Martínez. Queda prohibida su reproducción sin autorización.
      </p>

      <h4>8. Privacidad</h4>
      <p>
        Los datos se manejan conforme a la LFPDPPP y al Aviso de Privacidad.
        Derechos ARCO al correo: privacidad@jugueteriamartinez.com
      </p>

      <h4>9. Marco legal y jurisdicción</h4>
      <p>
        Jurisdicción en tribunales de Pachuca, Hidalgo.
        Quejas ante PROFECO.
      </p>

      <h4>10. Modificaciones</h4>
      <p>
        Estos términos podrán modificarse en cualquier momento.
      </p>
    </div>
  </div>
)}


{showPrivacy && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>POLÍTICAS DE PRIVACIDAD</h3>
        <button className="modal-close" onClick={() => setShowPrivacy(false)}>
          Cerrar
        </button>
      </div>

      <p><strong>Última actualización: 25/09/2025</strong></p>

      <p>
        En <strong>Juguetería y Novedades Martínez</strong> nos comprometemos a proteger la
        privacidad y seguridad de los datos personales de nuestros usuarios, clientes y visitantes.
        La presente Política de Privacidad describe cómo recabamos, usamos, almacenamos y protegemos su información.
        El uso de este sitio web implica la aceptación de estas políticas.
      </p>

      <h4>1. Responsable del tratamiento de los datos</h4>
      <p><strong>Nombre comercial:</strong> Juguetería y Novedades Martínez</p>
      <p><strong>Razón social:</strong> Juguetería y Novedades Martínez S.A. de C.V.</p>
      <p><strong>Domicilio:</strong> Av. López Mateos S/N, Barrio Achiyotl, Ahuatitla, Orizatlán, Hidalgo, México</p>
      <p><strong>Correo electrónico:</strong> grismartinez2016@gmail.com</p>
      <p><strong>Teléfono:</strong> 8110131113</p>

      <h4>2. Datos personales que se recaban</h4>
      <ul>
        <li>Nombre completo</li>
        <li>Domicilio</li>
        <li>Teléfono</li>
        <li>Correo electrónico</li>
        <li>Datos de facturación</li>
        <li>Fecha de nacimiento</li>
        <li>Fotografía</li>
        <li>Pasatiempos y preferencias de compra</li>
        <li>Información de navegación en el sitio web</li>
      </ul>
      <p>En su caso, también podrán recabarse datos personales sensibles, los cuales serán tratados bajo estrictas medidas de seguridad.</p>

      <h4>3. Finalidad del uso de los datos</h4>
      <p><strong>Finalidades primarias:</strong></p>
      <ul>
        <li>Registro de usuarios</li>
        <li>Procesamiento de pedidos y pagos</li>
        <li>Envíos de productos</li>
        <li>Atención al cliente</li>
        <li>Cumplimiento de obligaciones legales</li>
        <li>Emisión de comprobantes de compra</li>
      </ul>

      <p><strong>Finalidades secundarias:</strong></p>
      <ul>
        <li>Envío de promociones y publicidad</li>
        <li>Análisis estadístico de consumo</li>
        <li>Prospección comercial</li>
      </ul>
      <p>El usuario podrá oponerse a finalidades secundarias enviando un correo a nuestro contacto.</p>

      <h4>4. Uso de cookies</h4>
      <p>
        Este sitio web utiliza cookies y tecnologías similares para mejorar la experiencia del usuario,
        analizar el comportamiento de navegación y mostrar publicidad personalizada.
        El usuario puede desactivar las cookies desde su navegador.
      </p>

      <h4>5. Transferencia de datos</h4>
      <p>Los datos personales no serán compartidos sin consentimiento, salvo cuando sea requerido por ley o necesario para:</p>
      <ul>
        <li>Proveedores de servicios de pago</li>
        <li>Servicios de mensajería</li>
        <li>Proveedores de alojamiento web</li>
      </ul>
      <p>Todos los terceros están obligados a respetar la confidencialidad de la información.</p>

      <h4>6. Seguridad de los datos</h4>
      <p>
        Juguetería y Novedades Martínez implementa medidas administrativas, técnicas y físicas para proteger los datos
        personales contra acceso no autorizado, pérdida, alteración o uso indebido.
      </p>

      <h4>7. Derechos ARCO</h4>
      <p>
        El usuario podrá ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO) enviando un correo a:
        <br /><strong>privacidad@jugueteriamartinez.com</strong>
      </p>
      <p>
        La solicitud debe incluir nombre completo, medio de contacto e identificación oficial.
      </p>

      <h4>8. Conservación de los datos</h4>
      <p>
        Los datos personales serán conservados únicamente por el tiempo necesario para cumplir con las finalidades para las cuales fueron recabados y conforme a la legislación aplicable.
      </p>

      <h4>9. Enlaces a sitios de terceros</h4>
      <p>
        Este sitio puede contener enlaces a sitios de terceros. Juguetería y Novedades Martínez no se hace responsable
        de las prácticas de privacidad de dichos sitios.
      </p>

      <h4>10. Consentimiento</h4>
      <p>
        Al registrarse, comprar o navegar en este sitio web, el usuario otorga su consentimiento para el tratamiento de sus datos conforme a estas políticas.
      </p>

      <h4>11. Modificaciones</h4>
      <p>
        Nos reservamos el derecho de modificar estas políticas en cualquier momento. Las actualizaciones se publicarán en este mismo medio, indicando la fecha correspondiente.
      </p>

      <h4>12. Contacto</h4>
      <p>
        <strong>Correo electrónico:</strong> grismartinez2016@gmail.com<br/>
        <strong>Teléfono:</strong> 8110131113
      </p>

    </div>
  </div>
)}


      </div>
    </>
  );
};

export default Register;