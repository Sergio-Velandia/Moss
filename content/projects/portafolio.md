---
title: Portafolio
description: Mi portafolio profesional en una sola página, en español e inglés, con animaciones con propósito y un formulario sin backend.
type: project
status: mantenimiento
theme: portafolio
version: 1.2.3
reviewedAt: 2026-11-18
repo: https://github.com/Sergio-Velandia/mi-portafolio
site: https://sergio-velandia.dev/mi-portafolio/
tags: [arquitectura, portafolio, i18n, animación, decisiones, sitio estático]
technologies: [React, JavaScript, Vite, EmailJS]
createdAt: 2026-10-12
related: [route/publicar-y-mantener-un-sitio, journal/accesibilidad-que-no-se-ve, lab/fade-in-list, manual/despliegue/fase-legal-en-un-proyecto-personal]
---

## Ficha

Una sola página que presenta mi perfil, mis proyectos y mi experiencia, pensada para que alguien que contrata la recorra en pocos minutos, en español o en inglés.

**Problema que resuelve:** un CV en PDF no muestra cómo trabajo. El portafolio enseña los proyectos con capturas, explica una automatización real con n8n de forma visual y deja escribirme sin salir de la página. Su recorrido y contenido están en el [README](https://github.com/Sergio-Velandia/mi-portafolio#readme).

**Estado real (v1.2.3, en mantenimiento):** presenta la experiencia en un videojuego multijugador de Roblox, Moss Nexus, Moss, Moss Taste y una automatización con n8n. Tiene páginas de privacidad y términos en los dos idiomas, licencia MIT para el código, pruebas con Vitest que corren en CI antes de publicar, una pantalla de entrada de 1,8 s y una página 404 propia que reparte hacia el resto del dominio. Solo recibe correcciones y la actualización de los proyectos que muestra.

## Arquitectura

```mindmap
Portafolio
- Secciones :: un componente por sección
  - textos { es, en } en cada una
  - App.jsx decide el orden
  - src/data con los proyectos Moss
- Idioma :: Context propio
  - i18n.js
  - LanguageProvider.jsx
- Movimiento :: un solo vocabulario
  - animation.js
  - pantalla de entrada sin React
  - prefers-reduced-motion
- Entrega :: sin servidor
  - páginas legales como HTML
  - EmailJS desde el navegador
  - Actions a la rama gh-pages
```

Es una aplicación de una sola página sin router: `App.jsx` monta las secciones en el orden en que conviene leerlas. El movimiento no está repartido por los componentes: `animation.js` reúne las animaciones (aparición al entrar en pantalla, escalonado, barra de progreso, contadores) y `App.css` define una sola familia de curvas y duraciones que todas comparten. La pantalla de entrada es la excepción: la crea un script en línea de `index.html`, antes de React, con sus estilos en `entrada.css`.

Las URLs de los otros proyectos viven en una sola constante (`src/config/sites.js`), y los textos y capturas de cada proyecto Moss, en `src/data/`. Privacidad y términos no son rutas de la app: son páginas HTML que Vite construye como entradas propias.

## Flujo de datos

```flow
# El idioma, de la URL a cada texto
?lang= o localStorage :: el español es el valor por defecto
LanguageProvider :: guarda el idioma y actualiza lang, título y URL
Contexto :: useLang() en cada componente
+ Textos :: cada sección elige TEXT[lang]
```

```flow
# Un mensaje, del formulario al correo
Formulario :: nombre, correo y mensaje
? Validación propia :: campo trampa, tope de envíos y foco en el primer error
+ EmailJS :: envía desde el navegador | ! Aviso junto al campo :: aria-invalid y aria-describedby
```

El idioma vive en un solo lugar y baja por contexto: cambiarlo actualiza a la vez los textos, el atributo `lang` del documento, el título, la descripción y la URL, que queda compartible con `?lang=en`. El formulario no tiene servidor: descarta en silencio lo que llena el campo trampa, no deja pasar un cuarto envío en la misma hora desde ese navegador, muestra cada error junto a su campo y, si todo está bien, EmailJS envía el mensaje. El resultado se anuncia en una región `aria-live`.

## Decisiones

- **Decisión:** el idioma es un Context propio con los textos de cada componente en un objeto `{ es, en }`. **En vez de:** una librería de traducción. **Porque:** con dos idiomas y textos cortos no hace falta, y cada componente tiene sus textos al lado de su marcado. El proveedor vive en su propio archivo porque el linter aplica la regla de recargado en caliente de Vite (`react-refresh`): `i18n.js` exporta el contexto, el hook y los textos, y `LanguageProvider.jsx` solo el componente.
- **Decisión:** las animaciones son JavaScript propio con `IntersectionObserver` y comparten curvas y duraciones definidas en CSS. **En vez de:** una librería de animación. **Porque:** cada efecto es corto, no suma dependencias, y respetar `prefers-reduced-motion` queda en un solo archivo.
- **Decisión:** el formulario envía con EmailJS directamente desde el navegador, con un tope de 3 envíos por hora que guarda solo la hora de cada envío. **En vez de:** un backend propio. **Porque:** el sitio es estático en GitHub Pages. Las credenciales de EmailJS son públicas por diseño y se restringen al dominio desde su panel; sin servidor, el abuso solo se puede frenar desde la interfaz, y para eso no hace falta guardar el mensaje.
- **Decisión:** privacidad y términos son páginas HTML reales, entradas propias del build de Vite. **En vez de:** secciones dentro de la app. **Porque:** responden 200 en GitHub Pages, los buscadores las indexan y se leen sin JavaScript.
- **Decisión:** fuentes autoalojadas con `@fontsource`, solo con los pesos que se usan. **En vez de:** Google Fonts. **Porque:** el sitio deja de contactar a un tercero en cada visita, y la privacidad lo puede decir sin matices.
- **Decisión:** el flujo de n8n se recrea en HTML y CSS y "se ejecuta" una vez al entrar en pantalla, mostrando cuántos items pasan entre nodos. **En vez de:** una captura estática del editor. **Porque:** cuenta la automatización mejor que una imagen, y su texto se traduce y lo leen los lectores de pantalla.
- **Decisión:** cada push a `main` pasa lint y pruebas, construye el sitio con GitHub Actions y lo publica en la rama `gh-pages`. **En vez de:** publicar a mano desde el equipo. **Porque:** lo publicado siempre corresponde a lo que está en el repositorio, y no se publica nada que no pase las pruebas.

## Lecciones

- **Que el código exista no significa que funcione.** La entrada del encabezado y la barra de progreso estaban programadas, pero nunca se activaban porque faltaba su marcado.
- **Las capturas reales encuentran lo que el código esconde:** el scroll horizontal en móvil, miniaturas gigantes por un atributo `height` y una nota de configuración visible para los visitantes.
- **Una prueba que fija una cifra no la vuelve cierta.** Las pruebas de los proyectos fijan las versiones que tenían al escribirse, así que siguen pasando aunque Moss, Nexus y Taste ya vayan en otras.
- **Lo que haría distinto:** empezar con pruebas y CHANGELOG. Llegaron en la v1.1.0, cuando el sitio ya estaba publicado.

## Roadmap

Sin fechas, según el [ROADMAP](https://github.com/Sergio-Velandia/mi-portafolio/blob/main/ROADMAP.md) del repositorio:

- Actualizar las versiones y cifras de los proyectos que muestra, y que sus pruebas dejen de fijar las antiguas.
- Decidir qué hacer con los botones que enlazan a tres repositorios que ya no son públicos.
- Corregir el hero en pantallas bajas y dejar un solo botón «volver arriba».
- Una versión en inglés indexable, con su propia página y `hreflang`.
- El script de publicación manual (`npm run deploy`) sigue en `package.json`, aunque el despliegue ya es automático.
