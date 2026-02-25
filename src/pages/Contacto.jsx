import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from "../assets/logo.png";
import './Contacto.css';

const Contacto = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validación básica
  if (!formData.nombre || !formData.email || !formData.mensaje) {
    alert('⚠️ Por favor completa todos los campos obligatorios');
    return;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('⚠️ Por favor ingresa un email válido');
    return;
  }

  setLoading(true);

  try {
    // 🆕 LLAMADA AL BACKEND
    const response = await fetch('http://localhost:4000/api/contacto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar mensaje');
    }

    console.log('✅ Mensaje enviado:', data);
    
    setSuccess(true);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    });

    // Ocultar mensaje de éxito después de 5 segundos
    setTimeout(() => {
      setSuccess(false);
    }, 5000);

  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="contacto-container">
      {/* Navbar */}
      <nav className="navbar-contacto">
        <div className="nav-content">
          <div className="logo" onClick={() => navigate('/home')}>
            <img src={logoImg} alt="Juguetería Martínez" className="logo-img" />
          </div>
          <div className="nav-links">
            <a onClick={() => navigate('/home')}>Inicio</a>
            <a onClick={() => navigate('/sobre-nosotros')}>Sobre Nosotros</a>
            <a onClick={() => navigate('/contacto')} className="active">Contacto</a>
            <a href="/login" className="btn-login">Iniciar Sesión</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="contacto-hero">
        <div className="contacto-hero-overlay"></div>
        <div className="contacto-hero-content">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Envíanos tu mensaje y te responderemos pronto.</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="contacto-main">
        <div className="contacto-grid">
          {/* Formulario */}
          <div className="contacto-form-section">
            <h2>Envíanos un Mensaje</h2>
            <p className="form-description">
              Completa el formulario y nos pondremos en contacto contigo lo antes posible.
            </p>

            {success && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div>
                  <strong>¡Mensaje enviado con éxito!</strong>
                  <p>Te responderemos pronto a tu correo electrónico.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre Completo <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="555-123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <select
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="consulta">Consulta General</option>
                    <option value="cotizacion">Solicitud de Cotización</option>
                    <option value="pedido">Información de Pedido</option>
                    <option value="reclamo">Reclamo o Devolución</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">
                  Mensaje <span className="required">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    📧 Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Información de Contacto */}
          <div className="contacto-info-section">
            <h2>Información de Contacto</h2>
            
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>Dirección</h3>
                <p>Av. Principal #123<br />Centro, Ciudad de México<br />CP 06000</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <h3>Teléfono</h3>
                <p>+52 (555) 123-4567<br />Lun - Sáb: 9:00 AM - 8:00 PM</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <div className="info-content">
                <h3>Email</h3>
                <p>info@jugueteriamartinez.com<br />ventas@jugueteriamartinez.com</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">💬</div>
              <div className="info-content">
                <h3>WhatsApp</h3>
                <p>+52 (555) 123-4567<br />Respuesta inmediata</p>
                <a 
                  href="https://wa.me/5551234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  Chatear en WhatsApp
                </a>
              </div>
            </div>

            <div className="social-section">
              <h3>Síguenos en Redes Sociales</h3>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                  📘 Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                  📷 Instagram
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                  🐦 Twitter
                </a>
              </div>
            </div>

            <div className="horarios-section">
              <h3>Horarios de Atención</h3>
              <div className="horario-item">
                <span className="dia">Lunes - Viernes:</span>
                <span className="hora">9:00 AM - 8:00 PM</span>
              </div>
              <div className="horario-item">
                <span className="dia">Sábados:</span>
                <span className="hora">9:00 AM - 6:00 PM</span>
              </div>
              <div className="horario-item">
                <span className="dia">Domingos:</span>
                <span className="hora">10:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa (opcional - puedes agregar un iframe de Google Maps) */}
      <section className="mapa-section">
        <h2>Encuéntranos</h2>
        <div className="mapa-placeholder">
          <p>🗺️ Aquí iría el mapa de ubicación</p>
          <p className="mapa-note">
            (Puedes agregar un iframe de Google Maps con tu ubicación real)
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-contacto">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Juguetería Martínez</h4>
            <p>Llevando sonrisas desde 2004</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces Rápidos</h4>
            <a onClick={() => navigate('/home')}>Inicio</a>
            <a onClick={() => navigate('/sobre-nosotros')}>Sobre Nosotros</a>
            <a onClick={() => navigate('/contacto')}>Contacto</a>
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

export default Contacto;