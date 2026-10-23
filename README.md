# KAZVORA Technologies — Portafolio inicial

Sitio corporativo multipágina construido con HTML, CSS y JavaScript sin frameworks ni dependencias de pago. Preparado para GitHub Pages.

## Archivos

- `index.html`: portada.
- `portafolio.html`: proyectos con filtros por categoría.
- `servicios.html`: oferta inicial.
- `nosotros.html`: historia, visión y principios.
- `contacto.html`: formulario que prepara un mensaje localmente.
- `css/styles.css`: diseño, identidad visual y adaptación móvil.
- `js/projects.js`: fuente de datos del portafolio.
- `js/main.js`: menú móvil, tarjetas, filtros y formulario.
- `assets/icons/favicon.svg`: favicon vectorial.

## Probar localmente

Abre `index.html` en un navegador. Para una prueba más parecida al alojamiento, usa una extensión de servidor local o publica el repositorio en GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `kazvora-portfolio`.
2. Sube todos los archivos y carpetas manteniendo esta estructura.
3. En el repositorio abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`, y guarda.
6. Espera a que GitHub Pages publique el sitio. Comprueba cada página y los enlaces desde un móvil.

## Cómo agregar un proyecto

Edita `js/projects.js` y añade un objeto al arreglo `window.KAZVORA_PROJECTS`:

```js
{
  id: "identificador-unico",
  title: "Nombre del proyecto",
  category: "Web",
  status: "Demostración",
  description: "Qué problema resuelve y qué construiste.",
  technologies: ["HTML", "CSS", "JavaScript"],
  icon: "⌘",
  theme: "blue",
  featured: false,
  url: ""
}
```

- Usa `featured: true` para mostrarlo en la portada.
- Usa `status: "Demostración"`, `"Proyecto propio"`, `"Académico"` o `"Trabajo para cliente"` según corresponda.
- En `url`, coloca una ruta relativa o URL pública real. Si aún no hay enlace, déjalo vacío.
- Añade imágenes reales en `assets/images` cuando cada proyecto tenga capturas adecuadas.

## Antes de publicar comercialmente

- Confirma el nombre, la marca y los dominios por las vías oficiales.
- Configura el número de WhatsApp comercial antes de anunciar el contacto directo.
- Revisa textos, servicios, precios, aviso de privacidad y datos de contacto.
- No incluyas información privada de clientes ni afirmaciones no verificadas.
- Los servicios en desarrollo se identifican como futuros; no se anuncian como disponibles.
