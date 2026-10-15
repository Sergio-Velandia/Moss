---
title: Publicar y mantener un sitio
description: Publicar una SPA en GitHub Pages sin 404, verificarla con capturas reales, versionarla con un CHANGELOG y ver cómo se aplica todo en Moss.
type: route
level: inicial
order: 4
tags: [despliegue, github pages, versionado, calidad, ruta]
technologies: [Vite, GitHub Actions, Git]
createdAt: 2026-10-14
steps: [manual/despliegue/spa-en-github-pages-sin-404, manual/javascript/verificar-la-interfaz-con-capturas, journal/lo-que-encontraron-las-capturas, journal/versionar-despues, project/moss]
---

## Para quién es

Para quien ya tiene un sitio hecho con React y Vite y quiere publicarlo **y mantenerlo**: que las rutas se recarguen sin error, que cada cambio se revise antes de subir y que se sepa qué cambió en cada versión.

## Qué vas a poder hacer al terminar

```flow
# El ciclo de cada cambio
Build :: el sitio tal como se publicará
Verificar :: capturas, anchos y códigos de estado
Versionar :: CHANGELOG, versión y tag
+ Publicar :: push y comprobación en producción
```

## Cómo seguirla

Las dos guías son prácticas; los dos artículos cuentan los errores reales que llevaron a esas prácticas. El último paso es la página del proyecto Moss, donde se ve cómo encaja todo en un sitio de verdad.
