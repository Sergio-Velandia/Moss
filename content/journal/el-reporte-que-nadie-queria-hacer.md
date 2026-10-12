---
title: El reporte que nadie quería hacer
description: Automatizar un reporte semanal parece un problema técnico, pero lo difícil es acordar qué significa cada número.
type: journal
category: Aprendizajes
tags: [reportes, automatización, kpi, excel, negocio, definiciones]
technologies: [n8n, SQL]
createdAt: 2026-10-12
related: [manual/n8n/reporte-diario-automatico, manual/sql/reporte-mensual-con-variacion, manual/javascript/exportar-csv-para-excel]
---

## Una escena conocida

En casi cualquier empresa hay un archivo de Excel con un nombre como `Reporte semanal FINAL v3 (2).xlsx`. Cada lunes, alguien exporta datos de dos o tres sistemas, los pega en pestañas, actualiza unas fórmulas que solo esa persona entiende y envía capturas al equipo. Toma una mañana. Cuando esa persona se enferma, el reporte no sale, y nadie se atreve a tocar el archivo.

Automatizarlo parece obvio: una consulta, un flujo de n8n programado y un mensaje a Slack. La parte técnica cabe en una tarde. Lo que no cabe en una tarde es lo que aparece al empezar.

## Lo difícil no es el código

Al escribir la primera consulta surge la pregunta incómoda: **¿qué es una venta?**

- ¿El pedido creado o el pedido pagado?
- ¿Con IVA o sin IVA?
- ¿Las devoluciones se restan en el mes de la venta o en el de la devolución?
- ¿Cuenta la venta a un empleado? ¿Y la de prueba que alguien hizo para ver si la tienda funcionaba?

El Excel tenía una respuesta para cada pregunta, pero escondida en filtros, filas borradas a mano y una columna oculta. Nadie la había escrito. Por eso el número del reporte "automático" no coincide con el de siempre y la primera reacción del equipo es desconfiar del sistema nuevo.

```flow
# Lo que de verdad hay que construir
Definiciones :: qué cuenta y qué no, por escrito
Una sola fuente :: la base de datos, no copias
Consulta revisable :: el SQL vive en el flujo, a la vista
+ Reporte automático :: la misma cifra para todos
```

## Lo que funciona

**Escribir las definiciones antes que el SQL.** Una página corta: "Ventas = pedidos con estado pagado, por su total sin IVA, en el mes del pago; las devoluciones se restan en el mes en que ocurren". Se acuerda con quien usa el reporte. Ese texto vale más que la consulta, porque es lo que permite que dos personas obtengan el mismo número.

**Correr los dos reportes en paralelo unas semanas.** El manual y el automático, lado a lado. Cada diferencia es una definición que faltaba o un error del archivo antiguo, y los dos casos son valiosos de descubrir. Cuando dejan de diferir, el equipo confía en el automático sin que haga falta convencerlo.

**Menos cifras.** Los reportes manuales crecen por acumulación: alguien pidió una columna hace dos años y nunca se quitó. Al automatizar es buen momento para preguntar qué decisión se toma con cada cifra. Las que no llevan a ninguna, sobran.

**Que el silencio no signifique "todo bien".** Un reporte automático que deja de llegar es peor que uno manual atrasado, porque nadie lo echa de menos de inmediato. El flujo necesita avisar cuando falla.

## Lo que aprendí

Automatizar un reporte es, sobre todo, convertir conocimiento tácito en algo explícito: lo que una persona sabía y aplicaba sin decirlo. La herramienta da igual. Lo que cambia el día a día es que la cifra deja de depender de quién la calcula.
