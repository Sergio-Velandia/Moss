# Changelog

Todos los cambios relevantes de Moss se registran en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/):

- **MAJOR:** cambios que rompen enlaces existentes (rutas o URLs de contenido que dejan de funcionar).
- **MINOR:** una función nueva o un lote de contenido.
- **PATCH:** correcciones y cambios de documentación.

El campo `version` de `package.json` siempre coincide con la última versión publicada en este archivo. Las versiones 1.0.0 a 1.4.0 se reconstruyeron a partir del historial de git.

## [Sin publicar]

## [1.9.5] - 2026-10-16

### Cambiado
- La ruta «n8n, de cero a producción» suma la sección «Practica con dos flujos fáciles»: después del paso 5, la guía de OAuth2 de Google, invita a probar las plantillas «Agenda del día por correo» y «Reporte diario de ventas» de Moss Nexus, con un diagrama del paso a tu primer flujo real.
- La guía de OAuth2 de Google cubre también la plantilla «Reporte diario de ventas»: columna propia en las tablas de APIs y credenciales, cómo probarla, y la sección nueva «Pruébalo con un flujo fácil» con las dos plantillas de nivel fácil.
- Se completan en este archivo los enlaces de comparación de las versiones 1.9.3 y 1.9.4.

### Corregido
- El índice «En esta página» de las guías y los proyectos ya no queda cortado en pantallas bajas: en escritorio tiene su propio scroll, marca la sección que estás leyendo y la mantiene a la vista mientras bajas.

## [1.9.4] - 2026-10-15

### Añadido
- Guía del Manual «Conectar Slack a n8n con un bot (token xoxb)»: la app de Slack creada desde un manifiesto con solo `chat:write` y `channels:read`, su instalación, la credencial **Slack API** de n8n, la invitación del bot al canal, la seguridad del token y los errores frecuentes (`not_in_channel`, `channel_not_found`, `invalid_auth`, `missing_scope`). Nace de la prueba de la plantilla «Leads del formulario web a Google Sheets con aviso en Slack» de Moss Nexus y sirve para el resto de plantillas de Nexus que usan Slack.

## [1.9.3] - 2026-10-15

### Cambiado
- La guía del Manual de OAuth2 de Google para n8n pasa a llamarse «Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2» y cubre también la plantilla «Facturas de proveedores de Gmail a Google Drive con registro» de Moss Nexus: las APIs de Drive y Sheets, sus credenciales y permisos, una sección nueva «Preparar Gmail, Drive y Sheets para las facturas» (etiqueta y filtro de Gmail, carpeta de Drive y hoja de registro), y cuatro errores frecuentes nuevos. Conserva la URL y el ancla `#lista-de-comprobación`.

## [1.9.2] - 2026-10-15

### Añadido
- Guía del Manual «Conectar Gmail y Google Calendar a n8n con OAuth2»: el cliente OAuth de Google Cloud Console paso a paso, con n8n en Docker y en n8n Cloud, la caducidad de siete días del modo *Testing* y los errores frecuentes. Nace de la prueba de la plantilla «Agenda del día por correo» de Moss Nexus.

### Cambiado
- La ruta «n8n, de cero a producción» suma la guía de OAuth2 como paso 5 y pasa a 10 pasos.

## [1.9.1] - 2026-10-14

### Añadido
- Artículo de la Bitácora «Rutas con lo que ya existe»: la decisión de armar las rutas de aprendizaje ordenando el contenido que ya tenía Moss, en lugar de escribir material nuevo, con lo que se gana y lo que se pierde.

## [1.9.0] - 2026-10-14

Rutas de aprendizaje.

### Añadido
- Sección **Rutas** (`/rutas`): recorridos ordenados que juntan guías, demos, retos y artículos de un tema. Cuatro rutas: n8n de cero a producción, Frontend con React y Tailwind, Datos y reportes con SQL, y Publicar y mantener un sitio.
- Cada ruta muestra sus pasos como un recorrido, con tipo y tiempo estimado, una barra de progreso, «Continuar» y «Reiniciar progreso». El progreso se guarda solo en el navegador.
- En cada guía, demo o artículo que forma parte de una ruta, un aviso con el paso actual, el anterior, el siguiente y un botón para marcarlo como hecho.
- La ruta de n8n cierra con una invitación a Moss Nexus en su propio estilo.
- Las rutas aparecen en el Herbario (`?tipo=route`) y responden con código 200 en GitHub Pages.
- Tipo de contenido `content/routes/*.md` validado por `validateRoute`, y una prueba que exige que cada clave guardada en el navegador esté descrita en la política de privacidad.

### Cambiado
- «Rutas» en la navegación, justo después de «Inicio».

### Corregido
- La política de privacidad no mencionaba el idioma guardado (`moss-lang`) desde la v1.3.0. Ahora describe las tres claves: tema, idioma y progreso de las rutas.

## [1.8.0] - 2026-10-13

Contenido sobre lo construido en Moss, retos de Tailwind e imágenes.

### Añadido
- Imágenes en el Markdown: viven en `content/images/`, se citan como `/imagenes/<archivo>-<ancho>x<alto>.webp` y se dibujan como `<figure>` con dimensiones, carga diferida y pie opcional. Las pruebas exigen que existan, tengan texto alternativo y que ninguna quede sin usar.
- 3 retos del Laboratorio (categoría «Retos Tailwind»), cada uno con un error real y su interruptor «Sin arreglo / Con arreglo»: la tarjeta que rompe la cuadrícula, la cabecera que no cabe (container queries) y una tarjeta con tres identidades (variables CSS).
- 4 guías del Manual: interfaz bilingüe sin librerías, una SPA en GitHub Pages sin 404, capas CSS y tokens en Tailwind 4, y verificar la interfaz con capturas reales. Categorías nuevas: CSS y Despliegue.
- 3 artículos de la Bitácora: «Lo que encontraron las capturas», «Versionar después» y «Documentar proyectos sin repetir el README».
- 4 capturas reales en WebP que ilustran guías y artículos.

## [1.7.0] - 2026-10-12

Identidad visual de cada proyecto.

### Añadido
- Las tarjetas de `/proyectos` muestran la marca y la paleta de cada proyecto: Moss (salvia), Moss Nexus (musgo y coral) y el portafolio (grafito con acento dorado, oscuro en ambos temas). Al pasar el cursor o enfocarlas con el teclado, tiñen el borde, encienden un resplandor de su color y su botón de acción reacciona, sin levantar la tarjeta.
- Los botones «Ver el sitio» y «Ver el repositorio» de la ficha usan el estilo de botón de cada proyecto.
- Tipografías de cada identidad, cargadas solo en las páginas de Proyectos: Inter para Moss Nexus, y Syne con DM Sans para el portafolio. El resto de Moss conserva la suya.
- Campo `theme` (`moss`, `nexus` o `portafolio`) en el frontmatter de los proyectos, validado por `validateProject`.

### Corregido
- El color del foco del teclado en la página de Nexus: la regla global le ganaba y se veía salvia en vez de coral.
- El favicon respondía 404 en producción: `index.html` apuntaba a `favicon.svg`, pero el archivo está en `public/images/`.

## [1.6.1] - 2026-10-12

### Cambiado
- Página del portafolio en Proyectos: confirmado por el autor que las credenciales de EmailJS están restringidas al dominio del sitio, y la razón de separar el proveedor de idioma ahora cita la regla `react-refresh` de su linter.

### Corregido
- Una prueba de la plantilla de proyectos fallaba en Windows cuando Git entregaba los `.md` con finales de línea CRLF.

## [1.6.0] - 2026-10-12

Proyectos: arquitectura, flujos y decisiones de Moss, Moss Nexus y el portafolio.

### Añadido
- Sección **Proyectos** (`/proyectos`): índice con una tarjeta por proyecto (nombre, frase, estado, versión y tecnologías) y una página por proyecto para Moss, Moss Nexus y el portafolio, con ficha, arquitectura, flujo de datos, decisiones con la alternativa descartada, lecciones y roadmap.
- Tipo de contenido `content/projects/*.md` con los campos `status`, `version`, `reviewedAt`, `repo` y `site`, validados por `validateProject`.
- Cada página muestra «Documentado en vX.Y.Z» y «Última revisión»; las pruebas fallan si falta alguno, si las secciones no siguen la plantilla o si hay menos de cuatro decisiones.
- Los proyectos aparecen en el Herbario como tipo propio (`?tipo=project`) y en los relacionados. El tablero del Inicio no los cuenta.
- Las rutas `/proyectos` y `/proyectos/<slug>` responden 200 en GitHub Pages; el build crea una por cada proyecto publicado.

### Cambiado
- «Proyectos» en la navegación. Con seis secciones, la navegación de escritorio empieza en 1024 px; por debajo se usa el menú.

## [1.5.0] - 2026-10-12

Moss Nexus: página de presentación y acceso desde la navegación.

### Añadido
- Página **Moss Nexus** (`/nexus`), que presenta el sitio hermano con los flujos de n8n listos para copiar: qué es y para quién, el problema que resuelve, cómo funciona en tres pasos (explora, entiende, copia y pega), el acceso «Ir a Moss Nexus» y el aviso de que es un proyecto independiente, sin relación oficial con n8n GmbH. En español e inglés.
- Acceso a Nexus en la cabecera y en el menú móvil, con su marca. Entre 768 y 1024 px muestra solo la marca para que la cabecera quepa.
- Estilo de Nexus (tokens, superficies de vidrio, rejilla de puntos y degradado) aislado en la clase `.nexus`: solo lo usan la página y su acceso. Sigue el tema elegido en Moss con la paleta clara u oscura de Nexus.
- Fuentes Inter y JetBrains Mono de Nexus, cargadas solo al abrir `/nexus`.
- En el build, `nexus/index.html`, para que GitHub Pages responda 200 en esa ruta en lugar de 404 (lista `STATIC_ROUTES` en `vite.config.ts`).
- La URL de Nexus vive en una sola constante (`site.nexusUrl`), con una prueba que impide repetirla en el código.
- Este `CHANGELOG.md`, con el historial reconstruido desde 1.0.0, y la sección de versionado del README.

## [1.4.0] - 2026-10-12

Contenido sobre problemas reales de empresa.

### Añadido
- 8 guías del Manual: detectar y fusionar clientes duplicados, reporte de ventas mensual con variación, reporte diario automático por correo o Slack, sincronizar un formulario con el CRM sin duplicados, idempotencia en pagos y webhooks, paginación y límites de tasa, exportar CSV que Excel abre bien, y dinero y fechas con `Intl`. Cada una con diagrama y documentación oficial.
- 3 demos del Laboratorio: resumen de factura con IVA, exportar a CSV para Excel y reintentos con backoff y jitter.
- 3 artículos de la Bitácora: «El reporte que nadie quería hacer», «Datos sucios, el problema silencioso» y «Cuando un webhook llega dos veces».
- Pruebas del escape de CSV, el IVA por línea y las esperas de backoff.

### Cambiado
- Varias guías existentes enlazan las nuevas en «Relacionado».

### Corregido
- Una demo ancha ensanchaba la cuadrícula del Laboratorio y desbordaba la página en móvil.

## [1.3.0] - 2026-10-11

Idioma, diagramas y documentación oficial.

### Añadido
- Interfaz en español e inglés con selector ES/EN en la cabecera, guardado en el navegador y compartible con `?lang=en`. El contenido sigue en español y lo indica en inglés.
- Diagramas `flow` y `mindmap` escritos dentro del Markdown, dibujados con los colores del tema y accesibles como listas.
- Cuadro «Leer la documentación oficial» en el Manual, alimentado por `references` en el frontmatter.
- Un diagrama y referencias oficiales en las 8 guías del Manual.
- Pruebas del parser de diagramas y referencias.

### Cambiado
- «Explorar por etiqueta» del Herbario muestra las 16 etiquetas más usadas y despliega el resto con «Ver todas».

### Corregido
- Los buscadores mostraban dos anillos de foco.
- «Node» y «Node.js» aparecían como dos tecnologías distintas.

## [1.2.0] - 2026-10-11

Tablero del Inicio.

### Añadido
- «Signos vitales del jardín» en el Inicio: ritmo de crecimiento por mes, tecnologías más documentadas y reparto entre Laboratorio, Manual y Bitácora, con Recharts en un chunk aparte, esqueleto sin saltos y tablas alternativas accesibles.
- Datos de ejemplo cuando hay menos de 10 elementos reales.
- Tokens de color para las series de los gráficos en ambos temas.
- Enlace al sitio publicado en el README.

### Corregido
- `vite preview` no servía el sitio en `/Moss/` como en producción.

## [1.1.0] - 2026-10-11

Automatización con n8n.

### Añadido
- Demos del Laboratorio: generador de payloads para n8n y simulador de flujo n8n.
- Guías del Manual: entender webhooks y triggers, y orquestación y manejo de errores.
- Artículos de la Bitácora: «La naturaleza de Moss» y «Migrando scripts sueltos a flujos de n8n».
- Prueba que renderiza todas las demos del Laboratorio.

## [1.0.0] - 2026-10-10

Primera versión completa.

### Añadido
- **El Laboratorio:** 6 demos con vista previa en vivo y su código fuente copiable.
- **El Manual:** 6 guías en Markdown dentro del repositorio.
- **La Bitácora:** 5 artículos.
- **El Herbario:** búsqueda global que ignora tildes y tolera erratas, con filtros en la URL.
- Tema claro y oscuro, accesibilidad (teclado, foco visible, movimiento reducido, contraste AA) y adaptación a móvil.
- Páginas legales: términos, privacidad y protección de datos.
- Despliegue automático en GitHub Pages con cada push a `main`.

[Sin publicar]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.5...HEAD
[1.9.5]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.4...v1.9.5
[1.9.4]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.3...v1.9.4
[1.9.3]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.2...v1.9.3
[1.9.2]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/Sergio-Velandia/Moss/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/Sergio-Velandia/Moss/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Sergio-Velandia/Moss/releases/tag/v1.0.0
