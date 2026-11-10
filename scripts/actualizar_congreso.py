"""
Asistencia a los Plenos del Senado y de la Cámara de Diputados.

Fuente: las ACTAS oficiales que cada cámara publica en PDF en su web
(senado.congreso.gob.pe y diputados.congreso.gob.pe). En cada acta figura:
  "se constató ... la asistencia de los siguientes senadores: A, B, C...
   CON LICENCIA OFICIAL, el senador X.  AUSENTES, los senadores Y, Z."

Las actas ya leídas se guardan en data/congreso_sesiones.json para no volver
a descargarlas. El resumen para la web va en data/congreso.json.

Uso:  python scripts/actualizar_congreso.py
"""
import io
import json
import re
import sys
from collections import defaultdict

from pypdf import PdfReader

from comun import ahora_lima, clave, guardar_json, http, leer_json

CAMARAS = {
    "senado": {"nombre": "Senado", "base": "https://senado.congreso.gob.pe", "miembro": "senador"},
    "diputados": {"nombre": "Cámara de Diputados", "base": "https://diputados.congreso.gob.pe", "miembro": "diputad"},
}
DESDE = "2026-07-01T00:00:00"  # inicio del Congreso bicameral
# Nombres de archivo de actas: "11_28.oct_.2026sen.pdf", "09-0622.oct_.2026-CD.pdf"
PATRON_ACTA = re.compile(r"^\d{1,3}[-_]\d{1,4}\.[a-z]+_?\.\d{4}(sen|senado|-cd|cd)(-\d+)?\.pdf$")
MESES = {m: i for i, m in enumerate(
    ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO",
     "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"], 1)}
MESES["SEPTIEMBRE"] = 9


def listar_pdfs(base):
    pagina, out = 1, []
    while True:
        url = (f"{base}/wp-json/wp/v2/media?mime_type=application/pdf&per_page=100&page={pagina}"
               f"&after={DESDE}&_fields=id,date,source_url")
        try:
            lote = json.loads(http(url))
        except Exception as e:  # página fuera de rango devuelve 400
            if pagina > 1:
                break
            raise e
        if not lote:
            break
        out.extend(lote)
        pagina += 1  # WordPress a veces devuelve <100 aunque haya más páginas
    return out


def texto_pdf(contenido, paginas=8):
    r = PdfReader(io.BytesIO(contenido))
    t = "\n".join((p.extract_text() or "") for p in r.pages[:paginas])
    t = re.sub(r"\s+", " ", t)
    # Quitar notas al pie que caen en medio de las listas
    t = re.sub(r"\d{1,2} Enlace del video de la sesi[oó]n:\s*\S+", " ", t)
    # Quitar encabezados de página que cortan las listas de nombres
    return re.sub(r"DEPARTAMENTO DE RELATOR[IÍ]A, AGENDA Y ACTAS .{0,140}?- \d+ -", " ", t)


def separar_nombres(s):
    s = s.split(".")[0]  # la lista termina en el primer punto
    # "el senador", "los diputados" (el PDF a veces parte palabras: "s enador")
    s = re.sub(r"^\s*(?:el|la|los|las)\s+(?:señor(?:es|as|a)?\s+)?(?:s\s?e\s?n\s?a\s?d\s?o\s?r\w*|d\s?i\s?p\s?u\s?t\s?a\s?d\w*)\s*",
               "", s, flags=re.I)
    s = s.strip(" .;:")
    if not s:
        return []
    partes = re.split(r",\s*|\s+y\s+(?=[A-ZÁÉÍÓÚÑ])", s)
    return [re.sub(r"\s+", " ", p).strip(" .") for p in partes if len(clave(p)) >= 4]


def parsear_acta(t, miembro):
    m = re.search(r"ACTA DE LA (\d{1,3})\s*\.?\s*[aªº°]?\s*SESI[OÓ]N", t)
    if not m:
        return None
    numero = int(m.group(1))
    # "28 DE OCTUBRE DE 2026" o "6 Y JUEVES 22 DE OCTUBRE DE 2026" (se toma el primer día)
    f = re.search(r"(\d{1,2})(?: Y [A-ZÁÉÍÓÚ]+ \d{1,2})? DE ([A-ZÁÉÍÓÚ]+) DE (20\d\d)", t[m.start():m.start() + 600])
    fecha = None
    if f and f.group(2) in MESES:
        fecha = f"{f.group(3)}-{MESES[f.group(2)]:02d}-{int(f.group(1)):02d}"

    # Senado: "la asistencia de los siguientes senadores:"
    # Diputados: "la presencia de los diputados siguientes:"
    ini = re.search(rf"(?:asistencia|presencia) de l[oa]s (?:siguientes )?{miembro}\w*(?: siguientes)?\s*:", t, re.I)
    if not ini:
        return None
    resto = t[ini.end():]
    fin = re.search(r"Se registr[oó]|Registrad[ao]|se inici[oó] la sesi[oó]n|con el qu[oó]rum", resto, re.I)
    bloque = resto[: fin.start() if fin else 4000]
    despues = resto[fin.start(): fin.start() + 1200] if fin else ""

    # Separar por marcadores en mayúsculas: "CON LICENCIA OFICIAL,", "AUSENTES,", "SUSPENDIDOS,"…
    trozos = re.split(r"((?:CON LICENCIA[A-ZÁÉÍÓÚ ]*|AUSENTES?|SUSPENDID[OA]S?|EN COMISI[OÓ]N[A-ZÁÉÍÓÚ ]*)\s*,)", bloque)
    estado = {}
    for n in separar_nombres(trozos[0]):
        estado[clave(n)] = ("presente", n)
    for k in range(1, len(trozos) - 1, 2):
        marca = trozos[k].upper()
        tipo = "ausente" if marca.startswith("AUSENTE") else "licencia" if "LICENCIA" in marca else "otro"
        for n in separar_nombres(trozos[k + 1]):
            estado[clave(n)] = (tipo, n)

    # Quien preside la sesión no figura en la lista pero está presente.
    antes = t[max(0, ini.start() - 700): ini.start() + 50]
    p = re.search(r"bajo la Presidencia de(?:l|\s+la)\s+\w+\s+(.+?)(?:\s+e integrando|,)", antes)
    if p:
        n = p.group(1).strip()
        estado[clave(n)] = ("presente", n)
    # "Presidida por el senador Miguel Ángel Torres Morales" -> "Torres Morales"
    pres = re.search(r"Presidida por (?:el|la|los|las) \w+ (.{5,160}?) -=o=-", t[:ini.start()])
    if pres:
        for completo in re.split(r"\s+y\s+|,\s*", pres.group(1)):
            n = " ".join(completo.split()[-2:])
            if len(n.split()) == 2:
                estado.setdefault(clave(n), ("presente", n))
    # "integrando la Mesa Directiva los senadores A y B, se constató…" / "…, el PRESIDENTE"
    mesa = re.search(r"integrando la Mesa Directiva (?:el|la|los|las) \w+ (.{5,200}?), (?:el PRESIDENTE|se constat|se registr)", antes)
    if mesa:
        for n in separar_nombres(mesa.group(1)):
            estado[clave(n)] = ("presente", n)
    # Asistencias registradas después: "Se registró la asistencia de 35 senadores, más los
    # senadores A, B y C, cuya constancia dejó la Presidencia" / "más la asistencia del senador X"
    for post in re.finditer(rf"más (?:la asistencia )?(?:de )?(?:l[oa]s|el|la|del)\s+{miembro}\w*\s+(.+?)(?:,\s*(?:cuya|según|quien)|\.)", despues):
        for n in separar_nombres(post.group(1)):
            estado[clave(n)] = ("presente", n)
    for post in re.finditer(rf"[Cc]on posterioridad[^.]{{0,120}}?asistencia\s+(?:de\s+)?(?:l[oa]s?|el)\s+{miembro}\w*\s+([^.]+)\.", despues):
        for n in separar_nombres(post.group(1)):
            estado[clave(n)] = ("presente", n)

    if len(estado) < 20:
        return None
    return {"numero": numero, "fecha": fecha, "estado": {k: list(v) for k, v in estado.items()}}


def main():
    cache = leer_json("congreso_sesiones.json", {"procesados": {}, "sesiones": {}})
    for cid, cam in CAMARAS.items():
        print(f"== {cam['nombre']}")
        pdfs = listar_pdfs(cam["base"])
        candidatos = [p for p in pdfs if PATRON_ACTA.match(p["source_url"].rsplit("/", 1)[-1].lower())]
        print(f"  {len(pdfs)} PDFs publicados, {len(candidatos)} parecen actas")
        for p in sorted(candidatos, key=lambda x: x["date"]):
            url = p["source_url"]
            if url in cache["procesados"]:
                continue
            try:
                acta = parsear_acta(texto_pdf(http(url, timeout=120)), cam["miembro"])
            except Exception as e:
                print(f"  ! {url}: {e}")
                continue
            if not acta:
                cache["procesados"][url] = None
                print(f"  - sin lista de asistencia: {url}")
                continue
            llave = f"{cid}-{acta['numero']}"
            acta.update(camara=cid, url=url)
            cache["sesiones"][llave] = acta  # una versión más nueva reemplaza a la anterior
            cache["procesados"][url] = llave
            c = defaultdict(int)
            for tipo, _ in acta["estado"].values():
                c[tipo] += 1
            print(f"  + sesión {acta['numero']} ({acta['fecha']}): {dict(c)}")
    guardar_json("congreso_sesiones.json", cache)

    # ---------- Resumen para la web ----------
    salida = {"actualizado": ahora_lima().isoformat(timespec="minutes"), "camaras": {}}
    for cid, cam in CAMARAS.items():
        sesiones = sorted((s for s in cache["sesiones"].values() if s["camara"] == cid),
                          key=lambda s: (s["fecha"] or "", s["numero"]))
        # Unificar apellidos abreviados ("Andrade Salguero" -> "Andrade Salguero de Alvarez")
        llaves = {k for s in sesiones for k in s["estado"]}
        alias = {}
        for k in llaves:
            largos = [o for o in llaves if o != k and o.startswith(k)]
            if len(largos) == 1:
                alias[k] = largos[0]
        personas = {}
        for s in sesiones:
            for k, (tipo, nombre) in s["estado"].items():
                k = alias.get(k, k)
                p = personas.setdefault(k, {"nombre": nombre, "presente": 0, "licencia": 0, "ausente": 0, "otro": 0})
                p[tipo] += 1
                if nombre.count(" ") < p["nombre"].count(" "):  # el PDF a veces parte palabras
                    p["nombre"] = nombre
        lista = []
        for p in personas.values():
            total = p["presente"] + p["licencia"] + p["ausente"] + p["otro"]
            p["sesiones"] = total
            p["pct"] = round(100 * p["presente"] / total, 1) if total else 0
            lista.append(p)
        lista.sort(key=lambda p: (p["pct"], -p["ausente"]))
        resumen = [{"numero": s["numero"], "fecha": s["fecha"], "url": s["url"],
                    "presentes": sum(1 for t, _ in s["estado"].values() if t == "presente"),
                    "licencias": sum(1 for t, _ in s["estado"].values() if t == "licencia"),
                    "ausentes": sum(1 for t, _ in s["estado"].values() if t == "ausente")} for s in sesiones]
        salida["camaras"][cid] = {"nombre": cam["nombre"], "sesiones": resumen, "miembros": lista,
                                  "fuente": cam["base"]}
    guardar_json("congreso.json", salida)


if __name__ == "__main__":
    sys.exit(main())
