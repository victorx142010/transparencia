"""
Informes de control de la Contraloría General de la República.

Fuente: Buscador de Informes de Servicios de Control (Contraloría), mediante el
mismo servicio público que usa su página (sin captcha). Para cada informe: entidad,
lugar, título, fecha, tipo de servicio, cuántas personas tienen presunta
responsabilidad (administrativa, civil o penal) y enlaces al PDF y al resumen.

Salida: data/control.json

Uso:  python scripts/actualizar_control.py [--anios 2025,2026]
"""
import argparse
import json
import sys
import time
from collections import Counter, defaultdict

from comun import ahora_lima, clave, guardar_json, http

API = "https://appbp.contraloria.gob.pe/BuscadorCGR/Informes/BusquedaInformesCGR.ashx"
TAM = 200
VACIOS = ["pFechaInicio", "pFechaHasta", "pEntidad", "pSector", "pModalidadServicio", "pReconstruccion",
          "pReconstruccionDepa", "pServicio", "pDepartamento", "pResponsabilidad", "pCovid", "pCovidDepa",
          "pNivelGobierno", "pProvincia", "pDistrito", "pAnioFinEjec", "pEsConResponsabilidad", "pEvento",
          "pOperativo", "pFechaInicioEjec", "pFechaFinEjec"]


def pagina(anio, n):
    datos = {"ActionPage": "TransportType", "Action": "loadInformesElastic", "PageSize": TAM, "PageNumber": n,
             "pGeneral": "", "pAnio": anio, **{k: "" for k in VACIOS}}
    return json.loads(http(API, data=datos, timeout=180).decode("utf-8", "replace") or "[]")


def main():
    ap = argparse.ArgumentParser()
    hoy = ahora_lima()
    ap.add_argument("--anios", default=f"{hoy.year - 1},{hoy.year}")
    args = ap.parse_args()

    informes, vistos = [], set()
    for anio in args.anios.split(","):
        n = 1
        while True:
            lote = pagina(anio, n)
            if not lote:
                break
            nuevos = 0
            for r in lote:
                cod = r.get("CodigoInforme")
                if not cod or cod in vistos:
                    continue
                vistos.add(cod)
                nuevos += 1
                resp = " ".join((r.get("Responsabilidad") or "").split())
                informes.append([
                    (r.get("FechaPublicacion") or r.get("FechaEmision") or "").replace("/", "-"),
                    (r.get("Entidad") or "").strip(),
                    (r.get("Departamento") or "").strip(), (r.get("Provincia") or "").strip(), (r.get("Distrito") or "").strip(),
                    (r.get("Descripcion") or "").strip()[:220],
                    (r.get("ModalidadServicio") or "").strip(),
                    int(r.get("TotalFuncionarios") or 0),
                    resp,
                    (r.get("NumeroInforme") or "").strip(),
                    r.get("RutaCloudInforme") or "",
                    r.get("RutaCloudResumen") or "",
                    (r.get("Sector") or "").strip(),
                ])
            print(f"  {anio} página {n}: +{nuevos}", flush=True)
            if len(lote) < TAM or nuevos == 0:
                break
            n += 1
            time.sleep(0.5)

    informes.sort(key=lambda r: r[0], reverse=True)
    con_resp = [r for r in informes if r[7] > 0]
    por_ent = defaultdict(lambda: [0, 0, 0])  # informes, con responsabilidad, personas
    for r in informes:
        x = por_ent[r[1]]
        x[0] += 1
        if r[7] > 0:
            x[1] += 1
            x[2] += r[7]
    tipos = Counter()
    for r in con_resp:
        for t in r[8].replace(",", " ").split():
            tipos[t.upper()] += 1
    guardar_json("control.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://buscadorinformes.contraloria.gob.pe/BuscadorCGR/Informes/inicio.html",
        "anios": args.anios,
        "total": len(informes),
        "conResponsabilidad": len(con_resp),
        "personas": sum(r[7] for r in informes),
        "tipos": tipos.most_common(),
        "porDepartamento": Counter(r[2] for r in informes if r[2]).most_common(),
        "topEntidades": sorted(([e, *v] for e, v in por_ent.items()), key=lambda x: (-x[3], -x[1]))[:60],
        "campos": ["fecha", "entidad", "departamento", "provincia", "distrito", "titulo", "modalidad", "personas",
                   "responsabilidad", "numero", "pdf", "resumen", "sector"],
        "informes": informes,
        "clavesEntidad": {clave(e): e for e in por_ent},
    })
    print(f"{len(informes):,} informes; {len(con_resp):,} con presunta responsabilidad")


if __name__ == "__main__":
    sys.exit(main())
