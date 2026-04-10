import { useState, useEffect } from "react";
import { aseguradorasApi } from "../services/api";
import "./ModPages.css";

const Icons = {
  Search:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Eye:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Close:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:()=><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Spin:()=><svg width="40" height="40" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"/></svg>,
};

export default function AseguradorasPage() {
  const [items, setItems] = useState([]);
  const [busq, setBusq] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ t:null, item:null });
  const [form, setForm] = useState({ nombreComercial:"", razonSocial:"", telefono:"", sitioWeb:"" });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try { setLoading(true); setError(null); setItems(await aseguradorasApi.obtenerTodos()); }
    catch(e) { setError("No se pudieron cargar las aseguradoras."); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); setTimeout(()=>setMounted(true),100); }, []);

  const filtered = items.filter(a=>(a.nombreComercial||"").toLowerCase().includes(busq.toLowerCase())||(a.razonSocial||"").toLowerCase().includes(busq.toLowerCase()));

  const open = (t,item=null) => {
    if(t==="agregar") setForm({nombreComercial:"",razonSocial:"",telefono:"",sitioWeb:""});
    else if(t==="editar") setForm({nombreComercial:item.nombreComercial,razonSocial:item.razonSocial||"",telefono:item.telefono||"",sitioWeb:item.sitioWeb||""});
    setModal({t,item});
  };
  const close = () => { setModal({t:null,item:null}); setGuardando(false); };

  const save = async () => {
    if(!form.nombreComercial) return;
    setGuardando(true);
    try {
      if(modal.t==="agregar") await aseguradorasApi.crear(form);
      else await aseguradorasApi.actualizar(modal.item.idAseguradora, form);
      await cargar(); close();
    } catch(e) { alert("Error: "+e.message); setGuardando(false); }
  };

  const del = async () => {
    setGuardando(true);
    try { await aseguradorasApi.eliminar(modal.item.idAseguradora); await cargar(); close(); }
    catch(e) { alert("Error: "+e.message); setGuardando(false); }
  };

  if(loading) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(232,230,225,0.5)"}}><Icons.Spin/><p style={{marginTop:"16px"}}>Cargando aseguradoras...</p></div></div>;
  if(error) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(231,76,60,0.8)"}}><Icons.Warn/><p style={{marginTop:"16px"}}>{error}</p><button className="btn-agregar" style={{marginTop:"16px"}} onClick={cargar}>Reintentar</button></div></div>;

  return (
    <div className={`mod-page ${mounted?"mod-page--visible":""}`}>
      <div className="mod-header"><div><h1 className="mod-title">Aseguradoras</h1><p className="mod-subtitle">{items.length} registros</p></div><button className="btn-agregar" onClick={()=>open("agregar")}><Icons.Plus/> Agregar</button></div>
      <div className="mod-toolbar"><div className="search-wrapper"><div className="search-icon"><Icons.Search/></div><input className="search-input" placeholder="Buscar por nombre o razón social..." value={busq} onChange={e=>setBusq(e.target.value)}/>{busq&&<button className="search-clear" onClick={()=>setBusq("")}><Icons.Close/></button>}</div><span className="results-count">{filtered.length} resultado{filtered.length!==1?"s":""}</span></div>
      <div className="table-container"><table className="mod-table"><thead><tr><th>ID</th><th>Nombre Comercial</th><th>Razón Social</th><th>Teléfono</th><th>Sitio Web</th><th>Acciones</th></tr></thead><tbody>
        {filtered.length===0?<tr><td colSpan="6" className="table-empty">Sin resultados</td></tr>:filtered.map(a=><tr key={a.idAseguradora}><td className="td-id">{a.idAseguradora}</td><td className="td-nombre">{a.nombreComercial}</td><td style={{fontSize:"12px",color:"rgba(232,230,225,0.5)"}}>{a.razonSocial}</td><td className="td-fecha">{a.telefono}</td><td style={{fontSize:"12px",color:"rgba(59,130,246,0.7)"}}>{a.sitioWeb}</td><td className="td-acciones"><button className="btn-accion btn-ver" onClick={()=>open("ver",a)}><Icons.Eye/></button><button className="btn-accion btn-editar" onClick={()=>open("editar",a)}><Icons.Edit/></button><button className="btn-accion btn-eliminar" onClick={()=>open("eliminar",a)}><Icons.Trash/></button></td></tr>)}
      </tbody></table></div>

      {modal.t&&<div className="modal-overlay" onClick={close}><div className="modal-content" onClick={e=>e.stopPropagation()}>
        {modal.t==="ver"&&<><div className="modal-header"><h3 className="modal-title">Detalle</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="detail-grid"><div className="detail-item"><span className="detail-label">Nombre</span><span className="detail-value">{modal.item.nombreComercial}</span></div><div className="detail-item"><span className="detail-label">Teléfono</span><span className="detail-value">{modal.item.telefono}</span></div><div className="detail-item detail-item--full"><span className="detail-label">Razón Social</span><span className="detail-value">{modal.item.razonSocial}</span></div><div className="detail-item detail-item--full"><span className="detail-label">Sitio Web</span><span className="detail-value">{modal.item.sitioWeb}</span></div></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cerrar</button></div></>}
        {(modal.t==="agregar"||modal.t==="editar")&&<><div className="modal-header"><h3 className="modal-title">{modal.t==="agregar"?"Agregar":"Editar"}</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="form-grid"><div className="form-group"><label className="form-label">Nombre Comercial *</label><input className="form-input" value={form.nombreComercial} onChange={e=>setForm({...form,nombreComercial:e.target.value})}/></div><div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div><div className="form-group form-group--full"><label className="form-label">Razón Social</label><input className="form-input" value={form.razonSocial} onChange={e=>setForm({...form,razonSocial:e.target.value})}/></div><div className="form-group form-group--full"><label className="form-label">Sitio Web</label><input className="form-input" value={form.sitioWeb} onChange={e=>setForm({...form,sitioWeb:e.target.value})} placeholder="www.ejemplo.com.mx"/></div></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cancelar</button><button className="btn-modal btn-modal--primary" onClick={save} disabled={guardando}>{guardando?"Guardando...":modal.t==="agregar"?"Agregar":"Guardar"}</button></div></>}
        {modal.t==="eliminar"&&<><div className="modal-header modal-header--danger"><h3 className="modal-title">Eliminar</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="delete-warning"><Icons.Warn/><p>¿Eliminar <strong>{modal.item.nombreComercial}</strong>?</p><p className="delete-warning-sub">No se puede deshacer.</p></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cancelar</button><button className="btn-modal btn-modal--danger" onClick={del} disabled={guardando}>{guardando?"Eliminando...":"Eliminar"}</button></div></>}
      </div></div>}
    </div>
  );
}