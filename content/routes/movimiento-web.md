---
title: Movimiento web: de las reglas a una escena dirigida por el scroll
description: Animar sin romper nada, revelados atados al scroll con solo CSS, secuencias con dirección y una nube de puntos en WebGL que no se cae en un móvil flojo. Cada concepto con su pieza en vivo en el Laboratorio.
type: route
level: intermedio
order: 7
tags: [animación, movimiento, scroll, css, webgl, rendimiento, accesibilidad, ruta]
technologies: [CSS, JavaScript, React, three.js]
createdAt: 2026-11-18
steps: [manual/movimiento/las-reglas-que-no-se-negocian, lab/revelado-por-mascara, manual/movimiento/animar-con-el-scroll-sin-javascript, lab/revelado-con-view, lab/barra-de-progreso-con-scroll, manual/movimiento/direccion-de-secuencia, lab/escalonado-por-onda, lab/secuencia-de-apertura, manual/movimiento/nube-de-puntos-dirigida-por-el-scroll, manual/movimiento/que-no-se-caiga-en-un-movil-flojo]
---

## Para quién es

Para quien ya maqueta con soltura y quiere que su interfaz se mueva con intención: que se sienta editada, no decorada, y que siga funcionando en un móvil de gama media, con movimiento reducido o sin JavaScript. Las primeras guías son CSS; las dos últimas, WebGL con three.js, y no hace falta saber de sombreadores para seguirlas.

Lo que cuentan sale de proyectos reales: la pantalla de entrada de Moss y la escena 3D del [hub de sergio-velandia.dev](/proyectos/hub).

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Reglas :: movimiento que no rompe nada
  - solo transform y opacity
  - movimiento reducido bien tratado
- Scroll sin JavaScript :: animation-timeline
  - barras de progreso con scroll()
  - revelados con view()
- Dirección :: tiempos que se eligen
  - hoja de tiempos y cuatro actos
  - escalonado en onda
- Espectáculo :: WebGL que puede fallar
  - una nube de puntos dirigida por el scroll
  - calidad que se ajusta sola
```

## Cómo seguirla

Cada guía va seguida de sus piezas en el Laboratorio: no basta con leer cómo se mueve algo, hay que verlo moverse, repetirlo y abrir su código. Todas las piezas tienen un botón para repetir y respetan el movimiento reducido. Marca cada paso como hecho al terminarlo: tu progreso se guarda en este navegador.

| # | Paso | Para leer o probar |
| --- | --- | --- |
| 1 | Las reglas | [Las reglas del movimiento que no se negocian](/manual/movimiento/las-reglas-que-no-se-negocian) y la pieza [revelado por máscara](/laboratorio/revelado-por-mascara) |
| 2 | Scroll sin JavaScript | [Animar con el scroll sin JavaScript](/manual/movimiento/animar-con-el-scroll-sin-javascript), con el [revelado con `view()`](/laboratorio/revelado-con-view) y la [barra de progreso con `scroll()`](/laboratorio/barra-de-progreso-con-scroll) |
| 3 | Dirección | [Dirección de secuencia](/manual/movimiento/direccion-de-secuencia), con el [escalonado por onda](/laboratorio/escalonado-por-onda) y la [secuencia de apertura](/laboratorio/secuencia-de-apertura) |
| 4 | Espectáculo | [Una nube de puntos dirigida por el scroll](/manual/movimiento/nube-de-puntos-dirigida-por-el-scroll) |
| 5 | Que aguante | [Que no se caiga en un móvil flojo](/manual/movimiento/que-no-se-caiga-en-un-movil-flojo) |

La nube de puntos no tiene pieza en el Laboratorio a propósito: es una escena de pantalla completa con su propio bucle, y su lugar es una página entera. Se ve funcionando en [sergio-velandia.dev](https://sergio-velandia.dev/), con un equipo que la soporte y sin movimiento reducido.
