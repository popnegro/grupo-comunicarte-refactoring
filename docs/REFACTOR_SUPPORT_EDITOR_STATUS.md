# Support Editor & List Refactor — Status

**Branch:** `feat/dashboard-look-and-feel`  
**Date:** 2026-10-05

## Completed

| Block | Item |
|-------|------|
| A1–A5 | Editor modular (`support-editor/*` + thin orchestrator) |
| B1 | List filters hook + thin page + `SupportListView` |
| C1 | CI on `feat/**` |
| C2 | TS fix StatusBadge/ReservationModal; local lint+build green |
| **E** | Visual density pass on list + editor (tokens, spacing, CTA hierarchy) |

## Visual (E)

- Field tokens: `h-9`, `rounded-lg`, section `p-4`, labels 11px
- Tabs: `mt-3` / `gap-3`, theme meta quiet
- List: denser filter bar + table rows; primary CTA = Nuevo soporte
- Editor: secondary actions quiet; primary = Guardar/Crear

## Next

1. Confirm GH Actions green on HEAD
2. **G** — human gate + Preview responsive
