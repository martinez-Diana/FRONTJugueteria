import { useState, useRef } from "react";

const API = "https://back-jugueteria.vercel.app/api";
const ROSA = "#db2777";
const ROSA_DARK = "#be185d";
const ROSA_LIGHT = "#fce7f3";
const ROSA_MID = "#fbcfe8";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export default function ImportarInventario() {
  const [archivo, setArchivo]     = useState(null);
  const [cargando, setCargando]   = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError]         = useState(null);
  const [arrastrar, setArrastrar] = useState(false);
  const inputRef = useRef();

  function handleArchivo(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Solo se permiten archivos .csv"); return; }
    setArchivo(file);
    setResultado(null);
    setError(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastrar(false);
    handleArchivo(e.dataTransfer.files[0]);
  }

  async function handleImportar() {
    if (!archivo) return;
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const res = await fetch(`${API}/productos/importar-inventario`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");

      setResultado(data);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleLimpiar() {
    setArchivo(null);
    setResultado(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDescargarPlantilla() {
    const encabezado = "sku,cantidad";
    const ejemplo1   = "SKU-001,25";
    const ejemplo2   = "SKU-002,10";
    const ejemplo3   = "PIS-HOT-CHO-66,5";

    const contenido = [encabezado, ejemplo1, ejemplo2, ejemplo3].join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "plantilla_inventario.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${ROSA} 0%, ${ROSA_DARK} 100%)`,
        padding: "20px 32px", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📦 Importar Inventario</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: .85 }}>
            Actualización masiva de stock desde archivo CSV
          </p>
        </div>
        <button onClick={handleDescargarPlantilla} style={{
          background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.4)",
          color: "#fff", borderRadius: 10, padding: "9px 18px",
          fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7
        }}>
          ⬇️ Descargar plantilla CSV
        </button>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>

        {/* Instrucciones */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: 24,
          boxShadow: "0 2px 12px rgba(219,39,119,.08)", marginBottom: 24,
          borderLeft: `4px solid ${ROSA}`
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>
            📋 Formato del archivo CSV
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280" }}>
            Este módulo <strong>solo actualiza el stock</strong> de productos que ya existen. El archivo solo necesita dos columnas:
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: ROSA_LIGHT }}>
                  {["Columna", "Obligatorio", "Descripción"].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left",
                      color: ROSA_DARK, fontWeight: 700, borderBottom: `2px solid ${ROSA_MID}`
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["sku",      "✅ Sí", "Código único del producto (debe existir en la BD)"],
                  ["cantidad", "✅ Sí", "Nueva cantidad de stock (número entero ≥ 0)"],
                ].map(([col, req, desc], i) => (
                  <tr key={col} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "7px 12px", fontFamily: "monospace", color: ROSA_DARK, fontWeight: 600 }}>{col}</td>
                    <td style={{ padding: "7px 12px", color: "#374151" }}>{req}</td>
                    <td style={{ padding: "7px 12px", color: "#6b7280" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            marginTop: 14, background: "#fff7ed", borderRadius: 8,
            padding: "10px 14px", fontSize: 12, color: "#92400e",
            borderLeft: "3px solid #f97316"
          }}>
            ⚠️ Si el SKU no existe en la base de datos, esa fila se reportará como error y <strong>no se modificará nada</strong>.
          </div>
        </div>

        {/* Zona de carga */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: 24,
          boxShadow: "0 2px 12px rgba(219,39,119,.08)", marginBottom: 24
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>
            📤 Seleccionar archivo
          </h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrar(true); }}
            onDragLeave={() => setArrastrar(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2.5px dashed ${arrastrar ? ROSA : ROSA_MID}`,
              borderRadius: 12, padding: "40px 24px", textAlign: "center",
              cursor: "pointer", transition: "all .2s",
              background: arrastrar ? ROSA_LIGHT : "#fafafa",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>
              {archivo ? "📄" : "📦"}
            </div>
            {archivo ? (
              <>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>{archivo.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{(archivo.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#374151", fontSize: 14 }}>
                  Arrastra tu archivo CSV aquí
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>o haz clic para seleccionarlo</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept=".csv" onChange={(e) => handleArchivo(e.target.files[0])} style={{ display: "none" }} />

          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={handleImportar}
              disabled={!archivo || cargando}
              style={{
                background: !archivo || cargando ? "#e5e7eb" : ROSA,
                color: !archivo || cargando ? "#9ca3af" : "#fff",
                border: "none", borderRadius: 10, padding: "11px 24px",
                fontSize: 14, fontWeight: 700, cursor: !archivo || cargando ? "not-allowed" : "pointer",
                transition: "all .2s"
              }}
            >
              {cargando ? "⏳ Actualizando..." : "🚀 Actualizar inventario"}
            </button>

            {(archivo || resultado || error) && (
              <button onClick={handleLimpiar} style={{
                background: "#f3f4f6", color: "#6b7280", border: "none",
                borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer"
              }}>
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff1f2", border: "1.5px solid #fecdd3",
            borderRadius: 12, padding: 16, marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 20 }}>❌</span>
            <p style={{ margin: 0, color: "#be123c", fontSize: 14, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div style={{
            background: "#fff", borderRadius: 14, padding: 24,
            boxShadow: "0 2px 12px rgba(219,39,119,.08)"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>
              ✅ Actualización completada
            </h3>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { icon: "📋", label: "Total filas",      value: resultado.total,           bg: "#f0f9ff", color: "#0369a1" },
                { icon: "🔄", label: "Actualizados",     value: resultado.actualizados,    bg: ROSA_LIGHT, color: ROSA_DARK },
                { icon: "🔍", label: "No encontrados",   value: resultado.no_encontrados,  bg: "#fff7ed", color: "#c2410c" },
                { icon: "⚠️", label: "Con errores",      value: resultado.errores_count,   bg: "#fef2f2", color: "#dc2626" },
              ].map(k => (
                <div key={k.label} style={{
                  background: k.bg, borderRadius: 10, padding: "14px 20px",
                  flex: "1 1 120px", textAlign: "center"
                }}>
                  <div style={{ fontSize: 22 }}>{k.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{k.label}</div>
                </div>
              ))}
            </div>

            {resultado.errores?.length > 0 && (
              <>
                <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c2410c" }}>
                  ⚠️ Filas con error:
                </h4>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {resultado.errores.map((e, i) => (
                    <div key={i} style={{
                      background: "#fff7ed", borderLeft: "3px solid #f97316",
                      borderRadius: 8, padding: "8px 12px", marginBottom: 6,
                      fontSize: 12, color: "#374151"
                    }}>
                      <strong>Fila {e.fila}{e.sku ? ` — ${e.sku}` : ""}:</strong> {e.error}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}