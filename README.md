# Sistema de Reporte de Farmacovigilancia SRAM

Proyecto listo para publicar en GitHub Pages. Flujo: QR -> formulario -> base de datos -> administración.

## Publicación rápida
1. Crea un repositorio en GitHub, por ejemplo `farmacovigilancia-sram`.
2. Sube todos los archivos de este proyecto a la rama `main`.
3. En Settings > Pages selecciona **GitHub Actions** como origen.
4. Crea un proyecto en Supabase y ejecuta `schema.sql` en SQL Editor.
5. Copia `public/supabase-config.example.js` como `public/supabase-config.js` y coloca la URL y la anon key de Supabase.
6. Haz commit/push. GitHub Actions publicará `public/`.
7. La URL publicada será la que se use para el QR.

## Seguridad
GitHub Pages no es una base de datos. Supabase almacena las respuestas. No pongas nunca una `service_role` key en el navegador. Antes de usar datos identificables de pacientes en producción, valida con tu institución las políticas de privacidad, seguridad y retención de datos.

El panel `admin.html` es un prototipo y debe protegerse con autenticación antes de producción.
