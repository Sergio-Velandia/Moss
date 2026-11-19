---
title: No te cases con un modelo
description: Un flujo de IA que funcionaba deja de hacerlo porque el modelo ya no existe. En Moss Nexus el modelo va con alias «latest» y en un sub-nodo intercambiable, justo al revés que la versión de n8n, que va fija.
type: journal
category: Arquitectura
tags: [n8n, moss nexus, ia, gemini, modelos, versiones, decisiones]
technologies: [n8n, Gemini, Docker]
createdAt: 2026-11-18
image: og/no-te-cases-con-un-modelo.png
imageAlt: Tarjeta de Moss Bitácora con el título «No te cases con un modelo». Antes, un nombre de modelo fijo deja de existir y el flujo falla. Después, un alias latest en un sub-nodo intercambiable sigue funcionando.
related: [manual/apis/conectar-gemini, manual/n8n/instalar-n8n, project/moss-nexus]
---

## El síntoma

El nodo de IA falla porque el modelo no está disponible. Antes funcionaba, y el nombre del modelo aparece en la documentación, en tutoriales y en la propia plantilla.

Está en la sección «Esto me pasó» de [Primeros pasos de Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/#gemini-modelo-no-disponible), y lo enlazan las dos plantillas con IA: [Resumen diario de correos](https://sergio-velandia.dev/Moss-Nexus/plantillas/resumen-correos-con-ia/) y [Tickets de soporte clasificados](https://sergio-velandia.dev/Moss-Nexus/plantillas/tickets-soporte-con-ia/).

## La causa

Los proveedores retiran modelos, y Google lo hace con frecuencia. Un flujo que nombra un modelo concreto funciona hasta el día en que ese nombre deja de existir. No hace falta que cambies nada: el flujo se rompe solo.

## Antes y después

```flow
# Antes: el modelo amarrado al flujo
Correos :: la lista del día
Configuración :: nombre del modelo, escrito a mano
HTTP Request :: llamada directa a la API de un proveedor
! El modelo se retira :: el flujo falla
```

```flow
# Después: el modelo es una pieza que se cambia
Correos :: la lista del día
Basic LLM Chain :: el prompt, que trata los correos como datos
Sub-nodo de modelo :: Gemini Flash-Lite con alias latest
+ Resumen :: y otro proveedor es otro sub-nodo
```

En palabras: antes, las plantillas de IA llamaban a la API de un proveedor con un nodo HTTP Request, y el nombre del modelo vivía en un nodo «Configuración». Si el modelo se retiraba, el flujo fallaba. Después, el prompt vive en un Basic LLM Chain, y el modelo es un sub-nodo colgado de él: Google Gemini Chat Model, con el alias `gemini-flash-lite-latest`. El alias apunta al modelo vigente, y cambiar de proveedor (OpenAI, Anthropic) es cambiar solo ese sub-nodo.

## Dos formas de nombrar un modelo

1. **El nombre exacto de una versión.** Lo que ves es lo que corre, y la respuesta no cambia porque el proveedor actualizó el modelo. Pero tiene fecha de caducidad, y el día que llega, el flujo deja de funcionar.
2. **Un alias «latest».** El flujo sigue vivo cuando el proveedor retira la versión de turno. A cambio, el modelo detrás del alias puede cambiar sin avisar, y con él las respuestas.

Elegí el alias, con el modelo en un sub-nodo para poder cambiarlo sin tocar el resto. Y como el modelo puede cambiar, el flujo no confía ciegamente en su respuesta:

- **Temperatura 0** en la clasificación de tickets, para que la misma entrada dé, en lo posible, la misma salida.
- **La respuesta se limpia antes de leerla.** Gemini a veces envolvía el JSON en un bloque de código. Hoy se quita, y una respuesta inválida o fuera de la lista queda en «media · otro» para revisión humana.
- **El contenido son datos, nunca instrucciones.** Un correo que le habla a la IA no la obedece: se marca como posible correo sospechoso.

## Por qué aquí lo contrario que con Docker

En [Primeros pasos](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/) la versión de n8n va **fija** en el `docker-compose.yml`, nunca con `latest`. Parece una contradicción, y no lo es: las dos decisiones responden a la misma pregunta, qué se rompe y quién decide cuándo.

| | Versión de n8n | Modelo de IA |
| --- | --- | --- |
| Si queda fija | Sigue funcionando hasta que **tú** decidas actualizar | Deja de funcionar el día que el **proveedor** la retire |
| Si va con `latest` | Cambia sin que te enteres la próxima vez que bajes la imagen | Sigue funcionando, aunque las respuestas pueden variar |
| Qué dice el sello «Probado» | Que funcionó en esa versión, no en todas | Que el flujo funciona, no que el modelo responda siempre igual |
| Decisión | **Fija** | **latest**, con la respuesta revisada antes de usarla |

Con n8n, quedarse quieto es seguro y el cambio es el riesgo. Con un modelo alojado por otro, quedarse quieto es el riesgo, porque el proveedor cambia por ti.

## Cómo lo probé

- **En n8n 2.43.5, con correos ficticios.** Las dos plantillas tienen el sello «Probado»: el resumen de correos, del 21 de octubre de 2026, y los tickets, del 22, ambos con Gemini Flash-Lite en su nivel gratuito.
- **Con pruebas en el repositorio** que leen el flujo: que el modelo cuelga del Basic LLM Chain, que no quedan restos de la versión anterior, que el prompt trata el correo como datos y que la respuesta se lee bien venga limpia, en un bloque de código, inválida o en lote.
- **Lo que la prueba encontró:** la IA puede clasificar distinto el mismo correo en días distintos. En la prueba del resumen, una factura cambió de sección entre dos ejecuciones. Está escrito en sus limitaciones, junto con otra: un modelo ligero puede equivocarse con correos sospechosos, y por eso el flujo solo resume. Nunca responde, borra ni abre enlaces.

## Lo que me llevo

- **Fijar o no fijar depende de quién controla el cambio.** Lo que controlo yo, lo fijo. Lo que controla otro, lo hago reemplazable.
- **Si la pieza puede cambiar, lo que la rodea no puede confiar ciegamente en ella.** Limpiar y validar la respuesta del modelo es parte del diseño, no un parche.
- **El proveedor también es una pieza.** Gemini va por defecto, pero el flujo no depende de él: otro proveedor es otro sub-nodo.

Cómo usar una clave de Gemini sin exponerla está en [Conectar la API de Gemini de forma segura](/manual/apis/conectar-gemini).
