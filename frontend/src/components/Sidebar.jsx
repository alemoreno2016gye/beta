import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  AlertTriangle,
  Fuel,
  FileText,
  Settings,
  LogOut,
  Anchor,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { path: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { path: "/vehiculos", label: "Flota Vehicular", icon: Truck },
  { path: "/mapa", label: "Mapa GPS", icon: MapPin },
  { path: "/alertas", label: "Alertas", icon: AlertTriangle },
  { path: "/combustible", label: "Combustible", icon: Fuel },
  { path: "/reportes", label: "Reportes", icon: FileText },
  { path: "/configuracion", label: "Configuración", icon: Settings },
];

export const Sidebar = ({ usuario, onLogout }) => {
  const location = useLocation();

  return (
    <TooltipProvider>
      <aside
        className="fixed left-0 top-0 h-screen w-[260px] bg-[#001433] text-white flex flex-col z-50"
        data-testid="sidebar"
      >
        {/* Header with Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#C5A005] rounded flex items-center justify-center">
              <Anchor className="w-7 h-7 text-[#001433]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm tracking-wide truncate" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                ARMADA DEL ECUADOR
              </h1>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">
                Sistema de Gestión Vehicular
              </p>
            </div>
          </div>
        </div>

        {/* Ecuador Flag Accent */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#FFE600]"></div>
          <div className="flex-1 bg-[#003366]"></div>
          <div className="flex-1 bg-[#D32F2F]"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === "/vehiculos" && location.pathname.startsWith("/vehiculos/"));

              return (
                <li key={item.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        data-testid={`nav-${item.path.slice(1)}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#C5A005]/10 text-[#C5A005] border-l-4 border-[#C5A005] -ml-[4px] pl-[15px]"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-[#003366] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#C5A005]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{usuario?.nombre || "Usuario"}</p>
              <p className="text-xs text-white/60 truncate">{usuario?.rol || "Operador"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            data-testid="logout-btn"
            className="w-full bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#000d1a] text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            Base Naval Sur - Guayaquil
          </p>
          <p className="text-[10px] text-white/30 mt-1">
            v2.0.1 • SGVN 2026
          </p>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
