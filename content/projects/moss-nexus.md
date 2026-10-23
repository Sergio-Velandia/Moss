---
title: Moss Nexus
description: Librería estática de flujos de n8n ya armados y explicados, con un mapa del flujo y un botón para copiarlo.
type: project
status: estable
theme: nexus
version: 1.0.0
reviewedAt: 2026-10-22
repo: https://github.com/Sergio-Velandia/Moss-Nexus
site: https://sergio-velandia.dev/Moss-Nexus/
tags: [arquitectura, n8n, plantillas, decisiones, sin backend, sitio estático]
technologies: [React, TypeScript, Vite, n8n]
createdAt: 2026-10-12
related: [route/publicar-y-mantener-un-sitio, manual/n8n/entender-webhooks-y-triggers, manual/n8n/orquestacion-y-manejo-de-errores, manual/apis/idempotencia-en-pagos-y-webhooks, journal/migrando-scripts-a-n8n]
---

## Ficha

Moss Nexus es el sitio hermano de Moss: una galería de plantillas de n8n que se buscan, se entienden con un mapa del flujo y se copian a n8n con un clic. En Moss se aprende el porqué; en Nexus se copia el flujo y se usa.

**Problema que resuelve:** mucha gente sabe qué quiere automatizar, pero se paraliza con webhooks, JSON, tokens y credenciales antes de terminar su primer flujo. Nexus entrega el flujo completo, qué hace cada paso y qué se necesita antes de empezar. La lista de plantillas y cómo se usa el sitio están en el [README](https://github.com/Sergio-Velandia/Moss-Nexus#readme) y en el propio [sitio](https://sergio-velandia.dev/Moss-Nexus/).

**Estado real (v1.0.0, estable):** 13 plantillas de n8n en español. **9 tienen el sello «Probado»**, con la fecha y la versión de n8n (2.43.5) de una prueba real con datos ficticios y casos trampa, y **4 se muestran como «Sin probar»** de forma visible, con un filtro «Solo probadas» en el catálogo. Tiene un formulario «Propón un flujo» para recibir ideas. Desde aquí crece con plantillas nuevas y nuevos sellos, con versionado SemVer normal.

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
- **Decisión:** una plantilla inválida se omite y las pruebas fallan. **En vez de:** dejar que el sitio falle. **Porque:** un error en una plantilla no debe tumbar las demás, pero tampoco puede pasar desapercibido.
- **Decisión:** pruebas que impiden publicar workflows con credenciales, datos fijados (`pinData`) o el id de la instancia. **En vez de:** revisar cada exportación a mano. **Porque:** los `workflow.json` se publican tal cual en el repositorio y cualquiera puede descargarlos; un descuido expondría datos.
- **Decisión:** el sello «Probado» es opcional y solo se añade con la fecha y la versión de n8n de una prueba real. **En vez de:** presentar todas las plantillas como probadas. **Porque:** el sitio no debe prometer más de lo verificado. Por eso las 4 plantillas que aún no se probaron se ven como «Sin probar», y una prueba falla si una plantilla sin sello dice en sus textos que está probada.
- **Decisión:** un `index.html` por ruta y por plantilla, con su título y descripción, más un `sitemap.xml`. **En vez de:** depender solo del `404.html` de GitHub Pages. **Porque:** así cada página responde 200, se puede indexar y se ve bien al compartirla.

## Lecciones

- **No prometer en la interfaz lo que los datos no respaldan.** Los primeros textos decían que todas las plantillas estaban probadas, y no era así. Ahora el sello solo aparece con fecha y versión reales, y las cifras se calculan desde los datos.
- **El mapa hay que diseñarlo para el flujo más largo y para el móvil.** Las etiquetas se salían, el mapa se encogía hasta quedar ilegible y los caminos en paralelo no cabían en pantallas angostas.
- **Las rutas de una SPA en Pages responden 404.** Generar una página por ruta debería haber estado desde la primera fase.
- **Registrar primero, avisar después.** Un aviso de Slack o Gmail que fallaba dejaba registros sin hacer. Una auditoría de las 13 plantillas corrigió el orden en las que lo tenían al revés: el registro va antes, y el aviso no puede impedirlo.
- **Probar con casos trampa.** Fines de semana, fechas pasadas, bandejas vacías e instrucciones escondidas para la IA encontraron errores que el caso feliz nunca mostró. Cada prueba dejó correcciones reales, documentadas en «Problemas frecuentes» y «Limitaciones».
- **El trigger de Gmail engaña al probar.** Con «Execute» trae un solo correo; para probar varios hay que publicar el flujo.
- **La IA, intercambiable.** Las plantillas con IA usan un Basic LLM Chain con Gemini por defecto: cambiar de proveedor es cambiar el sub-nodo del modelo, y el prompt trata el correo como datos, nunca como instrucciones.
- **Lo que haría distinto:** validar `diagram.json` contra `workflow.json`, que son dos descripciones del mismo flujo escritas por separado.

## Roadmap

Sin fechas:

- Probar las 4 plantillas que siguen «Sin probar» (aprobación de gastos, pagos con Stripe, leads a HubSpot y WhatsApp a Sheets) y sellar las que pasen.
- Seguir sumando plantillas sueltas, cada una en su propia versión MINOR.
- Idea por evaluar: una prueba que compare los nodos de `diagram.json` con los de `workflow.json`, para que el mapa no se desactualice.
