# MANIFIESTO DE EXPORTACIÓN — GRUPO COMUNICARTE OOH DASHBOARD
**Paquete:** `grupo-comunicarte-ooh-ui.zip`  
**Destino de Integración:** `popnegro/grupo-comunicarte-refactoring`  
**Rama prevista:** `feat/dashboard-uxui-redesign`  
**Ambiente de QA:** `https://grupocomunicarte.vercel.app/`  
**Fecha de Generación:** 12 de Octubre de 2026  
**Seguridad:** Paquete verificado libre de secretos, credenciales y variables de entorno de producción.

---

## 1. INVENTARIO DE ARCHIVOS Y RESPONSABILIDADES

### A. Configuración y Tooling
- **`package.json`**: Define scripts (`dev`, `build`, `lint`) y dependencias (React 19, Tailwind CSS v4, Lucide React). Sin dependencias no utilizadas.
- **`tsconfig.json`**: Configuración de TypeScript con chequeo estricto y resolución bundler con alias `@/*`.
- **`vite.config.ts`**: Configuración de Vite con plugins `@vitejs/plugin-react` y `@tailwindcss/vite`.
- **`index.html`**: Punto de entrada HTML con fuente Inter, metadatos descriptivos y contenedor root.
- **`.env.example`**: Plantilla de variables de entorno de referencia. **Sin secretos ni credenciales reales**.
- **`.gitignore`**: Exclusión de `node_modules`, `dist`, `.env` y temporales.

### B. Estructura y Estilos
- **`src/main.tsx`**: Inicialización del árbol de componentes en el DOM.
- **`src/App.tsx`**: Enrutador de vista principal que conmuta entre `/inventario`, `/solicitudes-media-kits` y vistas pendientes.
- **`src/index.css`**: Configuración de Tailwind CSS (`@import "tailwindcss";`) y scrollbars estilizadas.

### C. Contratos de Datos (TypeScript)
- **`src/types/inventory.ts`**: Contrato obligatorio de inventario:
  - Tipologías: `Tradicional`, `LED móvil`, `Pantallas LED` y `Pendiente de mapeo`.
  - Disponibilidad comercial: `Disponible` y `Reservado`.
  - Atributo comercial: `destacado: boolean`.
  - Atributos visibles de la ficha: `medidas`, `formato`, `impactoMensual`, `caras`.
  - Estado operativo técnico segregado: `estadoOperativo`.
  - **Sin importes de exhibición, instalación o impresión**.
- **`src/types/mediaKits.ts`**: Contrato comercial de solicitudes:
  - Estados: `Pendiente`, `En revisión`, `Aprobada`, `Rechazada`.
  - `MediaKitPropuestaSupport`: Soportes incluidos en la propuesta (con tipo y disponibilidad importados de `inventory.ts`).
  - `PropuestaPeriodo`: Fechas de inicio/fin y duración en días, semanas o meses.
  - `PropuestaMonto`: Monto global acordado y moneda (`ARS`, `USD`, `Por definir`).

### D. Fixtures Aislados de Desarrollo
- **`src/fixtures/inventoryFixtures.ts`**: 10 soportes de prueba ilustrativos para desarrollo frontend.
  - *Aviso:* Datos aislados de catálogo sin conexión de base de datos.
- **`src/fixtures/mediaKitsFixtures.ts`**: 10 solicitudes que contemplan múltiples soportes, propuestas sin soportes, soportes reservados y casos con datos incompletos.
  - *Aviso:* Montos ficticios con fines exclusivos de validación de UI.

### E. Componentes Compartidos (UI & Layout)
- **`src/components/layout/AppLayout.tsx`**: Layout general con soporte móvil y desktop.
- **`src/components/layout/AppHeader.tsx`**: Barra superior de navegación con acceso directo a exportación y perfil.
- **`src/components/layout/AppSidebar.tsx`**: Barra lateral con enlaces a módulos y estados activos.
- **`src/components/shared/StateNotice.tsx`**: Estados visuales de límites de integración (Leaflet) y listas vacías.
- **`src/components/ui/PageHeader.tsx`**: Encabezado visual de módulo.
- **`src/components/ui/Pagination.tsx`**: Control de paginación interactiva.
- **`src/components/ui/StatusBadge.tsx`**: Badges semánticos para disponibilidad comercial y estados de solicitudes.
- **`src/components/ui/TypeIcon.tsx`**: Iconografía identificatoria para las 4 tipologías.
- **`src/components/ui/ViewTabs.tsx`**: Conmutador de vista Lista / Mapa.

### F. Pantallas y Drawers Específicos
- **`src/components/inventory/InventoryTable.tsx`**: Tabla de soportes con filtros reactivos (texto, tipología, disponibilidad, destacado), insignia dorada `★ Destacado` y columnas técnicas.
- **`src/components/inventory/InventoryDrawer.tsx`**: Ficha de edición con selector de tipología, disponibilidad, control switch de destacado, atributos físicos (medidas, caras, formato, impacto), estado operativo técnico segregado y **exclusión total de precios internos**.
- **`src/pages/InventoryPage.tsx`**: Controlador de la página de inventario.
- **`src/components/mediaKits/MediaKitsTable.tsx`**: Tabla de solicitudes con columna de propuesta comercial (conteo de soportes y monto acordado).
- **`src/components/mediaKits/MediaKitsDrawer.tsx`**: Panel lateral de propuesta con selector de soportes sin duplicados, advertencias de soportes reservados o no clasificados, validación de fechas (fin >= inicio) y monto total con formato.
- **`src/pages/MediaKitsPage.tsx`**: Controlador de la página de Media Kits con guardado en memoria local.
- **`src/pages/PendingPage.tsx`**: Pantalla informativa para rutas secundarias.

---

## 2. INSTRUCCIONES DE INSTALACIÓN Y COMPILACIÓN

Para ejecutar o verificar este paquete en cualquier entorno Node.js estándar (Node 18+ o 20+):

```bash
# 1. Descomprimir el archivo
unzip grupo-comunicarte-ooh-ui.zip -d grupo-comunicarte-ui
cd grupo-comunicarte-ui

# 2. Instalar dependencias exactas
npm install

# 3. Comprobación estricta de TypeScript (0 errores)
npm run lint

# 4. Compilación de producción (Vite)
npm run build

# 5. Iniciar servidor de desarrollo en puerto local
npm run dev
```

---

## 3. DEPENDENCIAS RELEVANTES

| Paquete | Versión | Rol |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.1` | Motor de UI y componentes funcionales |
| `@tailwindcss/vite` / `tailwindcss` | `^4.3.3` | Framework de diseño CSS utilitario |
| `lucide-react` | `^0.546.0` | Conjunto iconográfico estándar |
| `vite` | `^8.3.0` | Bundler y servidor de desarrollo |
| `typescript` | `^7.0.2` | Compilación y chequeo de tipos estático |

---

## 4. LIMITACIONES CONOCIDAS Y REGLAS DE INTEGRACIÓN

1. **Sin conexión a backend:** Este paquete es puramente presentacional. No realiza mutaciones en Neon PostgreSQL ni llamadas de red REST/tRPC/GraphQL.
2. **Pestaña Mapa:** Conserva el componente contenedor de aviso hasta que se monte el componente real de Leaflet presente en `popnegro/grupo-comunicarte-refactoring`.
3. **Persistencia de Propuestas:** Guardar una propuesta actualiza el estado de la UI en memoria; para persistir en producción se debe conectar con la mutación del backend correspondiente.
4. **Confidencialidad de Pricing Interno:** Se respetó estrictamente la prohibición de mostrar importes de Exhibición, Instalación o Impresión en Inventario o Media Kits.
