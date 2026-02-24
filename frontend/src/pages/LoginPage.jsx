import { useState } from "react";
import { Anchor, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario || !clave) {
      toast.error("Complete todos los campos");
      return;
    }

    setCargando(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        usuario,
        clave,
      });
      
      toast.success("Acceso autorizado", {
        description: `Bienvenido, ${response.data.nombre}`,
      });
      onLogin(response.data);
    } catch (error) {
      toast.error("Acceso denegado", {
        description: "Credenciales inválidas. Intente nuevamente.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container" data-testid="login-page">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="login-card relative z-10" data-testid="login-card">
        {/* Ecuador Flag Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex rounded-t">
          <div className="flex-1 bg-[#FFE600] rounded-tl"></div>
          <div className="flex-1 bg-[#003366]"></div>
          <div className="flex-1 bg-[#D32F2F] rounded-tr"></div>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#003366] rounded-full flex items-center justify-center shadow-lg">
            <Anchor className="w-10 h-10 text-[#C5A005]" />
          </div>
          <h1 
            className="text-2xl font-bold text-[#003366] uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            Armada del Ecuador
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de Gestión Vehicular Naval
          </p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Base Naval Sur - Guayaquil
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="usuario" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Usuario
            </Label>
            <Input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              data-testid="login-usuario"
              className="h-11 bg-gray-50 border-gray-300 focus:border-[#003366] focus:ring-[#003366]"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clave" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="clave"
                type={mostrarClave ? "text" : "password"}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Ingrese su contraseña"
                data-testid="login-clave"
                className="h-11 bg-gray-50 border-gray-300 focus:border-[#003366] focus:ring-[#003366] pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarClave ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={cargando}
            data-testid="login-submit"
            className="w-full h-11 bg-[#003366] hover:bg-[#002244] text-white font-semibold uppercase tracking-wide"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Ingresar al Sistema
              </>
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded text-center">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
            Credenciales de Demostración
          </p>
          <div className="space-y-1 text-xs text-blue-700">
            <p><span className="font-semibold">Usuario:</span> admin, operador, logistica</p>
            <p><span className="font-semibold">Contraseña:</span> naval2024</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Acceso restringido - Solo personal autorizado
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Todos los accesos son monitoreados y registrados
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-white/40">
          © 2026 Armada del Ecuador • Sistema de Gestión Vehicular Naval v2.0
        </p>
      </div>
    </div>
  );
}
