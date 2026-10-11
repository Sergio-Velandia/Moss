---
title: Entender webhooks y triggers en n8n
description: Cómo exponer un webhook público, capturar peticiones GET y POST desde otra aplicación y validar los datos de entrada antes de usarlos.
type: manual
tags: [webhook, trigger, http, seguridad, validación, automatización]
technologies: [n8n, JavaScript]
createdAt: 2026-10-11
related: [manual/n8n/webhook-basico, lab/n8n-payload-builder, manual/n8n/orquestacion-y-manejo-de-errores]
---

## Problema que resuelve

Un flujo de n8n no hace nada hasta que algo lo dispara. Ese "algo" es un **trigger**: un nodo que espera un evento y arranca la ejecución. Cuando el evento viene de fuera (un formulario, una app móvil, otro servicio que avisa de un pago), el trigger que necesito es el **Webhook**: una URL que, al recibir una petición HTTP, inicia el flujo con los datos de esa petición.

Esta guía amplía el [webhook básico](/manual/n8n/webhook-basico) con tres cosas: hacer que la URL sea accesible desde Internet, entender qué datos llegan y validarlos antes de confiar en ellos.

## Triggers: el punto de partida

Todo flujo empieza en un trigger. Los más comunes:

| Trigger | Se dispara cuando… |
| --- | --- |
| **Manual Trigger** | Pulsas *Execute workflow* en el editor. Solo para probar. |
| **Schedule Trigger** | Llega una hora o un intervalo (el equivalente a un cron). |
| **Webhook** | Una aplicación externa envía una petición HTTP a su URL. |
| **Triggers de apps** (Gmail, Telegram, GitHub…) | El servicio notifica un evento propio. Muchos usan un webhook por debajo. |

Un flujo solo reacciona a sus triggers automáticos (Schedule, Webhook, apps) cuando está **activado**. Mientras está desactivado, solo se ejecuta a mano desde el editor.

## Exponer el webhook a Internet

La URL del nodo solo sirve si la otra aplicación puede alcanzarla. Depende de dónde corre n8n:

- **n8n Cloud.** La instancia ya es pública con HTTPS. No hay nada que configurar.
- **Servidor propio.** n8n suele ir detrás de un proxy inverso (Nginx, Caddy, Traefik) que termina el HTTPS. Define la variable `WEBHOOK_URL` con la dirección pública; si no, n8n construye las URLs con `localhost` y el nodo muestra direcciones que nadie puede llamar.
- **En local, para desarrollar.** `localhost` no es accesible desde fuera. Usa un túnel (Cloudflare Tunnel, ngrok) que publique temporalmente tu puerto `5678` y pon la URL del túnel en `WEBHOOK_URL`.

```bash
# Ejemplo con Docker y una URL pública ya preparada
docker run -it --rm -p 5678:5678 \
  -e WEBHOOK_URL="https://n8n.example.com/" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

> Un túnel convierte tu máquina en un servidor público mientras está abierto. Ciérralo al terminar y protege el webhook (ver más abajo) aunque sea "solo para probar".

Recuerda la diferencia de URLs: la **Test URL** (`/webhook-test/...`) escucha una sola petición mientras pulsas *Listen for test event*; la **Production URL** (`/webhook/...`) funciona siempre que el flujo esté activado. La aplicación externa debe usar la de producción.

## Capturar GET y POST

En el nodo Webhook eliges el **HTTP Method**. Si necesitas aceptar varios, activa *Allow Multiple HTTP Methods* en los ajustes del nodo: cada método sale por su propia salida.

Cada petición se convierte en un item con esta forma:

```json
{
  "headers": { "content-type": "application/json", "x-api-key": "…" },
  "params": {},
  "query": {},
  "body": {}
}
```

### GET: los datos van en la URL

Útil para enlaces de confirmación o consultas simples.

```bash
curl "https://n8n.example.com/webhook/confirmar?token=abc123&lista=boletin"
```

Se leen en `query`: `{{ $json.query.token }}`.

### POST: los datos van en el cuerpo

Lo habitual para formularios y eventos de otros servicios.

```bash
curl -X POST "https://n8n.example.com/webhook/nuevo-contacto" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Ada", "correo": "ada@example.com", "plan": "pro"}'
```

Se leen en `body`: `{{ $json.body.correo }}`. Si el cuerpo llega vacío, casi siempre falta el encabezado `Content-Type: application/json`. Para construir y copiar cuerpos de prueba sin errores de sintaxis está el [generador de payloads](/laboratorio/n8n-payload-builder).

### Parámetros en la ruta

Un *Path* como `pedidos/:id` acepta `/webhook/pedidos/42` y deja el valor en `{{ $json.params.id }}`.

## Proteger la entrada

Cualquiera que conozca la URL puede llamarla. Elige al menos una de estas defensas:

1. **Autenticación del nodo.** En *Authentication* elige *Header Auth* (un encabezado con un secreto, por ejemplo `X-Api-Key`), *Basic Auth* o *JWT Auth*. Si la petición no trae la credencial correcta, n8n la rechaza antes de ejecutar el flujo.
2. **Firma del emisor.** Servicios como Stripe o GitHub firman cada petición con un HMAC del cuerpo. Activa la opción *Raw Body* para recibir el cuerpo exacto y compara la firma en un nodo Code. En n8n autoalojado, usar el módulo `crypto` en el nodo Code exige permitirlo con `NODE_FUNCTION_ALLOW_BUILTIN=crypto`.
3. **Lista de IPs.** La opción *IP(s) Whitelist* limita quién puede llamar, si el emisor publica sus direcciones.

El secreto vive en una **credencial** de n8n, nunca escrito en el flujo: los flujos se exportan y comparten como JSON, y el secreto viajaría con ellos.

## Validar los datos antes de usarlos

Que la petición esté autenticada no significa que los datos sean correctos. Antes de escribir en una base de datos o llamar a otra API, valida la forma de lo que llega. Un nodo **Code** en modo *Run Once for Each Item* justo después del Webhook:

```js
const body = $json.body ?? {}
const errores = []

const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : ''
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) errores.push('correo inválido')

const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
if (nombre.length === 0 || nombre.length > 100) errores.push('nombre vacío o demasiado largo')

const planes = ['free', 'pro', 'equipo']
const plan = planes.includes(body.plan) ? body.plan : 'free'

// Solo pasan los campos esperados: lo que sobre en el cuerpo se descarta
return {
  json: {
    valido: errores.length === 0,
    errores,
    datos: { nombre, correo, plan },
  },
}
```

Ideas que hay detrás:

- **Lista blanca de campos.** El resto del flujo usa `datos`, nunca `body` directamente. Si alguien envía campos extra (`esAdmin: true`), no llegan a ninguna parte.
- **Normalizar al entrar.** Recortar espacios y pasar el correo a minúsculas una sola vez evita duplicados más adelante.
- **Valores por defecto explícitos.** Un plan desconocido se convierte en `free` en lugar de propagarse.

Después, un nodo **If** sobre `{{ $json.valido }}` separa el camino feliz del de error.

## Responder al emisor

En *Respond* elige **Using 'Respond to Webhook' Node** si quieres decidir la respuesta según la validación:

- Rama válida → *Respond to Webhook* con código `200` o `201`.
- Rama inválida → *Respond to Webhook* con código `400`, *Respond With: JSON* y como cuerpo la expresión `{{ JSON.stringify({ errores: $json.errores }) }}`.

Así la aplicación externa sabe qué falló sin tener que mirar n8n. Si el proceso es largo, responde de inmediato (*Immediately*) y continúa en segundo plano: muchos emisores cortan la conexión a los pocos segundos y reintentan, lo que duplicaría el trabajo.

## Errores frecuentes

- **La URL muestra `localhost`.** Falta `WEBHOOK_URL` en una instalación propia.
- **Funciona en pruebas y no en producción.** La app externa usa la Test URL, o el flujo no está activado.
- **El cuerpo llega como texto.** El emisor no envía `Content-Type: application/json`.
- **Peticiones duplicadas.** El emisor reintenta porque la respuesta tarda. Responde antes y usa un identificador del evento para descartar repetidos.
- **Payload demasiado grande.** n8n limita el tamaño del cuerpo (16 MB por defecto, variable `N8N_PAYLOAD_SIZE_MAX`). Para archivos grandes, envía un enlace en vez del archivo.
