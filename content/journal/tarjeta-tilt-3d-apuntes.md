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

Hay personas a las que este tipo de movimiento les provoca malestar, y el sistema operativo tiene un ajuste para pedirlo (`prefers-reduced-motion`).

Mi primera versión usaba la clase `motion-reduce:transform-none` de Tailwind y **no funcionaba**: la inclinación se aplica con un `style` en línea, y un estilo en línea siempre gana a una clase. Lo descubrí al probarlo en un navegador real con el movimiento reducido activado: la tarjeta seguía inclinándose. La solución es comprobar la preferencia en JavaScript:

```tsx
import { useReducedMotion } from 'motion/react'

const reduceMotion = useReducedMotion()

const onMove = (e: React.PointerEvent) => {
  if (reduceMotion || e.pointerType !== 'mouse') return
  // ...calcular la inclinación
}
```

## 4. En el móvil no hay "hover"

Al tocar una pantalla, el navegador simula un movimiento de ratón. Con eventos de ratón (`onMouseMove`), un toque dejaba la tarjeta inclinada hasta que se tocaba otra cosa. Con eventos de puntero (`onPointerMove`) puedo mirar `pointerType` y reaccionar solo al ratón.

## Lo que aprendí

Un efecto decorativo también necesita decisiones de accesibilidad, y hay que probarlas en un navegador de verdad: la primera versión parecía correcta en el código y fallaba en dos casos (movimiento reducido y pantallas táctiles).
