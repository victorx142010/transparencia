"""
Contratos del Estado: quién vende, a qué entidad, por cuánto y para qué.

Fuente: OECE (antes OSCE) — Portal de Contrataciones Abiertas, estándar OCDS.
Se descargan los paquetes CSV mensuales del año (procesos registrados en el SEACE:
licitaciones, concursos, adjudicaciones simplificadas, comparaciones de precios…).
No incluye compras menores a 8 UIT (órdenes de compra/servicio directas).

Si el portal del OECE rechaza la conexión (pasa desde servidores fuera del Perú, como
GitHub Actions), se usa el espejo público de Open Contracting Partnership, que copia
los mismos datos del OECE una vez al mes: https://data.open-contracting.org/

Salidas:
  data/contratos.json          resumen (proveedores, entidades, tipos, meses)
  data/contratos/<mes>.json    todas las adjudicaciones del año, por mes (buscador)

Uso:  python scripts/actualizar_contratos.py [--anio 2026]
"""
import argparse
import codecs
import csv
import io
import json
import os
import sys
import tarfile
import zipfile
from collections import Counter, defaultdict

from comun import DATA, ahora_lima, guardar_json, http, leer_json

ARCHIVOS = "https://contratacionesabiertas.oece.gob.pe/api/v1/files?page={p}&paginateBy=50&source=seace_v3"
ESPEJO = "https://data.open-contracting.org/en/publication/135/download?name={anio}.csv.tar.gz"
CATEGORIA = {"goods": "Bienes", "services": "Servicios", "works": "Obras", "consultingServices": "Consultoría"}

csv.field_size_limit(10_000_000)


def leer(z, nombre):
    with z.open(nombre) as f:
        yield from csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace", newline=""))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def meses_del_anio(anio):
    """Los paquetes vienen del más reciente al más antiguo."""
    out, p = [], 1
    while True:
        d = json.loads(http(ARCHIVOS.format(p=p), timeout=90).decode("utf-8"))
        res = d.get("results", [])
        out += [(r["month"], r["files"]["csv"]) for r in res if r.get("year") == str(anio)]
        if not res or not (d.get("pagination") or {}).get("has_next") or int(res[-1]["year"]) < anio:
            break
        p += 1
    return sorted(set(out))


def proceso(entidad, titulo, objeto, metodo, categoria, vr, postores):
    return {"entidad": (entidad or "").strip(), "titulo": (titulo or "").strip(), "objeto": (objeto or "").strip(),
            "metodo": (metodo or "").strip(), "categoria": CATEGORIA.get(categoria or "", "Otros"),
            "vr": num(vr), "postores": int(num(postores))}


def desde_oece(anio):
    meses = meses_del_anio(anio)
    print(f"Paquetes de {anio}: {[m for m, _ in meses]}")
    procesos = {}   # ocid -> info del proceso
    awards = {}     # award id -> [ocid, fecha, monto, moneda]
    proveedores = {}  # award id -> (ruc, nombre)
    for mes, url in meses:
        try:
            z = zipfile.ZipFile(io.BytesIO(http(url, timeout=600)))
        except Exception as e:
            print(f"  ! {mes}: {e}")
            continue
        n = len(awards)
        for r in leer(z, "records.csv"):
            g = lambda c: r.get("compiledRelease/tender/" + c)
            procesos[r["ocid"]] = proceso(r.get("compiledRelease/buyer/name"), g("title"), g("description"),
                                          g("procurementMethodDetails"), g("mainProcurementCategory"),
                                          g("value/amount_PEN") or g("value/amount"), g("numberOfTenderers"))
        for r in leer(z, "com_awards.csv"):
            aid = r.get("compiledRelease/awards/0/id")
            fecha = (r.get("compiledRelease/awards/0/date") or "")[:10]
            if not aid or not fecha.startswith(str(anio)):
                continue
            awards[aid] = [r["ocid"], fecha, num(r.get("compiledRelease/awards/0/value/amount")),
                           r.get("compiledRelease/awards/0/value/currency") or "PEN"]
        for r in leer(z, "com_awa_suppliers.csv"):
            aid = r.get("compiledRelease/awards/0/id")
            if aid:
                ruc = (r.get("compiledRelease/awards/0/suppliers/0/id") or "").replace("PE-RUC-", "")
                proveedores[aid] = (ruc, (r.get("compiledRelease/awards/0/suppliers/0/name") or "").strip())
        print(f"  {anio}-{mes}: +{len(awards) - n} adjudicaciones")
    if not awards:
        raise RuntimeError("el OECE no entregó adjudicaciones")
    return procesos, awards, proveedores, "https://contratacionesabiertas.oece.gob.pe/"


def desde_espejo(anio, archivo=None):
    """Mismos datos del OECE, copiados cada mes por Open Contracting Partnership (CSV aplanado)."""
    origen = open(archivo, "rb") if archivo else http(ESPEJO.format(anio=anio), timeout=900, stream=True)
    procesos, awards, proveedores = {}, {}, {}
    with tarfile.open(fileobj=origen, mode="r|gz") as tar:  # se lee en flujo, sin guardar el archivo
        for m in tar:
            nombre = m.name.rsplit("/", 1)[-1]
            if nombre not in ("main.csv", "awards.csv", "awards_suppliers.csv"):
                continue
            f = codecs.iterdecode(tar.extractfile(m), "utf-8", errors="replace")
            for r in csv.DictReader(f):
                if nombre == "main.csv":
                    procesos[r["ocid"]] = proceso(r.get("buyer_name"), r.get("tender_title"), r.get("tender_description"),
                                                  r.get("tender_procurementMethodDetails"), r.get("tender_mainProcurementCategory"),
                                                  r.get("tender_value_amount_PEN") or r.get("tender_value_amount"),
                                                  r.get("tender_numberOfTenderers"))
                elif nombre == "awards.csv":
                    fecha = (r.get("date") or "")[:10]
                    if r.get("id") and fecha.startswith(str(anio)):
                        awards[r["id"]] = [r["main_ocid"], fecha, num(r.get("value_amount")), r.get("value_currency") or "PEN"]
                elif r.get("awards_id"):
                    proveedores[r["awards_id"]] = ((r.get("id") or "").replace("PE-RUC-", ""), (r.get("name") or "").strip())
            print(f"  espejo {nombre}: listo")
    if not awards:
        raise RuntimeError("el espejo no trae adjudicaciones")
    return procesos, awards, proveedores, "https://data.open-contracting.org/en/publication/135"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anio", type=int, default=ahora_lima().year)
    ap.add_argument("--espejo", action="store_true", help="usar directamente el espejo de Open Contracting")
    args = ap.parse_args()

    try:
        if args.espejo:
            raise RuntimeError("se pidió el espejo")
        procesos, awards, proveedores, fuente = desde_oece(args.anio)
    except Exception as e:
        print(f"OECE no disponible ({e}); usando el espejo de Open Contracting…")
        procesos, awards, proveedores, fuente = desde_espejo(args.anio)

    lista = []
    for aid, (ocid, fecha, monto, moneda) in awards.items():
        if monto <= 0 or moneda != "PEN":
            continue  # solo montos en soles (los de otra moneda son pocos)
        pr = procesos.get(ocid, {})
        ruc, prov = proveedores.get(aid, ("", ""))
        lista.append([fecha, pr.get("entidad", ""), prov, ruc, round(monto), pr.get("objeto") or pr.get("titulo", ""),
                      pr.get("metodo", ""), pr.get("categoria", ""), ocid])
    lista.sort(key=lambda r: (r[0], r[4]), reverse=True)
    previo = leer_json("contratos.json", {})
    if "open-contracting" in fuente and previo.get("anio") == args.anio and previo.get("total", 0) > len(lista):
        # El espejo se publica una vez al mes: si ya tenemos datos más completos, no retroceder.
        print(f"El espejo ({len(lista):,}) es más antiguo que los datos actuales ({previo['total']:,}); no se cambia nada.")
        return 0

    # ---------- Señales de alerta (no prueban irregularidades: indican qué revisar) ----------
    # U = un solo postor en un proceso competitivo; D = contratación directa (sin competencia);
    # S = adjudicado más de 10% por encima del valor referencial; C = la misma empresa ganó 5+
    # contratos de la misma entidad en el año.
    SIN_COMPETENCIA = ("Contratación Directa", "Convenio", "Regímen Especial", "Régimen Especial", "Contratación Internacional")
    gana = Counter((r[1], r[3] or r[2]) for r in lista)
    for r in lista:
        pr = procesos.get(r[8], {})
        f = ""
        if r[6] == "Contratación Directa":
            f += "D"
        elif pr.get("postores") == 1 and r[6] not in SIN_COMPETENCIA:
            f += "U"
        if pr.get("vr", 0) > 0 and r[4] > pr["vr"] * 1.10:
            f += "S"
        if gana[(r[1], r[3] or r[2])] >= 5:
            f += "C"
        r.append(f)

    por_prov = defaultdict(lambda: [0.0, 0, set(), ""])
    por_ent = defaultdict(lambda: [0.0, 0])
    for f, ent, prov, ruc, monto, *_ in lista:
        k = ruc or prov
        x = por_prov[k]
        x[0] += monto; x[1] += 1; x[2].add(ent); x[3] = prov
        por_ent[ent][0] += monto; por_ent[ent][1] += 1
    top_prov = sorted(([k, v[3], round(v[0]), v[1], len(v[2])] for k, v in por_prov.items()), key=lambda r: -r[2])[:100]
    top_ent = sorted(([k, round(v[0]), v[1]] for k, v in por_ent.items()), key=lambda r: -r[1])[:60]
    por_cat, por_met, por_mes = Counter(), Counter(), Counter()
    for r in lista:
        por_cat[r[7]] += r[4]; por_met[r[6]] += r[4]; por_mes[r[0][:7]] += r[4]

    # Lista completa repartida por mes (la web la carga por partes)
    os.makedirs(os.path.join(DATA, "contratos"), exist_ok=True)
    por_mes_lista = defaultdict(list)
    for r in lista:
        r[5] = r[5][:200]
        r[8] = r[8].replace("ocds-dgv273-", "")
        por_mes_lista[r[0][:7]].append(r)
    for m, filas in por_mes_lista.items():
        guardar_json(f"contratos/{m}.json", {"mes": m, "contratos": filas})
    guardar_json("contratos.json", {
        "anio": args.anio, "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "fuente": fuente,
        "total": len(lista), "monto": round(sum(r[4] for r in lista)),
        "proveedoresDistintos": len(por_prov), "entidadesDistintas": len(por_ent),
        "topProveedores": top_prov, "topEntidades": top_ent,
        "porCategoria": por_cat.most_common(), "porMetodo": por_met.most_common(12),
        "porMes": sorted(por_mes.items()),
        "archivosMes": sorted(por_mes_lista),
        "campos": ["fecha", "entidad", "proveedor", "ruc", "monto", "objeto", "metodo", "categoria", "ocid", "alertas"],
        "alertas": {
            k: {"contratos": sum(1 for r in lista if k in r[9]), "monto": round(sum(r[4] for r in lista if k in r[9]))}
            for k in "UDSC"
        },
        "conAlertas": sorted((r for r in lista if r[9]), key=lambda r: (-len(r[9]), -r[4]))[:200],
        "entidadesAlerta": sorted(
            ([e, n, round(m)] for e, (n, m) in (lambda d: d)(
                {e: (sum(1 for r in lista if r[1] == e and r[9]), sum(r[4] for r in lista if r[1] == e and r[9])) for e in {r[1] for r in lista if r[9]}}
            ).items()), key=lambda x: -x[2])[:40],
        "mayores": sorted(lista, key=lambda r: -r[4])[:50],
        "urlProceso": "https://contratacionesabiertas.oece.gob.pe/proceso/ocds-dgv273-",
    })
    print(f"{len(lista):,} adjudicaciones, S/ {sum(r[4] for r in lista):,.0f}")


if __name__ == "__main__":
    sys.exit(main())
