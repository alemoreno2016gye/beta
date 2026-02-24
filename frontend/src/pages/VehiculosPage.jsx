import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  Truck,
  ChevronRight,
  MapPin,
  User,
  Gauge,
  Fuel,
  Calendar,
  Eye,
  Download,
  RefreshCw,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ESTADOS = ["Todos", "Operativo", "Mantenimiento", "Crítico", "Reserva"];
const TIPOS = ["Todos", "Camioneta", "Camión", "Bus", "Sedán", "SUV", "Furgoneta", "Ambulancia", "Vehículo Táctico", "Motocicleta"];

const estadoBadgeClass = {
  Operativo: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Mantenimiento: "bg-amber-100 text-amber-800 border-amber-200",
  Crítico: "bg-red-100 text-red-800 border-red-200",
  Reserva: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vistaTabla, setVistaTabla] = useState(true);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== "Todos") params.append("estado", filtroEstado);
      if (filtroTipo !== "Todos") params.append("tipo", filtroTipo);
      if (busqueda) params.append("busqueda", busqueda);
      params.append("limite", "120");

      const response = await axios.get(`${API}/vehiculos?${params.toString()}`);
      setVehiculos(response.data);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarVehiculos();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filtroEstado, filtroTipo, busqueda]);

  const vehiculosFiltrados = vehiculos;

  const exportarExcel = () => {
    const csvContent = [
      ["Placa", "Tipo", "Marca/Modelo", "Estado", "Unidad", "Responsable", "Kilometraje", "Combustible %"],
      ...vehiculosFiltrados.map(v => [
        v.placa, v.tipo, v.marca_modelo, v.estado, v.unidad_operativa, v.responsable, v.kilometraje, v.nivel_combustible
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `flota_vehicular_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="vehiculos-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Flota Vehicular
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestión integral de {vehiculos.length} vehículos institucionales
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarVehiculos}
              className="border-[#003366] text-[#003366]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              size="sm" 
              onClick={exportarExcel}
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="naval-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por placa, marca o responsable..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                  data-testid="vehiculos-search"
                />
              </div>
            </div>
            
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[180px]" data-testid="filter-estado">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[180px]" data-testid="filter-tipo">
                <Truck className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border rounded overflow-hidden">
              <Button
                variant={vistaTabla ? "default" : "ghost"}
                size="sm"
                onClick={() => setVistaTabla(true)}
                className={vistaTabla ? "bg-[#003366]" : ""}
              >
                Tabla
              </Button>
              <Button
                variant={!vistaTabla ? "default" : "ghost"}
                size="sm"
                onClick={() => setVistaTabla(false)}
                className={!vistaTabla ? "bg-[#003366]" : ""}
              >
                Tarjetas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ESTADOS.slice(1).map((estado) => {
          const count = vehiculos.filter(v => v.estado === estado).length;
          return (
            <Card key={estado} className="naval-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {count}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{estado}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner-naval"></div>
        </div>
      ) : vistaTabla ? (
        /* Table View */
        <Card className="naval-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#003366]">
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Placa</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Tipo</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Marca/Modelo</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Estado</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Unidad</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide">Responsable</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide text-right">Kilometraje</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide text-center">Combustible</TableHead>
                  <TableHead className="text-white font-semibold uppercase tracking-wide text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculosFiltrados.map((vehiculo) => (
                  <TableRow key={vehiculo.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-semibold">{vehiculo.placa}</TableCell>
                    <TableCell>{vehiculo.tipo}</TableCell>
                    <TableCell>{vehiculo.marca_modelo}</TableCell>
                    <TableCell>
                      <Badge className={`${estadoBadgeClass[vehiculo.estado]} border`}>
                        {vehiculo.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={vehiculo.unidad_operativa}>
                      {vehiculo.unidad_operativa}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={vehiculo.responsable}>
                      {vehiculo.responsable}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {vehiculo.kilometraje.toLocaleString('es-EC')} km
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              vehiculo.nivel_combustible > 50 ? 'bg-green-500' :
                              vehiculo.nivel_combustible > 25 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${vehiculo.nivel_combustible}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{vehiculo.nivel_combustible}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/vehiculos/${vehiculo.id}`}>
                        <Button variant="ghost" size="sm" className="text-[#003366]">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehiculosFiltrados.map((vehiculo) => (
            <Card key={vehiculo.id} className="vehicle-card">
              <CardHeader className="pb-2 bg-gradient-to-r from-[#003366] to-[#001433] text-white rounded-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold">{vehiculo.placa}</p>
                    <p className="text-xs text-white/70">{vehiculo.tipo}</p>
                  </div>
                  <Badge className={`${estadoBadgeClass[vehiculo.estado]} border`}>
                    {vehiculo.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-[#003366]" />
                  <span className="text-gray-600">{vehiculo.marca_modelo} ({vehiculo.anio})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#003366]" />
                  <span className="text-gray-600 truncate">{vehiculo.responsable}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#003366]" />
                  <span className="text-gray-600 truncate">{vehiculo.ubicacion.nombre}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span className="font-mono">{vehiculo.kilometraje.toLocaleString('es-EC')} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span className={`font-semibold ${
                      vehiculo.nivel_combustible > 50 ? 'text-green-600' :
                      vehiculo.nivel_combustible > 25 ? 'text-amber-600' : 'text-red-600'
                    }`}>{vehiculo.nivel_combustible}%</span>
                  </div>
                </div>
                <Link to={`/vehiculos/${vehiculo.id}`} className="block">
                  <Button className="w-full bg-[#003366] hover:bg-[#002244] mt-2" size="sm">
                    Ver Detalle <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Mostrando {vehiculosFiltrados.length} de {vehiculos.length} vehículos
      </div>
    </div>
  );
}
