import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://back-jugueteria.vercel.app/api";

const formatCurrency = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit", month: "long", year: "numeric",
    timeZone: "America/Mexico_City"
  });

const Apartados = () => {
  const navigate = useNavigate();
  const [apartados, setApartados] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalAbono, setModalAbono] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState("");

  const [nuevoApartado, setNuevoApartado] = useState({
    id_usuario: "", id_producto: "", anticipo: "",
    fecha_limite: "", notas: ""
  });
  const [nuevoAbono, setNuevoAbono] = useState({ monto: "", notas: "" });

  const token = () => localStorage.getItem("token");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [apRes, stRes] = await Promise.all([
        fetch(`${API}/apartados?estado=${filtroEstado}`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/apartados/stats`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      setApartados(await apRes.json());
      setStats(await stRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientesProductos = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        fetch(`${API}/clientes`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/productos`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      setClientes(Array.isArray(cData) ? cData : []);
      setProductos(Array.isArray(pData) ? pData : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { cargarDatos(); }, [filtroEstado]);

  const productoSeleccionado = productos.find(p => p.id_producto == nuevoApartado.id_producto);
  const precioProducto = productoSeleccionado ? parseFloat(productoSeleccionado.precio) : 0;
  const minimoAnticipo = precioProducto * 0.20;

  const crearApartado = async (e) => {
    e.preventDefault();
    if (parseFloat(nuevoApartado.anticipo) < minimoAnticipo) {
      alert(`El anticipo mínimo es el 20%: ${formatCurrency(minimoAnticipo)}`);
      return;
    }
    try {
      setGuardando(true);
      const res = await fetch(`${API}/apartados`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...nuevoApartado, precio_total: precioProducto })
      });
      const data = await res.json();
      if (data.success) {
        setModalNuevo(false);
        setNuevoApartado({ id_usuario: "", id_producto: "", anticipo: "", fecha_limite: "", notas: "" });
        setExito("¡Apartado creado exitosamente!");
        setTimeout(() => setExito(""), 4000);
        await cargarDatos();
      } else {
        alert(data.error || "Error al crear apartado");
      }
    } catch {
      alert("Error al conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const registrarAbono = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const res = await fetch(`${API}/apartados/${modalAbono.id_apartado}/abonar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(nuevoAbono)
      });
      const data = await res.json();
      if (data.success) {
        setModalAbono(null);
        setNuevoAbono({ monto: "", notas: "" });
        setExito("¡Abono registrado exitosamente!");
        setTimeout(() => setExito(""), 4000);
        await cargarDatos();
      } else {
        alert(data.error || "Error al registrar abono");
      }
    } catch{
      alert("Error al conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarApartado = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar este apartado?")) return;
    try {
      await fetch(`${API}/apartados/${id}/cancelar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}` }
      });
      await cargarDatos();
    } catch{
      alert("Error al cancelar");
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await fetch(`${API}/apartados/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      setModalDetalle(await res.json());
    } catch{
      alert("Error al cargar detalle");
    }
  };

  const exportarCSV = async () => {
  try {
    const res = await fetch(`${API}/exportar/apartados`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apartados_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch{
    alert("Error al exportar");
  }
};

  const getEstadoStyle = (estado) => ({
    activo:    { bg: "#d1fae5", color: "#065f46", label: "✅ Activo" },
    liquidado: { bg: "#dbeafe", color: "#1d4ed8", label: "💳 Liquidado" },
    cancelado: { bg: "#fee2e2", color: "#991b1b", label: "❌ Cancelado" },
    vencido:   { bg: "#fef3c7", color: "#92400e", label: "⚠️ Vencido" },
  }[estado] || { bg: "#f3f4f6", color: "#374151", label: estado });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 60, height: 60, border: "4px solid #f3f4f6", borderTop: "4px solid #ec4899", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
        <p style={{ color: "#374151", fontWeight: 600 }}>Cargando apartados...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>

      {/* Alerta éxito */}
      {exito && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "white", border: "3px solid #10b981", borderRadius: 16, padding: "32px 48px", textAlign: "center", zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", margin: 0 }}>{exito}</p>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(to right, #7e3ff2, #db2777)", color: "white", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "3rem", height: "3rem", background: "#facc15", color: "#7e3ff2", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>JM</div>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Juguetería Martínez</h1>
            <p style={{ fontSize: "0.85rem", color: "#f5d0fe", margin: 0 }}>Panel Administrativo</p>
          </div>
        </div>
        <button onClick={() => navigate("/admin")} style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>
          ← Volver al Dashboard
        </button>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <aside style={{ width: "16rem", background: "white", minHeight: "100vh", boxShadow: "2px 0 10px rgba(0,0,0,0.05)", padding: "1rem" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { to: "/admin", label: "📊 Dashboard" },
              { to: "/admin/productos", label: "📦 Productos" },
              { to: "/admin/ventas", label: "💰 Ventas" },
              { to: "/admin/inventario", label: "📋 Inventario" },
              { to: "/admin/clientes", label: "👥 Clientes" },
              { to: "/admin/apartados", label: "🏷️ Apartados", active: true },
              { to: "/admin/reportes", label: "📈 Reportes" },
              { to: "/admin/respaldos", label: "🗄️ Respaldos" },
            ].map((item) => (
              <button key={item.to} onClick={() => navigate(item.to)}
                style={{ textDecoration: "none", cursor: "pointer", color: item.active ? "#7e3ff2" : "#555", padding: "0.75rem 1rem", borderRadius: "0.75rem", fontWeight: item.active ? 600 : 500, background: item.active ? "#f3e8ff" : "transparent", border: "none", textAlign: "left", fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem" }}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* Título */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>🏷️ Gestión de Apartados</h2>
              <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>Control de reservas y pagos</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
  <button onClick={exportarCSV}
    style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
    ⬇️ Exportar CSV
  </button>
  <button onClick={() => { setModalNuevo(true); cargarClientesProductos(); }}
    style={{ background: "linear-gradient(135deg, #7e3ff2, #db2777)", border: "none", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
    + Nuevo Apartado
  </button>
</div>
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Activos", value: stats.total_activos, icon: "⏰", color: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
                { label: "Total en Apartados", value: formatCurrency(stats.total_en_apartados), icon: "💰", color: "linear-gradient(135deg,#ec4899,#db2777)" },
                { label: "Anticipos Recibidos", value: formatCurrency(stats.total_anticipos), icon: "💵", color: "linear-gradient(135deg,#10b981,#059669)" },
                { label: "Por Cobrar", value: formatCurrency(stats.total_por_cobrar), icon: "💸", color: "linear-gradient(135deg,#06b6d4,#0891b2)" },
                { label: "Liquidados", value: stats.total_liquidados, icon: "✅", color: "linear-gradient(135deg,#f59e0b,#d97706)" },
                { label: "Vencidos", value: stats.total_vencidos, icon: "⚠️", color: "linear-gradient(135deg,#ef4444,#dc2626)" },
              ].map((c, i) => (
                <div key={i} style={{ background: c.color, color: "white", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{c.icon}</div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>{c.value}</h3>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", opacity: 0.9 }}>{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filtros */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {["activo", "liquidado", "cancelado", "vencido"].map((e) => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                style={{ padding: "8px 20px", borderRadius: 20, border: "2px solid", borderColor: filtroEstado === e ? "#7e3ff2" : "#e5e7eb", background: filtroEstado === e ? "#f3e8ff" : "white", color: filtroEstado === e ? "#7e3ff2" : "#374151", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: "'Poppins', sans-serif" }}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>

          {/* Lista de apartados */}
          {apartados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏷️</div>
              <p style={{ color: "#6b7280" }}>No hay apartados {filtroEstado}s</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {apartados.map((a) => {
                const progreso = Math.round((a.total_abonado / a.precio_total) * 100);
                const estilo = getEstadoStyle(a.estado);
                const proximoVencer = a.estado === "activo" && new Date(a.fecha_limite) - new Date() < 3 * 24 * 60 * 60 * 1000;


                

                return (
                  <div key={a.id_apartado} style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: proximoVencer ? "2px solid #f59e0b" : "2px solid #f3f4f6", backgroundColor: proximoVencer ? "#fffbeb" : "white" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {a.producto_imagen ? (
                          <img src={a.producto_imagen.split(",")[0]} alt={a.producto_nombre}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }}
                            onError={(e) => e.target.style.display = "none"} />
                        ) : (
                          <div style={{ width: 60, height: 60, background: "#f3e8ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🏷️</div>
                        )}
                        <div>
                          <h3 style={{ margin: 0, fontWeight: 700, color: "#1f2937" }}>{a.producto_nombre}</h3>
                          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
                            👤 {a.first_name} {a.last_name}
                          </p>
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "6px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, background: "#f3e8ff", color: "#7e3ff2" }}>
                              #{a.id_apartado}
                            </span>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, background: estilo.bg, color: estilo.color }}>
                              {estilo.label}
                            </span>
                            {proximoVencer && (
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, background: "#fef3c7", color: "#92400e" }}>
                                ⚠️ Próximo a vencer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#7e3ff2", margin: 0 }}>{formatCurrency(a.precio_total)}</p>
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>Precio Total</p>
                      </div>
                    </div>

                    {/* Montos */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                      {[
                        { label: "Anticipo (20%)", value: formatCurrency(a.anticipo), bg: "#fdf2f8", color: "#db2777" },
                        { label: "Total Abonado", value: formatCurrency(a.total_abonado), bg: "#ecfeff", color: "#0891b2" },
                        { label: "Saldo Pendiente", value: formatCurrency(a.saldo_pendiente), bg: "#fff7ed", color: "#ea580c" },
                      ].map((m, i) => (
                        <div key={i} style={{ background: m.bg, borderRadius: 10, padding: "0.75rem" }}>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>{m.label}</p>
                          <p style={{ margin: "4px 0 0", fontWeight: 700, color: m.color, fontSize: "1.1rem" }}>{m.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progreso */}
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.85rem" }}>
                        <span style={{ color: "#6b7280" }}>Progreso de pago</span>
                        <span style={{ color: "#7e3ff2", fontWeight: 700 }}>{progreso}%</span>
                      </div>
                      <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${progreso}%`, height: "100%", background: "linear-gradient(to right, #7e3ff2, #db2777)", borderRadius: 999, transition: "width 0.3s" }}></div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: proximoVencer ? "#d97706" : "#6b7280", fontWeight: proximoVencer ? 600 : 400 }}>
                        📅 Vence: {formatDate(a.fecha_limite)}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {a.estado === "activo" && (
                          <>
                            <button onClick={() => { setModalAbono(a); setNuevoAbono({ monto: "", notas: "" }); }}
                              style={{ background: "linear-gradient(135deg, #7e3ff2, #db2777)", border: "none", color: "white", padding: "6px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                              💰 Registrar Abono
                            </button>
                            <button onClick={() => cancelarApartado(a.id_apartado)}
                              style={{ background: "#fee2e2", border: "none", color: "#dc2626", padding: "6px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                              ❌ Cancelar
                            </button>
                          </>
                        )}
                        <button onClick={() => verDetalle(a.id_apartado)}
                          style={{ background: "#f3f4f6", border: "none", color: "#374151", padding: "6px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                          👁️ Ver Detalles
                        </button>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        
      </div>

      

      {/* Modal Nuevo Apartado */}
      {modalNuevo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 550, width: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, margin: 0, color: "#7e3ff2" }}>🏷️ Nuevo Apartado</h2>
              <button onClick={() => setModalNuevo(false)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={crearApartado}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Cliente *</label>
                  <select value={nuevoApartado.id_usuario} onChange={(e) => setNuevoApartado({ ...nuevoApartado, id_usuario: e.target.value })} required
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Producto *</label>
                  <select value={nuevoApartado.id_producto} onChange={(e) => setNuevoApartado({ ...nuevoApartado, id_producto: e.target.value })} required
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }}>
                    <option value="">Seleccionar producto...</option>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre} — {formatCurrency(p.precio)}</option>
                    ))}
                  </select>
                </div>

                {precioProducto > 0 && (
                  <div style={{ background: "#f3e8ff", borderRadius: 8, padding: "0.75rem", fontSize: "0.9rem" }}>
                    <p style={{ margin: 0, color: "#7e3ff2" }}>💰 Precio del producto: <strong>{formatCurrency(precioProducto)}</strong></p>
                    <p style={{ margin: "4px 0 0", color: "#7e3ff2" }}>📌 Anticipo mínimo (20%): <strong>{formatCurrency(minimoAnticipo)}</strong></p>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Anticipo *</label>
                  <input type="number" value={nuevoApartado.anticipo} onChange={(e) => setNuevoApartado({ ...nuevoApartado, anticipo: e.target.value })} required min={minimoAnticipo} step="0.01"
                    placeholder={`Mínimo ${formatCurrency(minimoAnticipo)}`}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }} />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Fecha límite *</label>
                  <input type="date" value={nuevoApartado.fecha_limite} onChange={(e) => setNuevoApartado({ ...nuevoApartado, fecha_limite: e.target.value })} required
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }} />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Notas</label>
                  <textarea value={nuevoApartado.notas} onChange={(e) => setNuevoApartado({ ...nuevoApartado, notas: e.target.value })} rows={3}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif", resize: "vertical" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" onClick={() => setModalNuevo(false)}
                  style={{ flex: 1, padding: "10px", background: "white", border: "2px solid #e5e7eb", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #7e3ff2, #db2777)", border: "none", borderRadius: 10, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  {guardando ? "Creando..." : "✅ Crear Apartado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Abono */}
      {modalAbono && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 450, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, margin: 0, color: "#7e3ff2" }}>💰 Registrar Abono</h2>
              <button onClick={() => setModalAbono(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ background: "#f3e8ff", borderRadius: 8, padding: "0.75rem", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#7e3ff2" }}>{modalAbono.producto_nombre}</p>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Saldo pendiente: <strong>{formatCurrency(modalAbono.saldo_pendiente)}</strong></p>
            </div>

            <form onSubmit={registrarAbono}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Monto del abono *</label>
                  <input type="number" value={nuevoAbono.monto} onChange={(e) => setNuevoAbono({ ...nuevoAbono, monto: e.target.value })} required
                    min="0.01" max={modalAbono.saldo_pendiente} step="0.01"
                    placeholder={`Máximo ${formatCurrency(modalAbono.saldo_pendiente)}`}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Notas</label>
                  <input type="text" value={nuevoAbono.notas} onChange={(e) => setNuevoAbono({ ...nuevoAbono, notas: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontFamily: "'Poppins', sans-serif" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" onClick={() => setModalAbono(null)}
                  style={{ flex: 1, padding: "10px", background: "white", border: "2px solid #e5e7eb", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #7e3ff2, #db2777)", border: "none", borderRadius: 10, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  {guardando ? "Guardando..." : "💰 Registrar Abono"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {modalDetalle && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 550, width: "90%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, margin: 0, color: "#7e3ff2" }}>🏷️ Apartado #{modalDetalle.id_apartado}</h2>
              <button onClick={() => setModalDetalle(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Producto", value: modalDetalle.producto_nombre },
                { label: "Cliente", value: `${modalDetalle.first_name} ${modalDetalle.last_name}` },
                { label: "Precio Total", value: formatCurrency(modalDetalle.precio_total) },
                { label: "Saldo Pendiente", value: formatCurrency(modalDetalle.saldo_pendiente) },
                { label: "Fecha Apartado", value: formatDate(modalDetalle.fecha_apartado) },
                { label: "Fecha Límite", value: formatDate(modalDetalle.fecha_limite) },
              ].map((item, i) => (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 4px" }}>{item.label}</p>
                  <p style={{ fontWeight: 600, margin: 0, color: "#374151" }}>{item.value}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#374151" }}>📋 Historial de Abonos</h3>
            {(modalDetalle.abonos || []).length === 0 ? (
              <p style={{ color: "#6b7280" }}>Sin abonos registrados</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Fecha", "Monto", "Notas"].map(h => (
                      <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", fontWeight: 700, color: "#6b7280", fontSize: "0.82rem" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalDetalle.abonos.map((ab, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.6rem 0.75rem" }}>{formatDate(ab.fecha_abono)}</td>
                      <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "#7e3ff2" }}>{formatCurrency(ab.monto)}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#6b7280" }}>{ab.notas || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartados;