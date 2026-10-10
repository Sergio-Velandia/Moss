---
title: Webhook básico en n8n
description: Cómo recibir datos de otra aplicación con el nodo Webhook de n8n, probarlos y responder.
type: manual
tags: [webhook, automatización, http]
technologies: [n8n]
createdAt: 2026-10-08
updatedAt: 2026-10-08
---

## Problema que resuelve

Quiero que una aplicación externa (un formulario, otro servicio, un script) dispare un flujo de n8n enviándole datos por HTTP.

## Pasos

1. Crea un flujo nuevo y añade el nodo **Webhook** como disparador.
2. Elige el método HTTP (por ejemplo `POST`) y un *path*, como `nuevo-contacto`.
3. En **Respond** decide cómo contestar: de inmediato, al terminar el flujo o con un nodo *Respond to Webhook*.
4. Conecta los nodos que procesarán los datos.

## Test URL vs Production URL

El nodo muestra dos direcciones y la diferencia importa:

| URL | Cuándo funciona |
| --- | --- |
| **Test URL** (`/webhook-test/...`) | Solo mientras pulsas *Listen for test event* en el editor. Muestra los datos en pantalla. |
| **Production URL** (`/webhook/...`) | Solo cuando el flujo está **activado**. |

## Probarlo con curl

```bash
curl -X POST "https://tu-n8n.example.com/webhook-test/nuevo-contacto" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Ada", "correo": "ada@example.com"}'
```

Los datos del cuerpo llegan en `body`. En un nodo posterior los lees con expresiones como `{{ $json.body.nombre }}`.

## Errores frecuentes

- **404 en la Production URL.** El flujo no está activado.
- **404 en la Test URL.** No pulsaste *Listen for test event* antes de enviar la petición, o ya recibió una.
- **Los datos llegan vacíos.** Falta el encabezado `Content-Type: application/json` o el método no coincide con el configurado.
- **Webhook sin protección.** Cualquiera que conozca la URL puede llamarla. Añade autenticación en el nodo o un token que valides en el flujo.
