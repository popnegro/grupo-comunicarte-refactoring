# Visual Feedback Implementation

## Scope

- General site background remains light.
- Interior page heroes use the dark visual system.
- Navbar CTA is contextual: Contacto with an empty selection, selection viewer with a count badge when supports are selected.
- Selection remains visible and persistent through sessionStorage.
- `/contacto` is the standard contact destination.
- `/seleccion` is the persistent selection viewer.
- Footer contact navigation points to `/contacto`.
- Cards and Dashboard remain pending final visual tuning until the real inventory data is consolidated from the documentary PDFs.

## Constraints

- `/inventario`, `/login`, and dashboard data contracts are not replaced.
- Public inventory does not expose pricing.
- Commercial pricing remains available for Dashboard/Media Kit.
- `isFeatured` remains governed by the backend maximum of 9.
