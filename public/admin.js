let reports = [];
let filteredReports = [];
let currentReport = null;


const loginPanel =
  document.getElementById("loginPanel");

const adminPanel =
  document.getElementById("adminPanel");

const loginForm =
  document.getElementById("loginForm");

const loginMsg =
  document.getElementById("loginMsg");

const userEmail =
  document.getElementById("userEmail");

const msg =
  document.getElementById("msg");

const rows =
  document.getElementById("rows");

const search =
  document.getElementById("search");

const severity =
  document.getElementById("severity");

const dateFrom =
  document.getElementById("dateFrom");

const dateTo =
  document.getElementById("dateTo");

const detailModal =
  document.getElementById("detailModal");

const detailContent =
  document.getElementById("detailContent");

const sb =
  supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );


// --------------------------------------------------
// ESCAPAR HTML
// --------------------------------------------------

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


// --------------------------------------------------
// FORMATEAR VALORES
// --------------------------------------------------

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


// --------------------------------------------------
// NOMBRE DE CAMPO
// --------------------------------------------------

function humanizeField(key) {

  const names = {

    folio: "Folio",

    created_at: "Fecha de registro",

    iniciales: "Iniciales del paciente",

    nombre_paciente: "Nombre del paciente",

    med_generico: "Medicamento genérico",

    sram_notificada: "SRAM notificada",

    gravedad: "Gravedad",

    causalidad: "Causalidad",

    unidad_notifica: "Unidad que notifica",

    confirmacion: "Confirmación"

  };


  if (names[key]) {

    return names[key];

  }


  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}


// --------------------------------------------------
// MOSTRAR ADMIN
// --------------------------------------------------

function showAdmin(user) {

  loginPanel.hidden = true;

  adminPanel.hidden = false;

  userEmail.textContent =
    user.email || "";

}


// --------------------------------------------------
// MOSTRAR LOGIN
// --------------------------------------------------

function showLogin() {

  loginPanel.hidden = false;

  adminPanel.hidden = true;

  rows.innerHTML = "";

}


// --------------------------------------------------
// SESIÓN
// --------------------------------------------------

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


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

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


// --------------------------------------------------
// CERRAR SESIÓN
// --------------------------------------------------

async function logout() {

  await sb.auth.signOut();

  reports = [];

  filteredReports = [];

  rows.innerHTML = "";

  msg.textContent = "";

  closeReport();

  showLogin();

}


// --------------------------------------------------
// CARGAR REPORTES
// --------------------------------------------------

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

  filteredReports = [...reports];


  populateSeverity();

  renderReports();


  msg.textContent =
    `${reports.length} reportes encontrados`;

}


// --------------------------------------------------
// OPCIONES DE GRAVEDAD
// --------------------------------------------------

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


// --------------------------------------------------
// FILTRAR
// --------------------------------------------------

function filterReports() {

  const text =
    search.value
      .trim()
      .toLowerCase();


  const sev =
    severity.value;


  const from =
    dateFrom.value;


  const to =
    dateTo.value;


  filteredReports =
    reports.filter(report => {

      const searchable = [

        report.folio,

        report.nombre_paciente,

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


      if (
        from &&
        String(report.created_at).slice(0,10) < from
      ) {

        return false;

      }


      if (
        to &&
        String(report.created_at).slice(0,10) > to
      ) {

        return false;

      }


      return true;

    });


  renderReports();


  msg.textContent =
    `${filteredReports.length} reportes encontrados`;

}


// --------------------------------------------------
// MOSTRAR TABLA
// --------------------------------------------------

function renderReports() {

  rows.innerHTML =
    filteredReports.map(
      (r, index) => `

      <tr>

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

        <td
          style="
            white-space:nowrap;
          "
        >

          <button
            class="secondary view-report"
            type="button"
            data-index="${index}"
          >
            👁️ Ver
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

    `
    ).join("");


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
    .querySelectorAll(".print-report")
    .forEach(button => {

      button.onclick = () => {

        printReport(
          Number(button.dataset.index)
        );

      };

    });

}


// --------------------------------------------------
// ABRIR REPORTE
// --------------------------------------------------

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


// --------------------------------------------------
// IMPRIMIR
// --------------------------------------------------

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

          font-family:
            Arial,
            sans-serif;

          margin:40px;

          color:#222;

        }


        header {

          border-bottom:
            3px solid #176b4d;

          padding-bottom:15px;

          margin-bottom:25px;

        }


        h1 {

          color:#176b4d;

          margin:0 0 8px;

        }


        h2 {

          margin-top:0;

        }


        table {

          width:100%;

          border-collapse:
            collapse;

        }


        th,
        td {

          border:
            1px solid #ccc;

          padding:9px;

          vertical-align:
            top;

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


// --------------------------------------------------
// CERRAR DETALLE
// --------------------------------------------------

function closeReport() {

  detailModal.hidden = true;

  detailContent.innerHTML = "";

  currentReport = null;

}


// --------------------------------------------------
// CSV
// --------------------------------------------------

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


// --------------------------------------------------
// LIMPIAR FILTROS
// --------------------------------------------------

function clearFilters() {

  search.value = "";

  severity.value = "";

  dateFrom.value = "";

  dateTo.value = "";

  filteredReports =
    [...reports];

  renderReports();

  msg.textContent =
    `${reports.length} reportes encontrados`;

}


// --------------------------------------------------
// EVENTOS
// --------------------------------------------------

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


// --------------------------------------------------
// INICIO
// --------------------------------------------------

checkSession();
