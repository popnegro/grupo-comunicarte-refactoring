# Regla UX/UI — Período de reserva de soportes

## Modelo PMV

La disponibilidad comercial continúa siendo manual y binaria para el usuario final:

- DISPONIBLE → puede seleccionarse.
- RESERVADO → puede consultarse.

Cuando un soporte está reservado, el período de ocupación debe quedar documentado con dos fechas explícitas:

- Desde
- Hasta

## Regla de presentación pública

En las Product Cards y en el detalle de inventario, un soporte reservado muestra:

**Reservado desde DD/MM a DD/MM**

No se muestra el año porque el horizonte comercial del PMV es corto.

## Regla operativa

El período no constituye todavía un calendario automático ni calcula disponibilidad.

El dato documenta la reserva actual y permite al usuario conocer cuándo se libera el soporte.

## Contratación

Las modalidades comerciales son:

- 7 días
- 15 días
- 21 días
- mensual

El período efectivo (`Desde` / `Hasta`) es la referencia operativa; la modalidad describe el producto contratado.

## Evolución futura

La automatización futura podrá usar estos mismos datos para calcular conflictos, disponibilidad, reservas y recambios. Esa automatización queda fuera del PMV actual.
