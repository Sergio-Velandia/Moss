---
title: Que no se caiga en un móvil flojo
description: La arquitectura en tres capas que deja impresionar sin romper la página, la relación de píxeles con tope de 1,5 y 1,3, cuántos puntos por dispositivo, bajar la calidad sin oscilar, y pausar todo lo que no se ve.
type: manual
tags: [animación, rendimiento, webgl, móvil, mejora progresiva, batería, accesibilidad]
technologies: [JavaScript, three.js, WebGL]
createdAt: 2026-11-18
related: [route/movimiento-web, project/hub, manual/movimiento/nube-de-puntos-dirigida-por-el-scroll, manual/movimiento/las-reglas-que-no-se-negocian]
references: [MDN: buenas prácticas de WebGL | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices, MDN: Page Visibility API | https://developer.mozilla.org/es/docs/Web/API/Page_Visibility_API, MDN: devicePixelRatio | https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio, Estudio de caso: WebGL en equipos flojos | https://dark-moon.org/blog/webgl-performance-low-end-devices/]
---

## Problema que resuelve

Una escena WebGL que vuela en tu computador puede ir a tirones en un móvil de gama media, calentarlo en dos minutos y, en el peor caso, dejar la página en blanco. Y quien entra por el móvil es, muchas veces, la mayoría.

La salida no es elegir entre impresionar y que funcione. Es una arquitectura donde **el espectáculo puede fallar sin llevarse la página**, y una escena que mide cómo va y se ajusta sola.

Es el **paso 5** de la ruta [Movimiento web](/rutas/movimiento-web).

## La idea en una imagen

La página es **una casa con luz eléctrica y velas**. La casa se recorre de día sin nada (la capa base). Las velas iluminan sin cables (la capa CSS). Y la instalación eléctrica es el espectáculo: si salta el diferencial, se apaga la lámpara, no se cae el techo.

## Tres capas

```flow
# Qué ve cada visita
Capa base :: HTML y CSS, legible sin JavaScript
Capa CSS :: revelados y gestos, sin peso
? ¿Movimiento permitido, ventana alta, GPU real y la librería cargó?
+ Espectáculo :: la escena WebGL, con calidad que se ajusta | ! Se queda en la base :: con un aviso discreto si algo falló
```

En palabras: toda visita recibe la capa base, HTML y CSS que se lee y se navega sin JavaScript. Encima va una capa CSS de revelados y gestos, que no pesa. Solo si el movimiento está permitido, la ventana es lo bastante alta, hay una GPU real y la librería cargó, se monta la escena WebGL, con una calidad que se ajusta sola. Si algo de eso falla, la página se queda en su capa base, con un aviso discreto si el fallo fue a mitad.

Quien llega con un móvil viejo ve una página sobria que funciona. Quien llega con un equipo bueno ve lo que querías enseñarle. Nadie ve una página rota.

## 1. Decidir antes de descargar

Lo más barato es no cargar nada. Antes de pedir la librería 3D:

- **Con `prefers-reduced-motion`**, no se crea el contexto WebGL ni se descarga la librería. Póster fijo o capa base.
- **Con una ventana baja** (en el hub, menos de 35rem de alto), la escena no cabe con el texto, y tampoco se descarga.
- **Con un límite de espera**: si la librería no llegó en unos segundos, se renuncia.

Y al crear el contexto, se le pide a WebGL que falle si el navegador pintaría por software:

```js
const renderer = new THREE.WebGLRenderer({ antialias: false, failIfMajorPerformanceCaveat: true })
```

Si lanza un error, la escena no se monta. Un lienzo pintado por el procesador a pantalla completa es peor que ninguno.

## 2. La relación de píxeles, con tope

En una pantalla de alta densidad, `devicePixelRatio` puede ser 3: el lienzo tendría nueve veces los píxeles de uno a 1. Para puntos difusos sobre un fondo oscuro, esa nitidez no se ve, y el costo es enorme. El tope:

| Dispositivo | Tope de la relación de píxeles |
| --- | --- |
| Escritorio | 1,5 |
| Móvil (menos de 768 px de ancho, o puntero táctil) | 1,3 |

```js
const movil = innerWidth < 768 || matchMedia('(pointer: coarse)').matches
const pixeles = Math.min(devicePixelRatio || 1, movil ? 1.3 : 1.5)
renderer.setPixelRatio(pixeles)
```

## 3. Cuántos puntos

En el hub, una sola nube: **32 000 puntos en escritorio y 11 000 en móvil**. Son puntos que se dibujan de una vez, así que el número importa menos que los píxeles que cubren.

Cuando la escena tiene varias capas, el material de esta ruta parte de las cifras de un [estudio de caso sobre WebGL en equipos flojos](https://dark-moon.org/blog/webgl-performance-low-end-devices/): unos **4200 puntos por capa en escritorio, 2400 en móvil y 1200 con renderizado por software**. Son cifras de ese estudio, no medidas en mis proyectos: sirven de punto de partida, no de verdad.

## 4. Bajar la calidad, sin oscilar

Las pistas del dispositivo (`hardwareConcurrency`, `deviceMemory`) son poco fiables: `deviceMemory` viene redondeado y Safari no lo expone. **La señal de verdad es el tiempo de cuadro medido.**

Lo que hace el hub:

1. Mide el tiempo de cuadro en tandas de 30.
2. Si **dos tandas seguidas** promedian más de 40 ms (menos de 25 cuadros por segundo), baja la calidad.
3. Primero baja la relación de píxeles en 0,25, hasta 1. Después muestra menos puntos, un 30 % menos cada vez, hasta 6000. Como los puntos están barajados, mostrar menos no deja huecos en la forma.
4. **Nunca vuelve a subir.**

```js
if (pixeles > 1) {
  pixeles = Math.max(1, pixeles - 0.25)
  renderer.setPixelRatio(pixeles)
} else if (visibles > 6000) {
  visibles = Math.max(6000, Math.floor(visibles * 0.7))
  geo.setDrawRange(0, visibles)
}
```

El material de partida sugiere subir de nuevo tras tres tandas con holgura. El hub decidió no hacerlo: **oscilar entre dos calidades se nota más que quedarse en la baja**.

## 5. Pausar lo que no se ve

Un lienzo que dibuja sin parar gasta batería aunque nadie lo mire, y en un móvil lo calienta. Cuando el teléfono se calienta, el sistema baja la frecuencia del procesador, y a partir de ahí **todo** va peor, no solo tu animación.

- **Con la pestaña oculta**, el bucle se detiene (`visibilitychange`) y vuelve al regresar.
- **En reposo**, sin scroll ni cursor que cambien algo, el cuadro no se dibuja.
- **Si el contexto WebGL se pierde** (`webglcontextlost`), la escena se desmonta y la página vuelve a su capa base, con un aviso discreto.

## Cómo probarlo

1. Con `prefers-reduced-motion` activado. ¿Se entiende todo igual?
2. Con JavaScript desactivado. ¿Se lee y se navega?
3. Con la CPU limitada 4× o 6× en DevTools. ¿Va fluido, o la calidad baja sola?
4. Solo con el teclado, incluido el scroll.
5. **En un móvil real, dos minutos seguidos.** ¿Calienta? ¿Baja la tasa de cuadros a la mitad? El emulador no lo muestra.
6. A 375 px de ancho.
7. Con la pestaña en segundo plano un rato. ¿Siguió gastando batería?
8. Con la red limitada. ¿Qué se ve mientras carga, y qué pasa si la librería no llega?
9. En un navegador sin WebGL. ¿Qué se ve?

## Así lo hice yo

- **El hub** sigue estas reglas en [`assets/escena.js`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/blob/main/assets/escena.js), y su [README](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io#escena-3d) tiene una tabla de qué se ve en cada caso: sin JavaScript, con movimiento reducido, con la ventana baja, si three.js no carga o tarda más de 8 s, y sin GPU.
- **Las cifras del hub** (los topes de 1,5 y 1,3, los 32 000 y 11 000 puntos, los 40 ms) son las que usa su código. El repositorio no guarda las mediciones que las justificaron, así que no las presento como medidas: son decisiones que funcionan, y la lista de arriba es cómo comprobarlas en tu equipo.
- **El ajuste de calidad deja rastro**: el hub escribe la calidad actual en `data-calidad` del documento (por ejemplo `1.5/32000`), y se puede mirar en DevTools mientras se limita la CPU.

## Errores frecuentes

- **Descargar la librería y después decidir** que no se iba a usar.
- **Una relación de píxeles sin tope** en pantallas de alta densidad.
- **Detectar un equipo flojo por `deviceMemory`.**
- **Subir y bajar la calidad cada pocos segundos.**
- **Dibujar con la pestaña oculta**, o en reposo.
- **Probar solo en el emulador.**
- **Que el espectáculo sea la condición** para que la página funcione.

## Lista de comprobación

- [ ] La página se lee y se navega sin JavaScript ni WebGL.
- [ ] Con movimiento reducido, en una ventana baja o sin GPU real, no se crea el contexto WebGL ni se descarga la librería.
- [ ] La relación de píxeles tiene tope: 1,5 en escritorio y 1,3 en móvil, como punto de partida.
- [ ] La calidad baja según el tiempo de cuadro medido, tras dos tandas lentas, y no oscila.
- [ ] El bucle se detiene con la pestaña oculta y no dibuja en reposo.
- [ ] Si el contexto se pierde, la página vuelve a su capa base.
- [ ] Lo probaste dos minutos en un móvil real.
