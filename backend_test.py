#!/usr/bin/env python3
"""
Backend API Testing for Sistema de Gestión Vehicular Naval
Tests all endpoints with demo credentials and validates responses
"""

import requests
import sys
import json
from datetime import datetime

class NavalFleetAPITester:
    def __init__(self, base_url="https://control-flota-armada.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_login(self, usuario="admin", clave="naval2024"):
        """Test login endpoint with demo credentials"""
        print(f"\n🔐 Testing login with {usuario}/naval2024...")
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={"usuario": usuario, "clave": clave},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "nombre", "rango", "rol", "unidad", "token"]
                
                if all(field in data for field in required_fields):
                    self.token = data["token"]
                    self.log_test(f"Login {usuario}", True)
                    print(f"   Usuario: {data['nombre']}")
                    print(f"   Rango: {data['rango']}")
                    print(f"   Rol: {data['rol']}")
                    return True
                else:
                    self.log_test(f"Login {usuario}", False, f"Missing fields in response: {data}")
                    return False
            else:
                self.log_test(f"Login {usuario}", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test(f"Login {usuario}", False, f"Exception: {str(e)}")
            return False

    def test_kpis(self):
        """Test KPIs endpoint"""
        print(f"\n📊 Testing KPIs endpoint...")
        try:
            response = requests.get(f"{self.base_url}/kpis", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "porcentaje_flota_operativa", "indice_disponibilidad", 
                    "vehiculos_mantenimiento", "alertas_criticas",
                    "total_vehiculos", "vehiculos_operativos"
                ]
                
                if all(field in data for field in required_fields):
                    self.log_test("KPIs endpoint", True)
                    print(f"   Total vehículos: {data['total_vehiculos']}")
                    print(f"   Flota operativa: {data['porcentaje_flota_operativa']}%")
                    print(f"   Alertas críticas: {data['alertas_criticas']}")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("KPIs endpoint", False, f"Missing fields: {missing}")
                    return False
            else:
                self.log_test("KPIs endpoint", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("KPIs endpoint", False, f"Exception: {str(e)}")
            return False

    def test_vehiculos(self):
        """Test vehicles endpoint"""
        print(f"\n🚛 Testing vehicles endpoint...")
        try:
            response = requests.get(f"{self.base_url}/vehiculos?limite=120", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Check first vehicle structure
                    vehicle = data[0]
                    required_fields = [
                        "id", "placa", "tipo", "marca_modelo", "estado", 
                        "unidad_operativa", "responsable", "ubicacion"
                    ]
                    
                    if all(field in vehicle for field in required_fields):
                        self.log_test("Vehicles endpoint", True)
                        print(f"   Total vehículos: {len(data)}")
                        print(f"   Primer vehículo: {vehicle['placa']} - {vehicle['tipo']}")
                        
                        # Test vehicle detail
                        return self.test_vehiculo_detail(vehicle['id'])
                    else:
                        missing = [f for f in required_fields if f not in vehicle]
                        self.log_test("Vehicles endpoint", False, f"Missing fields in vehicle: {missing}")
                        return False
                else:
                    self.log_test("Vehicles endpoint", False, "Empty or invalid response")
                    return False
            else:
                self.log_test("Vehicles endpoint", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Vehicles endpoint", False, f"Exception: {str(e)}")
            return False

    def test_vehiculo_detail(self, vehiculo_id):
        """Test individual vehicle detail"""
        print(f"\n🔍 Testing vehicle detail for {vehiculo_id}...")
        try:
            response = requests.get(f"{self.base_url}/vehiculos/{vehiculo_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Vehicle detail", True)
                print(f"   Vehículo: {data.get('placa')} - {data.get('marca_modelo')}")
                
                # Test maintenance history
                self.test_historial_mantenimiento(vehiculo_id)
                # Test fuel history  
                self.test_historial_combustible(vehiculo_id)
                return True
            else:
                self.log_test("Vehicle detail", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Vehicle detail", False, f"Exception: {str(e)}")
            return False

    def test_historial_mantenimiento(self, vehiculo_id):
        """Test maintenance history"""
        try:
            response = requests.get(f"{self.base_url}/vehiculos/{vehiculo_id}/historial-mantenimiento", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Maintenance history", True)
                    print(f"   Registros mantenimiento: {len(data)}")
                else:
                    self.log_test("Maintenance history", False, "Invalid response format")
            else:
                self.log_test("Maintenance history", False, f"Status {response.status_code}")
                
        except Exception as e:
            self.log_test("Maintenance history", False, f"Exception: {str(e)}")

    def test_historial_combustible(self, vehiculo_id):
        """Test fuel history"""
        try:
            response = requests.get(f"{self.base_url}/vehiculos/{vehiculo_id}/historial-combustible", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Fuel history", True)
                    print(f"   Registros combustible: {len(data)}")
                else:
                    self.log_test("Fuel history", False, "Invalid response format")
            else:
                self.log_test("Fuel history", False, f"Status {response.status_code}")
                
        except Exception as e:
            self.log_test("Fuel history", False, f"Exception: {str(e)}")

    def test_alertas(self):
        """Test alerts endpoint"""
        print(f"\n🚨 Testing alerts endpoint...")
        try:
            response = requests.get(f"{self.base_url}/alertas?limite=50", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_test("Alerts endpoint", True)
                    print(f"   Total alertas: {len(data)}")
                    
                    if len(data) > 0:
                        alert = data[0]
                        print(f"   Primera alerta: {alert.get('tipo')} - {alert.get('severidad')}")
                    return True
                else:
                    self.log_test("Alerts endpoint", False, "Invalid response format")
                    return False
            else:
                self.log_test("Alerts endpoint", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Alerts endpoint", False, f"Exception: {str(e)}")
            return False

    def test_ubicaciones_gps(self):
        """Test GPS locations endpoint"""
        print(f"\n📍 Testing GPS locations endpoint...")
        try:
            response = requests.get(f"{self.base_url}/ubicaciones-gps", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    location = data[0]
                    required_fields = ["id", "placa", "lat", "lng", "estado", "ubicacion_nombre"]
                    
                    if all(field in location for field in required_fields):
                        self.log_test("GPS locations", True)
                        print(f"   Ubicaciones GPS: {len(data)}")
                        print(f"   Primera ubicación: {location['placa']} en {location['ubicacion_nombre']}")
                        return True
                    else:
                        missing = [f for f in required_fields if f not in location]
                        self.log_test("GPS locations", False, f"Missing fields: {missing}")
                        return False
                else:
                    self.log_test("GPS locations", False, "Empty or invalid response")
                    return False
            else:
                self.log_test("GPS locations", False, f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GPS locations", False, f"Exception: {str(e)}")
            return False

    def test_estadisticas(self):
        """Test statistics endpoints"""
        print(f"\n📈 Testing statistics endpoints...")
        
        endpoints = [
            "estadisticas/por-estado",
            "estadisticas/por-tipo", 
            "estadisticas/consumo-mensual",
            "estadisticas/mantenimiento-mensual"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}/{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(f"Statistics {endpoint.split('/')[-1]}", True)
                        print(f"   {endpoint}: {len(data)} registros")
                    else:
                        self.log_test(f"Statistics {endpoint.split('/')[-1]}", False, "Invalid format")
                else:
                    self.log_test(f"Statistics {endpoint.split('/')[-1]}", False, f"Status {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Statistics {endpoint.split('/')[-1]}", False, f"Exception: {str(e)}")

    def test_usuarios(self):
        """Test users endpoint"""
        print(f"\n👥 Testing users endpoint...")
        try:
            response = requests.get(f"{self.base_url}/usuarios", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Users endpoint", True)
                    print(f"   Usuarios: {len(data)}")
                else:
                    self.log_test("Users endpoint", False, "Empty or invalid response")
            else:
                self.log_test("Users endpoint", False, f"Status {response.status_code}")
                
        except Exception as e:
            self.log_test("Users endpoint", False, f"Exception: {str(e)}")

    def test_reportes(self):
        """Test reports endpoint"""
        print(f"\n📋 Testing reports endpoint...")
        try:
            response = requests.get(f"{self.base_url}/reportes/resumen", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["fecha_generacion", "total_vehiculos", "operativos"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Reports endpoint", True)
                    print(f"   Reporte generado: {data['periodo']}")
                else:
                    self.log_test("Reports endpoint", False, "Missing required fields")
            else:
                self.log_test("Reports endpoint", False, f"Status {response.status_code}")
                
        except Exception as e:
            self.log_test("Reports endpoint", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚢 INICIANDO PRUEBAS DEL SISTEMA NAVAL")
        print("=" * 50)
        
        # Test login with different users
        users = ["admin", "operador", "logistica"]
        login_success = False
        
        for user in users:
            if self.test_login(user):
                login_success = True
                break
        
        if not login_success:
            print("\n❌ CRITICAL: No se pudo autenticar con ningún usuario")
            return False
        
        # Test all endpoints
        self.test_kpis()
        self.test_vehiculos()
        self.test_alertas()
        self.test_ubicaciones_gps()
        self.test_estadisticas()
        self.test_usuarios()
        self.test_reportes()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 RESUMEN DE PRUEBAS")
        print(f"✅ Pruebas exitosas: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Pruebas fallidas: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print("\n🔍 DETALLES DE FALLAS:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n📈 Tasa de éxito: {success_rate:.1f}%")
        
        return success_rate >= 80

def main():
    """Main test execution"""
    tester = NavalFleetAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Pruebas interrumpidas por el usuario")
        return 1
    except Exception as e:
        print(f"\n💥 Error crítico: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())