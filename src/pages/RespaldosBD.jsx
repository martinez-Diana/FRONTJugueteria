import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = "https://ymnnptkbgvrnvbexwnqr.supabase.co";
const API_URL = "https://back-jugueteria.vercel.app";

const TODAS_LAS_TABLAS = [
  { key: 'users',             label: '👤 Usuarios',           desc: 'Cuentas registradas' },
  { key: 'productos',         label: '📦 Productos',           desc: 'Catálogo de juguetes' },
  { key: 'ventas',            label: '💰 Ventas',              desc: 'Transacciones realizadas' },
  { key: 'detalle_venta',     label: '🧾 Detalle de Ventas',   desc: 'Productos por venta' },
  { key: 'apartados',         label: '🔖 Apartados',           desc: 'Apartados activos e histórico' },
  { key: 'abonos',            label: '💳 Abonos',              desc: 'Pagos parciales de apartados' },
  { key: 'ofertas',           label: '🏷️ Ofertas',             desc: 'Promociones y descuentos' },
  { key: 'roles',             label: '🛡️ Roles',               desc: 'Roles del sistema' },
  { key: 'mensajes_contacto', label: '📧 Mensajes',            desc: 'Formulario de contacto' },
  { key: 'historial_cambios', label: '📋 Historial',           desc: 'Cambios en el sistema' },
  { key: 'backups',           label: '🗄️ Respaldos',           desc: 'Registro de backups' },
];

const RespaldosBD = () => {
  const navigate = useNavigate();
  const [respaldos, setRespaldos] = useState([]);
  const [creandoRespaldo, setCreandoRespaldo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [exito, setExito] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal crear respaldo
  const [modoRespaldo, setModoRespaldo] = useState('completo');
  const [tablasSeleccionadas, setTablasSeleccionadas] = useState(TODAS_LAS_TABLAS.map(t => t.key));

  // Configuración automático
  const [config, setConfig] = useState(null);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [configLocal, setConfigLocal] = useState({
    activo: false,
    modo: 'completo',
    tablas: TODAS_LAS_TABLAS.map(t => t.key)
  });

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`${API_URL}/api/respaldos/historial`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRespaldos(Array.isArray(data) ? data : []);
    } catch {
      console.error('Error al cargar historial');
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch(`${API_URL}/api/respaldos/configuracion`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      console.log('Config recibida:', data);
      setConfig(data);
      setConfigLocal({
        activo: data.activo === 1 || data.activo === true,
        modo: data.modo || 'completo',
        tablas: data.tablas 
        ? (typeof data.tablas === 'string' ? JSON.parse(data.tablas) : data.tablas)
        : TODAS_LAS_TABLAS.map(t => t.key)
      });
    } catch (error){
      console.error('Error al cargar configuración', error);
    }
  };

  useEffect(() => {
    cargarHistorial();
    cargarConfiguracion();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      setGuardandoConfig(true);
      const response = await fetch(`${API_URL}/api/respaldos/configuracion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(configLocal)
      });
      const data = await response.json();
      if (data.success) {
        mostrarToast('Configuración guardada ✅');
        cargarConfiguracion();
      } else {
        mostrarToast('Error al guardar', 'error');
      }
    } catch {
      mostrarToast('Error al conectar', 'error');
    } finally {
      setGuardandoConfig(false);
    }
  };

  const toggleTabla = (key) => {
    setTablasSeleccionadas(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    );
  };

  const toggleTablaConfig = (key) => {
    setConfigLocal(prev => ({
      ...prev,
      tablas: prev.tablas.includes(key)
        ? prev.tablas.filter(t => t !== key)
        : [...prev.tablas, key]
    }));
  };

  const toggleTodas = () => {
    setTablasSeleccionadas(prev =>
      prev.length === TODAS_LAS_TABLAS.length ? [] : TODAS_LAS_TABLAS.map(t => t.key)
    );
  };

  const toggleTodasConfig = () => {
    setConfigLocal(prev => ({
      ...prev,
      tablas: prev.tablas.length === TODAS_LAS_TABLAS.length
        ? [] : TODAS_LAS_TABLAS.map(t => t.key)
    }));
  };

  const abrirModal = () => {
    setModoRespaldo('completo');
    setTablasSeleccionadas(TODAS_LAS_TABLAS.map(t => t.key));
    setMostrarModal(true);
  };

  const crearRespaldo = async () => {
    if (modoRespaldo === 'especifico' && tablasSeleccionadas.length === 0) {
      mostrarToast('Selecciona al menos una tabla', 'error');
      return;
    }
    setMostrarModal(false);
    setCreandoRespaldo(true);
    setProgreso(0);
    const intervalo = setInterval(() => {
      setProgreso(prev => { if (prev >= 90) { clearInterval(intervalo); return 90; } return prev + 10; });
    }, 300);
    try {
      const response = await fetch(`${API_URL}/api/respaldos/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          modo: modoRespaldo,
          tablas: modoRespaldo === 'especifico' ? tablasSeleccionadas : undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setProgreso(100);
        await cargarHistorial();
        setExito(true);
        setTimeout(() => setExito(false), 4000);
      } else {
        mostrarToast('Error: ' + (data.error || 'Error desconocido'), 'error');
      }
    } catch {
      mostrarToast('Error al conectar con el servidor', 'error');
    } finally {
      clearInterval(intervalo);
      setCreandoRespaldo(false);
      setProgreso(0);
    }
  };

  const eliminarRespaldo = async (respaldo) => {
    setMostrarConfirmEliminar(null);
    setEliminando(respaldo.id);
    try {
      await fetch(`${API_URL}/api/respaldos/eliminar/${respaldo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await cargarHistorial();
      mostrarToast('Respaldo eliminado');
    } catch {
      mostrarToast('Error al eliminar', 'error');
    } finally {
      setEliminando(null);
    }
  };

  const descargarRespaldo = async (nombre) => {
    const url = `${SUPABASE_URL}/storage/v1/object/public/backups/${nombre}`;
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    try {
      return new Date(fechaStr).toLocaleDateString("es-MX", {
        year: "numeric", month: "long", day: "2-digit", timeZone: "America/Mexico_City"
      });
    } catch { return fechaStr; }
  };

  const formatHora = (horaStr) => {
    if (!horaStr) return "N/A";
    const [h, m, s] = horaStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${ampm}`;
  };

  const diasDesdeUltimoRespaldo = () => {
    if (!respaldos[0]) return null;
    return Math.floor((new Date() - new Date(respaldos[0].created_at)) / (1000 * 60 * 60 * 24));
  };

  const totalRespaldos = respaldos.length;
  const ultimoRespaldo = respaldos[0];
  const respaldosAuto = respaldos.filter(r => r.tipo === "automatico").length;
  const respaldosManuales = respaldos.filter(r => r.tipo === "manual").length;
  const dias = diasDesdeUltimoRespaldo();
  const todasMarcadas = tablasSeleccionadas.length === TODAS_LAS_TABLAS.length;
  const todasConfigMarcadas = configLocal.tablas.length === TODAS_LAS_TABLAS.length;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: toast.tipo === 'error' ? "#ef4444" : "#10b981",
          color: "white", padding: "14px 24px", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          fontSize: "14px", fontWeight: "600"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Éxito respaldo manual */}
      {exito && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white", border: "3px solid #10b981",
          borderRadius: "16px", padding: "32px 48px",
          textAlign: "center", zIndex: 9999,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <p style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0 }}>
            ¡Respaldo creado exitosamente!
          </p>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "linear-gradient(to right, #db2777, #be185d)", color: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "3rem", height: "3rem", background: "#facc15", color: "#be185d", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>JM</div>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>Juguetería Martínez</h1>
              <p style={{ fontSize: "0.85rem", color: "#ffddee", margin: 0 }}>Panel Administrativo</p>
            </div>
          </div>
          <button onClick={() => navigate("/admin")} style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
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
              { to: "/admin/ventas", label: "💰 Ventas" },
              { to: "/admin/inventario", label: "📋 Inventario" },
              { to: "/admin/clientes", label: "👥 Clientes" },
              { to: "/admin/reportes", label: "📈 Reportes" },
              { to: "/admin/respaldos", label: "🗄️ Respaldos", active: true },
            ].map((item) => (
              <a key={item.to} onClick={() => navigate(item.to)}
                style={{ textDecoration: "none", cursor: "pointer", color: item.active ? "#db2777" : "#555", padding: "0.75rem 1rem", borderRadius: "0.75rem", fontWeight: item.active ? "600" : "500", background: item.active ? "#fce7f3" : "transparent", transition: "all 0.3s" }}
                onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = "#f3f4f6"; }}
                onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = "transparent"; }}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0 }}>🗄️ Respaldos de Base de Datos</h2>
            <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>Gestión y monitoreo de respaldos del sistema</p>
          </div>

          {/* Alerta */}
          {dias !== null && dias >= 7 && (
            <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontWeight: "700", color: "#92400e" }}>Respaldo desactualizado</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#78350f" }}>Tu último respaldo tiene {dias} días.</p>
              </div>
              <button onClick={abrirModal} style={{ marginLeft: "auto", background: "#f59e0b", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                Crear ahora
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Respaldos", value: totalRespaldos, icon: "🗄️", color: "linear-gradient(to bottom right, #ec4899, #db2777)" },
              { label: "Último Respaldo", value: ultimoRespaldo ? formatFecha(ultimoRespaldo.fecha) : "N/A", icon: "🕐", color: "linear-gradient(to bottom right, #06b6d4, #0891b2)" },
              { label: "Automáticos", value: respaldosAuto, icon: "⚙️", color: "linear-gradient(to bottom right, #10b981, #059669)" },
              { label: "Manuales", value: respaldosManuales, icon: "👆", color: "linear-gradient(to bottom right, #8b5cf6, #7c3aed)" },
            ].map((card, i) => (
              <div key={i} style={{ background: card.color, color: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{card.icon}</div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: "700", margin: 0 }}>{card.value}</h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", opacity: 0.9 }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Grid de acciones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>

            {/* Respaldo Manual */}
            <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: "4px solid #ec4899" }}>
              <h3 style={{ fontWeight: "700", marginBottom: "0.75rem", fontSize: "1rem" }}>👆 Crear Respaldo Manual</h3>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Genera un respaldo inmediato. Puedes elegir qué tablas incluir.
              </p>
              <div style={{ background: "#fef3c7", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                <span>⚠️</span>
                <span style={{ color: "#92400e", fontSize: "0.82rem" }}>Recomendado antes de cambios importantes.</span>
              </div>
              {creandoRespaldo && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
                    <span>Generando respaldo...</span><span>{progreso}%</span>
                  </div>
                  <div style={{ width: "100%", height: "10px", background: "#f3f4f6", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ width: `${progreso}%`, height: "100%", background: "linear-gradient(to right, #ec4899, #db2777)", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              )}
              <button onClick={abrirModal} disabled={creandoRespaldo}
                style={{ background: creandoRespaldo ? "#9ca3af" : "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", color: "white", border: "none", padding: "14px 24px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: creandoRespaldo ? "not-allowed" : "pointer", width: "100%", transition: "all 0.3s" }}
                onMouseEnter={(e) => { if (!creandoRespaldo) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {creandoRespaldo ? "⏳ Creando respaldo..." : "🗄️ Crear Respaldo Ahora"}
              </button>
            </div>

            {/* Configuración Automático */}
            <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: "4px solid #10b981" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h3 style={{ fontWeight: "700", fontSize: "1rem", margin: 0 }}>⚙️ Respaldo Automático</h3>
                {/* Toggle activo/inactivo */}
                <div
                  onClick={() => setConfigLocal(prev => ({ ...prev, activo: !prev.activo }))}
                  style={{
                    width: "52px", height: "28px",
                    background: configLocal.activo ? "linear-gradient(135deg, #10b981, #059669)" : "#e5e7eb",
                    borderRadius: "50px", cursor: "pointer",
                    position: "relative", transition: "all 0.3s"
                  }}
                >
                  <div style={{
                    position: "absolute", top: "3px",
                    left: configLocal.activo ? "26px" : "3px",
                    width: "22px", height: "22px",
                    background: "white", borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "all 0.3s"
                  }} />
                </div>
              </div>

              <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1rem" }}>
                Se ejecuta automáticamente <strong>cada 6 horas</strong>. Configura qué incluir:
              </p>

              {/* Modo */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Modo de respaldo:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: "completo", label: "🗄️ Completo" },
                    { value: "especifico", label: "📋 Específico" }
                  ].map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setConfigLocal(prev => ({ ...prev, modo: opt.value }))}
                      style={{
                        flex: 1, padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                        border: `2px solid ${configLocal.modo === opt.value ? "#10b981" : "#e5e7eb"}`,
                        background: configLocal.modo === opt.value ? "#f0fdf4" : "white",
                        fontSize: "13px", fontWeight: "600", textAlign: "center",
                        color: configLocal.modo === opt.value ? "#065f46" : "#374151",
                        transition: "all 0.2s"
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablas específicas para el auto */}
              {configLocal.modo === 'especifico' && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Tablas:</label>
                    <button onClick={toggleTodasConfig} style={{
                      background: todasConfigMarcadas ? "#fee2e2" : "#d1fae5",
                      color: todasConfigMarcadas ? "#dc2626" : "#065f46",
                      border: "none", borderRadius: "6px", padding: "3px 10px",
                      cursor: "pointer", fontSize: "11px", fontWeight: "600"
                    }}>
                      {todasConfigMarcadas ? "✖ Quitar todas" : "✅ Todas"}
                    </button>
                  </div>
                  <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {TODAS_LAS_TABLAS.map(tabla => {
                      const marcada = configLocal.tablas.includes(tabla.key);
                      return (
                        <div key={tabla.key} onClick={() => toggleTablaConfig(tabla.key)}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "6px 10px", borderRadius: "8px", cursor: "pointer",
                            border: `1px solid ${marcada ? "#10b981" : "#e5e7eb"}`,
                            background: marcada ? "#f0fdf4" : "white", transition: "all 0.15s"
                          }}>
                          <div style={{
                            width: "16px", height: "16px", borderRadius: "4px",
                            border: `2px solid ${marcada ? "#10b981" : "#d1d5db"}`,
                            background: marcada ? "#10b981" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                          }}>
                            {marcada && <span style={{ color: "white", fontSize: "10px" }}>✓</span>}
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: marcada ? "#065f46" : "#374151" }}>
                            {tabla.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Próximo respaldo */}
              {config?.ultimo_respaldo && (
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
                  🕐 Último automático: {new Date(config.ultimo_respaldo).toLocaleString("es-MX")}
                </p>
              )}

              <button onClick={guardarConfiguracion} disabled={guardandoConfig}
                style={{
                  background: guardandoConfig ? "#9ca3af" : "linear-gradient(135deg, #10b981, #059669)",
                  color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "12px", fontSize: "14px", fontWeight: "700",
                  cursor: guardandoConfig ? "not-allowed" : "pointer", width: "100%", transition: "all 0.3s"
                }}>
                {guardandoConfig ? "Guardando..." : "💾 Guardar Configuración"}
              </button>
            </div>
          </div>

          {/* Historial */}
          <div style={{ background: "white", borderRadius: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: "700", margin: 0 }}>📋 Historial de Respaldos</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{respaldos.length} respaldos</span>
                <button onClick={cargarHistorial} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>🔄</button>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["#", "Nombre del Archivo", "Fecha", "Hora", "Tamaño", "Tipo", "Estado", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", color: "#374151", fontWeight: "700", fontSize: "0.85rem", borderBottom: "2px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {respaldos.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
                    <div style={{ fontSize: "3rem" }}>🗄️</div>
                    <p>No hay respaldos registrados</p>
                  </td></tr>
                ) : respaldos.map((r, index) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fef3f7"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "1rem", color: "#db2777", fontWeight: "700" }}>#{index + 1}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.78rem" }}>{r.nombre}</td>
                    <td style={{ padding: "1rem" }}>{formatFecha(r.fecha)}</td>
                    <td style={{ padding: "1rem" }}>{formatHora(r.hora)}</td>
                    <td style={{ padding: "1rem", color: "#6b7280" }}>{r.tamaño}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", background: r.tipo === "automatico" ? "#dbeafe" : "#fce7f3", color: r.tipo === "automatico" ? "#1d4ed8" : "#db2777" }}>
                        {r.tipo === "automatico" ? "⚙️ Automático" : "👆 Manual"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", background: "#d1fae5", color: "#065f46" }}>✅ Completado</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => descargarRespaldo(r.nombre)} style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}>⬇️</button>
                        <button onClick={() => setMostrarConfirmEliminar(r)} disabled={eliminando === r.id}
                          style={{ background: eliminando === r.id ? "#9ca3af" : "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: eliminando === r.id ? "not-allowed" : "pointer" }}>
                          {eliminando === r.id ? "..." : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal crear respaldo manual */}
      {mostrarModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }} onClick={() => setMostrarModal(false)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "800", color: "#1f2937" }}>🗄️ Crear Respaldo</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>Elige qué quieres respaldar.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { value: "completo", icon: "🗄️", label: "Toda la base de datos", desc: "Todas las tablas" },
                { value: "especifico", icon: "📋", label: "Tablas específicas", desc: "Elige qué incluir" },
              ].map(opt => (
                <div key={opt.value} onClick={() => setModoRespaldo(opt.value)}
                  style={{ border: `2px solid ${modoRespaldo === opt.value ? "#ec4899" : "#e5e7eb"}`, borderRadius: "14px", padding: "16px", cursor: "pointer", background: modoRespaldo === opt.value ? "#fef7fb" : "white" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{opt.icon}</div>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: modoRespaldo === opt.value ? "#ec4899" : "#1f2937" }}>{opt.label}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{opt.desc}</p>
                </div>
              ))}
            </div>

            {modoRespaldo === 'especifico' && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Tablas a incluir:</span>
                  <button onClick={toggleTodas} style={{ background: todasMarcadas ? "#fee2e2" : "#d1fae5", color: todasMarcadas ? "#dc2626" : "#065f46", border: "none", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                    {todasMarcadas ? "✖ Quitar todas" : "✅ Todas"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                  {TODAS_LAS_TABLAS.map(tabla => {
                    const marcada = tablasSeleccionadas.includes(tabla.key);
                    return (
                      <div key={tabla.key} onClick={() => toggleTabla(tabla.key)}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${marcada ? "#ec4899" : "#e5e7eb"}`, background: marcada ? "#fef7fb" : "white", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `2px solid ${marcada ? "#ec4899" : "#d1d5db"}`, background: marcada ? "#ec4899" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {marcada && <span style={{ color: "white", fontSize: "12px" }}>✓</span>}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: marcada ? "#ec4899" : "#1f2937" }}>{tabla.label}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{tabla.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "12px" }}>
                  {tablasSeleccionadas.length} de {TODAS_LAS_TABLAS.length} tablas
                </p>
              </div>
            )}

            {modoRespaldo === 'completo' && (
              <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#166534", fontWeight: "600" }}>✅ Se respaldarán las {TODAS_LAS_TABLAS.length} tablas</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setMostrarModal(false)} style={{ flex: 1, padding: "14px", background: "white", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", color: "#374151" }}>Cancelar</button>
              <button onClick={crearRespaldo} disabled={modoRespaldo === 'especifico' && tablasSeleccionadas.length === 0}
                style={{ flex: 2, padding: "14px", background: modoRespaldo === 'especifico' && tablasSeleccionadas.length === 0 ? "#9ca3af" : "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", color: "white" }}>
                🗄️ Generar Respaldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {mostrarConfirmEliminar && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "2rem", maxWidth: "450px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
            <h2 style={{ fontWeight: "700", color: "#1f2937", marginBottom: "0.75rem" }}>¿Eliminar este respaldo?</h2>
            <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>Esta acción no se puede deshacer.</p>
            <p style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#374151", background: "#f3f4f6", padding: "8px", borderRadius: "8px", marginBottom: "1.5rem" }}>{mostrarConfirmEliminar.nombre}</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setMostrarConfirmEliminar(null)} style={{ padding: "10px 24px", background: "white", border: "2px solid #e5e7eb", borderRadius: "12px", fontWeight: "600", cursor: "pointer", color: "#374151" }}>Cancelar</button>
              <button onClick={() => eliminarRespaldo(mostrarConfirmEliminar)} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "12px", fontWeight: "600", cursor: "pointer", color: "white" }}>🗑️ Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RespaldosBD;