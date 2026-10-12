---
title: Reporte de ventas mensual con variación
description: Ventas por mes comparadas con el mes anterior y con el mismo mes del año pasado, sin perder los meses en cero.
type: manual
tags: [reportes, ventas, kpi, window functions, lag, mysql, negocio]
technologies: [SQL, MySQL]
createdAt: 2026-10-12
related: [manual/sql/agrupar-con-group-by, manual/n8n/reporte-diario-automatico, journal/el-reporte-que-nadie-queria-hacer]
references: [MySQL: funciones de ventana | https://dev.mysql.com/doc/refman/8.4/en/window-function-descriptions.html, MySQL: conceptos de ventana | https://dev.mysql.com/doc/refman/8.4/en/window-functions-usage.html, MySQL: WITH RECURSIVE | https://dev.mysql.com/doc/refman/8.4/en/with.html, MySQL: funciones de fecha | https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html]
---

## Problema que resuelve

La gerencia pide lo mismo cada mes: "¿cuánto vendimos y cómo vamos frente al mes pasado?". Se suele resolver copiando totales a una hoja de cálculo y calculando porcentajes a mano. Es lento, y cada persona obtiene un número distinto según qué filtros aplicó.

Esta consulta deja el reporte en una sola sentencia que cualquiera puede volver a ejecutar y obtener el mismo resultado.

```flow
# Cómo se construye el reporte
Calendario :: todos los meses del periodo
Ventas por mes :: solo pedidos pagados
LEFT JOIN :: los meses sin ventas valen 0
LAG :: trae el mes anterior a la misma fila
+ Variación :: porcentaje frente al anterior
```

## Primero, definir "venta"

Antes de escribir SQL, acuerda qué cuenta. ¿Pedidos creados o pagados? ¿Con o sin IVA? ¿Se restan las devoluciones? En el ejemplo, una venta es un pedido con `estado = 'pagado'`, por su `total` sin IVA, en el mes en que se pagó. Escríbelo en el propio reporte: la mitad de las discusiones sobre "números que no cuadran" son definiciones distintas.

## La consulta

```sql
WITH RECURSIVE meses AS (
  SELECT DATE('2025-10-01') AS inicio
  UNION ALL
  SELECT inicio + INTERVAL 1 MONTH FROM meses WHERE inicio < '2026-09-01'
),
ventas AS (
  SELECT
    DATE_FORMAT(pagado_en, '%Y-%m-01') AS inicio,
    SUM(total) AS ventas,
    COUNT(*) AS pedidos
  FROM pedidos
  WHERE estado = 'pagado'
    AND pagado_en >= '2025-10-01' AND pagado_en < '2026-10-01'
  GROUP BY 1
),
mensual AS (
  SELECT m.inicio, COALESCE(v.ventas, 0) AS ventas, COALESCE(v.pedidos, 0) AS pedidos
  FROM meses m
  LEFT JOIN ventas v ON v.inicio = m.inicio
)
SELECT
  DATE_FORMAT(inicio, '%Y-%m') AS mes,
  ventas,
  pedidos,
  LAG(ventas) OVER w AS mes_anterior,
  ROUND((ventas - LAG(ventas) OVER w) / NULLIF(LAG(ventas) OVER w, 0) * 100, 1) AS variacion_pct
FROM mensual
WINDOW w AS (ORDER BY inicio)
ORDER BY inicio;
```

Qué hace cada pieza:

- **`WITH RECURSIVE meses`** genera los 12 meses del periodo aunque alguno no tenga ventas. Sin él, un mes en cero desaparece y `LAG` compara octubre con agosto sin avisar.
- **El filtro por rango** (`>=` y `<`) en vez de `YEAR(pagado_en) = 2026` permite usar el índice de `pagado_en`.
- **`LAG(ventas) OVER w`** trae el valor de la fila anterior; `WINDOW w` evita repetir la definición tres veces.
- **`NULLIF(…, 0)`** convierte la división entre cero en `NULL`: si el mes anterior fue 0, la variación queda vacía en lugar de fallar.

## Comparar con el mismo mes del año anterior

Para negocios con temporadas (diciembre siempre vende más), comparar con el mes anterior engaña. Con 24 meses en el calendario, `LAG(ventas, 12)` trae el mismo mes del año pasado:

```sql
LAG(ventas, 12) OVER w AS mismo_mes_anio_pasado
```

## Errores frecuentes

- **Fechas en UTC.** Si `pagado_en` se guarda en UTC, un pago del 31 de octubre a las 9 p. m. en Colombia ya es 1 de noviembre en UTC. Convierte la fecha a la zona del negocio con `CONVERT_TZ` (requiere tener cargadas las tablas de zonas horarias) o guarda la fecha local.
- **Promediar porcentajes.** La variación del trimestre no es el promedio de las tres variaciones mensuales: calcúlala con los totales del trimestre.
- **Meses incompletos.** El mes en curso siempre parece una caída. Exclúyelo o márcalo como parcial.
- **Cambiar la definición sin avisar.** Si un mes empiezas a restar devoluciones, todos los meses anteriores dejan de ser comparables.
