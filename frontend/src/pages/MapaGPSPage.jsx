import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Truck,
  Activity,
  Clock,
  Navigation,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ESTADOS = ["Todos", "Operativo", "Mantenimiento", "Crítico", "Reserva"];

const estadoColor = {
  Operativo: "#10B981",
  Mantenimiento: "#F59E0B",
  Crítico: "#EF4444",
  Reserva: "#6366F1",
};

// Ecuador map bounds (simplified)
const MAP_BOUNDS = {
  minLat: -4.5,
  maxLat: 1.5,
  minLng: -81.5,
  maxLng: -75.0,
};

export default function MapaGPSPage() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const mapRef = useRef(null);

  useEffect(() => {
    cargarUbicaciones();
    const interval = setInterval(cargarUbicaciones, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const cargarUbicaciones = async () => {
    try {
      const response = await axios.get(`${API}/ubicaciones-gps`);
      setUbicaciones(response.data);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error("Error cargando ubicaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const ubicacionesFiltradas = ubicaciones.filter((u) => {
    const cumpleEstado = filtroEstado === "Todos" || u.estado === filtroEstado;
    const cumpleBusqueda = !busqueda || 
      u.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.ubicacion_nombre.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  // Convert GPS coordinates to map percentage positions
  const coordToPosition = (lat, lng) => {
    const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const conteosPorEstado = {
    Operativo: ubicaciones.filter(u => u.estado === "Operativo").length,
    Mantenimiento: ubicaciones.filter(u => u.estado === "Mantenimiento").length,
    Crítico: ubicaciones.filter(u => u.estado === "Crítico").length,
    Reserva: ubicaciones.filter(u => u.estado === "Reserva").length,
  };

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="mapa-gps-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Mapa GPS - Monitoreo en Tiempo Real
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Visualización de ubicación de flota • Actualización automática cada 30 segundos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              En Línea
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarUbicaciones}
              className="border-[#003366] text-[#003366]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(conteosPorEstado).map(([estado, count]) => (
          <Card key={estado} className="naval-card">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: estadoColor[estado], fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {count}
                </p>
                <p className="text-xs text-gray-500 uppercase">{estado}</p>
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: estadoColor[estado] }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-3">
          <Card className="naval-card overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Mapa de Flota
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {ultimaActualizacion.toLocaleTimeString('es-EC')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={mapRef}
                className="map-container h-[500px] relative"
                data-testid="gps-map"
              >
                {/* Map Background - Ecuador Coast Simulation */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50">
                  {/* Coast line simulation */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    {/* Sea */}
                    <path d="M0,0 L30,0 L25,30 L20,60 L15,100 L0,100 Z" fill="url(#seaGradient)" />
                    {/* Grid lines */}
                    {[...Array(10)].map((_, i) => (
                      <g key={i}>
                        <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#003366" strokeOpacity="0.05" />
                        <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#003366" strokeOpacity="0.05" />
                      </g>
                    ))}
                  </svg>
                  
                  {/* City Labels */}
                  <div className="absolute text-[10px] font-semibold text-[#003366]/60 uppercase tracking-wider" style={{ top: '45%', left: '55%' }}>
                    Guayaquil
                  </div>
                  <div className="absolute text-[10px] font-semibold text-[#003366]/60 uppercase tracking-wider" style={{ top: '25%', left: '35%' }}>
                    Manta
                  </div>
                  <div className="absolute text-[10px] font-semibold text-[#003366]/60 uppercase tracking-wider" style={{ top: '10%', left: '40%' }}>
                    Esmeraldas
                  </div>
                  <div className="absolute text-[10px] font-semibold text-[#003366]/60 uppercase tracking-wider" style={{ top: '70%', left: '45%' }}>
                    Machala
                  </div>
                </div>

                {/* Vehicle Markers */}
                {ubicacionesFiltradas.map((ubicacion) => {
                  const pos = coordToPosition(ubicacion.lat, ubicacion.lng);
                  const isSelected = vehiculoSeleccionado?.id === ubicacion.id;
                  
                  return (
                    <div
                      key={ubicacion.id}
                      className={`map-marker map-marker-${ubicacion.estado.toLowerCase()} ${isSelected ? 'ring-2 ring-white ring-offset-2' : ''}`}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        backgroundColor: estadoColor[ubicacion.estado],
                        width: isSelected ? '16px' : '12px',
                        height: isSelected ? '16px' : '12px',
                        zIndex: isSelected ? 20 : 10,
                      }}
                      onClick={() => setVehiculoSeleccionado(ubicacion)}
                      title={`${ubicacion.placa} - ${ubicacion.estado}`}
                    >
                      {ubicacion.estado === "Operativo" && ubicacion.velocidad > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      )}
                    </div>
                  );
                })}

                {/* Selected Vehicle Popup */}
                {vehiculoSeleccionado && (
                  <div 
                    className="absolute glass-overlay p-3 rounded shadow-lg border border-[#003366]/20 z-30 min-w-[220px]"
                    style={{
                      left: `${Math.min(coordToPosition(vehiculoSeleccionado.lat, vehiculoSeleccionado.lng).x + 2, 70)}%`,
                      top: `${Math.min(coordToPosition(vehiculoSeleccionado.lat, vehiculoSeleccionado.lng).y, 70)}%`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-[#003366]">{vehiculoSeleccionado.placa}</span>
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${estadoColor[vehiculoSeleccionado.estado]}20`,
                          color: estadoColor[vehiculoSeleccionado.estado],
                          border: `1px solid ${estadoColor[vehiculoSeleccionado.estado]}40`
                        }}
                      >
                        {vehiculoSeleccionado.estado}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-gray-400" />
                        <span>{vehiculoSeleccionado.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{vehiculoSeleccionado.ubicacion_nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3 h-3 text-gray-400" />
                        <span>{vehiculoSeleccionado.velocidad} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{new Date(vehiculoSeleccionado.ultimo_reporte).toLocaleTimeString('es-EC')}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-[#003366] hover:bg-[#002244] text-xs h-7"
                      onClick={() => window.open(`/vehiculos/${vehiculoSeleccionado.id}`, '_blank')}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 glass-overlay p-3 rounded shadow border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Leyenda</p>
                  <div className="space-y-1">
                    {Object.entries(estadoColor).map(([estado, color]) => (
                      <div key={estado} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-600">{estado}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="icon" variant="outline" className="w-8 h-8 bg-white">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="w-8 h-8 bg-white">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="w-8 h-8 bg-white">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Vehicle List */}
        <div className="lg:col-span-1">
          <Card className="naval-card h-[580px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Lista de Vehículos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3 pt-0">
              {/* Filters */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar placa..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="h-8 text-sm">
                    <Filter className="w-3 h-3 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {ubicacionesFiltradas.map((ubicacion) => (
                    <div
                      key={ubicacion.id}
                      className={`p-2 rounded border cursor-pointer transition-all ${
                        vehiculoSeleccionado?.id === ubicacion.id
                          ? 'border-[#003366] bg-[#003366]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setVehiculoSeleccionado(ubicacion)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-sm">{ubicacion.placa}</span>
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: estadoColor[ubicacion.estado] }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{ubicacion.ubicacion_nombre}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{ubicacion.tipo}</span>
                        {ubicacion.velocidad > 0 && (
                          <span className="text-xs text-green-600 flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            {ubicacion.velocidad} km/h
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-gray-500 text-center">
                  {ubicacionesFiltradas.length} vehículos mostrados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
