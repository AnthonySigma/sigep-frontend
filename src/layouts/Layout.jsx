import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleToggle = useCallback(() => {
    setTransitioning(true);
    setCollapsed((prev) => !prev);
    // Esperar a que termine la transición CSS antes de permitir que recharts recalcule
    setTimeout(() => setTransitioning(false), 300);
  }, []);

  return (
    <div className={`layout ${collapsed ? "layout--collapsed" : ""} ${transitioning ? "is-transitioning" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
