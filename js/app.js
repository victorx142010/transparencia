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
        corte: mef.corteMEF ? new Date(mef.corteMEF) : null, nEntidades: mef.entidades || 0,
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
            archivo: f.archivo, raw: f.nombre, proyectos: f.proyectos,
            hijos: (f.divisiones || []).map((d) => ({ nombre: bonito(d.nombre), raw: d.nombre, monto: d.pim / M, pia: d.pia / M, dev: d.dev / M }))
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
    const ac = ING.acumulado;
    // 4 cifras clave
    const kpis = [
      ac ? ["Impuestos recaudados " + ac.anio, millones(ac.total), `enero–${MESES_LARGO[ac.hastaMes - 1]} · ${ac.variacion >= 0 ? "+" : ""}${nf1.format(ac.variacion)}% vs. ${ac.anio - 1}`, "#ingresos"]
         : [`Impuestos recaudados ${ING.anio}`, millones(ING.totalNeto), `+${nf1.format(ING.crecimiento)}% vs. año anterior`, "#ingresos"],
      [`Presupuesto ${PR.anio}`, millones(PR.pim || PR.pia), PR.dev ? `ya se gastó el ${pct(PR.dev, PR.pim)}` : "lo aprobado por el Congreso", "#gastos"]
    ];
    if (CON) kpis.push(["Contratos adjudicados " + CON.anio, millones(CON.monto / 1e6), `${nf0.format(CON.total)} contratos con ${nf0.format(CON.proveedoresDistintos)} empresas`, "#contratos"]);
    if (OBRAS) kpis.push(["Obras paralizadas", nf0.format(OBRAS.total), `falta ejecutar ${millones(OBRAS.saldoObras / 1e6)}`, "#obras"]);
    $("#kpis").innerHTML = kpis.map(kpiHTML).join("");

    // Un dato corto al lado de cada tema
    const pres = sueldoPresidente();
    const dato = {
      ingresos: ac ? `${corto(ac.total)} en ${ac.anio}` : corto(ING.totalNeto),
      gastos: PR.oficial ? `${nf0.format(PR.funciones.reduce((a, f) => a + (f.proyectos || 0), 0))} proyectos` : corto(PR.pia),
      partidas: PART ? `${nf0.format(PART.partidas.length)} partidas` : "",
      entidades: PR.nEntidades ? `${nf0.format(PR.nEntidades)} entidades` : "",
      contratos: CON ? `${nf0.format(CON.total)} contratos` : "",
      obras: OBRAS ? `${nf0.format(OBRAS.total)} obras` : "",
      sueldos: SUE ? `${nf0.format(SUE.entidades.reduce((a, e) => a + e.personas, 0))} personas` : `Presidente(a): ${soles(pres.monto)}`,
      congreso: CONG ? (() => { const s = resumenCamara(CONG.camaras.senado), d = resumenCamara(CONG.camaras.diputados); return `${nf0.format(s.prom)}% · ${nf0.format(d.prom)}% asistencia`; })() : "",
      leyes: PROY ? `${nf0.format(PROY.total)} proyectos` : "",
      visitas: VIS ? `${nf0.format(VIS.totalPresidencia)} reuniones` : "",
      programas: PROG ? `${nf0.format(PROG.totales.juntos_hogares)} hogares en Juntos` : "",
      deuda: DEU ? corto(DEU.ultimo.PN03371FQ) : "",
      control: "informes de control",
      viajes: "pasajes y viáticos"
    };
    $$("#grupos-inicio [data-dato]").forEach((s) => (s.textContent = dato[s.dataset.dato] || ""));
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
      const fi = PR.funciones.indexOf(f);
      const explorable = !!f.archivo;
      const subs = f.hijos && f.hijos.length > 1
        ? `<ul class="subdiv">${f.hijos.slice(0, 10).map((h, hi) => explorable
            ? `<li><button type="button" class="subdiv__btn" data-exp="${fi}:${hi}"><span>${esc(h.nombre)} ›</span><b>${corto(h.monto)}</b></button></li>`
            : `<li><span>${esc(h.nombre)}</span><b>${corto(h.monto)}</b></li>`).join("")}</ul>` : "";
      const botonExp = explorable ? `<p><button type="button" class="boton boton--chico" data-exp="${fi}">🔎 Explorar a fondo: proyectos y en qué se gasta${f.proyectos ? ` (${nf0.format(f.proyectos)} proyectos)` : ""}</button></p>` : "";
      return filaHTML({
        nombre: `<span aria-hidden="true">${f.icono}</span> ${esc(f.nombre)}`,
        valorTexto: valorUnidad(f.monto), pctTexto: pct(f.monto, total),
        ancho: (f.monto / max) * 100, ancho2: conDev ? (f.dev / f.monto) * 100 : null, estado: f.estado,
        detalle: (f.explica ? `<p>${esc(f.explica)}</p>` : "") +
          (conDev ? `<p>Aprobado: <strong>${millones(f.pia)}</strong> · Actual: <strong>${millones(f.monto)}</strong> · Gastado: <strong>${millones(f.dev)}</strong> (${pct(f.dev, f.monto)})</p>` : "") +
          `<p>Por persona: <strong>${soles(perCap)}</strong> al año (${soles(perCap / 12)} al mes).</p>` + subs + botonExp +
          (PR.oficial ? "" : `<p>${sello(f.estado)} Fuente: ${enlace(f.fuente)}</p>`)
      });
    }).join("");
    $$("#gastos-barras [data-exp]").forEach((b) => b.addEventListener("click", () => {
      const [fi, di] = b.dataset.exp.split(":").map(Number);
      abrirExplorador(PR.funciones[fi], di != null && !isNaN(di) ? PR.funciones[fi].hijos[di] : null);
    }));
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
      alTocar: (it) => {
        if (!nodoArbol && it.hijos && it.hijos.length > 1) { nodoArbol = it.ref; pintarArbol(); }
        else if (nodoArbol && nodoArbol.archivo) abrirExplorador(nodoArbol, it.ref);  // tercer nivel: explorador
        else if (!nodoArbol && it.ref.archivo) abrirExplorador(it.ref, null);
      }
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

  // ---------- EXPLORADOR: función → división → grupo → proyectos ----------
  let OBRAS = null, OBRAS_CUI = new Map();
  const cacheGasto = {};
  const EXP = { fun: null, div: null, grp: null, detalle: null, q: "", dep: "", orden: "pim", n: 25 };
  const avance = (dev, pim) => (pim > 0 ? Math.min(100, (100 * dev) / pim) : 0);
  const SSI = (cui) => `https://ofi5.mef.gob.pe/ssi/Ssi/Index?codigo=${encodeURIComponent(cui)}&tipo=2`;

  async function abrirExplorador(fun, div) {
    EXP.fun = fun; EXP.div = div ? div.raw : null; EXP.grp = null; EXP.q = ""; EXP.dep = ""; EXP.orden = "pim"; EXP.n = 25;
    const card = $("#explorador");
    card.hidden = false;
    $("#exp-contenido").innerHTML = '<p class="vacio">Cargando el detalle del gasto…</p>';
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!cacheGasto[fun.archivo]) cacheGasto[fun.archivo] = await cargar(`gasto/${fun.archivo}.json`);
    EXP.detalle = cacheGasto[fun.archivo];
    if (!EXP.detalle) { $("#exp-contenido").innerHTML = '<p class="vacio">No se pudo cargar el detalle de esta función.</p>'; return; }
    pintarExplorador();
  }

  function nodoActual() {
    const d = EXP.detalle;
    const div = EXP.div ? d.divisiones.find((x) => x.nombre === EXP.div) : null;
    const grp = div && EXP.grp ? div.grupos.find((x) => x.nombre === EXP.grp) : null;
    return { d, div, grp };
  }

  function enlaceExplorador() {
    const p = new URLSearchParams({ f: EXP.fun.archivo });
    if (EXP.div) p.set("d", EXP.div);
    if (EXP.grp) p.set("g", EXP.grp);
    return "#gastos?" + p.toString();
  }
  async function abrirDesdeEnlace() {
    const q = (location.hash.split("?")[1] || "");
    if (!location.hash.startsWith("#gastos?") || !q) return;
    const p = new URLSearchParams(q);
    const fun = PR.funciones.find((f) => f.archivo === p.get("f"));
    if (!fun) return;
    await abrirExplorador(fun, p.get("d") ? { raw: p.get("d") } : null);
    if (p.get("g")) { EXP.grp = p.get("g"); pintarExplorador(); }
  }

  function pintarExplorador() {
    const { d, div, grp } = nodoActual();
    try { history.replaceState(null, "", enlaceExplorador()); } catch (e) {}
    const M = 1e6;
    const migas = [[`${EXP.fun.icono} ${EXP.fun.nombre}`, "fun"]];
    if (div) migas.push([bonito(div.nombre), "div"]);
    if (grp) migas.push([bonito(grp.nombre), "grp"]);
    $("#exp-migas").innerHTML = migas.map(([t, nivel], i) => i < migas.length - 1
      ? `<button type="button" class="migas__volver" data-nivel="${nivel}">${esc(t)}</button><span aria-hidden="true">›</span>`
      : `<strong>${esc(t)}</strong>`).join(" ") + ` <button type="button" class="migas__compartir" id="exp-compartir" title="Copiar enlace a este nivel">🔗 Copiar enlace</button>`;
    $("#exp-compartir").addEventListener("click", async (ev) => {
      const url = location.origin + location.pathname + enlaceExplorador();
      try { await navigator.clipboard.writeText(url); ev.target.textContent = "✓ Enlace copiado"; } catch (e) { prompt("Copia este enlace:", url); }
    });
    $$("#exp-migas [data-nivel]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.nivel === "fun") { EXP.div = null; EXP.grp = null; } else EXP.grp = null;
      EXP.q = ""; EXP.dep = ""; EXP.n = 25; pintarExplorador();
    }));
    const nodo = grp || div || d;
    const resumen = `<div class="kpis kpis--3">${[
      ["Presupuesto actual (PIM)", millones(nodo.pim / M), `Aprobado al inicio: ${millones(nodo.pia / M)}`],
      ["Ya gastado", millones(nodo.dev / M), `${nf1.format(avance(nodo.dev, nodo.pim))}% del presupuesto`],
      ["Falta gastar", millones(Math.max(0, nodo.pim - nodo.dev) / M), "en lo que queda del año"]
    ].map(kpiHTML).join("")}</div>`;

    if (!div || !grp) {
      // Nivel de lista: divisiones o grupos
      const hijos = div ? div.grupos : d.divisiones;
      const max = Math.max(1, ...hijos.map((h) => h.pim));
      const nProy = (h) => (h.grupos ? h.grupos.reduce((a, g) => a + g.proyectos.length, 0) : h.proyectos.length);
      $("#exp-contenido").innerHTML = resumen +
        `<h3 class="exp-sub">${div ? "Se divide en" : "Se divide en"}: <small>toca una para bajar de nivel</small></h3>
        <div class="barras">${hijos.map((h, i) => `
          <button type="button" class="fila-btn" data-hijo="${i}">
            <div class="fila__top"><span class="fila__nombre">${esc(bonito(h.nombre))} ›</span>
              <span class="fila__valor">${corto(h.pim / M)}<span class="fila__pct">${nf0.format(avance(h.dev, h.pim))}% gastado</span></span></div>
            <div class="pista" aria-hidden="true"><div class="pista__barra" style="width:${Math.max(0.6, (h.pim / max) * 100).toFixed(1)}%"><div class="pista__gastado" style="width:${avance(h.dev, h.pim).toFixed(1)}%"></div></div></div>
            <span class="fila-btn__meta">${nf0.format(nProy(h))} proyectos de inversión</span>
          </button>`).join("")}</div>`;
      $$("#exp-contenido [data-hijo]").forEach((b) => b.addEventListener("click", () => {
        const h = hijos[+b.dataset.hijo];
        if (div) EXP.grp = h.nombre; else EXP.div = h.nombre;
        EXP.n = 25; pintarExplorador();
        $("#explorador").scrollIntoView({ behavior: "smooth", block: "start" });
      }));
      return;
    }

    // Nivel más bajo: grupo funcional
    const maxG = Math.max(1, ...grp.genericas.map((g) => g[1]));
    const enQue = grp.genericas.filter((g) => g[1] > 0).map(([n, pim, dev]) =>
      filaSimple(bonito(n), pim, maxG, `${corto(pim / M)} · ${nf0.format(avance(dev, pim))}% gastado`)).join("");
    const maxD = Math.max(1, ...grp.departamentos.map((g) => g[1]));
    const porDep = grp.departamentos.filter((g) => g[1] > 0).slice(0, 12).map(([n, pim]) => filaSimple(bonito(n), pim, maxD, corto(pim / M))).join("");
    const acts = grp.actividades.length ? `<ul class="actividades">${grp.actividades.map(([n, pim, dev]) =>
      `<li><span>${esc(bonito(n))}</span><b>${corto(pim / M)}</b><small>${nf0.format(avance(dev, pim))}% gastado</small></li>`).join("")}</ul>` : '<p class="vacio">Sin actividades registradas.</p>';
    const deps = [...new Set(grp.proyectos.map((p) => p[3]))].filter(Boolean).sort();
    const paralizadas = grp.proyectos.filter((p) => OBRAS_CUI.has(p[0])).length;
    $("#exp-contenido").innerHTML = resumen + `
      <div class="dos-col dos-col--plano">
        <div><h3 class="exp-sub">¿En qué se gasta?</h3><div class="barras">${enQue}</div>
          <p class="ayuda">"Personal" son sueldos; "bienes y servicios", compras y contratos; "activos no financieros", obras y equipos.</p></div>
        <div><h3 class="exp-sub">¿Dónde se gasta?</h3><div class="barras">${porDep}</div></div>
      </div>
      ${grp.especificas && grp.especificas.length ? `<h3 class="exp-sub">¿Qué se compra exactamente? <small>(partidas específicas)</small></h3>
      <ul class="actividades">${grp.especificas.map(([n, pim, dev]) => `<li><span>${esc(bonito(n))}</span><b>${corto(pim / M)}</b><small>${nf0.format(avance(dev, pim))}% gastado</small></li>`).join("")}</ul>` : ""}
      <h3 class="exp-sub">Actividades permanentes <small>(lo que se paga todos los años: sueldos, mantenimiento, servicios)</small></h3>${acts}
      <h3 class="exp-sub" id="exp-proy-t">Proyectos de inversión (${nf0.format(grp.proyectos.length)})${paralizadas ? ` · <span class="etapa etapa--fin">${paralizadas} con obra paralizada</span>` : ""}</h3>
      <p class="ayuda">Obras y proyectos con presupuesto este año. La barra muestra cuánto de su presupuesto ya se gastó (avance financiero). Las obras marcadas como paralizadas vienen del último informe de la Contraloría.</p>
      <div class="filtros filtros--3">
        <label class="campo"><span>Buscar</span><input type="search" id="exp-q" placeholder="Nombre, distrito o código CUI…" value="${esc(EXP.q)}" autocomplete="off"></label>
        <label class="campo"><span>Departamento</span><select id="exp-dep" class="select-grande"><option value="">Todos</option>${deps.map((x) => `<option ${x === EXP.dep ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label>
        <label class="campo"><span>Ordenar</span><select id="exp-orden" class="select-grande">
          <option value="pim">Más presupuesto</option>
          <option value="lento">Menos avance (posibles atrasos)</option>
          <option value="paralizadas">Solo obras paralizadas</option>
          <option value="sinavance">Sin gasto este año</option>
        </select></label>
      </div>
      <div id="exp-proyectos" class="proyectos"></div>
      <button type="button" class="boton boton--secundario" id="exp-mas" hidden>Ver más</button>
      <p class="fuente">Fuente: MEF — Datos Abiertos (presupuesto y ejecución ${EXP.detalle.anio}); Contraloría — informe de obras paralizadas. Cada proyecto enlaza a su ficha en el Sistema de Seguimiento de Inversiones del MEF.</p>`;
    $("#exp-orden").value = EXP.orden;
    $("#exp-q").addEventListener("input", (e) => { EXP.q = e.target.value; EXP.n = 25; pintarProyectos(grp); });
    $("#exp-dep").addEventListener("change", (e) => { EXP.dep = e.target.value; EXP.n = 25; pintarProyectos(grp); });
    $("#exp-orden").addEventListener("change", (e) => { EXP.orden = e.target.value; EXP.n = 25; pintarProyectos(grp); });
    $("#exp-mas").addEventListener("click", () => { EXP.n += 25; pintarProyectos(grp); });
    pintarProyectos(grp);
  }

  function pintarProyectos(grp) {
    const q = normal(EXP.q.trim());
    let lista = grp.proyectos.filter((p) => (!EXP.dep || p[3] === EXP.dep) && (!q || normal(p[0] + " " + p[1] + " " + p[2]).includes(q)));
    if (EXP.orden === "lento") lista = lista.filter((p) => p[5] >= 100000).sort((a, b) => avance(a[6], a[5]) - avance(b[6], b[5]) || b[5] - a[5]);
    else if (EXP.orden === "paralizadas") lista = lista.filter((p) => OBRAS_CUI.has(p[0]));
    else if (EXP.orden === "sinavance") lista = lista.filter((p) => p[5] > 0 && p[6] === 0).sort((a, b) => b[5] - a[5]);
    $("#exp-proyectos").innerHTML = lista.length ? lista.slice(0, EXP.n).map(([cui, nombre, ejec, dep, pia, pim, dev]) => {
      const av = avance(dev, pim);
      const obra = OBRAS_CUI.get(cui);
      const etiqueta = obra ? `<span class="etapa etapa--fin">Obra paralizada · ${nf0.format(obra.avance)}% de avance físico</span>`
        : pim > 0 && dev === 0 ? '<span class="etapa etapa--avanza">Sin gasto este año</span>'
        : av < 30 ? '<span class="etapa etapa--avanza">Avance bajo</span>' : av >= 95 ? '<span class="etapa etapa--ley">Casi todo gastado</span>' : "";
      return `<article class="proyecto">
        <div class="ley__cab"><span class="ley__num">CUI ${esc(cui)}</span>${etiqueta}</div>
        <p class="ley__titulo">${esc(fraseL(nombre))}</p>
        <p class="ley__meta">${esc(propio(ejec))} · ${esc(propio(dep))}</p>
        <div class="proyecto__montos"><span>Presupuesto ${soles(pim)}</span><span>Gastado ${soles(dev)} (${nf0.format(av)}%)</span></div>
        <div class="pista" aria-hidden="true"><div class="pista__barra pista__barra--suave" style="width:100%"><div class="pista__gastado" style="width:${av.toFixed(1)}%"></div></div></div>
        ${obra ? `<p class="proyecto__alerta">⚠️ La Contraloría reporta esta obra como <strong>paralizada</strong>${obra.inicio ? ` (empezó en ${obra.inicio})` : ""}. Causa: ${esc(obra.causal || "no registrada")}. Lleva ${nf0.format(obra.avance)}% de avance físico y falta ejecutar ${soles(obra.saldo)}.</p>` : ""}
        <a class="ley__link" href="${SSI(cui)}" target="_blank" rel="noopener">Ver ficha oficial del proyecto (MEF) ↗</a>
      </article>`;
    }).join("") : '<p class="vacio">No hay proyectos que coincidan.</p>';
    $("#exp-mas").hidden = lista.length <= EXP.n;
    $("#exp-mas").textContent = `Ver más (${nf0.format(lista.length - EXP.n)} restantes)`;
  }
  $("#exp-cerrar").addEventListener("click", () => { $("#explorador").hidden = true; try { history.replaceState(null, "", "#gastos"); } catch (e) {} });

  // ---------- OBRAS PARALIZADAS ----------
  const OB = { q: "", dep: "", causal: "", n: 30 };
  function pintarObras() {
    if (!OBRAS) { $("#lista-obras").innerHTML = '<p class="vacio">Aún no hay datos de obras paralizadas.</p>'; return; }
    const M = 1e6;
    $("#obras-intro").innerHTML = `Según el <a href="${esc(OBRAS.fuente)}" target="_blank" rel="noopener">${esc(OBRAS.informe)}</a> de la Contraloría, hay <strong>${nf0.format(OBRAS.total)} obras públicas paralizadas</strong>. Son obras que empezaron y se detuvieron: colegios, pistas, sistemas de agua, hospitales…`;
    const locales = (OBRAS.porNivel.find((x) => /LOCAL/.test(x[0])) || [0, 0])[1];
    $("#obras-kpis").innerHTML = [
      ["Obras paralizadas", nf0.format(OBRAS.total), `${pct(locales, OBRAS.total)} son de municipalidades`],
      ["Costo de esas obras", millones(OBRAS.costoObras / M), `inversiones por ${millones(OBRAS.costoInversiones / M)}`],
      ["Falta ejecutar", millones(OBRAS.saldoObras / M), "para terminar las obras"],
      ["Avanzadas más de la mitad", nf0.format(OBRAS.obras.filter((o) => o.avance > 50).length), "obras que se quedaron a medio camino o más"]
    ].map(kpiHTML).join("");
    const maxC = OBRAS.porCausal[0][1];
    $("#obras-causas").innerHTML = OBRAS.porCausal.slice(0, 8).map(([c, n]) => filaSimple(c, n, maxC, nf0.format(n))).join("");
    const maxD = OBRAS.porDepartamento[0][1];
    $("#obras-deps").innerHTML = OBRAS.porDepartamento.slice(0, 12).map(([c, n]) => filaSimple(propio(c), n, maxD, nf0.format(n))).join("");
    $("#obras-dep").innerHTML = '<option value="">Todos</option>' + OBRAS.porDepartamento.map(([d, n]) => `<option value="${esc(d)}">${esc(propio(d))} (${n})</option>`).join("");
    $("#obras-causal").innerHTML = '<option value="">Todas</option>' + OBRAS.porCausal.map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n})</option>`).join("");
    pintarListaObras();
  }
  function pintarListaObras() {
    const q = normal(OB.q.trim());
    const lista = OBRAS.obras.filter((o) => (!OB.dep || o.departamento === OB.dep) && (!OB.causal || o.causal === OB.causal) &&
      (!q || normal(`${o.cui} ${o.nombre} ${o.entidad} ${o.distrito} ${o.provincia}`).includes(q)));
    $("#obras-conteo").textContent = `${nf0.format(lista.length)} obras`;
    $("#lista-obras").innerHTML = lista.length ? lista.slice(0, OB.n).map((o) => `
      <article class="proyecto">
        <div class="ley__cab"><span class="ley__num">CUI ${esc(o.cui)}</span><span class="etapa etapa--fin">${esc(o.causal || "Paralizada")}</span></div>
        <p class="ley__titulo">${esc(fraseL(o.nombre))}</p>
        <p class="ley__meta">${esc(propio(o.entidad))} · ${esc(propio(o.distrito))}, ${esc(propio(o.departamento))}${o.inicio ? ` · empezó en ${o.inicio}` : ""}</p>
        <div class="proyecto__montos"><span>Costo de la obra ${soles(o.costo)}</span><span>Avance físico ${nf0.format(o.avance)}%</span></div>
        <div class="pista" aria-hidden="true"><div class="pista__barra pista__barra--suave" style="width:100%"><div class="pista__gastado pista__gastado--mal" style="width:${Math.min(100, o.avance).toFixed(1)}%"></div></div></div>
        <p class="ley__meta">Falta ejecutar ${soles(o.saldo)}${o.pim > 0 ? ` · tiene ${soles(o.pim)} en el presupuesto de este año` : " · no tiene presupuesto este año"}</p>
        <a class="ley__link" href="${SSI(o.cui)}" target="_blank" rel="noopener">Ver ficha oficial del proyecto (MEF) ↗</a>
      </article>`).join("") : '<p class="vacio">No hay obras que coincidan.</p>';
    $("#mas-obras").hidden = lista.length <= OB.n;
    $("#mas-obras").textContent = `Ver más (${nf0.format(lista.length - OB.n)} restantes)`;
  }
  $("#obras-q").addEventListener("input", (e) => { OB.q = e.target.value; OB.n = 30; OBRAS && pintarListaObras(); });
  $("#obras-dep").addEventListener("change", (e) => { OB.dep = e.target.value; OB.n = 30; OBRAS && pintarListaObras(); });
  $("#obras-causal").addEventListener("change", (e) => { OB.causal = e.target.value; OB.n = 30; OBRAS && pintarListaObras(); });
  $("#mas-obras").addEventListener("click", () => { OB.n += 30; pintarListaObras(); });

  // ---------- Tarjeta de proyecto reutilizable ----------
  function tarjetaProyecto(cui, nombre, sub, pim, dev) {
    const av = avance(dev, pim);
    const obra = OBRAS_CUI.get(cui);
    const etiqueta = obra ? `<span class="etapa etapa--fin">Obra paralizada · ${nf0.format(obra.avance)}% avance físico</span>`
      : pim > 0 && dev === 0 ? '<span class="etapa etapa--avanza">Sin gasto este año</span>'
      : av < 30 ? '<span class="etapa etapa--avanza">Avance bajo</span>' : av >= 95 ? '<span class="etapa etapa--ley">Casi todo gastado</span>' : "";
    return `<article class="proyecto">
      <div class="ley__cab"><span class="ley__num">CUI ${esc(cui)}</span>${etiqueta}</div>
      <p class="ley__titulo">${esc(fraseL(nombre))}</p>
      ${sub ? `<p class="ley__meta">${esc(sub)}</p>` : ""}
      <div class="proyecto__montos"><span>Presupuesto ${soles(pim)}</span><span>Gastado ${soles(dev)} (${nf0.format(av)}%)</span></div>
      <div class="pista" aria-hidden="true"><div class="pista__barra pista__barra--suave" style="width:100%"><div class="pista__gastado" style="width:${av.toFixed(1)}%"></div></div></div>
      ${obra ? `<p class="proyecto__alerta">⚠️ La Contraloría reporta esta obra como <strong>paralizada</strong>. Causa: ${esc(obra.causal || "no registrada")}. Falta ejecutar ${soles(obra.saldo)}.</p>` : ""}
      <a class="ley__link" href="${SSI(cui)}" target="_blank" rel="noopener">Ver ficha oficial del proyecto (MEF) ↗</a>
    </article>`;
  }
  function ordenarProyectos(lista, orden, iPim, iDev) {
    if (orden === "lento") return lista.filter((p) => p[iPim] >= 100000).sort((a, b) => avance(a[iDev], a[iPim]) - avance(b[iDev], b[iPim]) || b[iPim] - a[iPim]);
    if (orden === "paralizadas") return lista.filter((p) => OBRAS_CUI.has(p[0]));
    if (orden === "sinavance") return lista.filter((p) => p[iPim] > 0 && p[iDev] === 0).sort((a, b) => b[iPim] - a[iPim]);
    return [...lista].sort((a, b) => b[iPim] - a[iPim]);
  }

  // ---------- ENTIDADES: quién gasta ----------
  let ENT = null, entActual = null;
  const cacheEnt = {};
  const EN = { q: "", dep: "", nivel: "", n: 30, pq: "", porden: "pim", pn: 20 };
  const NIVEL_TXT = { "GOBIERNO NACIONAL": "Gobierno nacional", "GOBIERNOS REGIONALES": "Gobierno regional", "GOBIERNOS LOCALES": "Municipalidad" };

  async function prepararEntidades() {
    if (ENT) return true;
    $("#ent-lista").innerHTML = '<p class="vacio">Cargando entidades…</p>';
    ENT = await cargarUna("entidades.json");
    if (!ENT) { $("#ent-lista").innerHTML = '<p class="vacio">Aún no hay datos de entidades.</p>'; return false; }
    $("#ent-n").textContent = nf0.format(ENT.entidades.length);
    const deps = [...new Set(ENT.entidades.map((e) => e[4]).filter(Boolean))].sort();
    $("#ent-dep").innerHTML = '<option value="">Todos</option>' + deps.map((d) => `<option value="${esc(d)}">${esc(propio(d))}</option>`).join("");
    pintarListaEntidades();
    return true;
  }
  function pintarListaEntidades() {
    const q = normal(EN.q.trim());
    const lista = ENT.entidades.filter((e) => (!EN.dep || e[4] === EN.dep) && (!EN.nivel || e[3] === EN.nivel) &&
      (!q || normal(`${e[1]} ${e[2]} ${e[5]} ${e[6]}`).includes(q)));
    $("#ent-conteo").textContent = `${nf0.format(lista.length)} entidades · ordenadas por presupuesto`;
    const max = Math.max(1, ...lista.slice(0, EN.n).map((e) => e[7]));
    $("#ent-lista").innerHTML = lista.length ? lista.slice(0, EN.n).map((e) => `
      <button type="button" class="fila-btn" data-ent-id="${esc(e[0])}">
        <div class="fila__top"><span class="fila__nombre">${esc(propio(e[1]))} ›</span>
          <span class="fila__valor">${corto(e[7] / 1e6)}<span class="fila__pct">${nf0.format(avance(e[8], e[7]))}% gastado</span></span></div>
        <div class="pista" aria-hidden="true"><div class="pista__barra" style="width:${Math.max(0.6, (e[7] / max) * 100).toFixed(1)}%"><div class="pista__gastado" style="width:${avance(e[8], e[7]).toFixed(1)}%"></div></div></div>
        <span class="fila-btn__meta">${esc(NIVEL_TXT[e[3]] || e[3])} · ${esc(propio(e[6]))}, ${esc(propio(e[5]))}, ${esc(propio(e[4]))}${e[9] ? ` · ${nf0.format(e[9])} proyectos` : ""}</span>
      </button>`).join("") : '<p class="vacio">No encontramos esa entidad. Prueba con otra palabra o quita filtros.</p>';
    $("#ent-mas").hidden = lista.length <= EN.n;
    $("#ent-mas").textContent = `Ver más (${nf0.format(lista.length - EN.n)} restantes)`;
    $$("#ent-lista [data-ent-id]").forEach((b) => b.addEventListener("click", () => abrirEntidad(b.dataset.entId)));
  }
  async function abrirEntidad(id) {
    if (!(await prepararEntidades())) return;
    const fila = ENT.entidades.find((e) => e[0] === String(id));
    if (!fila) return;
    const box = $("#ent-detalle");
    box.hidden = false;
    box.innerHTML = '<p class="vacio">Cargando el detalle…</p>';
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    const arch = fila[10];
    if (!cacheEnt[arch]) cacheEnt[arch] = await cargar(`entidades/${arch}.json`);
    const e = cacheEnt[arch] && cacheEnt[arch].entidades.find((x) => x.id === fila[0]);
    if (!e) { box.innerHTML = '<p class="vacio">No se pudo cargar el detalle.</p>'; return; }
    entActual = e; EN.pq = ""; EN.porden = "pim"; EN.pn = 20;
    try { history.replaceState(null, "", "#entidades?id=" + encodeURIComponent(e.id)); } catch (er) {}
    pintarEntidad();
  }
  function pintarEntidad() {
    const e = entActual, M = 1e6, box = $("#ent-detalle");
    // Emparejar con su planilla: mismo nombre (sin siglas entre paréntesis) y mismo departamento
    const base = (n) => clave(String(n).replace(/\s*\([^)]*\)\s*$/, "").split(" - ")[0]);
    const sueldo = SUE && (SUE.entidades.find((s) => base(s.nombre) === base(e.nombre) && (!s.departamento || s.departamento === e.departamento))
      || SUE.entidades.find((s) => clave(s.nombre).length > 25 && clave(e.nombre).startsWith(clave(s.nombre).slice(0, 12)) &&
        clave(e.nombre).includes(clave(s.nombre).replace(/^(gobiernoregionalde|municipalidadprovincialde)/, ""))));
    const maxG = Math.max(1, ...e.genericas.map((g) => g[1]));
    const maxF = Math.max(1, ...e.funciones.map((g) => g[1]));
    box.innerHTML = `
      <div class="tarjeta__cabeza">
        <div><h2>${esc(propio(e.nombre))}</h2>
          <p class="ayuda">${esc(NIVEL_TXT[e.nivel] || e.nivel)} · ${esc(propio(e.distrito))}, ${esc(propio(e.provincia))}, ${esc(propio(e.departamento))}${e.pliego ? ` · ${esc(propio(e.pliego))}` : ""}</p></div>
        <div class="controles">
          <button type="button" class="boton boton--secundario boton--chico" id="ent-copiar">🔗 Copiar enlace</button>
          <button type="button" class="boton boton--secundario boton--chico" id="ent-cerrar">Cerrar ✕</button>
        </div>
      </div>
      <div class="kpis kpis--4">${[
        ["Presupuesto actual", millones(e.pim / M), `aprobado al inicio: ${millones(e.pia / M)}`],
        ["Ya gastado", millones(e.dev / M), `${nf1.format(avance(e.dev, e.pim))}% del presupuesto`],
        ["Falta gastar", millones(Math.max(0, e.pim - e.dev) / M), "en lo que queda del año"],
        ["Proyectos de inversión", nf0.format(e.totalProyectos), e.totalProyectos > e.proyectos.length ? `se muestran los ${e.proyectos.length} más grandes` : "con presupuesto este año"]
      ].map(kpiHTML).join("")}</div>
      <div class="controles controles--enlaces">
        <a class="boton boton--secundario boton--chico" href="#contratos?q=${encodeURIComponent(e.nombre.split("-")[0].trim())}" id="ent-a-contratos">🤝 Ver sus contratos</a>
        ${sueldo ? `<a class="boton boton--secundario boton--chico" href="#sueldos?ent=${sueldo.id}" id="ent-a-sueldos">💵 Ver sueldos de su personal</a>` : ""}
      </div>
      <div class="dos-col dos-col--plano">
        <div><h3 class="exp-sub">¿En qué gasta?</h3><div class="barras">${e.genericas.filter((g) => g[1] > 0).map(([n, p, d]) => filaSimple(bonito(n), p, maxG, `${corto(p / M)} · ${nf0.format(avance(d, p))}%`)).join("")}</div></div>
        <div><h3 class="exp-sub">¿Para qué?</h3><div class="barras">${e.funciones.filter((g) => g[1] > 0).slice(0, 10).map(([n, p]) => filaSimple(bonito(n), p, maxF, corto(p / M))).join("")}</div></div>
      </div>
      <div id="ent-control"></div>
      <h3 class="exp-sub">¿Qué compra exactamente? <small>(partidas específicas, de mayor a menor)</small></h3>
      <ul class="actividades">${e.especificas.map(([n, p, d]) => `<li><span>${esc(bonito(n))}</span><b>${soles(p)}</b><small>gastado ${soles(d)} (${nf0.format(avance(d, p))}%)</small></li>`).join("")}</ul>
      ${e.proyectos.length ? `
      <h3 class="exp-sub">Proyectos de inversión</h3>
      <div class="filtros">
        <label class="campo"><span>Buscar proyecto</span><input type="search" id="ent-pq" placeholder="Colegio, pista, agua, CUI…" autocomplete="off"></label>
        <label class="campo"><span>Ordenar</span><select id="ent-porden" class="select-grande">
          <option value="pim">Más presupuesto</option><option value="lento">Menos avance</option>
          <option value="sinavance">Sin gasto este año</option><option value="paralizadas">Solo obras paralizadas</option></select></label>
      </div>
      <div id="ent-proyectos" class="proyectos"></div>
      <button type="button" class="boton boton--secundario" id="ent-pmas" hidden>Ver más</button>` : ""}
      <p class="fuente">Fuente: MEF — Datos Abiertos, presupuesto y ejecución ${ENT.anio}. "Gastado" es el monto devengado (el bien o servicio ya se recibió).</p>`;
    prepararControl().then(() => {
      if (!CTRL) return;
      const k = clave(e.nombre.split(" - ")[0]);
      const infs = CTRL.informes.filter((r) => clave(r[1]).includes(k) || k.includes(clave(r[1])));
      const tot = Object.entries(CTRL.porEntidad || {}).filter(([n]) => clave(n).includes(k) || k.includes(clave(n))).reduce((a, [, v]) => [a[0] + v[0], a[1] + v[1]], [0, 0]);
      if (tot[0] || infs.length) $("#ent-control").innerHTML = `<h3 class="exp-sub">🔎 Contraloría: ${nf0.format(tot[0] || infs.length)} informes, ${nf0.format(tot[1])} con presuntos responsables</h3>` +
        (infs.length ? `<div class="proyectos">${infs.slice(0, 4).map(tarjetaInforme).join("")}</div>` : '<p class="ayuda">Sin auditorías (solo orientaciones o visitas de control).</p>') +
        (infs.length > 4 ? `<p><a href="#control?q=${encodeURIComponent(e.nombre.split(" - ")[0])}">Ver los ${nf0.format(infs.length)} informes →</a></p>` : "");
    });
    $("#ent-cerrar").addEventListener("click", () => { box.hidden = true; try { history.replaceState(null, "", "#entidades"); } catch (er) {} });
    $("#ent-copiar").addEventListener("click", async (ev) => {
      const url = location.origin + location.pathname + "#entidades?id=" + encodeURIComponent(e.id);
      try { await navigator.clipboard.writeText(url); ev.target.textContent = "✓ Enlace copiado"; } catch (er) { prompt("Copia este enlace:", url); }
    });
    if (e.proyectos.length) {
      $("#ent-pq").addEventListener("input", (ev) => { EN.pq = ev.target.value; EN.pn = 20; pintarProyectosEntidad(); });
      $("#ent-porden").addEventListener("change", (ev) => { EN.porden = ev.target.value; EN.pn = 20; pintarProyectosEntidad(); });
      $("#ent-pmas").addEventListener("click", () => { EN.pn += 20; pintarProyectosEntidad(); });
      pintarProyectosEntidad();
    }
  }
  function pintarProyectosEntidad() {
    const q = normal(EN.pq.trim());
    const lista = ordenarProyectos(entActual.proyectos.filter((p) => !q || normal(p[0] + " " + p[1]).includes(q)), EN.porden, 4, 5);
    $("#ent-proyectos").innerHTML = lista.length ? lista.slice(0, EN.pn).map((p) => tarjetaProyecto(p[0], p[1], bonito(p[2]), p[4], p[5])).join("") : '<p class="vacio">No hay proyectos que coincidan.</p>';
    $("#ent-pmas").hidden = lista.length <= EN.pn;
    $("#ent-pmas").textContent = `Ver más (${nf0.format(lista.length - EN.pn)} restantes)`;
  }
  $("#ent-q").addEventListener("input", (ev) => { EN.q = ev.target.value; EN.n = 30; ENT && pintarListaEntidades(); });
  $("#ent-dep").addEventListener("change", (ev) => { EN.dep = ev.target.value; EN.n = 30; ENT && pintarListaEntidades(); });
  $("#ent-nivel").addEventListener("change", (ev) => { EN.nivel = ev.target.value; EN.n = 30; ENT && pintarListaEntidades(); });
  $("#ent-mas").addEventListener("click", () => { EN.n += 30; pintarListaEntidades(); });

  // ---------- PARTIDAS: qué se compra ----------
  let PART = null;
  const PA = { q: "", gen: "", n: 25 };
  const CHIPS = ["Pasajes", "Publicidad", "Combustibles", "Celebraciones", "Consultorías", "Locación de servicios", "Viáticos", "Alimentos", "Vehículos", "Medicamentos", "Seguridad y vigilancia", "Limpieza"];
  function pintarPartidas() {
    if (!PART) { $("#partidas-card").hidden = true; return; }
    $("#partidas-total").textContent = `${nf0.format(PART.partidas.length)} partidas · ${PART.anio}`;
    $("#partidas-chips").innerHTML = CHIPS.map((c) => `<button type="button" class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join("");
    $$("#partidas-chips [data-chip]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.chip.replace(/s$/, "").replace("Celebracione", "celebracion").replace("Consultoría", "consultori");
      $("#partidas-q").value = v; PA.q = v; PA.n = 25; pintarListaPartidas();
    }));
    const gens = [...new Set(PART.partidas.map((p) => p[0]))];
    $("#partidas-gen").innerHTML = '<option value="">Todos</option>' + gens.map((g) => `<option value="${esc(g)}">${esc(bonito(g))}</option>`).join("");
    pintarListaPartidas();
  }
  function pintarListaPartidas() {
    const q = normal(PA.q.trim());
    const lista = PART.partidas.filter((p) => (!PA.gen || p[0] === PA.gen) && (!q || normal(p[1] + " " + p[0]).includes(q)));
    const max = Math.max(1, ...lista.map((p) => p[3]));
    const NIV = { "GOBIERNO NACIONAL": "Gobierno nacional", "GOBIERNOS REGIONALES": "Regiones", "GOBIERNOS LOCALES": "Municipios" };
    $("#partidas-lista").innerHTML = lista.length ? lista.slice(0, PA.n).map(([g, e, pia, pim, dev, niv]) => filaHTML({
      nombre: esc(bonito(e)), valorTexto: millones(pim / 1e6), pctTexto: `${nf0.format(avance(dev, pim))}% gastado`,
      ancho: (pim / max) * 100, ancho2: avance(dev, pim),
      detalle: `<p>Tipo de gasto: <strong>${esc(bonito(g))}</strong>. Presupuesto actual ${soles(pim)}; ya gastado ${soles(dev)}.</p>` +
        `<ul class="subdiv">${Object.entries(niv).sort((a, b) => b[1][0] - a[1][0]).map(([n, [p, d]]) => `<li><span>${esc(NIV[n] || n)}</span><b>${corto(p / 1e6)} · gastado ${corto(d / 1e6)}</b></li>`).join("")}</ul>`
    })).join("") : '<p class="vacio">No hay partidas con ese nombre.</p>';
    $("#partidas-mas").hidden = lista.length <= PA.n;
    $("#partidas-mas").textContent = `Ver más (${nf0.format(lista.length - PA.n)} restantes)`;
  }
  $("#partidas-q").addEventListener("input", (ev) => { PA.q = ev.target.value; PA.n = 25; PART && pintarListaPartidas(); });
  $("#partidas-gen").addEventListener("change", (ev) => { PA.gen = ev.target.value; PA.n = 25; PART && pintarListaPartidas(); });
  $("#partidas-mas").addEventListener("click", () => { PA.n += 25; pintarListaPartidas(); });

  // ---------- CONTRATOS: a quién le paga el Estado ----------
  let CON = null, CON_LISTA = null, cargandoCon = null;
  const CO = { q: "", cat: "", orden: "monto", n: 20 };
  const esRUC = (r) => /^\d{11}$/.test(r || "");
  function tarjetaContrato([fecha, ent, prov, ruc, monto, objeto, metodo, cat, ocid, alertas]) {
    return `<article class="proyecto">
      <div class="ley__cab"><span class="ley__num">${fechaLarga(fecha)} · ${esc(cat)}</span><span class="etapa etapa--inicio">${esc(metodo)}</span></div>
      <p class="ley__titulo">${esc(fraseL(objeto))}</p>
      <div class="proyecto__montos"><span>${esc(propio(prov))}${esRUC(ruc) ? ` <small>(RUC ${esc(ruc)})</small>` : ""}</span><span>${soles(monto)}</span></div>
      <p class="ley__meta">Contrató: ${esc(propio(ent))}</p>
      ${alertas ? `<p class="alertas-linea">${chipsAlerta(alertas)}</p>` : ""}
      <a class="ley__link" href="${CON.urlProceso}${esc(ocid.replace(/^ocds-dgv273-/, ""))}" target="_blank" rel="noopener">Ver proceso oficial (OECE) ↗</a>
    </article>`;
  }
  function pintarContratos() {
    if (!CON) { $("#con-lista").innerHTML = '<p class="vacio">Aún no hay datos de contratos.</p>'; return; }
    $("#con-intro").innerHTML = `En <strong>${CON.anio}</strong> las entidades públicas adjudicaron <strong>${nf0.format(CON.total)} contratos</strong> por <strong>${millones(CON.monto / 1e6)}</strong> mediante procesos registrados en el SEACE (licitaciones, concursos, adjudicaciones simplificadas…). No incluye compras pequeñas de menos de 8 UIT.`;
    const cat = Object.fromEntries(CON.porCategoria);
    $("#con-kpis").innerHTML = [
      ["Monto adjudicado", millones(CON.monto / 1e6), `${nf0.format(CON.total)} contratos`],
      ["En obras", millones((cat.Obras || 0) / 1e6), pct(cat.Obras || 0, CON.monto) + " del total"],
      ["Empresas que ganaron", nf0.format(CON.proveedoresDistintos), "proveedores distintos"],
      ["Entidades que compraron", nf0.format(CON.entidadesDistintas), "municipios, regiones, ministerios…"]
    ].map(kpiHTML).join("");
    const maxP = CON.topProveedores[0][2];
    $("#con-proveedores").innerHTML = CON.topProveedores.slice(0, 15).map(([ruc, n, m, c, e]) => filaHTML({
      nombre: esc(propio(n)), valorTexto: corto(m / 1e6), ancho: (m / maxP) * 100,
      detalle: `<p>${esRUC(ruc) ? `RUC ${esc(ruc)} · ` : ""}${nf0.format(c)} contrato${c === 1 ? "" : "s"} con ${nf0.format(e)} entidad${e === 1 ? "" : "es"} · total ${soles(m)}.</p><p><button type="button" class="boton boton--secundario boton--chico" data-buscar="${esc(esRUC(ruc) ? ruc : n)}">Ver sus contratos</button></p>`
    })).join("");
    const maxE = CON.topEntidades[0][1];
    $("#con-entidades").innerHTML = CON.topEntidades.slice(0, 15).map(([n, m, c]) => filaHTML({
      nombre: esc(propio(n)), valorTexto: corto(m / 1e6), ancho: (m / maxE) * 100,
      detalle: `<p>${nf0.format(c)} contratos · total ${soles(m)}.</p><p><button type="button" class="boton boton--secundario boton--chico" data-buscar="${esc(n)}">Ver sus contratos</button></p>`
    })).join("");
    $$("#contratos [data-buscar]").forEach((b) => b.addEventListener("click", () => { activarTab("contratos:buscar"); $("#con-q").value = b.dataset.buscar; CO.q = b.dataset.buscar; buscarContratos(); $("#con-q").scrollIntoView({ behavior: "smooth", block: "center" }); }));
    $("#con-fuente").innerHTML = `Fuente: <a href="${esc(CON.fuente)}" target="_blank" rel="noopener">OECE — Portal de Contrataciones Abiertas (estándar OCDS)</a>. Actualizado: ${new Date(CON.actualizado).toLocaleDateString("es-PE")}.`;
    $("#con-conteo").textContent = "Los 50 contratos más grandes del año:";
    $("#con-lista").innerHTML = CON.mayores.slice(0, 20).map(tarjetaContrato).join("");
    $("#con-mas").hidden = true;
  }
  async function cargarListaContratos() {
    if (CON_LISTA) return CON_LISTA;
    if (!cargandoCon) cargandoCon = (async () => {
      let hechos = 0;
      const partes = await Promise.all(CON.archivosMes.map(async (m) => {
        const d = await cargar(`contratos/${m}.json`);
        hechos++; $("#con-conteo").textContent = `Descargando contratos del año… (${hechos}/${CON.archivosMes.length} meses)`;
        return d ? d.contratos : [];
      }));
      CON_LISTA = partes.flat();
      return CON_LISTA;
    })();
    return cargandoCon;
  }
  async function buscarContratos() {
    if (!CON) return;
    const q = normal(CO.q.trim());
    if (!q && !CO.cat) { pintarContratos(); return; }
    const todos = await cargarListaContratos();
    let lista = todos.filter((r) => (!CO.cat || r[7] === CO.cat) && (!q || normal(`${r[1]} ${r[2]} ${r[3]} ${r[5]}`).includes(q)));
    lista = CO.orden === "fecha" ? lista.sort((a, b) => (b[0] > a[0] ? 1 : -1)) : lista.sort((a, b) => b[4] - a[4]);
    const suma = lista.reduce((a, r) => a + r[4], 0);
    $("#con-conteo").textContent = `${nf0.format(lista.length)} contratos · ${soles(suma)} en total`;
    $("#con-lista").innerHTML = lista.length ? lista.slice(0, CO.n).map(tarjetaContrato).join("") : '<p class="vacio">No hay contratos que coincidan.</p>';
    $("#con-mas").hidden = lista.length <= CO.n;
    $("#con-mas").textContent = `Ver más (${nf0.format(lista.length - CO.n)} restantes)`;
  }
  let tCon;
  $("#con-q").addEventListener("input", (ev) => { CO.q = ev.target.value; CO.n = 20; clearTimeout(tCon); tCon = setTimeout(buscarContratos, 250); });
  $("#con-cat").addEventListener("change", (ev) => { CO.cat = ev.target.value; CO.n = 20; buscarContratos(); });
  $("#con-orden").addEventListener("change", (ev) => { CO.orden = ev.target.value; CO.n = 20; buscarContratos(); });
  $("#con-mas").addEventListener("click", () => { CO.n += 20; buscarContratos(); });

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
  grupoBotones("camara", (v) => { camara = v; pintarCongreso(); if (!$('[data-panel="congreso:votos"]').hidden) pintarVotos(); });
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

  // Grupos para filtrar (las entidades principales se agrupan como "Gobierno nacional y autónomos")
  const GRUPOS_P = [["", "Todas"], ["nacional", "Ministerios, poderes y autónomos"], ["Gobiernos regionales", "Gobiernos regionales"],
    ["Municipalidades provinciales", "Municipalidades provinciales"], ["Municipalidades distritales", "Municipalidades distritales"], ["UGEL", "UGEL"]];
  const grupoDe = (e) => (["Gobiernos regionales", "Municipalidades provinciales", "Municipalidades distritales", "UGEL"].includes(e.grupo) ? e.grupo
    : e.grupo === "Gobiernos locales" ? "Municipalidades provinciales" : "nacional");
  const PL = { grupo: "", dep: "", q: "", orden: "maximo", n: 25 };
  const entidadesFiltradas = () => SUE.entidades.filter((e) => (!PL.grupo || grupoDe(e) === PL.grupo) && (!PL.dep || e.departamento === PL.dep));

  function pintarPlanillas() {
    if (!SUE || !SUE.entidades.length) { $("#planillas-card").hidden = true; return; }
    $("#planilla-n-ent").textContent = `(${nf0.format(SUE.entidades.length)} disponibles)`;
    $("#planilla-grupos").innerHTML = GRUPOS_P.map(([v, t]) => {
      const n = v ? SUE.entidades.filter((e) => grupoDe(e) === v).length : SUE.entidades.length;
      return n ? `<button type="button" class="chip${v === PL.grupo ? " chip--activo" : ""}" data-pgrupo="${esc(v)}">${esc(t)} <small>${nf0.format(n)}</small></button>` : "";
    }).join("");
    $$("#planilla-grupos [data-pgrupo]").forEach((b) => b.addEventListener("click", () => { PL.grupo = b.dataset.pgrupo; PL.n = 25; pintarPlanillas(); }));
    const deps = [...new Set(SUE.entidades.map((e) => e.departamento).filter(Boolean))].sort();
    if ($("#planilla-dep").options.length <= 1) $("#planilla-dep").innerHTML = '<option value="">Todos</option>' + deps.map((d) => `<option value="${esc(d)}">${esc(propio(d))}</option>`).join("");
    $("#entidades-card").hidden = false;
    pintarTablaEntidades();
    if (!planilla) abrirPlanilla(SUE.entidades[0].id);
  }

  function pintarTablaEntidades() {
    const filas = entidadesFiltradas().sort((a, b) => b[PL.orden] - a[PL.orden]);
    $("#tabla-entidades").innerHTML = `<thead><tr><th>Entidad</th><th>Mes</th><th>Personas</th><th>Planilla del mes</th><th>Sueldo mediano</th><th>Sueldo más alto</th></tr></thead><tbody>` +
      filas.slice(0, PL.n).map((e) => `<tr><td><button type="button" class="enlace-btn" data-ent="${e.id}">${esc(propio(e.nombre))}</button>${e.departamento ? `<small class="tabla__sub">${esc(propio(e.departamento))}</small>` : ""}</td><td>${esc(periodoTexto(e.periodo))}</td>
        <td>${nf0.format(e.personas)}</td><td>${corto(e.planilla / 1e6)}</td><td>${soles(e.mediana)}</td><td>${soles(e.maximo)}</td></tr>`).join("") + "</tbody>";
    $$("#tabla-entidades [data-ent]").forEach((b) => b.addEventListener("click", () => {
      activarTab("sueldos:planilla");
      abrirPlanilla(+b.dataset.ent);
      $("#planillas-card").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    $("#tabla-mas").hidden = filas.length <= PL.n;
    $("#tabla-mas").textContent = `Ver más (${nf0.format(filas.length - PL.n)} restantes)`;
  }

  function pintarCombo() {
    const q = normal(PL.q.trim());
    const box = $("#combo-entidades");
    if (!q) { box.hidden = true; $("#buscar-entidad-planilla").setAttribute("aria-expanded", "false"); return; }
    const lista = entidadesFiltradas().filter((e) => normal(e.nombre + " " + (e.departamento || "")).includes(q)).slice(0, 12);
    box.innerHTML = lista.length ? lista.map((e) => `<button type="button" role="option" class="combo__op" data-cent="${e.id}">
        <span>${esc(propio(e.nombre))}</span><small>${esc(GRUPOS_P.find((g) => g[0] === grupoDe(e))[1])}${e.departamento ? " · " + esc(propio(e.departamento)) : ""} · ${nf0.format(e.personas)} personas</small></button>`).join("")
      : '<p class="vacio">No encontramos esa entidad con los filtros elegidos.</p>';
    box.hidden = false;
    $("#buscar-entidad-planilla").setAttribute("aria-expanded", "true");
    $$("#combo-entidades [data-cent]").forEach((b) => b.addEventListener("click", () => {
      box.hidden = true; $("#buscar-entidad-planilla").value = ""; PL.q = "";
      abrirPlanilla(+b.dataset.cent);
    }));
  }

  async function abrirPlanilla(id) {
    id = +id;
    $("#sel-entidad").value = String(id);
    const e = SUE.entidades.find((x) => x.id === id);
    if (!e) return;
    $("#planilla-elegida").innerHTML = `Viendo: <strong>${esc(propio(e.nombre))}</strong>${e.departamento ? ` · ${esc(propio(e.departamento))}` : ""}`;
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
  $("#buscar-entidad-planilla").addEventListener("input", (ev) => { PL.q = ev.target.value; SUE && pintarCombo(); });
  $("#buscar-entidad-planilla").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") { const b = $("#combo-entidades [data-cent]"); if (b) { ev.preventDefault(); b.click(); } }
    if (ev.key === "Escape") $("#combo-entidades").hidden = true;
  });
  document.addEventListener("click", (ev) => { if (!ev.target.closest(".combo")) $("#combo-entidades").hidden = true; });
  $("#planilla-dep").addEventListener("change", (ev) => { PL.dep = ev.target.value; PL.n = 25; SUE && (pintarTablaEntidades(), pintarCombo()); });
  $("#tabla-orden").addEventListener("change", (ev) => { PL.orden = ev.target.value; PL.n = 25; pintarTablaEntidades(); });
  $("#tabla-mas").addEventListener("click", () => { PL.n += 25; pintarTablaEntidades(); });
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
      { nombre: "SUNAT — Estadísticas y estudios", url: "https://www.sunat.gob.pe/estadisticasestudios/", que: "Notas tributarias y reportes de recaudación." },
      { nombre: "OECE — Contrataciones abiertas (OCDS)", url: "https://contratacionesabiertas.oece.gob.pe/", que: "Contratos, proveedores y señales de alerta." },
      { nombre: "Contraloría — Buscador de informes de control", url: "https://buscadorinformes.contraloria.gob.pe/BuscadorCGR/Informes/inicio.html", que: "Auditorías y presuntos responsables." },
      { nombre: "Contraloría — Informe de obras paralizadas", url: "https://www.gob.pe/institucion/contraloria/informes-publicaciones", que: "Base de obras paralizadas (trimestral)." },
      { nombre: "MIDIS — Juntos y Pensión 65 (Datos Abiertos)", url: "https://www.datosabiertos.gob.pe/", que: "Hogares y usuarios por distrito (solo contamos; no publicamos nombres)." },
      { nombre: "BCRP — Deuda pública", url: "https://estadisticas.bcrp.gob.pe/estadisticas/series/trimestrales/deuda-publica", que: "Saldo trimestral de la deuda por acreedor." },
      { nombre: "Portal de Transparencia — Pasajes y viáticos", url: "https://www.transparencia.gob.pe/", que: "Viajes de funcionarios de las entidades principales." },
      { nombre: "Mapas del Perú (peru-geojson, MPL-2.0)", url: "https://github.com/juaneladio/peru-geojson", que: "Límites de departamentos, provincias y distritos." }
    ];
    $("#fuentes-lista").innerHTML = enlacesHTML([...extra, ...D.buscadoresOficiales]);
    $("#no-disponible").innerHTML = enlacesHTML([
      { nombre: "Proveedores sancionados por el OECE", url: "https://www.rnp.gob.pe/consultasenlinea/inhabilitados/busqueda.asp", que: "La consulta oficial exige un captcha; no la automatizamos. Puedes revisarla tú." },
      { nombre: "Declaraciones juradas de bienes e intereses", url: "https://appdji.contraloria.gob.pe/djic/", que: "El sistema de la Contraloría exige un captcha para cada consulta." },
      { nombre: "Aportes a partidos y campañas (ONPE Claridad)", url: "https://claridad.onpe.gob.pe/", que: "El portal bloquea el acceso automático; consúltalo directamente." },
      { nombre: "Resultados en anemia y aprendizaje por región", url: "https://www.datosabiertos.gob.pe/", que: "Los datos abiertos de anemia solo cubren Apurímac y los de aprendizaje no están en formato descargable." },
      { nombre: "Registro de visitas de todas las entidades", url: "https://visitas.servicios.gob.pe/consultas/", que: "Exige captcha. Sí incluimos las visitas al Despacho Presidencial, que no lo exige." }
    ]);
  }

  // =====================================================================
  //  FASE 2: alertas, auditorías, programas, deuda, viajes, votos,
  //  años anteriores y tu distrito (mapa)
  // =====================================================================
  let CTRL = null, PROG = null, DEU = null, VIA = null, HIST = null;
  const cargaUnica = {};
  const cargarUna = (n) => (cargaUnica[n] = cargaUnica[n] || cargar(n));
  const ALERTA = {
    U: ["Un solo postor", "Solo una empresa se presentó en un proceso que debía ser competitivo."],
    D: ["Contratación directa", "Se contrató sin concurso (la ley lo permite en emergencias, proveedor único, etc.)."],
    S: ["Sobre el valor referencial", "Se adjudicó más de 10% por encima del precio que la entidad había estimado."],
    C: ["Misma empresa, muchas veces", "La misma empresa ganó 5 o más contratos de la misma entidad en el año."]
  };
  const chipsAlerta = (f) => (f || "").split("").filter((k) => ALERTA[k]).map((k) => `<span class="alerta alerta--${k}" title="${esc(ALERTA[k][1])}">🚩 ${esc(ALERTA[k][0])}</span>`).join("");

  // ---------- Señales de alerta en contratos ----------
  const AL = { f: "", n: 20 };
  function pintarAlertas() {
    if (!CON || !CON.alertas) return;
    $("#alertas-tipos").innerHTML = Object.entries(ALERTA).map(([k, [t, d]]) => {
      const a = CON.alertas[k] || { contratos: 0, monto: 0 };
      return `<button type="button" class="alerta-tipo${AL.f === k ? " alerta-tipo--activo" : ""}" data-al="${k}"><span class="alerta alerta--${k}">🚩 ${esc(t)}</span>
        <b>${nf0.format(a.contratos)} contratos · ${corto(a.monto / 1e6)}</b><small>${esc(d)}</small></button>`;
    }).join("");
    $$("#alertas-tipos [data-al]").forEach((b) => b.addEventListener("click", () => { AL.f = AL.f === b.dataset.al ? "" : b.dataset.al; AL.n = 20; pintarAlertas(); }));
    const maxE = Math.max(1, ...CON.entidadesAlerta.map((e) => e[2]));
    $("#alertas-entidades").innerHTML = CON.entidadesAlerta.slice(0, 15).map(([e, n, m]) => filaHTML({
      nombre: esc(propio(e)), valorTexto: corto(m / 1e6), ancho: (m / maxE) * 100,
      detalle: `<p>${nf0.format(n)} contratos con al menos una señal.</p><p><a class="boton boton--secundario boton--chico" href="#contratos?q=${encodeURIComponent(e)}">Ver sus contratos</a></p>`
    })).join("");
    $("#alertas-filtro").innerHTML = `<span class="ayuda">${AL.f ? "Filtrando por: " + esc(ALERTA[AL.f][0]) + " · " : ""}Toca un tipo de alerta arriba para filtrar.</span>`;
    const lista = CON.conAlertas.filter((r) => !AL.f || r[9].includes(AL.f));
    $("#alertas-lista").innerHTML = lista.slice(0, AL.n).map(tarjetaContrato).join("") || '<p class="vacio">No hay contratos con esa señal.</p>';
    $("#alertas-mas").hidden = lista.length <= AL.n;
    $("#alertas-mas").textContent = `Ver más (${nf0.format(lista.length - AL.n)} restantes)`;
  }
  $("#alertas-mas").addEventListener("click", () => { AL.n += 20; pintarAlertas(); });

  // ---------- Auditorías (Contraloría) ----------
  const CT = { q: "", dep: "", solo: "resp", n: 20 };
  const tarjetaInforme = ([fecha, ent, dep, prov, dist, titulo, modalidad, personas, resp, numero, pdf, resumen]) => `
    <article class="proyecto">
      <div class="ley__cab"><span class="ley__num">${esc(fecha)} · Informe ${esc(numero)}</span>${personas ? `<span class="etapa etapa--fin">${nf0.format(personas)} presunto${personas === 1 ? "" : "s"} responsable${personas === 1 ? "" : "s"}</span>` : '<span class="etapa etapa--inicio">Sin responsables señalados</span>'}</div>
      <p class="ley__titulo">${esc(fraseL(titulo))}</p>
      <p class="ley__meta">${esc(propio(ent))} · ${esc(propio(dist))}, ${esc(propio(dep))} · ${esc(fraseL(modalidad))}</p>
      ${resp ? `<p class="ley__meta">Tipo de responsabilidad: <strong>${esc(fraseL(resp))}</strong></p>` : ""}
      <p class="enlaces-linea">${pdf ? `<a href="${esc(pdf)}" target="_blank" rel="noopener">Informe completo (PDF) ↗</a>` : ""}${resumen ? ` <a href="${esc(resumen)}" target="_blank" rel="noopener">Resumen ↗</a>` : ""}</p>
    </article>`;
  async function prepararControl() {
    if (CTRL) return CTRL;
    const d = await cargarUna("control.json");
    if (d && d.informes) CTRL = d;
    return CTRL;
  }
  async function pintarControl() {
    if (!(await prepararControl())) { $("#control-lista").innerHTML = '<p class="vacio">Aún no hay datos de auditorías.</p>'; return; }
    const mods = Object.fromEntries(CTRL.porModalidad || []);
    $("#control-intro").innerHTML = `Desde ${esc(CTRL.anios.split(",")[0])}, la Contraloría publicó <strong>${nf0.format(CTRL.total)} informes</strong>. La mayoría son alertas durante la ejecución (${nf0.format((mods["ORIENTACIÓN DE OFICIO"] || 0) + (mods["CONTROL CONCURRENTE"] || 0) + (mods["VISITA DE CONTROL"] || 0))} orientaciones, controles concurrentes y visitas). Aquí mostramos una por una las <strong>${nf0.format(CTRL.informes.length)} auditorías</strong>; en <strong>${nf0.format(CTRL.conResponsabilidad)}</strong> se señaló a funcionarios con <strong>presunta responsabilidad</strong> administrativa, civil o penal ("presunta": aún debe confirmarse en un proceso).`;
    const tipos = Object.fromEntries(CTRL.tipos);
    $("#control-kpis").innerHTML = [
      ["Informes publicados", nf0.format(CTRL.total), esc(CTRL.anios.replace(",", " y "))],
      ["Con presuntos responsables", nf0.format(CTRL.conResponsabilidad), pct(CTRL.conResponsabilidad, CTRL.total) + " de los informes"],
      ["Personas señaladas", nf0.format(CTRL.personas), "funcionarios y servidores"],
      ["Con indicios penales", nf0.format(tipos.PENAL || 0), "informes que mencionan responsabilidad penal"]
    ].map(kpiHTML).join("");
    const maxE = Math.max(1, ...CTRL.topEntidades.map((e) => e[3]));
    $("#control-entidades").innerHTML = CTRL.topEntidades.slice(0, 15).map(([e, n, c, p]) => filaHTML({
      nombre: esc(propio(e)), valorTexto: `${nf0.format(p)} personas`, ancho: (p / maxE) * 100,
      detalle: `<p>${nf0.format(n)} informes, ${nf0.format(c)} con presuntos responsables.</p><p><a class="boton boton--secundario boton--chico" href="#control?q=${encodeURIComponent(e)}">Ver sus informes</a></p>`
    })).join("");
    const maxD = Math.max(1, ...CTRL.porDepartamento.map((x) => x[1]));
    $("#control-deps").innerHTML = CTRL.porDepartamento.slice(0, 25).map(([d, n]) => filaSimple(propio(d), n, maxD, nf0.format(n))).join("");
    if ($("#control-dep").options.length <= 1) $("#control-dep").innerHTML = '<option value="">Todos</option>' + CTRL.porDepartamento.map(([d]) => `<option value="${esc(d)}">${esc(propio(d))}</option>`).join("");
    $("#control-fuente").innerHTML = `Fuente: <a href="${esc(CTRL.fuente)}" target="_blank" rel="noopener">Buscador de informes de la Contraloría</a>. Actualizado: ${new Date(CTRL.actualizado).toLocaleDateString("es-PE")}.`;
    pintarListaControl();
  }
  function pintarListaControl() {
    const q = normal(CT.q.trim());
    const lista = CTRL.informes.filter((r) => (!CT.solo || r[7] > 0) && (!CT.dep || r[2] === CT.dep) && (!q || normal(`${r[1]} ${r[3]} ${r[4]} ${r[5]} ${r[9]}`).includes(q)));
    $("#control-conteo").textContent = `${nf0.format(lista.length)} informes`;
    $("#control-lista").innerHTML = lista.slice(0, CT.n).map(tarjetaInforme).join("") || '<p class="vacio">No hay informes que coincidan.</p>';
    $("#control-mas").hidden = lista.length <= CT.n;
    $("#control-mas").textContent = `Ver más (${nf0.format(lista.length - CT.n)} restantes)`;
  }
  $("#control-q").addEventListener("input", (e) => { CT.q = e.target.value; CT.n = 20; CTRL && pintarListaControl(); });
  $("#control-dep").addEventListener("change", (e) => { CT.dep = e.target.value; CT.n = 20; CTRL && pintarListaControl(); });
  $("#control-solo").addEventListener("change", (e) => { CT.solo = e.target.value; CT.n = 20; CTRL && pintarListaControl(); });
  $("#control-mas").addEventListener("click", () => { CT.n += 20; pintarListaControl(); });

  // ---------- Programas sociales ----------
  const DEP_NOMBRE = { "01": "Amazonas", "02": "Áncash", "03": "Apurímac", "04": "Arequipa", "05": "Ayacucho", "06": "Cajamarca", "07": "Callao", "08": "Cusco",
    "09": "Huancavelica", "10": "Huánuco", "11": "Ica", "12": "Junín", "13": "La Libertad", "14": "Lambayeque", "15": "Lima", "16": "Loreto", "17": "Madre de Dios",
    "18": "Moquegua", "19": "Pasco", "20": "Piura", "21": "Puno", "22": "San Martín", "23": "Tacna", "24": "Tumbes", "25": "Ucayali" };
  let progVista = "juntos";
  function pintarProgramas() {
    if (!PROG) { $("#programas-deps").innerHTML = '<p class="vacio">Aún no hay datos de programas sociales.</p>'; return; }
    const T = PROG.totales;
    $("#programas-intro").innerHTML = `<strong>Juntos</strong> entrega un apoyo a hogares en pobreza con niños o gestantes; <strong>Pensión 65</strong>, una subvención a adultos mayores en pobreza extrema. Datos oficiales del MIDIS por distrito (solo conteos: no publicamos nombres).`;
    $("#programas-kpis").innerHTML = [
      ["Hogares en Juntos", nf0.format(T.juntos_hogares), `bimestre ${esc(PROG.juntosBimestre || "")}`],
      ["Transferido por Juntos", millones(T.juntos_monto / 1e6), "en lo que va del año"],
      ["Usuarios de Pensión 65", nf0.format(T.pension65), `padrón de ${esc(PROG.pension65Periodo || "")}`]
    ].map(kpiHTML).join("");
    const filas = Object.entries(PROG.departamentos).map(([c, v]) => [DEP_NOMBRE[c] || c, progVista === "juntos" ? v[0] : v[2], v[1]]).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...filas.map((f) => f[1]));
    $("#programas-deps").innerHTML = filas.map(([n, v, m]) => filaSimple(n, v, max, progVista === "juntos" ? `${nf0.format(v)} hogares · ${corto(m / 1e6)}` : `${nf0.format(v)} personas`)).join("");
    $("#programas-fuente").innerHTML = `Fuentes: <a href="${esc(PROG.fuentes.juntos)}" target="_blank" rel="noopener">Programa Juntos</a> y <a href="${esc(PROG.fuentes.pension65)}" target="_blank" rel="noopener">Pensión 65</a> (Plataforma Nacional de Datos Abiertos).`;
  }
  grupoBotones("prog", (v) => { progVista = v; pintarProgramas(); });

  // ---------- Deuda pública ----------
  function pintarDeuda() {
    if (!DEU) { $("#deuda-acreedores").innerHTML = '<p class="vacio">Aún no hay datos de deuda.</p>'; return; }
    const u = DEU.ultimo, tr = DEU.trimestres;
    const hace1 = tr[tr.length - 5];
    const porPersona = (u.PN03371FQ * 1e6) / D.poblacion;
    const deudaFn = PR.funciones && PR.funciones.find((f) => /deuda/i.test(f.nombre));
    $("#deuda-intro").innerHTML = `Al ${esc(u.periodo.replace("T", "trimestre ").replace(".", " del 20"))} el sector público debía <strong>${millones(u.PN03371FQ)}</strong>: ${soles(porPersona)} por cada peruano. ${deudaFn ? `Este año se presupuestaron <strong>${millones(deudaFn.monto)}</strong> para pagar intereses y cuotas.` : ""}`;
    $("#deuda-kpis").innerHTML = [
      ["Deuda total", millones(u.PN03371FQ), hace1 ? `${u.PN03371FQ >= hace1.PN03371FQ ? "+" : ""}${pct(u.PN03371FQ - hace1.PN03371FQ, hace1.PN03371FQ)} en un año` : ""],
      ["Deuda externa", millones(u.PN03372FQ), pct(u.PN03372FQ, u.PN03371FQ) + " del total"],
      ["Deuda interna", millones(u.PN03381FQ), pct(u.PN03381FQ, u.PN03371FQ) + " del total"],
      ["Por peruano", soles(porPersona), "deuda total ÷ población"]
    ].map(kpiHTML).join("");
    const ult = tr.slice(-24), max = Math.max(...ult.map((x) => x.PN03371FQ));
    $("#deuda-trimestres").innerHTML = ult.map((x) => `<div class="col" title="${esc(x.periodo)}: ${millones(x.PN03371FQ)}"><div class="col__barras"><span class="col__pres" style="height:${(x.PN03371FQ / max) * 100}%"></span></div>
      <span class="col__num">${nf0.format(x.PN03371FQ / 1000)}</span><span class="col__lbl">${esc(x.periodo.replace(".", " "))}</span></div>`).join("");
    const acre = Object.entries(DEU.nombres).filter(([k]) => !["PN03371FQ", "PN03372FQ"].includes(k)).map(([k, n]) => [n.replace("Externa: ", "Externa · "), u[k] || 0]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const maxA = Math.max(1, ...acre.map((a) => a[1]));
    $("#deuda-acreedores").innerHTML = acre.map(([n, v]) => filaSimple(n, v, maxA, `${corto(v)} · ${pct(v, u.PN03371FQ)}`)).join("");
    $("#deuda-fuente").innerHTML = `Fuente: <a href="${esc(DEU.fuente)}" target="_blank" rel="noopener">BCRP — Saldo de la deuda del sector público no financiero</a>.`;
  }

  // ---------- Viajes de funcionarios ----------
  const VJ = { q: "", tipo: "", orden: "monto", n: 20 };
  async function pintarViajes() {
    if (!VIA) VIA = await cargarUna("viajes.json");
    if (!VIA || !VIA.viajes) { $("#viajes-lista").innerHTML = '<p class="vacio">Aún no hay datos de viajes.</p>'; return; }
    $("#viajes-intro").innerHTML = `Pasajes y viáticos que ${nf0.format(VIA.topEntidades.length)} entidades del Estado publicaron en el Portal de Transparencia en ${VIA.anio}: <strong>${nf0.format(VIA.total)} viajes</strong> por <strong>${millones(VIA.monto / 1e6)}</strong>.${VIA.atipicos ? ` Hay ${nf0.format(VIA.atipicos)} viajes con montos inusuales (${soles(VIA.montoAtipico)}) que no sumamos: casi seguro son errores de registro.` : ""}`;
    $("#viajes-kpis").innerHTML = [
      ["Viajes", nf0.format(VIA.total), `${VIA.anio}, entidades principales`],
      ["Gasto total", millones(VIA.monto / 1e6), "pasajes + viáticos"],
      ["Viajes al extranjero", nf0.format(VIA.internacionales), corto(VIA.montoInternacional / 1e6)],
      ["Destino más frecuente", esc(VIA.topDestinos[0] ? VIA.topDestinos[0][0] : "—"), VIA.topDestinos[0] ? `${nf0.format(VIA.topDestinos[0][1])} viajes` : ""]
    ].map(kpiHTML).join("");
    const maxP = Math.max(1, ...VIA.topPersonas.map((p) => p[2]));
    $("#viajes-personas").innerHTML = VIA.topPersonas.slice(0, 15).map(([p, e, m, n, tipos]) => filaHTML({
      nombre: esc(propio(p)), valorTexto: soles(m), ancho: (m / maxP) * 100,
      detalle: `<p>${esc(e)} · ${nf0.format(n)} viajes (${esc(tipos.join(" y ").toLowerCase())}).</p><p><button type="button" class="boton boton--secundario boton--chico" data-vbus="${esc(p)}">Ver sus viajes</button></p>`
    })).join("");
    const maxE = Math.max(1, ...VIA.topEntidades.map((e) => e[1]));
    $("#viajes-entidades").innerHTML = VIA.topEntidades.slice(0, 15).map(([e, m, n, ni]) => filaSimple(e, m, maxE, `${corto(m / 1e6)} · ${nf0.format(n)} viajes`)).join("");
    $$("#viajes [data-vbus]").forEach((b) => b.addEventListener("click", () => { $("#viajes-q").value = b.dataset.vbus; VJ.q = b.dataset.vbus; VJ.n = 20; pintarListaViajes(); $("#viajes-q").scrollIntoView({ block: "center" }); }));
    $("#viajes-fuente").innerHTML = `Fuente: Portal de Transparencia Estándar, sección "Pasajes y viáticos" de cada entidad. Actualizado: ${new Date(VIA.actualizado).toLocaleDateString("es-PE")}.`;
    pintarListaViajes();
  }
  function pintarListaViajes() {
    const q = normal(VJ.q.trim());
    let lista = VIA.viajes.filter((v) => (!VJ.tipo || v[10] === VJ.tipo) && (!q || normal(`${v[1]} ${v[2]} ${v[3]} ${v[6]}`).includes(q)));
    if (VJ.orden === "fecha") lista = [...lista].sort((a, b) => (b[4].split("/").reverse().join("") > a[4].split("/").reverse().join("") ? 1 : -1));
    $("#viajes-conteo").textContent = `${nf0.format(lista.length)} viajes · ${soles(lista.reduce((a, v) => a + v[9], 0))}`;
    $("#viajes-lista").innerHTML = lista.slice(0, VJ.n).map((v) => `<article class="proyecto">
      <div class="ley__cab"><span class="ley__num">${esc(v[4])} → ${esc(v[5])}</span><span class="etapa ${v[10] === "Internacional" ? "etapa--avanza" : "etapa--inicio"}">${esc(v[10])}</span></div>
      <p class="ley__titulo">${esc(propio(v[3]))}</p>
      <p class="ley__meta">${esc(v[1])} · ${esc(v[2])}</p>
      <p class="ley__meta">🧭 ${esc(v[6])}</p>
      <div class="proyecto__montos"><span>Pasajes ${soles(v[7])} · viáticos ${soles(v[8])}</span><span>${soles(v[9])}</span></div>
      ${v[12] ? '<p class="proyecto__alerta">⚠️ Monto inusual: probablemente un error de registro de la entidad. Verifícalo en la fuente; no se cuenta en los totales.</p>' : ""}
      <a class="ley__link" href="${esc(VIA.urlEntidad.replace("{id}", v[11]))}" target="_blank" rel="noopener">Ver en el Portal de Transparencia ↗</a>
    </article>`).join("") || '<p class="vacio">No hay viajes que coincidan.</p>';
    $("#viajes-mas").hidden = lista.length <= VJ.n;
    $("#viajes-mas").textContent = `Ver más (${nf0.format(lista.length - VJ.n)} restantes)`;
  }
  $("#viajes-q").addEventListener("input", (e) => { VJ.q = e.target.value; VJ.n = 20; VIA && VIA.viajes && pintarListaViajes(); });
  $("#viajes-tipo").addEventListener("change", (e) => { VJ.tipo = e.target.value; VJ.n = 20; VIA && VIA.viajes && pintarListaViajes(); });
  $("#viajes-orden").addEventListener("change", (e) => { VJ.orden = e.target.value; VJ.n = 20; VIA && VIA.viajes && pintarListaViajes(); });
  $("#viajes-mas").addEventListener("click", () => { VJ.n += 20; pintarListaViajes(); });

  // ---------- Votaciones del Congreso ----------
  function tituloVotacion(t) {
    const m = PROY && /PROPOSICI[OÓ]N(?:ES)? LEGISLATIVAS? ([\d, Y]+)|PROYECTOS? (?:DE [^\d]+)?([\d, Y]+)-20/i.exec(t);
    if (m) {
      const nums = (m[1] || m[2] || "").split(/[^\d]+/).filter(Boolean).map(Number);
      const p = nums.length && PROY.proyectos.find((x) => x.num === nums[0] && (x.camara === (camara === "senado" ? "S" : "D")));
      if (p) return `${fraseL(t)} — <em>${esc(fraseL(p.titulo).slice(0, 160))}</em>`;
    }
    return esc(fraseL(t));
  }
  function pintarVotos() {
    if (!CONG) return;
    const c = CONG.camaras[camara];
    const vs = c.votaciones || [];
    const q = clave($("#votos-q").value);
    const quien = q ? c.miembros.filter((m) => clave(m.nombre).includes(q)).slice(0, 1)[0] : null;
    if (quien) {
      const v = quien.votos || {};
      $("#votos-persona").innerHTML = `<div class="tarjeta tarjeta--acento"><h3 class="exp-sub" style="margin-top:0">${esc(quien.nombre)}</h3>
        <p>A favor: <strong>${nf0.format(v.favor || 0)}</strong> · En contra: <strong>${nf0.format(v.contra || 0)}</strong> · Abstenciones: <strong>${nf0.format(v.abstencion || 0)}</strong> · Sin voto registrado: <strong>${nf0.format(vs.length - (v.favor || 0) - (v.contra || 0) - (v.abstencion || 0))}</strong> de ${nf0.format(vs.length)} votaciones.</p></div>`;
    } else $("#votos-persona").innerHTML = q ? '<p class="vacio">No encontramos ese apellido en esta cámara.</p>' : "";
    const k = quien ? clave(quien.nombre) : null;
    $("#votos-lista").innerHTML = vs.length ? vs.map((x) => {
      const tot = x.favor.length + x.contra.length + x.abstencion.length || 1;
      let suVoto = "";
      if (k) {
        const en = (g) => x[g].some((n) => clave(n) === k);
        suVoto = en("favor") ? '<span class="voto voto--favor">Votó a favor</span>' : en("contra") ? '<span class="voto voto--contra">Votó en contra</span>' : en("abstencion") ? '<span class="voto voto--abst">Se abstuvo</span>' : '<span class="voto">No votó</span>';
      }
      return `<details class="votacion"><summary>
          <span class="votacion__fecha">${fechaLarga(x.fecha)} · sesión ${x.sesion}</span>
          <span class="votacion__t">${tituloVotacion(x.titulo)}</span>${suVoto}
          <span class="votacion__barra" aria-label="${x.favor.length} a favor, ${x.contra.length} en contra, ${x.abstencion.length} abstenciones">
            <i class="v-favor" style="width:${(x.favor.length / tot) * 100}%"></i><i class="v-contra" style="width:${(x.contra.length / tot) * 100}%"></i><i class="v-abst" style="width:${(x.abstencion.length / tot) * 100}%"></i></span>
          <span class="votacion__n">✔ ${x.favor.length} · ✖ ${x.contra.length} · ○ ${x.abstencion.length}</span></summary>
        <div class="votacion__det">${[["favor", "A favor"], ["contra", "En contra"], ["abstencion", "Abstención"]].map(([g, t]) => x[g].length ? `<p><strong>${t} (${x[g].length}):</strong> ${x[g].map(esc).join(", ")}</p>` : "").join("")}
        <p><a href="${esc(x.url)}" target="_blank" rel="noopener">Ver acta oficial (PDF) ↗</a></p></div></details>`;
    }).join("") : '<p class="vacio">Aún no hay votaciones leídas para esta cámara.</p>';
  }
  $("#votos-q").addEventListener("input", () => pintarVotos());

  // ---------- Años anteriores ----------
  async function pintarHistoria() {
    if (!HIST) HIST = await cargarUna("historico/indice.json");
    const anios = (HIST && HIST.anios ? [...HIST.anios] : []).sort((a, b) => a.anio - b.anio);
    if (PR.oficial && !anios.some((a) => a.anio === PR.anio)) anios.push({ anio: PR.anio, total: [PR.pia * 1e6, PR.pim * 1e6, PR.dev * 1e6], funciones: Object.fromEntries(PR.funciones.map((f) => [f.raw || f.nombre, [f.pia * 1e6, f.monto * 1e6, f.dev * 1e6]])), parcial: true });
    if (anios.length < 2) { $("#historia-anios").innerHTML = '<p class="vacio">Los años anteriores se están procesando. Vuelve en unos minutos.</p>'; return; }
    const max = Math.max(...anios.map((a) => a.total[1]));
    $("#historia-anios").innerHTML = anios.map((a) => `<div class="col col--doble" title="${a.anio}: presupuesto ${millones(a.total[1] / 1e6)}, gastado ${millones(a.total[2] / 1e6)} (${pct(a.total[2], a.total[1])})">
      <div class="col__barras"><span class="col__total" style="height:${(a.total[1] / max) * 100}%"></span><span class="col__pres" style="height:${(a.total[2] / max) * 100}%"></span></div>
      <span class="col__num">${nf0.format(a.total[2] / 1e9)}</span><span class="col__sub">${pct(a.total[2], a.total[1])}</span><span class="col__lbl">${a.anio}${a.parcial ? "*" : ""}</span></div>`).join("");
    const completos = anios.filter((a) => !a.parcial);
    const ult = completos[completos.length - 1], prev = completos[completos.length - 2], pri = completos[0];
    $("#historia-kpis").innerHTML = [
      [`Gastado en ${ult.anio}`, millones(ult.total[2] / 1e6), prev ? `${ult.total[2] >= prev.total[2] ? "+" : ""}${pct(ult.total[2] - prev.total[2], prev.total[2])} vs. ${prev.anio}` : ""],
      [`Sin gastar en ${ult.anio}`, millones((ult.total[1] - ult.total[2]) / 1e6), `${pct(ult.total[1] - ult.total[2], ult.total[1])} del presupuesto`],
      [`De ${pri.anio} a ${ult.anio}`, `${ult.total[2] >= pri.total[2] ? "+" : ""}${pct(ult.total[2] - pri.total[2], pri.total[2])}`, "crecimiento del gasto"]
    ].map(kpiHTML).join("");
    const funcs = Object.keys(ult.funciones).sort((a, b) => ult.funciones[b][2] - ult.funciones[a][2]).slice(0, 25);
    $("#historia-funciones").innerHTML = `<thead><tr><th>Función</th>${anios.map((a) => `<th>${a.anio}${a.parcial ? "*" : ""}</th>`).join("")}<th></th></tr></thead><tbody>` +
      funcs.map((f) => {
        const v = (a) => (a.funciones[f] ? a.funciones[f][2] : 0);
        const cambio = prev && v(prev) ? (v(ult) - v(prev)) / v(prev) : 0;
        return `<tr><td>${esc(bonito(f))}</td>${anios.map((a) => `<td>${v(a) ? nf1.format(v(a) / 1e9) : "—"}</td>`).join("")}<td class="${cambio >= 0 ? "sube" : "baja"}">${cambio >= 0 ? "▲" : "▼"} ${nf0.format(Math.abs(cambio * 100))}%</td></tr>`;
      }).join("") + "</tbody>";
    $("#historia-fuente").innerHTML = `Montos en miles de millones de soles (devengado). * ${PR.anio}: año en curso. Fuente: MEF — Datos Abiertos, presupuesto y ejecución de cada año.`;
  }

  // ---------- Tu distrito: mapa y ficha ----------
  let MAPA = null, capaMapa = null, nivelMapa = { dep: null }, geo = {}, metricas = null;
  function cargarLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload = ok; s.onerror = mal; document.head.appendChild(s);
    });
  }
  function calcularMetricas() {
    if (metricas) return metricas;
    const m = { dep: {}, dist: {} };
    const add = (nivel, k, campo, v) => { const o = (m[nivel][k] = m[nivel][k] || {}); o[campo] = (o[campo] || 0) + v; };
    (ENT ? ENT.entidades : []).forEach((e) => {
      if (e[3] !== "GOBIERNOS LOCALES" || !e[11]) return;
      add("dist", e[11], "pim", e[7]); add("dist", e[11], "dev", e[8]);
      add("dep", e[11].slice(0, 2), "pim", e[7]); add("dep", e[11].slice(0, 2), "dev", e[8]);
    });
    const ubPorNombre = {};
    (ENT ? ENT.entidades : []).forEach((e) => { if (e[11]) ubPorNombre[clave(e[4] + e[5] + e[6])] = e[11]; });
    (OBRAS ? OBRAS.obras : []).forEach((o) => {
      const u = ubPorNombre[clave(o.departamento + o.provincia + o.distrito)];
      if (u) { add("dist", u, "obras", 1); add("dep", u.slice(0, 2), "obras", 1); }
    });
    (CTRL ? CTRL.informes : []).forEach((r) => {
      if (!r[7]) return;
      const u = ubPorNombre[clave(r[2] + r[3] + r[4])];
      if (u) { add("dist", u, "control", 1); add("dep", u.slice(0, 2), "control", 1); }
    });
    if (PROG) Object.entries(PROG.distritos).forEach(([u, v]) => { add("dist", u, "juntos", v[0]); add("dist", u, "p65", v[3]); add("dep", u.slice(0, 2), "juntos", v[0]); add("dep", u.slice(0, 2), "p65", v[3]); });
    Object.values(m.dep).concat(Object.values(m.dist)).forEach((o) => { if (o.pim) o.ejec = (100 * o.dev) / o.pim; });
    return (metricas = m);
  }
  const METRICA_TXT = { ejec: ["% gastado", (v) => nf0.format(v) + "%"], obras: ["obras paralizadas", nf0.format], control: ["informes con responsables", nf0.format],
    juntos: ["hogares en Juntos", nf0.format], p65: ["usuarios de Pensión 65", nf0.format] };
  function colorEscala(t) { // de claro a oscuro, verde azulado
    const a = [226, 239, 237], b = [10, 87, 87];
    return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(",")})`;
  }
  async function pintarMapa() {
    const caja = $("#mapa");
    caja.innerHTML = '<p class="vacio">Cargando mapa…</p>';
    try { await cargarLeaflet(); } catch (e) { caja.innerHTML = '<p class="vacio">No se pudo cargar el mapa. Usa el buscador de distritos.</p>'; return; }
    await prepararEntidades();
    await prepararControl();
    const nivel = nivelMapa.dep ? "distrital" : "departamental";
    if (!geo[nivel]) geo[nivel] = await cargar(`mapas/${nivel}.geojson`);
    if (!geo[nivel]) { caja.innerHTML = '<p class="vacio">No se pudo cargar el mapa.</p>'; return; }
    const met = calcularMetricas(), clave_m = $("#mapa-metrica").value;
    const feats = nivelMapa.dep ? geo.distrital.features.filter((f) => f.properties.id.slice(0, 2) === nivelMapa.dep) : geo.departamental.features;
    const valor = (f) => { const o = (nivelMapa.dep ? met.dist : met.dep)[f.properties.id] || {}; return o[clave_m] || 0; };
    const vals = feats.map(valor), max = Math.max(1, ...vals), min = clave_m === "ejec" ? Math.min(...vals.filter((v) => v > 0)) : 0;
    if (!MAPA) {
      caja.innerHTML = "";
      MAPA = L.map(caja, { zoomControl: true, attributionControl: false, scrollWheelZoom: false });
    }
    if (capaMapa) capaMapa.remove();
    capaMapa = L.geoJSON({ type: "FeatureCollection", features: feats }, {
      style: (f) => { const v = valor(f); const t = max > min ? (v - min) / (max - min) : 0; return { weight: 1, color: "#ffffff", fillOpacity: 0.9, fillColor: v > 0 ? colorEscala(Math.max(0, t)) : "#e8e4dc" }; },
      onEachFeature: (f, capa) => {
        const p = f.properties, v = valor(f);
        capa.bindTooltip(`<strong>${esc(propio(p.n))}</strong><br>${esc(METRICA_TXT[clave_m][1](v))} ${esc(METRICA_TXT[clave_m][0])}`, { sticky: true });
        capa.on("click", () => { if (!nivelMapa.dep) { nivelMapa.dep = p.id; pintarMapa(); } else abrirDistrito(p.id); });
      }
    }).addTo(MAPA);
    MAPA.fitBounds(capaMapa.getBounds(), { padding: [10, 10] });
    setTimeout(() => MAPA.invalidateSize(), 50);
    $("#mapa-migas").innerHTML = nivelMapa.dep
      ? `<button type="button" class="migas__volver" id="mapa-volver">← Todo el Perú</button> <strong>${esc(DEP_NOMBRE[nivelMapa.dep] || nivelMapa.dep)}</strong> · toca un distrito para ver su ficha`
      : "<strong>Todo el Perú</strong> · toca un departamento para ver sus distritos";
    const v = $("#mapa-volver"); if (v) v.addEventListener("click", () => { nivelMapa.dep = null; pintarMapa(); });
    $("#mapa-leyenda").innerHTML = `<span>${esc(METRICA_TXT[clave_m][1](min))}</span><i style="background:linear-gradient(90deg, ${colorEscala(0)}, ${colorEscala(1)})"></i><span>${esc(METRICA_TXT[clave_m][1](max))}</span><small>${esc(METRICA_TXT[clave_m][0])}</small>`;
  }
  $("#mapa-metrica").addEventListener("change", () => pintarMapa());

  function distritosLista() {
    if (!ENT) return [];
    return ENT.entidades.filter((e) => e[3] === "GOBIERNOS LOCALES" && e[11] && /DISTRITAL|PROVINCIAL/.test(e[1]));
  }
  $("#dist-q").addEventListener("input", async (ev) => {
    await prepararEntidades();
    const q = normal(ev.target.value.trim()), box = $("#dist-combo");
    if (q.length < 2) { box.hidden = true; return; }
    const lista = distritosLista().filter((e) => normal(`${e[6]} ${e[5]} ${e[4]}`).includes(q)).sort((a, b) => (normal(a[6]).startsWith(q) ? -1 : 1) - (normal(b[6]).startsWith(q) ? -1 : 1) || b[7] - a[7]).slice(0, 10);
    box.innerHTML = lista.length ? lista.map((e) => `<button type="button" class="combo__op" data-dub="${e[11]}"><span>${esc(propio(e[6]))}</span><small>${esc(propio(e[5]))}, ${esc(propio(e[4]))} · ${esc(propio(e[1]))}</small></button>`).join("") : '<p class="vacio">No encontramos ese distrito.</p>';
    box.hidden = false;
    $$("#dist-combo [data-dub]").forEach((b) => b.addEventListener("click", () => { box.hidden = true; ev.target.value = ""; abrirDistrito(b.dataset.dub); }));
  });

  async function abrirDistrito(ub) {
    const box = $("#dist-ficha");
    box.hidden = false; box.innerHTML = '<p class="vacio">Armando la ficha del distrito…</p>';
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    await prepararEntidades(); await prepararControl();
    try { history.replaceState(null, "", "#distrito?u=" + ub); } catch (e) {}
    const ents = ENT.entidades.filter((e) => e[11] === ub);
    const muni = ents.find((e) => e[3] === "GOBIERNOS LOCALES" && /DISTRITAL|PROVINCIAL/.test(e[1])) || ents.find((e) => e[3] === "GOBIERNOS LOCALES");
    const ref = muni || ents[0];
    if (!ref) { box.innerHTML = '<p class="vacio">No encontramos entidades con presupuesto en este distrito.</p>'; return; }
    const [dep, prov, dist] = [ref[4], ref[5], ref[6]];
    let det = null;
    if (muni) { if (!cacheEnt[muni[10]]) cacheEnt[muni[10]] = await cargar(`entidades/${muni[10]}.json`); det = cacheEnt[muni[10]] && cacheEnt[muni[10]].entidades.find((x) => x.id === muni[0]); }
    const M = 1e6, kd = clave(dep + prov + dist);
    const obras = OBRAS ? OBRAS.obras.filter((o) => clave(o.departamento + o.provincia + o.distrito) === kd) : [];
    const infs = CTRL ? CTRL.informes.filter((r) => clave(r[2] + r[3] + r[4]) === kd) : [];
    const cuentaDist = CTRL && CTRL.porDistrito ? (Object.entries(CTRL.porDistrito).find(([k]) => clave(k.replace(/\|/g, "")) === kd) || [null, [0, 0]])[1] : [infs.length, 0];
    const pg = PROG && PROG.distritos[ub];
    const sueldo = SUE && muni && SUE.entidades.find((s) => clave(String(s.nombre).replace(/\s*\([^)]*\)\s*$/, "")) === clave(muni[1]) && (!s.departamento || s.departamento === dep));
    const otras = ents.filter((e) => e !== muni);
    const rub = det && det.rubros ? det.rubros : [];
    const maxR = Math.max(1, ...rub.map((r) => r[1]));
    box.innerHTML = `
      <div class="tarjeta__cabeza">
        <div><h2>${esc(propio(dist))}</h2><p class="ayuda">${esc(propio(prov))}, ${esc(propio(dep))} · ubigeo ${esc(ub)}</p></div>
        <div class="controles"><button type="button" class="boton boton--secundario boton--chico" id="dist-copiar">🔗 Copiar enlace</button>
          <button type="button" class="boton boton--secundario boton--chico" id="dist-cerrar">Cerrar ✕</button></div>
      </div>
      ${muni ? `<div class="kpis kpis--4">${[
        ["Presupuesto de la municipalidad", millones(muni[7] / M), propio(muni[1])],
        ["Ya gastado", pct(muni[8], muni[7]), millones(muni[8] / M)],
        ["Obras paralizadas", nf0.format(obras.length), obras.length ? `falta ejecutar ${soles(obras.reduce((a, o) => a + o.saldo, 0))}` : "según la Contraloría"],
        ["Informes de Contraloría", nf0.format(cuentaDist[0]), `${nf0.format(cuentaDist[1])} con presuntos responsables`]
      ].map(kpiHTML).join("")}</div>` : ""}
      <div class="controles controles--enlaces">
        ${muni ? `<a class="boton boton--secundario boton--chico" href="#entidades?id=${encodeURIComponent(muni[0])}">🏘️ Gasto y proyectos de la municipalidad</a>
        <a class="boton boton--secundario boton--chico" href="#contratos?q=${encodeURIComponent(muni[1])}">🤝 Sus contratos</a>` : ""}
        ${sueldo ? `<a class="boton boton--secundario boton--chico" href="#sueldos?ent=${sueldo.id}">💵 Sueldos de su personal</a>` : ""}
      </div>
      <div class="dos-col dos-col--plano">
        <div><h3 class="exp-sub">¿De dónde viene la plata de la municipalidad?</h3>
          ${rub.length ? `<div class="barras">${rub.map(([n, p, d]) => filaSimple(bonito(n), p, maxR, `${corto(p / M)} · ${pct(p, rub.reduce((a, r) => a + r[1], 0))}`)).join("")}</div>
          <p class="ayuda">"Canon y sobrecanon" es parte de lo que pagan las mineras y petroleras; FONCOMUN es un fondo que reparte el Estado a todas las municipalidades.</p>` : '<p class="vacio">Sin datos de fuentes.</p>'}</div>
        <div><h3 class="exp-sub">Programas sociales en el distrito</h3>
          ${pg ? `<ul class="actividades actividades--1">
            <li><span>Hogares en Juntos</span><b>${nf0.format(pg[0])}</b><small>${soles(pg[2])} transferidos este año</small></li>
            <li><span>Adultos mayores en Pensión 65</span><b>${nf0.format(pg[3])}</b><small>padrón ${esc(PROG.pension65Periodo || "")}</small></li></ul>` : '<p class="vacio">Sin datos de programas sociales.</p>'}
          ${otras.length ? `<h3 class="exp-sub">Otras entidades con presupuesto aquí</h3><ul class="actividades actividades--1">${otras.slice(0, 8).map((e) => `<li><span><a href="#entidades?id=${encodeURIComponent(e[0])}">${esc(propio(e[1]))}</a></span><b>${corto(e[7] / M)}</b><small>${pct(e[8], e[7])} gastado</small></li>`).join("")}</ul>` : ""}
        </div>
      </div>
      ${obras.length ? `<h3 class="exp-sub">🚧 Obras paralizadas en el distrito</h3><div class="proyectos">${obras.slice(0, 6).map((o) => `<article class="proyecto"><div class="ley__cab"><span class="ley__num">CUI ${esc(o.cui)}</span><span class="etapa etapa--fin">${esc(o.causal || "Paralizada")}</span></div>
        <p class="ley__titulo">${esc(fraseL(o.nombre))}</p><p class="ley__meta">${esc(propio(o.entidad))} · avance físico ${nf0.format(o.avance)}% · falta ${soles(o.saldo)}</p></article>`).join("")}</div>` : ""}
      ${infs.length ? `<h3 class="exp-sub">🔎 Auditorías de la Contraloría en el distrito</h3><div class="proyectos">${infs.slice(0, 6).map(tarjetaInforme).join("")}</div>
        ${infs.length > 6 ? `<p><a href="#control?q=${encodeURIComponent(dist)}">Ver los ${nf0.format(infs.length)} informes →</a></p>` : ""}` : ""}
      ${det && det.proyectos && det.proyectos.length ? `<h3 class="exp-sub">🏗️ Principales proyectos de la municipalidad</h3><div class="proyectos">${det.proyectos.slice(0, 6).map((p) => tarjetaProyecto(p[0], p[1], bonito(p[2]), p[4], p[5])).join("")}</div>` : ""}
      <p class="fuente">Fuentes: MEF (presupuesto ${PR.anio}), Contraloría (obras paralizadas e informes de control), MIDIS (Juntos y Pensión 65).</p>`;
    $("#dist-cerrar").addEventListener("click", () => { box.hidden = true; try { history.replaceState(null, "", "#distrito"); } catch (e) {} });
    $("#dist-copiar").addEventListener("click", async (ev) => { const url = location.origin + location.pathname + "#distrito?u=" + ub; try { await navigator.clipboard.writeText(url); ev.target.textContent = "✓ Enlace copiado"; } catch (e) { prompt("Copia este enlace:", url); } });
  }

  // ---------- Menú: 4 temas, y dentro de cada tema una fila de secciones ----------
  const GRUPOS = {
    dinero: ["💰 El dinero", [["gastos", "Gastos"], ["ingresos", "Impuestos"], ["deuda", "Deuda"], ["mi-impuesto", "Mi impuesto"]]],
    zona: ["📍 Tu zona", [["distrito", "Tu distrito"], ["entidades", "Tu municipio"], ["obras", "Obras paralizadas"], ["programas", "Programas sociales"]]],
    vigila: ["🔎 Vigila", [["contratos", "Contratos"], ["sueldos", "Sueldos"], ["control", "Auditorías"], ["viajes", "Viajes"]]],
    poder: ["⚖️ El poder", [["congreso", "Congreso"], ["leyes", "Proyectos de ley"], ["visitas", "Visitas a Palacio"]]]
  };
  const GRUPO_DE = { inicio: "inicio", fuentes: "fuentes" };
  Object.entries(GRUPOS).forEach(([g, [, secs]]) => secs.forEach(([s]) => (GRUPO_DE[s] = g)));
  function pintarSubnav(grupo, actual) {
    const box = $("#subnav"), def = GRUPOS[grupo];
    box.hidden = !def;
    if (!def) return;
    $("#subnav-fila").innerHTML = `<span class="subnav__t">${def[0]}</span>` + def[1].map(([s, n]) =>
      `<a href="#${s}"${s === actual ? ' aria-current="page"' : ""}>${n}</a>`).join("");
    const a = $("#subnav-fila [aria-current]");
    if (a) a.scrollIntoView({ block: "nearest", inline: "center" });
  }
  const irABuscar = (ev) => {
    ev.preventDefault();
    if (location.hash && location.hash !== "#inicio") location.hash = "inicio";
    setTimeout(() => { const i = $("#busqueda-global"); i.scrollIntoView({ block: "center" }); i.focus(); }, 80);
  };
  $("#buscar-btn").addEventListener("click", irABuscar);

  // ---------- Pestañas dentro de secciones ----------
  function activarTab(clave) {
    const [grupo] = clave.split(":");
    $$(`[data-tab^="${grupo}:"]`).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === clave)));
    $$(`[data-panel^="${grupo}:"]`).forEach((p) => (p.hidden = p.dataset.panel !== clave));
    if (clave === "gastos:tema" && vista === "arbol") pintarArbol();
    if (clave === "gastos:historia") pintarHistoria();
    if (clave === "congreso:votos") pintarVotos();
    if (clave === "contratos:alertas") pintarAlertas();
  }
  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => activarTab(b.dataset.tab)));
  $$("[data-ir-tab]").forEach((b) => b.addEventListener("click", () => { activarTab(b.dataset.irTab); b.closest(".vista").scrollIntoView({ block: "start" }); }));

  // ---------- Navegación ----------
  const vistas = $$(".vista");
  function mostrar() {
    const [id, query] = (location.hash || "#inicio").slice(1).split("?");
    const p = new URLSearchParams(query || "");
    let v = vistas.find((x) => x.id === id);
    const ancla = !v && id ? document.getElementById(id) : null;
    if (ancla) v = ancla.closest(".vista");
    v = v || vistas[0];
    vistas.forEach((x) => (x.hidden = x !== v));
    const grupo = GRUPO_DE[v.id];
    $$("[data-grupo-link]").forEach((a) => {
      a.classList.toggle("nav__item--activo", a.dataset.grupoLink === grupo);
      a.dataset.grupoLink === grupo ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    pintarSubnav(grupo, v.id);
    // Si el destino está dentro de una pestaña, abrirla
    const panel = ancla && ancla.closest("[data-panel]");
    if (panel) activarTab(panel.dataset.panel);
    if (ancla) setTimeout(() => ancla.scrollIntoView({ block: "start" }), 50); else window.scrollTo(0, 0);

    // Parámetros en la dirección: #seccion?q=...
    const q = p.get("q");
    if (v.id === "entidades") {
      const pid = p.get("id");
      if (q) { EN.q = q; $("#ent-q").value = q; }
      prepararEntidades().then((ok) => { if (!ok) return; if (q) pintarListaEntidades(); if (pid && (!entActual || entActual.id !== pid)) abrirEntidad(pid); });
    }
    if (v.id === "gastos") {
      if (p.get("f")) activarTab("gastos:tema");
      if (id === "gastos-partidas" && q && PART) { PA.q = q; $("#partidas-q").value = q; pintarListaPartidas(); }
      if (vista === "arbol" && !$('[data-panel="gastos:tema"]').hidden) pintarArbol(); // el árbol necesita el ancho visible
    }
    if (v.id === "contratos" && q && CON) { activarTab("contratos:buscar"); CO.q = q; $("#con-q").value = q; buscarContratos(); }
    if (v.id === "obras" && q && OBRAS) { OB.q = q; $("#obras-q").value = q; pintarListaObras(); }
    if (v.id === "leyes" && q && PROY) { $("#buscar-leyes").value = q; mostrarL = 30; pintarListaLeyes(); }
    if (v.id === "congreso" && CONG) {
      if (p.get("c") && p.get("c") !== camara) { const b = $(`[data-camara="${p.get("c")}"]`); if (b) b.click(); }
      if (q) { $("#buscar-congreso").value = q; pintarListaCongreso(); }
    }
    if (v.id === "sueldos" && SUE && p.get("ent")) { activarTab("sueldos:planilla"); abrirPlanilla(+p.get("ent")); }
    if (v.id === "control") pintarControl().then(() => { if (q && CTRL) { CT.q = q; $("#control-q").value = q; pintarListaControl(); } });
    if (v.id === "viajes") pintarViajes().then(() => { if (q && VIA && VIA.viajes) { VJ.q = q; $("#viajes-q").value = q; pintarListaViajes(); } });
    if (v.id === "distrito") { if (!MAPA) pintarMapa(); else setTimeout(() => MAPA.invalidateSize(), 50); if (p.get("u")) abrirDistrito(p.get("u")); }
  }
  window.addEventListener("hashchange", mostrar);

  // ---------- Buscador general ----------
  const SECCIONES = [
    ["Impuestos", "#ingresos", "impuestos recaudacion igv renta sunat"], ["Gastos del presupuesto", "#gastos", "gastos presupuesto educacion salud transporte"],
    ["¿Qué se compra?", "#gastos-partidas", "partidas compras pasajes publicidad combustible"], ["Mi impuesto (calculadora)", "#mi-impuesto", "calculadora mi impuesto cuanto pago"],
    ["Tu municipio", "#entidades", "municipio municipalidad region ugel hospital entidad"], ["Contratos", "#contratos", "contratos empresas proveedores licitacion"],
    ["Obras paralizadas", "#obras", "obras paralizadas contraloria"], ["Sueldos", "#sueldos", "sueldos planilla salario remuneracion"],
    ["Asistencia al Congreso", "#congreso", "congreso asistencia senado diputados faltas"], ["Proyectos de ley", "#leyes", "leyes proyectos de ley congreso"],
    ["Visitas a Palacio", "#visitas", "visitas palacio presidencia presidenta"], ["Fuentes y glosario", "#fuentes", "fuentes glosario metodologia"],
    ["Tu distrito (mapa)", "#distrito", "distrito mapa ficha canon foncomun"], ["Auditorías de la Contraloría", "#control", "auditoria contraloria informe control responsabilidad penal"],
    ["Programas sociales", "#programas", "programas sociales juntos pension 65"], ["Deuda pública", "#deuda", "deuda publica prestamos bonos"],
    ["Viajes de funcionarios", "#viajes", "viajes viaticos pasajes funcionarios"], ["Señales de alerta en contratos", "#contratos", "alertas banderas rojas postor unico contratacion directa"]
  ];
  let tBus;
  async function buscarTodo(texto) {
    const q = normal(texto.trim());
    const box = $("#busqueda-resultados");
    if (q.length < 3) { box.hidden = true; return; }
    if (!ENT) await prepararEntidades();
    const hay = (s) => normal(s).includes(q);
    const grupos = [];
    const add = (titulo, items, verTodo) => { if (items.length) grupos.push({ titulo, items, verTodo }); };
    const enc = encodeURIComponent(texto.trim());
    add("Secciones", SECCIONES.filter(([t, , k]) => hay(t + " " + k)).slice(0, 3).map(([t, h]) => [t, "", h]));
    // Primero las que tienen la palabra en el nombre (municipalidades primero), luego las ubicadas en ese lugar
    const puntaje = (e) => (hay(e[1]) ? (e[3] === "GOBIERNOS LOCALES" ? 3 : 2) : hay(`${e[5]} ${e[6]}`) ? 1 : 0);
    if (ENT) add("Entidades: cuánto gastan", ENT.entidades.map((e) => [puntaje(e), e]).filter(([s]) => s > 0)
      .sort((a, b) => b[0] - a[0] || b[1][7] - a[1][7]).slice(0, 5).map(([, e]) => e)
      .map((e) => [propio(e[1]), `${propio(e[6])}, ${propio(e[4])} · ${corto(e[7] / 1e6)}`, `#entidades?id=${encodeURIComponent(e[0])}`]), `#entidades?q=${enc}`);
    if (ENT) add("Distritos", distritosLista().filter((e) => hay(e[6])).sort((a, b) => (normal(a[6]) === q ? -1 : 1) - (normal(b[6]) === q ? -1 : 1)).slice(0, 3)
      .map((e) => [propio(e[6]), `${propio(e[5])}, ${propio(e[4])} · ficha del distrito y mapa`, `#distrito?u=${e[11]}`]));
    if (SUE) add("Sueldos: planillas", SUE.entidades.filter((e) => hay(`${e.nombre} ${e.departamento || ""}`)).slice(0, 4)
      .map((e) => [propio(e.nombre), `${nf0.format(e.personas)} personas · sueldo mediano ${soles(e.mediana)}`, `#sueldos?ent=${e.id}`]));
    if (CON) add("Contratos: empresas", CON.topProveedores.filter((r) => hay(`${r[1]} ${r[0]}`)).slice(0, 3)
      .map((r) => [propio(r[1]), `${corto(r[2] / 1e6)} en ${nf0.format(r[3])} contratos`, `#contratos?q=${encodeURIComponent(r[1])}`]), `#contratos?q=${enc}`);
    if (OBRAS) add("Obras paralizadas", OBRAS.obras.filter((o) => hay(`${o.cui} ${o.nombre} ${o.distrito} ${o.provincia} ${o.entidad}`)).slice(0, 4)
      .map((o) => [fraseL(o.nombre).slice(0, 90), `${propio(o.distrito)}, ${propio(o.departamento)} · ${nf0.format(o.avance)}% de avance`, `#obras?q=${o.cui}`]), `#obras?q=${enc}`);
    if (PROY) add("Proyectos de ley", PROY.proyectos.filter((x) => hay(`${x.numero} ${x.titulo} ${x.autores.join(" ")}`)).slice(0, 4)
      .map((x) => [fraseL(x.titulo).slice(0, 90), `${x.numero} · ${fraseL(x.estado)}`, `#leyes?q=${x.numero}`]), `#leyes?q=${enc}`);
    if (CONG) {
      const m = [];
      for (const c of ["senado", "diputados"]) CONG.camaras[c].miembros.filter((x) => hay(x.nombre)).forEach((x) => m.push([x.nombre, `${c === "senado" ? "Senado" : "Diputados"} · asistió a ${x.presente} de ${x.sesiones} sesiones`, `#congreso?c=${c}&q=${encodeURIComponent(x.nombre)}`]));
      add("Congresistas", m.slice(0, 4));
    }
    if (PART) add("¿Qué se compra?", PART.partidas.filter((x) => hay(x[1])).slice(0, 3).map((x) => [bonito(x[1]), `${corto(x[3] / 1e6)} en todo el Estado`, `#gastos-partidas?q=${encodeURIComponent(x[1])}`]));
    box.hidden = false;
    box.innerHTML = grupos.length ? grupos.map((g) => `<div class="res-grupo"><p class="res-grupo__t">${esc(g.titulo)}</p>
      ${g.items.map(([t, s, h]) => `<a class="res" href="${h}"><span>${esc(t)}</span>${s ? `<small>${esc(s)}</small>` : ""}</a>`).join("")}
      ${g.verTodo ? `<a class="res res--todo" href="${g.verTodo}">Ver todos los resultados en esta sección →</a>` : ""}</div>`).join("")
      : `<p class="vacio">No encontramos "${esc(texto)}". Prueba con el nombre de tu distrito o de una empresa.</p>`;
  }
  $("#busqueda-global").addEventListener("input", (ev) => { clearTimeout(tBus); tBus = setTimeout(() => buscarTodo(ev.target.value), 200); });
  $$("#busqueda-ejemplos [data-ej]").forEach((b) => b.addEventListener("click", () => { $("#busqueda-global").value = b.dataset.ej; buscarTodo(b.dataset.ej); }));

  // ---------- Arranque ----------
  (async function iniciar() {
    const [mef, cong, vis, rec, sue, proy, obras, part, con, prog, deu] = await Promise.all(["presupuesto.json", "congreso.json", "visitas.json", "recaudacion.json", "sueldos.json", "proyectos.json", "obras.json", "partidas.json", "contratos.json", "programas.json", "deuda.json"].map(cargar));
    OBRAS = obras && obras.obras ? obras : null;
    PART = part && part.partidas ? part : null;
    CON = con && con.topProveedores ? con : null;
    PROG = prog && prog.distritos ? prog : null;
    DEU = deu && deu.trimestres ? deu : null;
    if (OBRAS) OBRAS.obras.forEach((o) => { if (!OBRAS_CUI.has(o.cui)) OBRAS_CUI.set(o.cui, o); });
    REC = rec; ING = modeloIngresos(rec);
    SUE = sue && sue.entidades ? sue : null;
    PROY = proy && proy.proyectos ? proy : null;
    PR = modeloPresupuesto(mef);
    CONG = cong && cong.camaras ? cong : null;
    VIS = vis && vis.semanas ? vis : null;
    try { const v = localStorage.getItem("vistaGastos"); if (v === "arbol") { vista = "arbol"; $$("[data-vista]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.vista === "arbol"))); } } catch (e) {}
    const fechas = [mef, cong, vis, rec, sue, proy, obras, con].map((x) => x && x.actualizado).filter(Boolean).sort();
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
    pintarObras();
    pintarPartidas();
    pintarContratos();
    pintarProgramas();
    pintarDeuda();
    $("#buscadores").innerHTML = enlacesHTML(D.buscadoresOficiales);
    pintarCongreso();
    pintarVisitas();
    calcular();
    pintarFuentes();
    mostrar();
    abrirDesdeEnlace();
  })();
})();
