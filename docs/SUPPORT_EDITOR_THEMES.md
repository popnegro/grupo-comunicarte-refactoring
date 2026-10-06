# Support Editor Themes

## Estado post-refactor

`Nuevo soporte` y `Editar soporte` utilizan un único editor componentizado con cuatro tabs:
1. Información
2. Ubicación
3. Contenido
4. Comercial

La configuración de theme en `src/pages/dashboard/supportEditorThemes.ts` es la fuente de verdad para secciones y campos técnicos visibles. El contrato de API/persistencia permanece compartido.

### Themes

- `theme_tradicionales`
- `theme_led`
- `theme_led_movil`

Cada theme define:
- `sections`: bloques habilitados del editor.
- `hiddenFields`: campos técnicos que no debe ver el operador.
- `recommendedCardAttributes`: atributos canónicos de la Product Card.

## Contrato de atributos públicos

- Tradicional: **Medidas · Caras · Impactos / mes**
- LED: **Medidas · Resolución · Impactos / mes**
- LED Móvil: **Duración · Spot · Impactos / mes**

`Impactos / mes` continúa siendo dato editorial/manual.

## Reglas UX

1. El operador ve primero información necesaria para publicar.
2. Los datos técnicos se agrupan dentro de Contenido.
3. Preview reutiliza la Product Card real.
4. El editor no requiere edición de JSON de rutas.
5. La disponibilidad no se mezcla con `active`.
6. `active` representa publicación.
7. El preview del editor es único y sticky en desktop.
8. Las tabs mantienen navegación accesible con teclado.

## Arquitectura

```text
DashboardSupportProductEditor
├── useSupportForm
├── Información
├── Ubicación
├── Contenido
├── Comercial
└── Preview único
```

La lógica de normalización, dirty-check y payload vive en `support-editor/formUtils.ts`; la configuración visual vive en `supportEditorThemes.ts`.

## Deuda técnica explícita

### A7 — Tipado numérico del formulario

**Estado:** DEFERRED / no bloqueante para el PMV actual.

El estado de edición mantiene actualmente los valores numéricos como `string` para facilitar la edición de inputs HTML. `payloadFrom()` los transforma al contrato de persistencia.

**Riesgo:** errores de conversión o validación pueden permanecer ocultos en el estado del formulario y aparecer al construir el payload.

**Criterio de cierre:** migrar los campos numéricos a `number | ''`, o introducir Zod para validar/transformar explícitamente todos los campos numéricos; mantener `''` para opcionales y añadir pruebas de vacío, límites y valores inválidos. `Number(...)` dentro de `payloadFrom()` por sí solo no cierra A7.

### D1 — Token administrativo en localStorage

**Estado:** DEFERRED / deuda de seguridad prioritaria.

El dashboard obtiene `admin_token` desde `localStorage` y las mutaciones auditadas lo envían mediante `Authorization: Bearer`.

**Riesgo:** un token accesible desde JavaScript puede ser extraído por código ejecutado en el contexto de la aplicación, por ejemplo ante XSS o una dependencia comprometida.

**Criterio de cierre:** migrar la sesión administrativa a cookie `HttpOnly`, `Secure` y `SameSite` apropiados; eliminar la dependencia de `localStorage.admin_token`; preservar `401`/reautenticación; verificar todas las mutaciones protegidas; no registrar tokens ni cabeceras `Authorization`.

**Decisión PMV:** no mezclar esta migración de seguridad transversal con el cierre visual del PMV.