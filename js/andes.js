/* ==========================================================
   Paisaje andino en pixel art con una alpaca que camina en bucle.
   Va al pie de la portada, encima de la greca: la alpaca camina
   sobre el borde del tejido. Puramente decorativo (aria-hidden).
   - Se pinta en un canvas de baja resolución y se amplía sin suavizar.
   - Se pausa fuera de la vista o con la pestaña oculta.
   - Con "reducir movimiento" la alpaca queda quieta.
   ========================================================== */
(function () {
  "use strict";
  const canvas = document.getElementById("andes");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const FILAS = 24; // alto lógico en "pixeles" de la escena

  // Alpaca mirando a la derecha. o = contorno se agrega solo alrededor.
  // l = lana, c = cara, e = ojo, p = pompón carmín (adorno de las alpacas andinas)
  const CUERPO = [
    ".........p....",
    ".........ll.l.",
    ".........llll.",
    ".........lelcc",
    ".........llcc.",
    ".........lll..",
    ".........lll..",
    ".........lll..",
    ".llllllllllll.",
    "lllllllllllll.",
    ".llllllllllll.",
    ".lllllllllll..",
  ];
  const PATAS = [
    [".ll......ll...", ".ll......ll..."], // paso abierto
    ["..ll....ll....", "..ll....ll...."], // paso cerrado
  ];
  const sprites = PATAS.map((p) => CUERPO.concat(p));
  const SW = 14, SH = sprites[0].length;

  let pal = {}, ancho = 0, px = 4, fondo = null, x = 0, paso = 0, ultimo = 0, corriendo = false, visible = true;
  const quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function paleta() {
    const oscuro = document.documentElement.dataset.theme === "dark";
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    pal = oscuro
      ? { lejos: "#2a303c", cerca: "#353d4c", nieve: "#c9ced8", ichu: "#4c4434", ichu2: "#5c523d",
          lana: "#c99a68", cara: "#e7cfa8", borde: "#0c0e12", ojo: "#0c0e12", pompon: v("--rojo") || "#ef5a6d" }
      : { lejos: "#d6d0c4", cerca: "#c3bba9", nieve: "#ffffff", ichu: "#d9c597", ichu2: "#c8b07a",
          lana: "#b98a5b", cara: "#ecd9b8", borde: "#3a2a1e", ojo: "#1a1310", pompon: v("--rojo") || "#b3132f" };
  }

  // Relieve determinista (la misma cordillera en cada visita). Ondas triangulares:
  // dan laderas rectas y picos filudos, como los nevados, en vez de lomas redondas.
  const tri = (v) => 1 - Math.abs((((v % 2) + 2) % 2) - 1); // 0..1..0
  const cordillera = (i) => 19 - 11 * tri(i / 23 + 0.3) - 6 * tri(i / 9 + 0.7) - 2 * tri(i / 4 + 0.1);
  const cerros = (i) => 16.5 - 3 * tri(i / 31 + 0.55) - 1.5 * tri(i / 13 + 0.2);

  function pintarFondo() {
    const f = document.createElement("canvas");
    f.width = ancho; f.height = FILAS;
    const g = f.getContext("2d");
    for (let i = 0; i < ancho; i++) {
      // Cordillera del fondo; nieve solo en las cumbres más altas
      const tope = Math.max(1, Math.round(cordillera(i)));
      g.fillStyle = pal.lejos; g.fillRect(i, tope, 1, FILAS - tope);
      if (tope <= 6) { g.fillStyle = pal.nieve; g.fillRect(i, tope, 1, Math.min(3, 7 - tope)); }
      // Cerros cercanos
      const cerca = Math.round(cerros(i));
      g.fillStyle = pal.cerca; g.fillRect(i, cerca, 1, FILAS - cerca);
      // Puna: ichu dorado en el suelo
      g.fillStyle = pal.ichu; g.fillRect(i, FILAS - 3, 1, 3);
      if ((i * 7) % 5 === 0) { g.fillStyle = pal.ichu2; g.fillRect(i, FILAS - 4, 1, 1); }
    }
    fondo = f;
  }

  function color(ch) {
    return { l: pal.lana, c: pal.cara, e: pal.ojo, p: pal.pompon }[ch];
  }
  function pintarAlpaca(x0, y0, s) {
    const lleno = (r, c) => r >= 0 && r < SH && c >= 0 && c < SW && s[r][c] !== ".";
    // Contorno: cada vacío que toca la alpaca (arriba, abajo, lados)
    ctx.fillStyle = pal.borde;
    for (let r = -1; r <= SH; r++) for (let c = -1; c <= SW; c++) {
      if (lleno(r, c)) continue;
      if (lleno(r - 1, c) || lleno(r + 1, c) || lleno(r, c - 1) || lleno(r, c + 1)) ctx.fillRect(x0 + c, y0 + r, 1, 1);
    }
    for (let r = 0; r < SH; r++) for (let c = 0; c < SW; c++) {
      const ch = s[r][c]; if (ch === ".") continue;
      ctx.fillStyle = color(ch); ctx.fillRect(x0 + c, y0 + r, 1, 1);
    }
  }

  function dibujar() {
    ctx.clearRect(0, 0, ancho, FILAS);
    if (fondo) ctx.drawImage(fondo, 0, 0);
    const suelo = FILAS - 3; // las patas pisan el ichu
    const salto = paso % 2 === 1 ? 1 : 0; // leve vaivén al caminar
    pintarAlpaca(Math.round(x), suelo - SH + salto - 1, sprites[paso % 2]);
  }

  function medir() {
    const w = canvas.clientWidth;
    if (!w) return;
    px = w < 560 ? 3 : 4;
    ancho = Math.ceil(w / px);
    canvas.width = ancho; canvas.height = FILAS;
    canvas.style.height = FILAS * px + "px";
    paleta(); pintarFondo();
    if (quieto) x = Math.round(ancho * 0.62);
    dibujar();
  }

  // ~8 cuadros por segundo: ritmo de pixel art; cruza la pantalla en unos 20–30 s
  function cuadro(t) {
    if (!corriendo) return;
    if (t - ultimo >= 125) {
      ultimo = t;
      paso++;
      x += 1;
      if (x > ancho + 2) x = -SW - 2; // vuelve a entrar por la izquierda
      dibujar();
    }
    requestAnimationFrame(cuadro);
  }
  function arrancar() { if (quieto || corriendo || !visible || document.hidden) return; corriendo = true; requestAnimationFrame(cuadro); }
  function parar() { corriendo = false; }

  medir();
  x = quieto ? x : Math.round(ancho * 0.15);
  dibujar();

  if ("ResizeObserver" in window) new ResizeObserver(() => medir()).observe(canvas);
  else window.addEventListener("resize", medir);
  // Cambio de tema: recolorear
  new MutationObserver(() => { paleta(); pintarFondo(); dibujar(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  // Solo animar cuando se ve
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting && canvas.offsetParent !== null; visible ? arrancar() : parar(); }).observe(canvas);
  } else arrancar();
  document.addEventListener("visibilitychange", () => (document.hidden ? parar() : arrancar()));
})();
