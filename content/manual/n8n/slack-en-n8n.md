---
title: Conectar Slack a n8n con un bot (token xoxb)
description: Crear una app de Slack desde un manifiesto, instalarla en tu espacio de trabajo y usar su token de bot en n8n para publicar avisos en un canal, sin pedir más permisos de los necesarios.
type: manual
tags: [slack, bot, token, credenciales, manifiesto, permisos, seguridad, docker]
technologies: [n8n, Slack]
createdAt: 2026-10-15
related: [manual/n8n/oauth2-de-google-en-n8n, manual/n8n/orquestacion-y-manejo-de-errores, manual/n8n/reporte-diario-automatico, route/n8n-de-cero-a-produccion]
references: [n8n: credencial de Slack | https://docs.n8n.io/integrations/builtin/credentials/slack/, n8n: nodo de Slack | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/, Slack: configurar apps con un manifiesto | https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests, Slack: tipos de token | https://docs.slack.dev/authentication/tokens, Slack: permiso chat:write | https://docs.slack.dev/reference/scopes/chat.write, Slack: permiso channels:read | https://docs.slack.dev/reference/scopes/channels.read, Slack: permiso groups:read | https://docs.slack.dev/reference/scopes/groups.read, Slack: método chat.postMessage | https://docs.slack.dev/reference/methods/chat.postMessage]
---

## Problema que resuelve

Muchas plantillas de Moss Nexus terminan con un aviso en Slack: un lead nuevo, un error en un flujo, un ticket de soporte, el resumen de los correos, un cliente que empieza el onboarding o un pago de Stripe. Por ejemplo, la plantilla [Leads del formulario web a Google Sheets con aviso en Slack](https://sergio-velandia.dev/Moss-Nexus/plantillas/leads-formulario-a-sheets/) guarda cada lead en una hoja y avisa en `#ventas`.

El nodo de Slack de n8n pide una credencial **Slack API** con un *Access Token*. Ese token no se crea en n8n: sale de una **app de Slack** que tienes que crear e instalar en tu espacio de trabajo. Si eliges mal el tipo de token o te falta un permiso, Slack responde con errores cortos como `not_in_channel` o `missing_scope` que no dicen qué hacer.

Esta guía crea esa app desde un **manifiesto**, con solo los permisos que necesita un flujo que publica avisos, y conecta su **token de bot** (`xoxb-`) a n8n. Está escrita a partir de una prueba real de la plantilla de leads en n8n 2.43.5 autoalojado con Docker, el 15/10/2026, con datos ficticios. Sirve igual para el resto de plantillas de Nexus que usan Slack.

Si tu plantilla también usa Google Sheets, como la de leads, conecta Google con la guía [Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2](/manual/n8n/oauth2-de-google-en-n8n).

## Las piezas y cómo se relacionan

```mindmap
Conectar Slack a n8n
- Espacio de trabajo :: donde vive tu equipo en Slack
  - canales públicos y privados
- App de Slack :: se crea en api.slack.com/apps desde un manifiesto
  - usuario bot: Nexus Leads
  - chat:write para publicar
  - channels:read para listar canales
- Token de bot :: empieza por xoxb-
  - se genera al instalar la app
  - vive solo en la credencial de n8n
- n8n :: credencial Slack API
  - Access Token
  - nodo Slack que envía el mensaje
```

La app es la identidad del bot; el token es la llave que n8n usa para hablar en su nombre. Una misma app y un mismo token sirven para todas tus plantillas, siempre que el bot esté invitado a cada canal donde publica.

```flow
# Del flujo al canal
Nodo Slack :: n8n llama a chat.postMessage con el token xoxb-
? ¿El token es válido y tiene el permiso?
? ¿El bot está en el canal?
+ Mensaje publicado en el canal | ! not_in_channel, invalid_auth o missing_scope
```

## Antes de empezar

- Un espacio de trabajo de Slack donde puedas instalar apps. Si es de una empresa, puede que un administrador tenga que aprobar la instalación.
- n8n en marcha (si aún no lo tienes, sigue [Instalar n8n](/manual/n8n/instalar-n8n)), por ejemplo en Docker:

```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/Bogota" -e TZ="America/Bogota" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

- El flujo importado en n8n, para tener a mano el nodo de Slack que pide la credencial.
- El canal donde llegarán los avisos ya creado (en esta guía, `#ventas`).

A diferencia de Google, aquí no hay *Redirect URL* ni pantalla de consentimiento: el token se copia una vez de la app y se pega en n8n. Por eso el paso a paso es el mismo con n8n en Docker y en n8n Cloud.

## Paso a paso

### 1. Crea la app desde un manifiesto

1. Entra en [api.slack.com/apps](https://api.slack.com/apps) con tu cuenta de Slack.
2. Pulsa **Create New App → From a manifest**.
3. Elige el **espacio de trabajo** donde se instalará la app y pulsa **Next**.

Un manifiesto describe la app en un solo bloque de texto: su nombre, su usuario bot y sus permisos. Es más rápido que configurarla pantalla por pantalla y deja claro qué permisos pide.

### 2. Pega el manifiesto

Elige la pestaña **JSON**, borra lo que haya y pega:

```json
{
  "display_information": {
    "name": "Nexus Leads"
  },
  "features": {
    "bot_user": {
      "display_name": "Nexus Leads",
      "always_online": false
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": ["chat:write", "channels:read"]
    }
  },
  "settings": {
    "org_deploy_enabled": false,
    "socket_mode_enabled": false
  }
}
```

Qué hace cada parte:

| Clave | Qué define |
| --- | --- |
| `display_information.name` | El nombre de la app en Slack |
| `features.bot_user.display_name` | El nombre con el que el bot publica y con el que lo invitas (`@Nexus Leads`) |
| `oauth_config.scopes.bot` | Los permisos del bot |
| `settings.org_deploy_enabled` | `false`: la app se instala en un solo espacio de trabajo, no en toda una organización Enterprise |
| `settings.socket_mode_enabled` | `false`: n8n solo envía mensajes, no necesita recibir eventos por Socket Mode |

Y los dos permisos:

| Permiso | Para qué lo usa el flujo |
| --- | --- |
| `chat:write` | Publicar mensajes como el bot en los canales donde está invitado |
| `channels:read` | Ver la lista de canales públicos, para que n8n pueda mostrarlos y encontrar el canal por su nombre |

El nombre **Nexus Leads** es solo un ejemplo: cámbialo por el que quieras (por ejemplo, «Avisos n8n») en `name` y en `display_name`. Si cambias `display_name`, usa ese nombre al invitar al bot en el paso 6.

Pulsa **Next**, revisa el resumen y pulsa **Create**.

### 3. Instala la app en el espacio de trabajo

1. En la página de la app, ve a **Install App** (o **OAuth & Permissions**) y pulsa **Install to Workspace**.
2. Slack muestra qué permisos pide la app. Comprueba que son solo los dos del manifiesto y pulsa **Allow** (Permitir).

Al instalarla, Slack genera el token del bot.

### 4. Copia el Bot User OAuth Token

1. En la app, abre **OAuth & Permissions**.
2. En **OAuth Tokens**, copia el **Bot User OAuth Token**. Empieza por `xoxb-`:

   ```text
   xoxb-XXXXXXXXXXXX-XXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
   ```

Asegúrate de copiar el de **bot** (`xoxb-`). Si en esa pantalla aparece también un *User OAuth Token* (`xoxp-`), no es el que necesitas: ese actúa en nombre de tu usuario, no del bot.

### 5. Crea la credencial en n8n

1. En n8n, abre el nodo de Slack del flujo y elige **Create new credential**.
2. Elige **Slack API** (si n8n pregunta el método, **Access Token**).
3. Pega el token en **Access Token**. Deja vacío *Signature Secret*: solo lo usa el Slack Trigger para recibir eventos.
4. Pulsa **Save**. n8n prueba el token y marca la credencial como conectada.

Si ya creaste esta credencial para otra plantilla, selecciónala en lugar de crear otra.

### 6. Invita al bot al canal

Con `chat:write`, el bot solo puede publicar en los canales donde está. En Slack, abre el canal donde llegarán los avisos (por ejemplo, `#ventas`) y escribe:

```text
/invite @Nexus Leads
```

Repite en cada canal donde publique alguna de tus plantillas: alertas de errores, soporte, onboarding, pagos…

### 7. Prueba el flujo

En el nodo de Slack, comprueba que el canal es el correcto (`#ventas` o el que elijas en la lista) y pulsa **Test workflow**. En la plantilla de leads, envía un lead de prueba con datos ficticios, por ejemplo:

```json
{ "nombre": "Ana Pérez", "correo": "ana@ejemplo.com", "empresa": "Empresa Ejemplo" }
```

Deberías ver el mensaje del bot en el canal, con el nombre **Nexus Leads**, y una fila nueva en la hoja.

## Seguridad

- **El token `xoxb-` es una contraseña.** Con él, cualquiera puede publicar como el bot en tu espacio de trabajo y leer lo que sus permisos permitan. No lo compartas, no lo pegues en un nodo Code ni en notas del flujo, no lo muestres en capturas y no lo subas a ningún repositorio. Vive solo en la credencial de n8n.
- **Si se filtra, invalídalo.** En la app de Slack, ve a **OAuth & Permissions** y revoca los tokens; después reinstala la app (**Install to Workspace**) para generar uno nuevo y pégalo en la credencial **Slack API** de n8n. Hasta que lo actualices, los flujos que usan Slack fallarán con `invalid_auth`.
- **Pide solo los permisos necesarios.** Para publicar avisos bastan `chat:write` y `channels:read`. Añade otros (por ejemplo `groups:read` para canales privados) solo cuando un flujo lo necesite, y no uses un token de usuario (`xoxp-`) para un bot.
- **Compartir un flujo no comparte la credencial,** siempre que exportes el JSON sin datos de credenciales. Las plantillas de Moss Nexus pasan una prueba que lo garantiza.
- **Sin datos reales en ejemplos.** En capturas y pruebas usa datos ficticios (`ana@ejemplo.com`), sin tokens, IDs de espacio de trabajo ni nombres de clientes.
- **Retira lo que no uses.** Si dejas de usar la app, elimínala desde su página en [api.slack.com/apps](https://api.slack.com/apps) (*Basic Information → Delete App*): sus tokens dejan de funcionar.

## Lista de comprobación

- [ ] La app se creó en el espacio de trabajo correcto.
- [ ] El manifiesto pide solo `chat:write` y `channels:read` (más `groups:read` si publicas en canales privados).
- [ ] La app está instalada (**Install to Workspace**).
- [ ] Copiaste el **Bot User OAuth Token**, que empieza por `xoxb-`, no por `xoxp-`.
- [ ] La credencial **Slack API** de n8n tiene ese token y se guardó sin errores.
- [ ] El bot está invitado a cada canal donde publica (`/invite @Nexus Leads`).
- [ ] El token no aparece en el flujo, en notas, en capturas ni en ningún repositorio.

## Errores frecuentes

- **`not_in_channel`.** El bot no está en el canal. Escribe `/invite @Nexus Leads` dentro del canal y vuelve a ejecutar.
- **`channel_not_found`.** El nombre del canal está mal escrito (revisa mayúsculas, guiones y que lleve o no `#` según pida el nodo), o el canal es **privado** y el bot no está invitado. Para canales privados, invita al bot y añade también el permiso `groups:read`, que permite ver los canales privados donde está.
- **`invalid_auth` o `not_authed`.** El token está mal copiado (le falta un trozo o tiene espacios), fue revocado, o pegaste un token de usuario (`xoxp-`) en vez del de bot (`xoxb-`). Copia otra vez el **Bot User OAuth Token** de **OAuth & Permissions**.
- **`missing_scope`.** A la app le falta un permiso para lo que pide el flujo. Añádelo en **OAuth & Permissions → Scopes → Bot Token Scopes** (o en el manifiesto) y **reinstala la app**: los permisos nuevos solo se aplican después de reinstalarla. El token suele mantenerse, pero comprueba que la credencial de n8n tiene el actual.
- **La lista de canales sale vacía en n8n.** Falta `channels:read` (o `groups:read` para los privados). Mientras tanto, puedes escribir el canal por su nombre.
