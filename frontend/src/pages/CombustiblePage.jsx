import { useState, useEffect } from "react";
import axios from "axios";
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Truck,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ["#003366", "#C5A005", "#10B981", "#F59E0B", "#6366F1", "#EF4444"];

export default function CombustiblePage() {
  const [consumoMensual, setConsumoMensual] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [consumoRes, vehiculosRes] = await Promise.all([
        axios.get(`${API}/estadisticas/consumo-mensual`),
        axios.get(`${API}/vehiculos?limite=120`),
      ]);
      setConsumoMensual(consumoRes.data);
      setVehiculos(vehiculosRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // Calcular estadísticas
  const totalConsumoAnual = consumoMensual.reduce((sum, m) => sum + m.consumo, 0);
  const totalCostoAnual = consumoMensual.reduce((sum, m) => sum + m.costo, 0);
  const promedioMensual = consumoMensual.length > 0 ? totalConsumoAnual / consumoMensual.length : 0;
  
  // Vehículos con bajo combustible
  const vehiculosBajoCombustible = vehiculos.filter(v => v.nivel_combustible < 25);
  
  // Distribución por tipo de vehículo
  const consumoPorTipo = vehiculos.reduce((acc, v) => {
    acc[v.tipo] = (acc[v.tipo] || 0) + v.consumo_promedio;
    return acc;
  }, {});
  const dataPorTipo = Object.entries(consumoPorTipo).map(([tipo, consumo]) => ({
    tipo,
    consumo: Math.round(consumo),
  }));

  // Top 10 vehículos más consumidores
  const topConsumidores = [...vehiculos]
    .sort((a, b) => b.consumo_promedio - a.consumo_promedio)
    .slice(0, 10);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F6F8]">
        <div className="spinner-naval"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="combustible-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Control de Combustible
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitoreo y análisis de consumo de combustible de la flota
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={cargarDatos}
              className="border-[#003366] text-[#003366]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              size="sm"
              className="bg-[#16A34A] hover:bg-[#15803D]"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="naval-card kpi-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Consumo Anual</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {totalConsumoAnual.toLocaleString('es-EC')}
                </p>
                <p className="text-sm text-gray-600">galones estimados</p>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <Fuel className="w-6 h-6 text-[#003366]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="naval-card kpi-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo Anual</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  ${totalCostoAnual.toLocaleString('es-EC')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">-5.2% vs año anterior</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="naval-card kpi-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Promedio Mensual</p>
                <p className="text-3xl font-bold text-[#003366] mt-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {Math.round(promedioMensual).toLocaleString('es-EC')}
                </p>
                <p className="text-sm text-gray-600">galones/mes</p>
              </div>
              <div className="p-2 bg-amber-100 rounded">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`naval-card kpi-card ${vehiculosBajoCombustible.length > 5 ? 'border-t-[#D32F2F]' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bajo Combustible</p>
                <p className={`text-3xl font-bold mt-1 ${vehiculosBajoCombustible.length > 5 ? 'text-red-600' : 'text-[#003366]'}`} style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {vehiculosBajoCombustible.length}
                </p>
                <p className="text-sm text-gray-600">vehículos &lt; 25%</p>
              </div>
              <div className={`p-2 rounded ${vehiculosBajoCombustible.length > 5 ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Fuel className={`w-6 h-6 ${vehiculosBajoCombustible.length > 5 ? 'text-red-600' : 'text-[#003366]'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Consumo Mensual */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Consumo Mensual de Combustible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'consumo' ? `${value.toLocaleString('es-EC')} gal` : `$${value.toLocaleString('es-EC')}`,
                      name === 'consumo' ? 'Consumo' : 'Costo'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="consumo" fill="#003366" name="Galones" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Costo Mensual */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Costo Mensual de Combustible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString('es-EC')}`, 'Costo']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="costo" 
                    stroke="#C5A005" 
                    strokeWidth={2}
                    dot={{ fill: "#C5A005" }}
                    name="Costo USD"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution & Top Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Por Tipo */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Consumo por Tipo de Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPorTipo}
                    dataKey="consumo"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ tipo, percent }) => `${tipo}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dataPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Consumidores */}
        <Card className="naval-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Top 10 - Mayor Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Placa</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs text-right">Consumo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topConsumidores.map((v, index) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-bold text-[#003366]">{index + 1}</TableCell>
                    <TableCell className="font-mono">{v.placa}</TableCell>
                    <TableCell className="text-sm">{v.tipo}</TableCell>
                    <TableCell className="text-right font-semibold">{v.consumo_promedio} km/gal</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Low Fuel Vehicles */}
      {vehiculosBajoCombustible.length > 0 && (
        <Card className="naval-card border-t-[#D32F2F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-red-600 uppercase tracking-wide flex items-center gap-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <Fuel className="w-5 h-5" />
              Vehículos con Bajo Nivel de Combustible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehiculosBajoCombustible.slice(0, 8).map((v) => (
                <div key={v.id} className="p-3 bg-red-50 border border-red-100 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm">{v.placa}</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs">
                      {v.nivel_combustible}%
                    </Badge>
                  </div>
                  <Progress value={v.nivel_combustible} className="h-2 bg-red-100" />
                  <p className="text-xs text-gray-500 mt-2">{v.ubicacion.nombre}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#003366] to-[#001433] rounded-lg text-white">
        <div className="flex items-center gap-4">
          <DollarSign className="w-10 h-10 text-[#C5A005]" />
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Optimización del Gasto en Combustible
            </h3>
            <p className="text-sm text-white/70">
              Control de costos • Detección de consumos anómalos • Planificación eficiente de abastecimiento
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[#C5A005] font-bold text-xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              -5.2%
            </p>
            <p className="text-xs text-white/60">Reducción de costos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
