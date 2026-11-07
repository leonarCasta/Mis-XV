# Mis XV Años · María Guadalupe

Pre-invitación estática, mobile-first y sin frameworks. Paleta lavanda, crema marfil y dorado. Funciona abriendo `index.html` directamente o publicada en GitHub Pages.

## Archivos

```
index.html      Estructura, textos base, metadatos y accesibilidad
style.css       Diseño responsive, paleta lavanda/dorado, acuarelas y lightbox
script.js       CONFIG editable, cuenta regresiva, música, .ics y partículas
assets/         Fotos, imágenes de lugares, canción, favicon y vista previa
```

## Lo que debes reemplazar

1. **Fotos** (`assets/`)
   - `1.jpg` — foto principal, vertical 1200 × 1600 px.
   - `2.jpg` a `5.jpg` — galería vaquera, verticales 900 × 1125 px.
   - `iglesia.jpg` — ceremonia, horizontal 1200 × 800 px.
   - `salon.jpg` — recepción, horizontal 1200 × 800 px.
   - `og-image.jpg` — vista previa 1200 × 630 px (opcional).
2. **Canción** — `assets/hey-lover.mp3` ya está contemplada. Si falta, el reproductor se oculta sin romper la página.
3. **Datos** — abre `script.js` y edita el objeto `CONFIG` al inicio:
   - nombres y padres;
   - fecha, ciudad y zona horaria;
   - horarios de ceremonia y recepción;
   - direcciones y enlaces de Maps.
4. **Redes sociales** — en `index.html`, reemplaza las URLs de ejemplo:
   - `og:image` y `twitter:image` por la URL absoluta de `assets/og-image.jpg`;
   - `og:url` por la URL final del sitio.

## Publicar en GitHub Pages

1. Sube `index.html`, `style.css`, `script.js` y la carpeta `assets/` a la raíz del repositorio.
2. En GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.
3. Abre la URL publicada y actualiza `og:url`, `og:image` y `twitter:image` con esa URL absoluta.

## Notas

- La cuenta regresiva apunta al **28 de noviembre de 2026, 00:00 (UTC-6)**.
- El archivo `.ics` se descarga como evento de todo el día porque los horarios aún están por confirmar.
- La música solo se inicia con el toque en el sello. También existe “Entrar sin música”.
- Los horarios muestran “Por confirmar” hasta que los actualices en `CONFIG`.
- El sitio respeta `prefers-reduced-motion` y no genera scroll horizontal desde 320 px.
- Las fotos se amplían en un lightbox; se cierra con la X, tocando fuera o con `Escape`.
