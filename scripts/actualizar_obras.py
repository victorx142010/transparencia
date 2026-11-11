"""
Obras públicas paralizadas en el Perú.

Fuente: "Informe de Obras Paralizadas en el Territorio Nacional" de la Contraloría
General de la República (trimestral, en gob.pe). Se descarga su anexo en Excel con
la base de datos de obras paralizadas (con CUI, entidad, avance, causal, etc.).

Salida: data/obras.json

Uso:  python scripts/actualizar_obras.py
"""
import html
import io
import re
import sys
from collections import Counter

from openpyxl import load_workbook

from comun import ahora_lima, clave, guardar_json, http

BUSQUEDA = ("https://www.gob.pe/busquedas?contenido%5B%5D=publicaciones&institucion%5B%5D=contraloria"
            "&term=obras%20paralizadas&sort_by=recent")
BASE = "https://www.gob.pe"


def ultimo_informe():
    t = http(BUSQUEDA, timeout=90).decode("utf-8", "replace")
    enlaces = sorted(set(re.findall(r'/institucion/contraloria/informes-publicaciones/(\d+)-(informe-de-obras[a-z0-9-]*paralizadas[a-z0-9-]*)', t)),
                     key=lambda x: -int(x[0]))
    if not enlaces:
        raise SystemExit("No se encontró el informe de obras paralizadas en gob.pe")
    pid, slug = enlaces[0]
    url = f"{BASE}/institucion/contraloria/informes-publicaciones/{pid}-{slug}"
    pagina = http(url, timeout=90).decode("utf-8", "replace")
    xlsx = sorted(set(re.findall(r'https://cdn\.www\.gob\.pe/uploads/document/file/[^"?\s]+\.xlsx', pagina, re.I)))
    # El anexo con la base de obras (no el de servicios de control ni el resumen por departamento)
    candidatos = [u for u in xlsx if "obra" in u.lower() and "servicios-de-control" not in u.lower() and "principales" not in u.lower()]
    if not candidatos:
        raise SystemExit(f"No se encontró el Excel de obras en {url}")
    titulo = slug.replace("-", " ").capitalize()
    return url, candidatos[0], titulo


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def main():
    url_inf, url_xlsx, titulo = ultimo_informe()
    print("Informe:", titulo, "\nExcel:", url_xlsx)
    wb = load_workbook(io.BytesIO(http(url_xlsx, timeout=180)), read_only=True, data_only=True)
    ws = wb.worksheets[0]
    filas = ws.iter_rows(values_only=True)
    cab = None
    for fila in filas:  # la cabecera puede no estar en la primera fila
        if fila and any(isinstance(c, str) and c.strip().upper() == "CUI" for c in fila):
            cab = [clave(str(c or "")) for c in fila]
            break
    if not cab:
        raise SystemExit("No se encontró la cabecera con CUI")

    def col(*nombres):
        for nmb in nombres:
            k = clave(nmb)
            for j, c in enumerate(cab):
                if c.startswith(k):
                    return j
        return None

    J = {
        "cui": col("CUI"), "infobras": col("CODIGO INFOBRAS"), "nombre": col("DESCRIPCION OBRA", "DESCRIPCION DE INVERSION"),
        "entidad": col("ENTIDAD"), "modalidad": col("MODALIDAD DE EJECUCION"), "costo": col("COSTO DE OBRA"), "costoInv": col("COSTO ACTUALIZADO"),
        "saldo": col("SALDO DE OBRA"), "saldoInv": col("SALDO DE LA INVERSION"), "pim": col("PIM"), "tipo": col("TIPO DE OBRA"),
        "dep": col("DEPARTAMENTO"), "prov": col("PROVINCIA"), "dist": col("DISTRITO"), "inicio": col("ANO INICIO OBRA", "AÑO INICIO"),
        "avance": col("AVANCE FISICO"), "nivel": col("NIVEL DE GOBIERNO"), "causal": col("CAUSAL PARALIZACION"),
    }
    obras = []
    for f in filas:
        if not f or J["cui"] is None or f[J["cui"]] in (None, ""):
            continue
        g = lambda k: f[J[k]] if J[k] is not None and J[k] < len(f) else None
        causal = re.sub(r"^\d+\s*", "", str(g("causal") or "")).strip().capitalize()
        obras.append({
            "cui": str(g("cui")).split(".")[0],
            "infobras": str(g("infobras") or "").split(".")[0],
            "nombre": str(g("nombre") or "").strip(),
            "entidad": str(g("entidad") or "").strip(),
            "modalidad": str(g("modalidad") or "").strip(),
            "costo": round(num(g("costo"))),
            "saldo": round(num(g("saldo"))),
            "costoInversion": round(num(g("costoInv"))),
            "saldoInversion": round(num(g("saldoInv"))),
            "pim": round(num(g("pim"))),
            "tipo": str(g("tipo") or "").strip(),
            "departamento": str(g("dep") or "").strip(),
            "provincia": str(g("prov") or "").strip(),
            "distrito": str(g("dist") or "").strip(),
            "inicio": int(num(g("inicio"))) or None,
            "avance": round(num(g("avance")), 1),
            "nivel": str(g("nivel") or "").strip(),
            "causal": causal,
        })
    obras.sort(key=lambda o: -o["costo"])
    guardar_json("obras.json", {
        "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "informe": titulo, "fuente": url_inf, "excel": url_xlsx,
        "total": len(obras),
        "costoObras": sum(o["costo"] for o in obras),
        "saldoObras": sum(o["saldo"] for o in obras),
        "costoInversiones": sum(o["costoInversion"] for o in obras),
        "saldoInversiones": sum(o["saldoInversion"] for o in obras),
        "porDepartamento": Counter(o["departamento"] for o in obras).most_common(),
        "porCausal": Counter(o["causal"] for o in obras if o["causal"]).most_common(12),
        "porNivel": Counter(o["nivel"] for o in obras).most_common(),
        "porTipo": Counter(o["tipo"] for o in obras).most_common(12),
        "obras": obras,
    })
    print(f"{len(obras)} obras paralizadas")


if __name__ == "__main__":
    sys.exit(main())
