# UX/UI AUDIT — Grupo Comunicarte

## Scope
Auditoría de lenguaje visual, navegación, responsive, accesibilidad, flujo de inventario y conversión.

## Baseline
- Layout global consistente: header sticky, navegación principal y footer compartidos.
- `/inventario` concentra la interacción principal: mapa, filtros, detalle, selección y Media Kit.
- Selection Bar persistente durante la selección, pero no invasiva.
- Footer compacto aplicado sin eliminar contenido.

## P1 — Implementado
1. Selection Bar conserva el estado de selección durante la exploración, con capa exterior no interactiva para no bloquear el mapa.
2. En mobile la barra usa márgenes laterales y ancho contenido, reduciendo la superficie visual ocupada.
3. La cantidad seleccionada tiene `aria-live` para comunicar cambios a tecnologías asistivas.
4. Media Kit mantiene el contexto de cantidad y selección al abrirse.
5. El panel Media Kit recibe foco al abrirse y permite cierre con Escape.
6. La jerarquía de overlays queda preservada: filtros móviles y Media Kit permanecen por encima de Selection Bar.

## P2 — Implementado
1. CTA de Media Kit conserva lenguaje consistente entre Selection Bar y panel.
2. El usuario puede quitar elementos individualmente o seguir seleccionando sin perder contexto.
3. Los controles principales incorporan foco visible.
4. La selección comunica cantidad en los puntos principales de interacción.
5. Se mantienen patrones visuales existentes: tipografía, radios, sombras, paleta y componentes reutilizables.

## P2 — Accesibilidad
- Foco inicial en el control de cierre del diálogo Media Kit.
- Escape cierra el diálogo.
- Botones de eliminación tienen targets mínimos de 44 px en el panel.
- Estados de selección y cantidad se comunican con `aria-live`.
- Iconos decorativos principales llevan `aria-hidden`.

## Validación
Pendiente validación final de build/deployment y prueba visual/E2E.

## Criterio de aceptación UX
La experiencia debe permitir: explorar inventario → filtrar → abrir detalle → seleccionar → continuar explorando → abrir Media Kit, sin perder contexto, sin controles bloqueados y sin elementos superpuestos de forma accidental.

## Estado
P1/P2 implementados de forma incremental. Código preparado para validación de calidad y deployment.