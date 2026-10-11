# Multimedia canónica por soporte

Cada carpeta debe utilizar el `canonical_id` exacto del inventario:

```text
images/
├── <canonical_id>/
│   ├── cover.<ext>
│   ├── cara-norte.<ext>
│   ├── cara-sur.<ext>
│   └── ...
```

Reglas:

- No inventar `canonical_id`.
- `cover` representa la imagen principal del soporte.
- Las caras deben conservar su orientación cuando pueda determinarse.
- Las imágenes adicionales se mantienen como galería.
- La relación formal se registra también en `docs/inventario/manifest/media.json`.
- No almacenar secretos ni URLs privadas en esta estructura.
