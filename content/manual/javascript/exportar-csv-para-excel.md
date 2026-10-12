---
title: Exportar CSV que Excel abre bien
description: Por qué el CSV descargado sale con tildes rotas o todo en una columna, y cómo generarlo bien desde el navegador.
type: manual
tags: [csv, excel, exportar, utf-8, bom, csv injection, reportes, negocio]
technologies: [JavaScript, TypeScript]
createdAt: 2026-10-12
related: [lab/csv-export, manual/sql/reporte-mensual-con-variacion, journal/el-reporte-que-nadie-queria-hacer]
references: [RFC 4180: formato CSV | https://www.rfc-editor.org/rfc/rfc4180, OWASP: inyección CSV | https://owasp.org/www-community/attacks/CSV_Injection, MDN: Blob | https://developer.mozilla.org/en-US/docs/Web/API/Blob, MDN: URL.createObjectURL() | https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static]
---

## Problema que resuelve

"Exportar a Excel" es de las funciones más pedidas en cualquier sistema interno. La versión rápida concatena valores con comas y la primera queja llega el mismo día:

- **"Las tildes salen raras":** `BogotÃ¡` en vez de `Bogotá`.
- **"Me sale todo en una columna":** en Excel en español, la coma no separa columnas.
- **"Se movieron las columnas":** un cliente se llama `Pérez, Ana` y su coma partió la fila.
- **"Los números no suman":** `1250000.5` se lee como texto.

Cada problema tiene una causa concreta y una solución de una línea. Puedes probarlas en la [demo del Laboratorio](/laboratorio/csv-export).

```mindmap
Un CSV que Excel entiende
- Codificación :: UTF-8 con BOM
  - las tildes se ven bien
- Separador :: ; en Excel en español
  - coma decimal en los números
- Comillas :: según RFC 4180
  - separadores y saltos dentro del texto
- ! Seguridad :: neutralizar fórmulas
  - valores que empiezan por = + - @
```

## 1. Tildes: el BOM

Excel no adivina bien la codificación de un CSV: si no encuentra una marca, asume la codificación regional de Windows y las tildes se rompen. La marca es el **BOM** de UTF-8, el carácter `﻿` al inicio del archivo:

```ts
const contenido = '﻿' + csv
```

Otras herramientas (Google Sheets, LibreOffice, Python) lo ignoran sin problema.

## 2. Columnas: el separador

En los países donde la coma es el separador decimal (Colombia, España, buena parte de Latinoamérica), Excel usa **punto y coma** para separar columnas, porque toma el separador de listas de la configuración regional. Si tus usuarios usan Excel en español, genera `;` y escribe los decimales con coma (`1250000,5`). Si el archivo va a otro sistema, usa `,` y punto decimal, que es el estándar.

## 3. Comillas: RFC 4180

Un campo va entre comillas dobles si contiene el separador, comillas o saltos de línea, y las comillas internas se duplican:

```ts
function celda(valor: string | number | null, sep: ';' | ','): string {
  if (valor === null) return ''
  let texto = typeof valor === 'number' && sep === ';' ? String(valor).replace('.', ',') : String(valor)
  // Seguridad (ver punto 4)
  if (typeof valor === 'string' && /^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  const necesitaComillas = texto.includes(sep) || /["\r\n]/.test(texto)
  return necesitaComillas ? `"${texto.replaceAll('"', '""')}"` : texto
}

export const aCsv = (filas: (string | number | null)[][], sep: ';' | ',' = ';') =>
  '﻿' + filas.map((fila) => fila.map((v) => celda(v, sep)).join(sep)).join('\r\n')
```

El estándar usa `\r\n` entre filas; Excel acepta ambos, pero algunos sistemas de importación no.

## 4. Seguridad: inyección CSV

Si un valor empieza por `=`, `+`, `-` o `@`, Excel lo ejecuta como fórmula al abrir el archivo. Un cliente que escriba `=HYPERLINK("http://sitio-malicioso";"Ver factura")` en su nombre convierte tu exportación en un enlace engañoso para el equipo de contabilidad. Anteponer `'` hace que Excel lo trate como texto. Aplícalo solo a textos que vienen de usuarios, no a números negativos legítimos.

## 5. Descargar desde el navegador

```ts
export function descargar(csv: string, nombre = 'reporte.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000) // libera la memoria del Blob
}
```

Para exportaciones grandes (cientos de miles de filas), genera el archivo en el servidor: construirlo en el navegador bloquea la pestaña y consume mucha memoria.

## Errores frecuentes

- **Fechas ambiguas.** `03/04/2026` es 3 de abril en Colombia y 4 de marzo en Estados Unidos. Exporta `2026-04-03` (ISO), que Excel reconoce en cualquier región.
- **Ceros a la izquierda.** Un código `00123` o un NIT con ceros los pierde al abrirse como número. Si deben conservarse, avisa al usuario o exporta `.xlsx` desde el servidor.
- **Exportar lo que se ve, no lo que se filtra.** Si la tabla tiene filtros activos, decide (y di en el botón) si se exporta todo o solo lo filtrado.
- **Nombre de archivo genérico.** `reporte.csv` en la carpeta de descargas se confunde con el de ayer. Incluye la fecha: `ventas-2026-10-12.csv`.
