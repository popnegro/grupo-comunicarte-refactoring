from pathlib import Path
import re

p = Path('src/data/inventory.ts')
s = p.read_text()

items = {
'mza-trad-01': ('Columna Acc. Sur casi R. Peña', 'Acc. Sur casi R. Peña', 'La posición se encuentra en un punto muy neurálgico como lo es la intersección de Acceso Sur con el Carril Rodríguez Peña. Capta el tránsito hacia la ciudad de Mendoza desde Maipú o Luján y los alrededores de Guaymallén y Godoy Cruz.', 'Monocolumna 13x7m, 2 caras, Lona Front', 'https://maps.app.goo.gl/hoXBQT7xCbpXhvxW8'),
'mza-trad-02': ('Top Site Panamericana frente a Wallmart, antes de Rotonda', 'Ruta Panamericana frente a Wallmart, antes de Rotonda', 'Excelente posición sobre Ruta Panamericana, próxima a Palmares Open Mall, Barrio Palmares y zona de influencia Chacras de Coria y La Puntilla.', 'Monocolumna 4x5m, 1 cara, Lona Front', 'https://maps.app.goo.gl/vbfCoMkXL7M16pMj6'),
'mza-trad-03': ('Columna Corredor del Oeste casi Palmares Valley', 'Corredor del Oeste casi Palmares Valley', 'Excelente posición en una zona de gran crecimiento urbanístico y comercial, con visibilidad superior a 200 metros y cercanía a Palmares y Palmares Valley.', 'Monocolumna 12x7m, 2 caras, Lona Front', 'https://maps.app.goo.gl/aykdux5KmGktw6G36'),
'mza-trad-04': ('Columna Carril Nacional y Tirasso', 'Carril Nacional y Tirasso', 'Punto estratégico de Guaymallén, con gran desarrollo residencial y comercial y excelente choque visual.', 'Monocolumna 8x5m, 2 caras, Lona Front', 'https://maps.app.goo.gl/x3LtEodMDbSZB7z49'),
'mza-trad-05': ('Columna Acc. Norte - Aeropuerto', 'Acceso Norte - Aeropuerto El Plumerillo', 'Punto estratégico próximo al Aeropuerto Internacional El Plumerillo, sobre Ruta 40/Autopista Mendoza-San Juan, con excelente visibilidad.', 'Monocolumna 10x6m, 2 caras, Lona Front', 'https://maps.app.goo.gl/nXgWqWuXrY3AeUqh8'),
'mza-trad-06': ('Top Site Salida Aeropuerto hacia Ciudad – Acceso Norte', 'Salida Aeropuerto hacia Ciudad – Acceso Norte', 'Posición estratégica a la salida del Aeropuerto Internacional El Plumerillo, captando tránsito hacia la Ciudad y desde San Juan.', 'Monocolumna 3,3x4,5m, 1 cara, Vinilo', 'https://maps.app.goo.gl/5sih7TgpQCL8pkES8'),
'mza-trad-07': ('Top Site llegando a Aeropuerto – Acceso Norte', 'Llegando a Aeropuerto – Acceso Norte', 'Posición estratégica próxima al Aeropuerto Internacional El Plumerillo, captando tránsito desde la ciudad hacia el aeropuerto y hacia San Juan.', 'Monocolumna 3,3x4,5m, 1 cara, Vinilo', 'https://maps.app.goo.gl/5sih7TgpQCL8pkES8'),
'mza-trad-08': ('Columna San Martín Sur y Panamericana', 'San Martín Sur y Panamericana – Godoy Cruz', 'Punto estratégico de Godoy Cruz sobre San Martín Sur/Panamericana, con tránsito vehicular, puente peatonal y ciclovía próximos a Palmares y Walmart.', 'Monocolumna 6x7m, 2 caras, Lona Front', 'https://maps.app.goo.gl/TDo3iZyJykrSfZyMA'),
'mza-trad-09': ('Columna Acc. Este y Acc. Sur', 'Acceso Este y Acceso Sur', 'Punto estratégico donde se unen las principales vías de acceso y egreso a la Ciudad de Mendoza, con visión panorámica desde diversos ángulos.', 'Monocolumna 12x6m, 2 caras, Lona Front', 'https://maps.app.goo.gl/pZUVjbinXdCR4AUP9'),
'mza-trad-10': ('Sobre techo Acceso Norte y Rotonda del Avión', 'Acceso Norte y Rotonda del Avión', 'Elemento sobre terraza en rotonda, con mayor tiempo de exposición vehicular y cercanía al Aeropuerto Internacional El Plumerillo.', 'Monocolumna 7x5m, 1 cara, Lona Front', 'https://maps.app.goo.gl/5MBzjZgJ15r7p2ha7'),
'mza-trad-11': ('Corredor del Oeste, De Volea Pádel – Godoy Cruz', 'Corredor del Oeste, De Volea Pádel – Godoy Cruz', 'Ubicado sobre Corredor del Oeste, importante acceso que une el Gran Mendoza de sur a norte, con excelente choque visual a más de 200 metros.', 'Monocolumna 8x5m, 1 cara, Lona', 'https://maps.app.goo.gl/Nb9eedRdQiXwnM1B6'),
'mza-trad-12': ('4x4 Lat. Panamericana casi YPF - Luján', 'Colectora de Panamericana casi YPF - Luján de Cuyo', 'Posición sobre la colectora de Panamericana, con vista en ambos sentidos, tránsito turístico hacia montaña, Chacras de Coria y Vistalba.', '4X4 4,30x4,60m, 1 cara, Vinilo', 'https://maps.app.goo.gl/qWcz6Z8amXJx9vXQ8'),
'mza-trad-13': ('Supersextuple Panamericana y Antártida Argentina – Luján de Cuyo', 'Panamericana y Antártida Argentina – Luján de Cuyo', 'Posición sobre Ruta Panamericana a la altura de La Puntilla–Chacras de Coria, con tránsito turístico hacia montaña y cercanía a Palmares.', 'Superséxtuple 8,90x2,15m, 1 cara, Vinilo', 'https://maps.app.goo.gl/ErdJcjPW9BRvVC719'),
'mza-trad-14': ('Superséxtuple Terrada casi Boedo – Luján de Cuyo', 'Terrada casi Boedo – Luján de Cuyo', 'Zona de fuerte desarrollo inmobiliario, barrios privados y segmento ABC1. Capta tránsito en ambos sentidos y actividad deportiva/comercial cercana.', 'Superséxtuple 8,90x2,15m, 1 cara, Vinilo', 'https://maps.app.goo.gl/wbedJvgbzY3fLtFMA'),
'mza-trad-15': ('Superséxtuple Boedo entre Terrada y Acc. Sur – Luján de Cuyo', 'Boedo entre Terrada y Acceso Sur – Luján de Cuyo', 'Posición del inventario real de Formatos Medios de Gran Mendoza. La ficha PDF presenta descripción pendiente de completar.', 'Superséxtuple 8,90x2,15m, 1 cara, Vinilo', 'https://maps.app.goo.gl/wbedJvgbzY3fLtFMA'),
'mza-led-01': ('Pantalla LED Acceso Este y Dorrego', 'Acceso Este y Dorrego – Ingreso a la Ciudad de Mendoza', 'Pantalla LED ubicada en el principal ingreso a la Ciudad de Mendoza, captando tránsito de Ruta 7 y Ruta 40.', 'LED 9x6,4m, resolución 576x336, encendido 07–14 y 16:30–22:30, mínimo 150 salidas diarias', 'https://maps.app.goo.gl/ZKqVnyEXuwboWKfk7'),
'mza-led-02': ('Pantalla LED Panamericana y Pueyrredón', 'Panamericana y Pueyrredón – Luján de Cuyo', 'Pantalla LED sobre Panamericana en Luján de Cuyo. La ficha PDF deja la descripción y resolución técnica parcialmente pendientes.', 'LED 7x4m, encendido 07–23h, mínimo 280 salidas diarias', 'https://maps.app.goo.gl/ZKqVnyEXuwboWKfk7'),
}

for cid, (name, address, description, characteristics, map_url) in items.items():
    pattern = rf"(?ms)^  \{{\n    canonical_id: '{re.escape(cid)}',.*?^  \}},\n"
    match = re.search(pattern, s)
    if not match:
        raise SystemExit(f'Missing inventory record: {cid}')
    block = match.group(0)
    block = re.sub(r"(?m)^    name: .*?,$", lambda _: f"    name: {name!r},", block)
    block = re.sub(r"(?m)^    address: .*?,$", lambda _: f"    address: {address!r},", block)
    block = re.sub(r"(?m)^    description: .*?,$", lambda _: f"    description: {description!r},", block)
    block = re.sub(r"(?m)^    characteristics: .*?,$", lambda _: f"    characteristics: {characteristics!r},", block)
    block = re.sub(r"(?m)^    mapa_url: .*?,$", lambda _: f"    mapa_url: {map_url!r},", block)
    # Existing mock coordinates are intentionally cleared until verified geocoding is available.
    block = re.sub(r"(?m)^    lat: .*?,(?: //.*)?$", "    lat: null,", block)
    block = re.sub(r"(?m)^    lng: .*?,(?: //.*)?$", "    lng: null,", block)
    s = s[:match.start()] + block + s[match.end():]

# The source PDF has 15 unique Mendoza traditional/medium-format positions plus 2 LED positions.
# Keep the extra legacy mock ID for referential stability, but deactivate it instead of deleting it.
legacy = re.search(r"(?ms)^  \{\n    canonical_id: 'mza-trad-16',.*?^  \},\n", s)
if legacy:
    block = legacy.group(0)
    if "active: false," not in block:
        block = block.replace("    canonical_id: 'mza-trad-16',\n", "    canonical_id: 'mza-trad-16',\n    active: false,\n", 1)
        s = s[:legacy.start()] + block + s[legacy.end():]

p.write_text(s)
print(f'Normalized {len(items)} Mendoza records; preserved/deactivated legacy mza-trad-16.')
