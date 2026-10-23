---
title: n8n, de cero a producción
description: De instalar n8n y recibir el primer webhook a un flujo que reintenta, no duplica y avisa cuando falla. Termina copiando flujos listos en Moss Nexus.
type: route
level: intermedio
order: 1
nexus: true
tags: [n8n, automatización, webhooks, ruta]
technologies: [n8n, JavaScript]
createdAt: 2026-10-14
updatedAt: 2026-10-22
steps: [manual/n8n/instalar-n8n, manual/n8n/webhook-basico, lab/n8n-payload-builder, manual/n8n/entender-webhooks-y-triggers, lab/n8n-flow-simulator, manual/n8n/oauth2-de-google-en-n8n, manual/n8n/slack-en-n8n, manual/n8n/sincronizar-formulario-con-crm, manual/n8n/reporte-diario-automatico, manual/apis/idempotencia-en-pagos-y-webhooks, lab/retry-backoff, manual/n8n/orquestacion-y-manejo-de-errores]
---

## Para quién es

Para quien sabe qué quiere automatizar (un formulario que llegue al CRM, un reporte que se envíe solo) y quiere entender **cómo hacerlo bien**, no solo que funcione una vez. No hace falta haber usado n8n antes: el primer paso te ayuda a elegir entre n8n Cloud y Docker y a dejarlo instalado. Sí ayuda saber leer un poco de JSON.

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Recibir datos :: webhooks seguros
  - n8n instalado con Docker o en Cloud
  - Test URL y Production URL
  - validar antes de confiar
- Automatizar :: flujos de negocio reales
  - cuentas de Google con OAuth2
  - avisos en Slack con un bot
  - formulario al CRM sin duplicados
  - reporte diario a las 7:00
- Resistir fallos :: que nada se pierda
  - idempotencia
  - reintentos con jitter
- Enterarte :: cuando algo falla
  - Error Trigger y alertas
```

## Cómo seguirla

Los pasos alternan **guías** (el porqué y el cómo) con **demos** donde lo pruebas en el navegador. Marca cada paso como hecho al terminarlo: tu progreso se guarda en este navegador, y desde cualquier guía de la ruta verás qué viene después.

La ruta termina donde empieza el trabajo real: en Moss Nexus hay flujos ya armados que aplican estas mismas ideas.

## Practica con las plantillas probadas de Moss Nexus

Desde el paso 6 ya puedes correr flujos reales. Moss Nexus tiene **9 plantillas con el sello «Probado»**: se probaron en una instancia real de n8n (2.43.5) con datos ficticios y casos trampa. Cada una se copia y se pega en n8n; la tabla dice qué pasos de esta ruta necesitas antes.

| Plantilla | Nivel | Qué necesitas de la ruta |
| --- | --- | --- |
| [Agenda del día por correo](https://sergio-velandia.dev/Moss-Nexus/plantillas/agenda-diaria-calendar/) | Fácil | Paso 6: credenciales de Google Calendar y Gmail |
| [Reporte diario de ventas](https://sergio-velandia.dev/Moss-Nexus/plantillas/reporte-diario-ventas/) | Fácil | Paso 6 (Sheets y Gmail); el paso 9 explica la misma idea |
| [Facturas de proveedores de Gmail a Drive](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/) | Fácil | Paso 6: Gmail, Drive y Sheets |
| [Leads del formulario a Sheets con aviso en Slack](https://sergio-velandia.dev/Moss-Nexus/plantillas/leads-formulario-a-sheets/) | Fácil | Pasos 6 y 7: Sheets y el bot de Slack |
| [Cobranza de facturas vencidas](https://sergio-velandia.dev/Moss-Nexus/plantillas/cobranza-facturas-vencidas/) | Media | Pasos 6 y 9: Sheets, Gmail y un Schedule |
| [Onboarding de empleados](https://sergio-velandia.dev/Moss-Nexus/plantillas/onboarding-empleado/) | Media | Pasos 6 y 7: formulario, Sheets, Calendar, Gmail y Slack |
| [Alertas cuando falla cualquier flujo](https://sergio-velandia.dev/Moss-Nexus/plantillas/alertas-de-errores-n8n/) | Media | Paso 12, con los pasos 6 y 7 para el correo y Slack |
| [Resumen diario de correos con IA](https://sergio-velandia.dev/Moss-Nexus/plantillas/resumen-correos-con-ia/) | Avanzada | Pasos 6 y 7, más una clave de Gemini ([cómo usarla sin exponerla](/manual/apis/conectar-gemini)) |
| [Tickets de soporte clasificados con IA](https://sergio-velandia.dev/Moss-Nexus/plantillas/tickets-soporte-con-ia/) | Avanzada | Pasos 6 y 7, más una clave de Gemini |

```flow
# Del paso 6 a tu primer flujo real
Paso 6 :: cliente OAuth y credenciales de Google
Moss Nexus :: copia la plantilla y pégala en n8n
Credenciales :: elige las tuyas en cada nodo
+ Prueba el flujo :: el resultado llega a tu correo, tu hoja o tu canal
```

En palabras: después de crear las credenciales del paso 6 (y el bot del paso 7 si la plantilla usa Slack), copias la plantilla desde Moss Nexus, la pegas en n8n, eliges tus credenciales en cada nodo y la pruebas.

Si quieres empezar por lo más sencillo, las dos primeras arrancan con un Schedule Trigger y arman el mensaje en un nodo Code, como explica el paso 9, [Reporte diario automático](/manual/n8n/reporte-diario-automatico). Nexus tiene además 4 plantillas que todavía no se probaron: el sitio las marca como «Sin probar».
