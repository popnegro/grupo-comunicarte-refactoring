# AUDITORÍA DE PRODUCTO: PROCESO DE SELECCIÓN DE SOPORTES Y MEDIA KIT
**Grupo Comunicarte PMV**

---

## 1. Executive Summary
El flujo actual de selección de soportes permite a un usuario explorar el inventario a través de un mapa interactivo, filtrar por parámetros clave, seleccionar ubicaciones y completar un formulario de solicitud de Media Kit. 
Sin embargo, el proceso opera como un prototipo aislado (*mock*): el estado de la selección es efímero (se pierde al recargar), no existe un backend que reciba la solicitud, y el Media Kit resultante es un mensaje de éxito local sin generación de entregables (PDF/Enlace) ni captura real del Lead.
Visualmente es consistente con el estándar B2B requerido, pero funcional y comercialmente requiere conectar el tramo final del "funnel" para considerarse un PMV viable.

---

## 2. Estado actual del flujo
* **Frontend:** React + Tailwind + Leaflet. Funcional y visualmente maduro.
* **Persistencia:** Ninguna. `SelectionContext` vive exclusivamente en la memoria de la sesión actual de React.
* **Datos:** Proveídos estáticamente desde `src/data/inventory.ts`.
* **Componentes Core:** `Inventario.tsx`, `InventoryMap.tsx`, `MapFilterPanel.tsx`, `LocationDetail.tsx`, `MediakitPanel.tsx`.
* **Faltantes Críticos:** Conexión Backend, Generación de entregable, Persistencia de Estado, Accesibilidad de la selección en la UI móvil.

---

## 3. Journey actual
*   **Pantalla:** Inventario (Mapa + Panel de Filtros)
    *   *Acción:* Clic en un Pin del mapa.
    *   *Estado:* `LOADED`
*   **Pantalla:** Detalle del Soporte (`LocationDetail`)
    *   *Acción:* Clic en "Seleccionar" (Activa `toggleSelect`).
    *   *Estado:* `SELECTED` (Guardado en memoria RAM vía `SelectionContext`).
*   **Pantalla:** Inventario
    *   *Acción:* Clic en botón "Mediakit (N)" dentro de `MapFilterPanel`.
*   **Pantalla:** Panel Media Kit (`MediakitPanel`)
    *   *Acción:* Revisar lista de soportes (con opción de borrar) y llenar formulario.
    *   *Acción:* Clic en "Solicitar Mediakit".
    *   *API:* (Inexistente).
*   **Pantalla:** Resultado Local
    *   *Estado:* `SUCCESS` (`submitted = true`). Mensaje local de confirmación.

---

## 4. Journey recomendado
Para el PMV real, el flujo debe ser:
1. **Descubrir & Filtrar**: Mapa interactivo (Mantener actual).
2. **Explorar & Seleccionar**: Detalle del soporte. (Mantener actual).
3. **Persistencia (Background)**: Cada vez que se selecciona un soporte, se guarda en `sessionStorage` para evitar pérdida de datos si el usuario refresca la página.
4. **Visibilidad de Selección**: Un **Sticky Selection Bar** o **Floating Action Button (FAB)** global en la parte inferior/superior que indique "(3) Soportes seleccionados - Ver Media Kit", independientemente de si el panel de filtros está abierto o cerrado.
5. **Revisar & Configurar**: Formulario de captura de Lead (Mantener actual, pero conectarlo).
6. **Generar (API)**: Envío de payload al backend -> *Procesamiento* -> Respuesta 200 OK.
7. **Resultado**: Pantalla/Modal de éxito que confirme que el ejecutivo de ventas recibió la solicitud, o que provea un enlace directo para descargar el Media Kit en PDF generado automáticamente (Ideal para P1).

---

## 5. Matriz de Fricción

| Paso | Problema | Impacto | Severidad | Solución |
| :--- | :--- | :--- | :--- | :--- |
| **Descubrimiento** | Filtros no se guardan en la URL. | Si el usuario refresca, pierde su búsqueda. | **P1** | Sincronizar filtros (`query`, `plaza`, `availability`) con Query Params (`?plaza=mendoza`). |
| **Filtros** | El botón de "Mediakit" está anidado en el panel de filtros. | En móvil, el usuario debe abrir el panel de filtros para ir al carrito. Fricción alta. | **P0** | Extraer el botón de Media Kit a un FAB global o un Sticky Header/Footer. |
| **Exploración** | El panel de detalle ocupa mucho espacio en móvil sobre el mapa. | Pérdida de contexto espacial. | **P2** | Ajustar Bottom Sheet para que permita ver parcialmente el mapa o colapsar. |
| **Selección** | Estado en memoria (RAM). | F5 / Refresh elimina el carrito completo. Alta frustración. | **P0** | Sincronizar `SelectionContext` con `sessionStorage`. |
| **Revisión** | Formulario solicita muchos datos para alguien que solo está explorando. | Alta tasa de rebote en el formulario. | **P1** | Minimizar campos obligatorios (Solo Email y Nombre para el PMV). |
| **Generación** | **Dead End**. No hay llamada a API, no se guarda el Lead. | El negocio no se entera de que un cliente solicitó un Media Kit. | **P0** | Conectar `handleSubmit` a un endpoint `POST /api/leads`. |
| **Resultado** | Confirmación efímera. No entrega valor tangible al momento. | El usuario siente que no obtuvo el "Media Kit" prometido. | **P1** | Enviar un email automatizado al usuario con el resumen, o generar el PDF al vuelo. |

---

## 6. P0 — PMV (Imprescindible para Demo Real)
1. **API de Captura de Lead:** Endpoint backend para recibir los datos del `MediakitPanel` y los IDs seleccionados.
2. **Persistencia Local:** `sessionStorage` para el `SelectionContext`.
3. **Visibilidad de Selección:** Un acceso directo global al "Carrito/Media Kit" que no dependa de tener abierto el panel de filtros.
4. **Restricción de Reservados:** Mantener la lógica existente que impide añadir al Media Kit soportes con estado "reservado".

---

## 7. P1 — Post-PMV (Importante)
1. **Generación Real del Documento:** Motor de backend que componga un archivo PDF con fotos, mapa y tabla de características de los soportes seleccionados y devuelva el link de descarga.
2. **Filtros en URL:** Sincronización de los parámetros de búsqueda con React Router.
3. **Múltiples Media Kits (Drafts):** Posibilidad de guardar distintas selecciones si el usuario hace Login.

---

## 8. P2 — Futuro (Mejora Evolutiva)
1. Integración con CRM (Salesforce / HubSpot) en tiempo real.
2. Cotizador dinámico estimado según duración de la campaña.
3. Disponibilidad en tiempo real (bloqueo concurrente si alguien reserva un soporte).

---

## 9. Arquitectura funcional recomendada
*   **State Management:** Extender `SelectionContext` para usar un custom hook `useSessionStorage<Set<string>>('pmv_selection')`.
*   **UI Routing:** El `MediakitPanel` puede seguir siendo un Overlay global sobre la ruta `/inventario`, pero su estado abierto/cerrado debería reflejarse en la URL (ej. `?mediakit=open`) para manejar correctamente el botón "Atrás" del navegador móvil.
*   **Servicio API:** Crear `src/services/mediakit.service.ts` con una función `requestMediaKit(payload)` que maneje la promesa (Promise), permitiendo gestionar los estados `LOADING`, `SUCCESS` y `ERROR`.

---

## 10. Roadmap de implementación
**FASE 1 — PMV DEMO (Backend & UX Core)**
* Refactor: Modificar `SelectionContext` para persistir en `sessionStorage`.
* UX: Crear componente `StickySelectionBar` visible cuando `selectedCount > 0`.
* API: Implementar `POST /api/mediakit` (o integración con Base de datos / Servicio de Email como Resend).
* UI: Actualizar `MediakitPanel` para manejar la carga asíncrona (spinner) y errores de red.

**FASE 2 — MEJORA COMERCIAL (Generación & Compartición)**
* Backend: Implementar motor de renderizado PDF (Puppeteer / react-pdf).
* Frontend: Añadir botón "Descargar Media Kit" en la pantalla de éxito.
* Frontend: Refactorizar filtros para que usen Query Params.

---

## 11. Estados UX
*   **EMPTY**: Mapa interactivo normal. Panel "Media Kit" deshabilitado u oculto.
*   **SELECTED (PARTIAL)**: FAB/Sticky bar aparece indicando "(N) Soportes Seleccionados".
*   **REVISIÓN**: `MediakitPanel` abierto. Muestra lista de soportes. Formulario vacío.
*   **LOADING**: Usuario hace submit. Input y botones bloqueados. Botón muestra spinner/loading. *Crucial para evitar múltiples submits accidentales*.
*   **SUCCESS**: Formulario desaparece. Checkmark verde. Feedback: "Hemos recibido tu solicitud. Nuestro equipo te contactará en breve." (O botón de descarga si se implementa PDF).
*   **ERROR**: Feedback en rojo cerca del botón submit: "Hubo un problema de conexión. Por favor, intenta nuevamente."

---

## 12. API / Backend gaps
*   **MISSING**: `POST /api/leads` o `POST /api/mediakit/request`.
*   **MISSING**: Endpoint para sincronizar el estado real del inventario `GET /api/inventory` (para reemplazar `fixedLocations`).

---

## 13. Frontend gaps
*   Manejo de errores de red en la subida del formulario (actualmente es síncrono falso).
*   Visibilidad del acceso al Media Kit en Mobile (atrapado en el panel de filtros).
*   Inconsistencia del botón de "Atrás" en el navegador cuando los modales están abiertos.

---

## 14. QA Test Plan
*   **TC01 - Persistencia:** Seleccionar 2 soportes, presionar F5. Los soportes deben seguir seleccionados.
*   **TC02 - Restricción de Estado:** Localizar un soporte reservado, verificar que el botón "Seleccionar" está bloqueado u oculto.
*   **TC03 - Deselección:** Añadir un soporte desde el mapa, ir al panel de Media Kit, eliminar el soporte con la [X]. Verificar que el pin en el mapa pierde su estado activo.
*   **TC04 - Flujo de Envío (Happy Path):** Seleccionar, llenar form, enviar. Verificar estado `LOADING` y posterior `SUCCESS`.
*   **TC05 - Manejo de Error:** Bloquear red (DevTools Offline), enviar formulario. Verificar que el sistema no se cuelga y muestra mensaje de `ERROR` permitiendo reintentar.

---

## 15. Definition of Done
- [x] Usuario puede entrar al inventario *(Cumplido)*
- [x] Puede identificar plazas *(Cumplido)*
- [x] Puede filtrar soportes *(Cumplido)*
- [x] Puede visualizar información del soporte *(Cumplido)*
- [x] Puede seleccionar uno o varios *(Cumplido, pero en RAM)*
- [x] Puede visualizar su selección *(Cumplido, en MediakitPanel)*
- [x] Puede modificar su selección *(Cumplido)*
- [ ] Puede iniciar generación de Media Kit *(Parcial, es un mock)*
- [ ] Puede visualizar resultado *(Parcial, es mock local)*
- [ ] Puede descargar/continuar con el resultado *(Falta)*
- [x] No existen estados muertos *(Cumplido, aunque el final es un dead end de negocio)*
- [x] No existen botones falsos *(Botón Media kit es falso actualmente respecto al backend)*
- [x] No existen alert() como mecanismo UX *(Cumplido)*
- [x] El flujo funciona en Desktop *(Cumplido)*
- [x] El flujo funciona en Mobile *(Requiere mejora de accesibilidad del botón en P0)*
- [x] El lenguaje visual es consistente *(Cumplido, coincide con la referencia)*

---

## 16. Recomendación final
El producto frontend actual es un excelente "Smoke and Mirrors" que valida la experiencia de usuario y el lenguaje visual B2B (limpio, profesional, responsivo).
La prioridad **ABSOLUTA (P0)** antes de lanzar el PMV al mercado no es refinar el frontend o añadir nuevos filtros, sino **conectar el embudo a una base de datos real o un servicio de notificaciones**. 
El flujo actual conduce al usuario a un callejón sin salida (Dead End) comercial donde sus selecciones se pierden y su solicitud no llega a la empresa. 
**Paso a seguir:** Implementar un backend básico (Serverless, Firebase o API ruta directa) para capturar el payload del Media Kit, y un Sticky Bar en el frontend para asegurar que el usuario nunca pierda de vista el carrito.
