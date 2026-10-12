---
title: Dinero y fechas sin errores con Intl
description: Calcular precios e impuestos sin errores de coma flotante, mostrar pesos con Intl y evitar que una fecha caiga en el día anterior.
type: manual
tags: [dinero, fechas, intl, iva, redondeo, zona horaria, facturación, negocio]
technologies: [JavaScript, TypeScript]
createdAt: 2026-10-12
related: [lab/invoice-summary, manual/javascript/exportar-csv-para-excel, manual/sql/reporte-mensual-con-variacion]
references: [MDN: Intl.NumberFormat | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat, MDN: Intl.DateTimeFormat | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat, MDN: Date.parse() | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse, MDN: Number.toFixed() | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed]
---

## Problema que resuelve

Dos de los errores más caros en software de empresa no son caídas, sino números que no cuadran: una factura cuyo total difiere en un peso del de contabilidad, o un pago del 1 de octubre que el reporte cuenta en septiembre. Los dos vienen de lo mismo: tratar dinero y fechas como números y textos cualquiera.

```mindmap
Dinero y fechas en una factura
- Calcular :: enteros, no decimales
  - centavos o pesos
  - redondear por línea
- Mostrar :: Intl.NumberFormat
  - solo para pantalla
- ! Fechas :: el día puede cambiar
  - YYYY-MM-DD se lee en UTC
  - fijar la zona del negocio
```

## 1. El dinero no se calcula con decimales

```js
0.1 + 0.2          // 0.30000000000000004
(1.005).toFixed(2) // "1.00", no "1.01"
```

Los números de JavaScript son binarios y no representan exactamente la mayoría de decimales. En una factura con muchas líneas, esos restos terminan en un peso de diferencia. La regla: **guarda y calcula en la unidad mínima como entero** (centavos en dólares o euros; en pesos colombianos, normalmente el peso entero) y convierte solo al mostrar.

```ts
// Precios en pesos enteros
const lineas = [
  { concepto: 'Licencia', precio: 89_900, cantidad: 3, iva: 19 },
  { concepto: 'Café', precio: 12_333, cantidad: 4, iva: 5 },
]

// Multiplica antes de dividir y redondea una sola vez por línea
const ivaDeLinea = (base: number, tasa: number) => Math.round((base * tasa) / 100)

const filas = lineas.map((l) => {
  const base = l.precio * l.cantidad
  return { ...l, base, iva: ivaDeLinea(base, l.iva) }
})
const subtotal = filas.reduce((s, f) => s + f.base, 0)
const iva = filas.reduce((s, f) => s + f.iva, 0)
const total = subtotal + iva
```

### ¿Redondear por línea o sobre el total?

Dan resultados distintos: redondear cada línea y sumar no siempre es igual a sumar y redondear al final. Ninguna es "la correcta": **es una regla de negocio** que debe coincidir con la de tu sistema de facturación y con la de contabilidad. Elige una, documéntala y úsala en todas partes. La [demo de factura](/laboratorio/invoice-summary) redondea por línea.

En la base de datos, usa `DECIMAL(12, 2)` (o enteros), nunca `FLOAT` ni `DOUBLE` para montos.

## 2. Mostrar con Intl.NumberFormat

```js
const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

pesos.format(1234567) // "$ 1.234.567"
```

Tres trampas comprobadas:

- **Intl redondea al mostrar.** `pesos.format(1234567.5)` devuelve `"$ 1.234.568"`. Por eso los cálculos se hacen antes, con enteros, y el formato es solo para la pantalla.
- **El espacio no es un espacio.** Entre `$` y el número va un espacio duro (U+00A0). Una prueba que compare con `'$ 1.234.567'` escrito a mano falla aunque se vea igual.
- **No vuelvas a leer el texto formateado.** `Number('1.234.567')` no es un millón: en español el punto separa miles. Guarda siempre el número original.

Crea el formateador una vez y reutilízalo: construirlo en cada render es costoso.

## 3. Fechas: el día que se mueve

```js
// En Colombia (UTC-5):
new Date('2026-10-01').toLocaleDateString('es-CO')          // "30/9/2026"
new Date('2026-10-01T00:00:00').toLocaleDateString('es-CO') // "1/10/2026"
```

Una fecha sola (`YYYY-MM-DD`) se interpreta como **medianoche en UTC**, que en Colombia es el día anterior a las 7 p. m. Con hora y sin zona, se interpreta en hora local. Esa diferencia es la que mueve pagos de mes en los reportes.

Reglas que evitan el problema:

- **Fechas sin hora** (vencimiento, fecha de factura): guárdalas como texto `YYYY-MM-DD` y no las conviertas en `Date` si no hace falta. Para compararlas basta con comparar los textos.
- **Instantes** (cuándo se pagó): guárdalos en UTC con zona (`2026-10-01T03:00:00Z`) y conviértelos a la zona del negocio solo al mostrar:

```js
new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeZone: 'America/Bogota',
}).format(new Date('2026-10-01T03:00:00Z')) // "30 de septiembre de 2026"
```

El pago entró a las 10 p. m. del 30 de septiembre en Bogotá, aunque en UTC ya fuera 1 de octubre. Para el reporte del negocio, cuenta en septiembre.

## Errores frecuentes

- **Sumar precios con decimales** y redondear al final "para que cuadre".
- **Calcular a partir de texto formateado** o de lo que muestra un input con separadores de miles.
- **Usar la zona horaria del servidor.** Un servidor en UTC y un negocio en Bogotá cierran el día en momentos distintos: fija la zona del negocio de forma explícita.
- **Mezclar reglas de redondeo** entre la tienda, la factura y la contabilidad.
