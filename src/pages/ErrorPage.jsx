import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';
import logoImg from '../assets/logo.png';

const ErrorPage = ({ errorCode = '404' }) => {
  const navigate = useNavigate();

  const errorInfo = {
    '400': {
      title: '¡Ups! Solicitud incorrecta',
      message: 'Parece que algo salió mal con tu solicitud. Los juguetes no entienden qué les pediste.',
      emoji: '⚠️',
      suggestions: [
        'Verifica que la información ingresada sea correcta',
        'Intenta refrescar la página',
        'Regresa al inicio y vuelve a intentarlo'
      ]
    },
    '404': {
      title: '¡Página no encontrada!',
      message: 'El juguete que buscas se escapó a jugar. No podemos encontrar esta página.',
      emoji: '🔍',
      suggestions: [
        'Verifica que la URL esté escrita correctamente',
        'La página pudo haber sido movida o eliminada',
        'Usa el menú de navegación para encontrar lo que buscas'
      ]
    },
    '500': {
      title: '¡Error del servidor!',
      message: 'Nuestros juguetes están teniendo un mal día. Estamos trabajando para solucionarlo.',
      emoji: '🔧',
      suggestions: [
        'Intenta recargar la página en unos momentos',
        'El problema es de nuestro lado, no tuyo',
        'Si el error persiste, contáctanos'
      ]
    }
  };

  const error = errorInfo[errorCode] || errorInfo['404'];

  return (
    <div className="error-page">
      <nav className="error-navbar">
        <div className="error-nav-container">
          <div className="error-logo" onClick={() => navigate('/')}>
            <img src={logoImg} alt="Juguetería Martínez" className="error-logo-img" />
          </div>
          <button className="btn-back-home" onClick={() => navigate('/')}>
            🏠 Volver al Inicio
          </button>
        </div>
      </nav>

      <div className="error-content">
        <div className="error-animation">
          <div className="error-code-display">
            <span className="error-emoji">{error.emoji}</span>
            <h1 className="error-code">{errorCode}</h1>
          </div>
          
          <div className="floating-toys">
            <span className="toy toy-1">🧸</span>
            <span className="toy toy-2">🎮</span>
            <span className="toy toy-3">🎨</span>
            <span className="toy toy-4">🚗</span>
            <span className="toy toy-5">🧩</span>
            <span className="toy toy-6">🎲</span>
          </div>
        </div>

        <div className="error-info">
          <h2 className="error-title">{error.title}</h2>
          <p className="error-message">{error.message}</p>

          <div className="error-suggestions">
            <h3>💡 Sugerencias:</h3>
            <ul>
              {error.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="error-actions">
            <button className="btn-error-primary" onClick={() => navigate('/')}>
              🏠 Ir al Inicio
            </button>
            <button className="btn-error-secondary" onClick={() => navigate(-1)}>
              ← Volver Atrás
            </button>
            <button className="btn-error-secondary" onClick={() => window.location.href = '/#productos'}>
              🛍️ Ver Productos
            </button>
          </div>

          <div className="quick-links">
            <h3>🔗 Enlaces Rápidos:</h3>
            <div className="quick-links-grid">
              <button onClick={() => navigate('/')} className="quick-link">
                <span className="quick-link-icon">🏠</span>
                <span>Inicio</span>
              </button>
              <button onClick={() => window.location.href = '/#categorias'} className="quick-link">
                <span className="quick-link-icon">📂</span>
                <span>Categorías</span>
              </button>
              <button onClick={() => window.location.href = '/#productos'} className="quick-link">
                <span className="quick-link-icon">🛍️</span>
                <span>Productos</span>
              </button>
              <button onClick={() => window.location.href = '/#contacto'} className="quick-link">
                <span className="quick-link-icon">📞</span>
                <span>Contacto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="error-footer">
        <p>¿Necesitas ayuda? <a href="mailto:info@jugueteriamartinez.com">Contáctanos</a> o llama al <a href="tel:+525551234567">+52 (555) 123-4567</a></p>
      </div>
    </div>
  );
};

export default ErrorPage;