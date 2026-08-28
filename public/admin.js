let reports = [];
let filteredReports = [];
let currentReport = null;
let selectedReports = new Set();

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const userEmail = document.getElementById("userEmail");
const msg = document.getElementById("msg");
const rows = document.getElementById("rows");

const search = document.getElementById("search");
const severity = document.getElementById("severity");
const statusFilter = document.getElementById("statusFilter");
const causalityFilter = document.getElementById("causalityFilter");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");

const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editFields = document.getElementById("editFields");
const editMsg = document.getElementById("editMsg");

const selectAll = document.getElementById("selectAll");
const selectedCount = document.getElementById("selectedCount");

const sb = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


// =====================================================
// ESCAPAR HTML
// =====================================================

function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c])
  );

}


// =====================================================
// FORMATEAR VALORES
// =====================================================

function formatValue(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.join(" | ");
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}


// =====================================================
// NOMBRE DE CAMPO
// =====================================================

function humanizeField(key) {

  const names = {

    folio: "Folio",
    created_at: "Fecha de registro",

    notif_cdfv: "Número de notificación CDFV / UMAE",
    notif_cicfv: "Número de notificación CICFV",
    notif_cnfv: "Número de notificación CNFV",

    fecha_notificacion: "Fecha de notificación",
    fecha_captura: "Fecha de captura",
    tipo_notificacion: "Tipo de notificación",

    unidad_notifica: "Unidad que notifica",
    servicio: "Servicio",
    direccion_unidad: "Dirección de la unidad notificadora",

    iniciales: "Iniciales del paciente",
    nombre_paciente: "Nombre del paciente",
    nss: "Número de Seguridad Social",
    fecha_nacimiento: "Fecha de nacimiento",
    edad: "Edad del paciente",
    sexo: "Sexo",
    peso: "Peso (kg)",
    estatura: "Estatura (cm)",
    grupo_etario: "Grupo etario",

    embarazada: "¿La paciente está embarazada?",
    semanas_gestacion: "Semanas de gestación",
    lactando: "¿La paciente está lactando?",
    fum: "Fecha de última menstruación",

    profesion_notificador: "Profesión",
    titulo_notificador: "Título / especialidad",
    nombre_notificador: "Nombre y apellidos",
    correo_notificador: "Correo electrónico",
    telefono_notificador: "Teléfono",

    sram_notificada: "Descripción de la SRAM",
    inicio_padecimiento: "Fecha de inicio de la SRAM",
    fecha_inicio_sram: "Fecha de inicio de la SRAM",
    termino_padecimiento: "Fecha de término de la SRAM",
    edad_inicio_sram: "Edad al inicio de la SRAM",
    unidad_tiempo: "Unidad de tiempo",
    sram_previa: "¿Había presentado una reacción similar?",
    historia_previa: "Historia clínica y tratamiento previo",
    historia_clinica: "Padecimientos relevantes",
    evolucion_sram: "Evolución de la reacción",
    atencion_adicional: "¿Requirió atención médica adicional?",
    intervencion: "Intervención realizada",

    med_generico: "Nombre genérico",
    med_comercial: "Nombre comercial",
    laboratorio: "Laboratorio / fabricante",
    lote: "Número de lote",
    concentracion: "Concentración",
    forma_farmaceutica: "Forma farmacéutica",
    dosis: "Dosis",
    unidad_dosis: "Unidad de dosis",
    frecuencia: "Frecuencia",
    via: "Vía",
    indicacion: "Indicación terapéutica",
    med_inicio: "Fecha de inicio del medicamento",
    med_termino: "Fecha de término del medicamento",
    caducidad: "Fecha de caducidad",
    accion_tomada: "Acción tomada",
    resultado_suspension: "Resultado al suspender",
    reexpuesto: "¿Fue reexpuesto?",
    reaccion_reexposicion: "¿La reacción volvió a presentarse?",

    intensidad: "Intensidad",
    gravedad: "Gravedad",
    criterio_gravedad: "Criterio(s) de gravedad",
    consecuencia: "Consecuencia de la reacción",

    uso_concomitantes: "¿Utilizaba otros medicamentos?",
    concomitantes: "Medicamentos concomitantes",

    estudios_realizados: "¿Se realizaron estudios?",
    fecha_estudio: "Fecha del estudio",
    resultado_estudio: "Resultado",
    unidad_estudio: "Unidad",
    estudios: "Estudios y resultados",
    valores_normales: "Valores normales",

    causalidad: "Evaluación de causalidad",
    naranjo: "Resultado del algoritmo de Naranjo",
    comentarios_causalidad: "Comentarios de causalidad",

    comentarios_finales: "Comentarios del médico / profesional",
    informacion_adicional: "Información adicional relevante",
    documentacion_adicional: "¿Existe documentación adicional?",
    descripcion_documentacion: "Descripción de documentación disponible",

    confirmacion: "Confirmación",

    estatus: "Estatus administrativo",
    observaciones_admin: "Observaciones administrativas",
    evaluacion_cdfv: "Evaluación CDFV",
    fecha_revision: "Fecha de revisión",
    revisado_por: "Revisado por",
    fecha_cierre: "Fecha de cierre",
    updated_at: "Última actualización"

  };

  if (names[key]) {
    return names[key];
  }

  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}


// =====================================================
// MOSTRAR LOGIN / ADMIN
// =====================================================

function showAdmin(user) {

  loginPanel.hidden = true;
  adminPanel.hidden = false;

  userEmail.textContent =
    user.email || "";

}


function showLogin() {

  loginPanel.hidden = false;
  adminPanel.hidden = true;

  rows.innerHTML = "";

}


// =====================================================
// SESIÓN
// =====================================================

async function checkSession() {

  const {
    data: { session }
  } = await sb.auth.getSession();

  if (session?.user) {

    showAdmin(session.user);

  } else {

    showLogin();

  }

}


// =====================================================
// LOGIN
// =====================================================

async function login(event) {

  event.preventDefault();

  loginMsg.textContent =
    "Iniciando sesión...";

  const email =
    document
      .getElementById("email")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  const {
    data,
    error
  } =
    await sb.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    console.error(error);

    loginMsg.textContent =
      "Correo o contraseña incorrectos.";

    return;

  }

  loginMsg.textContent = "";

  showAdmin(data.user);

}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function logout() {

  await sb.auth.signOut();

  reports = [];
  filteredReports = [];
  selectedReports.clear();

  rows.innerHTML = "";

  msg.textContent = "";

  closeReport();
  closeEdit();

  showLogin();

}


// =====================================================
// CARGAR REPORTES
// =====================================================

async function loadReports() {

  msg.textContent =
    "Cargando reportes...";

  const {
    data: { user }
  } =
    await sb.auth.getUser();

  if (!user) {

    showLogin();

    return;

  }

  const {
    data,
    error
  } =
    await sb
      .from("sram_reports")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    msg.textContent =
      "No autorizado o error de conexión.";

    return;

  }

  reports = data || [];

  reports.forEach(report => {

    if (!report.estatus) {
      report.estatus = "Nuevo";
    }

  });

  filteredReports = [...reports];

  selectedReports.clear();

  populateSeverity();
  renderStats();
  renderReports();

  msg.textContent =
    `${reports.length} reportes encontrados`;

}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function renderStats() {

  const total =
    reports.length;

  const nuevo =
    reports.filter(
      r => (r.estatus || "Nuevo") === "Nuevo"
    ).length;

  const revision =
    reports.filter(
      r => r.estatus === "En revisión"
    ).length;

  const evaluacion =
    reports.filter(
      r => r.estatus === "En evaluación"
    ).length;

  const cerrado =
    reports.filter(
      r => r.estatus === "Cerrado"
    ).length;

  const graves =
    reports.filter(
      r => String(r.gravedad || "")
        .toLowerCase() === "sí"
    ).length;

  document.getElementById("statTotal").textContent =
    total;

  document.getElementById("statNuevo").textContent =
    nuevo;

  document.getElementById("statRevision").textContent =
    revision;

  document.getElementById("statEvaluacion").textContent =
    evaluacion;

  document.getElementById("statCerrado").textContent =
    cerrado;

  document.getElementById("statGraves").textContent =
    graves;

}


// =====================================================
// OPCIONES DE GRAVEDAD
// =====================================================

function populateSeverity() {

  const values =
    [...new Set(
      reports
        .map(r => r.gravedad)
        .filter(Boolean)
    )]
    .sort();

  severity.innerHTML =
    `<option value="">Todas</option>`;

  values.forEach(value => {

    const option =
      document.createElement("option");

    option.value = value;
    option.textContent = value;

    severity.appendChild(option);

  });

}


// =====================================================
// FILTRAR
// =====================================================

function filterReports() {

  const text =
    search.value
      .trim()
      .toLowerCase();

  const sev =
    severity.value;

  const status =
    statusFilter.value;

  const causality =
    causalityFilter.value;

  const from =
    dateFrom.value;

  const to =
    dateTo.value;

  filteredReports =
    reports.filter(report => {

      const searchable = [

        report.folio,
        report.nombre_paciente,
        report.iniciales,
        report.med_generico

      ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

      if (
        text &&
        !searchable.includes(text)
      ) {
        return false;
      }

      if (
        sev &&
        String(report.gravedad ?? "") !== sev
      ) {
        return false;
      }

      const reportStatus =
        report.estatus || "Nuevo";

      if (
        status &&
        reportStatus !== status
      ) {
        return false;
      }

      if (
        causality &&
        String(report.causalidad ?? "") !== causality
      ) {
        return false;
      }

      const reportDate =
        String(report.created_at || "")
          .slice(0, 10);

      if (
        from &&
        reportDate < from
      ) {
        return false;
      }

      if (
        to &&
        reportDate > to
      ) {
        return false;
      }

      return true;

    });

  renderReports();

  msg.textContent =
    `${filteredReports.length} reportes encontrados`;

}


// =====================================================
// TABLA
// =====================================================

function renderReports() {

  rows.innerHTML =
    filteredReports.map(
      (r, index) => {

        const isSelected =
          selectedReports.has(r.folio);

        const status =
          r.estatus || "Nuevo";

        return `

        <tr>

          <td style="text-align:center;">

            <input
              type="checkbox"
              class="report-select"
              data-index="${index}"
              ${isSelected ? "checked" : ""}
            >

          </td>

          <td>
            ${esc(r.folio)}
          </td>

          <td>
            ${esc(r.created_at)}
          </td>

          <td>
            ${esc(r.unidad_notifica)}
          </td>

          <td>
            ${esc(r.iniciales)}
          </td>

          <td>
            ${esc(r.med_generico)}
          </td>

          <td>
            ${esc(r.sram_notificada)}
          </td>

          <td>
            ${esc(r.gravedad)}
          </td>

          <td>
            ${esc(status)}
          </td>

          <td style="white-space:nowrap;">

            <button
              class="secondary view-report"
              type="button"
              data-index="${index}"
            >
              👁️ Ver
            </button>

            <button
              class="secondary edit-report"
              type="button"
              data-index="${index}"
            >
              ✏️ Editar
            </button>

            <button
              class="secondary print-report"
              type="button"
              data-index="${index}"
            >
              🖨️ Imprimir
            </button>

          </td>

        </tr>

        `;

      }
    ).join("");


  document
    .querySelectorAll(".report-select")
    .forEach(button => {

      button.addEventListener(
        "change",
        () => {

          const report =
            filteredReports[
              Number(button.dataset.index)
            ];

          if (!report) return;

          if (button.checked) {

            selectedReports.add(
              report.folio
            );

          } else {

            selectedReports.delete(
              report.folio
            );

          }

          updateSelectionUI();

        }
      );

    });


  document
    .querySelectorAll(".view-report")
    .forEach(button => {

      button.onclick = () => {

        openReport(
          Number(button.dataset.index)
        );

      };

    });


  document
    .querySelectorAll(".edit-report")
    .forEach(button => {

      button.onclick = () => {

        editReport(
          Number(button.dataset.index)
        );

      };

    });


  document
    .querySelectorAll(".print-report")
    .forEach(button => {

      button.onclick = () => {

        printReport(
          Number(button.dataset.index)
        );

      };

    });


  updateSelectionUI();

}


// =====================================================
// SELECCIÓN
// =====================================================

function updateSelectionUI() {

  selectedCount.textContent =
    `${selectedReports.size} seleccionados`;

  const visibleFolios =
    filteredReports.map(
      r => r.folio
    );

  selectAll.checked =
    visibleFolios.length > 0 &&
    visibleFolios.every(
      folio =>
        selectedReports.has(folio)
    );

}


// =====================================================
// SELECCIONAR TODOS
// =====================================================

selectAll.addEventListener(
  "change",
  () => {

    if (selectAll.checked) {

      filteredReports.forEach(
        report => {
          selectedReports.add(
            report.folio
          );
        }
      );

    } else {

      filteredReports.forEach(
        report => {
          selectedReports.delete(
            report.folio
          );
        }
      );

    }

    renderReports();

  }
);


// =====================================================
// ABRIR REPORTE
// =====================================================

function openReport(index) {

  currentReport =
    filteredReports[index];

  if (!currentReport) return;

  detailContent.innerHTML = "";

  const table =
    document.createElement("table");

  table.style.width = "100%";

  const tbody =
    document.createElement("tbody");

  Object.entries(currentReport)
    .forEach(
      ([key, value]) => {

        const tr =
          document.createElement("tr");

        const th =
          document.createElement("th");

        const td =
          document.createElement("td");

        th.textContent =
          humanizeField(key);

        td.textContent =
          formatValue(value);

        th.style.textAlign =
          "left";

        th.style.verticalAlign =
          "top";

        th.style.padding =
          "10px";

        th.style.width =
          "32%";

        td.style.padding =
          "10px";

        td.style.whiteSpace =
          "pre-wrap";

        td.style.wordBreak =
          "break-word";

        tr.appendChild(th);
        tr.appendChild(td);

        tbody.appendChild(tr);

      }
    );

  table.appendChild(tbody);

  detailContent.appendChild(table);

  detailModal.hidden = false;

}


// =====================================================
// EDITAR REPORTE
// =====================================================

function editReport(index) {

  currentReport =
    filteredReports[index];

  if (!currentReport) return;

  buildEditForm();

  editMsg.textContent = "";

  editModal.hidden = false;

}


// =====================================================
// CONSTRUIR FORMULARIO DE EDICIÓN
// =====================================================

function buildEditForm() {

  editFields.innerHTML = "";

  if (!currentReport) return;

  const fields =
    Object.entries(currentReport);

  fields.forEach(
    ([key, value]) => {

      if (
        key === "created_at" ||
        key === "updated_at"
      ) {
        return;
      }

      const wrapper =
        document.createElement("div");

      const label =
        document.createElement("label");

      label.textContent =
        humanizeField(key);

      label.style.fontWeight =
        "bold";

      label.style.display =
        "block";

      label.style.marginBottom =
        "5px";

      let input;

      if (key === "estatus") {

        input =
          document.createElement("select");

        [
          "Nuevo",
          "En revisión",
          "En evaluación",
          "Cerrado"
        ].forEach(optionValue => {

          const option =
            document.createElement("option");

          option.value =
            optionValue;

          option.textContent =
            optionValue;

          input.appendChild(option);

        });

        input.value =
          value || "Nuevo";

      }

      else if (
        key === "confirmacion" ||
        key === "embarazada" ||
        key === "lactando" ||
        key === "reexpuesto"
      ) {

        input =
          document.createElement("input");

        input.type =
          "text";

        input.value =
          formatValue(value);

      }

      else if (
        Array.isArray(value)
      ) {

        input =
          document.createElement("textarea");

        input.value =
          value.join(" | ");

      }

      else if (
        key.includes("fecha") ||
        key === "fum" ||
        key === "med_inicio" ||
        key === "med_termino" ||
        key === "caducidad"
      ) {

        input =
          document.createElement("input");

        input.type =
          "date";

        input.value =
          value
            ? String(value).slice(0,10)
            : "";

      }

      else if (
        key.includes("comentarios") ||
        key.includes("observaciones") ||
        key.includes("historia") ||
        key.includes("evolucion") ||
        key.includes("intervencion") ||
        key.includes("consecuencia") ||
        key === "sram_notificada" ||
        key === "estudios" ||
        key === "concomitantes" ||
        key === "informacion_adicional" ||
        key === "descripcion_documentacion"
      ) {

        input =
          document.createElement("textarea");

        input.rows = 4;

        input.value =
          value ?? "";

      }

      else {

        input =
          document.createElement("input");

        input.type =
          "text";

        input.value =
          value ?? "";

      }

      input.dataset.field =
        key;

      input.style.width =
        "100%";

      wrapper.appendChild(label);
      wrapper.appendChild(input);

      editFields.appendChild(wrapper);

    }
  );

}


// =====================================================
// GUARDAR EDICIÓN
// =====================================================

editForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!currentReport) return;

    editMsg.textContent =
      "Guardando cambios...";

    const updates = {};

    editFields
      .querySelectorAll("[data-field]")
      .forEach(input => {

        const key =
          input.dataset.field;

        let value =
          input.value;

        if (
          input.type === "date" &&
          value === ""
        ) {
          value = null;
        }

        if (
          currentReport[key] !== value &&
          key !== "folio"
        ) {
          updates[key] = value;
        }

      });


    updates.updated_at =
      new Date().toISOString();


    if (
      updates.estatus === "Cerrado" &&
      !updates.fecha_cierre
    ) {

      updates.fecha_cierre =
        new Date().toISOString().slice(0,10);

    }


    const {
      data,
      error
    } =
      await sb
        .from("sram_reports")
        .update(updates)
        .eq(
          "folio",
          currentReport.folio
        )
        .select()
        .single();


    if (error) {

      console.error(error);

      editMsg.textContent =
        "No se pudieron guardar los cambios.";

      alert(
        "No se pudieron guardar los cambios.\n\n" +
        error.message
      );

      return;

    }


    const updated =
      data;


    const position =
      reports.findIndex(
        r => r.folio === updated.folio
      );

    if (position >= 0) {
      reports[position] =
        updated;
    }


    const filteredPosition =
      filteredReports.findIndex(
        r => r.folio === updated.folio
      );

    if (filteredPosition >= 0) {
      filteredReports[
        filteredPosition
      ] = updated;
    }


    currentReport =
      updated;


    renderStats();
    renderReports();

    editMsg.textContent =
      "Cambios guardados correctamente.";

    alert(
      "Los cambios se guardaron correctamente."
    );

    editModal.hidden = true;

    openReport(
      filteredPosition >= 0
        ? filteredPosition
        : 0
    );

  }
);


// =====================================================
// CERRAR EDICIÓN
// =====================================================

function closeEdit() {

  editModal.hidden = true;

  editFields.innerHTML = "";

  editMsg.textContent = "";

}


// =====================================================
// IMPRIMIR
// =====================================================

function printReport(index) {

  const report =
    filteredReports[index];

  if (!report) return;

  const rowsHtml =
    Object.entries(report)
      .map(
        ([key, value]) => `

        <tr>

          <th>
            ${esc(humanizeField(key))}
          </th>

          <td>
            ${esc(formatValue(value))}
          </td>

        </tr>

      `
      )
      .join("");


  const printWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=1000"
    );


  if (!printWindow) {

    alert(
      "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio."
    );

    return;

  }


  printWindow.document.write(`

    <!doctype html>

    <html lang="es">

    <head>

      <meta charset="utf-8">

      <title>
        Reporte SRAM ${esc(report.folio)}
      </title>

      <style>

        body {
          font-family:Arial,sans-serif;
          margin:40px;
          color:#222;
        }

        header {
          border-bottom:3px solid #176b4d;
          padding-bottom:15px;
          margin-bottom:25px;
        }

        h1 {
          color:#176b4d;
          margin:0 0 8px;
        }

        table {
          width:100%;
          border-collapse:collapse;
        }

        th,
        td {
          border:1px solid #ccc;
          padding:9px;
          vertical-align:top;
        }

        th {
          width:32%;
          text-align:left;
          background:#f1f5f3;
        }

        .footer {
          margin-top:30px;
          font-size:12px;
          color:#666;
        }

        @media print {

          body {
            margin:15mm;
          }

        }

      </style>

    </head>

    <body>

      <header>

        <h1>
          FARMACOVIGILANCIA
        </h1>

        <h2>
          UMAE Hospital de Pediatría
          del CMN Siglo XXI
        </h2>

        <p>
          Reporte de sospecha de reacción adversa a medicamentos (SRAM)
        </p>

        <p>
          <strong>Folio:</strong>
          ${esc(report.folio)}
        </p>

      </header>

      <table>

        <tbody>

          ${rowsHtml}

        </tbody>

      </table>

      <div class="footer">

        Reporte generado desde el
        sistema administrativo de Farmacovigilancia SRAM.

      </div>

    </body>

    </html>

  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(
    () => {
      printWindow.print();
    },
    300
  );

}


// =====================================================
// PDF INDIVIDUAL
// =====================================================

function exportPdfReport(report) {

  if (!report) return;

  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    alert(
      "La biblioteca PDF todavía no está disponible."
    );

    return;

  }

  const {
    jsPDF
  } = window.jspdf;

  const doc =
    new jsPDF();

  doc.setFontSize(16);

  doc.text(
    "FARMACOVIGILANCIA",
    14,
    18
  );

  doc.setFontSize(11);

  doc.text(
    "UMAE Hospital de Pediatría del CMN Siglo XXI",
    14,
    26
  );

  doc.text(
    "Reporte de sospecha de reacción adversa a medicamentos (SRAM)",
    14,
    34
  );

  const body =
    Object.entries(report)
      .map(
        ([key, value]) => [
          humanizeField(key),
          formatValue(value)
        ]
      );


  doc.autoTable({
    startY: 42,
    head: [
      ["Campo", "Información"]
    ],
    body: body,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak"
    },
    columnStyles: {
      0: {
        cellWidth: 55
      },
      1: {
        cellWidth: 125
      }
    }
  });


  doc.save(
    `SRAM-${report.folio}.pdf`
  );

}


// =====================================================
// PDF DETALLE
// =====================================================

function exportCurrentPdf() {

  if (!currentReport) return;

  exportPdfReport(
    currentReport
  );

}


// =====================================================
// PDF MÚLTIPLE
// =====================================================

function exportSelectedPdf() {

  const selected =
    reports.filter(
      report =>
        selectedReports.has(
          report.folio
        )
    );


  if (!selected.length) {

    alert(
      "Seleccione al menos un reporte."
    );

    return;

  }


  selected.forEach(
    (report, index) => {

      setTimeout(
        () => {
          exportPdfReport(report);
        },
        index * 700
      );

    }
  );

}


// =====================================================
// EXCEL INDIVIDUAL
// =====================================================

function exportExcelReport(report) {

  if (!report) return;

  if (
    typeof XLSX === "undefined"
  ) {

    alert(
      "La biblioteca de Excel todavía no está disponible."
    );

    return;

  }


  const data =
    Object.entries(report)
      .map(
        ([key, value]) => ({
          Campo:
            humanizeField(key),

          Información:
            formatValue(value)
        })
      );


  const ws =
    XLSX.utils.json_to_sheet(
      data
    );


  const wb =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Reporte SRAM"
  );


  XLSX.writeFile(
    wb,
    `SRAM-${report.folio}.xlsx`
  );

}


// =====================================================
// EXCEL MÚLTIPLE
// =====================================================

function exportSelectedExcel() {

  const selected =
    reports.filter(
      report =>
        selectedReports.has(
          report.folio
        )
    );


  if (!selected.length) {

    alert(
      "Seleccione al menos un reporte."
    );

    return;

  }


  exportReportsExcel(
    selected,
    "reportes_sram_seleccionados.xlsx"
  );

}


// =====================================================
// EXCEL DE TODOS LOS FILTRADOS
// =====================================================

function exportAllExcel() {

  if (!filteredReports.length) {

    alert(
      "No hay reportes para exportar."
    );

    return;

  }


  exportReportsExcel(
    filteredReports,
    "reportes_sram.xlsx"
  );

}


// =====================================================
// CREAR EXCEL
// =====================================================

function exportReportsExcel(
  reportList,
  filename
) {

  if (
    typeof XLSX === "undefined"
  ) {

    alert(
      "La biblioteca de Excel todavía no está disponible."
    );

    return;

  }


  const data =
    reportList.map(
      report => {

        const row = {};

        Object.entries(report)
          .forEach(
            ([key, value]) => {

              row[
                humanizeField(key)
              ] =
                formatValue(value);

            }
          );

        return row;

      }
    );


  const ws =
    XLSX.utils.json_to_sheet(
      data
    );


  const wb =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Reportes SRAM"
  );


  XLSX.writeFile(
    wb,
    filename
  );

}


// =====================================================
// CSV
// =====================================================

function csv() {

  if (!filteredReports.length) {

    alert(
      "No hay reportes para exportar."
    );

    return;

  }


  const keys =
    Object.keys(
      filteredReports[0]
    );


  const q =
    value =>
      `"${String(value ?? "")
        .replaceAll('"', '""')}"`;


  const text =
    keys.join(",") +
    "\n" +
    filteredReports
      .map(
        r =>
          keys
            .map(
              k =>
                q(
                  Array.isArray(r[k])
                    ? r[k].join(" | ")
                    : r[k]
                )
            )
            .join(",")
      )
      .join("\n");


  const blob =
    new Blob(
      ["\ufeff" + text],
      {
        type:
          "text/csv;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");


  a.href = url;

  a.download =
    "reportes_sram.csv";


  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

}


// =====================================================
// LIMPIAR FILTROS
// =====================================================

function clearFilters() {

  search.value = "";

  severity.value = "";

  statusFilter.value = "";

  causalityFilter.value = "";

  dateFrom.value = "";

  dateTo.value = "";

  filteredReports =
    [...reports];

  renderReports();

  msg.textContent =
    `${reports.length} reportes encontrados`;

}


// =====================================================
// CERRAR DETALLE
// =====================================================

function closeReport() {

  detailModal.hidden = true;

  detailContent.innerHTML = "";

  currentReport = null;

}


// =====================================================
// EVENTOS
// =====================================================

loginForm.addEventListener(
  "submit",
  login
);


document
  .getElementById("load")
  .onclick =
  loadReports;


document
  .getElementById("searchBtn")
  .onclick =
  filterReports;


document
  .getElementById("clearFilters")
  .onclick =
  clearFilters;


document
  .getElementById("csv")
  .onclick =
  csv;


document
  .getElementById("exportExcel")
  .onclick =
  exportAllExcel;


document
  .getElementById("exportSelectedExcel")
  .onclick =
  exportSelectedExcel;


document
  .getElementById("exportSelectedPdf")
  .onclick =
  exportSelectedPdf;


document
  .getElementById("logout")
  .onclick =
  logout;


document
  .getElementById("closeDetail")
  .onclick =
  closeReport;


document
  .getElementById("printDetail")
  .onclick =
  () => {

    if (!currentReport) return;

    const index =
      filteredReports.indexOf(
        currentReport
      );

    if (index >= 0) {
      printReport(index);
    }

  };


document
  .getElementById("pdfDetail")
  .onclick =
  exportCurrentPdf;


document
  .getElementById("excelDetail")
  .onclick =
  () => {

    if (!currentReport) return;

    exportExcelReport(
      currentReport
    );

  };


document
  .getElementById("editDetail")
  .onclick =
  () => {

    if (!currentReport) return;

    const index =
      filteredReports.indexOf(
        currentReport
      );

    if (index >= 0) {
      editReport(index);
    }

  };


document
  .getElementById("closeEdit")
  .onclick =
  closeEdit;


document
  .getElementById("cancelEdit")
  .onclick =
  closeEdit;


// =====================================================
// INICIO
// =====================================================

checkSession();
