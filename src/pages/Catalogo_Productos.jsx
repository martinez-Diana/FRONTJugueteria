import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productosService from '../services/productosService';

const CatalogoProductos = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando productos desde el backend...');
      
      const data = await productosService.getAll();
      
      console.log('✅ Productos cargados:', data.length);
      setProductos(data);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      setError('No se pudieron cargar los productos. Verifica que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async () => {
    try {
      setEliminando(true);
      console.log(`🗑️ Eliminando producto ${productoEliminar.id_producto}...`);
      
      await productosService.delete(productoEliminar.id_producto);
      
      console.log('✅ Producto eliminado');
      
      // Recargar productos
      await cargarProductos();
      
      // Cerrar modal
      setMostrarModal(false);
      setProductoEliminar(null);
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    } finally {
      setEliminando(false);
    }
  };

  // Obtener categorías únicas de los productos
  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchCategoria = selectedCategory === "Todos" || producto.categoria === selectedCategory;
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const getColorByCategory = (categoria) => {
    const colores = {
      "educativo": "#10b981",
      "didactico": "#3b82f6",
      "coleccionable": "#ec4899",
      "electronico": "#8b5cf6",
      "peluches": "#f59e0b",
      "vehiculos": "#ef4444",
      "juegos_mesa": "#14b8a6",
      "figuras_accion": "#6366f1",
      "munecas": "#ec4899",
      "construccion": "#f97316"
    };
    return colores[categoria] || "#ec4899";
  };

  const getGradientByCategory = (categoria) => {
    const gradientes = {
      "educativo": { from: "#d1fae5", to: "#a7f3d0" },
      "didactico": { from: "#dbeafe", to: "#93c5fd" },
      "coleccionable": { from: "#fce7f3", to: "#fbcfe8" },
      "electronico": { from: "#ede9fe", to: "#ddd6fe" },
      "peluches": { from: "#fef3c7", to: "#fde68a" },
      "vehiculos": { from: "#fee2e2", to: "#fecaca" },
      "juegos_mesa": { from: "#ccfbf1", to: "#99f6e4" },
      "figuras_accion": { from: "#e0e7ff", to: "#c7d2fe" },
      "munecas": { from: "#fce7f3", to: "#fbcfe8" },
      "construccion": { from: "#ffedd5", to: "#fed7aa" }
    };
    return gradientes[categoria] || { from: "#fce7f3", to: "#fbcfe8" };
  };

  // Estado de carga
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "64px",
            height: "64px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #ec4899",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ fontSize: "20px", color: "#374151", fontWeight: "600" }}>
            Cargando juguetes...
          </p>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
            Conectando con el backend
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)",
        padding: "24px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          padding: "48px",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "16px" }}>
            Error al cargar productos
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>{error}</p>
          <button
            onClick={cargarProductos}
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Header */}
      <header style={{
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px"
            }}>
              JM
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
                Juguetería Martínez
              </h1>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                {productosFiltrados.length} productos disponibles
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={cargarProductos}
              style={{
                position: "relative",
                padding: "10px",
                background: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#ec4899";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
              title="Refrescar productos"
            >
              🔄
            </button>

            <button style={{
              background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
              transition: "all 0.3s"
            }}

            
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(236, 72, 153, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(236, 72, 153, 0.3)";
            }}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        
        {/* Search Bar */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          padding: "24px",
          marginBottom: "32px"
        }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
              <svg style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px"
              }} fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, marca o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s",
                  fontFamily: "'Poppins', sans-serif"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#ec4899";
                  e.target.style.boxShadow = "0 0 0 3px rgba(236, 72, 153, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "10px 24px",
                border: "none",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                background: selectedCategory === cat 
                  ? "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
                  : "white",
                color: selectedCategory === cat ? "white" : "#374151",
                boxShadow: selectedCategory === cat 
                  ? "0 4px 12px rgba(236, 72, 153, 0.3)"
                  : "0 2px 6px rgba(0,0,0,0.05)",
                textTransform: "capitalize"
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.background = "white";
                }
              }}
            >
              {cat === "Todos" ? cat : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {productosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
            <p style={{ fontSize: "20px", color: "#374151", fontWeight: "600" }}>
              No se encontraron productos
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
              Intenta con otro término de búsqueda o categoría
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {productosFiltrados.map(producto => {
  const gradient = getGradientByCategory(producto.categoria);
  const color = getColorByCategory(producto.categoria);
  
  return (
    <div
      key={producto.id_producto}
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.3s",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
    >
      {/* Botones de acción - Editar y Eliminar */}
      <div style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        display: "flex",
        gap: "8px",
        zIndex: 10
      }}>
        <button
          onClick={() => navigate(`/admin/productos/editar/${producto.id_producto}`)}
          style={{
            background: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3b82f6";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Editar producto"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={() => {
            setProductoEliminar(producto);
            setMostrarModal(true);
          }}
          style={{
            background: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Eliminar producto"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Image Container */}
<div style={{
  position: "relative",
  height: "240px",
  background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0"
}}>
  <img
    src={producto.imagen?.split(',')[0] || ''}
    alt={producto.nombre}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
      
    }}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
  
  {/* Badge de stock */}
  {producto.cantidad === 0 ? (
    <span style={{
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "#dc2626",
      color: "white",
      padding: "6px 14px",
      borderRadius: "50px",
      fontSize: "12px",
      fontWeight: "700"
    }}>
      Agotado
    </span>
  ) : producto.cantidad <= producto.stock_minimo ? (
    <span style={{
      position: "absolute",
      top: "16px",
      right: "16px",
      background: "#f59e0b",
      color: "white",
      padding: "6px 14px",
      borderRadius: "50px",
      fontSize: "12px",
      fontWeight: "700"
    }}>
      ¡Pocas unidades!
    </span>
  ) : null}
</div>

      {/* Product Info */}
      <div style={{ padding: "20px" }}>
        <p style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "6px",
          fontWeight: "500",
          textTransform: "capitalize"
        }}>
          {producto.categoria.replace('_', ' ')} {producto.marca ? `• ${producto.marca}` : ''}
        </p>
        
        <h3 style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "12px",
          lineHeight: "1.4",
          minHeight: "42px"
        }}>
          {producto.nombre}
        </h3>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}>
          <div>
            <span style={{
              fontSize: "24px",
              fontWeight: "700",
              color: color
            }}>
              ${(parseFloat(producto.precio) || 0).toFixed(2)}
            </span>
          </div>
          
          <span style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "4px 8px",
            borderRadius: "6px"
          }}>
            Stock: {producto.cantidad}
          </span>
        </div>

        <p style={{
          fontSize: "11px",
          color: "#9ca3af",
          marginBottom: "12px"
        }}>
          SKU: {producto.sku}
        </p>

        {producto.edad_recomendada && (
          <p style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "12px"
          }}>
            👶 Edad recomendada: {producto.edad_recomendada}
          </p>
        )}
      </div>
    </div>
  );
})}
          </div>
        )}
      </div>
      {/* Modal de confirmación de eliminación */}
      {mostrarModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "24px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "16px" }}>
              ⚠️
            </div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "12px",
              textAlign: "center"
            }}>
              ¿Eliminar producto?
            </h2>
            <p style={{
              fontSize: "16px",
              color: "#6b7280",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              Estás a punto de eliminar:<br />
              <strong style={{ color: "#1f2937" }}>{productoEliminar?.nombre}</strong>
              <br />
              <span style={{ fontSize: "14px" }}>SKU: {productoEliminar?.sku}</span>
            </p>
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center"
            }}>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setProductoEliminar(null);
                }}
                disabled={eliminando}
                style={{
                  padding: "12px 24px",
                  background: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#374151",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                Cancelar
              </button>
              <button
                onClick={eliminarProducto}
                disabled={eliminando}
                style={{
                  padding: "12px 24px",
                  background: eliminando ? "#9ca3af" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: eliminando ? "not-allowed" : "pointer",
                  color: "white",
                  transition: "all 0.3s"
                }}
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoProductos;