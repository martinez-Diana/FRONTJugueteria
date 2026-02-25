import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isTokenExpired, clearSession } from "../utils/authUtils"

const getTokenTimeRemaining = (token) => {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now;
  } catch {
    console.error("Token inválido");
    return 0;
  }
};

const UserProfile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [compras, setCompras] = useState([])
  const [loadingCompras, setLoadingCompras] = useState(false)

  // 👇 OBTENER DATOS DEL USUARIO DESDE LOCALSTORAGE
  const [formData, setFormData] = useState(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return {
        id: user.id,
        firstName: user.first_name || user.name || user.nombre || "Usuario",
        lastName: user.last_name || user.apellido || "",
        motherLastName: user.mother_last_name || "",
        email: user.email || "",
        phone: user.phone || user.telefono || "",
        birthDate: user.birth_date || "",
        username: user.username || user.email || "",
      }
    }
    return {
      id: null,
      firstName: "Usuario",
      lastName: "",
      motherLastName: "",
      email: "",
      phone: "",
      birthDate: "",
      username: "",
    }
  })

  // 👇 VERIFICAR TOKEN AL CARGAR Y MONITOREAR EXPIRACIÓN
  useEffect(() => {
    const checkTokenExpiration = setInterval(() => {
      const currentToken = localStorage.getItem("token")
      
      if (!currentToken) {
        clearSession()
        navigate("/login")
        return
      }

      if (isTokenExpired(currentToken)) {
        clearSession()
        alert("Tu sesión ha expirado por inactividad.")
        navigate("/login")
        return
      }

      const timeLeft = getTokenTimeRemaining(currentToken)
      if (timeLeft > 0 && timeLeft <= 120) {
        const minutes = Math.floor(timeLeft / 60)
        const seconds = Math.floor(timeLeft % 60)
        console.warn(`⏰ Tu sesión expirará en ${minutes}:${seconds}`)
        
        if (timeLeft === 60) {
          alert("⚠️ Tu sesión expirará en 1 minuto. Guarda tu trabajo.")
        }
      }
    }, 10000)
    
    return () => clearInterval(checkTokenExpiration)
  }, [navigate])

  // 🆕 CARGAR COMPRAS CUANDO SE SELECCIONA LA PESTAÑA
  useEffect(() => {
    if (activeTab === "compras" && formData.id) {
      cargarCompras()
    }
  }, [activeTab, formData.id])

  const cargarCompras = async () => {
    if (!formData.id) {
      setError("No se pudo cargar el ID del usuario")
      return
    }

    try {
      setLoadingCompras(true)
      const response = await fetch(`http://localhost:4000/api/ventas/mis-compras/${formData.id}`)
      const data = await response.json()

      if (data.success) {
        setCompras(data.ventas)
      } else {
        setError("Error al cargar historial de compras")
      }
    } catch (err) {
      console.error('Error al cargar compras:', err)
      setError("Error al cargar historial de compras")
    } finally {
      setLoadingCompras(false)
    }
  }

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
      const response = await fetch(`http://localhost:4000/api/clientes/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: `${formData.firstName} ${formData.lastName} ${formData.motherLastName}`.trim(),
          email: formData.email,
          telefono: formData.phone,
          direccion: formData.birthDate
        })
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar localStorage
        const updatedUser = {
          ...JSON.parse(localStorage.getItem('user')),
          nombre: formData.firstName,
          email: formData.email,
          telefono: formData.phone
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        setSuccess("Perfil actualizado correctamente")
        setIsEditing(false)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Error al guardar los cambios")
      }
    } catch (err) {
      console.error('Error:', err)
      setError("Error al guardar los cambios")
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
      // Aquí iría la llamada al backend para cambiar contraseña
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
    clearSession()
    navigate("/login")
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad)
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

        /* 🆕 ESTILOS PARA HISTORIAL DE COMPRAS */
        .compras-loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .spinner-compras {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top-color: #ec4899;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .compras-empty {
          text-align: center;
          padding: 3rem;
        }

        .compras-empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .compras-lista {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .compra-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border-left: 4px solid #ec4899;
        }

        .compra-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .compra-header h4 {
          margin: 0 0 0.3rem 0;
          font-size: 1.1rem;
          color: #333;
        }

        .compra-fecha {
          font-size: 0.85rem;
          color: #999;
        }

        .compra-total {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ec4899;
        }

        .compra-productos {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .producto-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }

        .producto-img {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .producto-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }

        .producto-placeholder {
          width: 60px;
          height: 60px;
          background: #f0f0f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .producto-info {
          flex: 1;
        }

        .producto-info h5 {
          margin: 0 0 0.3rem 0;
          font-size: 1rem;
          color: #333;
        }

        .producto-info p {
          margin: 0;
          font-size: 0.85rem;
          color: #666;
        }

        .producto-subtotal {
          font-weight: 700;
          color: #333;
          font-size: 1.1rem;
        }

        .compra-footer {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 2px solid #e0e0e0;
          font-size: 0.9rem;
          color: #666;
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

          .compra-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .producto-item {
            flex-direction: column;
            text-align: center;
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
                  <div className="stat-number">{compras.length}</div>
                  <div className="stat-label">Compras</div>
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
                className={`tab ${activeTab === "compras" ? "active" : ""}`}
                onClick={() => setActiveTab("compras")}
              >
                Mis Compras
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

            {/* 🆕 Pestaña: Mis Compras */}
            <div className={`tab-content ${activeTab === "compras" ? "active" : ""}`}>
              <div className="section">
                <div className="section-title">🛍️ Historial de Compras</div>
                
                {loadingCompras ? (
                  <div className="compras-loading">
                    <div className="spinner-compras"></div>
                    <p>Cargando compras...</p>
                  </div>
                ) : compras.length === 0 ? (
                  <div className="compras-empty">
                    <div className="compras-empty-icon">🛍️</div>
                    <h3>No tienes compras aún</h3>
                    <p>Explora nuestro catálogo y realiza tu primera compra</p>
                    <button className="btn btn-primary" onClick={() => navigate('/home')}>
                      Ver Productos
                    </button>
                  </div>
                ) : (
                  <div className="compras-lista">
                    {compras.map((compra) => (
                      <div key={compra.id} className="compra-card">
                        <div className="compra-header">
                          <div>
                            <h4>Folio: {compra.folio}</h4>
                            <p className="compra-fecha">{formatearFecha(compra.fecha_venta)}</p>
                          </div>
                          <div className="compra-total">
                            {formatearMoneda(compra.total)}
                          </div>
                        </div>

                        <div className="compra-productos">
                          {compra.productos.map((prod) => (
                            <div key={prod.id} className="producto-item">
                              <div className="producto-img">
                                {prod.producto_imagen ? (
                                  <img src={prod.producto_imagen} alt={prod.producto_nombre} />
                                ) : (
                                  <div className="producto-placeholder">📦</div>
                                )}
                              </div>
                              <div className="producto-info">
                                <h5>{prod.producto_nombre}</h5>
                                <p>{prod.cantidad} x {formatearMoneda(prod.precio_unitario)}</p>
                              </div>
                              <div className="producto-subtotal">
                                {formatearMoneda(prod.subtotal)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="compra-footer">
                          <div>💳 {compra.metodo_pago.toUpperCase()}</div>
                          {compra.descuento > 0 && (
                            <div>🎁 Descuento: {formatearMoneda(compra.descuento)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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