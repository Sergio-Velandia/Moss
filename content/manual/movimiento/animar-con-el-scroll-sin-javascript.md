---
title: Animar con el scroll sin JavaScript
description: animation-timeline con scroll() y view() para barras de progreso y revelados sin una línea de JavaScript, su estado de soporte verificado, y las tres trampas que cuestan una tarde cada una.
type: manual
tags: [animación, scroll, animation-timeline, css, view(), scroll(), progreso, revelado]
technologies: [CSS]
createdAt: 2026-11-18
related: [route/movimiento-web, lab/revelado-con-view, lab/barra-de-progreso-con-scroll, manual/movimiento/las-reglas-que-no-se-negocian]
references: [MDN: animation-timeline | https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline, MDN: animaciones dirigidas por scroll | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations, web.dev: novedades de octubre de 2026 | https://web.dev/blog/web-platform-10-2026, MDN: overflow | https://developer.mozilla.org/en-US/docs/Web/CSS/overflow]
---

## Problema que resuelve

Hasta hace poco, una barra de progreso de lectura o una tarjeta que aparece al entrar en pantalla exigían JavaScript: un escuchador de scroll o un `IntersectionObserver`, cálculos en cada evento y cuidado para no leer el scroll en el momento equivocado.

Con `animation-timeline`, el navegador hace todo eso solo. Una animación CSS normal deja de avanzar con el tiempo y pasa a avanzar con el scroll. Sin JavaScript, sin peso, y sin nada que pueda ir a tirones por culpa del hilo principal.

Es el **paso 2** de la ruta [Movimiento web](/rutas/movimiento-web).

## Estado del soporte

**Revisado el 18 de noviembre de 2026.** Las animaciones dirigidas por scroll son **Baseline «newly available» desde el 27 de octubre de 2026**, cuando Firefox 159 las activó por defecto. Chrome y Edge las tienen desde la versión 115, y Safari desde la 26.

«Newly available» significa que todos los motores la tienen, no que todas las personas hayan actualizado su navegador. Por eso todo lo de esta guía va dentro de `@supports`, y lo que no lo soporta ve el contenido quieto, que es exactamente lo que debe ver.

Esta área cambia rápido: si lees esto meses después, revisa el estado en [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) antes de usarlo.

## La idea en una imagen

Una animación normal es **un video que corre solo**. Con `animation-timeline`, el video lo controla **una perilla**: el scroll. Girarla hacia delante avanza la película, hacia atrás la rebobina, y si la sueltas se queda en ese fotograma. La animación es la misma; cambia quién mueve el tiempo.

## Dos líneas de tiempo

```mindmap
animation-timeline
- scroll() :: el scroll de un contenedor
  - de arriba abajo, 0 % a 100 %
  - barras de progreso
- view() :: la posición de un elemento
  - mientras entra y sale de la vista
  - revelados al aparecer
- animation-range :: qué tramo cuenta
  - entry, exit, cover, contain
- Respaldo :: lo que no lo soporta
  - @supports
  - contenido quieto y visible
```

En palabras: `scroll()` avanza con el scroll de un contenedor, de arriba abajo, y sirve para barras de progreso. `view()` avanza según la posición de un elemento mientras entra y sale de la vista, y sirve para revelados. `animation-range` elige qué tramo de ese recorrido cuenta. Y `@supports` deja el contenido quieto y visible donde no hay soporte.

### `scroll()`: una barra de progreso

```css
@keyframes crecer {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@supports (animation-timeline: scroll()) {
  .progreso {
    transform-origin: left;
    animation: crecer linear both;
    animation-duration: 1ms;
    animation-timeline: scroll(nearest block);
  }
}
```

`scroll(nearest block)` usa el contenedor con scroll más cercano, en el eje de bloque (el vertical, en español). Para la página entera, `scroll(root block)`. La curva es `linear`: atada al scroll, la velocidad la pone la mano.

### `view()`: un revelado al entrar

```css
@keyframes aparecer {
  from { opacity: 0; transform: translateY(1.5rem); }
  to { opacity: 1; transform: none; }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .tarjeta {
      animation: aparecer linear both;
      animation-duration: 1ms;
      animation-timeline: view();
      animation-range: entry 0% entry 70%;
    }
  }
}
```

`entry 0% entry 70%` hace que la animación ocurra mientras el elemento entra: empieza cuando asoma por abajo y termina cuando ya entró el 70 %. Si quien lee sube, la tarjeta se va por donde vino.

Con movimiento reducido no hay animación: un revelado al scroll es decorativo, y la tarjeta queda visible y quieta.

## Las tres trampas

### 1. `animation-timeline` va **después** del atajo `animation`

El atajo `animation` reinicia `animation-timeline` a su valor por defecto, aunque no la nombre. Si declaras la línea de tiempo antes, el atajo la borra y la animación vuelve a correr con el reloj.

```css
/* ❌ animation la reinicia */
.tarjeta { animation-timeline: view(); animation: aparecer linear both; }

/* ✅ */
.tarjeta { animation: aparecer linear both; animation-timeline: view(); }
```

### 2. Firefox exige una duración distinta de cero

En una animación dirigida por scroll la duración no significa nada: manda el scroll. Pero Firefox no aplica la animación si la duración es cero, y la convención es `animation-duration: 1ms`. MDN lo usa así en sus propios ejemplos.

### 3. `overflow: hidden` crea un contenedor de scroll

`overflow: hidden` no solo recorta: convierte el elemento en un **contenedor de scroll**, aunque no tenga nada que desplazar. Si está entre tu barra y el contenedor que de verdad se desplaza, `scroll(nearest)` apunta a él, a un scroll que siempre está en cero, y la barra no se mueve.

```css
/* ❌ se vuelve el contenedor de scroll más cercano */
.envoltorio { overflow: hidden; }

/* ✅ recorta igual, sin crear un contenedor de scroll */
.envoltorio { overflow: clip; }
```

La [barra de progreso](/laboratorio/barra-de-progreso-con-scroll) del Laboratorio tiene un interruptor que reproduce esta trampa: con `hidden` se queda quieta, con `clip` funciona.

## Si hace falta en navegadores viejos

`@supports` deja fuera a los navegadores sin soporte, que ven el contenido quieto. Si el efecto es importante para ellos, el respaldo por debajo es `IntersectionObserver` para los revelados, con una clase que el JavaScript añade solo si `@supports` no se cumple. Para la mayoría de los revelados decorativos, contenido quieto es un respaldo perfecto.

## Así lo hice yo

- **Las dos piezas del Laboratorio**, [revelado con `view()`](/laboratorio/revelado-con-view) y [barra de progreso con `scroll()`](/laboratorio/barra-de-progreso-con-scroll), usan exactamente estas reglas, y su código es el que ves en la página.
- **En producción todavía no lo uso.** Los capítulos del [hub](/proyectos/hub) van atados al scroll con JavaScript, porque no mueven CSS: mueven los números que mezclan las posiciones de una escena WebGL. Es el [paso 4](/manual/movimiento/nube-de-puntos-dirigida-por-el-scroll). Para revelar texto o marcar el progreso, en cambio, `animation-timeline` es más simple y no gasta nada.

## Errores frecuentes

- **La animación corre sola al cargar.** El atajo `animation` va después de `animation-timeline`, y la reinició.
- **Funciona en Chrome y no en Firefox.** Falta `animation-duration: 1ms`.
- **La barra no se mueve.** Hay un `overflow: hidden` entre la barra y su contenedor de scroll.
- **Un revelado que mueve todo** con movimiento reducido. Va dentro de `prefers-reduced-motion: no-preference`.
- **Una curva con aceleración** en algo atado al scroll. Se siente como si la página resbalara.

## Lista de comprobación

- [ ] Todo va dentro de `@supports (animation-timeline: …)`, y sin soporte el contenido se ve quieto.
- [ ] `animation-timeline` va después del atajo `animation`.
- [ ] Cada animación dirigida por scroll lleva `animation-duration: 1ms`.
- [ ] Ningún `overflow: hidden` se interpone entre la animación y su contenedor; para recortar, `overflow: clip`.
- [ ] Lo atado al scroll usa `linear`.
- [ ] Los revelados decorativos se apagan con movimiento reducido.
- [ ] Revisaste la fecha de soporte antes de publicar.
