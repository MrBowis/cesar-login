# Módulo de Cifrado César - Frontend

## 📋 Descripción

Interfaz web interactiva para el módulo de Cifrado César integrado en el sistema de autenticación segura. Construido con Next.js 14, TypeScript y Tailwind CSS.

## ✨ Características Principales

### 🔓 Acceso Público
- **Cifrado/Descifrado sin autenticación**: Cualquier visitante puede usar las funciones básicas
- **Interfaz intuitiva**: Diseño limpio y fácil de usar
- **Tiempo real**: Resultados inmediatos al procesar texto

### 🔐 Funciones para Usuarios Autenticados
- **Historial privado**: Guarda tus operaciones automáticamente
- **Gestión completa**: Ver, reutilizar y eliminar registros
- **Sincronización**: Historial persistente entre sesiones

## 🎨 Componentes Implementados

### 1. Página Principal (`/cesar/page.tsx`)
**Ubicación**: `/home/bowis/Desktop/Universidad/Septimo/Seguridad/P3/secure-login/frontend/src/app/cesar/page.tsx`

#### Secciones:
- **Panel de Operación**: Entrada de texto y configuración de desplazamiento
- **Panel de Resultado**: Visualización del output con opción de copiar
- **Historial**: Lista de operaciones guardadas (solo usuarios autenticados)
- **Información**: Descripción del cifrado César

### 2. Tipos TypeScript (`lib/types.ts`)
```typescript
export interface CesarEncryptRequest {
  text: string;
  shift: number;
  save_to_history?: boolean;
}

export interface CesarOperationResponse {
  operation: 'ENCRYPT' | 'DECRYPT';
  input_text: string;
  output_text: string;
  shift: number;
  saved_to_history: boolean;
}

export interface CesarHistoryItem {
  id: string;
  operation_type: 'ENCRYPT' | 'DECRYPT';
  input_text: string;
  output_text: string;
  shift: number;
  created_at: string;
}

export interface CesarHistoryResponse {
  total: number;
  items: CesarHistoryItem[];
  limit: number;
  offset: number;
}
```

### 3. API Client (`lib/api.ts`)
**Funciones Implementadas**:
- `cesarEncrypt(data, token?)` - POST /cesar/encrypt
- `cesarDecrypt(data, token?)` - POST /cesar/decrypt
- `getCesarHistory(token, limit, offset)` - GET /cesar/history
- `deleteCesarHistoryItem(token, historyId)` - DELETE /cesar/history/{id}
- `deleteAllCesarHistory(token)` - DELETE /cesar/history

## 🚀 Navegación Integrada

### Página de Inicio
- Card destacada con acceso directo al módulo César
- Visible para todos los visitantes

### Dashboard de Cliente
- Sección "Herramientas" con acceso al módulo
- Integrado entre el perfil y la seguridad

### Dashboard de Admin
- Card en "Acciones Rápidas"
- Acceso rápido a herramientas de criptografía

## 📱 UI/UX

### Diseño Responsive
- **Mobile First**: Funciona perfectamente en dispositivos móviles
- **Grid Adaptativo**: Layout de 2 columnas en desktop, 1 en mobile
- **Touch Friendly**: Botones grandes y espaciados

### Temas y Colores
- **Purpura/Indigo**: Tema principal del módulo César
- **Estados visuales**: Badges para operaciones (ENCRYPT/DECRYPT)
- **Feedback visual**: Animaciones de carga y transiciones

### Accesibilidad
- Labels descriptivos en todos los campos
- Mensajes de error claros
- Estados de loading visibles
- Confirmaciones antes de eliminar

## 🔧 Funcionalidades Detalladas

### Cifrado/Descifrado
```typescript
// Usuario ingresa texto y desplazamiento
const handleEncrypt = async () => {
  const response = await cesarEncrypt({
    text: "Hello World",
    shift: 3,
    save_to_history: isAuthenticated && saveToHistory
  }, token);
  
  setResult(response);
  // Output: "Khoor Zruog"
};
```

### Gestión de Historial
```typescript
// Ver historial (solo autenticados)
const loadHistory = async () => {
  const data = await getCesarHistory(token, 50, 0);
  setHistory(data.items);
};

// Eliminar registro
const handleDeleteHistoryItem = async (id: string) => {
  await deleteCesarHistoryItem(token, id);
  await loadHistory(); // Recargar
};

// Eliminar todo
const handleDeleteAllHistory = async () => {
  await deleteAllCesarHistory(token);
  await loadHistory();
};
```

### Reutilización de Resultados
- **Botón "Usar este resultado"**: Carga el output en el input
- **Reutilizar del historial**: Click en cualquier registro histórico
- **Scroll automático**: Al reutilizar, scroll a la parte superior

## 📊 Estados de la Aplicación

### 1. Usuario No Autenticado
- ✅ Puede cifrar/descifrar
- ❌ No puede guardar historial
- ❌ No ve sección de historial
- ℹ️ Se muestra mensaje informativo

### 2. Usuario Autenticado
- ✅ Puede cifrar/descifrar
- ✅ Puede guardar historial
- ✅ Ve y gestiona su historial
- ✅ Checkbox "Guardar en historial"

## 🎯 Flujo de Usuario

### Escenario 1: Uso Público
1. Visitante entra a `/cesar`
2. Ingresa texto: "Hello"
3. Configura shift: 3
4. Click en "🔒 Cifrar"
5. Ve resultado: "Khoor"
6. Puede copiar o reutilizar

### Escenario 2: Usuario con Historial
1. Usuario logueado entra a `/cesar`
2. Ingresa texto: "Secret"
3. Activa "💾 Guardar en mi historial"
4. Click en "🔒 Cifrar"
5. Ve resultado y confirmación de guardado
6. Despliega historial
7. Ve su operación registrada

### Escenario 3: Gestión de Historial
1. Usuario abre historial
2. Ve lista de operaciones anteriores
3. Click en "↻ Reutilizar" en un registro
4. El texto y shift se cargan automáticamente
5. Puede hacer nueva operación
6. Elimina registros antiguos con "✕"

## 🔒 Seguridad

### Validaciones Client-Side
```typescript
// Validación de texto vacío
if (!text.trim()) {
  setError('Por favor ingresa un texto');
  return;
}

// Validación de autenticación para guardar
if (saveToHistory && !isAuthenticated) {
  // Error: requiere autenticación
}
```

### Manejo de Tokens
```typescript
// Token se obtiene de localStorage
const token = localStorage.getItem('access_token');

// Se pasa opcionalmente a las funciones
await cesarEncrypt(data, token || undefined);
```

### Protección de Endpoints
- Si intenta guardar sin token → Error 401
- Si intenta ver historial sin token → Redirige a login
- Si token expira → Mensaje de error y logout

## 🎨 Ejemplos de Código

### Componente de Resultado
```tsx
{result && (
  <div className="space-y-4">
    <div className="p-3 bg-gray-50 rounded-lg border">
      <p className="text-sm font-mono">{result.input_text}</p>
    </div>
    <div className="p-3 bg-purple-50 rounded-lg border">
      <p className="text-lg font-mono font-bold text-purple-900">
        {result.output_text}
      </p>
    </div>
    <Button onClick={() => copyToClipboard(result.output_text)}>
      📋 Copiar
    </Button>
  </div>
)}
```

### Item de Historial
```tsx
{history.map((item) => (
  <div key={item.id} className="p-4 border rounded-lg">
    <Badge variant={item.operation_type === 'ENCRYPT' ? 'default' : 'secondary'}>
      {item.operation_type === 'ENCRYPT' ? '🔒 Cifrado' : '🔓 Descifrado'}
    </Badge>
    <div className="mt-2">
      <span>Entrada: {item.input_text}</span>
      <span>Salida: {item.output_text}</span>
      <span>Shift: {item.shift}</span>
      <span>{new Date(item.created_at).toLocaleString()}</span>
    </div>
    <Button onClick={() => handleDeleteHistoryItem(item.id)}>✕</Button>
  </div>
))}
```

## 📦 Dependencias

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utility-first
- **Axios**: Cliente HTTP para API calls
- **shadcn/ui**: Componentes UI (Card, Button, Input, etc.)

## 🚀 Cómo Usar

### Desarrollo Local
```bash
cd frontend
npm install
npm run dev
# Abrir http://localhost:3000/cesar
```

### Navegación desde la App
1. **Desde Home**: Click en "Prueba el Cifrado César" → "Probar Ahora"
2. **Desde Dashboard Cliente**: Sección "🔧 Herramientas" → Click en la card
3. **Desde Dashboard Admin**: "Acciones Rápidas" → Card "🔐 Cifrado César"
4. **URL Directa**: `/cesar`

## 🐛 Testing

### Test Manual - Usuario No Autenticado
1. Abrir `/cesar` en modo incógnito
2. Cifrar "Hello" con shift 3
3. Verificar resultado "Khoor"
4. Intentar activar "Guardar en historial"
5. Verificar mensaje: "Debe estar autenticado"
6. No debe aparecer sección de historial

### Test Manual - Usuario Autenticado
1. Login en la aplicación
2. Navegar a `/cesar`
3. Cifrar "Test" con shift 5 y activar "Guardar"
4. Verificar badge "✓ Guardado en historial"
5. Desplegar historial
6. Verificar que aparece el registro
7. Click en "↻ Reutilizar"
8. Verificar que el texto se carga
9. Eliminar registro
10. Verificar que desaparece

### Test de Integración
```bash
# Backend debe estar corriendo en puerto 8000
# Frontend en puerto 3000

# Test de cifrado público
curl -X POST http://localhost:8000/cesar/encrypt \
  -H "Content-Type: application/json" \
  -d '{"text":"Test","shift":3,"save_to_history":false}'

# Test de historial (requiere token válido)
curl -X GET http://localhost:8000/cesar/history?limit=10 \
  -H "Authorization: Bearer {token}"
```

## 📝 Mejoras Futuras

### Funcionalidades
- [ ] Análisis de frecuencia de letras
- [ ] Fuerza bruta automática (25 desplazamientos)
- [ ] Exportar historial como CSV/JSON
- [ ] Compartir resultados por URL
- [ ] Dark mode

### UX
- [ ] Animaciones de cifrado letra por letra
- [ ] Visualización del alfabeto desplazado
- [ ] Tutorial interactivo
- [ ] Estadísticas de uso

### Performance
- [ ] Paginación infinita en historial
- [ ] Cache de operaciones recientes
- [ ] Debouncing en búsqueda de historial

## ✅ Checklist de Implementación

- [x] Tipos TypeScript para César
- [x] Funciones API en api.ts
- [x] Página principal /cesar
- [x] Panel de cifrado/descifrado
- [x] Panel de resultados
- [x] Checkbox para guardar en historial
- [x] Sección de historial
- [x] Funciones CRUD de historial
- [x] Integración con autenticación
- [x] Manejo de estados de loading
- [x] Manejo de errores
- [x] Diseño responsive
- [x] Enlaces desde home
- [x] Enlaces desde dashboards
- [x] Validaciones client-side
- [x] Confirmaciones de eliminación
- [x] Copiar al portapapeles
- [x] Reutilizar resultados
- [x] Información sobre César

## 🎉 Estado: COMPLETADO

El módulo de Cifrado César está completamente implementado y funcional en el frontend.
