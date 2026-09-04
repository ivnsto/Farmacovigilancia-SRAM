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
// SOLO CAMPOS ADMINISTRATIVOS + PRE-EVALUACIÓN NARANJO
// =====================================================

function buildEditForm() {

  editFields.innerHTML = "";

  if (!currentReport) return;


  // ===================================================
  // CAMPOS DEL APARTADO 1 QUE PUEDE EDITAR EL ADMIN
  // ===================================================

  const adminFields = [
    {
      key: "notif_cdfv",
      label: "No. de Notificación CDFV / UMAE",
      type: "text"
    },

    {
      key: "notif_cicfv",
      label: "No. de Notificación CICFV",
      type: "text"
    },

    {
      key: "notif_cnfv",
      label: "No. de Notificación CNFV",
      type: "text"
    },

    {
      key: "fecha_captura",
      label: "Fecha de captura",
      type: "date"
    }
  ];


  // ===================================================
  // CREAR CAMPOS ADMINISTRATIVOS
  // ===================================================

  adminFields.forEach(field => {

    const wrapper =
      document.createElement("div");

    const label =
      document.createElement("label");

    label.textContent =
      field.label;

    label.style.fontWeight =
      "bold";

    label.style.display =
      "block";

    label.style.marginBottom =
      "5px";


    const input =
      document.createElement("input");

    input.dataset.field =
      field.key;

    input.type =
      field.type;

    input.style.width =
      "100%";

    input.style.boxSizing =
      "border-box";


    if (field.type === "date") {

      input.value =
        currentReport[field.key]
          ? String(currentReport[field.key]).slice(0, 10)
          : "";

    } else {

      input.value =
        currentReport[field.key] ?? "";

    }


    wrapper.appendChild(label);
    wrapper.appendChild(input);

    editFields.appendChild(wrapper);

  });


  // ===================================================
  // TÍTULO APARTADO 9
  // ===================================================

  const sectionTitle =
    document.createElement("div");

  sectionTitle.style.gridColumn =
    "1 / -1";

  sectionTitle.style.marginTop =
    "20px";

  sectionTitle.style.padding =
    "12px";

  sectionTitle.style.background =
    "#d9d9d9";

  sectionTitle.style.border =
    "2px solid #222";

  sectionTitle.innerHTML = `
    <strong>
      9. PRE-EVALUACIÓN DE CAUSALIDAD
    </strong>
    <br>
    <small>
      Esta sección la realiza el CDFV o la UHFV en UMAE.
    </small>
  `;

  editFields.appendChild(sectionTitle);


  // ===================================================
  // PREGUNTAS DEL ALGORITMO DE NARANJO
  // ===================================================

  const naranjoQuestions = [

    {
      number: 1,
      text:
        "¿Existen informes previos concluyentes acerca de esta reacción?"
    },

    {
      number: 2,
      text:
        "¿La reacción adversa apareció después de administrar el medicamento sospechoso?"
    },

    {
      number: 3,
      text:
        "¿La reacción adversa mejoró al suspender o administrar un antagonista específico?"
    },

    {
      number: 4,
      text:
        "¿La reacción adversa reapareció al readministrar el medicamento?"
    },

    {
      number: 5,
      text:
        "¿Existen causas alternativas que pudieran por sí mismas haber causado la reacción?"
    },

    {
      number: 6,
      text:
        "¿La reacción reapareció al administrar placebo?"
    },

    {
      number: 7,
      text:
        "¿Se detectó el medicamento en líquidos biológicos en concentraciones tóxicas?"
    },

    {
      number: 8,
      text:
        "¿La reacción fue más grave al aumentar la dosis o menos grave al disminuirla?"
    },

    {
      number: 9,
      text:
        "¿El paciente tuvo una reacción similar al mismo medicamento o a medicamentos similares en alguna exposición anterior?"
    },

    {
      number: 10,
      text:
        "¿La reacción adversa se confirmó mediante alguna evidencia objetiva?"
    }

  ];


  // ===================================================
  // VALORES DEL ALGORITMO
  // ===================================================

  const naranjoOptions = [

    {
      text: "Sí (+1)",
      value: "1",
      score: 1
    },

    {
      text: "Sí (+2)",
      value: "2",
      score: 2
    },

    {
      text: "No (-1)",
      value: "-1",
      score: -1
    },

    {
      text: "No (0)",
      value: "0",
      score: 0
    },

    {
      text: "No se sabe / No aplica (0)",
      value: "0",
      score: 0
    }

  ];


  // ===================================================
  // RECUPERAR NARANJO EXISTENTE
  // ===================================================

  let naranjoData = null;

  try {

    if (currentReport.naranjo) {

      naranjoData =
        JSON.parse(
          currentReport.naranjo
        );

    }

  } catch (error) {

    console.warn(
      "El campo naranjo existente no está en formato JSON.",
      error
    );

  }


  const answers =
    naranjoData?.answers || [];


  // ===================================================
  // CREAR LAS 10 PREGUNTAS
  // ===================================================

  naranjoQuestions.forEach(
    question => {

      const wrapper =
        document.createElement("div");

      wrapper.style.gridColumn =
        "1 / -1";

      wrapper.style.padding =
        "10px";

      wrapper.style.border =
        "1px solid #ccc";

      wrapper.style.borderRadius =
        "6px";


      const label =
        document.createElement("label");

      label.textContent =
        `${question.number}. ${question.text}`;

      label.style.fontWeight =
        "bold";

      label.style.display =
        "block";

      label.style.marginBottom =
        "6px";


      const select =
        document.createElement("select");

      select.dataset.naranjo =
        String(question.number);

      select.style.width =
        "100%";

      select.style.padding =
        "8px";


      const empty =
        document.createElement("option");

      empty.value =
        "";

      empty.textContent =
        "Seleccione una opción";

      select.appendChild(empty);


      // Opciones específicas según la pregunta
      // para respetar la puntuación del algoritmo de Naranjo

      let options = [];


      if (
        question.number === 2 ||
        question.number === 4
      ) {

        options = [
          {
            text: "Sí (+2)",
            value: "2",
            score: 2
          },
          {
            text: "No (-1)",
            value: "-1",
            score: -1
          },
          {
            text: "No se sabe (0)",
            value: "0",
            score: 0
          }
        ];

      }

      else if (
        question.number === 5
      ) {

        options = [
          {
            text: "No (+2)",
            value: "2",
            score: 2
          },
          {
            text: "Sí (-1)",
            value: "-1",
            score: -1
          },
          {
            text: "No se sabe (0)",
            value: "0",
            score: 0
          }
        ];

      }

      else if (
        question.number === 6
      ) {

        options = [
          {
            text: "No (+1)",
            value: "1",
            score: 1
          },
          {
            text: "Sí (0)",
            value: "0",
            score: 0
          },
          {
            text: "No se sabe (0)",
            value: "0",
            score: 0
          }
        ];

      }

      else {

        options = [
          {
            text: "Sí (+1)",
            value: "1",
            score: 1
          },
          {
            text: "No (0)",
            value: "0",
            score: 0
          },
          {
            text: "No se sabe (0)",
            value: "0",
            score: 0
          }
        ];

      }


      options.forEach(
        optionData => {

          const option =
            document.createElement("option");

          option.value =
            optionData.value;

          option.textContent =
            optionData.text;

          option.dataset.score =
            optionData.score;

          select.appendChild(option);

        }
      );


      // Recuperar respuesta guardada

      const saved =
        answers.find(
          item =>
            Number(item.question) ===
            question.number
        );


      if (saved) {

        select.value =
          String(saved.value);

      }


      wrapper.appendChild(label);
      wrapper.appendChild(select);

      editFields.appendChild(wrapper);

    }
  );


  // ===================================================
  // TOTAL
  // ===================================================

  const totalWrapper =
    document.createElement("div");

  totalWrapper.style.padding =
    "12px";

  totalWrapper.style.background =
    "#f1f5f3";

  totalWrapper.style.border =
    "2px solid #176b4d";


  const totalLabel =
    document.createElement("strong");

  totalLabel.textContent =
    "TOTAL: ";


  const totalInput =
    document.createElement("input");

  totalInput.type =
    "text";

  totalInput.id =
    "naranjoTotal";

  totalInput.readOnly =
    true;

  totalInput.style.width =
    "100px";

  totalInput.style.fontWeight =
    "bold";

  totalInput.style.marginLeft =
    "10px";


  totalInput.value =
    naranjoData?.total ??
    "0";


  totalWrapper.appendChild(totalLabel);
  totalWrapper.appendChild(totalInput);

  editFields.appendChild(totalWrapper);


  // ===================================================
  // RESULTADO
  // ===================================================

  const resultWrapper =
    document.createElement("div");

  resultWrapper.style.padding =
    "12px";


  const resultLabel =
    document.createElement("label");

  resultLabel.textContent =
    "RESULTADO";

  resultLabel.style.fontWeight =
    "bold";

  resultLabel.style.display =
    "block";

  resultLabel.style.marginBottom =
    "5px";


  const resultSelect =
    document.createElement("select");

  resultSelect.id =
    "naranjoResult";

  resultSelect.dataset.field =
    "causalidad";

  resultSelect.style.width =
    "100%";


  const results = [
    "DEFINIDA",
    "PROBABLE",
    "POSIBLE",
    "DUDOSA",
    "NO EVALUABLE"
  ];


  results.forEach(result => {

    const option =
      document.createElement("option");

    option.value =
      result;

    option.textContent =
      result;

    resultSelect.appendChild(option);

  });


  const existingResult =
    currentReport.causalidad ||
    naranjoData?.result ||
    "DUDOSA";


  resultSelect.value =
    String(existingResult).toUpperCase();


  resultWrapper.appendChild(resultLabel);
  resultWrapper.appendChild(resultSelect);

  editFields.appendChild(resultWrapper);


  // ===================================================
  // CALCULAR TOTAL AUTOMÁTICAMENTE
  // ===================================================

  function calculateNaranjoTotal() {

    let total = 0;


    editFields
      .querySelectorAll(
        "[data-naranjo]"
      )
      .forEach(select => {

        const selected =
          select.options[
            select.selectedIndex
          ];

        if (!selected) return;

        const score =
          Number(
            selected.dataset.score
          );

        if (!Number.isNaN(score)) {

          total += score;

        }

      });


    totalInput.value =
      total;

  }


  editFields
    .querySelectorAll(
      "[data-naranjo]"
    )
    .forEach(select => {

      select.addEventListener(
        "change",
        calculateNaranjoTotal
      );

    });


  calculateNaranjoTotal();

}

// =====================================================
// GUARDAR EDICIÓN
// SOLO CAMPOS ADMINISTRATIVOS + NARANJO
// =====================================================

editForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!currentReport) return;


    editMsg.textContent =
      "Guardando cambios...";


    const updates = {};


    // =================================================
    // CAMPOS QUE EL ADMINISTRADOR PUEDE MODIFICAR
    // =================================================

    const allowedFields = [
      "notif_cdfv",
      "notif_cicfv",
      "notif_cnfv",
      "fecha_captura"
    ];


    allowedFields.forEach(key => {

      const input =
        editFields.querySelector(
          `[data-field="${key}"]`
        );

      if (!input) return;

      let value =
        input.value;

      if (
        input.type === "date" &&
        value === ""
      ) {

        value = null;

      }


      const oldValue =
        currentReport[key]
          ? String(currentReport[key]).slice(0, 10)
          : null;


      if (
        value !== oldValue
      ) {

        updates[key] =
          value;

      }

    });


    // =================================================
    // RECOPILAR LAS 10 RESPUESTAS DE NARANJO
    // =================================================

    const naranjoAnswers = [];


    editFields
      .querySelectorAll(
        "[data-naranjo]"
      )
      .forEach(select => {

        const question =
          Number(
            select.dataset.naranjo
          );

        const selected =
          select.options[
            select.selectedIndex
          ];


        if (
          !selected ||
          select.value === ""
        ) {

          return;

        }


        naranjoAnswers.push({

          question:
            question,

          value:
            Number(select.value),

          score:
            Number(
              selected.dataset.score
            )

        });

      });


    const naranjoTotal =
      Number(
        document.getElementById(
          "naranjoTotal"
        ).value || 0
      );


    const naranjoResult =
      document.getElementById(
        "naranjoResult"
      ).value;


    // =================================================
    // GUARDAR NARANJO COMO JSON
    // =================================================

    const naranjoObject = {

      answers:
        naranjoAnswers,

      total:
        naranjoTotal,

      result:
        naranjoResult

    };


    updates.naranjo =
      JSON.stringify(
        naranjoObject
      );


    updates.causalidad =
      naranjoResult;


    // =================================================
    // ACTUALIZACIÓN
    // =================================================

    updates.updated_at =
      new Date().toISOString();


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


    // =================================================
    // ACTUALIZAR INFORMACIÓN LOCAL
    // =================================================

    const updated =
      data;


    const position =
      reports.findIndex(
        r =>
          r.folio ===
          updated.folio
      );


    if (position >= 0) {

      reports[position] =
        updated;

    }


    const filteredPosition =
      filteredReports.findIndex(
        r =>
          r.folio ===
          updated.folio
      );


    if (filteredPosition >= 0) {

      filteredReports[
        filteredPosition
      ] =
        updated;

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


    editModal.hidden =
      true;


    if (
      filteredPosition >= 0
    ) {

      openReport(
        filteredPosition
      );

    }

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
// IMPRIMIR REPORTE CON ENCABEZADO INSTITUCIONAL
// =====================================================

function printReport(index) {

  const report =
    filteredReports[index];

  if (!report) return;


  // ===================================================
  // CONSTRUIR TABLA DEL REPORTE
  // ===================================================

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


  // ===================================================
  // ABRIR VENTANA DE IMPRESIÓN
  // ===================================================

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


  // ===================================================
  // DOCUMENTO DE IMPRESIÓN
  // ===================================================

  printWindow.document.write(`

    <!doctype html>

    <html lang="es">

    <head>

      <meta charset="utf-8">

      <title>
        Reporte SRAM ${esc(report.folio)}
      </title>


      <style>

        * {
          box-sizing:border-box;
        }


        body {

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          margin:30px;

          color:#222;

          background:#fff;

        }


        /* ============================================
           ENCABEZADO INSTITUCIONAL
           ============================================ */

        .institutional-header {

          display:flex;

          align-items:center;

          justify-content:space-between;

          gap:25px;

          padding:0 0 18px 0;

          margin-bottom:20px;

          border-bottom:3px solid #176b4d;

        }


        .institutional-title {

          flex:1;

          text-align:center;

          line-height:1.2;

        }


        .imss-name {

          font-size:22px;

          font-weight:800;

          margin-bottom:6px;

        }


        .pharmacovigilance-name {

          font-size:17px;

          font-weight:800;

          margin-bottom:12px;

        }


        .form-title {

          font-size:15px;

          font-weight:700;

        }


        .imss-logo-container {

          flex:0 0 100px;

          display:flex;

          justify-content:center;

          align-items:center;

        }


        .imss-logo {

          display:block;

          width:90px;

          height:auto;

          max-height:110px;

          object-fit:contain;

        }


        /* ============================================
           DATOS DEL REPORTE
           ============================================ */

        .report-identification {

          margin-bottom:20px;

          padding:12px;

          border:1px solid #ccc;

          background:#f5f5f5;

        }


        .report-identification p {

          margin:4px 0;

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

          font-weight:700;

        }


        td {

          white-space:pre-wrap;

          word-break:break-word;

        }


        .footer {

          margin-top:30px;

          padding-top:10px;

          border-top:1px solid #ccc;

          font-size:11px;

          color:#666;

          text-align:center;

        }


        @media print {

          body {

            margin:15mm;

          }


          .institutional-header {

            break-inside:avoid;

          }


          table {

            page-break-inside:auto;

          }


          tr {

            page-break-inside:avoid;

            page-break-after:auto;

          }

        }


        @media (max-width:700px) {

          .institutional-header {

            flex-direction:column;

            text-align:center;

          }


          .institutional-title {

            order:2;

          }


          .imss-logo-container {

            order:1;

          }

        }

      </style>

    </head>


    <body>


      <!-- ================================================= -->
      <!-- ENCABEZADO INSTITUCIONAL -->
      <!-- ================================================= -->

      <div class="institutional-header">


        <div class="institutional-title">

          <div class="imss-name">

            INSTITUTO MEXICANO DEL SEGURO SOCIAL

          </div>


          <div class="pharmacovigilance-name">

            CENTRO INSTITUCIONAL COORDINADOR DE FARMACOVIGILANCIA

          </div>


          <div class="form-title">

            AVISO DE SOSPECHAS DE REACCIONES ADVERSAS DE MEDICAMENTOS

          </div>

        </div>


        <div class="imss-logo-container">

          <img
            src="imss-logo.png"
            alt="Instituto Mexicano del Seguro Social"
            class="imss-logo"
          >

        </div>


      </div>


      <!-- ================================================= -->
      <!-- IDENTIFICACIÓN DEL REPORTE -->
      <!-- ================================================= -->

      <div class="report-identification">

        <p>

          <strong>Folio:</strong>

          ${esc(report.folio)}

        </p>


        <p>

          <strong>Fecha de notificación:</strong>

          ${esc(
            formatValue(
              report.fecha_notificacion ||
              report.created_at
            )
          )}

        </p>

      </div>


      <!-- ================================================= -->
      <!-- INFORMACIÓN DEL REPORTE -->
      <!-- ================================================= -->

      <table>

        <tbody>

          ${rowsHtml}

        </tbody>

      </table>


      <!-- ================================================= -->
      <!-- PIE -->
      <!-- ================================================= -->

      <div class="footer">

        Reporte generado desde el sistema administrativo
        de Farmacovigilancia SRAM.

      </div>


    </body>

    </html>

  `);


  printWindow.document.close();


  // ===================================================
  // ESPERAR A QUE CARGUE EL LOGO
  // ===================================================

  const logo =
    printWindow.document.querySelector(
      ".imss-logo"
    );


  if (logo) {

    logo.onload = () => {

      printWindow.focus();

      printWindow.print();

    };


    logo.onerror = () => {

      console.warn(
        "No se pudo cargar el logotipo IMSS."
      );

      printWindow.focus();

      printWindow.print();

    };

  } else {

    printWindow.focus();

    setTimeout(
      () => {
        printWindow.print();
      },
      500
    );

  }

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
// GENERAR PDF DEL REPORTE
// =====================================================

function exportPdfReport(report) {

  if (!report) return;

  const rowsHtml =
    Object.entries(report)
      .map(([key, value]) => `
        <tr>
          <th>
            ${esc(humanizeField(key))}
          </th>

          <td>
            ${esc(formatValue(value))}
          </td>
        </tr>
      `)
      .join("");

  const pdfWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=1000"
    );

  if (!pdfWindow) {

    alert(
      "El navegador bloqueó la ventana. Permite ventanas emergentes para este sitio."
    );

    return;
  }

  pdfWindow.document.write(`

    <!doctype html>

    <html lang="es">

    <head>

      <meta charset="utf-8">

      <title>
        Reporte SRAM ${esc(report.folio)}
      </title>

      <style>

        * {
          box-sizing: border-box;
        }

        body {

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          margin: 30px;

          color: #222;

          background: white;

        }

        .header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          border-bottom: 3px solid #176b4d;

          padding-bottom: 15px;

          margin-bottom: 20px;

        }

        .header-text {

          flex: 1;

          text-align: center;

        }

        .imss {

          font-size: 21px;

          font-weight: bold;

          margin-bottom: 7px;

        }

        .cdfv {

          font-size: 16px;

          font-weight: bold;

          margin-bottom: 10px;

        }

        .title {

          font-size: 14px;

          font-weight: bold;

        }

        .logo {

          width: 90px;

          height: auto;

          object-fit: contain;

        }

        .identificacion {

          background: #f5f5f5;

          border: 1px solid #ccc;

          padding: 12px;

          margin-bottom: 20px;

        }

        .identificacion p {

          margin: 4px 0;

        }

        table {

          width: 100%;

          border-collapse: collapse;

        }

        th,
        td {

          border: 1px solid #ccc;

          padding: 9px;

          vertical-align: top;

        }

        th {

          width: 32%;

          text-align: left;

          background: #f1f5f3;

        }

        td {

          white-space: pre-wrap;

          word-break: break-word;

        }

        .footer {

          margin-top: 30px;

          padding-top: 10px;

          border-top: 1px solid #ccc;

          text-align: center;

          font-size: 10px;

          color: #666;

        }

        @media print {

          body {

            margin: 15mm;

          }

          .header {

            break-inside: avoid;

          }

          tr {

            page-break-inside: avoid;

          }

        }

      </style>

    </head>

    <body>

      <div class="header">

        <div class="header-text">

          <div class="imss">

            INSTITUTO MEXICANO DEL SEGURO SOCIAL

          </div>

          <div class="cdfv">

            CENTRO INSTITUCIONAL COORDINADOR DE FARMACOVIGILANCIA

          </div>

          <div class="title">

            AVISO DE SOSPECHAS DE REACCIONES ADVERSAS DE MEDICAMENTOS

          </div>

        </div>

        <img
          src="imss-logo.png"
          class="logo"
          alt="IMSS"
        >

      </div>

      <div class="identificacion">

        <p>

          <strong>Folio:</strong>

          ${esc(report.folio)}

        </p>

        <p>

          <strong>Fecha de notificación:</strong>

          ${esc(
            formatValue(
              report.fecha_notificacion ||
              report.created_at
            )
          )}

        </p>

      </div>

      <table>

        <tbody>

          ${rowsHtml}

        </tbody>

      </table>

      <div class="footer">

        Reporte generado desde el sistema administrativo
        de Farmacovigilancia SRAM.

      </div>

    </body>

    </html>

  `);

  pdfWindow.document.close();

  setTimeout(() => {

    pdfWindow.focus();

    pdfWindow.print();

  }, 800);

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

// =====================================================
// SEGURIDAD DE CONTRASEÑA
// CAMBIO OBLIGATORIO CADA 90 DÍAS
// =====================================================

const PASSWORD_MAX_DAYS = 90;
const PASSWORD_WARNING_DAYS = 15;


// =====================================================
// COMPROBAR ANTIGÜEDAD DE CONTRASEÑA
// =====================================================

async function checkPasswordExpiration(user) {

  const passwordStatus =
    document.getElementById("passwordStatus");

  if (!passwordStatus || !user) {
    return;
  }

  passwordStatus.textContent =
    "Verificando estado de la contraseña...";


  const {
    data,
    error
  } =
    await sb
      .from("sram_password_control")
      .select("password_changed_at")
      .eq("user_id", user.id)
      .maybeSingle();


  if (error) {

    console.error(
      "Error consultando seguridad:",
      error
    );

    passwordStatus.textContent =
      "No se pudo verificar la antigüedad de la contraseña.";

    return;
  }


  // ===================================================
  // PRIMER REGISTRO
  // ===================================================

  if (!data) {

    const {
      error: insertError
    } =
      await sb
        .from("sram_password_control")
        .insert({
          user_id: user.id,
          password_changed_at:
            new Date().toISOString()
        });


    if (insertError) {

      console.error(
        "Error registrando contraseña:",
        insertError
      );

      passwordStatus.textContent =
        "No se pudo registrar la fecha de seguridad.";

      return;
    }


    passwordStatus.textContent =
      "Contraseña vigente. El periodo de seguridad inicia hoy.";

    return;
  }


  // ===================================================
  // CALCULAR DÍAS
  // ===================================================

  const changedAt =
    new Date(
      data.password_changed_at
    );

  const now =
    new Date();


  const milliseconds =
    now.getTime() -
    changedAt.getTime();


  const days =
    Math.floor(
      milliseconds /
      (1000 * 60 * 60 * 24)
    );


  const daysRemaining =
    PASSWORD_MAX_DAYS - days;


  // ===================================================
  // CONTRASEÑA VENCIDA
  // ===================================================

  if (days >= PASSWORD_MAX_DAYS) {

    passwordStatus.innerHTML =
      "<strong style='color:#a20d0d'>" +
      "⚠️ La contraseña ha vencido." +
      "</strong><br>" +
      "Debes cambiarla para continuar.";

    // Ocultar completamente el contenido administrativo
    // excepto el área de seguridad.

    lockAdminPanel();

    openPasswordModal(true);

    return;
  }


  // ===================================================
  // AVISO PREVENTIVO
  // ===================================================

  if (
    daysRemaining <= PASSWORD_WARNING_DAYS
  ) {

    passwordStatus.innerHTML =
      "<strong style='color:#9a6700'>" +
      "⚠️ Tu contraseña vence en " +
      daysRemaining +
      " días." +
      "</strong>";

  } else {

    passwordStatus.textContent =
      "Contraseña vigente. Faltan " +
      daysRemaining +
      " días para el cambio obligatorio.";
  }

}


// =====================================================
// BLOQUEAR PANEL POR CONTRASEÑA VENCIDA
// =====================================================

function lockAdminPanel() {

  const elements =
    adminPanel.querySelectorAll(
      "input, select, textarea, button"
    );


  elements.forEach(element => {

    // Mantener disponible:
    // - cambiar contraseña
    // - cerrar sesión

    if (
      element.id === "changePasswordBtn" ||
      element.id === "logout"
    ) {
      return;
    }

    element.disabled = true;

  });


  const security =
    document.getElementById(
      "passwordSecurity"
    );


  if (security) {

    security.style.border =
      "2px solid #a20d0d";

    security.style.background =
      "#fff5f5";
  }

}


// =====================================================
// ABRIR MODAL DE CAMBIO DE CONTRASEÑA
// =====================================================

function openPasswordModal(force = false) {

  const modal =
    document.getElementById(
      "passwordModal"
    );


  if (!modal) {
    return;
  }


  modal.hidden = false;


  if (force) {

    const cancel =
      document.getElementById(
        "cancelPassword"
      );

    if (cancel) {

      cancel.style.display =
        "none";
    }
  }

}


// =====================================================
// CERRAR MODAL
// =====================================================

function closePasswordModal() {

  const modal =
    document.getElementById(
      "passwordModal"
    );


  if (!modal) {
    return;
  }


  modal.hidden = true;


  const form =
    document.getElementById(
      "passwordForm"
    );


  if (form) {
    form.reset();
  }


  const msg =
    document.getElementById(
      "passwordMsg"
    );


  if (msg) {
    msg.textContent = "";
  }

}


// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

async function changePassword(event) {

  event.preventDefault();


  const currentPassword =
    document.getElementById(
      "currentPassword"
    ).value;


  const newPassword =
    document.getElementById(
      "newPassword"
    ).value;


  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    ).value;


  const passwordMsg =
    document.getElementById(
      "passwordMsg"
    );


  passwordMsg.textContent =
    "Verificando contraseña actual...";


  passwordMsg.style.color =
    "";


  // ===================================================
  // VALIDACIONES
  // ===================================================

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {

    passwordMsg.textContent =
      "Completa todos los campos.";

    return;
  }


  if (newPassword.length < 8) {

    passwordMsg.textContent =
      "La nueva contraseña debe tener al menos 8 caracteres.";

    return;
  }


  if (newPassword !== confirmPassword) {

    passwordMsg.textContent =
      "Las nuevas contraseñas no coinciden.";

    return;
  }


  if (
    currentPassword === newPassword
  ) {

    passwordMsg.textContent =
      "La nueva contraseña debe ser diferente de la actual.";

    return;
  }


  // ===================================================
  // OBTENER USUARIO
  // ===================================================

  const {
    data: {
      user
    }
  } =
    await sb.auth.getUser();


  if (!user) {

    passwordMsg.textContent =
      "La sesión ha expirado. Inicia sesión nuevamente.";

    return;
  }


  // ===================================================
  // VERIFICAR CONTRASEÑA ACTUAL
  // ===================================================

  const {
    error: loginError
  } =
    await sb.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });


  if (loginError) {

    console.error(
      loginError
    );

    passwordMsg.textContent =
      "La contraseña actual es incorrecta.";

    return;
  }


  // ===================================================
  // ACTUALIZAR CONTRASEÑA
  // ===================================================

  passwordMsg.textContent =
    "Actualizando contraseña...";


  const {
    error: updateError
  } =
    await sb.auth.updateUser({
      password: newPassword
    });


  if (updateError) {

    console.error(
      updateError
    );

    passwordMsg.textContent =
      "No se pudo cambiar la contraseña: " +
      updateError.message;

    return;
  }


  // ===================================================
  // REGISTRAR NUEVA FECHA
  // ===================================================

  const {
    error: dateError
  } =
    await sb
      .from("sram_password_control")
      .upsert({
        user_id: user.id,
        password_changed_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString()
      });


  if (dateError) {

    console.error(
      dateError
    );

    passwordMsg.textContent =
      "La contraseña cambió, pero no se pudo registrar la nueva fecha de seguridad.";

    return;
  }


  // ===================================================
  // ÉXITO
  // ===================================================

  passwordMsg.textContent =
    "✅ Contraseña cambiada correctamente.";


  passwordMsg.style.color =
    "#14532d";


  const passwordStatus =
    document.getElementById(
      "passwordStatus"
    );


  if (passwordStatus) {

    passwordStatus.textContent =
      "Contraseña actualizada. El próximo cambio obligatorio será en 90 días.";
  }


  // Reactivar panel
  const elements =
    adminPanel.querySelectorAll(
      "input, select, textarea, button"
    );


  elements.forEach(element => {

    element.disabled = false;

  });


  const security =
    document.getElementById(
      "passwordSecurity"
    );


  if (security) {

    security.style.border =
      "2px solid #14532d";

    security.style.background =
      "#f4f6f7";
  }


  setTimeout(
    () => {
      closePasswordModal();
    },
    1200
  );

}


// =====================================================
// EVENTOS DE SEGURIDAD
// =====================================================

document
  .getElementById("changePasswordBtn")
  .addEventListener(
    "click",
    () => openPasswordModal(false)
  );


document
  .getElementById("cancelPassword")
  .addEventListener(
    "click",
    closePasswordModal
  );


document
  .getElementById("passwordForm")
  .addEventListener(
    "submit",
    changePassword
  );


checkSession();
