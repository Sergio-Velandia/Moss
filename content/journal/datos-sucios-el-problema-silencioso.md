---
title: Datos sucios, el problema silencioso
description: Duplicados, formatos distintos y campos vacíos no rompen nada de inmediato; por eso cuestan tanto. Por qué conviene limpiarlos en la entrada.
type: journal
category: Arquitectura
tags: [calidad de datos, duplicados, crm, validación, negocio]
technologies: [SQL, n8n, JavaScript]
createdAt: 2026-10-12
related: [manual/sql/detectar-y-fusionar-clientes-duplicados, manual/n8n/sincronizar-formulario-con-crm, manual/n8n/entender-webhooks-y-triggers]
---

## Nada se rompe

Un dato sucio no lanza una excepción. Un cliente registrado dos veces no tumba el servidor. Un teléfono escrito `300 123 4567` en un registro y `+57 3001234567` en otro no genera ninguna alerta. El sistema sigue funcionando y todo parece estar bien.

El costo aparece después, repartido en lugares que nadie conecta con la causa:

- El mismo cliente recibe dos veces la campaña y se da de baja.
- El reporte de "clientes nuevos del mes" cuenta como nuevos a clientes de hace años.
- Soporte no ve el historial completo porque está partido en dos fichas.
- La integración con el sistema de facturación rechaza un lote porque un NIT trae espacios.

Ninguno de esos problemas parece un problema de datos. Parecen problemas de marketing, de reportes, de soporte o de integración.

```mindmap
Dónde se nota un dato sucio
- Marketing :: mensajes duplicados
  - bajas
- Reportes :: cifras infladas
  - clientes nuevos que no lo son
- Soporte :: historial partido
- Integraciones :: lotes rechazados
  - formatos distintos
```

## Limpiar después cuesta más

La reacción habitual es la limpieza periódica: cada cierto tiempo alguien exporta la base, busca duplicados, los fusiona a mano y vuelve a importar. Funciona unas semanas. Mientras tanto, el formulario de la web, la importación del evento y el vendedor que crea contactos desde el móvil siguen generando datos con el mismo desorden.

Limpiar sin cambiar la entrada es achicar agua sin tapar el agujero. La guía de [duplicados en SQL](/manual/sql/detectar-y-fusionar-clientes-duplicados) termina, a propósito, con un índice único: es lo que evita la siguiente limpieza.

## Tres decisiones que cambian la tendencia

**Una forma canónica para cada dato.** Correos en minúsculas y sin espacios. Teléfonos con su código de país y solo dígitos. Nombres con mayúscula inicial. No importa tanto cuál se elija como que sea una sola, aplicada en todas las entradas.

**Normalizar en la frontera.** Cada punto por donde entran datos (formulario, webhook, importación) los normaliza antes de guardarlos. En un flujo de n8n es un nodo Code al principio; en una API, una función que se ejecuta antes de escribir. Así la base de datos solo conoce datos limpios.

**Que la base de datos diga que no.** Una restricción única o un `NOT NULL` es una regla que se cumple siempre, también cuando alguien se salta la aplicación e importa un CSV directamente. Las validaciones en la interfaz ayudan al usuario; las restricciones protegen los datos.

## Lo que aprendí

La calidad de los datos rara vez es un proyecto: es una costumbre en cada lugar donde entra información. Y como sus efectos son silenciosos, hay que hacerlos visibles. Contar duplicados cada mes, aunque sea con una consulta sencilla, convierte un problema invisible en una cifra que se puede ver bajar.
