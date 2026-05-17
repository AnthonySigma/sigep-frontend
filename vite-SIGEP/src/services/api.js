/* ============================================================
   api.js — Servicio base para conectar con Spring Boot
   ============================================================ */

const API_URL = "http://localhost:8080/api";

async function request(endpoint, options = {}) {
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.text().catch(() => "Error desconocido");
    throw new Error(`Error ${response.status}: ${error}`);
  }

  // DELETE retorna 204 sin body
  if (response.status === 204) return null;

  return response.json();
}

// ── Clientes ──
export const clientesApi = {
  obtenerTodos: () => request("/clientes"),
  obtenerPorId: (id) => request(`/clientes/${id}`),
  buscar: (q) => request(`/clientes/buscar?q=${encodeURIComponent(q)}`),
  crear: (data) => request("/clientes", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/clientes/${id}`, { method: "DELETE" }),
};

// ── Agentes ──
export const agentesApi = {
  obtenerTodos: () => request("/agentes"),
  obtenerPorId: (id) => request(`/agentes/${id}`),
  crear: (data) => request("/agentes", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/agentes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/agentes/${id}`, { method: "DELETE" }),
};

// ── Aseguradoras ──
export const aseguradorasApi = {
  obtenerTodos: () => request("/aseguradoras"),
  obtenerPorId: (id) => request(`/aseguradoras/${id}`),
  crear: (data) => request("/aseguradoras", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/aseguradoras/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/aseguradoras/${id}`, { method: "DELETE" }),
};

// ── Pólizas ──
export const polizasApi = {
  obtenerTodos: () => request("/polizas"),
  obtenerPorId: (id) => request(`/polizas/${id}`),
  crear: (data) => request("/polizas", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/polizas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/polizas/${id}`, { method: "DELETE" }),
};

// ── Recibos ──
export const recibosApi = {
  obtenerTodos: () => request("/recibos"),
  obtenerPorId: (id) => request(`/recibos/${id}`),
  crear: (data) => request("/recibos", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/recibos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/recibos/${id}`, { method: "DELETE" }),
};

// ── Siniestros ──
export const siniestrosApi = {
  obtenerTodos: () => request("/siniestros"),
  obtenerPorId: (id) => request(`/siniestros/${id}`),
  crear: (data) => request("/siniestros", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) => request(`/siniestros/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/siniestros/${id}`, { method: "DELETE" }),
};