import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import productosService from "../services/productosService";
import "./Administrador.css";

const Administrador = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando estadísticas del dashboard...');
      const data = await productosService.getStats();
      console.log('✅ Estadísticas cargadas:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Formatear números con separador de miles
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  // Formatear moneda
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num);
  };

  return (
    <div className="admin-body">
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
            <button className="header-button">
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
            </button>
            <div className="header-user">
              <span>Admin</span>
              <div className="user-avatar"></div>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-button"
              title="Cerrar Sesión"
            >
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className="sidebar">
  <nav>
    <Link to="/admin" className="active">
      Dashboard
    </Link>
    <Link to="/admin/productos">📦 Productos</Link>
    <Link to="/admin/productos/nuevo" style={{ 
      paddingLeft: '2rem', 
      fontSize: '0.9rem',
      color: '#6b7280' 
    }}>
      ➕ Nuevo Producto
    </Link>
    <Link to="/admin/ventas">Ventas</Link>
    <Link to="/admin/inventario">Inventario</Link>
    <Link to="/admin/apartados">Apartados</Link>
    <Link to="/admin/clientes">Clientes</Link>
    <Link to="/admin/reportes">Reportes</Link>
  </nav>
</aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="section-header">
            <h2>Dashboard</h2>
            <p>Resumen general del negocio</p>
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '4rem',
              fontSize: '1.2rem',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #ec4899',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '1rem'
              }}></div>
              Cargando estadísticas...
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="card pink">
                  <h3>{formatCurrency(stats.resumen.valor_inventario)}</h3>
                  <p>Valor del Inventario</p>
                </div>
                <div className="card cyan">
                  <h3>{formatNumber(stats.resumen.total_productos)}</h3>
                  <p>Productos Diferentes</p>
                </div>
                <div className="card yellow">
                  <h3>{formatNumber(stats.resumen.total_unidades)}</h3>
                  <p>Unidades en Stock</p>
                </div>
                <div className="card purple">
                  <h3>{stats.resumen.productos_stock_bajo}</h3>
                  <p>Productos con Stock Bajo</p>
                </div>
              </div>

              {/* Charts and Tables */}
              <div className="data-grid">
                {/* Distribución por Categorías */}
                <div className="data-box">
                  <h3>📊 Distribución por Categorías</h3>
                  {stats.por_categoria.map((cat, index) => {
                    const totalProductos = stats.resumen.total_productos;
                    const porcentaje = ((cat.cantidad_productos / totalProductos) * 100).toFixed(1);
                    
                    return (
                      <div key={index} className="item">
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                            {cat.categoria.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            {cat.cantidad_productos} productos ({porcentaje}%)
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${porcentaje}%`,
                            height: '100%',
                            background: 'linear-gradient(to right, #ec4899, #db2777)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          {formatNumber(cat.unidades_totales)} unidades totales
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Productos con Stock Bajo */}
                <div className="data-box">
                  <h3>⚠️ Productos con Stock Bajo</h3>
                  {stats.stock_bajo.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                      <p>Todos los productos tienen stock suficiente</p>
                    </div>
                  ) : (
                    stats.stock_bajo.map((producto, index) => (
                      <div key={index} className="item">
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          {producto.imagen ? (
                            <img 
                              src={producto.imagen}
                              alt={producto.nombre}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                background: '#f9fafb'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              background: '#f3f4f6',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem'
                            }}>📦</div>
                          )}
                          <div style={{ flex: 1 }}>
                            <span>{producto.nombre}</span>
                            <p>SKU: {producto.sku} • {formatCurrency(producto.precio)}</p>
                          </div>
                          <div style={{
                            background: producto.cantidad === 0 ? '#fee2e2' : '#fef3c7',
                            color: producto.cantidad === 0 ? '#dc2626' : '#f59e0b',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '700'
                          }}>
                            {producto.cantidad} uds
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '4rem',
              fontSize: '1.2rem',
              color: '#ef4444'
            }}>
              ❌ Error al cargar estadísticas
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Administrador;