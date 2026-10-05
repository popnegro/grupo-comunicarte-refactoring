# Support Editor & List Refactor — Status

**Branch:** `feat/dashboard-look-and-feel`  
**Date:** 2026-10-05

## Completed

### Editor (A1–A5, C1)

| Item | Path |
|------|------|
| CI on `feat/**` | `.github/workflows/ci.yml` |
| types + formUtils + isFormDirty | `support-editor/` |
| useSupportForm | `support-editor/useSupportForm.ts` |
| Field tokens | `support-editor/Field.tsx` |
| Tabs ×4 | `support-editor/tabs/*` |
| Thin orchestrator | `DashboardSupportProductEditor.tsx` |

### List (B1)

| Item | Path |
|------|------|
| Filter/sort hook | `src/hooks/useSupportListFilters.ts` |
| Thin list page | `DashboardSupportList.tsx` |
| Presentation view | `SupportListView.tsx` |

## Structure

```
src/hooks/useSupportListFilters.ts
src/pages/dashboard/
  DashboardSupportList.tsx      # load, archive, duplicate, wire filters
  SupportListView.tsx           # filters UI, table, cards, modals
  DashboardSupportProductEditor.tsx
  support-editor/
    types.ts / formUtils.ts / Field.tsx / useSupportForm.ts
    tabs/GeneralTab|LocationTab|ContentTab|CommercialTab
```

## Next

1. **C2** — confirm CI lint/build green
2. **E** — visual density pass
3. **G** — Preview + human gate
