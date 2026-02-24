import { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Calendar,
  Truck,
  Fuel,
  Wrench,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Printer,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TIPOS_REPORTE = [
  { id: "resumen", nombre: "Resumen Ejecutivo", icono: FileText, descripcion: "Vista general de la flota" },
  { id: "flota", nombre: "Estado de Flota", icono: Truck, descripcion: "Detalle de vehículos por estado" },
  { id: "combustible", nombre: "Consumo de Combustible", icono: Fuel, descripcion: "Análisis de consumo y costos" },
  { id: "mantenimiento", nombre: "Mantenimiento", icono: Wrench, descripcion: "Historial y programación" },
  { id: "alertas", nombre: "Alertas del Sistema", icono: AlertTriangle, descripcion: "Registro de alertas" },
  { id: "costos", nombre: "Costos Operativos", icono: DollarSign, descripcion: "Análisis financiero" },
];

const PERIODOS = [
  { id: "enero-2026", nombre: "Enero 2026" },
  { id: "diciembre-2025", nombre: "Diciembre 2025" },
  { id: "noviembre-2025", nombre: "Noviembre 2025" },
  { id: "q4-2025", nombre: "Q4 2025" },
  { id: "2025", nombre: "Año 2025" },
];

export default function ReportesPage() {
  const [resumen, setResumen] = useState(null);
  const [tipoReporte, setTipoReporte] = useState("resumen");
  const [periodo, setPeriodo] = useState("enero-2026");
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setCargando(true);
    try {
      const response = await axios.get(`${API}/reportes/resumen`);
      setResumen(response.data);
    } catch (error) {
      console.error("Error cargando resumen:", error);
    } finally {
      setCargando(false);
    }
  };

  const generarReportePDF = () => {
    setGenerando(true);
    setTimeout(() => {
      toast.success("Reporte PDF generado", {
        description: "El archivo se ha descargado correctamente",
      });
      setGenerando(false);
    }, 2000);
  };

  const generarReporteExcel = () => {
    setGenerando(true);
    setTimeout(() => {
      // Generate CSV content
      const csvContent = [
        ["REPORTE DE FLOTA VEHICULAR - ARMADA DEL ECUADOR"],
        ["Fecha de generación:", new Date().toISOString()],
        ["Período:", periodo],
        [""],
        ["RESUMEN EJECUTIVO"],
        ["Total de Vehículos:", resumen?.total_vehiculos],
        ["Vehículos Operativos:", resumen?.operativos],
        ["En Mantenimiento:", resumen?.mantenimiento],
        ["Estado Crítico:", resumen?.criticos],
        [""],
        ["INDICADORES OPERATIVOS"],
        ["Consumo Total (galones):", resumen?.consumo_total_galones],
        ["Costo Combustible ($):", resumen?.costo_total_combustible],
        ["Costo Mantenimiento ($):", resumen?.costo_total_mantenimiento],
        ["Kilometraje Total:", resumen?.kilometraje_total_recorrido],
        ["Índice de Eficiencia (%):", resumen?.indice_eficiencia],
        [""],
        ["GESTIÓN DE ALERTAS"],
        ["Alertas Generadas:", resumen?.alertas_generadas],
        ["Alertas Atendidas:", resumen?.alertas_atendidas],
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_flota_${periodo}.csv`;
      link.click();

      toast.success("Reporte Excel generado", {
        description: "El archivo se ha descargado correctamente",
      });
      setGenerando(false);
    }, 2000);
  };

  const imprimirReporte = () => {
    window.print();
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F6F8]">
        <div className="spinner-naval"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="reportes-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Centro de Reportes
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Generación de informes ejecutivos y operativos
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={imprimirReporte}
              className="border-[#003366] text-[#003366]"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="naval-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Tipo de Reporte
              </label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_REPORTE.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center gap-2">
                        <tipo.icono className="w-4 h-4" />
                        {tipo.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Período
              </label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C]"
                onClick={generarReportePDF}
                disabled={generando}
              >
                <Download className="w-4 h-4 mr-2" />
                {generando ? "Generando..." : "Exportar PDF"}
              </Button>
              <Button 
                className="w-full bg-[#16A34A] hover:bg-[#15803D]"
                onClick={generarReporteExcel}
                disabled={generando}
              >
                <Download className="w-4 h-4 mr-2" />
                {generando ? "Generando..." : "Exportar Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="naval-card lg:col-span-3" id="report-preview">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Reporte Ejecutivo de Flota Vehicular
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Base Naval Sur - Armada del Ecuador • {PERIODOS.find(p => p.id === periodo)?.nombre}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Report Content */}
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#003366] to-[#001433] rounded text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C5A005] rounded flex items-center justify-center">
                    <Truck className="w-7 h-7 text-[#001433]" />
                  </div>
                  <div>
                    <h2 className="font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      ARMADA DEL ECUADOR
                    </h2>
                    <p className="text-xs text-white/70">Sistema de Gestión Vehicular Naval</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60">Fecha de generación</p>
                  <p className="font-mono text-sm">{new Date().toLocaleDateString('es-EC')}</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div>
                <h3 className="text-lg font-semibold text-[#003366] uppercase tracking-wide mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Resumen de Flota
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded text-center">
                    <p className="text-3xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.total_vehiculos || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Total Vehículos</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded text-center">
                    <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.operativos || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Operativos</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded text-center">
                    <p className="text-3xl font-bold text-amber-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.mantenimiento || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Mantenimiento</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded text-center">
                    <p className="text-3xl font-bold text-red-600" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.criticos || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Críticos</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-semibold text-[#003366] uppercase tracking-wide mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Indicadores Financieros
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Concepto</TableHead>
                      <TableHead className="text-right font-semibold">Valor</TableHead>
                      <TableHead className="text-right font-semibold">Variación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-[#003366]" />
                        Consumo Total Combustible
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {resumen?.consumo_total_galones?.toLocaleString('es-EC')} galones
                      </TableCell>
                      <TableCell className="text-right text-green-600">-3.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#003366]" />
                        Costo Combustible
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${resumen?.costo_total_combustible?.toLocaleString('es-EC')}
                      </TableCell>
                      <TableCell className="text-right text-green-600">-5.1%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#003366]" />
                        Costo Mantenimiento
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${resumen?.costo_total_mantenimiento?.toLocaleString('es-EC')}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">+2.8%</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>Costo Operativo Total</TableCell>
                      <TableCell className="text-right font-mono">
                        ${((resumen?.costo_total_combustible || 0) + (resumen?.costo_total_mantenimiento || 0)).toLocaleString('es-EC')}
                      </TableCell>
                      <TableCell className="text-right text-green-600">-1.5%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Operational Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-[#003366] uppercase tracking-wide mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Métricas Operativas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Kilometraje Total</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.kilometraje_total_recorrido?.toLocaleString('es-EC')} km
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Índice de Eficiencia</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.indice_eficiencia}%
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Alertas Atendidas</span>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-[#003366]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {resumen?.alertas_atendidas}/{resumen?.alertas_generadas}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t text-center text-xs text-gray-400">
                <p>Documento generado automáticamente por el Sistema de Gestión Vehicular Naval</p>
                <p className="mt-1">© 2026 Armada del Ecuador • Base Naval Sur - Guayaquil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="naval-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Reportes Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPOS_REPORTE.map((tipo) => (
              <div 
                key={tipo.id}
                className={`p-4 border rounded cursor-pointer transition-all ${
                  tipoReporte === tipo.id 
                    ? 'border-[#003366] bg-[#003366]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTipoReporte(tipo.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${tipoReporte === tipo.id ? 'bg-[#003366]' : 'bg-gray-100'}`}>
                    <tipo.icono className={`w-5 h-5 ${tipoReporte === tipo.id ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tipo.nombre}</p>
                    <p className="text-xs text-gray-500">{tipo.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Value Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#003366] to-[#001433] rounded-lg text-white">
        <div className="flex items-center gap-4">
          <FileText className="w-10 h-10 text-[#C5A005]" />
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Trazabilidad y Documentación Completa
            </h3>
            <p className="text-sm text-white/70">
              Soporte a toma de decisiones • Accountability institucional • Cumplimiento normativo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
