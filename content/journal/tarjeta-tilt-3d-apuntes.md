---
title: Apuntes sobre la tarjeta tilt 3D
description: Cómo se calcula la inclinación según el cursor y qué cuidar para que no moleste.
type: journal
category: Aprendizajes
tags: [tilt, animación, css, accesibilidad]
technologies: [React, CSS]
createdAt: 2026-10-09
related: [lab/tilt-card]
---

## La idea

Una tarjeta que se inclina hacia donde apunta el cursor. El efecto es corto de escribir, pero tiene tres detalles que conviene recordar.

## 1. Normalizar la posición

Para saber cuánto inclinar, convierto la posición del cursor a un valor entre -0.5 y 0.5 dentro de la tarjeta:

```ts
const x = (e.clientX - rect.left) / rect.width - 0.5
const y = (e.clientY - rect.top) / rect.height - 0.5
```

Ese valor se multiplica por el ángulo máximo. Normalizar hace que el efecto funcione igual en una tarjeta pequeña o grande.

## 2. La perspectiva va en el contenedor

`rotateX` y `rotateY` se ven planos si el elemento padre no tiene `perspective`. Por eso la tarjeta va envuelta en un `div` con `perspective: 800`.

## 3. Respetar el movimiento reducido

Hay personas a las que este tipo de movimiento les provoca malestar. En Tailwind basta con `motion-reduce:transform-none` para desactivar la inclinación cuando el sistema lo pide.

## Lo que aprendí

Un efecto decorativo también necesita decisiones de accesibilidad. Dejarlo preparado desde la primera versión es más barato que arreglarlo después.
