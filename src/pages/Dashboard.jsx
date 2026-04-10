import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import "./Dashboard.css";

const dataPolizasPorMes = [
  { mes: "Ene", polizas: 8 },  { mes: "Feb", polizas: 6 },
  { mes: "Mar", polizas: 10 }, { mes: "Abr", polizas: 7 },
  { mes: "May", polizas: 9 },  { mes: "Jun", polizas: 5 },
  { mes: "Jul", polizas: 8 },  { mes: "Ago", polizas: 6 },
  { mes: "Sep", polizas: 7 },  { mes: "Oct", polizas: 5 },
  { mes: "Nov", polizas: 4 },  { mes: "Dic", polizas: 5 },
];

const dataEstatusRecibos = [
  { name: "Pagado", value: 78, color: "#D4AF37" },
  { name: "Pendiente", value: 16, color: "#3B82F6" },
  { name: "Vencido", value: 8, color: "#E74C3C" },
];

const dataSiniestrosMes = [
  { mes: "Ene", monto: 85000 },  { mes: "Feb", monto: 120000 },
  { mes: "Mar", monto: 65000 },  { mes: "Abr", monto: 180000 },
  { mes: "May", monto: 95000 },  { mes: "Jun", monto: 210000 },
  { mes: "Jul", monto: 150000 }, { mes: "Ago", monto: 130000 },
  { mes: "Sep", monto: 175000 }, { mes: "Oct", monto: 90000 },
  { mes: "Nov", monto: 200000 }, { mes: "Dic", monto: 160000 },
];

const dataFormaPago = [
  { forma: "Anual", cantidad: 29 },
  { forma: "Semestral", cantidad: 20 },
  { forma: "Trimestral", cantidad: 18 },
  { forma: "Mensual", cantidad: 13 },
];

const actividadReciente = [
  { tipo: "Póliza", desc: "POL-AUT-2025-0008 emitida", fecha: "25 Mar 2025", estatus: "Vigente" },
  { tipo: "Siniestro", desc: "SIN-2025-0006 reportado", fecha: "25 Mar 2025", estatus: "En Trámite" },
  { tipo: "Recibo", desc: "REC-0038-01 cobrado", fecha: "15 Feb 2025", estatus: "Pagado" },
  { tipo: "Póliza", desc: "POL-AUT-2025-0007 emitida", fecha: "12 Mar 2025", estatus: "Vigente" },
  { tipo: "Siniestro", desc: "SIN-2025-0005 reportado", fecha: "18 Mar 2025", estatus: "En Trámite" },
];

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: entry.color || "#D4AF37" }}>
          {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString("es-MX") : entry.value}{suffix}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const hoy = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const cards = [
    { title: "Total Pólizas", value: "80", change: "+5 este mes", positive: true,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg> },
    { title: "Pólizas Vigentes", value: "67", change: "83.7% del total", positive: true,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01" strokeLinejoin="round"/></svg> },
    { title: "Clientes", value: "50", change: "+3 este mes", positive: true,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { title: "Siniestros Abiertos", value: "10", change: "En trámite", positive: false,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ];

  const getEstatusBadge = (estatus) => {
    const map = { "Vigente": "badge--green", "Pagado": "badge--gold", "En Trámite": "badge--blue" };
    return map[estatus] || "badge--default";
  };

  return (
    <div className={`dashboard ${mounted ? "dashboard--visible" : ""}`}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-date">{hoy}</p>
        </div>
      </div>

      <div className="dashboard-cards">
        {cards.map((card, i) => (
          <div key={i} className="dash-card" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="dash-card-header">
              <span className="dash-card-title">{card.title}</span>
              <div className="dash-card-icon">{card.icon}</div>
            </div>
            <div className="dash-card-value">{card.value}</div>
            <div className={`dash-card-change ${card.positive ? "dash-card-change--positive" : "dash-card-change--warning"}`}>{card.change}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="chart-card chart-card--large">
          <h3 className="chart-card-title">Pólizas emitidas por mes</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataPolizasPorMes} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip suffix=" pólizas" />} />
                <Bar dataKey="polizas" fill="#D4AF37" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-card--small">
          <h3 className="chart-card-title">Estatus de recibos</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dataEstatusRecibos} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" isAnimationActive={false}>
                  {dataEstatusRecibos.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip suffix=" recibos" />} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: "rgba(232,230,225,0.6)", fontSize: "12px" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="chart-card chart-card--large">
          <h3 className="chart-card-title">Montos de siniestros por mes</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dataSiniestrosMes}>
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Area type="monotone" dataKey="monto" stroke="#D4AF37" strokeWidth={2} fill="url(#gradientArea)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-card--small">
          <h3 className="chart-card-title">Forma de pago</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataFormaPago} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="forma" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} width={85} />
                <Tooltip content={<CustomTooltip suffix=" pólizas" />} />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-card-title">Actividad reciente</h3>
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Estatus</th></tr></thead>
            <tbody>
              {actividadReciente.map((item, i) => (
                <tr key={i}>
                  <td><span className={`activity-type activity-type--${item.tipo.toLowerCase()}`}>{item.tipo}</span></td>
                  <td className="activity-desc">{item.desc}</td>
                  <td className="activity-date">{item.fecha}</td>
                  <td><span className={`badge ${getEstatusBadge(item.estatus)}`}>{item.estatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
