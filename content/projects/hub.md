---
title: Hub de sergio-velandia.dev
description: La portada del dominio, que dice quién soy y reparte hacia los cuatro proyectos. Es HTML y CSS sin compilar, con una escena 3D que se puede caer sin que la página lo note.
type: project
status: desarrollo
theme: hub
version: 0.2.0
reviewedAt: 2026-11-18
repo: https://github.com/Sergio-Velandia/Sergio-Velandia.github.io
site: https://sergio-velandia.dev/
tags: [arquitectura, html, css, three.js, mejora progresiva, decisiones, sitio estático]
technologies: [HTML, CSS, JavaScript, three.js]
createdAt: 2026-11-18
related: [project/portafolio, manual/despliegue/dominio-propio-github-pages-cloudflare, manual/despliegue/que-se-vea-bien-al-compartirlo, journal/accesibilidad-que-no-se-ve]
---

## Ficha

El hub es la raíz de `sergio-velandia.dev`: una sola página con mi nombre, una frase sobre lo que hago y cuatro destinos (el portafolio, Moss, Moss Nexus y Moss Taste). No tiene backend, ni cuentas, ni formulario.

**Problema que resuelve:** la raíz del dominio empezó como una redirección al portafolio ([`4ea8562`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/commit/4ea8562)). Con cuatro proyectos, quien llegaba a `sergio-velandia.dev` acababa en uno solo sin saber que existían los demás. El hub los presenta a la vez. Además es el **repositorio de usuario** de GitHub Pages: guarda el `CNAME` del que dependen los cuatro proyectos, el `robots.txt` con los sitemaps de todos y el 404 de la raíz. Cómo se trabaja en él está en su [README](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io#readme).

**Estado real (v0.2.0, en desarrollo):** dos fases, cada una con su tag: la `v0.1.0`, capa base sin JavaScript, y la `v0.2.0`, escena 3D dirigida por el scroll. Después llegaron la licencia y dos correcciones que aún no tienen versión. No tiene `package.json` ni CHANGELOG, así que su versión solo vive en los tags.

## Arquitectura

```mindmap
Hub
- Capa base :: HTML y CSS, sin JavaScript
  - nombre, quién soy y cuatro destinos
  - fuentes autoalojadas
- Capa CSS :: un solo gesto
  - copia en oro con clip-path
  - fundido con movimiento reducido
- Escena 3D :: opcional
  - escena.js en el head
  - three.js fijado, desde CDN y con SRI
  - clase con-escena
- Repositorio raíz :: lo que comparte el dominio
  - CNAME
  - robots.txt con los sitemaps
  - 404.html de la raíz
```

En palabras: son tres capas, y cada una solo añade. La **capa base** es HTML y CSS que se lee y se navega entero sin JavaScript. Encima, la **capa CSS** pone el único gesto de movimiento: al pasar el cursor o enfocar un destino, una copia en oro de la fila se revela con `clip-path` (280 ms al entrar, 170 ms al salir), y con movimiento reducido pasa a un fundido de 150 ms. Arriba de todo, la **escena 3D**: miles de puntos que forman «SV», se deshacen en una esfera y se rompen en cuatro constelaciones, una detrás de cada enlace.

No hay paso de compilación: GitHub Pages publica los archivos del repositorio tal como están, sin workflow propio. Las fuentes son archivos del repositorio, con su licencia SIL OFL, y el color es el oro y grafito del portafolio.

## Flujo de datos

```flow
# Lo que decide la escena al cargar
escena.js :: se carga en el head, antes del primer pintado
? ¿Movimiento permitido y una ventana alta?
+ Pide three.js :: jsDelivr y luego unpkg, con SRI y 8 s de límite | ! Capa base :: sin crear WebGL ni descargar three.js
? ¿Cargó y hay una GPU real?
+ Capítulos :: SV, esfera y cuatro constelaciones | ! Desmonta :: vuelve a la base con un aviso discreto
```

En palabras: `escena.js` es lo único que activa el modo capítulos. Con movimiento reducido o una ventana de menos de 35rem de alto, no hace nada: no crea el contexto WebGL ni descarga three.js. Si no, pide three.js a jsDelivr y, si falla, a unpkg, siempre con el mismo hash SRI y un límite de 8 segundos. Si la descarga falla, no pasa el SRI, tarda demasiado, el navegador pintaría sin GPU (`failIfMajorPerformanceCaveat`) o el contexto WebGL se pierde, la escena se desmonta, la página vuelve a la capa base y aparece una línea en el pie: «La animación 3D no está disponible aquí. La página funciona igual.» Si la persona activa el movimiento reducido con la página abierta, la escena se apaga sin aviso.

Mientras three.js carga, la página ya está en el modo capítulos. Es el único momento en que la base y la escena no coinciden, y por eso la espera tiene límite.

Con la escena en marcha, **el scroll solo mueve números entre 0 y 1**. Se lee en un escuchador, nunca dentro del bucle; hay un solo `requestAnimationFrame`; en reposo no se dibuja, y con la pestaña oculta el bucle se detiene. El procesador no toca ninguna partícula al desplazarse: el sombreador mezcla las posiciones de cada capítulo.

## Decisiones

- **Decisión:** HTML y CSS planos, sin framework ni paso de compilación. **En vez de:** React y Vite, como el resto de la familia. **Porque:** es la puerta de entrada del dominio y tiene que funcionar aunque falle todo lo demás. Sin build, lo publicado es exactamente lo que está en el repositorio, y el repositorio que guarda el `CNAME` de todos los proyectos no depende de que una compilación salga bien. Una página de cuatro enlaces tampoco necesita más.
- **Decisión:** la escena 3D es una capa opcional que se desmonta ante cualquier fallo. **En vez de:** una portada que depende de WebGL. **Porque:** el contenido es el nombre y cuatro enlaces, y tienen que llegar a todos: sin JavaScript, sin GPU, con movimiento reducido o con una conexión que no trae three.js.
- **Decisión:** three.js `0.159.0` desde un CDN, fijado y con integridad SRI, y un segundo CDN de respaldo. **En vez de:** instalarlo con npm y empaquetarlo. **Porque:** sin build no hay empaquetador. La `0.159.0` es la última con un archivo único para `<script>`, y el SRI garantiza que se ejecuta ese archivo exacto. El costo: actualizarla exige recalcular el hash en `escena.js`.
- **Decisión:** el scroll solo mueve números entre 0 y 1, y la GPU mezcla las posiciones. **En vez de:** recalcular las partículas en el procesador en cada evento de scroll. **Porque:** con 32 000 puntos en escritorio y 11 000 en móvil, mover cada uno desde JavaScript en cada scroll no cabe en un cuadro.
- **Decisión:** la calidad solo baja. La relación de píxeles empieza con un tope de 1,5 en escritorio y 1,3 en móvil, y si dos tandas seguidas de 30 cuadros promedian más de 40 ms, baja 0,25 hasta 1; después se muestran menos puntos, hasta 6000. **En vez de:** subirla y bajarla según el rendimiento. **Porque:** oscilar se nota más que el problema. Los puntos están barajados, así que mostrar menos no deja huecos en la forma.
- **Decisión:** el oro y grafito del portafolio, sin color propio. **En vez de:** un acento nuevo, como los demás proyectos. **Porque:** el hub presenta a la persona, no a un producto, y la identidad personal ya es la del portafolio.

## Lecciones

- **Un README también puede prometer lo que no cumple.** Enlazaba un `LICENSE` que no existía, decía que bastaba abrir `index.html` (con rutas absolutas no carga el CSS) y que su 404 atendía todo el dominio, cuando cada proyecto sirve el suyo. Se corrigió en [`e888ea5`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/commit/e888ea5).
- **Lo que comparte el dominio se amplía, no se reescribe.** El `robots.txt` declara los sitemaps de todos los sitios: cada proyecto nuevo suma su línea sin borrar las demás.
- **El contraste no puede depender de la escena.** Las constelaciones esquivan los rectángulos del texto, y la copia en oro invierte el texto justo en el borde del barrido, así que se lee igual en todos los cuadros.

## Roadmap

Sin fechas. El repositorio no tiene ROADMAP propio; esto es lo que falta hoy:

- Un CHANGELOG, y una versión para los cambios que llegaron después de la `v0.2.0`.
- La `v1.0.0`, cuando las fases estén cerradas.
