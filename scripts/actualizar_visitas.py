"""
Registro de visitas del Despacho Presidencial (Palacio de Gobierno).

Fuente oficial: https://consulta-visitas.presidencia.gob.pe/ (enlazada desde el
Portal de Transparencia Estándar). Se consulta día por día.

Por privacidad NO se guarda el número de documento (DNI) de los visitantes.

Salidas:
  data/visitas_historico.json  todas las visitas desde DESDE (crece cada semana)
  data/visitas.json            resumen liviano para la web

Uso:  python scripts/actualizar_visitas.py [--desde 2026-07-28]
"""
import argparse
import html
import re
import sys
import time
from collections import Counter
from datetime import date, timedelta

from comun import ahora_lima, clave, guardar_json, http, leer_json

URL = "https://consulta-visitas.presidencia.gob.pe/index_server.php?k=sbmtBuscar"
DESDE = date(2026, 7, 28)  # inicio del gobierno actual
CAMPOS = ["fecha", "visitante", "entidad", "motivo", "funcionario", "cargo", "ingreso", "salida", "obs"]


def limpiar(celda):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", celda))).strip()


def visitas_del_dia(d):
    crudo = http(URL, data={"valorCaja1": d.strftime("%d/%m/%Y")}).decode("utf-8", "replace")
    filas = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", crudo, re.S):
        c = [limpiar(x) for x in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
        if len(c) < 10 or not re.match(r"\d{2}/\d{2}/\d{4}", c[1]):
            continue
        # c: item, fecha, visitante, documento(DNI - se descarta), entidad, motivo, funcionario, cargo, ingreso, salida, obs
        dd, mm, aa = c[1].split("/")
        filas.append([f"{aa}-{mm}-{dd}", c[2], c[4], c[5], c[6], c[7], c[8], c[9], c[10] if len(c) > 10 else ""])
    return filas


def es_presidencia(cargo):
    k = clave(cargo)
    return k.startswith("presidenciadelarepublica") or k.startswith("presidentedelarepublica") or k.startswith("presidentadelarepublica")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--desde", type=date.fromisoformat, default=None)
    args = ap.parse_args()

    hist = leer_json("visitas_historico.json", {"dias": {}})
    hoy = ahora_lima().date()
    if args.desde:
        inicio = args.desde
    elif hist["dias"]:
        inicio = date.fromisoformat(max(hist["dias"])) - timedelta(days=3)  # re-leer últimos días (horas de salida)
    else:
        inicio = DESDE

    d = inicio
    while d <= hoy:
        try:
            filas = visitas_del_dia(d)
            hist["dias"][d.isoformat()] = filas
            print(f"  {d}: {len(filas)} visitas")
        except Exception as e:
            print(f"  ! {d}: {e}")
        d += timedelta(days=1)
        time.sleep(0.5)  # no saturar el servidor público
    hist["campos"] = CAMPOS
    hist["fuente"] = "https://consulta-visitas.presidencia.gob.pe/"
    guardar_json("visitas_historico.json", hist)

    # ---------- Resumen para la web ----------
    todas = [f for dia in sorted(hist["dias"]) for f in hist["dias"][dia]]
    pres = [f for f in todas if es_presidencia(f[5])]
    por_semana = Counter()
    pres_semana = Counter()
    for f in todas:
        y, w, _ = date.fromisoformat(f[0]).isocalendar()
        por_semana[f"{y}-S{w:02d}"] += 1
    for f in pres:
        y, w, _ = date.fromisoformat(f[0]).isocalendar()
        pres_semana[f"{y}-S{w:02d}"] += 1
    semanas = sorted(por_semana)
    titular = Counter(f[4] for f in pres).most_common(1)
    hace14 = (hoy - timedelta(days=14)).isoformat()

    resumen = {
        "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "desde": min(hist["dias"]) if hist["dias"] else None,
        "hasta": max(hist["dias"]) if hist["dias"] else None,
        "fuente": hist["fuente"],
        "campos": CAMPOS,
        "total": len(todas),
        "titular": titular[0][0] if titular else None,
        "totalPresidencia": len(pres),
        "semanas": [{"semana": s, "total": por_semana[s], "presidencia": pres_semana[s]} for s in semanas],
        "presidencia": sorted(pres, key=lambda f: (f[0], f[6]), reverse=True),
        "topEntidades": Counter(f[2] for f in todas if f[2] and f[2] != "PARTICULAR").most_common(15),
        "topEntidadesPresidencia": Counter(f[2] for f in pres if f[2]).most_common(10),
        "topFuncionarios": Counter((f[4], f[5]) for f in todas).most_common(10),
        "topMotivos": Counter(f[3] for f in todas).most_common(10),
        "recientes": sorted((f for f in todas if f[0] >= hace14), key=lambda f: (f[0], f[6]), reverse=True),
    }
    guardar_json("visitas.json", resumen)


if __name__ == "__main__":
    sys.exit(main())
