// ============================================================
// INSTRUCCIONES DE INTEGRACIÓN EN Home.jsx
// ============================================================
// 1. Agrega este import al inicio de Home.jsx:
//    import SeccionOfertas from './SeccionOfertas';
//
// 2. En el return de Home.jsx, pega este componente
//    ENTRE el cierre de </section> del Hero y
//    la apertura de <section className="categories">:
//
//    </section>  {/* <- cierre del Hero */}
//
//    <SeccionOfertas onAddToCart={addToCart} />
//
//    <section className="categories" id="categorias">
// ============================================================

import React, { useState, useEffect } from "react";

const API_URL = "https://back-jugueteria.vercel.app";

const SeccionOfertas = ({ onAddToCart }) => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ofertas`);
        const data = await res.json();
        setOfertas(data);
      } catch (e) {
        console.error("Error al cargar ofertas:", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Auto-slide cada 4 segundos
  useEffect(() => {
    if (ofertas.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ofertas.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [ofertas]);

  if (loading) return null;
  if (ofertas.length === 0) return null;

  const oferta = ofertas[current];
  const precioOferta = oferta.precio_original
    ? (oferta.precio_original * (1 - oferta.descuento_porcentaje / 100)).toFixed(2)
    : null;

  return (
    <section style={{
      background: "linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #ede9fe 100%)",
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: "absolute", top: "-60px", right: "-60px",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-40px", left: "-40px",
        width: "200px", height: "200px",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Título de sección */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
            color: "white", padding: "8px 24px", borderRadius: "50px",
            fontSize: "13px", fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", marginBottom: "12px"
          }}>
            🔥 Ofertas y Promociones
          </div>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: "800", color: "#1f2937", margin: 0
          }}>
            ¡No te pierdas estas promociones!
          </h2>
        </div>

        {/* Banner principal de la oferta activa */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "280px",
          transition: "all 0.4s ease"
        }}>
          {/* Lado izquierdo — info */}
          <div style={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px"
          }}>
            {/* Badge de descuento */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #ec4899, #db2777)",
              color: "white", padding: "6px 16px",
              borderRadius: "50px", fontSize: "14px", fontWeight: "700",
              width: "fit-content"
            }}>
              🏷️ {oferta.descuento_porcentaje}% OFF
            </div>

            <h3 style={{
              fontSize: "clamp(18px, 3vw, 26px)",
              fontWeight: "800", color: "#1f2937",
              margin: 0, lineHeight: "1.2"
            }}>
              {oferta.nombre}
            </h3>

            {oferta.descripcion && (
              <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, lineHeight: "1.5" }}>
                {oferta.descripcion}
              </p>
            )}

            {/* Tipo de oferta */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "13px", color: "#6b7280"
            }}>
              {oferta.tipo === "categoria" ? (
                <span>📂 Categoría: <strong style={{ color: "#ec4899", textTransform: "capitalize" }}>
                  {oferta.categoria}
                </strong></span>
              ) : (
                <span>🧸 Producto: <strong style={{ color: "#ec4899" }}>
                  {oferta.producto_nombre}
                </strong></span>
              )}
            </div>

            {/* Precio con descuento */}
            {precioOferta && oferta.tipo === "producto" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  fontSize: "28px", fontWeight: "800",
                  color: "#ec4899"
                }}>
                  ${precioOferta}
                </span>
                <span style={{
                  fontSize: "18px", color: "#9ca3af",
                  textDecoration: "line-through"
                }}>
                  ${parseFloat(oferta.precio_original).toFixed(2)}
                </span>
              </div>
            )}

            {/* Fecha fin */}
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", color: "#9ca3af"
            }}>
              ⏰ Válido hasta: {new Date(oferta.fecha_fin).toLocaleDateString("es-MX", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </div>
          </div>

          {/* Lado derecho — imagen o decoración */}
          <div style={{
            background: "linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden"
          }}>
            {oferta.producto_imagen ? (
              <img
                src={oferta.producto_imagen}
                alt={oferta.nombre}
                style={{
                  maxWidth: "80%", maxHeight: "240px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))"
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div style={{
                fontSize: "80px",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))"
              }}>
                {oferta.tipo === "categoria" ? "🎁" : "🧸"}
              </div>
            )}

            {/* Círculo decorativo */}
            <div style={{
              position: "absolute", top: "-40px", right: "-40px",
              width: "160px", height: "160px",
              background: "rgba(236,72,153,0.1)",
              borderRadius: "50%", pointerEvents: "none"
            }} />
          </div>
        </div>

        {/* Dots de navegación si hay más de 1 oferta */}
        {ofertas.length > 1 && (
          <div style={{
            display: "flex", justifyContent: "center",
            gap: "8px", marginTop: "20px"
          }}>
            {ofertas.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  background: i === current
                    ? "linear-gradient(135deg, #ec4899, #8b5cf6)"
                    : "#d1d5db",
                  transition: "all 0.3s",
                  padding: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Mini tarjetas de todas las ofertas si hay más de 1 */}
        {ofertas.length > 1 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "24px"
          }}>
            {ofertas.map((o, i) => (
              <div
                key={o.id_oferta}
                onClick={() => setCurrent(i)}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "16px",
                  cursor: "pointer",
                  border: i === current ? "2px solid #ec4899" : "2px solid transparent",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.3s",
                  display: "flex", alignItems: "center", gap: "12px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{
                  width: "40px", height: "40px",
                  background: "linear-gradient(135deg, #fce7f3, #ede9fe)",
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0
                }}>
                  {o.tipo === "categoria" ? "📂" : "🧸"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{
                    fontSize: "13px", fontWeight: "700",
                    color: "#1f2937", margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {o.nombre}
                  </p>
                  <p style={{
                    fontSize: "12px", color: "#ec4899",
                    fontWeight: "600", margin: 0
                  }}>
                    {o.descuento_porcentaje}% OFF
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SeccionOfertas;