"""
Programas sociales por distrito (Plataforma Nacional de Datos Abiertos).

- JUNTOS: hogares afiliados y abonados, y monto transferido, por ubigeo (MIDIS).
- Pensión 65: usuarios por distrito. El archivo oficial trae nombres y DNI de cada
  usuario; aquí SOLO se cuentan por distrito: no se guarda ningún dato personal.

Salida: data/programas.json

Uso:  python scripts/actualizar_programas.py
"""
import csv
import io
import re
import sys
from collections import defaultdict

from openpyxl import load_workbook

from comun import ahora_lima, guardar_json, http

PORTAL = "https://www.datosabiertos.gob.pe"
JUNTOS = PORTAL + "/dataset/resumen-de-hogares-afiliados-y-abonados-por-ubigeo-{anio}-programa-juntos"
P65 = PORTAL + "/dataset/informaci%C3%B3n-de-usuarios-del-programa-pensi%C3%B3n-65"


def enlaces(url, ext):
    t = http(url, timeout=120).decode("utf-8", "replace")
    return sorted(set(re.findall(r'https?://[^"\s]+\.' + ext, t, re.I)))


def juntos(anio):
    """Devuelve {ubigeo: [afiliados, abonados, monto_anual]} usando el bimestre más reciente para hogares."""
    mejor, filas = None, []
    for u in enlaces(JUNTOS.format(anio=anio), "xlsx"):
        try:
            ws = load_workbook(io.BytesIO(http(u, timeout=180)), read_only=True, data_only=True).worksheets[0]
        except Exception as e:
            print("  !", u, e)
            continue
        f = list(ws.iter_rows(values_only=True))
        cab = [str(c or "").strip().upper() for c in f[0]]
        if "UBIGEO" not in cab:
            continue
        ult = max(str(r[cab.index("BIMESTRE")]) for r in f[1:] if r and r[cab.index("BIMESTRE")])
        if mejor is None or ult > mejor[0]:
            mejor, filas = (ult, cab), f[1:]
    if not mejor:
        return {}, None
    ult, cab = mejor
    ix = {k: cab.index(k) for k in ("BIMESTRE", "UBIGEO", "AFILIADOS", "ABONADOS", "TRANSFERENCIA")}
    out = defaultdict(lambda: [0, 0, 0.0])
    for r in filas:
        if not r or r[ix["UBIGEO"]] is None:
            continue
        ub = str(r[ix["UBIGEO"]]).zfill(6)
        out[ub][2] += float(r[ix["TRANSFERENCIA"]] or 0)
        if str(r[ix["BIMESTRE"]]) == ult:
            out[ub][0] = int(r[ix["AFILIADOS"]] or 0)
            out[ub][1] = int(r[ix["ABONADOS"]] or 0)
    return out, ult


def pension65():
    archivos = [u for u in enlaces(P65, "csv") if "trama_UO_usuarios_" in u]
    if not archivos:
        return {}, None
    u = max(archivos, key=lambda x: re.search(r"(\d{6})\.csv", x).group(1))
    periodo = re.search(r"(\d{6})\.csv", u).group(1)
    print("  Pensión 65:", u)
    texto = io.TextIOWrapper(http(u, timeout=600, stream=True), encoding="utf-8-sig", errors="replace", newline="")
    conteo = defaultdict(int)
    for r in csv.DictReader(texto):
        ub = (r.get("CODIGO_UBIGEO") or "").strip().zfill(6)
        if ub.strip("0"):
            conteo[ub] += 1  # solo se cuenta; no se guarda nombre ni DNI
    return conteo, f"{periodo[:4]}-{periodo[4:]}"


def main():
    hoy = ahora_lima()
    j, bim = juntos(hoy.year)
    if not j:
        j, bim = juntos(hoy.year - 1)
    p, per = pension65()
    ubis = sorted(set(j) | set(p))
    por_dep = defaultdict(lambda: [0, 0.0, 0])
    for u in ubis:
        d = por_dep[u[:2]]
        if u in j:
            d[0] += j[u][0]; d[1] += j[u][2]
        d[2] += p.get(u, 0)
    guardar_json("programas.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuentes": {"juntos": JUNTOS.format(anio=hoy.year), "pension65": P65},
        "juntosBimestre": bim, "pension65Periodo": per,
        "campos": ["juntos_hogares", "juntos_abonados", "juntos_monto_anio", "pension65_usuarios"],
        "distritos": {u: [*(j.get(u, [0, 0, 0])[:2]), round(j.get(u, [0, 0, 0])[2]), p.get(u, 0)] for u in ubis},
        "departamentos": {k: [v[0], round(v[1]), v[2]] for k, v in por_dep.items()},
        "totales": {"juntos_hogares": sum(v[0] for v in j.values()), "juntos_monto": round(sum(v[2] for v in j.values())),
                    "pension65": sum(p.values())},
    })
    print(f"Juntos ({bim}): {sum(v[0] for v in j.values()):,} hogares; Pensión 65 ({per}): {sum(p.values()):,} usuarios")


if __name__ == "__main__":
    sys.exit(main())
