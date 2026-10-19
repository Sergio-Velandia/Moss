---
title: Migrar a un dominio nuevo sin romper nada
description: Inventario de URLs, qué cambiar y qué no, canonical y og:url, una prueba de guarda para no volver atrás y los servicios externos que tienen una lista de dominios permitidos.
type: manual
tags: [migración, dominio propio, redirección 301, canonical, pruebas de guarda, emailjs]
technologies: [GitHub Pages, Vite, Vitest]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/dominio-propio-github-pages-cloudflare, manual/despliegue/correo-con-tu-dominio]
references: [Google: mover un sitio con cambios de URL | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes, Google: URL canónicas | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls, GitHub: dominios propios en GitHub Pages | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages]
---

## Problema que resuelve

Configuraste el dominio nuevo y el sitio abre. Pero el código, el README, las páginas legales y los otros proyectos siguen apuntando a la dirección vieja. Funciona gracias a la redirección, hasta el día en que algo la salta: un servicio externo que solo acepta el dominio viejo, un buscador que indexa las dos direcciones o un enlace copiado de un archivo que nadie revisó.

Es el **paso 8** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio). Va después de [configurar el dominio](/manual/despliegue/dominio-propio-github-pages-cloudflare) y [el correo](/manual/despliegue/correo-con-tu-dominio).

## La idea en una imagen

Mudarse de casa. El servicio postal reenvía tus cartas de la dirección vieja a la nueva durante un tiempo: es la **redirección 301**. Pero si no cambias la dirección en el banco, en tu trabajo y en tus tarjetas, dependes del reenvío para siempre, y algunos remitentes (los que tienen una lista cerrada de direcciones) ni siquiera lo usan.

## El orden de la migración

```flow
# Migrar sin romper
Inventario :: buscar todas las apariciones de la dirección vieja
Clasificar :: qué es del sitio y qué es un ejemplo o un repo
Cambiar :: URLs, correo, metadatos y README
Guardar :: una prueba que falla si vuelve la dirección vieja
+ Servicios externos :: añadir el dominio nuevo donde haya lista de permitidos
```

En palabras: primero buscas todas las apariciones de la dirección vieja en el código, el contenido y la documentación. Luego decides cuáles son URLs del sitio y cuáles son ejemplos o enlaces que no deben cambiar. Cambias las que tocan, añades una prueba automática que falla si la dirección vieja vuelve a aparecer y, por último, revisas los servicios externos que solo aceptan dominios permitidos.

## 1. Inventario

Busca la dirección vieja **y** el correo viejo en todo el repositorio, no solo en el código:

```bash
git grep -n "usuario.github.io"
git grep -n "tu-correo-personal"
```

Revisa también lo que no es código: `README.md`, `package.json` (campo `homepage`), `index.html` (canonical y Open Graph), `sitemap.xml`, las páginas legales y el contenido en Markdown.

## 2. Qué NO cambiar

No todo lo que contiene `github.io` es tu sitio:

- **Ejemplos genéricos.** Una guía que explica cómo funciona GitHub Pages con `https://usuario.github.io/proyecto/` tiene que seguir diciendo eso: es la explicación, no tu dirección.
- **Enlaces a `github.com`.** Los repositorios siguen donde estaban. Solo cambian las URLs de `github.io`.
- **El `base` de Vite.** Si el proyecto conserva su ruta (`/Moss/` antes y después), `base: '/Moss/'` sigue siendo correcto. Cambiarlo rompería los recursos del sitio.
- **El dominio en cada repositorio de proyecto.** El dominio se pone **solo** en el sitio de usuario (`usuario.github.io`). Si además le pones un *Custom domain* a un repositorio de proyecto, ese proyecto deja de heredar el dominio con su ruta.
- **El archivo `CNAME` del repositorio raíz.** Si ese repositorio publica desde una rama, GitHub crea el archivo al guardar el dominio. Si lo borras, el dominio deja de estar configurado.

## 3. Cambiar lo que sí

- **URLs del sitio y de los proyectos hermanos**, idealmente en **una sola constante** que el resto del código importa. Así el siguiente cambio es de una línea.
- **El correo de contacto**, y con él **la fecha de actualización de las páginas legales**: cambió un dato que esas páginas publican.
- **`canonical` y `og:url`** en `index.html`, y las URLs del `sitemap.xml`. Le dicen a buscadores y redes cuál es la dirección buena. Ver [Que se vea bien al compartirlo](/manual/despliegue/que-se-vea-bien-al-compartirlo).
- **El README**, en un commit propio.

## 4. Una prueba de guarda

Una prueba de guarda no comprueba que algo funcione: comprueba que **no vuelva** un error ya corregido. Con Vitest y `import.meta.glob` puedes leer el código y el contenido como texto:

```ts
const files = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '/content/**/*.md', '!/src/**/*.test.ts'], {
  eager: true,
  query: '?raw',
  import: 'default',
})

it('no quedan URLs antiguas de github.io', () => {
  const old = Object.entries(files)
    .filter(([, text]) => text.includes('usuario.github.io'))
    .map(([path]) => path)
  expect(old).toEqual([])
})
```

Si mañana alguien copia un enlace viejo, las pruebas fallan antes de publicar. En tu prueba real, pon tu propio usuario y deja fuera los ejemplos genéricos.

## 5. Servicios con lista de dominios permitidos

Algunos servicios solo funcionan desde los dominios que les autorizaste. Al cambiar de dominio, revísalos **antes** de publicar:

- **Formularios con EmailJS:** si el dominio nuevo no está entre los permitidos, el formulario deja de enviar.
- **Firebase Authentication** (si algún día lo usas): tiene su propia lista de dominios autorizados para iniciar sesión.

## Así lo hice yo

- **Inventario en Moss:** 19 URLs de `github.io` en 10 archivos y el correo personal en 2. Se cambiaron todas menos dos ejemplos genéricos de guías sobre GitHub Pages. Los commits: [`a91215d`](https://github.com/Sergio-Velandia/Moss/commit/a91215d) (URLs y la prueba de guarda [`domain.test.ts`](https://github.com/Sergio-Velandia/Moss/blob/main/src/lib/domain.test.ts)), [`d55db56`](https://github.com/Sergio-Velandia/Moss/commit/d55db56) (correo y fecha de las páginas legales) y [`f402024`](https://github.com/Sergio-Velandia/Moss/commit/f402024) (README).
- **Moss Nexus:** [`76b6e38`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/76b6e38) (URLs en `index.html`, la configuración del sitio, el generador de páginas estáticas y las plantillas), [`5a88310`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/5a88310) (correo) y [`b301851`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/b301851) (README y licencia de contenido, que también citaba la dirección).
- **El portafolio:** [`2ec2485`](https://github.com/Sergio-Velandia/mi-portafolio/commit/2ec2485) cambia `canonical` y `og:url` en `index.html` y crea [`sites.js`](https://github.com/Sergio-Velandia/mi-portafolio/blob/main/src/config/sites.js), la constante única con las tres URLs; [`0869986`](https://github.com/Sergio-Velandia/mi-portafolio/commit/0869986) añade el `sitemap.xml` con el dominio nuevo.
- **El `base` no cambió** en ninguno de los tres: Moss sigue en `/Moss/`, Nexus en `/Moss-Nexus/` y el portafolio en `/mi-portafolio/`. El README del portafolio lo explica junto a por qué ese repositorio no lleva archivo `CNAME`.
- **La redirección funciona:** la dirección antigua de Moss en `github.io` responde con un 301 hacia `sergio-velandia.dev/Moss/`.

## Errores que cometí (o que casi cometo), y un riesgo que revisé

- **Los enlaces viejos redirigen con 301, pero no conviene depender de eso.** Por eso se migraron todos y se añadió la prueba de guarda.
- **Cambiar un dato de contacto obliga a actualizar la fecha de las páginas legales.** Se hizo en el mismo commit que el correo.
- **El `base` de Vite no cambia** si el proyecto conserva su ruta. Es fácil «arreglarlo» de más.
- **El dominio va solo en el sitio de usuario,** y no se borra el archivo `CNAME` que GitHub crea en ese repositorio.
- **Riesgo que revisé antes de publicar:** el formulario de contacto del portafolio usa EmailJS. Antes de publicar el dominio nuevo, revisé en el panel de EmailJS que estuviera entre los dominios permitidos, y el formulario funcionó a la primera.

## Lista de comprobación

- [ ] Busqué la dirección y el correo viejos en código, contenido, README, `package.json`, `index.html`, sitemap y páginas legales.
- [ ] Separé las URLs del sitio de los ejemplos genéricos y de los enlaces a `github.com`.
- [ ] Las URLs viven en una sola constante.
- [ ] El correo nuevo está en todos lados y la fecha de las páginas legales se actualizó.
- [ ] `canonical`, `og:url` y el sitemap usan el dominio nuevo.
- [ ] El `base` de Vite no cambió (si la ruta del proyecto no cambió).
- [ ] Solo el sitio de usuario tiene *Custom domain* y su archivo `CNAME` sigue ahí.
- [ ] Hay una prueba de guarda contra la dirección vieja.
- [ ] Revisé EmailJS (y cualquier otro servicio con lista de dominios permitidos).
- [ ] La dirección vieja responde con un 301 hacia la nueva.
