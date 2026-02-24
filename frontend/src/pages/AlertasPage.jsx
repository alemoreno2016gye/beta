import { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Wrench,
  Fuel,
  FileText,
  Gauge,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SEVERIDADES = ["Todas", "alta", "media", "baja"];
const ESTADOS_ALERTA = ["Todas", "Pendientes", "Atendidas"];

const iconoAlerta = {
  wrench: Wrench,
  fuel: Fuel,
  file: FileText,
  gauge: Gauge,
  shield: Shield,
  alert: AlertTriangle,
  clipboard: FileText,
};

const severidadColor = {
  alta: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200", icon: "text-red-500" },
  media: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", icon: "text-amber-500" },
  baja: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: "text-blue-500" },
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [filtroSeveridad, setFiltroSeveridad] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const response = await axios.get(`${API}/alertas?limite=100`);
      setAlertas(response.data);
    } catch (error) {
      console.error("Error cargando alertas:", error);
      toast.error("Error al cargar alertas");
    } finally {
      setCargando(false);
    }
  };

  const atenderAlerta = async (alertaId) => {
    try {
      await axios.patch(`${API}/alertas/${alertaId}/atender`);
      setAlertas(alertas.map(a => 
        a.id === alertaId ? { ...a, atendida: true } : a
      ));
      toast.success("Alerta marcada como atendida");
    } catch (error) {
      console.error("Error atendiendo alerta:", error);
      toast.error("Error al atender alerta");
    }
  };

  const alertasFiltradas = alertas.filter((a) => {
    const cumpleSeveridad = filtroSeveridad === "Todas" || a.severidad === filtroSeveridad;
    const cumpleEstado = filtroEstado === "Todas" || 
      (filtroEstado === "Pendientes" && !a.atendida) ||
      (filtroEstado === "Atendidas" && a.atendida);
    const cumpleBusqueda = !busqueda || 
      a.vehiculo_placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.tipo.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleSeveridad && cumpleEstado && cumpleBusqueda;
  });

  const conteos = {
    total: alertas.length,
    pendientes: alertas.filter(a => !a.atendida).length,
    alta: alertas.filter(a => a.severidad === "alta" && !a.atendida).length,
    media: alertas.filter(a => a.severidad === "media" && !a.atendida).length,
    baja: alertas.filter(a => a.severidad === "baja" && !a.atendida).length,
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-EC', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="alertas-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Centro de Alertas
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestión de alertas y notificaciones del sistema
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cargarAlertas}
            className="border-[#003366] text-[#003366]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alert Banner - If there are critical alerts */}
      {conteos.alta > 0 && (
        <div className="alert-banner-critical rounded mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">
              {conteos.alta} alertas críticas requieren atención inmediata
            </span>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setFiltroSeveridad("alta")}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Ver Críticas
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="naval-card">
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 mx-auto text-[#003366] mb-2" />
            <p className="text-2xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {conteos.total}
            </p>
            <p className="text-xs text-gray-500 uppercase">Total</p>
          </CardContent>
        </Card>
        
        <Card className="naval-card">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {conteos.pendientes}
            </p>
            <p className="text-xs text-gray-500 uppercase">Pendientes</p>
          </CardContent>
        </Card>

        <Card className="naval-card border-t-[#EF4444]">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {conteos.alta}
            </p>
            <p className="text-xs text-gray-500 uppercase">Alta</p>
          </CardContent>
        </Card>

        <Card className="naval-card border-t-[#F59E0B]">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {conteos.media}
            </p>
            <p className="text-xs text-gray-500 uppercase">Media</p>
          </CardContent>
        </Card>

        <Card className="naval-card border-t-[#3B82F6]">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {conteos.baja}
            </p>
            <p className="text-xs text-gray-500 uppercase">Baja</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="naval-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por placa o tipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroSeveridad} onValueChange={setFiltroSeveridad}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                {SEVERIDADES.map((sev) => (
                  <SelectItem key={sev} value={sev}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[150px]">
                <CheckCircle className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_ALERTA.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="naval-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#003366]">
                <TableHead className="text-white font-semibold uppercase tracking-wide">Severidad</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide">Tipo</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide">Vehículo</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide">Mensaje</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide">Fecha</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide">Responsable</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide text-center">Estado</TableHead>
                <TableHead className="text-white font-semibold uppercase tracking-wide text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="spinner-naval mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : alertasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron alertas
                  </TableCell>
                </TableRow>
              ) : (
                alertasFiltradas.map((alerta) => {
                  const IconoTipo = iconoAlerta[alerta.icono] || AlertTriangle;
                  const colores = severidadColor[alerta.severidad];
                  
                  return (
                    <TableRow key={alerta.id} className={`hover:bg-gray-50 ${alerta.atendida ? 'opacity-60' : ''}`}>
                      <TableCell>
                        <Badge className={`${colores.bg} ${colores.text} ${colores.border} border uppercase text-xs`}>
                          {alerta.severidad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconoTipo className={`w-4 h-4 ${colores.icon}`} />
                          <span className="text-sm">{alerta.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">{alerta.vehiculo_placa}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm" title={alerta.mensaje}>
                        {alerta.mensaje}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatFecha(alerta.fecha)}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{alerta.responsable}</TableCell>
                      <TableCell className="text-center">
                        {alerta.atendida ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 border">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Atendida
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 border">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {!alerta.atendida && (
                          <Button 
                            size="sm" 
                            onClick={() => atenderAlerta(alerta.id)}
                            className="bg-[#003366] hover:bg-[#002244] text-xs"
                          >
                            Atender
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Mostrando {alertasFiltradas.length} de {alertas.length} alertas
      </div>

      {/* Value Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#003366] to-[#001433] rounded-lg text-white">
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10 text-[#C5A005]" />
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Sistema de Alertas Proactivo
            </h3>
            <p className="text-sm text-white/70">
              Prevención de fallas mecánicas • Reducción de tiempos de inactividad • Control total de la flota
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
