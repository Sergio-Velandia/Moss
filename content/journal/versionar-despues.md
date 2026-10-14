---
title: Versionar después
description: El README decía 1.0 y el código 0.0.0. Reconstruir el historial de Moss desde git enseñó por qué conviene versionar desde el primer día.
type: journal
category: Aprendizajes
tags: [versionado, semver, changelog, git, tags, releases]
technologies: [Git, GitHub Actions]
createdAt: 2026-10-13
related: [project/moss, journal/documentar-proyectos-sin-repetir-el-readme, manual/despliegue/spa-en-github-pages-sin-404]
---

## Dos versiones a la vez

El README de Moss anunciaba con orgullo «Versión 1.0 completa». El `package.json` decía `0.0.0`. No había CHANGELOG ni tags. Las dos cosas eran ciertas a su manera: el sitio funcionaba como una primera versión completa, pero nada en el repositorio lo registraba.

Mientras nadie preguntara, daba igual. El problema apareció al querer responder algo simple: ¿qué cambió entre lo que está publicado hoy y lo de la semana pasada?

## Reconstruir desde git

El historial de commits estaba ahí, así que el CHANGELOG se pudo reconstruir. Leí los commits en orden, conté cuántas demos, guías y artículos había en cada punto, y agrupé los cambios en versiones que tuvieran sentido:

```flow
# Del historial al CHANGELOG
git log :: commits en orden, con fecha
Puntos de corte :: dónde termina cada conjunto de cambios
Recuento :: qué contenido existía en cada punto
Versiones :: 1.0.0, 1.1.0, 1.2.0…
+ Tags :: v1.0.0 en el último commit de cada una
```

Funcionó, con una rareza que no tiene arreglo: los tags de las versiones antiguas apuntan a commits cuyo `package.json` todavía dice `0.0.0`. El tag dice 1.2.0; el archivo, no. Es la marca que deja versionar a posteriori.

## Las reglas que quedaron

```mindmap
Cómo se versiona Moss
- MAJOR :: algo que rompe enlaces
  - una ruta que deja de existir
- MINOR :: una función o un lote de contenido
  - Proyectos
  - identidad de las tarjetas
- PATCH :: correcciones y documentación
  - el favicon
  - un texto confirmado
- Release :: un commit propio
  - package.json igual al CHANGELOG
  - tag solo con confirmación
```

Para un sitio de contenido, «romper la API» no significa mucho; lo que se puede romper son los **enlaces**. Por eso un cambio MAJOR en Moss es cambiar una ruta que alguien pudo haber guardado.

## El release que salió en rojo

Una noche, el commit de release de la 1.6.1 se hizo con una prueba fallando. La cadena de comandos comprobaba la línea de resumen de las pruebas (que existía, aunque dijera «1 failed») y siguió adelante. Nadie lo habría notado: en GitHub las pruebas pasaban, porque el fallo dependía de los finales de línea de Windows.

Lo deshice antes de publicarlo, corregí la prueba en su propio commit y rehíce el release. Y cambié la forma de encadenar las comprobaciones: cada paso mira el código de salida del anterior y se detiene si falla. Un release no es solo cambiar un número; es la promesa de que todo lo que hay detrás funciona.

## Lo que aprendí

- **Versionar desde el primer commit cuesta casi nada.** Reconstruir después cuesta una tarde y deja huecos que no se pueden rellenar.
- **El CHANGELOG es para personas.** No es el log de git: agrupa, explica y dice qué cambió para quien usa el sitio.
- **El número tiene que coincidir en todas partes.** README, `package.json`, CHANGELOG y tag cuentan la misma historia, o ninguno es creíble.
