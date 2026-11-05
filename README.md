# 🌱 Moss — Digital Garden

Mi "segundo cerebro" técnico: una biblioteca personal y visual donde guardo, documento, pruebo y reutilizo snippets, componentes, guías y artículos. Cada guía nace de algo que hice de verdad en mis proyectos, y las rutas ordenan todo en recorridos de principio a fin.

> El conocimiento técnico no debería quedarse enterrado; debería ser fácil de encontrar, entender, probar, conectar y reutilizar.

🌐 **En vivo:** https://sergio-velandia.dev/Moss/ · **Estado:** estable · [Cambios](CHANGELOG.md) · [Pendientes](ROADMAP.md)

**Autor:** Sergio Andres Ramirez Velandia · [Portafolio](https://sergio-velandia.dev/mi-portafolio/) · [contacto@sergio-velandia.dev](mailto:contacto@sergio-velandia.dev) · [Propón una idea](https://sergio-velandia.dev/Moss/propon-una-idea)

## Secciones

| Sección | Qué es |
| --- | --- |
| [**Rutas**](https://sergio-velandia.dev/Moss/rutas) | Recorridos ordenados de guías, demos y artículos; el mejor punto de partida |
| [**El Laboratorio**](https://sergio-velandia.dev/Moss/laboratorio) | Componentes, Piezas Tailwind y retos con vista previa en vivo y código copiable |
| [**El Manual**](https://sergio-velandia.dev/Moss/manual) | Documentación, configuraciones y guías, agrupadas por categoría |
| [**La Bitácora**](https://sergio-velandia.dev/Moss/bitacora) | Blog técnico: aprendizajes, decisiones y errores |
| [**El Herbario**](https://sergio-velandia.dev/Moss/herbario) | Búsqueda global sobre todo el contenido |
| [**Proyectos**](https://sergio-velandia.dev/Moss/proyectos) | Cómo están hechos mis proyectos por dentro |
| [**Moss Nexus**](https://sergio-velandia.dev/Moss/nexus) | El sitio hermano, con flujos de n8n listos para copiar. Proyecto independiente, sin relación oficial con n8n GmbH |
| [**Propón una idea**](https://sergio-velandia.dev/Moss/propon-una-idea) | Formularios para proponer contenido o escribirme |

## Empezar

Requisitos: Node.js 22.13 o superior en la rama 22, o 24 en adelante. El despliegue usa la 22.

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # comprobación de tipos + build de producción en dist/
npm run preview  # sirve dist/ para revisar el build
npm run test     # pruebas de datos, contenido y comportamiento
npm run lint
npm run check:publish   # falla si site.ts aún tiene datos sin rellenar
```

**Stack:** React · Vite · TypeScript · Tailwind CSS · React Router · Motion · Recharts · Lucide · react-markdown · Shiki · MiniSearch · Vitest · oxlint. El contenido vive en archivos del repositorio, versionados con Git. Sin base de datos ni backend.

Cómo está armado por dentro, con sus decisiones y lo que aprendí, está en [su ficha de Proyectos](https://sergio-velandia.dev/Moss/proyectos/moss).

## Cómo añadir contenido

<details>
<summary><strong>Una demo al Laboratorio</strong></summary>

Crea un archivo en `src/lab/entries/`, por ejemplo `mi-demo.tsx`. Exporta `meta` y el componente por defecto. El código que se muestra en la web es el propio archivo.

```tsx
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Mi demo',
  description: 'Qué hace, en una frase.',
  technology: 'React', // React | CSS | HTML | JavaScript
  category: 'Interfaz', // una categoría con una sola demo no pasa las pruebas
  tags: ['botón', 'hover'],
  createdAt: '2026-10-10',
  usage: 'Cómo se usa.',
  dependencies: ['lucide-react'], // opcional
  notes: ['Accesibilidad y movimiento.'], // opcional
  usedIn: [{ label: 'Moss: inicio', url: 'https://sergio-velandia.dev/Moss/' }], // opcional
  related: ['manual/css/capas-y-tokens-en-tailwind-4'], // opcional: ids del jardín
}

export default function MiDemo() {
  return <button>Hola</button>
}
```

Las piezas de la categoría **Piezas Tailwind** deben traer `notes`, `usedIn` y al menos un `related` a un manual o artículo: las pruebas lo exigen, igual que que cada `related` exista y que `usedIn` apunte a `sergio-velandia.dev`. Para los enlaces a Moss Nexus, usa `site.nexusUrl`.

</details>

<details>
<summary><strong>Un documento al Manual o un artículo a la Bitácora</strong></summary>

**Manual:** crea `content/manual/<categoría>/<nombre>.md`. La carpeta es la categoría y forma parte de la URL; el nombre que se ve se escribe en `MANUAL_CATEGORY_NAMES` (`src/lib/content.ts`), y una prueba exige que toda carpeta tenga el suyo.

**Bitácora:** crea `content/journal/<nombre>.md`.

</details>

<details>
<summary><strong>Una ruta</strong></summary>

Crea `content/routes/<slug>.md`; aparece en `/rutas/<slug>` y el build le da una ruta que responde 200:

```md
title: n8n, de cero a producción
description: …
type: route
level: intermedio      # inicial | intermedio | avanzado
order: 1               # posición en el índice
nexus: true            # opcional: cierra con la invitación a Moss Nexus
steps: [manual/n8n/webhook-basico, lab/n8n-payload-builder, …]
```

`validateRoute` exige al menos 4 pasos que existan, sin repetir, y que mezclen al menos dos secciones. El cuerpo del Markdown explica para quién es la ruta y qué se sabe hacer al terminar.

</details>

<details>
<summary><strong>Un proyecto</strong></summary>

Crea `content/projects/<slug>.md`; la página aparece en `/proyectos/<slug>` y el build le da una ruta que responde 200. Además del frontmatter común, lleva:

```md
status: estable         # desarrollo | estable | mantenimiento | pausado (los del ECOSISTEMA)
theme: moss             # uno de PROJECT_THEMES (src/lib/content.ts)
version: 0.7.5          # versión del proyecto que describe la página («auto» en la ficha de Moss: sale de package.json)
reviewedAt: 2026-10-12  # última vez que se contrastó con el código
repo: https://github.com/…
site: https://…
```

`validateProject` (`src/lib/content.ts`) exige esos campos, las secciones `## Ficha`, `## Arquitectura`, `## Flujo de datos`, `## Decisiones`, `## Lecciones` y `## Roadmap` en ese orden, un diagrama en Arquitectura y en Flujo de datos, y al menos cuatro decisiones escritas como `- **Decisión:** … **En vez de:** … **Porque:** …`. Al revisar una página contra el código, actualiza `reviewedAt` (y `version` si cambió).

Un proyecto con identidad nueva suma su tema a `PROJECT_THEMES`, su clase `.pt-*` en `src/index.css` y su marca en `ProjectMark.tsx`. Esa identidad la usan solo las tarjetas del índice y los botones de la ficha.

</details>

<details>
<summary><strong>Metadatos (frontmatter)</strong></summary>

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
references: [Nodo Webhook | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/]
---
```

Los ids de `related` son `lab/<archivo>`, `manual/<categoría>/<archivo>`, `journal/<archivo>`, `route/<slug>` o `project/<slug>`. Una prueba automática avisa si alguno apunta a algo que no existe.

`references` llena el cuadro **"Leer la documentación oficial"** al final de cada guía del Manual: cada elemento es `Título | https://…` (solo se aceptan enlaces https, y el título no puede llevar comas). Una prueba exige que todas las guías del Manual tengan al menos una referencia.

> El parser de frontmatter es mínimo a propósito: admite texto, `true/false` y listas en una línea `[a, b]`. No admite listas multilínea ni comas dentro de un elemento de la lista.

</details>

<details>
<summary><strong>Imágenes</strong></summary>

Guarda la imagen en `content/images/` con sus dimensiones al final del nombre y cítala desde cualquier documento:

```md
![Texto alternativo que describe la imagen](/imagenes/tarjetas-de-proyectos-992x312.webp "Pie de foto opcional")
```

El sufijo `-<ancho>x<alto>` da al `<img>` sus dimensiones, así la página no salta al cargar; se carga de forma diferida y Vite le pone hash. Usa WebP. Las pruebas exigen que cada imagen citada exista, tenga un texto alternativo real y que no queden imágenes sin usar.

</details>

<details>
<summary><strong>Diagramas dentro del Markdown</strong></summary>

Un bloque de código con el lenguaje `flow` o `mindmap` se dibuja como diagrama (HTML y CSS con los colores del tema, sin librerías) en lugar de mostrarse como código. Para un lector de pantalla son listas: pasos en orden o ramas con sus hijos.

```flow
# Título opcional
Webhook :: recibe el POST
? ¿Válido?
+ Responder 201 | ! Responder 400
```

- Una línea por paso; `|` separa ramas paralelas del mismo paso (máximo 3). Con 5 pasos o menos el flujo va en horizontal desde 768 px; en móvil, siempre en vertical.
- `::` separa el título del detalle. Los prefijos `? `, `+ ` y `! ` marcan un nodo como decisión, resultado correcto o error.

```mindmap
Debounce y throttle
- Debounce :: espera a que paren los eventos
  - Buscador
  - Autoguardado
- Throttle :: como mucho una vez cada X ms
```

- La primera línea es el centro; `- ` son ramas (de 2 a 4) y `  - ` (con sangría) sus hijos.

Los nodos aparecen uno tras otro la primera vez que el diagrama entra en pantalla, y de golpe si el sistema pide menos movimiento. Una prueba exige al menos un diagrama por guía del Manual.

</details>

## Notas para mantenerlo

- **Rutas.** El progreso se guarda solo en el navegador (`moss-route-progress`, descrito en la privacidad). El tiempo estimado suma el tiempo de lectura de cada documento y `LAB_MINUTES` por demo.
- **Moss Nexus.** Sus tokens viven aislados en la clase `.nexus` de `src/index.css`, copiados de su repositorio, y sus fuentes se cargan solo en `/nexus`. La URL está en una sola constante, `site.nexusUrl` en `src/data/site.ts`; una prueba impide repetirla en el código.
- **Pantalla de entrada.** Vive en `index.html`, sin React, con `src/styles/entrada.css` y los tokens `--c-entrada-*`, así que el build la lleva a todas las páginas. No guarda nada en el navegador. `src/styles/entrada.test.ts` y `scripts/entrada-css.test.ts` comprueban cuándo aparece, su duración máxima, que solo anime `transform` y `opacity`, y su contraste.
- **Formularios.** Los campos, sus textos, la validación, el correo y el envío están en `src/lib/contact-form.ts`. El envío usa la API REST de EmailJS con `fetch`, sin su SDK. Sus tres identificadores (`site.emailjs`) son públicos por diseño: viajan al navegador. La plantilla y el correo de destino se configuran en EmailJS, y es la misma que usa Moss Nexus, con las variables `tipo`, `nombre`, `correo` (como Reply-To), `asunto` y `mensaje`. Si falta un identificador, el formulario avisa de que el envío no está activo.
- **Tablero del Inicio.** `getGardenItems()` en `src/lib/dashboard.ts` reúne demos y documentos, y las cifras salen de funciones puras con pruebas. Si una tecnología aparece con varios nombres, añade el alias en `technologyAliases` (clave en minúsculas → nombre visible). Con menos de `MIN_REAL_ITEMS` elementos reales, el tablero muestra datos de ejemplo, editables en `mockSeed`, y una nota que lo indica. Las series usan los tokens `--c-chart-*`.
- **Idioma.** Se traduce la interfaz, no el contenido. Cada componente tiene su objeto `TEXT = { es: {...}, en: {...} }` y lo lee con `const t = useT(TEXT)`. Cómo funciona: [Interfaz bilingüe sin librerías](https://sergio-velandia.dev/Moss/manual/react/interfaz-bilingue-sin-librerias).
- **Tema.** Los colores son tokens en `src/index.css`: para cambiar la paleta basta con editar las variables de `:root` y `:root[data-theme="dark"]`.
- **Páginas legales.** Se escriben en `content/legal/*.md` y leen sus datos de `src/data/site.ts` con las variables `{{owner}}`, `{{email}}`, `{{portfolio}}`, `{{repo}}` y `{{country}}`.

> Los textos legales son un borrador base redactado a partir de lo que Moss hace hoy; **no son asesoría legal**. Si añades analítica, cookies u otros formularios, actualiza antes la política de privacidad.

## Despliegue

Cada push a `main` ejecuta [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que comprueba `site.ts`, pasa las pruebas y el lint, genera el build y lo publica en GitHub Pages. También se puede lanzar a mano desde la pestaña **Actions**. Si algún paso falla, no se publica nada y la versión anterior sigue en línea.

**Configuración única en GitHub:** *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

El dominio propio está configurado en el repositorio raíz `Sergio-Velandia.github.io`, igual que el `robots.txt`. Los proyectos heredan el dominio con su misma ruta, así que el `base` de Vite sigue siendo `/Moss/`. Si tocas esto:

- **Si renombras el repositorio,** cambia `base` en `vite.config.ts`.
- **Un recurso nuevo de `public/`** se referencia con `%BASE_URL%` en `index.html` y con `import.meta.env.BASE_URL` en los componentes.
- **Una sección nueva** se suma a `STATIC_ROUTES` en `vite.config.ts`, para que `scripts/static-pages.ts` le cree su página con código 200, su título, su descripción y sus metadatos para compartir. Las pruebas comprueban que las secciones existan en el router y que cada página tenga título.

Cómo y por qué: [Una SPA en GitHub Pages sin 404](https://sergio-velandia.dev/Moss/manual/despliegue/spa-en-github-pages-sin-404) y [Que se vea bien al compartirlo](https://sergio-velandia.dev/Moss/manual/despliegue/que-se-vea-bien-al-compartirlo).

Para revisar el build igual que en producción:

```bash
npm run build && npm run preview   # abre http://localhost:4173/Moss/
```

## Seguridad

Este repositorio es público. No se guardan claves reales: usa variables de entorno (`.env`, ignorado por Git) y valores ficticios en los ejemplos. Ver `.env.example`. Ten en cuenta que en Vite cualquier variable `VITE_*` acaba dentro del JavaScript publicado, así que nunca debe contener secretos. Las demos son componentes locales preparados; Moss no ejecuta código arbitrario.

## Licencia

[MIT](LICENSE) © 2026 Sergio Andres Ramirez Velandia
