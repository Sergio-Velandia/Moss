# Changelog

Todos los cambios relevantes de Moss se registran en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/):

- **MAJOR:** cambios que rompen enlaces existentes (rutas o URLs de contenido que dejan de funcionar).
- **MINOR:** una función nueva o un lote de contenido.
- **PATCH:** correcciones y cambios de documentación.

El campo `version` de `package.json` siempre coincide con la última versión publicada en este archivo. Las versiones 1.0.0 a 1.4.0 se reconstruyeron a partir del historial de git.

## [Sin publicar]

### Añadido
- Página **Moss Nexus** (`/nexus`), que presenta el sitio hermano con los flujos de n8n listos para copiar: qué es y para quién, el problema que resuelve, cómo funciona en tres pasos (explora, entiende, copia y pega), el acceso «Ir a Moss Nexus» y el aviso de que es un proyecto independiente, sin relación oficial con n8n GmbH. En español e inglés.
- Acceso a Nexus en la cabecera y en el menú móvil, con su marca. Entre 768 y 1024 px muestra solo la marca para que la cabecera quepa.
- Estilo de Nexus (tokens, superficies de vidrio, rejilla de puntos y degradado) aislado en la clase `.nexus`: solo lo usan la página y su acceso. Sigue el tema elegido en Moss con la paleta clara u oscura de Nexus.
- Fuentes Inter y JetBrains Mono de Nexus, cargadas solo al abrir `/nexus`.
- En el build, `nexus/index.html`, para que GitHub Pages responda 200 en esa ruta en lugar de 404 (lista `STATIC_ROUTES` en `vite.config.ts`).
- La URL de Nexus vive en una sola constante (`site.nexusUrl`), con una prueba que impide repetirla en el código.
- Este `CHANGELOG.md`.

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

[Sin publicar]: https://github.com/Sergio-Velandia/Moss/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Sergio-Velandia/Moss/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Sergio-Velandia/Moss/releases/tag/v1.0.0
