"""
Proyectos de ley presentados en el Congreso bicameral (periodo 2026-2031).

Fuente: Sistema de Proposiciones Legislativas del Congreso
(wb2server.congreso.gob.pe/spley-portal), mediante el mismo servicio que usa
su web: api.congreso.gob.pe/spley-portal-service.

Salida: data/proyectos.json

Uso:  python scripts/actualizar_proyectos.py
"""
import json
import sys
import time
from collections import Counter

from comun import ahora_lima, guardar_json, http

API = "https://api.congreso.gob.pe/spley-portal-service/proyecto-ley/lista-con-filtro"
PERIODO = 2026
CAMARAS = {"D": "Cámara de Diputados", "S": "Senado"}
DETALLE = "https://wb2server.congreso.gob.pe/spley-portal/#/{ruta}/expediente/{anio}/{num}"


def pagina(tipo, inicio, tam=100):
    filtro = {
        "perParId": PERIODO, "perLegId": None, "codTipoParl": tipo, "comisionId": None, "estadoId": None,
        "congresistaId": None, "grupoParlamentarioId": None, "proponenteId": None, "legislaturaId": None,
        "fecPresentacionDesde": None, "fecPresentacionHasta": None, "pleyNum": None, "palabras": None,
        "tipoFirmanteId": None, "conAcumulado": False, "pageSize": tam, "rowStart": inicio,
    }
    cuerpo = json.dumps(filtro).encode()
    import urllib.request
    req = urllib.request.Request(API, data=cuerpo, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
    for intento in range(4):
        try:
            d = json.loads(urllib.request.urlopen(req, timeout=90).read().decode("utf-8"))
            return d.get("data") or {}
        except Exception as e:
            print(f"  reintento {intento + 1}: {e}")
            time.sleep(5 * (intento + 1))
    raise RuntimeError("API del Congreso no responde")


def main():
    proyectos = []
    for tipo, camara in CAMARAS.items():
        inicio, total = 0, None
        while total is None or inicio < total:
            d = pagina(tipo, inicio)
            total = d.get("rowsTotal") or 0
            lote = d.get("proyectos") or []
            if not lote:
                break
            for p in lote:
                autores = [a.strip() for a in (p.get("autores") or "").split(";") if a.strip()]
                proyectos.append({
                    "camara": tipo,
                    "numero": p.get("proyectoLey"),
                    "num": p.get("pleyNum"),
                    "fecha": (p.get("fecPresentacion") or "")[:10],
                    "titulo": (p.get("titulo") or "").strip(),
                    "estado": (p.get("desEstado") or "").strip(),
                    "proponente": (p.get("desProponente") or "").strip(),
                    "autores": autores,
                    "url": DETALLE.format(ruta="diputados" if tipo == "D" else "senado", anio=PERIODO, num=p.get("pleyNum")),
                })
            inicio += len(lote)
            time.sleep(0.4)
        print(f"  {camara}: {sum(1 for p in proyectos if p['camara'] == tipo)} de {total}")

    proyectos.sort(key=lambda p: (p["fecha"], p["num"] or 0), reverse=True)
    # El primer autor es quien firma como autor principal
    principales = Counter(p["autores"][0] for p in proyectos if p["autores"])
    firmas = Counter(a for p in proyectos for a in p["autores"])
    guardar_json("proyectos.json", {
        "actualizado": ahora_lima().isoformat(timespec="minutes"),
        "periodo": "2026-2031",
        "fuente": "https://wb2server.congreso.gob.pe/spley-portal/",
        "total": len(proyectos),
        "porCamara": Counter(p["camara"] for p in proyectos),
        "porEstado": Counter(p["estado"] for p in proyectos).most_common(),
        "porProponente": Counter(p["proponente"] for p in proyectos).most_common(),
        "porMes": sorted(Counter(p["fecha"][:7] for p in proyectos if p["fecha"]).items()),
        "autoresPrincipales": principales.most_common(25),
        "firmas": firmas.most_common(25),
        "proyectos": proyectos,
    })


if __name__ == "__main__":
    sys.exit(main())
