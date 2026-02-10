# Módulo de Cifrado César - Documentación

## 📋 Descripción General

Módulo interactivo de cifrado/descifrado César integrado en el sistema de autenticación segura. Permite a cualquier usuario cifrar y descifrar texto, pero solo los usuarios autenticados pueden guardar su historial de operaciones.

## 🎯 Características Implementadas

### ✅ Cifrado César Robusto
- Algoritmo de cifrado César clásico
- Soporte para desplazamientos positivos y negativos
- Preserva mayúsculas/minúsculas
- Mantiene caracteres no alfabéticos sin cambios

### ✅ Endpoints Públicos (Sin Autenticación)
- **POST /cesar/encrypt**: Cifra texto con desplazamiento configurable
- **POST /cesar/decrypt**: Descifra texto con desplazamiento conocido
- Cualquiera puede usar estos endpoints sin necesidad de cuenta

### ✅ Historial para Usuarios Autenticados
- **Guardar operaciones**: Usuarios logueados pueden marcar `save_to_history=true`
- **Ver historial**: GET /cesar/history (paginado)
- **Eliminar registro**: DELETE /cesar/history/{id}
- **Eliminar todo**: DELETE /cesar/history
- **Protección**: Solo el propietario puede ver/eliminar sus registros

## 🏗️ Arquitectura

### Modelo de Datos (cesar_history.py)
```python
class CesarHistory:
    - id: UUID (PK)
    - user_id: UUID (FK -> users)
    - operation_type: ENCRYPT | DECRYPT
    - input_text: Texto original
    - output_text: Texto resultante
    - shift: Desplazamiento usado
    - created_at: Timestamp
```

### Servicio (cesar_service.py)
- `CesarService.encrypt(text, shift)`: Cifra el texto
- `CesarService.decrypt(text, shift)`: Descifra el texto
- `CesarService.validate_shift(shift)`: Valida el desplazamiento

### Repositorio (cesar_repository.py)
- `create()`: Crea registro en historial
- `get_by_id()`: Obtiene registro por ID
- `get_user_history()`: Lista historial del usuario (paginado)
- `count_user_history()`: Cuenta registros del usuario
- `delete()`: Elimina registro individual
- `delete_user_history()`: Elimina todo el historial del usuario

### Schemas (cesar.py)
- `CesarEncryptRequest`: Input para cifrado
- `CesarDecryptRequest`: Input para descifrado
- `CesarOperationResponse`: Respuesta de operación
- `CesarHistoryItemResponse`: Item del historial
- `CesarHistoryListResponse`: Lista paginada del historial

### Router (cesar.py)
- Dependency `get_optional_current_user`: Permite autenticación opcional
- Validación automática de permisos para guardar en historial
- Protección de endpoints de historial con autenticación obligatoria

## 📊 Flujo de Uso

### Uso Público (Sin Autenticación)

```bash
# 1. Cifrar texto
POST /cesar/encrypt
{
  "text": "Hello World",
  "shift": 3,
  "save_to_history": false
}

# Respuesta
{
  "operation": "ENCRYPT",
  "input_text": "Hello World",
  "output_text": "Khoor Zruog",
  "shift": 3,
  "saved_to_history": false
}

# 2. Descifrar texto
POST /cesar/decrypt
{
  "text": "Khoor Zruog",
  "shift": 3,
  "save_to_history": false
}

# Respuesta
{
  "operation": "DECRYPT",
  "input_text": "Khoor Zruog",
  "output_text": "Hello World",
  "shift": 3,
  "saved_to_history": false
}
```

### Uso Autenticado (Con Historial)

```bash
# 1. Cifrar y guardar en historial
POST /cesar/encrypt
Authorization: Bearer {token}
{
  "text": "Secret Message",
  "shift": 5,
  "save_to_history": true  # ← Requiere autenticación
}

# 2. Ver historial
GET /cesar/history?limit=50&offset=0
Authorization: Bearer {token}

# Respuesta
{
  "total": 15,
  "items": [
    {
      "id": "uuid-aqui",
      "operation_type": "ENCRYPT",
      "input_text": "Secret Message",
      "output_text": "Xjhwjy Rjxxflj",
      "shift": 5,
      "created_at": "2026-02-09T10:30:00"
    },
    ...
  ],
  "limit": 50,
  "offset": 0
}

# 3. Eliminar registro específico
DELETE /cesar/history/{history_id}
Authorization: Bearer {token}

# 4. Eliminar todo el historial
DELETE /cesar/history
Authorization: Bearer {token}
```

## 🔒 Seguridad

### ✅ Control de Acceso
- Endpoints públicos funcionan sin autenticación
- Guardar en historial **requiere** autenticación
- Ver historial **requiere** autenticación
- Solo el **propietario** puede ver/eliminar sus registros

### ✅ Validaciones
- Texto mínimo 1 carácter
- Shift debe ser entero (cualquier valor)
- Token JWT validado en endpoints protegidos
- Verificación de propiedad en eliminaciones

### ✅ Privacidad
- Cada usuario solo ve su propio historial
- No se puede acceder al historial de otros usuarios
- Operaciones sin guardar no quedan registradas

## 🧪 Pruebas

### Script de Prueba (test_cesar.py)
Incluye:
- ✅ Demostración de uso público
- ✅ Demostración de uso autenticado
- ✅ Modo interactivo
- ✅ Cliente Python reutilizable (`CesarClient`)

### Ejemplos de Uso

```bash
# Ejecutar script de prueba
python test_cesar.py

# Probar manualmente con curl
curl -X POST "http://localhost:8000/cesar/encrypt" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","shift":3,"save_to_history":false}'
```

## 📈 Casos de Uso

### 1. Usuario Anónimo
- Quiere cifrar/descifrar texto ocasionalmente
- No necesita cuenta
- No guarda historial

### 2. Usuario Registrado
- Trabaja frecuentemente con cifrado César
- Quiere guardar su historial de operaciones
- Puede revisar operaciones pasadas
- Puede limpiar su historial cuando desee

### 3. Aplicación Educativa
- Estudiantes aprenden cifrado César
- Profesores asignan ejercicios
- Cada estudiante tiene su propio historial

## 🔧 Mantenimiento

### Base de Datos
- Tabla `cesar_history` con índices en:
  - `id` (PK)
  - `user_id` (FK, indexado)
  - `created_at` (indexado para ordenamiento)

### Consideraciones de Rendimiento
- Paginación en listado de historial (máx 100 por página)
- Índices optimizados para consultas frecuentes
- Eliminación en cascada no implementada (historial persiste si se elimina usuario)

### Extensibilidad
- Fácil agregar otros cifrados (Vigenère, Substitución, etc.)
- Patrón Service-Repository permite cambios sin afectar endpoints
- Schemas Pydantic facilitan versionado de API

## 📝 Integración con Sistema Existente

### ✅ Sin Modificar Autenticación
- Usa sistema JWT existente
- Reutiliza `get_current_user` de dependencies
- Compatible con flujo 2FA actual

### ✅ Sin Modificar Base de Datos de Usuarios
- Nueva tabla independiente `cesar_history`
- Relación FK con tabla `users`
- Migración automática al iniciar aplicación

### ✅ Sin Conflictos de Rutas
- Prefijo `/cesar/*`
- No interfiere con `/auth/*`
- Documentación automática en Swagger

## 🎓 Principios SOLID Aplicados

- **S**ingle Responsibility: Cada clase tiene una responsabilidad única
  - `CesarService`: Solo cifrado/descifrado
  - `CesarRepository`: Solo acceso a datos
  - `Router`: Solo definición de endpoints

- **O**pen/Closed: Extensible sin modificar código existente
  - Agregar nuevos cifrados sin cambiar César
  
- **L**iskov Substitution: Uso de abstracciones
  - Session de SQLAlchemy
  
- **I**nterface Segregation: Schemas específicos
  - `CesarEncryptRequest` vs `CesarDecryptRequest`
  
- **D**ependency Injection: FastAPI Depends
  - `db: Session = Depends(get_db)`
  - `current_user: User = Depends(get_current_user)`

## 📚 Recursos Adicionales

- **RFC sobre cifrado César**: Propósitos educativos
- **Documentación Swagger**: http://localhost:8000/docs
- **README principal**: Incluye sección de cifrado César

## ✅ Checklist de Implementación

- [x] Modelo `CesarHistory` con campos necesarios
- [x] Tabla en base de datos con índices
- [x] Servicio `CesarService` con encrypt/decrypt
- [x] Repositorio `CesarRepository` con CRUD completo
- [x] Schemas de request/response
- [x] Router con 5 endpoints
- [x] Autenticación opcional en encrypt/decrypt
- [x] Autenticación obligatoria en historial
- [x] Verificación de propiedad en eliminaciones
- [x] Paginación en listado
- [x] Documentación en README
- [x] Script de prueba interactivo
- [x] Sin errores de sintaxis
- [x] Integración con main.py
- [x] Base de datos auto-migrada

## 🚀 Estado: COMPLETADO

Todos los componentes están implementados, integrados y probados.
