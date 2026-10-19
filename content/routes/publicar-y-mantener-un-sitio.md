---
title: Del repo a producción: publicar y mantener un proyecto web
description: Lo que viene después de «funciona en mi computador»: versionar, comprobar, publicar en GitHub Pages, darle un dominio propio con HTTPS y correo, cumplir lo legal y mantenerlo vivo. Todo hecho de verdad en Moss, Moss Nexus y el portafolio.
type: route
level: inicial
order: 4
tags: [despliegue, github pages, dominio propio, versionado, calidad, mantenimiento, ruta]
technologies: [Git, GitHub Actions, GitHub Pages, Cloudflare]
createdAt: 2026-10-14
updatedAt: 2026-10-18
steps: [journal/versionar-despues, manual/javascript/verificar-la-interfaz-con-capturas, journal/lo-que-encontraron-las-capturas, manual/despliegue/spa-en-github-pages-sin-404, manual/despliegue/dominio-propio-github-pages-cloudflare, project/moss]
---

## Por qué existe esta ruta

Casi todos los tutoriales terminan en «funciona en mi computador». Esta ruta cubre lo que viene después: publicar, versionar, darle un dominio, recibir correo, cumplir lo legal y mantenerlo vivo.

Todo lo que cuenta lo hice de verdad en mis propios proyectos (Moss, Moss Nexus y el portafolio, servidos en `sergio-velandia.dev`). Cada paso enlaza la evidencia: el commit, el archivo, el CHANGELOG o la página en vivo donde se ve aplicado.

## Para quién es

Para quien ya sabe hacer un sitio con Vite y React (o con HTML) y nunca lo ha llevado a producción de forma profesional. No hace falta saber nada de servidores ni de DNS: cada término se explica la primera vez que aparece.

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Ordenar el trabajo :: Git y versiones
  - commits que se entienden
  - CHANGELOG y tags
- Comprobar :: antes de publicar
  - pruebas, lint y build
  - capturas reales
- Publicar :: en internet de verdad
  - GitHub Pages sin 404
  - dominio propio con HTTPS
  - correo con tu dominio
- Cuidarlo :: después del lanzamiento
  - páginas legales
  - mantenimiento mensual
```

## Cómo seguirla

La ruta tiene **11 pasos y un proyecto final**. Los pasos que ya tienen guía o artículo aparecen abajo, en orden, y puedes marcarlos como hechos. Los demás se irán sumando, uno por uno, a medida que se publiquen.

| # | Paso | Estado |
| --- | --- | --- |
| 1 | Git con intención: commits convencionales, ramas y cuándo dividir un cambio | Próximamente |
| 2 | Versiones que cuentan una historia: SemVer, CHANGELOG y tags | Disponible: [Versionar después](/bitacora/versionar-despues) (bitácora) |
| 3 | Un README que se lee | Próximamente |
| 4 | Calidad automática: pruebas, lint y build antes de publicar | Disponible: [Verificar la interfaz con capturas reales](/manual/javascript/verificar-la-interfaz-con-capturas) y [Lo que encontraron las capturas](/bitacora/lo-que-encontraron-las-capturas) |
| 5 | Publicar una SPA en GitHub Pages | Disponible: [Una SPA en GitHub Pages sin 404](/manual/despliegue/spa-en-github-pages-sin-404) |
| 6 | Dominio propio con DNS y HTTPS | Disponible: [Dominio propio para GitHub Pages con Cloudflare DNS y correo](/manual/despliegue/dominio-propio-github-pages-cloudflare) |
| 7 | Correo con tu dominio | Próximamente (mientras tanto, la guía del paso 6 tiene una sección de correo) |
| 8 | Migrar a un dominio nuevo sin romper nada | Próximamente |
| 9 | La fase legal en un proyecto personal | Próximamente |
| 10 | Que se vea bien al compartirlo | Próximamente |
| 11 | Mantener vivo un proyecto | Próximamente |
| 🏁 | Proyecto final: publica tu propio sitio de principio a fin | Próximamente |

La lista de abajo y el aviso de cada guía («Paso 4 de 6») cuentan solo lo ya publicado; la tabla usa el número del recorrido completo. El último paso de la lista es la ficha del proyecto Moss: ahí se ve cómo encaja todo en un sitio real.
