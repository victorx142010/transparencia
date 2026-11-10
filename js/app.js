(function () {
  "use strict";
  const D = window.DATOS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Formato ----------
  const nf0 = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });
  const soles = (n) => "S/ " + nf0.format(Math.round(n));
  const millones = (n) => (n >= 1000 ? "S/ " + nf1.format(n / 1000) + " mil millones" : "S/ " + nf0.format(n) + " millones");
  const corto = (n) => (n >= 1000 ? "S/ " + nf1.format(n / 1000) + " mil M" : "S/ " + nf0.format(n) + " M");
  const pct = (a, b) => (b ? nf1.format((a / b) * 100) + "%" : "—");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clave = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  const normal = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const sello = (estado) =>
    estado === "oficial" ? '<span class="sello sello--oficial">Oficial</span>' : '<span class="sello sello--estimado">Estimado</span>';
  const enlace = (f) => (f ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nombre)}</a>` : "");
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
  const fechaCorta = (iso) => { const [y, m, d] = iso.split("-"); return `${+d} ${MESES[+m - 1]}`; };
  const fechaLarga = (iso) => { const [y, m, d] = iso.split("-"); return `${+d} ${MESES[+m - 1]} ${y}`; };

  // Tildes para nombres del MEF (vienen en mayúsculas sin tildes)
  const TILDES = { educacion: "educación", gestion: "gestión", publica: "pública", publico: "público", prevision: "previsión", proteccion: "protección",
    energia: "energía", mineria: "minería", basica: "básica", tecnica: "técnica", atencion: "atención", credito: "crédito", economico: "económico",
    economica: "económica", tecnologia: "tecnología", innovacion: "innovación", investigacion: "investigación", poblacion: "población",
    administracion: "administración", planificacion: "planificación", informacion: "información", recreacion: "recreación", aereo: "aéreo",
    acuatico: "acuático", maritimo: "marítimo", electrica: "eléctrica", hidrocarburos: "hidrocarburos", asistencia: "asistencia",
    nutricion: "nutrición", ganaderia: "ganadería", agricola: "agrícola", pesqueria: "pesquería", promocion: "promoción", regulacion: "regulación",
    comunicacion: "comunicación", telecomunicaciones: "telecomunicaciones", vivienda: "vivienda", juridica: "jurídica", accion: "acción",
    legislacion: "legislación", diplomatica: "diplomática", cientifica: "científica", farmaceutica: "farmacéutica", basico: "básico",
    reduccion: "reducción", prevencion: "prevención", regimen: "régimen", transito: "tránsito", termica: "térmica", intervencion: "intervención" };
  const bonito = (s) => {
    const t = String(s).toLowerCase().replace(/[a-záéíóúñ]+/g, (w) => TILDES[w] || w);
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  // Info para mostrar por función (clave = nombre MEF normalizado)
  const INFO = {
    educacion: ["🎓", "Colegios, sueldos de docentes, universidades públicas, becas, infraestructura educativa."],
    salud: ["🏥", "Hospitales, postas, médicos y enfermeras, SIS, vacunas, medicinas."],
    deudapublica: ["🏦", "Pago de intereses y capital de préstamos y bonos que el Estado tomó antes."],
    transporte: ["🛣️", "Carreteras, puentes, Metro de Lima, aeropuertos regionales, caminos vecinales."],
    planeamientogestionyreservadecontingencia: ["🗂️", "Administración del Estado, sistemas, reserva de contingencia para emergencias."],
    previsionsocial: ["👴", "Pensiones de la ONP, cédula viva y jubilados del Estado."],
    ordenpublicoyseguridad: ["🚓", "Policía Nacional, patrullaje, serenazgo, prevención del delito."],
    proteccionsocial: ["🤝", "Programas como Juntos, Pensión 65, alimentación escolar, Cuna Más."],
    defensayseguridadnacional: ["🛡️", "Fuerzas Armadas: Ejército, Marina y Fuerza Aérea."],
    agropecuaria: ["🌾", "Riego, apoyo a agricultores, sanidad agraria."],
    saneamiento: ["🚰", "Agua potable, alcantarillado y tratamiento de aguas."],
    justicia: ["⚖️", "Poder Judicial, Ministerio Público, cárceles (INPE)."],
    culturaydeporte: ["🎭", "Museos, patrimonio, deporte, Juegos y polideportivos."],
    ambiente: ["🌳", "Áreas naturales, residuos sólidos, cambio climático."],
    viviendaydesarrollourbano: ["🏘️", "Techo Propio, Mivivienda, pistas y veredas, ordenamiento urbano."],
    energia: ["⚡", "Electrificación rural, gas natural, hidrocarburos."],
    legislativa: ["🏛️", "Funcionamiento del Congreso: Senado y Cámara de Diputados."],
    trabajo: ["💼", "Empleo, inspección laboral, capacitación."],
    comunicaciones: ["📡", "Internet, telecomunicaciones, servicio postal."],
    relacionesexteriores: ["🌎", "Cancillería, embajadas y consulados."],
    turismo: ["🧳", "Promoción turística del Perú."],
    industria: ["🏭", "Apoyo a la industria y a las mypes."],
    comercio: ["🛒", "Comercio exterior e interior."],
    mineria: ["⛏️", "Supervisión y promoción minera."],
    pesca: ["🐟", "Pesca artesanal e industrial, acuicultura."]
  };

  async function cargar(nombre) {
    try {
      const r = await fetch("data/" + nombre, { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      return null; // sin servidor o sin datos: se usan los de datos.js
    }
  }

  // ---------- Modelo de presupuesto (MEF si existe, si no datos.js) ----------
  function modeloPresupuesto(mef) {
    if (mef && mef.total && mef.total.pia > 0) {
      const M = 1e6;
      return {
        anio: mef.anio, oficial: true, parcial: mef.parcial,
        pia: mef.total.pia / M, pim: mef.total.pim / M, dev: mef.total.dev / M,
        corte: mef.corteMEF ? new Date(mef.corteMEF) : null,
        fuente: { nombre: "MEF — Datos Abiertos, Presupuesto y Ejecución de Gasto " + mef.anio, url: mef.fuente },
        niveles: mef.niveles.map((n) => ({
          nombre: { "GOBIERNO NACIONAL": "Gobierno Nacional (ministerios, Congreso, Poder Judicial…)", "GOBIERNOS REGIONALES": "Gobiernos Regionales", "GOBIERNOS LOCALES": "Municipalidades" }[n.nombre] || bonito(n.nombre),
          monto: n.pim / M, pia: n.pia / M, dev: n.dev / M
        })),
        funciones: mef.funciones.map((f) => {
          const info = INFO[clave(f.nombre)] || ["📦", ""];
          return {
            nombre: bonito(f.nombre), icono: info[0], explica: info[1], estado: "oficial",
            monto: f.pim / M, pia: f.pia / M, dev: f.dev / M,
            hijos: (f.divisiones || []).map((d) => ({ nombre: bonito(d.nombre), monto: d.pim / M, pia: d.pia / M, dev: d.dev / M }))
          };
        }),
        genericas: mef.genericas.map((g) => ({ nombre: bonito(g.nombre), monto: g.pim / M, dev: g.dev / M }))
      };
    }
    const P = D.presupuesto;
    const funciones = P.funciones.map((f) => ({ ...f, pia: f.monto, hijos: null }));
    const suma = funciones.reduce((a, f) => a + f.monto, 0);
    if (P.total > suma) funciones.push({ nombre: "Otras funciones", icono: "📦", monto: P.total - suma, pia: P.total - suma, estado: "estimado", explica: "Energía, ambiente, cultura, Congreso y demás." });
    return {
      anio: P.anio, oficial: false, pia: P.total, pim: null, dev: null, fuente: P.totalFuente,
      niveles: P.niveles.map((n) => ({ nombre: n.nombre, monto: (P.total * n.pct) / 100 })),
      funciones: funciones.sort((a, b) => b.monto - a.monto)
    };
  }

  let PR, CONG, VIS;
  const I = D.ingresos;
  const sumaRubros = I.rubros.reduce((a, r) => a + r.monto, 0);
  const devoluciones = Math.max(0, sumaRubros - I.totalNeto);

  // ---------- Fila de barra reutilizable ----------
  function filaHTML({ nombre, valorTexto, pctTexto, ancho, ancho2, estado, detalle, gris }) {
    const clase = gris ? "pista__barra pista__barra--gris" : estado === "estimado" ? "pista__barra pista__barra--estimado" : "pista__barra";
    const capa2 = ancho2 != null ? `<div class="pista__gastado" style="width:${Math.max(0, ancho2).toFixed(2)}%"></div>` : "";
    return `
      <details class="fila">
        <summary>
          <div class="fila__top">
            <span class="fila__nombre">${nombre}</span>
            <span class="fila__valor">${valorTexto}${pctTexto ? `<span class="fila__pct">${pctTexto}</span>` : ""}</span>
          </div>
          <div class="pista" aria-hidden="true"><div class="${clase}" style="width:${Math.max(0.6, ancho).toFixed(2)}%">${capa2}</div></div>
        </summary>
        <div class="fila__detalle">${detalle}</div>
      </details>`;
  }
  const filaSimple = (nombre, valor, max, texto) =>
    `<div class="fila fila--simple"><div class="fila__top"><span class="fila__nombre">${esc(nombre)}</span><span class="fila__valor">${texto}</span></div>
     <div class="pista" aria-hidden="true"><div class="pista__barra" style="width:${((valor / max) * 100).toFixed(1)}%"></div></div></div>`;

  // ---------- INICIO ----------
  function pintarInicio() {
    const porPersona = (PR.pia * 1e6) / D.poblacion;
    const pres = D.sueldos.find((s) => /Presidente/.test(s.cargo));
    const kpis = [
      { href: "#ingresos", label: `Recaudación de impuestos ${I.anio}`, valor: millones(I.totalNeto), extra: `+${nf1.format(I.crecimiento)}% vs. año anterior` },
      { href: "#gastos", label: `Presupuesto aprobado ${PR.anio}`, valor: millones(PR.pia), extra: PR.dev ? `Ya se gastó el ${pct(PR.dev, PR.pim)} del presupuesto actual` : "Lo aprobado por el Congreso" },
      { href: "#gastos", label: "Presupuesto por peruano", valor: soles(porPersona), extra: `≈ ${soles(porPersona / 12)} al mes por persona` },
      { href: "#sueldos", label: "Sueldo del Presidente(a)", valor: soles(pres.monto), extra: `= ${nf1.format(pres.monto / D.rmv)} sueldos mínimos` }
    ];
    if (CONG) {
      const s = resumenCamara(CONG.camaras.senado), d = resumenCamara(CONG.camaras.diputados);
      kpis.push({ href: "#congreso", label: "Asistencia promedio al Pleno", valor: `${nf0.format(s.prom)}% · ${nf0.format(d.prom)}%`, extra: "Senado · Diputados (según actas)" });
    }
    if (VIS) kpis.push({ href: "#visitas", label: "Reuniones con la Presidencia", valor: nf0.format(VIS.totalPresidencia), extra: `desde el ${fechaLarga(VIS.desde)} · ${nf0.format(VIS.total)} visitas a Palacio` });
    $("#kpis").innerHTML = kpis
      .map((k) => `<a class="kpi" href="${k.href}"><p class="kpi__label">${k.label}</p><p class="kpi__valor">${k.valor}</p><p class="kpi__extra">${k.extra}</p></a>`)
      .join("");
  }

  // ---------- INGRESOS ----------
  function pintarIngresos() {
    $("#ingresos-intro").innerHTML =
      `En <strong>${I.anio}</strong> el Estado recaudó <strong>${millones(I.totalNeto)}</strong> en impuestos ` +
      `(ya restadas las devoluciones), ${nf1.format(I.crecimiento)}% más que el año anterior. ${sello(I.totalEstado)} ` +
      `<span class="fuente">Fuente: ${enlace(I.totalFuente)}</span>`;
    const max = Math.max(...I.rubros.map((r) => r.monto));
    let html = [...I.rubros].sort((a, b) => b.monto - a.monto).map((r) =>
      filaHTML({ nombre: esc(r.nombre), valorTexto: millones(r.monto), pctTexto: pct(r.monto, sumaRubros), ancho: (r.monto / max) * 100, estado: r.estado,
        detalle: `<p>${esc(r.explica)}</p><p>${sello(r.estado)} Fuente: ${enlace(r.fuente)}</p>` })).join("");
    if (devoluciones > 0)
      html += filaHTML({ nombre: "Menos: devoluciones", valorTexto: "− " + millones(devoluciones), ancho: (devoluciones / max) * 100, gris: true,
        detalle: "<p>Dinero que SUNAT devuelve: exportadores, saldos a favor de Renta, etc. Es la diferencia entre la suma de rubros y el total neto oficial.</p>" });
    $("#ingresos-barras").innerHTML = html;
    const porPersona = (I.totalNeto * 1e6) / D.poblacion;
    const igv = I.rubros.find((r) => /IGV/.test(r.nombre));
    $("#ingresos-equivalencias").innerHTML = [
      `Cada día entran en promedio <strong>${millones(I.totalNeto / 365)}</strong> por impuestos.`,
      `Equivale a <strong>${soles(porPersona)}</strong> por cada peruano al año.`,
      igv ? `El <strong>IGV</strong> —el que pagamos todos al comprar— es más de la mitad de lo recaudado (${pct(igv.monto, sumaRubros)} del bruto).` : "",
      `Los impuestos no alcanzan para todo el presupuesto: la diferencia (${millones(PR.pia - I.totalNeto)}) se cubre con regalías, canon, tasas, préstamos y bonos.`
    ].filter(Boolean).map((t) => `<li>${t}</li>`).join("");
  }

  // ---------- GASTOS ----------
  let unidad = "total", vista = "barras", nodoArbol = null;
  const valorUnidad = (m) => (unidad === "total" ? millones(m) : soles((m * 1e6) / D.poblacion) + " /año");
  const cortoUnidad = (m) => (unidad === "total" ? corto(m) : soles((m * 1e6) / D.poblacion));

  function pintarGastos() {
    const corte = PR.corte ? ` Datos al ${PR.corte.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}.` : "";
    $("#gastos-intro").innerHTML = PR.pim
      ? `Para <strong>${PR.anio}</strong> el Congreso aprobó <strong>${millones(PR.pia)}</strong>. Durante el año el presupuesto se amplió a <strong>${millones(PR.pim)}</strong> y ya se gastó <strong>${millones(PR.dev)}</strong>.${corte} ${sello("oficial")}`
      : `Para <strong>${PR.anio}</strong> el Congreso aprobó un presupuesto de <strong>${millones(PR.pia)}</strong>. ${sello("oficial")}`;
    $("#gastos-fuente").innerHTML = `Fuente: ${enlace(PR.fuente)}${PR.oficial ? " — se actualiza automáticamente cada semana." : ""}`;

    if (PR.pim) {
      $("#ejecucion").innerHTML = [
        ["Aprobado (PIA)", millones(PR.pia), "Ley de Presupuesto"],
        ["Presupuesto actual (PIM)", millones(PR.pim), `${PR.pim >= PR.pia ? "+" : ""}${pct(PR.pim - PR.pia, PR.pia)} vs. lo aprobado`],
        ["Ya gastado (devengado)", millones(PR.dev), `${pct(PR.dev, PR.pim)} del presupuesto actual`]
      ].map(([l, v, e]) => `<div class="kpi"><p class="kpi__label">${l}</p><p class="kpi__valor">${v}</p><p class="kpi__extra">${e}</p></div>`).join("");
    }

    const colores = ["var(--nivel-1)", "var(--nivel-2)", "var(--nivel-3)"];
    const totN = PR.niveles.reduce((a, n) => a + n.monto, 0);
    $("#niveles").innerHTML = PR.niveles.map((n, i) => `<span style="width:${(n.monto / totN) * 100}%;background:${colores[i]}" title="${esc(n.nombre)}"></span>`).join("");
    $("#niveles-leyenda").innerHTML = PR.niveles.map((n, i) =>
      `<li><i style="background:${colores[i]}"></i><span>${esc(n.nombre)}</span><b>${pct(n.monto, totN)} · ${corto(n.monto)}</b></li>`).join("");
    $("#niveles-fuente").innerHTML = PR.oficial ? `Presupuesto actual (PIM). Fuente: ${enlace(PR.fuente)}` : `Porcentajes aproximados. Fuente: ${enlace(D.presupuesto.nivelesFuente)}`;
    pintarFunciones();
  }

  function pintarFunciones() {
    const conDev = PR.dev != null;
    $("#gastos-ayuda").innerHTML = vista === "arbol"
      ? "El tamaño de cada bloque es proporcional a su presupuesto. Toca un bloque para ver en qué se divide."
      : conDev
        ? 'Toca cada fila para ver el detalle. <span class="mini-leyenda"><i class="ml-pim"></i>Presupuesto del año <i class="ml-dev"></i>Ya gastado</span>'
        : "Presupuesto por función. Toca cada fila para ver qué incluye y la fuente.";
    $("#gastos-barras").hidden = vista !== "barras";
    $("#gastos-arbol-wrap").hidden = vista !== "arbol";
    if (vista === "arbol") return pintarArbol();

    const lista = PR.funciones;
    const max = Math.max(...lista.map((f) => f.monto));
    const total = lista.reduce((a, f) => a + f.monto, 0);
    $("#gastos-barras").innerHTML = lista.map((f) => {
      const perCap = (f.monto * 1e6) / D.poblacion;
      const subs = f.hijos && f.hijos.length > 1
        ? `<ul class="subdiv">${f.hijos.slice(0, 8).map((h) => `<li><span>${esc(h.nombre)}</span><b>${corto(h.monto)}</b></li>`).join("")}</ul>` : "";
      return filaHTML({
        nombre: `<span aria-hidden="true">${f.icono}</span> ${esc(f.nombre)}`,
        valorTexto: valorUnidad(f.monto), pctTexto: pct(f.monto, total),
        ancho: (f.monto / max) * 100, ancho2: conDev ? (f.dev / f.monto) * 100 : null, estado: f.estado,
        detalle: (f.explica ? `<p>${esc(f.explica)}</p>` : "") +
          (conDev ? `<p>Aprobado: <strong>${millones(f.pia)}</strong> · Actual: <strong>${millones(f.monto)}</strong> · Gastado: <strong>${millones(f.dev)}</strong> (${pct(f.dev, f.monto)})</p>` : "") +
          `<p>Por persona: <strong>${soles(perCap)}</strong> al año (${soles(perCap / 12)} al mes).</p>` + subs +
          (PR.oficial ? "" : `<p>${sello(f.estado)} Fuente: ${enlace(f.fuente)}</p>`)
      });
    }).join("");
  }

  function pintarArbol() {
    const migas = $("#arbol-migas");
    const items = (nodoArbol ? nodoArbol.hijos : PR.funciones).map((f) => ({ nombre: f.nombre, valor: f.monto, icono: f.icono, hijos: f.hijos, ref: f }));
    migas.innerHTML = nodoArbol
      ? `<button type="button" class="migas__volver">← Todas las funciones</button> <span>/ ${nodoArbol.icono || ""} ${esc(nodoArbol.nombre)} · ${valorUnidad(nodoArbol.monto)}</span>`
      : `<span>Todo el presupuesto · ${valorUnidad(PR.pim || PR.pia)}</span>`;
    const volver = $(".migas__volver", migas);
    if (volver) volver.addEventListener("click", () => { nodoArbol = null; pintarArbol(); });
    window.dibujarArbol($("#gastos-arbol"), items, {
      formato: cortoUnidad,
      alTocar: (it) => { if (!nodoArbol && it.hijos && it.hijos.length > 1) { nodoArbol = it.ref; pintarArbol(); } }
    });
  }

  function grupoBotones(attr, alCambiar) {
    $$(`[data-${attr}]`).forEach((b) => b.addEventListener("click", () => {
      $$(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      alCambiar(b.dataset[attr]);
    }));
  }
  grupoBotones("unidad", (v) => { unidad = v; pintarFunciones(); });
  grupoBotones("vista", (v) => { vista = v; pintarFunciones(); try { localStorage.setItem("vistaGastos", v); } catch (e) {} });
  let redimensionar;
  window.addEventListener("resize", () => { clearTimeout(redimensionar); redimensionar = setTimeout(() => { if (vista === "arbol" && !$("#gastos").hidden) pintarArbol(); }, 150); });

  // ---------- SUELDOS ----------
  function pintarSueldos(filtro = "") {
    const q = normal(filtro.trim());
    const lista = D.sueldos.filter((s) => !q || normal(`${s.cargo} ${s.entidad} ${s.grupo}`).includes(q)).sort((a, b) => b.monto - a.monto);
    const max = Math.max(...D.sueldos.map((s) => s.monto));
    $("#lista-sueldos").innerHTML = lista.length
      ? lista.map((s) => {
          const comp = /mínima/i.test(s.cargo) ? "Referencia" : `= ${nf1.format(s.monto / D.rmv)} sueldos mínimos · ${soles(s.monto / 30)} por día`;
          return `<article class="sueldo">
            <div class="sueldo__cab"><div><p class="sueldo__cargo">${esc(s.cargo)}</p><p class="sueldo__entidad">${esc(s.entidad)}</p></div>
              <p class="sueldo__monto">${soles(s.monto)}<span class="fila__pct">/mes</span></p></div>
            <p class="sueldo__comp">${comp}</p>
            <div class="pista" aria-hidden="true"><div class="${s.estado === "estimado" ? "pista__barra pista__barra--estimado" : "pista__barra"}" style="width:${((s.monto / max) * 100).toFixed(1)}%"></div></div>
            <p class="sueldo__nota">${sello(s.estado)} ${esc(s.nota || "")} Fuente: ${enlace(s.fuente)}</p></article>`;
        }).join("")
      : `<p class="vacio">No encontramos ese cargo. Prueba en el <a href="https://www.transparencia.gob.pe/" target="_blank" rel="noopener">Portal de Transparencia Estándar</a>.</p>`;
  }
  $("#buscar-sueldo").addEventListener("input", (e) => pintarSueldos(e.target.value));
  const enlacesHTML = (arr) => arr.map((b) => `<li><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.nombre)} ↗</a><p>${esc(b.que)}</p></li>`).join("");

  // ---------- CONGRESO ----------
  let camara = "senado";
  function resumenCamara(c) {
    const ses = c.sesiones.length;
    const pres = c.sesiones.reduce((a, s) => a + s.presentes, 0);
    const tot = c.sesiones.reduce((a, s) => a + s.presentes + s.licencias + s.ausentes, 0);
    const aus = c.sesiones.reduce((a, s) => a + s.ausentes, 0);
    return { ses, prom: tot ? (100 * pres) / tot : 0, aus, perfectos: c.miembros.filter((m) => m.presente === m.sesiones).length };
  }
  function pintarCongreso() {
    if (!CONG) {
      $("#congreso-kpis").innerHTML = "";
      $("#lista-congreso").innerHTML = '<p class="vacio">Aún no hay datos de asistencia. Ejecuta <code>python scripts/actualizar_congreso.py</code> o espera la actualización semanal.</p>';
      return;
    }
    const c = CONG.camaras[camara];
    const r = resumenCamara(c);
    $("#congreso-kpis").innerHTML = [
      ["Sesiones del Pleno analizadas", nf0.format(r.ses), c.sesiones.length ? `del ${fechaCorta(c.sesiones[0].fecha)} al ${fechaLarga(c.sesiones[c.sesiones.length - 1].fecha)}` : ""],
      ["Asistencia promedio", nf1.format(r.prom) + "%", "al inicio de cada sesión"],
      ["Ausencias sin licencia", nf0.format(r.aus), `${r.perfectos} integrantes no faltaron a ninguna`]
    ].map(([l, v, e]) => `<div class="kpi"><p class="kpi__label">${l}</p><p class="kpi__valor">${v}</p><p class="kpi__extra">${e}</p></div>`).join("");
    pintarListaCongreso();
    $("#sesiones-congreso").innerHTML = `<table class="tabla"><thead><tr><th>Sesión</th><th>Fecha</th><th>Presentes</th><th>Licencia</th><th>Ausentes</th><th>Acta</th></tr></thead><tbody>` +
      [...c.sesiones].reverse().map((s) => `<tr><td>${s.numero}.ª</td><td>${fechaLarga(s.fecha)}</td><td>${s.presentes}</td><td>${s.licencias}</td><td>${s.ausentes}</td><td><a href="${esc(s.url)}" target="_blank" rel="noopener">PDF ↗</a></td></tr>`).join("") +
      "</tbody></table>";
    $("#congreso-fuente").innerHTML = `Fuente: actas oficiales del Pleno publicadas en <a href="${esc(c.fuente)}" target="_blank" rel="noopener">${esc(c.fuente.replace("https://", ""))}</a>. Solo se cuentan las actas ya publicadas; suele haber semanas de retraso. Actualizado: ${new Date(CONG.actualizado).toLocaleDateString("es-PE")}.`;
  }
  function pintarListaCongreso() {
    const c = CONG.camaras[camara];
    const q = clave($("#buscar-congreso").value);
    const orden = $("#orden-congreso").value;
    const lista = c.miembros.filter((m) => !q || clave(m.nombre).includes(q));
    if (orden === "faltas") lista.sort((a, b) => b.ausente - a.ausente || a.pct - b.pct);
    else if (orden === "asistencia") lista.sort((a, b) => b.pct - a.pct || a.ausente - b.ausente);
    else lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const quien = camara === "senado" ? "Senador(a)" : "Diputado(a)";
    $("#lista-congreso").innerHTML = lista.length ? lista.map((m) => {
      const w = (n) => ((n / m.sesiones) * 100).toFixed(1);
      return `<div class="asis">
        <div class="asis__top"><span class="asis__nombre">${esc(m.nombre)}<small>${quien}</small></span><span class="asis__pct">${nf0.format(m.pct)}%</span></div>
        <div class="asis__barra" aria-hidden="true"><span class="a-pre" style="width:${w(m.presente)}%"></span><span class="a-lic" style="width:${w(m.licencia + m.otro)}%"></span><span class="a-aus" style="width:${w(m.ausente)}%"></span></div>
        <p class="asis__txt">Asistió a ${m.presente} de ${m.sesiones} · ${m.licencia ? `${m.licencia} con licencia · ` : ""}<strong class="${m.ausente ? "rojo" : ""}">${m.ausente} ausencia${m.ausente === 1 ? "" : "s"}</strong></p>
      </div>`;
    }).join("") : '<p class="vacio">No encontramos ese apellido.</p>';
  }
  grupoBotones("camara", (v) => { camara = v; pintarCongreso(); });
  $("#buscar-congreso").addEventListener("input", () => CONG && pintarListaCongreso());
  $("#orden-congreso").addEventListener("change", () => CONG && pintarListaCongreso());

  // ---------- VISITAS ----------
  let modoVisitas = "presidencia", mostrarN = 30;
  const minutos = (hhmm) => { const m = /^(\d{1,2}):(\d{2})/.exec(hhmm || ""); return m ? +m[1] * 60 + +m[2] : null; };
  function duracion(a, b) {
    const x = minutos(a), y = minutos(b);
    if (x == null || y == null || y < x) return "";
    const d = y - x;
    return d >= 60 ? `${Math.floor(d / 60)} h ${String(d % 60).padStart(2, "0")} min` : `${d} min`;
  }
  function lunesISO(etiqueta) {
    const [y, w] = etiqueta.split("-S").map(Number);
    const ene4 = new Date(Date.UTC(y, 0, 4));
    const lunes = new Date(ene4.getTime() - ((ene4.getUTCDay() + 6) % 7) * 864e5 + (w - 1) * 7 * 864e5);
    return lunes.toISOString().slice(0, 10);
  }
  function pintarVisitas() {
    if (!VIS) {
      $("#lista-visitas").innerHTML = '<p class="vacio">Aún no hay datos de visitas. Ejecuta <code>python scripts/actualizar_visitas.py</code>.</p>';
      return;
    }
    const titular = VIS.titular ? VIS.titular.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : "la Presidencia";
    $("#visitas-intro").innerHTML = `Registro oficial de visitas al Despacho Presidencial desde el <strong>${fechaLarga(VIS.desde)}</strong>: quién entra, a quién visita, para qué y cuánto tiempo se queda. Las reuniones con la Presidencia de la República figuran a nombre de <strong>${esc(titular)}</strong>.`;
    const ultSem = VIS.semanas[VIS.semanas.length - 1];
    const dias = (new Date(VIS.hasta) - new Date(VIS.desde)) / 864e5 + 1;
    $("#visitas-kpis").innerHTML = [
      ["Visitas a Palacio", nf0.format(VIS.total), `≈ ${nf0.format(VIS.total / dias)} por día`],
      ["Reuniones con la Presidencia", nf0.format(VIS.totalPresidencia), `≈ ${nf1.format((VIS.totalPresidencia / dias) * 7)} por semana`],
      ["Esta semana", nf0.format(ultSem ? ultSem.total : 0), `${ultSem ? ultSem.presidencia : 0} con la Presidencia · al ${fechaCorta(VIS.hasta)}`]
    ].map(([l, v, e]) => `<div class="kpi"><p class="kpi__label">${l}</p><p class="kpi__valor">${v}</p><p class="kpi__extra">${e}</p></div>`).join("");

    const maxS = Math.max(1, ...VIS.semanas.map((s) => s.presidencia));
    $("#visitas-semanas").setAttribute("aria-label", "Reuniones con la Presidencia por semana: " + VIS.semanas.map((s) => `semana del ${fechaCorta(lunesISO(s.semana))}: ${s.presidencia} (de ${s.total} visitas a Palacio)`).join("; "));
    $("#visitas-semanas").innerHTML = VIS.semanas.map((s) =>
      `<div class="col" title="Semana del ${fechaCorta(lunesISO(s.semana))}: ${s.presidencia} reuniones con la Presidencia, ${s.total} visitas a Palacio en total">
        <div class="col__barras"><span class="col__pres" style="height:${(s.presidencia / maxS) * 100}%"></span></div>
        <span class="col__num"><b>${s.presidencia}</b></span><span class="col__sub">${s.total}</span><span class="col__lbl">${fechaCorta(lunesISO(s.semana))}</span></div>`).join("");

    const maxE = Math.max(1, ...VIS.topEntidadesPresidencia.map((e) => e[1]));
    $("#top-entidades").innerHTML = VIS.topEntidadesPresidencia.map(([n, v]) => filaSimple(n === "PARTICULAR" ? "Particulares (sin entidad)" : n, v, maxE, `${v} reuniones`)).join("");
    const maxF = Math.max(1, ...VIS.topFuncionarios.map((e) => e[1]));
    $("#top-funcionarios").innerHTML = VIS.topFuncionarios.map(([[n, cargo], v]) => filaSimple(`${n} — ${cargo}`, v, maxF, `${v}`)).join("");
    $("#visitas-fuente").innerHTML = `Fuente: <a href="${esc(VIS.fuente)}" target="_blank" rel="noopener">Registro de visitas del Despacho Presidencial</a> (Ley 28024 y Directiva 003-2026-PCM/SIP). Por privacidad no mostramos el DNI de los visitantes. Actualizado: ${new Date(VIS.actualizado).toLocaleDateString("es-PE")}.`;
    pintarListaVisitas();
  }
  function pintarListaVisitas() {
    const q = normal($("#buscar-visitas").value.trim());
    const base = modoVisitas === "presidencia" ? VIS.presidencia : VIS.recientes;
    const lista = base.filter((f) => !q || normal(f.join(" ")).includes(q));
    $("#t-visitas-pres").textContent = modoVisitas === "presidencia" ? "Reuniones con la Presidencia de la República" : "Todas las visitas de los últimos 14 días";
    $("#lista-visitas").innerHTML = lista.length ? lista.slice(0, mostrarN).map((f) => {
      const [fecha, visitante, entidad, motivo, funcionario, cargo, ing, sal, obs] = f;
      const dur = duracion(ing, sal);
      return `<article class="visita">
        <div class="visita__fecha"><b>${fechaCorta(fecha)}</b><span>${esc(ing)}${sal ? "–" + esc(sal) : ""}</span>${dur ? `<small>${dur}</small>` : ""}</div>
        <div class="visita__cuerpo">
          <p class="visita__quien">${esc(visitante)}</p>
          <p class="visita__entidad">${esc(entidad || "—")}</p>
          <p class="visita__motivo">${esc(motivo)}${obs ? ` · <em>${esc(obs)}</em>` : ""}</p>
          ${modoVisitas === "recientes" ? `<p class="visita__a">Visitó a: ${esc(funcionario)} <small>(${esc(cargo)})</small></p>` : ""}
        </div></article>`;
    }).join("") : '<p class="vacio">No hay visitas que coincidan con la búsqueda.</p>';
    $("#mas-visitas").hidden = lista.length <= mostrarN;
    $("#mas-visitas").textContent = `Ver más (${nf0.format(lista.length - mostrarN)} restantes)`;
  }
  grupoBotones("visitas", (v) => { modoVisitas = v; mostrarN = 30; VIS && pintarListaVisitas(); });
  $("#buscar-visitas").addEventListener("input", () => { mostrarN = 30; VIS && pintarListaVisitas(); });
  $("#mas-visitas").addEventListener("click", () => { mostrarN += 30; pintarListaVisitas(); });

  // ---------- CALCULADORA ----------
  function rentaQuinta(sueldoMensual) {
    let base = Math.max(0, sueldoMensual * 14 - 7 * D.uit); // 12 sueldos + 2 gratificaciones
    let imp = 0;
    for (const [uits, tasa] of [[5, 0.08], [15, 0.14], [15, 0.17], [10, 0.2], [Infinity, 0.3]]) {
      const parte = Math.min(base, uits * D.uit);
      imp += parte * tasa;
      base -= parte;
      if (base <= 0) break;
    }
    return imp;
  }
  function calcular() {
    const gasto = Math.max(0, parseFloat($("#in-gasto").value) || 0);
    const sueldo = Math.max(0, parseFloat($("#in-sueldo").value) || 0);
    const igvAnual = (gasto * 12 * 18) / 118;
    const renta = rentaQuinta(sueldo);
    const total = igvAnual + renta;
    $("#res-total").textContent = soles(total) + " al año";
    $("#res-detalle").innerHTML = `IGV en tus compras: <strong>${soles(igvAnual)}</strong><br>Impuesto a la Renta (5.ª cat.): <strong>${soles(renta)}</strong>` +
      (renta === 0 && sueldo > 0 ? " <small>(ganas menos de 7 UIT al año, no pagas)</small>" : "") + `<br>Equivale a <strong>${soles(total / 12)}</strong> al mes.`;
    const lista = PR.funciones;
    const suma = lista.reduce((a, f) => a + f.monto, 0);
    const max = Math.max(...lista.map((f) => f.monto));
    $("#res-reparto").innerHTML = lista.map((f) => filaHTML({
      nombre: `<span aria-hidden="true">${f.icono}</span> ${esc(f.nombre)}`, valorTexto: soles((total * f.monto) / suma),
      pctTexto: pct(f.monto, suma), ancho: (f.monto / max) * 100, estado: f.estado, detalle: `<p>${esc(f.explica || "")}</p>`
    })).join("");
  }
  ["#in-gasto", "#in-sueldo"].forEach((id) => $(id).addEventListener("input", calcular));

  // ---------- FUENTES ----------
  function pintarFuentes() {
    $("#fecha-act").textContent = PR.corte ? PR.corte.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) + " (presupuesto MEF)" : D.actualizado;
    const extra = [
      { nombre: "MEF — Datos Abiertos: Presupuesto y Ejecución de Gasto", url: "https://www.datosabiertos.gob.pe/dataset/presupuesto-y-ejecuci%C3%B3n-de-gasto", que: "CSV diario con cada sol del presupuesto. De aquí sale la sección de gastos (actualización semanal automática)." },
      { nombre: "Actas del Pleno del Senado", url: "https://senado.congreso.gob.pe/", que: "De aquí se lee la asistencia de los senadores." },
      { nombre: "Actas del Pleno de la Cámara de Diputados", url: "https://diputados.congreso.gob.pe/", que: "De aquí se lee la asistencia de los diputados." },
      { nombre: "Registro de visitas del Despacho Presidencial", url: "https://consulta-visitas.presidencia.gob.pe/", que: "Visitas a Palacio de Gobierno, día por día." },
      { nombre: "SUNAT — Estadísticas y estudios", url: "https://www.sunat.gob.pe/estadisticasestudios/", que: "Recaudación mensual por tipo de impuesto (Nota Tributaria)." }
    ];
    $("#fuentes-lista").innerHTML = enlacesHTML([...extra, ...D.buscadoresOficiales]);
  }

  // ---------- Navegación ----------
  const vistas = $$(".vista");
  function mostrar() {
    const id = (location.hash || "#inicio").slice(1);
    const v = vistas.find((x) => x.id === id) || vistas[0];
    vistas.forEach((x) => (x.hidden = x !== v));
    $$(".nav a").forEach((a) => (a.getAttribute("href") === "#" + v.id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    $("#nav").classList.remove("abierto");
    $(".menu-btn").setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    if (v.id === "gastos" && vista === "arbol") pintarArbol(); // el árbol necesita el ancho visible
  }
  window.addEventListener("hashchange", mostrar);
  $(".menu-btn").addEventListener("click", (e) => {
    const abierto = $("#nav").classList.toggle("abierto");
    e.currentTarget.setAttribute("aria-expanded", String(abierto));
  });

  // ---------- Arranque ----------
  (async function iniciar() {
    const [mef, cong, vis] = await Promise.all([cargar("presupuesto.json"), cargar("congreso.json"), cargar("visitas.json")]);
    PR = modeloPresupuesto(mef);
    CONG = cong && cong.camaras ? cong : null;
    VIS = vis && vis.semanas ? vis : null;
    try { const v = localStorage.getItem("vistaGastos"); if (v === "arbol") { vista = "arbol"; $$("[data-vista]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.vista === "arbol"))); } } catch (e) {}
    pintarInicio();
    pintarIngresos();
    pintarGastos();
    pintarSueldos();
    $("#buscadores").innerHTML = enlacesHTML(D.buscadoresOficiales);
    pintarCongreso();
    pintarVisitas();
    calcular();
    pintarFuentes();
    mostrar();
  })();
})();
