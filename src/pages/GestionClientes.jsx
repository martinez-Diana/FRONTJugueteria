import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientesService from '../services/clientesService';
import './GestionClientes.css';

const capitalizarNombre = (texto) => {
  if (!texto) return '';
  return texto
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
};

const GestionClientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalSinCuenta, setMostrarModalSinCuenta] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [exportExito, setExportExito] = useState(false);

  // Estado para cliente sin cuenta
  const [clienteSinCuenta, setClienteSinCuenta] = useState({
    first_name: '',
    last_name: '',
    mother_lastname: '',
    phone: '',
    direccion: '',
    notas: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientesData, statsData] = await Promise.all([
        clientesService.getAll(),
        clientesService.getStats()
      ]);
      setClientes(clientesData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('No se pudieron cargar los datos. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cliente) => {
    setClienteEditar({
      id: cliente.id,
      first_name: cliente.first_name,
      last_name: cliente.last_name,
      mother_lastname: cliente.mother_lastname || '',
      email: cliente.email,
      phone: cliente.phone || '',
      role_id: cliente.role_id
    });
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await clientesService.update(clienteEditar.id, clienteEditar);
      await cargarDatos();
      setMostrarModal(false);
      setClienteEditar(null);
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
    try {
      await clientesService.delete(id);
      await cargarDatos();
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const exportarClientes = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/exportar/clientes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportExito(true);
    setTimeout(() => setExportExito(false), 4000);
  } catch {
    alert('Error al exportar clientes');
  }
};

  // ✅ REGISTRAR CLIENTE SIN CUENTA
  const handleRegistrarSinCuenta = async (e) => {
    e.preventDefault();

    if (!clienteSinCuenta.first_name.trim() || !clienteSinCuenta.last_name.trim()) {
      alert('⚠️ El nombre y apellido son obligatorios');
      return;
    }

    try {
      setGuardando(true);

      // Generar username y email temporales únicos
      const timestamp = Date.now();
      const username = `cliente_tienda_${timestamp}`;
      const email = `tienda_${timestamp}@sinregistro.local`;
      const password = `temp_${timestamp}`;

      const nuevoCliente = {
        username,
        email,
        password,
        first_name: clienteSinCuenta.first_name.trim(),
        last_name: clienteSinCuenta.last_name.trim(),
        mother_lastname: clienteSinCuenta.mother_lastname.trim(),
        phone: clienteSinCuenta.phone.trim(),
        role_id: 3, // Cliente
        sin_cuenta: true,
        notas: clienteSinCuenta.notas
      };

      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      });

      const data = await response.json();

      if (response.ok || data.success) {
        alert(`✅ Cliente registrado correctamente:\n${capitalizarNombre(clienteSinCuenta.first_name)} ${capitalizarNombre(clienteSinCuenta.last_name)}`);
        setMostrarModalSinCuenta(false);
        setClienteSinCuenta({
          first_name: '', last_name: '', mother_lastname: '',
          phone: '', direccion: '', notas: ''
        });
        await cargarDatos();
      } else {
        alert(`❌ Error: ${data.message || 'No se pudo registrar el cliente'}`);
      }

    } catch (error) {
      console.error('❌ Error al registrar cliente sin cuenta:', error);
      alert('❌ Error al registrar el cliente');
    } finally {
      setGuardando(false);
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.first_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.last_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.username?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getRolNombre = (role_id) => {
    const roles = { 1: 'Administrador', 2: 'Empleado', 3: 'Cliente' };
    return roles[role_id] || 'Desconocido';
  };

  const getRolColor = (role_id) => {
    const colores = { 1: '#ec4899', 2: '#3b82f6', 3: '#10b981' };
    return colores[role_id] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', border: '4px solid #f3f4f6',
            borderTop: '4px solid #ec4899', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '20px', color: '#374151', fontWeight: '600' }}>Cargando clientes...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)', padding: '24px'
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          padding: '48px', maxWidth: '500px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Error al cargar clientes
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button onClick={cargarDatos} style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            color: 'white', border: 'none', padding: '12px 32px',
            borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-clientes">
      {/* Header */}
      <header className="clientes-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-circle">JM</div>
            <div>
              <h1 className="page-title">👥 Gestión de Clientes</h1>
              <p className="page-subtitle">{clientesFiltrados.length} clientes registrados</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* ✅ BOTÓN NUEVO: Registrar sin cuenta */}
            <button
              onClick={() => setMostrarModalSinCuenta(true)}
              className="btn-sin-cuenta"
            >
              🏪 Cliente en Tienda
            </button>
            <button onClick={() => navigate('/admin')} className="btn-back">
              ← Volver al Dashboard
            </button>

            <button
              onClick={exportarClientes}
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
            >
              ⬇️ Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {exportExito && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white", border: "3px solid #10b981",
          borderRadius: "16px", padding: "32px 48px",
          textAlign: "center", zIndex: 9999,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <p style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0 }}>
            ¡Exportación exitosa!
          </p>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
            El archivo CSV fue descargado correctamente
          </p>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card pink">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.resumen.total_clientes}</h3>
              <p>Total Clientes</p>
            </div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.resumen.nuevos_hoy}</h3>
              <p>Nuevos Hoy</p>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.resumen.nuevos_semana}</h3>
              <p>Esta Semana</p>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.resumen.nuevos_mes}</h3>
              <p>Este Mes</p>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="search-container">
        <div className="search-box">
          <svg width="20" height="20" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button onClick={cargarDatos} className="btn-refresh">🔄 Actualizar</button>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(cliente => (
              <tr key={cliente.id}>
                <td>#{cliente.id}</td>
                <td>
                  <strong>
                    {capitalizarNombre(cliente.first_name)} {capitalizarNombre(cliente.last_name)} {capitalizarNombre(cliente.mother_lastname)}
                  </strong>
                  {/* Badge para clientes sin cuenta */}
                  {cliente.email?.includes('@sinregistro.local') && (
                    <span style={{
                      marginLeft: '8px', background: '#fef3c7', color: '#d97706',
                      padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600'
                    }}>
                      🏪 Tienda
                    </span>
                  )}
                </td>
                <td>
                  {cliente.email?.includes('@sinregistro.local')
                    ? <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin cuenta</span>
                    : cliente.email
                  }
                </td>
                <td>{cliente.phone || 'N/A'}</td>
                <td>@{cliente.username}</td>
                <td>
                  <span
                    className="role-badge"
                    style={{ background: getRolColor(cliente.role_id) + '20', color: getRolColor(cliente.role_id) }}
                  >
                    {getRolNombre(cliente.role_id)}
                  </span>
                </td>
                <td>{new Date(cliente.created_at).toLocaleDateString('es-MX')}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEditar(cliente)} className="btn-edit" title="Editar cliente">✏️</button>
                    <button onClick={() => handleEliminar(cliente.id, `${cliente.first_name} ${cliente.last_name}`)} className="btn-delete" title="Eliminar cliente">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientesFiltrados.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* ✅ MODAL: Registrar Cliente sin Cuenta */}
      {mostrarModalSinCuenta && (
        <div className="modal-overlay" onClick={() => setMostrarModalSinCuenta(false)}>
          <div className="modal-content modal-sin-cuenta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <div>
                <h2>🏪 Registrar Cliente en Tienda</h2>
                <p style={{ fontSize: '0.9rem', color: '#92400e', margin: '0.5rem 0 0 0' }}>
                  Para clientes que compran en tienda física sin crear cuenta
                </p>
              </div>
              <button onClick={() => setMostrarModalSinCuenta(false)} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleRegistrarSinCuenta}>
              <div className="form-grid" style={{ padding: '1.5rem' }}>

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={clienteSinCuenta.first_name}
                    onChange={(e) => setClienteSinCuenta({...clienteSinCuenta, first_name: e.target.value})}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido Paterno *</label>
                  <input
                    type="text"
                    value={clienteSinCuenta.last_name}
                    onChange={(e) => setClienteSinCuenta({...clienteSinCuenta, last_name: e.target.value})}
                    placeholder="Apellido paterno"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido Materno</label>
                  <input
                    type="text"
                    value={clienteSinCuenta.mother_lastname}
                    onChange={(e) => setClienteSinCuenta({...clienteSinCuenta, mother_lastname: e.target.value})}
                    placeholder="Apellido materno (opcional)"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={clienteSinCuenta.phone}
                    onChange={(e) => setClienteSinCuenta({...clienteSinCuenta, phone: e.target.value})}
                    placeholder="555-123-4567 (opcional)"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notas adicionales</label>
                  <textarea
                    value={clienteSinCuenta.notas}
                    onChange={(e) => setClienteSinCuenta({...clienteSinCuenta, notas: e.target.value})}
                    placeholder="Notas sobre el cliente (opcional)..."
                    rows="3"
                    style={{
                      width: '100%', padding: '0.8rem', border: '2px solid #e5e7eb',
                      borderRadius: '10px', fontFamily: 'inherit', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Info box */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: '#fffbeb',
                  border: '2px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#92400e'
                }}>
                  <strong>ℹ️ Información:</strong> Este cliente será registrado sin acceso al sistema web.
                  Se identificará con el badge <strong>"🏪 Tienda"</strong> en la lista de clientes.
                  Solo se requiere nombre y apellido.
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setMostrarModalSinCuenta(false)}
                  className="btn-cancel"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={guardando}
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {guardando ? 'Registrando...' : '🏪 Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición (existente) */}
      {mostrarModal && clienteEditar && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>✏️ Editar Cliente</h2>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  {capitalizarNombre(clienteEditar.first_name)} {capitalizarNombre(clienteEditar.last_name)} {capitalizarNombre(clienteEditar.mother_lastname)}
                </p>
              </div>
              <button onClick={() => setMostrarModal(false)} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleGuardar}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={clienteEditar.first_name}
                    onChange={(e) => setClienteEditar({...clienteEditar, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido Paterno *</label>
                  <input
                    type="text"
                    value={clienteEditar.last_name}
                    onChange={(e) => setClienteEditar({...clienteEditar, last_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido Materno</label>
                  <input
                    type="text"
                    value={clienteEditar.mother_lastname}
                    onChange={(e) => setClienteEditar({...clienteEditar, mother_lastname: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={clienteEditar.email}
                    onChange={(e) => setClienteEditar({...clienteEditar, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={clienteEditar.phone}
                    onChange={(e) => setClienteEditar({...clienteEditar, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={clienteEditar.role_id}
                    onChange={(e) => setClienteEditar({...clienteEditar, role_id: parseInt(e.target.value)})}
                    required
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Empleado</option>
                    <option value={3}>Cliente</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn-cancel" disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={guardando}>
                  {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;