---
title: Detectar y fusionar clientes duplicados
description: Encontrar el mismo cliente registrado varias veces, fusionarlo sin perder sus pedidos y evitar que vuelva a pasar.
type: manual
tags: [duplicados, calidad de datos, crm, window functions, mysql, negocio]
technologies: [SQL, MySQL]
createdAt: 2026-10-12
related: [journal/datos-sucios-el-problema-silencioso, manual/n8n/sincronizar-formulario-con-crm, manual/sql/agrupar-con-group-by]
references: [MySQL: funciones de ventana | https://dev.mysql.com/doc/refman/8.4/en/window-function-descriptions.html, MySQL: WITH (CTE) | https://dev.mysql.com/doc/refman/8.4/en/with.html, MySQL: expresiones regulares | https://dev.mysql.com/doc/refman/8.4/en/regexp.html, MySQL: índices funcionales | https://dev.mysql.com/doc/refman/8.4/en/create-index.html]
---

## Problema que resuelve

Ventas dice que hay 4.200 clientes; contabilidad factura a 3.100. La diferencia casi nunca es fraude: es el mismo cliente escrito de varias formas. `ana@empresa.com` y `Ana@Empresa.com `, o el teléfono `300 123 4567` y `+57 3001234567`. Cada duplicado divide el historial de compras en dos, recibe dos veces la misma campaña y estropea cualquier reporte de "clientes nuevos".

Esta guía cubre el proceso completo en MySQL 8: **normalizar, detectar, elegir un superviviente, fusionar y prevenir**.

```flow
# De datos sucios a un cliente por persona
Normalizar :: minúsculas, sin espacios, solo dígitos
Detectar :: agrupar por la clave normalizada
Elegir superviviente :: el registro más antiguo
Fusionar :: mover pedidos y borrar el duplicado
+ Prevenir :: índice único sobre la clave
```

## Tabla de ejemplo

```sql
CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  telefono VARCHAR(30),
  creado_en DATETIME NOT NULL
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);
```

## 1. Normalizar antes de comparar

Comparar `email = email` no sirve: los duplicados reales difieren en mayúsculas y espacios. Primero decido qué significa "el mismo cliente" y lo expreso como una **clave normalizada**:

```sql
SELECT
  id,
  LOWER(TRIM(email)) AS email_n,
  -- Solo dígitos y los últimos 10: "+57 300-123 4567" y "3001234567" coinciden
  RIGHT(REGEXP_REPLACE(telefono, '[^0-9]', ''), 10) AS telefono_n
FROM clientes;
```

> Decidir la regla es una decisión de negocio, no técnica. ¿Dos personas pueden compartir el correo de la empresa (`compras@…`)? Entonces el correo solo no basta como clave. Acuérdalo con quien usa los datos antes de fusionar nada.

## 2. Detectar los grupos duplicados

```sql
SELECT
  LOWER(TRIM(email)) AS email_n,
  COUNT(*) AS veces,
  GROUP_CONCAT(id ORDER BY creado_en) AS ids
FROM clientes
WHERE email IS NOT NULL AND TRIM(email) <> ''
GROUP BY email_n
HAVING COUNT(*) > 1
ORDER BY veces DESC;
```

El filtro `WHERE` evita que todos los clientes sin correo aparezcan como "duplicados" entre sí.

## 3. Elegir el superviviente

Con una función de ventana marco, para cada grupo, cuál registro se queda. Aquí, el más antiguo (y el de menor `id` si empatan):

```sql
CREATE TEMPORARY TABLE fusion AS
SELECT
  id AS duplicado,
  FIRST_VALUE(id) OVER (
    PARTITION BY LOWER(TRIM(email))
    ORDER BY creado_en, id
  ) AS superviviente
FROM clientes
WHERE email IS NOT NULL AND TRIM(email) <> '';

-- Cada superviviente aparece emparejado consigo mismo: esas filas sobran
DELETE FROM fusion WHERE duplicado = superviviente;

SELECT * FROM fusion;  -- revisa la lista antes de seguir
```

Uso una tabla temporal en lugar de una subconsulta porque MySQL no permite modificar una tabla mientras se lee de ella en la misma sentencia (error 1093).

## 4. Fusionar sin perder historial

Primero muevo lo que depende del duplicado y después lo borro, todo en una transacción:

```sql
START TRANSACTION;

UPDATE pedidos p
JOIN fusion f ON p.cliente_id = f.duplicado
SET p.cliente_id = f.superviviente;

DELETE c
FROM clientes c
JOIN fusion f ON c.id = f.duplicado;

COMMIT;
```

Si algo sale raro entre los dos pasos, `ROLLBACK` deja todo como estaba. Repite el `UPDATE` para cada tabla que apunte a `clientes` (facturas, tickets de soporte…).

## 5. Prevenir que vuelva a pasar

Un índice único sobre la clave normalizada hace que la base de datos rechace el siguiente duplicado. Desde MySQL 8.0.13 se puede indexar una expresión:

```sql
CREATE UNIQUE INDEX ux_clientes_email
ON clientes ((LOWER(TRIM(email))));
```

Ahora un `INSERT` duplicado falla con el error 1062, y la aplicación (o el flujo de n8n) puede decidir actualizar el registro existente en lugar de crear otro. Así lo hace la guía [sincronizar un formulario con el CRM](/manual/n8n/sincronizar-formulario-con-crm).

## Errores frecuentes

- **Fusionar sin copia de seguridad.** Haz un respaldo o, al menos, guarda la tabla `fusion` antes del `DELETE`.
- **Borrar antes de mover.** Con claves foráneas el `DELETE` falla; sin ellas, los pedidos quedan huérfanos.
- **Tratar los vacíos como iguales.** Sin el filtro de correos vacíos, cientos de clientes "sin correo" se fusionan en uno.
- **Normalizar solo en la consulta.** Si la aplicación sigue guardando datos sin normalizar, el problema vuelve. Normaliza también al entrar el dato.
