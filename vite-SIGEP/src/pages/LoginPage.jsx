import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L6 12V22C6 33.1 13.68 43.42 24 46C34.32 43.42 42 33.1 42 22V12L24 4Z"
          fill="none" stroke="rgba(212,175,55,0.9)" strokeWidth="2.5" />
    <path d="M20 24L23 27L29 21"
          stroke="rgba(212,175,55,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Ingresa tu usuario y contraseña");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/polizas");
    }, 1500);
  };

  return (
    <div className="login-wrapper">
      <div className={`login-left ${mounted ? "login-left--visible" : ""}`}>
        <div className="login-grid">
          {[15, 30, 45, 60, 75, 85].map((p) => (
            <div key={`h-${p}`} className="grid-line horizontal" style={{ top: `${p}%` }} />
          ))}
          {[20, 40, 60, 80].map((p) => (
            <div key={`v-${p}`} className="grid-line vertical" style={{ left: `${p}%` }} />
          ))}
        </div>

        <div className="floating-shape floating-shape--triangle">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <polygon points="60,5 115,95 5,95" fill="none" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        </div>
        <div className="floating-shape floating-shape--circle">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="75" fill="none" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        </div>
        <div className="floating-shape floating-shape--diamond">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="#D4AF37" strokeWidth="1" transform="rotate(45 50 50)" />
          </svg>
        </div>

        <div className="login-orb" />

        <div className={`login-brand ${mounted ? "login-brand--visible" : ""}`}>
          <div className="brand-logo">
            <ShieldIcon />
            <div>
              <h1 className="brand-title">SIGEP</h1>
              <span className="brand-subtitle">Sistema de Gestión de Pólizas</span>
            </div>
          </div>

          <div className="brand-divider" />

          <h2 className="brand-hero">
            Gestión integral<br />
            <span className="brand-hero-accent">de seguros</span>
          </h2>

          <p className="brand-description">
            Administra pólizas, agentes, clientes y siniestros desde una plataforma segura y centralizada.
          </p>

          <div className="brand-features">
            {["Control total de pólizas y coberturas", "Seguimiento de siniestros en tiempo real", "Gestión de recibos y comisiones"].map((text, i) => (
              <div key={i} className={`brand-feature ${mounted ? "brand-feature--visible" : ""}`} style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                <span className="brand-feature-icon">◈</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">© 2025 SIGEP — Todos los derechos reservados</div>
      </div>

      <div className="login-right">
        <div className="login-right-inner">
          <div className={`login-form-container ${mounted ? "login-form-container--visible" : ""}`}>
            <div className="login-welcome">
              <h2 className="login-welcome-title">Bienvenido</h2>
              <p className="login-welcome-subtitle">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="field-group">
                <label className="field-label">Correo electrónico</label>
                <div className="field-wrapper">
                  <div className="field-icon"><UserIcon /></div>
                  <input className="login-input" type="text" placeholder="usuario@sigep.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoComplete="username" />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Contraseña</label>
                <div className="field-wrapper">
                  <div className="field-icon"><LockIcon /></div>
                  <input className="login-input login-input--password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete="current-password" />
                  <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="login-options">
                <div className="remember-row" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`checkbox-custom ${rememberMe ? "checked" : ""}`}>
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span>Recordar sesión</span>
                </div>
                <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="login-btn-loading">
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeDasharray="32" strokeLinecap="round" />
                    </svg>
                    Verificando...
                  </span>
                ) : "Iniciar Sesión"}
              </button>
            </form>

            <div className="login-security">
              <LockIcon />
              <span>Conexión protegida con cifrado SSL de 256 bits</span>
            </div>
          </div>

          <div className="login-right-footer">v1.0.0 · Proyecto Final · Base de Datos</div>
        </div>
      </div>
    </div>
  );
}