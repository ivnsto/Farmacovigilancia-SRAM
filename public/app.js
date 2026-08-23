const form=document.getElementById("sramForm"),
statusEl=document.getElementById("status"),
bar=document.getElementById("bar");

function makeFolio(){
  const d=new Date(),
  stamp=d.toISOString().replace(/[-:TZ.]/g,"").slice(0,14),
  rand=Math.floor(1000+Math.random()*9000);
  return `SRAM-${stamp}-${rand}`;
}

function getValue(el){
  if(el.type==="checkbox") return el.checked;

  if(el.multiple){
    return [...el.selectedOptions].map(o=>o.value);
  }

  // IMPORTANTE:
  // Supabase no acepta "" en campos de tipo date.
  // Si la fecha está vacía, enviamos null.
  if(el.type==="date" && el.value===""){
    return null;
  }

  return el.value;
}

function collect(){
  const obj={folio:makeFolio()};

  form.querySelectorAll("[name]").forEach(el=>{
    obj[el.name]=getValue(el);
  });

  // La política RLS de Supabase exige confirmacion = true
  obj.confirmacion=true;

  return obj;
}

form.addEventListener("input",()=>{
  const r=form.querySelectorAll("[required]"),
  f=[...r].filter(x=>x.type==="checkbox"?x.checked:x.value).length;

  bar.style.width=(f/r.length*100)+"%";
});

form.addEventListener("submit",async e=>{
  e.preventDefault();

  if(!form.reportValidity()) return;

  if(!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY){
    statusEl.textContent="Falta configurar la base de datos.";
    alert("Falta configurar Supabase. Consulta el README.");
    return;
  }

  statusEl.textContent="Enviando...";

  const sb=supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  const payload=collect();

  try{

    console.log("Datos enviados a Supabase:",payload);

    const {error}=await sb
      .from("sram_reports")
      .insert(payload);

    if(error) throw error;

    form.reset();
    bar.style.width="0%";

    statusEl.textContent=`Reporte enviado. Folio: ${payload.folio}`;

    alert(
      `Reporte enviado correctamente.\n\nFolio: ${payload.folio}`
    );

  }catch(err){

    console.error("ERROR SUPABASE:",err);

    statusEl.textContent="No se pudo guardar el reporte.";

    alert(
      "No se pudo guardar el reporte.\n\n" +
      "Error: " +
      (err.message || "Verifique la configuración de Supabase.")
    );
  }
});
