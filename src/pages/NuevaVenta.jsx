import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productosService from '../services/productosService';
import clientesService from '../services/clientesService';
import ventasService from '../services/ventasService';
import './NuevaVenta.css';

const NuevaVenta = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [venta, setVenta] = useState({
    id_usuario: '',
    metodo_pago: 'efectivo',
    descuento: 0,
    notas: '',
    productos: []
  });

  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
const [clientesFiltrados, setClientesFiltrados] = useState([]);
const [mostrarClientes, setMostrarClientes] = useState(false);
const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (busquedaProducto.length > 0) {
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.sku.toLowerCase().includes(busquedaProducto.toLowerCase())
      );
      setProductosFiltrados(filtrados);
      setMostrarProductos(true);
    } else {
      setMostrarProductos(false);
    }
  }, [busquedaProducto, productos]);

    useEffect(() => {
    if (busquedaCliente.length > 0) {
        const filtrados = clientes.filter(c =>
        c.first_name.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.last_name.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.email.toLowerCase().includes(busquedaCliente.toLowerCase())
        );
        setClientesFiltrados(filtrados);
        setMostrarClientes(true);
    } else {
        setMostrarClientes(false);
    }
    }, [busquedaCliente, clientes]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosData, clientesData] = await Promise.all([
        productosService.getAll(),
        clientesService.getAll()
      ]);
      
      // Solo productos activos con stock
      const productosDisponibles = productosData.filter(p => p.cantidad > 0);
      setProductos(productosDisponibles);
      setClientes(clientesData);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

    const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setVenta({...venta, id_usuario: cliente.id});
    setBusquedaCliente('');
    setMostrarClientes(false);
    };

  const agregarProducto = (producto) => {
    const productoExiste = venta.productos.find(p => p.id_producto === producto.id_producto);
    
    if (productoExiste) {
      // Incrementar cantidad si ya existe
      if (productoExiste.cantidad < producto.cantidad) {
        setVenta({
          ...venta,
          productos: venta.productos.map(p =>
            p.id_producto === producto.id_producto
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          )
        });
      } else {
        alert(`Stock insuficiente. Disponible: ${producto.cantidad}`);
      }
    } else {
      // Agregar nuevo producto
      setVenta({
        ...venta,
        productos: [...venta.productos, {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_unitario: producto.precio,
          cantidad: 1,
          stock_disponible: producto.cantidad,
          imagen: producto.imagen
        }]
      });
    }
    
    setBusquedaProducto('');
    setMostrarProductos(false);
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    const producto = venta.productos.find(p => p.id_producto === id_producto);
    
    if (nuevaCantidad > producto.stock_disponible) {
      alert(`Stock insuficiente. Disponible: ${producto.stock_disponible}`);
      return;
    }

    if (nuevaCantidad <= 0) {
      eliminarProducto(id_producto);
      return;
    }

    setVenta({
      ...venta,
      productos: venta.productos.map(p =>
        p.id_producto === id_producto
          ? { ...p, cantidad: parseInt(nuevaCantidad) }
          : p
      )
    });
  };

  const eliminarProducto = (id_producto) => {
    setVenta({
      ...venta,
      productos: venta.productos.filter(p => p.id_producto !== id_producto)
    });
  };

  const calcularSubtotal = () => {
    return venta.productos.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - venta.descuento;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (venta.productos.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    if (!venta.id_usuario) {
      alert('Selecciona un cliente');
      return;
    }

    try {
      setGuardando(true);
      
      const ventaData = {
        id_usuario: parseInt(venta.id_usuario),
        metodo_pago: venta.metodo_pago,
        descuento: parseFloat(venta.descuento) || 0,
        notas: venta.notas,
        productos: venta.productos.map(p => ({
          id_producto: p.id_producto,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario
        }))
      };

      const resultado = await ventasService.create(ventaData);
      
      alert(`✅ Venta creada exitosamente\nFolio: ${resultado.folio}`);
      navigate('/admin/ventas');
      
    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      alert(error.response?.data?.details || 'Error al crear la venta');
    } finally {
      setGuardando(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="nueva-venta-container">
      {/* Header */}
      <header className="venta-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-circle">JM</div>
            <div>
              <h1>🛒 Nueva Venta</h1>
              <p>Registra una nueva venta</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/ventas')}
            className="btn-back"
          >
            ← Volver al Historial
          </button>
        </div>
      </header>

      <div className="venta-content">
        <form onSubmit={handleSubmit}>
          <div className="venta-grid">
            {/* Panel izquierdo - Productos */}
            <div className="panel-productos">
              <div className="panel-header">
                <h2>Productos</h2>
                <p>{venta.productos.length} productos agregados</p>
              </div>

              {/* Búsqueda de productos */}
              <div className="busqueda-producto">
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="input-busqueda"
                />
                
                {mostrarProductos && productosFiltrados.length > 0 && (
                  <div className="resultados-busqueda">
                    {productosFiltrados.map(producto => (
                      <div
                        key={producto.id_producto}
                        className="resultado-item"
                        onClick={() => agregarProducto(producto)}
                      >
                        {producto.imagen && (
                          <img src={producto.imagen} alt={producto.nombre} />
                        )}
                        <div className="resultado-info">
                          <strong>{producto.nombre}</strong>
                          <p>SKU: {producto.sku} • Stock: {producto.cantidad}</p>
                          <span className="precio">{formatCurrency(producto.precio)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de productos agregados */}
              <div className="productos-agregados">
                {venta.productos.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <p>No hay productos agregados</p>
                    <small>Busca y selecciona productos arriba</small>
                  </div>
                ) : (
                  venta.productos.map(producto => (
                    <div key={producto.id_producto} className="producto-item">
                      {producto.imagen && (
                        <img src={producto.imagen} alt={producto.nombre} />
                      )}
                      <div className="producto-info">
                        <strong>{producto.nombre}</strong>
                        <p>{formatCurrency(producto.precio_unitario)}</p>
                      </div>
                      <div className="producto-cantidad">
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(producto.id_producto, producto.cantidad - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => actualizarCantidad(producto.id_producto, e.target.value)}
                          min="1"
                          max={producto.stock_disponible}
                        />
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(producto.id_producto, producto.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="producto-subtotal">
                        {formatCurrency(producto.precio_unitario * producto.cantidad)}
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarProducto(producto.id_producto)}
                        className="btn-eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Panel derecho - Detalles de venta */}
            <div className="panel-detalles">
              <div className="panel-header">
                <h2>Detalles de la Venta</h2>
              </div>

            <div className="form-group">
            <label>Cliente *</label>
            
            {clienteSeleccionado ? (
                <div className="cliente-seleccionado">
                <div className="cliente-info">
                    <strong>{clienteSeleccionado.first_name} {clienteSeleccionado.last_name}</strong>
                    <p>{clienteSeleccionado.email}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                    setClienteSeleccionado(null);
                    setVenta({...venta, id_usuario: ''});
                    }}
                    className="btn-cambiar-cliente"
                >
                    Cambiar
                </button>
                </div>
            ) : (
                <div className="busqueda-cliente">
                <input
                    type="text"
                    placeholder="Buscar cliente por nombre o email..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="input-busqueda"
                />
                
                {mostrarClientes && clientesFiltrados.length > 0 && (
                    <div className="resultados-busqueda">
                    {clientesFiltrados.map(cliente => (
                        <div
                        key={cliente.id}
                        className="resultado-cliente"
                        onClick={() => seleccionarCliente(cliente)}
                        >
                        <div className="cliente-avatar">
                            {cliente.first_name.charAt(0)}{cliente.last_name.charAt(0)}
                        </div>
                        <div className="cliente-datos">
                            <strong>{cliente.first_name} {cliente.last_name}</strong>
                            <p>{cliente.email}</p>
                            {cliente.phone && <small>📱 {cliente.phone}</small>}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                
                {mostrarClientes && clientesFiltrados.length === 0 && (
                    <div className="no-resultados">
                    <p>No se encontraron clientes</p>
                    </div>
                )}
                </div>
            )}
            </div>

              <div className="form-group">
                <label>Método de Pago *</label>
                <select
                  value={venta.metodo_pago}
                  onChange={(e) => setVenta({...venta, metodo_pago: e.target.value})}
                  required
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="otro">💰 Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descuento</label>
                <input
                  type="number"
                  value={venta.descuento}
                  onChange={(e) => setVenta({...venta, descuento: e.target.value})}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  value={venta.notas}
                  onChange={(e) => setVenta({...venta, notas: e.target.value})}
                  rows="3"
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Resumen */}
              <div className="resumen-venta">
                <div className="resumen-item">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(calcularSubtotal())}</strong>
                </div>
                <div className="resumen-item">
                  <span>Descuento:</span>
                  <strong className="descuento">-{formatCurrency(venta.descuento)}</strong>
                </div>
                <div className="resumen-item total">
                  <span>TOTAL:</span>
                  <strong>{formatCurrency(calcularTotal())}</strong>
                </div>
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin/ventas')}
                  className="btn-cancel"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={guardando || venta.productos.length === 0}
                >
                  {guardando ? 'Procesando...' : '💰 Completar Venta'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaVenta;