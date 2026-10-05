# Support Editor Refactor — Status

**Branch:** `feat/dashboard-look-and-feel`  
**HEAD:** modular orchestrator landed  
**Date:** 2026-10-05

## Completed

| Item | Path |
|------|------|
| **C1** CI on `feat/**` | `.github/workflows/ci.yml` |
| **A1** types + emptyForm | `support-editor/types.ts` |
| **A1** form utils | `support-editor/formUtils.ts` |
| **A5** field-level `isFormDirty` | `formUtils.ts` |
| **A3** Field / tokens | `support-editor/Field.tsx` |
| **A1** `useSupportForm` | `support-editor/useSupportForm.ts` |
| **A2** GeneralTab | `tabs/GeneralTab.tsx` |
| **A2** LocationTab | `tabs/LocationTab.tsx` |
| **A2** ContentTab | `tabs/ContentTab.tsx` |
| **A2** CommercialTab | `tabs/CommercialTab.tsx` |
| **A4** theme label + card attrs in Content | ContentTab |
| **Orchestrator** | `DashboardSupportProductEditor.tsx` (~240 lines, was ~600) |

## Structure

```
src/pages/dashboard/
  DashboardSupportProductEditor.tsx   # thin shell
  supportEditorThemes.ts              # existing
  support-editor/
    types.ts
    formUtils.ts
    Field.tsx
    useSupportForm.ts
    tabs/
      GeneralTab.tsx
      LocationTab.tsx
      ContentTab.tsx
      CommercialTab.tsx
```

## Next

1. **C2** — CI / `npm run lint` + `npm run build` on this branch (auto via feat/**)
2. **B1** — extract list filters/sort from `DashboardSupportList`
3. **E** — visual pass (density, radios, CTA)
4. **G** — human gate + Preview before promote

## Notes

- No backend contract changes
- Dirty check is field-level (not whole-object JSON.stringify)
- Themes surface label + recommendedCardAttributes in Content tab
