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

Uso:  python scripts/actualizar_sueldos.py [--solo 10031,145]
"""
import argparse
import csv
import io
import os
import statistics
import sys
import time

from comun import DATA, ahora_lima, guardar_json, http, leer_json

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


def resumir(id_ent, nombre, grupo, periodo, personas):
    totales = [p[6] for p in personas]
    return {
        "id": id_ent, "nombre": nombre, "grupo": grupo, "periodo": periodo,
        "personas": len(personas),
        "planilla": round(sum(totales)),
        "mediana": round(statistics.median(totales)) if totales else 0,
        "maximo": round(totales[0]) if totales else 0,
        "top": [[p[0], p[1], round(p[6])] for p in personas[:5]],
        "fuente": PAGINA.format(id=id_ent),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo", default="", help="ids separados por coma")
    args = ap.parse_args()
    solo = {int(x) for x in args.solo.split(",") if x}

    previo = {e["id"]: e for e in (leer_json("sueldos.json", {}) or {}).get("entidades", [])}
    hoy = ahora_lima()
    resumen = []
    os.makedirs(os.path.join(DATA, "sueldos"), exist_ok=True)

    for id_ent, nombre, grupo in ENTIDADES:
        if solo and id_ent not in solo:
            guardado = leer_json(f"sueldos/{id_ent}.json")
            if guardado:
                resumen.append(resumir(id_ent, nombre, grupo, guardado["periodo"], guardado["personas"]))
            elif id_ent in previo:
                resumen.append(previo[id_ent])
            continue
        # Buscar el mes más reciente publicado (las entidades publican con retraso)
        filas, periodo = [], None
        a, m = hoy.year, hoy.month
        for _ in range(6):
            try:
                filas = descargar(id_ent, a, m)
            except Exception as e:
                print(f"  ! {nombre} {a}-{m:02d}: {e}")
                filas = []
            if filas:
                periodo = f"{a}-{m:02d}"
                # Si el mes recién empezó a publicarse (muy pocas filas), usar el anterior
                pa, pm = (a, m - 1) if m > 1 else (a - 1, 12)
                try:
                    previas = descargar(id_ent, pa, pm)
                except Exception:
                    previas = []
                if len(previas) > 1.5 * len(filas):
                    filas, periodo = previas, f"{pa}-{pm:02d}"
                break
            m -= 1
            if m == 0:
                a, m = a - 1, 12
            time.sleep(0.5)
        if not filas:
            print(f"  - {nombre}: sin datos recientes; se conserva lo anterior")
            if id_ent in previo:
                resumen.append(previo[id_ent])
            continue

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
        if not personas:
            print(f"  - {nombre}: la planilla no trae montos; se omite")
            continue
        guardar_json(f"sueldos/{id_ent}.json", {
            "id": id_ent, "entidad": nombre, "periodo": periodo,
            "campos": ["nombre", "cargo", "dependencia", "regimen", "remuneracion", "otros", "total"],
            "personas": personas,
        })
        resumen.append(resumir(id_ent, nombre, grupo, periodo, personas))
        print(f"  + {nombre} ({periodo}): {len(personas)} personas, máx S/ {personas[0][6]:,.0f}")
        time.sleep(1)

    guardar_json("sueldos.json", {
        "actualizado": hoy.isoformat(timespec="minutes"),
        "fuente": "https://www.transparencia.gob.pe/",
        "entidades": resumen,
    })


if __name__ == "__main__":
    sys.exit(main())
