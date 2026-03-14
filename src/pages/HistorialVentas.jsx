import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ventasService from "../services/ventasService";

const API_URL = import.meta.env.VITE_API_URL || "https://back-jugueteria.vercel.app/api";

function HistorialVentas() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    fecha_fin: new Date().toISOString().split("T")[0],
    estado: "",
    metodo_pago: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [exportExito, setExportExito] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasData, statsData] = await Promise.all([
        ventasService.getAll(),
        ventasService.getStats(),
      ]);
      setVentas(ventasData);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    setLoadingDetalle(true);
    setModalVisible(true);
    try {
      const data = await ventasService.getById(id);
      setVentaDetalle(data);
    } catch {
      alert("Error al cargar el detalle de la venta");
      setModalVisible(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const imprimirTicket = async (venta) => {
    try {
      const data = await ventasService.getById(venta.id_venta);
      const ventana = window.open("", "_blank", "width=400,height=600");
      ventana.document.write(`
        <html><head><title>Ticket ${data.folio}</title>
        <style>
          body { font-family: monospace; font-size: 13px; margin: 20px; }
          h2 { text-align: center; font-size: 16px; }
          .linea { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .center { text-align: center; }
          .total { font-size: 15px; font-weight: bold; }
        </style></head><body>
        <h2>🧸 Juguetería Martínez</h2>
        <div class="center">Ticket de Venta</div>
        <div class="linea"></div>
        <div class="row"><span>Folio:</span><span>#${data.folio}</span></div>
        <div class="row"><span>Fecha:</span><span>${formatDate(data.fecha_venta)}</span></div>
        <div class="row"><span>Cliente:</span><span>${data.first_name ? data.first_name + " " + data.last_name : "Cliente General"}</span></div>
        <div class="row"><span>Método de pago:</span><span>${getMetodoPagoNombre(data.metodo_pago)}</span></div>
        <div class="linea"></div>
        <strong>Productos:</strong><br/>
        ${(data.productos || []).map(p => `
          <div class="row"><span>${p.nombre_producto} x${p.cantidad}</span><span>$${parseFloat(p.subtotal).toFixed(2)}</span></div>
        `).join("")}
        <div class="linea"></div>
        ${data.descuento > 0 ? `<div class="row"><span>Descuento:</span><span>-$${parseFloat(data.descuento).toFixed(2)}</span></div>` : ""}
        <div class="row total"><span>TOTAL:</span><span>$${parseFloat(data.total).toFixed(2)}</span></div>
        <div class="linea"></div>
        <div class="center">¡Gracias por su compra!</div>
        </body></html>
      `);
      ventana.document.close();
      ventana.print();
    } catch {
      alert("Error al generar el ticket");
    }
  };

  const exportarVentas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_inicio) params.append("desde", filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append("hasta", filtros.fecha_fin);
      const response = await fetch(`${API_URL}/exportar/ventas?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExportExito(true);
      setTimeout(() => setExportExito(false), 4000);
    } catch {
      alert("Error al exportar ventas");
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num || 0);

  const formatDate = (fecha) =>
    new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

  const getMetodoPagoNombre = (metodo) =>
    ({ efectivo: "Efectivo", tarjeta: "Tarjeta", transferencia: "Transferencia", otro: "Otro" }[metodo] || metodo);

  const getMetodoPagoIcon = (metodo) =>
    ({ efectivo: "💵", tarjeta: "💳", transferencia: "🏦", otro: "💰" }[metodo] || "💰");

  const getEstadoStyle = (estado) => {
    const estilos = {
      completada: { background: "#d1fae5", color: "#065f46" },
      pendiente: { background: "#fef3c7", color: "#92400e" },
      cancelada: { background: "#fee2e2", color: "#991b1b" },
    };
    return estilos[estado] || estilos.pendiente;
  };

  const getEstadoNombre = (estado) =>
    ({ completada: "Completada", pendiente: "Pendiente", cancelada: "Cancelada" }[estado] || estado);

  const ventasFiltradas = ventas.filter((v) => {
    const q = busqueda.toLowerCase();
    return (
      v.folio?.toLowerCase().includes(q) ||
      v.first_name?.toLowerCase().includes(q) ||
      v.last_name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, border: "4px solid #f3f4f6", borderTop: "4px solid #ec4899", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: "#374151", fontWeight: 600 }}>Cargando ventas...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>

      {/* Alerta exportación */}
      {exportExito && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "white", border: "3px solid #10b981", borderRadius: 16, padding: "32px 48px", textAlign: "center", zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", margin: 0 }}>¡Exportación exitosa!</p>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>El archivo CSV fue descargado correctamente</p>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(to right, #db2777, #be185d)", color: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "3rem", height: "3rem", background: "#facc15", color: "#be185d", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "1rem" }}>JM</div>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Juguetería Martínez</h1>
              <p style={{ fontSize: "0.85rem", color: "#ffddee", margin: 0 }}>Panel Administrativo</p>
            </div>
          </div>
          <button onClick={() => navigate("/admin")} style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <aside style={{ width: "16rem", background: "white", minHeight: "100vh", boxShadow: "2px 0 10px rgba(0,0,0,0.05)", padding: "1rem" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { to: "/admin", label: "📊 Dashboard" },
              { to: "/admin/productos", label: "📦 Productos" },
              { to: "/admin/ventas", label: "💰 Ventas", active: true },
              { to: "/admin/inventario", label: "📋 Inventario" },
              { to: "/admin/clientes", label: "👥 Clientes" },
              { to: "/admin/reportes", label: "📈 Reportes" },
              { to: "/admin/respaldos", label: "🗄️ Respaldos" },
            ].map((item) => (
              <a key={item.to} onClick={() => navigate(item.to)} style={{ textDecoration: "none", cursor: "pointer", color: item.active ? "#db2777" : "#555", padding: "0.75rem 1rem", borderRadius: "0.75rem", fontWeight: item.active ? 600 : 500, background: item.active ? "#fce7f3" : "transparent", transition: "all 0.3s" }}
                onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = "#f3f4f6"; }}
                onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = "transparent"; }}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* Título */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>💰 Historial de Ventas</h2>
              <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>{ventas.length} ventas registradas en total</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={exportarVentas} style={{ background: "white", border: "2px solid #db2777", color: "#db2777", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                📊 Exportar CSV
              </button>
              <button onClick={() => navigate("/admin/ventas/nueva")} style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", border: "none", color: "white", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                + Nueva Venta
              </button>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Ingresos Totales", value: formatCurrency(stats.resumen.ventas_totales), icon: "💰", color: "linear-gradient(135deg, #ec4899, #db2777)" },
                { label: "Total de Ventas", value: stats.resumen.total_ventas, icon: "🛒", color: "linear-gradient(135deg, #06b6d4, #0891b2)" },
                { label: "Ticket Promedio", value: formatCurrency(stats.resumen.ticket_promedio), icon: "📈", color: "linear-gradient(135deg, #f59e0b, #d97706)" },
                { label: "Completadas", value: stats.resumen.ventas_completadas, icon: "✅", color: "linear-gradient(135deg, #10b981, #059669)" },
              ].map((card, i) => (
                <div key={i} style={{ background: card.color, color: "white", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{card.icon}</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>{card.value}</h3>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", opacity: 0.9 }}>{card.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filtros */}
          <div style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "1.5rem" }}>
            <p style={{ fontWeight: 600, margin: "0 0 1rem", color: "#374151" }}>🔍 Filtros</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              {[
                { label: "Fecha Inicio", type: "date", key: "fecha_inicio" },
                { label: "Fecha Fin", type: "date", key: "fecha_fin" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={filtros[f.key]} onChange={(e) => setFiltros({ ...filtros, [f.key]: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontSize: "0.9rem" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Estado</label>
                <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontSize: "0.9rem" }}>
                  <option value="">Todos</option>
                  <option value="completada">Completada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "#6b7280", display: "block", marginBottom: 4 }}>Método de Pago</label>
                <select value={filtros.metodo_pago} onChange={(e) => setFiltros({ ...filtros, metodo_pago: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "2px solid #e5e7eb", fontSize: "0.9rem" }}>
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div style={{ background: "white", borderRadius: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>📋 Registro de Ventas</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f9fafb", borderRadius: 8, padding: "0.5rem 0.75rem" }}>
                <span>🔍</span>
                <input type="text" placeholder="Buscar por folio o cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.9rem", width: 220 }} />
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Folio", "Fecha", "Cliente", "Productos", "Total", "Método de Pago", "Estado", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", color: "#374151", fontWeight: 700, fontSize: "0.85rem", borderBottom: "2px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
                      <p>No se encontraron ventas</p>
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id_venta} style={{ borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fef3f7"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                      <td style={{ padding: "1rem", color: "#db2777", fontWeight: 700 }}>#{venta.folio}</td>
                      <td style={{ padding: "1rem", color: "#374151" }}>{formatDate(venta.fecha_venta)}</td>
                      <td style={{ padding: "1rem", color: "#374151" }}>
                        {venta.first_name && venta.last_name ? `${venta.first_name} ${venta.last_name}` : "Cliente General"}
                      </td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>{venta.total_productos} producto(s)</td>
                      <td style={{ padding: "1rem", fontWeight: 700, color: "#374151" }}>{formatCurrency(venta.total)}</td>
                      <td style={{ padding: "1rem", color: "#374151" }}>{getMetodoPagoIcon(venta.metodo_pago)} {getMetodoPagoNombre(venta.metodo_pago)}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, ...getEstadoStyle(venta.estado) }}>
                          {getEstadoNombre(venta.estado)}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => verDetalle(venta.id_venta)}
                            style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            👁️ Ver
                          </button>
                          <button onClick={() => imprimirTicket(venta)}
                            style={{ background: "#f3e8ff", color: "#7c3aed", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            🖨️ Ticket
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal Ver Detalle */}
      {modalVisible && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 600, width: "90%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {loadingDetalle ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>Cargando detalle...</p>
              </div>
            ) : ventaDetalle ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ fontWeight: 700, margin: 0, color: "#db2777" }}>#{ventaDetalle.folio}</h2>
                  <button onClick={() => { setModalVisible(false); setVentaDetalle(null); }}
                    style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>

                {/* Info general */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[
                    { label: "Fecha", value: formatDate(ventaDetalle.fecha_venta) },
                    { label: "Cliente", value: ventaDetalle.first_name ? `${ventaDetalle.first_name} ${ventaDetalle.last_name}` : "Cliente General" },
                    { label: "Método de Pago", value: `${getMetodoPagoIcon(ventaDetalle.metodo_pago)} ${getMetodoPagoNombre(ventaDetalle.metodo_pago)}` },
                    { label: "Estado", value: getEstadoNombre(ventaDetalle.estado) },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "0.75rem" }}>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 4px" }}>{item.label}</p>
                      <p style={{ fontWeight: 600, margin: 0, color: "#374151" }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Productos */}
                <h3 style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#374151" }}>Productos</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Producto", "Cant.", "Precio", "Subtotal"].map(h => (
                        <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", fontSize: "0.82rem", color: "#6b7280", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(ventaDetalle.productos || []).map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.88rem" }}>{p.nombre_producto}</td>
                        <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.88rem" }}>{p.cantidad}</td>
                        <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.88rem" }}>{formatCurrency(p.precio_unitario)}</td>
                        <td style={{ padding: "0.6rem 0.75rem", fontSize: "0.88rem", fontWeight: 600 }}>{formatCurrency(p.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totales */}
                <div style={{ background: "#fce7f3", borderRadius: 8, padding: "1rem" }}>
                  {ventaDetalle.descuento > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#6b7280" }}>
                      <span>Descuento:</span><span>-{formatCurrency(ventaDetalle.descuento)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", color: "#db2777" }}>
                    <span>Total:</span><span>{formatCurrency(ventaDetalle.total)}</span>
                  </div>
                </div>

                <button onClick={() => imprimirTicket(ventaDetalle)}
                  style={{ marginTop: "1rem", width: "100%", background: "linear-gradient(135deg, #ec4899, #db2777)", border: "none", color: "white", padding: "12px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
                  🖨️ Imprimir Ticket
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;