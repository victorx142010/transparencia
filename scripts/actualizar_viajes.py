"""
Viajes de funcionarios pagados con dinero público: pasajes y viáticos.

Fuente: Portal de Transparencia Estándar, sección "Pasajes y viáticos" de cada
entidad (lo publican por Ley 27806). Se consulta mes a mes, por separado los viajes
nacionales y los internacionales, para las entidades principales (las mismas de la
lista ENTIDADES de actualizar_sueldos.py).

Salida: data/viajes.json

Uso:  python scripts/actualizar_viajes.py [--anio 2026] [--hilos 6]
"""
import argparse
import html
import re
import sys
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

from actualizar_sueldos import ENTIDADES
from comun import ahora_lima, guardar_json, http

URL = "https://www.transparencia.gob.pe/contrataciones/pte_transparencia_viaticos.aspx"
PAGINA = URL + "?id_entidad={id}&id_tema=34&ver=D"


def monto(s):
    try:
        return round(float(re.sub(r"[^\d.]", "", s or "") or 0), 2)
    except ValueError:
        return 0.0


def consultar(id_ent, anio, mes, tipo):
    datos = {"ch_tipo_busqueda": "1", "id_entidad": id_ent, "id_tema": "34", "Ver": "D",
             "in_anno_consulta": anio, "ch_mes_consulta": f"{mes:02d}", "cbo_tipo_viaje": tipo, "cbo_ruta_viaje": "0"}
    t = http(URL, data=datos, timeout=120).decode("utf-8", "replace")
    filas = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
        c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if len(c) >= 8 and re.match(r"\d{2}/\d{2}/\d{4}", c[2] or ""):
            filas.append(c)
    return filas


def main():
    ap = argparse.ArgumentParser()
    hoy = ahora_lima()
    ap.add_argument("--anio", type=int, default=hoy.year)
    ap.add_argument("--hilos", type=int, default=6)
    args = ap.parse_args()
    ultimo_mes = hoy.month if args.anio == hoy.year else 12

    tareas = [(i, n, m, t) for i, n, _ in ENTIDADES for m in range(1, ultimo_mes + 1) for t in ("1", "2")]
    viajes = []

    def trabajo(x):
        i, n, m, t = x
        try:
            return x, consultar(i, args.anio, m, t)
        except Exception as e:
            print(f"  ! {n} {m:02d}: {e}")
            return x, []

    with ThreadPoolExecutor(max_workers=args.hilos) as ex:
        for k, fu in enumerate(as_completed([ex.submit(trabajo, x) for x in tareas]), 1):
            (i, n, m, t), filas = fu.result()
            for c in filas:
                # área, persona, salida, retorno, ruta, pasajes, viáticos, total, fuente, autorización
                viajes.append([f"{args.anio}-{m:02d}", n, c[0], c[1], c[2], c[3], c[4], monto(c[5]), monto(c[6]),
                               monto(c[7]) or monto(c[5]) + monto(c[6]), "Internacional" if t == "2" else "Nacional", i])
            if k % 100 == 0:
                print(f"  {k}/{len(tareas)} consultas, {len(viajes)} viajes", flush=True)

    viajes.sort(key=lambda v: (-v[9]))
    # Montos atípicos (casi siempre errores de registro de la entidad): se muestran marcados
    # y no entran en los rankings. Nacional: más de S/ 30 mil; internacional: más de S/ 150 mil.
    for v in viajes:
        v.append(1 if v[9] > (30000 if v[10] == "Nacional" else 150000) else 0)
    normales = [v for v in viajes if not v[12]]
    por_persona = defaultdict(lambda: [0.0, 0, set()])
    for v in normales:
        x = por_persona[(v[3], v[1])]
        x[0] += v[9]; x[1] += 1; x[2].add(v[10])
    por_ent = defaultdict(lambda: [0.0, 0, 0])
    for v in normales:
        por_ent[v[1]][0] += v[9]; por_ent[v[1]][1] += 1; por_ent[v[1]][2] += v[10] == "Internacional"
    destinos = Counter()
    for v in viajes:
        for lugar in re.split(r"\s*[-–/]\s*", v[6]):
            l = lugar.strip().title()
            if l and l.lower() not in ("lima",):
                destinos[l] += 1
    guardar_json("viajes.json", {
        "actualizado": hoy.isoformat(timespec="minutes"), "anio": args.anio,
        "fuente": "https://www.transparencia.gob.pe/", "urlEntidad": PAGINA,
        "total": len(viajes), "monto": round(sum(v[9] for v in normales)),
        "atipicos": sum(1 for v in viajes if v[12]), "montoAtipico": round(sum(v[9] for v in viajes if v[12])),
        "internacionales": sum(1 for v in viajes if v[10] == "Internacional"),
        "montoInternacional": round(sum(v[9] for v in normales if v[10] == "Internacional")),
        "topPersonas": sorted(([p, e, round(x[0]), x[1], sorted(x[2])] for (p, e), x in por_persona.items()), key=lambda r: -r[2])[:50],
        "topEntidades": sorted(([e, round(x[0]), x[1], x[2]] for e, x in por_ent.items()), key=lambda r: -r[1]),
        "topDestinos": destinos.most_common(25),
        "campos": ["mes", "entidad", "area", "persona", "salida", "retorno", "ruta", "pasajes", "viaticos", "total", "tipo", "idEntidad", "atipico"],
        "viajes": viajes,
    })
    print(f"{len(viajes):,} viajes, S/ {sum(v[9] for v in viajes):,.0f}")


if __name__ == "__main__":
    sys.exit(main())
