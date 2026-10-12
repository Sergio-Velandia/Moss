---
title: Reporte diario automático por correo o Slack
description: Un flujo que cada mañana consulta la base de datos, arma un resumen legible y lo envía, incluso los días sin datos.
type: manual
tags: [reportes, schedule, automatización, slack, correo, zona horaria, negocio]
technologies: [n8n, SQL]
createdAt: 2026-10-12
related: [manual/sql/reporte-mensual-con-variacion, manual/n8n/orquestacion-y-manejo-de-errores, journal/el-reporte-que-nadie-queria-hacer]
references: [Nodo Schedule Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/, Nodo MySQL | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mysql/, Nodo Send Email | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail/, Nodo Slack | https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/, Ajustes del flujo (zona horaria) | https://docs.n8n.io/workflows/settings/, Zona horaria de la instancia | https://docs.n8n.io/hosting/configuration/environment-variables/timezone-localization/]
---

## Problema que resuelve

Cada mañana alguien abre el sistema, exporta las ventas de ayer, cuenta los pedidos pendientes y escribe un mensaje al equipo. Son quince minutos diarios, dependen de que esa persona no esté de vacaciones y, cuando hay prisa, el mensaje no sale. Este flujo hace exactamente eso, a la misma hora, todos los días.

```flow
# El flujo completo
Schedule Trigger :: todos los días a las 7:00
MySQL :: ventas y pendientes de ayer
Code :: arma el resumen en texto
Slack :: canal del equipo | Send Email :: gerencia
```

## 1. El disparador: Schedule Trigger

- **Trigger Interval:** Days, cada 1 día, a la hora 7 y minuto 0.
- Para entre semana solamente, usa el modo **Custom (Cron)** con `0 7 * * 1-5` (a las 7:00, de lunes a viernes).

> **La hora depende de la zona horaria.** El Schedule Trigger usa la zona del flujo (*Workflow Settings → Timezone*) y, si no está definida, la de la instancia (variable `GENERIC_TIMEZONE` en n8n autoalojado). Un servidor en UTC enviará el "reporte de las 7" a las 2 de la madrugada en Colombia. Fija `America/Bogota` (o la tuya) en los ajustes del flujo.

## 2. La consulta

Nodo **MySQL → Execute SQL**. Una sola consulta que devuelve una fila con todo lo necesario es más fácil de mantener que varias:

```sql
SELECT
  COUNT(*) AS pedidos,
  COALESCE(SUM(total), 0) AS ventas,
  COALESCE(SUM(estado = 'pendiente'), 0) AS pendientes,
  COALESCE(MAX(total), 0) AS pedido_mayor
FROM pedidos
WHERE creado_en >= CURDATE() - INTERVAL 1 DAY
  AND creado_en < CURDATE();
```

`SUM(estado = 'pendiente')` funciona en MySQL porque la comparación vale 1 o 0. Usa un **usuario de base de datos de solo lectura** para este flujo: un reporte nunca debería poder modificar datos.

## 3. El resumen

Nodo **Code** en modo *Run Once for All Items*:

```js
const r = $input.first().json
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const ayer = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota',
}).format(Date.now() - 24 * 60 * 60 * 1000)

const lineas = [
  `Resumen del ${ayer}`,
  `• Ventas: ${pesos.format(Number(r.ventas))} en ${r.pedidos} pedidos`,
  `• Pedido más grande: ${pesos.format(Number(r.pedido_mayor))}`,
  r.pendientes > 0 ? `• ⚠️ ${r.pendientes} pedidos siguen pendientes` : '• Sin pedidos pendientes',
]

return [{ json: { texto: lineas.join('\n') } }]
```

`Number(...)` es necesario porque los `DECIMAL` de MySQL suelen llegar como texto para no perder precisión.

## 4. El envío

Conecta la salida del Code a los dos canales en paralelo:

- **Slack → Send Message** al canal del equipo, con el texto `{{ $json.texto }}`.
- **Send Email** (SMTP) o **Gmail** a gerencia, con el asunto `Resumen de ventas · {{ $now.setZone('America/Bogota').toFormat('dd/MM/yyyy') }}`.

## El día que no hay datos

Si una consulta no devuelve filas, n8n **no ejecuta los nodos siguientes**: el reporte simplemente no llega, y el silencio se confunde con "todo bien". La consulta de arriba siempre devuelve una fila (los agregados sin `GROUP BY` dan 0), pero si la cambias por una que lista pedidos, activa **Always Output Data** en los ajustes del nodo MySQL y maneja el caso vacío en el Code.

Asígnale además un **Error workflow** (ver [orquestación y manejo de errores](/manual/n8n/orquestacion-y-manejo-de-errores)): si la base de datos no responde, alguien debe enterarse de que hoy no hubo reporte.

## Errores frecuentes

- **El reporte llega de madrugada.** Falta la zona horaria del flujo.
- **"Ayer" en UTC.** `CURDATE()` usa la zona de la sesión de MySQL. Si el servidor está en UTC, ajusta con `CONVERT_TZ` o calcula el rango en n8n y pásalo a la consulta.
- **Números como texto.** Sumar `"125000.00" + "300"` concatena. Convierte con `Number()`.
- **Mensajes que nadie lee.** Un reporte con 40 cifras se ignora. Empieza por las tres que llevan a una decisión y añade el resto solo si alguien lo pide.
