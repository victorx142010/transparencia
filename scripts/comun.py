"""Utilidades compartidas por los scrapers."""
import json
import os
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(RAIZ, "data")
UA = "Mozilla/5.0 (compatible; PortalTransparenciaCiudadano/1.0)"
LIMA = timezone(timedelta(hours=-5))


def ahora_lima():
    return datetime.now(LIMA)


def http(url, data=None, timeout=60, intentos=4, stream=False):
    """GET (o POST si data es dict). Reintenta con espera creciente."""
    body = urllib.parse.urlencode(data).encode() if isinstance(data, dict) else data
    ultimo = None
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, data=body, headers={"User-Agent": UA})
            resp = urllib.request.urlopen(req, timeout=timeout)
            return resp if stream else resp.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            ultimo = e
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"No se pudo descargar {url}: {ultimo}")


def leer_json(nombre, por_defecto=None):
    ruta = os.path.join(DATA, nombre)
    if not os.path.exists(ruta):
        return por_defecto
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def guardar_json(nombre, obj, silencioso=False):
    os.makedirs(DATA, exist_ok=True)
    ruta = os.path.join(DATA, nombre)
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ruta)
    if not silencioso:
        print(f"  -> {ruta} ({os.path.getsize(ruta) / 1024:.0f} KB)")


def clave(texto):
    """Normaliza un nombre para comparar: sin tildes, sin espacios ni signos."""
    t = unicodedata.normalize("NFD", texto)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return "".join(c for c in t.lower() if c.isalpha())


def titulo(texto):
    """'EDUCACION BASICA' -> 'Educación básica' (solo capitaliza)."""
    t = texto.strip().capitalize()
    return t
