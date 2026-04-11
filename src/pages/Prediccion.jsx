import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  .pred-body {
    font-family: 'Nunito', sans-serif;
    background: #f8f9fa;
    min-height: 100vh;
  }

  /* Header igual al de Administrador */
  .admin-header {
    background: linear-gradient(135deg, #ec4899, #db2777);
    color: white;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(236,72,153,0.3);
  }
  .header-container { display:flex; justify-content:space-between; align-items:center; width:100%; }
  .header-left { display:flex; align-items:center; gap:1rem; }
  .logo-circle {
    width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,0.25);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; font-size:0.9rem;
  }
  .header-title { font-size:1.1rem; font-weight:800; margin:0; }
  .header-subtitle { font-size:0.75rem; margin:0; opacity:0.85; }
  .header-right { display:flex; align-items:center; gap:0.75rem; }
  .header-user { display:flex; align-items:center; gap:0.5rem; font-weight:600; font-size:0.9rem; }
  .user-avatar { width:32px; height:32px; border-radius:50%; background:#0e9f8e; }
  .logout-button, .header-button {
    background:rgba(255,255,255,0.15); border:none; color:white;
    padding:0.4rem; border-radius:8px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }
  .logout-button:hover, .header-button:hover { background:rgba(255,255,255,0.25); }
  .icon { width:20px; height:20px; }

  /* Layout */
  .admin-container { display:flex; min-height:calc(100vh - 64px); }

  /* Sidebar igual al de Administrador */
  .sidebar {
    width:220px; min-width:220px;
    background:white;
    border-right:1px solid #f3f4f6;
    padding:1.5rem 0;
    position:sticky; top:64px;
    height:calc(100vh - 64px);
    overflow-y:auto;
  }
  .sidebar nav { display:flex; flex-direction:column; gap:0.15rem; padding:0 0.75rem; }
  .sidebar nav a {
    display:block; padding:0.6rem 1rem; border-radius:10px;
    text-decoration:none; color:#374151;
    font-size:0.9rem; font-weight:600;
    transition:background 0.15s, color 0.15s;
  }
  .sidebar nav a:hover { background:#fdf2f8; color:#ec4899; }
  .sidebar nav a.active { background:#fce7f3; color:#ec4899; }

  /* Main */
  .main-content { flex:1; padding:2rem; overflow-y:auto; }

  .section-header { margin-bottom:1.5rem; }
  .section-header h2 { font-size:1.8rem; font-weight:800; color:#111827; margin:0 0 0.25rem; }
  .section-header p { color:#6b7280; margin:0; font-size:0.95rem; }

  /* Cards de resumen */
  .pred-summary {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));
    gap:1rem;
    margin-bottom:2rem;
  }
  .pred-card {
    background:white; border-radius:16px;
    padding:1.25rem 1.5rem;
    box-shadow:0 1px 8px rgba(0,0,0,0.07);
    display:flex; flex-direction:column; gap:0.25rem;
  }
  .pred-card h3 { font-size:2rem; font-weight:800; margin:0; }
  .pred-card p { margin:0; font-size:0.85rem; color:#6b7280; font-weight:600; }
  .pred-card.verde h3 { color:#16a34a; }
  .pred-card.amarillo h3 { color:#d97706; }
  .pred-card.naranja h3 { color:#ea580c; }
  .pred-card.rojo h3 { color:#dc2626; }
  .pred-card.gris h3 { color:#9ca3af; }

  /* Filtros */
  .pred-filtros {
    display:flex; gap:1rem; flex-wrap:wrap;
    margin-bottom:1.5rem; align-items:center;
  }
  .pred-filtros select, .pred-filtros input {
    padding:0.5rem 1rem; border-radius:10px;
    border:2px solid #f3f4f6; background:white;
    font-family:'Nunito', sans-serif; font-size:0.9rem; font-weight:600;
    color:#374151; outline:none; cursor:pointer;
    transition:border-color 0.2s;
  }
  .pred-filtros select:focus, .pred-filtros input:focus { border-color:#ec4899; }

  /* Tabla */
  .pred-tabla-wrap {
    background:white; border-radius:16px;
    box-shadow:0 1px 8px rgba(0,0,0,0.07);
    overflow:hidden;
  }
  .pred-tabla {
    width:100%; border-collapse:collapse;
    font-size:0.88rem;
  }
  .pred-tabla thead tr {
    background:linear-gradient(135deg,#fce7f3,#fdf2f8);
  }
  .pred-tabla th {
    padding:1rem 1.25rem; text-align:left;
    font-weight:800; color:#9d174d; font-size:0.8rem;
    text-transform:uppercase; letter-spacing:0.05em;
    white-space:nowrap;
  }
  .pred-tabla td {
    padding:0.9rem 1.25rem;
    border-bottom:1px solid #f9fafb;
    color:#374151; font-weight:600;
    vertical-align:middle;
  }
  .pred-tabla tbody tr:hover { background:#fdf9ff; }
  .pred-tabla tbody tr:last-child td { border-bottom:none; }

  .cat-badge {
    display:inline-block; padding:0.2rem 0.7rem;
    border-radius:20px; font-size:0.78rem; font-weight:700;
    background:#f3e8ff; color:#7c3aed;
    text-transform:capitalize;
  }

  /* Chips de estado */
  .estado-chip {
    display:inline-flex; align-items:center; gap:0.4rem;
    padding:0.3rem 0.9rem; border-radius:20px;
    font-size:0.8rem; font-weight:800; white-space:nowrap;
  }
  .estado-chip.disponible    { background:#dcfce7; color:#16a34a; }
  .estado-chip.bajo_stock    { background:#fef9c3; color:#ca8a04; }
  .estado-chip.casi_agotado  { background:#ffedd5; color:#ea580c; }
  .estado-chip.agotado       { background:#fee2e2; color:#dc2626; }
  .estado-chip.sin_datos     { background:#f3f4f6; color:#9ca3af; }

  /* Proyecciones mini */
  .mini-proj { display:flex; flex-direction:column; gap:0.3rem; min-width:180px; }
  .mini-proj-row {
    display:flex; align-items:center; gap:0.5rem;
    font-size:0.78rem;
  }
  .mini-proj-label { color:#9ca3af; width:90px; font-weight:600; }
  .mini-proj-bar-wrap {
    flex:1; height:6px; background:#f3f4f6; border-radius:3px; overflow:hidden;
  }
  .mini-proj-bar { height:100%; border-radius:3px; transition:width 0.4s; }
  .mini-proj-val { font-weight:700; color:#374151; width:35px; text-align:right; font-size:0.78rem; }

  /* Mes agotamiento */
  .mes-agot {
    display:inline-block; padding:0.2rem 0.7rem;
    border-radius:8px; font-size:0.8rem; font-weight:700;
    background:#fff7ed; color:#c2410c;
  }

  /* Loading / vacío */
  .pred-loading {
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:5rem; gap:1rem; color:#9ca3af;
  }
  .spinner {
    width:48px; height:48px;
    border:5px solid #f3f4f6;
    border-top:5px solid #ec4899;
    border-radius:50%;
    animation:spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .pred-empty {
    text-align:center; padding:4rem; color:#9ca3af;
  }
  .pred-empty span { font-size:3rem; display:block; margin-bottom:0.5rem; }

  /* Info tooltip */
  .info-box {
    background:linear-gradient(135deg,#fce7f3,#ede9fe);
    border-radius:12px; padding:1rem 1.5rem;
    margin-bottom:1.5rem; font-size:0.85rem;
    color:#6b21a8; font-weight:600;
    border-left:4px solid #ec4899;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  disponible:   { label: "✅ Disponible",      clase: "disponible"   },
  bajo_stock:   { label: "⚠️ Bajo Stock",       clase: "bajo_stock"   },
  casi_agotado: { label: "🔶 Casi Agotado",     clase: "casi_agotado" },
  agotado:      { label: "🔴 Agotado",          clase: "agotado"      },
  sin_datos:    { label: "➖ Sin datos",         clase: "sin_datos"    },
};

const BARRA_COLOR = {
  disponible:   "#16a34a",
  bajo_stock:   "#ca8a04",
  casi_agotado: "#ea580c",
  agotado:      "#dc2626",
  sin_datos:    "#d1d5db",
};

// ─── Componente ──────────────────────────────────────────────────────────────
const Prediccion = () => {
  const navigate = useNavigate();
  const [predicciones, setPredicciones] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado]       = useState("todos");
  const [busqueda, setBusqueda]               = useState("");

  useEffect(() => { cargarPredicciones(); }, []);

  const cargarPredicciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/prediccion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPredicciones(data.predicciones || []);
    } catch (err) {
      console.error("Error al cargar predicciones:", err);
      setError("No se pudieron cargar las predicciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Categorías únicas para el filtro
  const categorias = [...new Set(predicciones.map((p) => p.categoria))].sort();

  // Filtrado
  const filtradas = predicciones.filter((p) => {
    const porCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const porEstado    = filtroEstado === "todos"    || p.estado_prediccion === filtroEstado;
    const porBusqueda  = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return porCategoria && porEstado && porBusqueda;
  });

  // Conteos para las cards de resumen
  const conteos = predicciones.reduce((acc, p) => {
    acc[p.estado_prediccion] = (acc[p.estado_prediccion] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <style>{styles}</style>
      <div className="pred-body">

        {/* Header */}
        <header className="admin-header">
          <div className="header-container">
            <div className="header-left">
              <div className="logo-circle">JM</div>
              <div>
                <h1 className="header-title">Juguetería Martínez</h1>
                <p className="header-subtitle">Panel Administrativo</p>
              </div>
            </div>
            <div className="header-right">
              <div className="header-user">
                <span>Admin</span>
                <div className="user-avatar"></div>
              </div>
              <button onClick={handleLogout} className="logout-button" title="Cerrar Sesión">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="admin-container">
          {/* Sidebar */}
          <aside className="sidebar">
            <nav>
              <Link to="/admin">📊 Dashboard</Link>
              <Link to="/admin/productos">📦 Productos</Link>
              <Link to="/admin/productos/nuevo" style={{ paddingLeft:"2rem", fontSize:"0.9rem", color:"#6b7280" }}>
                ➕ Nuevo Producto
              </Link>
              <Link to="/admin/importar-productos">📂 Importar Productos</Link>
              <Link to="/admin/ventas">💰 Ventas</Link>
              <Link to="/admin/inventario">📋 Inventario</Link>
              <Link to="/admin/importar-inventario" style={{ paddingLeft:"2rem", fontSize:"0.9rem", color:"#6b7280" }}>
                📦 Importar Stock
              </Link>
              <Link to="/admin/apartados">🔖 Apartados</Link>
              <Link to="/admin/ofertas">🏷️ Ofertas</Link>
              <Link to="/admin/empleados">👨‍💼 Empleados</Link>
              <Link to="/admin/clientes">👥 Clientes</Link>
              <Link to="/admin/mensajes-contacto">📧 Mensajes</Link>
              <Link to="/admin/reportes">📈 Reportes</Link>
              <Link to="/admin/prediccion" className="active">🔮 Predicción de Stock</Link>
              <Link to="/admin/respaldos">🗄️ Respaldos</Link>
            </nav>
          </aside>

          {/* Main */}
          <main className="main-content">
            <div className="section-header">
              <h2>🔮 Predicción de Stock</h2>
              <p>Estimación de demanda por temporada usando modelo de crecimiento exponencial</p>
            </div>

            {/* Info box */}
            <div className="info-box">
              📐 El modelo calcula <strong></strong> con los últimos 2 meses de ventas reales.
              Las proyecciones corresponden a los 3 picos estacionales:
              <strong> Día del Niño (Abril)</strong>, <strong>Graduaciones (Junio)</strong> y <strong>Navidad (Diciembre)</strong>.
            </div>

            {/* Cards resumen */}
            <div className="pred-summary">
              <div className="pred-card verde">
                <h3>{conteos.disponible || 0}</h3>
                <p>✅ Disponible</p>
              </div>
              <div className="pred-card amarillo">
                <h3>{conteos.bajo_stock || 0}</h3>
                <p>⚠️ Bajo Stock</p>
              </div>
              <div className="pred-card naranja">
                <h3>{conteos.casi_agotado || 0}</h3>
                <p>🔶 Casi Agotado</p>
              </div>
              <div className="pred-card rojo">
                <h3>{conteos.agotado || 0}</h3>
                <p>🔴 Agotado</p>
              </div>
              <div className="pred-card gris">
                <h3>{conteos.sin_datos || 0}</h3>
                <p>➖ Sin Datos</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="pred-filtros">
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ minWidth: "200px" }}
              />
              <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="todas">📂 Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">🔮 Todos los estados</option>
                <option value="disponible">✅ Disponible</option>
                <option value="bajo_stock">⚠️ Bajo Stock</option>
                <option value="casi_agotado">🔶 Casi Agotado</option>
                <option value="agotado">🔴 Agotado</option>
                <option value="sin_datos">➖ Sin Datos</option>
              </select>
              <button
                onClick={cargarPredicciones}
                style={{
                  padding:"0.5rem 1.25rem", borderRadius:"10px",
                  background:"linear-gradient(135deg,#ec4899,#db2777)",
                  border:"none", color:"white", fontFamily:"'Nunito',sans-serif",
                  fontWeight:"700", cursor:"pointer", fontSize:"0.9rem",
                }}
              >
                🔄 Actualizar
              </button>
            </div>

            {/* Contenido */}
            {loading ? (
              <div className="pred-loading">
                <div className="spinner"></div>
                <p>Calculando predicciones...</p>
              </div>
            ) : error ? (
              <div className="pred-empty">
                <span>❌</span>
                <p>{error}</p>
              </div>
            ) : filtradas.length === 0 ? (
              <div className="pred-empty">
                <span>🔍</span>
                <p>No se encontraron productos con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="pred-tabla-wrap">
                <table className="pred-tabla">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock Actual</th>
                      <th>Estado de Predicción</th>
                      <th>Proyección por Temporada</th>
                      <th>Se agota en</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((p) => {
                      const cfg = ESTADO_CONFIG[p.estado_prediccion] || ESTADO_CONFIG.sin_datos;
                      const color = BARRA_COLOR[p.estado_prediccion] || "#d1d5db";
                      return (
                        <tr key={p.id_producto}>
                          <td style={{ color:"#9ca3af", fontWeight:"700" }}>#{p.id_producto}</td>
                          <td style={{ fontWeight:"700", maxWidth:"180px" }}>{p.nombre}</td>
                          <td><span className="cat-badge">{p.categoria}</span></td>
                          <td>
                            <strong style={{ fontSize:"1.05rem" }}>{p.stock_actual}</strong>
                            <span style={{ color:"#9ca3af", fontSize:"0.78rem" }}> uds</span>
                            {p.stock_minimo && (
                              <div style={{ fontSize:"0.75rem", color:"#9ca3af" }}>
                                mín: {p.stock_minimo}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`estado-chip ${cfg.clase}`}>{cfg.label}</span>
                          </td>
                          <td>
                            {p.proyecciones && p.proyecciones.length > 0 ? (
                              <div className="mini-proj">
                                {p.proyecciones.map((proy, i) => (
                                  <div className="mini-proj-row" key={i}>
                                    <span className="mini-proj-label">{proy.mes}</span>
                                    <div className="mini-proj-bar-wrap">
                                      <div
                                        className="mini-proj-bar"
                                        style={{
                                          width: `${proy.porcentaje_cubierto}%`,
                                          background: color,
                                        }}
                                      />
                                    </div>
                                    <span className="mini-proj-val">{proy.ventas_proyectadas}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color:"#9ca3af", fontSize:"0.82rem" }}>Sin proyección</span>
                            )}
                          </td>
                          <td>
                            {p.mes_agotamiento ? (
                              <span className="mes-agot">📅 {p.mes_agotamiento}</span>
                            ) : (
                              <span style={{ color:"#9ca3af", fontSize:"0.82rem" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Prediccion;