---
title: Git con intención: commits que cuentan qué cambió
description: Commits convencionales en español, cuándo dividir un cambio en varios commits y para qué sirven las ramas cortas, con el historial real de Moss y Moss Nexus como ejemplo.
type: manual
tags: [git, commits, conventional commits, ramas, historial, buenas prácticas]
technologies: [Git, GitHub]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, journal/versionar-despues]
references: [Conventional Commits 1.0.0 en español | https://www.conventionalcommits.org/es/v1.0.0/, Pro Git: qué es una rama | https://git-scm.com/book/es/v2/Ramificaciones-en-Git-%C2%BFQu%C3%A9-es-una-rama%3F]
---

## Problema que resuelve

Un historial con mensajes como «cambios», «update» o «arreglos varios» no sirve para nada el día que algo se rompe: no dice qué cambió ni por qué. Y un commit que mezcla un arreglo, un cambio de estilo y una página nueva no se puede deshacer a medias.

Esta guía es el **paso 1** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio): antes de publicar nada, conviene que cada cambio quede registrado de forma que tú (o cualquiera) lo entienda dentro de seis meses.

## La idea en una imagen

Un historial de Git es como **el diario de obra de una construcción**. Cada entrada dice qué se hizo ese día («se instaló la tubería del baño»), no «se trabajó». Si un día aparece una fuga, el diario te dice cuándo se tocó esa tubería y qué más se hizo a la vez.

Un **commit** es una entrada del diario: una foto del proyecto con un mensaje. Una **rama** es un borrador del diario donde trabajas un tema sin tocar la versión buena (`main`) hasta que está listo.

## Commits convencionales

La convención [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) le da a cada mensaje una forma fija:

```text
tipo(ámbito opcional): descripción corta en imperativo
```

| Tipo | Cuándo se usa | Ejemplo real de Moss |
| --- | --- | --- |
| `feat` | Algo nuevo que nota quien usa el sitio | `feat(rutas): amplía la ruta de publicación a «Del repo a producción»` |
| `fix` | Corrige algo que funcionaba mal | `fix(toc): el índice tiene scroll propio y sigue la sección actual` |
| `docs` | Documentación o contenido | `docs(manual): agrega la guía de dominio propio con GitHub Pages y Cloudflare` |
| `chore` | Tareas de mantenimiento, como subir la versión | `chore(release): v1.10.0` |
| `ci` | La automatización que prueba y publica | `ci: desplegar en GitHub Pages con cada push a main` |
| `refactor` | Reorganiza código sin cambiar lo que hace | (en Moss Nexus hay uno) |
| `test` | Pruebas | `test: valida la plantilla de proyectos (secciones, versión, revisión y decisiones)` |

La especificación solo define `feat` y `fix`; el resto son tipos de uso común. Lo importante es que **el mismo proyecto use siempre los mismos**. En mis proyectos los mensajes van en español, en minúscula, en imperativo («agrega», «corrige») y con menos de 70 caracteres.

## Cuándo dividir un cambio

**Un commit = un cambio lógico.** Si para describirlo necesitas la palabra «y», probablemente son dos.

```flow
# Un cambio grande, varios commits
Cambio de dominio :: todo lo que hay que tocar
URLs :: código y contenido
Correo :: el dato de contacto
README :: la documentación
+ Release :: versión y CHANGELOG en su propio commit
```

En palabras: un cambio grande, como migrar a un dominio nuevo, se reparte en commits separados: primero las URLs, luego el correo, luego el README y, al final, un commit solo para la versión y el CHANGELOG. Cada uno se entiende solo y se puede revertir sin deshacer los demás.

Reglas prácticas:

- **Cada commit deja el proyecto funcionando.** Pasa las pruebas y compila. Así cualquier punto del historial sirve para volver atrás.
- **No mezcles tipos.** Un `fix` no lleva de paso un cambio de estilo ni una página nueva.
- **Commitea a menudo.** Un commit al día con todo lo de la semana no es un historial, es un respaldo.

## Ramas cortas

Una rama se crea para **un tema** y se borra al integrarlo en `main`:

```bash
git checkout -b feat/piezas-tailwind-lote-1   # algo nuevo
git checkout -b fix/dominio-propio             # una corrección
git checkout -b docs/instalar-n8n              # documentación
```

`main` siempre debe estar lista para publicarse. Si el trabajo en la rama sale mal, se borra la rama y `main` no se enteró.

Al terminar, la rama se integra en `main`. Si `main` no cambió mientras tanto, Git solo **adelanta** `main` hasta el último commit de la rama (*fast-forward*): el historial queda en línea recta, sin commit de unión. La contra es que el nombre de la rama no queda guardado en ningún lado; lo que perdura son los commits y sus mensajes. Por eso el mensaje importa más que el nombre de la rama.

## Así lo hice yo

- **Moss empezó sin convenciones.** Sus primeros commits están en inglés y agrupan mucho en uno solo: [`6598de8` «feat: scaffold Moss with Vite, React, TS, Tailwind and base layout»](https://github.com/Sergio-Velandia/Moss/commit/6598de8) o [`00ad352` «feat: dark/light theme, accessibility and mobile polish, legal pages»](https://github.com/Sergio-Velandia/Moss/commit/00ad352), que mete tema, accesibilidad, móvil y páginas legales en un solo cambio.
- **Editar en la web de GitHub y en local a la vez** dejó un commit de unión sin valor: [`24bf788` «Merge branch 'main' of …»](https://github.com/Sergio-Velandia/Moss/commit/24bf788), después de cambiar el README desde el navegador ([`2d567cf`](https://github.com/Sergio-Velandia/Moss/commit/2d567cf) y [`7c0c9be`](https://github.com/Sergio-Velandia/Moss/commit/7c0c9be)).
- **El cambio de rumbo:** desde [`bd8a203` «ci: desplegar en GitHub Pages con cada push a main»](https://github.com/Sergio-Velandia/Moss/commit/bd8a203) los mensajes de Moss están en español y con convención. Hoy, de sus 115 commits, 42 son `docs`, 39 `feat`, 11 `chore` y 10 `fix`.
- **Moss Nexus empezó ya ordenado:** sus primeros commits fijan las reglas antes de escribir contenido: [`d9126ff` «docs: agrega convenciones de commits a CLAUDE.md»](https://github.com/Sergio-Velandia/Moss-Nexus/commit/d9126ff) y [`8e64aea` «docs: agrega estrategia de versionado a CLAUDE.md»](https://github.com/Sergio-Velandia/Moss-Nexus/commit/8e64aea).
- **Un cambio grande, bien partido:** la migración de Moss al dominio propio son cuatro commits: [`a91215d`](https://github.com/Sergio-Velandia/Moss/commit/a91215d) (URLs), [`d55db56`](https://github.com/Sergio-Velandia/Moss/commit/d55db56) (correo), [`f402024`](https://github.com/Sergio-Velandia/Moss/commit/f402024) (README) y [`9067429`](https://github.com/Sergio-Velandia/Moss/commit/9067429) (release).

## Errores que cometí (o que casi cometo)

Los dos están en el historial de Moss y se ven arriba:

- **Commits que lo meten todo.** Se detectan cuando no puedes resumir un commit en una frase sin usar «y», o cuando revertirlo desharía algo que quieres conservar.
- **Editar el mismo archivo en GitHub y en local.** Se detecta cuando `git pull` crea un commit «Merge branch 'main' of…» que nadie pidió. Edita en un solo sitio, o haz `git pull` antes de empezar a trabajar.

## Lista de comprobación

- [ ] El proyecto tiene una convención escrita (en el README o en un archivo de reglas) antes del primer commit de contenido.
- [ ] Cada mensaje sigue `tipo(ámbito): descripción` en imperativo y con menos de 70 caracteres.
- [ ] Cada commit es un solo cambio lógico y deja el proyecto compilando.
- [ ] La versión y el CHANGELOG van en un commit propio.
- [ ] El trabajo se hace en una rama corta (`feat/`, `fix/`, `docs/`) y `main` siempre se puede publicar.
- [ ] Nada se edita a la vez en la web de GitHub y en local.
