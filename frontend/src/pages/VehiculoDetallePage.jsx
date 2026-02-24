import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Truck,
  MapPin,
  User,
  Gauge,
  Fuel,
  Calendar,
  Wrench,
  Shield,
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const estadoBadgeClass = {
  Operativo: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Mantenimiento: "bg-amber-100 text-amber-800 border-amber-200",
  Crítico: "bg-red-100 text-red-800 border-red-200",
  Reserva: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export default function VehiculoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [historialMantenimiento, setHistorialMantenimiento] = useState([]);
  const [historialCombustible, setHistorialCombustible] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [vehiculoRes, mantenimientoRes, combustibleRes] = await Promise.all([
        axios.get(`${API}/vehiculos/${id}`),
        axios.get(`${API}/vehiculos/${id}/historial-mantenimiento`),
        axios.get(`${API}/vehiculos/${id}/historial-combustible`),
      ]);
      setVehiculo(vehiculoRes.data);
      setHistorialMantenimiento(mantenimientoRes.data);
      setHistorialCombustible(combustibleRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      navigate("/vehiculos");
    } finally {
      setCargando(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const diasParaMantenimiento = () => {
    if (!vehiculo?.proximo_mantenimiento) return 0;
    const hoy = new Date();
    const prox = new Date(vehiculo.proximo_mantenimiento);
    const diff = Math.ceil((prox - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F6F8]">
        <div className="spinner-naval"></div>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Vehículo no encontrado</p>
        <Link to="/vehiculos">
          <Button className="mt-4">Volver a la lista</Button>
        </Link>
      </div>
    );
  }

  const combustibleData = historialCombustible.map((h, i) => ({
    fecha: formatFecha(h.fecha),
    galones: h.galones,
    costo: h.costo_galon * h.galones,
  })).reverse();

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="vehiculo-detalle-page">
      {/* Header */}
      <div className="mb-6">
        <Link to="/vehiculos" className="inline-flex items-center text-[#003366] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Flota Vehicular
        </Link>
        
        {/* Vehicle Header Card */}
        <div className="vehicle-detail-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center">
                <Truck className="w-10 h-10 text-[#C5A005]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 
                    className="text-3xl font-bold tracking-wide"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    {vehiculo.placa}
                  </h1>
                  <Badge className={`${estadoBadgeClass[vehiculo.estado]} border text-sm`}>
                    {vehiculo.estado}
                  </Badge>
                </div>
                <p className="text-white/70 mt-1">
                  {vehiculo.marca_modelo} • {vehiculo.anio} • {vehiculo.color}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#C5A005] text-sm font-semibold uppercase tracking-wide">
                {vehiculo.tipo}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {vehiculo.unidad_operativa}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Info Body */}
        <div className="vehicle-detail-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Responsable */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#003366]/10 rounded">
                <User className="w-5 h-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Responsable</p>
                <p className="font-semibold text-sm">{vehiculo.responsable}</p>
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#003366]/10 rounded">
                <MapPin className="w-5 h-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</p>
                <p className="font-semibold text-sm">{vehiculo.ubicacion.nombre}</p>
              </div>
            </div>

            {/* Kilometraje */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#003366]/10 rounded">
                <Gauge className="w-5 h-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Kilometraje</p>
                <p className="font-semibold text-sm font-mono">{vehiculo.kilometraje.toLocaleString('es-EC')} km</p>
              </div>
            </div>

            {/* Consumo Promedio */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#003366]/10 rounded">
                <Fuel className="w-5 h-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Consumo Prom.</p>
                <p className="font-semibold text-sm">{vehiculo.consumo_promedio} km/galón</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Nivel Combustible */}
        <Card className="naval-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nivel Combustible</p>
              <Fuel className={`w-5 h-5 ${
                vehiculo.nivel_combustible > 50 ? 'text-green-500' :
                vehiculo.nivel_combustible > 25 ? 'text-amber-500' : 'text-red-500'
              }`} />
            </div>
            <p className="text-3xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {vehiculo.nivel_combustible}%
            </p>
            <div className={`fuel-gauge mt-2`}>
              <div 
                className={`fuel-gauge-fill ${
                  vehiculo.nivel_combustible > 50 ? 'fuel-gauge-high' :
                  vehiculo.nivel_combustible > 25 ? 'fuel-gauge-medium' : 'fuel-gauge-low'
                }`}
                style={{ width: `${vehiculo.nivel_combustible}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tanque: {vehiculo.tanque_capacidad} galones
            </p>
          </CardContent>
        </Card>

        {/* Próximo Mantenimiento */}
        <Card className={`naval-card ${diasParaMantenimiento() < 7 ? 'border-t-[#D32F2F]' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Próximo Mantto.</p>
              <Wrench className={`w-5 h-5 ${diasParaMantenimiento() < 7 ? 'text-red-500' : 'text-[#003366]'}`} />
            </div>
            <p className="text-3xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {diasParaMantenimiento()} días
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Fecha: {formatFecha(vehiculo.proximo_mantenimiento)}
            </p>
          </CardContent>
        </Card>

        {/* Documentación */}
        <Card className="naval-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seguro</p>
              {vehiculo.seguro_vigente ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-lg font-bold ${vehiculo.seguro_vigente ? 'text-green-600' : 'text-red-600'}`}>
              {vehiculo.seguro_vigente ? 'Vigente' : 'Vencido'}
            </p>
            <div className="mt-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Matrícula</span>
                <span className={`text-xs font-semibold ${vehiculo.matricula_vigente ? 'text-green-600' : 'text-red-600'}`}>
                  {vehiculo.matricula_vigente ? 'Vigente' : 'Vencida'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disponibilidad */}
        <Card className="naval-card-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disponibilidad</p>
              <Shield className="w-5 h-5 text-[#C5A005]" />
            </div>
            <p className="text-lg font-bold text-[#003366]">
              {vehiculo.disponibilidad}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Capacidad: {vehiculo.capacidad} personas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="mantenimiento" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="mantenimiento" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Wrench className="w-4 h-4 mr-2" />
            Historial Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="combustible" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Fuel className="w-4 h-4 mr-2" />
            Historial Combustible
          </TabsTrigger>
          <TabsTrigger value="especificaciones" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Especificaciones
          </TabsTrigger>
        </TabsList>

        {/* Mantenimiento Tab */}
        <TabsContent value="mantenimiento">
          <Card className="naval-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Historial de Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historialMantenimiento.map((item, index) => (
                  <div key={item.id} className="timeline-item">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#003366]">{item.tipo}</p>
                        <p className="text-sm text-gray-500">{item.proveedor}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.observaciones}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${item.costo.toLocaleString('es-EC')}</p>
                        <p className="text-xs text-gray-500">{formatFecha(item.fecha)}</p>
                        <p className="text-xs text-gray-400">{item.kilometraje.toLocaleString('es-EC')} km</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combustible Tab */}
        <TabsContent value="combustible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="naval-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Consumo de Combustible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={combustibleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="galones" fill="#003366" name="Galones" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="naval-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Registro de Abastecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Fecha</TableHead>
                      <TableHead className="text-xs text-right">Galones</TableHead>
                      <TableHead className="text-xs text-right">$/Galón</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historialCombustible.slice(0, 6).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">{formatFecha(item.fecha)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{item.galones}</TableCell>
                        <TableCell className="text-xs text-right font-mono">${item.costo_galon}</TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold">
                          ${(item.galones * item.costo_galon).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Especificaciones Tab */}
        <TabsContent value="especificaciones">
          <Card className="naval-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Especificaciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366] border-b pb-2">Identificación</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Placa</span>
                      <span className="text-sm font-mono font-semibold">{vehiculo.placa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">N° Serie Motor</span>
                      <span className="text-sm font-mono">{vehiculo.numero_serie_motor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">N° Chasis</span>
                      <span className="text-sm font-mono">{vehiculo.numero_chasis}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366] border-b pb-2">Características</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tipo</span>
                      <span className="text-sm font-semibold">{vehiculo.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Marca/Modelo</span>
                      <span className="text-sm font-semibold">{vehiculo.marca_modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Año</span>
                      <span className="text-sm font-semibold">{vehiculo.anio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Color</span>
                      <span className="text-sm font-semibold">{vehiculo.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Capacidad</span>
                      <span className="text-sm font-semibold">{vehiculo.capacidad} personas</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366] border-b pb-2">Fechas Importantes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Adquisición</span>
                      <span className="text-sm font-semibold">{formatFecha(vehiculo.fecha_adquisicion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Último Mantto.</span>
                      <span className="text-sm font-semibold">{formatFecha(vehiculo.ultimo_mantenimiento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Próximo Mantto.</span>
                      <span className="text-sm font-semibold">{formatFecha(vehiculo.proximo_mantenimiento)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
