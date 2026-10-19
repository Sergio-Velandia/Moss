---
title: Que se vea bien al compartirlo: Open Graph, canonical, sitemap y robots
description: Las etiquetas que deciden cómo se ve tu enlace en redes y chats, la URL canónica, el sitemap y el robots.txt, con el caso especial de una SPA en una subruta de GitHub Pages y el estado real de mis tres proyectos.
type: manual
tags: [seo, open graph, twitter card, canonical, sitemap, robots, social preview]
technologies: [GitHub Pages, Vite, HTML]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/migrar-a-un-dominio-nuevo, manual/despliegue/spa-en-github-pages-sin-404]
references: [Protocolo Open Graph | https://ogp.me/, Google: URL canónicas | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls, Google: introducción a los sitemaps | https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview, Protocolo de sitemaps | https://www.sitemaps.org/protocol.html, Google: introducción a robots.txt | https://developers.google.com/search/docs/crawling-indexing/robots/intro, GitHub: vista previa social del repositorio | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview]
---

## Problema que resuelve

Compartes tu proyecto en un chat o en una red social y aparece un enlace gris, sin imagen y con un título genérico. O un buscador muestra la dirección vieja de tu sitio en lugar de la nueva. Ninguna de las dos cosas se arregla dentro de la página: depende de unas etiquetas en el `<head>` y de dos archivos que los robots leen.

Es el **paso 10** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio).

## La idea en una imagen

Las etiquetas Open Graph son **la etiqueta de un frasco en una despensa**. Nadie abre el frasco para saber qué tiene: lee la etiqueta (título, descripción, foto). Un chat o una red social hace lo mismo con tu enlace: no ejecuta tu sitio, solo lee las etiquetas del HTML. El **sitemap** es el inventario de la despensa y el **robots.txt**, el cartel de la puerta que dice qué estantes se pueden revisar y dónde está el inventario.

## Qué lee cada robot

```flow
# Del enlace compartido a la vista previa
Pegas el enlace :: en un chat o una red social
El robot descarga el HTML :: sin ejecutar JavaScript
Lee el head :: og:title, og:description, og:image y og:url
? ¿Hay og:image y responde 200?
+ Tarjeta con imagen :: título, texto y foto | ! Tarjeta gris :: solo el título o la URL
```

En palabras: cuando pegas un enlace, el servicio descarga el HTML de esa dirección **sin ejecutar JavaScript** y lee las etiquetas del `<head>`. Si encuentra `og:image` y la imagen responde, muestra una tarjeta con título, texto y foto. Si falta la imagen o da error, la tarjeta sale gris.

## Las etiquetas mínimas

```html
<link rel="canonical" href="https://tu-dominio.dev/proyecto/" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tu-dominio.dev/proyecto/" />
<meta property="og:title" content="Proyecto · qué es en pocas palabras" />
<meta property="og:description" content="Una frase que haga querer abrirlo." />
<meta property="og:image" content="https://tu-dominio.dev/proyecto/og.png" />
<meta name="twitter:card" content="summary_large_image" />
```

- **`canonical`:** cuál es la dirección buena de esta página. Evita que un buscador trate la dirección vieja y la nueva como dos páginas distintas.
- **`og:title`, `og:type`, `og:image` y `og:url`:** las cuatro que el protocolo Open Graph considera básicas. `og:description` completa la tarjeta.
- **`og:image`:** una URL **absoluta**, de una imagen que exista. Moss Nexus usa 1200 × 630 píxeles.
- **`twitter:card`** con `summary_large_image` pide la tarjeta grande con imagen.

## El caso de una SPA

En una SPA, todas las rutas comparten el mismo `index.html`. Como los robots no ejecutan JavaScript, **todas las páginas se comparten con las etiquetas de la portada**, aunque cambies el título con React. La solución es generar en el build un `index.html` por ruta con su título, su descripción y su URL. Además, así cada ruta responde 200 en GitHub Pages en lugar de pasar por el `404.html`. Ver [Una SPA en GitHub Pages sin 404](/manual/despliegue/spa-en-github-pages-sin-404).

## Sitemap y robots.txt en una subruta

Aquí GitHub Pages con dominio propio tiene una trampa:

- **El sitemap solo puede listar las URLs de su carpeta.** Un sitemap en `tu-dominio.dev/proyecto/sitemap.xml` puede incluir `tu-dominio.dev/proyecto/...`, pero no las páginas de otro proyecto. Cada proyecto publica el suyo.
- **El `robots.txt` tiene que estar en la raíz del dominio** (`tu-dominio.dev/robots.txt`). Uno en `tu-dominio.dev/proyecto/robots.txt` no lo lee nadie. Con varios proyectos, ese archivo va en el **repositorio del sitio de usuario** (`usuario.github.io`), y puede señalar el sitemap de cada proyecto con una línea `Sitemap:` por proyecto.

## La vista previa del repositorio en GitHub

El enlace a un repositorio también se comparte. En el repositorio, ve a **Settings → General → Social preview** y sube una imagen PNG, JPG o GIF de menos de 1 MB. GitHub recomienda al menos 640 × 320 píxeles, y 1280 × 640 para que se vea mejor.

## Así lo hice yo (y lo que falta)

| | Moss | Moss Nexus | Portafolio |
| --- | --- | --- | --- |
| `canonical` y `og:url` | **No tiene** | Sí, uno por página | Sí |
| Imagen Open Graph | **No tiene** | Declarada, pero `og.png` responde 404 | Sí: `Preview.png` |
| Twitter Card | **No tiene** | Sí | Sí |
| Una página por ruta | Copias de `index.html` para que algunas rutas respondan 200, sin etiquetas propias | Sí, todas, cada una con sus etiquetas | Es una sola página |
| `sitemap.xml` | **No tiene** | Sí, se genera en el build | Sí, a mano |
| Social preview en GitHub | Sí | Sí | Sí |

- **Moss Nexus** genera en el build un `index.html` por ruta y el sitemap ([`ee85c1f`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/ee85c1f), con el script [`static-pages.ts`](https://github.com/Sergio-Velandia/Moss-Nexus/blob/main/scripts/static-pages.ts)). Por eso [una plantilla](https://sergio-velandia.dev/Moss-Nexus/plantillas/agenda-diaria-calendar/) se comparte con su propio título y su propia URL canónica. Su imagen `og.png`, en cambio, todavía no existe: las tarjetas salen sin foto. Está anotado como pendiente.
- **El portafolio** tiene `canonical`, Open Graph completo con imagen y un [`sitemap.xml`](https://sergio-velandia.dev/mi-portafolio/sitemap.xml) ([`0869986`](https://github.com/Sergio-Velandia/mi-portafolio/commit/0869986)).
- **Moss no tiene ninguna de estas etiquetas todavía.** Está anotado como fase futura en [su README](https://github.com/Sergio-Velandia/Moss#estado), junto con `robots.txt` y `sitemap.xml`.
- **Ningún proyecto tiene `robots.txt`:** `sergio-velandia.dev/robots.txt` responde 404. Tiene que ir en el repositorio raíz, no en cada proyecto.

## Lo que hay que vigilar

- **Una `og:image` declarada que no existe.** Es el caso de Nexus. Se detecta abriendo la URL de la imagen: si da 404, la tarjeta sale sin foto.
- **Etiquetas que se quedaron con el dominio viejo** después de una migración. Se detectan buscando la dirección vieja en `index.html`. Ver [Migrar a un dominio nuevo](/manual/despliegue/migrar-a-un-dominio-nuevo).
- **Un `robots.txt` dentro de la carpeta del proyecto.** No hace nada: va en la raíz del dominio.

## Lista de comprobación

- [ ] `index.html` tiene `canonical`, `og:type`, `og:url`, `og:title`, `og:description`, `og:image` y `twitter:card`, con URLs absolutas del dominio actual.
- [ ] La imagen de `og:image` existe, responde 200 y mide 1200 × 630 o similar.
- [ ] Si es una SPA, las rutas importantes tienen su propio `index.html` con su título y su URL.
- [ ] Cada proyecto publica su `sitemap.xml` con solo sus URLs.
- [ ] El `robots.txt` está en la raíz del dominio (repositorio del sitio de usuario) y señala los sitemaps.
- [ ] Cada repositorio tiene su imagen de *Social preview* en GitHub.
- [ ] Probé la tarjeta pegando el enlace en un chat real.
