import { useState } from "react"
import { useNavigate } from "react-router-dom"

const UserProfile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    firstName: "Juan",
    lastName: "García",
    motherLastName: "López",
    email: "juan@example.com",
    phone: "+34 612 345 678",
    birthDate: "1990-05-15",
    username: "juangarcia",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Simular llamada a API
      // const response = await API.put("/api/profile", formData);
      setSuccess("Perfil actualizado correctamente")
      setIsEditing(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar los cambios")
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    try {
      // Simular llamada a API
      // const response = await API.put("/api/change-password", passwordData);
      setSuccess("Contraseña cambiada correctamente")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña")
    }
  }

  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");
        
        body {
          margin: 0;
          font-family: "Poppins", sans-serif;
          background: #fef5fb;
        }

        .profile-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 40px 20px;
          background: #fef5fb;
        }

        .profile-wrapper {
          width: 100%;
          max-width: 1200px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 30px;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.08);
          margin-bottom: 30px;
        }

        .profile-avatar {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f472b6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 5px 20px rgba(236, 72, 153, 0.3);
        }

        .profile-avatar.edit-mode {
          cursor: pointer;
          border: 3px dashed #c084fc;
        }

        .avatar-upload {
          display: none;
        }

        .profile-info h1 {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .profile-info p {
          color: #666;
          font-size: 14px;
          margin: 5px 0 0 0;
        }

        .profile-email {
          font-weight: 500;
          color: #ec4899;
          margin-top: 8px;
        }

        .profile-stats {
          display: flex;
          gap: 30px;
          margin-top: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #ec4899;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }

        .profile-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.08);
          overflow: hidden;
        }

        .tabs {
          display: flex;
          border-bottom: 2px solid #f0f0f0;
          background: #fafafa;
        }

        .tab {
          flex: 1;
          padding: 20px;
          text-align: center;
          font-weight: 600;
          cursor: pointer;
          color: #999;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .tab.active {
          color: #ec4899;
          border-bottom-color: #ec4899;
          background: white;
        }

        .tab:hover {
          color: #db2777;
        }

        .tab-content {
          display: none;
          padding: 40px;
        }

        .tab-content.active {
          display: block;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-row.full {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 500;
          margin-bottom: 6px;
          color: #333;
          font-size: 13px;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="date"],
        input[type="tel"] {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
          font-family: "Poppins", sans-serif;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: #c084fc;
          box-shadow: 0 0 6px rgba(192, 132, 252, 0.25);
        }

        input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        input.input-error {
          border-color: #ef4444;
        }

        input.input-success {
          border-color: #10b981;
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

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 11px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-family: "Poppins", sans-serif;
        }

        .btn-primary {
          background: #ec4899;
          color: white;
          flex: 1;
          box-shadow: 0 3px 12px rgba(236, 72, 153, 0.25);
        }

        .btn-primary:hover {
          background: #db2777;
          box-shadow: 0 5px 16px rgba(219, 39, 119, 0.3);
          transform: translateY(-2px);
        }

        .btn-primary:active {
          transform: scale(0.98);
        }

        .btn-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          flex: 1;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-outline {
          background: transparent;
          color: #ec4899;
          border: 1px solid #ec4899;
          flex: 1;
        }

        .btn-outline:hover {
          background: #fce4ec;
        }

        .message {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message.error {
          background: #fef2f2;
          color: #dc2626;
          border-left: 4px solid #ef4444;
        }

        .message.success {
          background: #ecfdf5;
          color: #059669;
          border-left: 4px solid #10b981;
        }

        .password-strength {
          margin-top: 8px;
          padding: 8px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 3px solid #e5e7eb;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          margin: 3px 0;
        }

        .requirement.met {
          color: #10b981;
        }

        .requirement.unmet {
          color: #9ca3af;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          padding: 20px 40px;
          border-top: 1px solid #f0f0f0;
          justify-content: flex-end;
        }

        .edit-btn {
          background: #ec4899;
          color: white;
          padding: 10px 25px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          box-shadow: 0 3px 12px rgba(236, 72, 153, 0.25);
        }

        .edit-btn:hover {
          background: #db2777;
          transform: translateY(-2px);
        }

        .logout-btn {
          background: #f0f0f0;
          color: #333;
          padding: 10px 25px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .logout-btn:hover {
          background: #e0e0e0;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
            padding: 30px 20px;
          }

          .profile-info h1 {
            font-size: 22px;
          }

          .profile-stats {
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
            padding: 15px 20px;
          }

          .edit-btn,
          .logout-btn {
            width: 100%;
          }

          .tab-content {
            padding: 20px;
          }
        }
      `}</style>
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Header del Perfil */}
          <div className="profile-header">
            <div className="profile-avatar">
              {formData.firstName.charAt(0).toUpperCase()}
              {formData.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>
                {formData.firstName} {formData.lastName}
              </h1>
              <p className="profile-email">{formData.email}</p>
              <p>@{formData.username}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-number">23</div>
                  <div className="stat-label">Pedidos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.8</div>
                  <div className="stat-label">Calificación</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Favoritos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del Perfil */}
          <div className="profile-content">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "personal" ? "active" : ""}`}
                onClick={() => setActiveTab("personal")}
              >
                Información Personal
              </button>
              <button
                className={`tab ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                Seguridad
              </button>
            </div>

            {/* Pestaña: Información Personal */}
            <div className={`tab-content ${activeTab === "personal" ? "active" : ""}`}>
              {error && <div className="message error">❌ {error}</div>}
              {success && <div className="message success">✅ {success}</div>}

              {!isEditing ? (
                <div>
                  <div className="section">
                    <div className="section-title">👤 Datos Personales</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" value={formData.firstName} disabled />
                      </div>
                      <div className="form-group">
                        <label>Apellido Paterno</label>
                        <input type="text" value={formData.lastName} disabled />
                      </div>
                    </div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>Apellido Materno</label>
                        <input type="text" value={formData.motherLastName} disabled />
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">📧 Contacto</div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" value={formData.email} disabled />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input type="tel" value={formData.phone} disabled />
                      </div>
                      <div className="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" value={formData.birthDate} disabled />
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">👤 Usuario</div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>Nombre de Usuario</label>
                        <input type="text" value={formData.username} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile}>
                  <div className="section">
                    <div className="section-title">👤 Datos Personales</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Apellido Paterno</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>Apellido Materno</label>
                        <input
                          type="text"
                          name="motherLastName"
                          value={formData.motherLastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="section-title">📧 Contacto</div>
                    <div className="form-row full">
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                      </div>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setIsEditing(false)
                        setError("")
                        setSuccess("")
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Pestaña: Seguridad */}
            <div className={`tab-content ${activeTab === "security" ? "active" : ""}`}>
              {error && <div className="message error">❌ {error}</div>}
              {success && <div className="message success">✅ {success}</div>}

              <form onSubmit={handleChangePassword}>
                <div className="section">
                  <div className="section-title">🔒 Cambiar Contraseña</div>
                  <div className="form-row full">
                    <div className="form-group">
                      <label>Contraseña Actual</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row full">
                    <div className="form-group">
                      <label>Nueva Contraseña</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                      />
                      <div className="password-strength">
                        <div className={`requirement ${passwordData.newPassword.length >= 8 ? "met" : "unmet"}`}>
                          {passwordData.newPassword.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                        </div>
                        <div className={`requirement ${/[A-Z]/.test(passwordData.newPassword) ? "met" : "unmet"}`}>
                          {/[A-Z]/.test(passwordData.newPassword) ? "✓" : "○"} Una letra mayúscula
                        </div>
                        <div className={`requirement ${/\d/.test(passwordData.newPassword) ? "met" : "unmet"}`}>
                          {/\d/.test(passwordData.newPassword) ? "✓" : "○"} Un número
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-row full">
                    <div className="form-group">
                      <label>Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirma tu nueva contraseña"
                        required
                      />
                    </div>
                  </div>
                  <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Botones de Acción */}
            <div className="action-buttons">
              {!isEditing && activeTab === "personal" && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Editar Perfil
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserProfile