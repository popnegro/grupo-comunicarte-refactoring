# Demo client-preview — guía operativa

## Objetivo
Esta rama está destinada a una demo funcional y estable del producto. No representa todavía el contrato final de producción.

## Flujo comercial
Inventario → selección → Media Kit → contacto.

La selección no debe convertirse en una segunda página de contacto ni abrir formularios anidados. El usuario debe poder seguir agregando soportes y ver siempre cuántos lleva seleccionados.

## Inventario
Para la demo, el contenido debe editarse desde la fuente de datos canónica del proyecto y no desde componentes visuales. No modificar componentes React para cambiar nombre, ubicación, disponibilidad o imagen de un soporte.

Antes de cambiar datos, verificar la fuente de datos utilizada por la rama y mantener los identificadores canónicos.

## Media Kit
- PDF descargable: prioridad de la demo.
- Exportación PowerPoint: requisito posterior.
- Sin integración con Google Drive.
- No implementar todavía firma, aceptación contractual ni lógica legal.
- El Media Kit debe reutilizar los datos de los soportes seleccionados.

## SEO
- Solo el sitio público es indexable.
- Las rutas del Dashboard/backoffice no deben indexarse.
- Las interacciones internas (selección, modals y generación de Media Kit) no son páginas SEO.

## WhatsApp
WhatsApp funciona como canal comercial de rescate en páginas públicas. No debe competir con el funnel dentro de Inventario/Media Kit y no aparece en el Dashboard.

## Infraestructura de demo
Make y Google Drive quedan fuera del alcance de esta demo. Los assets pueden servirse estáticamente desde el repositorio mientras se valida el producto.

## Regla de estabilidad
No migrar Neon, cambiar proveedor ni introducir infraestructura nueva para resolver problemas que no bloqueen la demo. Cualquier cambio de infraestructura se analiza después de la validación del MVP.
