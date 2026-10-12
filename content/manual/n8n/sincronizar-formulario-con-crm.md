---
title: Sincronizar un formulario con el CRM sin duplicados
description: Cada lead del formulario web llega al CRM normalizado, actualiza al contacto si ya existía y avisa a ventas solo cuando es nuevo.
type: manual
tags: [crm, leads, formularios, duplicados, google sheets, hubspot, negocio]
technologies: [n8n, JavaScript]
createdAt: 2026-10-12
related: [manual/sql/detectar-y-fusionar-clientes-duplicados, manual/n8n/entender-webhooks-y-triggers, lab/n8n-payload-builder]
references: [Nodo n8n Form Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/, Nodo Google Sheets | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/, Nodo HubSpot | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hubspot/, Nodo If | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/, Nodo Slack | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/]
---

## Problema que resuelve

El formulario de contacto de la web envía un correo a una bandeja compartida. Alguien lo copia al CRM cuando tiene tiempo, a veces dos veces, a veces nunca. Los leads se enfrían y ventas no sabe si "Ana Pérez" ya había escrito el mes pasado.

El flujo de esta guía lleva cada envío al CRM en segundos, sin duplicar contactos.

```flow
# Del formulario al CRM
Formulario :: Webhook o n8n Form Trigger
Code :: normaliza correo, teléfono y nombre
Buscar contacto :: por correo normalizado
? ¿Ya existe?
Actualizar contacto :: añade la nueva consulta | + Crear contacto :: y avisar a ventas
```

## 1. Recibir el formulario

Dos opciones:

- **n8n Form Trigger** si el formulario puede vivir en n8n: genera la página y valida los campos obligatorios.
- **Webhook** si el formulario ya existe en tu web (ver [webhooks y triggers](/manual/n8n/entender-webhooks-y-triggers)). Protégelo con *Header Auth* para que nadie llene el CRM de basura.

## 2. Normalizar al entrar

La clave para no duplicar es comparar siempre la misma forma del dato. Nodo **Code** en modo *Run Once for Each Item*:

```js
const b = $json.body ?? $json
const limpio = (s) => (typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : '')

const correo = limpio(b.correo).toLowerCase()
const digitos = limpio(b.telefono).replace(/\D/g, '')

return {
  json: {
    correo,
    // Colombia: los últimos 10 dígitos son el número móvil; ajústalo a tu país
    telefono: digitos.length >= 10 ? `+57${digitos.slice(-10)}` : '',
    // "ÁNGELA pérez" → "Ángela Pérez". \b no sirve aquí: solo entiende letras sin tilde
    nombre: limpio(b.nombre).toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, sep, l) => sep + l.toUpperCase()),
    empresa: limpio(b.empresa),
    mensaje: limpio(b.mensaje).slice(0, 2000),
    origen: limpio(b.origen) || 'web',
    recibido: new Date().toISOString(),
  },
}
```

Si `correo` queda vacío o no tiene formato válido, detén el flujo con un **If** y responde con un error, como en la guía de webhooks. Un lead sin forma de contactarlo no sirve.

## 3. Buscar antes de crear

### Con Google Sheets como CRM (equipos pequeños)

1. **Google Sheets → Get Row(s)** con el filtro `correo` = `{{ $json.correo }}`.
2. En los ajustes del nodo activa **Always Output Data**. Sin ella, cuando no encuentra al contacto el nodo no devuelve nada y el flujo se detiene justo en el caso que más importa: el lead nuevo.
3. **If** `{{ $json.correo }}` *is not empty*:
   - **Sí, existe:** *Update Row* usando `correo` como columna de coincidencia, y añade la nueva consulta a una columna de historial.
   - **No existe:** *Append Row* y después avisa a ventas.

### Con HubSpot u otro CRM

Muchos CRM ofrecen **crear o actualizar** en una sola operación usando el correo como clave (en el nodo de HubSpot, *Contact → Create or Update*). Úsala: evita la carrera que se explica más abajo. Para saber si el contacto era nuevo, compara la fecha de creación que devuelve con la actual.

## 4. Avisar a ventas, solo si es nuevo

**Slack → Send Message** al canal de ventas:

```text
Nuevo lead: {{ $json.nombre }} ({{ $json.empresa || 'sin empresa' }})
{{ $json.correo }} · {{ $json.telefono || 'sin teléfono' }}
"{{ $json.mensaje }}"
```

Avisar también de los contactos que ya existían genera ruido y el canal se termina silenciando.

## La carrera de los dos envíos

Si alguien pulsa "Enviar" dos veces, llegan dos ejecuciones casi a la vez. Las dos buscan, ninguna encuentra al contacto (la otra aún no lo ha creado) y **las dos lo crean**. Buscar y luego crear no es atómico. Las defensas, de mejor a peor:

1. **Crear o actualizar en una sola operación** del CRM, que sí es atómica.
2. **Una restricción única** en la base de datos, si el destino es tu propia tabla (ver [detectar y fusionar duplicados](/manual/sql/detectar-y-fusionar-clientes-duplicados)): el segundo `INSERT` falla y se convierte en actualización.
3. **Desactivar el botón** del formulario tras el primer clic. Ayuda, pero no protege de reintentos de red.

## Errores frecuentes

- **Comparar sin normalizar.** `Ana@Empresa.com` y `ana@empresa.com ` son dos contactos para una búsqueda exacta.
- **Olvidar Always Output Data.** El lead nuevo, el más valioso, es justo el que se pierde.
- **Guardar el teléfono tal cual.** Sin un formato único (`+573001234567`) no se puede buscar ni enlazar con WhatsApp.
- **Exponer el CRM.** El flujo usa una credencial con permisos mínimos: crear y actualizar contactos, nada más.
