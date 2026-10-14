---
title: Una SPA en GitHub Pages sin 404
description: Publicar una app de React Router en una subruta de GitHub Pages con rutas que se recargan, responden 200 y no pierden recursos.
type: manual
tags: [github pages, despliegue, spa, react router, vite, rutas]
technologies: [Vite, React, GitHub Actions]
createdAt: 2026-10-13
related: [project/moss-nexus, project/moss, manual/javascript/verificar-la-interfaz-con-capturas]
references: [GitHub Pages: página 404 personalizada | https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site, Vite: desplegar un sitio estático | https://vite.dev/guide/static-deploy, Vite: opción base | https://vite.dev/config/shared-options, React Router: BrowserRouter | https://reactrouter.com/api/declarative-routers/BrowserRouter]
---

## Problema que resuelve

GitHub Pages sirve archivos, no rutas. Si tu app vive en `https://usuario.github.io/Moss/` y alguien abre `/Moss/manual/sql/agrupar` directamente, Pages busca esa carpeta, no la encuentra y responde con su página 404. React Router nunca llega a ejecutarse.

A eso se suman tres trampas que no se ven en desarrollo: la **subruta** del repositorio, los **recursos de `public/`** y la diferencia entre `vite preview` y producción. Esta guía junta lo que aprendí resolviéndolas en Moss y en Moss Nexus.

```flow
# Qué hace GitHub Pages con cada petición
Petición :: /Moss/proyectos/moss
? ¿Existe el archivo? :: busca proyectos/moss/index.html
+ 200 :: sirve esa copia de la app | 404 :: sirve 404.html, que es la misma app
React Router :: lee la URL y pinta la página
```

## 1. La subruta: base y basename

El sitio no vive en la raíz, sino en `/<repositorio>/`. Vite y React Router deben saberlo:

```ts
// vite.config.ts
export default defineConfig(({ command, isPreview }) => ({
  // En desarrollo, la raíz; en el build y en vite preview, la subruta
  base: command === 'build' || isPreview ? '/Moss/' : '/',
}))
```

```tsx
// App.tsx: las rutas y los <Link> incluyen la subruta solos
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

El detalle de `isPreview` costó un error: `vite preview` cuenta como comando `serve`, así que sin esa condición servía el build con `base: '/'` y todos los assets daban 404 en `/Moss/`. Lo que debía reproducir producción no lo hacía.

## 2. Las rutas: 404.html como red de seguridad

El paso mínimo es copiar `index.html` como `404.html` en el workflow. Cuando Pages no encuentra una ruta, sirve ese archivo, que es la misma app, y React Router resuelve la URL:

```yaml
# .github/workflows/deploy.yml
- name: Fallback para rutas de la SPA
  run: cp dist/index.html dist/404.html
```

Funciona, pero con una letra pequeña: **la página se ve bien y responde con código 404**. Para un buscador o para una vista previa al compartir, esa página "no existe".

## 3. Las rutas que se comparten: copias que responden 200

Para las rutas pensadas para compartirse, un plugin de Vite copia `index.html` en `<ruta>/index.html` al terminar el build. Pages encuentra el archivo y responde 200:

```ts
export const STATIC_ROUTES = ['nexus', 'proyectos']

function staticRoutes(): Plugin {
  let outDir = 'dist'
  return {
    name: 'moss-static-routes',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      for (const route of STATIC_ROUTES) {
        mkdirSync(resolve(outDir, route), { recursive: true })
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, route, 'index.html'))
      }
    },
  }
}
```

En Moss la lista se completa sola con una ruta por cada `content/projects/<slug>.md`. Moss Nexus va más allá y escribe en cada copia su propio título, descripción y URL canónica, más un `sitemap.xml`.

Dos comportamientos de Pages que conviene conocer:

- `/Moss/nexus` responde **301** hacia `/Moss/nexus/` (con barra final) y después 200. React Router acepta las dos formas.
- La redirección **conserva la query**: `/Moss/nexus?lang=en` llega como `/Moss/nexus/?lang=en`.

## 4. Los recursos de public/

Todo lo que se referencia desde `index.html` debe llevar `%BASE_URL%`, que Vite reemplaza por la subruta:

```html
<link rel="icon" type="image/svg+xml" href="%BASE_URL%images/favicon.svg" />
```

Y la ruta tiene que coincidir con dónde está el archivo de verdad. En Moss, el favicon se movió a `public/images/` mientras `index.html` seguía pidiendo `favicon.svg`: respondió 404 en producción durante varias versiones, porque nada lo comprobaba.

```mindmap
Antes de publicar
- Subruta :: base y basename
  - isPreview en vite preview
- Rutas :: recargar sin error
  - 404.html
  - copias que responden 200
- Recursos :: lo que pide index.html
  - %BASE_URL%
  - que el archivo exista
- Verificación :: como en producción
  - npm run build y preview
  - abrir rutas directas
```

## Errores frecuentes

- **Probar solo navegando desde el inicio.** Los enlaces internos siempre funcionan; lo que falla es abrir o recargar una ruta directamente.
- **Confiar en `vite preview` sin `isPreview`.** Sin esa condición, preview no sirve el sitio bajo la subruta.
- **Rutas de `public/` sin `%BASE_URL%`.** En producción apuntan a la raíz del dominio, fuera del repositorio.
- **Dar por buena la página "que se ve".** Una ruta servida por `404.html` se ve perfecta y responde 404. Comprueba el código de estado, no solo la pantalla.
