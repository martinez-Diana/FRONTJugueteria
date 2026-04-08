import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://back-jugueteria.vercel.app";

const CATEGORIAS = [
  "educativo", "didactico", "deportivo", "artistico", "musical",
  "peluches", "vehiculos", "juegos_mesa", "figuras_accion",
  "munecas", "construccion", "coleccionable", "electronico", "otro"
];

const getToken = () => localStorage.getItem("token");

const GestionOfertas = () => {
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "producto",
    id_producto: "",
    categoria: "",
    descuento_porcentaje: "",
    fecha_inicio: "",
    fecha_fin: "",
    activa: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resOfertas, resProductos] = await Promise.all([
        fetch(`${API_URL}/api/ofertas/admin/todas`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        fetch(`${API_URL}/api/productos`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
      ]);
      const dataOfertas = await resOfertas.json();
      const dataProductos = await resProductos.json();
      setOfertas(Array.isArray(dataOfertas) ? dataOfertas : []);
      setProductos(Array.isArray(dataProductos) ? dataProductos : []);
    } catch{
      mostrarToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const abrirModal = (oferta = null) => {
    if (oferta) {
      setOfertaEditar(oferta);
      setForm({
        nombre: oferta.nombre || "",
        descripcion: oferta.descripcion || "",
        tipo: oferta.tipo || "producto",
        id_producto: oferta.id_producto || "",
        categoria: oferta.categoria || "",
        descuento_porcentaje: oferta.descuento_porcentaje || "",
        fecha_inicio: oferta.fecha_inicio?.slice(0, 16) || "",
        fecha_fin: oferta.fecha_fin?.slice(0, 16) || "",
        activa: oferta.activa ?? true
      });
    } else {
      setOfertaEditar(null);
      setForm({
        nombre: "", descripcion: "", tipo: "producto",
        id_producto: "", categoria: "",
        descuento_porcentaje: "", fecha_inicio: "",
        fecha_fin: "", activa: true
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setOfertaEditar(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const guardar = async () => {
    if (!form.nombre || !form.descuento_porcentaje || !form.fecha_inicio || !form.fecha_fin) {
      mostrarToast("Completa todos los campos obligatorios", "error");
      return;
    }
    try {
      setGuardando(true);
      const url = ofertaEditar
        ? `${API_URL}/api/ofertas/${ofertaEditar.id_oferta}`
        : `${API_URL}/api/ofertas`;
      const method = ofertaEditar ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      mostrarToast(ofertaEditar ? "Oferta actualizada ✅" : "Oferta creada ✅");
      cerrarModal();
      cargarDatos();
    } catch (e) {
      mostrarToast(e.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const toggleActiva = async (oferta) => {
    try {
      await fetch(`${API_URL}/api/ofertas/${oferta.id_oferta}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      mostrarToast(`Oferta ${oferta.activa ? "desactivada" : "activada"}`);
      cargarDatos();
    } catch{
      mostrarToast("Error al cambiar estado", "error");
    }
  };

  const eliminar = async (oferta) => {
    if (!window.confirm(`¿Eliminar la oferta "${oferta.nombre}"?`)) return;
    try {
      await fetch(`${API_URL}/api/ofertas/${oferta.id_oferta}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      mostrarToast("Oferta eliminada");
      cargarDatos();
    } catch {
      mostrarToast("Error al eliminar", "error");
    }
  };

  const getBadgeEstado = (estado) => {
    const estilos = {
      vigente:   { bg: "#d1fae5", color: "#065f46", label: "✅ Vigente" },
      expirada:  { bg: "#fee2e2", color: "#991b1b", label: "⛔ Expirada" },
      inactiva:  { bg: "#f3f4f6", color: "#6b7280", label: "⏸ Inactiva" },
      programada:{ bg: "#dbeafe", color: "#1e40af", label: "🕐 Programada" }
    };
    const e = estilos[estado] || estilos.inactiva;
    return (
      <span style={{
        background: e.bg, color: e.color,
        padding: "4px 12px", borderRadius: "50px",
        fontSize: "12px", fontWeight: "600"
      }}>
        {e.label}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: toast.tipo === "error" ? "#ef4444" : "#10b981",
          color: "white", padding: "14px 24px", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          fontSize: "14px", fontWeight: "600",
          animation: "slideIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/admin")}
            style={{
              background: "none", border: "2px solid #e5e7eb",
              borderRadius: "10px", padding: "8px 16px",
              cursor: "pointer", fontSize: "14px", color: "#374151",
              fontWeight: "600", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#ec4899"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1f2937" }}>
              🏷️ Gestión de Ofertas
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              {ofertas.length} ofertas registradas
            </p>
          </div>
        </div>

        <button
          onClick={() => abrirModal()}
          style={{
            background: "linear-gradient(135deg, #ec4899, #db2777)",
            color: "white", border: "none",
            padding: "12px 28px", borderRadius: "12px",
            fontSize: "14px", fontWeight: "700",
            cursor: "pointer", boxShadow: "0 4px 12px rgba(236,72,153,0.3)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          + Nueva Oferta
        </button>
      </header>

      {/* Contenido */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={{
              width: "48px", height: "48px",
              border: "4px solid #f3f4f6", borderTop: "4px solid #ec4899",
              borderRadius: "50%", animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{ color: "#6b7280" }}>Cargando ofertas...</p>
          </div>
        ) : ofertas.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px",
            background: "white", borderRadius: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏷️</div>
            <h3 style={{ color: "#1f2937", fontSize: "20px", fontWeight: "700" }}>
              No hay ofertas todavía
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Crea tu primera oferta para que aparezca en la tienda
            </p>
            <button
              onClick={() => abrirModal()}
              style={{
                background: "linear-gradient(135deg, #ec4899, #db2777)",
                color: "white", border: "none", padding: "12px 32px",
                borderRadius: "12px", fontSize: "15px", fontWeight: "700",
                cursor: "pointer"
              }}
            >
              + Crear Primera Oferta
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {ofertas.map(oferta => (
              <div key={oferta.id_oferta} style={{
                background: "white", borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: "24px",
                transition: "all 0.3s"
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
              >
                {/* Icono */}
                <div style={{
                  width: "56px", height: "56px",
                  background: "linear-gradient(135deg, #fce7f3, #ede9fe)",
                  borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px"
                }}>
                  {oferta.tipo === "categoria" ? "📂" : "🧸"}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                      {oferta.nombre}
                    </h3>
                    {getBadgeEstado(oferta.estado_actual)}
                    <span style={{
                      background: "linear-gradient(135deg, #ec4899, #db2777)",
                      color: "white", padding: "3px 10px",
                      borderRadius: "50px", fontSize: "12px", fontWeight: "700"
                    }}>
                      {oferta.descuento_porcentaje}% OFF
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    {oferta.tipo === "categoria"
                      ? `📂 Categoría: ${oferta.categoria}`
                      : `🧸 Producto: ${oferta.producto_nombre || "—"}`}
                    {" · "}
                    ⏰ {new Date(oferta.fecha_inicio).toLocaleDateString("es-MX")} →{" "}
                    {new Date(oferta.fecha_fin).toLocaleDateString("es-MX")}
                  </p>
                </div>

                {/* Toggle activa */}
                <div
                  onClick={() => toggleActiva(oferta)}
                  title={oferta.activa ? "Desactivar" : "Activar"}
                  style={{
                    width: "52px", height: "28px",
                    background: oferta.activa
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#e5e7eb",
                    borderRadius: "50px", cursor: "pointer",
                    position: "relative", transition: "all 0.3s"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "3px",
                    left: oferta.activa ? "26px" : "3px",
                    width: "22px", height: "22px",
                    background: "white",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "all 0.3s"
                  }} />
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => abrirModal(oferta)}
                    style={{
                      background: "#dbeafe", color: "#1d4ed8",
                      border: "none", borderRadius: "10px",
                      padding: "8px 16px", cursor: "pointer",
                      fontSize: "13px", fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#bfdbfe"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#dbeafe"}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminar(oferta)}
                    style={{
                      background: "#fee2e2", color: "#dc2626",
                      border: "none", borderRadius: "10px",
                      padding: "8px 16px", cursor: "pointer",
                      fontSize: "13px", fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fecaca"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fee2e2"}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "24px"
        }}
          onClick={cerrarModal}
        >
          <div style={{
            background: "white", borderRadius: "20px",
            padding: "36px", width: "100%", maxWidth: "560px",
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "800", color: "#1f2937" }}>
              {ofertaEditar ? "✏️ Editar Oferta" : "➕ Nueva Oferta"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre de la oferta *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Ej: Descuento de verano en didácticos"
                  style={inputStyle} />
              </div>

              {/* Descripción */}
              <div>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                  placeholder="Describe brevemente la oferta..."
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              {/* Tipo */}
              <div>
                <label style={labelStyle}>Tipo de oferta *</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {["producto", "categoria"].map(t => (
                    <label key={t} style={{
                      flex: 1, padding: "12px",
                      border: `2px solid ${form.tipo === t ? "#ec4899" : "#e5e7eb"}`,
                      borderRadius: "12px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "14px", fontWeight: "600",
                      color: form.tipo === t ? "#ec4899" : "#374151",
                      transition: "all 0.2s"
                    }}>
                      <input type="radio" name="tipo" value={t}
                        checked={form.tipo === t} onChange={handleChange}
                        style={{ accentColor: "#ec4899" }} />
                      {t === "producto" ? "🧸 Producto específico" : "📂 Categoría completa"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Producto o categoría según tipo */}
              {form.tipo === "producto" ? (
                <div>
                  <label style={labelStyle}>Producto *</label>
                  <select name="id_producto" value={form.id_producto} onChange={handleChange} style={inputStyle}>
                    <option value="">— Selecciona un producto —</option>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle}>
                    <option value="">— Selecciona una categoría —</option>
                    {CATEGORIAS.map(c => (
                      <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descuento */}
              <div>
                <label style={labelStyle}>Descuento (%) *</label>
                <input name="descuento_porcentaje" type="number"
                  min="1" max="100"
                  value={form.descuento_porcentaje} onChange={handleChange}
                  placeholder="Ej: 20"
                  style={inputStyle} />
              </div>

              {/* Fechas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Fecha inicio *</label>
                  <input name="fecha_inicio" type="datetime-local"
                    value={form.fecha_inicio} onChange={handleChange}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha fin *</label>
                  <input name="fecha_fin" type="datetime-local"
                    value={form.fecha_fin} onChange={handleChange}
                    style={inputStyle} />
                </div>
              </div>

              {/* Activa */}
              <label style={{
                display: "flex", alignItems: "center", gap: "10px",
                cursor: "pointer", fontSize: "14px", color: "#374151", fontWeight: "600"
              }}>
                <input type="checkbox" name="activa"
                  checked={form.activa} onChange={handleChange}
                  style={{ accentColor: "#ec4899", width: "18px", height: "18px" }} />
                Activar oferta inmediatamente
              </label>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={cerrarModal} style={{
                flex: 1, padding: "14px",
                background: "white", border: "2px solid #e5e7eb",
                borderRadius: "12px", fontSize: "15px", fontWeight: "600",
                cursor: "pointer", color: "#374151"
              }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando} style={{
                flex: 2, padding: "14px",
                background: guardando ? "#9ca3af" : "linear-gradient(135deg, #ec4899, #db2777)",
                border: "none", borderRadius: "12px",
                fontSize: "15px", fontWeight: "700",
                cursor: guardando ? "not-allowed" : "pointer",
                color: "white",
                boxShadow: guardando ? "none" : "0 4px 12px rgba(236,72,153,0.3)"
              }}>
                {guardando ? "Guardando..." : ofertaEditar ? "Guardar Cambios" : "Crear Oferta"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

const labelStyle = {
  display: "block", marginBottom: "6px",
  fontSize: "13px", fontWeight: "600", color: "#374151"
};

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "2px solid #e5e7eb", borderRadius: "10px",
  fontSize: "14px", outline: "none",
  fontFamily: "'Poppins', sans-serif",
  transition: "border-color 0.2s",
  boxSizing: "border-box"
};

export default GestionOfertas;