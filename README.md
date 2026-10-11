# 🌱 Moss — Digital Garden

Mi "segundo cerebro" técnico: una biblioteca personal y visual donde guardo, documento, pruebo y reutilizo snippets, componentes, guías y artículos.

> El conocimiento técnico no debería quedarse enterrado; debería ser fácil de encontrar, entender, probar, conectar y reutilizar.

**Autor:** Sergio Andres Ramirez Velandia · [Portafolio](https://sergio-velandia.github.io/mi-portafolio/) · [sergio.velandiar.z@gmail.com](mailto:sergio.velandiar.z@gmail.com)

**View** https://sergio-velandia.github.io/Moss/

## Los cuatro pilares

| Pilar | Ruta | Qué es |
| --- | --- | --- |
| **El Laboratorio** | `/laboratorio` | Componentes y snippets con vista previa en vivo y código copiable |
| **El Manual** | `/manual` | Documentación, configuraciones y guías |
| **La Bitácora** | `/bitacora` | Blog técnico: aprendizajes, decisiones y errores |
| **El Herbario** | `/herbario` | Búsqueda global sobre todo el contenido |

## Qué hay dentro

**Laboratorio (8 demos)**

| Demo | Categoría |
| --- | --- |
| Acordeón accesible | Navegación |
| Botón con estados (normal, cargando, éxito) | Botones |
| Botón de copiar al portapapeles | Botones |
| Animación de entrada escalonada | Animaciones |
| Skeleton loader | Loaders |
| Tarjeta tilt 3D | Animaciones |
| Generador de payloads para n8n | Automatización |
| Simulador de flujo n8n | Automatización |

**Manual (8 guías)**

| Categoría | Guía |
| --- | --- |
| APIs | Conectar la API de Gemini de forma segura |
| JavaScript | Debounce y throttle |
| JavaScript | Fetch con manejo de errores y tiempo límite |
| n8n | Webhook básico |
| n8n | Entender webhooks y triggers |
| n8n | Orquestación y manejo de errores |
| React | Estructura de proyecto |
| SQL | Agrupar con GROUP BY |

**Bitácora (7 artículos)**

| Artículo | Categoría |
| --- | --- |
| Por qué Moss no usa base de datos | Arquitectura |
| Cómo funciona la búsqueda del Herbario | Arquitectura |
| La accesibilidad que no se ve | Aprendizajes |
| Un botón también tiene estados | Aprendizajes |
| Apuntes sobre la tarjeta tilt 3D | Aprendizajes |
| La naturaleza de Moss | Filosofía |
| Migrando scripts sueltos a flujos de n8n | Arquitectura |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS 4 · React Router · Motion · Recharts · Lucide · react-markdown · Shiki · MiniSearch · Vitest · oxlint.

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

## Dashboard del Inicio

La columna "Signos vitales del jardín" del Inicio resume el contenido en tres gráficos: el ritmo de crecimiento (elementos por mes, con los meses vacíos a 0 y como mucho los últimos 12), el ecosistema (las 7 tecnologías más mencionadas) y la distribución entre Laboratorio, Manual y Bitácora.

- **De dónde salen los datos.** `getGardenItems()` en `src/lib/dashboard.ts` reúne las demos (`technology` de su `meta`) y los documentos (`technologies` y `createdAt` del frontmatter), sin borradores en la web publicada. Las agregaciones (`byMonth`, `byTechnology`, `byType`) son funciones puras con pruebas en `dashboard.test.ts`; todas las cifras de las tarjetas salen de ellas.
- **Añadir o unificar tecnologías.** No hay que registrar nada: basta con escribirla en el frontmatter. Si aparece con varios nombres (`react`, `React.js`), añade el alias en `technologyAliases` (clave en minúsculas → nombre visible).
- **Datos de ejemplo.** Con menos de `MIN_REAL_ITEMS` (10) elementos reales, el tablero muestra `MOCK_ITEMS` y una nota que lo indica. Se editan en `mockSeed`: cada fila es `[meses atrás, día, tipo, título, tecnologías]`, así que el ejemplo siempre termina en el mes actual.
- **Colores.** Las series usan los tokens `--c-chart-1`, `--c-chart-2` y `--c-chart-3` de `src/index.css` (contraste ≥ 3:1 en ambos temas).
- **Accesibilidad.** Cada tarjeta es una `<figure>` con su frase resumen y un desplegable "Ver datos como tabla". Las barras y el radar se recorren con el teclado (Tab y flechas).

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
- El dashboard del Inicio (Recharts) va en su propio chunk y se carga con un esqueleto de las mismas medidas.
- El resaltado de código con Shiki carga cada lenguaje por separado.

## Páginas legales

`/terminos`, `/privacidad` y `/proteccion-de-datos` se escriben en `content/legal/*.md` y leen sus datos de `src/data/site.ts` (nombre, correo, portafolio, país) mediante las variables `{{owner}}`, `{{email}}`, `{{portfolio}}`, `{{repo}}` y `{{country}}`.

> Los textos son un borrador base redactado a partir de lo que Moss hace hoy (sin cuentas, formularios, cookies ni analítica); **no son asesoría legal**. Si añades analítica, cookies o formularios, actualiza antes la política de privacidad.

## Despliegue en GitHub Pages

🌐 **En línea:** https://sergio-velandia.github.io/Moss/

El despliegue es automático: cada push a `main` ejecuta el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que comprueba `site.ts`, pasa las pruebas y el lint, genera el build y lo publica en GitHub Pages. También se puede lanzar a mano desde la pestaña **Actions** (*Run workflow*). Si algún paso falla, no se publica nada y la versión anterior sigue en línea.

**Configuración única en GitHub:** *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

Cómo está preparado el proyecto para vivir en la subruta `/Moss/`:

- **`vite.config.ts`** usa `base: '/Moss/'` al hacer el build (en desarrollo sigue en la raíz `/`). Si renombras el repositorio, cambia este valor.
- **`src/App.tsx`** pasa `basename={import.meta.env.BASE_URL}` al `BrowserRouter`, así que las rutas y los enlaces internos (también los de Markdown) incluyen la subruta solos.
- **`index.html`** referencia los archivos de `public/` con `%BASE_URL%` (por ejemplo `%BASE_URL%favicon.svg`). Haz lo mismo con cualquier recurso nuevo de `public/`; dentro de componentes usa `import.meta.env.BASE_URL`.
- **Recargar una ruta interna** (`/Moss/manual/...`) funciona porque el workflow copia `index.html` como `404.html`: GitHub Pages lo sirve y React Router resuelve la ruta en el navegador. Esas páginas responden con código HTTP 404 aunque se vean bien.

Para revisar el build igual que en producción:

```bash
npm run build && npm run preview   # abre http://localhost:4173/Moss/
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
