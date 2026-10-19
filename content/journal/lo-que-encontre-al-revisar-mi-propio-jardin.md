---
title: Lo que encontré al revisar mi propio jardín
description: Escribir una ruta sobre publicar y mantener un sitio me obligó a mirar Moss con los mismos ojos. Encontré datos caducados, un estilo que escondía errores y una prueba que me atrapó a mí.
type: journal
category: Aprendizajes
tags: [mantenimiento, revisión, pruebas de guarda, contenido que caduca, css, honestidad técnica]
technologies: [React, Tailwind, Vitest]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/mantener-vivo-un-proyecto, journal/lo-que-encontraron-las-capturas, manual/despliegue/migrar-a-un-dominio-nuevo]
---

## Predicar con el ejemplo

Entre el 15 y el 18 de octubre, Moss pasó a vivir en `sergio-velandia.dev` y ganó una ruta completa sobre lo que viene después de «funciona en mi computador»: versionar, migrar de dominio, la fase legal, mantener un proyecto vivo. Cada guía tiene una sección «Así lo hice yo» con commits reales.

El problema de escribir «revisa que tus datos no caduquen» es que, al buscar la evidencia, te toca revisar los tuyos. Y no siempre salen bien parados.

## Datos que ya no eran ciertos

La ficha de Moss en Proyectos decía **versión 1.6.0, revisada el 12 de octubre**. Moss iba por la 1.12. La de Moss Nexus decía que ninguna plantilla tenía el sello «Probado», cuando ya había cuatro. La del portafolio decía que no tenía CHANGELOG, y ya lo tenía.

Ninguno de esos datos estaba mal cuando se escribió. Simplemente, nadie los volvió a mirar.

La corrección tuvo dos partes. Los datos de los otros proyectos se pusieron al día a mano, con su fecha de revisión. Y la versión de Moss dejó de escribirse: la ficha dice `version: auto` y la toma de `package.json` en el build ([`f607309`](https://github.com/Sergio-Velandia/Moss/commit/f607309)). Un dato que se puede calcular no debería copiarse.

## Un estilo que escondía errores

Las categorías del Manual salen del nombre de la carpeta: `apis`, `css`, `n8n`. Para que no se vieran en minúscula, un `capitalize` de CSS las convertía en «Apis», «Css», «N8n». Parecía resuelto, pero no lo estaba: CSS maquillaba el dato en vez de corregirlo.

Al cambiarlo por nombres escritos a mano (APIs, CSS, n8n) pasaron dos cosas:

```flow
# Quitar el maquillaje
capitalize de CSS :: «apis» se veía «Apis»
Nombres reales :: el dato pasa a decir «APIs»
! Una guía deja de abrir :: se buscaba comparando el nombre con la carpeta de la URL
+ Prueba nueva :: cada guía se encuentra a partir de su URL
```

En palabras: el estilo de CSS maquillaba los nombres de las carpetas. Al poner los nombres reales, una función que buscaba cada guía comparando su categoría con la carpeta de la URL dejó de encontrarlas, y las páginas de las guías no abrían. Las pruebas no lo detectaron, porque ninguna abría una guía a partir de su URL. Ahora hay una que lo hace ([`8a320d3`](https://github.com/Sergio-Velandia/Moss/commit/8a320d3)).

El mismo `capitalize` escondía un detalle menor: el botón «Todas» del filtro estaba escrito «todas».

## La prueba que me atrapó

Al migrar al dominio propio, añadí una prueba de guarda: falla si vuelve a aparecer una URL antigua de `github.io` en el código o en el contenido ([`a91215d`](https://github.com/Sergio-Velandia/Moss/commit/a91215d)). Días después, escribiendo la guía de migración, puse como ejemplo la dirección antigua de Moss para mostrar la redirección 301. La prueba falló antes del commit.

Tenía razón ella: la guía no necesitaba la URL literal para explicarlo. Una prueba de guarda no distingue entre un descuido y un ejemplo, y está bien que no lo haga.

## Lo que se ve desde fuera

Revisar el sitio como lo vería alguien nuevo encontró lo que las pruebas no miran:

- **Las miniaturas del Laboratorio aplastaban las demos** que se adaptan al ancho: el texto salía en vertical, una letra por línea ([`a307baf`](https://github.com/Sergio-Velandia/Moss/commit/a307baf)). Una de ellas, el simulador de n8n, decidía su diseño por el ancho de la ventana y no por el de su caja; ahora usa container queries ([`c92cb6a`](https://github.com/Sergio-Velandia/Moss/commit/c92cb6a)).
- **Inicio no mencionaba Rutas ni Proyectos**, las dos secciones más nuevas y la mejor puerta de entrada.
- **El Manual era una lista de 32 tarjetas ordenada por fecha**, así que la última tanda tapaba todo lo demás. Ahora se agrupa por categoría y cada guía dice a qué ruta pertenece ([`2536eb4`](https://github.com/Sergio-Velandia/Moss/commit/2536eb4)).

Cada arreglo salió en su propia versión PATCH, de la 1.12.1 a la 1.12.6, para que el CHANGELOG cuente una cosa por versión.

## Lo que me llevo

- **Escribir sobre una práctica es la mejor auditoría de si la cumples.** Las guías de la ruta encontraron más problemas en Moss que cualquier revisión que hubiera planeado.
- **Si un dato se puede calcular, no lo copies.** La versión en la ficha caducó en cuatro días.
- **No maquilles el dato en la vista.** Un `capitalize` o un texto que «se arregla» con estilos esconde el problema hasta el día en que lo tocas.
- **Las pruebas solo vigilan lo que les pides.** Ninguna abría una guía por su URL, hasta que hizo falta.
