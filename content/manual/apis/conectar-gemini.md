---
title: Conectar la API de Gemini de forma segura
description: Llamar a Gemini desde un servidor con la clave en una variable de entorno, sin exponerla en el navegador ni en GitHub.
type: manual
tags: [gemini, ia, api, variables de entorno, seguridad]
technologies: [Gemini, Node.js, JavaScript]
createdAt: 2026-10-10
updatedAt: 2026-10-10
related: [manual/react/estructura-de-proyecto]
references: [Documentación de la API de Gemini | https://ai.google.dev/gemini-api/docs, Crear y usar claves de API | https://ai.google.dev/gemini-api/docs/api-key, Modelos disponibles | https://ai.google.dev/gemini-api/docs/models, Variables de entorno en Vite | https://vite.dev/guide/env-and-mode]
---

## Problema que resuelve

Quiero usar un modelo de Gemini en un proyecto sin filtrar la clave de API. Este repositorio es público, así que **nunca** va una clave real en el código ni en un archivo versionado.

## Regla de oro

En Vite, cualquier variable que empiece por `VITE_` se incluye en el código que se descarga en el navegador. Si pones la clave ahí, cualquiera puede verla. La llamada a Gemini debe hacerse desde un **servidor o una función serverless**, y el navegador llama a tu servidor.

```flow
# Por dónde viaja la clave (y por dónde no)
Navegador :: tu app React, sin ninguna clave
Tu servidor :: lee GEMINI_API_KEY de .env
API de Gemini :: recibe la clave en x-goog-api-key
+ Respuesta :: el servidor devuelve solo el texto al navegador
```

## Paso 1: guardar la clave en `.env`

```bash
# .env  (ignorado por Git, nunca se sube)
GEMINI_API_KEY=tu_clave_aqui
```

Y en el repositorio, un `.env.example` con el valor ficticio para recordar qué variables hacen falta.

## Paso 2: llamar a la API desde el servidor

```javascript
// server/gemini.js (Node 18 o superior, usa fetch nativo)
const MODELO = 'nombre-del-modelo' // consulta la documentación oficial para el nombre vigente

export async function preguntar(texto) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: texto }] }] }),
  })

  if (!res.ok) throw new Error(`Gemini respondió ${res.status}`)

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
```

## Requisitos

- Una clave creada en Google AI Studio.
- Node 18 o superior (por `fetch` nativo).

## Errores frecuentes

- **Clave en el frontend.** Si el código de React llama directamente a Gemini con la clave, la clave queda expuesta.
- **Nombre de modelo obsoleto.** Los nombres de modelos cambian con el tiempo; si recibes un 404, revisa la lista vigente en la documentación oficial.
- **Subir `.env` a GitHub.** Verifica que `.env` esté en el `.gitignore` antes del primer commit. Si una clave llegó a subirse, **revócala y crea otra**: borrar el archivo no basta, queda en el historial.
- **Respuesta vacía.** Puede venir bloqueada por filtros de seguridad; revisa el resto del objeto de respuesta antes de asumir que falló la llamada.
