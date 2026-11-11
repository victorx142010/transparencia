"""
Descarga el CSV oficial del MEF (Datos Abiertos: "Presupuesto y Ejecución de Gasto")
y lo resume en:
  data/presupuesto.json         totales, niveles, funciones y divisiones (liviano)
  data/gasto/<funcion>.json     detalle de cada función para "bajar de nivel":
                                división → grupo → en qué se gasta, actividades y
                                cada proyecto de inversión (con su CUI)

El archivo pesa ~2.6 GB, así que se procesa en streaming (sin guardarlo en disco).

Uso:
    python scripts/actualizar_presupuesto.py               # año actual
    python scripts/actualizar_presupuesto.py --anio 2026
    python scripts/actualizar_presupuesto.py --max-filas 200000   # prueba rápida
"""
import argparse
import csv
import io
import os
import re
import sys
import unicodedata
from collections import defaultdict

from comun import DATA, ahora_lima, guardar_json, http

URL = "https://fs.datosabiertos.mef.gob.pe/datastorefiles/{anio}-Gasto-Devengado-Diario.csv"
TOP_ACTIVIDADES = 15

csv.field_size_limit(10_000_000)


def nuevo():
    return [0.0, 0.0, 0.0]  # PIA, PIM, devengado


def a_float(s):
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def slug(texto):
    t = unicodedata.normalize("NFD", texto.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60]


def sumar(acc, v):
    acc[0] += v[0]; acc[1] += v[1]; acc[2] += v[2]


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
    c_nivel, c_fun, c_div, c_grp = i["NIVEL_GOBIERNO_NOMBRE"], i["FUNCION_NOMBRE"], i["DIVISION_FUNCIONAL_NOMBRE"], i["GRUPO_FUNCIONAL_NOMBRE"]
    c_sector, c_pliego, c_gen, c_dep = i["SECTOR_NOMBRE"], i["PLIEGO_NOMBRE"], i["GENERICA_NOMBRE"], i["DEPARTAMENTO_META_NOMBRE"]
    c_tipo, c_cui, c_proy, c_act, c_ejec = (i["TIPO_ACT_PROY"], i["PRODUCTO_PROYECTO"], i["PRODUCTO_PROYECTO_NOMBRE"],
                                            i["ACTIVIDAD_ACCION_OBRA_NOMBRE"], i["EJECUTORA_NOMBRE"])
    c_meses = [i[f"MONTO_DEVENGADO_{m}"] for m in (
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO",
        "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE")]

    total = nuevo()
    niveles, funciones, sectores, pliegos, genericas, deptos = (defaultdict(nuevo) for _ in range(6))
    divisiones = defaultdict(nuevo)          # (fun, div)
    grupos = defaultdict(nuevo)              # (fun, div, grp)
    gen_grupo = defaultdict(nuevo)           # (fun, div, grp, genérica)
    dep_grupo = defaultdict(nuevo)           # (fun, div, grp, departamento)
    actividades = defaultdict(nuevo)         # (fun, div, grp, actividad)
    proyectos = {}                           # (fun, div, grp, cui, ejecutora) -> [nombre, depto, pia, pim, dev]
    meses = [0.0] * 12

    n = 0
    for fila in lector:
        if len(fila) < len(cab):
            continue
        v = (a_float(fila[c_pia]), a_float(fila[c_pim]), a_float(fila[c_dev]))
        fun, div, grp = fila[c_fun].strip(), fila[c_div].strip(), fila[c_grp].strip()
        for acc in (total, niveles[fila[c_nivel]], funciones[fun], divisiones[(fun, div)], grupos[(fun, div, grp)],
                    gen_grupo[(fun, div, grp, fila[c_gen])], dep_grupo[(fun, div, grp, fila[c_dep])],
                    sectores[fila[c_sector]], pliegos[fila[c_pliego]], genericas[fila[c_gen]], deptos[fila[c_dep]]):
            sumar(acc, v)
        if fila[c_tipo] == "PROYECTO":
            k = (fun, div, grp, fila[c_cui], fila[c_ejec])
            p = proyectos.get(k)
            if p is None:
                p = proyectos[k] = [fila[c_proy].strip(), fila[c_dep].strip(), 0.0, 0.0, 0.0]
            p[2] += v[0]; p[3] += v[1]; p[4] += v[2]
        else:
            sumar(actividades[(fun, div, grp, fila[c_act].strip())], v)
        for m, c in enumerate(c_meses):
            meses[m] += a_float(fila[c])
        n += 1
        if n % 500_000 == 0:
            print(f"  {n:,} filas…", flush=True)
        if args.max_filas and n >= args.max_filas:
            break
    print(f"Procesadas {n:,} filas, {len(proyectos):,} proyectos")

    R = lambda a: {"pia": round(a[0]), "pim": round(a[1]), "dev": round(a[2])}

    def lista(d, extra=None):
        out = []
        for nombre, acc in d.items():
            item = {"nombre": nombre.strip(), **R(acc)}
            if extra:
                item.update(extra(nombre))
            out.append(item)
        return sorted(out, key=lambda x: -x["pim"])

    # ---------- Detalle por función (un archivo cada una) ----------
    os.makedirs(os.path.join(DATA, "gasto"), exist_ok=True)
    idx_div = defaultdict(list)
    for (f, d) in divisiones:
        idx_div[f].append(d)
    idx_grp = defaultdict(list)
    for (f, d, g) in grupos:
        idx_grp[(f, d)].append(g)
    idx_gen, idx_dep, idx_act, idx_pry = (defaultdict(list) for _ in range(4))
    for (f, d, g, x), acc in gen_grupo.items():
        idx_gen[(f, d, g)].append([x.strip(), round(acc[1]), round(acc[2])])
    for (f, d, g, x), acc in dep_grupo.items():
        idx_dep[(f, d, g)].append([x.strip(), round(acc[1]), round(acc[2])])
    for (f, d, g, x), acc in actividades.items():
        if acc[1] > 0 or acc[2] > 0:
            idx_act[(f, d, g)].append([x, round(acc[1]), round(acc[2])])
    for (f, d, g, cui, ej), p in proyectos.items():
        if p[3] > 0 or p[4] > 0:
            idx_pry[(f, d, g)].append([cui, p[0], ej.strip(), p[1], round(p[2]), round(p[3]), round(p[4])])

    archivos = {}
    for fun in funciones:
        s = slug(fun) or "sin-funcion"
        archivos[fun] = s
        divs = []
        for d in idx_div[fun]:
            grps = []
            for g in idx_grp[(fun, d)]:
                k = (fun, d, g)
                grps.append({
                    "nombre": g, **R(grupos[k]),
                    "genericas": sorted(idx_gen[k], key=lambda x: -x[1]),
                    "departamentos": sorted(idx_dep[k], key=lambda x: -x[1]),
                    "actividades": sorted(idx_act[k], key=lambda x: -x[1])[:TOP_ACTIVIDADES],
                    "proyectos": sorted(idx_pry[k], key=lambda x: -x[5]),
                })
            divs.append({"nombre": d, **R(divisiones[(fun, d)]), "grupos": sorted(grps, key=lambda x: -x["pim"])})
        guardar_json(f"gasto/{s}.json", {
            "anio": args.anio, "funcion": fun, **R(funciones[fun]),
            "camposProyecto": ["cui", "nombre", "ejecutora", "departamento", "pia", "pim", "dev"],
            "divisiones": sorted(divs, key=lambda x: -x["pim"]),
        })

    datos = {
        "anio": args.anio,
        "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "corteMEF": corte,
        "parcial": bool(args.max_filas),
        "fuente": url,
        "filas": n,
        "total": R(total),
        "devengadoMensual": [round(x) for x in meses],
        "niveles": lista(niveles),
        "funciones": lista(funciones, lambda f: {
            "archivo": archivos.get(f),
            "proyectos": sum(1 for k in proyectos if k[0] == f),
            "divisiones": lista({d: divisiones[(f, d)] for d in idx_div[f]}),
        }),
        "genericas": lista(genericas),
        "sectores": lista(sectores),
        "pliegos": lista(pliegos)[:60],
        "departamentos": lista(deptos),
    }
    guardar_json("presupuesto.json", datos)


if __name__ == "__main__":
    sys.exit(main())
