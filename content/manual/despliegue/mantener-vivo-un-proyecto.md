---
title: Mantener vivo un proyecto publicado
description: Una revisión mensual de enlaces, dependencias, formularios y HTTPS; la renovación del dominio; el contenido que caduca, y cuándo pasar un proyecto a «mantenimiento», con ejemplos reales de mis tres proyectos.
type: manual
tags: [mantenimiento, dependencias, enlaces rotos, renovación, auditoría, semver]
technologies: [npm, GitHub, GitHub Pages]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, journal/versionar-despues, manual/javascript/verificar-la-interfaz-con-capturas, manual/despliegue/proyecto-final-publica-tu-sitio]
references: [npm outdated | https://docs.npmjs.com/cli/v10/commands/npm-outdated, npm audit | https://docs.npmjs.com/cli/v10/commands/npm-audit, GitHub: HTTPS en GitHub Pages | https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https, Versionado Semántico | https://semver.org/lang/es/]
---

## Problema que resuelve

Publicar no es el final. Un mes después, un enlace externo ya no existe, una dependencia tiene un aviso de seguridad, el formulario dejó de enviar sin que nadie se enterara o una página dice una versión que ya no es la actual. Nada de eso hace ruido: simplemente el sitio se va estropeando.

Es el **paso 11**, el último de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio) antes del proyecto final.

## La idea en una imagen

Un sitio publicado es **una planta, no una escultura**. La escultura se termina y se expone. La planta se riega, se poda y se revisa de vez en cuando; no todos los días, pero sí con regularidad. Si la dejas sola, no muere de golpe: se va secando por las puntas.

## La revisión mensual

```flow
# Una vez al mes
Enlaces :: internos y externos responden
Dependencias :: npm outdated y npm audit
Formularios :: un envío de prueba real
HTTPS y dominio :: candado, redirecciones y fecha de renovación
Contenido :: versiones, fechas y capturas al día
+ PATCH :: lo que salga se corrige y se versiona
```

En palabras: una vez al mes se revisan, en este orden, los enlaces internos y externos; las dependencias, con `npm outdated` y `npm audit`; los formularios, con un envío real; el HTTPS y el dominio, incluida la fecha de renovación; y el contenido que caduca, como versiones, fechas y capturas. Lo que aparezca se corrige y se publica como una versión PATCH.

### 1. Enlaces

- Las rutas internas abren al recargarlas directamente, no solo navegando.
- Los enlaces externos (documentación oficial, proyectos hermanos) siguen respondiendo.
- Las imágenes declaradas en el HTML existen (`og:image` incluida).

### 2. Dependencias

```bash
npm outdated   # qué paquetes tienen versiones nuevas
npm audit      # qué paquetes tienen avisos de seguridad
```

Actualiza en una rama, corre las pruebas, el lint y el build, y publica solo si todo pasa. Las actualizaciones MAJOR de una dependencia se hacen de una en una, leyendo sus notas de cambios.

### 3. Formularios

Un formulario puede fallar sin que el sitio lo note: una clave que cambió, un dominio que ya no está permitido, un servicio que cambió su plan gratuito. **Envía un mensaje de prueba real** y comprueba que llega.

### 4. HTTPS y dominio

- El candado aparece y `http://` redirige a `https://`.
- Las direcciones viejas siguen redirigiendo.
- **La fecha de renovación del dominio está anotada**, con un recordatorio unas semanas antes.

### 5. Contenido que caduca

Todo lo que dice «versión X», «probado con Y» o «actualizado el día Z» caduca. Si un texto tiene vigencia, ponle una **fecha visible** y revísala.

## La renovación del dominio

Al comprar un dominio, la oferta llamativa es **la del primer año**. Lo que de verdad pagarás cada año es **el precio de renovación**, que puede ser varias veces mayor. Antes de comprar, compara ese precio entre registradores, no el del primer año. Y anota la fecha de vencimiento: si el dominio caduca, tu sitio y tu correo dejan de funcionar el mismo día.

## Cuándo pasar a «mantenimiento»

Cada proyecto está en uno de tres estados, y el README lo dice:

| Estado | Qué significa | Qué versiones salen |
| --- | --- | --- |
| En desarrollo | Hay fases abiertas | MINOR y PATCH, aún en `0.x` |
| Estable | Versión completa que crece con contenido | MINOR por contenido o funciones, PATCH por correcciones |
| En mantenimiento | Ya no crece; solo se corrige | Solo PATCH |

Un proyecto pasa a mantenimiento cuando ya cumple su propósito y no tienes planes de añadirle nada. No es abandonarlo: la revisión mensual sigue.

## Así lo hice yo

- **Contenido que caducó sin avisar:** la ficha de Moss en Proyectos dice versión 1.6.0, revisada el 12/10/2026, mientras Moss ya va por la 1.11.0. Es justo el tipo de dato que la revisión mensual tiene que encontrar. Las fichas tienen un campo `reviewedAt` obligatorio, validado por una prueba ([`4cf6e43`](https://github.com/Sergio-Velandia/Moss/commit/4cf6e43)), para que al menos se vea cuándo se revisaron por última vez.
- **Una imagen que no existe:** Moss Nexus declara `og.png` como imagen para compartir, pero la URL responde 404. Apareció al revisar los enlaces y está anotado como pendiente.
- **Corregir lo que alguien reporta:** el índice lateral de las guías de Moss se cortaba en pantallas bajas; se corrigió como PATCH ([`ad2b68a`](https://github.com/Sergio-Velandia/Moss/commit/ad2b68a), versión 1.9.5).
- **Contenido que se actualiza con la realidad:** la guía de OAuth2 de Google se amplió cuando una plantilla nueva de Nexus necesitó Drive y Sheets ([`0c55db3`](https://github.com/Sergio-Velandia/Moss/commit/0c55db3), versión 1.9.3).
- **Un proyecto en mantenimiento:** el portafolio está en mantenimiento. Su último cambio fue un PATCH, la 1.0.1, por el dominio propio ([`f70e543`](https://github.com/Sergio-Velandia/mi-portafolio/commit/f70e543)).
- **La renovación del dominio:** la fecha de vencimiento de `sergio-velandia.dev` la anoté; no la publico aquí.

## Errores que cometí (o que casi cometo)

- **La oferta del primer año esconde la renovación.** Se detecta buscando el precio de renovación antes de pagar; si el registrador no lo muestra con claridad, es una señal.
- **No borrar el archivo `CNAME` del repositorio raíz.** En una limpieza de archivos «que no parecen hacer nada», es fácil borrarlo, y con él se va el dominio. Se detecta si el sitio vuelve a `usuario.github.io` o deja de abrir en el dominio.

## Lista de comprobación mensual

- [ ] Las rutas internas abren al recargarlas y los enlaces externos responden.
- [ ] Las imágenes declaradas en el HTML existen.
- [ ] `npm outdated` y `npm audit` revisados; las actualizaciones pasaron test, lint y build.
- [ ] Un envío de prueba real por cada formulario llegó.
- [ ] HTTPS activo, `http://` y las direcciones viejas redirigen.
- [ ] La fecha de renovación del dominio está anotada y tiene recordatorio.
- [ ] Versiones, fechas «probado con» y capturas al día.
- [ ] El archivo `CNAME` del repositorio raíz sigue ahí.
- [ ] Lo que salió se corrigió y se publicó como PATCH, con su entrada en el CHANGELOG.
