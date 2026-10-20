---
title: Orquestación y manejo de errores en n8n
description: Reintentos, ramas de error y un flujo de errores con Error Trigger para n8n 2.x, con alertas a Slack, Gmail, Discord o Telegram y un registro en Google Sheets que nunca apaga los avisos.
type: manual
tags: [errores, resiliencia, reintentos, alertas, slack, gmail, discord, telegram, orquestación]
technologies: [n8n]
createdAt: 2026-10-11
updatedAt: 2026-10-19
related: [manual/n8n/entender-webhooks-y-triggers, manual/n8n/slack-en-n8n, manual/n8n/oauth2-de-google-en-n8n, lab/n8n-flow-simulator, journal/migrando-scripts-a-n8n]
references: [Manejo de errores en n8n | https://docs.n8n.io/build/flow-logic/handle-errors-gracefully, Ajustes del flujo en n8n | https://docs.n8n.io/build/manage-workflows/configure-workflow-settings, Nodo Error Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/, Nodo Stop and Error | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/, Nodo Wait | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/, Nodo Discord | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.discord/, Nodo Telegram | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/, Discord: webhooks | https://discord.com/developers/docs/resources/webhook, Telegram: tutorial de bots | https://core.telegram.org/bots/tutorial, Nodo Slack | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack, Slack: chat.postMessage y sus errores | https://docs.slack.dev/reference/methods/chat.postMessage/, Nodo Gmail | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail, Nodo Google Sheets | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets]
---

## Problema que resuelve

Un flujo que funciona en el editor puede fallar en producción por causas ajenas a él: una API que devuelve `503`, un token caducado, un dato con un formato inesperado. Si nadie se entera, el fallo es silencioso: el cliente no recibe su correo, el pedido no se registra y lo descubro días después.

La resiliencia en n8n se construye en tres capas, de la más cercana al fallo a la más lejana:

| Capa | Dónde se configura | Para qué |
| --- | --- | --- |
| **Reintentos** | Ajustes de cada nodo | Superar fallos pasajeros sin intervención. |
| **Ramas de error** | Ajustes de cada nodo (*On Error*) | Reaccionar dentro del mismo flujo a un fallo esperado. |
| **Flujo de errores** | Ajustes del flujo + nodo *Error Trigger* | Enterarse de cualquier fallo no controlado y avisar. |

```flow
# El recorrido de un fallo
! Un nodo falla :: por ejemplo, una API responde 503
Reintentos :: Retry On Fail vuelve a intentarlo
Rama de error :: maneja los fallos esperados
Error workflow :: Error Trigger recibe el resto
+ Alerta :: Slack, correo, Discord o Telegram con el enlace a la ejecución
```

## Capa 1: reintentos automáticos

En la pestaña **Settings** de cualquier nodo:

- **Retry On Fail:** activado.
- **Max Tries:** número de intentos (por defecto 3, máximo 5).
- **Wait Between Tries (ms):** pausa entre intentos (por defecto 1000, máximo 5000).

Úsalo en nodos que hablan con el exterior: *HTTP Request*, bases de datos, APIs de terceros. No lo uses en nodos cuyo fallo es determinista (un Code con un error de lógica falla igual las cinco veces).

> **Cuidado con los efectos secundarios.** Reintentar un `POST` que crea un pago o envía un correo puede duplicarlo si el primer intento sí llegó y solo falló la respuesta. Para esas llamadas, envía una clave de idempotencia (muchas APIs aceptan un encabezado `Idempotency-Key`) o comprueba antes si la operación ya existe.

### Reintentos con espera creciente

Cinco segundos de espera máxima no bastan para una API caída unos minutos. Para eso construyo el reintento con nodos:

1. El nodo *HTTP Request* con **On Error → Continue (using error output)**.
2. La salida de error va a un nodo **Wait** cuya duración crece con cada vuelta, por ejemplo `{{ 30 * 2 ** ($runIndex) }}` segundos (30, 60, 120…).
3. Un **If** comprueba `{{ $runIndex < 4 }}`: si quedan intentos, vuelve al *HTTP Request*; si no, pasa a un **Stop and Error**.

`$runIndex` cuenta cuántas veces se ha ejecutado ya el nodo en esta ejecución, así que el bucle sabe en qué vuelta está.

## Capa 2: ramas de error dentro del flujo

El ajuste **On Error** de cada nodo decide qué pasa cuando falla:

| Opción | Comportamiento |
| --- | --- |
| **Stop Workflow** (por defecto) | La ejecución termina con error. Dispara el flujo de errores. |
| **Continue** | Sigue con el siguiente nodo como si nada, pasando los datos de entrada. Útil para pasos opcionales. |
| **Continue (using error output)** | El nodo gana una segunda salida por la que salen los items que fallaron, con el mensaje de error. |

La tercera es la más útil: permite manejar el fallo esperado (por ejemplo, guardar el lead en una hoja "pendientes" si el CRM no responde) sin perder los datos.

Cuando detecto un problema que n8n no considera error (una API responde `200` con `{"ok": false}`), lo convierto en uno con el nodo **Stop and Error**. Así el fallo no pasa desapercibido y sigue el mismo camino que cualquier otro.

## Capa 3: el flujo de errores con Error Trigger

Es la red de seguridad: un flujo aparte que se ejecuta cada vez que **otro** flujo falla.

### Crearlo

Los pasos y los nombres de menú son los de n8n 2.x, donde «activar» un flujo pasó a llamarse **publicar**.

1. Crea un flujo nuevo llamado, por ejemplo, `Alertas de errores`.
2. Añade el nodo **Error Trigger** como disparador y guarda. **El flujo de alertas no necesita publicarse:** n8n lo llama igual cuando otro flujo falla. Lo comprobé en n8n 2.43.5 con el flujo de alertas sin publicar, y la alerta llegó.
3. Conecta detrás los nodos de notificación (ver [Enviar la alerta](#enviar-la-alerta)).
4. En cada flujo que quieras vigilar: menú **⋯ → Settings → Error Workflow (to notify when this one errors)** → elige `Alertas de errores` → **Save**.
5. **El flujo vigilado sí tiene que estar publicado.** El flujo de errores solo se llama cuando falla una ejecución automática, y un flujo sin publicar solo se ejecuta a mano.

Un mismo flujo de errores puede vigilar a todos los demás.

> **«Execute» no dispara alertas.** El Error Trigger solo se ejecuta cuando falla una ejecución automática (un Schedule, un webhook de producción, otro trigger). Si pulsas *Execute* en el editor y el flujo falla, no llega nada. Fue justo lo que me confundió en la primera prueba: el flujo de prueba lo estaba ejecutando a mano.

### Marcar los flujos críticos

No todos los fallos merecen la misma urgencia. Una convención simple: añade **«[crítico]»** al nombre de los flujos importantes, por ejemplo `Facturas a Drive [crítico]`. El flujo de alertas lee `{{ $json.workflow.name }}` y puede decidir con un **If** si además escribe por correo o menciona a todo el canal. Esta condición del **If** (tipo *Boolean*, «is true») quita las tildes y pasa a minúsculas antes de comparar, así que `[crítico]`, `[critico]` y `[CRÍTICO]` cuentan igual:

```text
{{ $json.workflow.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('[critico]') }}
```

### Probar el flujo de errores sin esperar un fallo real

- **Fetch Test Event** (en el nodo Error Trigger) carga un ejemplo de los datos que llegan. Sirve para armar el mensaje, pero su enlace de ejecución es de ejemplo (`/execution/workflow/1/231`) y da 404: es normal.
- **Prueba real:** crea un flujo con un **Schedule Trigger** cada minuto y, detrás, un nodo **Code** con `throw new Error('Prueba de alertas')`. Asígnale `Alertas de errores` como Error Workflow y **publícalo**. En un minuto llega la primera alerta.
- **Despublícalo al terminar, o enviará una alerta cada minuto.**

### Qué datos recibe

```json
{
  "execution": {
    "id": "231",
    "url": "https://n8n.example.com/workflow/1/executions/231",
    "retryOf": "34",
    "error": {
      "message": "The service is receiving too many requests from you",
      "stack": "…"
    },
    "lastNodeExecuted": "HTTP Request",
    "mode": "trigger"
  },
  "workflow": {
    "id": "1",
    "name": "Nuevo contacto → CRM"
  }
}
```

- `execution.url` lleva directo a la ejecución fallida para revisarla. Igual que `execution.id`, solo llega si la ejecución quedó guardada: en los ajustes del flujo vigilado, deja activado **Save failed production executions**.
- `retryOf` solo aparece si la ejecución era un reintento de otra.
- Si el fallo ocurre en el propio trigger del flujo vigilado, no hay ejecución completa: los datos llegan en un objeto `trigger` en lugar de `execution`. Usa `$json.execution?.error?.message ?? $json.trigger?.error?.message` para cubrir ambos casos.

## Enviar la alerta

El mensaje es el mismo en todos los canales; cambia solo el nodo que lo envía:

```text
🚨 Falló «{{ $json.workflow.name }}»
Nodo: {{ $json.execution.lastNodeExecuted }}
Error: {{ $json.execution.error.message }}
Ver ejecución: {{ $json.execution.url }}
```

### Slack

1. Crea un canal para las alertas, por ejemplo `#alertas`.
2. Crea la app de Slack y la credencial **Slack API** de n8n como se explica en [Conectar Slack a n8n con un bot](/manual/n8n/slack-en-n8n).
3. **Invita al bot al canal:** escribe `/invite @tu-bot` dentro de `#alertas`. Si no lo haces, Slack responde `not_in_channel` y la alerta no se publica.
4. Nodo **Slack → Send Message** al canal `#alertas`, con el mensaje de arriba.

Para los flujos marcados como críticos, puedes añadir `<!channel>` al principio del texto: Slack avisa a todos los miembros del canal.

### Gmail

1. Crea la credencial **Gmail OAuth2 API** como se explica en [Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2](/manual/n8n/oauth2-de-google-en-n8n).
2. Nodo **Gmail → Send** a tu correo, con el nombre del flujo en el asunto y el mensaje de arriba en el cuerpo.

Si tu app de Google está en modo *Testing*, **el token caduca a los siete días** y el correo deja de salir sin avisar. Por eso conviene que el correo no sea el único canal.

### Registrar los errores en Google Sheets

Una hoja con una fila por fallo (fecha, flujo, nodo, error y enlace) sirve para ver qué se rompe más a menudo. Pero **el registro nunca debe apagar las alertas**: si la hoja falla (una pestaña renombrada, un permiso que se quitó, un token caducado), el aviso tiene que llegar igual.

```flow
# Que la hoja no apague las alertas
Error Trigger :: recibe el fallo
Registrar en Sheets :: On Error, Continue (using error output)
+ Alertas :: Slack y correo, salga bien o mal el registro | ! Salida de error :: aviso en Slack de que no se pudo registrar
```

En palabras: el Error Trigger recibe el fallo y lo registra en Google Sheets. En los ajustes del nodo de Sheets, **On Error** está en **Continue (using error output)**: si el registro falla, el flujo sigue por una salida de error que envía un aviso a Slack («no pude registrar este error»), y las alertas normales se envían igual.

En la práctica: conecta las alertas **en paralelo** al registro, no detrás de él, o haz que salgan de las dos salidas del nodo de Sheets.

### Discord

La forma más simple no necesita bot: un **webhook de canal**.

1. En Discord: *Ajustes del canal → Integraciones → Webhooks → Nuevo webhook* y copia la URL.
2. En n8n, guarda la URL como credencial o usa el nodo **Discord** con la opción *Webhook*.
3. Usa el mensaje de arriba.

Con un *HTTP Request* el equivalente es un `POST` a la URL del webhook con el cuerpo `{"content": "…"}`.

### Telegram

1. Crea un bot hablando con **@BotFather** y guarda el token como credencial de Telegram en n8n.
2. Escribe al bot (o añádelo a un grupo) y obtén el `chat_id`. Un modo rápido: un flujo temporal con *Telegram Trigger* que muestre `{{ $json.message.chat.id }}` al recibir un mensaje.
3. Nodo **Telegram → Send Message** con ese `chat_id` y el mismo mensaje.

Envía el mensaje como texto plano. Si activas el modo Markdown, un mensaje de error con `_` o `*` (muy comunes en trazas y nombres de variables) puede hacer que Telegram rechace el envío, y la alerta falla justo cuando más falta hace.

### Que la alerta no falle

El flujo de errores también puede fallar (el token de Google caducó, Slack no responde, el bot salió del canal). Dos precauciones:

- Activa **Retry On Fail** en el nodo de notificación.
- Envía la alerta por **dos canales** en paralelo (por ejemplo, Slack y correo). Si uno cae, el otro llega.

### Limitaciones

- **El flujo de alertas no tiene red propia.** Si se cae (por ejemplo, Slack no responde y era el único canal), ningún otro flujo te avisa. Por eso los dos canales en paralelo y el registro que no bloquea.
- **No le asignes a mano otro Error workflow ni a sí mismo; si el flujo de alertas falla, nadie avisa.** La documentación de n8n indica que un flujo con Error Trigger se usa a sí mismo como flujo de errores por defecto.
- **Solo vigila lo que se ejecuta automáticamente.** Las pruebas con *Execute* no generan alertas.

## Volver a ejecutar lo que falló

En la lista de **Executions** de un flujo, las ejecuciones fallidas tienen la opción **Retry**:

- **Retry with currently saved workflow:** reintenta con la versión actual del flujo. La que uso después de corregir un error.
- **Retry with original workflow:** reintenta con la versión que falló. Útil si el fallo fue externo y el flujo no cambió.

El reintento parte del nodo que falló con los datos que tenía, no desde el principio.

## Lista de comprobación para un flujo crítico

- [ ] Los nodos que llaman al exterior tienen **Retry On Fail**.
- [ ] Las llamadas con efectos secundarios usan una clave de idempotencia.
- [ ] Los fallos esperados tienen su rama con **Continue (using error output)**.
- [ ] Las respuestas "exitosas pero incorrectas" se convierten en error con **Stop and Error**.
- [ ] El flujo tiene asignado un **Error Workflow** en sus ajustes (⋯ → Settings).
- [ ] El flujo vigilado está **publicado** (el de alertas no lo necesita).
- [ ] **Save failed production executions** está activado, para que la alerta traiga el enlace a la ejecución.
- [ ] Los flujos importantes llevan **[crítico]** en el nombre.
- [ ] La alerta incluye el nombre del flujo, el nodo, el mensaje y el enlace a la ejecución.
- [ ] La alerta sale por dos canales, y el registro en la hoja no puede apagarla.
- [ ] Si uso Slack, el bot está invitado al canal de alertas.
- [ ] Probé la alerta con un flujo publicado que falla de verdad (no con *Execute*), y **lo despubliqué al terminar**.

## Errores frecuentes

- **No llega ninguna alerta.** El flujo vigilado no tiene asignado el *Error Workflow*, no está publicado, o lo probaste con *Execute* (las ejecuciones manuales no disparan alertas).
- **`not_in_channel` en el nodo de Slack.** El bot no está en el canal: escribe `/invite @tu-bot` dentro de `#alertas`.
- **El enlace de Fetch Test Event da 404.** Es un ejemplo (`/execution/workflow/1/231`), no una ejecución real.
- **Una alerta cada minuto.** Se quedó publicado el flujo de prueba con el Schedule: despublícalo.
- **El correo dejó de llegar a la semana.** El token de Google caducó por el modo *Testing* (siete días).
- **Llegan alertas duplicadas.** Varios flujos de errores asignados en sitios distintos, o el reintento del nodo de alerta duplica mensajes que sí se enviaron.
- **`execution` es `undefined` en la alerta.** El fallo ocurrió en el trigger; usa la expresión con `trigger` como respaldo.
- **El bucle de reintentos no termina.** Falta el **If** que limita el número de vueltas.
