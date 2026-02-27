import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productosService from '../services/productosService';
import './RegistrarProducto.css';

const CLOUDINARY_CLOUD_NAME = 'dcq0kzlaz';
const CLOUDINARY_UPLOAD_PRESET = 'jugueteria_martinez';

const RegistrarProducto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showNuevaMarca, setShowNuevaMarca] = useState(false);
  const [nuevaMarcaInput, setNuevaMarcaInput] = useState('');
  const [subiendoImagenes, setSubiendoImagenes] = useState([false, false, false, false, false]);

  const [marcasDisponibles, setMarcasDisponibles] = useState([
    'Barbie', 'Hot Wheels', 'LEGO', 'Mattel', 'Hasbro',
    'Fisher-Price', 'Nerf', 'Playmobil', 'Funko', 'Disney',
    'Marvel', 'Star Wars', 'Paw Patrol', 'Peppa Pig', 'Pokémon',
    'Minecraft', 'Nintendo', 'Spin Master', 'MGA Entertainment', 'Crayola'
  ]);

  const coloresDisponibles = [
    'Rojo', 'Azul', 'Verde', 'Amarillo', 'Rosa', 'Morado',
    'Naranja', 'Negro', 'Blanco', 'Gris', 'Café', 'Turquesa',
    'Multicolor', 'Transparente', 'Dorado', 'Plateado'
  ];

  const edadesDisponibles = [
    '0-6 meses', '6-12 meses', '1-2 años', '2-3 años',
    '3-4 años', '4-5 años', '5-6 años', '6-7 años',
    '7-8 años', '8-9 años', '9-10 años', '10-12 años',
    '12+ años', '3+ años', '5+ años', '6+ años',
    '8+ años', '10+ años', 'Todas las edades'
  ];

  const tiposJuguete = [
    'Muñeca', 'Carrito', 'Bloques', 'Peluche', 'Figura de Acción',
    'Juego de Mesa', 'Rompecabezas', 'Pistola de Juguete', 'Pelota',
    'Robot', 'Instrumento Musical', 'Kit de Ciencia', 'Casa de Juguete',
    'Bicicleta', 'Patineta', 'Avión', 'Barco', 'Dinosaurio',
    'Superhéroe', 'Princesa', 'Cocina de Juguete', 'Herramientas',
    'Disfraz', 'Set de Arte', 'Electrónico', 'Otro'
  ];

  const materialesDisponibles = [
    'Plástico', 'Tela', 'Metal', 'Madera', 'Silicona',
    'Goma', 'Cartón', 'Papel', 'Espuma', 'Felpa',
    'Vinilo', 'Resina', 'Cerámica', 'Vidrio', 'Mixto'
  ];

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'educativo',
    marca: '',
    material: '',
    edad_recomendada: '',
    genero: 'unisex',
    colores: [],
    alto: '',
    ancho: '',
    largo: '',
    peso: '',
    tipo_juguete: '',
    sku: '',
    imagenes: ['', '', '', '', ''],
    cantidad: 0,
    stock_minimo: 2,
    precio: 0,
    precio_compra: 0
  });

  const categorias = [
    { value: 'educativo', label: '📚 Educativo' },
    { value: 'didactico', label: '🎯 Didáctico' },
    { value: 'coleccionable', label: '⭐ Coleccionable' },
    { value: 'electronico', label: '🔋 Electrónico' },
    { value: 'peluches', label: '🧸 Peluches' },
    { value: 'vehiculos', label: '🚗 Vehículos' },
    { value: 'juegos_mesa', label: '🎲 Juegos de Mesa' },
    { value: 'figuras_accion', label: '🦸 Figuras de Acción' },
    { value: 'munecas', label: '👧 Muñecas' },
    { value: 'construccion', label: '🏗️ Construcción' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (index, value) => {
    const nuevasImagenes = [...form.imagenes];
    nuevasImagenes[index] = value;
    setForm(prev => ({ ...prev, imagenes: nuevasImagenes }));
  };

  // ✅ NUEVA FUNCIÓN: Subir imagen a Cloudinary
  const handleImagenUpload = async (index, archivo) => {
    if (!archivo) return;

    // Marcar como subiendo
    const nuevosEstados = [...subiendoImagenes];
    nuevosEstados[index] = true;
    setSubiendoImagenes(nuevosEstados);

    try {
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      if (data.secure_url) {
        handleImagenChange(index, data.secure_url);
      } else {
        alert('❌ Error al subir la imagen. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('❌ Error de conexión al subir la imagen.');
    } finally {
      const nuevosEstados2 = [...subiendoImagenes];
      nuevosEstados2[index] = false;
      setSubiendoImagenes(nuevosEstados2);
    }
  };

  const handleColorToggle = (color) => {
    setForm(prev => ({
      ...prev,
      colores: prev.colores.includes(color)
        ? prev.colores.filter(c => c !== color)
        : [...prev.colores, color]
    }));
  };

  const handleAgregarMarca = () => {
    const marca = nuevaMarcaInput.trim();
    if (!marca) return;
    if (marcasDisponibles.includes(marca)) {
      alert('⚠️ Esta marca ya existe');
      return;
    }
    setMarcasDisponibles(prev => [...prev, marca].sort());
    setForm(prev => ({ ...prev, marca }));
    setNuevaMarcaInput('');
    setShowNuevaMarca(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

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

    const dimensiones = [
      form.alto ? `Alto: ${form.alto}cm` : '',
      form.ancho ? `Ancho: ${form.ancho}cm` : '',
      form.largo ? `Largo: ${form.largo}cm` : '',
      form.peso ? `Peso: ${form.peso}kg` : ''
    ].filter(Boolean).join(' | ');

    const imagenString = form.imagenes.filter(img => img.trim()).join(',');
    const colorString = form.colores.join(', ');

    const dataToSend = {
      ...form,
      dimensiones,
      imagen: imagenString,
      color: colorString,
      stock_minimo: parseInt(form.stock_minimo) || 2
    };

    delete dataToSend.alto;
    delete dataToSend.ancho;
    delete dataToSend.largo;
    delete dataToSend.peso;
    delete dataToSend.imagenes;
    delete dataToSend.colores;

    try {
      await productosService.create(dataToSend);
      setMensaje({ tipo: 'success', texto: '¡Producto registrado exitosamente! Redirigiendo...' });
      setTimeout(() => navigate('/admin/productos'), 2000);
    } catch (error) {
      console.error('❌ Error al registrar producto:', error);
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.error || 'Error al registrar producto. Verifica que el SKU no esté duplicado.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrar-container">
      <div className="registrar-header">
        <div className="header-content">
          <button onClick={() => navigate('/admin')} className="back-button">
            ← Volver al Dashboard
          </button>
          <div>
            <h1 className="page-title">➕ Registrar Nuevo Producto</h1>
            <p className="page-subtitle">Completa la información del juguete</p>
          </div>
        </div>
      </div>

      <div className="form-wrapper">
        <div className="form-container">

          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              <span className="mensaje-icon">{mensaje.tipo === 'success' ? '✅' : '⚠️'}</span>
              <p>{mensaje.texto}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Sección 1 */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">1</span>
                <h2>Información Básica</h2>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Producto *</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Barbie Fashionista" required />
                </div>
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="3" placeholder="Descripción detallada del producto..." />
                </div>
                <div className="form-group">
                  <label>SKU (Código único) *</label>
                  <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="Ej: BAR-001" required />
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <div className="marca-wrapper">
                    <div className="marca-row">
                      <select name="marca" value={form.marca} onChange={handleChange} className="marca-select">
                        <option value="">Selecciona una marca</option>
                        {marcasDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button type="button" className="btn-nueva-marca" onClick={() => setShowNuevaMarca(!showNuevaMarca)}>
                        {showNuevaMarca ? '✕' : '+ Nueva'}
                      </button>
                    </div>
                    {showNuevaMarca && (
                      <div className="nueva-marca-box">
                        <input type="text" value={nuevaMarcaInput} onChange={(e) => setNuevaMarcaInput(e.target.value)} placeholder="Nombre de la nueva marca" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAgregarMarca())} />
                        <button type="button" className="btn-agregar-marca" onClick={handleAgregarMarca}>✅ Agregar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2 */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">2</span>
                <h2>Clasificación</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} required>
                    {categorias.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Género *</label>
                  <select name="genero" value={form.genero} onChange={handleChange} required>
                    <option value="niño">👦 Niño</option>
                    <option value="niña">👧 Niña</option>
                    <option value="bebe">👶 Bebé</option>
                    <option value="unisex">🧒 Unisex</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Juguete</label>
                  <select name="tipo_juguete" value={form.tipo_juguete} onChange={handleChange}>
                    <option value="">Selecciona un tipo</option>
                    {tiposJuguete.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Edad Recomendada</label>
                  <select name="edad_recomendada" value={form.edad_recomendada} onChange={handleChange}>
                    <option value="">Selecciona una edad</option>
                    {edadesDisponibles.map(edad => <option key={edad} value={edad}>{edad}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 3 */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">3</span>
                <h2>Características Físicas</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Material</label>
                  <select name="material" value={form.material} onChange={handleChange}>
                    <option value="">Selecciona un material</option>
                    {materialesDisponibles.map(material => <option key={material} value={material}>{material}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <label>Colores (puedes seleccionar varios)</label>
                <div className="colores-grid">
                  {coloresDisponibles.map(color => (
                    <button key={color} type="button" onClick={() => handleColorToggle(color)} className={`color-btn ${form.colores.includes(color) ? 'selected' : ''}`}>
                      {form.colores.includes(color) && '✓ '}{color}
                    </button>
                  ))}
                </div>
                {form.colores.length > 0 && (
                  <div className="colores-seleccionados">
                    <strong>Seleccionados:</strong> {form.colores.join(', ')}
                  </div>
                )}
              </div>
              <div className="dimensiones-titulo" style={{ marginTop: '1.5rem' }}>
                <span>📐</span> Dimensiones del Producto
              </div>
              <div className="dimensiones-grid">
                <div className="form-group">
                  <label>Alto (cm)</label>
                  <input type="number" name="alto" value={form.alto} onChange={handleChange} placeholder="0" min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Ancho (cm)</label>
                  <input type="number" name="ancho" value={form.ancho} onChange={handleChange} placeholder="0" min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Largo (cm)</label>
                  <input type="number" name="largo" value={form.largo} onChange={handleChange} placeholder="0" min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Peso (kg)</label>
                  <input type="number" name="peso" value={form.peso} onChange={handleChange} placeholder="0.0" min="0" step="0.01" />
                </div>
              </div>
            </div>

            {/* Sección 4 */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">4</span>
                <h2>Inventario y Precios</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cantidad Inicial *</label>
                  <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="0" required />
                  <span className="field-help">Unidades disponibles ahora</span>
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} min="1" />
                  <span className="field-help">Alerta cuando queden menos</span>
                </div>
                <div className="form-group">
                  <label>Precio de Compra</label>
                  <input type="number" name="precio_compra" value={form.precio_compra} onChange={handleChange} step="0.01" min="0" placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required placeholder="0.00" />
                </div>
                {form.precio > 0 && form.precio_compra > 0 && (
                  <div className="form-group">
                    <label>Margen de Ganancia</label>
                    <div className="margen-display">
                      {(((form.precio - form.precio_compra) / form.precio_compra) * 100).toFixed(1)}%
                      <span className="margen-label">+${(form.precio - form.precio_compra).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 5 - IMÁGENES CON CLOUDINARY */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">5</span>
                <h2>Imágenes del Producto</h2>
              </div>

              <div style={{
                background: '#fffbeb', border: '2px solid #fcd34d',
                borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem',
                fontSize: '0.9rem', color: '#92400e'
              }}>
                <strong>💡 Consejo:</strong> La primera imagen será la principal. Puedes subir hasta 5 imágenes directamente desde tu computadora.
              </div>

              {form.imagenes.map((img, index) => (
                <div key={index} className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Imagen {index + 1} {index === 0 && '(Principal)'}</label>

                  {/* Área de upload */}
                  <div style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: '12px',
                    padding: '1rem',
                    background: '#f9fafb'
                  }}>
                    {/* Botón para seleccionar archivo */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: img ? '1rem' : '0' }}>
                      <label
                        htmlFor={`file-input-${index}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          background: subiendoImagenes[index]
                            ? '#9ca3af'
                            : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: subiendoImagenes[index] ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                      >
                        {subiendoImagenes[index] ? (
                          <>⏳ Subiendo...</>
                        ) : (
                          <>📁 {img ? 'Cambiar imagen' : 'Seleccionar imagen'}</>
                        )}
                      </label>
                      <input
                        id={`file-input-${index}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={subiendoImagenes[index]}
                        onChange={(e) => {
                          const archivo = e.target.files[0];
                          if (archivo) handleImagenUpload(index, archivo);
                        }}
                      />
                      {img && (
                        <button
                          type="button"
                          onClick={() => handleImagenChange(index, '')}
                          style={{
                            padding: '10px 16px',
                            background: 'white',
                            border: '2px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Quitar
                        </button>
                      )}
                    </div>

                    {/* Preview de la imagen */}
                    {img && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <img
                          src={img}
                          alt={`Vista previa ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', margin: '0 0 4px' }}>
                            ✅ Imagen subida correctamente
                          </p>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, wordBreak: 'break-all' }}>
                            {img.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin')} className="btn-secondary" disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading || subiendoImagenes.some(s => s)}>
                {loading ? <><span className="spinner"></span>Registrando...</> : <>💾 Registrar Producto</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarProducto;