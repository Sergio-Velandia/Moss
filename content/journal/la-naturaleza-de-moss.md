---
title: La naturaleza de Moss
description: Por qué este jardín se llama "musgo" y cómo esa metáfora decidió su arquitectura sin base de datos, sin backend y hecha de archivos.
type: journal
category: Filosofía
tags: [filosofía, metáfora, minimalismo, archivos-estáticos, local-first, jardín-digital]
technologies: [Markdown, Git, Vite]
createdAt: 2026-10-11
related: [journal/por-que-moss-no-usa-base-de-datos, journal/como-funciona-la-busqueda-del-herbario, manual/react/estructura-de-proyecto]
---

## Un nombre antes que un proyecto

Cuando empecé este espacio no tenía claro qué iba a ser, pero sí cómo quería que se sintiera. No quería un blog con fechas que envejecen ni una wiki rígida que exige ordenarlo todo antes de escribir. Quería algo que creciera un poco cada día, sin ceremonia, y que siguiera vivo aunque lo dejara quieto unas semanas.

Buscando una imagen para esa idea, me quedé con el **musgo**. Y cuanto más lo pensaba, más decisiones técnicas encontraba escondidas en él.

## El musgo no tiene raíces profundas

El musgo no tiene raíces de verdad. Se sujeta a la superficie con unos filamentos finos (los *rizoides*) y absorbe el agua y los nutrientes directamente por sus hojas. No necesita excavar, ni un suelo profundo, ni un sistema que lo sostenga desde abajo.

Moss tampoco. No tiene base de datos, ni servidor, ni panel de administración. No hay un SQL al que conectarse ni un backend que mantener encendido. Todo lo que sabe está en la superficie: archivos Markdown en una carpeta y componentes en otra. Lo expliqué con más detalle en [por qué Moss no usa base de datos](/bitacora/por-que-moss-no-usa-base-de-datos), pero la intuición venía de aquí: **cuanta menos infraestructura necesite algo para existir, menos cosas pueden matarlo**.

Un servidor se cae, una base de datos se corrompe, un servicio cambia de precio o desaparece. Una carpeta de archivos de texto sobrevive a casi todo.

## Crece desde los bordes

El musgo no crece desde un tronco central. Se expande por los bordes, una pequeña porción cada vez, y cada porción nueva es igual de completa que la anterior.

Así crece este jardín. Añadir conocimiento es crear un archivo:

- Una guía nueva es `content/manual/<categoría>/<nombre>.md`.
- Un artículo es `content/journal/<nombre>.md`.
- Una demo es un componente en `src/lab/entries/`.

No hay un esquema que migrar ni un formulario que rellenar. Cada archivo es una unidad completa y se suma a las demás sin pedir permiso. Al compilar, Vite recoge todo lo que encuentra en esas carpetas y el sitio crece solo. Es crecimiento por acumulación, no por planificación.

## Las conexiones aparecen solas

En un bosque, el musgo termina uniendo cosas que no tenían relación: una piedra, un tronco caído, la base de un árbol. No las conecta a propósito; simplemente crece sobre todas.

En Moss, esas conexiones son el campo `related` de cada documento y el buscador del Herbario. Una guía de SQL apunta a una demo, un artículo apunta a una guía. No diseño la red de antemano: aparece a medida que el contenido se toca. Y una prueba automática se asegura de que ninguna conexión apunte a algo que ya no existe, igual que el musgo no crece sobre el vacío.

## Lo mínimo para vivir

El musgo es una de las plantas más simples que existen. No tiene flores, ni semillas, ni madera. Y precisamente por eso fue de las primeras en colonizar la tierra firme.

Intento que Moss sea igual de mínimo:

- El parser de frontmatter tiene unas pocas líneas y no admite listas multilínea. Es una limitación consciente: si necesito más, es señal de que el documento se está complicando.
- La búsqueda se construye en el navegador, la primera vez que hace falta. No hay un servicio de búsqueda.
- El código de cada demo que se muestra en la web es el propio archivo de la demo. No existe una copia que pueda quedarse desactualizada.

Cada pieza que no añado es una pieza que no tengo que mantener.

## Sobrevive en cualquier entorno

El musgo crece en piedras, tejados, cortezas y grietas del asfalto. Aguanta sequías dormido y revive con la primera lluvia.

El resultado de compilar Moss es una carpeta `dist/` con HTML, CSS y JavaScript. Esa carpeta puede vivir en GitHub Pages (donde vive hoy), en cualquier servidor de archivos estáticos o abrirse en local. Si mañana cambio de proveedor, me la llevo entera. Si dejo de escribir un mes, nada se apaga ni deja de pagarse: el jardín sigue ahí, esperando, y vuelve a crecer en cuanto añado un archivo.

## Lo que el musgo no hace

La metáfora también marca límites, y conviene ser honesto con ellos:

- **No hay escritura desde la web.** Para añadir algo necesito el editor y Git. Para un jardín personal es una ventaja; para un equipo de diez personas no lo sería.
- **No hay datos dinámicos.** Comentarios, contadores o usuarios necesitarían justamente esa infraestructura profunda que Moss evita.
- **No escala a cualquier tamaño.** Con miles de documentos, compilarlo todo en cada cambio o construir el índice de búsqueda en el navegador dejaría de ser razonable.

El musgo no pretende ser un roble. Y está bien: para lo que quiero (guardar, entender y reutilizar lo que aprendo), no necesito un roble.

## Lo que aprendí al ponerle nombre

Elegir el nombre me obligó a decidir qué tipo de proyecto quería antes de escribir código. Cada vez que dudo si añadir una dependencia, un servicio o una capa más, me pregunto si eso le daría al musgo raíces que no necesita. Casi siempre la respuesta es que sí, y casi siempre la descarto.

Un nombre bien elegido no es solo una etiqueta: es un criterio de diseño que se aplica solo.
