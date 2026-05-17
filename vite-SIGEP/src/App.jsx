import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Layout from "./layouts/Layout";
import ClientesPage from "./pages/ClientesPage";
import PolizasPage from "./pages/PolizasPage";
import CrearPolizaPage from "./pages/CrearPolizaPage";
import AgentesPage from "./pages/AgentesPage";
import AseguradorasPage from "./pages/AseguradorasPage";
import RecibosPage from "./pages/RecibosPage";
import SiniestrosPage from "./pages/SiniestrosPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/polizas" element={<PolizasPage />} />
          <Route path="/polizas/crear" element={<CrearPolizaPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/agentes" element={<AgentesPage />} />
          <Route path="/aseguradoras" element={<AseguradorasPage />} />
          <Route path="/recibos" element={<RecibosPage />} />
          <Route path="/siniestros" element={<SiniestrosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;