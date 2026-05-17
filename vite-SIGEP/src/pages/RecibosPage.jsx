import { useState, useEffect } from "react";
import { recibosApi } from "../services/api";
import "./ModPages.css";
import "./PagoForm.css";

const Icons = {
  Search:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Eye:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Close:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:()=><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Spin:()=><svg width="40" height="40" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"/></svg>,
  Pay:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Check:()=><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Lock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
};

const fmt = (f) => f ? new Date(f).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtMoney = (v) => "$" + Number(v||0).toLocaleString("es-MX",{minimumFractionDigits:2});
const badgeCls = { Pagado:"badge--gold", Pendiente:"badge--blue", Vencido:"badge--red" };

/* ── Formatear número de tarjeta ── */
const formatCardNumber = (value) => {
  const nums = value.replace(/\D/g, "").slice(0, 16);
  return nums.replace(/(.{4})/g, "$1 ").trim();
};
const formatExpiry = (value) => {
  const nums = value.replace(/\D/g, "").slice(0, 4);
  if (nums.length > 2) return nums.slice(0, 2) + "/" + nums.slice(2);
  return nums;
};
const detectCardType = (num) => {
  const n = num.replace(/\D/g, "");
  if (n.startsWith("4")) return "visa";
  if (n.startsWith("5") || n.startsWith("2")) return "mastercard";
  if (n.startsWith("3")) return "amex";
  return "";
};

const CardLogo = ({ type }) => {
  if (type === "visa") return <span className="card-brand card-brand--visa">VISA</span>;
  if (type === "mastercard") return <span className="card-brand card-brand--mc">MC</span>;
  if (type === "amex") return <span className="card-brand card-brand--amex">AMEX</span>;
  return null;
};

export default function RecibosPage() {
  const [items, setItems] = useState([]);
  const [busq, setBusq] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ t:null, item:null });
  const [guardando, setGuardando] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // Método de pago
  const [metodoPago, setMetodoPago] = useState("");
  // Datos tarjeta
  const [tarjeta, setTarjeta] = useState({ numero:"", nombre:"", expiry:"", cvv:"" });
  // Datos transferencia
  const [transferencia, setTransferencia] = useState({ banco:"", referencia:"", fecha:"" });

  const cargar = async () => {
    try { setLoading(true); setError(null); setItems(await recibosApi.obtenerTodos()); }
    catch(e) { setError("No se pudieron cargar los recibos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); setTimeout(()=>setMounted(true),100); }, []);

  const getPoliza = (r) => r.poliza?.numeroPoliza || "—";

  const filtered = items.filter(r => {
    const b = getPoliza(r).toLowerCase().includes(busq.toLowerCase());
    return b && (filtro==="Todos" || r.estatusPago===filtro);
  });

  const resetPago = () => {
    setMetodoPago(""); setPagoExitoso(false); setProcesando(false);
    setTarjeta({ numero:"", nombre:"", expiry:"", cvv:"" });
    setTransferencia({ banco:"", referencia:"", fecha:"" });
  };

  const open = (t,item=null) => { resetPago(); setModal({t,item}); };
  const close = () => { setModal({t:null,item:null}); setGuardando(false); resetPago(); };

  const del = async () => {
    setGuardando(true);
    try { await recibosApi.eliminar(modal.item.idRecibo); await cargar(); close(); }
    catch(e) { alert("Error: "+e.message); setGuardando(false); }
  };

  const validarPago = () => {
    if (metodoPago === "tarjeta_credito" || metodoPago === "tarjeta_debito") {
      return tarjeta.numero.replace(/\D/g,"").length === 16 && tarjeta.nombre.length > 2 && tarjeta.expiry.length === 5 && tarjeta.cvv.length >= 3;
    }
    if (metodoPago === "transferencia") {
      return transferencia.banco && transferencia.referencia.length > 3;
    }
    if (metodoPago === "efectivo") return true;
    return false;
  };

  const procesarPago = async () => {
    if (!validarPago()) return;
    setProcesando(true);

    // Simular procesamiento (1.5 segundos)
    await new Promise(r => setTimeout(r, 1500));

    try {
      const hoy = new Date().toISOString().split("T")[0];
      await recibosApi.actualizar(modal.item.idRecibo, {
        ...modal.item,
        poliza: modal.item.poliza ? { idPoliza: modal.item.poliza.idPoliza } : null,
        estatusPago: "Pagado",
        fechaPagoReal: hoy,
      });
      setProcesando(false);
      setPagoExitoso(true);
      await cargar();
    } catch(e) {
      alert("Error al procesar pago: " + e.message);
      setProcesando(false);
    }
  };

  if(loading) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(232,230,225,0.5)"}}><Icons.Spin/><p style={{marginTop:"16px"}}>Cargando recibos...</p></div></div>;
  if(error) return <div className="mod-page mod-page--visible" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"400px"}}><div style={{textAlign:"center",color:"rgba(231,76,60,0.8)"}}><Icons.Warn/><p style={{marginTop:"16px"}}>{error}</p><button className="btn-agregar" style={{marginTop:"16px"}} onClick={cargar}>Reintentar</button></div></div>;

  return (
    <div className={`mod-page ${mounted?"mod-page--visible":""}`}>
      <div className="mod-header"><div><h1 className="mod-title">Recibos</h1><p className="mod-subtitle">{items.length} recibos registrados</p></div></div>
      <div className="mod-filtros">{["Todos","Pagado","Pendiente","Vencido"].map(e=><button key={e} className={`filtro-btn ${filtro===e?"filtro-btn--active":""}`} onClick={()=>setFiltro(e)}>{e} <span className="filtro-count">{e==="Todos"?items.length:items.filter(r=>r.estatusPago===e).length}</span></button>)}</div>
      <div className="mod-toolbar"><div className="search-wrapper"><div className="search-icon"><Icons.Search/></div><input className="search-input" placeholder="Buscar por número de póliza..." value={busq} onChange={e=>setBusq(e.target.value)}/>{busq&&<button className="search-clear" onClick={()=>setBusq("")}><Icons.Close/></button>}</div><span className="results-count">{filtered.length} resultado{filtered.length!==1?"s":""}</span></div>

      <div className="table-container"><table className="mod-table"><thead><tr><th>ID</th><th>No. Póliza</th><th>Parcialidad</th><th>Monto Total</th><th>Fecha Límite</th><th>Fecha Pago</th><th>Estatus</th><th>Acciones</th></tr></thead><tbody>
        {filtered.length===0?<tr><td colSpan="8" className="table-empty">Sin resultados</td></tr>:filtered.map(r=><tr key={r.idRecibo}>
          <td className="td-id">{r.idRecibo}</td>
          <td className="td-nombre">{getPoliza(r)}</td>
          <td style={{textAlign:"center"}}>{r.numeroParcialidad}</td>
          <td className="td-monto">{fmtMoney(r.montoTotal)}</td>
          <td className="td-fecha">{fmt(r.fechaLimitePago)}</td>
          <td className="td-fecha">{r.fechaPagoReal?fmt(r.fechaPagoReal):<span style={{color:"rgba(232,230,225,0.25)"}}>—</span>}</td>
          <td><span className={`mod-badge ${badgeCls[r.estatusPago]||""}`}>{r.estatusPago}</span></td>
          <td className="td-acciones">
            <button className="btn-accion btn-ver" onClick={()=>open("ver",r)}><Icons.Eye/></button>
            {(r.estatusPago==="Pendiente"||r.estatusPago==="Vencido")&&<button className="btn-accion btn-pagar" onClick={()=>open("pagar",r)} style={{color:"rgba(16,185,129,0.7)"}}><Icons.Pay/></button>}
            <button className="btn-accion btn-eliminar" onClick={()=>open("eliminar",r)}><Icons.Trash/></button>
          </td>
        </tr>)}
      </tbody></table></div>

      {/* ═══ MODALES ═══ */}
      {modal.t&&<div className="modal-overlay" onClick={close}><div className={`modal-content ${modal.t==="pagar"?"modal-content--pago":""}`} onClick={e=>e.stopPropagation()}>

        {/* VER */}
        {modal.t==="ver"&&<><div className="modal-header"><h3 className="modal-title">Detalle del Recibo</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="detail-grid">
          <div className="detail-item"><span className="detail-label">ID</span><span className="detail-value">{modal.item.idRecibo}</span></div>
          <div className="detail-item"><span className="detail-label">No. Póliza</span><span className="detail-value">{getPoliza(modal.item)}</span></div>
          <div className="detail-item"><span className="detail-label">Parcialidad</span><span className="detail-value">{modal.item.numeroParcialidad}</span></div>
          <div className="detail-item"><span className="detail-label">Estatus</span><span className={`mod-badge ${badgeCls[modal.item.estatusPago]}`}>{modal.item.estatusPago}</span></div>
          <div className="detail-item"><span className="detail-label">Monto Total</span><span className="detail-value" style={{color:"#D4AF37",fontWeight:600}}>{fmtMoney(modal.item.montoTotal)}</span></div>
          <div className="detail-item"><span className="detail-label">Prima Neta</span><span className="detail-value">{fmtMoney(modal.item.montoPrimaNeta)}</span></div>
          <div className="detail-item"><span className="detail-label">Fecha Límite</span><span className="detail-value">{fmt(modal.item.fechaLimitePago)}</span></div>
          <div className="detail-item"><span className="detail-label">Fecha Pago</span><span className="detail-value">{modal.item.fechaPagoReal?fmt(modal.item.fechaPagoReal):"Sin pago"}</span></div>
          <div className="detail-item"><span className="detail-label">Comisión</span><span className="detail-value">{modal.item.porcentajeComisionAgente}%</span></div>
        </div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cerrar</button>
          {(modal.item.estatusPago==="Pendiente"||modal.item.estatusPago==="Vencido")&&<button className="btn-modal btn-modal--primary" onClick={()=>{close();setTimeout(()=>open("pagar",modal.item),100);}}>Registrar Pago</button>}
        </div></>}

        {/* ═══ PAGAR ═══ */}
        {modal.t==="pagar"&&<>
          <div className="modal-header"><h3 className="modal-title">{pagoExitoso?"Pago Exitoso":procesando?"Procesando Pago":"Realizar Pago"}</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div>
          <div className="modal-body">

            {/* ── Procesando ── */}
            {procesando && (
              <div className="pago-procesando">
                <div className="pago-procesando-spinner"><Icons.Spin/></div>
                <h3>Procesando tu pago...</h3>
                <p>No cierres esta ventana</p>
                <div className="pago-procesando-bar"><div className="pago-procesando-bar-fill"/></div>
              </div>
            )}

            {/* ── Éxito ── */}
            {pagoExitoso && !procesando && (
              <div className="pago-exito">
                <Icons.Check/>
                <h3>Pago registrado exitosamente</h3>
                <div className="pago-exito-monto">{fmtMoney(modal.item.montoTotal)}</div>
                <div className="pago-exito-detalles">
                  <div><span>Recibo</span><strong>#{modal.item.idRecibo}</strong></div>
                  <div><span>Póliza</span><strong>{getPoliza(modal.item)}</strong></div>
                  <div><span>Método</span><strong>{{efectivo:"Efectivo",tarjeta_credito:"Tarjeta de Crédito",tarjeta_debito:"Tarjeta de Débito",transferencia:"Transferencia"}[metodoPago]}</strong></div>
                  <div><span>Fecha</span><strong>{new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</strong></div>
                  {(metodoPago==="tarjeta_credito"||metodoPago==="tarjeta_debito")&&<div><span>Tarjeta</span><strong>•••• •••• •••• {tarjeta.numero.replace(/\D/g,"").slice(-4)}</strong></div>}
                  {metodoPago==="transferencia"&&<div><span>Referencia</span><strong>{transferencia.referencia}</strong></div>}
                </div>
              </div>
            )}

            {/* ── Formulario de pago ── */}
            {!procesando && !pagoExitoso && (<>
              {/* Monto */}
              <div className="pago-monto-box">
                <p className="pago-monto-label">Total a pagar</p>
                <p className="pago-monto-valor">{fmtMoney(modal.item.montoTotal)}</p>
                <p className="pago-monto-info">Póliza: {getPoliza(modal.item)} — Parcialidad {modal.item.numeroParcialidad}</p>
              </div>

              {/* Métodos */}
              <div className="pago-metodos-tabs">
                {[
                  {id:"tarjeta_credito",label:"Crédito",icon:"💳"},
                  {id:"tarjeta_debito",label:"Débito",icon:"💳"},
                  {id:"transferencia",label:"Transferencia",icon:"🏦"},
                  {id:"efectivo",label:"Efectivo",icon:"💵"},
                ].map(m=>(
                  <button key={m.id} className={`pago-tab ${metodoPago===m.id?"pago-tab--active":""}`} onClick={()=>setMetodoPago(m.id)}>
                    <span className="pago-tab-icon">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Formulario Tarjeta ── */}
              {(metodoPago==="tarjeta_credito"||metodoPago==="tarjeta_debito")&&(
                <div className="pago-form">
                  <div className="pago-card-visual">
                    <div className="pago-card-chip"/>
                    <div className="pago-card-number">{tarjeta.numero || "•••• •••• •••• ••••"}</div>
                    <div className="pago-card-bottom">
                      <div><span className="pago-card-label">TITULAR</span><span className="pago-card-text">{tarjeta.nombre || "NOMBRE COMPLETO"}</span></div>
                      <div><span className="pago-card-label">VENCE</span><span className="pago-card-text">{tarjeta.expiry || "MM/YY"}</span></div>
                    </div>
                    <CardLogo type={detectCardType(tarjeta.numero)}/>
                  </div>

                  <div className="pago-field pago-field--full">
                    <label>Número de tarjeta</label>
                    <div className="pago-input-wrap">
                      <input type="text" value={tarjeta.numero} onChange={e=>setTarjeta({...tarjeta,numero:formatCardNumber(e.target.value)})} placeholder="1234 5678 9012 3456" maxLength={19}/>
                      <CardLogo type={detectCardType(tarjeta.numero)}/>
                    </div>
                  </div>
                  <div className="pago-field pago-field--full">
                    <label>Nombre del titular</label>
                    <input type="text" value={tarjeta.nombre} onChange={e=>setTarjeta({...tarjeta,nombre:e.target.value.toUpperCase()})} placeholder="COMO APARECE EN LA TARJETA"/>
                  </div>
                  <div className="pago-field-row">
                    <div className="pago-field">
                      <label>Fecha de vencimiento</label>
                      <input type="text" value={tarjeta.expiry} onChange={e=>setTarjeta({...tarjeta,expiry:formatExpiry(e.target.value)})} placeholder="MM/YY" maxLength={5}/>
                    </div>
                    <div className="pago-field">
                      <label>CVV</label>
                      <input type="password" value={tarjeta.cvv} onChange={e=>setTarjeta({...tarjeta,cvv:e.target.value.replace(/\D/g,"").slice(0,4)})} placeholder="•••" maxLength={4}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Formulario Transferencia ── */}
              {metodoPago==="transferencia"&&(
                <div className="pago-form">
                  <div className="pago-transfer-info">
                    <h4>Datos para transferencia</h4>
                    <div className="pago-transfer-dato"><span>Banco destino</span><strong>BBVA México</strong></div>
                    <div className="pago-transfer-dato"><span>CLABE</span><strong>012180001234567890</strong></div>
                    <div className="pago-transfer-dato"><span>Beneficiario</span><strong>SIGEP Seguros S.A. de C.V.</strong></div>
                    <div className="pago-transfer-dato"><span>Concepto</span><strong>Pago Recibo #{modal.item.idRecibo}</strong></div>
                  </div>
                  <div className="pago-field pago-field--full">
                    <label>Banco emisor</label>
                    <select value={transferencia.banco} onChange={e=>setTransferencia({...transferencia,banco:e.target.value})}>
                      <option value="">— Selecciona tu banco —</option>
                      <option value="BBVA">BBVA México</option>
                      <option value="Banorte">Banorte</option>
                      <option value="Santander">Santander</option>
                      <option value="HSBC">HSBC</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="Banamex">Citibanamex</option>
                      <option value="Azteca">Banco Azteca</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="pago-field-row">
                    <div className="pago-field">
                      <label>No. de referencia / folio</label>
                      <input type="text" value={transferencia.referencia} onChange={e=>setTransferencia({...transferencia,referencia:e.target.value})} placeholder="Ej: 7839201456"/>
                    </div>
                    <div className="pago-field">
                      <label>Fecha de transferencia</label>
                      <input type="date" value={transferencia.fecha} onChange={e=>setTransferencia({...transferencia,fecha:e.target.value})}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Efectivo ── */}
              {metodoPago==="efectivo"&&(
                <div className="pago-form">
                  <div className="pago-efectivo-box">
                    <span className="pago-efectivo-icon">💵</span>
                    <h4>Pago en Efectivo</h4>
                    <p>El pago se registrará con la fecha de hoy:</p>
                    <p className="pago-efectivo-fecha">{new Date().toLocaleDateString("es-MX",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}</p>
                  </div>
                </div>
              )}

              {/* Seguridad */}
              {metodoPago&&<div className="pago-seguridad"><Icons.Lock/><span>Transacción protegida con cifrado SSL de 256 bits</span></div>}
            </>)}
          </div>

          <div className="modal-footer">
            {pagoExitoso ? (
              <button className="btn-modal btn-modal--primary" onClick={close}>Cerrar</button>
            ) : !procesando ? (
              <>
                <button className="btn-modal btn-modal--secondary" onClick={close}>Cancelar</button>
                {metodoPago&&<button className="btn-pago-confirmar" onClick={procesarPago} disabled={!validarPago()}>
                  <Icons.Lock/> Pagar {fmtMoney(modal.item.montoTotal)}
                </button>}
              </>
            ) : null}
          </div>
        </>}

        {/* ELIMINAR */}
        {modal.t==="eliminar"&&<><div className="modal-header modal-header--danger"><h3 className="modal-title">Eliminar Recibo</h3><button className="modal-close" onClick={close}><Icons.Close/></button></div><div className="modal-body"><div className="delete-warning"><Icons.Warn/><p>¿Eliminar recibo <strong>#{modal.item.idRecibo}</strong> de {getPoliza(modal.item)}?</p><p className="delete-warning-sub">No se puede deshacer.</p></div></div><div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={close}>Cancelar</button><button className="btn-modal btn-modal--danger" onClick={del} disabled={guardando}>{guardando?"Eliminando...":"Eliminar"}</button></div></>}

      </div></div>}
    </div>
  );
}