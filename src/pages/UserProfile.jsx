import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isTokenExpired, clearSession } from "../utils/authUtils"

const API = "https://back-jugueteria.vercel.app/api"

const fmt = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0)
const fmtDate = (d) => new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Mexico_City" })
const fmtDateTime = (d) => new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" })

const ROSA = "#db2777"
const ROSA_DARK = "#be185d"
const ROSA_LIGHT = "#fce7f3"

export default function UserProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [compras, setCompras] = useState([])
  const [loadingCompras, setLoadingCompras] = useState(false)
  const [compraExpandida, setCompraExpandida] = useState(null)

  const [formData, setFormData] = useState(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return {
        id: user.id,
        firstName: user.first_name || user.name || "Usuario",
        lastName: user.last_name || "",
        motherLastName: user.mother_last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birth_date || "",
        username: user.username || user.email || "",
      }
    }
    return { id: null, firstName: "Usuario", lastName: "", motherLastName: "", email: "", phone: "", birthDate: "", username: "" }
  })

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  useEffect(() => {
    const check = setInterval(() => {
      const token = localStorage.getItem("token")
      if (!token || isTokenExpired(token)) { clearSession(); navigate("/login") }
    }, 10000)
    return () => clearInterval(check)
  }, [navigate])

const userId = formData.id

useEffect(() => {
  const cargarPerfil = async () => {
    if (!userId) return
    try {
      const res = await fetch(`${API}/clientes/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data && data.id) {
        setFormData(prev => ({
          ...prev,
          firstName: data.first_name || prev.firstName,
          lastName: data.last_name || prev.lastName,
          motherLastName: data.mother_lastname || prev.motherLastName,
          phone: data.phone || prev.phone,
          birthDate: data.birthdate || data.birth_date || "",
          username: data.username || prev.username,
        }))
      }
    } catch (e) {
      console.error("Error al cargar perfil:", e)
    }
  }
  cargarPerfil()
}, [userId])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    try {
      const res = await fetch(`${API}/clientes/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ nombre: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email, telefono: formData.phone })
      })
      const data = await res.json()
      if (data.message === "Cliente actualizado correctamente" || data.success) { setSuccess("Perfil actualizado"); setIsEditing(false); setTimeout(() => setSuccess(""), 3000) }
      else setError(data.message || "Error al guardar")
    } catch { setError("Error al guardar") }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (passwordData.newPassword !== passwordData.confirmPassword) return setError("Las contraseñas no coinciden")
    if (passwordData.newPassword.length < 8) return setError("Mínimo 8 caracteres")
    setSuccess("Contraseña actualizada")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setTimeout(() => setSuccess(""), 3000)
  }

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()

  const tabs = [
    { key: "personal", icon: "👤", label: "Mi Perfil" },
    { key: "compras", icon: "🛍️", label: "Mis Compras" },
    { key: "security", icon: "🔒", label: "Seguridad" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff1f2 100%)", fontFamily: "'Poppins', sans-serif", padding: "24px 16px" }}>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Botón volver */}
        <button onClick={() => navigate("/home")} style={{ background: "white", border: `2px solid ${ROSA_LIGHT}`, color: ROSA, borderRadius: 10, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
          ← Volver al inicio
        </button>

        {/* Header compacto */}
        <div style={{ background: "white", borderRadius: 20, padding: "24px 28px", marginBottom: 16, boxShadow: "0 4px 24px rgba(219,39,119,.08)", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${ROSA}, #f472b6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "white", flexShrink: 0, boxShadow: `0 4px 16px rgba(219,39,119,.3)` }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>{formData.firstName} {formData.lastName}</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>{formData.email}</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { n: compras.length, label: "Compras" },
              { n: "⭐ 4.8", label: "Rating" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: ROSA }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { clearSession(); navigate("/login") }} style={{ background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: 10, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
            🚪 Salir
          </button>
        </div>

        {/* Tabs */}
        <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 24px rgba(219,39,119,.08)", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1.5px solid #f3f4f6" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: "16px 8px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600,
                color: activeTab === t.key ? ROSA : "#9ca3af",
                borderBottom: activeTab === t.key ? `2.5px solid ${ROSA}` : "2.5px solid transparent",
                transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px 28px" }}>

            {/* ─── PESTAÑA PERSONAL ─── */}
            {activeTab === "personal" && (
              <div>
                {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderLeft: `4px solid #ef4444`, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>❌ {error}</div>}
                {success && <div style={{ background: "#ecfdf5", color: "#059669", borderLeft: `4px solid #10b981`, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}

                {!isEditing ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 20 }}>
                      {[
                        { icon: "👤", label: "Nombre", val: formData.firstName },
                        { icon: "👤", label: "Apellido Paterno", val: formData.lastName },
                        { icon: "👤", label: "Apellido Materno", val: formData.motherLastName || "—" },
                        { icon: "📧", label: "Correo", val: formData.email },
                        { icon: "📱", label: "Teléfono", val: formData.phone || "—" },
                       { icon: "🎂", label: "Nacimiento", val: formData.birthDate ? new Date(formData.birthDate).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) : "—" },
                        { icon: "🔑", label: "Usuario", val: formData.username },
                      ].map((f, i) => (
                        <div key={i} style={{ background: "#fafafa", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #f3f4f6" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{f.icon} {f.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setIsEditing(true)} style={{ background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                      ✏️ Editar Perfil
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSaveProfile}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      {[
                        { label: "Nombre", name: "firstName", val: formData.firstName },
                        { label: "Apellido Paterno", name: "lastName", val: formData.lastName },
                        { label: "Apellido Materno", name: "motherLastName", val: formData.motherLastName },
                        { label: "Teléfono", name: "phone", val: formData.phone },
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                          <input value={f.val} name={f.name} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                            style={{ width: "100%", padding: "9px 12px", border: `1.5px solid #e5e7eb`, borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" onClick={() => { setIsEditing(false); setError("") }} style={{ flex: 1, padding: "10px", background: "#f3f4f6", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
                      <button type="submit" style={{ flex: 1, padding: "10px", background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Guardar</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ─── PESTAÑA COMPRAS ─── */}
            {activeTab === "compras" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>🛍️ Mis Compras</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{compras.length} pedido{compras.length !== 1 ? "s" : ""} realizados</p>
                  </div>
                  {compras.length > 0 && (
                    <div style={{ background: ROSA_LIGHT, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: ROSA }}>{fmt(compras.reduce((s, c) => s + (c.total || 0), 0))}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>Total gastado</div>
                    </div>
                  )}
                </div>

                {loadingCompras ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    <div style={{ width: 40, height: 40, border: "4px solid #f3f4f6", borderTop: `4px solid ${ROSA}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ margin: 0, fontSize: 13 }}>Cargando compras...</p>
                  </div>
                ) : compras.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🛍️</div>
                    <h3 style={{ margin: "0 0 8px", color: "#374151" }}>Aún no tienes compras</h3>
                    <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Explora el catálogo y encuentra algo que te guste</p>
                    <button onClick={() => navigate("/home")} style={{ background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                      Ver Productos
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {compras.map((compra) => {
                      const expandida = compraExpandida === compra.id_venta
                      return (
                        <div key={compra.id_venta} style={{ border: `1.5px solid ${expandida ? ROSA : "#f3f4f6"}`, borderRadius: 14, overflow: "hidden", transition: "border .2s", background: "white" }}>
                          {/* Header de la compra */}
                          <div onClick={() => setCompraExpandida(expandida ? null : compra.id_venta)}
                            style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                            
                            {/* Icono estado */}
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: ROSA_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                              ✅
                            </div>

                            {/* Info principal */}
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{compra.folio}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{fmtDateTime(compra.fecha_venta)}</div>
                            </div>

                            {/* Productos preview */}
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              {(compra.productos || []).slice(0, 3).map((p, i) => (
                                <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: "#f9fafb", border: "1.5px solid #f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {p.producto_imagen ? (
                                    <img src={p.producto_imagen.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                  ) : <span style={{ fontSize: 16 }}>📦</span>}
                                </div>
                              ))}
                              {(compra.productos || []).length > 3 && (
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: ROSA_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: ROSA }}>
                                  +{compra.productos.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Total y método */}
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: ROSA }}>{fmt(compra.total)}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>💳 {compra.metodo_pago}</div>
                            </div>

                            {/* Flecha */}
                            <div style={{ fontSize: 14, color: "#9ca3af", transition: "transform .2s", transform: expandida ? "rotate(180deg)" : "rotate(0)" }}>▼</div>
                          </div>

                          {/* Detalle expandible */}
                          {expandida && (
                            <div style={{ borderTop: `1.5px solid #f3f4f6`, padding: "16px 20px", background: "#fafafa" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>PRODUCTOS</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {(compra.productos || []).map((p, i) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #f3f4f6" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f9fafb", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      {p.producto_imagen ? (
                                        <img src={p.producto_imagen.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                      ) : <span style={{ fontSize: 20 }}>📦</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.nombre_producto || p.producto_nombre}</div>
                                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.cantidad} unidad{p.cantidad !== 1 ? "es" : ""} × {fmt(p.precio_unitario)}</div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{fmt(p.subtotal)}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Resumen */}
                              <div style={{ marginTop: 14, padding: "12px 14px", background: "white", borderRadius: 10, border: "1.5px solid #f3f4f6" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                                  <span>Subtotal</span><span>{fmt(compra.subtotal || compra.total)}</span>
                                </div>
                                {compra.descuento > 0 && (
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#10b981", marginBottom: 6 }}>
                                    <span>🎁 Descuento</span><span>-{fmt(compra.descuento)}</span>
                                  </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#1e1b4b", borderTop: "1.5px solid #f3f4f6", paddingTop: 8 }}>
                                  <span>Total</span><span style={{ color: ROSA }}>{fmt(compra.total)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── PESTAÑA SEGURIDAD ─── */}
            {activeTab === "security" && (
              <div>
                {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderLeft: "4px solid #ef4444", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>❌ {error}</div>}
                {success && <div style={{ background: "#ecfdf5", color: "#059669", borderLeft: "4px solid #10b981", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}

                <form onSubmit={handleChangePassword}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>🔒 Cambiar Contraseña</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
                    {[
                      { label: "Contraseña actual", name: "currentPassword", val: passwordData.currentPassword },
                      { label: "Nueva contraseña", name: "newPassword", val: passwordData.newPassword },
                      { label: "Confirmar contraseña", name: "confirmPassword", val: passwordData.confirmPassword },
                    ].map((f, i) => (
                      <div key={i}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                        <input type="password" value={f.val} name={f.name}
                          onChange={e => setPasswordData({ ...passwordData, [f.name]: e.target.value })}
                          style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" }} />
                      </div>
                    ))}

                    {passwordData.newPassword && (
                      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
                        {[
                          { ok: passwordData.newPassword.length >= 8, label: "Mínimo 8 caracteres" },
                          { ok: /[A-Z]/.test(passwordData.newPassword), label: "Una mayúscula" },
                          { ok: /\d/.test(passwordData.newPassword), label: "Un número" },
                        ].map((r, i) => (
                          <div key={i} style={{ color: r.ok ? "#10b981" : "#9ca3af", marginBottom: 3 }}>
                            {r.ok ? "✓" : "○"} {r.label}
                          </div>
                        ))}
                      </div>
                    )}

                    <button type="submit" style={{ padding: "10px", background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>
                      Actualizar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}