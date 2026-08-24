let reports = [];

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

const userEmail = document.getElementById("userEmail");

const msg = document.getElementById("msg");
const rows = document.getElementById("rows");

const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");
const closeDetail = document.getElementById("closeDetail");


const sb = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


// --------------------------------------------------
// ESCAPAR HTML
// --------------------------------------------------

function esc(x) {

  return String(x ?? "").replace(
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

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {

    return value
      .map(v => String(v))
      .join(" | ");

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
// MOSTRAR PANEL
// --------------------------------------------------

function showAdmin(user) {

  loginPanel.hidden = true;
  adminPanel.hidden = false;

  userEmail.textContent = user.email || "";

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
// COMPROBAR SESIÓN
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

  loginMsg.textContent = "Iniciando sesión...";

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  const {
    data,
    error
  } = await sb.auth.signInWithPassword({
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
// LOGOUT
// --------------------------------------------------

async function logout() {

  await sb.auth.signOut();

  reports = [];

  rows.innerHTML = "";

  msg.textContent = "";

  closeReport();

  showLogin();

}


// --------------------------------------------------
// CARGAR REPORTES
// --------------------------------------------------

async function loadReports() {

  msg.textContent = "Cargando reportes...";


  const {
    data: { user }
  } = await sb.auth.getUser();


  if (!user) {

    showLogin();

    return;

  }


  const {
    data,
    error
  } = await sb
    .from("sram_reports")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    msg.textContent =
      "No autorizado o error de conexión.";

    return;

  }


  reports = data || [];


  rows.innerHTML = reports.map((r, index) => `

    <tr>

      <td>${esc(r.folio)}</td>

      <td>${esc(r.created_at)}</td>

      <td>${esc(r.unidad_notifica)}</td>

      <td>${esc(r.iniciales)}</td>

      <td>${esc(r.med_generico)}</td>

      <td>${esc(r.sram_notificada)}</td>

      <td>${esc(r.gravedad)}</td>

      <td>

        <button
          class="secondary view-report"
          type="button"
          data-index="${index}"
        >
          Ver reporte
        </button>

      </td>

    </tr>

  `).join("");


  document
    .querySelectorAll(".view-report")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          openReport(index);

        }
      );

    });


  msg.textContent =
    `${reports.length} reportes`;

}


// --------------------------------------------------
// ABRIR REPORTE COMPLETO
// --------------------------------------------------

function openReport(index) {

  const report = reports[index];

  if (!report) return;


  detailContent.innerHTML = "";


  const table =
    document.createElement("table");


  table.style.width = "100%";


  const tbody =
    document.createElement("tbody");


  Object.entries(report).forEach(
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


      th.style.textAlign = "left";
      th.style.verticalAlign = "top";
      th.style.padding = "10px";
      th.style.width = "32%";


      td.style.padding = "10px";
      td.style.whiteSpace = "pre-wrap";
      td.style.wordBreak = "break-word";


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
// NOMBRES DE CAMPOS MÁS LEGIBLES
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

    confirmacion: "Confirmación",

  };


  if (names[key]) {

    return names[key];

  }


  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}


// --------------------------------------------------
// CERRAR REPORTE
// --------------------------------------------------

function closeReport() {

  detailModal.hidden = true;

  detailContent.innerHTML = "";

}


// --------------------------------------------------
// EXPORTAR CSV
// --------------------------------------------------

function csv() {

  if (!reports.length) {

    alert("Carga los reportes primero.");

    return;

  }


  const keys =
    Object.keys(reports[0]);


  const q = value =>
    `"${String(value ?? "")
      .replaceAll('"', '""')}"`;


  const text =
    keys.join(",") +
    "\n" +
    reports
      .map(r =>
        keys
          .map(k =>
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
// EVENTOS
// --------------------------------------------------

loginForm.addEventListener(
  "submit",
  login
);


document.getElementById("load")
  .onclick = loadReports;


document.getElementById("csv")
  .onclick = csv;


document.getElementById("logout")
  .onclick = logout;


closeDetail.onclick =
  closeReport;


detailModal.addEventListener(
  "click",
  event => {

    if (event.target === detailModal) {

      closeReport();

    }

  }
);


// --------------------------------------------------
// INICIAR
// --------------------------------------------------

checkSession();
