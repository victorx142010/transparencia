/*
 * DATOS DEL PORTAL
 * ----------------
 * Todas las cifras del sitio salen de este archivo. Para actualizarlas,
 * edita los números aquí y recarga la página.
 *
 * Montos en MILLONES DE SOLES salvo que se indique otra cosa.
 *
 * Campo "estado":
 *   "oficial"   -> cifra tomada de una norma o comunicado oficial (con fuente).
 *   "estimado"  -> cifra aproximada; hay que reemplazarla por la oficial
 *                  (Consulta Amigable del MEF, Nota Tributaria de SUNAT, etc.).
 */
window.DATOS = {
  actualizado: "10 de noviembre de 2026",

  poblacion: 34_350_000, // habitantes aprox. (INEI, proyección)
  uit: 5500,             // Unidad Impositiva Tributaria 2026 (S/)
  rmv: 1130,             // Remuneración Mínima Vital (S/ mensual) — verificar si cambió en 2026

  // ------------------------------------------------------------------
  // INGRESOS: recaudación tributaria del Gobierno Central, año 2025
  // ------------------------------------------------------------------
  ingresos: {
    anio: 2025,
    totalNeto: 175156,
    totalEstado: "oficial",
    totalFuente: { nombre: "SUNAT vía El Peruano (ene. 2026)", url: "https://elperuano.pe/noticia/287080-recaudacion-sumo-s-175156-millones-y-crecio-108-en-2025" },
    crecimiento: 10.8,
    rubros: [
      { nombre: "IGV (impuesto a las compras)", monto: 94447, estado: "oficial",
        explica: "El 18% que pagas al comprar casi cualquier producto o servicio (16% IGV + 2% municipal).",
        fuente: { nombre: "SUNAT, nota de prensa dic. 2025", url: "https://www.sunat.gob.pe/salaprensa/2025/diciembre/NotaPrensaN0852025.docx" } },
      { nombre: "Impuesto a la Renta", monto: 76000, estado: "estimado",
        explica: "Lo que pagan empresas y personas por sus ganancias y sueldos. En 2024 fueron S/ 65,731 millones.",
        fuente: { nombre: "Estimado a partir de SUNAT 2024 (S/ 65,731 M) y crecimiento 2025", url: "https://elperuano.pe/noticia/261640-sunat-la-recaudacion-tributaria-sumo-s-155756-millones-en-2024" } },
      { nombre: "ISC (selectivo al consumo)", monto: 9936, estado: "oficial",
        explica: "Impuesto extra a combustibles, cerveza, licores, cigarros, apuestas y otros.",
        fuente: { nombre: "SUNAT / El Peruano", url: "https://elperuano.pe/noticia/287080-recaudacion-sumo-s-175156-millones-y-crecio-108-en-2025" } },
      { nombre: "Aranceles (importaciones)", monto: 1700, estado: "estimado",
        explica: "Lo que se paga al traer productos del extranjero.",
        fuente: { nombre: "Estimado — verificar en Nota Tributaria SUNAT", url: "https://www.sunat.gob.pe/estadisticasestudios/" } },
      { nombre: "Otros (ITF, multas, fraccionamientos…)", monto: 16000, estado: "estimado",
        explica: "Impuesto a las transacciones financieras, multas, deudas fraccionadas, etc.",
        fuente: { nombre: "Estimado — verificar en Nota Tributaria SUNAT", url: "https://www.sunat.gob.pe/estadisticasestudios/" } }
    ],
    // Devoluciones = suma de rubros - total neto (se calcula sola en app.js)
  },

  // ------------------------------------------------------------------
  // GASTOS: Presupuesto Institucional de Apertura (PIA) 2026
  // Ley N.º 32513 — Ley de Presupuesto del Sector Público 2026
  // ------------------------------------------------------------------
  presupuesto: {
    anio: 2026,
    total: 257562,
    totalEstado: "oficial",
    totalFuente: { nombre: "MEF — Proyecto/Ley de Presupuesto 2026", url: "https://www.mef.gob.pe/guia-presupuesto-publico-2026/" },
    // Niveles de gobierno (porcentaje aproximado del total)
    niveles: [
      { nombre: "Gobierno Nacional (ministerios, Congreso, Poder Judicial…)", pct: 63.4 },
      { nombre: "Gobiernos Regionales", pct: 22.8 },
      { nombre: "Municipalidades", pct: 13.8 }
    ],
    nivelesFuente: { nombre: "La República, sobre la Ley 32513", url: "https://www.larepublica.co/globoeconomia/gobierno-oficializo-el-presupuesto-publico-de-us-76-598-millones-para-el-proximo-ano-4285002" },
    // Por FUNCIÓN: ¿en qué se gasta?
    funciones: [
      { nombre: "Educación", icono: "🎓", monto: 48708, estado: "oficial",
        explica: "Colegios, sueldos de docentes, universidades públicas, Beca 18, infraestructura educativa.",
        fuente: { nombre: "PUCP — análisis de la Ley de Presupuesto 2026", url: "https://gobierno.pucp.edu.pe/wp-content/uploads/2026/02/el-presupuesto-2026-como-instrumento-de-politica-publica.pdf" } },
      { nombre: "Salud", icono: "🏥", monto: 33033, estado: "oficial",
        explica: "Hospitales, postas, médicos y enfermeras, SIS, vacunas, medicinas.",
        fuente: { nombre: "MEF / Andina (proyecto de ley)", url: "https://andina.pe/agencia/noticia-mef-seguridad-ciudadana-salud-educacion-son-prioridades-presupuesto-2026-1043615.aspx" } },
      { nombre: "Planeamiento, gestión y reserva", icono: "🗂️", monto: 31000, estado: "estimado",
        explica: "Administración del Estado, sistemas, reserva de contingencia para emergencias.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Transporte", icono: "🛣️", monto: 22500, estado: "estimado",
        explica: "Carreteras, puentes, Metro de Lima, aeropuertos regionales, caminos vecinales.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Deuda pública", icono: "🏦", monto: 22000, estado: "estimado",
        explica: "Pago de intereses y capital de préstamos y bonos que el Estado tomó antes.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Previsión social (pensiones)", icono: "👴", monto: 17500, estado: "estimado",
        explica: "Pensiones de la ONP, cédula viva y jubilados del Estado.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Orden público y seguridad", icono: "🚓", monto: 15500, estado: "estimado",
        explica: "Policía Nacional, patrullaje, serenazgo, prevención del delito.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Protección social", icono: "🤝", monto: 8000, estado: "estimado",
        explica: "Programas como Juntos, Pensión 65, Qali Warma/Wasi Mikuna, Cuna Más.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Agropecuaria", icono: "🌾", monto: 7000, estado: "estimado",
        explica: "Riego, apoyo a agricultores, sanidad agraria.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Justicia", icono: "⚖️", monto: 6500, estado: "estimado",
        explica: "Poder Judicial, Ministerio Público, cárceles (INPE).",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Saneamiento (agua y desagüe)", icono: "🚰", monto: 6000, estado: "estimado",
        explica: "Agua potable, alcantarillado y tratamiento de aguas.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Defensa", icono: "🛡️", monto: 6000, estado: "estimado",
        explica: "Fuerzas Armadas: Ejército, Marina y Fuerza Aérea.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } },
      { nombre: "Vivienda y desarrollo urbano", icono: "🏘️", monto: 5500, estado: "estimado",
        explica: "Techo Propio, Mivivienda, pistas y veredas, ordenamiento urbano.",
        fuente: { nombre: "Estimado — verificar en Consulta Amigable", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx" } }
      // "Otras funciones" se calcula sola: total - suma de las de arriba
    ]
  },

  // ------------------------------------------------------------------
  // SUELDOS: remuneración mensual bruta por CARGO (S/)
  // ------------------------------------------------------------------
  sueldos: [
    { cargo: "Presidente(a) de la República", entidad: "Poder Ejecutivo", grupo: "Alta dirección",
      monto: 35568, estado: "oficial",
      nota: "Subió de S/ 16,000 a S/ 35,568 en julio de 2025.",
      fuente: { nombre: "D.S. N.º 136-2025-EF", url: "https://lpderecho.pe/aumento-sueldo-dina-boluarte-decreto-supremo-136-2025-ef/" } },
    { cargo: "Ministro(a) de Estado", entidad: "Poder Ejecutivo", grupo: "Alta dirección",
      monto: 30000, estado: "oficial",
      nota: "Monto reportado en 2025.",
      fuente: { nombre: "Bloomberg Línea (2025)", url: "https://www.bloomberglinea.com/latinoamerica/peru/cual-sera-el-sueldo-de-dina-boluarte-tras-un-polemico-aumento-del-122/" } },
    { cargo: "Viceministro(a)", entidad: "Poder Ejecutivo", grupo: "Alta dirección",
      monto: 28000, estado: "oficial",
      nota: "Monto reportado en 2025.",
      fuente: { nombre: "Bloomberg Línea (2025)", url: "https://www.bloomberglinea.com/latinoamerica/peru/cual-sera-el-sueldo-de-dina-boluarte-tras-un-polemico-aumento-del-122/" } },
    { cargo: "Congresista (periodo 2021–2026)", entidad: "Congreso de la República", grupo: "Congreso",
      monto: 15600, estado: "oficial",
      nota: "Además recibía S/ 11,000 al mes de “asignación por función congresal” (no cuenta como sueldo). Total aprox. S/ 26,600.",
      fuente: { nombre: "Gestión / Congreso (2025)", url: "https://gestion.pe/peru/politica/legisladores-recibiran-en-diciembre-s46900-entre-sueldo-bono-y-aguinaldo-noticia/" } },
    { cargo: "Senador(a) / Diputado(a) (desde julio 2026)", entidad: "Congreso bicameral", grupo: "Congreso",
      monto: 15600, estado: "estimado",
      nota: "Se toma como referencia el sueldo del Congreso anterior. Verificar el monto aprobado para el nuevo Congreso bicameral.",
      fuente: { nombre: "Portal de Transparencia del Congreso", url: "https://www.congreso.gob.pe/transparencia/" } },
    { cargo: "Docente nombrado – 1.ª escala (30 h)", entidad: "Ministerio de Educación", grupo: "Servidores públicos",
      monto: 3000, estado: "estimado",
      nota: "Remuneración Íntegra Mensual referencial de la Carrera Pública Magisterial. Verificar monto vigente.",
      fuente: { nombre: "Minedu — Carrera Pública Magisterial", url: "https://www.gob.pe/minedu" } },
    { cargo: "Remuneración Mínima Vital (sueldo mínimo)", entidad: "Referencia nacional", grupo: "Referencia",
      monto: 1130, estado: "oficial",
      nota: "Vigente desde enero de 2025. Sirve para comparar.",
      fuente: { nombre: "D.S. N.º 006-2024-TR", url: "https://www.gob.pe/institucion/mtpe" } }
  ],

  // Dónde buscar el sueldo de UNA PERSONA en particular (datos oficiales)
  buscadoresOficiales: [
    { nombre: "Portal de Transparencia Estándar (PTE)", url: "https://www.transparencia.gob.pe/",
      que: "Cada entidad pública publica su planilla: nombre, cargo y sueldo de cada trabajador (Ley 27806)." },
    { nombre: "Plataforma Nacional de Datos Abiertos", url: "https://www.datosabiertos.gob.pe/",
      que: "Planillas y presupuestos descargables en Excel/CSV." },
    { nombre: "Consulta Amigable del MEF", url: "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx",
      que: "Cuánto tiene y cuánto ha gastado cada ministerio, región y municipalidad, actualizado a diario." },
    { nombre: "Declaraciones juradas — Contraloría", url: "https://appdji.contraloria.gob.pe/djic/",
      que: "Ingresos, bienes y rentas declarados por altos funcionarios." },
    { nombre: "Contrataciones del Estado (SEACE / OECE)", url: "https://prodapp2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorPublico.xhtml",
      que: "Qué compra el Estado, a quién y por cuánto." }
  ]
};
