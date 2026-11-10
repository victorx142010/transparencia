"""
Recaudación tributaria mensual del Gobierno Nacional (datos de SUNAT/MEF),
descargada de la API oficial del Banco Central de Reserva (BCRPData).

Series (millones de soles, valores nominales):
  PN02295FM Ingresos tributarios del Gobierno Nacional (total neto)
  PN02296FM Impuesto a la Renta        PN02301FM IGV
  PN02304FM ISC                        PN02300FM Impuestos a las importaciones
  PN02307FM Otros ingresos tributarios PN02308FM Devoluciones (negativo)

Uso:  python scripts/actualizar_recaudacion.py
"""
import json
import sys

from comun import ahora_lima, guardar_json, http

API = "https://estadisticas.bcrp.gob.pe/estadisticas/series/api/{codigos}/json/{desde}/{hasta}"
SERIES = {
    "total": "PN02295FM", "renta": "PN02296FM", "igv": "PN02301FM", "isc": "PN02304FM",
    "importaciones": "PN02300FM", "otros": "PN02307FM", "devoluciones": "PN02308FM",
}
MESES = {"Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6, "Jul": 7, "Ago": 8, "Set": 9, "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12}


def num(v):
    try:
        return round(float(v), 1)
    except (TypeError, ValueError):
        return None  # BCRP usa "n.d." cuando no hay dato


def main():
    hoy = ahora_lima()
    # La API devuelve las series ordenadas por código, no en el orden pedido
    claves = sorted(SERIES, key=lambda k: SERIES[k])
    url = API.format(codigos="-".join(SERIES[k] for k in claves), desde="2015-1", hasta=f"{hoy.year}-12")
    print("Descargando", url)
    d = json.loads(http(url, timeout=120).decode("utf-8", "replace"))

    meses = []
    for p in d["periods"]:
        nombre, anio = p["name"].split(".")
        valores = [num(v) for v in p["values"]]
        if valores[0] is None:
            continue
        meses.append({"mes": f"{anio}-{MESES[nombre[:3]]:02d}", **dict(zip(claves, valores))})
    if not meses:
        raise SystemExit("La API no devolvió datos")

    # Totales por año (solo años completos se marcan como tales)
    anios = {}
    for m in meses:
        a = anios.setdefault(m["mes"][:4], {"anio": int(m["mes"][:4]), "meses": 0, **{k: 0.0 for k in claves}})
        a["meses"] += 1
        for k in claves:
            a[k] += m[k] or 0
    for a in anios.values():
        for k in claves:
            a[k] = round(a[k], 1)
        a["completo"] = a["meses"] == 12

    ultimo = meses[-1]["mes"]
    anio_act, mes_act = int(ultimo[:4]), int(ultimo[5:])
    def acumulado(anio):
        return round(sum(m["total"] for m in meses if m["mes"][:4] == str(anio) and int(m["mes"][5:]) <= mes_act), 1)
    ytd, ytd_ant = acumulado(anio_act), acumulado(anio_act - 1)

    guardar_json("recaudacion.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/ingresos-tributarios-del-gobierno-central",
        "series": SERIES,
        "ultimoMes": ultimo,
        "acumulado": {"anio": anio_act, "hastaMes": mes_act, "total": ytd, "anterior": ytd_ant,
                      "variacion": round(100 * (ytd / ytd_ant - 1), 1) if ytd_ant else None},
        "anios": sorted(anios.values(), key=lambda a: a["anio"]),
        "meses": meses[-36:],
    })
    print(f"Último mes: {ultimo}. Acumulado {anio_act}: S/ {ytd:,.0f} M")


if __name__ == "__main__":
    sys.exit(main())
