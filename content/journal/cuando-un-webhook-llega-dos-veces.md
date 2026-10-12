---
title: Cuando un webhook llega dos veces
description: Asumir que cada evento llega exactamente una vez es el origen de cobros dobles y pedidos repetidos. Diseñar para la repetición cambia la arquitectura.
type: journal
category: Arquitectura
tags: [webhooks, idempotencia, pagos, reintentos, sistemas distribuidos, negocio]
technologies: [n8n, Node.js, SQL]
createdAt: 2026-10-12
related: [manual/apis/idempotencia-en-pagos-y-webhooks, manual/apis/paginacion-y-limites-de-tasa, lab/retry-backoff]
---

## La suposición escondida

Cuando se escribe el primer manejador de webhooks, la suposición es natural: el proveedor avisa una vez de cada pago, yo creo un pedido por cada aviso. Funciona en las pruebas, funciona las primeras semanas, y un día aparece un cliente con dos pedidos idénticos y un despacho doble.

Revisando la documentación del proveedor aparece la frase que siempre estuvo ahí: **"los eventos pueden enviarse más de una vez"**. No es un fallo del proveedor. Es una decisión de diseño razonable.

## Por qué se repiten

Desde el lado del proveedor, el razonamiento es este: envié el evento y no recibí un 200 a tiempo. Puede que tu servidor no lo recibiera, o puede que lo procesara y la respuesta se perdiera. No hay forma de saber cuál de las dos pasó. Si no reenvía, se arriesga a que pierdas un pago; si reenvía, se arriesga a que lo proceses dos veces. Perder un pago es peor, así que reenvía.

```flow
# Cómo nace el duplicado
Proveedor :: envía el evento de pago
Tu servidor :: lo procesa y crea el pedido
! La respuesta tarda :: o se pierde en la red
Proveedor :: no vio un 200 y reenvía
! Segundo pedido :: si nada lo detiene
```

Lo mismo pasa en todas partes: la app móvil que reintenta al recuperar la señal, el usuario que pulsa dos veces, el nodo de n8n con *Retry On Fail*, la cola de mensajes que entrega "al menos una vez". En un sistema que se comunica por red, **la repetición es el caso normal**, no la excepción.

## Diseñar para la repetición

El cambio de mentalidad es pasar de "evitar que llegue dos veces" (imposible de garantizar) a **"que llegue dos veces no importe"**. En la práctica son tres hábitos:

- **Cada operación tiene una identidad.** El evento trae un id; el cobro que yo inicio lleva una clave de idempotencia. Sin identidad, no hay forma de reconocer una repetición.
- **La base de datos decide.** Una clave primaria sobre el id del evento hace que la segunda copia falle al insertarse, aunque las dos lleguen en el mismo milisegundo. Un `if (yaExiste)` en el código no lo consigue.
- **Fijar estados en vez de sumar.** "El pedido 1021 está pagado" se puede repetir mil veces sin efecto. "Sumar una unidad vendida" no.

La [guía de idempotencia](/manual/apis/idempotencia-en-pagos-y-webhooks) tiene el código; lo importante es la idea.

## Lo que aprendí

Los errores más caros en integraciones no suelen estar en el camino feliz, sino en lo que pasa cuando la red hace lo que siempre hace tarde o temprano: perder una respuesta. Preguntarse "¿qué pasa si esto llega dos veces?" ante cada webhook, cada reintento y cada botón de pago es de las preguntas más rentables que conozco. Casi siempre la respuesta inicial es "algo malo", y arreglarlo antes cuesta mucho menos que devolver un cobro doble.
