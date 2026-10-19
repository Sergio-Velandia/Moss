---
title: Correo con tu dominio usando Cloudflare Email Routing
description: Recibir en tu buzón personal lo que llega a contacto@tu-dominio.dev, con registros MX y SPF, una regla por dirección y el catch-all apagado, y entender por qué recibir no es lo mismo que enviar.
type: manual
tags: [correo, email routing, cloudflare, dns, mx, spf, dominio propio]
technologies: [Cloudflare]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/dominio-propio-github-pages-cloudflare]
references: [Cloudflare: empezar a enrutar correos | https://developers.cloudflare.com/email-service/get-started/route-emails/, Cloudflare: reglas, direcciones y catch-all | https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/, MDN: DNS | https://developer.mozilla.org/en-US/docs/Glossary/DNS, RFC 7208: SPF | https://datatracker.ietf.org/doc/html/rfc7208]
---

## Problema que resuelve

Ya tienes un dominio propio, pero en tu sitio, tu README y tus páginas legales sigue apareciendo tu correo personal. Eso expone una dirección que usas para todo y se ve poco profesional. Quieres un `contacto@tu-dominio.dev` público que llegue a tu buzón personal, sin pagar un servicio de correo.

Es el **paso 7** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio). Da por hecho que el DNS de tu dominio ya está en Cloudflare, como se explica en [Dominio propio para GitHub Pages](/manual/despliegue/dominio-propio-github-pages-cloudflare).

## La idea en una imagen

Email Routing funciona como **un apartado postal con reenvío**. La dirección que das al público es la del apartado (`contacto@`); la oficina de correos (Cloudflare) recibe las cartas y las reenvía a tu casa (tu buzón personal), que nadie conoce. Pero el apartado **solo recibe**: si quieres responder con el remite del apartado, necesitas otro servicio.

## El viaje de un correo

```flow
# De quien escribe a tu buzón
Remitente :: escribe a contacto@tu-dominio.dev
Consulta MX :: su servidor pregunta al DNS quién recibe el correo
Cloudflare :: los registros MX apuntan a sus servidores
? ¿Hay una regla para esa dirección?
+ Reenvío :: llega a tu buzón personal | ! Sin regla :: con el catch-all apagado, no se entrega
```

En palabras: alguien escribe a `contacto@tu-dominio.dev`. Su servidor de correo consulta el DNS del dominio para saber quién recibe el correo de ese dominio; los registros MX responden que son los servidores de Cloudflare. Cloudflare busca una regla para esa dirección exacta. Si existe, reenvía el mensaje a tu buzón personal. Si no existe y el catch-all está apagado, el mensaje no se entrega a ningún buzón.

## Los registros que crea Cloudflare

Al activar Email Routing en el dominio, Cloudflare añade solo estos registros. No hace falta escribirlos a mano:

| Tipo | Nombre | Contenido | Para qué sirve |
| --- | --- | --- | --- |
| MX | `@` | `route1.mx.cloudflare.net` (y `route2`, `route3`, con prioridades distintas) | Dice a los demás servidores quién recibe el correo de tu dominio. Son tres por redundancia. |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | **SPF**: dice qué servidores pueden enviar correo en nombre de tu dominio. Ayuda a que los reenvíos no se marquen como falsos. |
| TXT | (un selector de DKIM) | Una clave pública | **DKIM**: firma los correos reenviados para que el destino compruebe que no se alteraron. |

Estos registros conviven con los de GitHub Pages: los A y el CNAME llevan la web a GitHub; los MX y los TXT llevan el correo a Cloudflare. No se pisan.

## Paso a paso

1. En Cloudflare, ve a **Compute → Email Service → Email Routing** y añade tu dominio (*Onboard domain*). Revisa y acepta los registros que propone.
2. En **Destination addresses**, añade tu buzón personal. Cloudflare te envía un correo: ábrelo y pulsa **Verify email address**. Sin este paso no se reenvía nada.
3. Crea una **regla por cada dirección pública**: `contacto@` → tu buzón y, si tu sitio tiene versión en inglés, `contact@` → tu buzón.
4. Deja el **catch-all desactivado**. El catch-all reenvía *cualquier* dirección del dominio (`ventas@`, `admin@`, `xyz123@`…). Su ventaja es que recoge las direcciones mal escritas (`contato@`); su costo es que también recoge el spam enviado a direcciones inventadas. Con dos direcciones públicas, compensa más apagarlo.
5. Escríbete desde otra cuenta a cada dirección y comprueba que llega. Revisa la carpeta de spam la primera vez.

## Por qué `contacto@` y `contact@`

Una dirección por idioma, para que coincida con el texto que la rodea: en una página en español, `contacto@`; en una en inglés, `contact@`. Las dos son reglas que van al mismo sitio, así que no duplican trabajo. Si tu sitio está solo en español, basta con `contacto@`.

## Recibir no es enviar

Email Routing **solo reenvía lo que llega**. Si respondes desde tu buzón personal, quien te escribió verá tu dirección personal. Para responder como `contacto@` necesitas configurar aparte un servicio de envío. Si no lo necesitas, está bien: muchas veces basta con recibir.

## Así lo hice yo

- **Los MX de `sergio-velandia.dev`** son los tres de Cloudflare (`route1`, `route2` y `route3`), con el SPF de arriba. Cualquiera puede comprobarlo consultando el DNS público del dominio.
- **Dos direcciones públicas:** `contacto@sergio-velandia.dev` para los textos en español y `contact@` para los textos en inglés. El portafolio, que es bilingüe, elige una u otra según el idioma en [`Contacto.jsx`](https://github.com/Sergio-Velandia/mi-portafolio/blob/main/src/components/Contacto.jsx).
- **Catch-all apagado:** solo llegan las direcciones que tienen regla.
- **El correo personal salió de los tres proyectos el mismo día:** Moss [`d55db56`](https://github.com/Sergio-Velandia/Moss/commit/d55db56), Moss Nexus [`5a88310`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/5a88310) y el portafolio [`cf8e75f`](https://github.com/Sergio-Velandia/mi-portafolio/commit/cf8e75f).
- **El buzón de destino no aparece en ninguna parte pública**, ni en el sitio, ni en los repositorios, ni en esta guía.

## Lo que hay que vigilar

- **El buzón de destino sin verificar.** Las reglas existen, pero no llega nada. Se detecta enviando un correo de prueba a cada dirección después de configurarlas.
- **Responder desde el buzón personal.** Desvela la dirección que querías ocultar. Decide antes cómo vas a responder.
- **Un catch-all encendido «por si acaso».** Se detecta cuando empieza a llegar correo a direcciones que nunca publicaste.

## Lista de comprobación

- [ ] Email Routing está activo y Cloudflare creó los MX y los TXT.
- [ ] El buzón de destino está verificado.
- [ ] Hay una regla por cada dirección pública (`contacto@` y, si aplica, `contact@`).
- [ ] El catch-all está desactivado.
- [ ] Un correo de prueba a cada dirección llega al buzón.
- [ ] El sitio, el README y las páginas legales usan la dirección del dominio, no la personal.
- [ ] Sabes cómo vas a responder sin desvelar tu correo personal.
