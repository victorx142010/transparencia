"""
Resumen para la página de inicio: un archivo pequeño (data/resumen.json, ~1 KB) con las cifras
que muestra el inicio. Así la portada no tiene que descargar 2.5 MB de datos antes de mostrar
algo; cada sección descarga lo suyo cuando la abres.

Se calcula a partir de los otros archivos de data/, así que va al final de cada robot.

Uso:  python scripts/actualizar_resumen.py
"""
import sys

from comun import ahora_lima, guardar_json, leer_json
from destacados import destacados


def asistencia(camara):
    """Igual que resumenCamara() en js/app.js: % de presencias sobre el total de registros."""
    ses = (camara or {}).get("sesiones") or []
    pres = sum(s.get("presentes", 0) for s in ses)
    tot = sum(s.get("presentes", 0) + s.get("licencias", 0) + s.get("ausentes", 0) for s in ses)
    return round(100 * pres / tot, 1) if tot else None


def main():
    fuentes = {n: leer_json(f"{n}.json", {}) or {} for n in
               ("contratos", "obras", "sueldos", "congreso", "proyectos", "visitas", "programas", "deuda", "partidas", "presupuesto", "recaudacion",
                "control", "entidades", "viajes", "viajes_lista")}
    c, o, s, cg = fuentes["contratos"], fuentes["obras"], fuentes["sueldos"], fuentes["congreso"]
    res = {"generado": ahora_lima().isoformat(timespec="minutes")}
    if c.get("total"):
        res["contratos"] = {"anio": c.get("anio"), "monto": c.get("monto"), "total": c.get("total"),
                            "proveedores": c.get("proveedoresDistintos")}
    if o.get("total"):
        res["obras"] = {"total": o.get("total"), "saldo": o.get("saldoObras")}
    if s.get("entidades"):
        res["sueldos"] = {"personas": sum(e.get("personas", 0) for e in s["entidades"])}
    camaras = cg.get("camaras") or {}
    if camaras:
        res["congreso"] = {k: asistencia(camaras.get(k)) for k in ("senado", "diputados")}
    if fuentes["proyectos"].get("total"):
        res["leyes"] = {"total": fuentes["proyectos"]["total"]}
    if fuentes["visitas"].get("totalPresidencia") is not None:
        res["visitas"] = {"total": fuentes["visitas"]["totalPresidencia"]}
    tot = (fuentes["programas"].get("totales") or {})
    if tot.get("juntos_hogares"):
        res["programas"] = {"juntos": tot["juntos_hogares"]}
    ult = fuentes["deuda"].get("ultimo") or {}
    if ult.get("PN03371FQ"):
        res["deuda"] = {"total": ult["PN03371FQ"]}
    if fuentes["partidas"].get("partidas"):
        res["partidas"] = {"n": len(fuentes["partidas"]["partidas"])}
    # "Lo importante esta semana": titulares escritos a partir de los datos (scripts/destacados.py)
    res["destacados"] = destacados(fuentes, ahora_lima().date())
    # Fecha de la actualización más reciente entre los datos de la portada
    fechas = sorted(f.get("actualizado") for f in fuentes.values()
                    if isinstance(f.get("actualizado"), str) and f is not fuentes["control"])
    if fechas:
        res["actualizado"] = fechas[-1]
    guardar_json("resumen.json", res)


if __name__ == "__main__":
    sys.exit(main())
