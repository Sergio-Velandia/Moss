---
title: Mi filtro era correcto y estaba mal
description: El filtro de facturas dejaba pasar justo lo que decía, y aun así subía logos a Drive. La salida limpia, quedarse solo con los PDF, habría perdido las facturas que llegan como captura de pantalla.
type: journal
category: Aprendizajes
tags: [n8n, moss nexus, filtros, datos reales, casos trampa, gmail, drive]
technologies: [n8n, Gmail, Google Drive]
createdAt: 2026-11-18
image: og/mi-filtro-era-correcto-y-estaba-mal.png
imageAlt: Tarjeta de Moss Bitácora con el título «Mi filtro era correcto y estaba mal». Un filtro solo por tipo deja pasar logos; uno solo de PDF pierde capturas; el elegido deja pasar la captura y frena el logo.
related: [journal/datos-sucios-el-problema-silencioso, manual/n8n/oauth2-de-google-en-n8n, project/moss-nexus]
---

## El síntoma

La carpeta de facturas en Drive se llenaba de archivos que no eran facturas: el logo del proveedor, la imagen de su firma, los íconos de redes sociales del pie del correo. Cada uno con su fila en la hoja de registro, como si fuera un soporte contable.

El filtro de [Facturas de Gmail a Drive](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/) hacía exactamente lo que decía: dejar pasar PDF, XML e imágenes JPG o PNG. Un logo es una imagen PNG. El filtro era correcto. Estaba mal.

## Por qué no bastaba con quitar las imágenes

La salida limpia parecía obvia: quedarse con PDF, XML y ZIP, que es como suele llegar la factura electrónica en Colombia (un PDF y un XML dentro de un ZIP), y descartar todas las imágenes. Una regla corta, sin excepciones y sin falsos positivos.

Pero hay proveedores que envían la factura como **captura de pantalla**. Con esa regla, esas facturas desaparecían en silencio: ni en Drive ni en la hoja, y sin ningún error que avisara. A fin de mes, contabilidad pediría un soporte que el flujo había tirado.

Una regla elegante que pierde datos reales es una regla mala. Un logo de más en Drive se ve y se borra; una factura perdida no se ve.

## Antes y después

```flow
# Antes: solo por tipo de archivo
Correo :: con la etiqueta «facturas»
Separar adjuntos :: PDF, XML, JPG o PNG pasan
! Drive :: el logo y la firma también se suben
```

```flow
# Después: tipo, peso y nombre
Correo :: con la etiqueta «facturas»
? ¿Es PDF, XML o ZIP?
+ Pasa siempre | ? Si es imagen :: ¿pesa 50 KB o más y no se llama logo ni firma?
+ Drive y registro :: la captura pasa y el logo se queda fuera
```

En palabras: antes, el nodo «Separar adjuntos» dejaba pasar cualquier PDF, XML o imagen. Después, PDF, XML y ZIP siempre pasan. Una imagen pasa solo si pesa al menos 50 KB y su nombre no parece un logo, una firma o un ícono de red social (`logo`, `firma`, `signature`, `banner`, `facebook`, `linkedin`…). Una captura de una factura pesa más que un logo, y casi nunca se llama `logo.png`.

## Dos formas de arreglarlo

1. **Solo documentos.** PDF, XML y ZIP, y ninguna imagen. Nunca se cuela un logo, pero se pierden las facturas que llegan como captura.
2. **Documentos siempre, e imágenes con condiciones.** Peso mínimo y un nombre que no parezca basura. Se puede colar un logo grande con un nombre raro, pero no se pierde una factura.

Elegí la segunda, y la plantilla lo dice como limitación: *el filtro de imágenes es una aproximación; se prefiere subir de más antes que perder una factura*. El umbral vive en una constante al inicio del nodo, `MIN_KB_IMAGEN`, con un comentario: súbelo si se cuelan logos, bájalo si tus proveedores envían capturas pequeñas. No todos los proveedores son iguales, y quien usa la plantilla conoce a los suyos.

Hubo un detalle que no se veía: n8n guarda el tamaño del adjunto como texto («12.3 kB»), no como número. Comparar ese texto con 50 habría fallado en silencio, así que el nodo lo convierte a KB antes de comparar.

## Cómo lo probé

- **En n8n, con datos ficticios.** La plantilla tiene el sello «Probado» del 15 de octubre de 2026, a las 21:40, en n8n 2.43.5. El filtro nuevo se guardó en el repositorio esa misma noche, a las 23:02, junto con el sello. El historial no muestra si la prueba se repitió con el filtro nuevo.
- **Lo que el sello cubre:** el paso de prueba de la plantilla es un correo con un PDF adjunto, que pasa con cualquiera de los dos filtros.
- **Lo que falta:** el filtro de imágenes no tiene una prueba propia en el repositorio. La que le corresponde es la de los casos que rompían la regla: un logo, una firma y una factura en captura, cada uno con su peso y su nombre.
- **Lo que no cubre ni con prueba:** un logo de más de 50 KB con un nombre poco común se sube igual. Está escrito en sus limitaciones.

## Lo que me llevo

- **Que una regla sea correcta no la hace buena.** Lo que importa es qué pasa con los datos que no se parecen a los de la prueba.
- **Equivocarse hacia el lado que se ve.** Un error que deja algo de más se corrige; uno que borra algo en silencio se descubre tarde.
- **La regla que no es perfecta se dice.** La limitación escrita vale más que una regla que finge no tenerla.

El problema de fondo, datos que llegan distintos a como los imaginas, es el mismo de [Datos sucios, el problema silencioso](/bitacora/datos-sucios-el-problema-silencioso).
