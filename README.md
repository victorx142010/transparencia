# Plata Clara Perú

Portal ciudadano para entender en simple cuánto recauda el Estado peruano, en qué lo gasta, cuánto ganan sus autoridades, si los congresistas van a trabajar y quién visita Palacio de Gobierno.

## Estructura

```
index.html                 Página (todas las secciones)
css/styles.css             Estilos (móvil primero, modo claro/oscuro)
js/datos.js                Cifras escritas a mano (impuestos, sueldos) y respaldo si faltan los JSON
js/arbol.js                Gráfico de árbol (treemap) sin librerías
js/app.js                  Lógica de la web
data/*.json                ← Generados AUTOMÁTICAMENTE por los scrapers
scripts/                   Scrapers en Python
.github/workflows/         Robot que los ejecuta cada semana
```

## De dónde sale cada dato (actualización automática)

| Sección | Fuente oficial | Script | Archivo |
|---|---|---|---|
| ¿En qué se gasta? | MEF — Datos Abiertos, *Presupuesto y Ejecución de Gasto* (CSV diario de ~2.6 GB) | `actualizar_presupuesto.py` | `data/presupuesto.json` |
| Congreso | Actas del Pleno en senado.congreso.gob.pe y diputados.congreso.gob.pe (PDF) | `actualizar_congreso.py` | `data/congreso.json` |
| Visitas a Palacio | consulta-visitas.presidencia.gob.pe (Despacho Presidencial) | `actualizar_visitas.py` | `data/visitas.json` |

Las secciones de **impuestos** y **sueldos** siguen en `js/datos.js` (SUNAT publica en Excel/Word y los sueldos salen de decretos), con etiqueta *Oficial* o *Estimado*.

Notas:
- **Asistencia**: se cuenta quién estaba al **inicio** de cada sesión del Pleno, más quienes la Presidencia registró justo después. Solo entran las actas ya publicadas (suelen tardar unas semanas).
- **Visitas**: por privacidad **no se guarda el DNI** de los visitantes.

## Ejecutar los scrapers en tu computadora

```bash
pip install -r scripts/requirements.txt
cd scripts
python actualizar_presupuesto.py   # ~10 min, descarga 2.6 GB en streaming
python actualizar_congreso.py      # solo lee actas nuevas
python actualizar_visitas.py       # solo consulta los días nuevos
```

## Ver la web

```bash
python -m http.server 8080
```

Abre http://localhost:8080 (abrir `index.html` con doble clic también funciona, pero sin los datos automáticos).

## Publicar y activar la actualización semanal (gratis, con GitHub)

1. Crea un repositorio en GitHub y sube esta carpeta.
2. En el repositorio: **Settings → Pages → Branch: main / root** → Save. Tu web queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.
3. En **Settings → Actions → General → Workflow permissions** marca **Read and write permissions**.
4. Listo: cada **lunes a las 6:00 a. m. (hora de Lima)** el robot descarga los datos nuevos, los guarda y la web se actualiza sola. Para forzarlo: pestaña **Actions → Actualizar datos → Run workflow**.

Si una web oficial está caída, ese paso falla pero los demás siguen, y se conservan los datos de la semana anterior.
