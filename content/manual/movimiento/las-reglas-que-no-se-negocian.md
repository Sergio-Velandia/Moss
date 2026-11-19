---
title: Las reglas del movimiento que no se negocian
description: Solo transform y opacity, prefers-reduced-motion que no significa «sin animación», nada importante que dependa de que la animación ocurra, y las duraciones y curvas que funcionan casi siempre.
type: manual
tags: [animación, movimiento, rendimiento, accesibilidad, prefers-reduced-motion, css]
technologies: [CSS, JavaScript]
createdAt: 2026-11-18
related: [route/movimiento-web, lab/revelado-por-mascara, lab/fade-in-list, journal/accesibilidad-que-no-se-ve]
references: [MDN: prefers-reduced-motion | https://developer.mozilla.org/es/docs/Web/CSS/@media/prefers-reduced-motion, web.dev: animaciones de alto rendimiento | https://web.dev/articles/animations-guide, WCAG 2.2: pausar y detener | https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html, WCAG 2.2: tres destellos | https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html]
---

## Problema que resuelve

Una animación mal hecha no se nota como un error. Se nota como una página que va a tirones en un móvil, que marea a alguien con un trastorno vestibular, o que tarda un segundo más en dejar leer. Y casi siempre se rompe por las mismas cinco reglas.

Valen para todo lo demás que trae la ruta: un efecto ambicioso que las rompe no es ambicioso, está roto.

Es el **paso 1** de la ruta [Movimiento web](/rutas/movimiento-web).

## La idea en una imagen

El movimiento en una página es **la iluminación de un escenario**. Bien puesta, dirige la mirada y nadie la nota. Mal puesta, ciega, distrae o deja a oscuras lo que había que ver. Y la función tiene que poder hacerse aunque se vaya la luz: los actores siguen ahí.

## Las cinco reglas

```mindmap
Movimiento que no rompe nada
- Rendimiento :: lo que el navegador compone solo
  - transform y opacity
  - clip-path y filter con medida
- Accesibilidad :: el movimiento es opcional
  - prefers-reduced-motion
  - nada parpadea ni se mueve sin parar
- Mejora progresiva :: la página no depende de él
  - el contenido ya está visible
  - la animación no retrasa nada
- Dirección :: cuánto, cómo y cuántos
  - duraciones y curvas
  - un solo protagonista
```

En palabras: por rendimiento, se anima solo lo que el navegador puede componer sin recalcular la página. Por accesibilidad, el movimiento es opcional y nada parpadea ni se mueve sin parar. Por mejora progresiva, la página funciona sin la animación y no la espera. Y por dirección, las duraciones, las curvas y la cantidad de cosas que se mueven a la vez se eligen.

## 1. Solo `transform` y `opacity`

Son las dos propiedades que el navegador compone sin recalcular el diseño de la página. Animar `width`, `height`, `top`, `left`, `margin` o `padding` obliga a recalcular la posición de todo lo que hay alrededor en cada cuadro, y en un móvil eso se ve como tirones.

| Para | No | Sí |
| --- | --- | --- |
| Mover | `left`, `top`, `margin` | `transform: translate()` |
| Cambiar de tamaño | `width`, `height` | `transform: scale()` |
| Aparecer | `display`, `visibility` a secas | `opacity` |
| Descubrir | `height` de 0 a auto | `clip-path` o `transform` |

Hay excepciones caras pero aceptables, con medida: `filter`, `backdrop-filter` (sobre todo `blur`, el más caro de todos) y `clip-path`. El [revelado por máscara](/laboratorio/revelado-por-mascara) del Laboratorio usa `clip-path` en un titular de tres líneas, no en cien elementos.

`transition: all` es la forma más fácil de animar sin querer una propiedad cara: nombra siempre las propiedades.

## 2. `prefers-reduced-motion` no significa «sin animación»

Quien activa esta preferencia en su sistema pide **menos movimiento**, no ninguno. Significa sin desplazamientos amplios, sin paralaje, sin giros, sin zoom y sin cámara. Un fundido de 150 ms sigue siendo válido y sigue comunicando que algo cambió.

Hay un martillo para lo que se escape:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Pero es solo eso, un martillo. Lo correcto es tratar cada animación: **lo decorativo se apaga, lo que informa se convierte en un fundido corto**.

```css
.revelado { animation: cortina 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }

@media (prefers-reduced-motion: reduce) {
  .revelado { animation: fundido 150ms linear both; }
}
```

Y dos reglas de la WCAG que no son negociables:

- **Nada parpadea más de tres veces por segundo.** Es un riesgo real de convulsiones.
- **Lo que se mueve solo más de cinco segundos tiene que poder detenerse.** Un carrusel automático o un fondo animado necesita un botón para pararlo.

## 3. Nada importante depende de que la animación ocurra

La animación es una capa encima de algo que ya funciona. El texto se lee, los enlaces funcionan y el formulario se envía aunque el JavaScript no cargue, aunque la animación falle o aunque el equipo sea viejo.

Dos formas comunes de romperlo:

- **El contenido arranca invisible y espera a que la animación lo muestre.** Si la animación no corre, el contenido no aparece. El estado inicial oculto se pone desde la misma capa que anima (una clase que añade el JavaScript, o un `@supports`), nunca en el HTML base.
- **Esperas artificiales.** Una pantalla de carga que dura más que la carga, o un titular que tarda un segundo en aparecer por su coreografía. Si el contenido principal llega tarde por culpa de una animación, la página empeoró para ganar un efecto.

## 4. Duraciones y curvas

| Qué | Cuánto |
| --- | --- |
| Microinteracción (pasar el cursor, foco, botón) | 100–200 ms |
| Transición de un elemento | 200–400 ms |
| Transición de página o de sección | 400–600 ms |
| Secuencia de apertura completa | 1,5–4 s, siempre saltable |
| Capítulo de scroll | lo que dure el scroll: lo controla quien baja |

Lo que entra puede ser más lento que lo que sale: lo que sale se quita de en medio rápido.

Para las curvas:

- **`linear`** solo para lo mecánico: barras de progreso, rotación continua y **todo lo que va atado al scroll**, porque ahí la curva la pone la mano de quien baja.
- **Una salida suave** para casi todo lo demás: `cubic-bezier(0.22, 1, 0.36, 1)` funciona casi siempre.
- **Un rebote** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) solo en confirmaciones, y poco.

## 5. Si todo se mueve, nada destaca

En cada pantalla hay **un** momento protagonista. Lo demás lo acompaña con movimientos de 200 ms que nadie nota conscientemente, o no se mueve. Animar cada sección al entrar con el mismo fundido hacia arriba es la señal más clara de una página hecha sin dirección. Cómo se elige y se ordena eso es el [paso 3](/manual/movimiento/direccion-de-secuencia).

## Así lo hice yo

- **La pantalla de entrada de Moss** solo anima `transform` y `opacity`, nunca dura más de 3 segundos y se salta con un toque o una tecla. Una prueba (`scripts/entrada-css.test.ts`) lee el CSS y falla si aparece otra propiedad en sus fotogramas o si la suma de retraso y duración pasa de 3 s.
- **Con movimiento reducido, esa pantalla no aparece.** Es decorativa y retrasa el contenido, así que se apaga entera.
- **El hub de [sergio-velandia.dev](/proyectos/hub)** tiene un solo gesto: una copia en oro de cada destino que se revela con `clip-path` en 280 ms al entrar y 170 ms al salir. Con movimiento reducido, ese barrido se convierte en un fundido de 150 ms: informa igual, sin moverse.

## Errores frecuentes

- **`transition: all 0.3s`.** Anima cualquier propiedad que cambie, incluidas las caras.
- **Apagar todo con movimiento reducido**, también los fundidos que informan que algo cambió.
- **Un titular con `opacity: 0` en el HTML** que solo aparece si el JavaScript corre.
- **La misma animación de entrada en cada sección.** Nada destaca, y el ritmo se vuelve monótono.
- **Medir solo en el computador de desarrollo.** Los tirones aparecen en el móvil.

## Lista de comprobación

- [ ] Solo se animan `transform` y `opacity`, con `clip-path` o `filter` solo donde hace falta.
- [ ] Ninguna transición usa `all`.
- [ ] Con `prefers-reduced-motion`, lo decorativo se apaga y lo que informa queda como un fundido corto.
- [ ] Nada parpadea más de tres veces por segundo, y lo que se mueve solo más de cinco segundos se puede detener.
- [ ] El contenido se ve y se usa sin la animación, y ninguna animación retrasa el contenido principal.
- [ ] Cada pantalla tiene un solo momento protagonista.
