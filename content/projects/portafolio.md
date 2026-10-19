---
title: Portafolio
description: Mi portafolio profesional en una sola página, en español e inglés, con animaciones con propósito y un formulario sin backend.
type: project
status: mantenimiento
theme: portafolio
version: 1.0.1
reviewedAt: 2026-10-18
repo: https://github.com/Sergio-Velandia/mi-portafolio
site: https://sergio-velandia.dev/mi-portafolio/
tags: [arquitectura, portafolio, i18n, animación, decisiones, sitio estático]
technologies: [React, JavaScript, Vite, EmailJS]
createdAt: 2026-10-12
related: [route/publicar-y-mantener-un-sitio, journal/accesibilidad-que-no-se-ve, lab/fade-in-list, manual/n8n/webhook-basico]
---

## Ficha

Una sola página que presenta mi perfil, mis proyectos y mi experiencia, pensada para que alguien que contrata la recorra en pocos minutos, en español o en inglés.

**Problema que resuelve:** un CV en PDF no muestra cómo trabajo. El portafolio enseña los proyectos con capturas, explica una automatización real con n8n de forma visual y deja escribirme sin salir de la página. Su recorrido y contenido están en el [README](https://github.com/Sergio-Velandia/mi-portafolio#readme). La versión documentada es la de su `package.json`, que coincide con su CHANGELOG y su tag `v1.0.1`.

## Arquitectura

```mindmap
Portafolio
- Secciones :: un componente por sección
  - textos { es, en } en cada una
  - App.jsx decide el orden
- Idioma :: Context propio
  - i18n.js
  - LanguageProvider.jsx
- Movimiento :: un solo vocabulario
  - animation.js
  - curvas y duraciones en App.css
  - prefers-reduced-motion
- Entrega :: sin servidor
  - EmailJS desde el navegador
  - GitHub Actions
  - rama gh-pages
```

Es una aplicación de una sola página sin router: `App.jsx` monta las secciones en el orden en que conviene leerlas. El movimiento no está repartido por los componentes: `animation.js` reúne todas las animaciones (aparición al entrar en pantalla, escalonado, barra de progreso, contadores) y `App.css` define una sola familia de curvas y duraciones que todas comparten. Hay una única secuencia orquestada, la entrada del encabezado.

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
? Validación propia :: foco en el primer error
+ EmailJS :: envía desde el navegador | ! Error junto al campo :: aria-invalid y aria-describedby
```

El idioma vive en un solo lugar y baja por contexto: cambiarlo actualiza a la vez los textos, el atributo `lang` del documento, el título, la descripción y la URL, que queda compartible con `?lang=en`. El formulario no tiene servidor: valida en el navegador, muestra cada error junto a su campo y, si todo está bien, EmailJS envía el mensaje. El resultado se anuncia en una región `aria-live`.

## Decisiones

- **Decisión:** el idioma es un Context propio con los textos de cada componente en un objeto `{ es, en }`. **En vez de:** una librería de traducción. **Porque:** con dos idiomas y textos cortos no hace falta, y cada componente tiene sus textos al lado de su marcado. El proveedor vive en su propio archivo porque el linter aplica la regla de recargado en caliente de Vite (`react-refresh`): `i18n.js` exporta el contexto, el hook y los textos, y `LanguageProvider.jsx` solo el componente.
- **Decisión:** las animaciones son JavaScript propio con `IntersectionObserver` y comparten curvas y duraciones definidas en CSS. **En vez de:** una librería de animación. **Porque:** cada efecto es corto, no suma dependencias, y respetar `prefers-reduced-motion` queda en un solo archivo.
- **Decisión:** el formulario envía con EmailJS directamente desde el navegador. **En vez de:** un backend propio. **Porque:** el sitio es estático en GitHub Pages. Las credenciales de EmailJS son públicas por diseño, por eso están restringidas al dominio del sitio desde el panel de EmailJS.
- **Decisión:** el flujo de n8n se recrea en HTML y CSS y "se ejecuta" una vez al entrar en pantalla, mostrando cuántos items pasan entre nodos. **En vez de:** una captura estática del editor. **Porque:** cuenta la automatización mejor que una imagen, y su texto se traduce y lo leen los lectores de pantalla.
- **Decisión:** cada push a `main` construye el sitio con GitHub Actions y lo publica en la rama `gh-pages`. **En vez de:** publicar a mano desde el equipo. **Porque:** lo publicado siempre corresponde a lo que está en el repositorio.

## Lecciones

- **Que el código exista no significa que funcione.** La entrada del encabezado y la barra de progreso estaban programadas, pero nunca se activaban porque faltaba su marcado.
- **Las capturas reales encuentran lo que el código esconde:** el scroll horizontal en móvil, miniaturas gigantes por un atributo `height` y una nota de configuración visible para los visitantes.
- **Lo que haría distinto:** añadir pruebas automáticas y un CHANGELOG desde el inicio; hoy no tiene ninguno de los dos.

## Roadmap

Pendientes visibles hoy en el código, sin fechas:

- La sección de experiencia existe, pero está comentada en `App.jsx`.
- El script de publicación manual (`npm run deploy`) sigue en `package.json`, aunque el despliegue ya es automático.
- El proyecto no tiene pruebas automáticas.
- Falta su fase legal: página de privacidad para el formulario de contacto y archivo `LICENSE` (ver [La fase legal en un proyecto personal](/manual/despliegue/fase-legal-en-un-proyecto-personal)).
