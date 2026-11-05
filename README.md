# SEB’S — La Cinemateca · Web v1

Web responsive con identidad jazz/editorial, navegación y archivo inicial de 56 títulos. Incluye buscador, filtros, estados, notas promedio y formulario para agregar, editar y eliminar. Los juegos y Tinder son secciones de presentación, no funcionalidades jugables todavía.

## Probar localmente

Desde esta carpeta: `python -m http.server 8000` y abrir http://localhost:8000. En este modo los cambios se guardan **solo en este navegador** (localStorage), no se comparten con Pouk. No es una base de datos compartida.

## Publicar con datos compartidos

1. Crear proyecto en Supabase. Ejecutar `supabase/schema.sql` y después **una vez** `supabase/seed.sql` en SQL Editor.
2. En Vercel configurar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SEBS_JUANMA_CODE` (código largo y privado). Nunca subir credenciales al repositorio.
3. Subir el contenido de esta carpeta (no la carpeta contenedora) a GitHub y conectar el repositorio con Vercel.
4. Abrir `/api/library` en el dominio publicado: debe devolver el archivo JSON. Verificar que La Cinemateca muestre «Archivo compartido conectado».
5. Solo Juanma podrá escribir usando su código. Pouk y el público pueden consultar.

## Seguridad y límites

La clave service role se usa exclusivamente en las funciones del servidor. La base tiene RLS sin políticas públicas directas. Para un sitio de alto tráfico conviene añadir autenticación formal y rate limiting; un código compartido en encabezados es una solución inicial.

No se conectó Google Sheets por decisión del usuario. No hay integración TMDB ni Letterboxd automática. La carga manual está operativa, con metadatos escritos por el administrador.
