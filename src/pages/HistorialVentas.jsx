import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ventasService from "../services/ventasService";
import styles from "./HistorialVentas.module.css";

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

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async (filtrosActuales = filtros) => {
  try {
    setLoading(true);
    const params = {};
    if (filtrosActuales.fecha_inicio) params.fecha_inicio = filtrosActuales.fecha_inicio;
    if (filtrosActuales.fecha_fin) params.fecha_fin = filtrosActuales.fecha_fin;
    if (filtrosActuales.estado) params.estado = filtrosActuales.estado;
    if (filtrosActuales.metodo_pago) params.metodo_pago = filtrosActuales.metodo_pago;

    const [ventasData, statsData] = await Promise.all([
      ventasService.getAll(params),
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
  new Date(fecha).toLocaleString("es-MX", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: true,
    timeZone: "America/Mexico_City",
  });

  const getMetodoPagoNombre = (metodo) =>
    ({ efectivo: "Efectivo", tarjeta: "Tarjeta", transferencia: "Transferencia", otro: "Otro" }[metodo] || metodo);

  const getMetodoPagoIcon = (metodo) =>
    ({ efectivo: "💵", tarjeta: "💳", transferencia: "🏦", otro: "💰" }[metodo] || "💰");

  const getEstadoStyle = (estado) => ({
    completada: { background: "#d1fae5", color: "#065f46" },
    pendiente:  { background: "#fef3c7", color: "#92400e" },
    cancelada:  { background: "#fee2e2", color: "#991b1b" },
  }[estado] || { background: "#fef3c7", color: "#92400e" });

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
      <div className={styles.loading}>
        <div className={styles.loadingInner}>
          <div className={styles.spinner}></div>
          <p style={{ color: "#374151", fontWeight: 600 }}>Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>

      {/* Alerta exportación */}
      {exportExito && (
        <div className={styles.alertaExito}>
          <div className={styles.icono}>✅</div>
          <p className={styles.titulo}>¡Exportación exitosa!</p>
          <p className={styles.subtitulo}>El archivo CSV fue descargado correctamente</p>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoCircle}>JM</div>
            <div className={styles.logoInfo}>
              <h1>Juguetería Martínez</h1>
              <p>Panel Administrativo</p>
            </div>
          </div>
          <button className={styles.btnVolver} onClick={() => navigate("/admin")}>
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <div className={styles.layout}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {[
              { to: "/admin",            label: "📊 Dashboard" },
              { to: "/admin/productos",  label: "📦 Productos" },
              { to: "/admin/ventas",     label: "💰 Ventas", active: true },
              { to: "/admin/inventario", label: "📋 Inventario" },
              { to: "/admin/clientes",   label: "👥 Clientes" },
              { to: "/admin/reportes",   label: "📈 Reportes" },
              { to: "/admin/respaldos",  label: "🗄️ Respaldos" },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`${styles.sidebarLink} ${item.active ? styles.sidebarLinkActive : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className={styles.main}>

          {/* Título + botones */}
          <div className={styles.pageHeader}>
            <div>
              <h2>💰 Historial de Ventas</h2>
              <p>{ventas.length} ventas registradas en total</p>
            </div>
            <div className={styles.headerBtns}>
              <button className={styles.btnSecundario} onClick={exportarVentas}>
                📊 Exportar CSV
              </button>
              <button className={styles.btnPrimario} onClick={() => navigate("/admin/ventas/nueva")}>
                + Nueva Venta
              </button>
            </div>
          </div>

          {/* Tarjetas estadísticas */}
          {stats && (
            <div className={styles.statsGrid}>
              {[
                { label: "Ingresos Totales", value: formatCurrency(stats.resumen.ventas_totales),   icon: "💰", color: "linear-gradient(135deg,#ec4899,#db2777)" },
                { label: "Total de Ventas",  value: stats.resumen.total_ventas,                      icon: "🛒", color: "linear-gradient(135deg,#06b6d4,#0891b2)" },
                { label: "Ticket Promedio",  value: formatCurrency(stats.resumen.ticket_promedio),   icon: "📈", color: "linear-gradient(135deg,#f59e0b,#d97706)" },
                { label: "Completadas",      value: stats.resumen.ventas_completadas,                icon: "✅", color: "linear-gradient(135deg,#10b981,#059669)" },
              ].map((card, i) => (
                <div key={i} className={styles.statCard} style={{ background: card.color }}>
                  <div className={styles.icono}>{card.icon}</div>
                  <h3>{card.value}</h3>
                  <p>{card.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filtros */}
          <div className={styles.filtrosCard}>
            <p className={styles.titulo}>🔍 Filtros</p>
            <div className={styles.filtrosGrid}>
              <div className={styles.filtroItem}>
                <label>Fecha Inicio</label>
                <input type="date" value={filtros.fecha_inicio}
                  onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
              </div>
              <div className={styles.filtroItem}>
                <label>Fecha Fin</label>
                <input type="date" value={filtros.fecha_fin}
                  onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
              </div>
              <div className={styles.filtroItem}>
                <label>Estado</label>
                <select value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
                  <option value="">Todos</option>
                  <option value="completada">Completada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className={styles.filtroItem}>
                <label>Método de Pago</label>
                <select value={filtros.metodo_pago}
                  onChange={(e) => setFiltros({ ...filtros, metodo_pago: e.target.value })}>
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
  <button className={styles.btnSecundario} onClick={() => {
    const filtrosVacios = { fecha_inicio: "", fecha_fin: "", estado: "", metodo_pago: "" };
    setFiltros(filtrosVacios);
    cargarDatos(filtrosVacios);
  }}>
    🔄 Limpiar
  </button>
  <button className={styles.btnPrimario} onClick={() => cargarDatos(filtros)}>
    🔍 Aplicar Filtros
  </button>
</div>
          </div>

          {/* Tabla */}
          <div className={styles.tablaCard}>
            <div className={styles.tablaHeader}>
              <h3>📋 Registro de Ventas</h3>
              <div className={styles.buscador}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por folio o cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <table className={styles.tabla}>
              <thead>
                <tr>
                  {["Folio","Fecha","Cliente","Productos","Total","Método de Pago","Estado","Acciones"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className={styles.sinResultados}>
                        <div className={styles.iconoGrande}>📦</div>
                        <p>No se encontraron ventas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id_venta}>
                      <td className={styles.folioCell}>#{venta.folio}</td>
                      <td>{formatDate(venta.fecha_venta)}</td>
                      <td>{venta.first_name && venta.last_name ? `${venta.first_name} ${venta.last_name}` : "Cliente General"}</td>
                      <td style={{ color: "#6b7280" }}>{venta.total_productos} producto(s)</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(venta.total)}</td>
                      <td>{getMetodoPagoIcon(venta.metodo_pago)} {getMetodoPagoNombre(venta.metodo_pago)}</td>
                      <td>
                        <span className={styles.badge} style={getEstadoStyle(venta.estado)}>
                          {getEstadoNombre(venta.estado)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.accionesCelda}>
                          <button className={`${styles.btnAccion} ${styles.btnVer}`} onClick={() => verDetalle(venta.id_venta)}>
                            👁️ Ver
                          </button>
                          <button className={`${styles.btnAccion} ${styles.btnTicket}`} onClick={() => imprimirTicket(venta)}>
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

      {/* Modal detalle */}
      {modalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            {loadingDetalle ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>Cargando detalle...</p>
              </div>
            ) : ventaDetalle ? (
              <>
                <div className={styles.modalTitulo}>
                  <h2>#{ventaDetalle.folio}</h2>
                  <button className={styles.btnCerrarModal}
                    onClick={() => { setModalVisible(false); setVentaDetalle(null); }}>
                    ✕
                  </button>
                </div>

                <div className={styles.modalInfoGrid}>
                  {[
                    { label: "Fecha",          value: formatDate(ventaDetalle.fecha_venta) },
                    { label: "Cliente",        value: ventaDetalle.first_name ? `${ventaDetalle.first_name} ${ventaDetalle.last_name}` : "Cliente General" },
                    { label: "Método de Pago", value: `${getMetodoPagoIcon(ventaDetalle.metodo_pago)} ${getMetodoPagoNombre(ventaDetalle.metodo_pago)}` },
                    { label: "Estado",         value: getEstadoNombre(ventaDetalle.estado) },
                  ].map((item, i) => (
                    <div key={i} className={styles.modalInfoItem}>
                      <p className={styles.label}>{item.label}</p>
                      <p className={styles.valor}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className={styles.modalProductosTitulo}>Productos</p>
                <table className={styles.tablaModal}>
                  <thead>
                    <tr>
                      {["Producto","Cant.","Precio","Subtotal"].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(ventaDetalle.productos || []).map((p, i) => (
                      <tr key={i}>
                        <td>{p.nombre_producto}</td>
                        <td>{p.cantidad}</td>
                        <td>{formatCurrency(p.precio_unitario)}</td>
                        <td className={styles.negrita}>{formatCurrency(p.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.totalBox}>
                  {ventaDetalle.descuento > 0 && (
                    <div className={styles.descuentoRow}>
                      <span>Descuento:</span>
                      <span>-{formatCurrency(ventaDetalle.descuento)}</span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span>{formatCurrency(ventaDetalle.total)}</span>
                  </div>
                </div>

                <button className={styles.btnImprimirModal} onClick={() => imprimirTicket(ventaDetalle)}>
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