---
title: Las credenciales que caducan solas
description: Un flujo de Gmail o de Sheets que funciona la primera semana y después pide volver a conectar la cuenta, sin que nadie toque nada. El culpable es el modo de prueba de Google, y ninguna prueba de una tarde lo encuentra.
type: journal
category: Aprendizajes
tags: [n8n, moss nexus, oauth2, google, credenciales, modo de prueba]
technologies: [n8n, Google Cloud, Gmail, Google Sheets]
createdAt: 2026-11-18
image: og/las-credenciales-que-caducan-solas.png
imageAlt: Tarjeta de Moss Bitácora con el título «Las credenciales que caducan solas». Antes, la credencial funciona el día 1 y deja de funcionar el día 7. Después, con la app en producción, sigue funcionando.
related: [manual/n8n/oauth2-de-google-en-n8n, manual/n8n/orquestacion-y-manejo-de-errores, project/moss-nexus]
---

## El síntoma

Gmail, Sheets o Drive funcionaban. Una semana después, el flujo falla al leer el correo o al escribir en la hoja, y n8n pide volver a conectar la cuenta. Nadie cambió el flujo, ni la contraseña, ni los permisos.

Me pasó, y por eso está en la sección «Esto me pasó» de [Primeros pasos de Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/#credenciales-google-7-dias). Cuatro plantillas de Nexus lo enlazan desde sus problemas frecuentes: [agenda diaria](https://sergio-velandia.dev/Moss-Nexus/plantillas/agenda-diaria-calendar/), [facturas a Drive](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/), [cobranza](https://sergio-velandia.dev/Moss-Nexus/plantillas/cobranza-facturas-vencidas/) y [aprobación de gastos](https://sergio-velandia.dev/Moss-Nexus/plantillas/aprobacion-de-gastos/).

## La causa

Para conectar una cuenta personal de Gmail a n8n hace falta una app OAuth propia en Google Cloud. Con una cuenta personal, esa app es de tipo *External*, y empieza en modo de prueba, *Testing*. En ese modo, Google hace caducar la autorización a los siete días.

Lo traicionero es que todo funciona mientras pruebas. La credencial se conecta, el flujo corre y la plantilla pasa la prueba. El fallo llega una semana después, cuando ya nadie está mirando.

## Antes y después

```flow
# Antes: la app sigue en Testing
Día 1 :: conectas la credencial y el flujo funciona
Días 2 a 6 :: sigue funcionando
! Día 7 :: Google retira la autorización
Flujo :: falla al leer o escribir, sin aviso
```

```flow
# Después: la app en producción
Google Cloud :: Audience, In production
Credencial :: se vuelve a conectar una vez
+ Flujo :: sigue funcionando después del día 7
? ¿Algo falla igual? :: un flujo de errores avisa el mismo día
```

En palabras: antes, la app OAuth seguía en *Testing*. La credencial funcionaba seis días y al séptimo Google retiraba la autorización, así que el flujo fallaba sin que nadie lo supiera. Después, la app pasa a *In production* y la credencial se conecta otra vez, ahora sin esa caducidad. Y si algo falla igual, un flujo de errores lo avisa ese mismo día.

## Dos formas de arreglarlo

1. **Reconectar cada semana.** Abrir cada credencial y volver a pulsar *Sign in with Google*. No exige tocar Google Cloud, pero es una tarea que alguien tiene que recordar, y se olvida justo la semana en que importa.
2. **Pasar la app a producción.** En Google Cloud Console, en **Audience**, el estado de publicación pasa a **In production**, y la credencial se conecta una vez más. Google puede seguir avisando de que la app no está verificada: es tu propia app.

Elegí la segunda, y es lo que recomiendan Primeros pasos y la [guía de OAuth2 de Moss](/manual/n8n/oauth2-de-google-en-n8n#la-trampa-de-los-siete-días). La primera sirve para probar. Para un uso que no sea solo tuyo, Gmail y Drive piden permisos que Google considera restringidos, y conviene leer su política de verificación antes.

## Cómo lo probé

Esta es la parte incómoda. **Un fallo que tarda siete días no aparece en una prueba de una tarde.** Las plantillas de Nexus se probaron en n8n con datos ficticios, y sus sellos dicen la fecha y la hora de esa prueba. Ninguno puede decir qué pasa una semana después.

Lo que sí se puede comprobar:

- **La causa está documentada por Google:** una app *External* en *Testing* recibe autorizaciones que caducan a los siete días. La [documentación de OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2) lo explica en la caducidad de los tokens.
- **El estado de la app se ve en la consola:** *In production* en Audience.
- **El fallo se ve el día que ocurre** si los flujos tienen un [flujo de errores](/manual/n8n/orquestacion-y-manejo-de-errores) asignado. Es la red que atrapa lo que ninguna prueba previa puede atrapar.

## Lo que me llevo

- **Que pase la prueba no significa que vaya a seguir funcionando.** Hay fallos que dependen del tiempo, y una prueba solo mira un momento.
- **Lo que no se puede probar antes se vigila después.** Por eso el flujo de errores no es opcional en una instalación propia.
- **Un tropiezo que me pasó vale más escrito donde lo va a buscar el siguiente:** en el síntoma, no en la causa. Nadie busca «modo Testing»; busca «las credenciales dejaron de funcionar».
