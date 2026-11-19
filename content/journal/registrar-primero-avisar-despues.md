---
title: Registrar primero, avisar después
description: En cuatro plantillas de Moss Nexus, un aviso que fallaba detenía el flujo antes de dejar el registro. El arreglo fue cambiar el orden, y una prueba que impide volver atrás.
type: journal
category: Arquitectura
tags: [n8n, moss nexus, orden de ejecución, registros, avisos, pruebas]
technologies: [n8n, Google Sheets, Slack]
createdAt: 2026-11-18
image: og/registrar-primero-avisar-despues.png
imageAlt: Tarjeta de Moss Bitácora con el título «Registrar primero, avisar después» y dos flujos. Antes, el aviso falla y el registro nunca llega. Después, el registro va primero y el aviso sale de él.
related: [manual/n8n/orquestacion-y-manejo-de-errores, journal/cuando-un-webhook-llega-dos-veces, project/moss-nexus]
---

## El síntoma

Llega un ingreso nuevo por el formulario. Slack falla, o la credencial de Gmail venció, y la ejecución se detiene en ese nodo. Lo que se ve después es una hoja de ingresos a la que le falta una fila, y nada más: nadie sabe que esa persona entró.

El aviso era lo secundario y el registro, lo importante. Pero el flujo los tenía al revés.

## Dónde estaba

En cuatro plantillas de [Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/), con el mismo defecto:

| Plantilla | Qué fallaba | Qué se perdía |
| --- | --- | --- |
| [Onboarding de empleados](https://sergio-velandia.dev/Moss-Nexus/plantillas/onboarding-empleado/) | Slack, Gmail o Calendar | El ingreso |
| [Tickets de soporte con IA](https://sergio-velandia.dev/Moss-Nexus/plantillas/tickets-soporte-con-ia/) | Un aviso de Slack | Los tickets de ese lote |
| [Cobranza de facturas vencidas](https://sergio-velandia.dev/Moss-Nexus/plantillas/cobranza-facturas-vencidas/) | Una factura sin correo | Lo que ya se había enviado |
| [Aprobación de gastos](https://sergio-velandia.dev/Moss-Nexus/plantillas/aprobacion-de-gastos/) | El correo de aprobación | La solicitud entera |

Las tres primeras aparecieron una por una, entre el 19 y el 22 de octubre. El mismo 22 revisé las 13 plantillas con una sola pregunta: ¿un aviso o una acción secundaria que falla puede impedir el registro? Once ya registraban antes de avisar, o no registran nada. Las otras dos eran aprobación de gastos y una variante: en [Facturas de Gmail a Drive](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/), si fallaba la subida a Drive, la factura no se registraba y el trigger no volvía a tomar ese correo.

Antes de todo eso había aparecido el caso al revés. En [Alertas de errores](https://sergio-velandia.dev/Moss-Nexus/plantillas/alertas-de-errores-n8n/), si fallaba la hoja de registro, no llegaba ninguna alerta.

## Antes y después

```flow
# Antes: el aviso puede tumbar el registro
Formulario :: llega el ingreso
Preparar datos
! Avisos :: Slack, Gmail o Calendar fallan
Registrar ingreso :: nunca se ejecuta
```

```flow
# Después: el registro va primero
Formulario :: llega el ingreso
Preparar datos
+ Registrar ingreso :: la fila queda escrita
Bienvenida :: correo | Checklist :: al responsable | Anuncio :: en Slack
```

En palabras: antes, los avisos salían de «Preparar datos» y el registro iba al final. En n8n, un nodo que falla detiene la ejecución, así que bastaba con que fallara un aviso para que la fila nunca se escribiera. Después, «Preparar datos» conecta solo con «Registrar ingreso», y los avisos salen del registro. Si uno falla, la fila ya está escrita.

## Dos formas de arreglarlo

1. **Dejar el orden y que el aviso no detenga nada.** En n8n, cada nodo puede seguir aunque falle (*On Error*), o sacar su error por una salida propia. El registro llega igual, pero el orden sigue diciendo lo contrario de lo que importa, y basta con olvidar esa opción en un nodo nuevo para volver al defecto.
2. **Cambiar el orden.** El registro va antes de cualquier aviso.

Elegí la segunda como regla: en toda plantilla que registra algo, **el registro va antes de cualquier aviso**. La primera queda para cuando una acción externa tiene que ir antes, porque el registro necesita su resultado. En facturas, el registro guarda el enlace de Drive, así que la subida va primero. Pero sus dos salidas, la de éxito y la de error, llegan al registro, y si falla, la fila dice «No se subió a Drive: …».

Alertas de errores mostró que «registrar primero» no significa que el registro mande: ahí el aviso es el producto. Ahora las alertas llegan aunque falle la hoja, y además avisan en Slack que no se pudo registrar.

## Cómo lo probé

- **Una prueba que impide volver atrás.** El repositorio de Nexus tiene pruebas que leen el `workflow.json` y exigen el orden. En onboarding, que «Preparar datos» conecte solo con «Registrar ingreso» y que de ahí salgan los cuatro avisos. En tickets, que todo el lote se registre antes de cualquier aviso. En facturas, que las dos salidas de «Subir a Drive» lleguen al registro.
- **En n8n de verdad.** Onboarding, tickets y cobranza recibieron el sello «Probado» (n8n 2.43.5, datos ficticios) en el mismo cierre que su arreglo, minutos después. El historial no deja claro si la prueba en n8n se repitió con el orden nuevo: en onboarding, la hora de la prueba es anterior al commit del arreglo.
- **Lo que falta:** facturas cambió después de su sello, y el sello conserva la fecha anterior hasta repetir la prueba corta. Aprobación de gastos sigue «Sin probar»: su arreglo solo está cubierto por las pruebas del repositorio.

Las pruebas no garantizan que el aviso funcione; garantizan que, si falla, no se lleve el registro.

## Lo que me llevo

- **El orden de un flujo es una decisión, no un detalle:** decide qué sobrevive cuando algo falla.
- **Una auditoría con una sola pregunta encuentra más que revisar todo.** «¿Qué pasa si falla esto?» encontró dos variantes que no buscaba.
- **Las reglas que importan se convierten en pruebas.** Una regla escrita se olvida; una prueba que falla no.

Cómo se arma el resto del manejo de errores en n8n está en [Orquestación y manejo de errores](/manual/n8n/orquestacion-y-manejo-de-errores).
