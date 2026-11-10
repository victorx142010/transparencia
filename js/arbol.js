/*
 * Mapa de árbol (treemap) "squarified", sin librerías.
 * dibujarArbol(contenedor, items, { formato, alTocar })
 *   items: [{ nombre, valor, icono?, hijos? }]
 */
(function () {
  "use strict";

  function peor(fila, lado) {
    const s = fila.reduce((a, r) => a + r.area, 0);
    const max = Math.max(...fila.map((r) => r.area));
    const min = Math.min(...fila.map((r) => r.area));
    return Math.max((lado * lado * max) / (s * s), (s * s) / (lado * lado * min));
  }

  function squarify(items, x, y, w, h) {
    const out = [];
    let resto = items.slice();
    while (resto.length) {
      const lado = Math.min(w, h);
      const fila = [resto[0]];
      let i = 1;
      while (i < resto.length && peor(fila.concat(resto[i]), lado) <= peor(fila, lado)) {
        fila.push(resto[i]);
        i++;
      }
      resto = resto.slice(i);
      const suma = fila.reduce((a, r) => a + r.area, 0);
      if (w >= h) {
        const ancho = suma / h;
        let yy = y;
        fila.forEach((r) => { const alto = r.area / ancho; out.push({ ...r, x, y: yy, w: ancho, h: alto }); yy += alto; });
        x += ancho; w -= ancho;
      } else {
        const alto = suma / w;
        let xx = x;
        fila.forEach((r) => { const ancho = r.area / alto; out.push({ ...r, x: xx, y, w: ancho, h: alto }); xx += ancho; });
        y += alto; h -= alto;
      }
    }
    return out;
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  window.dibujarArbol = function (cont, items, opts) {
    const fmt = opts.formato;
    const W = cont.clientWidth || 600;
    const H = Math.max(340, Math.min(560, Math.round(W * 0.72)));
    cont.style.height = H + "px";
    const total = items.reduce((a, it) => a + it.valor, 0);
    const datos = items
      .filter((it) => it.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .map((it, i) => ({ it, i, area: (it.valor / total) * W * H }));
    const cajas = squarify(datos, 0, 0, W, H);
    const n = cajas.length;

    cont.innerHTML = cajas
      .map((c) => {
        const pct = (c.it.valor / total) * 100;
        // Intensidad decreciente por tamaño: más grande = más intenso
        const mezcla = Math.round(100 - (c.i / Math.max(1, n - 1)) * 62);
        const grande = c.w > 110 && c.h > 58;
        const mediano = c.w > 64 && c.h > 34;
        const clic = c.it.hijos && c.it.hijos.length > 1;
        const etiqueta = `${c.it.nombre}: ${fmt(c.it.valor)} (${pct.toFixed(1)}%)`;
        return `<button type="button" class="arbol__caja${clic ? " arbol__caja--clic" : ""}" data-i="${c.i}"
            style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--mezcla:${mezcla}%"
            title="${esc(etiqueta)}${clic ? " — toca para ver el detalle" : ""}" aria-label="${esc(etiqueta)}">
            ${mediano ? `<span class="arbol__nombre">${c.it.icono ? c.it.icono + " " : ""}${esc(c.it.nombre)}</span>` : ""}
            ${grande ? `<span class="arbol__valor">${fmt(c.it.valor)} · ${pct.toFixed(1)}%</span>` : ""}
          </button>`;
      })
      .join("");

    cont.querySelectorAll(".arbol__caja").forEach((b) =>
      b.addEventListener("click", () => {
        const it = datos[+b.dataset.i].it;
        if (opts.alTocar) opts.alTocar(it);
      })
    );
  };
})();
