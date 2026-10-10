---
title: Cómo funciona la búsqueda del Herbario
description: Las decisiones detrás del buscador de Moss, que funciona sin servidor: tildes, palabras vacías, erratas y qué hacer cuando no hay resultados.
type: journal
category: Arquitectura
tags: [búsqueda, minisearch, rendimiento, local-first]
technologies: [TypeScript, MiniSearch]
createdAt: 2026-10-10
related: [journal/por-que-moss-no-usa-base-de-datos, manual/javascript/debounce-y-throttle]
---

## El objetivo

Un jardín de conocimiento solo sirve si encuentro lo que guardé. Quería escribir "animacion entrada" (sin tilde, con prisa) y llegar a la demo correcta, sin servidor de búsqueda.

## Por qué MiniSearch

Como Moss no tiene backend, el índice tiene que vivir en el navegador. MiniSearch es pequeño, no tiene dependencias y admite búsqueda por prefijo y búsqueda tolerante a erratas. Con cientos de entradas responde al instante.

## Las decisiones

### 1. Normalizar tildes y mayúsculas

Cada término pasa por la misma función al indexar y al buscar: minúsculas y sin tildes. Así "animación", "Animacion" y "animacion" son la misma palabra.

```ts
const normalize = (term: string) => term.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
```

### 2. Ignorar palabras vacías

"de", "para", "con"… aparecen en casi todos los documentos y no ayudan a distinguirlos. Se descartan antes de indexar.

### 3. No todos los campos pesan igual

Una coincidencia en el título vale más que una en el cuerpo del texto. El título pesa ×3, las etiquetas y tecnologías ×2 y la descripción ×1,5.

### 4. Exigir todas las palabras… salvo que no haya nada

Primero busco con `AND`: el resultado debe contener **todas** las palabras de la consulta, que es lo que uno espera. Si eso no devuelve nada, repito con `OR`. Así una consulta demasiado específica no termina en una pantalla vacía.

### 5. Construir el índice solo cuando hace falta

El índice no se crea al cargar la web, sino la primera vez que alguien busca. Además, la página del Herbario se descarga aparte (lazy loading), así que quien solo lee un artículo no paga ese coste.

## Lo que indexa

Título, descripción, etiquetas, tecnologías y el **contenido completo**, incluido el código fuente de las demos del Laboratorio. Buscar `useReducedMotion` encuentra las demos que lo usan.

## Lo que aprendí

- La mitad de una buena búsqueda es **preparar el texto** (normalizar, limpiar), no el algoritmo.
- Un plan B (`OR` cuando `AND` falla) mejora más la experiencia que afinar los pesos.
- Los filtros por tipo y tecnología viven en la URL (`?q=…&tipo=…`), así que una búsqueda se puede compartir o guardar en favoritos.

## Cuándo lo cambiaría

Si Moss llega a miles de entradas, cargar todo el contenido en el navegador dejará de ser razonable. Entonces tocaría generar el índice en el build o pasar a un buscador en el servidor.
