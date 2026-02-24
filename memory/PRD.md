# Sistema de Gestión Vehicular Naval (SGVN)
## Base Naval Sur - Armada del Ecuador

### Fecha de creación: 24 de Febrero 2026

---

## Problema Original
Desarrollar una aplicación web demostrativa y comercialmente convincente de gestión vehicular institucional para la Base Naval Sur de la Armada del Ecuador. El objetivo es un prototipo que genere percepción de sistema listo para compra e implementación.

## Preferencias del Usuario
- Colores: Azul naval con colores nacionales de Ecuador (amarillo, azul, rojo)
- Idioma: 100% español
- Branding: Sello oficial de la Armada del Ecuador como referencia
- Módulo de reportes exportables PDF/Excel
- Sistema de usuarios/roles simulado
- Vehículos distribuidos en Guayaquil y ciudades de la costa ecuatoriana

---

## Arquitectura Implementada

### Backend (FastAPI)
- **Servidor**: `/app/backend/server.py`
- **Puerto**: 8001 (interno)
- **Base de datos**: MongoDB (configurada pero usando datos mock)
- **Endpoints principales**:
  - `POST /api/auth/login` - Autenticación simulada
  - `GET /api/vehiculos` - Lista de 120 vehículos con filtros
  - `GET /api/vehiculos/{id}` - Detalle de vehículo
  - `GET /api/kpis` - KPIs estratégicos del dashboard
  - `GET /api/alertas` - Sistema de alertas
  - `GET /api/ubicaciones-gps` - Ubicaciones GPS simuladas
  - `GET /api/estadisticas/*` - Estadísticas diversas
  - `GET /api/reportes/resumen` - Datos para reportes

### Frontend (React)
- **Framework**: React 19 + Tailwind CSS
- **Componentes UI**: Shadcn/UI
- **Gráficos**: Recharts
- **Navegación**: React Router
- **Páginas implementadas**:
  - Login institucional
  - Dashboard con 12+ KPIs
  - Gestión de flota vehicular
  - Mapa GPS simulado
  - Centro de alertas
  - Control de combustible
  - Centro de reportes
  - Configuración del sistema

---

## Dataset Mock
- **120 vehículos** con datos realistas:
  - Placas ecuatorianas (ej: GSA-1234)
  - Tipos: Camionetas, Camiones, Buses, SUV, Ambulancias, Motocicletas
  - Marcas: Chevrolet D-Max, Toyota Hilux, Hino, Land Cruiser, etc.
  - Estados: Operativo (70%), Mantenimiento (15%), Crítico (5%), Reserva (10%)
  - Unidades navales: Comandancia, Capitanía, Hospital Naval, etc.
  - Responsables con rangos navales reales

- **Ubicaciones GPS** en:
  - Guayaquil (Base Naval Sur, Puerto, Astillero, Hospital)
  - Manta (Base Naval, Puerto)
  - Esmeraldas (Capitanía, Puerto)
  - Machala (Puerto Bolívar)
  - Salinas (Destacamento Naval)

---

## KPIs Implementados
1. Porcentaje de flota operativa
2. Índice de disponibilidad
3. Vehículos en mantenimiento
4. Alertas críticas activas
5. Eficiencia de uso de flota
6. Consumo mensual estimado
7. Cumplimiento mantenimiento preventivo
8. Ranking vehículos más utilizados
9. Índice de riesgo operativo
10. Tiempo promedio de mantenimiento
11. Kilometraje promedio por unidad
12. Costo operación diario
13. Ahorro mensual estimado

---

## Credenciales de Demostración
| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | naval2024 | Administrador |
| operador | naval2024 | Operador |
| logistica | naval2024 | Logística |

---

## Lo Implementado ✅
- [x] Login institucional con branding naval
- [x] Dashboard con KPIs estratégicos
- [x] Gráficos interactivos (pie, bar, line)
- [x] Tabla de vehículos con filtros y búsqueda
- [x] Ficha detallada de vehículo
- [x] Historial de mantenimiento
- [x] Historial de combustible
- [x] Mapa GPS simulado de Ecuador
- [x] Sistema de alertas por severidad
- [x] Control de combustible con estadísticas
- [x] Centro de reportes con exportación
- [x] Gestión de usuarios y configuración
- [x] Navegación lateral profesional
- [x] Diseño institucional naval
- [x] Mensajes de valor estratégico integrados

---

## Backlog / Mejoras Futuras

### P0 (Próxima iteración)
- [ ] Integración con API de mapas real (Google Maps/Leaflet)
- [ ] Persistencia de datos en MongoDB
- [ ] Exportación real a PDF con jsPDF

### P1 (Próximas fases)
- [ ] Sistema de autenticación real con JWT
- [ ] Módulo de gestión de conductores
- [ ] Alertas push en tiempo real
- [ ] Aplicación móvil para conductores

### P2 (Mejoras de valor)
- [ ] Dashboard de análisis predictivo
- [ ] Integración con sistema de combustible real
- [ ] Geofencing para zonas restringidas
- [ ] Reportes automáticos programados

---

## Propuesta de Valor

El sistema SGVN ofrece:
- ✅ **Reducción de riesgos operativos** - Alertas proactivas
- ✅ **Control logístico total** - Visibilidad 24/7
- ✅ **Trazabilidad completa** - Historial documentado
- ✅ **Prevención de fallas** - Mantenimiento predictivo
- ✅ **Accountability institucional** - Auditoría de accesos
- ✅ **Eficiencia presupuestaria** - Optimización de costos
- ✅ **Soporte a decisiones** - KPIs en tiempo real

---

## Stack Tecnológico
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Python 3.11
- **Base de datos**: MongoDB (preparada)
- **Despliegue**: Docker + Kubernetes

---

*Documento generado automáticamente - Sistema de Gestión Vehicular Naval v2.0*
