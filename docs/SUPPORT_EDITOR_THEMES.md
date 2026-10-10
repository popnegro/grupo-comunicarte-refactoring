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

La UI de Contenido aplica `isEditorSectionVisible()` e `isEditorFieldVisible()`; no se debe reintroducir una segunda configuración de visibilidad.

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

## Estado de cierre

- A3 Shared UI: **DONE**
- A4 Theme governance: **DONE**
- A8 Save success feedback: **DONE**
- A9 Accessible tabs: **DONE**
- A10 Legacy Connected passthrough: **DONE / eliminado**
- C3 Smoke E2E create → edit → preview → list filter: **DONE**
- C4 Unit tests normalize / payloadFrom / extractCoordsFromUrl: **DONE**
- Visual QA: **PASS** en el último run del commit de cierre PMV.

## Deuda técnica explícita

### A7 — Tipado numérico del formulario

**Estado: DONE.**

Los campos numéricos del estado usan `number | ''`. `normalize()` convierte únicamente valores numéricos finitos y conserva vacío como `''`. `payloadFrom()` transforma explícitamente opcionales vacíos a `null` y aplica cero solo en campos cuyo contrato histórico lo requiere.

Tests cubren valores vacíos, inválidos, conversión y payload.

### D1 — Sesión administrativa

**Estado: DONE.**

El login establece `gc_admin_token` como cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción. El token ya no se devuelve al JavaScript ni se persiste en `localStorage`. `apiFetch()` envía `credentials: include`; el backend acepta la cookie y conserva el manejo `401`/reautenticación.

No se registran tokens ni cabeceras `Authorization` en el flujo de sesión.