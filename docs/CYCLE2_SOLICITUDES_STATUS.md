# Cycle 2 — Solicitudes / Media Kit workflow

**Branch:** `feat/dashboard-cycle-2-solicitudes` (from `pmv-production-refinement`)  
**Date:** 2026-10-05

## Scope

| ID | Item | Status |
|----|------|--------|
| B2 | Extract `useMediaKitLeadFilters` (search + status + counts + visible) | ✅ |
| E2 | Density pass on solicitudes list chrome (header, chips, search, rows) | ✅ |
| C3 | lint/build on branch | pending CI |
| G2 | Human gate checklist | see `HUMAN_GATE_CYCLE2_SOLICITUDES.md` |

## Files

- `src/hooks/useMediaKitLeadFilters.ts` (new)
- `src/pages/dashboard/DashboardMediaKitWorkflow.tsx` (wired + denser UI)

## Out of scope

- Media Kit builder (`/dashboard/mediakits/nuevo`) full redesign
- Backend / export PDF-PPT logic changes
