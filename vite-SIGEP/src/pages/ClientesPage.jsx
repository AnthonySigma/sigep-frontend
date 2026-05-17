import { useState, useEffect } from "react";
import { clientesApi } from "../services/api";
import "./ClientesPage.css";

/* ── Íconos ── */
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const WarnIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ tipo: null, cliente: null });
  const [formData, setFormData] = useState({ nombreRazonSocial: "", rfc: "", email: "", telefono: "", direccionFiscal: "" });
  const [guardando, setGuardando] = useState(false);

  /* ── Cargar clientes desde Spring Boot ── */
  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesApi.obtenerTodos();
      setClientes(data);
    } catch (err) {
      setError("No se pudieron cargar los clientes. Verifica que el backend esté corriendo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
    setTimeout(() => setMounted(true), 100);
  }, []);

  /* ── Filtrar en frontend ── */
  const clientesFiltrados = clientes.filter((c) =>
    c.nombreRazonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.rfc?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  /* ── Modales ── */
  const abrirVer = (cliente) => setModal({ tipo: "ver", cliente });

  const abrirEditar = (cliente) => {
    setFormData({
      nombreRazonSocial: cliente.nombreRazonSocial || "",
      rfc: cliente.rfc || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      direccionFiscal: cliente.direccionFiscal || "",
    });
    setModal({ tipo: "editar", cliente });
  };

  const abrirAgregar = () => {
    setFormData({ nombreRazonSocial: "", rfc: "", email: "", telefono: "", direccionFiscal: "" });
    setModal({ tipo: "agregar", cliente: null });
  };

  const abrirEliminar = (cliente) => setModal({ tipo: "eliminar", cliente });
  const cerrarModal = () => { setModal({ tipo: null, cliente: null }); setGuardando(false); };

  /* ── CRUD real contra Spring Boot ── */
  const guardarCliente = async () => {
    if (!formData.nombreRazonSocial || !formData.rfc) return;
    setGuardando(true);
    try {
      if (modal.tipo === "agregar") {
        await clientesApi.crear(formData);
      } else {
        await clientesApi.actualizar(modal.cliente.idCliente, formData);
      }
      await cargarClientes();
      cerrarModal();
    } catch (err) {
      alert("Error al guardar: " + err.message);
      setGuardando(false);
    }
  };

  const eliminarCliente = async () => {
    setGuardando(true);
    try {
      await clientesApi.eliminar(modal.cliente.idCliente);
      await cargarClientes();
      cerrarModal();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
      setGuardando(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="clientes-page clientes-page--visible" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center", color: "rgba(232,230,225,0.5)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="32" strokeLinecap="round"/>
          </svg>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="clientes-page clientes-page--visible" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center", color: "rgba(231,76,60,0.8)", maxWidth: "400px" }}>
          <WarnIcon />
          <p style={{ marginTop: "16px", fontSize: "15px" }}>{error}</p>
          <button className="btn-agregar" style={{ marginTop: "16px" }} onClick={cargarClientes}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`clientes-page ${mounted ? "clientes-page--visible" : ""}`}>
      {/* Header */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">Clientes</h1>
          <p className="clientes-subtitle">{clientes.length} registros en total</p>
        </div>
        <button className="btn-agregar" onClick={abrirAgregar}>
          <PlusIcon /> Agregar Cliente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="clientes-toolbar">
        <div className="search-wrapper">
          <div className="search-icon"><SearchIcon /></div>
          <input className="search-input" type="text" placeholder="Buscar por nombre, RFC o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="search-clear" onClick={() => setBusqueda("")}><CloseIcon /></button>}
        </div>
        <span className="results-count">{clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre / Razón Social</th>
              <th>RFC</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No se encontraron clientes{busqueda ? ` con "${busqueda}"` : ""}</td></tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.idCliente}>
                  <td className="td-id">{cliente.idCliente}</td>
                  <td className="td-nombre">{cliente.nombreRazonSocial}</td>
                  <td className="td-rfc">{cliente.rfc}</td>
                  <td className="td-email">{cliente.email}</td>
                  <td className="td-telefono">{cliente.telefono}</td>
                  <td className="td-acciones">
                    <button className="btn-accion btn-ver" title="Ver" onClick={() => abrirVer(cliente)}><EyeIcon /></button>
                    <button className="btn-accion btn-editar" title="Editar" onClick={() => abrirEditar(cliente)}><EditIcon /></button>
                    <button className="btn-accion btn-eliminar" title="Eliminar" onClick={() => abrirEliminar(cliente)}><TrashIcon /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ═══ MODALES ═══ */}
      {modal.tipo && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {/* VER */}
            {modal.tipo === "ver" && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Detalle del Cliente</h3>
                  <button className="modal-close" onClick={cerrarModal}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                  <div className="detail-grid">
                    <div className="detail-item"><span className="detail-label">ID</span><span className="detail-value">{modal.cliente.idCliente}</span></div>
                    <div className="detail-item"><span className="detail-label">Nombre / Razón Social</span><span className="detail-value">{modal.cliente.nombreRazonSocial}</span></div>
                    <div className="detail-item"><span className="detail-label">RFC</span><span className="detail-value">{modal.cliente.rfc}</span></div>
                    <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{modal.cliente.email}</span></div>
                    <div className="detail-item"><span className="detail-label">Teléfono</span><span className="detail-value">{modal.cliente.telefono}</span></div>
                    <div className="detail-item detail-item--full"><span className="detail-label">Dirección Fiscal</span><span className="detail-value">{modal.cliente.direccionFiscal}</span></div>
                  </div>
                </div>
                <div className="modal-footer"><button className="btn-modal btn-modal--secondary" onClick={cerrarModal}>Cerrar</button></div>
              </>
            )}

            {/* AGREGAR / EDITAR */}
            {(modal.tipo === "agregar" || modal.tipo === "editar") && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">{modal.tipo === "agregar" ? "Agregar Cliente" : "Editar Cliente"}</h3>
                  <button className="modal-close" onClick={cerrarModal}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nombre / Razón Social *</label>
                      <input className="form-input" type="text" value={formData.nombreRazonSocial} onChange={(e) => setFormData({ ...formData, nombreRazonSocial: e.target.value })} placeholder="Nombre completo o razón social" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">RFC *</label>
                      <input className="form-input" type="text" value={formData.rfc} onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })} placeholder="XAXX010101000" maxLength={13} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="correo@ejemplo.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input className="form-input" type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="2291234567" maxLength={15} />
                    </div>
                    <div className="form-group form-group--full">
                      <label className="form-label">Dirección Fiscal</label>
                      <textarea className="form-textarea" value={formData.direccionFiscal} onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })} placeholder="Calle, número, colonia, ciudad, estado" rows={3} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-modal btn-modal--secondary" onClick={cerrarModal}>Cancelar</button>
                  <button className="btn-modal btn-modal--primary" onClick={guardarCliente} disabled={guardando}>
                    {guardando ? "Guardando..." : modal.tipo === "agregar" ? "Agregar" : "Guardar Cambios"}
                  </button>
                </div>
              </>
            )}

            {/* ELIMINAR */}
            {modal.tipo === "eliminar" && (
              <>
                <div className="modal-header modal-header--danger">
                  <h3 className="modal-title">Eliminar Cliente</h3>
                  <button className="modal-close" onClick={cerrarModal}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                  <div className="delete-warning">
                    <WarnIcon />
                    <p>¿Estás seguro de eliminar al cliente <strong>{modal.cliente.nombreRazonSocial}</strong>?</p>
                    <p className="delete-warning-sub">Esta acción no se puede deshacer.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-modal btn-modal--secondary" onClick={cerrarModal}>Cancelar</button>
                  <button className="btn-modal btn-modal--danger" onClick={eliminarCliente} disabled={guardando}>
                    {guardando ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}