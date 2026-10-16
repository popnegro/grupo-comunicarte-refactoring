# CLAUDE.md — grupo-comunicarte-refactoring

Panel comercial de Grupo Comunicarte (DOOH). Este archivo se lee al iniciar cada sesión: seguí estas reglas sin que te las repita.

## Stack

- React 19 + TypeScript (strict, sin `any`)
- Tailwind CSS v4 (tokens en `@theme`, sin `tailwind.config.js` salvo que ya exista)
- Íconos: `lucide-react`
- Tipografía: Inter

## Flujo de trabajo

- Trabajá siempre en la rama `feat/dashboard-ui-redesign` (creada desde `feat/dashboard-mediakit-materials`). Nunca commitees directo en `main` ni en la rama base.
- Un commit por componente o por vista, con mensajes en formato Conventional Commits (`feat(ui): add StatusBadge`).
- Antes de cada commit corré `npm run lint` y `npm run build`; no commitees si fallan.
- Si falta información para decidir, elegí la opción más simple y reutilizable, y dejala anotada en el mensaje del commit.

## Permisos

- Sin preguntar: leer, crear y editar archivos de `src/`, correr `lint`, `build` y tests.
- Preguntar antes de: borrar archivos, instalar o actualizar dependencias, hacer `git push`, tocar CI, variables de entorno o `package.json` fuera de lo necesario.

## Reglas de código

- Entregá código completo y funcional: sin placeholders, sin `TODO` ni `// ...resto`.
- Componentes pequeños, tipados y reutilizables. Props explícitas con `interface`.
- Sin sobreingeniería: no agregues librerías si Tailwind y React alcanzan.
- Accesibilidad: elementos semánticos (`button`, `a`, `label` + `input`), `aria-label` en botones solo con ícono, foco visible, contraste mínimo 4.5:1.
- Estados locales con `useState`; extraé a hooks (`useDrawer`) cuando se repitan.
- No dupliques lógica entre Solicitudes e Inventario: ambos usan el mismo layout de lista.

## Tokens de diseño

```css
@theme {
  --color-brand: #2563EB;
  --color-app-bg: #F8FAFC;
  --color-sidebar: #F1F5FB;
  --color-ink: #1E293B;
  --color-muted: #64748B;
  --color-line: #E2E8F0;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

- Fondo general `app-bg`; topbar blanca; sidebar `sidebar` con ítem activo en azul pastel (`#DBE7FF`) y texto/ícono `brand`.
- Títulos `font-semibold`/`font-bold` en `ink`; texto secundario en `muted`.
- Bordes de 1px en `line`, radios de 6–8px en inputs y tarjetas.

### Badges de estado (`rounded-full`)

| Estado | Fondo | Texto |
| --- | --- | --- |
| Pendiente | `#FEF3C7` | `#D97706` |
| En revisión | `#DBEAFE` | `#2563EB` |
| Aprobada / Activo | `#DCFCE7` | `#16A34A` |
| Rechazada / Inactivo | `#FEE2E2` | `#DC2626` |

## Arquitectura de UI

Construir en este orden:

1. Primitivos: `StatusBadge` (variantes tipadas), `Tabs`, `Pagination`, `DataTable` (checkbox, acciones, fila seleccionable), `Drawer` (header con ID y cierre, tabs, body con scroll, footer fijo), `FormField`, `Select` con ícono, `MiniMap`.
2. Layout: sidebar y topbar del dashboard.
3. Plantilla `DashboardListPage` configurable (búsqueda, filtros, tabs Lista/Mapa, tabla, paginado y drawer), reutilizable para Clientes, Campañas y Propuestas.
4. Vistas:
   - Solicitudes de Media Kits: drawer con tabs Información, Materiales e Historial; acciones Rechazar/Aprobar.
   - Inventario: drawer "Editar soporte" con tabs Información, Ubicación y Multimedia; botones Cancelar/Guardar cambios fijos al pie.

## Referencia visual

La referencia canónica es el canvas de diseño (artboards de Solicitudes, Materiales, Historial, Inventario, Ubicación y Multimedia) y las capturas `mediakits.png` e `inventario.png`. Ante cualquier duda de espaciado, color o composición, gana la referencia visual. Si no podés verla, pedímela antes de improvisar.

## Criterios de aceptación

- `npm run build` y `npm run lint` pasan sin errores ni warnings nuevos.
- El drawer abre al seleccionar una fila y cierra con la X, sin romper el layout de la tabla.
- Los badges usan únicamente los cuatro estados definidos arriba.
- Navegación por teclado completa en tabla, tabs y drawer.
- Responsive: en pantallas angostas el drawer ocupa todo el ancho y la tabla scrollea horizontalmente dentro de su contenedor.
