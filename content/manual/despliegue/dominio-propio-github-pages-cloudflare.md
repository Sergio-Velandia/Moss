---
title: Dominio propio para GitHub Pages con Cloudflare DNS y correo
description: Poner un dominio propio a todos tus sitios de GitHub Pages con Cloudflare DNS, verificarlo, activar HTTPS y recibir correo en tu dominio con Email Routing, sin tocar el base de Vite.
type: manual
tags: [dominio propio, github pages, cloudflare, dns, https, email routing, despliegue]
technologies: [GitHub Pages, Cloudflare]
createdAt: 2026-10-16
related: [manual/despliegue/spa-en-github-pages-sin-404, project/moss, project/moss-nexus]
references: [GitHub: dominios propios en GitHub Pages | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages, GitHub: gestionar un dominio propio | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site, GitHub: verificar el dominio | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages, GitHub: HTTPS en GitHub Pages | https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https, Cloudflare: estado del proxy | https://developers.cloudflare.com/dns/proxy-status/, Cloudflare: Email Routing | https://developers.cloudflare.com/email-service/get-started/route-emails/, Google Registry: dominios .dev | https://get.dev/]
---

## Problema que resuelve

Tienes varios proyectos en GitHub Pages, cada uno en `usuario.github.io/proyecto/`, y quieres que todos vivan bajo un dominio propio, con HTTPS y con un correo de contacto del mismo dominio en lugar de tu Gmail personal.

Esta guía sigue la configuración real de `sergio-velandia.dev`, el dominio de Moss, Moss Nexus y el portafolio: GitHub Pages sirve los sitios, Cloudflare gestiona el DNS y reenvía el correo. No incluye ningún código de verificación ni datos privados: donde hace falta uno, la guía te dice dónde encontrar el tuyo.

## Las piezas

```mindmap
Dominio propio
- Dominio :: lo compras en un registrador
  - .dev exige HTTPS siempre
- Cloudflare DNS :: dice a dónde va cada cosa
  - A del dominio hacia GitHub
  - CNAME de www
  - MX y TXT del correo
- GitHub Pages :: sirve los sitios
  - verificación en tu perfil
  - dominio en el repo usuario.github.io
  - Enforce HTTPS
- Email Routing :: recibe el correo
  - contacto@ y contact@
  - reenvío a tu buzón
```

La pieza clave es que **el dominio se configura una sola vez, en el repositorio raíz** `usuario.github.io`. GitHub usa ese mismo dominio para todos los *project sites* de tu cuenta: `usuario.github.io/Moss/` pasa a ser `tu-dominio/Moss/` sin tocar el repositorio de Moss.

## El orden importa

```flow
# De dominio comprado a sitios con HTTPS
Cloudflare :: el dominio usa sus nameservers
Verificar en GitHub :: registro TXT desde tu perfil
Repo raíz :: Custom domain en Settings, Pages
DNS :: registros A del dominio y CNAME de www
Enforce HTTPS :: cuando GitHub tenga el certificado
+ Email Routing :: MX y TXT que añade Cloudflare
```

GitHub recomienda **verificar el dominio y añadirlo a Pages antes de crear los registros DNS**. Si haces al revés, durante ese rato otra cuenta podría publicar un sitio en tu dominio.

## Paso a paso

### 1. Lleva el DNS del dominio a Cloudflare

Añade el dominio a tu cuenta de Cloudflare. Si lo compraste en otro registrador, cambia allí los *nameservers* por los dos que te asigne Cloudflare; si lo compraste en Cloudflare, ya está hecho. Desde ese momento, todos los registros DNS se editan en Cloudflare.

Antes de seguir, borra los registros que el registrador o Cloudflare hayan creado por defecto para el dominio (por ejemplo, una página de aparcamiento), y no crees registros comodín como `*.tu-dominio`.

### 2. Verifica el dominio en GitHub

La verificación se hace en tu **perfil**, no en el repositorio:

1. En GitHub, abre tu foto de perfil → **Settings** → **Pages** (en la sección *Code, planning, and automation*).
2. Pulsa **Add a domain**, escribe tu dominio y confirma.
3. GitHub te muestra un registro **TXT**: un nombre que empieza por `_github-pages-challenge-` seguido de tu usuario, y un valor único.
4. En Cloudflare, ve a **DNS → Records** y crea ese registro TXT tal cual.
5. Vuelve a GitHub y pulsa **Verify**. Si el DNS aún no se propagó, espera y usa **Continue verifying** más tarde.

**Deja el TXT para siempre**: si lo borras, el dominio deja de estar verificado. La verificación cubre también los subdominios directos, como `www`, y evita que otra cuenta de GitHub use tu dominio si un día borras un repositorio o desactivas Pages.

### 3. Pon el dominio en el repositorio raíz

1. Abre el repositorio `usuario.github.io` → **Settings** → **Pages**.
2. En **Custom domain**, escribe tu dominio (sin `www`, si quieres que la dirección principal sea el dominio desnudo) y guarda.

GitHub empieza a comprobar el DNS. Es normal que falle hasta que hagas el paso 4.

### 4. Crea los registros DNS

En Cloudflare, **DNS → Records**:

| Tipo | Nombre | Contenido |
| --- | --- | --- |
| A | `@` (el dominio) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `usuario.github.io` |

Las cuatro direcciones son las de GitHub Pages y aparecen en su documentación. Si quieres IPv6, añade también los cuatro registros AAAA que da GitHub; `sergio-velandia.dev` funciona solo con los A.

**Pon todos estos registros en «DNS only» (nube gris), no en «Proxied» (nube naranja).** Con el proxy activo, el dominio apunta a las IPs de Cloudflare en lugar de a las de GitHub, y GitHub no puede emitir el certificado HTTPS. Así está configurado `sergio-velandia.dev`: si consultas su DNS, verás las IPs de GitHub.

Con el dominio y `www` configurados, GitHub redirige uno al otro solo: `www.sergio-velandia.dev` lleva a `sergio-velandia.dev`.

### 5. Activa HTTPS

Cuando el DNS esté bien, GitHub pide un certificado TLS y muestra una marca junto al dominio. Entonces activa **Enforce HTTPS** en la misma pantalla. Puede tardar hasta 24 horas en estar disponible.

Con un dominio `.dev` no hay alternativa: todo `.dev` está en la lista de precarga HSTS de los navegadores, así que **solo funciona con HTTPS**. Hasta que GitHub tenga el certificado, el navegador no abrirá el sitio.

### 6. Recibe correo con Email Routing

1. En Cloudflare, ve a **Compute → Email Service → Email Routing** y añade (*onboard*) tu dominio. Cloudflare crea solo los registros MX y los TXT de SPF y DKIM que necesita.
2. En **Destination addresses**, añade el buzón donde quieres recibir los mensajes. Cloudflare te envía un correo de confirmación: ábrelo y pulsa **Verify email address**.
3. Crea las direcciones públicas como reglas de reenvío. En `sergio-velandia.dev` hay dos: `contacto@` para los textos en español y `contact@` para los textos en inglés.

El buzón de destino no aparece en ninguna parte pública: quien escribe a `contacto@` no ve a dónde llega el mensaje.

Email Routing **recibe y reenvía**. Para responder *desde* `contacto@` necesitas configurar aparte un servicio de envío; si respondes desde tu buzón personal, la persona verá esa dirección.

## Qué cambia en cada proyecto

```mindmap
Después de configurar el dominio
- Sigue igual :: nada que tocar
  - base de Vite en /Moss/
  - 404.html y rutas estáticas
  - deploy con GitHub Actions
- Cambia :: conviene actualizar
  - URLs del sitio en el código
  - correo de contacto
  - enlaces entre proyectos
```

- **El `base` de Vite no cambia.** Un *project site* conserva su ruta: Moss pasa de `usuario.github.io/Moss/` a `sergio-velandia.dev/Moss/`, así que `base: '/Moss/'` sigue siendo correcto. El truco del `404.html` de [Una SPA en GitHub Pages sin 404](/manual/despliegue/spa-en-github-pages-sin-404) también sigue funcionando.
- **Las URLs antiguas redirigen solas.** GitHub responde con un 301 de `usuario.github.io/Moss/` a `sergio-velandia.dev/Moss/`, así que los enlaces que ya compartiste siguen funcionando.
- **Aun así, limpia el código.** Cambia las URLs del sitio y de los proyectos hermanos al dominio nuevo, y el correo personal por la dirección del dominio. Si las URLs viven en una sola constante, es un cambio pequeño. Moss añadió además una prueba que falla si vuelve a aparecer una URL de `github.io`.
- **No cambies los enlaces a `github.com`.** Los enlaces a los repositorios siguen siendo los mismos.

## Seguridad

- **Verifica el dominio antes de apuntarlo a GitHub** y no uses registros comodín: es lo que evita que otra cuenta publique en tu dominio.
- **No publiques tu código de verificación** ni el buzón de destino del correo. El TXT es visible para quien consulte tu DNS, pero no hace falta enseñarlo en capturas ni en el repositorio.
- **Las direcciones públicas son las del dominio.** En el sitio, el README y los textos legales, usa `contacto@`; tu correo personal no debería aparecer.

## Lista de comprobación

- [ ] El dominio usa los nameservers de Cloudflare.
- [ ] El dominio aparece como verificado en *Settings → Pages* de tu perfil, y el TXT sigue en el DNS.
- [ ] El repositorio `usuario.github.io` tiene el dominio en *Custom domain*.
- [ ] Hay cuatro registros A hacia GitHub y un CNAME de `www`, todos en «DNS only».
- [ ] *Enforce HTTPS* está activado.
- [ ] `http://` y `www` redirigen a `https://tu-dominio/`.
- [ ] Cada proyecto abre en `tu-dominio/proyecto/` y las rutas internas se recargan bien.
- [ ] Un correo de prueba a `contacto@` llega a tu buzón.
- [ ] El código ya no usa las URLs de `github.io` ni tu correo personal.

## Errores frecuentes

- **El sitio `.dev` no abre y el navegador da un error de conexión o de certificado.** Todavía no hay certificado y `.dev` solo funciona con HTTPS. Revisa el DNS y espera a que GitHub muestre la marca junto al dominio.
- **«Certificate not yet created» o *Enforce HTTPS* desactivado durante horas.** Algún registro está en «Proxied», sobra un registro que no apunta a GitHub, o el DNS todavía no se propagó.
- **GitHub marca el DNS como incorrecto al guardar el dominio.** Faltan los registros A, o aún no se propagaron (puede tardar hasta 24 horas). Espera y vuelve a comprobar.
- **Un proyecto da 404 con el dominio nuevo.** El proyecto no tiene Pages activado, o su repositorio tiene su propio *Custom domain* y no hereda el del repositorio raíz.
- **El correo no llega.** El buzón de destino no está verificado, o falta la regla de la dirección (`contacto@`). Revisa también la carpeta de spam la primera vez.
- **La verificación de GitHub no avanza.** El TXT tiene un nombre distinto al que pide GitHub (suele faltar o sobrar el dominio al final, según cómo lo escriba el panel de DNS).
