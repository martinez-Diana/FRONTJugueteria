import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productosService from "../services/productosService";

const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [ordenar, setOrdenar] = useState("nombre");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num || 0);

  const getEstadoStock = (producto) => {
    if (producto.cantidad === 0) return "agotado";
    if (producto.cantidad <= producto.stock_minimo) return "bajo";
    return "normal";
  };

  const productosFiltrados = productos
    .filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());

      const estado = getEstadoStock(p);
      const matchFiltro =
        filtroStock === "todos" ||
        (filtroStock === "agotado" && estado === "agotado") ||
        (filtroStock === "bajo" && estado === "bajo") ||
        (filtroStock === "normal" && estado === "normal");

      return matchSearch && matchFiltro;
    })
    .sort((a, b) => {
      if (ordenar === "nombre") return a.nombre.localeCompare(b.nombre);
      if (ordenar === "stock_asc") return a.cantidad - b.cantidad;
      if (ordenar === "stock_desc") return b.cantidad - a.cantidad;
      if (ordenar === "precio") return b.precio - a.precio;
      return 0;
    });

  const totalProductos = productos.length;
  const totalUnidades = productos.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  const totalAgotados = productos.filter((p) => p.cantidad === 0).length;
  const totalBajos = productos.filter((p) => p.cantidad > 0 && p.cantidad <= p.stock_minimo).length;
  const valorInventario = productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio_compra || 0), 0);
  const gananciaTotal = productos.reduce((acc, p) => acc + (p.cantidad || 0) * ((p.precio || 0) - (p.precio_compra || 0)), 0);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #f3f4f6", borderTop: "4px solid #ec4899", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Cargando inventario...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>📋 Inventario</h1>
            <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: "14px" }}>Control de stock y productos</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Tarjetas de resumen */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Productos", value: totalProductos, icon: "📦", color: "#3b82f6", bg: "#dbeafe" },
            { label: "Total Unidades", value: totalUnidades, icon: "🔢", color: "#10b981", bg: "#d1fae5" },
            { label: "Agotados", value: totalAgotados, icon: "🚫", color: "#ef4444", bg: "#fee2e2" },
            { label: "Stock Bajo", value: totalBajos, icon: "⚠️", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Valor Inventario", value: formatCurrency(valorInventario), icon: "💰", color: "#8b5cf6", bg: "#ede9fe" },
            { label: "Ganancia Potencial", value: formatCurrency(gananciaTotal), icon: "📈", color: "#ec4899", bg: "#fce7f3" },
          ].map((card, i) => (
            <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${card.color}` }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: card.color }}>{card.value}</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "'Poppins', sans-serif", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = "#ec4899"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Filtro stock */}
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            style={{ padding: "10px 16px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
          >
            <option value="todos">📦 Todos</option>
            <option value="normal">✅ Stock Normal</option>
            <option value="bajo">⚠️ Stock Bajo</option>
            <option value="agotado">🚫 Agotados</option>
          </select>

          {/* Ordenar */}
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            style={{ padding: "10px 16px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
          >
            <option value="nombre">🔤 Nombre A-Z</option>
            <option value="stock_asc">📉 Menor Stock</option>
            <option value="stock_desc">📈 Mayor Stock</option>
            <option value="precio">💲 Mayor Precio</option>
          </select>

          {/* Botón refrescar */}
          <button
            onClick={cargarProductos}
            style={{ padding: "10px 16px", background: "#f3f4f6", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
          >
            🔄 Refrescar
          </button>

          <span style={{ fontSize: "13px", color: "#6b7280", marginLeft: "auto" }}>
            {productosFiltrados.length} productos
          </span>
        </div>

        {/* Tabla */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", color: "white" }}>
                  {["Producto", "SKU", "Categoría", "Stock", "Estado", "P. Compra", "P. Venta", "Ganancia", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto, index) => {
                  const estado = getEstadoStock(producto);
                  const ganancia = (producto.precio || 0) - (producto.precio_compra || 0);
                  const gananciaTotal = ganancia * (producto.cantidad || 0);

                  return (
                    <tr
                      key={producto.id_producto}
                      style={{ borderBottom: "1px solid #f3f4f6", background: index % 2 === 0 ? "white" : "#fafafa", transition: "background 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fce7f3"}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "white" : "#fafafa"}
                    >
                      {/* Producto */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {producto.imagen ? (
                            <img
                              src={producto.imagen.split(",")[0]}
                              alt={producto.nombre}
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div style={{ width: "40px", height: "40px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📦</div>
                          )}
                          <span style={{ fontWeight: "600", color: "#1f2937", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {producto.nombre}
                          </span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>
                        {producto.sku}
                      </td>

                      {/* Categoría */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f3f4f6", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize", color: "#374151" }}>
                          {producto.categoria?.replace("_", " ")}
                        </span>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: "12px 16px", fontWeight: "700", fontSize: "16px", color: estado === "agotado" ? "#ef4444" : estado === "bajo" ? "#f59e0b" : "#10b981" }}>
                        {producto.cantidad}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          background: estado === "agotado" ? "#fee2e2" : estado === "bajo" ? "#fef3c7" : "#d1fae5",
                          color: estado === "agotado" ? "#dc2626" : estado === "bajo" ? "#f59e0b" : "#10b981"
                        }}>
                          {estado === "agotado" ? "🚫 Agotado" : estado === "bajo" ? "⚠️ Stock Bajo" : "✅ Normal"}
                        </span>
                      </td>

                      {/* P. Compra */}
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                        {formatCurrency(producto.precio_compra)}
                      </td>

                      {/* P. Venta */}
                      <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1f2937" }}>
                        {formatCurrency(producto.precio)}
                      </td>

                      {/* Ganancia */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: "700", color: "#10b981" }}>{formatCurrency(ganancia)}<span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "400" }}> /u</span></div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Total: {formatCurrency(gananciaTotal)}</div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => navigate(`/admin/productos/editar/${producto.id_producto}`)}
                          style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {productosFiltrados.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
              <p style={{ fontSize: "16px", fontWeight: "600" }}>No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventario;