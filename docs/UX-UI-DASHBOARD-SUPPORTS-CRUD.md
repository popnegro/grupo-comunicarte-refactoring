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
- feedback de guardado exitoso.

### Theme governance

`supportEditorThemes.ts` gobierna las secciones y campos técnicos visibles. No se deben reintroducir condicionales de UI basados directamente en `tipo_soporte` cuando exista una regla equivalente en el theme.

### Flujo de aceptación

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