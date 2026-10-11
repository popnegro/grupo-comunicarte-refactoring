# Support Editor & List Refactor — Status

**Branch:** `pmv-production-refinement`  
**Date:** 2026-10-06

## Completed (engineering)

| Block | Item |
|-------|------|
| A1–A10 | Editor modular (`support-editor/*` + shared UI + theme governance + feedback + legacy cleanup) |
| B1 | List filters hook + thin page + `SupportListView` |
| C1 | CI on `feat/**` |
| C2 | TS APIs fixed; local + GH CI lint/build green |
| E | Visual density (Field tokens, tabs, list, editor shell) |
| **Security** | HttpOnly admin session + numeric field contract + upload logging cleanup |

## G — Human gate

See `docs/HUMAN_GATE_SUPPORTS_REFACTOR.md`.

- Machine: lint/build/unit/smoke/Visual QA must be green on final HEAD.
- Human: final Preview checklist remains the only visual sign-off.

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

Blocked only on final machine checks + human Preview checklist.
