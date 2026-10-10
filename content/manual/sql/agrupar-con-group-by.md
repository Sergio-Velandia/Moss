---
title: Consulta SQL para agrupar con GROUP BY
description: Cómo agrupar filas, calcular totales y filtrar grupos con HAVING, y el error 1055 de MySQL.
type: manual
tags: [group by, agregación, consultas, mysql]
technologies: [SQL, MySQL]
createdAt: 2026-10-09
updatedAt: 2026-10-09
---

## Problema que resuelve

Necesito un resumen (totales, conteos, promedios) en vez de la lista de filas: ventas por cliente, pedidos por mes, usuarios por país.

## Tabla de ejemplo

```sql
CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente VARCHAR(80) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  creado_en DATE NOT NULL
);
```

## Agrupar y sumar

```sql
SELECT cliente, COUNT(*) AS pedidos, SUM(total) AS gastado
FROM pedidos
GROUP BY cliente
ORDER BY gastado DESC;
```

Cada fila del resultado es un grupo (un cliente). `COUNT` y `SUM` se calculan por grupo.

## Filtrar grupos con HAVING

`WHERE` filtra filas **antes** de agrupar; `HAVING` filtra grupos **después**.

```sql
SELECT cliente, SUM(total) AS gastado
FROM pedidos
WHERE creado_en >= '2026-01-01'
GROUP BY cliente
HAVING SUM(total) > 500;
```

## Agrupar por mes

```sql
SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes, COUNT(*) AS pedidos
FROM pedidos
GROUP BY mes
ORDER BY mes;
```

## Errores frecuentes

- **Error 1055 (`ONLY_FULL_GROUP_BY`).** En MySQL, toda columna del `SELECT` que no esté dentro de una función de agregación debe aparecer en el `GROUP BY`. Si seleccionas `cliente` y `id` pero solo agrupas por `cliente`, falla.
- **Usar `WHERE` con una agregación.** `WHERE SUM(total) > 500` no es válido; ese filtro va en `HAVING`.
- **Contar con `COUNT(columna)`.** Ignora los `NULL`; `COUNT(*)` cuenta todas las filas.
