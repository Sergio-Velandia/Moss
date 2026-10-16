---
title: n8n, de cero a producción
description: Del primer webhook a un flujo que reintenta, no duplica y avisa cuando falla. Termina copiando flujos listos en Moss Nexus.
type: route
level: intermedio
order: 1
nexus: true
tags: [n8n, automatización, webhooks, ruta]
technologies: [n8n, JavaScript]
createdAt: 2026-10-14
steps: [manual/n8n/webhook-basico, lab/n8n-payload-builder, manual/n8n/entender-webhooks-y-triggers, lab/n8n-flow-simulator, manual/n8n/oauth2-de-google-en-n8n, manual/n8n/sincronizar-formulario-con-crm, manual/n8n/reporte-diario-automatico, manual/apis/idempotencia-en-pagos-y-webhooks, lab/retry-backoff, manual/n8n/orquestacion-y-manejo-de-errores]
---

## Para quién es

Para quien sabe qué quiere automatizar (un formulario que llegue al CRM, un reporte que se envíe solo) y quiere entender **cómo hacerlo bien**, no solo que funcione una vez. No hace falta haber usado n8n antes; sí ayuda saber leer un poco de JSON.

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Recibir datos :: webhooks seguros
  - Test URL y Production URL
  - validar antes de confiar
- Automatizar :: flujos de negocio reales
  - cuentas de Google con OAuth2
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

## Practica con dos flujos fáciles

Después del paso 5, [Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2](/manual/n8n/oauth2-de-google-en-n8n), ya tienes lo necesario para correr un flujo real. Si quieres probar uno de **nivel fácil** antes de seguir, en Moss Nexus hay dos listos para copiar y pegar en n8n, de unos 20 minutos cada uno:

- **[Agenda del día por correo](https://sergio-velandia.github.io/Moss-Nexus/plantillas/agenda-diaria-calendar/):** cada mañana de lunes a viernes lee tus eventos de Google Calendar y te los envía por Gmail. Usa las credenciales de Google Calendar y Gmail de la guía.
- **[Reporte diario de ventas](https://sergio-velandia.github.io/Moss-Nexus/plantillas/reporte-diario-ventas/):** lee una hoja de Google Sheets y te envía por Gmail el resumen de las ventas de ayer. Además de Gmail, pide una credencial de Google Sheets: la misma guía explica qué APIs habilitar y cómo preparar la hoja.

```flow
# Del paso 5 a tu primer flujo real
Paso 5 :: cliente OAuth y credenciales de Google
Moss Nexus :: copia la plantilla y pégala en n8n
Credenciales :: elige las tuyas en cada nodo de Google
+ Prueba el flujo :: el correo llega a tu bandeja
```

Los dos flujos arrancan con un Schedule Trigger y arman el mensaje en un nodo Code. El paso 7, [Reporte diario automático](/manual/n8n/reporte-diario-automatico), explica esa misma idea en detalle.
