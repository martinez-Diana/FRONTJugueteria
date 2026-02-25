import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MensajesContacto.css';

const MensajesContacto = () => {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, leidos, no_leidos
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar mensajes
  const cargarMensajes = async () => {
    try {
      setLoading(true);
      const query = filtro !== 'todos' ? `?leido=${filtro === 'leidos' ? 'true' : 'false'}` : '';
      
      const response = await fetch(`http://localhost:4000/api/contacto${query}`);
      const data = await response.json();

      if (data.success) {
        setMensajes(data.mensajes);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      alert('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contacto/stats/resumen');
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    cargarMensajes();
    cargarEstadisticas();
  }, [filtro]);

  // Ver detalle del mensaje
  const verDetalle = async (mensaje) => {
    setSelectedMensaje(mensaje);
    setShowModal(true);

    // Marcar como leído si no lo está
    if (!mensaje.leido) {
      await marcarComoLeido(mensaje.id);
    }
  };

  // Marcar como leído
  const marcarComoLeido = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/contacto/${id}/leer`, {
        method: 'PATCH'
      });

      if (response.ok) {
        // Actualizar la lista
        setMensajes(mensajes.map(m => 
          m.id === id ? { ...m, leido: true } : m
        ));
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error al marcar mensaje:', error);
    }
  };

  // Eliminar mensaje
  const eliminarMensaje = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este mensaje?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/contacto/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Mensaje eliminado correctamente');
        setMensajes(mensajes.filter(m => m.id !== id));
        setShowModal(false);
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('❌ Error al eliminar mensaje');
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedMensaje(null);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mensajes-contacto-container">
      {/* Header */}
      <div className="mensajes-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Volver al Dashboard
          </button>
          <h1>📧 Mensajes de Contacto</h1>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">{estadisticas.total}</span>
              <span className="stat-label">Total Mensajes</span>
            </div>
          </div>

          <div className="stat-card no-leidos">
            <div className="stat-icon">📬</div>
            <div className="stat-info">
              <span className="stat-value">{estadisticas.no_leidos}</span>
              <span className="stat-label">Sin Leer</span>
            </div>
          </div>

          <div className="stat-card leidos">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <span className="stat-value">{estadisticas.leidos}</span>
              <span className="stat-label">Leídos</span>
            </div>
          </div>

          <div className="stat-card dias">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-value">{estadisticas.dias_con_mensajes}</span>
              <span className="stat-label">Días Activos</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mensajes-filtros">
        <button 
          className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          📋 Todos
        </button>
        <button 
          className={`filtro-btn ${filtro === 'no_leidos' ? 'active' : ''}`}
          onClick={() => setFiltro('no_leidos')}
        >
          📬 Sin Leer
        </button>
        <button 
          className={`filtro-btn ${filtro === 'leidos' ? 'active' : ''}`}
          onClick={() => setFiltro('leidos')}
        >
          ✓ Leídos
        </button>
      </div>

      {/* Lista de mensajes */}
      <div className="mensajes-lista">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Cargando mensajes...</p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay mensajes</h3>
            <p>No se encontraron mensajes con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="mensajes-grid">
            {mensajes.map((mensaje) => (
              <div 
                key={mensaje.id} 
                className={`mensaje-card ${!mensaje.leido ? 'no-leido' : ''}`}
                onClick={() => verDetalle(mensaje)}
              >
                <div className="mensaje-header-card">
                  <div className="mensaje-avatar">
                    {mensaje.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="mensaje-info">
                    <h3>{mensaje.nombre}</h3>
                    <p className="mensaje-email">{mensaje.email}</p>
                  </div>
                  {!mensaje.leido && (
                    <span className="badge-no-leido">Nuevo</span>
                  )}
                </div>

                <div className="mensaje-asunto">
                  <strong>Asunto:</strong> {mensaje.asunto || 'Sin asunto'}
                </div>

                <div className="mensaje-preview">
                  {mensaje.mensaje.substring(0, 100)}
                  {mensaje.mensaje.length > 100 ? '...' : ''}
                </div>

                <div className="mensaje-footer">
                  <span className="mensaje-fecha">
                    📅 {formatearFecha(mensaje.fecha_envio)}
                  </span>
                  {mensaje.telefono && (
                    <span className="mensaje-telefono">
                      📞 {mensaje.telefono}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showModal && selectedMensaje && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-detalle" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={cerrarModal}>✖</button>

            <div className="modal-header">
              <div className="mensaje-avatar-large">
                {selectedMensaje.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="mensaje-info-large">
                <h2>{selectedMensaje.nombre}</h2>
                <p className="email-large">{selectedMensaje.email}</p>
                {selectedMensaje.telefono && (
                  <p className="telefono-large">📞 {selectedMensaje.telefono}</p>
                )}
              </div>
            </div>

            <div className="modal-body">
              <div className="detalle-item">
                <label>Asunto:</label>
                <p>{selectedMensaje.asunto || 'Sin asunto'}</p>
              </div>

              <div className="detalle-item">
                <label>Fecha de envío:</label>
                <p>{formatearFecha(selectedMensaje.fecha_envio)}</p>
              </div>

              <div className="detalle-item">
                <label>Estado:</label>
                <p>
                  <span className={`badge ${selectedMensaje.leido ? 'leido' : 'no-leido'}`}>
                    {selectedMensaje.leido ? '✓ Leído' : '📬 Sin leer'}
                  </span>
                </p>
              </div>

              <div className="detalle-item mensaje-completo">
                <label>Mensaje:</label>
                <div className="mensaje-texto">
                  {selectedMensaje.mensaje}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-eliminar"
                onClick={() => eliminarMensaje(selectedMensaje.id)}
              >
                🗑️ Eliminar Mensaje
              </button>
              <a 
                href={`mailto:${selectedMensaje.email}?subject=Re: ${selectedMensaje.asunto || 'Tu mensaje'}`}
                className="btn-responder"
              >
                📧 Responder por Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MensajesContacto;