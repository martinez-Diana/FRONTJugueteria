import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom'; 
import "./Home.css";
import logoImg from "../assets/logo.png";
import productosService from "../services/productosService";
import SeccionOfertas from './SeccionOfertas';

const Home = () => {
  const navigate = useNavigate(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAges, setShowAges] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const searchRef = useRef(null);
  const agesRef = useRef(null);
  const brandsRef = useRef(null);
  const [user, setUser] = useState(null);
  const [favoritos, setFavoritos] = useState([]);

  // 🆕 Estados para productos reales
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  
  const [filters, setFilters] = useState({
    categoria: "todas",
    precioMin: "",
    precioMax: "",
    ordenar: "relevancia"
  });

  const categorias = [
    { value: "todas", label: "Todas las categorías" },
    { value: "munecas", label: "Muñecas" },
    { value: "didactico", label: "Didáctico" },
    { value: "educativo", label: "Educativo" },
    { value: "vehiculos", label: "Vehículos" },
    { value: "peluches", label: "Peluches" },
    { value: "juegos_mesa", label: "Juegos de Mesa" },
    { value: "outdoor", label: "Outdoor" },
    { value: "coleccionables", label: "Coleccionables" },
  ];

  const edades = [
    { value: "0-3", label: "0 a 36 Meses", icon: "👶" },
    { value: "3-5", label: "3 a 5 Años", icon: "🧒" },
    { value: "5-7", label: "5 a 7 Años", icon: "👧" },
    { value: "7-10", label: "7 a 10 Años", icon: "🧑" },
    { value: "10+", label: "Más de 10 Años", icon: "👨" }
  ];

  const marcas = [
    { nombre: "LEGO", logo: "🧱", color: "#d11" },
    { nombre: "Hot Wheels", logo: "🏎️", color: "#ff6800" },
    { nombre: "Barbie", logo: "👸", color: "#e0218a" },
    { nombre: "Marvel", logo: "🦸", color: "#e23636" },
    { nombre: "Fisher-Price", logo: "🎪", color: "#f46f30" },
    { nombre: "Jurassic World", logo: "🦖", color: "#1a1a1a" },
    { nombre: "Star Wars", logo: "⭐", color: "#000" },
    { nombre: "Minecraft", logo: "⛏️", color: "#8bc34a" },
    { nombre: "Pokémon", logo: "⚡", color: "#ffcb05" },
    { nombre: "Maisto", logo: "🚙", color: "#e31e24" },
    { nombre: "Nerf", logo: "🎯", color: "#ff6b35" },
    { nombre: "Paw Patrol", logo: "🐾", color: "#003da5" },
    { nombre: "Play-Doh", logo: "🎨", color: "#ffd500" },
    { nombre: "Disney", logo: "🏰", color: "#0066b2" },
    { nombre: "Hasbro", logo: "🎲", color: "#0063be" },
    { nombre: "Our Generation", logo: "💝", color: "#ff69b4" },
    { nombre: "Mattel Games", logo: "🎮", color: "#e11f26" },
    { nombre: "Cars", logo: "🏁", color: "#d71920" }
  ];

  // 🆕 Cargar productos reales del backend
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProductos(true);
        const data = await productosService.getAll();
        const productosFormateados = data.map(p => ({
          id: p.id_producto,
          tipo: "imagen",
          imagen: p.imagen ? p.imagen.split(',')[0] : null,
          titulo: p.nombre,
          descripcion: p.descripcion || "Sin descripción",
          precio: parseFloat(p.precio) || 0,
          categoria: p.categoria,
          stock: p.cantidad || 0,
          marca: p.marca || "",
          edad: p.edad_recomendada || "",
          sku: p.sku || "",
          genero: p.genero || "",
          color: p.color || "",
          material: p.material || "",
        }));
        setProductos(productosFormateados);
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
      } finally {
        setLoadingProductos(false);
      }
    };
    cargarProductos();
  }, []);

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Cargar usuario del localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
  const cargarFavoritos = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`https://back-jugueteria.vercel.app/api/lista-deseos/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setFavoritos(data.deseos.map(d => d.id_producto));
    } catch (e) { console.error(e); }
  };
  cargarFavoritos();
}, [user]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (agesRef.current && !agesRef.current.contains(event.target)) {
        setShowAges(false);
      }
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setShowBrands(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generar sugerencias en tiempo real
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = productos.filter(producto =>
        producto.titulo.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, productos]);

  const addToCart = (producto) => {
    if (!user) {
      alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    const existingItem = cart.find(item => item.id === producto.id);
    
    if (existingItem) {
      if (existingItem.cantidad < producto.stock) {
        setCart(cart.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        alert('No hay más stock disponible');
      }
    } else {
      setCart([...cart, { ...producto, cantidad: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const producto = productos.find(p => p.id === productId);
    if (producto && newQuantity > producto.stock) {
      alert('No hay suficiente stock');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, cantidad: newQuantity }
        : item
    ));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      alert('✅ Sesión cerrada exitosamente');
    }
  };

  const realizarBusqueda = () => {
    let resultados = [...productos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resultados = resultados.filter(producto => 
        producto.titulo.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query) ||
        (producto.marca && producto.marca.toLowerCase().includes(query))
      );
    }

    if (filters.categoria !== "todas") {
      resultados = resultados.filter(p => p.categoria === filters.categoria);
    }

    if (filters.precioMin) {
      resultados = resultados.filter(p => p.precio >= parseFloat(filters.precioMin));
    }
    if (filters.precioMax) {
      resultados = resultados.filter(p => p.precio <= parseFloat(filters.precioMax));
    }

    switch (filters.ordenar) {
      case "precio-asc":
        resultados.sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        resultados.sort((a, b) => b.precio - a.precio);
        break;
      case "nombre":
        resultados.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      default:
        break;
    }

    setSearchResults(resultados);
    setShowSuggestions(false);
    setTimeout(() => {
      document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    realizarBusqueda();
  };

  const handleSuggestionClick = (producto) => {
    setSearchQuery(producto.titulo);
    setShowSuggestions(false);
    setSearchResults([producto]);
    setTimeout(() => {
      document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    realizarBusqueda();
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setFilters({
      categoria: "todas",
      precioMin: "",
      precioMax: "",
      ordenar: "relevancia"
    });
    setShowAdvancedSearch(false);
  };

  const handleProductClick = (producto) => {
    setSelectedProduct(producto);
    setShowProductDetail(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
    document.body.style.overflow = 'auto';
  };

  const handleCartClick = () => {
    setShowCart(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    setShowCart(false);
    document.body.style.overflow = 'auto';
  };


  const toggleFavorito = async (e, producto) => {
  e.stopPropagation();
  if (!user) { alert('⚠️ Debes iniciar sesión para guardar favoritos'); navigate('/login'); return; }
  const esFav = favoritos.includes(producto.id);
  if (esFav) {
    await fetch(`https://back-jugueteria.vercel.app/api/lista-deseos/${user.id}/${producto.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFavoritos(prev => prev.filter(id => id !== producto.id));
  } else {
    await fetch(`https://back-jugueteria.vercel.app/api/lista-deseos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ id_usuario: user.id, id_producto: producto.id })
    });
    setFavoritos(prev => [...prev, producto.id]);
  }
};

  const productosAMostrar = searchResults !== null ? searchResults : productos;



  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src={logoImg} alt="Juguetería Martínez" className="logo-img" />
          </div>
          
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li className="nav-dropdown" ref={agesRef}>
              <a 
                href="#edades" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowAges(!showAges);
                  setShowBrands(false);
                }}
                className={showAges ? "active" : ""}
              >
                Edades {showAges ? "▲" : "▼"}
              </a>
              {showAges && (
                <div className="dropdown-menu ages-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-title">Filtrar por Edad</span>
                  </div>
                  <ul className="dropdown-list">
                    {edades.map((edad) => (
                      <li key={edad.value} className="dropdown-item">
                        <a href="#productos" onClick={() => {
                          handleFilterChange("edad", edad.value);
                          realizarBusqueda();
                          setShowAges(false);
                        }}>
                          <span className="age-icon">{edad.icon}</span>
                          <span className="age-label">{edad.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="dropdown-footer">
                    <a href="#productos" onClick={() => setShowAges(false)}>Ver Todo →</a>
                  </div>
                </div>
              )}
            </li>
            <li className="nav-dropdown" ref={brandsRef}>
              <a 
                href="#marcas" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowBrands(!showBrands);
                  setShowAges(false);
                }}
                className={showBrands ? "active" : ""}
              >
                Marcas {showBrands ? "▲" : "▼"}
              </a>
              {showBrands && (
                <div className="dropdown-menu brands-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-title">Marcas Populares</span>
                  </div>
                  <div className="brands-grid">
                    {marcas.map((marca, index) => (
                      <div key={index} className="brand-item">
                        <a href="#productos" onClick={() => setShowBrands(false)}>
                          <div className="brand-logo" style={{ background: marca.color }}>
                            <span className="brand-emoji">{marca.logo}</span>
                          </div>
                          <span className="brand-name">{marca.nombre}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <a href="#productos" onClick={() => setShowBrands(false)}>Ver Todas las Marcas →</a>
                  </div>
                </div>
              )}
            </li>
            <li><a href="#categorias">Categorías</a></li>
            <li><a href="#productos">Productos</a></li>
            <li><a onClick={() => navigate('/sobre-nosotros')} style={{ cursor: 'pointer' }}>Sobre Nosotros</a></li>
            <li><a onClick={() => navigate('/contacto')} style={{ cursor: 'pointer' }}>Contacto</a></li>
          </ul>
          
          <div className="nav-right">
            <div className="search-wrapper" ref={searchRef}>
              <form onSubmit={handleSearch} className="search-box">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <span className="search-icon">🔍</span>
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  <div className="suggestions-header">
                    <span className="suggestions-title">Sugerencias</span>
                    <span className="suggestions-count">{suggestions.length} productos</span>
                  </div>
                  <ul className="suggestions-list">
                    {suggestions.map((producto) => (
                      <li 
                        key={producto.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(producto)}
                      >
                        <div className="suggestion-icon">
                          {producto.imagen ? (
                            <img 
                              src={producto.imagen} 
                              alt={producto.titulo} 
                              className="suggestion-img"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="suggestion-emoji">🧸</span>
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-title">{producto.titulo}</span>
                          <span className="suggestion-price">${producto.precio}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="suggestions-footer">
                    <button className="btn-view-all-suggestions" onClick={handleSearch}>
                      Ver todos los resultados →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <button className="cart-btn" onClick={handleCartClick} title="Ver carrito">
                <span className="cart-icon">🛒</span>
                {getTotalItems() > 0 && (
                  <span className="cart-count">{getTotalItems()}</span>
                )}
              </button>
            )}

            {user ? (
              <div className="user-menu">
                <button 
                  className="user-btn" 
                  onClick={() => window.location.href = '/profile'}
                  title="Ver mi perfil"
                >
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user.nombre || user.username}</span>
                </button>
               <button 
                  onClick={handleLogout}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background: "white",
                    border: "2px solid #f93b9a",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#f93b9a",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="nav-buttons">
                <a href="/login" className="btn-login">Iniciar Sesión</a>
                <a href="/register" className="btn-register">Registrarse</a>
              </div>
            )}
          </div>
        </div>
      </nav> 

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>
            Descubre la <span className="highlight">Magia</span> de Jugar
          </h1>
          <p>
            Los mejores juguetes para hacer sonreír a los más pequeños. Calidad,
            diversión y precios increíbles.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={() => {
                setShowAdvancedSearch(!showAdvancedSearch);
                setTimeout(() => {
                  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              {showAdvancedSearch ? "🔼 Ocultar Filtros" : "🔽 Filtros Avanzados"}
            </button>
            <a href="#categorias" className="btn-secondary">Explorar Categorías</a>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-decoration">
            <div className="hero-text">🎮</div>
          </div>
        </div>
      </section>

      <SeccionOfertas onAddToCart={addToCart} />

      {/* Categories */}
      <section className="categories" id="categorias">
        <h2 className="section-title">Nuestras Categorías</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => { handleFilterChange("categoria", "munecas"); realizarBusqueda(); }}>
            <div className="category-icon">🪆</div>
            <h3>Muñecas</h3>
            <p>Las mejores muñecas para jugar</p>
          </div>
          <div className="category-card" onClick={() => { handleFilterChange("categoria", "didactico"); realizarBusqueda(); }}>
            <div className="category-icon">🎲</div>
            <h3>Didáctico</h3>
            <p>Juguetes que enseñan jugando</p>
          </div>
          <div className="category-card" onClick={() => { handleFilterChange("categoria", "educativo"); realizarBusqueda(); }}>
            <div className="category-icon">🧩</div>
            <h3>Educativo</h3>
            <p>Aprende mientras te diviertes</p>
          </div>
          <div className="category-card" onClick={() => { handleFilterChange("categoria", "vehiculos"); realizarBusqueda(); }}>
            <div className="category-icon">🚗</div>
            <h3>Vehículos</h3>
            <p>Carritos, aviones y más</p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products" id="productos">
        <div className="products-header-new">
          <div className="products-title-wrapper">
            <h2 className="section-title">
              {searchResults !== null ? "Resultados de búsqueda" : "Productos Destacados"}
            </h2>
            {!loadingProductos && (
              <span className="results-badge">
                {searchResults !== null ? productosAMostrar.length : productos.length} productos
              </span>
            )}
          </div>
          
          <div className="search-actions">
            <button 
              className={`btn-filters ${showAdvancedSearch ? 'active' : ''}`}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              🔽 {showAdvancedSearch ? "Ocultar Filtros" : "Filtros Avanzados"}
            </button>
            {searchResults !== null && (
              <button className="btn-clear" onClick={clearSearch}>
                ✖ Limpiar
              </button>
            )}
          </div>
        </div>

        {showAdvancedSearch && (
          <div className="filters-panel">
            <form onSubmit={handleAdvancedSearch} className="filters-form">
              <div className="filters-grid">
                <div className="filter-item">
                  <label>📂 Categoría</label>
                  <select
                    value={filters.categoria}
                    onChange={(e) => handleFilterChange("categoria", e.target.value)}
                    className="filter-control"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label>💰 Rango de Precio</label>
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.precioMin}
                      onChange={(e) => handleFilterChange("precioMin", e.target.value)}
                      className="filter-control"
                      min="0"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.precioMax}
                      onChange={(e) => handleFilterChange("precioMax", e.target.value)}
                      className="filter-control"
                      min="0"
                    />
                  </div>
                </div>

                <div className="filter-item">
                  <label>🔄 Ordenar por</label>
                  <select
                    value={filters.ordenar}
                    onChange={(e) => handleFilterChange("ordenar", e.target.value)}
                    className="filter-control"
                  >
                    <option value="relevancia">Relevancia</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                    <option value="nombre">Nombre A-Z</option>
                  </select>
                </div>
              </div>

              <div className="filters-buttons">
                <button type="submit" className="btn-apply">
                  🔍 Aplicar Filtros
                </button>
                <button 
                  type="button" 
                  className="btn-reset"
                  onClick={() => {
                    setFilters({
                      categoria: "todas",
                      precioMin: "",
                      precioMax: "",
                      ordenar: "relevancia"
                    });
                  }}
                >
                  🔄 Resetear
                </button>
              </div>
            </form>
          </div>
        )}

        {searchResults !== null && productosAMostrar.length === 0 && !loadingProductos && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
            <button className="btn-view-all" onClick={clearSearch}>
              Ver todos los productos
            </button>
          </div>
        )}

        {/* Loading */}
        {loadingProductos ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            color: '#6b7280'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #ec4899',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{ fontSize: '1.1rem' }}>Cargando productos...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : productosAMostrar.length > 0 ? (
          <div className="products-grid">
            {productosAMostrar.map((producto) => (
              <div className="product-card" key={producto.id} onClick={() => handleProductClick(producto)} style={{ position: 'relative' }}>
        <button
          onClick={(e) => toggleFavorito(e, producto)}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'white', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '18px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10
          }}
        >
          {favoritos.includes(producto.id) ? '❤️' : '🤍'}
        </button>
        <div className="product-image">
          {producto.imagen ? (
            <img 
              src={producto.imagen} 
              alt={producto.titulo} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { 
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-size:3rem">🧸</span>';
              }}
            />
          ) : (
            <span style={{ fontSize: '3rem' }}>🧸</span>
          )}
        </div>
        <div className="product-info">
          <h3>{producto.titulo}</h3>
          <p>{producto.descripcion}</p>
          <div className="product-footer">
            <span className="product-price">${producto.precio.toLocaleString('es-MX')}</span>
            <button 
              className="btn-add-cart"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(producto);
              }}
            >
              {user ? 'Agregar' : '🔒 Iniciar Sesión'}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
        ) : (
          !loadingProductos && searchResults === null && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <p>No hay productos disponibles en este momento.</p>
            </div>
          )
        )}
      </section>

      {/* Modal de Detalle del Producto */}
      {showProductDetail && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>✖</button>
            
            <div className="product-detail-grid">
              <div className="product-detail-image">
                {selectedProduct.imagen ? (
                  <img 
                    src={selectedProduct.imagen} 
                    alt={selectedProduct.titulo}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="product-detail-emoji">🧸</div>
                )}
              </div>

              <div className="product-detail-info">
                <h2>{selectedProduct.titulo}</h2>
                <p className="product-detail-description">{selectedProduct.descripcion}</p>
                
                <div className="product-detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">Categoría:</span>
                    <span className="meta-value" style={{ textTransform: 'capitalize' }}>
                      {selectedProduct.categoria?.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedProduct.marca && (
                    <div className="meta-item">
                      <span className="meta-label">Marca:</span>
                      <span className="meta-value">{selectedProduct.marca}</span>
                    </div>
                  )}
                  {selectedProduct.edad && (
                    <div className="meta-item">
                      <span className="meta-label">Edad recomendada:</span>
                      <span className="meta-value">{selectedProduct.edad}</span>
                    </div>
                  )}
                  {selectedProduct.color && (
                    <div className="meta-item">
                      <span className="meta-label">Color:</span>
                      <span className="meta-value">{selectedProduct.color}</span>
                    </div>
                  )}
                  {selectedProduct.material && (
                    <div className="meta-item">
                      <span className="meta-label">Material:</span>
                      <span className="meta-value">{selectedProduct.material}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Stock disponible:</span>
                    <span className="meta-value">{selectedProduct.stock} unidades</span>
                  </div>
                  {selectedProduct.sku && (
                    <div className="meta-item">
                      <span className="meta-label">SKU:</span>
                      <span className="meta-value">{selectedProduct.sku}</span>
                    </div>
                  )}
                </div>

                <div className="product-detail-price">
                  <span className="price-label">Precio:</span>
                  <span className="price-value">${selectedProduct.precio.toLocaleString('es-MX')}</span>
                </div>

                <div className="product-detail-actions">
                  <button 
                    className="btn-add-to-cart-detail"
                    onClick={() => {
                      addToCart(selectedProduct);
                      if (user) closeProductDetail();
                    }}
                  >
                    {user ? '🛒 Agregar al Carrito' : '🔒 Iniciar Sesión para Comprar'}
                  </button>
                  <button className="btn-buy-now">
                    ⚡ Comprar Ahora
                  </button>
                </div>

                <div className="product-detail-features">
                  <h3>Características:</h3>
                  <ul>
                    <li>✓ Producto original y certificado</li>
                    <li>✓ Garantía de 30 días</li>
                    <li>✓ Envío gratis en compras mayores a $500</li>
                    <li>✓ Atención al cliente 24/7</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Carrito */}
      {showCart && (
        <div className="modal-overlay" onClick={closeCart}>
          <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>🛒 Mi Carrito</h2>
              <button className="modal-close" onClick={closeCart}>✖</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>¡Agrega productos para comenzar a comprar!</p>
                <button className="btn-continue-shopping" onClick={closeCart}>
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.imagen ? (
                          <img 
                            src={item.imagen} 
                            alt={item.titulo}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="cart-emoji">🧸</span>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <h4>{item.titulo}</h4>
                        <p className="cart-item-price">${item.precio.toLocaleString('es-MX')}</p>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            −
                          </button>
                          <span className="qty-display">{item.cantidad}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          className="btn-remove-item"
                          onClick={() => removeFromCart(item.id)}
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        ${(item.precio * item.cantidad).toLocaleString('es-MX')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${getTotalPrice().toLocaleString('es-MX')}</span>
                    </div>
                    <div className="summary-row">
                      <span>Envío:</span>
                      <span>{getTotalPrice() >= 500 ? 'GRATIS' : '$50'}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${(getTotalPrice() >= 500 ? getTotalPrice() : getTotalPrice() + 50).toLocaleString('es-MX')}</span>
                    </div>
                  </div>

                  <div className="cart-actions">
                    <button className="btn-clear-cart" onClick={clearCart}>
                      Vaciar Carrito
                    </button>
                    <button className="btn-checkout">
                      Proceder al Pago
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">Lo Que Dicen Nuestros Clientes</h2>
        <div className="testimonials-grid">
          {[
            ["M", "María González", "Excelente servicio y productos de calidad. Mis hijos están encantados con sus juguetes nuevos. ¡Totalmente recomendado!"],
            ["J", "Juan Pérez", "Gran variedad de productos y precios muy competitivos. La atención al cliente es excepcional. Volveré sin duda."],
            ["L", "Laura Rodríguez", "Encontré el regalo perfecto para el cumpleaños de mi sobrina. Entrega rápida y producto tal como se describe. ¡Perfectos!"],
          ].map(([avatar, name, text], i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-header">
                <div className="testimonial-avatar">{avatar}</div>
                <div className="testimonial-info">
                  <h4>{name}</h4>
                  <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="testimonial-text">"{text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2>¿Listo para hacer feliz a alguien?</h2>
            <p>Regístrate ahora y obtén un 15% de descuento en tu primera compra</p>
            <a href="/register" className="btn-cta">Registrarse Ahora</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contacto">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>🧸 Juguetería Martínez</h3>
              <p>
                Haciendo sonreír a los niños desde 1995. Los mejores juguetes con la mejor calidad y atención personalizada.
              </p>
              <div className="social-links">
                <a href="#" className="social-link facebook">f</a>
                <a href="#" className="social-link instagram">📷</a>
                <a href="#" className="social-link whatsapp">💬</a>
                <a href="#" className="social-link twitter">🐦</a>
              </div>
            </div>

            <div className="footer-section">
              <h3>Enlaces Rápidos</h3>
              <ul className="footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#categorias">Categorías</a></li>
                <li><a href="#productos">Productos</a></li>
                <li><a href="#contacto">Contacto</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Categorías</h3>
              <ul className="footer-links">
                <li><a href="#">Muñecas</a></li>
                <li><a href="#">Didáctico</a></li>
                <li><a href="#">Educativo</a></li>
                <li><a href="#">Vehículos</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Contacto</h3>
              <div className="contact-info">
                <div className="contact-item"><div className="contact-icon">📍</div><span>Av. Principal #123, Ciudad</span></div>
                <div className="contact-item"><div className="contact-icon">📞</div><span>+52 (555) 123-4567</span></div>
                <div className="contact-item"><div className="contact-icon">✉</div><span>info@jugueteriamartinez.com</span></div>
                <div className="contact-item"><div className="contact-icon">🕐</div><span>Lun - Sáb: 9:00 AM - 8:00 PM</span></div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Juguetería Martínez. Todos los derechos reservados.</p>
            <p>Diseñado con ❤ para hacer sonreír a los niños</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;