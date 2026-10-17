---
title: Moss
description: Jardín digital estático donde documento, pruebo y conecto lo que aprendo, sin backend ni base de datos.
type: project
status: activo
theme: moss
version: 1.6.0
reviewedAt: 2026-10-12
repo: https://github.com/Sergio-Velandia/Moss
site: https://sergio-velandia.dev/Moss/
tags: [arquitectura, jardín-digital, decisiones, sin backend, sitio estático]
technologies: [React, TypeScript, Vite, Markdown]
createdAt: 2026-10-12
related: [journal/por-que-moss-no-usa-base-de-datos, journal/como-funciona-la-busqueda-del-herbario, journal/la-naturaleza-de-moss, manual/react/estructura-de-proyecto]
---

## Ficha

Moss es mi "segundo cerebro" técnico publicado como sitio: demos que se pueden probar, guías, artículos y un buscador sobre todo ello. Es un sitio estático; cada pieza de contenido es un archivo del repositorio.

**Problema que resuelve:** el conocimiento técnico se pierde entre notas sueltas, pestañas y proyectos viejos. Moss lo junta en un lugar donde se puede encontrar, probar el código en vivo y ver cómo se conecta una pieza con otra. Cómo se instala y qué contiene está en el [README](https://github.com/Sergio-Velandia/Moss#readme); esta página cuenta cómo está hecho por dentro.

## Arquitectura

```mindmap
Moss
- Contenido :: archivos en el repositorio
  - content/ en Markdown
  - demos en src/lab/entries
  - site.ts
- Capa de datos :: funciones sin React
  - content.ts y lab.ts
  - knowledge.ts
  - search.ts y dashboard.ts
- Interfaz :: React Router
  - páginas con carga diferida
  - MarkdownView y Diagram
  - i18n.ts y theme.ts
- Entrega :: GitHub Pages
  - Actions con pruebas y lint
  - 404.html
  - rutas estáticas
```

Cuatro capas que solo se hablan en una dirección. El **contenido** no sabe nada de la interfaz: un archivo Markdown con su frontmatter o un componente de demo con su objeto `meta`. La **capa de datos** convierte esos archivos en listas tipadas con funciones puras, que se prueban con Vitest sin montar React. La **interfaz** solo lee esas listas. La **entrega** es un build estático: no hay servidor que mantener.

Lo pesado se carga cuando hace falta. El buscador, el renderizador de Markdown, el resaltado de código y los gráficos del tablero viven en chunks aparte que se descargan al visitar la página que los usa.

## Flujo de datos

```flow
# Del archivo al índice (al compilar)
Archivo :: un .md en content/ o una demo .tsx
import.meta.glob :: Vite lo incluye como texto
Frontmatter :: título, etiquetas, fechas y relaciones
+ Listas tipadas :: demos, guías, artículos y proyectos
```

```flow
# Del índice a la pantalla (en el navegador)
Listas tipadas :: ya cargadas con la página
Páginas :: Manual, Bitácora, Laboratorio y Proyectos | Herbario :: knowledge.ts une todo y MiniSearch lo indexa en la primera búsqueda | Tablero :: agregaciones puras sobre demos, guías y artículos
```

Todo lo que el sitio sabe se decide al compilar. Vite lee los archivos con `import.meta.glob` y el parser de frontmatter extrae los metadatos: el resultado son listas tipadas de demos, guías, artículos y proyectos. `knowledge.ts` las une en una sola vista que usan «Recién plantado», los relacionados y el Herbario. En el navegador no hay peticiones de contenido: el buscador construye su índice en memoria la primera vez que se usa, y el tablero calcula sus cifras con las listas de demos, guías y artículos.

## Decisiones

- **Decisión:** el contenido vive en archivos Markdown dentro del repositorio y se incluye al compilar. **En vez de:** una base de datos o un CMS con backend. **Porque:** escribir es crear un archivo, todo queda versionado en Git y el sitio sigue siendo estático. El razonamiento completo está en [Por qué Moss no usa base de datos](/bitacora/por-que-moss-no-usa-base-de-datos).
- **Decisión:** búsqueda en el navegador con MiniSearch, que exige todas las palabras y, si no hay resultados, acepta cualquiera. **En vez de:** un servicio de búsqueda externo. **Porque:** el jardín cabe en memoria, no hay claves ni servidores, y los filtros viven en la URL para poder compartir una búsqueda. Detalles en [Cómo funciona la búsqueda del Herbario](/bitacora/como-funciona-la-busqueda-del-herbario).
- **Decisión:** un parser de frontmatter propio, mínimo, que solo admite texto, booleanos y listas en una línea. **En vez de:** un parser YAML completo. **Porque:** el contenido no necesita más, el parser cabe en unas líneas y sus límites están documentados; si un documento los supera, es señal de que se está complicando.
- **Decisión:** los diagramas se escriben como bloques `flow` y `mindmap` dentro del Markdown y se dibujan con HTML y CSS. **En vez de:** una librería de diagramas como Mermaid. **Porque:** usan los colores del tema sin configuración extra, son listas reales para un lector de pantalla y no suman una dependencia pesada.
- **Decisión:** el idioma de la interfaz es un estado propio con `useSyncExternalStore`, el mismo patrón que el tema claro y oscuro, y el contenido sigue en español marcado con `lang="es"`. **En vez de:** una librería de traducción o traducir todos los documentos. **Porque:** traducir la interfaz no necesita dependencias, y traducir el contenido es otro proyecto.
- **Decisión:** el tablero del Inicio calcula sus cifras con funciones puras y carga los gráficos en un chunk aparte. **En vez de:** calcular dentro de los componentes y cargar la librería de gráficos con el resto del sitio. **Porque:** las agregaciones se prueban sin navegador y quien no visita el Inicio no descarga los gráficos.
- **Decisión:** rutas limpias con `BrowserRouter`, un `404.html` que es la misma app y copias estáticas de las rutas que se comparten. **En vez de:** `HashRouter` (`/#/manual/...`). **Porque:** las URL se leen y se comparten mejor, y las rutas pensadas para compartirse responden con código 200.

## Lecciones

- **La versión decía una cosa y el código otra.** El README anunciaba la versión 1.0 mientras `package.json` seguía en 0.0.0 y no había CHANGELOG; tuve que reconstruir el historial a partir de git. Hoy versionaría desde el primer commit.
- **El build es la prueba que más importa.** Una prueba nueva usaba APIs de Node y rompió `npm run build`, porque `tsc -b` también revisa los tipos de las pruebas. Ahora corro test, lint y build antes de cada commit.
- **"Funciona en mi equipo" no es "funciona en Pages".** `vite preview` no servía el sitio bajo `/Moss/` como en producción, y el favicon apunta a un archivo que cambió de carpeta: en producción responde 404. Probaría el build en las mismas condiciones que Pages desde el principio.
- **Las pruebas de contenido atrapan lo que no se ve a ojo.** Que cada `related` exista, que cada guía tenga diagrama y referencias, que un CSV escape bien sus comillas: varias fallaron antes de publicar algo roto.
- **Lo que haría distinto:** cargar el texto de cada documento bajo demanda desde el principio; hoy todo el contenido viaja en el JavaScript inicial y crece con cada guía.

## Roadmap

Sin fechas; en el orden en que me parecen más útiles:

- Cargar el texto de cada documento solo al abrirlo. Hoy todo el contenido viaja en el JavaScript inicial y ese archivo crece con cada guía.
- Más categorías en el Manual (Git, CSS, despliegue).
- Traducir también el contenido, por ejemplo con archivos `.en.md` junto a los originales.
- Un feed RSS de la Bitácora.
- Un estado de error en la demo del botón con estados.
