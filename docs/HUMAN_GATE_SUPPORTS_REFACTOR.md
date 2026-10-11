# Human Gate — Supports List/Editor Refactor

**Branch:** `feat/dashboard-look-and-feel`  
**Scope:** modularización editor + list filters + pasada visual de densidad  
**Date:** 2026-10-05

## Automated gates (machine)

| Check | Status |
|-------|--------|
| `npm run lint` (`tsc --noEmit`) | ✅ green on HEAD |
| `npm run build` (vite + server) | ✅ green on HEAD |
| CI on `feat/**` | ✅ success on recent commits (e.g. `7a6efb0`); confirm latest SHA |
| Backend contract changes | ✅ none |

## Routes under gate

| Route | Purpose |
|-------|---------|
| `/dashboard/soportes` | List + filters + Nuevo / Editar |
| `/dashboard/soportes/new` | Create product editor |
| `/dashboard/soportes/:id/edit` | Edit product editor |
| `/dashboard/soportes/:id/preview` | Publication preview |

## Human checklist (must pass before promote)

### List (`/dashboard/soportes`)

- [ ] Search filters by name / code / address
- [ ] Plaza, formato, disponibilidad, activo/archivado work
- [ ] Sort columns (name, plaza, disponibilidad, price)
- [ ] **Nuevo soporte** is the clear primary CTA
- [ ] **Editar** per row is obvious; secondary menu (reserva / preview / duplicar / archivar) works
- [ ] Mobile cards: readable, Edit reachable, no horizontal overflow
- [ ] Archive confirm dialog works

### Editor (`/new` and `/:id/edit`)

- [ ] Tabs: Información / Ubicación / Contenido / Comercial switch + keyboard arrows
- [ ] Dirty indicator + beforeunload / internal nav confirm when leaving with changes
- [ ] **Guardar cambios / Crear soporte** is the only primary CTA
- [ ] Preview / Cancelar stay secondary
- [ ] Live preview card updates (name, media, pricing facts)
- [ ] Coord helper extracts lat/lng from Maps URL
- [ ] Type-specific fields: tradicional / led / led_movil
- [ ] Mobile: sticky preview FAB scrolls to card; inputs usable (≥44px targets where required)

### Preview (`/:id/preview`)

- [ ] Card matches editor preview representation
- [ ] Publication checks (active, image, attributes, location) readable
- [ ] **Editar soporte** and **Ver en inventario** work

### Visual density (principle)

- [ ] No competing ornamental CTAs
- [ ] Filter/table density feels scannable (not sparse)
- [ ] Editor sections denser than pre-refactor monolith without cramped controls

## Promote rule

Do **not** merge to `main` until:

1. Latest CI run on branch HEAD is **success**
2. All human checklist boxes above are checked on a real Preview deploy (desktop + mobile width)
3. No regressions vs production data load/save for one traditional + one LED support

## Out of scope (not blocking this gate)

- `/dashboard/solicitudes` visual pass
- `/dashboard/mediakits` visual pass
- Advanced admin tool at `/dashboard/soportes/advanced`
