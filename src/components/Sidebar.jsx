import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const icons = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  polizas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>,
  clientes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  agentes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  aseguradoras: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
  recibos: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20"/><path d="M2 15h20"/><path d="M7 3v18"/></svg>,
  siniestros: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  collapse: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
  expand: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
};

const ShieldIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 4L6 12V22C6 33.1 13.68 43.42 24 46C34.32 43.42 42 33.1 42 22V12L24 4Z" fill="none" stroke="rgba(212,175,55,0.9)" strokeWidth="2.5"/>
    <path d="M20 24L23 27L29 21" stroke="rgba(212,175,55,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { path: "/polizas", label: "Pólizas", icon: icons.polizas },
  { path: "/clientes", label: "Clientes", icon: icons.clientes },
  { path: "/agentes", label: "Agentes", icon: icons.agentes },
  { path: "/aseguradoras", label: "Aseguradoras", icon: icons.aseguradoras },
  { path: "/recibos", label: "Recibos", icon: icons.recibos },
  { path: "/siniestros", label: "Siniestros", icon: icons.siniestros },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Toggle */}
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? "Expandir" : "Colapsar"}>
        {collapsed ? icons.expand : icons.collapse}
      </button>

      {/* Logo */}
      <div className="sidebar-logo">
        <ShieldIcon size={collapsed ? 28 : 32} />
        {!collapsed && (
          <div>
            <h1 className="sidebar-logo-title">SIGEP</h1>
            <span className="sidebar-logo-subtitle">Gestión de Pólizas</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <span className="sidebar-section-label">MENÚ PRINCIPAL</span>}
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
            title={collapsed ? item.label : ""}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Admin SIGEP</span>
              <span className="sidebar-user-role">Administrador</span>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={() => navigate("/")} title={collapsed ? "Cerrar Sesión" : ""}>
          {icons.logout}
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}