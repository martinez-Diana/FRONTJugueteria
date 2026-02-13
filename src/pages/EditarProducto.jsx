import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productosService from '../services/productosService';
import './RegistrarProducto.css'; // Usamos los mismos estilos

const EditarProducto = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'educativo',
    marca: '',
    material: '',
    edad_recomendada: '',
    genero: 'unisex',
    color: '',
    dimensiones: '',
    tipo_juguete: '',
    proveedor: '',
    sku: '',
    imagen: '',
    cantidad: 0,
    precio: 0,
    precio_compra: 0
  });

  const categorias = [
    { value: 'educativo', label: 'Educativo' },
    { value: 'didactico', label: 'Didáctico' },
    { value: 'coleccionable', label: 'Coleccionable' },
    { value: 'electronico', label: 'Electrónico' },
    { value: 'peluches', label: 'Peluches' },
    { value: 'vehiculos', label: 'Vehículos' },
    { value: 'juegos_mesa', label: 'Juegos de Mesa' },
    { value: 'figuras_accion', label: 'Figuras de Acción' },
    { value: 'munecas', label: 'Muñecas' },
    { value: 'construccion', label: 'Construcción' }
  ];

  // Cargar datos del producto al montar el componente
  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoadingData(true);
      console.log(`🔍 Cargando producto con ID: ${id}`);
      const data = await productosService.getById(id);
      console.log('✅ Producto cargado:', data);
      setForm(data);
    } catch (error) {
      console.error('❌ Error al cargar producto:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Error al cargar el producto. Verifica que exista.'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    // Validaciones básicas
    if (!form.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre es obligatorio' });
      setLoading(false);
      return;
    }

    if (!form.sku.trim()) {
      setMensaje({ tipo: 'error', texto: 'El SKU es obligatorio' });
      setLoading(false);
      return;
    }

    if (parseFloat(form.precio) <= 0) {
      setMensaje({ tipo: 'error', texto: 'El precio debe ser mayor a 0' });
      setLoading(false);
      return;
    }

    try {
      console.log(`📝 Actualizando producto ${id}:`, form);
      await productosService.update(id, form);
      
      setMensaje({
        tipo: 'success',
        texto: '¡Producto actualizado exitosamente!'
      });

      // Redirigir al catálogo después de 2 segundos
      setTimeout(() => {
        navigate('/admin/productos');
      }, 2000);

    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.error || 'Error al actualizar producto. Verifica que el SKU no esté duplicado.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="registrar-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh' 
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
          <p style={{ fontSize: '18px', color: '#374151' }}>Cargando producto...</p>
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
    <div className="registrar-container">
      {/* Header */}
      <div className="registrar-header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/admin/productos')}
            className="back-button"
          >
            ← Volver al Catálogo
          </button>
          <div>
            <h1 className="page-title">✏️ Editar Producto</h1>
            <p className="page-subtitle">Actualiza la información del juguete</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="form-wrapper">
        <div className="form-container">
          
          {/* Mensaje de éxito/error */}
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              <span className="mensaje-icon">
                {mensaje.tipo === 'success' ? '✅' : '⚠️'}
              </span>
              <p>{mensaje.texto}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Sección 1: Información Básica */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">1</span>
                <h2>Información Básica</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Barbie Fashionista"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion || ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <div className="form-group">
                  <label>SKU (Código único) *</label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Ej: BAR-001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={form.marca || ''}
                    onChange={handleChange}
                    placeholder="Ej: Mattel"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Clasificación */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">2</span>
                <h2>Clasificación</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Género *</label>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    required
                  >
                    <option value="niño">Niño</option>
                    <option value="niña">Niña</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Juguete</label>
                  <input
                    type="text"
                    name="tipo_juguete"
                    value={form.tipo_juguete || ''}
                    onChange={handleChange}
                    placeholder="Ej: Muñeca, Carrito, Bloques"
                  />
                </div>

                <div className="form-group">
                  <label>Edad Recomendada</label>
                  <input
                    type="text"
                    name="edad_recomendada"
                    value={form.edad_recomendada || ''}
                    onChange={handleChange}
                    placeholder="Ej: 3+, 5-8 años"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Características Físicas */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">3</span>
                <h2>Características Físicas</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={form.material || ''}
                    onChange={handleChange}
                    placeholder="Ej: Plástico, Tela, Metal"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={form.color || ''}
                    onChange={handleChange}
                    placeholder="Ej: Rosa, Azul, Multicolor"
                  />
                </div>

                <div className="form-group">
                  <label>Dimensiones</label>
                  <input
                    type="text"
                    name="dimensiones"
                    value={form.dimensiones || ''}
                    onChange={handleChange}
                    placeholder="Ej: 20x15x10 cm"
                  />
                </div>

                <div className="form-group">
                  <label>Proveedor</label>
                  <input
                    type="text"
                    name="proveedor"
                    value={form.proveedor || ''}
                    onChange={handleChange}
                    placeholder="Ej: Distribuidora ABC"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Inventario y Precios */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">4</span>
                <h2>Inventario y Precios</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Cantidad en Stock *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio de Compra</label>
                  <input
                    type="number"
                    name="precio_compra"
                    value={form.precio_compra || 0}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Imagen */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">5</span>
                <h2>Imagen del Producto</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>URL de la Imagen</label>
                  <input
                    type="url"
                    name="imagen"
                    value={form.imagen || ''}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {form.imagen && (
                    <div className="image-preview">
                      <p className="preview-label">Vista previa:</p>
                      <img
                        src={form.imagen}
                        alt="Vista previa"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Error+al+cargar';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin/productos')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    💾 Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;