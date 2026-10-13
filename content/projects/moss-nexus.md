---
title: Moss Nexus
description: Librería estática de flujos de n8n ya armados y explicados, con un mapa del flujo y un botón para copiarlo.
type: project
status: activo
version: 0.7.0
reviewedAt: 2026-10-12
repo: https://github.com/Sergio-Velandia/Moss-Nexus
site: https://sergio-velandia.github.io/Moss-Nexus/
tags: [arquitectura, n8n, plantillas, decisiones, sin backend, sitio estático]
technologies: [React, TypeScript, Vite, n8n]
createdAt: 2026-10-12
related: [manual/n8n/entender-webhooks-y-triggers, manual/n8n/orquestacion-y-manejo-de-errores, manual/apis/idempotencia-en-pagos-y-webhooks, journal/migrando-scripts-a-n8n]
---

## Ficha

Moss Nexus es el sitio hermano de Moss: una galería de plantillas de n8n que se buscan, se entienden con un mapa del flujo y se copian a n8n con un clic. En Moss se aprende el porqué; en Nexus se copia el flujo y se usa.

**Problema que resuelve:** mucha gente sabe qué quiere automatizar, pero se paraliza con webhooks, JSON, tokens y credenciales antes de terminar su primer flujo. Nexus entrega el flujo completo, qué hace cada paso y qué se necesita antes de empezar. La lista de plantillas y cómo se usa el sitio están en el [README](https://github.com/Sergio-Velandia/Moss-Nexus#readme) y en el propio [sitio](https://sergio-velandia.github.io/Moss-Nexus/).

**Estado real (v0.7.0):** terminadas las fases de estructura, primeros flujos, catálogo de 14 plantillas, legal y repaso. Desde aquí la librería solo se actualiza con plantillas sueltas y correcciones. Ninguna plantilla tiene todavía el sello «Probado»: todas se publican como «Sin probar».

## Arquitectura

```mindmap
Moss Nexus
- Datos :: una carpeta por plantilla
  - meta.json
  - diagram.json
  - workflow.json
  - tools.ts y categories.ts
- Lógica :: funciones puras con pruebas
  - templates.ts
  - validate.ts
  - diagram.ts
  - search.ts
- Interfaz :: React Router
  - Galería
  - Detalle
  - FlowMap y FlowSteps
  - CopyFlowButton
- Entrega :: GitHub Pages
  - static-pages.ts
  - sitemap.xml
  - 404.html
```

Cada plantilla es una carpeta con tres archivos que cumplen papeles distintos. `meta.json` es la ficha para personas (problema, requisitos, pasos, nivel). `diagram.json` describe el mapa simplificado: nodos con una etiqueta legible y conexiones, sin coordenadas. `workflow.json` es el flujo de n8n que se copia. Los catálogos de herramientas y categorías viven en código, y la validación exige que cada plantilla use ids que existan.

La lógica no conoce React: el índice, la validación, el layout del mapa y la búsqueda son funciones con pruebas. El layout coloca cada nodo en la columna de su camino más largo desde el disparador y ordena cada columna por la posición media de sus padres para cruzar menos líneas. En pantallas angostas el mapa se reemplaza por una lista de pasos numerados.

## Flujo de datos

```flow
# De la carpeta al índice (al compilar)
Carpeta :: una por plantilla, con tres archivos
import.meta.glob :: meta y diagrama en el bundle; el workflow, aparte
? validate.ts :: ¿datos válidos?
+ Índice :: las probadas primero | ! Omitida :: aviso en consola y pruebas en rojo
```

```flow
# Del índice al flujo copiado (en el navegador)
Índice :: plantillas válidas
Galería :: búsqueda sin tildes y filtros en la URL
Detalle :: descarga el workflow al abrirse
Mapa :: dibujado desde diagram.json | + Copiar flujo :: workflow.json al portapapeles o como archivo
```

El índice se arma solo: agregar una plantilla es agregar una carpeta, sin tocar componentes. Si una plantilla tiene datos inválidos, se omite del sitio y se avisa en la consola, y las pruebas fallan hasta corregirla, así que nunca llega a publicarse rota. El `workflow.json` no viaja en el bundle: se descarga al abrir el detalle, para que el botón copie al instante. Si el portapapeles falla, el mismo flujo se ofrece como descarga `.json`.

## Decisiones

- **Decisión:** una carpeta por plantilla y un índice automático con `import.meta.glob`. **En vez de:** registrar cada plantilla a mano en una lista o un CMS. **Porque:** agregar una plantilla nunca exige cambiar componentes; es una regla escrita del proyecto.
- **Decisión:** el mapa se dibuja desde un `diagram.json` propio, con layout automático. **En vez de:** dibujarlo directamente desde `workflow.json` o escribir coordenadas a mano. **Porque:** el flujo de n8n trae detalles técnicos que no ayudan a entender, y un layout calculado no se rompe al cambiar un nodo. El costo es que mapa y flujo son dos archivos que pueden dejar de coincidir.
- **Decisión:** el `workflow.json` se carga aparte y se pide al abrir el detalle. **En vez de:** incluir todos los flujos en el bundle. **Porque:** la galería solo necesita la ficha y el mapa; el flujo completo solo hace falta en la página que lo copia.
- **Decisión:** una plantilla inválida se omite y las pruebas fallan. **En vez de:** dejar que el sitio falle. **Porque:** un error en una plantilla no debe tumbar las otras trece, pero tampoco puede pasar desapercibido.
- **Decisión:** pruebas que impiden publicar workflows con credenciales, datos fijados (`pinData`) o el id de la instancia. **En vez de:** revisar cada exportación a mano. **Porque:** los `workflow.json` se publican tal cual en el repositorio y cualquiera puede descargarlos; un descuido expondría datos.
- **Decisión:** el sello «Probado» es opcional y solo se añade con la fecha y la versión de n8n de una prueba real. **En vez de:** presentar todas las plantillas como probadas. **Porque:** el sitio no debe prometer más de lo verificado; por eso hoy las 14 aparecen como «Sin probar».
- **Decisión:** un `index.html` por ruta y por plantilla, con su título y descripción, más un `sitemap.xml`. **En vez de:** depender solo del `404.html` de GitHub Pages. **Porque:** así cada página responde 200, se puede indexar y se ve bien al compartirla.

## Roadmap

Sin fechas:

- Probar las plantillas en una instancia real de n8n y añadir el sello «Probado» a las que pasen.
- Añadir la imagen `og.png` que esperan los metadatos para compartir enlaces; hoy esa URL responde 404.
- Seguir sumando plantillas sueltas, cada una en su propia versión MINOR.
- Idea por evaluar: una prueba que compare los nodos de `diagram.json` con los de `workflow.json`, para que el mapa no se desactualice.
