---
title: Verificar la interfaz con capturas reales
description: Usar Playwright con el Edge o Chrome instalado para revisar una web en varios anchos y temas, detectar desbordes y comparar píxeles antes de publicar.
type: manual
tags: [testing, playwright, capturas, regresiones visuales, accesibilidad, responsive]
technologies: [JavaScript, Node.js]
createdAt: 2026-10-13
related: [manual/despliegue/spa-en-github-pages-sin-404, journal/lo-que-encontraron-las-capturas, lab/reto-grid-min-w-0]
references: [Playwright: navegadores instalados | https://playwright.dev/docs/browsers, Playwright: capturas | https://playwright.dev/docs/screenshots, Playwright: emulación de tema y movimiento | https://playwright.dev/docs/emulation, Playwright: clase Page | https://playwright.dev/docs/api/class-page]
---

## Problema que resuelve

Las pruebas unitarias dicen que la función devuelve lo correcto; no dicen que la cabecera cabe a 768 px, que el tooltip no tapa el total o que en móvil no aparece scroll horizontal. Esos fallos solo se ven en un navegador. Revisarlos a mano en tres anchos y dos temas, cada vez, no es realista.

Esta guía muestra cómo automatizar esa revisión con Playwright usando el navegador que ya tienes instalado, sin descargar nada más.

```flow
# Una pasada de verificación
npm run build :: el sitio tal como se publicará
vite preview :: servido bajo su subruta
Playwright :: anchos, temas e idioma
Capturas y medidas :: desbordes, errores de consola y 404
+ Corregir antes de publicar :: con la evidencia en la mano
```

## Instalar sin descargar navegadores

`playwright-core` es la librería sin navegadores incluidos. Con `channel` usa el Edge o el Chrome del sistema. Instálalo en una carpeta aparte, no en el proyecto: es una herramienta de revisión, no una dependencia del sitio.

```bash
mkdir ~/revision && cd ~/revision && npm init -y && npm i playwright-core
```

```js
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' }) // o 'chrome'
const page = await browser.newPage({
  viewport: { width: 375, height: 800 },
  colorScheme: 'dark', // emula el tema oscuro del sistema
  reducedMotion: 'reduce', // capturas estables, sin animaciones a medias
})
```

En Windows, ejecutar `msedge --headless --screenshot` desde la terminal puede devolver páginas en blanco; con Playwright no pasa.

## Qué medir en cada página

```js
const errores = []
page.on('pageerror', (e) => errores.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
page.on('response', (r) => r.status() >= 400 && errores.push(`${r.status()} ${r.url()}`))

await page.goto('http://localhost:4173/Moss/proyectos', { waitUntil: 'networkidle' })

const desborda = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
await page.screenshot({ path: 'proyectos-375-oscuro.png', fullPage: true })
```

Si algo desborda, este fragmento dice **qué** elemento es:

```js
const culpables = await page.evaluate(() =>
  [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
    .slice(0, 5)
    .map((el) => `${el.tagName}.${el.className}`),
)
```

Así apareció el `min-w-0` que le faltaba a la cuadrícula del Laboratorio: el culpable era el envoltorio de cada tarjeta, ensanchado por una línea de código larga. El [reto de la cuadrícula](/laboratorio/reto-grid-min-w-0) lo reproduce.

## Comprobar que "no cambió nada"

Cuando un cambio no debería tocar el resto del sitio, compara capturas de antes y después. Si son idénticas byte a byte, no hay nada que revisar. Si no, mide **dónde** cambian con un canvas en el propio navegador:

```js
const diff = await page.evaluate(async ([a, b]) => {
  const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src })
  const pixels = (img) => {
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height })
    c.getContext('2d').drawImage(img, 0, 0)
    return c.getContext('2d').getImageData(0, 0, img.width, img.height).data
  }
  const [A, B] = (await Promise.all([load(a), load(b)])).map(pixels)
  let n = 0
  for (let i = 0; i < A.length; i += 4) if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2]) n++
  return n
}, [antesDataUrl, despuesDataUrl])
```

Al añadir el acceso a Nexus en la cabecera, 21 de 28 capturas salieron idénticas; las otras 7 solo cambiaban en una franja: la cabecera fija, superpuesta al contenido, donde aparecía el botón nuevo. El resto de las páginas no había cambiado.

![Dos capturas de la cabecera de Moss, antes y después: la segunda tiene el botón Nexus junto al selector de idioma](/imagenes/diferencia-de-pixeles-en-la-cabecera-992x160.webp "La única diferencia entre las capturas: el botón nuevo de la cabecera")

## Imitar al servidor de producción

`vite preview` responde 200 a cualquier ruta; GitHub Pages no. Para probar lo que hará Pages, un servidor de veinte líneas con sus reglas: carpeta con `index.html` → 200, ruta sin barra final → 301, lo demás → `404.html` con código 404. Con él se comprobó que cada página de proyecto respondía 200 antes de publicar.

Y después de publicar, en lugar de esperar "un rato", espera a un archivo que **solo existe en el build nuevo** (un asset con hash):

```bash
curl -sf -o /dev/null --retry 30 --retry-delay 15 --retry-all-errors \
  https://usuario.github.io/Moss/assets/projectFonts-ChGkSZap.css
```

```mindmap
Qué revisar en cada pasada
- Anchos :: 375, 768 y 1280
  - sin scroll horizontal
- Temas :: claro y oscuro
  - contraste
- Teclado :: Tab y Enter
  - foco visible
- Red :: consola y estados
  - ningún 404
  - ningún error de JS
```

## Errores frecuentes

- **Un servidor de preview viejo.** Si reconstruyes con el servidor abierto, puede seguir sirviendo el `index.html` anterior. Reinícialo después de cada build.
- **Dejar el servidor abierto en Windows.** Mantiene archivos de `node_modules` bloqueados y `npm ci` falla a medias con `EPERM`. Ciérralo antes de reinstalar.
- **Medir durante una animación.** Un valor leído justo después de un clic puede ser el de la mitad de la transición. Usa `reducedMotion: 'reduce'` o espera un poco.
- **Fiarse de "se ve bien".** Una página servida por `404.html` se ve perfecta y responde 404: comprueba también el código de estado.
