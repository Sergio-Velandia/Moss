---
title: Proyecto final: publica tu propio sitio de principio a fin
description: Una lista de comprobación guiada que recorre los 11 pasos de la ruta sobre un proyecto tuyo, con un criterio claro de «terminado» en cada paso.
type: manual
tags: [proyecto final, checklist, despliegue, publicación, ruta]
technologies: [Git, GitHub Actions, GitHub Pages, Cloudflare]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/mantener-vivo-un-proyecto, project/moss]
references: [Conventional Commits 1.0.0 en español | https://www.conventionalcommits.org/es/v1.0.0/, Keep a Changelog en español | https://keepachangelog.com/es-ES/1.1.0/, GitHub: dominios propios en GitHub Pages | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages]
---

## Para qué sirve

Leer la ruta enseña; hacerla con un proyecto tuyo es lo que la fija. Este proyecto final recorre los 11 pasos de [Del repo a producción](/rutas/publicar-y-mantener-un-sitio) sobre **un sitio que ya tengas funcionando en tu computador**: un portafolio, una landing o cualquier app hecha con Vite y React (o con HTML).

Cada paso tiene un criterio de **terminado**: algo que puedes comprobar, no una sensación. Copia la lista a un issue de tu repositorio o a un archivo de notas y ve marcándola.

## El recorrido

```flow
# De tu computador a producción
Ordenar :: pasos 1 a 3, Git, versiones y README
Comprobar :: paso 4, pruebas, lint y build
Publicar :: pasos 5 a 8, GitHub Pages, dominio, correo y migración
Cumplir :: pasos 9 y 10, legal y vista previa al compartir
+ Mantener :: paso 11, la revisión mensual
```

En palabras: primero se ordena el trabajo (pasos 1 a 3: Git, versiones y README). Luego se automatiza la comprobación (paso 4). Después se publica (pasos 5 a 8: GitHub Pages, dominio propio, correo y migración de las URLs). Se cumple con lo legal y con la vista previa al compartir (pasos 9 y 10). Y por último se deja programada la revisión mensual (paso 11).

## Antes de empezar

- [ ] Tu sitio funciona en local con `npm run dev` y compila con `npm run build`.
- [ ] Tiene un repositorio en GitHub.
- [ ] Decidiste si vas a comprar un dominio. Si no, los pasos 6 a 8 se quedan en `usuario.github.io` y puedes volver a ellos después.

## Los 11 pasos

### 1. Git con intención · [guía](/manual/git/commits-con-intencion)

- [ ] Escribiste la convención de commits en el README o en un archivo de reglas.
- [ ] **Terminado cuando:** los últimos 10 commits siguen `tipo(ámbito): descripción` y cada uno es un solo cambio.

### 2. Versiones que cuentan una historia · [bitácora](/bitacora/versionar-despues)

- [ ] Hay un `CHANGELOG.md` con la sección `[Sin publicar]` y tu primera versión con fecha.
- [ ] **Terminado cuando:** `package.json`, el CHANGELOG y el tag `vX.Y.Z` dicen la misma versión.

### 3. Un README que se lee · [guía](/manual/git/un-readme-que-se-lee)

- [ ] La primera pantalla tiene el nombre, una frase, el enlace en vivo y una vista previa.
- [ ] **Terminado cuando:** alguien que no conoce el proyecto lo ejecuta en local siguiendo solo el README.

### 4. Calidad automática · [guía de capturas](/manual/javascript/verificar-la-interfaz-con-capturas)

- [ ] Tienes al menos una prueba con Vitest y el lint configurado.
- [ ] **Terminado cuando:** el workflow de GitHub Actions corre pruebas, lint y build antes de publicar, y un error en cualquiera detiene la publicación.

### 5. Publicar la SPA en GitHub Pages · [guía](/manual/despliegue/spa-en-github-pages-sin-404)

- [ ] El `base` de Vite coincide con la ruta del repositorio (`/mi-proyecto/`).
- [ ] **Terminado cuando:** una ruta interna abre al recargarla directamente.

### 6. Dominio propio · [guía](/manual/despliegue/dominio-propio-github-pages-cloudflare)

- [ ] Comparaste el **precio de renovación**, no el de la oferta del primer año, y anotaste la fecha de vencimiento.
- [ ] El dominio está verificado en tu perfil de GitHub y configurado solo en el repositorio `usuario.github.io`.
- [ ] Los registros A y el CNAME de `www` están en «DNS only» (nube gris).
- [ ] **Terminado cuando:** `https://tu-dominio.dev/mi-proyecto/` abre con candado y `http://` redirige a `https://`.

### 7. Correo con tu dominio · [guía](/manual/despliegue/correo-con-tu-dominio)

- [ ] El buzón de destino está verificado y el catch-all, apagado.
- [ ] **Terminado cuando:** un correo de prueba a `contacto@tu-dominio.dev` llega a tu buzón personal.

### 8. Migrar sin romper nada · [guía](/manual/despliegue/migrar-a-un-dominio-nuevo)

- [ ] Las URLs viven en una sola constante y el correo personal ya no aparece en el repositorio.
- [ ] Revisaste los servicios con lista de dominios permitidos (por ejemplo, EmailJS).
- [ ] **Terminado cuando:** una prueba de guarda falla si alguien vuelve a escribir la dirección vieja.

### 9. La fase legal · [guía](/manual/despliegue/fase-legal-en-un-proyecto-personal)

- [ ] Hiciste la auditoría de lo que guarda y envía el sitio.
- [ ] **Terminado cuando:** hay privacidad, términos y licencia, enlazados desde el pie, con fecha de actualización.

### 10. Que se vea bien al compartirlo · [guía](/manual/despliegue/que-se-vea-bien-al-compartirlo)

- [ ] `index.html` tiene `canonical` y Open Graph con una imagen que existe.
- [ ] **Terminado cuando:** pegas el enlace en un chat y aparece la tarjeta con imagen, título y descripción.

### 11. Mantener vivo el proyecto · [guía](/manual/despliegue/mantener-vivo-un-proyecto)

- [ ] Programaste un recordatorio mensual y otro antes de la renovación del dominio.
- [ ] **Terminado cuando:** hiciste la primera revisión mensual y publicaste lo que encontraste como una versión PATCH.

## Cómo saber que terminaste

Tu proyecto cuenta su historia sin que tú estés presente: el README dice qué es y dónde verlo, el CHANGELOG dice qué cambió, cada commit dice por qué, el sitio abre con tu dominio y HTTPS, quien te escribe te encuentra en `contacto@`, y una prueba te avisa antes de publicar algo roto.

Si quieres ver todo esto aplicado en un proyecto real, revisa la ficha de [Moss](/proyectos/moss) y su [repositorio](https://github.com/Sergio-Velandia/Moss).
