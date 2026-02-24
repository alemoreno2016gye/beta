from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Sistema de Gestión Vehicular Naval - Base Naval Sur")
api_router = APIRouter(prefix="/api")

# ==================== MOCK DATA ====================

# Ubicaciones GPS realistas de Ecuador (Guayaquil y costa)
UBICACIONES = [
    {"nombre": "Base Naval Sur - Guayaquil", "lat": -2.2087, "lng": -79.9079},
    {"nombre": "Puerto Marítimo Guayaquil", "lat": -2.2704, "lng": -79.8987},
    {"nombre": "Capitanía del Puerto Guayaquil", "lat": -2.2856, "lng": -79.8773},
    {"nombre": "Astillero Naval Guayaquil", "lat": -2.1962, "lng": -79.8823},
    {"nombre": "Centro de Operaciones Navales", "lat": -2.1674, "lng": -79.8965},
    {"nombre": "Base Aérea Naval Guayaquil", "lat": -2.1454, "lng": -79.8756},
    {"nombre": "Hospital Naval Guayaquil", "lat": -2.1834, "lng": -79.8912},
    {"nombre": "Escuela Naval Guayaquil", "lat": -2.2143, "lng": -79.9234},
    {"nombre": "Puerto de Manta", "lat": -0.9512, "lng": -80.7347},
    {"nombre": "Base Naval Manta", "lat": -0.9398, "lng": -80.7289},
    {"nombre": "Puerto de Esmeraldas", "lat": 0.9837, "lng": -79.6536},
    {"nombre": "Capitanía Esmeraldas", "lat": 0.9756, "lng": -79.6478},
    {"nombre": "Puerto Bolívar - Machala", "lat": -3.2612, "lng": -79.9634},
    {"nombre": "Destacamento Naval Salinas", "lat": -2.2167, "lng": -80.9583},
    {"nombre": "Centro Logístico Naval Durán", "lat": -2.1712, "lng": -79.8367},
]

# Tipos de vehículos
TIPOS_VEHICULO = [
    {"tipo": "Camioneta", "marca": "Chevrolet D-Max", "capacidad": 5},
    {"tipo": "Camioneta", "marca": "Toyota Hilux", "capacidad": 5},
    {"tipo": "Camioneta", "marca": "Ford Ranger", "capacidad": 5},
    {"tipo": "Camión", "marca": "Hino 500", "capacidad": 3},
    {"tipo": "Camión", "marca": "Hino 300", "capacidad": 3},
    {"tipo": "Bus", "marca": "Hino AK", "capacidad": 40},
    {"tipo": "Sedán", "marca": "Chevrolet Aveo", "capacidad": 5},
    {"tipo": "SUV", "marca": "Chevrolet Captiva", "capacidad": 7},
    {"tipo": "Furgoneta", "marca": "Hyundai H1", "capacidad": 12},
    {"tipo": "Ambulancia", "marca": "Mercedes Sprinter", "capacidad": 4},
    {"tipo": "Vehículo Táctico", "marca": "Land Cruiser", "capacidad": 8},
    {"tipo": "Motocicleta", "marca": "Yamaha FZ", "capacidad": 2},
]

# Unidades operativas navales
UNIDADES_OPERATIVAS = [
    "Comandancia General de Marina",
    "Primera Zona Naval",
    "Dirección de Logística Naval",
    "Escuela Superior Naval",
    "Hospital Naval",
    "Capitanía del Puerto Guayaquil",
    "Batallón de Infantería de Marina",
    "Dirección de Material Naval",
    "Centro de Comunicaciones",
    "Inteligencia Naval",
    "Guardacostas Sector Norte",
    "Guardacostas Sector Sur",
]

# Rangos navales para responsables
RANGOS = [
    "Almirante", "Vicealmirante", "Contralmirante",
    "Capitán de Navío", "Capitán de Fragata", "Capitán de Corbeta",
    "Teniente de Navío", "Teniente de Fragata", "Alférez de Navío",
    "Suboficial Mayor", "Suboficial Primero", "Suboficial Segundo",
    "Sargento Primero", "Sargento Segundo", "Cabo Primero",
]

NOMBRES = [
    "Carlos Mendoza", "Luis Pacheco", "Roberto Álvarez", "Miguel Torres",
    "José García", "Fernando Ruiz", "Andrés Morales", "David Herrera",
    "Ricardo Vargas", "Eduardo Castillo", "Pablo Jiménez", "Sergio Reyes",
    "Daniel Ortega", "Marco Delgado", "Alejandro Vega", "Gustavo Paredes",
    "Javier Ramírez", "Francisco Núñez", "Antonio Salazar", "Hernán Bravo",
]

ESTADOS = ["Operativo", "Mantenimiento", "Crítico", "Reserva"]
ESTADOS_PESOS = [0.70, 0.15, 0.05, 0.10]

def generar_placa_ecuador():
    letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    provincias = ["G", "A", "P", "E", "O", "M", "R", "L", "S", "T"]
    return f"{random.choice(provincias)}{random.choice(letras)}{random.choice(letras)}-{random.randint(1000, 9999)}"

def generar_vehiculos(cantidad=120):
    vehiculos = []
    for i in range(cantidad):
        tipo_info = random.choice(TIPOS_VEHICULO)
        estado = random.choices(ESTADOS, weights=ESTADOS_PESOS)[0]
        ubicacion = random.choice(UBICACIONES)
        km_inicial = random.randint(5000, 150000)
        
        # Fechas realistas
        fecha_adquisicion = datetime.now(timezone.utc) - timedelta(days=random.randint(180, 2500))
        ultimo_mantenimiento = datetime.now(timezone.utc) - timedelta(days=random.randint(10, 120))
        proximo_mantenimiento = ultimo_mantenimiento + timedelta(days=random.randint(30, 90))
        
        vehiculo = {
            "id": str(uuid.uuid4()),
            "placa": generar_placa_ecuador(),
            "tipo": tipo_info["tipo"],
            "marca_modelo": tipo_info["marca"],
            "anio": random.randint(2015, 2024),
            "capacidad": tipo_info["capacidad"],
            "color": random.choice(["Blanco", "Gris", "Negro", "Azul Naval", "Verde Olivo"]),
            "kilometraje": km_inicial,
            "estado": estado,
            "disponibilidad": "Disponible" if estado == "Operativo" else ("En Servicio" if random.random() > 0.5 else "No Disponible"),
            "unidad_operativa": random.choice(UNIDADES_OPERATIVAS),
            "responsable": f"{random.choice(RANGOS)} {random.choice(NOMBRES)}",
            "ubicacion": ubicacion,
            "consumo_promedio": round(random.uniform(8.5, 18.5), 1),  # km/galón
            "tanque_capacidad": random.choice([15, 20, 25, 30, 40, 60, 80]),
            "nivel_combustible": random.randint(15, 100),
            "fecha_adquisicion": fecha_adquisicion.isoformat(),
            "ultimo_mantenimiento": ultimo_mantenimiento.isoformat(),
            "proximo_mantenimiento": proximo_mantenimiento.isoformat(),
            "numero_serie_motor": f"MTR{random.randint(100000, 999999)}",
            "numero_chasis": f"CHS{random.randint(1000000, 9999999)}",
            "seguro_vigente": random.random() > 0.1,
            "matricula_vigente": random.random() > 0.05,
        }
        vehiculos.append(vehiculo)
    return vehiculos

def generar_historial_mantenimiento(vehiculo_id, cantidad=5):
    tipos_mantenimiento = [
        "Cambio de aceite y filtros",
        "Revisión de frenos",
        "Alineación y balanceo",
        "Cambio de neumáticos",
        "Revisión general",
        "Reparación de motor",
        "Cambio de batería",
        "Revisión eléctrica",
        "Cambio de suspensión",
        "Servicio de transmisión",
    ]
    historial = []
    for i in range(cantidad):
        fecha = datetime.now(timezone.utc) - timedelta(days=random.randint(30, 700))
        historial.append({
            "id": str(uuid.uuid4()),
            "vehiculo_id": vehiculo_id,
            "tipo": random.choice(tipos_mantenimiento),
            "fecha": fecha.isoformat(),
            "kilometraje": random.randint(10000, 150000),
            "costo": round(random.uniform(50, 2500), 2),
            "proveedor": random.choice(["Taller Naval", "Servicio Autorizado", "Mavesa", "Toyocosta", "Taller Central"]),
            "observaciones": random.choice([
                "Servicio preventivo completado sin novedades",
                "Se detectó desgaste en componentes, se recomienda seguimiento",
                "Reparación correctiva exitosa",
                "Cambio de partes por desgaste normal",
                "Mantenimiento de rutina según programación",
            ]),
        })
    return sorted(historial, key=lambda x: x["fecha"], reverse=True)

def generar_historial_combustible(vehiculo_id, cantidad=10):
    historial = []
    for i in range(cantidad):
        fecha = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))
        historial.append({
            "id": str(uuid.uuid4()),
            "vehiculo_id": vehiculo_id,
            "fecha": fecha.isoformat(),
            "galones": round(random.uniform(5, 30), 2),
            "costo_galon": round(random.uniform(2.50, 3.20), 2),
            "estacion": random.choice(["Petroecuador Base Naval", "EP Petroecuador Guayaquil", "Petroecuador Manta"]),
            "kilometraje_actual": random.randint(50000, 150000),
            "autorizado_por": f"{random.choice(RANGOS[:8])} {random.choice(NOMBRES)}",
        })
    return sorted(historial, key=lambda x: x["fecha"], reverse=True)

def generar_alertas():
    tipos_alerta = [
        {"tipo": "Mantenimiento Vencido", "severidad": "alta", "icono": "wrench"},
        {"tipo": "Combustible Bajo", "severidad": "media", "icono": "fuel"},
        {"tipo": "Documentación Vencida", "severidad": "alta", "icono": "file"},
        {"tipo": "Kilometraje Alto", "severidad": "media", "icono": "gauge"},
        {"tipo": "Seguro por Vencer", "severidad": "baja", "icono": "shield"},
        {"tipo": "Falla Reportada", "severidad": "alta", "icono": "alert"},
        {"tipo": "Revisión Técnica Pendiente", "severidad": "media", "icono": "clipboard"},
    ]
    alertas = []
    for i in range(random.randint(15, 30)):
        alerta_tipo = random.choice(tipos_alerta)
        fecha = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 168))
        alertas.append({
            "id": str(uuid.uuid4()),
            "tipo": alerta_tipo["tipo"],
            "severidad": alerta_tipo["severidad"],
            "icono": alerta_tipo["icono"],
            "vehiculo_placa": generar_placa_ecuador(),
            "mensaje": f"Alerta: {alerta_tipo['tipo']} requiere atención inmediata",
            "fecha": fecha.isoformat(),
            "atendida": random.random() > 0.6,
            "responsable": f"{random.choice(RANGOS)} {random.choice(NOMBRES)}",
        })
    return sorted(alertas, key=lambda x: x["fecha"], reverse=True)

# Generar datos mock
VEHICULOS = generar_vehiculos(120)
ALERTAS = generar_alertas()

# ==================== MODELS ====================

class VehiculoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    placa: str
    tipo: str
    marca_modelo: str
    anio: int
    capacidad: int
    color: str
    kilometraje: int
    estado: str
    disponibilidad: str
    unidad_operativa: str
    responsable: str
    ubicacion: dict
    consumo_promedio: float
    tanque_capacidad: int
    nivel_combustible: int
    fecha_adquisicion: str
    ultimo_mantenimiento: str
    proximo_mantenimiento: str
    numero_serie_motor: str
    numero_chasis: str
    seguro_vigente: bool
    matricula_vigente: bool

class KPIResponse(BaseModel):
    porcentaje_flota_operativa: float
    indice_disponibilidad: float
    vehiculos_mantenimiento: int
    alertas_criticas: int
    eficiencia_flota: float
    consumo_mensual_estimado: float
    cumplimiento_mantenimiento: float
    vehiculos_mas_utilizados: List[dict]
    indice_riesgo_operativo: float
    tendencia_fallas: str
    tiempo_promedio_mantenimiento: int
    kilometraje_promedio: int
    total_vehiculos: int
    vehiculos_operativos: int
    vehiculos_criticos: int
    vehiculos_reserva: int
    ahorro_estimado_mensual: float
    costo_operacion_diario: float

class AlertaResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tipo: str
    severidad: str
    icono: str
    vehiculo_placa: str
    mensaje: str
    fecha: str
    atendida: bool
    responsable: str

class UsuarioLogin(BaseModel):
    usuario: str
    clave: str

class UsuarioResponse(BaseModel):
    id: str
    nombre: str
    rango: str
    rol: str
    unidad: str
    token: str

# ==================== ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Sistema de Gestión Vehicular Naval - Base Naval Sur - Armada del Ecuador"}

@api_router.post("/auth/login", response_model=UsuarioResponse)
async def login(datos: UsuarioLogin):
    """Autenticación simulada"""
    usuarios_mock = {
        "admin": {"nombre": "Capitán de Navío Carlos Mendoza", "rango": "Capitán de Navío", "rol": "Administrador", "unidad": "Comandancia General"},
        "operador": {"nombre": "Teniente de Navío Luis Pacheco", "rango": "Teniente de Navío", "rol": "Operador", "unidad": "Centro de Operaciones"},
        "logistica": {"nombre": "Suboficial Mayor Roberto Álvarez", "rango": "Suboficial Mayor", "rol": "Logística", "unidad": "Dirección de Logística"},
    }
    
    if datos.usuario in usuarios_mock and datos.clave == "naval2024":
        usuario = usuarios_mock[datos.usuario]
        return {
            "id": str(uuid.uuid4()),
            "nombre": usuario["nombre"],
            "rango": usuario["rango"],
            "rol": usuario["rol"],
            "unidad": usuario["unidad"],
            "token": f"token_{uuid.uuid4().hex[:16]}",
        }
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@api_router.get("/vehiculos", response_model=List[VehiculoResponse])
async def obtener_vehiculos(
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    unidad: Optional[str] = None,
    busqueda: Optional[str] = None,
    limite: int = Query(default=50, le=200)
):
    """Obtener lista de vehículos con filtros"""
    resultado = VEHICULOS.copy()
    
    if estado:
        resultado = [v for v in resultado if v["estado"].lower() == estado.lower()]
    if tipo:
        resultado = [v for v in resultado if v["tipo"].lower() == tipo.lower()]
    if unidad:
        resultado = [v for v in resultado if unidad.lower() in v["unidad_operativa"].lower()]
    if busqueda:
        busqueda = busqueda.lower()
        resultado = [v for v in resultado if 
                    busqueda in v["placa"].lower() or 
                    busqueda in v["marca_modelo"].lower() or
                    busqueda in v["responsable"].lower()]
    
    return resultado[:limite]

@api_router.get("/vehiculos/{vehiculo_id}", response_model=VehiculoResponse)
async def obtener_vehiculo(vehiculo_id: str):
    """Obtener detalle de un vehículo"""
    vehiculo = next((v for v in VEHICULOS if v["id"] == vehiculo_id), None)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehiculo

@api_router.get("/vehiculos/{vehiculo_id}/historial-mantenimiento")
async def obtener_historial_mantenimiento(vehiculo_id: str):
    """Obtener historial de mantenimiento de un vehículo"""
    return generar_historial_mantenimiento(vehiculo_id, 8)

@api_router.get("/vehiculos/{vehiculo_id}/historial-combustible")
async def obtener_historial_combustible(vehiculo_id: str):
    """Obtener historial de combustible de un vehículo"""
    return generar_historial_combustible(vehiculo_id, 12)

@api_router.get("/kpis", response_model=KPIResponse)
async def obtener_kpis():
    """Obtener KPIs estratégicos del dashboard"""
    operativos = len([v for v in VEHICULOS if v["estado"] == "Operativo"])
    mantenimiento = len([v for v in VEHICULOS if v["estado"] == "Mantenimiento"])
    criticos = len([v for v in VEHICULOS if v["estado"] == "Crítico"])
    reserva = len([v for v in VEHICULOS if v["estado"] == "Reserva"])
    total = len(VEHICULOS)
    
    alertas_activas = len([a for a in ALERTAS if not a["atendida"] and a["severidad"] == "alta"])
    
    # Calcular vehículos más utilizados (por kilometraje)
    vehiculos_ordenados = sorted(VEHICULOS, key=lambda x: x["kilometraje"], reverse=True)[:5]
    mas_utilizados = [{"placa": v["placa"], "kilometraje": v["kilometraje"], "tipo": v["tipo"]} for v in vehiculos_ordenados]
    
    km_promedio = sum(v["kilometraje"] for v in VEHICULOS) // total
    consumo_mensual = sum(v["consumo_promedio"] * 120 for v in VEHICULOS)  # Estimado mensual
    
    return {
        "porcentaje_flota_operativa": round((operativos / total) * 100, 1),
        "indice_disponibilidad": round((operativos + reserva) / total * 100, 1),
        "vehiculos_mantenimiento": mantenimiento,
        "alertas_criticas": alertas_activas,
        "eficiencia_flota": round(random.uniform(78, 92), 1),
        "consumo_mensual_estimado": round(consumo_mensual, 0),
        "cumplimiento_mantenimiento": round(random.uniform(85, 98), 1),
        "vehiculos_mas_utilizados": mas_utilizados,
        "indice_riesgo_operativo": round(random.uniform(5, 15), 1),
        "tendencia_fallas": random.choice(["Decreciente", "Estable", "Leve aumento"]),
        "tiempo_promedio_mantenimiento": random.randint(2, 5),
        "kilometraje_promedio": km_promedio,
        "total_vehiculos": total,
        "vehiculos_operativos": operativos,
        "vehiculos_criticos": criticos,
        "vehiculos_reserva": reserva,
        "ahorro_estimado_mensual": round(random.uniform(8500, 15000), 2),
        "costo_operacion_diario": round(random.uniform(2500, 4500), 2),
    }

@api_router.get("/alertas", response_model=List[AlertaResponse])
async def obtener_alertas(
    severidad: Optional[str] = None,
    atendida: Optional[bool] = None,
    limite: int = Query(default=50, le=100)
):
    """Obtener alertas del sistema"""
    resultado = ALERTAS.copy()
    
    if severidad:
        resultado = [a for a in resultado if a["severidad"] == severidad]
    if atendida is not None:
        resultado = [a for a in resultado if a["atendida"] == atendida]
    
    return resultado[:limite]

@api_router.patch("/alertas/{alerta_id}/atender")
async def atender_alerta(alerta_id: str):
    """Marcar alerta como atendida"""
    for alerta in ALERTAS:
        if alerta["id"] == alerta_id:
            alerta["atendida"] = True
            return {"mensaje": "Alerta marcada como atendida", "id": alerta_id}
    raise HTTPException(status_code=404, detail="Alerta no encontrada")

@api_router.get("/estadisticas/consumo-mensual")
async def obtener_consumo_mensual():
    """Estadísticas de consumo de combustible por mes"""
    meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return [
        {"mes": mes, "consumo": round(random.uniform(3500, 5500), 0), "costo": round(random.uniform(9000, 14000), 2)}
        for mes in meses
    ]

@api_router.get("/estadisticas/mantenimiento-mensual")
async def obtener_mantenimiento_mensual():
    """Estadísticas de mantenimiento por mes"""
    meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return [
        {"mes": mes, "preventivo": random.randint(15, 35), "correctivo": random.randint(5, 15), "costo": round(random.uniform(8000, 25000), 2)}
        for mes in meses
    ]

@api_router.get("/estadisticas/por-estado")
async def obtener_estadisticas_estado():
    """Estadísticas de vehículos por estado"""
    estados_count = {}
    for v in VEHICULOS:
        estados_count[v["estado"]] = estados_count.get(v["estado"], 0) + 1
    return [{"estado": k, "cantidad": v} for k, v in estados_count.items()]

@api_router.get("/estadisticas/por-tipo")
async def obtener_estadisticas_tipo():
    """Estadísticas de vehículos por tipo"""
    tipos_count = {}
    for v in VEHICULOS:
        tipos_count[v["tipo"]] = tipos_count.get(v["tipo"], 0) + 1
    return [{"tipo": k, "cantidad": v} for k, v in tipos_count.items()]

@api_router.get("/estadisticas/por-unidad")
async def obtener_estadisticas_unidad():
    """Estadísticas de vehículos por unidad operativa"""
    unidades_count = {}
    for v in VEHICULOS:
        unidades_count[v["unidad_operativa"]] = unidades_count.get(v["unidad_operativa"], 0) + 1
    return [{"unidad": k, "cantidad": v} for k, v in unidades_count.items()]

@api_router.get("/ubicaciones-gps")
async def obtener_ubicaciones_gps():
    """Obtener ubicaciones GPS de todos los vehículos"""
    return [
        {
            "id": v["id"],
            "placa": v["placa"],
            "tipo": v["tipo"],
            "estado": v["estado"],
            "lat": v["ubicacion"]["lat"] + random.uniform(-0.01, 0.01),
            "lng": v["ubicacion"]["lng"] + random.uniform(-0.01, 0.01),
            "ubicacion_nombre": v["ubicacion"]["nombre"],
            "responsable": v["responsable"],
            "velocidad": random.randint(0, 80) if v["estado"] == "Operativo" else 0,
            "ultimo_reporte": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 60))).isoformat(),
        }
        for v in VEHICULOS
    ]

@api_router.get("/usuarios")
async def obtener_usuarios():
    """Obtener lista de usuarios del sistema"""
    return [
        {"id": "1", "nombre": "CN Carlos Mendoza", "rol": "Administrador", "unidad": "Comandancia General", "activo": True},
        {"id": "2", "nombre": "TN Luis Pacheco", "rol": "Operador", "unidad": "Centro de Operaciones", "activo": True},
        {"id": "3", "nombre": "SM Roberto Álvarez", "rol": "Logística", "unidad": "Dirección de Logística", "activo": True},
        {"id": "4", "nombre": "CF Miguel Torres", "rol": "Supervisor", "unidad": "Primera Zona Naval", "activo": True},
        {"id": "5", "nombre": "CC José García", "rol": "Operador", "unidad": "Capitanía del Puerto", "activo": False},
    ]

@api_router.get("/reportes/resumen")
async def generar_reporte_resumen():
    """Generar datos para reporte de resumen"""
    operativos = len([v for v in VEHICULOS if v["estado"] == "Operativo"])
    mantenimiento = len([v for v in VEHICULOS if v["estado"] == "Mantenimiento"])
    criticos = len([v for v in VEHICULOS if v["estado"] == "Crítico"])
    
    return {
        "fecha_generacion": datetime.now(timezone.utc).isoformat(),
        "periodo": "Enero 2026",
        "total_vehiculos": len(VEHICULOS),
        "operativos": operativos,
        "mantenimiento": mantenimiento,
        "criticos": criticos,
        "consumo_total_galones": round(sum(v["consumo_promedio"] * 120 for v in VEHICULOS), 0),
        "costo_total_combustible": round(sum(v["consumo_promedio"] * 120 * 2.85 for v in VEHICULOS), 2),
        "costo_total_mantenimiento": round(random.uniform(45000, 75000), 2),
        "kilometraje_total_recorrido": sum(v["kilometraje"] for v in VEHICULOS),
        "alertas_generadas": len(ALERTAS),
        "alertas_atendidas": len([a for a in ALERTAS if a["atendida"]]),
        "indice_eficiencia": round(random.uniform(82, 94), 1),
    }

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
