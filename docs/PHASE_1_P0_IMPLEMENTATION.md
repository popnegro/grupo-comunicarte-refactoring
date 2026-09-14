# PHASE 1 — P0 CRÍTICOS + FUENTE DE VERDAD

## Estado

**Implementación inicial completada en `feat/visual-system-complete`.**

## Cambios realizados

### P0 — Selección

`src/pages/Seleccion.tsx` ahora consume correctamente el envelope `{ status, data }` de `/api/supports` y valida que `data` sea un array antes de actualizar el estado.

### P0 — Pricing

`src/server/supportsService.ts` incorpora un límite explícito de DTO público: el campo `pricing` se elimina de las respuestas obtenidas por `getAllSupportsFromDB()` y `getSupportByIdFromDB()`.

El pricing administrativo continúa disponible mediante los endpoints protegidos existentes bajo `/api/admin/supports/:id/pricing`.

### Fuente de verdad

`src/pages/Home.tsx` dejó de importar `src/data/inventory.ts` para los soportes destacados y ahora utiliza `useInventory()`, que consume `/api/supports`.

Los destacados de Home se calculan desde los datos reales recibidos por API y se limitan a 9.

## Estado Neon verificado

En la rama de Neon utilizada para la validación:

- Soportes activos: **29**
- Destacados activos: **6**
- Mendoza: **19**
- Buenos Aires: **10**

La regla de máximo 9 destacados continúa teniendo margen operativo.

## Validaciones pendientes

- Build/typecheck del branch.
- Validación runtime de `/api/supports` sin pricing.
- Validación manual de `/seleccion`.
- Validación de Dashboard y endpoints administrativos de pricing.
- Preview Vercel posterior a estos commits.

## Próximo gate

Una vez validados estos puntos, continuar con **FASE 2 — INVENTARIO REAL / NEON** y posteriormente **FASE 3 — SUPPORTCARD / CARDS REALES**.
