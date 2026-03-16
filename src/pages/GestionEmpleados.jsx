import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://back-jugueteria.vercel.app/api";

const capitalizarNombre = (texto) => {
  if (!texto) return '';
  return texto.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
};

const GestionEmpleados = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [modalReset, setModalReset] = useState(null);
const [nuevaPassword, setNuevaPassword] = useState('');

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    first_name: '', last_name: '', mother_lastname: '',
    email: '', phone: '', username: '', password: ''
  });

  const token = () => localStorage.getItem('token');

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/empleados`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarEmpleados(); }, []);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(''), 4000);
  };

  const crearEmpleado = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const res = await fetch(`${API}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(nuevoEmpleado)
      });
      const data = await res.json();
      if (data.success) {
        setModalNuevo(false);
        setNuevoEmpleado({ first_name: '', last_name: '', mother_lastname: '', email: '', phone: '', username: '', password: '' });
        mostrarExito('¡Empleado registrado exitosamente!');
        await cargarEmpleados();
      } else {
        alert(data.error || 'Error al crear empleado');
      }
    } catch{
      alert('Error al conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  const editarEmpleado = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const res = await fetch(`${API}/empleados/${modalEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(modalEditar)
      });
      const data = await res.json();
      if (data.success) {
        setModalEditar(null);
        mostrarExito('¡Empleado actualizado exitosamente!');
        await cargarEmpleados();
      } else {
        alert(data.error || 'Error al actualizar');
      }
    } catch {
      alert('Error al conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const accion = nuevoEstado === 'active' ? 'activar' : 'inactivar';
    if (!window.confirm(`¿Estás seguro de ${accion} este empleado?`)) return;
    try {
      await fetch(`${API}/empleados/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: nuevoEstado })
      });
      mostrarExito(`Empleado ${accion === 'activar' ? 'activado' : 'inactivado'} correctamente`);
      await cargarEmpleados();
    } catch{
      alert('Error al cambiar estado');
    }
  };

  const resetPassword = async (e) => {
  e.preventDefault();
  if (nuevaPassword.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  try {
    setGuardando(true);
    const res = await fetch(`${API}/empleados/${modalReset.id}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ nueva_password: nuevaPassword })
    });
    const data = await res.json();
    if (data.success) {
      setModalReset(null);
      setNuevaPassword('');
      mostrarExito('¡Contraseña actualizada exitosamente!');
    } else {
      alert(data.error || 'Error al resetear contraseña');
    }
  } catch {
    alert('Error al conectar con el servidor');
  } finally {
    setGuardando(false);
  }
};

  const empleadosFiltrados = empleados.filter(e =>
    e.first_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.last_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.username?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const inputStyle = {
    width: '100%', padding: '0.6rem', borderRadius: 8,
    border: '2px solid #e5e7eb', fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '0.85rem', color: '#6b7280', display: 'block', marginBottom: 4 };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, border: '4px solid #f3f4f6', borderTop: '4px solid #ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#374151', fontWeight: 600 }}>Cargando empleados...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Alerta éxito */}
      {exito && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', border: '3px solid #10b981', borderRadius: 16, padding: '32px 48px', textAlign: 'center', zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>{exito}</p>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'linear-gradient(to right, #db2777, #be185d)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', background: '#facc15', color: '#be185d', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>JM</div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Juguetería Martínez</h1>
            <p style={{ fontSize: '0.85rem', color: '#ffddee', margin: 0 }}>Panel Administrativo</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', color: 'white', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
          ← Volver al Dashboard
        </button>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ width: '16rem', background: 'white', minHeight: '100vh', boxShadow: '2px 0 10px rgba(0,0,0,0.05)', padding: '1rem' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { to: '/admin', label: '📊 Dashboard' },
              { to: '/admin/productos', label: '📦 Productos' },
              { to: '/admin/ventas', label: '💰 Ventas' },
              { to: '/admin/inventario', label: '📋 Inventario' },
              { to: '/admin/clientes', label: '👥 Clientes' },
              { to: '/admin/empleados', label: '👨‍💼 Empleados', active: true },
              { to: '/admin/apartados', label: '🏷️ Apartados' },
              { to: '/admin/reportes', label: '📈 Reportes' },
              { to: '/admin/respaldos', label: '🗄️ Respaldos' },
            ].map((item) => (
              <button key={item.to} onClick={() => navigate(item.to)}
                style={{ cursor: 'pointer', color: item.active ? '#db2777' : '#555', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: item.active ? 600 : 500, background: item.active ? '#fce7f3' : 'transparent', border: 'none', textAlign: 'left', fontFamily: "'Poppins', sans-serif", fontSize: '0.95rem' }}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '2rem' }}>

          {/* Título */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>👨‍💼 Gestión de Empleados</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{empleados.length} empleados registrados</p>
            </div>
            <button onClick={() => setModalNuevo(true)}
              style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + Nuevo Empleado
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Empleados', value: empleados.length, icon: '👨‍💼', color: 'linear-gradient(135deg,#ec4899,#db2777)' },
              { label: 'Activos', value: empleados.filter(e => e.status === 'active').length, icon: '✅', color: 'linear-gradient(135deg,#10b981,#059669)' },
              { label: 'Inactivos', value: empleados.filter(e => e.status !== 'active').length, icon: '⛔', color: 'linear-gradient(135deg,#6b7280,#374151)' },
            ].map((c, i) => (
              <div key={i} style={{ background: c.color, color: 'white', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{c.icon}</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{c.value}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Buscador */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>🔍</span>
            <input type="text" placeholder="Buscar por nombre, email o usuario..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem' }} />
            <button onClick={cargarEmpleados}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              🔄 Actualizar
            </button>
          </div>

          {/* Tabla */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['ID', 'Nombre Completo', 'Email', 'Teléfono', 'Usuario', 'Estado', 'Último Acceso', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', color: '#374151', fontWeight: 700, fontSize: '0.85rem', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                      <p>No se encontraron empleados</p>
                    </td>
                  </tr>
                ) : (
                  empleadosFiltrados.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef3f7'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '1rem', color: '#db2777', fontWeight: 700 }}>#{emp.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>
                        {capitalizarNombre(emp.first_name)} {capitalizarNombre(emp.last_name)} {capitalizarNombre(emp.mother_lastname)}
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>{emp.email}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{emp.phone || 'N/A'}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>@{emp.username}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: emp.status === 'active' ? '#d1fae5' : '#fee2e2', color: emp.status === 'active' ? '#065f46' : '#991b1b' }}>
                          {emp.status === 'active' ? '✅ Activo' : '⛔ Inactivo'}
                        </span>
                        </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {emp.last_login ? new Date(emp.last_login).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'Nunca'}
                            </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => setModalEditar({ ...emp })}
                            style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => { setModalReset(emp); setNuevaPassword(''); }}
                            style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            🔑 Reset
                            </button>
                          <button onClick={() => cambiarEstado(emp.id, emp.status === 'active' ? 'inactive' : 'active')}
                            style={{ background: emp.status === 'active' ? '#fee2e2' : '#d1fae5', color: emp.status === 'active' ? '#dc2626' : '#059669', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            {emp.status === 'active' ? '⛔ Inactivar' : '✅ Activar'}
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

      {/* Modal Nuevo Empleado */}
      {modalNuevo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 550, width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0, color: '#db2777' }}>👨‍💼 Nuevo Empleado</h2>
              <button onClick={() => setModalNuevo(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={crearEmpleado}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Nombre *', key: 'first_name', required: true },
                  { label: 'Apellido Paterno *', key: 'last_name', required: true },
                  { label: 'Apellido Materno', key: 'mother_lastname', required: false },
                  { label: 'Teléfono', key: 'phone', required: false },
                  { label: 'Email *', key: 'email', required: true, type: 'email' },
                  { label: 'Usuario *', key: 'username', required: true },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type || 'text'} value={nuevoEmpleado[f.key]} required={f.required}
                      onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, [f.key]: e.target.value })}
                      style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Contraseña *</label>
                  <input type="password" value={nuevoEmpleado.password} required
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, password: e.target.value })}
                    style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalNuevo(false)}
                  style={{ flex: 1, padding: '10px', background: 'white', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  {guardando ? 'Guardando...' : '✅ Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Empleado */}
      {modalEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 550, width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, margin: 0, color: '#db2777' }}>✏️ Editar Empleado</h2>
              <button onClick={() => setModalEditar(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <form onSubmit={editarEmpleado}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Nombre *', key: 'first_name', required: true },
                  { label: 'Apellido Paterno *', key: 'last_name', required: true },
                  { label: 'Apellido Materno', key: 'mother_lastname', required: false },
                  { label: 'Teléfono', key: 'phone', required: false },
                  { label: 'Email *', key: 'email', required: true, type: 'email' },
                  { label: 'Usuario *', key: 'username', required: true },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type || 'text'} value={modalEditar[f.key] || ''} required={f.required}
                      onChange={(e) => setModalEditar({ ...modalEditar, [f.key]: e.target.value })}
                      style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalEditar(null)}
                  style={{ flex: 1, padding: '10px', background: 'white', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalReset && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, margin: 0, color: '#d97706' }}>🔑 Resetear Contraseña</h2>
        <button onClick={() => setModalReset(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Empleado: <strong>{modalReset.first_name} {modalReset.last_name}</strong>
      </p>
      <form onSubmit={resetPassword}>
        <label style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginBottom: 4 }}>Nueva Contraseña *</label>
        <input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required minLength={6}
          placeholder="Mínimo 6 caracteres"
          style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '2px solid #e5e7eb', fontFamily: "'Poppins', sans-serif", marginBottom: '1.5rem', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => setModalReset(null)}
            style={{ flex: 1, padding: '10px', background: 'white', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando}
            style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            {guardando ? 'Guardando...' : '🔑 Actualizar'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
    
  );
};

export default GestionEmpleados;