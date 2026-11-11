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
| Impuestos | API de BCRPData: ingresos tributarios del Gobierno Central (datos de SUNAT y MEF), mensual | `actualizar_recaudacion.py` | `data/recaudacion.json` |
| ¿En qué se gasta? (hasta cada proyecto) | MEF — Datos Abiertos, *Presupuesto y Ejecución de Gasto* (CSV diario de ~2.6 GB) | `actualizar_presupuesto.py` | `data/presupuesto.json`, `data/gasto/<funcion>.json` |
| Obras paralizadas | Contraloría — *Informe de obras paralizadas* (anexo Excel, trimestral, en gob.pe) | `actualizar_obras.py` | `data/obras.json` |
| Sueldos por persona | Portal de Transparencia Estándar → Personal (CSV oficial de cada entidad, mensual) | `actualizar_sueldos.py` | `data/sueldos.json`, `data/sueldos/<id>.json` |
| Congreso | Actas del Pleno en senado.congreso.gob.pe y diputados.congreso.gob.pe (PDF) | `actualizar_congreso.py` | `data/congreso.json` |
| Proyectos de ley | Sistema de Proposiciones Legislativas (api.congreso.gob.pe/spley-portal-service) | `actualizar_proyectos.py` | `data/proyectos.json` |
| Visitas a Palacio | consulta-visitas.presidencia.gob.pe (Despacho Presidencial) | `actualizar_visitas.py` | `data/visitas.json` |

En `js/datos.js` quedan solo los **sueldos de referencia por cargo** (salen de decretos) y cifras de respaldo por si algún JSON falta.

Notas:
- **Asistencia**: se cuenta quién estaba al **inicio** de cada sesión del Pleno, más quienes la Presidencia registró justo después. Solo entran las actas ya publicadas (suelen tardar unas semanas).
- **Visitas y planillas**: por privacidad **no se guarda el DNI**.
- **Sueldos**: se excluye el régimen de pensionistas. SUNAT no publica montos en el Portal de Transparencia (remite a su web) y el BCRP no tiene planillas recientes; por eso no aparecen. Los senadores y diputados actuales aún no figuran en la planilla publicada del Congreso.
- Para agregar otra entidad a los sueldos, añade su `id_entidad` del Portal de Transparencia a la lista `ENTIDADES` en `scripts/actualizar_sueldos.py`.

## Ejecutar los scrapers en tu computadora

```bash
pip install -r scripts/requirements.txt
cd scripts
python actualizar_recaudacion.py   # segundos
python actualizar_presupuesto.py   # ~10 min, descarga 2.6 GB en streaming
python actualizar_sueldos.py       # ~15 min, 30 entidades
python actualizar_congreso.py      # solo lee actas nuevas
python actualizar_proyectos.py     # ~1 min
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
