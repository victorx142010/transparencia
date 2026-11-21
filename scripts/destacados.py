"""
"Lo importante esta semana": titulares escritos solos a partir de los datos ya descargados.

Cada titular es una frase corta en lenguaje simple con lo más relevante de una fuente,
una cifra grande, un detalle, un enlace para ver más en el portal y la fuente oficial.
Lo usa actualizar_resumen.py (va en data/resumen.json, que carga la portada).
"""
import re
from collections import defaultdict
from datetime import date

MENORES = {"de", "del", "la", "las", "los", "el", "y", "e", "en", "a", "al", "para", "por", "con", "sin"}
SIGLAS = {"ANIN", "SIS", "MTC", "SUNAT", "PCM", "UGEL", "MINSA", "MEF", "ONP", "INPE", "PNP", "SAC", "SRL", "EIRL", "SA",
          "SUNARP", "OSCE", "OECE", "RENIEC", "JNE", "ONPE", "INEI", "SENAMHI", "DEVIDA", "PRONIED", "SENASA", "SEDAPAL",
          "II", "III", "IV", "S.A.C.", "S.R.L.", "E.I.R.L.", "S.A."}


def bonito(t):
    """'MUNICIPALIDAD PROVINCIAL DE PUNO' -> 'Municipalidad Provincial de Puno'."""
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    t = re.sub(r"^M\. DE ", "MINISTERIO DE ", t)  # pliegos abreviados: "M. DE SALUD"
    partes = t.split(" - ")
    if len(partes) > 1 and len(partes[-1]) < 30:  # "UGEL LORETO NAUTA - UGEL LORETO" -> sin la sigla repetida
        t = " - ".join(partes[:-1])
    out = []
    for i, w in enumerate(t.split(" ")):
        lw = w.lower()
        if w.upper().strip(",") in SIGLAS or re.fullmatch(r"(?:[A-Za-z]\.){1,4}[A-Za-z]?\.?", w):
            out.append(w.upper())
        elif i and lw in MENORES:
            out.append(lw)
        else:
            out.append("-".join(x[:1].upper() + x[1:] for x in lw.split("-")))
    return " ".join(out)


def frase(t, n=110):
    """Recorta una descripción larga (a menudo en mayúsculas) a una frase legible."""
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    t = re.split(r"\s+(?:EN LA LOCALIDAD|EN EL DISTRITO|EN LOS DISTRITOS|- DISTRITO|DISTRITO DE|, DISTRITO)\b", t,
                 maxsplit=1, flags=re.I)[0]
    if t.isupper():
        t = t.lower()
    t = t[:1].upper() + t[1:]
    if len(t) > n:
        t = t[:n - 1].rsplit(" ", 1)[0].rstrip(" ,;:-") + "…"
    return t.rstrip(".")


def soles(n):
    n = float(n or 0)
    if n >= 1e9:
        return f"S/ {n / 1e9:,.1f} mil millones".replace(".0 ", " ")
    if n >= 1e6:
        return f"S/ {n / 1e6:,.1f} millones".replace(".0 ", " ")
    if n >= 1e3:
        return f"S/ {n / 1e3:,.0f} mil"
    return f"S/ {n:,.0f}"


def fecha_de(s):
    try:
        return date.fromisoformat(str(s)[:10])
    except ValueError:
        return None


def _y(lista):
    return lista[0] if len(lista) == 1 else ", ".join(lista[:-1]) + " y " + lista[-1]


def contraloria(f, hoy):
    ctrl = f.get("control") or {}
    ultimo = fecha_de(ctrl.get("actualizado")) or hoy
    con = [r for r in ctrl.get("informes", []) if r[7] > 0 and fecha_de(r[0])]
    for dias in (14, 30, 60):
        recientes = [r for r in con if (ultimo - fecha_de(r[0])).days <= dias]
        if not recientes:
            continue
        r = max(recientes, key=lambda r: ("PENAL" in r[8]) * 1000 + r[7])
        tipos = [t.lower() for t in ("PENAL", "CIVIL", "ADMINISTRATIVO") if t in r[8]] or ["administrativa"]
        tipos = [t.replace("administrativo", "administrativa") for t in tipos]
        lugar = bonito(r[4] or r[3] or r[2])
        n = r[7]
        return {
            "tema": "control", "fecha": r[0],
            "titular": f"La Contraloría señaló a {n} funcionario{'s' if n != 1 else ''} con presunta responsabilidad {_y(tipos)} en {bonito(r[1])}.",
            "cifra": str(n), "cifraTxt": "funcionarios señalados" if n != 1 else "funcionario señalado",
            "detalle": f"{frase(r[5], 150)} ({lugar}).",
            "enlace": f"#control?q={r[9]}",
            "fuente": {"nombre": f"Informe {r[9]}", "url": r[10] or ctrl.get("fuente")},
        }


def contratos(f, hoy):
    c = f.get("contratos") or {}
    ultimo = fecha_de(c.get("actualizado")) or hoy
    cand = [r for r in c.get("conAlertas", []) if fecha_de(r[0]) and any(k in (r[9] or "") for k in "DU")]
    for dias in (31, 62, 366):
        rec = [r for r in cand if (ultimo - fecha_de(r[0])).days <= dias]
        if not rec:
            continue
        r = max(rec, key=lambda r: r[4])
        directa = "D" in r[9]
        motivo = "por contratación directa, sin competencia" if directa else "siendo el único postor"
        extra = ", por encima del valor referencial" if "S" in r[9] else ""
        ocid = r[8].split("-", 1)[-1] if r[8] else ""
        return {
            "tema": "contratos", "fecha": r[0],
            "titular": f"{bonito(r[2])} ganó un contrato de {soles(r[4])} con {bonito(r[1])} {motivo}{extra}.",
            "cifra": soles(r[4]), "cifraTxt": "sin competencia" if directa else "un solo postor", "monto": r[4],
            "detalle": frase(r[5], 150) + ".",
            "enlace": f"#contratos?q={r[3] or r[2]}",
            "fuente": {"nombre": "Proceso en el SEACE", "url": (c.get("urlProceso") or "") + ocid if ocid else c.get("fuente")},
        }


def gasto(f, hoy):
    ent = (f.get("entidades") or {}).get("entidades") or []
    pres = f.get("presupuesto") or {}
    por_pliego = defaultdict(lambda: [0, 0])
    for e in ent:
        if e[3] in ("GOBIERNO NACIONAL", "GOBIERNOS REGIONALES") and e[2]:
            x = por_pliego[e[2]]
            x[0] += e[7] or 0
            x[1] += e[8] or 0
    grandes = [(p, pim, dev) for p, (pim, dev) in por_pliego.items() if pim >= 1e9]
    if not grandes:
        return None
    p, pim, dev = min(grandes, key=lambda x: x[2] / x[1])
    anio = pres.get("anio") or hoy.year
    pct = round(100 * dev / pim)
    pasado = round(100 * hoy.timetuple().tm_yday / 365)
    semanas = max(0, (date(anio, 12, 31) - hoy).days // 7)
    if hoy.month >= 9 and semanas:
        titular = f"Quedan {semanas} semanas para cerrar {anio} y {bonito(p)} solo gastó el {pct}% de su presupuesto."
    else:
        titular = f"Ya pasó el {pasado}% del año y {bonito(p)} solo gastó el {pct}% de su presupuesto."
    return {
        "tema": "gasto", "fecha": str(pres.get("actualizado", ""))[:10],
        "titular": titular,
        "cifra": f"{pct}%", "cifraTxt": "del presupuesto gastado", "monto": pim - dev, "montoTxt": "sin usar",
        "detalle": f"Tiene {soles(pim)} para este año y le quedan {soles(pim - dev)} sin usar. De las entidades con más de S/ 1,000 millones, es la más atrasada.",
        "enlace": f"#entidades?q={p}",
        "fuente": {"nombre": "Presupuesto y gasto del MEF", "url": pres.get("fuente") or "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx"},
    }


def congreso(f, hoy):
    cg = (f.get("congreso") or {}).get("camaras") or {}
    peor = None
    for cid, cam in cg.items():
        for m in cam.get("miembros", []):
            if m.get("sesiones", 0) >= 4 and (peor is None or (m["ausente"], -m["pct"]) > (peor[1]["ausente"], -peor[1]["pct"])):
                peor = (cid, m)
    if not peor or peor[1]["ausente"] < 2:
        return None
    cid, m = peor
    # Nombre completo desde las fichas oficiales; sin "el/la" porque no guardamos el género
    clave = lambda t: re.sub(r"[^a-z]", "", str(t).lower().translate(str.maketrans("áéíóúüñ", "aeiouun")))
    ficha = next((p for p in cg[cid].get("integrantes", []) if p.get("clave") == clave(m["nombre"])), None)
    nombre = f"{ficha['nombres']} {ficha['apellidos']}" if ficha else m["nombre"]
    camara = "En el Senado" if cid == "senado" else "En la Cámara de Diputados"
    banc = f" ({m['bancada']})" if m.get("bancada") else ""
    return {
        "tema": "congreso", "fecha": max((s.get("fecha") or "" for s in cg[cid].get("sesiones", [])), default=""),
        "titular": f"{camara}, {bonito(nombre)}{banc} faltó sin justificar a {m['ausente']} de las {m['sesiones']} sesiones del Pleno.",
        "cifra": f"{m['ausente']} de {m['sesiones']}", "cifraTxt": "sesiones sin justificar",
        "detalle": "Sin justificar quiere decir sin licencia registrada en el acta oficial de la sesión.",
        "enlace": f"#congreso?c={cid}&q={m['nombre']}",
        "fuente": {"nombre": "Actas del Pleno", "url": cg[cid].get("fuente")},
    }


def obras(f, hoy):
    ob = f.get("obras") or {}
    grandes = sorted((o for o in ob.get("obras", []) if o.get("saldo")), key=lambda o: -o["saldo"])[:10]
    if not grandes:
        return None
    o = grandes[hoy.isocalendar()[1] % len(grandes)]  # una distinta cada semana, de las 10 más caras
    lugar = ", ".join(bonito(x) for x in (o.get("distrito"), o.get("departamento")) if x)
    return {
        "tema": "obras", "fecha": "",
        "titular": f"Una obra de {soles(o['costo'])} en {lugar} está paralizada con {o.get('avance', 0):.0f}% de avance.",
        "cifra": soles(o["saldo"]), "cifraTxt": "faltan para terminarla", "monto": o["saldo"],
        "detalle": f"{frase(o['nombre'], 140)}. Motivo: {str(o.get('causal') or 'no informado').lower()}. A cargo de {bonito(o.get('entidad'))}.",
        "enlace": f"#obras?q={o['cui']}",
        "fuente": {"nombre": "Informe de obras paralizadas", "url": ob.get("fuente")},
    }


def viajes(f, hoy):
    vj = f.get("viajes") or {}
    vs = [v for v in (f.get("viajes_lista") or {}).get("viajes", vj.get("viajes", [])) if not (len(v) > 12 and v[12])]
    if not vs:
        return None
    # Los dos últimos meses con datos suficientes (el mes en curso casi siempre está incompleto)
    from collections import Counter
    por_mes = Counter(v[0] for v in vs)
    meses = sorted((m for m, n in por_mes.items() if n >= 300), reverse=True)[:2] or [max(por_mes)]
    v = max((x for x in vs if x[0] in meses), key=lambda x: x[9])
    ap, _, no = v[3].partition(",")
    persona = bonito(f"{no.strip()} {ap.strip()}" if no else ap)
    return {
        "tema": "viajes", "fecha": v[0],
        "titular": f"{persona} ({v[1]}) gastó {soles(v[9])} en pasajes y viáticos en un solo viaje.",
        "cifra": soles(v[9]), "cifraTxt": "en un viaje", "monto": v[9],
        "detalle": f"Viaje {v[10].lower()} ({bonito(v[6])}), del {v[4]} al {v[5]}. Es el más caro de los dos últimos meses en las entidades que revisamos.",
        "enlace": f"#viajes?q={v[3]}",
        "fuente": {"nombre": "Portal de Transparencia Estándar", "url": vj.get("fuente")},
    }


def destacados(fuentes, hoy):
    out = []
    for fn in (contraloria, contratos, gasto, congreso, obras, viajes):
        try:
            d = fn(fuentes, hoy)
        except Exception as e:  # un dato raro en una fuente no debe dejar sin titulares a las demás
            print(f"  ! destacado {fn.__name__}: {e}")
            d = None
        if d:
            out.append(d)
    return out
