# Support Editor Refactor — Status

**Branch:** `feat/dashboard-look-and-feel`  
**Date:** 2026-10-05

## Completed (on branch)

| Item | Path |
|------|------|
| C1 CI on `feat/**` | `.github/workflows/ci.yml` |
| A1 types + emptyForm | `src/pages/dashboard/support-editor/types.ts` |
| A3 Field / tokens | `src/pages/dashboard/support-editor/Field.tsx` |
| A1/A5 formUtils + `isFormDirty` | `src/pages/dashboard/support-editor/formUtils.ts` |
| A2 GeneralTab | `src/pages/dashboard/support-editor/tabs/GeneralTab.tsx` |
| A2 CommercialTab | `src/pages/dashboard/support-editor/tabs/CommercialTab.tsx` |

## Pending (modules ready, not yet swapped)

| Item | Notes |
|------|-------|
| LocationTab | Coord helper + Maps URL |
| ContentTab | MultimediaUploadZone + type-specific fields + theme label |
| useSupportForm | Load/save/dirty/preview orchestration |
| DashboardSupportProductEditor | Thin orchestrator (~240 lines) |

Until the orchestrator is swapped, the **monolithic editor remains the runtime source of truth** (branch stays green).

## Design decisions

- Dirty check is **field-level** (`isFormDirty`), not whole-object `JSON.stringify`
- Themes surface `label` + `recommendedCardAttributes` in Content tab (A4 partial)
- Tabs are presentational; all side-effects live in `useSupportForm`
- No backend contract changes

## Next

1. Push LocationTab + ContentTab + useSupportForm + orchestrator
2. C2: `npm run lint` + `npm run build`
3. B1 list filters extraction
4. E visual + G merge gate
