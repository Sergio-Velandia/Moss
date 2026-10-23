---
title: Datos y reportes con SQL
description: Agrupar, limpiar duplicados, comparar meses, exportar a Excel sin romper tildes y calcular dinero sin errores de redondeo.
type: route
level: intermedio
order: 3
tags: [sql, datos, reportes, excel, ruta]
technologies: [SQL, MySQL, JavaScript]
createdAt: 2026-10-14
updatedAt: 2026-10-22
steps: [manual/sql/agrupar-con-group-by, manual/sql/detectar-y-fusionar-clientes-duplicados, manual/sql/reporte-mensual-con-variacion, journal/el-reporte-que-nadie-queria-hacer, manual/javascript/exportar-csv-para-excel, lab/csv-export, manual/javascript/dinero-y-fechas-con-intl, lab/invoice-summary, journal/datos-sucios-el-problema-silencioso]
---

## Para quién es

Para quien prepara reportes para otras personas (ventas, clientes, facturación) y quiere que los números cuadren siempre, se puedan volver a calcular y lleguen a Excel sin sorpresas.

## Qué vas a poder hacer al terminar

```flow
# Del dato crudo al reporte en el que confían
Datos limpios :: sin clientes duplicados
Consulta :: totales y variación mes a mes
Exportación :: CSV que Excel abre bien
+ Cifras exactas :: dinero en enteros y fechas en su zona
```

## Cómo seguirla

Empieza por SQL y termina en el navegador: las guías explican la consulta y las demos muestran el resultado (un CSV con tildes, comas y comillas difíciles, y una factura con IVA calculada en pesos enteros). Dos artículos de la Bitácora acompañan el recorrido: después del reporte mensual, por qué lo difícil de un reporte es acordar qué significa cada número; y al final, por qué los datos sucios cuestan tanto aunque nada se rompa.
