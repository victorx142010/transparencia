"""
Sueldos del personal de las principales entidades del Estado.

Fuente: Portal de Transparencia Estándar (transparencia.gob.pe), sección
"Personal" de cada entidad, que por Ley 27806 publica cada mes nombre, cargo,
dependencia y remuneración. Se usa su descarga oficial en CSV.

No se publica el DNI (el CSV oficial tampoco lo trae). Se excluye el régimen
de pensionistas: esta sección trata de sueldos.

Salidas:
  data/sueldos.json            resumen por entidad (para la web)
  data/sueldos/<id>.json       planilla completa de cada entidad (se carga al elegirla)

Además de la lista ENTIDADES, recorre el directorio del Portal de Transparencia
para sumar municipalidades distritales y provinciales y UGEL (más de 1,300).

Uso:  python scripts/actualizar_sueldos.py [--solo 10031,145] [--sin-directorio] [--max 50]
"""
import argparse
import csv
import io
import os
import html
import re
import statistics
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

from comun import DATA, ahora_lima, clave, guardar_json, http, leer_json

URL = ("https://www.transparencia.gob.pe/personal/pte_transparencia_personal_genera.aspx?id_entidad={id}"
       "&in_anno_consulta={anio}&ch_mes_consulta={mes:02d}&ch_tipo_regimen=0&vc_dni_funcionario="
       "&vc_nombre_funcionario=&ch_tipo_descarga=2")
PAGINA = "https://www.transparencia.gob.pe/personal/pte_transparencia_personal.aspx?id_entidad={id}&id_tema=32&ver=D"

# (id del Portal de Transparencia, nombre corto, grupo)
ENTIDADES = [
    (10031, "Despacho Presidencial", "Poder Ejecutivo"),
    (145, "Presidencia del Consejo de Ministros (PCM)", "Poder Ejecutivo"),
    (134, "Ministerio de Economía y Finanzas", "Ministerios"),
    (133, "Ministerio de Educación", "Ministerios"),
    (143, "Ministerio de Salud", "Ministerios"),
    (132, "Ministerio del Interior", "Ministerios"),
    (10011, "Ministerio de Defensa", "Ministerios"),
    (131, "Ministerio de Justicia y Derechos Humanos", "Ministerios"),
    (140, "Ministerio de Relaciones Exteriores", "Ministerios"),
    (144, "Ministerio de Transportes y Comunicaciones", "Ministerios"),
    (11476, "Ministerio de Vivienda, Construcción y Saneamiento", "Ministerios"),
    (137, "Ministerio de Energía y Minas", "Ministerios"),
    (139, "Ministerio de la Producción", "Ministerios"),
    (141, "Ministerio de Trabajo y Promoción del Empleo", "Ministerios"),
    (136, "Ministerio de Desarrollo Agrario y Riego", "Ministerios"),
    (14145, "Ministerio de Desarrollo e Inclusión Social", "Ministerios"),
    (142, "Ministerio de la Mujer y Poblaciones Vulnerables", "Ministerios"),
    (138, "Ministerio de Comercio Exterior y Turismo", "Ministerios"),
    (77, "Ministerio de Cultura", "Ministerios"),
    (127, "Ministerio del Ambiente", "Ministerios"),
    (16, "Congreso de la República (personal)", "Poder Legislativo"),
    (10051, "Poder Judicial", "Justicia"),
    (10044, "Ministerio Público – Fiscalía de la Nación", "Justicia"),
    (24, "Tribunal Constitucional", "Organismos autónomos"),
    (19, "Contraloría General de la República", "Organismos autónomos"),
    (23, "Defensoría del Pueblo", "Organismos autónomos"),
    (2022, "Jurado Nacional de Elecciones", "Organismos autónomos"),
    (5022, "ONPE", "Organismos autónomos"),
    (22, "RENIEC", "Organismos autónomos"),
    (146, "Banco Central de Reserva del Perú", "Organismos autónomos"),
    # SUNAT (id 83) no publica montos en el PTE: remite a su propia web.
    (1434, "Municipalidad Metropolitana de Lima", "Gobiernos locales"),
    (11796, "Gobierno Regional de Amazonas", "Gobiernos regionales"),
    (10129, "Gobierno Regional de Áncash", "Gobiernos regionales"),
    (10130, "Gobierno Regional de Apurímac", "Gobiernos regionales"),
    (10131, "Gobierno Regional de Arequipa", "Gobiernos regionales"),
    (10135, "Gobierno Regional de Ayacucho", "Gobiernos regionales"),
    (10137, "Gobierno Regional de Cajamarca", "Gobiernos regionales"),
    (180, "Gobierno Regional de Callao", "Gobiernos regionales"),
    (10139, "Gobierno Regional de Cusco", "Gobiernos regionales"),
    (10142, "Gobierno Regional de Huancavelica", "Gobiernos regionales"),
    (10146, "Gobierno Regional de Huánuco", "Gobiernos regionales"),
    (10147, "Gobierno Regional de Ica", "Gobiernos regionales"),
    (10148, "Gobierno Regional de Junín", "Gobiernos regionales"),
    (10149, "Gobierno Regional de La Libertad", "Gobiernos regionales"),
    (10151, "Gobierno Regional de Lambayeque", "Gobiernos regionales"),
    (10012, "Gobierno Regional de Lima (provincias)", "Gobiernos regionales"),
    (10152, "Gobierno Regional de Loreto", "Gobiernos regionales"),
    (10153, "Gobierno Regional de Madre de Dios", "Gobiernos regionales"),
    (10154, "Gobierno Regional de Moquegua", "Gobiernos regionales"),
    (10157, "Gobierno Regional de Pasco", "Gobiernos regionales"),
    (10161, "Gobierno Regional de Piura", "Gobiernos regionales"),
    (10163, "Gobierno Regional de Puno", "Gobiernos regionales"),
    (10166, "Gobierno Regional de San Martín", "Gobiernos regionales"),
    (10167, "Gobierno Regional de Tacna", "Gobiernos regionales"),
    (10170, "Gobierno Regional de Tumbes", "Gobiernos regionales"),
    (10174, "Gobierno Regional de Ucayali", "Gobiernos regionales"),
    (193, "Municipalidad Provincial de Chachapoyas", "Gobiernos locales"),
    (11824, "Municipalidad Provincial de Huaraz", "Gobiernos locales"),
    (11851, "Municipalidad Provincial de Abancay", "Gobiernos locales"),
    (11859, "Municipalidad Provincial de Arequipa", "Gobiernos locales"),
    (11868, "Municipalidad Provincial de Huamanga (Ayacucho)", "Gobiernos locales"),
    (739, "Municipalidad Provincial de Cajamarca", "Gobiernos locales"),
    (866, "Municipalidad Provincial de Callao", "Gobiernos locales"),
    (872, "Municipalidad Provincial de Cusco", "Gobiernos locales"),
    (980, "Municipalidad Provincial de Huancavelica", "Gobiernos locales"),
    (1073, "Municipalidad Provincial de Huánuco", "Gobiernos locales"),
    (1147, "Municipalidad Provincial de Ica", "Gobiernos locales"),
    (1190, "Municipalidad Provincial de Huancayo", "Gobiernos locales"),
    (1313, "Municipalidad Provincial de Trujillo", "Gobiernos locales"),
    (1396, "Municipalidad Provincial de Chiclayo", "Gobiernos locales"),
    (1605, "Municipalidad Provincial de Maynas (Iquitos)", "Gobiernos locales"),
    (1652, "Municipalidad Provincial de Tambopata (Puerto Maldonado)", "Gobiernos locales"),
    (1662, "Municipalidad Provincial de Mariscal Nieto (Moquegua)", "Gobiernos locales"),
    (1682, "Municipalidad Provincial de Pasco", "Gobiernos locales"),
    (1710, "Municipalidad Provincial de Piura", "Gobiernos locales"),
    (1772, "Municipalidad Provincial de Puno", "Gobiernos locales"),
    (12195, "Municipalidad Provincial de Moyobamba", "Gobiernos locales"),
    (1957, "Municipalidad Provincial de Tacna", "Gobiernos locales"),
    (1983, "Municipalidad Provincial de Tumbes", "Gobiernos locales"),
    (1995, "Municipalidad Provincial de Coronel Portillo (Pucallpa)", "Gobiernos locales"),
    (107, "EsSalud", "Organismos autónomos"),
    (10428, "Universidad Nacional Mayor de San Marcos", "Universidades"),
]
REGIMEN = {"1": "CAS", "2": "D. Leg. 276", "3": "728 / otros", "4": "PAC", "5": "FAG", "6": "PNUD",
           "7": "Alto funcionario", "8": "Pensionista", "9": "Ley Servir"}


def leer_csv(texto):
    """El CSV oficial a veces parte una fila en dos líneas (saltos de línea sin comillas)."""
    crudas = list(csv.reader(io.StringIO(texto)))
    if not crudas:
        return []
    cab, out, i = crudas[0], [], 1
    while i < len(crudas):
        r = crudas[i]
        while 0 < len(r) < len(cab) and i + 1 < len(crudas):
            sig = crudas[i + 1]
            r = r[:-1] + [(r[-1] + " " + sig[0]).strip()] + sig[1:] if sig else r
            i += 1
        if len(r) == len(cab):
            out.append(dict(zip(cab, r)))
        i += 1
    return out


def f(v):
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return 0.0


def descargar(id_ent, anio, mes):
    crudo = http(URL.format(id=id_ent, anio=anio, mes=mes), timeout=300)
    if not crudo.strip():
        return []
    return leer_csv(crudo.decode("utf-8-sig", "replace"))


DIRECTORIO = "https://www.transparencia.gob.pe/buscador/pte_transparencia_listado_entidades_poder.aspx?Tipo_Pod={tipo}"
DEPARTAMENTOS = ["AMAZONAS", "ANCASH", "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA", "CALLAO", "CUSCO", "HUANCAVELICA",
                 "HUANUCO", "ICA", "JUNIN", "LA LIBERTAD", "LAMBAYEQUE", "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA",
                 "PASCO", "PIURA", "PUNO", "SAN MARTIN", "TACNA", "TUMBES", "UCAYALI"]


def resumir(id_ent, nombre, grupo, periodo, personas, departamento="", top=5):
    totales = [p[6] for p in personas]
    return {
        "id": id_ent, "nombre": nombre, "grupo": grupo, "periodo": periodo, "departamento": departamento,
        "personas": len(personas),
        "planilla": round(sum(totales)),
        "mediana": round(statistics.median(totales)) if totales else 0,
        "maximo": round(totales[0]) if totales else 0,
        "top": [[p[0], p[1], round(p[6])] for p in personas[:top]],
        "fuente": PAGINA.format(id=id_ent),
    }


def directorio():
    """Municipalidades (distritales y provinciales) y UGEL del directorio del Portal de Transparencia."""
    # Mapas del MEF (data/entidades.json) para ubicar el departamento de cada entidad
    mef = (leer_json("entidades.json", {}) or {}).get("entidades", [])
    por_nombre, por_prov, por_dist = {}, {}, {}
    for e in mef:
        por_nombre.setdefault(clave(e[1]), set()).add(e[4])
        por_prov.setdefault(clave(e[5]), set()).add(e[4])
        por_dist.setdefault(clave(e[6]), set()).add(e[4])
    deps = {clave(d): d for d in DEPARTAMENTOS}

    def ubicar(nombre, lugar):
        base = re.sub(r"\s*\([^)]*\)\s*$", "", nombre).strip()
        partes = re.split(r"\s*-\s*", base)
        for parte in reversed(partes):
            if clave(parte) in deps:
                return deps[clave(parte)]
        for parte in reversed(partes[1:]):  # "BELLAVISTA-SULLANA": la provincia viene después del guion
            s = por_prov.get(clave(parte))
            if s and len(s) == 1:
                return next(iter(s))
        candidatos = [(por_nombre, clave(base))]
        sitio = re.sub(r"^(MUNICIPALIDAD (DISTRITAL|PROVINCIAL) DE[L]?|UNIDAD DE GESTI.N EDUCATIVA( LOCAL)?( DE)?|UGEL)\s*[-N°º0-9.\s]*",
                       "", base.split(" - ")[0], flags=re.I)
        candidatos.append((lugar, clave(sitio)))
        for mapa, k in candidatos:
            s = mapa.get(k)
            if s and len(s) == 1:
                return next(iter(s))
        return ""

    out = []
    for tipo in (5, 7):
        t = http(DIRECTORIO.format(tipo=tipo), timeout=120).decode("utf-8", "replace")
        vistos = set()
        for i, n in re.findall(r'id_entidad=(\d+)[^>]*>\s*(?:<[^>]+>\s*)*([^<]{3,160})', t):
            n = re.sub(r"\s+", " ", html.unescape(n)).strip()
            if i in vistos:
                continue
            vistos.add(i)
            u = clave(n)
            if tipo == 5 and "municipalidaddistrital" in u:
                out.append((int(i), n, "Municipalidades distritales", ubicar(n, por_dist)))
            elif tipo == 5 and "municipalidadprovincial" in u:
                out.append((int(i), n, "Municipalidades provinciales", ubicar(n, por_prov)))
            elif tipo == 7 and ("ugel" in u or "gestioneducativa" in u):
                out.append((int(i), n, "UGEL", ubicar(n, por_prov)))
    return out


def procesar(id_ent, nombre, hoy, meses_atras):
    """Descarga la planilla más reciente de una entidad. Devuelve (periodo, personas)."""
    filas, periodo = [], None
    a, m = hoy.year, hoy.month
    for _ in range(meses_atras):
        try:
            filas = descargar(id_ent, a, m)
        except Exception as e:
            print(f"  ! {nombre} {a}-{m:02d}: {e}")
            filas = []
        if filas:
            periodo = f"{a}-{m:02d}"
            pa, pm = (a, m - 1) if m > 1 else (a - 1, 12)
            try:
                previas = descargar(id_ent, pa, pm)
            except Exception:
                previas = []
            if len(previas) > 1.5 * len(filas):  # el mes recién empezó a publicarse
                filas, periodo = previas, f"{pa}-{pm:02d}"
            break
        m -= 1
        if m == 0:
            a, m = a - 1, 12
    personas = []
    for r in filas:
        reg = (r.get("VC_PERSONAL_REGIMEN_LABORAL") or "").strip()
        if reg == "8":
            continue  # pensionistas
        total = f(r.get("MO_PERSONAL_TOTAL"))
        if total <= 0:
            continue
        nombre_p = " ".join(x.strip() for x in (r.get("VC_PERSONAL_PATERNO"), r.get("VC_PERSONAL_MATERNO"), r.get("VC_PERSONAL_NOMBRES")) if x and x.strip())
        personas.append([
            nombre_p,
            (r.get("VC_PERSONAL_CARGO") or "").strip(),
            (r.get("VC_PERSONAL_DEPENDENCIA") or "").strip(),
            REGIMEN.get(reg, reg or "—"),
            f(r.get("MO_PERSONAL_REMUNERACIONES")) + f(r.get("MO_PERSONAL_HONORARIOS")),
            round(f(r.get("MO_PERSONAL_INCENTIVO")) + f(r.get("MO_PERSONAL_GRATIFICACION")) + f(r.get("MO_PERSONAL_OTROS_BENEFICIOS")), 2),
            total,
        ])
    personas.sort(key=lambda p: -p[6])
    return periodo, personas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo", default="", help="ids separados por coma (los demás se conservan)")
    ap.add_argument("--sin-directorio", action="store_true", help="solo las entidades principales")
    ap.add_argument("--max", type=int, default=0, help="máximo de entidades del directorio (pruebas)")
    ap.add_argument("--hilos", type=int, default=6)
    args = ap.parse_args()
    solo = {int(x) for x in args.solo.split(",") if x}

    previo = {e["id"]: e for e in (leer_json("sueldos.json", {}) or {}).get("entidades", [])}
    hoy = ahora_lima()
    os.makedirs(os.path.join(DATA, "sueldos"), exist_ok=True)

    tareas = [(i, n, g, "", 6, 5) for i, n, g in ENTIDADES]
    if not args.sin_directorio:
        principales = {i for i, _, _ in ENTIDADES}
        dirs = [d for d in directorio() if d[0] not in principales]
        if args.max:
            dirs = dirs[:args.max]
        print(f"Directorio: {len(dirs)} municipalidades y UGEL")
        tareas += [(i, n, g, dep, 4, 3) for i, n, g, dep in dirs]

    def conservar(id_ent, nombre, grupo, dep, top):
        guardado = leer_json(f"sueldos/{id_ent}.json")
        if guardado and guardado.get("personas"):
            return resumir(id_ent, nombre, grupo, guardado["periodo"], guardado["personas"], dep, top)
        return previo.get(id_ent)

    def trabajo(t):
        id_ent, nombre, grupo, dep, meses, top = t
        if solo and id_ent not in solo:
            return conservar(id_ent, nombre, grupo, dep, top)
        periodo, personas = procesar(id_ent, nombre, hoy, meses)
        if not personas:
            return conservar(id_ent, nombre, grupo, dep, top)
        guardar_json(f"sueldos/{id_ent}.json", {
            "id": id_ent, "entidad": nombre, "periodo": periodo,
            "campos": ["nombre", "cargo", "dependencia", "regimen", "remuneracion", "otros", "total"],
            "personas": personas,
        }, silencioso=True)
        return resumir(id_ent, nombre, grupo, periodo, personas, dep, top)

    resumen, hechos = [], 0
    with ThreadPoolExecutor(max_workers=args.hilos) as ex:
        futuros = {ex.submit(trabajo, t): t for t in tareas}
        for fu in as_completed(futuros):
            hechos += 1
            try:
                r = fu.result()
            except Exception as e:
                print(f"  ! {futuros[fu][1]}: {e}")
                r = None
            if r:
                resumen.append(r)
            if hechos % 50 == 0:
                print(f"  {hechos}/{len(tareas)} entidades revisadas, {len(resumen)} con planilla", flush=True)

    orden = {i: k for k, (i, _, _) in enumerate(ENTIDADES)}
    resumen.sort(key=lambda e: (orden.get(e["id"], 10**6), e["grupo"], e["nombre"]))
    print(f"{len(resumen)} entidades con planilla, {sum(e['personas'] for e in resumen):,} personas")
    guardar_json("sueldos.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://www.transparencia.gob.pe/",
        "entidades": resumen,
    })


if __name__ == "__main__":
    sys.exit(main())
