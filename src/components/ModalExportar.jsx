// ModalExportar.jsx - Componente reutilizable para exportar CSV con plantillas y columnas

import React, { useState } from "react";

const ModalExportar = ({ titulo, plantillas, columnasIniciales, onExportar, onCerrar }) => {
  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState(columnasIniciales);

  const handleExportar = () => {
    const columnas = Object.entries(columnasSeleccionadas)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onExportar(columnas);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2rem", maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Título */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, margin: 0, color: "#db2777" }}>📊 {titulo}</h2>
          <button onClick={onCerrar} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* Plantillas */}
        <p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>📋 Plantillas rápidas</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {plantillas.map((p, i) => (
            <button key={i} onClick={() => setColumnasSeleccionadas(p.cols)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", textAlign: "left", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#db2777"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Columnas */}
        <p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>🔧 Columnas a incluir</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {Object.keys(columnasSeleccionadas).map((col) => (
            <label key={col} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={columnasSeleccionadas[col]}
                onChange={(e) => setColumnasSeleccionadas({ ...columnasSeleccionadas, [col]: e.target.checked })}
                style={{ accentColor: "#db2777", width: 16, height: 16 }} />
              {col}
            </label>
          ))}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCerrar}
            style={{ flex: 1, padding: "10px", background: "white", border: "2px solid #e5e7eb", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleExportar}
            style={{ flex: 1, padding: "10px", background: "linear-gradient(135deg, #ec4899, #db2777)", border: "none", borderRadius: 10, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
            ⬇️ Descargar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExportar;