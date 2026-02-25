import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from "../assets/logo.png";
import './SobreNosotros.css';

const SobreNosotros = () => {
  const navigate = useNavigate();

  return (
    <div className="sobre-nosotros-container">
      {/* Navbar Simple */}
      <nav className="navbar-institutional">
        <div className="nav-content">
          <div className="logo" onClick={() => navigate('/home')}>
            <img src={logoImg} alt="Juguetería Martínez" className="logo-img" />
          </div>
          <div className="nav-links">
            <a onClick={() => navigate('/home')}>Inicio</a>
            <a onClick={() => navigate('/sobre-nosotros')} className="active">Sobre Nosotros</a>
            <a onClick={() => navigate('/home')}>Productos</a>
            <a onClick={() => navigate('/login')} className="btn-login">Iniciar Sesión</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Nuestra Historia</h1>
          <p>Más de 20 años llevando sonrisas a las familias mexicanas</p>
        </div>
      </section>

      {/* Contenido Principal */}
      <div className="content-wrapper">
        {/* Historia */}
        <section className="section-block">
          <div className="section-icon">📖</div>
          <h2>¿Quiénes Somos?</h2>
          <p className="lead-text">
            Juguetería Martínez es una empresa familiar fundada en 2004 con el sueño de 
            llevar alegría y diversión a niños y niñas de todo México.
          </p>
          <p>
            Lo que comenzó como una pequeña tienda en el centro de la ciudad, hoy se ha 
            convertido en un referente de calidad y variedad en juguetes educativos, 
            didácticos y de entretenimiento.
          </p>
          <p>
            Nuestro compromiso siempre ha sido ofrecer productos de la más alta calidad 
            al mejor precio, con un servicio personalizado que nos distingue.
          </p>
        </section>

        {/* Misión y Visión */}
        <div className="mission-vision-grid">
          <div className="card-mision">
            <div className="card-icon">🎯</div>
            <h3>Misión</h3>
            <p>
              Proporcionar juguetes de calidad que estimulen la imaginación, 
              creatividad y desarrollo de los niños, ofreciendo una experiencia 
              de compra excepcional a través de un servicio personalizado y 
              comprometido con la satisfacción de nuestros clientes.
            </p>
          </div>

          <div className="card-vision">
            <div className="card-icon">🌟</div>
            <h3>Visión</h3>
            <p>
              Ser la juguetería líder en México, reconocida por nuestra amplia 
              variedad de productos, excelencia en el servicio al cliente y 
              nuestro compromiso con el desarrollo integral de la niñez mexicana.
            </p>
          </div>
        </div>

        {/* Valores */}
        <section className="section-block">
          <div className="section-icon">💎</div>
          <h2>Nuestros Valores</h2>
          <div className="valores-grid">
            <div className="valor-item">
              <div className="valor-number">1</div>
              <h4>Calidad</h4>
              <p>Seleccionamos cuidadosamente cada producto para garantizar su calidad y seguridad.</p>
            </div>
            <div className="valor-item">
              <div className="valor-number">2</div>
              <h4>Compromiso</h4>
              <p>Estamos comprometidos con la satisfacción y felicidad de nuestros clientes.</p>
            </div>
            <div className="valor-item">
              <div className="valor-number">3</div>
              <h4>Confianza</h4>
              <p>Construimos relaciones duraderas basadas en la honestidad y transparencia.</p>
            </div>
            <div className="valor-item">
              <div className="valor-number">4</div>
              <h4>Innovación</h4>
              <p>Nos mantenemos actualizados con las últimas tendencias en juguetes educativos.</p>
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="stats-section">
          <div className="stat-box">
            <div className="stat-number">20+</div>
            <div className="stat-label">Años de Experiencia</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Clientes Satisfechos</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">500+</div>
            <div className="stat-label">Productos Diferentes</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">100%</div>
            <div className="stat-label">Garantía de Calidad</div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <h2>¿Listo para encontrar el juguete perfecto?</h2>
          <p>Explora nuestro catálogo y descubre la alegría que tenemos para ti</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate('/home')}>
              Ver Catálogo
            </button>
            <button className="btn-secondary" onClick={() => navigate('/home')}>
              Contactar
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer-institutional">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Juguetería Martínez</h4>
            <p>Llevando sonrisas desde 2004</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces Rápidos</h4>
            <a onClick={() => navigate('/home')}>Inicio</a>
            <a onClick={() => navigate('/sobre-nosotros')}>Sobre Nosotros</a>
            <a onClick={() => navigate('/home')}>Productos</a>
          </div>
          <div className="footer-section">
            <h4>Síguenos</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘 Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
              <a href="https://wa.me/5551234567" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Juguetería Martínez. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default SobreNosotros;