const form = document.getElementById("sramForm");
const statusEl = document.getElementById("status");
const bar = document.getElementById("bar");

function makeFolio() {
  const d = new Date();
  const stamp = d.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);

  return `SRAM-${stamp}-${rand}`;
}

function getValue(el) {

  // Checkbox
  if (el.type === "checkbox") {
    return el.checked;
  }

  // Select múltiple
  if (el.multiple) {
    return [...el.selectedOptions].map(o => o.value);
  }

  // Fechas vacías = null
  if (el.type === "date" && el.value === "") {
    return null;
  }

  return el.value;
}

function collect() {

  const obj = {
    folio: makeFolio()
  };

  form.querySelectorAll("[name]").forEach(el => {
    obj[el.name] = getValue(el);
  });

  /*
   * Compatibilidad con la estructura de Supabase
   *
   * El formulario actual utiliza:
   * inicio_padecimiento
   *
   * La base de datos también dispone de:
   * fecha_inicio_sram
   */
  if (obj.inicio_padecimiento) {
    obj.fecha_inicio_sram = obj.inicio_padecimiento;
  } else {
    obj.fecha_inicio_sram = null;
  }

  /*
   * La edad del paciente se guardará en:
   * edad
   *
   * Mientras que edad_inicio_sram corresponde
   * específicamente a la edad al comenzar la SRAM.
   */

  return obj;
}

function updateProgress() {

  const required = form.querySelectorAll("[required]");

  if (!required.length) {
    bar.style.width = "0%";
    return;
  }

  const completed = [...required].filter(el => {

    if (el.type === "checkbox") {
      return el.checked;
    }

    return el.value.trim() !== "";

  }).length;

  const percentage = (completed / required.length) * 100;

  bar.style.width = `${percentage}%`;
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);

form.addEventListener("submit", async e => {

  e.preventDefault();

  // Validación HTML
  if (!form.reportValidity()) {
    return;
  }

  // Verificación adicional de la confirmación
  const confirmacion = form.querySelector(
    '[name="confirmacion"]'
  );

  if (confirmacion && !confirmacion.checked) {

    alert(
      "Debe confirmar que la información proporcionada es correcta antes de enviar el reporte."
    );

    confirmacion.focus();

    return;
  }

  // Verificar configuración de Supabase
  if (
    !window.SUPABASE_URL ||
    !window.SUPABASE_ANON_KEY
  ) {

    statusEl.textContent =
      "Falta configurar la base de datos.";

    alert(
      "Falta configurar Supabase. Consulta el README."
    );

    return;
  }

  statusEl.textContent = "Enviando...";

  const sb = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

const payload = collect();

try {

  console.log(
    "Datos enviados a Supabase:",
    payload
  );

    const { error } = await sb
  .from("sram_reports")
  .insert(payload);

    if (error) {
      throw error;
    }

    // Limpiar formulario
    form.reset();

    // Reiniciar progreso
    bar.style.width = "0%";

    const folioGuardado = payload.folio;

    statusEl.textContent =
      `Reporte enviado. Folio: ${folioGuardado}`;

    alert(
      `Reporte enviado correctamente.\n\nFolio: ${folioGuardado}`
    );

  } catch (err) {

    console.error(
      "ERROR SUPABASE:",
      err
    );

    statusEl.textContent =
      "No se pudo guardar el reporte.";

    alert(
      "No se pudo guardar el reporte.\n\n" +
      "Error: " +
      (err.message ||
        "Verifique la configuración de Supabase.")
    );
  }
});

// Inicializar barra
updateProgress();
