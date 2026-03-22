import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

const API = "https://back-jugueteria.vercel.app/api";
const ROSA = "#db2777";
const ROSA_DARK = "#be185d";
const ROSA_LIGHT = "#fce7f3";
const ROSA_MID = "#fbcfe8";

const COLORS = ["#db2777", "#be185d", "#f472b6", "#ec4899", "#9d174d", "#fda4af", "#fb7185", "#e11d48"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n ?? 0);
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function apiFetch(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API}${path}${qs ? "?" + qs : ""}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color = ROSA }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: "20px 24px",
      boxShadow: "0 2px 12px rgba(219,39,119,.10)",
      borderLeft: `4px solid ${color}`,
      display: "flex", alignItems: "center", gap: 16, flex: "1 1 180px", minWidth: 160
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: ROSA_LIGHT, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e1b4b" }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, extra }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 24,
      boxShadow: "0 2px 12px rgba(219,39,119,.08)", marginBottom: 24
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>{title}</h3>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

function LoadingChart() {
  return (
    <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#d1d5db" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 13 }}>Cargando datos…</div>
      </div>
    </div>
  );
}

function EmptyChart({ msg = "Sin datos para este período" }) {
  return (
    <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#d1d5db" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
        <div style={{ fontSize: 13 }}>{msg}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1.5px solid ${ROSA_MID}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 13,
      boxShadow: "0 4px 16px rgba(219,39,119,.15)"
    }}>
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#374151" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: <strong>{prefix}{typeof p.value === "number" && prefix === "$"
            ? fmt(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Filtro de período ─────────────────────────────────────────────────────────

function PeriodFilter({ period, setPeriod, dateFrom, setDateFrom, dateTo, setDateTo }) {
  const opts = [
    { key: "semana", label: "Esta semana" },
    { key: "mes", label: "Este mes" },
    { key: "year", label: "Este año" },
    { key: "custom", label: "Personalizado" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {opts.map(o => (
        <button key={o.key} onClick={() => setPeriod(o.key)} style={{
          padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: 600,
          background: period === o.key ? ROSA : "#f3f4f6",
          color: period === o.key ? "#fff" : "#6b7280",
          transition: "all .2s"
        }}>{o.label}</button>
      ))}
      {period === "custom" && (
        <>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${ROSA_MID}`, fontSize: 12 }} />
          <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${ROSA_MID}`, fontSize: 12 }} />
        </>
      )}
    </div>
  );
}

// ─── Sección: Ventas ───────────────────────────────────────────────────────────

function ReporteVentas({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/reportes/ventas", params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  const serie = data?.serie ?? [];
  const totalIngresos = serie.reduce((s, d) => s + (d.total ?? 0), 0);
  const totalVentas = serie.reduce((s, d) => s + (d.cantidad ?? 0), 0);
  const ticketProm = totalVentas ? totalIngresos / totalVentas : 0;

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard icon="💰" label="Ingresos totales" value={fmt(totalIngresos)} />
        <KpiCard icon="🛒" label="Ventas realizadas" value={totalVentas} color="#9d174d" />
        <KpiCard icon="🎯" label="Ticket promedio" value={fmt(ticketProm)} color="#f472b6" />
      </div>

      <SectionCard title="Ingresos por período" icon="📈">
        {loading ? <LoadingChart /> : serie.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={serie} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ROSA} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ROSA} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Area type="monotone" dataKey="total" name="Ingresos" stroke={ROSA}
                strokeWidth={2.5} fill="url(#colorTotal)" dot={{ r: 3, fill: ROSA }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <SectionCard title="Cantidad de ventas por período" icon="🛍️">
        {loading ? <LoadingChart /> : serie.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serie} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cantidad" name="Ventas" fill={ROSA} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>
    </>
  );
}

// ─── Sección: Productos más vendidos ──────────────────────────────────────────

function ReporteProductos({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/reportes/productos", params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  const lista = data?.productos ?? [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flexWrap: "wrap" }}>
      <SectionCard title="Top 10 productos más vendidos" icon="🏆">
        {loading ? <LoadingChart /> : lista.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={lista.slice(0, 10)}
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10 }} width={110}
                tickFormatter={v => v.length > 18 ? v.slice(0, 17) + "…" : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cantidad" name="Unidades" fill={ROSA} radius={[0, 6, 6, 0]}>
                {lista.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      <SectionCard title="Distribución por categoría" icon="🎠">
        {loading ? <LoadingChart /> : lista.length === 0 ? <EmptyChart /> : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data?.categorias ?? []} cx="50%" cy="50%" outerRadius={90}
                  dataKey="valor" nameKey="nombre" label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#e5e7eb" }}>
                  {(data?.categorias ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} uds`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Sección: Clientes ─────────────────────────────────────────────────────────

function ReporteClientes({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/reportes/clientes", params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  const serie = data?.serie ?? [];

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard icon="👥" label="Total clientes" value={data?.total ?? "—"} />
        <KpiCard icon="✨" label="Nuevos en período" value={data?.nuevos ?? "—"} color="#9d174d" />
        <KpiCard icon="🔄" label="Clientes recurrentes" value={data?.recurrentes ?? "—"} color="#f472b6" />
      </div>

      <SectionCard title="Nuevos clientes por período" icon="📅">
        {loading ? <LoadingChart /> : serie.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={serie} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="nuevos" name="Nuevos clientes"
                stroke={ROSA} strokeWidth={2.5} dot={{ r: 4, fill: ROSA }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>
    </>
  );
}

// ─── Sección: Inventario ───────────────────────────────────────────────────────

function ReporteInventario() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/reportes/inventario")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const categorias = data?.categorias ?? [];
  const agotados = data?.agotados ?? [];
  const bajoStock = data?.bajo_stock ?? [];

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard icon="📦" label="Total productos" value={data?.total_productos ?? "—"} />
        <KpiCard icon="⚠️" label="Stock bajo (≤5)" value={data?.count_bajo ?? "—"} color="#f472b6" />
        <KpiCard icon="🚫" label="Agotados" value={data?.count_agotado ?? "—"} color="#9d174d" />
        <KpiCard icon="💎" label="Valor en inventario" value={fmt(data?.valor_total)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <SectionCard title="Stock por categoría" icon="📊">
          {loading ? <LoadingChart /> : categorias.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categorias} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="nombre" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stock" name="Unidades" fill={ROSA} radius={[6, 6, 0, 0]}>
                  {categorias.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Productos con stock crítico" icon="🚨">
          {loading ? <LoadingChart /> : (bajoStock.length === 0 && agotados.length === 0)
            ? <EmptyChart msg="¡Todo el inventario está bien! 🎉" />
            : (
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {agotados.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                    background: "#fff1f2", borderLeft: "3px solid #f43f5e"
                  }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{p.nombre}</span>
                    <span style={{
                      background: "#f43f5e", color: "#fff", borderRadius: 12,
                      padding: "2px 10px", fontSize: 11, fontWeight: 700
                    }}>AGOTADO</span>
                  </div>
                ))}
                {bajoStock.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: 8, marginBottom: 6,
                    background: "#fff7ed", borderLeft: "3px solid #f97316"
                  }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{p.nombre}</span>
                    <span style={{
                      background: "#f97316", color: "#fff", borderRadius: 12,
                      padding: "2px 10px", fontSize: 11, fontWeight: 700
                    }}>{p.stock} uds</span>
                  </div>
                ))}
              </div>
            )}
        </SectionCard>
      </div>
    </>
  );
}

// ─── Sección: Apartados ────────────────────────────────────────────────────────

function ReporteApartados({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/reportes/apartados", params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  const estados = data?.estados ?? [];

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard icon="🗂️" label="Total apartados" value={data?.total ?? "—"} />
        <KpiCard icon="✅" label="Completados" value={data?.completados ?? "—"} color="#9d174d" />
        <KpiCard icon="⏳" label="Pendientes" value={data?.pendientes ?? "—"} color="#f472b6" />
        <KpiCard icon="💵" label="Ingresos por apartados" value={fmt(data?.ingresos)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <SectionCard title="Estado de apartados" icon="🥧">
          {loading ? <LoadingChart /> : estados.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={estados} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="valor" nameKey="nombre" paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {estados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Abonos recibidos por período" icon="💳">
          {loading ? <LoadingChart /> : (data?.serie_abonos ?? []).length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.serie_abonos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Bar dataKey="monto" name="Abonos" fill={ROSA_DARK} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>
    </>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

const TABS = [
  { key: "ventas", label: "Ventas", icon: "💰" },
  { key: "productos", label: "Productos", icon: "🎁" },
  { key: "clientes", label: "Clientes", icon: "👥" },
  { key: "inventario", label: "Inventario", icon: "📦" },
  { key: "apartados", label: "Apartados", icon: "🗂️" },
];

function getDefaultDates(period) {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "semana") {
    const day = now.getDay() || 7;
    const from = new Date(now); from.setDate(now.getDate() - day + 1);
    return { from: fmt(from), to: fmt(now) };
  }
  if (period === "mes") {
    return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: fmt(now) };
  }
  if (period === "year") {
    return { from: `${now.getFullYear()}-01-01`, to: fmt(now) };
  }
  return { from: fmt(now), to: fmt(now) };
}

export default function Reportes() {
  const [tab, setTab] = useState("ventas");
  const [period, setPeriod] = useState("mes");
  const [dateFrom, setDateFrom] = useState(getDefaultDates("mes").from);
  const [dateTo, setDateTo] = useState(getDefaultDates("mes").to);

  const handlePeriod = useCallback((p) => {
    setPeriod(p);
    if (p !== "custom") {
      const { from, to } = getDefaultDates(p);
      setDateFrom(from);
      setDateTo(to);
    }
  }, []);

  const params = period === "custom"
    ? { desde: dateFrom, hasta: dateTo, periodo: "custom" }
    : { periodo: period, desde: dateFrom, hasta: dateTo };

  const needsInventario = tab === "inventario";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${ROSA} 0%, ${ROSA_DARK} 100%)`,
        padding: "20px 32px", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📊 Reportes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: .85 }}>
            Análisis y estadísticas de la Juguetería Martínez
          </p>
        </div>
        {!needsInventario && (
          <PeriodFilter period={period} setPeriod={handlePeriod}
            dateFrom={dateFrom} setDateFrom={setDateFrom}
            dateTo={dateTo} setDateTo={setDateTo} />
        )}
      </div>

      {/* Tabs */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #f3e8ff",
        padding: "0 32px", display: "flex", gap: 4, overflowX: "auto"
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
            color: tab === t.key ? ROSA : "#6b7280",
            borderBottom: tab === t.key ? `2.5px solid ${ROSA}` : "2.5px solid transparent",
            transition: "all .2s", whiteSpace: "nowrap"
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {tab === "ventas" && <ReporteVentas params={params} />}
        {tab === "productos" && <ReporteProductos params={params} />}
        {tab === "clientes" && <ReporteClientes params={params} />}
        {tab === "inventario" && <ReporteInventario />}
        {tab === "apartados" && <ReporteApartados params={params} />}
      </div>
    </div>
  );
}