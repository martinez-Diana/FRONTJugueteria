import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ventasService from "../services/ventasService";
import "./HistorialVentas.css";

function HistorialVentas() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    estado: '',
    metodo_pago: ''
  });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando ventas y estadísticas...');
      
      const [ventasData, statsData] = await Promise.all([
        ventasService.getAll(),
        ventasService.getStats()
      ]);
      
      console.log('✅ Datos cargados');
      setVentas(ventasData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      alert('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num || 0);
  };

  const formatDate = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetodoPagoIcon = (metodo) => {
    const iconos = {
      'efectivo': '💵',
      'tarjeta': '💳',
      'transferencia': '🏦',
      'otro': '💰'
    };
    return iconos[metodo] || '💰';
  };

  const getMetodoPagoNombre = (metodo) => {
    const nombres = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'otro': 'Otro'
    };
    return nombres[metodo] || metodo;
  };

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      'completada': 'status-completed',
      'pendiente': 'status-pending',
      'cancelada': 'status-cancelled'
    };
    return clases[estado] || 'status-pending';
  };

  const getEstadoNombre = (estado) => {
    const nombres = {
      'completada': 'Completada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada'
    };
    return nombres[estado] || estado;
  };

  const ventasFiltradas = ventas.filter(venta => {
    const matchBusqueda = 
      venta.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      (venta.first_name && venta.first_name.toLowerCase().includes(busqueda.toLowerCase())) ||
      (venta.last_name && venta.last_name.toLowerCase().includes(busqueda.toLowerCase()));
    
    return matchBusqueda;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #ec4899',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '20px', color: '#374151', fontWeight: '600' }}>
            Cargando ventas...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="logo">🧸 Juguetería Martínez</div>
        <div className="nav-links">
          <a onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Dashboard</a>
          <a onClick={() => navigate('/admin/ventas')} style={{ cursor: 'pointer' }}>Punto de Venta</a>
          <a onClick={() => navigate('/admin/productos')} style={{ cursor: 'pointer' }}>Inventario</a>
          <a onClick={() => navigate('/admin/reportes')} style={{ cursor: 'pointer' }}>Reportes</a>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Historial de Ventas</h1>
          <div className="header-actions">
            <button className="btn btn-secondary">📊 Exportar Excel</button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/admin/ventas/nueva')}
            >
              + Nueva Venta
            </button>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Fecha Inicio</label>
              <input 
                type="date" 
                value={filtros.fecha_inicio}
                onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>Fecha Fin</label>
              <input 
                type="date" 
                value={filtros.fecha_fin}
                onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Método de Pago</label>
              <select
                value={filtros.metodo_pago}
                onChange={(e) => setFiltros({...filtros, metodo_pago: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Ventas Totales</div>
              <div className="stat-value">{formatCurrency(stats.resumen.ventas_totales)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-label">Número de Ventas</div>
              <div className="stat-value">{stats.resumen.ventas_completadas}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-label">Ticket Promedio</div>
              <div className="stat-value">{formatCurrency(stats.resumen.ticket_promedio)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Completadas</div>
              <div className="stat-value">{stats.resumen.ventas_completadas}</div>
            </div>
          </div>
        )}

        <div className="sales-table-card">
          <div className="table-header">
            <h2>Registro de Ventas</h2>
            <div className="search-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por ID, cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map(venta => (
                <tr key={venta.id_venta}>
                  <td className="sale-id">#{venta.folio}</td>
                  <td>{formatDate(venta.fecha_venta)}</td>
                  <td>
                    {venta.first_name && venta.last_name 
                      ? `${venta.first_name} ${venta.last_name}`
                      : 'Cliente General'}
                  </td>
                  <td>{venta.total_productos} productos</td>
                  <td>{formatCurrency(venta.total)}</td>
                  <td>
                    {getMetodoPagoIcon(venta.metodo_pago)} {getMetodoPagoNombre(venta.metodo_pago)}
                  </td>
                  <td>
                    <span className={`status-badge ${getEstadoBadgeClass(venta.estado)}`}>
                      {getEstadoNombre(venta.estado)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn btn-view"
                        onClick={() => navigate(`/admin/ventas/${venta.id_venta}`)}
                      >
                        👁️ Ver
                      </button>
                      <button className="action-btn btn-print">🖨️ Ticket</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ventasFiltradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>No se encontraron ventas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorialVentas;