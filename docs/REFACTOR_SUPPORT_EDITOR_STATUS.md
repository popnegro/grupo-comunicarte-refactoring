# Support Editor & List Refactor — Status

**Branch:** `feat/dashboard-look-and-feel`  
**Date:** 2026-10-05

## Completed (engineering)

| Block | Item |
|-------|------|
| A1–A5 | Editor modular (`support-editor/*` + thin orchestrator) |
| B1 | List filters hook + thin page + `SupportListView` |
| C1 | CI on `feat/**` |
| C2 | TS APIs fixed; local + GH CI lint/build green |
| E | Visual density (Field tokens, tabs, list, editor shell) |
| **G** | Human gate doc + automated gates verified; **pending human Preview sign-off** |

## G — Human gate

See `docs/HUMAN_GATE_SUPPORTS_REFACTOR.md`.

- Machine: lint/build ✅
- Human: checklist in that doc must be ticked on Preview (desktop + mobile)

## Structure

```
src/hooks/useSupportListFilters.ts
src/pages/dashboard/
  DashboardSupportList.tsx
  SupportListView.tsx
  DashboardSupportProductEditor.tsx
  DashboardSupportPreview.tsx
  support-editor/
    types.ts / formUtils.ts / Field.tsx / useSupportForm.ts
    tabs/GeneralTab|LocationTab|ContentTab|CommercialTab
```

## Promote

Blocked only on human Preview checklist + CI green on final HEAD.
