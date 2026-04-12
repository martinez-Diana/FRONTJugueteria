import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://back-jugueteria.vercel.app/api";
const ROSA = "#db2777";
const ROSA_DARK = "#be185d";
const ROSA_LIGHT = "#fce7f3";

function getToken() {
  return localStorage.getItem("token") || "";
}

const ESTADOS = [
  { key: "todos",          label: "Todos",          color: "#6b7280" },
  { key: "Agotado",        label: "Agotado",         color: "#ef4444" },
  { key: "Casi agotado",   label: "Casi agotado",    color: "#f97316" },
  { key: "Stock bajo",     label: "Stock bajo",      color: "#eab308" },
  { key: "Disponible",     label: "Disponible",      color: "#10b981" },
  { key: "Sin movimiento", label: "Sin movimiento",  color: "#9ca3af" },
];

export default function CalculadoraPredictiva() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reportes/predictivo`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error al cargar datos predictivos:", e);
    } finally {
      setLoading(false);
    }
  };

  const productos = data?.productos ?? [];
  const temporadas = data?.temporadas ?? [];
  const resumen = data?.resumen ?? {};

  // Categorías únicas
  const categorias = ["todas", ...new Set(productos.map(p => p.categoria))];

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchCategoria && matchBusqueda;
  });

  const getBadgeEstado = (estado, color) => (
    <span style={{
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: color + "20",
      color: color,
      border: `1px solid ${color}40`
    }}>
      {estado === "Agotado" && "🔴 "}
      {estado === "Casi agotado" && "🟠 "}
      {estado === "Stock bajo" && "🟡 "}
      {estado === "Disponible" && "🟢 "}
      {estado === "Sin movimiento" && "⚪ "}
      {estado}
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${ROSA} 0%, ${ROSA_DARK} 100%)`,
        padding: "20px 32px", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => navigate("/admin")}
            style={{
              background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
              color: "white", padding: "8px 16px", borderRadius: 10,
              cursor: "pointer", fontSize: 13, fontWeight: 600
            }}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📈 Calculadora Predictiva</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: .85 }}>
              Predicción de stock basada en tendencias de ventas
            </p>
          </div>
        </div>
        <button
          onClick={cargarDatos}
          style={{
            background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
            color: "white", padding: "8px 16px", borderRadius: 10,
            cursor: "pointer", fontSize: 13, fontWeight: 600
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={{
              width: 48, height: 48,
              border: "4px solid #f3f4f6", borderTop: `4px solid ${ROSA}`,
              borderRadius: "50%", animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p style={{ color: "#6b7280", fontSize: 15 }}>Calculando predicciones...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* ── Temporadas próximas ── */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>
                🗓️ Temporadas de alta demanda
              </h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {temporadas.map((t, i) => (
                  <div key={i} style={{
                    background: "white", borderRadius: 14, padding: "16px 20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    borderLeft: `4px solid ${t.color}`,
                    flex: "1 1 200px", minWidth: 180
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>{t.nombre}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {new Date(t.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div style={{
                      marginTop: 10, padding: "6px 12px", borderRadius: 20,
                      background: t.diasRestantes <= 30 ? "#fee2e2" : t.diasRestantes <= 60 ? "#fff7ed" : "#f0fdf4",
                      color: t.diasRestantes <= 30 ? "#dc2626" : t.diasRestantes <= 60 ? "#ea580c" : "#16a34a",
                      fontSize: 12, fontWeight: 700, display: "inline-block"
                    }}>
                      ⏳ {t.diasRestantes} días restantes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Resumen de estados ── */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { label: "Total", value: resumen.total_productos, color: "#6b7280", icon: "📦" },
                { label: "Agotados", value: resumen.agotados, color: "#ef4444", icon: "🔴" },
                { label: "Casi agotados", value: resumen.casi_agotados, color: "#f97316", icon: "🟠" },
                { label: "Stock bajo", value: resumen.stock_bajo, color: "#eab308", icon: "🟡" },
                { label: "Disponibles", value: resumen.disponibles, color: "#10b981", icon: "🟢" },
                { label: "Sin movimiento", value: resumen.sin_movimiento, color: "#9ca3af", icon: "⚪" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: 12, padding: "14px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderTop: `3px solid ${s.color}`,
                  flex: "1 1 120px", textAlign: "center", minWidth: 100
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value ?? 0}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Filtros ── */}
            <div style={{
              background: "white", borderRadius: 14, padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20,
              display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
            }}>
              {/* Busqueda */}
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                  fontSize: 13, outline: "none", flex: "1 1 200px",
                  fontFamily: "'Poppins', sans-serif"
                }}
              />

              {/* Filtro estado */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ESTADOS.map(e => (
                  <button key={e.key} onClick={() => setFiltroEstado(e.key)} style={{
                    padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                    background: filtroEstado === e.key ? e.color : "#f3f4f6",
                    color: filtroEstado === e.key ? "white" : "#6b7280",
                    transition: "all .2s"
                  }}>
                    {e.label}
                  </button>
                ))}
              </div>

              {/* Filtro categoría */}
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                  fontSize: 12, outline: "none", fontFamily: "'Poppins', sans-serif",
                  color: "#374151"
                }}
              >
                {categorias.map(c => (
                  <option key={c} value={c} style={{ textTransform: "capitalize" }}>
                    {c === "todas" ? "Todas las categorías" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Tabla de productos ── */}
            <div style={{
              background: "white", borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden"
            }}>
              <div style={{
                padding: "16px 20px", borderBottom: "1.5px solid #f3f4f6",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>
                  📋 Predicción por producto
                </h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {productosFiltrados.length} productos
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["#", "Producto", "Categoría", "Stock actual", "Vendidos (3 meses)", "Venta aprox.", "Duración del stock", "Estado", "Alerta temporada"].map(h => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          color: "#374151", fontWeight: 700, fontSize: 12,
                          borderBottom: "1.5px solid #e5e7eb", whiteSpace: "nowrap"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                          <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                          <p style={{ margin: 0 }}>No se encontraron productos</p>
                        </td>
                      </tr>
                    ) : productosFiltrados.map((p, i) => (
                      <tr key={p.id_producto}
                        style={{ borderBottom: "1px solid #f3f4f6", transition: "background .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fdf2f8"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                      >
                        <td style={{ padding: "12px 14px", color: ROSA, fontWeight: 700 }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1e1b4b", maxWidth: 200 }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.nombre}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            padding: "3px 8px", borderRadius: 6, fontSize: 11,
                            background: ROSA_LIGHT, color: ROSA, fontWeight: 600,
                            textTransform: "capitalize"
                          }}>
                            {p.categoria}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                          <span style={{
                            color: p.stock_actual === 0 ? "#ef4444" : p.stock_actual <= 5 ? "#f97316" : "#374151"
                          }}>
                            {p.stock_actual}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#6b7280" }}>
                          {p.total_vendido_3meses}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#6b7280" }}>
                          {p.promedio_mensual > 0 ? `Venta aprox: ${p.promedio_mensual} por mes` : "—"}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          {p.meses_restantes === null ? (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                          ) : (
                            <span style={{
                              fontWeight: 700,
                              color: p.meses_restantes <= 1 ? "#ef4444"
                                : p.meses_restantes <= 2 ? "#f97316"
                                : p.meses_restantes <= 3 ? "#eab308"
                                : "#10b981"
                            }}>
                              Duración del stock: {p.meses_restantes} {p.meses_restantes === 1 ? "mes" : "meses"}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {getBadgeEstado(p.estado, p.color)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {p.alertas_temporada.length > 0 ? (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {p.alertas_temporada.map((a, j) => (
                                <span key={j} style={{
                                  padding: "2px 8px", borderRadius: 10, fontSize: 10,
                                  background: "#fff7ed", color: "#ea580c",
                                  border: "1px solid #fed7aa", fontWeight: 600
                                }}>
                                  ⚠️ {a}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nota metodológica */}
            <div style={{
              marginTop: 20, padding: "14px 18px",
              background: "#f0f9ff", borderRadius: 10,
              border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1"
            }}>
              <strong>ℹ️ Metodología:</strong> La predicción se basa en el promedio de ventas de los últimos 3 meses.
              Los meses restantes indican cuánto durará el stock actual a ese ritmo de ventas.
              Las alertas de temporada se activan cuando el stock podría ser insuficiente para cubrir la demanda
              de las próximas temporadas (con un factor de +50% por demanda extra).
            </div>
          </>
        )}
      </div>
    </div>
  );
}