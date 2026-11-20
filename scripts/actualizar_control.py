"""
Informes de control de la Contraloría General de la República.

Fuente: Buscador de Informes de Servicios de Control (Contraloría), mediante el
mismo servicio público que usa su página (sin captcha). Para cada informe: entidad,
lugar, título, fecha, tipo de servicio, cuántas personas tienen presunta
responsabilidad (administrativa, civil o penal) y enlaces al PDF y al resumen.

Salidas:
  data/control.json            resumen para la web
  data/control/AAAA-MM.json    informes de cada mes ya descargados (para no volver a pedirlos)

Solo se vuelven a pedir los últimos RECIENTES meses (y los que falten); los anteriores se leen
de data/control/. Con --completo se vuelve a descargar todo.

Uso:  python scripts/actualizar_control.py [--anios 2025,2026] [--completo]
"""
import argparse
import json
import sys
import time
from collections import Counter, defaultdict

from comun import ahora_lima, clave, guardar_json, http, leer_json

API = "https://appbp.contraloria.gob.pe/BuscadorCGR/Informes/BusquedaInformesCGR.ashx"
TAM = 200
RECIENTES = 3  # meses que siempre se vuelven a pedir (se siguen publicando informes con fecha pasada)
VACIOS = ["pEntidad", "pSector", "pModalidadServicio", "pReconstruccion",
          "pReconstruccionDepa", "pServicio", "pDepartamento", "pResponsabilidad", "pCovid", "pCovidDepa",
          "pNivelGobierno", "pProvincia", "pDistrito", "pAnioFinEjec", "pEsConResponsabilidad", "pEvento",
          "pOperativo", "pFechaInicioEjec", "pFechaFinEjec"]


def pagina(desde, hasta, n):
    """Informes publicados entre dos fechas (dd/mm/aaaa). El filtro de año de la API no funciona; el de fechas sí."""
    datos = {"ActionPage": "TransportType", "Action": "loadInformesElastic", "PageSize": TAM, "PageNumber": n,
             "pGeneral": "", "pAnio": "", "pFechaInicio": desde, "pFechaHasta": hasta, **{k: "" for k in VACIOS}}
    return json.loads(http(API, data=datos, timeout=180).decode("utf-8", "replace") or "[]")


# Modalidades que son auditorías propiamente dichas (se muestran una por una). Las demás
# (orientaciones de oficio, visitas, control concurrente…) son muchísimas: se cuentan.
DETALLE = ("AUDITORIA CUMPLIMIENTO", "SERVICIO DE CONTROL ESPECÍFICO", "AUDITORIA DESEMPEÑO", "PRESTACIONES DE ADICIONALES")


def es_detalle(r):
    return r[7] > 0 or any(r[6].startswith(d) for d in DETALLE)


def resumir(informes, con_resp, tipos, por_ent, anios, hoy):
    detalle = [r for r in informes if es_detalle(r)]
    por_mod = Counter(r[6] for r in informes)
    por_dist = defaultdict(lambda: [0, 0])
    for r in informes:
        x = por_dist[f"{r[2]}|{r[3]}|{r[4]}"]
        x[0] += 1
        x[1] += r[7] > 0
    return {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://buscadorinformes.contraloria.gob.pe/BuscadorCGR/Informes/inicio.html",
        "anios": anios,
        "total": len(informes),
        "conResponsabilidad": len(con_resp),
        "personas": sum(r[7] for r in informes),
        "tipos": tipos.most_common(),
        "porModalidad": por_mod.most_common(),
        "porDepartamento": Counter(r[2] for r in informes if r[2]).most_common(),
        "topEntidades": sorted(([e, *v] for e, v in por_ent.items()), key=lambda x: (-x[3], -x[1]))[:60],
        "porEntidad": {e: v for e, v in por_ent.items()},
        "porDistrito": dict(por_dist),
        "campos": ["fecha", "entidad", "departamento", "provincia", "distrito", "titulo", "modalidad", "personas",
                   "responsabilidad", "numero", "pdf", "resumen", "sector"],
        "informes": detalle,
    }


def main():
    ap = argparse.ArgumentParser()
    hoy = ahora_lima()
    ap.add_argument("--anios", default=f"{hoy.year - 1},{hoy.year}")
    ap.add_argument("--completo", action="store_true", help="volver a descargar todos los meses")
    args = ap.parse_args()

    # Prueba rápida: desde servidores fuera del Perú (GitHub) el buscador no responde.
    # Mejor rendirse en segundos y conservar los datos anteriores que esperar 10 minutos.
    try:
        http("https://appbp.contraloria.gob.pe/BuscadorCGR/Informes/inicio.html", timeout=25, intentos=2)
    except Exception as e:
        # Aviso amarillo en GitHub (no error rojo): es algo esperado, no una falla del código.
        print(f"::warning title=Contraloría::No responde desde este servidor; se mantienen los datos anteriores. "
              f"Ejecuta este script desde una conexión en el Perú para actualizarlos. ({e})")
        return 0

    informes, vistos = [], set()
    nuevos_meses = 0
    import calendar
    meses = []
    for anio in sorted(int(a) for a in args.anios.split(",")):
        for m in range(1, 13):
            if (anio, m) <= (hoy.year, hoy.month):
                meses.append((anio, m))
    recientes = set(meses[-RECIENTES:])
    for anio, m in meses:
        guardado = None if args.completo or (anio, m) in recientes else leer_json(f"control/{anio}-{m:02d}.json")
        if guardado is not None:  # cada mes tiene sus propios informes (filtro por fecha): no se repiten
            informes.extend(guardado["informes"])
            continue
        nuevos_meses += 1
        del_mes = []
        desde = f"01/{m:02d}/{anio}"
        hasta = f"{calendar.monthrange(anio, m)[1]:02d}/{m:02d}/{anio}"
        n = 1
        while True:
            lote = pagina(desde, hasta, n)
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
                del_mes.append([
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
            if n == 1 or len(lote) < TAM:
                print(f"  {anio}-{m:02d} página {n}: +{nuevos}", flush=True)
            if len(lote) < TAM or nuevos == 0 or n > 100:
                break
            n += 1
            time.sleep(0.5)
        # Para el mes guardado basta lo que usa el resumen: título, número y enlaces solo de los que
        # se muestran uno por uno (así cada archivo pesa la cuarta parte).
        for r in del_mes:
            if not es_detalle(r):
                r[5] = r[10] = r[11] = ""
        guardar_json(f"control/{anio}-{m:02d}.json", {"mes": f"{anio}-{m:02d}", "informes": del_mes}, silencioso=True)
        informes.extend(del_mes)
    print(f"Meses descargados: {nuevos_meses} de {len(meses)} (el resto, de data/control/)")

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
    guardar_json("control.json", resumir(informes, con_resp, tipos, por_ent, args.anios, hoy))
    print(f"{len(informes):,} informes; {len(con_resp):,} con presunta responsabilidad")


if __name__ == "__main__":
    sys.exit(main())
