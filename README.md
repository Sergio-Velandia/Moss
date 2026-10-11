# 🌱 Moss — Digital Garden

Mi "segundo cerebro" técnico: una biblioteca personal y visual donde guardo, documento, pruebo y reutilizo snippets, componentes, guías y artículos.

> El conocimiento técnico no debería quedarse enterrado; debería ser fácil de encontrar, entender, probar, conectar y reutilizar.

**Autor:** Sergio Andres Ramirez Velandia · [Portafolio](https://sergio-velandia.github.io/mi-portafolio/) · [sergio.velandiar.z@gmail.com](mailto:sergio.velandiar.z@gmail.com)

## Los cuatro pilares

| Pilar | Ruta | Qué es |
| --- | --- | --- |
| **El Laboratorio** | `/laboratorio` | Componentes y snippets con vista previa en vivo y código copiable |
| **El Manual** | `/manual` | Documentación, configuraciones y guías |
| **La Bitácora** | `/bitacora` | Blog técnico: aprendizajes, decisiones y errores |
| **El Herbario** | `/herbario` | Búsqueda global sobre todo el contenido |

## Qué hay dentro

**Laboratorio (6 demos)**

| Demo | Categoría |
| --- | --- |
| Acordeón accesible | Navegación |
| Botón con estados (normal, cargando, éxito) | Botones |
| Botón de copiar al portapapeles | Botones |
| Animación de entrada escalonada | Animaciones |
| Skeleton loader | Loaders |
| Tarjeta tilt 3D | Animaciones |

**Manual (6 guías)**

| Categoría | Guía |
| --- | --- |
| APIs | Conectar la API de Gemini de forma segura |
| JavaScript | Debounce y throttle |
| JavaScript | Fetch con manejo de errores y tiempo límite |
| n8n | Webhook básico |
| React | Estructura de proyecto |
| SQL | Agrupar con GROUP BY |

**Bitácora (5 artículos)**

| Artículo | Categoría |
| --- | --- |
| Por qué Moss no usa base de datos | Arquitectura |
| Cómo funciona la búsqueda del Herbario | Arquitectura |
| La accesibilidad que no se ve | Aprendizajes |
| Un botón también tiene estados | Aprendizajes |
| Apuntes sobre la tarjeta tilt 3D | Aprendizajes |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS 4 · React Router · Motion · Lucide · react-markdown · Shiki · MiniSearch · Vitest · oxlint.

El contenido vive en archivos del repositorio, versionados con Git. Sin base de datos ni backend.

## Empezar

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # comprobación de tipos + build de producción en dist/
npm run preview  # sirve dist/ para revisar el build
npm run test     # pruebas (búsqueda y contenido)
npm run lint
npm run check:publish   # falla si site.ts aún tiene datos sin rellenar
```

## Cómo añadir contenido

### Una demo al Laboratorio

Crea un archivo en `src/lab/entries/`, por ejemplo `mi-demo.tsx`. Exporta `meta` y el componente por defecto. El código que se muestra en la web es el propio archivo.

```tsx
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Mi demo',
  description: 'Qué hace, en una frase.',
  technology: 'React', // React | CSS | HTML | JavaScript
  category: 'Botones',
  tags: ['botón', 'hover'],
  createdAt: '2026-10-10',
  usage: 'Cómo se usa.',
  dependencies: ['lucide-react'], // opcional
}

export default function MiDemo() {
  return <button>Hola</button>
}
```

### Un documento al Manual

Crea `content/manual/<categoría>/<nombre>.md`. La carpeta es la categoría (`react`, `sql`, `apis`, `n8n`, `javascript`…).

### Un artículo a la Bitácora

Crea `content/journal/<nombre>.md`.

### Metadatos (frontmatter)

```md
---
title: Título del documento
description: Resumen en una frase
type: manual            # manual | journal
category: Arquitectura  # solo Bitácora; en el Manual la categoría es la carpeta
tags: [uno, dos]
technologies: [React, SQL]
createdAt: 2026-10-10
updatedAt: 2026-10-10   # opcional
draft: true             # opcional: oculto en la web publicada, visible en desarrollo
related: [lab/tilt-card, manual/sql/agrupar-con-group-by, journal/mi-articulo]
---
```

Los ids de `related` son `lab/<archivo>`, `manual/<categoría>/<archivo>` o `journal/<archivo>`. Una prueba automática avisa si alguno apunta a algo que no existe.

> El parser de frontmatter es mínimo a propósito: admite texto, `true/false` y listas en una línea `[a, b]`. No admite listas multilínea ni comas dentro de un elemento de la lista.

## Búsqueda

El Herbario indexa título, descripción, etiquetas, tecnologías y contenido completo (incluido el código de las demos). Ignora tildes y palabras vacías ("de", "para"…), tolera pequeñas erratas y exige todas las palabras de la consulta; si no hay resultados, acepta cualquiera. El índice se construye en el navegador la primera vez que se busca. Los filtros viven en la URL (`?q=…&tipo=…&tec=…`), así que una búsqueda se puede compartir.

## Tema claro y oscuro

El botón de la cabecera alterna entre los dos temas. Sin elección manual, Moss sigue el tema del sistema; la elección se guarda en el navegador (`moss-theme`) y se aplica antes de pintar para evitar el parpadeo. Los colores son tokens en `src/index.css`: para cambiar la paleta basta con editar las variables de `:root` y `:root[data-theme="dark"]`.

## Accesibilidad y móvil

- Navegación por teclado completa, enlace "Saltar al contenido", foco visible y foco movido al contenido al cambiar de página.
- Menú móvil con `aria-expanded`, cierre con Escape y botones de al menos 44 px en pantallas táctiles.
- Cada página fija su propio título.
- Respeta `prefers-reduced-motion` (animaciones de entrada y tarjeta tilt).
- Contraste de colores comprobado contra WCAG 2.2 AA en ambos temas.
- El contenido Markdown no ejecuta HTML crudo.

## Rendimiento

- El Herbario, los artículos y las páginas legales se cargan bajo demanda (lazy loading): el renderizador de Markdown y el buscador solo se descargan al visitarlas.
- El resaltado de código con Shiki carga cada lenguaje por separado.

## Páginas legales

`/terminos`, `/privacidad` y `/proteccion-de-datos` se escriben en `content/legal/*.md` y leen sus datos de `src/data/site.ts` (nombre, correo, portafolio, país) mediante las variables `{{owner}}`, `{{email}}`, `{{portfolio}}`, `{{repo}}` y `{{country}}`.

> Los textos son un borrador base redactado a partir de lo que Moss hace hoy (sin cuentas, formularios, cookies ni analítica); **no son asesoría legal**. Si añades analítica, cookies o formularios, actualiza antes la política de privacidad.

## Despliegue en GitHub Pages

Moss es una SPA estática: basta con publicar la carpeta `dist/`. Como GitHub Pages sirve el proyecto en una subruta (`https://sergio-velandia.github.io/Moss/`) y no conoce las rutas de React Router, hay que ajustar tres cosas antes del primer despliegue:

1. **Ruta base de Vite.** En `vite.config.ts`, añade `base: '/Moss/'` (el nombre exacto del repositorio, con mayúsculas).
2. **Ruta base del router.** En `src/App.tsx`, usa `<BrowserRouter basename={import.meta.env.BASE_URL}>`. Sin esto, ninguna ruta coincide y todo muestra la página 404 de Moss.
3. **Recarga en rutas internas.** Al recargar `/Moss/manual/...`, GitHub Pages busca un archivo que no existe. La solución habitual es copiar `index.html` como `404.html` después del build:

   ```bash
   npm run build && cp dist/index.html dist/404.html
   ```

   La alternativa es cambiar a `HashRouter` (las URLs quedan como `/#/manual/...`).

Además, los recursos de `public/` referenciados con ruta absoluta (como `/favicon.svg` en `index.html`) los reescribe Vite al aplicar `base`; los que estén escritos a mano dentro de componentes deben usar `import.meta.env.BASE_URL`.

Antes de publicar, ejecuta la comprobación completa:

```bash
npm run check:publish && npm run test && npm run lint && npm run build
```

## Estructura

```
content/
├── manual/<categoría>/*.md
├── journal/*.md
└── legal/*.md
public/            # favicon e imágenes estáticas
scripts/           # check-site.mjs: comprobación antes de publicar
src/
├── components/    # layout, code, content
├── lab/entries/   # demos del Laboratorio
├── data/          # site.ts: autor, contacto, portafolio y repositorio
├── lib/           # lab, content, knowledge, search, frontmatter, theme, legal
└── pages/
```

## Seguridad

Este repositorio es público. No se guardan claves reales: usa variables de entorno (`.env`, ignorado por Git) y valores ficticios en los ejemplos. Ver `.env.example`. Ten en cuenta que en Vite cualquier variable `VITE_*` acaba dentro del JavaScript publicado, así que nunca debe contener secretos. Las demos son componentes locales preparados; Moss no ejecuta código arbitrario.

## Estado

✅ **Versión 1.0 completa:** Laboratorio, Manual, Bitácora, Herbario, tema claro/oscuro, accesibilidad, adaptación a móvil, páginas legales y pruebas automáticas.

Ideas para seguir creciendo:

- Estado de error en el botón con estados.
- Más categorías en el Manual (Git, CSS, despliegue).
- Feed RSS de la Bitácora.
- Capturas de pantalla en este README.

## Licencia

[MIT](LICENSE) © 2026 Sergio Andres Ramirez Velandia
