"""
Presupuesto y gasto de años anteriores (MEF, Datos Abiertos).

Para 2025 en adelante usa el archivo "{anio}-Gasto-Devengado-Diario.csv" (una fila por
meta con montos anuales). Para 2012–2024 usa "{anio}-Gasto.csv" (filas mensuales: cada
monto aparece una sola vez, en el mes en que ocurrió, por eso se pueden sumar).

Salida: data/historico/<anio>.json  y, con --indice, data/historico/indice.json

Uso:
    python scripts/actualizar_historico.py --anio 2024
    python scripts/actualizar_historico.py --indice      # junta los años ya procesados
"""
import argparse
import csv
import glob
import io
import json
import os
import sys
from collections import defaultdict

from comun import DATA, ahora_lima, guardar_json, http

csv.field_size_limit(10_000_000)
BASE = "https://fs.datosabiertos.mef.gob.pe/datastorefiles/"


def a_float(s):
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def procesar(anio):
    diario = BASE + f"{anio}-Gasto-Devengado-Diario.csv"
    mensual = BASE + f"{anio}-Gasto.csv"
    try:
        resp, url = http(diario, timeout=300, stream=True), diario
    except Exception:
        resp, url = http(mensual, timeout=300, stream=True), mensual
    print("Descargando", url, flush=True)
    lector = csv.reader(io.TextIOWrapper(resp, encoding="utf-8", errors="replace", newline=""))
    cab = next(lector)
    i = {n: k for k, n in enumerate(cab)}
    c_dev = i.get("MONTO_DEVENGADO_ANUAL", i.get("MONTO_DEVENGADO"))
    c_pia, c_pim = i["MONTO_PIA"], i["MONTO_PIM"]
    c_niv, c_fun, c_sec, c_ej = i["NIVEL_GOBIERNO_NOMBRE"], i["FUNCION_NOMBRE"], i["SEC_EJEC"], i["EJECUTORA_NOMBRE"]
    c_dep, c_prov, c_dist = i["DEPARTAMENTO_EJECUTORA_NOMBRE"], i["PROVINCIA_EJECUTORA_NOMBRE"], i["DISTRITO_EJECUTORA_NOMBRE"]
    c_tipo = i.get("TIPO_ACT_PROY")
    nuevo = lambda: [0.0, 0.0, 0.0]
    total, inv = nuevo(), nuevo()
    niveles, funciones, deptos = (defaultdict(nuevo) for _ in range(3))
    ej, ej_info = defaultdict(nuevo), {}
    n = 0
    for f in lector:
        if len(f) < len(cab):
            continue
        v = (a_float(f[c_pia]), a_float(f[c_pim]), a_float(f[c_dev]))
        for acc in (total, niveles[f[c_niv]], funciones[f[c_fun].strip()], deptos[f[c_dep].strip()], ej[f[c_sec]]):
            acc[0] += v[0]; acc[1] += v[1]; acc[2] += v[2]
        if c_tipo is not None and f[c_tipo] in ("PROYECTO", "2"):
            inv[0] += v[0]; inv[1] += v[1]; inv[2] += v[2]
        if f[c_sec] not in ej_info:
            ej_info[f[c_sec]] = [f[c_ej].strip(), f[c_niv].strip(), f[c_dep].strip(), f[c_prov].strip(), f[c_dist].strip()]
        n += 1
        if n % 2_000_000 == 0:
            print(f"  {n:,} filas…", flush=True)
    R = lambda a: [round(a[0]), round(a[1]), round(a[2])]
    datos = {
        "anio": anio, "fuente": url, "filas": n, "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "campos": ["pia", "pim", "dev"],
        "total": R(total), "inversion": R(inv),
        "niveles": {k: R(a) for k, a in niveles.items()},
        "funciones": {k: R(a) for k, a in funciones.items()},
        "departamentos": {k: R(a) for k, a in deptos.items()},
        "entidades": {s: ej_info[s] + R(a) for s, a in ej.items() if a[1] > 0 or a[2] > 0},
    }
    guardar_json(f"historico/{anio}.json", datos)
    print(f"{anio}: PIA S/ {total[0] / 1e6:,.0f} M · PIM S/ {total[1] / 1e6:,.0f} M · devengado S/ {total[2] / 1e6:,.0f} M ({n:,} filas)")


def indice():
    anios = []
    for ruta in sorted(glob.glob(os.path.join(DATA, "historico", "[0-9][0-9][0-9][0-9].json"))):
        d = json.load(open(ruta, encoding="utf-8"))
        anios.append({"anio": d["anio"], "total": d["total"], "inversion": d["inversion"],
                      "niveles": d["niveles"], "funciones": d["funciones"], "departamentos": d["departamentos"]})
    guardar_json("historico/indice.json", {"actualizado": ahora_lima().isoformat(timespec="minutes"), "anios": anios})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anio", type=int)
    ap.add_argument("--indice", action="store_true")
    a = ap.parse_args()
    if a.anio:
        procesar(a.anio)
    if a.indice:
        indice()


if __name__ == "__main__":
    sys.exit(main())
