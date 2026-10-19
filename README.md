# 🌱 Moss — Digital Garden

Mi "segundo cerebro" técnico: una biblioteca personal y visual donde guardo, documento, pruebo y reutilizo snippets, componentes, guías y artículos.

> El conocimiento técnico no debería quedarse enterrado; debería ser fácil de encontrar, entender, probar, conectar y reutilizar.

**Autor:** Sergio Andres Ramirez Velandia · [Portafolio](https://sergio-velandia.dev/mi-portafolio/) · [contacto@sergio-velandia.dev](mailto:contacto@sergio-velandia.dev)

**View** https://sergio-velandia.dev/Moss/

## Los cuatro pilares

| Pilar | Ruta | Qué es |
| --- | --- | --- |
| **El Laboratorio** | `/laboratorio` | Componentes y snippets con vista previa en vivo y código copiable |
| **El Manual** | `/manual` | Documentación, configuraciones y guías |
| **La Bitácora** | `/bitacora` | Blog técnico: aprendizajes, decisiones y errores |
| **El Herbario** | `/herbario` | Búsqueda global sobre todo el contenido |

## Rutas

`/rutas` reúne guías, demos, retos y artículos de un mismo tema en un recorrido ordenado, para aprenderlo de principio a fin:

| Ruta | Nivel | Pasos |
| --- | --- | --- |
| n8n, de cero a producción | Intermedio | 11, empieza instalando n8n, con dos flujos fáciles de Moss Nexus para practicar, y cierra con la invitación a Nexus |
| Frontend con React y Tailwind | Intermedio | 7 |
| Datos y reportes con SQL | Intermedio | 8 |
| Del repo a producción: publicar y mantener un proyecto web | Inicial | 11 pasos y un proyecto final (13 lecturas), con la evidencia real de Moss, Moss Nexus y el portafolio |

Cada paso se marca como hecho y el progreso se guarda **solo en el navegador** (`moss-route-progress`, descrito en la privacidad). Dentro de cada guía o demo que forma parte de una ruta aparece en qué paso estás y cuál viene después. El tiempo estimado suma el tiempo de lectura real de cada documento y 5 minutos por demo.

## Proyectos

`/proyectos` documenta mis proyectos como un ingeniero explica su trabajo: cómo están armados por dentro, cómo viajan los datos, qué decisiones tomé (con la alternativa descartada) y qué aprendí. No repite los README: los enlaza. Hoy: Moss, Moss Nexus y el portafolio.

Cada proyecto se ve con su propia identidad: Moss en salvia, Moss Nexus en musgo y coral, y el portafolio en grafito con un único acento dorado, tomados de los estilos de cada repositorio. La usan solo las tarjetas del índice y los botones de la ficha (clases `.pt-*` en `src/index.css`); al pasar el cursor, la tarjeta tiñe su borde y enciende un resplandor de su color sin levantarse.

Cada página sigue la misma plantilla, en este orden: **Ficha, Arquitectura, Flujo de datos, Decisiones, Lecciones y Roadmap**, más los relacionados. La ficha muestra «Documentado en vX.Y.Z» y «Última revisión», que salen del frontmatter; si alguno falta, las pruebas fallan.

## Moss Nexus

[Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/) es el sitio hermano: una librería de flujos de n8n ya armados, explicados y listos para copiar. En Moss se aprende el porqué; en Nexus se copia el flujo y se usa.

- La página `/nexus` lo presenta y la cabecera (y el menú móvil) tiene un acceso con su marca.
- Solo esos dos elementos usan el estilo de Nexus: sus tokens viven aislados en la clase `.nexus` de `src/index.css`, copiados del repositorio de Nexus, y sus fuentes (Inter y JetBrains Mono) se cargan solo en `/nexus`. El resto de Moss no cambia.
- La URL está en una sola constante, `site.nexusUrl` en `src/data/site.ts`; una prueba impide repetirla en el código.
- Nexus es un proyecto independiente, sin relación oficial con n8n GmbH.

## Qué hay dentro

**Laboratorio (17 demos)**

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
| Reintentos con backoff y jitter | Automatización |
| Resumen de factura con IVA | Facturación |
| Exportar a CSV que Excel abre bien | Datos |
| Reto: la tarjeta que rompe la cuadrícula | Retos Tailwind |
| Reto: la cabecera que no cabe (container queries) | Retos Tailwind |
| Reto: una tarjeta, tres identidades (variables CSS) | Retos Tailwind |
| Pieza: botones con variantes | Piezas Tailwind |
| Pieza: tarjetas enlazadas | Piezas Tailwind |
| Pieza: chips, etiquetas e insignias | Piezas Tailwind |

Los **retos** reproducen un error real con un interruptor «Sin arreglo / Con arreglo» y explican la causa.

Las **piezas** son componentes que ya uso en Moss y Moss Nexus, en versión limpia para copiar: muestran sus variantes, funcionan en los dos temas y traen notas de accesibilidad y movimiento, dónde se usan de verdad y el manual o la bitácora que las explica. Solo animan `transform` y `opacity`. Pendientes de próximos lotes: formularios, avisos y estados vacíos; navegación, pestañas y acordeón; modal, skeleton e interruptor de tema. El chip que se puede quitar (×) queda pendiente hasta que lo use en alguna app.

**Manual (32 guías)**

Las guías marcadas con ★ parten de un problema real de empresa: duplicados en el CRM, reportes que nadie quiere hacer, cobros dobles, exportaciones que Excel rompe…

| Categoría | Guía |
| --- | --- |
| CSS | Capas CSS y tokens en Tailwind 4 |
| Despliegue | Una SPA en GitHub Pages sin 404 |
| Despliegue | Dominio propio para GitHub Pages con Cloudflare DNS y correo |
| Despliegue | Correo con tu dominio usando Cloudflare Email Routing |
| Despliegue | Migrar a un dominio nuevo sin romper nada |
| Despliegue | La fase legal en un proyecto personal |
| Despliegue | Que se vea bien al compartirlo: Open Graph, canonical, sitemap y robots |
| Despliegue | Mantener vivo un proyecto publicado |
| Despliegue | Proyecto final: publica tu propio sitio de principio a fin |
| Git | Git con intención: commits que cuentan qué cambió |
| Git | Un README que se lee |
| APIs | Conectar la API de Gemini de forma segura |
| APIs | ★ Idempotencia en pagos y webhooks |
| APIs | ★ Paginación y límites de tasa en APIs de terceros |
| JavaScript | Debounce y throttle |
| JavaScript | Fetch con manejo de errores y tiempo límite |
| JavaScript | ★ Exportar CSV que Excel abre bien |
| JavaScript | ★ Dinero y fechas sin errores con Intl |
| JavaScript | Verificar la interfaz con capturas reales |
| n8n | Instalar n8n en tu equipo con Docker o empezar en n8n Cloud |
| n8n | Webhook básico |
| n8n | Entender webhooks y triggers |
| n8n | Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2 |
| n8n | Orquestación y manejo de errores |
| n8n | Conectar Slack a n8n con un bot (token xoxb) |
| n8n | ★ Reporte diario automático por correo o Slack |
| n8n | ★ Sincronizar un formulario con el CRM sin duplicados |
| React | Estructura de proyecto |
| React | Interfaz bilingüe sin librerías |
| SQL | Agrupar con GROUP BY |
| SQL | ★ Detectar y fusionar clientes duplicados |
| SQL | ★ Reporte de ventas mensual con variación |

**Bitácora (14 artículos)**

| Artículo | Categoría |
| --- | --- |
| Por qué Moss no usa base de datos | Arquitectura |
| Cómo funciona la búsqueda del Herbario | Arquitectura |
| La accesibilidad que no se ve | Aprendizajes |
| Un botón también tiene estados | Aprendizajes |
| Apuntes sobre la tarjeta tilt 3D | Aprendizajes |
| La naturaleza de Moss | Filosofía |
| Migrando scripts sueltos a flujos de n8n | Arquitectura |
| El reporte que nadie quería hacer | Aprendizajes |
| Datos sucios, el problema silencioso | Arquitectura |
| Cuando un webhook llega dos veces | Arquitectura |
| Lo que encontraron las capturas | Aprendizajes |
| Versionar después | Aprendizajes |
| Documentar proyectos sin repetir el README | Arquitectura |
| Rutas con lo que ya existe | Arquitectura |

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
  notes: ['Accesibilidad y movimiento.'], // opcional
  usedIn: [{ label: 'Moss: inicio', url: 'https://sergio-velandia.dev/Moss/' }], // opcional
  related: ['manual/css/capas-y-tokens-en-tailwind-4'], // opcional: ids del jardín
}

export default function MiDemo() {
  return <button>Hola</button>
}
```

Las piezas de la categoría **Piezas Tailwind** deben traer `notes`, `usedIn` y al menos un `related` a un manual o artículo: las pruebas lo exigen, igual que que cada `related` exista y que `usedIn` apunte a `sergio-velandia.dev`. Para los enlaces a Moss Nexus, usa `site.nexusUrl`.

### Un documento al Manual

Crea `content/manual/<categoría>/<nombre>.md`. La carpeta es la categoría (`react`, `sql`, `apis`, `n8n`, `javascript`…).

### Un artículo a la Bitácora

Crea `content/journal/<nombre>.md`.

### Una ruta

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

### Un proyecto

Crea `content/projects/<slug>.md`; la página aparece en `/proyectos/<slug>` y el build le da una ruta que responde 200. Además del frontmatter común, lleva:

```md
status: activo          # activo | mantenimiento | pausado
theme: moss             # moss | nexus | portafolio: paleta de su tarjeta y sus botones
version: 1.6.0          # versión del proyecto que describe la página
reviewedAt: 2026-10-12  # última vez que se contrastó con el código
repo: https://github.com/…
site: https://…
```

`validateProject` (`src/lib/content.ts`) exige esos campos, las secciones `## Ficha`, `## Arquitectura`, `## Flujo de datos`, `## Decisiones`, `## Lecciones` y `## Roadmap` en ese orden, un diagrama en Arquitectura y en Flujo de datos, y al menos cuatro decisiones escritas como `- **Decisión:** … **En vez de:** … **Porque:** …`. Al revisar una página contra el código, actualiza `reviewedAt` (y `version` si cambió).

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
references: [Nodo Webhook | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/]
---
```

Los ids de `related` son `lab/<archivo>`, `manual/<categoría>/<archivo>` o `journal/<archivo>`. Una prueba automática avisa si alguno apunta a algo que no existe.

`references` llena el cuadro **"Leer la documentación oficial"** al final de cada guía del Manual: cada elemento es `Título | https://…` (solo se aceptan enlaces https, y el título no puede llevar comas). Una prueba exige que todas las guías del Manual tengan al menos una referencia.

### Imágenes

Guarda la imagen en `content/images/` con sus dimensiones al final del nombre y cítala desde cualquier documento:

```md
![Texto alternativo que describe la imagen](/imagenes/tarjetas-de-proyectos-992x312.webp "Pie de foto opcional")
```

El sufijo `-<ancho>x<alto>` da al `<img>` sus dimensiones, así la página no salta al cargar; se carga de forma diferida y Vite le pone hash. Usa WebP. Las pruebas exigen que cada imagen citada exista, tenga un texto alternativo real y que no queden imágenes sin usar.

### Diagramas dentro del Markdown

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

> El parser de frontmatter es mínimo a propósito: admite texto, `true/false` y listas en una línea `[a, b]`. No admite listas multilínea ni comas dentro de un elemento de la lista.

## Búsqueda

El Herbario indexa título, descripción, etiquetas, tecnologías y contenido completo (incluido el código de las demos). "Explorar por etiqueta" muestra primero las 16 etiquetas más usadas, con cuántos elementos tiene cada una, y el resto se despliega con "Ver todas". Ignora tildes y palabras vacías ("de", "para"…), tolera pequeñas erratas y exige todas las palabras de la consulta; si no hay resultados, acepta cualquiera. El índice se construye en el navegador la primera vez que se busca. Los filtros viven en la URL (`?q=…&tipo=…&tec=…`), así que una búsqueda se puede compartir.

## Dashboard del Inicio

La columna "Signos vitales del jardín" del Inicio resume el contenido en tres gráficos: el ritmo de crecimiento (elementos por mes, con los meses vacíos a 0 y como mucho los últimos 12), el ecosistema (las 7 tecnologías más mencionadas) y la distribución entre Laboratorio, Manual y Bitácora.

- **De dónde salen los datos.** `getGardenItems()` en `src/lib/dashboard.ts` reúne las demos (`technology` de su `meta`) y los documentos (`technologies` y `createdAt` del frontmatter), sin borradores en la web publicada. Los proyectos no cuentan: el tablero mide lo plantado, y las fichas de proyecto describen repositorios. Las agregaciones (`byMonth`, `byTechnology`, `byType`) son funciones puras con pruebas en `dashboard.test.ts`; todas las cifras de las tarjetas salen de ellas.
- **Añadir o unificar tecnologías.** No hay que registrar nada: basta con escribirla en el frontmatter. Si aparece con varios nombres (`react`, `React.js`), añade el alias en `technologyAliases` (clave en minúsculas → nombre visible).
- **Datos de ejemplo.** Con menos de `MIN_REAL_ITEMS` (10) elementos reales, el tablero muestra `MOCK_ITEMS` y una nota que lo indica. Se editan en `mockSeed`: cada fila es `[meses atrás, día, tipo, título, tecnologías]`, así que el ejemplo siempre termina en el mes actual.
- **Colores.** Las series usan los tokens `--c-chart-1`, `--c-chart-2` y `--c-chart-3` de `src/index.css` (contraste ≥ 3:1 en ambos temas).
- **Accesibilidad.** Cada tarjeta es una `<figure>` con su frase resumen y un desplegable "Ver datos como tabla". Las barras y el radar se recorren con el teclado (Tab y flechas).

## Idioma

El selector **ES / EN** de la cabecera cambia la interfaz entre español (por defecto) e inglés. La elección se guarda en el navegador (`moss-lang`), `?lang=en` en la URL abre la página directamente en inglés (útil para compartir) y `<html lang>` se actualiza para lectores de pantalla.

- Se traduce la **interfaz**: navegación, páginas, filtros, el tablero del Inicio, los avisos y las etiquetas de accesibilidad. El contenido (Markdown, demos y textos legales) sigue en español; en inglés, las páginas de contenido muestran el aviso "This content is written in Spanish" y ese contenido va marcado con `lang="es"`.
- Sin librerías: `src/lib/i18n.ts` guarda el idioma igual que `theme.ts` guarda el tema. Cada componente tiene su objeto `TEXT = { es: {...}, en: {...} }` y lo lee con `const t = useT(TEXT)`.

## Tema claro y oscuro

El botón de la cabecera alterna entre los dos temas. Sin elección manual, Moss sigue el tema del sistema; la elección se guarda en el navegador (`moss-theme`) y se aplica antes de pintar para evitar el parpadeo. Los colores son tokens en `src/index.css`: para cambiar la paleta basta con editar las variables de `:root` y `:root[data-theme="dark"]`.

## Accesibilidad y móvil

- Navegación por teclado completa, enlace "Saltar al contenido", foco visible y foco movido al contenido al cambiar de página.
- Menú con `aria-expanded`, cierre con Escape y botones de al menos 44 px en pantallas táctiles. Se usa por debajo de 1024 px; desde ahí la navegación completa cabe en la cabecera.
- Cada página fija su propio título.
- Respeta `prefers-reduced-motion` (animaciones de entrada y tarjeta tilt).
- Contraste de colores comprobado contra WCAG 2.2 AA en ambos temas.
- El contenido Markdown no ejecuta HTML crudo.

## Rendimiento

- El Herbario, los artículos y las páginas legales se cargan bajo demanda (lazy loading): el renderizador de Markdown y el buscador solo se descargan al visitarlas.
- El dashboard del Inicio (Recharts) va en su propio chunk y se carga con un esqueleto de las mismas medidas.
- La página de Nexus y sus fuentes se descargan solo al visitarla.
- El resaltado de código con Shiki carga cada lenguaje por separado.

## Páginas legales

`/terminos`, `/privacidad` y `/proteccion-de-datos` se escriben en `content/legal/*.md` y leen sus datos de `src/data/site.ts` (nombre, correo, portafolio, país) mediante las variables `{{owner}}`, `{{email}}`, `{{portfolio}}`, `{{repo}}` y `{{country}}`.

> Los textos son un borrador base redactado a partir de lo que Moss hace hoy (sin cuentas, formularios, cookies ni analítica); **no son asesoría legal**. Si añades analítica, cookies o formularios, actualiza antes la política de privacidad.

## Despliegue en GitHub Pages

🌐 **En línea:** https://sergio-velandia.dev/Moss/

El sitio usa el dominio propio `sergio-velandia.dev`, configurado en el repositorio raíz `Sergio-Velandia.github.io`: los proyectos lo heredan con su misma ruta, así que el `base` de Vite sigue siendo `/Moss/`. Las direcciones antiguas de `github.io` redirigen solas al dominio nuevo.

El despliegue es automático: cada push a `main` ejecuta el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que comprueba `site.ts`, pasa las pruebas y el lint, genera el build y lo publica en GitHub Pages. También se puede lanzar a mano desde la pestaña **Actions** (*Run workflow*). Si algún paso falla, no se publica nada y la versión anterior sigue en línea.

**Configuración única en GitHub:** *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

Cómo está preparado el proyecto para vivir en la subruta `/Moss/`:

- **`vite.config.ts`** usa `base: '/Moss/'` al hacer el build (en desarrollo sigue en la raíz `/`). Si renombras el repositorio, cambia este valor.
- **`src/App.tsx`** pasa `basename={import.meta.env.BASE_URL}` al `BrowserRouter`, así que las rutas y los enlaces internos (también los de Markdown) incluyen la subruta solos.
- **`index.html`** referencia los archivos de `public/` con `%BASE_URL%` (por ejemplo `%BASE_URL%favicon.svg`). Haz lo mismo con cualquier recurso nuevo de `public/`; dentro de componentes usa `import.meta.env.BASE_URL`.
- **Recargar una ruta interna** (`/Moss/manual/...`) funciona porque el workflow copia `index.html` como `404.html`: GitHub Pages lo sirve y React Router resuelve la ruta en el navegador. Esas páginas responden con código HTTP 404 aunque se vean bien.
- **Rutas que responden 200.** Las rutas pensadas para compartirse están en `STATIC_ROUTES` (`vite.config.ts`): el build copia `index.html` en `<ruta>/index.html` y GitHub Pages las sirve con código 200. Hoy `/nexus`, `/proyectos` y `/rutas`, más una por cada `content/projects/<slug>.md` y `content/routes/<slug>.md` publicado, que el build detecta solo. Las pruebas comprueban que existan en el router.

Para revisar el build igual que en producción:

```bash
npm run build && npm run preview   # abre http://localhost:4173/Moss/
```

## Estructura

```
content/
├── manual/<categoría>/*.md
├── journal/*.md
├── projects/*.md
├── routes/*.md
└── legal/*.md
public/            # favicon e imágenes estáticas
scripts/           # check-site.mjs: comprobación antes de publicar
src/
├── components/    # layout, code, content, dashboard, nexus
├── lab/entries/   # demos del Laboratorio
├── data/          # site.ts: autor, contacto, portafolio, repositorio y URL de Nexus
├── lib/           # lab, content, knowledge, search, frontmatter, theme, legal
└── pages/
```

## Seguridad

Este repositorio es público. No se guardan claves reales: usa variables de entorno (`.env`, ignorado por Git) y valores ficticios en los ejemplos. Ver `.env.example`. Ten en cuenta que en Vite cualquier variable `VITE_*` acaba dentro del JavaScript publicado, así que nunca debe contener secretos. Las demos son componentes locales preparados; Moss no ejecuta código arbitrario.

## Estado

✅ **Estable desde la versión 1.0:** Laboratorio, Manual, Bitácora, Herbario, tema claro/oscuro, accesibilidad, adaptación a móvil, páginas legales y pruebas automáticas.

El historial de versiones está en [CHANGELOG.md](CHANGELOG.md), con [Versionado Semántico](https://semver.org/lang/es/): MINOR para funciones o lotes de contenido nuevos, PATCH para correcciones y documentación, y MAJOR si cambian rutas existentes. La versión de `package.json` coincide siempre con la última del CHANGELOG, y cada versión se marca con un tag `vX.Y.Z`.

Ideas para seguir creciendo:

- Estado de error en el botón con estados.
- Más categorías en el Manual (pruebas).
- Traducir también el contenido al inglés (por ejemplo, con archivos `.en.md` junto a los originales).
- Feed RSS de la Bitácora.
- Capturas de pantalla en este README.
- **Fase futura (MINOR): metadatos para compartir y buscadores.** Ahora que el dominio es fijo: Open Graph y Twitter Card con imagen, `canonical` por página, `robots.txt` y `sitemap.xml`.

## Licencia

[MIT](LICENSE) © 2026 Sergio Andres Ramirez Velandia
