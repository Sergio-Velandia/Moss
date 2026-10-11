---
title: Orquestación y manejo de errores en n8n
description: Flujos de contingencia con Error Trigger, reintentos automáticos y alertas a Discord o Telegram cuando falla un proceso crítico.
type: manual
tags: [errores, resiliencia, reintentos, alertas, discord, telegram, orquestación]
technologies: [n8n]
createdAt: 2026-10-11
related: [manual/n8n/entender-webhooks-y-triggers, lab/n8n-flow-simulator, journal/migrando-scripts-a-n8n]
references: [Manejo de errores en n8n | https://docs.n8n.io/flow-logic/error-handling/, Nodo Error Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/, Nodo Stop and Error | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/, Nodo Wait | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/, Nodo Discord | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.discord/, Nodo Telegram | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/, Discord: webhooks | https://discord.com/developers/docs/resources/webhook, Telegram: tutorial de bots | https://core.telegram.org/bots/tutorial]
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
+ Alerta :: Discord y Telegram con el enlace a la ejecución
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

1. Crea un flujo nuevo llamado, por ejemplo, `⚠️ Alertas de errores`.
2. Añade el nodo **Error Trigger** como disparador. No hace falta activar este flujo.
3. Conecta detrás los nodos de notificación (ver más abajo).
4. En cada flujo crítico, abre **Workflow Settings → Error workflow** y elige `⚠️ Alertas de errores`.

Un mismo flujo de errores puede vigilar a todos los demás.

> El Error Trigger solo se dispara en ejecuciones automáticas (por un trigger o un webhook de producción). Si ejecutas el flujo a mano desde el editor y falla, no recibirás alerta. Para probar la alerta, activa el flujo y provoca el fallo desde fuera.

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

- `execution.url` lleva directo a la ejecución fallida para revisarla.
- `retryOf` solo aparece si la ejecución era un reintento de otra.
- Si el fallo ocurre en el propio trigger del flujo vigilado, no hay ejecución completa: los datos llegan en un objeto `trigger` en lugar de `execution`. Usa `$json.execution?.error?.message ?? $json.trigger?.error?.message` para cubrir ambos casos.

## Enviar la alerta

### Discord

La forma más simple no necesita bot: un **webhook de canal**.

1. En Discord: *Ajustes del canal → Integraciones → Webhooks → Nuevo webhook* y copia la URL.
2. En n8n, guarda la URL como credencial o usa el nodo **Discord** con la opción *Webhook*.
3. Mensaje:

```text
🚨 Falló «{{ $json.workflow.name }}»
Nodo: {{ $json.execution.lastNodeExecuted }}
Error: {{ $json.execution.error.message }}
Ver ejecución: {{ $json.execution.url }}
```

Con un *HTTP Request* el equivalente es un `POST` a la URL del webhook con el cuerpo `{"content": "…"}`.

### Telegram

1. Crea un bot hablando con **@BotFather** y guarda el token como credencial de Telegram en n8n.
2. Escribe al bot (o añádelo a un grupo) y obtén el `chat_id`. Un modo rápido: un flujo temporal con *Telegram Trigger* que muestre `{{ $json.message.chat.id }}` al recibir un mensaje.
3. Nodo **Telegram → Send Message** con ese `chat_id` y el mismo texto que en Discord.

Envía el mensaje como texto plano. Si activas el modo Markdown, un mensaje de error con `_` o `*` (muy comunes en trazas y nombres de variables) puede hacer que Telegram rechace el envío, y la alerta falla justo cuando más falta hace.

### Que la alerta no falle

El flujo de errores también puede fallar (el token de Telegram caducó, Discord no responde). Dos precauciones:

- Activa **Retry On Fail** en el nodo de notificación.
- Envía la alerta por **dos canales** en paralelo (Discord y Telegram, o uno de ellos y un correo). Si uno cae, el otro llega.

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
- [ ] El flujo tiene asignado un **Error workflow** en sus ajustes.
- [ ] La alerta incluye el nombre del flujo, el nodo, el mensaje y el enlace a la ejecución.
- [ ] Probé la alerta con el flujo activado, provocando un fallo real.

## Errores frecuentes

- **No llega ninguna alerta.** El flujo vigilado no tiene asignado el *Error workflow*, o lo probaste con una ejecución manual.
- **Llegan alertas duplicadas.** Varios flujos de errores asignados en sitios distintos, o el reintento del nodo de alerta duplica mensajes que sí se enviaron.
- **`execution` es `undefined` en la alerta.** El fallo ocurrió en el trigger; usa la expresión con `trigger` como respaldo.
- **El bucle de reintentos no termina.** Falta el **If** que limita el número de vueltas.
