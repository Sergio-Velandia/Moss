---
title: El flujo de errores que no se disparaba
description: Ejecutas a mano un flujo que falla y la alerta nunca llega, así que parece que el flujo de alertas está roto. No lo está, y probarlo bien exige un flujo que falle a propósito.
type: journal
category: Aprendizajes
tags: [n8n, moss nexus, error trigger, alertas, pruebas, ejecuciones manuales]
technologies: [n8n, Slack, Gmail]
createdAt: 2026-11-18
image: og/el-flujo-de-errores-que-no-se-disparaba.png
imageAlt: Tarjeta de Moss Bitácora con el título «El flujo de errores que no se disparaba». Antes, una ejecución manual falla y la alerta no llega. Después, un flujo de prueba que falla cada minuto dispara la alerta.
related: [manual/n8n/orquestacion-y-manejo-de-errores, manual/n8n/slack-en-n8n, project/moss-nexus]
---

## El síntoma

Armé el flujo de alertas, lo asigné como *Error Workflow* de otro flujo y, para probarlo, hice fallar ese otro flujo a mano con «Execute workflow». Falló, como esperaba. La alerta no llegó.

Lo natural es pensar que el flujo de alertas está roto y ponerse a revisar la credencial de Slack, el canal o el formato del mensaje. No hay nada que arreglar ahí.

Está en la sección «Esto me pasó» de [Primeros pasos de Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/#flujos-de-error-manual), y en las limitaciones de la plantilla [Alertas cuando falla cualquier flujo](https://sergio-velandia.dev/Moss-Nexus/plantillas/alertas-de-errores-n8n/).

## La causa

n8n solo dispara el flujo de errores en **ejecuciones automáticas**: un Schedule, un webhook de producción, cualquier trigger que corra solo. Una ejecución manual desde el editor no cuenta, aunque falle igual.

Mientras editas, los errores ya los ves en pantalla. Pero eso deja una trampa: la forma más natural de probar el flujo de errores es justo la que no lo dispara.

## Antes y después

```flow
# Antes: probar a mano
Execute workflow :: ejecución manual desde el editor
Flujo vigilado :: falla
! Error Trigger :: no se dispara
Parece roto :: y no lo está
```

```flow
# Después: un flujo que falla solo
Cada minuto :: un Schedule, publicado
Code :: lanza un error a propósito
Error Trigger :: se dispara en el flujo de alertas
+ Alerta :: llega a Slack y al correo
```

En palabras: antes, el flujo vigilado se ejecutaba a mano desde el editor, fallaba y el Error Trigger no se disparaba, así que el flujo de alertas parecía roto. Después, la prueba usa un flujo mínimo que se ejecuta solo cada minuto y lanza un error a propósito desde un nodo Code. Como es una ejecución automática, el Error Trigger se dispara y la alerta llega.

## Dos formas de probarlo

1. **«Fetch Test Event» del Error Trigger.** El nodo trae un evento de ejemplo con la forma de un error real. Sirve para ver el formato del mensaje, pero no prueba nada de la cadena: ni que el flujo vigilado tenga asignado el *Error Workflow*, ni que los dos estén publicados. Además, su enlace a la ejecución es inventado y responde 404, y eso confunde la primera vez.
2. **Un flujo que falla a propósito.** «Cada minuto» → un nodo Code que lanza un error. Se le asigna el flujo de alertas como *Error Workflow* y se publica. Al minuto llega la primera alerta.

Elegí la segunda, y la plantilla la incluye en su sección «Cómo probarla», con un aviso: **despublícalo al terminar o te enviará una alerta cada minuto**. Prueba lo que de verdad importa: que un fallo real, en una ejecución real, termine en un mensaje.

La plantilla explica además las otras dos condiciones de la cadena: los **dos** flujos tienen que estar publicados, y el flujo de alertas no puede ser su propio *Error Workflow*, porque crearía un bucle.

## Cómo lo probé

- **Con el flujo que falla a propósito, en n8n 2.43.5.** La plantilla tiene el sello «Probado» del 19 de octubre de 2026, a las 20:04, sin datos de personas ni de negocios. Las alertas llegaron a mi propio Slack y a mi propio correo, que no se publican.
- **El modo crítico se prueba igual.** Basta con agregar «[crítico]» al nombre del flujo de prueba para que el fallo llegue además por correo y con aviso a todo el canal. La nota del sello no dice si esa variante se probó.
- **Lo que no cubre:** si falla el propio flujo de alertas (por ejemplo, Slack caído), nadie avisa. Está escrito en sus limitaciones.

## Lo que me llevo

- **Probar con el mismo tipo de ejecución que tendrá en producción.** Una prueba manual de algo que solo ocurre en automático no prueba nada.
- **Un evento de ejemplo enseña la forma, no la cadena.** Sirve para el formato; no para saber si todo está conectado.
- **Una prueba que se olvida encendida también es un error.** El aviso de despublicar va junto al flujo de prueba, no en otra página.

Cómo se arma el flujo de errores, con Error Trigger y un registro de fallos, está en [Orquestación y manejo de errores](/manual/n8n/orquestacion-y-manejo-de-errores).
