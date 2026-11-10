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

  let PR, CONG, VIS, REC, SUE, PROY, ING;

  // ---------- Modelo de ingresos (BCRP/SUNAT si existe, si no datos.js) ----------
  const EXPLICA_ING = {
    igv: ["IGV (impuesto a las compras)", "El 18% que pagas al comprar casi cualquier producto o servicio (16% IGV + 2% municipal)."],
    renta: ["Impuesto a la Renta", "Lo que pagan empresas y personas por sus ganancias y sueldos."],
    otros: ["Otros (ITF, multas, fraccionamientos…)", "Impuesto a las transacciones financieras, multas, deudas fraccionadas, impuesto temporal a los activos, etc."],
    isc: ["ISC (selectivo al consumo)", "Impuesto extra a combustibles, cerveza, licores, cigarros, apuestas y otros."],
    importaciones: ["Aranceles (importaciones)", "Lo que se paga al traer productos del extranjero."]
  };
  function modeloIngresos(rec) {
    if (rec && rec.anios && rec.anios.length) {
      const completos = rec.anios.filter((a) => a.completo);
      const a = completos[completos.length - 1];
      const prev = completos[completos.length - 2];
      const rubros = Object.keys(EXPLICA_ING).map((k) => ({ clave: k, nombre: EXPLICA_ING[k][0], explica: EXPLICA_ING[k][1], monto: a[k], estado: "oficial" }));
      return {
        oficial: true, anio: a.anio, totalNeto: a.total, crecimiento: prev ? (100 * (a.total / prev.total - 1)) : null,
        rubros, devoluciones: Math.abs(a.devoluciones), sumaRubros: rubros.reduce((s, r) => s + r.monto, 0),
        fuente: { nombre: "BCRP — Ingresos tributarios del Gobierno Central (datos de SUNAT y MEF)", url: rec.fuente },
        acumulado: rec.acumulado, meses: rec.meses, ultimoMes: rec.ultimoMes, anios: rec.anios
      };
    }
    const sumaR = D.ingresos.rubros.reduce((a, r) => a + r.monto, 0);
    return { oficial: false, anio: D.ingresos.anio, totalNeto: D.ingresos.totalNeto, crecimiento: D.ingresos.crecimiento, rubros: D.ingresos.rubros,
      devoluciones: Math.max(0, sumaR - D.ingresos.totalNeto), sumaRubros: sumaR, fuente: D.ingresos.totalFuente };
  }
  const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];

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
  const kpiHTML = ([l, v, e, href]) => href
    ? `<a class="kpi" href="${href}"><p class="kpi__label">${l}</p><p class="kpi__valor">${v}</p><p class="kpi__extra">${e}</p></a>`
    : `<div class="kpi"><p class="kpi__label">${l}</p><p class="kpi__valor">${v}</p><p class="kpi__extra">${e}</p></div>`;

  // Sueldo del Presidente: de la planilla oficial si está, si no de datos.js
  function sueldoPresidente() {
    const dp = SUE && SUE.entidades.find((e) => e.id === 10031);
    const fila = dp && dp.top.find((t) => /^PRESIDENTE DE LA REP/i.test(t[1]));
    if (fila) return { monto: fila[2], fuente: "planilla " + dp.periodo };
    return { monto: D.sueldos.find((s) => /Presidente/.test(s.cargo)).monto, fuente: "D.S. 136-2025-EF" };
  }

  // ---------- INICIO ----------
  function pintarInicio() {
    const porPersona = (PR.pia * 1e6) / D.poblacion;
    const pres = sueldoPresidente();
    const ac = ING.acumulado;
    const kpis = [
      ac ? ["Recaudación de impuestos " + ac.anio, millones(ac.total), `enero–${MESES_LARGO[ac.hastaMes - 1]} · ${ac.variacion >= 0 ? "+" : ""}${nf1.format(ac.variacion)}% vs. ${ac.anio - 1}`, "#ingresos"]
         : [`Recaudación de impuestos ${ING.anio}`, millones(ING.totalNeto), `+${nf1.format(ING.crecimiento)}% vs. año anterior`, "#ingresos"],
      [`Presupuesto aprobado ${PR.anio}`, millones(PR.pia), PR.dev ? `Ya se gastó el ${pct(PR.dev, PR.pim)} del presupuesto actual` : "Lo aprobado por el Congreso", "#gastos"],
      ["Presupuesto por peruano", soles(porPersona), `≈ ${soles(porPersona / 12)} al mes por persona`, "#gastos"],
      ["Sueldo del Presidente(a)", soles(pres.monto), `= ${nf1.format(pres.monto / D.rmv)} sueldos mínimos · ${pres.fuente}`, "#sueldos"]
    ];
    if (CONG) {
      const s = resumenCamara(CONG.camaras.senado), d = resumenCamara(CONG.camaras.diputados);
      kpis.push(["Asistencia promedio al Pleno", `${nf0.format(s.prom)}% · ${nf0.format(d.prom)}%`, "Senado · Diputados (según actas)", "#congreso"]);
    }
    if (PROY) kpis.push(["Proyectos de ley presentados", nf0.format(PROY.total), `${nf0.format(contarLeyes())} ya publicados como ley · desde jul. 2026`, "#leyes"]);
    if (VIS) kpis.push(["Reuniones con la Presidencia", nf0.format(VIS.totalPresidencia), `desde el ${fechaLarga(VIS.desde)} · ${nf0.format(VIS.total)} visitas a Palacio`, "#visitas"]);
    if (SUE) kpis.push(["Personas en planillas revisadas", nf0.format(SUE.entidades.reduce((a, e) => a + e.personas, 0)), `${SUE.entidades.length} entidades del Estado`, "#sueldos"]);
    $("#kpis").innerHTML = kpis.map(kpiHTML).join("");
  }

  // ---------- INGRESOS ----------
  function pintarIngresos() {
    const ac = ING.acumulado;
    $("#ingresos-intro").innerHTML =
      `En <strong>${ING.anio}</strong> el Estado recaudó <strong>${millones(ING.totalNeto)}</strong> en impuestos ` +
      `(ya restadas las devoluciones)${ING.crecimiento != null ? `, ${nf1.format(ING.crecimiento)}% más que el año anterior` : ""}. ${sello(ING.oficial ? "oficial" : "estimado")}` +
      (ac ? ` En ${ac.anio}, de enero a ${MESES_LARGO[ac.hastaMes - 1]}, ya van <strong>${millones(ac.total)}</strong>.` : "");
    if (ac) {
      const ultimo = ING.meses[ING.meses.length - 1];
      $("#ingresos-kpis").innerHTML = [
        [`Recaudado en ${ac.anio} (ene–${MESES[ac.hastaMes - 1]})`, millones(ac.total), `${ac.variacion >= 0 ? "+" : ""}${nf1.format(ac.variacion)}% vs. mismo periodo de ${ac.anio - 1}`],
        [`Último mes: ${MESES_LARGO[+ultimo.mes.slice(5) - 1]} ${ultimo.mes.slice(0, 4)}`, millones(ultimo.total), `IGV ${corto(ultimo.igv)} · Renta ${corto(ultimo.renta)}`],
        [`Total ${ING.anio} (año completo)`, millones(ING.totalNeto), `${soles((ING.totalNeto * 1e6) / D.poblacion)} por peruano`]
      ].map(kpiHTML).join("");
    }
    $("#t-ingresos-barras").textContent = `¿De dónde viene? (${ING.anio})`;
    const max = Math.max(...ING.rubros.map((r) => r.monto));
    let html = [...ING.rubros].sort((a, b) => b.monto - a.monto).map((r) =>
      filaHTML({ nombre: esc(r.nombre), valorTexto: millones(r.monto), pctTexto: pct(r.monto, ING.sumaRubros), ancho: (r.monto / max) * 100, estado: r.estado,
        detalle: `<p>${esc(r.explica)}</p>` + (r.fuente ? `<p>${sello(r.estado)} Fuente: ${enlace(r.fuente)}</p>` : "") })).join("");
    if (ING.devoluciones > 0)
      html += filaHTML({ nombre: "Menos: devoluciones", valorTexto: "− " + millones(ING.devoluciones), ancho: (ING.devoluciones / max) * 100, gris: true,
        detalle: "<p>Dinero que SUNAT devuelve: a exportadores, saldos a favor del Impuesto a la Renta, etc.</p>" });
    $("#ingresos-barras").innerHTML = html;
    $("#ingresos-fuente").innerHTML = `Fuente: ${enlace(ING.fuente)}${ING.oficial ? " — se actualiza automáticamente cada semana." : ""}`;

    if (ING.meses) {
      $("#ingresos-meses-card").hidden = false;
      const ms = ING.meses.slice(-24);
      const maxM = Math.max(...ms.map((m) => m.total));
      $("#ingresos-meses").setAttribute("aria-label", "Recaudación mensual: " + ms.map((m) => `${MESES_LARGO[+m.mes.slice(5) - 1]} ${m.mes.slice(0, 4)}: ${nf0.format(m.total)} millones`).join("; "));
      $("#ingresos-meses").innerHTML = ms.map((m) => {
        const mm = +m.mes.slice(5);
        const actual = m.mes.slice(0, 4) === String(ING.acumulado.anio);
        return `<div class="col" title="${MESES_LARGO[mm - 1]} ${m.mes.slice(0, 4)}: ${millones(m.total)} (IGV ${corto(m.igv)}, Renta ${corto(m.renta)})">
          <div class="col__barras"><span class="col__pres${actual ? "" : " col__pres--prev"}" style="height:${(m.total / maxM) * 100}%"></span></div>
          <span class="col__num">${nf1.format(m.total / 1000)}</span><span class="col__lbl">${MESES[mm - 1]}${mm === 1 ? " " + m.mes.slice(2, 4) : ""}</span></div>`;
      }).join("");
    }
    const porPersona = (ING.totalNeto * 1e6) / D.poblacion;
    const igv = ING.rubros.find((r) => /IGV/.test(r.nombre));
    $("#ingresos-equivalencias").innerHTML = [
      `Cada día entran en promedio <strong>${millones(ING.totalNeto / 365)}</strong> por impuestos.`,
      `Equivale a <strong>${soles(porPersona)}</strong> por cada peruano al año.`,
      igv ? `El <strong>IGV</strong> —el que pagamos todos al comprar— es más de la mitad de lo recaudado (${pct(igv.monto, ING.sumaRubros)} del bruto).` : "",
      ING.meses ? "En el gráfico mensual, los números encima de cada barra están en <strong>miles de millones</strong> de soles. Abril suele ser el mes más alto por la declaración anual de Renta." : "",
      `Los impuestos no alcanzan para todo el presupuesto: la diferencia (${millones(PR.pia - ING.totalNeto)}) se cubre con regalías, canon, tasas, préstamos y bonos.`
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
    $("#top-funcionarios").innerHTML = VIS.topFuncionarios.map(([[n, cargo], v]) => filaSimple(`${nombrePropio(n)} — ${frase(cargo)}`, v, maxF, `${v} visitas`)).join("");
    $("#visitas-fuente").innerHTML = `Fuente: <a href="${esc(VIS.fuente)}" target="_blank" rel="noopener">Registro de visitas del Despacho Presidencial</a> (Ley 28024 y Directiva 003-2026-PCM/SIP). Por privacidad no mostramos el DNI de los visitantes. Actualizado: ${new Date(VIS.actualizado).toLocaleDateString("es-PE")}.`;
    pintarListaVisitas();
  }
  // El registro publica todo en MAYÚSCULAS; se muestra con mayúscula inicial.
  const MINUS = new Set(["de", "del", "la", "las", "los", "y", "e", "el", "en", "a"]);
  const nombrePropio = (s) => (s && s === s.toUpperCase()
    ? s.toLowerCase().replace(/\p{L}+/gu, (w, i) => (i > 0 && MINUS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    : s);
  const frase = (s) => (s && s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s);
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
          <p class="visita__quien">${esc(nombrePropio(visitante))}</p>
          <p class="visita__entidad">${esc(entidad === "PARTICULAR" ? "Particular (sin entidad)" : nombrePropio(entidad) || "—")}</p>
          <p class="visita__motivo">${esc(frase(motivo))}${obs ? ` · <em>${esc(frase(obs))}</em>` : ""}</p>
          ${modoVisitas === "recientes" ? `<p class="visita__a">Visitó a: ${esc(nombrePropio(funcionario))} <small>(${esc(frase(cargo))})</small></p>` : ""}
        </div></article>`;
    }).join("") : '<p class="vacio">No hay visitas que coincidan con la búsqueda.</p>';
    $("#mas-visitas").hidden = lista.length <= mostrarN;
    $("#mas-visitas").textContent = `Ver más (${nf0.format(lista.length - mostrarN)} restantes)`;
  }
  grupoBotones("visitas", (v) => { modoVisitas = v; mostrarN = 30; VIS && pintarListaVisitas(); });
  $("#buscar-visitas").addEventListener("input", () => { mostrarN = 30; VIS && pintarListaVisitas(); });
  $("#mas-visitas").addEventListener("click", () => { mostrarN += 30; pintarListaVisitas(); });

  // ---------- PLANILLAS (sueldo por persona) ----------
  let planilla = null, mostrarP = 50;
  const cachePlanillas = {};
  const MINUS_P = new Set(["de", "del", "la", "las", "los", "y", "e", "el", "en", "a"]);
  const propio = (s) => (s && s === s.toUpperCase()
    ? s.toLowerCase().replace(/\p{L}+/gu, (w, i) => (i > 0 && MINUS_P.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    : s || "");
  const periodoTexto = (p) => (p ? `${MESES_LARGO[+p.slice(5) - 1]} ${p.slice(0, 4)}` : "");

  function pintarPlanillas() {
    if (!SUE || !SUE.entidades.length) { $("#planillas-card").hidden = true; return; }
    const grupos = {};
    SUE.entidades.forEach((e) => (grupos[e.grupo] = grupos[e.grupo] || []).push(e));
    $("#sel-entidad").innerHTML = Object.entries(grupos).map(([g, es]) =>
      `<optgroup label="${esc(g)}">${es.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join("")}</optgroup>`).join("");
    $("#entidades-card").hidden = false;
    const filas = [...SUE.entidades].sort((a, b) => b.maximo - a.maximo);
    $("#tabla-entidades").innerHTML = `<thead><tr><th>Entidad</th><th>Mes</th><th>Personas</th><th>Planilla del mes</th><th>Sueldo mediano</th><th>Sueldo más alto</th></tr></thead><tbody>` +
      filas.map((e) => `<tr><td><button type="button" class="enlace-btn" data-ent="${e.id}">${esc(e.nombre)}</button></td><td>${esc(periodoTexto(e.periodo))}</td>
        <td>${nf0.format(e.personas)}</td><td>${corto(e.planilla / 1e6)}</td><td>${soles(e.mediana)}</td><td>${soles(e.maximo)}</td></tr>`).join("") + "</tbody>";
    $$("[data-ent]").forEach((b) => b.addEventListener("click", () => {
      $("#sel-entidad").value = b.dataset.ent; abrirPlanilla(+b.dataset.ent);
      $("#planillas-card").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    abrirPlanilla(+$("#sel-entidad").value);
  }

  async function abrirPlanilla(id) {
    const e = SUE.entidades.find((x) => x.id === id);
    $("#lista-planilla").innerHTML = '<p class="vacio">Cargando planilla…</p>';
    if (!cachePlanillas[id]) cachePlanillas[id] = await cargar(`sueldos/${id}.json`);
    planilla = cachePlanillas[id];
    mostrarP = 50;
    if (!planilla) { $("#lista-planilla").innerHTML = '<p class="vacio">No se pudo cargar esta planilla.</p>'; return; }
    $("#planilla-periodo").textContent = "Planilla de " + periodoTexto(planilla.periodo);
    $("#planilla-kpis").innerHTML = [
      ["Personas en planilla", nf0.format(e.personas), "sin contar pensionistas"],
      ["Pago total del mes", millones(e.planilla / 1e6), `≈ ${millones((e.planilla * 14) / 1e6)} al año (con gratificaciones)`],
      ["Sueldo mediano", soles(e.mediana), `la mitad gana menos de esto · máx. ${soles(e.maximo)}`]
    ].map(kpiHTML).join("");
    pintarListaPlanilla(e);
  }

  function pintarListaPlanilla(e) {
    e = e || SUE.entidades.find((x) => x.id === planilla.id);
    const q = normal($("#buscar-planilla").value.trim());
    const lista = planilla.personas.filter((p) => !q || normal(p[0] + " " + p[1] + " " + p[2]).includes(q));
    const max = planilla.personas.length ? planilla.personas[0][6] : 1;
    $("#lista-planilla").innerHTML = lista.length ? lista.slice(0, mostrarP).map(([nombre, cargo, dep, reg, rem, otros, total]) => `
      <div class="persona">
        <div class="persona__top">
          <div><p class="persona__nombre">${esc(propio(nombre))}</p><p class="persona__cargo">${esc(propio(cargo))}</p></div>
          <p class="persona__monto">${soles(total)}</p>
        </div>
        <div class="pista" aria-hidden="true"><div class="pista__barra" style="width:${((total / max) * 100).toFixed(1)}%"></div></div>
        <p class="persona__extra">${esc(propio(dep))} · ${esc(reg)}${otros > 0 ? ` · sueldo ${soles(rem)} + otros ${soles(otros)}` : ""}</p>
      </div>`).join("")
      : '<p class="vacio">No encontramos a nadie con ese nombre o cargo en esta entidad.</p>';
    $("#mas-planilla").hidden = lista.length <= mostrarP;
    $("#mas-planilla").textContent = `Ver más (${nf0.format(lista.length - mostrarP)} restantes)`;
    const fuente = e ? `<a href="${esc(e.fuente)}" target="_blank" rel="noopener">Portal de Transparencia Estándar — ${esc(e.nombre)}</a>` : "";
    $("#lista-planilla").insertAdjacentHTML("beforeend", `<p class="fuente">Fuente: ${fuente}. Montos brutos mensuales, antes de descuentos.</p>`);
  }
  $("#sel-entidad").addEventListener("change", (ev) => { $("#buscar-planilla").value = ""; abrirPlanilla(+ev.target.value); });
  $("#buscar-planilla").addEventListener("input", () => { if (planilla) { mostrarP = 50; pintarListaPlanilla(); } });
  $("#mas-planilla").addEventListener("click", () => { mostrarP += 50; pintarListaPlanilla(); });

  // ---------- PROYECTOS DE LEY ----------
  let pCamara = "", ranking = "autores", mostrarL = 30;
  const esLey = (est) => /publicad|promulgad|^ley/i.test(est);
  const contarLeyes = () => (PROY ? PROY.proyectos.filter((p) => esLey(p.estado)).length : 0);
  const fraseL = (s) => (s && s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s || "");
  function claseEstado(est) {
    if (esLey(est)) return "etapa--ley";
    if (/archiv|retirad|improcedente|rechaz/i.test(est)) return "etapa--fin";
    if (/agenda|dictamen|aprobad|pleno|autógrafa|autografa|remitid/i.test(est)) return "etapa--avanza";
    return "etapa--inicio";
  }
  function pintarLeyes() {
    if (!PROY) { $("#lista-leyes").innerHTML = '<p class="vacio">Aún no hay datos de proyectos de ley.</p>'; return; }
    const ejecutivo = PROY.proyectos.filter((p) => /ejecutivo/i.test(p.proponente)).length;
    const ultimos7 = PROY.proyectos.filter((p) => (Date.now() - new Date(p.fecha)) / 864e5 <= 7).length;
    $("#leyes-kpis").innerHTML = [
      ["Proyectos presentados", nf0.format(PROY.total), `${nf0.format(PROY.porCamara.D || 0)} en Diputados · ${nf0.format(PROY.porCamara.S || 0)} en el Senado`],
      ["Ya son ley", nf0.format(contarLeyes()), "publicados en El Peruano"],
      ["Enviados por el Ejecutivo", nf0.format(ejecutivo), `${pct(ejecutivo, PROY.total)} del total`],
      ["Últimos 7 días", nf0.format(ultimos7), "proyectos nuevos"]
    ].map(kpiHTML).join("");

    const maxE = PROY.porEstado[0][1];
    $("#leyes-estados").innerHTML = PROY.porEstado.slice(0, 10).map(([e, n]) => filaSimple(fraseL(e), n, maxE, `${nf0.format(n)}`)).join("");
    $("#sel-estado").innerHTML = '<option value="">Todas</option>' + PROY.porEstado.map(([e, n]) => `<option value="${esc(e)}">${esc(fraseL(e))} (${n})</option>`).join("");
    pintarRanking();
    pintarListaLeyes();
    $("#leyes-fuente").innerHTML = `Fuente: <a href="${esc(PROY.fuente)}" target="_blank" rel="noopener">Sistema de Proposiciones Legislativas del Congreso</a>. Actualizado: ${new Date(PROY.actualizado).toLocaleDateString("es-PE")}.`;
  }
  function pintarRanking() {
    const lista = ranking === "autores" ? PROY.autoresPrincipales.slice(0, 12) : PROY.porProponente.slice(0, 10);
    $("#leyes-ranking-ayuda").textContent = ranking === "autores"
      ? "Congresistas que más proyectos presentaron como autor principal. Presentar muchos proyectos no significa que sean buenos: revisa de qué tratan."
      : "Quién envía los proyectos: congresistas (por cámara), el Poder Ejecutivo u otras instituciones.";
    const max = lista.length ? lista[0][1] : 1;
    $("#leyes-ranking").innerHTML = lista.map(([n, v]) => filaSimple(n, v, max, `${v}`)).join("");
  }
  function pintarListaLeyes() {
    const q = normal($("#buscar-leyes").value.trim());
    const est = $("#sel-estado").value;
    const lista = PROY.proyectos.filter((p) => (!pCamara || p.camara === pCamara) && (!est || p.estado === est) &&
      (!q || normal(`${p.numero} ${p.titulo} ${p.autores.join(" ")} ${p.proponente}`).includes(q)));
    $("#leyes-conteo").textContent = `${nf0.format(lista.length)} proyecto${lista.length === 1 ? "" : "s"}`;
    $("#lista-leyes").innerHTML = lista.length ? lista.slice(0, mostrarL).map((p) => `
      <article class="ley">
        <div class="ley__cab">
          <span class="ley__num">${esc(p.numero)}</span>
          <span class="etapa ${claseEstado(p.estado)}">${esc(fraseL(p.estado))}</span>
        </div>
        <p class="ley__titulo">${esc(fraseL(p.titulo))}</p>
        <p class="ley__meta">${fechaLarga(p.fecha)} · ${p.camara === "S" ? "Senado" : "Diputados"} · ${esc(p.autores.length ? p.autores[0] + (p.autores.length > 1 ? ` y ${p.autores.length - 1} más` : "") : p.proponente)}</p>
        <a class="ley__link" href="${esc(p.url)}" target="_blank" rel="noopener">Ver expediente oficial ↗</a>
      </article>`).join("") : '<p class="vacio">No hay proyectos que coincidan con la búsqueda.</p>';
    $("#mas-leyes").hidden = lista.length <= mostrarL;
    $("#mas-leyes").textContent = `Ver más (${nf0.format(lista.length - mostrarL)} restantes)`;
  }
  grupoBotones("pcamara", (v) => { pCamara = v; mostrarL = 30; PROY && pintarListaLeyes(); });
  grupoBotones("ranking", (v) => { ranking = v; PROY && pintarRanking(); });
  $("#buscar-leyes").addEventListener("input", () => { mostrarL = 30; PROY && pintarListaLeyes(); });
  $("#sel-estado").addEventListener("change", () => { mostrarL = 30; PROY && pintarListaLeyes(); });
  $("#mas-leyes").addEventListener("click", () => { mostrarL += 30; pintarListaLeyes(); });

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
      { nombre: "BCRP — Ingresos tributarios del Gobierno Central", url: "https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/ingresos-tributarios-del-gobierno-central", que: "Recaudación mensual por impuesto, con datos de SUNAT y MEF. De aquí sale la sección de impuestos." },
      { nombre: "Portal de Transparencia Estándar — Personal", url: "https://www.transparencia.gob.pe/", que: "Planilla mensual de cada entidad. De aquí sale el buscador de sueldos por persona." },
      { nombre: "Sistema de Proposiciones Legislativas", url: "https://wb2server.congreso.gob.pe/spley-portal/", que: "Todos los proyectos de ley del Congreso y su estado." },
      { nombre: "SUNAT — Estadísticas y estudios", url: "https://www.sunat.gob.pe/estadisticasestudios/", que: "Notas tributarias y reportes de recaudación." }
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
    const [mef, cong, vis, rec, sue, proy] = await Promise.all(["presupuesto.json", "congreso.json", "visitas.json", "recaudacion.json", "sueldos.json", "proyectos.json"].map(cargar));
    REC = rec; ING = modeloIngresos(rec);
    SUE = sue && sue.entidades ? sue : null;
    PROY = proy && proy.proyectos ? proy : null;
    PR = modeloPresupuesto(mef);
    CONG = cong && cong.camaras ? cong : null;
    VIS = vis && vis.semanas ? vis : null;
    try { const v = localStorage.getItem("vistaGastos"); if (v === "arbol") { vista = "arbol"; $$("[data-vista]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.vista === "arbol"))); } } catch (e) {}
    const fechas = [mef, cong, vis, rec, sue, proy].map((x) => x && x.actualizado).filter(Boolean).sort();
    if (fechas.length) {
      const f = new Date(fechas[fechas.length - 1]);
      const chip = $("#chip-act");
      chip.textContent = "Actualizado el " + f.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
      chip.title = "Los datos se descargan automáticamente de fuentes oficiales cada lunes";
      chip.hidden = false;
    }
    pintarInicio();
    pintarIngresos();
    pintarGastos();
    pintarSueldos();
    pintarPlanillas();
    pintarLeyes();
    $("#buscadores").innerHTML = enlacesHTML(D.buscadoresOficiales);
    pintarCongreso();
    pintarVisitas();
    calcular();
    pintarFuentes();
    mostrar();
  })();
})();
