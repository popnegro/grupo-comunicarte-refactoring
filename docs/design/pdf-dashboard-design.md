# Grupo Comunicarte — referencia visual del PDF

## Decisiones derivadas del documento adjunto

- **Marco de aplicación:** navegación lateral persistente, encabezado superior con saludo/usuario y área de trabajo principal sobre fondo gris muy claro.
- **Jerarquía:** título de página y descripción breve; acciones principales alineadas arriba a la derecha; filtros y vistas inmediatamente antes del listado.
- **Inventario y solicitudes:** tabla densa, con encabezado gris suave, separadores discretos, IDs visibles, estado como badge y acciones por fila. En pantallas estrechas la tabla conserva lectura mediante desplazamiento horizontal, sin comprimir columnas críticas.
- **Panel de detalle:** drawer lateral derecho con cierre visible y pestañas por contexto (Información, Materiales, Historial en solicitudes; Información, Ubicación, Multimedia en soportes). En móvil ocupa el ancho disponible.
- **Color:** superficies blancas, fondo de aplicación gris frío, texto azul/gris de bajo contraste decorativo y azul como acción primaria. Estados mantienen semántica propia (pendiente, revisión, aprobada/rechazada); no se comunica estado únicamente con color.
- **Densidad:** tipografía compacta para tablas, títulos claros y controles con áreas de interacción accesibles.

## Funcionalidades PMV que se conservan

- Sesión administrativa y navegación a inventario/solicitudes.
- Solicitudes conectadas a `/api/admin/requests`, búsqueda y filtros por estado.
- Drawer de solicitud con cliente, correo, teléfono, empresa y mensaje.
- Cotización con monto global y moneda, fechas/duración de propuesta, selección de soportes y tarifas internas solo para referencia administrativa.
- Persistencia del Media Kit, preparación de entrega, exportación PDF/PPTX y confirmación explícita de envío.
- Protección de tarifas internas: los exports de cliente no incluyen precios individuales internos.
- Inventario conectado al backend, mapa/lista, edición de soporte y campos de ubicación/multimedia existentes.

## Límites de fidelidad

El PDF es una referencia estática de seis páginas, no un contrato de API ni una especificación de comportamiento. Los nombres de campaña, clientes, códigos y cifras que aparecen son datos ilustrativos; la implementación usa los datos reales del PMV y no introduce esos ejemplos como registros persistentes. La tabla actual presenta el dato de campaña/empresa y etiqueta el kit según los soportes de la solicitud porque la API de solicitudes no expone un nombre de campaña separado.
