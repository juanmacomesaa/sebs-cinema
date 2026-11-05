# SEB’S — Pósteres TMDB · Web v2

Esta versión agrega pósteres oficiales a la Cinemateca usando la API TMDB desde `api/tmdb.js`, con clave exclusivamente del lado servidor. Incluye los archivos previos de Seb's, las 56 entradas iniciales y las funciones de administración existentes.

## Actualización en GitHub

1. En `juanmacomesaa/sebs-cinema` usar **Add file → Upload files**.
2. Subir **todos los archivos y las carpetas `api/` y `supabase/`** de este ZIP, no el ZIP. Confirmar la sustitución de archivos existentes con **Commit changes**.
3. En Vercel, configurar `TMDB_API_KEY` como variable **Secret**, en **Production** (ya realizado por el usuario).
4. El commit a `main` inicia un nuevo despliegue automáticamente. Verificar `https://sebs-cinema.vercel.app/api/tmdb?title=Fleabag&kind=Serie` (no muestra la clave), luego abrir la Cinemateca y esperar a que carguen los pósteres.

Los títulos ambiguos pueden quedar sin póster antes que mostrar uno incorrecto. No hay base de datos compartida hasta configurar Supabase. La API de TMDB requiere atribución y respeto de sus condiciones.
