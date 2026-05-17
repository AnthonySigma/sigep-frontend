import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clientesApi, agentesApi, aseguradorasApi, polizasApi } from "../services/api";
import "./CrearPolizaPage.css";

/* ── Íconos ── */
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ChevRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const PrintIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const SaveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const CalcIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>;

const pasos = ["Cliente", "Agente y Aseguradora", "Vehículo y Cobertura", "Cotización", "Recibos", "Resumen"];

/* ── Relación Agente-Aseguradora (qué aseguradoras maneja cada agente) ── */
const agenteAseguradoras = {
  1:  [1, 3, 6],     // Carlos Hernández → GNP, Qualitas, HDI
  2:  [3, 8, 1],     // María González → Qualitas, Chubb, GNP
  3:  [1, 6, 3],     // Roberto Martínez → GNP, HDI, Qualitas
  4:  [3, 1, 8],     // Laura Díaz → Qualitas, GNP, Chubb
  5:  [6, 3, 1],     // Fernando López → HDI, Qualitas, GNP
  6:  [3, 6, 8, 1],  // Ana Rodríguez → Qualitas, HDI, Chubb, GNP
  8:  [3, 8, 1],     // Patricia Morales → Qualitas, Chubb, GNP
  9:  [1, 6, 9],     // Raúl Castro → GNP, HDI, Atlas
  10: [6, 3, 10],    // Gabriela Vargas → HDI, Qualitas, SURA
  11: [3, 8, 1, 6],  // Miguel Reyes → Qualitas, Chubb, GNP, HDI
  13: [1, 6, 3],     // Eduardo Ortiz → GNP, HDI, Qualitas
  14: [6, 3, 8],     // Verónica Aguilar → HDI, Qualitas, Chubb
  15: [8, 3, 1],     // Alejandro Mendoza → Chubb, Qualitas, GNP
  17: [3, 6, 8],     // Héctor Peña → Qualitas, HDI, Chubb
  18: [1, 3, 6],     // Adriana Salazar → GNP, Qualitas, HDI
  19: [3, 6],        // Ricardo Delgado → Qualitas, HDI
  20: [1, 3, 6, 10], // Lucía Contreras → GNP, Qualitas, HDI, SURA
};

/* ── Valores base por marca para cotización ── */
const valoresMarca = {
  'Nissan': 350000, 'Chevrolet': 320000, 'Volkswagen': 380000, 'Toyota': 450000,
  'Honda': 430000, 'Mazda': 420000, 'Kia': 360000, 'Hyundai': 370000,
  'Ford': 400000, 'Suzuki': 300000, 'Seat': 340000, 'MG': 330000,
  'BMW': 800000, 'Mercedes-Benz': 850000, 'Audi': 780000,
};

const marcasDisponibles = Object.keys(valoresMarca);

const coberturas = [
  { id: "Basica", nombre: "Responsabilidad Civil (Básica)", desc: "Cubre daños a terceros", factor: 0.025 },
  { id: "Amplia", nombre: "Cobertura Amplia", desc: "Daños a terceros + robo + daños materiales", factor: 0.045 },
  { id: "Premium", nombre: "Cobertura Premium", desc: "Todo riesgo + asistencia vial + auto sustituto", factor: 0.065 },
];

/* ── Función para calcular prima ── */
const calcularPrima = (marca, anio, cobertura) => {
  const base = valoresMarca[marca] || 350000;
  const anioActual = new Date().getFullYear();
  const antiguedad = anioActual - parseInt(anio);
  const factorAnio = Math.max(0.45, 1 - (antiguedad * 0.08));
  const cob = coberturas.find(c => c.id === cobertura);
  const factorCobertura = cob ? cob.factor : 0.045;
  const valorVehiculo = Math.round(base * factorAnio);
  const prima = Math.round(valorVehiculo * factorCobertura);
  return { valorVehiculo, prima };
};

const generarNumeroPoliza = () => {
  const anio = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `POL-AUT-${anio}-${num}`;
};

const formatMoney = (v) => "$" + Number(v || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 });
const formatDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function CrearPolizaPage() {
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [aseguradoras, setAseguradoras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    clienteId: "",
    agenteId: "",
    aseguradoraId: "",
    marca: "", modeloAnio: "", placas: "", vin: "", descripcion: "",
    cobertura: "Amplia",
    numeroPoliza: generarNumeroPoliza(),
    fechaEmision: new Date().toISOString().split("T")[0],
    inicioVigencia: "", finVigencia: "",
    formaPago: "Anual", moneda: "MXN",
    primaTotal: "", valorVehiculo: 0,
    recibos: [],
  });

  // Cargar datos
  useEffect(() => {
    const cargar = async () => {
      try {
        const [c, a, s] = await Promise.all([clientesApi.obtenerTodos(), agentesApi.obtenerTodos(), aseguradorasApi.obtenerTodos()]);
        setClientes(c);
        setAgentes(a.filter(ag => ag.estatus === "Activo"));
        setAseguradoras(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  // Filtrar aseguradoras por agente seleccionado
  const aseguradorasFiltradas = form.agenteId
    ? aseguradoras.filter(a => {
        const ids = agenteAseguradoras[parseInt(form.agenteId)] || [];
        return ids.includes(a.idAseguradora);
      })
    : [];

  // Limpiar aseguradora si el agente cambia
  useEffect(() => {
    const ids = agenteAseguradoras[parseInt(form.agenteId)] || [];
    if (!ids.includes(parseInt(form.aseguradoraId))) {
      setForm(f => ({ ...f, aseguradoraId: "" }));
    }
  }, [form.agenteId]);

  // Calcular prima automáticamente
  useEffect(() => {
    if (form.marca && form.modeloAnio && form.cobertura) {
      const { valorVehiculo, prima } = calcularPrima(form.marca, form.modeloAnio, form.cobertura);
      setForm(f => ({ ...f, primaTotal: prima.toString(), valorVehiculo }));
    }
  }, [form.marca, form.modeloAnio, form.cobertura]);

  // Calcular fecha fin
  useEffect(() => {
    if (form.inicioVigencia) {
      const d = new Date(form.inicioVigencia + "T00:00:00");
      d.setFullYear(d.getFullYear() + 1);
      setForm(f => ({ ...f, finVigencia: d.toISOString().split("T")[0] }));
    }
  }, [form.inicioVigencia]);

  // Calcular recibos
  useEffect(() => {
    if (form.primaTotal && form.inicioVigencia) {
      const prima = parseFloat(form.primaTotal) || 0;
      const parcialidades = { Anual: 1, Semestral: 2, Trimestral: 4, Mensual: 12 };
      const n = parcialidades[form.formaPago] || 1;
      const montoParcialidad = prima / n;
      const agente = agentes.find(a => a.idAgente === parseInt(form.agenteId));
      const comision = agente ? parseFloat(agente.comision) : 0;
      const mesesIntervalo = 12 / n;
      const recibos = [];
      for (let i = 0; i < n; i++) {
        const fechaLimite = new Date(form.inicioVigencia + "T00:00:00");
        fechaLimite.setMonth(fechaLimite.getMonth() + (i * mesesIntervalo));
        recibos.push({
          parcialidad: i + 1, montoTotal: montoParcialidad.toFixed(2),
          primaNeta: (montoParcialidad * (1 - comision / 100)).toFixed(2),
          fechaLimite: fechaLimite.toISOString().split("T")[0], comision,
        });
      }
      setForm(f => ({ ...f, recibos }));
    }
  }, [form.primaTotal, form.formaPago, form.agenteId, form.inicioVigencia, agentes]);

  const clienteSel = clientes.find(c => c.idCliente === parseInt(form.clienteId));
  const agenteSel = agentes.find(a => a.idAgente === parseInt(form.agenteId));
  const aseguradoraSel = aseguradoras.find(a => a.idAseguradora === parseInt(form.aseguradoraId));
  const coberturaSel = coberturas.find(c => c.id === form.cobertura);

  const validarPaso = () => {
    switch (paso) {
      case 0: return !!form.clienteId;
      case 1: return !!form.agenteId && !!form.aseguradoraId;
      case 2: return !!form.marca && !!form.modeloAnio && !!form.placas && !!form.cobertura;
      case 3: return !!form.inicioVigencia && !!form.primaTotal;
      case 4: return form.recibos.length > 0;
      default: return true;
    }
  };

  const siguiente = () => { if (validarPaso() && paso < 5) setPaso(paso + 1); };
  const anterior = () => { if (paso > 0) setPaso(paso - 1); };

  const guardarPoliza = async () => {
    setGuardando(true);
    try {
      await polizasApi.crear({
        numeroPoliza: form.numeroPoliza, tipoSeguro: "Auto",
        cliente: { idCliente: parseInt(form.clienteId) },
        agente: { idAgente: parseInt(form.agenteId) },
        aseguradora: { idAseguradora: parseInt(form.aseguradoraId) },
        fechaEmision: form.fechaEmision, inicioVigencia: form.inicioVigencia,
        finVigencia: form.finVigencia, estatusPoliza: "Vigente",
        formaPago: form.formaPago, moneda: form.moneda,
        rutaPdfPoliza: `/docs/polizas/${form.numeroPoliza}.pdf`,
      });
      setGuardado(true);
    } catch (e) { alert("Error al guardar: " + e.message); }
    setGuardando(false);
  };

  const imprimirPDF = () => {
    const contenido = pdfRef.current;
    const ventana = window.open("", "_blank");
    ventana.document.write(`<html><head><title>Póliza ${form.numeroPoliza}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:40px;font-size:13px}.pdf-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #D4AF37;padding-bottom:20px;margin-bottom:24px}.pdf-logo h1{font-size:28px;color:#D4AF37;letter-spacing:3px}.pdf-logo p{font-size:11px;color:#666;letter-spacing:1px}.pdf-poliza-num{text-align:right}.pdf-poliza-num h2{font-size:16px;color:#333}.numero{font-size:20px;color:#D4AF37;font-weight:700}.estatus{display:inline-block;padding:4px 14px;background:#e8f5e9;color:#2e7d32;border-radius:12px;font-size:11px;font-weight:600;margin-top:4px}.seccion{margin-bottom:22px}.seccion-titulo{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#D4AF37;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:12px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 24px}.campo{margin-bottom:6px}.campo-label{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#999}.campo-valor{font-size:13px;color:#1a1a2e;font-weight:500}.campo-full{grid-column:1/-1}table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f5f5f5;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #ddd}td{padding:8px 12px;border-bottom:1px solid #eee;font-size:12px}.total-td{border-top:2px solid #D4AF37;font-weight:700}.firma-line{border-top:1px solid #333;margin-top:60px;padding-top:6px;font-size:11px;color:#666;text-align:center;width:200px}@media print{body{padding:20px}}</style></head><body>${contenido.innerHTML}<script>window.print();window.close();<\/script></body></html>`);
    ventana.document.close();
  };

  if (loading) return (
    <div className="wizard-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ textAlign: "center", color: "rgba(232,230,225,0.5)" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round" /></svg>
        <p style={{ marginTop: "16px" }}>Cargando datos...</p>
      </div>
    </div>
  );

  return (
    <div className="wizard-page">
      <div className="wizard-header"><h1 className="wizard-title">Crear Nueva Póliza</h1><p className="wizard-subtitle">Completa cada sección para generar la póliza</p></div>

      {/* Stepper */}
      <div className="stepper">
        {pasos.map((p, i) => (
          <div key={i} className={`step ${i === paso ? "step--active" : ""} ${i < paso ? "step--done" : ""}`}>
            <div className="step-circle">{i < paso ? <CheckIcon /> : i + 1}</div>
            <span className="step-label">{p}</span>
            {i < pasos.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="wizard-content">

        {/* PASO 0: Cliente */}
        {paso === 0 && (
          <div className="wizard-step">
            <h2 className="step-title">Seleccionar Cliente</h2>
            <select className="wizard-select" value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
              <option value="">— Selecciona un cliente —</option>
              {clientes.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombreRazonSocial} — {c.rfc}</option>)}
            </select>
            {clienteSel && (
              <div className="preview-card"><div className="preview-grid">
                <div><span className="preview-label">Nombre</span><span className="preview-value">{clienteSel.nombreRazonSocial}</span></div>
                <div><span className="preview-label">RFC</span><span className="preview-value">{clienteSel.rfc}</span></div>
                <div><span className="preview-label">Email</span><span className="preview-value">{clienteSel.email}</span></div>
                <div><span className="preview-label">Teléfono</span><span className="preview-value">{clienteSel.telefono}</span></div>
                <div className="preview-full"><span className="preview-label">Dirección</span><span className="preview-value">{clienteSel.direccionFiscal}</span></div>
              </div></div>
            )}
          </div>
        )}

        {/* PASO 1: Agente → Aseguradora filtrada */}
        {paso === 1 && (
          <div className="wizard-step">
            <h2 className="step-title">Agente y Aseguradora</h2>
            <div className="wizard-form-grid">
              <div className="wizard-field">
                <label className="wizard-label">Agente</label>
                <select className="wizard-select" value={form.agenteId} onChange={e => setForm({ ...form, agenteId: e.target.value })}>
                  <option value="">— Selecciona un agente —</option>
                  {agentes.map(a => <option key={a.idAgente} value={a.idAgente}>{a.nombreCompleto} — Comisión: {a.comision}%</option>)}
                </select>
              </div>
              <div className="wizard-field">
                <label className="wizard-label">Aseguradora {form.agenteId && <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "10px" }}>({aseguradorasFiltradas.length} disponibles para este agente)</span>}</label>
                <select className="wizard-select" value={form.aseguradoraId} onChange={e => setForm({ ...form, aseguradoraId: e.target.value })} disabled={!form.agenteId}>
                  <option value="">{form.agenteId ? "— Selecciona una aseguradora —" : "— Primero selecciona un agente —"}</option>
                  {aseguradorasFiltradas.map(a => <option key={a.idAseguradora} value={a.idAseguradora}>{a.nombreComercial}</option>)}
                </select>
              </div>
            </div>
            {!form.agenteId && <p className="wizard-hint">Selecciona un agente para ver las aseguradoras con las que tiene convenio.</p>}
            {agenteSel && aseguradoraSel && (
              <div className="preview-card"><div className="preview-grid">
                <div><span className="preview-label">Agente</span><span className="preview-value">{agenteSel.nombreCompleto}</span></div>
                <div><span className="preview-label">Comisión</span><span className="preview-value" style={{ color: "#10B981" }}>{agenteSel.comision}%</span></div>
                <div><span className="preview-label">Aseguradora</span><span className="preview-value">{aseguradoraSel.nombreComercial}</span></div>
                <div><span className="preview-label">Razón Social</span><span className="preview-value">{aseguradoraSel.razonSocial}</span></div>
              </div></div>
            )}
          </div>
        )}

        {/* PASO 2: Vehículo + Cobertura */}
        {paso === 2 && (
          <div className="wizard-step">
            <h2 className="step-title">Vehículo y Tipo de Cobertura</h2>
            <div className="wizard-form-grid">
              <div className="wizard-field">
                <label className="wizard-label">Marca *</label>
                <select className="wizard-select" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })}>
                  <option value="">— Selecciona marca —</option>
                  {marcasDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="wizard-field"><label className="wizard-label">Modelo / Año *</label><input className="wizard-input" type="number" min="2000" max="2030" value={form.modeloAnio} onChange={e => setForm({ ...form, modeloAnio: e.target.value })} placeholder="2024" /></div>
              <div className="wizard-field"><label className="wizard-label">Placas *</label><input className="wizard-input" value={form.placas} onChange={e => setForm({ ...form, placas: e.target.value.toUpperCase() })} placeholder="VER-123-A" /></div>
              <div className="wizard-field"><label className="wizard-label">VIN (17 caracteres)</label><input className="wizard-input" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value.toUpperCase() })} maxLength={17} placeholder="3N1CN7AD5NL800001" /></div>
              <div className="wizard-field wizard-field--full"><label className="wizard-label">Descripción</label><input className="wizard-input" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Nissan Versa Advance Color Blanco" /></div>
            </div>

            <h3 className="step-subtitle">Tipo de Cobertura</h3>
            <div className="cobertura-cards">
              {coberturas.map(c => (
                <div key={c.id} className={`cobertura-card ${form.cobertura === c.id ? "cobertura-card--active" : ""}`} onClick={() => setForm({ ...form, cobertura: c.id })}>
                  <div className="cobertura-radio">{form.cobertura === c.id && <div className="cobertura-radio-dot" />}</div>
                  <div className="cobertura-info">
                    <span className="cobertura-nombre">{c.nombre}</span>
                    <span className="cobertura-desc">{c.desc}</span>
                  </div>
                  <span className="cobertura-factor">{(c.factor * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {form.marca && form.modeloAnio && (
              <div className="cotizacion-preview">
                <CalcIcon />
                <span>Valor estimado del vehículo: <strong>{formatMoney(calcularPrima(form.marca, form.modeloAnio, form.cobertura).valorVehiculo)}</strong></span>
                <span className="cotizacion-sep">|</span>
                <span>Prima anual estimada: <strong style={{ color: "#D4AF37" }}>{formatMoney(calcularPrima(form.marca, form.modeloAnio, form.cobertura).prima)}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Cotización / Datos de póliza */}
        {paso === 3 && (
          <div className="wizard-step">
            <h2 className="step-title">Cotización y Datos de la Póliza</h2>

            <div className="cotizacion-resumen">
              <div className="cotizacion-item"><span className="cotizacion-label">Vehículo</span><span className="cotizacion-valor">{form.marca} {form.modeloAnio}</span></div>
              <div className="cotizacion-item"><span className="cotizacion-label">Valor estimado</span><span className="cotizacion-valor">{formatMoney(form.valorVehiculo)}</span></div>
              <div className="cotizacion-item"><span className="cotizacion-label">Cobertura</span><span className="cotizacion-valor">{coberturaSel?.nombre}</span></div>
              <div className="cotizacion-item cotizacion-item--prima"><span className="cotizacion-label">Prima Total Calculada</span><span className="cotizacion-valor cotizacion-prima">{formatMoney(form.primaTotal)}</span></div>
            </div>

            <div className="wizard-form-grid" style={{ marginTop: "24px" }}>
              <div className="wizard-field"><label className="wizard-label">Número de Póliza</label><input className="wizard-input" value={form.numeroPoliza} onChange={e => setForm({ ...form, numeroPoliza: e.target.value })} /></div>
              <div className="wizard-field"><label className="wizard-label">Fecha Emisión</label><input className="wizard-input" type="date" value={form.fechaEmision} onChange={e => setForm({ ...form, fechaEmision: e.target.value })} /></div>
              <div className="wizard-field"><label className="wizard-label">Inicio Vigencia *</label><input className="wizard-input" type="date" value={form.inicioVigencia} onChange={e => setForm({ ...form, inicioVigencia: e.target.value })} /></div>
              <div className="wizard-field"><label className="wizard-label">Fin Vigencia</label><input className="wizard-input" type="date" value={form.finVigencia} readOnly style={{ opacity: 0.6 }} /></div>
              <div className="wizard-field"><label className="wizard-label">Forma de Pago</label><select className="wizard-select" value={form.formaPago} onChange={e => setForm({ ...form, formaPago: e.target.value })}><option value="Anual">Anual</option><option value="Semestral">Semestral</option><option value="Trimestral">Trimestral</option><option value="Mensual">Mensual</option></select></div>
              <div className="wizard-field"><label className="wizard-label">Moneda</label><select className="wizard-select" value={form.moneda} onChange={e => setForm({ ...form, moneda: e.target.value })}><option value="MXN">MXN (Pesos)</option><option value="USD">USD (Dólares)</option></select></div>
              <div className="wizard-field wizard-field--full"><label className="wizard-label">Prima Total (puedes ajustar manualmente)</label><input className="wizard-input wizard-input--big" type="number" step="0.01" min="0" value={form.primaTotal} onChange={e => setForm({ ...form, primaTotal: e.target.value })} /></div>
            </div>
          </div>
        )}

        {/* PASO 4: Recibos */}
        {paso === 4 && (
          <div className="wizard-step">
            <h2 className="step-title">Desglose de Recibos</h2>
            <p className="step-desc">Se generaron <strong>{form.recibos.length}</strong> recibo{form.recibos.length !== 1 ? "s" : ""} con pago <strong>{form.formaPago.toLowerCase()}</strong></p>
            <div className="recibos-table-wrapper"><table className="recibos-table"><thead><tr><th>#</th><th>Monto</th><th>Prima Neta</th><th>Comisión</th><th>Fecha Límite</th></tr></thead><tbody>
              {form.recibos.map((r, i) => (<tr key={i}><td>{r.parcialidad}</td><td className="td-monto">{formatMoney(r.montoTotal)}</td><td>{formatMoney(r.primaNeta)}</td><td>{r.comision}%</td><td>{formatDate(r.fechaLimite)}</td></tr>))}
              <tr className="recibos-total"><td><strong>Total</strong></td><td className="td-monto"><strong>{formatMoney(form.primaTotal)}</strong></td><td colSpan="3"></td></tr>
            </tbody></table></div>
          </div>
        )}

        {/* PASO 5: Resumen */}
        {paso === 5 && (
          <div className="wizard-step">
            <h2 className="step-title">Resumen de la Póliza</h2>
            <div ref={pdfRef} className="pdf-preview">
              <div className="pdf-header"><div className="pdf-logo"><h1>SIGEP</h1><p>SISTEMA DE GESTIÓN DE PÓLIZAS</p></div><div className="pdf-poliza-num"><h2>PÓLIZA DE SEGURO</h2><div className="numero">{form.numeroPoliza}</div><div className="estatus">VIGENTE</div></div></div>

              <div className="seccion"><div className="seccion-titulo">Datos del Cliente</div><div className="grid2">
                <div className="campo"><div className="campo-label">Nombre / Razón Social</div><div className="campo-valor">{clienteSel?.nombreRazonSocial}</div></div>
                <div className="campo"><div className="campo-label">RFC</div><div className="campo-valor">{clienteSel?.rfc}</div></div>
                <div className="campo"><div className="campo-label">Email</div><div className="campo-valor">{clienteSel?.email}</div></div>
                <div className="campo"><div className="campo-label">Teléfono</div><div className="campo-valor">{clienteSel?.telefono}</div></div>
              </div></div>

              <div className="seccion"><div className="seccion-titulo">Agente y Aseguradora</div><div className="grid2">
                <div className="campo"><div className="campo-label">Agente</div><div className="campo-valor">{agenteSel?.nombreCompleto}</div></div>
                <div className="campo"><div className="campo-label">Comisión</div><div className="campo-valor">{agenteSel?.comision}%</div></div>
                <div className="campo"><div className="campo-label">Aseguradora</div><div className="campo-valor">{aseguradoraSel?.nombreComercial}</div></div>
                <div className="campo"><div className="campo-label">Razón Social</div><div className="campo-valor">{aseguradoraSel?.razonSocial}</div></div>
              </div></div>

              <div className="seccion"><div className="seccion-titulo">Vehículo Asegurado</div><div className="grid3">
                <div className="campo"><div className="campo-label">Marca</div><div className="campo-valor">{form.marca}</div></div>
                <div className="campo"><div className="campo-label">Modelo/Año</div><div className="campo-valor">{form.modeloAnio}</div></div>
                <div className="campo"><div className="campo-label">Placas</div><div className="campo-valor">{form.placas}</div></div>
                <div className="campo"><div className="campo-label">VIN</div><div className="campo-valor">{form.vin || "—"}</div></div>
                <div className="campo"><div className="campo-label">Cobertura</div><div className="campo-valor">{coberturaSel?.nombre}</div></div>
                <div className="campo"><div className="campo-label">Valor Vehículo</div><div className="campo-valor">{formatMoney(form.valorVehiculo)}</div></div>
              </div></div>

              <div className="seccion"><div className="seccion-titulo">Datos de la Póliza</div><div className="grid3">
                <div className="campo"><div className="campo-label">Fecha Emisión</div><div className="campo-valor">{formatDate(form.fechaEmision)}</div></div>
                <div className="campo"><div className="campo-label">Inicio Vigencia</div><div className="campo-valor">{formatDate(form.inicioVigencia)}</div></div>
                <div className="campo"><div className="campo-label">Fin Vigencia</div><div className="campo-valor">{formatDate(form.finVigencia)}</div></div>
                <div className="campo"><div className="campo-label">Forma de Pago</div><div className="campo-valor">{form.formaPago}</div></div>
                <div className="campo"><div className="campo-label">Moneda</div><div className="campo-valor">{form.moneda}</div></div>
                <div className="campo"><div className="campo-label">Prima Total</div><div className="campo-valor" style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 700 }}>{formatMoney(form.primaTotal)}</div></div>
              </div></div>

              <div className="seccion"><div className="seccion-titulo">Desglose de Pagos</div>
                <table><thead><tr><th>#</th><th>Monto</th><th>Prima Neta</th><th>Fecha Límite</th></tr></thead><tbody>
                  {form.recibos.map((r, i) => (<tr key={i}><td>{r.parcialidad}</td><td style={{ fontWeight: 600 }}>{formatMoney(r.montoTotal)}</td><td>{formatMoney(r.primaNeta)}</td><td>{formatDate(r.fechaLimite)}</td></tr>))}
                  <tr><td className="total-td">Total</td><td className="total-td" style={{ color: "#D4AF37" }}>{formatMoney(form.primaTotal)}</td><td colSpan="2"></td></tr>
                </tbody></table>
              </div>

              <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center", width: "200px" }}><div className="firma-line">Firma del Asegurado</div></div>
                <div style={{ textAlign: "center", width: "200px" }}><div className="firma-line">Firma del Agente</div></div>
              </div>
            </div>

            <div className="wizard-actions-final">
              {!guardado ? (<button className="btn-guardar" onClick={guardarPoliza} disabled={guardando}><SaveIcon /> {guardando ? "Guardando..." : "Guardar Póliza"}</button>) :
                (<div className="guardado-ok"><CheckIcon /> Póliza guardada exitosamente</div>)}
              <button className="btn-imprimir" onClick={imprimirPDF}><PrintIcon /> Imprimir / Descargar PDF</button>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      {paso < 5 && (<div className="wizard-nav">
        <button className="btn-nav btn-nav--back" onClick={anterior} disabled={paso === 0}><ChevLeft /> Anterior</button>
        <button className="btn-nav btn-nav--next" onClick={siguiente} disabled={!validarPaso()}>Siguiente <ChevRight /></button>
      </div>)}
      {paso === 5 && !guardado && (<div className="wizard-nav"><button className="btn-nav btn-nav--back" onClick={anterior}><ChevLeft /> Anterior</button></div>)}
      {guardado && (<div className="wizard-nav"><button className="btn-nav btn-nav--next" onClick={() => navigate("/polizas")}>Ver Pólizas <ChevRight /></button></div>)}
    </div>
  );
}