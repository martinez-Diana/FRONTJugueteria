import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { sanitizeInput } from "../utils/authUtils";

const API_URL = import.meta.env.VITE_API_URL || "https://back-jugueteria.vercel.app";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  
  // 👁️ Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token inválido o no proporcionado");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
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
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isPasswordValid()) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }

    setLoading(true);

    try {
      // 🛡️ Sanitizar la contraseña antes de enviar
      const sanitizedPassword = sanitizeInput(formData.password);

      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: sanitizedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña");
      }

      // ✅ Mostrar mensaje de éxito con palomita
      setMessage("✅ ¡Contraseña restablecida correctamente!");
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordReq = getPasswordRequirements();

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#fef5fb",
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "20px",
    },
    card: {
      display: "flex",
      width: "100%",
      maxWidth: "850px",
      minHeight: "500px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 10px 40px rgba(139, 92, 246, 0.08)",
      overflow: "hidden",
    },
    leftPanel: {
      flex: 1,
      background: "#ec4899",
      color: "white",
      textAlign: "center",
      padding: "50px 20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    leftTitle: {
      fontWeight: 700,
      fontSize: "24px",
      lineHeight: 1.3,
      margin: 0,
    },
    leftSubtitle: {
      fontWeight: 700,
      fontSize: "28px",
      color: "#fcd34d",
      margin: "10px 0",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.15)",
    },
    line: {
      width: "60px",
      height: "3px",
      background: "#67e8f9",
      border: "none",
      margin: "15px auto",
      borderRadius: "2px",
    },
    leftDescription: {
      fontSize: "14px",
      marginTop: "10px",
      opacity: 0.95,
    },
    circles: {
      display: "flex",
      justifyContent: "center",
      marginTop: "25px",
      gap: "12px",
    },
    circle: {
      width: "25px",
      height: "25px",
      borderRadius: "50%",
    },
    circleCyan: {
      backgroundColor: "#67e8f9",
      boxShadow: "0 3px 8px rgba(103, 232, 249, 0.3)",
    },
    circleYellow: {
      backgroundColor: "#fcd34d",
      boxShadow: "0 3px 8px rgba(252, 211, 77, 0.3)",
    },
    circleOrange: {
      backgroundColor: "#f472b6",
      boxShadow: "0 3px 8px rgba(244, 114, 182, 0.3)",
    },
    rightPanel: {
      flex: 1,
      padding: "40px 50px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    rightTitle: {
      color: "#ec4899",
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "5px",
    },
    rightSubtitle: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "25px",
      lineHeight: 1.5,
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontWeight: 500,
      fontSize: "13px",
      marginBottom: "4px",
      color: "#333",
    },
    passwordInputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      marginBottom: "15px",
    },
    input: {
      padding: "10px 12px",
      paddingRight: "40px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      outline: "none",
      fontSize: "14px",
      transition: "all 0.3s ease",
      fontFamily: "'Poppins', sans-serif",
      width: "100%",
    },
    inputSuccess: {
      borderColor: "#10b981",
    },
    togglePassword: {
      position: "absolute",
      right: "10px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: "#666",
      padding: "5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "color 0.2s ease",
    },
    button: {
      backgroundColor: "#ec4899",
      color: "white",
      border: "none",
      padding: "12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "15px",
      transition: "all 0.3s ease",
      marginTop: "8px",
      boxShadow: "0 3px 12px rgba(236, 72, 153, 0.25)",
    },
    buttonDisabled: {
      backgroundColor: "#d1d5db",
      cursor: "not-allowed",
    },
    message: {
      color: "#059669",
      marginTop: "15px",
      fontSize: "13px",
      textAlign: "center",
      padding: "12px",
      backgroundColor: "#ecfdf5",
      borderRadius: "6px",
      borderLeft: "4px solid #10b981",
      fontWeight: 600,
      animation: "slideIn 0.3s ease",
    },
    error: {
      color: "#dc2626",
      marginTop: "15px",
      fontSize: "13px",
      textAlign: "center",
      padding: "10px",
      backgroundColor: "#fef2f2",
      borderRadius: "6px",
      borderLeft: "4px solid #ef4444",
    },
    passwordRequirements: {
      fontSize: "11px",
      marginTop: "-10px",
      marginBottom: "15px",
      padding: "8px",
      background: "#f9fafb",
      borderRadius: "6px",
      borderLeft: "3px solid #e5e7eb",
    },
    passwordRequirementsActive: {
      borderLeftColor: "#c084fc",
    },
    requirement: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      margin: "3px 0",
    },
    requirementMet: {
      color: "#10b981",
    },
    requirementUnmet: {
      color: "#9ca3af",
    },
    validationMessage: {
      fontSize: "11px",
      marginTop: "-10px",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    validationSuccess: {
      color: "#10b981",
    },
    validationError: {
      color: "#ef4444",
    },
    backText: {
      fontSize: "13px",
      textAlign: "center",
      marginTop: "20px",
      color: "#666",
    },
    link: {
      color: "#c084fc",
      textDecoration: "none",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <h2 style={styles.leftTitle}>
            JUGUETERÍA Y
            <br />
            NOVEDADES
          </h2>
          <h1 style={styles.leftSubtitle}>MARTÍNEZ</h1>
          <hr style={styles.line} />
          <p style={styles.leftDescription}>Sistema de Gestión Integral</p>

          <div style={styles.circles}>
            <span style={{ ...styles.circle, ...styles.circleCyan }}></span>
            <span style={{ ...styles.circle, ...styles.circleYellow }}></span>
            <span style={{ ...styles.circle, ...styles.circleOrange }}></span>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Nueva Contraseña</h2>
          <p style={styles.rightSubtitle}>
            Ingresa tu nueva contraseña para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Nueva Contraseña</label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocus(true)}
                required
                disabled={loading || !token}
                style={{
                  ...styles.input,
                  ...(isPasswordValid() ? styles.inputSuccess : {}),
                }}
                onFocusCapture={(e) => {
                  e.target.style.borderColor = "#c084fc";
                  e.target.style.boxShadow = "0 0 6px rgba(192, 132, 252, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isPasswordValid() ? "#10b981" : "#ddd";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                style={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => (e.target.style.color = "#ec4899")}
                onMouseLeave={(e) => (e.target.style.color = "#666")}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {(passwordFocus || formData.password) && (
              <div
                style={{
                  ...styles.passwordRequirements,
                  ...(formData.password ? styles.passwordRequirementsActive : {}),
                }}
              >
                <div
                  style={{
                    ...styles.requirement,
                    ...(passwordReq.length ? styles.requirementMet : styles.requirementUnmet),
                  }}
                >
                  {passwordReq.length ? "✓" : "○"} Mínimo 8 caracteres
                </div>
                <div
                  style={{
                    ...styles.requirement,
                    ...(passwordReq.uppercase ? styles.requirementMet : styles.requirementUnmet),
                  }}
                >
                  {passwordReq.uppercase ? "✓" : "○"} Una letra mayúscula
                </div>
                <div
                  style={{
                    ...styles.requirement,
                    ...(passwordReq.number ? styles.requirementMet : styles.requirementUnmet),
                  }}
                >
                  {passwordReq.number ? "✓" : "○"} Un número
                </div>
                <div
                  style={{
                    ...styles.requirement,
                    ...(passwordReq.symbol ? styles.requirementMet : styles.requirementUnmet),
                  }}
                >
                  {passwordReq.symbol ? "✓" : "○"} Un símbolo (!@#$%^&*)
                </div>
              </div>
            )}

            <label style={styles.label}>Confirmar Contraseña</label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading || !token}
                style={{
                  ...styles.input,
                  ...(formData.confirmPassword &&
                  formData.password === formData.confirmPassword
                    ? styles.inputSuccess
                    : {}),
                }}
                onFocusCapture={(e) => {
                  e.target.style.borderColor = "#c084fc";
                  e.target.style.boxShadow = "0 0 6px rgba(192, 132, 252, 0.25)";
                }}
                onBlur={(e) => {
                  const isMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
                  e.target.style.borderColor = isMatch ? "#10b981" : "#ddd";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                style={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                onMouseEnter={(e) => (e.target.style.color = "#ec4899")}
                onMouseLeave={(e) => (e.target.style.color = "#666")}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div style={{ ...styles.validationMessage, ...styles.validationError }}>
                ❌ Las contraseñas no coinciden
              </div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div style={{ ...styles.validationMessage, ...styles.validationSuccess }}>
                ✓ Las contraseñas coinciden
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              style={{
                ...styles.button,
                ...(loading || !token ? styles.buttonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!loading && token) {
                  e.target.style.backgroundColor = "#db2777";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 5px 16px rgba(219, 39, 119, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && token) {
                  e.target.style.backgroundColor = "#ec4899";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 3px 12px rgba(236, 72, 153, 0.25)";
                }
              }}
            >
              {loading ? "Actualizando..." : "Restablecer Contraseña"}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <p style={styles.backText}>
            ¿Recordaste tu contraseña?{" "}
            <Link
              to="/login"
              style={styles.link}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;