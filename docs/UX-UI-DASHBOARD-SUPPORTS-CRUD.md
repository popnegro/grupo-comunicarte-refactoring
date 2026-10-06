# UX/UI — Dashboard Gestión de Soportes

## Rutas

- `/dashboard/soportes` = catálogo/listado administrativo.
- `/dashboard/soportes/new` = alta de producto.
- `/dashboard/soportes/:canonicalId/edit` = edición de producto.
- `/dashboard/soportes/:canonicalId/preview` = revisión de publicación.

## Reglas del listado

- **Editar** es la acción principal por fila.
- **Nuevo soporte** es el CTA principal del listado.
- Búsqueda y filtros están encapsulados en `useSupportListFilters`.
- Desktop usa tabla compacta; mobile usa cards.
- Disponibilidad y estado de publicación permanecen diferenciados.
- Archivar conserva confirmación.

## Editor

El alta y la edición comparten:
- header;
- tabs: Información / Ubicación / Contenido / Comercial;
- formulario componentizado;
- preview único sticky en desktop;
- indicador de cambios sin guardar;
- CTA contextual: Crear soporte / Guardar cambios;
- feedback de guardado exitoso;
- controles de formulario basados en la UI compartida del Dashboard.

### Theme governance

`supportEditorThemes.ts` gobierna las secciones y campos técnicos visibles mediante `isEditorSectionVisible()` e `isEditorFieldVisible()`. No se deben reintroducir condicionales de UI basados directamente en `tipo_soporte` cuando exista una regla equivalente en el theme.

### Calidad

- CI: **PASS**
- Visual QA: **PASS**
- Smoke E2E: **DONE** — create → edit → preview → list filter
- Unit tests: **DONE** — normalize / payloadFrom / extractCoordsFromUrl / dirty-check
- A10 legacy Connected passthrough: **eliminado**
- `Field.tsx` duplicado del editor: **eliminado**; se usa `components/dashboard/ui/Field.tsx`.

## Flujo de aceptación

```text
Explorar
  ↓
Filtrar
  ↓
Editar
  ↓
Guardar
  ↓
Revisión / Preview
  ↓
Inventario público
```

El contrato funcional del inventario público no se modifica durante el look & feel.

## Deudas técnicas del editor

| ID | Estado | Alcance | Criterio de cierre |
|---|---|---|---|
| A7 | DEFERRED | El estado del formulario mantiene numéricos como `string`; `payloadFrom()` transforma al contrato API. | `number | ''` o validación/transformación Zod + tests de vacío, límites e inválidos. |
| D1 | DEFERRED | `admin_token` permanece en `localStorage`; las mutaciones auditadas usan Bearer. | Sesión mediante cookie `HttpOnly` + `Secure` + `SameSite`, sin token en storage JS y con 401/reautenticación preservados. |

Estas deudas no forman parte del cierre de look & feel. D1 debe tratarse como deuda de seguridad prioritaria y no como mejora cosmética.
