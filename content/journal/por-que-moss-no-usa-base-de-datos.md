---
title: Por qué Moss no usa base de datos
description: La decisión de guardar todo el conocimiento en archivos Markdown y qué se gana y se pierde con ello.
type: journal
category: Arquitectura
tags: [decisiones, markdown, git, local-first]
technologies: [React, Vite, Markdown]
createdAt: 2026-10-10
related: [manual/react/estructura-de-proyecto]
---

## La decisión

Moss guarda todo su contenido en archivos Markdown dentro del repositorio. No hay base de datos, ni backend, ni panel de administración. Crear una entrada nueva es crear un archivo.

## Por qué

- **Fricción cero.** Si añadir un documento requiere abrir un panel, iniciar sesión y rellenar un formulario, termino no documentando. Un archivo nuevo en el editor es lo más cercano a pensar en voz alta.
- **Todo versionado.** Cada cambio queda en Git: puedo ver cuándo escribí algo y volver atrás.
- **Portable.** Son archivos de texto. Si mañana cambio de herramienta, mi conocimiento se va conmigo.
- **Nada que mantener.** Sin servidor ni base de datos no hay nada que se caiga, caduque o cueste dinero.

## Lo que se pierde

- **Editar desde el navegador.** Solo se edita desde el editor de código.
- **Búsqueda en el servidor.** Todo el índice vive en el navegador, lo cual funciona bien mientras el contenido sea de cientos de entradas, no de decenas de miles.
- **Datos que cambian por usuario**, como favoritos sincronizados entre dispositivos.

## Cuándo lo reconsideraría

Si el volumen de contenido hace lenta la búsqueda, o si necesito algo que dependa de una cuenta (favoritos entre dispositivos, por ejemplo), añadiré un backend. Hasta que la necesidad sea real, la herramienta más simple es la correcta.
