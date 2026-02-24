import { useState, useEffect } from "react";
import axios from "axios";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Lock,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROLES = ["Administrador", "Supervisor", "Operador", "Logística", "Consulta"];

export default function ConfiguracionPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [configuracion, setConfiguracion] = useState({
    notificacionesEmail: true,
    notificacionesSistema: true,
    alertasMantenimiento: true,
    alertasCombustible: true,
    alertasCriticas: true,
    frecuenciaActualizacion: "30",
    zonaHoraria: "America/Guayaquil",
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const response = await axios.get(`${API}/usuarios`);
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracion = () => {
    toast.success("Configuración guardada", {
      description: "Los cambios se han aplicado correctamente",
    });
  };

  return (
    <div className="p-6 bg-[#F4F6F8] min-h-screen" data-testid="configuracion-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-[#003366] uppercase tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              Configuración del Sistema
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Administración de usuarios, permisos y preferencias del sistema
            </p>
          </div>
          <Button 
            className="bg-[#003366] hover:bg-[#002244]"
            onClick={guardarConfiguracion}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="usuarios" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="data-[state=active]:bg-[#003366] data-[state=active]:text-white">
            <Lock className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Usuarios Tab */}
        <TabsContent value="usuarios">
          <Card className="naval-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Gestión de Usuarios
                </CardTitle>
                <Button size="sm" className="bg-[#003366] hover:bg-[#002244]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Usuario</TableHead>
                    <TableHead className="font-semibold">Rol</TableHead>
                    <TableHead className="font-semibold">Unidad</TableHead>
                    <TableHead className="font-semibold text-center">Estado</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#003366] text-white rounded flex items-center justify-center text-sm font-semibold">
                            {usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium">{usuario.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{usuario.unidad}</TableCell>
                      <TableCell className="text-center">
                        {usuario.activo ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 border">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Roles Card */}
          <Card className="naval-card mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Roles y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLES.map((rol) => (
                  <div key={rol} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#003366]">{rol}</span>
                      <Shield className="w-4 h-4 text-[#C5A005]" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {rol === "Administrador" && "Acceso total al sistema"}
                      {rol === "Supervisor" && "Gestión de flota y reportes"}
                      {rol === "Operador" && "Registro de operaciones"}
                      {rol === "Logística" && "Control de combustible y mantenimiento"}
                      {rol === "Consulta" && "Solo visualización de datos"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones Tab */}
        <TabsContent value="notificaciones">
          <Card className="naval-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366]">Canales de Notificación</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#003366]" />
                      <div>
                        <p className="font-medium">Notificaciones por Email</p>
                        <p className="text-xs text-gray-500">Recibir alertas por correo electrónico</p>
                      </div>
                    </div>
                    <Switch 
                      checked={configuracion.notificacionesEmail}
                      onCheckedChange={(checked) => setConfiguracion({...configuracion, notificacionesEmail: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#003366]" />
                      <div>
                        <p className="font-medium">Notificaciones del Sistema</p>
                        <p className="text-xs text-gray-500">Alertas en tiempo real en el dashboard</p>
                      </div>
                    </div>
                    <Switch 
                      checked={configuracion.notificacionesSistema}
                      onCheckedChange={(checked) => setConfiguracion({...configuracion, notificacionesSistema: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366]">Tipos de Alertas</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Alertas de Mantenimiento</p>
                      <p className="text-xs text-gray-500">Mantenimientos programados y vencidos</p>
                    </div>
                    <Switch 
                      checked={configuracion.alertasMantenimiento}
                      onCheckedChange={(checked) => setConfiguracion({...configuracion, alertasMantenimiento: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Alertas de Combustible</p>
                      <p className="text-xs text-gray-500">Nivel bajo de combustible</p>
                    </div>
                    <Switch 
                      checked={configuracion.alertasCombustible}
                      onCheckedChange={(checked) => setConfiguracion({...configuracion, alertasCombustible: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded border border-red-100">
                    <div>
                      <p className="font-medium text-red-800">Alertas Críticas</p>
                      <p className="text-xs text-red-600">Fallas y emergencias (siempre activo)</p>
                    </div>
                    <Switch 
                      checked={true}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema Tab */}
        <TabsContent value="sistema">
          <Card className="naval-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Frecuencia de Actualización GPS</Label>
                    <Select 
                      value={configuracion.frecuenciaActualizacion}
                      onValueChange={(value) => setConfiguracion({...configuracion, frecuenciaActualizacion: value})}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">1 minuto</SelectItem>
                        <SelectItem value="300">5 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Zona Horaria</Label>
                    <Select 
                      value={configuracion.zonaHoraria}
                      onValueChange={(value) => setConfiguracion({...configuracion, zonaHoraria: value})}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Guayaquil">Ecuador (GMT-5)</SelectItem>
                        <SelectItem value="America/Bogota">Colombia (GMT-5)</SelectItem>
                        <SelectItem value="America/Lima">Perú (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-[#003366]" />
                      <span className="font-semibold text-[#003366]">Estado de Base de Datos</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conexión</span>
                        <span className="text-green-600 font-semibold">Activa</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registros</span>
                        <span className="font-mono">120 vehículos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Última sincronización</span>
                        <span className="font-mono">{new Date().toLocaleTimeString('es-EC')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">Información del Sistema</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Versión:</span> 2.0.1</p>
                      <p><span className="text-gray-500">Entorno:</span> Producción</p>
                      <p><span className="text-gray-500">API:</span> v2.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad Tab */}
        <TabsContent value="seguridad">
          <Card className="naval-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#003366] uppercase tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366]">Políticas de Acceso</h3>
                  
                  <div className="p-4 bg-gray-50 rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tiempo de sesión máximo</span>
                      <Badge variant="outline">8 horas</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intentos de login fallidos</span>
                      <Badge variant="outline">3 intentos</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Autenticación de dos factores</span>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Opcional</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#003366]">Auditoría</h3>
                  
                  <div className="p-4 bg-green-50 border border-green-100 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Registro de Actividad Activo</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Todos los accesos y modificaciones son registrados y monitoreados
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      El sistema cumple con las normativas de seguridad de información
                      requeridas para instituciones gubernamentales.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Value Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#003366] to-[#001433] rounded-lg text-white">
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10 text-[#C5A005]" />
          <div>
            <h3 className="font-semibold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Control de Acceso y Seguridad Institucional
            </h3>
            <p className="text-sm text-white/70">
              Gestión de roles • Auditoría completa • Cumplimiento normativo • Trazabilidad total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
