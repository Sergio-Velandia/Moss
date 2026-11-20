---
title: Hub de sergio-velandia.dev
description: La portada del dominio es un flujo de n8n que se ejecuta mientras haces scroll y reparte hacia los cuatro proyectos, con Moss Nexus como nodo principal. Sin compilar, y sin JavaScript se lee entera.
type: project
status: desarrollo
theme: hub
version: 0.3.0
reviewedAt: 2026-11-19
repo: https://github.com/Sergio-Velandia/Sergio-Velandia.github.io
site: https://sergio-velandia.dev/
tags: [arquitectura, html, css, gsap, n8n, mejora progresiva, decisiones, sitio estático]
technologies: [HTML, CSS, JavaScript, GSAP]
createdAt: 2026-11-18
related: [project/moss-nexus, project/portafolio, manual/despliegue/dominio-propio-github-pages-cloudflare, manual/despliegue/que-se-vea-bien-al-compartirlo, journal/accesibilidad-que-no-se-ve]
---

## Ficha

El hub es la raíz de `sergio-velandia.dev`. Desde la v0.3.0, la portada es un flujo de n8n, `hola-soy-sergio`, que se ejecuta mientras haces scroll. Tiene un disparador, **Moss Nexus** como nodo principal, un Switch hacia Moss, Moss Taste y el portafolio, un Merge y «Hablemos», el contacto. A la derecha va el panel de salida de cada nodo, como en el editor de n8n. No tiene backend, ni cuentas, ni formulario.

**Problema que resuelve:** la raíz del dominio empezó como una redirección al portafolio ([`4ea8562`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/commit/4ea8562)). Con cuatro proyectos, quien llegaba a `sergio-velandia.dev` acababa en uno solo sin saber que existían los demás. El hub los presenta a la vez y dice a qué me dedico: la automatización con n8n. Además es el **repositorio de usuario** de GitHub Pages. Guarda el `CNAME` del que dependen los cuatro proyectos, el `robots.txt` con los sitemaps de todos y el 404 de la raíz. Cómo se trabaja en él está en su [README](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io#readme).

**Estado real (v0.3.0, en desarrollo):** tres versiones:
- **v0.1.0:** la capa base sin JavaScript.
- **v0.2.0:** una escena 3D con three.js.
- **v0.3.0:** el rediseño como flujo de n8n, que retira la escena 3D.

Desde la 0.3.0 el repositorio tiene CHANGELOG. Sigue sin `package.json`: la versión vive en el CHANGELOG y en los tags.

## Arquitectura

```mindmap
Hub
- Capa base :: HTML y CSS, sin JavaScript
  - el flujo escrito en el HTML, ya ejecutado
  - dos geometrías: horizontal y vertical
  - seis paneles apilados, con capturas
- Escena :: el scroll ejecuta el flujo
  - position: sticky, sin mover el DOM
  - GSAP y ScrollTrigger en el repositorio
  - un solo bucle, quieto en reposo
- Herramientas :: se corren a mano
  - capturas de los cuatro sitios
  - datos contra sus fuentes
  - grafo que reescribe los SVG
- Repositorio raíz :: lo que comparte el dominio
  - CNAME
  - robots.txt con los sitemaps
  - 404.html de la raíz
```

La **capa base** es el contenido completo: el flujo va escrito en el HTML como SVG, ya ejecutado, en dos geometrías.
- **Horizontal**, para escritorio.
- **Vertical**, para celular: así el grafo se lee a tamaño real, no encogido.

Los seis paneles se leen apilados, cada uno con una captura del sitio en WebP. Sin JavaScript o con movimiento reducido, eso es lo que se ve.

Encima, la **escena** fija la pantalla con `position: sticky` y deja que el scroll ejecute el flujo:
- Un paquete con estela recorre las aristas.
- Cada nodo se enciende con su check.
- La cámara del lienzo sigue al nodo que se ejecuta.
- La barra de estado cuenta los nodos hasta «✓ Ejecución exitosa · 8 nodos, 0 errores».

No hay paso de compilación: GitHub Pages publica los archivos tal como están. Las **herramientas** de `_herramientas/` se corren a mano y no forman parte de la página.

## Flujo de datos

```flow
# Lo que decide la página al cargar
Script del head :: antes del primer pintado
? ¿Movimiento permitido y al menos 560 px de alto?
+ flujo-activo :: escena fijada, el flujo sin ejecutar | ! Capa base :: el flujo ya ejecutado
? ¿GSAP y flujo.js arrancan en menos de 5 s?
+ Escena :: el scroll ejecuta el flujo | ! Vuelve a la base :: sin aviso, todo se lee
```

Un `<script>` corto en el `<head>` pone la clase `flujo-activo` antes del primer pintado. Para eso hacen falta dos condiciones:
- que la persona no haya activado el movimiento reducido;
- que la ventana mida al menos 560 px de alto.

Si GSAP o `flujo.js` no cargan, fallan al arrancar o tardan más de 5 segundos, la clase se quita y la página vuelve a la capa base. Si la persona activa el movimiento reducido con la página abierta, también.

Con la escena en marcha, **el scroll solo mueve un número entre 0 y 5**, el paso del flujo, con una pausa en cada panel. La de Moss Nexus es la más larga. Al soltar el scroll, ScrollTrigger se ajusta al paso más cercano en la dirección del movimiento.

Todo se dibuja en el ticker de GSAP, un único `requestAnimationFrame`. Las aristas usan `pathLength="1"` y los puntos del paquete salen de la fórmula de cada curva Bézier, así que el bucle no mide el DOM. En reposo no se dibuja nada.

## Decisiones

- **Decisión:** la portada es un flujo de n8n, y Moss Nexus es el nodo principal. **En vez de:** la nube de puntos 3D de la v0.2.0. **Porque:** la nube se veía genérica y no decía a qué me dedico. El flujo sí lo dice, y reparte hacia los cuatro proyectos con la misma forma que un flujo real.
- **Decisión:** sin build, con GSAP y ScrollTrigger copiados al repositorio. **En vez de:** Vite con npm, o GSAP desde un CDN. **Porque:** con un build habría que cambiar el origen de GitHub Pages a «GitHub Actions», un paso manual en el repositorio que sostiene el dominio entero, y nada del diseño lo necesita. Alojar GSAP evita depender de un tercero en la raíz del dominio.
- **Decisión:** `position: sticky` en lugar del `pin` de ScrollTrigger. **En vez de:** dejar que ScrollTrigger fije la escena. **Porque:** el `pin` envuelve el elemento en otro `div` al arrancar. Moverlo en el DOM retrasaba el LCP hasta después del JavaScript, y Lighthouse en móvil daba 83–87 en rendimiento. Con `sticky` y las curvas calculadas sin medir el DOM, da 97–100.
- **Decisión:** vistas previas como capturas en WebP, tomadas con un script. **En vez de:** cargar los cuatro sitios en iframes. **Porque:** los iframes cargan cuatro sitios completos dentro de la portada. Las capturas pesan de 8 a 48 KB y se regeneran con un solo comando.
- **Decisión:** las cifras se escriben en el HTML y un script las compara con su fuente. **En vez de:** pedirlas en vivo a GitHub al cargar. **Porque:** sin JavaScript también se tienen que leer, y la portada no debe depender de una API externa. El costo: cuando un proyecto publica una versión, hay que corregirla a mano. El script lo señala.
- **Decisión:** el texto sobre el rosa de n8n es oscuro. **En vez de:** blanco, como en el prototipo. **Porque:** el blanco daba 3,66:1 y el oscuro da 5,32:1, con el mismo rosa.

## Lecciones

- **Un prototipo también puede afirmar de más.** Decía que cada flujo de Nexus estaba probado en una instancia real, y son 9 de 13. Las cifras salen de los repositorios, no de la memoria.
- **Mover el DOM al arrancar cuesta el LCP.** El elemento más grande ya estaba pintado, pero envolverlo para fijarlo obligó a pintarlo de nuevo después del JavaScript.
- **Una prueba que pasa no dice cómo se ve.** Las capturas en celular mostraron que la regla que ocultaba los botones de la portada también se llevaba los botones de contacto del último panel.
- **Un README también puede prometer lo que no cumple.** Enlazaba un `LICENSE` que no existía, decía que bastaba abrir `index.html` (con rutas absolutas no carga el CSS) y que su 404 atendía todo el dominio, cuando cada proyecto sirve el suyo. Se corrigió en [`e888ea5`](https://github.com/Sergio-Velandia/Sergio-Velandia.github.io/commit/e888ea5).
- **Lo que comparte el dominio se amplía, no se reescribe.** El `robots.txt` declara los sitemaps de todos los sitios: cada proyecto nuevo suma su línea sin borrar las demás.

## Roadmap

Sin fechas. El repositorio no tiene ROADMAP propio; esto es lo que falta hoy:

- Probar la escena en un teléfono real, no solo emulado.
- Que las cifras se actualicen sin intervención cuando un proyecto publique una versión.
- La `v1.0.0`, cuando el diseño esté cerrado.
