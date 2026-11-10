"""
Descarga el CSV oficial del MEF (Datos Abiertos: "Presupuesto y Ejecución de Gasto")
y lo resume en data/presupuesto.json.

El archivo pesa ~2.6 GB, así que se procesa en streaming (sin guardarlo en disco).

Uso:
    python scripts/actualizar_presupuesto.py               # año actual
    python scripts/actualizar_presupuesto.py --anio 2026
    python scripts/actualizar_presupuesto.py --max-filas 200000   # prueba rápida
"""
import argparse
import csv
import io
import sys
from collections import defaultdict

from comun import ahora_lima, guardar_json, http

URL = "https://fs.datosabiertos.mef.gob.pe/datastorefiles/{anio}-Gasto-Devengado-Diario.csv"

csv.field_size_limit(10_000_000)


def nuevo():
    return [0.0, 0.0, 0.0]  # PIA, PIM, devengado


def a_float(s):
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anio", type=int, default=ahora_lima().year)
    ap.add_argument("--max-filas", type=int, default=0, help="Solo para pruebas")
    args = ap.parse_args()

    url = URL.format(anio=args.anio)
    print(f"Descargando {url}")
    resp = http(url, timeout=300, stream=True)
    corte = resp.headers.get("Last-Modified", "")
    lector = csv.reader(io.TextIOWrapper(resp, encoding="utf-8", errors="replace", newline=""))
    cab = next(lector)
    i = {n: k for k, n in enumerate(cab)}
    c_pia, c_pim, c_dev = i["MONTO_PIA"], i["MONTO_PIM"], i["MONTO_DEVENGADO_ANUAL"]
    c_nivel, c_fun, c_div = i["NIVEL_GOBIERNO_NOMBRE"], i["FUNCION_NOMBRE"], i["DIVISION_FUNCIONAL_NOMBRE"]
    c_sector, c_pliego, c_gen, c_dep = i["SECTOR_NOMBRE"], i["PLIEGO_NOMBRE"], i["GENERICA_NOMBRE"], i["DEPARTAMENTO_META_NOMBRE"]
    c_meses = [i[f"MONTO_DEVENGADO_{m}"] for m in (
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO",
        "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE")]

    total = nuevo()
    niveles, funciones, sectores, pliegos, genericas, deptos = (defaultdict(nuevo) for _ in range(6))
    divisiones = defaultdict(lambda: defaultdict(nuevo))
    meses = [0.0] * 12

    n = 0
    for fila in lector:
        if len(fila) < len(cab):
            continue
        v = (a_float(fila[c_pia]), a_float(fila[c_pim]), a_float(fila[c_dev]))
        for acc in (total, niveles[fila[c_nivel]], funciones[fila[c_fun]], divisiones[fila[c_fun]][fila[c_div]],
                    sectores[fila[c_sector]], pliegos[fila[c_pliego]], genericas[fila[c_gen]], deptos[fila[c_dep]]):
            acc[0] += v[0]; acc[1] += v[1]; acc[2] += v[2]
        for m, c in enumerate(c_meses):
            meses[m] += a_float(fila[c])
        n += 1
        if n % 500_000 == 0:
            print(f"  {n:,} filas…", flush=True)
        if args.max_filas and n >= args.max_filas:
            break
    print(f"Procesadas {n:,} filas")

    def lista(d, extra=None):
        out = []
        for nombre, (pia, pim, dev) in d.items():
            item = {"nombre": nombre.strip(), "pia": round(pia), "pim": round(pim), "dev": round(dev)}
            if extra:
                item.update(extra(nombre))
            out.append(item)
        return sorted(out, key=lambda x: -x["pim"])

    datos = {
        "anio": args.anio,
        "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "corteMEF": corte,
        "parcial": bool(args.max_filas),
        "fuente": url,
        "filas": n,
        "total": {"pia": round(total[0]), "pim": round(total[1]), "dev": round(total[2])},
        "devengadoMensual": [round(x) for x in meses],
        "niveles": lista(niveles),
        "funciones": lista(funciones, lambda f: {"divisiones": lista(divisiones[f])}),
        "genericas": lista(genericas),
        "sectores": lista(sectores),
        "pliegos": lista(pliegos)[:60],
        "departamentos": lista(deptos),
    }
    guardar_json("presupuesto.json", datos)


if __name__ == "__main__":
    sys.exit(main())
