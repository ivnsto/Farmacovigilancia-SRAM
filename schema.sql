create table if not exists public.sram_reports (
  id uuid primary key default gen_random_uuid(), folio text not null unique, created_at timestamptz not null default now(),
  notif_cdfv text, notif_cicfv text, notif_cnfv text, fecha_notificacion date, fecha_captura date, tipo_notificacion text, unidad_notifica text, direccion_unidad text,
  iniciales text, nombre_paciente text, nss text, fecha_nacimiento date, sexo text, peso text, estatura text, grupo_etario text, embarazada text, semanas_gestacion text, lactando text, fum date,
  profesion_notificador text, titulo_notificador text, nombre_notificador text, correo_notificador text, telefono_notificador text, servicio text,
  sram_notificada text, inicio_padecimiento date, termino_padecimiento date, edad_inicio_sram text, unidad_tiempo text, sram_previa text, historia_previa text, historia_clinica text, evolucion_sram text, atencion_adicional text, intervencion text,
  med_generico text, med_comercial text, laboratorio text, lote text, concentracion text, forma_farmaceutica text, dosis text, unidad_dosis text, frecuencia text, via text, indicacion text, med_inicio date, med_termino date, caducidad date, accion_tomada text, resultado_suspension text, reexpuesto text, reaccion_reexposicion text,
  intensidad text, gravedad text, criterio_gravedad text[], consecuencia text,
  uso_concomitantes text, concomitantes text,
  estudios_realizados text, estudios text, fecha_estudio date, resultado_estudio text, valores_normales text, unidad_estudio text,
  causalidad text, naranjo text, comentarios_causalidad text,
  comentarios_finales text, informacion_adicional text, documentacion_adicional text, descripcion_documentacion text, confirmacion boolean not null default false
);
alter table public.sram_reports enable row level security;
drop policy if exists "public_insert_sram_reports" on public.sram_reports;
create policy "public_insert_sram_reports" on public.sram_reports for insert to anon with check (confirmacion = true);
