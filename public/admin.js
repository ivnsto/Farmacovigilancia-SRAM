let reports = [];

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

const userEmail = document.getElementById("userEmail");

const msg = document.getElementById("msg");
const rows = document.getElementById("rows");

const sb = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


// Escapar texto para evitar insertar HTML directamente
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


// Mostrar panel administrativo
function showAdmin(user) {

  loginPanel.hidden = true;
  adminPanel.hidden = false;

  userEmail.textContent = user.email || "";

}


// Mostrar login
function showLogin() {

  loginPanel.hidden = false;
  adminPanel.hidden = true;

  rows.innerHTML = "";

}


// Verificar sesión existente
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


// Iniciar sesión
async function login(event) {

  event.preventDefault();

  loginMsg.textContent = "Iniciando sesión...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

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


// Cerrar sesión
async function logout() {

  await sb.auth.signOut();

  reports = [];

  rows.innerHTML = "";

  msg.textContent = "";

  showLogin();

}


// Cargar reportes
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

  rows.innerHTML = reports.map(r => `
    <tr>
      <td>${esc(r.folio)}</td>
      <td>${esc(r.created_at)}</td>
      <td>${esc(r.unidad_notifica)}</td>
      <td>${esc(r.iniciales)}</td>
      <td>${esc(r.med_generico)}</td>
      <td>${esc(r.sram_notificada)}</td>
      <td>${esc(r.gravedad)}</td>
    </tr>
  `).join("");

  msg.textContent =
    `${reports.length} reportes`;
}


// Exportar CSV
function csv() {

  if (!reports.length) {

    alert("Carga los reportes primero.");

    return;
  }

  const keys = Object.keys(reports[0]);

  const q = value =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

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

  const blob = new Blob(
    ["\ufeff" + text],
    {
      type: "text/csv;charset=utf-8"
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "reportes_sram.csv";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}


// Eventos
loginForm.addEventListener("submit", login);

document.getElementById("load").onclick =
  loadReports;

document.getElementById("csv").onclick =
  csv;

document.getElementById("logout").onclick =
  logout;


// Inicializar
checkSession();
