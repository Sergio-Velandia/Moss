---
title: Conectar Gmail y Google Calendar a n8n con OAuth2
description: Crear el cliente OAuth en Google Cloud Console paso a paso, con n8n en Docker o en n8n Cloud, y evitar el flujo que deja de funcionar a los siete días.
type: manual
tags: [oauth2, google cloud, gmail, google calendar, credenciales, docker, seguridad]
technologies: [n8n, Google Cloud]
createdAt: 2026-10-15
related: [route/n8n-de-cero-a-produccion, manual/n8n/reporte-diario-automatico, manual/n8n/orquestacion-y-manejo-de-errores]
references: [n8n: OAuth2 de Google para un servicio | https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/, n8n: credenciales de Google | https://docs.n8n.io/integrations/builtin/credentials/google/, Google: empezar con Google Auth Platform | https://support.google.com/cloud/answer/15544987, Google: OAuth 2.0 para las APIs de Google | https://developers.google.com/identity/protocols/oauth2, Google: permisos de la API de Gmail | https://developers.google.com/workspace/gmail/api/auth/scopes, Google: permisos de la API de Calendar | https://developers.google.com/workspace/calendar/api/auth]
---

## Problema que resuelve

Copias un flujo que lee tu Google Calendar y te envía un correo por Gmail, por ejemplo la plantilla [Agenda del día por correo](https://sergio-velandia.github.io/Moss-Nexus/plantillas/agenda-diaria-calendar/) de Moss Nexus, y los nodos de Google piden una **credencial**. n8n habla de *Client ID*, *Client Secret* y *OAuth Redirect URL*; Google Cloud Console, de proyectos, APIs, *Audience* y clientes. Sin saber qué es cada pieza, es fácil perder una tarde con errores que no explican nada.

Esta guía conecta **Gmail y Google Calendar** con una cuenta de **Gmail personal**, primero en **n8n autoalojado con Docker** y después en **n8n Cloud**. Está escrita a partir de una prueba real de esa plantilla en una instalación local con Docker.

Es un paso de la ruta [n8n, de cero a producción](/rutas/n8n-de-cero-a-produccion): va después de entender los triggers y antes de los flujos de negocio, porque esos flujos casi siempre necesitan conectarse a un servicio de terceros. Si sabes crear una credencial OAuth2 con Google, el mismo esquema te servirá para otros servicios.

## Las piezas y cómo se relacionan

```mindmap
Conectar Google a n8n
- Proyecto :: el contenedor en Google Cloud
  - APIs habilitadas
  - Gmail API
  - Google Calendar API
- Google Auth Platform :: quién puede autorizar
  - Branding: nombre y correo
  - Audience: External y usuarios de prueba
- Cliente OAuth :: la identidad de tu n8n
  - Web application
  - Client ID y Client Secret
  - URI de redirección
- n8n :: las credenciales
  - Google Calendar OAuth2 API
  - Gmail OAuth2 API
```

Un solo proyecto y un solo cliente OAuth sirven para las dos credenciales de n8n. Cada credencial pide sus propios permisos cuando la conectas.

## Qué pasa cuando pulsas «Sign in with Google»

```flow
# El viaje de la autorización
n8n :: te envía a Google con el Client ID
Google :: inicias sesión y apruebas los permisos
? ¿La URI de redirección coincide?
+ Código a n8n :: lo cambia por tokens con el Client Secret y los renueva solo | ! No coincide :: error redirect_uri_mismatch
```

Por eso la *OAuth Redirect URL* es lo más delicado: Google solo devuelve el código a las direcciones que registraste, y tienen que coincidir **carácter por carácter**, con el protocolo, el puerto y la ruta.

## Antes de empezar

- Una cuenta de Google (aquí, Gmail personal).
- n8n en marcha. En Docker, con la zona horaria de tu ciudad: la plantilla de agenda se dispara a las 7:00 y lee los eventos «de hoy».

```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/Bogota" -e TZ="America/Bogota" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

- El flujo importado en n8n, para tener a mano los nodos que piden la credencial: en la plantilla, «Eventos de hoy» (Google Calendar) y «Enviar por Gmail».

## Paso a paso con n8n en Docker

### 1. Copia la Redirect URL desde n8n

Abre el nodo «Eventos de hoy», elige **Create new credential** y deja la ventana abierta. n8n muestra el campo **OAuth Redirect URL**. En una instalación local con el puerto por defecto es:

```text
http://localhost:5678/rest/oauth2-credential/callback
```

Copia la que veas **en tu panel**, no la de esta guía: si cambiaste el puerto, usas un túnel o definiste `WEBHOOK_URL`, será distinta. Google acepta `localhost` como redirección, así que no necesitas un dominio público ni HTTPS para probar en tu equipo.

### 2. Crea un proyecto en Google Cloud

1. Entra en [console.cloud.google.com](https://console.cloud.google.com/) con tu cuenta.
2. En el selector de proyecto de la barra superior, pulsa **New project**, ponle un nombre (por ejemplo, `n8n-local`) y créalo.
3. Comprueba que el selector muestra **tu proyecto nuevo**. Crear cosas en otro proyecto es uno de los errores más comunes.

### 3. Habilita las dos APIs

1. Ve a **APIs & Services → Library**.
2. Busca **Google Calendar API** y pulsa **Enable**.
3. Vuelve a la biblioteca, busca **Gmail API** y pulsa **Enable**.

Sin este paso, la credencial se conecta bien, pero el nodo falla después con un error 403.

### 4. Configura Google Auth Platform

Es lo que antes se llamaba «pantalla de consentimiento OAuth». La primera vez, Google te guía con **Get started**:

1. **App information (Branding):** un nombre que reconozcas (por ejemplo, «n8n de Sergio») y tu correo como correo de soporte.
2. **Audience:** con Gmail personal, elige **External**. *Internal* solo existe para organizaciones de Google Workspace.
3. **Contact information:** tu correo.
4. Acepta la política de datos de usuario de Google y termina.

Después, en **Audience → Test users**, pulsa **Add users** y añade **tu propio correo**. Con *External*, la app empieza en modo *Testing* y solo las personas de esa lista pueden autorizarla.

### 5. Crea el cliente OAuth

1. En **Google Auth Platform → Clients**, pulsa **Create client**.
2. **Application type:** **Web application**.
3. **Name:** algo como `n8n local`.
4. En **Authorized redirect URIs**, pulsa **Add URI** y pega la URL que copiaste en el paso 1.
5. Pulsa **Create**.

Google muestra el **Client ID** y el **Client Secret**. Cópialos en ese momento a un lugar seguro: en la consola actual el secreto puede no volver a mostrarse completo, y si lo pierdes tendrás que generar otro.

### 6. Termina la credencial en n8n

1. En la ventana de credencial de **Google Calendar OAuth2 API** que dejaste abierta, pega el **Client ID** y el **Client Secret**.
2. Pulsa **Sign in with Google** y elige tu cuenta.
3. Google avisa de que **no ha verificado esta app**. Es normal: la app es tuya y está en modo de prueba. Pulsa **Continuar** (en algunas pantallas, primero *Configuración avanzada*).
4. Aprueba los permisos de Calendar. La ventana se cierra y n8n marca la credencial como conectada.
5. Repite en el nodo «Enviar por Gmail» con una credencial **Gmail OAuth2 API**, usando **el mismo Client ID y el mismo Client Secret**.

### 7. Prueba el flujo

En la plantilla de agenda, cambia `tu-correo@ejemplo.com` por tu correo en «Enviar por Gmail» y pulsa **Test workflow**. Deberías recibir la agenda de hoy. Si el día no tiene eventos, el correo llega igual y lo dice.

## Con n8n Cloud

En n8n Cloud hay un atajo: los nodos de Gmail y de Google Calendar admiten **Managed OAuth2**. En la ventana de la credencial basta con pulsar **Sign in with Google**, sin crear proyecto, API ni cliente en Google Cloud. Es la opción recomendada en Cloud.

Si prefieres usar tu propio cliente (**Custom OAuth2**, en el desplegable de la credencial), los pasos son los mismos que en Docker. Solo cambia la **OAuth Redirect URL**: será la que muestre tu panel de n8n Cloud, con HTTPS. Cópiala de ahí y regístrala en el cliente.

```mindmap
Qué cambia según dónde corre n8n
- Docker local :: tu propio cliente OAuth
  - Redirect URL con localhost
  - proyecto y APIs a tu cargo
- n8n Cloud :: dos opciones
  - Managed OAuth2 sin Google Cloud
  - Custom OAuth2 con la URL del panel
```

## La trampa de los siete días

Con una cuenta de Gmail personal la app queda en *External* y en modo *Testing*. En ese modo, **Google hace caducar la autorización a los siete días**. El flujo funciona perfecto la primera semana y después falla al pedir los eventos o al enviar el correo, aunque nadie haya tocado nada.

Opciones, de más simple a más estable:

- **Reconectar cada semana:** abre la credencial y vuelve a pulsar *Sign in with Google*. Sirve para pruebas.
- **Pasar la app a producción:** en **Audience**, cambia el estado de publicación a **In production**. Para un uso solo tuyo, el aviso de app no verificada sigue apareciendo al conectar, pero la autorización deja de caducar cada semana. Antes de usarla con más personas, revisa la política de verificación de Google: Gmail pide permisos que Google considera restringidos.
- **Usar n8n Cloud con Managed OAuth2,** donde la app la gestiona n8n.

Un [flujo de errores](/manual/n8n/orquestacion-y-manejo-de-errores) con Error Trigger te avisa el día que la autorización caduque, en lugar de enterarte cuando falte la agenda.

## Seguridad

- **El Client Secret es una contraseña.** No lo pegues en un nodo Code, en notas del flujo ni en capturas. Vive solo en la credencial de n8n.
- **Los permisos de Gmail son amplios.** Por defecto, la credencial pide acceso completo al correo (`https://mail.google.com/`), porque el nodo de Gmail sirve para leer, etiquetar y enviar. Las versiones recientes de n8n permiten elegir permisos propios en *Custom Scopes*: úsalo solo si sabes qué operaciones necesita tu flujo.
- **Compartir un flujo no comparte la credencial,** siempre que exportes el JSON sin datos de credenciales. Las plantillas de Moss Nexus pasan una prueba que lo garantiza.
- **Revoca lo que no uses.** Desde tu cuenta de Google (*Seguridad → Acceso de terceros*) puedes retirar el acceso a la app en cualquier momento.

## Lista de comprobación

- [ ] El selector de Google Cloud muestra el proyecto correcto.
- [ ] Google Calendar API y Gmail API están habilitadas.
- [ ] Audience es *External* y tu correo está en *Test users*.
- [ ] El cliente es de tipo *Web application*.
- [ ] La URI de redirección es exactamente la que muestra n8n.
- [ ] Las dos credenciales usan el mismo Client ID y Client Secret.
- [ ] Sabes qué harás cuando pasen los siete días.

## Errores frecuentes

- **`redirect_uri_mismatch`.** La URI del cliente no coincide con la que envía n8n: falta el puerto, sobra una barra, es `http` en vez de `https`, o cambiaste de túnel. Copia otra vez la del panel de n8n y reemplázala en el cliente.
- **`access_denied` o «la app está en proceso de prueba».** Tu correo no está en *Test users*.
- **«Google no verificó esta app».** No es un error: en modo de prueba aparece siempre. Continúa si la app es tuya.
- **Error 403 al ejecutar el nodo.** La API correspondiente no está habilitada en el proyecto del cliente.
- **Funcionaba y dejó de funcionar a la semana.** Es la caducidad de los siete días del modo *Testing*.
- **La agenda sale vacía o del día equivocado.** La zona horaria de n8n no es la tuya: revisa `GENERIC_TIMEZONE` en Docker y *Settings → Timezone* en el flujo.
