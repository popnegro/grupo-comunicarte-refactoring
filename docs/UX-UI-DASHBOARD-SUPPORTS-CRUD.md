# UX/UI — Dashboard Gestión de Soportes

## Framework

- `/dashboard/soportes` = catálogo/listado administrativo.
- `/dashboard/soportes/new` = alta de producto.
- `/dashboard/soportes/:canonicalId/edit` = edición de producto.
- `/dashboard/soportes/advanced` conserva la herramienta administrativa anterior para capacidades avanzadas no reinterpretadas.

## Reglas

- Acción principal visible: Editar.
- Nuevo soporte es el CTA principal del listado.
- Disponibilidad permanece editable y visible.
- Archivado conserva confirmación.
- Búsqueda y filtros deben soportar inventario creciente.
- Add/Edit conservan los campos existentes necesarios para alimentar el inventario público.
- No se modifica el contrato backend.
