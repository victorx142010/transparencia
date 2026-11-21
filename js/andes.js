/* ==========================================================
   Paisaje andino en pixel art con una llama que pasta.
   - En pantallas anchas es el fondo de la portada: la cordillera se abre
     en un "valle" bajo el texto (para no estorbar la lectura) y se levanta
     a los lados; la llama pasta a la derecha.
   - En pantallas angostas es una franja al pie de la portada.
   La llama no camina: baja la cabeza al ichu, mastica, la levanta, mueve
   una oreja y vuelve a comer. El ichu se mece con el viento.
   - Se pinta en un canvas de baja resolución (1 punto = 3 px) y se amplía sin suavizar.
   - Las capas fijas (cielo, cerros) se pintan una vez; cada cuadro solo repinta ichu y llama.
   - Se pausa fuera de la vista o con la pestaña oculta.
   - Con "reducir movimiento" la escena queda quieta, con la llama pastando.
   Puramente decorativo (aria-hidden).
   ========================================================== */
(function () {
  "use strict";
  const canvas = document.getElementById("andes");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const PX = 3; // tamaño de cada "pixel" de la escena en px de pantalla
  const SUELO = 5; // filas de puna (ichu) al pie

  // ---------- La llama (mira a la izquierda) ----------
  // l lana · d lana en sombra · c hocico · n nariz · e ojo · b pezuña · p pompón carmín
  // (las llamas de la sierra llevan borlas de lana de colores en las orejas)
  const W = 26, H = 26;
  const CUERPO = [ // filas 14..25, desplazado 3 columnas
    "....lllllllllllllllll..",
    "....lllllllllllllllllll",
    "....llllllllllllllllldl",
    "....dlllllllllllllllld.",
    ".....dllllllllllllllld.",
    ".....ddlllllllllllldd..",
    "......dddddddddddddd...",
    "......ll.ll.....ll.ll..",
    "......ll.ll.....ll.ll..",
    "......ll.ll.....ll.ll..",
    "......dl.dl.....dl.dl..",
    "......bb.bb.....bb.bb..",
  ];
  const ARRIBA = { // cabeza en alto (desplazado 3 columnas)
    0: "...p..p", 1: "...dl.dl", 2: "...dl.dl", 3: "...lllll", 4: "..lllllll", 5: "..lelllll",
    6: "cccllllll", 7: "nccclllll", 8: ".ccclllll", 9: "....lllll", 10: "....lllll",
    11: "....lllll", 12: "....llllll", 13: "....llllll",
  };
  const MEDIO = { // bajando o subiendo la cabeza (sin desplazar)
    6: ".....p", 7: ".....dl.", 8: "....ldl", 9: "...lllll", 10: "..lelllll", 11: ".ccclllll",
    12: "ncccllllll", 13: ".ccc..lllll", 14: "......llll",
  };
  const ABAJO = { // pastando: el hocico toca el ichu (sin desplazar)
    13: "......lll", 14: ".....llll", 15: "....llll", 16: "...llll", 17: "..llll",
    18: "..lllld", 19: ".lllldl", 20: ".llllllp", 21: ".lelll", 22: ".llll",
    23: ".cccl", 24: ".ccc", 25: ".ncc",
  };
  function armar(cabeza, desp, extra) {
    const g = Array.from({ length: H }, () => Array(W).fill("."));
    const poner = (r, fila, off) => { for (let c = 0; c < fila.length; c++) if (fila[c] !== "." && c + off < W) g[r][c + off] = fila[c]; };
    CUERPO.forEach((f, r) => poner(14 + r, f, 3));
    Object.entries(cabeza).forEach(([r, f]) => poner(+r, f, desp));
    if (extra) extra(g);
    return g;
  }
  // Variantes: masticar (la mandíbula se cierra) y mover la oreja o la cola
  const mastica = (r, c) => (g) => { g[r][c] = "."; };
  const oreja = (g) => { g[0][6] = "."; g[1][6] = "p"; g[1][7] = "."; g[2][7] = "."; };
  const cola = (g) => { g[15][22] = "."; g[16][22] = "l"; g[16][23] = "d"; };
  const POSES = {
    arriba: armar(ARRIBA, 3), arribaMastica: armar(ARRIBA, 3, mastica(8, 4)),
    arribaOreja: armar(ARRIBA, 3, oreja), arribaCola: armar(ARRIBA, 3, cola),
    medio: armar(MEDIO, 0),
    abajo: armar(ABAJO, 0), abajoMastica: armar(ABAJO, 0, mastica(24, 3)),
  };
  // Guion de la llama: [pose, décimas de segundo]. Pasta ~6 s, mira ~3 s, vuelve.
  const GUION = [
    ["abajo", 4], ["abajoMastica", 3], ["abajo", 4], ["abajoMastica", 3], ["abajo", 5], ["abajoMastica", 3],
    ["abajo", 4], ["abajoMastica", 3], ["abajo", 6], ["abajoMastica", 3], ["abajo", 4],
    ["medio", 2], ["arriba", 5], ["arribaMastica", 3], ["arriba", 4], ["arribaOreja", 2], ["arriba", 3],
    ["arribaMastica", 3], ["arribaCola", 2], ["arriba", 5], ["medio", 2],
  ];
  const DURACION = GUION.reduce((a, [, d]) => a + d, 0);
  function poseEn(dec) {
    let t = dec % DURACION;
    for (const [p, d] of GUION) { if (t < d) return p; t -= d; }
    return "abajo";
  }

  // ---------- Colores (del tema activo) ----------
  let pal = {};
  function paleta() {
    const oscuro = document.documentElement.dataset.theme === "dark";
    const v = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    pal = oscuro
      ? { // noche: lo lejano más claro (bruma de luna), lo cercano en silueta
          lejos: "#2b3566", lejosSombra: "#242d5a", nieve: "#c9d3f2", nieveSombra: "#8e9bd0", cresta: "#dfe5fb",
          medio: "#202851", medioSombra: "#1b2247", cerca: "#171d3d", cercaSombra: "#131935",
          suelo: "#2a2a35", ichu: "#5e5038", ichu2: "#7a6847", ichu3: "#463c2c",
          lana: "#d3a673", sombra: "#a57d52", cara: "#efd9b3", borde: "#070a17", ojo: "#070a17",
          pezuna: "#3b2c22", pompon: v("--rojo") || "#ff5c74", luna: "#f3eee5", estrella: "#8d98cf", noche: true }
      : { // día: bruma azulada lejos, puna dorada cerca
          lejos: "#cfcbc2", lejosSombra: "#c2bdb2", nieve: "#ffffff", nieveSombra: "#dfe2ea", cresta: "#b9bfcd",
          medio: "#cfc7b6", medioSombra: "#c2b9a6", cerca: "#bdb197", cercaSombra: "#aea188",
          suelo: "#c8b483", ichu: "#d9c597", ichu2: "#c8b07a", ichu3: "#a8905a",
          lana: "#b98a5b", sombra: "#966b43", cara: "#ecd9b8", borde: "#3a2a1e", ojo: "#1a1310",
          pezuna: "#3a2a1e", pompon: v("--rojo") || "#b3132f", noche: false };
  }

  // ---------- Relieve ----------
  // Ondas triangulares: laderas rectas y picos filudos, como los nevados. Deterministas:
  // la misma cordillera en cada visita.
  const tri = (v) => 1 - Math.abs((((v % 2) + 2) % 2) - 1);
  const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ruido = (i) => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };

  let ancho = 0, alto = 0, fondo = null, modoFondo = false, valle = [0, 0], llamaX = 0, ichus = [];
  // Meseta (solo en pantalla ancha): a la derecha del buscador, a su altura, para que la llama
  // pastee a la vista sin que haga falta bajar. null = la llama pasta en la puna de abajo.
  let mesa = null;
  const bordeMesa = (i) => (mesa ? suave(mesa.a - 14, mesa.a + 3, i) : 0);
  const topeMesa = (i) => {
    const plano = i >= llamaX - 3 && i <= llamaX + W + 3; // bajo la llama, parejo
    return mesa.y + (plano ? 0 : Math.round(ruido(i + 41) * 1.4 - 0.4));
  };
  // Fila del suelo en la columna i (donde crece el ichu)
  const sueloEn = (i) => (mesa && i >= mesa.a + 2 ? topeMesa(i) : alto - SUELO);

  // Cuánto se levanta el relieve en la columna i (0..1): bajo en el valle del texto, alto a los lados
  function envolvente(i) {
    if (!modoFondo) return 1;
    const [a, b] = valle, m = 26;
    // A la izquierda solo hay cerros altos si sobra margen (pantallas muy anchas)
    const izquierda = a > 50 ? 1 - suave(a - m * 1.5, a - 4, i) : 0;
    return 0.1 + 0.9 * Math.max(izquierda, suave(b - m * 0.4, b + m, i));
  }

  function pintarFondo() {
    const f = document.createElement("canvas");
    f.width = ancho; f.height = alto;
    const g = f.getContext("2d");
    const base = alto - SUELO; // donde empieza la puna
    const alturaMax = modoFondo ? Math.min(base - 4, alto * 0.78) : Math.round(base * 0.8); // en la franja, algo de cielo sobre los picos
    const capa = (i) => {
      const e = envolvente(i);
      return {
        lejos: base - alturaMax * e * (0.55 + 0.45 * (0.6 * tri(i / 47 + 0.3) + 0.3 * tri(i / 19 + 0.7) + 0.1 * tri(i / 7 + 0.1))),
        medio: base - alturaMax * e * (0.32 + 0.22 * (0.7 * tri(i / 61 + 0.55) + 0.3 * tri(i / 23 + 0.2))),
        cerca: (() => {
          const cerro = base - Math.max(3, alturaMax * e * (0.12 + 0.12 * (0.6 * tri(i / 83 + 0.1) + 0.4 * tri(i / 29 + 0.8))));
          if (!mesa) return cerro;
          const k = bordeMesa(i);
          return k >= 1 ? topeMesa(i) : cerro + (mesa.y - cerro) * k;
        })(),
      };
    };
    // Cielo nocturno: luna y estrellas, solo fuera del valle del texto
    if (pal.noche) {
      for (let k = 0; k < ancho * 0.12; k++) {
        const x = Math.floor(ruido(k + 1) * ancho), y = Math.floor(ruido(k + 99) * (alto * 0.55));
        if (envolvente(x) < 0.6 || y > capa(x).lejos - 6) continue;
        g.fillStyle = pal.estrella; g.globalAlpha = 0.35 + 0.65 * ruido(k + 7); g.fillRect(x, y, 1, 1);
      }
      g.globalAlpha = 1;
      const lx = modoFondo ? Math.round(valle[1] + (ancho - valle[1]) * 0.72) : Math.round(ancho * 0.86);
      const ly = modoFondo ? Math.round(alto * 0.16) : 6, r = modoFondo ? 6 : 4;
      if (lx < ancho - r) {
        g.fillStyle = pal.luna;
        for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.fillRect(lx + x, ly + y, 1, 1);
        g.fillStyle = pal.nieveSombra; g.globalAlpha = 0.35; // mares de la luna
        g.fillRect(lx - 2, ly - 1, 2, 2); g.fillRect(lx + 1, ly + 2, 2, 1); g.fillRect(lx + 2, ly - 3, 1, 1);
        g.globalAlpha = 1;
      }
    }
    const capas = Array.from({ length: ancho }, (_, i) => capa(i));
    for (let i = 0; i < ancho; i++) {
      const c = capas[i], sig = capas[Math.min(ancho - 1, i + 1)];
      // Cordillera: la ladera que baja hacia la derecha queda en sombra
      const lt = Math.round(c.lejos), enSombra = sig.lejos > c.lejos + 0.15;
      g.fillStyle = enSombra ? pal.lejosSombra : pal.lejos; g.fillRect(i, lt, 1, alto - lt);
      // Nieve en las cumbres altas, con borde inferior irregular
      const altura = base - c.lejos;
      if (altura > alturaMax * 0.62) {
        const n = Math.round((altura - alturaMax * 0.62) * 0.55 + 1 + ruido(i) * 2);
        g.fillStyle = enSombra ? pal.nieveSombra : pal.nieve; g.fillRect(i, lt, 1, n);
        g.fillStyle = pal.cresta; g.fillRect(i, lt, 1, 1); // filo de la cumbre: que se lea contra el cielo
      }
      const mt = Math.round(c.medio);
      g.fillStyle = sig.medio > c.medio + 0.1 ? pal.medioSombra : pal.medio; g.fillRect(i, mt, 1, alto - mt);
      const ct = Math.round(c.cerca);
      const enMesa = mesa && bordeMesa(i) > 0; // la meseta y su ladera, de un solo tono (sin rayas)
      g.fillStyle = !enMesa && sig.cerca > c.cerca + 0.1 ? pal.cercaSombra : pal.cerca; g.fillRect(i, ct, 1, alto - ct);
      // Borde de pasto sobre la meseta
      if (mesa && i >= mesa.a + 2) { g.fillStyle = pal.suelo; g.fillRect(i, ct, 1, 2); }
      // Puna
      g.fillStyle = pal.suelo; g.fillRect(i, base, 1, SUELO);
      if (ruido(i + 3) > 0.7) { g.fillStyle = pal.ichu3; g.fillRect(i, base + 1 + Math.floor(ruido(i) * 3), 1, 1); }
    }
    fondo = f;
  }

  // Matas de ichu que se mecen (se pintan en cada cuadro, delante de los cerros)
  function sembrarIchu() {
    ichus = [];
    const base = alto - SUELO;
    for (let x = 1; x < ancho - 1; x += 2 + Math.floor(ruido(x + 11) * 4)) {
      if (ruido(x + 5) < 0.35) continue;
      const h = 2 + Math.floor(ruido(x + 23) * 3), tono = ruido(x + 31) > 0.5;
      ichus.push({ x, y: base + 1 + Math.floor(ruido(x + 17) * (SUELO - 1)), h, tono });
      if (mesa && x >= mesa.a + 3) ichus.push({ x, y: topeMesa(x) + 1 + Math.floor(ruido(x + 19) * 2), h, tono: !tono });
    }
    ichus.sort((a, b) => a.y - b.y);
  }
  function pintarIchu(t, delante) {
    // Una ráfaga de viento recorre la puna de izquierda a derecha
    const frente = ((t / 10) % (ancho + 80)) - 40;
    for (const m of ichus) {
      if ((m.y >= sueloLlama() + 2) !== delante) continue;
      const empuje = Math.abs(m.x - frente) < 14 ? 1 : 0;
      ctx.fillStyle = m.tono ? pal.ichu : pal.ichu2;
      for (let k = 0; k < m.h; k++) {
        const dx = k >= m.h - 1 ? empuje : 0;
        ctx.fillRect(m.x + dx, m.y - k, 1, 1);
        ctx.fillRect(m.x - 1 + (k === m.h - 1 ? empuje : 0), m.y - k + 1, 1, 1);
        if (k === m.h - 1) ctx.fillRect(m.x + 1 + dx, m.y - k + 1, 1, 1);
      }
    }
  }

  function pintarLlama(pose) {
    const g = POSES[pose];
    const x0 = llamaX, y0 = sueloLlama() - H + 3; // las pezuñas se hunden un poco en el ichu
    const lleno = (r, c) => r >= 0 && r < H && c >= 0 && c < W && g[r][c] !== ".";
    ctx.fillStyle = pal.borde;
    for (let r = -1; r <= H; r++) for (let c = -1; c <= W; c++) {
      if (lleno(r, c)) continue;
      if (lleno(r - 1, c) || lleno(r + 1, c) || lleno(r, c - 1) || lleno(r, c + 1)) ctx.fillRect(x0 + c, y0 + r, 1, 1);
    }
    const color = { l: pal.lana, d: pal.sombra, c: pal.cara, n: pal.ojo, e: pal.ojo, b: pal.pezuna, p: pal.pompon };
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = g[r][c]; if (ch === ".") continue;
      ctx.fillStyle = color[ch]; ctx.fillRect(x0 + c, y0 + r, 1, 1);
    }
  }

  const sueloLlama = () => (mesa ? mesa.y : alto - SUELO);
  let decimas = 0;
  function dibujar() {
    if (!ancho) return;
    ctx.clearRect(0, 0, ancho, alto);
    if (fondo) ctx.drawImage(fondo, 0, 0);
    pintarIchu(decimas, false);
    pintarLlama(quieto ? "abajo" : poseEn(decimas));
    pintarIchu(decimas, true); // el ichu del primer plano tapa las pezuñas
  }

  // ---------- Medidas: modo fondo (pantalla ancha) o franja (móvil) ----------
  function medir() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    modoFondo = getComputedStyle(canvas).position === "absolute";
    ancho = Math.ceil(w / PX); alto = Math.ceil(h / PX);
    canvas.width = ancho; canvas.height = alto;
    const caja = canvas.getBoundingClientRect();
    if (modoFondo) {
      // El valle va justo debajo del texto de la portada (titular, buscador, promesas)
      const textos = [...canvas.parentElement.children].filter((el) => el !== canvas).map((el) => el.getBoundingClientRect()).filter((r) => r.width);
      const izq = Math.min(...textos.map((r) => r.left)), der = Math.max(...textos.map((r) => Math.min(r.right, r.left + medirTexto(r))));
      valle = [(izq - caja.left) / PX, (der - caja.left) / PX];
      const libre = ancho - valle[1];
      const buscador = canvas.parentElement.querySelector(".buscador input");
      if (buscador && libre > W + 24) {
        const y = Math.round((buscador.getBoundingClientRect().bottom - caja.top) / PX) + 2;
        mesa = { a: Math.round(valle[1] + 10), y };
        llamaX = Math.round(mesa.a + Math.min(libre - 10, 120) * 0.38 - W / 2 + 6);
      } else {
        mesa = null;
        llamaX = Math.round(libre > W + 20 ? valle[1] + libre * 0.42 - W / 2 : ancho - W - 8);
      }
    } else {
      mesa = null;
      llamaX = Math.round(ancho * 0.64 - W / 2);
    }
    paleta(); pintarFondo(); sembrarIchu(); dibujar();
  }
  // El buscador ocupa todo el ancho de su caja; el texto real del titular es más angosto
  function medirTexto(r) { return Math.min(r.width, 680); }

  // ---------- Animación: ~10 cuadros por segundo, solo cuando se ve ----------
  const quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let corriendo = false, visible = true;
  function cuadro(t) {
    if (!corriendo) return;
    // El guion sigue al reloj (décimas de segundo), no a los cuadros: si el navegador
    // pinta menos cuadros, la llama no se vuelve lenta.
    const d = Math.floor(t / 100);
    if (d !== decimas) { decimas = d; dibujar(); }
    requestAnimationFrame(cuadro);
  }
  function arrancar() { if (quieto || corriendo || !visible || document.hidden) return; corriendo = true; requestAnimationFrame(cuadro); }
  function parar() { corriendo = false; }

  medir();
  if ("ResizeObserver" in window) new ResizeObserver(() => medir()).observe(canvas);
  else window.addEventListener("resize", medir);
  new MutationObserver(() => { paleta(); pintarFondo(); dibujar(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting && canvas.offsetParent !== null; visible ? arrancar() : parar(); }).observe(canvas);
  } else arrancar();
  document.addEventListener("visibilitychange", () => (document.hidden ? parar() : arrancar()));
})();
