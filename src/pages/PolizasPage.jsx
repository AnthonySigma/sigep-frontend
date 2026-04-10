import { useState, useEffect } from "react";
import { polizasApi } from "../services/api";
import "./PolizasPage.css";

const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ShieldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>;
const WarnIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const SpinIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"/></svg>;

const EstatusBadge = ({ estatus }) => {
  const cls = { Vigente:"badge--green", Cancelada:"badge--red", Renovada:"badge--blue", Gracia:"badge--yellow" };
  return <span className={`poliza-badge ${cls[estatus]||""}`}>{estatus}</span>;
};

const fmt = (f) => f ? new Date(f).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}) : "—";

export default function PolizasPage() {
  const [polizas, setPolizas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("Todos");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ tipo:null, poliza:null });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try { setLoading(true); setError(null); setPolizas(await polizasApi.obtenerTodos()); }
    catch(e) { setError("No se pudieron cargar las pólizas."); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); setTimeout(()=>setMounted(true),100); }, []);

  const getNombre = (p, campo) => {
    if(campo==="cliente") return p.cliente?.nombreRazonSocial || "—";
    if(campo==="agente") return p.agente?.nombreCompleto || "—";
    if(campo==="aseguradora") return p.aseguradora?.nombreComercial || "—";
    return "—";
  };

  const filtradas = polizas.filter(p => {
    const texto = `${p.numeroPoliza} ${getNombre(p,"cliente")} ${getNombre(p,"agente")} ${getNombre(p,"aseguradora")}`.toLowerCase();
    const b = texto.includes(busqueda.toLowerCase());
    const f = filtroEstatus==="Todos" || p.estatusPoliza===filtroEstatus;
    return b && f;
  });

  const contadores = {
    Todos: polizas.length,
    Vigente: polizas.filter(p=>p.estatusPoliza==="Vigente").length,
    Cancelada: polizas.filter(p=>p.estatusPoliza==="Cancelada").length,
    Renovada: polizas.filter(p=>p.estatusPoliza==="Renovada").length,
    Gracia: polizas.filter(p=>p.estatusPoliza==="Gracia").length,
  };

  const abrirVer = (p) => setModal({tipo:"ver",poliza:p});
  const abrirEliminar = (p) => setModal({tipo:"eliminar",poliza:p});
  const cerrarModal = () => { setModal({tipo:null,poliza:null}); setGuardando(false); };

  const eliminarPoliza = async () => {
    setGuardando(true);
    try { await polizasApi.eliminar(modal.poliza.idPoliza); await cargar(); cerrarModal(); }
    catch(e) { alert("Error: "+e.message); setGuardando(false); }
  };

  if(loading) return <div className="polizas-page polizas-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(232,230,225,0.5)"}}><SpinIcon/><p style={{marginTop:"16px"}}>Cargando pólizas...</p></div></div>;
  if(error) return <div className="polizas-page polizas-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(231,76,60,0.8)"}}><WarnIcon/><p style={{marginTop:"16px"}}>{error}</p><button className="btn-agregar" style={{marginTop:"16px"}} onClick={cargar}>Reintentar</button></div></div>;

  return (
    <div className={`polizas-page ${mounted?"polizas-page--visible":""}`}>
      <div className="polizas-header"><div><h1 className="polizas-title">Pólizas</h1><p className="polizas-subtitle">{polizas.length} pólizas registradas</p></div></div>

      <div className="polizas-filtros">{["Todos","Vigente","Cancelada","Renovada","Gracia"].map(est=><button key={est} className={`filtro-btn ${filtroEstatus===est?"filtro-btn--active":""}`} onClick={()=>setFiltroEstatus(est)}>{est} <span className="filtro-count">{contadores[est]}</span></button>)}</div>

      <div className="polizas-toolbar"><div className="search-wrapper"><div className="search-icon"><SearchIcon/></div><input className="search-input" placeholder="Buscar por número, cliente, agente o aseguradora..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>{busqueda&&<button className="search-clear" onClick={()=>setBusqueda("")}><CloseIcon/></button>}</div><span className="results-count">{filtradas.length} resultado{filtradas.length!==1?"s":""}</span></div>

      <div className="table-container"><table className="polizas-table"><thead><tr><th>No. Póliza</th><th>Cliente</th><th>Aseguradora</th><th>Vigencia</th><th>Forma Pago</th><th>Estatus</th><th>Acciones</th></tr></thead><tbody>
        {filtradas.length===0?<tr><td colSpan="7" className="table-empty">No se encontraron pólizas</td></tr>:filtradas.map(p=>(
          <tr key={p.idPoliza}>
            <td className="td-numero"><div className="numero-cell"><ShieldIcon/><span>{p.numeroPoliza}</span></div></td>
            <td className="td-cliente">{getNombre(p,"cliente")}</td>
            <td className="td-aseguradora">{getNombre(p,"aseguradora")}</td>
            <td className="td-vigencia"><span className="fecha-rango">{fmt(p.inicioVigencia)}</span><span className="fecha-separador">→</span><span className="fecha-rango">{fmt(p.finVigencia)}</span></td>
            <td className="td-forma">{p.formaPago}</td>
            <td><EstatusBadge estatus={p.estatusPoliza}/></td>
            <td className="td-acciones"><button className="btn-accion btn-ver" onClick={()=>abrirVer(p)}><EyeIcon/></button><button className="btn-accion btn-eliminar" onClick={()=>abrirEliminar(p)}><TrashIcon/></button></td>
          </tr>
        ))}
      </tbody></table></div>

      {modal.tipo&&<div className="modal-overlay" onClick={cerrarModal}><div className="modal-content modal-content--wide" onClick={e=>e.stopPropagation()}>
        {modal.tipo==="ver"&&<><div className="modal-header"><h3 className="modal-title">Detalle de Póliza</h3><button className="modal-close" onClick={cerrarModal}><CloseIcon/></button></div><div className="modal-body">
          <div className="detail-section"><h4 className="detail-section-title">Información General</h4><div className="detail-grid">
            <div className="detail-item"><span className="detail-label">No. Póliza</span><span className="detail-value detail-value--gold">{modal.poliza.numeroPoliza}</span></div>
            <div className="detail-item"><span className="detail-label">Estatus</span><EstatusBadge estatus={modal.poliza.estatusPoliza}/></div>
            <div className="detail-item"><span className="detail-label">Cliente</span><span className="detail-value">{getNombre(modal.poliza,"cliente")}</span></div>
            <div className="detail-item"><span className="detail-label">Agente</span><span className="detail-value">{getNombre(modal.poliza,"agente")}</span></div>
            <div className="detail-item"><span className="detail-label">Aseguradora</span><span className="detail-value">{getNombre(modal.poliza,"aseguradora")}</span></div>
            <div className="detail-item"><span className="detail-label">Moneda</span><span className="detail-value">{modal.poliza.moneda}</span></div>
          </div></div>
          <div className="detail-section"><h4 className="detail-section-title">Vigencia y Pago</h4><div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Fecha Emisión</span><span className="detail-value">{fmt(modal.poliza.fechaEmision)}</span></div>
            <div className="detail-item"><span className="detail-label">Forma de Pago</span><span className="detail-value">{modal.poliza.formaPago}</span></div>
            <div className="detail-item"><span className="detail-label">Inicio</span><span className="detail-value">{fmt(modal.poliza.inicioVigencia)}</span></div>
            <div className="detail-item"><span className="detail-label">Fin</span><span className="detail-value">{fmt(modal.poliza.finVigencia)}</span></div>
          </div></div>
        </div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={cerrarModal}>Cerrar</button></div></>}
        {modal.tipo==="eliminar"&&<><div className="modal-header modal-header--danger"><h3 className="modal-title">Eliminar Póliza</h3><button className="modal-close" onClick={cerrarModal}><CloseIcon/></button></div><div className="modal-body"><div className="delete-warning"><WarnIcon/><p>¿Eliminar <strong>{modal.poliza.numeroPoliza}</strong>?</p><p className="delete-warning-sub">Cliente: {getNombre(modal.poliza,"cliente")}</p><p className="delete-warning-sub">No se puede deshacer.</p></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={cerrarModal}>Cancelar</button><button className="btn-modal btn-modal--danger" onClick={eliminarPoliza} disabled={guardando}>{guardando?"Eliminando...":"Eliminar"}</button></div></>}
      </div></div>}
    </div>
  );
}