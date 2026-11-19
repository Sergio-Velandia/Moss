---
title: Una nube de puntos dirigida por el scroll
description: La receta completa de una escena WebGL que el scroll transforma, con varias posiciones por partícula y el sombreador mezclando entre ellas, la esfera por distribución de Fibonacci, un solo requestAnimationFrame, y nunca leer el scroll dentro del bucle.
type: manual
tags: [animación, webgl, three.js, partículas, scroll, sombreadores, rendimiento]
technologies: [JavaScript, three.js, WebGL]
createdAt: 2026-11-18
related: [route/movimiento-web, project/hub, manual/movimiento/que-no-se-caiga-en-un-movil-flojo, manual/movimiento/direccion-de-secuencia]
references: [three.js: Points | https://threejs.org/docs/#api/en/objects/Points, three.js: ShaderMaterial | https://threejs.org/docs/#api/en/materials/ShaderMaterial, MDN: requestAnimationFrame | https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame, MDN: buenas prácticas de WebGL | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices]
---

## Problema que resuelve

Es el efecto de muchos sitios que impresionan: miles de puntos que forman una palabra, se deshacen en una esfera al bajar y se reparten por la pantalla. Parece magia, y el instinto es mover cada punto desde JavaScript en cada evento de scroll. Con 30 000 puntos, eso no cabe en un cuadro.

La receta que funciona es la contraria: **el procesador no toca ni una partícula al desplazarse**. Cada punto ya sabe dónde tiene que estar en cada forma, y el scroll solo mueve unos números entre 0 y 1 que la tarjeta gráfica usa para mezclar.

Es el **paso 4** de la ruta [Movimiento web](/rutas/movimiento-web). Todo el código sale de la escena del [hub de sergio-velandia.dev](/proyectos/hub), que está en producción.

## La idea en una imagen

Cada punto es **un bailarín que se sabe tres coreografías de memoria**: dónde ponerse para formar la letra, dónde para la esfera y dónde para el final. Nadie le grita instrucciones paso a paso. El director solo dice «vamos por el 40 % de la segunda», y todos saben exactamente dónde estar.

## Las piezas

```mindmap
Nube de puntos dirigida por scroll
- Geometría :: varias posiciones por punto
  - la letra, desde un canvas
  - la esfera, por Fibonacci
  - los destinos, desde el DOM
- Sombreador :: mezcla con mix()
  - un uniforme por forma, de 0 a 1
- Bucle :: uno solo
  - el scroll se lee en un escuchador
  - un seguidor amortiguado
  - en reposo no dibuja
- Respaldo :: la página base debajo
  - sin WebGL ni movimiento, texto normal
```

En palabras: la geometría guarda varias posiciones por punto, una por forma: la letra sale de un canvas, la esfera de una distribución de Fibonacci y los destinos de las cajas del DOM. El sombreador mezcla entre ellas con `mix()`, controlado por un uniforme de 0 a 1 por forma. Un solo bucle actualiza todo, con el scroll leído en un escuchador y un seguidor amortiguado, y no dibuja si nada cambió. Debajo queda siempre la página base, legible sin WebGL.

## 1. Varias posiciones por punto

En lugar de una posición que JavaScript cambia, cada punto guarda **todas** sus posiciones como atributos de la geometría:

```js
geo.setAttribute('position', new THREE.BufferAttribute(letra, 3))     // forma 1: la letra
geo.setAttribute('aDisperso', new THREE.BufferAttribute(disperso, 3)) // el estado inicial
geo.setAttribute('aEsfera', new THREE.BufferAttribute(esfera, 3))     // forma 2
geo.setAttribute('aGrupo', new THREE.BufferAttribute(grupo, 3))       // forma 3: los destinos
geo.setAttribute('aSemilla', new THREE.BufferAttribute(semilla, 1))   // un azar fijo por punto
```

Y el sombreador de vértices mezcla en cadena:

```glsl
vec3 p = mix(aDisperso, position, uLetra);
p = mix(p, aEsfera, uEsfera);
p = mix(p, aGrupo, uGrupo);
```

Con `uLetra`, `uEsfera` y `uGrupo` en 0, los puntos están dispersos. Con `uLetra` en 1 forman la letra; con `uEsfera` en 1, la esfera. Mover el scroll es cambiar tres números por cuadro, sin importar si hay 3000 puntos o 30 000.

## 2. Las tres formas

### La letra, desde un canvas

Se dibuja el texto en un canvas fuera de pantalla y se guardan los píxeles cuyo alfa pasa un umbral:

```js
c.font = '800 320px "Syne", sans-serif'
c.fillText('SV', w / 2, h / 2)
const datos = c.getImageData(0, 0, w, h).data
for (let y = 0; y < h; y += 2)
  for (let x = 0; x < w; x += 2)
    if (datos[(y * w + x) * 4 + 3] > 128) xs.push(x), ys.push(y)
```

Dos detalles que no se ven hasta que fallan: la fuente tiene que estar cargada antes de dibujar (`document.fonts.load(...)`), o la letra sale con la de respaldo; y cada punto necesita **un poco de grosor en Z**, porque si no, al girar la letra se ve como una calcomanía.

### La esfera, por distribución de Fibonacci

Con ángulos al azar, los puntos se amontonan en los polos y se nota un nudo arriba y abajo. La distribución de Fibonacci los reparte parejos:

```js
const k = i + 0.5
const fi = Math.acos(1 - (2 * k) / N)
const te = Math.PI * (1 + Math.sqrt(5)) * k
esfera.push(Math.sin(fi) * Math.cos(te), Math.cos(fi), Math.sin(fi) * Math.sin(te))
```

### Los destinos, desde el DOM

Para que los puntos terminen detrás de cada enlace, se lee el rectángulo real del elemento y se convierte a coordenadas del mundo en el plano `z = 0`. La altura visible a una distancia de la cámara es `2 × tan(fov / 2) × distancia`, y de ahí sale cuánto mide un píxel:

```js
const porPx = (2 * Math.tan((FOV * Math.PI) / 360) * DISTANCIA) / altoVentana
const x = (rect.left + rect.width / 2 - anchoVentana / 2) * porPx
```

Esto se calcula al montar y al redimensionar, **nunca al desplazarse**.

## 3. El guion, en fracciones de scroll

Con el scroll convertido en un número `p` entre 0 y 1, la secuencia se escribe como una [hoja de tiempos](/manual/movimiento/direccion-de-secuencia):

```js
u.uEsfera.value = suave(tramo(p, 0.18, 0.44)) // la letra se vuelve esfera
u.uGrupo.value = suave(tramo(p, 0.62, 0.84))  // la esfera se reparte en los destinos
u.uGiro.value = p * 3.1                       // media vuelta de arriba abajo
```

`tramo(p, a, b)` lleva `p` de `[a, b]` a `[0, 1]`, y `suave(x) = x * x * (3 - 2 * x)` hace que cada transformación entre y salga sin golpe.

- **Entre 0,44 y 0,62 no pasa nada, a propósito.** Es el silencio entre dos capítulos: sin él no hay ritmo.
- **El giro es el scroll.** Nada gira por su cuenta, así que quien baja siente que la mueve.
- **Los destinos aterrizan en 0,84**, justo cuando los enlaces quedan visibles: ningún punto en vuelo bajo el texto.

## 4. Un solo bucle, y el scroll fuera de él

Tres bucles compitiendo (uno de la librería de scroll, otro de animación, otro del render) producen microtirones imposibles de depurar. **Un único `requestAnimationFrame` gobierna todo.**

Y la regla que parece menor y no lo es: **nunca leas el scroll dentro del bucle.** Leer `scrollY` en mitad del cuadro puede obligar al navegador a recalcular el diseño. Se lee en un escuchador y se guarda:

```js
addEventListener('scroll', () => { objetivo = scrollY / maxScroll }, { passive: true })

function cuadro(t) {
  const dt = ultimo ? t - ultimo : 16.7
  ultimo = t
  // El seguidor: persigue el scroll en vez de ir pegado, igual a 30 o a 120 Hz
  const k = 1 - Math.pow(1 - 0.075, Math.min(dt, 100) / 16.67)
  const antes = actual
  actual += (objetivo - actual) * k
  if (Math.abs(actual - antes) > 0.00002) escena.dibujar(actual)
  requestAnimationFrame(cuadro)
}
```

- **El seguidor amortiguado** es lo que da inercia: la cámara no va pegada al scroll, lo persigue. Ese 0,075 es literalmente el peso de la escena.
- **Corregido por el tiempo de cuadro.** Un `actual += (objetivo - actual) * 0.075` a secas va el doble de rápido en una pantalla de 120 Hz que en una de 60. Elevar el factor a `dt / 16,67` lo iguala.
- **En reposo no se dibuja.** Si nada cambió, el cuadro se salta: la tarjeta gráfica descansa y el teléfono no se calienta.

## 5. El punto redondo

Un `THREE.Points` dibuja cuadrados. El sombreador de fragmentos los redondea y descarta lo invisible:

```glsl
float a = smoothstep(0.5, 0.06, length(gl_PointCoord - 0.5)) * vAlfa;
if (a < 0.01) discard;
gl_FragColor = vec4(uColor, a);
```

Con `AdditiveBlending` y `depthWrite: false`, los puntos que se superponen suman luz en vez de taparse, y no hace falta ordenarlos.

## Así lo hice yo

- **La escena del hub** está en [`assets/escena.js`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/blob/main/assets/escena.js): 32 000 puntos en escritorio y 11 000 en móvil, que forman «SV», se vuelven esfera y se rompen en cuatro constelaciones, una detrás de cada destino.
- **El escenario mide cuatro pantallas de alto** (`main` a `400vh`) y el lienzo va fijo detrás, a pantalla completa.
- **Las constelaciones esquivan los rectángulos del texto**, así el contraste no depende de la escena.
- **El foco del teclado trae su capítulo.** Tabular hacia un enlace salta al final del recorrido, donde está visible.
- **Todo es opcional.** Sin JavaScript, con movimiento reducido, sin GPU o si three.js no carga, no se crea el contexto WebGL y la página es su capa base, legible entera. Cómo se decide eso está en el [paso 5](/manual/movimiento/que-no-se-caiga-en-un-movil-flojo).

## Errores frecuentes

- **Mover las partículas desde JavaScript** en cada scroll.
- **Leer `scrollY` dentro del bucle**, o tener tres bucles.
- **Un seguidor sin corregir por el tiempo de cuadro.**
- **Esfera con ángulos al azar**: nudos en los polos.
- **Letra sin grosor**, o dibujada antes de que cargue la fuente.
- **Dibujar en cada cuadro aunque nada cambie.**
- **Que la página dependa de la escena** para leerse.

## Lista de comprobación

- [ ] Cada punto guarda una posición por forma, y el scroll solo mueve uniformes de 0 a 1.
- [ ] La esfera usa la distribución de Fibonacci y la letra tiene grosor en Z.
- [ ] Los destinos se miden al montar y al redimensionar, nunca al desplazarse.
- [ ] Hay un solo `requestAnimationFrame`, y el scroll se lee en un escuchador.
- [ ] El seguidor se corrige por el tiempo de cuadro, y en reposo no se dibuja.
- [ ] Entre dos transformaciones hay un tramo de silencio.
- [ ] Sin WebGL o con movimiento reducido, la página se lee entera.
