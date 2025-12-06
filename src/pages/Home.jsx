import React from "react";
import "./Home.css";
import hotWheelsImg from "../assets/hot-wheels.png";
import logoImg from "../assets/logo.png";

const Home = () => {
  const productos = [
    { tipo: "emoji", imagen: "🧸", titulo: "Osito de Peluche", descripcion: "Suave y adorable, perfecto para abrazar", precio: "$299" },
    { tipo: "emoji", imagen: "🎮", titulo: "Consola Portátil", descripcion: "Diversión en cualquier lugar", precio: "$1,499" },
    { tipo: "emoji", imagen: "🧩", titulo: "Rompecabezas 3D", descripcion: "Desafía tu mente y creatividad", precio: "$399" },
    { tipo: "imagen", imagen: hotWheelsImg, titulo: "Auto Hot Wheels", descripcion: "Velocidad y diversión garantizada", precio: "$799" },
    { tipo: "emoji", imagen: "🎨", titulo: "Set de Arte", descripcion: "Despierta el artista interior", precio: "$549" },
    { tipo: "emoji", imagen: "🎲", titulo: "Juego de Mesa", descripcion: "Diversión para toda la familia", precio: "$449" },
  ];

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
            <li><a href="#categorias">Categorías</a></li>
            <li><a href="#quienes-somos">¿Quiénes Somos?</a></li>
            <li><a href="#productos">Productos</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
          <div className="nav-buttons">
            <a href="/login" className="btn-login">Iniciar Sesión</a>
            <a href="/register" className="btn-register">Registrarse</a>
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
            <a href="#productos" className="btn-primary">Ver Productos</a>
            <a href="#categorias" className="btn-secondary">Explorar Categorías</a>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-decoration">
            <div className="hero-text">🎮</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories" id="categorias">
        <h2 className="section-title">Nuestras Categorías</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🧸</div>
            <h3>Peluches</h3>
            <p>Los más suaves y adorables compañeros</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🎮</div>
            <h3>Videojuegos</h3>
            <p>Diversión digital para todas las edades</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🧩</div>
            <h3>Educativos</h3>
            <p>Aprende mientras te diviertes</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🚗</div>
            <h3>Vehículos</h3>
            <p>Carritos, aviones y más</p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products" id="productos">
        <h2 className="section-title">Productos Destacados</h2>
        <div className="products-grid">
          {productos.map((producto, i) => (
            <div className="product-card" key={i}>
              <div className="product-image">
                {producto.tipo === "emoji" ? (
                  producto.imagen
                ) : (
                  <img src={producto.imagen} alt={producto.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
              </div>
              <div className="product-info">
                <h3>{producto.titulo}</h3>
                <p>{producto.descripcion}</p>
                <div className="product-footer">
                  <span className="product-price">{producto.precio}</span>
                  <button className="btn-add-cart">Agregar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                <li><a href="#">Peluches</a></li>
                <li><a href="#">Videojuegos</a></li>
                <li><a href="#">Juguetes Educativos</a></li>
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