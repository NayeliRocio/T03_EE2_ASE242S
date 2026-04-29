# Altavista Rooftop Bar - App Móvil

Aplicación móvil administrativa para Altavista Rooftop Bar, construida con React Native y Expo.

## 🚀 Requisitos

- Node.js 16+ 
- npm o yarn
- Expo CLI
- Teléfono con Expo Go (iOS/Android) o emulador

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd AltavistaMobile
npm install
```

### 2. Configurar servidor Expo

```bash
npx expo install
```

### 3. Ejecutar la aplicación

```bash
# Opción 1: Abrir en Expo Go
npm start

# Opción 2: Emulador Android
npm run android

# Opción 3: Simulador iOS (solo macOS)
npm run ios
```

## 🎯 Funcionalidades

✅ Dashboard con estadísticas en tiempo real
✅ Gestión de Clientes
✅ Catálogo de Productos
✅ Control de Mesas
✅ Sistema de Reservas
✅ Gestión de Órdenes
✅ Búsqueda en tiempo real
✅ Pull to Refresh
✅ Manejo de errores robusto

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CardItem.js
│   ├── ErrorMessage.js
│   ├── Loader.js
│   └── SearchBar.js
├── screens/            # Pantallas principales
│   ├── DashboardScreen.js
│   ├── CustomersScreen.js
│   ├── ProductsScreen.js
│   ├── TablesScreen.js
│   ├── ReservationsScreen.js
│   └── OrdersScreen.js
├── navigation/         # Navegación
│   └── TabNavigator.js
├── services/          # Servicios API
│   └── api.js
├── hooks/            # Hooks personalizados
│   └── useFetch.js
└── constants/        # Constantes globales
    └── colors.js
```

## 🌐 Configuración de API

Base URL: `http://192.168.226.20:8081/api`

### Endpoints disponibles:

- `GET /customers` - Lista de clientes
- `GET /products` - Catálogo de productos
- `GET /table-spots` - Mesas disponibles
- `GET /reservations` - Reservas
- `GET /orders` - Órdenes

## 🎨 Tema de Colores

- **Primary**: #fbbf24 (Amarillo)
- **Secondary**: #1f2937 (Gris oscuro)
- **Background**: #0f172a (Azul muy oscuro)
- **Text**: #ffffff (Blanco)

## 🔧 Tecnologías

- React Native 0.71
- Expo 49
- React Navigation 6
- Axios 1.6
- JavaScript ES6+

## 📱 Compatibilidad

- iOS 13+
- Android 9+

## 🆘 Solución de Problemas

### No se conecta a la API
- Verificar que el backend está corriendo en `http://192.168.226.20:8081`
- Verificar conectividad de red
- Revisar logs de la aplicación

### Error de permisos
- Permitir permisos en la aplicación Expo Go
- Reinstalar la app si persiste

### Rendimiento lento
- Limpiar caché: `expo prebuild --clean`
- Reinstalar dependencias: `rm -rf node_modules && npm install`

## 📞 Soporte

Para reportar problemas, crear un issue en el repositorio.
