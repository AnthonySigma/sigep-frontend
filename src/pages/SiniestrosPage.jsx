import { useState, useEffect } from "react";
import { siniestrosApi } from "../services/api";
import "./ModPages.css";

const Icons = {
  Search:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Eye:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Close:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:()=><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Spin:()=><svg width="40" height="40" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"/></svg>,
};

const badgeCls = { "Pagado":"badge--gold", "En Trámite":"badge--blue", "Rechazado":"badge--red" };

const fmtFecha = (f) => {
  if(!f) return "—";
  const d = new Date(f);
  return d.toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}) + " " + d.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
};

export default function SiniestrosPage() {
  const [items, setItems] = useState([]);
  const [busq, setBusq] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ t:null, item:null });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try { setLoading(true); setError(null); setItems(await siniestrosApi.obtenerTodos()); }
    catch(e) { setError("No se pudieron cargar los siniestros."); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); setTimeout(()=>setMounted(true),100); }, []);

  const getPoliza = (s) => s.poliza?.numeroPoliza || "—";

  const filtered = items.filter(s => {
    const texto = `${getPoliza(s)} ${s.numeroReporte||""} ${s.ajustadorNombre||""}`.toLowerCase();
    const b = texto.includes(busq.toLowerCase());
    return b && (filtro==="Todos" || s.estatusSiniestro===filtro);
  });

  const open = (t,item=null) => setModal({t,item});
  const close = () => { setModal({t:null,item:null}); setGuardando(false); };

  const del = async () => {
    setGuardando(true);
    try { await siniestrosApi.eliminar(modal.item.idSiniestro); await cargar(); close(); }
    catch(e) { alert("Error: "+e.message); setGuardando(false); }
  };

  if(loading) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(232,230,225,0.5)"}}><Icons.Spin/><p style={{marginTop:"16px"}}>Cargando siniestros...</p></div></div>;
  if(error) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(231,76,60,0.8)"}}><Icons.Warn/><p style={{marginTop:"16px"}}>{error}</p><button className="btn-agregar" style={{marginTop:"16px"}} onClick={cargar}>Reintentar</button></div></div>;

  return (
    <div className={`mod-page ${mounted?"mod-page--visible":""}`}>
      <div className="mod-header"><div><h1 className="mod-title">Siniestros</h1><p className="mod-subtitle">{items.length} siniestros registrados</p></div></div>
      <div className="mod-filtros">{["Todos","En Trámite","Pagado","Rechazado"].map(e=><button key={e} className={`filtro-btn ${filtro===e?"filtro-btn--active":""}`} onClick={()=>setFiltro(e)}>{e} <span className="filtro-count">{e==="Todos"?items.length:items.filter(s=>s.estatusSiniestro===e).length}</span></button>)}</div>
      <div className="mod-toolbar"><div className="search-wrapper"><div className="search-icon"><Icons.Search/></div><input className="search-input" placeholder="Buscar por póliza, reporte o ajustador..." value={busq} onChange={e=>setBusq(e.target.value)}/>{busq&&<button className="search-clear" onClick={()=>setBusq("")}><Icons.Close/></button>}</div><span className="results-count">{filtered.length} resultado{filtered.length!==1?"s":""}</span></div>
      <div className="table-container"><table className="mod-table"><thead><tr><th>ID</th><th>No. Reporte</th><th>No. Póliza</th><th>Fecha Ocurrencia</th><th>Ajustador</th><th>Estatus</th><th>Acciones</th></tr></thead><tbody>
        {filtered.length===0?<tr><td colSpan="7" className="table-empty">Sin resultados</td></tr>:filtered.map(s=><tr key={s.idSiniestro}><td className="td-id">{s.idSiniestro}</td><td className="td-nombre" style={{color:"#F59E0B"}}>{s.numeroReporte}</td><td className="td-rfc">{getPoliza(s)}</td><td className="td-fecha">{fmtFecha(s.fechaOcurrencia)}</td><td style={{fontSize:"13px",color:"rgba(232,230,225,0.6)"}}>{s.ajustadorNombre}</td><td><span className={`mod-badge ${badgeCls[s.estatusSiniestro]||""}`}>{s.estatusSiniestro}</span></td><td className="td-acciones"><button className="btn-accion btn-ver" onClick={()=>open("ver",s)}><Icons.Eye/></button><button className="btn-accion btn-eliminar" onClick={()=>open("eliminar",s)}><Icons.Trash/></button></td></tr>)}
      </tbody></table></div>

      {modal.t&&<div className="modal-overlay" onClick={close}><div className="modal-content" onClick={e=>e.stopPropagation()}>
        {modal.t==="ver"&&<><div className="modal-header"><h3 className="modal-title">Detalle del Siniestro</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="detail-grid">
          <div className="detail-item"><span className="detail-label">No. Reporte</span><span className="detail-value" style={{color:"#F59E0B",fontWeight:500}}>{modal.item.numeroReporte}</span></div>
          <div className="detail-item"><span className="detail-label">Estatus</span><span className={`mod-badge ${badgeCls[modal.item.estatusSiniestro]}`}>{modal.item.estatusSiniestro}</span></div>
          <div className="detail-item"><span className="detail-label">No. Póliza</span><span className="detail-value">{getPoliza(modal.item)}</span></div>
          <div className="detail-item"><span className="detail-label">Fecha</span><span className="detail-value">{fmtFecha(modal.item.fechaOcurrencia)}</span></div>
          <div className="detail-item detail-item--full"><span className="detail-label">Ajustador</span><span className="detail-value">{modal.item.ajustadorNombre}</span></div>
        </div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cerrar</button></div></>}
        {modal.t==="eliminar"&&<><div className="modal-header modal-header--danger"><h3 className="modal-title">Eliminar Siniestro</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="delete-warning"><Icons.Warn/><p>¿Eliminar siniestro <strong>{modal.item.numeroReporte}</strong>?</p><p className="delete-warning-sub">No se puede deshacer.</p></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cancelar</button><button className="btn-modal btn-modal--danger" onClick={del} disabled={guardando}>{guardando?"Eliminando...":"Eliminar"}</button></div></>}
      </div></div>}
    </div>
  );
}