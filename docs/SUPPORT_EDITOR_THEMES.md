# Support Editor Themes

## Objetivo

Organizar `Nuevo soporte` y `Editar soporte` como un único editor con tres configuraciones UX, evitando duplicar componentes o lógica de persistencia.

- `theme_tradicionales`
- `theme_led`
- `theme_led_movil`

Los themes cambian qué información se solicita y cómo se presenta. No cambian el contrato backend.

## Campos comunes

Los tres themes comparten:

1. Producto
   - nombre
   - plaza
   - tipo
   - destacado
2. Publicación
   - publicado / archivado
   - descripción
   - características
   - imagen principal y media
3. Ubicación
   - dirección
   - latitud
   - longitud
   - referencia de mapa
4. Comercial
   - pricing
   - moneda
   - impuestos
5. Previsualización
   - Product Card real

### Disponibilidad

`Disponible` y `Reservado` son estados comerciales de consulta, pero no constituyen un calendario automático en el PMV actual.

La contratación registra una fecha de inicio y una modalidad:

- 7 días
- 15 días
- 21 días
- mensual

La automatización de calendarios, reservas y conflictos queda fuera del modelo actual y se considera requisito futuro.

## theme_tradicionales

Orientado a soportes físicos.

### Datos específicos

- medidas
- resumen técnico
- requisitos
- días de operación cuando aplique

### No mostrar en alta normal

- resolución digital
- modo de video
- duración del spot
- salidas mínimas
- máximo de anunciantes
- duración de recorrido
- ruta / waypoints

### Atributos Card recomendados

1. Medidas
2. Resumen técnico

## theme_led

Orientado a soportes digitales fijos.

### Datos específicos

- medidas
- resolución
- frecuencia diaria
- horario de encendido
- modo de video
- duración del spot
- requisitos técnicos

### No mostrar en alta normal

- ruta
- waypoints
- route path
- parámetros de circulación

### Atributos Card recomendados

1. Resolución
2. Frecuencia diaria

## theme_led_movil

Orientado a soportes digitales móviles.

### Datos específicos de exhibición

- medidas
- resolución
- frecuencia
- modo de video
- duración del spot
- salidas mínimas
- máximo de anunciantes

### Datos específicos de operación

- nombre de ruta
- modalidad de ruta
- horario
- duración
- días
- waypoints
- route path

### Atributos Card recomendados

1. Duración del spot
2. Salidas mínimas

## Reglas UX

1. El operador debe ver primero información que termina en la publicación.
2. Los datos técnicos secundarios se agrupan después.
3. La Product Card de preview reutiliza el componente público real.
4. El administrador no debe editar JSON de rutas como flujo principal.
5. Los datos de la Card deben tener valores recomendados por theme y poder evolucionar a selección explícita.
6. `active` representa publicación; no debe mezclarse con disponibilidad.
7. La disponibilidad automática por calendario no se implementa en esta fase.

## Arquitectura

```text
SupportEditor
├── Common fields
├── Theme configuration
│   ├── theme_tradicionales
│   ├── theme_led
│   └── theme_led_movil
├── Theme-specific fields
└── Product Card preview
```

La configuración vive en `src/pages/dashboard/supportEditorThemes.ts`.
