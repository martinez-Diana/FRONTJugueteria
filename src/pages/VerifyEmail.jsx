import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

  body {
    margin: 0;
    font-family: "Poppins", sans-serif;
    background: #fef5fb;
  }

  .verification-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }

  .verification-box {
    background: #fff;
    max-width: 500px;
    width: 100%;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.08);
    padding: 50px 40px;
    text-align: center;
  }

  .icon-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #67e8f9 0%, #ec4899 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 30px;
    box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3);
  }

  .icon-circle svg {
    width: 50px;
    height: 50px;
    color: white;
  }

  .verification-box h2 {
    font-size: 28px;
    font-weight: 700;
    color: #ec4899;
    margin-bottom: 10px;
  }

  .verification-box p {
    color: #666;
    font-size: 14px;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .email-highlight {
    color: #ec4899;
    font-weight: 600;
  }

  .verification-input-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 25px;
  }

  .verification-input {
    width: 50px;
    height: 55px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    color: #333;
    outline: none;
    transition: all 0.3s;
    font-family: "Poppins", sans-serif;
  }

  .verification-input:focus {
    border-color: #ec4899;
    box-shadow: 0 0 8px rgba(236, 72, 153, 0.3);
    transform: scale(1.05);
  }

  .verification-input.filled {
    border-color: #10b981;
    background: #ecfdf5;
  }

  .verification-input.error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .verify-btn {
    background: #ec4899;
    color: #fff;
    font-weight: 600;
    padding: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    font-size: 16px;
    width: 100%;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
    font-family: "Poppins", sans-serif;
  }

  .verify-btn:hover {
    background: #db2777;
    box-shadow: 0 6px 16px rgba(219, 39, 119, 0.3);
    transform: translateY(-2px);
  }

  .verify-btn:active {
    transform: scale(0.98);
  }

  .verify-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .resend-section {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid #e5e7eb;
  }

  .resend-text {
    color: #666;
    font-size: 13px;
    margin-bottom: 10px;
  }

  .resend-btn {
    background: transparent;
    color: #ec4899;
    border: 2px solid #ec4899;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
    font-size: 14px;
    font-family: "Poppins", sans-serif;
  }

  .resend-btn:hover {
    background: #ec4899;
    color: white;
    transform: translateY(-2px);
  }

  .resend-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .timer {
    color: #f59e0b;
    font-weight: 600;
    font-size: 13px;
    margin-top: 10px;
  }

  .error-message {
    color: #dc2626;
    font-size: 13px;
    margin-top: 15px;
    padding: 10px;
    background-color: #fef2f2;
    border-radius: 6px;
    border-left: 4px solid #ef4444;
  }

  .success-message {
    color: #059669;
    font-size: 13px;
    margin-top: 15px;
    padding: 10px;
    background-color: #ecfdf5;
    border-radius: 6px;
    border-left: 4px solid #10b981;
  }

  @media (max-width: 600px) {
    .verification-box {
      padding: 40px 25px;
    }

    .verification-input {
      width: 45px;
      height: 50px;
      font-size: 20px;
    }

    .verification-input-group {
      gap: 8px;
    }
  }
`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);

  // Obtener el email desde el estado de navegación
  const userEmail = location.state?.email || '';

  useEffect(() => {
    if (!userEmail) {
      navigate('/register');
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const lastIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`code-input-${lastIndex}`)?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await API.post('/api/verify-email', { 
        email: userEmail, 
        code: verificationCode 
      });

      setSuccess('¡Correo verificado exitosamente! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al verificar el código');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-input-0')?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await API.post('/api/resend-verification', { email: userEmail });

      setSuccess('Código reenviado exitosamente. Revisa tu correo.');
      setCanResend(false);
      setTimer(60);
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError('Error al reenviar el código');
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <>
      <style>{styles}</style>
      <div className="verification-container">
        <div className="verification-box">
          <div className="icon-circle">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2>Verifica tu correo</h2>
          <p>
            Te enviamos un código de verificación a<br />
            <span className="email-highlight">{userEmail}</span><br />
            Revisa tu bandeja de entrada y tu carpeta de spam.
          </p>

          <div className="verification-input-group">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`verification-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
              />
            ))}
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <button 
            className="verify-btn" 
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
          >
            {isVerifying ? 'Verificando...' : 'Verificar Código'}
          </button>

          <div className="resend-section">
            <p className="resend-text">¿No recibiste el código?</p>
            <button 
              className="resend-btn"
              onClick={handleResend}
              disabled={!canResend}
            >
              Reenviar código
            </button>
            {!canResend && (
              <div className="timer">
                Podrás reenviar en {timer} segundos
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;