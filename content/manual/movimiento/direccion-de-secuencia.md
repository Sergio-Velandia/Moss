---
title: Dirección de secuencia: tiempos, actos y escalonado
description: La hoja de tiempos que se escribe antes del código, los cuatro actos de una apertura, la matemática del escalonado (y la onda cuando son muchos), y mover el contenedor en lugar de quince elementos.
type: manual
tags: [animación, movimiento, secuencia, escalonado, stagger, coreografía, hoja de tiempos]
technologies: [CSS, React]
createdAt: 2026-11-18
related: [route/movimiento-web, lab/secuencia-de-apertura, lab/escalonado-por-onda, lab/revelado-por-mascara]
references: [MDN: animation-delay | https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay, MDN: usar animaciones CSS | https://developer.mozilla.org/es/docs/Web/CSS/CSS_animations/Using_CSS_animations, web.dev: animaciones de alto rendimiento | https://web.dev/articles/animations-guide]
---

## Problema que resuelve

Una página con animaciones y una página que se siente **editada** usan las mismas propiedades. La diferencia no está en los efectos: está en los **tiempos**. Qué entra primero, cuánto espera lo siguiente, qué se queda quieto y cuándo termina todo.

La señal más clara de una secuencia hecha sin dirección es que todo entra a la vez, con retrasos de 50 ms entre elementos que nadie eligió.

Es el **paso 3** de la ruta [Movimiento web](/rutas/movimiento-web).

## La idea en una imagen

Una secuencia es **una escena de cine**. Primero el plano general, para saber dónde estamos. Después entra el protagonista, solo. Luego los secundarios, de a uno. Y al final, quietud: el plano se sostiene. Nadie filma a todos los actores entrando a la vez.

## 1. Se escribe una hoja de tiempos, no una lista de efectos

Antes de una línea de código va una tabla en segundos, como un guion técnico:

| t | Qué pasa | Por qué |
| --- | --- | --- |
| 0,00 | La cámara se acerca y aparece el fondo | Primero el lugar: nadie lee aún |
| 0,25 | El titular entra con anticipación y exceso | El protagonista llega cuando ya hay un marco |
| 0,90 | Las etiquetas entran, 90 ms entre ellas | Lo secundario, cuando el titular terminó |
| 1,40 | Reposo | Desde aquí, la página es estática |

La regla: **si no puedes escribir esta tabla, todavía no sabes qué quieres.** Y cuando la tienes, los retrasos del código salen de la tabla, no al revés. En la [secuencia de apertura](/laboratorio/secuencia-de-apertura) del Laboratorio es literal: la tabla es un arreglo, y el CSS lee sus números.

## 2. Los cuatro actos

```flow
# Una apertura en cuatro actos
Marco :: el contenedor, el fondo, la atmósfera
Protagonista :: el titular, solo
Acompañamiento :: lo secundario, escalonado
+ Reposo :: todo quieto, y es parte de la secuencia
```

En palabras: primero el marco, el contenedor y el fondo, cuando todavía nadie lee. Después el protagonista, normalmente el titular, y solo él se mueve. Luego el acompañamiento, lo secundario, escalonado. Y al final el reposo: todo quieto, que también es parte de la secuencia y no su ausencia.

Si dos actos pasan a la vez, la secuencia se siente barata. Si falta el reposo, todo tiene la misma intensidad y nada destaca.

## 3. La matemática del escalonado

El retraso entre elementos hermanos depende de cuántos son:

| Elementos | Retraso entre ellos | Total que añade |
| --- | --- | --- |
| 2 a 4 | 90–120 ms | hasta 0,5 s |
| 5 a 10 | 50–80 ms | hasta 0,8 s |
| 10 a 30 (letras) | 25–40 ms | hasta 1,2 s |
| Más de 30 | no de uno en uno | una onda |

Con muchos elementos, `índice × retraso` se vuelve una máquina de escribir: 60 cuadros a 25 ms son 1,5 s esperando al último. La alternativa es la **distancia a un origen**: los más cercanos al punto donde «entra» el movimiento se mueven antes, y los que están a la misma distancia, a la vez.

```js
const distancia = Math.hypot(x - origenX, y - origenY)
elemento.style.animationDelay = `${distancia * 45}ms`
```

En el [escalonado por onda](/laboratorio/escalonado-por-onda) se ve la diferencia con los mismos 60 cuadros: por índice, el último entra a los 1475 ms; por distancia desde la esquina, a los 463.

### Anticipación, exceso y asentamiento

Lo que da peso a un movimiento son tres momentos que una curva sola no da: antes de subir, baja un poco; pasa del destino un 3–6 %; y vuelve más despacio de lo que fue. Se consigue con fotogramas intermedios:

```css
@keyframes entrar {
  0% { opacity: 0; transform: translateY(22px) scale(0.985); }
  55% { opacity: 1; transform: translateY(-4px) scale(1.004); }
  100% { transform: none; }
}
```

Con moderación: en un titular serio, exagerarlo lo vuelve infantil.

## 4. Se mueve la cámara, no los elementos

El error más común al buscar algo cinematográfico es animar quince elementos a la vez. Un director mueve **la cámara**, y en la web la cámara es el contenedor:

```css
.escena { animation: acercarse 600ms cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes acercarse {
  from { opacity: 0; transform: scale(1.06); }
  to { opacity: 1; transform: none; }
}
```

Un solo `transform` en el padre produce un travelling sobre todo lo que contiene, con el costo de animar un elemento. Si además las capas de dentro se mueven a distinta velocidad, hay profundidad. El texto, eso sí, va siempre con su fondo: texto que se mueve a otra velocidad que lo que tiene detrás se lee peor y marea.

## 5. Las salidas también se dirigen

Una sección que entra con una coreografía de 800 ms y desaparece de golpe se siente a medio hacer. Las salidas son **más rápidas**, en torno al 60 % de la entrada, y lo que sale se quita de en medio.

## Así lo hice yo: la entrada de Moss

La pantalla de entrada de Moss dura 2,6 s. Esta es su hoja de tiempos, sacada de los porcentajes de [`entrada.css`](https://github.com/Sergio-Velandia/Moss/blob/main/src/styles/entrada.css) sobre esos 2600 ms:

| t (s) | Qué pasa | Acto |
| --- | --- | --- |
| 0,00–0,91 | Tres capas de vapor aparecen, con 120 ms entre ellas | Marco |
| 0,00–1,17 | 70 granos se juntan en el brote | Protagonista |
| 0,52–1,14 | El nombre se condensa: primero una copia borrosa, después el nítido | Protagonista |
| 0,88–1,74 | La silueta del brote aparece y los granos se apagan dentro de ella | Protagonista |
| 1,09–1,56 | La línea y el lema | Acompañamiento |
| 1,74–1,82 | Nada se mueve | Reposo |
| 1,82–2,60 | Todo se difumina y la capa se va | Salida |

Dos cosas que funcionan, y dos que, mirándola con esta hoja, no del todo:

- **El escalonado de los granos no es por índice.** Con 70 granos a 40 ms, el último esperaría 2,8 s, más que toda la pantalla. El retraso es `(i % 7) × 40 ms`: siete grupos que entran como una onda, con el último a los 240 ms.
- **La salida dura 0,78 s**, frente a los cerca de 1,5 s de la entrada: algo más de la mitad, como pide la regla.
- **Dos protagonistas a la vez.** El nombre empieza a condensarse cuando los granos todavía se están juntando, y durante medio segundo compiten. Separarlos le daría al brote su momento y al nombre el suyo.
- **Un reposo de 80 ms.** Los últimos granos se apagan hasta los 1,74 s y la salida empieza a los 1,82: casi no hay quietud antes de irse. Es lo primero que ajustaría.

## Errores frecuentes

- **Elegir los retrasos en el código**, a ojo, sin una tabla que los justifique.
- **Todo entra a la vez** con 50 ms entre elementos.
- **Escalonar 40 tarjetas por índice.** La última tarda dos segundos en llegar.
- **Animar cada hijo** cuando bastaba con mover el contenedor.
- **Diseñar solo las entradas.**
- **Una apertura que no se puede saltar.**

## Lista de comprobación

- [ ] La secuencia tiene una hoja de tiempos escrita, y los retrasos del código salen de ella.
- [ ] Los cuatro actos no se pisan, y hay reposo al final.
- [ ] El escalonado usa el retraso de la tabla según la cantidad, y una onda con más de 30 elementos.
- [ ] Un movimiento de conjunto se hace en el contenedor, no en cada elemento.
- [ ] Las salidas existen y son más rápidas que las entradas.
- [ ] La apertura se puede saltar, y con movimiento reducido se ve el estado final.
