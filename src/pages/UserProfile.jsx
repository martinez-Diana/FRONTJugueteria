import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isTokenExpired, clearSession } from "../utils/authUtils"

const API = "https://back-jugueteria.vercel.app/api"

const fmt = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0)
const fmtDateTime = (d) => new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" })
const fmtDate = (d) => new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Mexico_City" })

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
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  // Apartados
  const [apartados, setApartados] = useState([])
  const [loadingApartados, setLoadingApartados] = useState(false)
  const [apartadoExpandido, setApartadoExpandido] = useState(null)
  const [modalAbono, setModalAbono] = useState(null)
  const [montoAbono, setMontoAbono] = useState("")
  const [notasAbono, setNotasAbono] = useState("")
  const [guardandoAbono, setGuardandoAbono] = useState(false)
  const [deseos, setDeseos] = useState([])
const [loadingDeseos, setLoadingDeseos] = useState(false)

// 👇 LUEGO las funciones
const cargarDeseos = async () => {
  if (!userId) return
  try {
    setLoadingDeseos(true)
    const res = await fetch(`${API}/lista-deseos/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    const data = await res.json()
    if (data.success) setDeseos(data.deseos)
  } catch (e) { console.error(e) }
  finally { setLoadingDeseos(false) }
}

const quitarDeseo = async (idProducto) => {
  try {
    await fetch(`${API}/lista-deseos/${userId}/${idProducto}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    setDeseos(prev => prev.filter(d => d.id_producto !== idProducto))
  } catch (e) { console.error(e) }
}

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
        birthDate: user.birthdate || user.birth_date || "",
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
            birthDate: data.birthdate ? new Date(data.birthdate).toISOString().split("T")[0] : prev.birthDate,
            username: data.username || prev.username,
          }))
        }
      } catch (e) { console.error("Error al cargar perfil:", e) }
    }
    cargarPerfil()
  }, [userId])

  const cargarCompras = async () => {
    if (!userId) return
    try {
      setLoadingCompras(true)
      const res = await fetch(`${API}/ventas/mis-compras/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) setCompras(data.ventas)
      else setError("Error al cargar compras")
    } catch { setError("Error al cargar compras") }
    finally { setLoadingCompras(false) }
  }

  const cargarApartados = async () => {
    if (!userId) return
    try {
      setLoadingApartados(true)
      const res = await fetch(`${API}/apartados/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) setApartados(data.apartados)
    } catch (e) { console.error("Error al cargar apartados:", e) }
    finally { setLoadingApartados(false) }
  }

  useEffect(() => {
  if (activeTab === "compras" && userId) cargarCompras()
  if (activeTab === "apartados" && userId) cargarApartados()
  if (activeTab === "favoritos" && userId) cargarDeseos()
}, [activeTab, userId])

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
      if (data.message === "Cliente actualizado correctamente" || data.success) {
        setSuccess("Perfil actualizado correctamente ✅")
        setIsEditing(false)
        setTimeout(() => setSuccess(""), 3000)
      } else setError(data.message || "Error al guardar")
    } catch { setError("Error al guardar") }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (passwordData.newPassword !== passwordData.confirmPassword) return setError("Las contraseñas no coinciden")
    if (passwordData.newPassword.length < 8) return setError("Mínimo 8 caracteres")
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ userId: formData.id, currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess("Contraseña actualizada correctamente ✅")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => setSuccess(""), 3000)
      } else setError(data.error || "Error al cambiar contraseña")
    } catch { setError("Error al conectar con el servidor") }
  }

  const handleAbonar = async (e) => {
    e.preventDefault()
    if (!montoAbono || parseFloat(montoAbono) <= 0) return
    try {
      setGuardandoAbono(true)
      const res = await fetch(`${API}/apartados/${modalAbono.id_apartado}/abonar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ monto: parseFloat(montoAbono), notas: notasAbono })
      })
      const data = await res.json()
      if (data.success) {
        setModalAbono(null)
        setMontoAbono("")
        setNotasAbono("")
        setSuccess("¡Abono registrado exitosamente! ✅")
        setTimeout(() => setSuccess(""), 3000)
        cargarApartados()
      } else {
        alert(data.error || "Error al registrar abono")
      }
    } catch { alert("Error al conectar con el servidor") }
    finally { setGuardandoAbono(false) }
  }

  const getEstadoStyle = (estado) => ({
    activo:    { bg: "#d1fae5", color: "#065f46", label: "✅ Activo" },
    liquidado: { bg: "#dbeafe", color: "#1d4ed8", label: "💳 Liquidado" },
    cancelado: { bg: "#fee2e2", color: "#991b1b", label: "❌ Cancelado" },
    vencido:   { bg: "#fef3c7", color: "#92400e", label: "⚠️ Vencido" },
  }[estado] || { bg: "#f3f4f6", color: "#374151", label: estado })

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()

  const tabs = [
  { key: "personal",   icon: "👤", label: "Mi Perfil" },
  { key: "compras",    icon: "🛍️", label: "Mis Compras" },
  { key: "apartados",  icon: "🏷️", label: "Mis Apartados" },
  { key: "favoritos",  icon: "❤️", label: "Mis Favoritos" },
  { key: "security",   icon: "🔒", label: "Seguridad" },
]

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff1f2 100%)", fontFamily: "'Poppins', sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <button onClick={() => navigate("/home")} style={{ background: "white", border: `2px solid ${ROSA_LIGHT}`, color: ROSA, borderRadius: 10, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
          ← Volver al inicio
        </button>

        {/* Header */}
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
              { n: apartados.filter(a => a.estado === "activo").length, label: "Apartados" },
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
          <div style={{ display: "flex", borderBottom: "1.5px solid #f3f4f6", overflowX: "auto" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: "16px 8px", border: "none", background: "none", cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                color: activeTab === t.key ? ROSA : "#9ca3af",
                borderBottom: activeTab === t.key ? `2.5px solid ${ROSA}` : "2.5px solid transparent",
                transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "28px" }}>

            {/* ─── MI PERFIL ─── */}
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

            {/* ─── MIS COMPRAS ─── */}
            {activeTab === "compras" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>🛍️ Mis Compras</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{compras.length} pedido{compras.length !== 1 ? "s" : ""} realizados</p>
                  </div>
                  {compras.length > 0 && (
                    <div style={{ background: ROSA_LIGHT, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: ROSA }}>{fmt(compras.reduce((s, c) => s + (parseFloat(c.total) || 0), 0))}</div>
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
                    <button onClick={() => navigate("/home")} style={{ background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Ver Productos</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {compras.map((compra) => {
                      const expandida = compraExpandida === compra.id_venta
                      return (
                        <div key={compra.id_venta} style={{ border: `1.5px solid ${expandida ? ROSA : "#f3f4f6"}`, borderRadius: 14, overflow: "hidden", transition: "border .2s", background: "white" }}>
                          <div onClick={() => setCompraExpandida(expandida ? null : compra.id_venta)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: ROSA_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✅</div>
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{compra.folio}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{fmtDateTime(compra.fecha_venta)}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              {(compra.productos || []).slice(0, 3).map((p, i) => (
                                <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: "#f9fafb", border: "1.5px solid #f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {p.producto_imagen ? <img src={p.producto_imagen.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 16 }}>📦</span>}
                                </div>
                              ))}
                              {(compra.productos || []).length > 3 && <div style={{ width: 36, height: 36, borderRadius: 8, background: ROSA_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: ROSA }}>+{compra.productos.length - 3}</div>}
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: ROSA }}>{fmt(compra.total)}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>💳 {compra.metodo_pago}</div>
                            </div>
                            <div style={{ fontSize: 14, color: "#9ca3af", transition: "transform .2s", transform: expandida ? "rotate(180deg)" : "rotate(0)" }}>▼</div>
                          </div>
                          {expandida && (
                            <div style={{ borderTop: `1.5px solid #f3f4f6`, padding: "16px 20px", background: "#fafafa" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>PRODUCTOS</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {(compra.productos || []).map((p, i) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #f3f4f6" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f9fafb", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      {p.producto_imagen ? <img src={p.producto_imagen.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 20 }}>📦</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.nombre_producto || p.producto_nombre}</div>
                                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.cantidad} unidad{p.cantidad !== 1 ? "es" : ""} × {fmt(p.precio_unitario)}</div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{fmt(p.subtotal)}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: 14, padding: "12px 14px", background: "white", borderRadius: 10, border: "1.5px solid #f3f4f6" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}><span>Subtotal</span><span>{fmt(compra.subtotal || compra.total)}</span></div>
                                {compra.descuento > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#10b981", marginBottom: 6 }}><span>🎁 Descuento</span><span>-{fmt(compra.descuento)}</span></div>}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#1e1b4b", borderTop: "1.5px solid #f3f4f6", paddingTop: 8 }}><span>Total</span><span style={{ color: ROSA }}>{fmt(compra.total)}</span></div>
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

            {/* ─── MIS APARTADOS ─── */}
            {activeTab === "apartados" && (
              <div>
                {success && <div style={{ background: "#ecfdf5", color: "#059669", borderLeft: `4px solid #10b981`, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>🏷️ Mis Apartados</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{apartados.length} apartado{apartados.length !== 1 ? "s" : ""} registrados</p>
                  </div>
                  {apartados.filter(a => a.estado === "activo").length > 0 && (
                    <div style={{ background: "#f3e8ff", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#7e3ff2" }}>{fmt(apartados.filter(a => a.estado === "activo").reduce((s, a) => s + parseFloat(a.saldo_pendiente || 0), 0))}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>Por pagar</div>
                    </div>
                  )}
                </div>

                {loadingApartados ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                    <div style={{ width: 40, height: 40, border: "4px solid #f3f4f6", borderTop: `4px solid ${ROSA}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
                    <p style={{ margin: 0, fontSize: 13 }}>Cargando apartados...</p>
                  </div>
                ) : apartados.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🏷️</div>
                    <h3 style={{ margin: "0 0 8px", color: "#374151" }}>No tienes apartados</h3>
                    <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Aparta tus productos favoritos con un anticipo del 20%</p>
                    <button onClick={() => navigate("/home")} style={{ background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Ver Productos</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {apartados.map((a) => {
                      const expandido = apartadoExpandido === a.id_apartado
                      const progreso = Math.min(Math.round((parseFloat(a.total_abonado) / parseFloat(a.precio_total)) * 100), 100)
                      const estilo = getEstadoStyle(a.estado)

                      return (
                        <div key={a.id_apartado} style={{ border: `1.5px solid ${expandido ? ROSA : "#f3f4f6"}`, borderRadius: 14, overflow: "hidden", background: "white" }}>
                          {/* Header */}
                          <div onClick={() => setApartadoExpandido(expandido ? null : a.id_apartado)}
                            style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {a.producto_imagen ? <img src={a.producto_imagen.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 24 }}>🏷️</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 150 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{a.producto_nombre}</div>
                              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f3e8ff", color: "#7e3ff2" }}>#{a.id_apartado}</span>
                                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: estilo.bg, color: estilo.color }}>{estilo.label}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#ea580c" }}>{fmt(a.saldo_pendiente)}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>por pagar</div>
                            </div>
                            <div style={{ fontSize: 14, color: "#9ca3af", transition: "transform .2s", transform: expandido ? "rotate(180deg)" : "rotate(0)" }}>▼</div>
                          </div>

                          {/* Detalle expandido */}
                          {expandido && (
                            <div style={{ borderTop: "1.5px solid #f3f4f6", padding: "16px 20px", background: "#fafafa" }}>
                              {/* Montos */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                                {[
                                  { label: "Precio Total", val: fmt(a.precio_total), color: "#7e3ff2", bg: "#f3e8ff" },
                                  { label: "Total Abonado", val: fmt(a.total_abonado), color: "#0891b2", bg: "#ecfeff" },
                                  { label: "Saldo Pendiente", val: fmt(a.saldo_pendiente), color: "#ea580c", bg: "#fff7ed" },
                                ].map((m, i) => (
                                  <div key={i} style={{ background: m.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{m.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.val}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Progreso */}
                              <div style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                  <span style={{ color: "#6b7280" }}>Progreso de pago</span>
                                  <span style={{ fontWeight: 700, color: "#7e3ff2" }}>{progreso}%</span>
                                </div>
                                <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
                                  <div style={{ width: `${progreso}%`, height: "100%", background: "linear-gradient(to right, #7e3ff2, #db2777)", borderRadius: 999, transition: "width .3s" }}></div>
                                </div>
                              </div>

                              {/* Fechas */}
                              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, background: "white", borderRadius: 8, padding: "8px 12px", border: "1.5px solid #f3f4f6", fontSize: 12 }}>
                                  <div style={{ color: "#9ca3af" }}>📅 Fecha de apartado</div>
                                  <div style={{ fontWeight: 600, color: "#374151", marginTop: 2 }}>{fmtDate(a.fecha_apartado)}</div>
                                </div>
                                <div style={{ flex: 1, background: "white", borderRadius: 8, padding: "8px 12px", border: "1.5px solid #f3f4f6", fontSize: 12 }}>
                                  <div style={{ color: "#9ca3af" }}>⏰ Fecha límite</div>
                                  <div style={{ fontWeight: 600, color: "#374151", marginTop: 2 }}>{fmtDate(a.fecha_limite)}</div>
                                </div>
                              </div>

                              {/* Botón abonar */}
                              {a.estado === "activo" && (
                                <button onClick={() => setModalAbono(a)}
                                  style={{ width: "100%", padding: "11px", background: `linear-gradient(135deg, #7e3ff2, ${ROSA})`, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                                  💰 Registrar Abono
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}


            {/* ─── MIS FAVORITOS ─── */}
{activeTab === "favoritos" && (
  <div>
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>❤️ Mis Favoritos</h3>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{deseos.length} producto{deseos.length !== 1 ? "s" : ""} guardados</p>
    </div>
    {loadingDeseos ? (
      <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #f3f4f6", borderTop: `4px solid ${ROSA}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <p style={{ margin: 0, fontSize: 13 }}>Cargando favoritos...</p>
      </div>
    ) : deseos.length === 0 ? (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤍</div>
        <h3 style={{ margin: "0 0 8px", color: "#374151" }}>No tienes favoritos</h3>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Agrega productos a tu lista de deseos desde el catálogo</p>
        <button onClick={() => navigate("/home")} style={{ background: `linear-gradient(135deg, ${ROSA}, ${ROSA_DARK})`, color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Ver Productos</button>
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {deseos.map((d) => (
          <div key={d.id_producto} style={{ background: "#fafafa", borderRadius: 14, overflow: "hidden", border: "1.5px solid #f3f4f6" }}>
            <div style={{ height: 140, background: ROSA_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {d.imagen ? (
                <img src={d.imagen.split(",")[0]} alt={d.nombre} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => e.target.style.display = "none"} />
              ) : (
                <span style={{ fontSize: 40 }}>🧸</span>
              )}
            </div>
            <div style={{ padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.nombre}</p>
              <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: ROSA }}>{fmt(d.precio)}</p>
              <button onClick={() => quitarDeseo(d.id_producto)}
                style={{ width: "100%", padding: "7px", background: "#fee2e2", border: "none", borderRadius: 8, color: "#dc2626", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
                💔 Quitar de favoritos
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

            {/* ─── SEGURIDAD ─── */}
            {activeTab === "security" && (
              <div>
                {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderLeft: "4px solid #ef4444", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>❌ {error}</div>}
                {success && <div style={{ background: "#ecfdf5", color: "#059669", borderLeft: "4px solid #10b981", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>✅ {success}</div>}
                <form onSubmit={handleChangePassword}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>🔒 Cambiar Contraseña</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
                    {[
                      { label: "Contraseña actual", name: "currentPassword", val: passwordData.currentPassword, showKey: "current" },
                      { label: "Nueva contraseña", name: "newPassword", val: passwordData.newPassword, showKey: "new" },
                      { label: "Confirmar contraseña", name: "confirmPassword", val: passwordData.confirmPassword, showKey: "confirm" },
                    ].map((f, i) => (
                      <div key={i}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                        <div style={{ position: "relative" }}>
                          <input type={showPasswords[f.showKey] ? "text" : "password"} value={f.val} name={f.name}
                            onChange={e => setPasswordData({ ...passwordData, [f.name]: e.target.value })}
                            style={{ width: "100%", padding: "9px 40px 9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" }} />
                          <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, [f.showKey]: !prev[f.showKey] }))}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af" }}>
                            {showPasswords[f.showKey] ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {passwordData.newPassword && (
                      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
                        {[
                          { ok: passwordData.newPassword.length >= 8, label: "Mínimo 8 caracteres" },
                          { ok: /[A-Z]/.test(passwordData.newPassword), label: "Una mayúscula" },
                          { ok: /\d/.test(passwordData.newPassword), label: "Un número" },
                        ].map((r, i) => (
                          <div key={i} style={{ color: r.ok ? "#10b981" : "#9ca3af", marginBottom: 3 }}>{r.ok ? "✓" : "○"} {r.label}</div>
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

      {/* ─── MODAL ABONAR ─── */}
      {modalAbono && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "28px", maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#7e3ff2" }}>💰 Registrar Abono</h2>
              <button onClick={() => setModalAbono(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            <div style={{ background: "#f3e8ff", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#7e3ff2" }}>{modalAbono.producto_nombre}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Saldo pendiente: <strong style={{ color: "#ea580c" }}>{fmt(modalAbono.saldo_pendiente)}</strong></div>
            </div>

            <form onSubmit={handleAbonar}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Monto del abono *</label>
                <input type="number" value={montoAbono} onChange={e => setMontoAbono(e.target.value)}
                  min="0.01" max={modalAbono.saldo_pendiente} step="0.01" required
                  placeholder={`Máximo ${fmt(modalAbono.saldo_pendiente)}`}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Notas (opcional)</label>
                <input type="text" value={notasAbono} onChange={e => setNotasAbono(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setModalAbono(null)} style={{ flex: 1, padding: "10px", background: "#f3f4f6", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
                <button type="submit" disabled={guardandoAbono} style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #7e3ff2, #db2777)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  {guardandoAbono ? "Registrando..." : "💰 Confirmar Abono"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}