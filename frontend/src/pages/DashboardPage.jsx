import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Truck,
  AlertTriangle,
  Fuel,
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS_ESTADO = {
  Operativo: "#10B981",
  Mantenimiento: "#F59E0B",
  Crítico: "#EF4444",
  Reserva: "#6366F1",
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [estadosData, setEstadosData] = useState([]);
  const [tiposData, setTiposData] = useState([]);
  const [consumoMensual, setConsumoMensual] = useState([]);
  const [mantenimientoMensual, setMantenimientoMensual] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [kpisRes, alertasRes, estadosRes, tiposRes, consumoRes, mantRes] = await Promise.all([
        axios.get(`${API}/kpis`),
        axios.get(`${API}/alertas?limite=5&atendida=false`),
        axios.get(`${API}/estadisticas/por-estado`),
        axios.get(`${API}/estadisticas/por-tipo`),
        axios.get(`${API}/estadisticas/consumo-mensual`),
        axios.get(`${API}/estadisticas/mantenimiento-mensual`),
      ]);
      
      setKpis(kpisRes.data);
      setAlertas(alertasRes.data);
      setEstadosData(estadosRes.data);
      setTiposData(tiposRes.data);
      setConsumoMensual(consumoRes.data);
      setMantenimientoMensual(mantRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F6F8]">
        <div className="text-center">
          <div className="spinner-naval mx-auto mb-4"></div>
          <p className="text-gray-500 uppercase tracking-wide text-sm">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen bg-grid-pattern" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Panel de Control
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitoreo en tiempo real de la flota vehicular • Base Naval Sur
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Sistema Activo
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Value Proposition Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#003366] to-[#001433] rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-[#C5A005]" />
            <div>
              <h2 className="font-semibold text-lg" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Control Total de Flota Institucional
              </h2>
              <p className="text-white/70 text-sm">
                Reducción de riesgos operativos • Optimización logística • Eficiencia presupuestaria
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#C5A005] font-bold text-2xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              ${kpis?.ahorro_estimado_mensual?.toLocaleString('es-EC') || '0'}
            </p>
            <p className="text-white/60 text-xs uppercase tracking-wide">Ahorro mensual estimado</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1 - Flota Operativa */}
        <Card className="naval-card kpi-card" data-testid="kpi-flota-operativa">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Flota Operativa</p>
                <p className="text-4xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.porcentaje_flota_operativa || 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {kpis?.vehiculos_operativos || 0} de {kpis?.total_vehiculos || 0} vehículos
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={kpis?.porcentaje_flota_operativa || 0} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* KPI 2 - Índice Disponibilidad */}
        <Card className="naval-card kpi-card" data-testid="kpi-disponibilidad">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Índice Disponibilidad</p>
                <p className="text-4xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.indice_disponibilidad || 0}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+2.3% vs mes anterior</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 - En Mantenimiento */}
        <Card className="naval-card kpi-card" data-testid="kpi-mantenimiento">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">En Mantenimiento</p>
                <p className="text-4xl font-bold text-[#F59E0B] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.vehiculos_mantenimiento || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Tiempo prom: {kpis?.tiempo_promedio_mantenimiento || 0} días
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 - Alertas Críticas */}
        <Card className="naval-card kpi-card border-t-[#D32F2F]" data-testid="kpi-alertas">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alertas Críticas</p>
                <p className="text-4xl font-bold text-[#D32F2F] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.alertas_criticas || 0}
                </p>
                <Link to="/alertas" className="text-sm text-[#003366] hover:underline flex items-center gap-1 mt-1">
                  Ver todas <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-2 bg-red-100 rounded">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Eficiencia Flota */}
        <Card className="naval-card-gold kpi-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Eficiencia de Flota</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.eficiencia_flota || 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#C5A005]" />
            </div>
          </CardContent>
        </Card>

        {/* Consumo Mensual */}
        <Card className="naval-card-gold kpi-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Consumo Mensual</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.consumo_mensual_estimado?.toLocaleString('es-EC') || 0}
                </p>
                <p className="text-xs text-gray-500">galones estimados</p>
              </div>
              <Fuel className="w-8 h-8 text-[#C5A005]" />
            </div>
          </CardContent>
        </Card>

        {/* Cumplimiento Mantenimiento */}
        <Card className="naval-card-gold kpi-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cumplimiento Mantto.</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {kpis?.cumplimiento_mantenimiento || 0}%
                </p>
              </div>
              <Gauge className="w-8 h-8 text-[#C5A005]" />
            </div>
          </CardContent>
        </Card>

        {/* Costo Operación */}
        <Card className="naval-card-gold kpi-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo Diario Op.</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  ${kpis?.costo_operacion_diario?.toLocaleString('es-EC') || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#C5A005]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Estado de Flota - Pie Chart */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Estado de la Flota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                    labelLine={false}
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ESTADO[entry.estado] || "#64748B"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Tipo - Bar Chart */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Distribución por Tipo de Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tiposData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" />
                  <YAxis dataKey="tipo" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#003366" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumption & Maintenance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Consumo de Combustible */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Consumo de Combustible Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="#003366" 
                    strokeWidth={2}
                    dot={{ fill: "#003366" }}
                    name="Galones"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mantenimiento Mensual */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Mantenimientos por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mantenimientoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="preventivo" fill="#10B981" name="Preventivo" stackId="a" />
                  <Bar dataKey="correctivo" fill="#F59E0B" name="Correctivo" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Alerts & Top Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Alertas Recientes
              </CardTitle>
              <Link to="/alertas">
                <Button variant="outline" size="sm" className="text-[#003366] border-[#003366]">
                  Ver Todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay alertas pendientes</p>
              ) : (
                alertas.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`alert-item alert-item-${alerta.severidad}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alerta.severidad === 'alta' ? 'text-red-500' : 
                          alerta.severidad === 'media' ? 'text-amber-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{alerta.tipo}</p>
                          <p className="text-xs text-gray-500">{alerta.vehiculo_placa}</p>
                        </div>
                      </div>
                      <Badge variant={alerta.severidad === 'alta' ? 'destructive' : 'secondary'}>
                        {alerta.severidad}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Vehículos Más Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis?.vehiculos_mas_utilizados?.map((vehiculo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#003366] text-white rounded flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{vehiculo.placa}</p>
                      <p className="text-xs text-gray-500">{vehiculo.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#003366]">{vehiculo.kilometraje.toLocaleString('es-EC')}</p>
                    <p className="text-xs text-gray-500">km recorridos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Buttons */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to="/mapa">
          <Button className="bg-[#003366] hover:bg-[#002244]">
            <MapPin className="w-4 h-4 mr-2" />
            Ver Mapa GPS
          </Button>
        </Link>
        <Link to="/vehiculos">
          <Button className="bg-[#003366] hover:bg-[#002244]">
            <Truck className="w-4 h-4 mr-2" />
            Gestionar Flota
          </Button>
        </Link>
        <Link to="/reportes">
          <Button variant="outline" className="border-[#003366] text-[#003366]">
            <TrendingUp className="w-4 h-4 mr-2" />
            Generar Reportes
          </Button>
        </Link>
      </div>
    </div>
  );
}
