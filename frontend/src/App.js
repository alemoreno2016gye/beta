import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import VehiculosPage from "@/pages/VehiculosPage";
import VehiculoDetallePage from "@/pages/VehiculoDetallePage";
import MapaGPSPage from "@/pages/MapaGPSPage";
import AlertasPage from "@/pages/AlertasPage";
import CombustiblePage from "@/pages/CombustiblePage";
import ReportesPage from "@/pages/ReportesPage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";

// Components
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sgvn_usuario");
    if (savedUser) {
      setUsuario(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
    setIsAuthenticated(true);
    localStorage.setItem("sgvn_usuario", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUsuario(null);
    setIsAuthenticated(false);
    localStorage.removeItem("sgvn_usuario");
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="app-layout">
      <BrowserRouter>
        <Sidebar usuario={usuario} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/:id" element={<VehiculoDetallePage />} />
            <Route path="/mapa" element={<MapaGPSPage />} />
            <Route path="/alertas" element={<AlertasPage />} />
            <Route path="/combustible" element={<CombustiblePage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
