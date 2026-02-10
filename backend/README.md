# Secure Login Backend - Sistema de Autenticación con 2FA

Sistema de autenticación backend desarrollado con **FastAPI** que implementa **autenticación de doble factor (2FA) obligatoria** compatible con **Microsoft Authenticator**.

## 🎯 Características Principales

- ✅ **Registro y Login** con email y contraseña
- ✅ **Sistema de Roles** (ADMIN y CLIENT)
- ✅ **2FA Obligatorio** usando TOTP (Time-based One-Time Password)
- ✅ **Compatible con Microsoft Authenticator**
- ✅ **Implementación TOTP manual** (RFC 6238) sin dependencias externas
- ✅ **Arquitectura SOLID** con inyección de dependencias
- ✅ **JWT** para autenticación de sesiones
- ✅ **Endpoints protegidos** con verificación de tokens
- ✅ **PostgreSQL** como base de datos
- ✅ **Seguridad**: Contraseñas hasheadas con pwdlib
- ✅ **AES-256**: Cifrado de secretos TOTP en base de datos
- ✅ **Cifrado César**: Módulo interactivo con historial para usuarios

## 🏗️ Arquitectura

El proyecto sigue los **principios SOLID** con una arquitectura en capas:

```
app/
├── main.py              # Aplicación FastAPI principal
├── config.py            # Configuración centralizada
├── database.py          # Configuración de SQLAlchemy
├── dependencies.py      # Dependencies para autenticación JWT
├── models/              # Modelos de base de datos (ORM)
│   ├── user.py         # Modelo User con roles
│   └── cesar_history.py # Modelo CesarHistory
├── schemas/             # Schemas Pydantic (validación)
│   ├── auth.py
│   └── cesar.py
├── services/            # Lógica de negocio
│   ├── auth_service.py
│   ├── totp_service.py
│   └── cesar_service.py
├── repositories/        # Acceso a datos (patrón Repository)
│   ├── user_repository.py
│   └── cesar_repository.py
├── routers/             # Endpoints de API
│   ├── auth.py
│   └── cesar.py
└── utils/               # Utilidades
    └── crypto.py        # AES-256 para cifrado de secretos
```

### Principios SOLID Aplicados

- **Single Responsibility**: Cada clase/módulo tiene una única responsabilidad
- **Open/Closed**: Extensible mediante servicios sin modificar código existente
- **Liskov Substitution**: Uso de abstracciones e interfaces
- **Interface Segregation**: Schemas específicos para cada operación
- **Dependency Injection**: FastAPI Depends para inyección de dependencias

## 🚀 Instalación y Configuración

### Requisitos Previos

- Python 3.11+
- PostgreSQL 16
- Docker y Docker Compose (para base de datos)

### 1. Clonar y preparar entorno

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y configurar valores (especialmente JWT_SECRET_KEY)
```

### 3. Iniciar base de datos PostgreSQL

```bash
# Iniciar contenedor PostgreSQL
docker-compose up -d

# Verificar que esté corriendo
docker ps
```

### 4. Ejecutar la aplicación

```bash
# Desde el directorio backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API estará disponible en: `http://localhost:8000`

## 📚 Documentación de API

Una vez iniciada la aplicación, accede a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Flujo de autenticación**: http://localhost:8000/flow

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario

```bash
POST /auth/register
{
  "email": "usuario@example.co,
  "role": "CLIENT"  # Opcional: "ADMIN" o "CLIENT" (por defecto CLIENT)m",
  "password": "MiPassword123!"
}
```

### 2. Configurar 2FA

```bash
POST /auth/setup-2fa
{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

**Respuesta**: Obtendrás un `qr_uri` y un `secret`
- Escanea el QR con Microsoft Authenticator
- O ingresa el `manual_entry_key` manualmente

### 3. Verificar 2FA

```bash
POST /auth/verify-2fa
{
  "email": "usuario@example.com",
  "password": "MiPassword123!",
  "totp_code": "123456"  # Código de 6 dígitos de Microsoft Authenticator
}
```

### 4. Iniciar Sesión

```bash
POST /auth/login
{
  "email": "usuario@example.com",
  "password": "MiPassword123!",
  "totp_code": "123456"  # Código actual de Microsoft Authenticator
}
```

**Respuesta**: Token JWT de acceso

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "role": "CLIENT",
    "totp_verified": true,
    "created_at": "2026-02-05T10:00:00"
  }
}
```
🎭 Sistema de Roles

El sistema implementa dos roles:

- **CLIENT**: Usuario estándar (por defecto)
- **ADMIN**: Usuario administrador con permisos especiales

Los roles se incluyen en el token JWT y se retornan en las respuestas de login y `/auth/me`.

### Uso de Roles en el Código

```python
from app.dependencies import get_current_active_user, require_admin

# Endpoint para cualquier usuario autenticado con 2FA
@router.get("/protected")
async def protected_endpoint(
    current_user: User = Depends(get_current_active_user)
):
    return {"message": f"Hola {current_user.email}, rol: {current_user.role}"}

# Endpoint solo para administradores
@router.get("/admin-only")
async def admin_endpoint(
    current_user: User = Depends(require_admin)
):
    return {" (con rol)
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","role":"CLIENT"}'

# 2. Setup 2FA
curl -X POST "http://localhost:8000/auth/setup-2fa" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# 3. Verificar 2FA (usar código de Authenticator)
curl -X POST "http://localhost:8000/auth/verify-2fa" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","totp_code":"123456"}'

# 4. Login (usar código actual de Authenticator)
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","totp_code":"123456"}'

# 5. Obtener información del usuario (endpoint protegido)
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer {tu_token_aqui}"

# 6. Logout
curl -X POST "http://localhost:8000/auth/logout" \
  -H "Authorization: Bearer {tu_token_aqui}"
```

### Scripts de Prueba Automatizados

```bash
# Prueba flujo completo de autenticación
python test_flow.py

# Prueba roles y endpoints protegidos
python test_roles.py
}
```

### 6. Cerrar sesión

```bash
POST /auth/logout
Authorization: Bearer {token}
```

**Respuesta**:
```json
{
  "message": "Sesión cerrada exitosamente",
  "detail": "Usuario usuario@example.com ha cerrado sesión. Elimine el token del cliente."
}
```

**Nota**: JWT es stateless, por lo que el token seguirá siendo técnicamente válido hasta su expiración. El cliente debe eliminar el token de su almacenamiento.

## 🔐 Cifrado César

El sistema incluye un módulo de **cifrado César** con las siguientes características:

### Características

- 🔓 **Cifrado/Descifrado público**: Cualquiera puede usar las rutas sin autenticación
- 📝 **Historial para usuarios autenticados**: Los usuarios logueados pueden guardar su historial
- 🔒 **Protección de historial**: Solo el propietario puede ver y eliminar sus registros

### Endpoints Disponibles

#### 1. Cifrar texto (Público)

```bash
POST /cesar/encrypt
{
  "text": "Hello World",
  "shift": 3,
  "save_to_history": false  # true requiere autenticación
}
```

**Respuesta**:
```json
{
  "operation": "ENCRYPT",
  "input_text": "Hello World",
  "output_text": "Khoor Zruog",
  "shift": 3,
  "saved_to_history": false
}
```

#### 2. Descifrar texto (Público)

```bash
POST /cesar/decrypt
{
  "text": "Khoor Zruog",
  "shift": 3,
  "save_to_history": false
}
```

**Respuesta**:
```json
{
  "operation": "DECRYPT",
  "input_text": "Khoor Zruog",
  "output_text": "Hello World",
  "shift": 3,
  "saved_to_history": false
}AES-256**: Cifrado de secretos TOTP en base de datos (Encryption at Rest)
- **Base de datos**: Validación de integridad y constraints
- **Validación**: Pydantic para todos los inputs

### Protección de Secretos TOTP con AES-256

Los secretos TOTP se almacenan **cifrados en la base de datos** usando AES-256-CBC:

- **Cifrado**: Cada secret se cifra antes de guardarse en PostgreSQL
- **IV aleatorio**: Cada cifrado usa un vector de inicialización único
- **Clave segura**: La clave AES se guarda en variables de entorno, no en código
- **Protección**: Aunque roben la base de datos, no podrán generar códigos 2FA sin la clave

```bash
# Configurar clave AES en .env
AES_ENCRYPTION_KEY=YourSecure32ByteKeyForAES256EncryptionMustBeKeptSecret!!
```

#### 3. Obtener historial (Requiere autenticación)

```bash
GET /cesar/history?limit=50&offset=0
Authorization: Bearer {token}
```

**Respuesta**:
```json
{
  "total": 10,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "operation_type": "ENCRYPT",
      "input_text": "Hello World",
      "output_text": "Khoor Zruog",
      "shift": 3,
      "created_at": "2026-02-09T10:30:00"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

#### 4. Eliminar registro del historial (Requiere autenticación)

```bash
DELETE /cesar/history/{history_id}
Authorization: Bearer {token}
```

#### 5. Eliminar todo el historial (Requiere autenticación)

```bash
DELETE /cesar/history
Authorization: Bearer {token}
```

### Ejemplos con curl

```bash
# Cifrar sin guardar (público)
curl -X POST "http://localhost:8000/cesar/encrypt" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World","shift":3,"save_to_history":false}'

# Cifrar y guardar (requiere token)
curl -X POST "http://localhost:8000/cesar/encrypt" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{"text":"Hello World","shift":3,"save_to_history":true}'

# Ver historial
curl -X GET "http://localhost:8000/cesar/history?limit=10&offset=0" \
  -H "Authorization: Bearer {tu_token}"

# Eliminar todo el historial
curl -X DELETE "http://localhost:8000/cesar/history" \
  -H "Authorization: Bearer {tu_token}"
```
```

## ⚠️ Regla Crítica de Negocio

**El sistema NO permite login sin 2FA verificado:**

- ❌ Sin 2FA configurado → Error: "Debe configurar 2FA"
- ❌ Con 2FA sin verificar → Error: "Debe verificar 2FA"
- ❌ Sin código TOTP → Error: "Código TOTP requerido"
- ✅ Con 2FA verificado + código correcto → Login exitoso

## 🛠️ Dependencias

El proyecto utiliza **ÚNICAMENTE** las siguientes dependencias del `requirements.txt`:

- **fastapi** (0.128.1): Framework web
- **uvicorn** (0.40.0): Servidor ASGI
- **SQLAlchemy** (2.0.46): ORM
- **psycopg2-binary** (2.9.11): Driver PostgreSQL
- **pydantic** (2.12.5): Validación de datos
- **PyJWT** (2.11.0): Manejo de tokens JWT
- **pwdlib** (0.3.0): Hashing de contraseñas

**Nota importante**: La implementación de TOTP es **manual** (RFC 6238) ya que `pyotp` no está en las dependencias. Esto garantiza compatibilidad con Microsoft Authenticator sin librerías externas.

## 🧪 Pruebas con curl

```bash
# 1. Registro
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# 2. Setup 2FA
curl -X POST "http://localhost:8000/auth/setup-2fa" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# 3. Verificar 2FA (usar código de Authenticator)
curl -X POST "http://localhost:8000/auth/verify-2fa" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","totp_code":"123456"}'

# 4. Login (usar código actual de Authenticator)
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","totp_code":"123456"}'
```

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con Argon2 (pwdlib)
- **Tokens JWT**: Firmados con HS256
- **TOTP**: Implementación RFC 6238 con ventana de 30 segundos
- **Base de datos**: Validación de integridad y constraints
- **Validación**: Pydantic para todos los inputs

## 📝 Configuración de Producción

Para producción, asegúrate de:

1. ✅ Cambiar `JWT_SECRET_KEY` por uno fuerte y aleatorio
2. ✅ Configurar `DEBUG=False`
3. ✅ Usar contraseñas seguras para PostgreSQL
4. ✅ Configurar CORS apropiadamente
5. ✅ Usar HTTPS
6. ✅ Configurar logs y monitoreo
7. ✅ Implementar rate limiting

## 🐳 Docker (Opcional)

Para contenerizar toda la aplicación:

```dockerfile
# Crear Dockerfile en backend/
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos para el curso de Software Seguro.

## 👥 Autor

Desarrollado siguiendo principios SOLID y mejores prácticas de seguridad.
