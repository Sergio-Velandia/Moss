---
title: Rutas con lo que ya existe
description: Por qué las rutas de aprendizaje de Moss no tienen contenido propio, sino que ordenan las guías, demos y artículos que ya estaban, y qué se gana y se pierde con eso.
type: journal
category: Arquitectura
tags: [rutas, decisiones, arquitectura, contenido, aprendizaje, una sola fuente]
technologies: [Markdown, React]
createdAt: 2026-10-14
related: [route/n8n-de-cero-a-produccion, journal/por-que-moss-no-usa-base-de-datos, journal/documentar-proyectos-sin-repetir-el-readme]
---

## La tentación de empezar de cero

Cuando decidí añadir rutas de aprendizaje a Moss, lo primero que imaginé fue un curso: lecciones escritas a propósito, en orden, con su propio texto. Una ruta de n8n con su capítulo de webhooks, otro de errores, otro de reintentos.

El problema es que todo eso ya estaba escrito. Moss tenía una guía de webhooks, otra de manejo de errores, una demo de reintentos con jitter y un artículo sobre webhooks que llegan dos veces. Escribir un curso habría sido escribirlo todo **dos veces**, y mantener dos versiones que tarde o temprano dejarían de coincidir.

## La decisión

Una ruta en Moss no tiene contenido propio, salvo una introducción corta: para quién es y qué se sabe hacer al terminar. Lo demás es una **lista ordenada de piezas que ya existen**:

```md
steps: [manual/n8n/webhook-basico, lab/n8n-payload-builder, manual/n8n/entender-webhooks-y-triggers, …]
```

Cada id apunta a una guía, una demo, un reto o un artículo publicado. La ruta no copia nada: ordena y conecta.

```flow
# De dónde sale una ruta
Contenido existente :: guías, demos, retos y artículos
Lista de pasos :: ids en orden en el frontmatter
validateRoute :: cada paso existe y no se repite
+ Ruta :: recorrido, tiempo estimado y progreso
```

## Qué se gana

```mindmap
Una sola fuente
- Mantener :: un solo lugar por tema
  - corregir una guía corrige todas sus rutas
- Comprobar :: las pruebas lo vigilan
  - un paso que no existe falla el build
- Conectar :: ida y vuelta
  - la ruta lleva a la guía
  - la guía dice en qué ruta está
- Medir :: sin inventar
  - el tiempo sale de la lectura real
```

- **Corregir una vez.** Si mañana cambia algo en el nodo Webhook de n8n, se actualiza la guía y las rutas que la incluyen quedan al día solas.
- **Nada apunta al vacío.** `validateRoute` exige que cada paso exista, que no se repita y que la ruta mezcle al menos dos secciones. Si se renombra o se borra una guía, las pruebas fallan antes de publicar una ruta rota.
- **Las piezas saben a qué rutas pertenecen.** Como la ruta solo guarda ids, cualquier guía puede preguntar «¿en qué rutas estoy?» y mostrar el paso anterior y el siguiente. Una misma guía, la de verificar la interfaz con capturas, aparece en dos rutas distintas sin duplicarse.
- **El tiempo estimado no se inventa.** Sale del tiempo de lectura de cada documento, más una estimación fija para las demos.

## Qué se pierde

No todo es ventaja, y conviene decirlo:

- **Las piezas no se escribieron para leerse en orden.** Cada guía se entiende sola, así que en una ruta a veces repite una idea que el paso anterior ya explicó. Un curso escrito a propósito fluiría mejor.
- **Una ruta solo puede ser tan completa como el contenido que existe.** Si falta una guía, la ruta tiene un hueco. Las rutas muestran también qué falta escribir.
- **El orden depende de otro.** Cambiar el enfoque de una guía puede volverla un mal paso para alguna ruta, y eso no lo detecta ninguna prueba: hay que releer la ruta.

## El caso de Moss Nexus

La misma idea explica cómo termina la ruta de n8n. En lugar de copiar flujos de Nexus dentro de Moss, la ruta cierra con una invitación a visitarlo. Cada sitio hace lo suyo: Moss explica el porqué y Nexus entrega el flujo listo para copiar. Ninguno de los dos duplica al otro.

## Lo que aprendí

Antes de crear contenido nuevo, vale la pena preguntarse si lo que falta es contenido o es **orden**. En este caso era orden: el conocimiento estaba, pero suelto. Las rutas no añadieron información a Moss; añadieron caminos a través de la que ya había.
