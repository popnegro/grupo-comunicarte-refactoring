# PHASE 1 — P0: separar bootstrap de Neon del runtime serverless

## Estado

**Implementación P0 aplicada en `canonical-candidate`.**

## Cambio principal

El bootstrap de PostgreSQL/Neon (`DDL + limpieza + seed`) ya no se ejecuta dentro del runtime de Vercel.

`src/db/index.ts` detecta el runtime Vercel mediante `VERCEL` y hace `initDatabase()` no-op en serverless. El acceso normal a `pool`/Drizzle continúa disponible para las consultas de negocio.

La responsabilidad de bootstrap queda fuera de las requests de Vercel y continúa disponible para el runtime persistente de Render, preservando la arquitectura:

`Vercel → API serverless`  
`Render → runtime persistente / bootstrap`  
`Neon → PostgreSQL`  
`R2 → multimedia`

## Evidencia de validación

- Commit P0: `d477c06c59fa0fa95711742d1d8713654a1f699e`
- Preview Vercel generado desde `canonical-candidate`.
- Build Vercel completado sin errores; solo permanece el warning no bloqueante de bundle >500 kB.
- `/api/health` respondió HTTP 200 con `database: connected`.
- `/api/supports` respondió HTTP 200 con inventario desde Neon.
- Runtime Vercel, ventana de validación, sin errores/warnings de serverless.
- `main` no fue modificado.

## CI

Se agregó `.github/workflows/ci-candidate.yml` para ejecutar `npm ci`, typecheck, build y tests si existen.

El workflow está ejecutándose sobre el último commit de `canonical-candidate`; queda pendiente la conclusión verde del job.

## Pendientes para cerrar FASE 1

- Obtener CI verde.
- Validar arranque de `canonical-candidate` en Render sin modificar el servicio productivo basado en `main`.
- Mantener observación de Vercel para confirmar ausencia de `API_BOOTSTRAP_FAILED`/deadlocks de bootstrap.

## Regla de release

No hacer merge a `main` hasta que los gates técnicos estén verdes. El merge final continúa siendo **HUMAN GATE**.
