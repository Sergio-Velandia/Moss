---
title: Del repo a producción: publicar y mantener un proyecto web
description: Lo que viene después de «funciona en mi computador»: versionar, comprobar, publicar en GitHub Pages, darle un dominio propio con HTTPS y correo, cumplir lo legal y mantenerlo vivo. Todo hecho de verdad en Moss, Moss Nexus y el portafolio.
type: route
level: inicial
order: 5
tags: [despliegue, github pages, dominio propio, versionado, calidad, mantenimiento, ruta]
technologies: [Git, GitHub Actions, GitHub Pages, Cloudflare]
createdAt: 2026-10-14
updatedAt: 2026-10-22
steps: [manual/git/commits-con-intencion, journal/versionar-despues, manual/git/un-readme-que-se-lee, journal/documentar-proyectos-sin-repetir-el-readme, manual/javascript/verificar-la-interfaz-con-capturas, journal/lo-que-encontraron-las-capturas, manual/despliegue/spa-en-github-pages-sin-404, manual/despliegue/dominio-propio-github-pages-cloudflare, manual/despliegue/correo-con-tu-dominio, manual/despliegue/migrar-a-un-dominio-nuevo, manual/despliegue/fase-legal-en-un-proyecto-personal, manual/despliegue/que-se-vea-bien-al-compartirlo, manual/despliegue/mantener-vivo-un-proyecto, journal/lo-que-encontre-al-revisar-mi-propio-jardin, manual/despliegue/proyecto-final-publica-tu-sitio]
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

La ruta tiene **11 pasos y un proyecto final**. Cada guía empieza por el porqué, lo explica con una imagen sencilla, muestra la configuración real y termina con «Así lo hice yo» (los commits, archivos y páginas donde se ve aplicado) y una lista de comprobación para tu propio proyecto.

| # | Paso | Para leer |
| --- | --- | --- |
| 1 | Git con intención | [Git con intención: commits que cuentan qué cambió](/manual/git/commits-con-intencion) |
| 2 | Versiones que cuentan una historia | [Versionar después](/bitacora/versionar-despues) (bitácora) |
| 3 | Un README que se lee | [Un README que se lee](/manual/git/un-readme-que-se-lee) y [Documentar proyectos sin repetir el README](/bitacora/documentar-proyectos-sin-repetir-el-readme) (bitácora) |
| 4 | Calidad automática | [Verificar la interfaz con capturas reales](/manual/javascript/verificar-la-interfaz-con-capturas) y [Lo que encontraron las capturas](/bitacora/lo-que-encontraron-las-capturas) (bitácora) |
| 5 | Publicar una SPA en GitHub Pages | [Una SPA en GitHub Pages sin 404](/manual/despliegue/spa-en-github-pages-sin-404) |
| 6 | Dominio propio con DNS y HTTPS | [Dominio propio para GitHub Pages con Cloudflare DNS y correo](/manual/despliegue/dominio-propio-github-pages-cloudflare) |
| 7 | Correo con tu dominio | [Correo con tu dominio usando Cloudflare Email Routing](/manual/despliegue/correo-con-tu-dominio) |
| 8 | Migrar a un dominio nuevo sin romper nada | [Migrar a un dominio nuevo sin romper nada](/manual/despliegue/migrar-a-un-dominio-nuevo) |
| 9 | La fase legal en un proyecto personal | [La fase legal en un proyecto personal](/manual/despliegue/fase-legal-en-un-proyecto-personal) |
| 10 | Que se vea bien al compartirlo | [Que se vea bien al compartirlo](/manual/despliegue/que-se-vea-bien-al-compartirlo) |
| 11 | Mantener vivo un proyecto | [Mantener vivo un proyecto publicado](/manual/despliegue/mantener-vivo-un-proyecto) y [Lo que encontré al revisar mi propio jardín](/bitacora/lo-que-encontre-al-revisar-mi-propio-jardin) (bitácora) |
| 🏁 | Proyecto final | [Publica tu propio sitio de principio a fin](/manual/despliegue/proyecto-final-publica-tu-sitio) |

La lista de abajo tiene 15 entradas porque los pasos 3, 4 y 11 traen una lectura de la Bitácora además de su guía, y el proyecto final cuenta como una más; por eso el aviso de cada guía puede decir, por ejemplo, «Paso 9 de 15». Marca cada una como hecha al terminarla: tu progreso se guarda en este navegador.

El proyecto final aplica los 11 pasos a un sitio tuyo y termina en la ficha de [Moss](/proyectos/moss), donde se ve todo esto en un proyecto real.
