"""
Deuda pública del Perú (saldo trimestral, millones de soles), desde la API del BCRP.

Salida: data/deuda.json

Uso:  python scripts/actualizar_deuda.py
"""
import json
import sys

from comun import ahora_lima, guardar_json, http

API = "https://estadisticas.bcrp.gob.pe/estadisticas/series/api/{codigos}/json/2015-1/{hasta}"
SERIES = {
    "PN03371FQ": "Deuda pública total",
    "PN03372FQ": "Deuda externa",
    "PN03381FQ": "Deuda interna",
    "PN03374FQ": "Externa: organismos internacionales (BID, Banco Mundial, CAF…)",
    "PN03375FQ": "Externa: Club de París (otros gobiernos)",
    "PN03377FQ": "Externa: banca internacional",
    "PN03378FQ": "Externa: América Latina",
    "PN03380FQ": "Externa: bonos en el extranjero",
    "PN03376FQ": "Externa: proveedores",
    "PN03379FQ": "Externa: otros bilaterales",
}


def num(v):
    try:
        return round(float(v), 1)
    except (TypeError, ValueError):
        return None


def main():
    hoy = ahora_lima()
    codigos = sorted(SERIES)  # la API devuelve las series ordenadas por código
    d = json.loads(http(API.format(codigos="-".join(codigos), hasta=f"{hoy.year}-4"), timeout=120).decode("utf-8", "replace"))
    trimestres = []
    for p in d["periods"]:
        vals = dict(zip(codigos, (num(v) for v in p["values"])))
        if vals.get("PN03371FQ") is None:
            continue
        trimestres.append({"periodo": p["name"], **vals})
    ult = trimestres[-1]
    guardar_json("deuda.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://estadisticas.bcrp.gob.pe/estadisticas/series/trimestrales/deuda-publica",
        "nombres": SERIES,
        "ultimo": ult,
        "trimestres": trimestres,
    })
    print(f"Deuda pública al {ult['periodo']}: S/ {ult['PN03371FQ']:,.0f} millones")


if __name__ == "__main__":
    sys.exit(main())
