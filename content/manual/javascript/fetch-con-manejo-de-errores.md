---
title: Fetch con manejo de errores y tiempo límite
description: Una función reutilizable sobre fetch que detecta errores HTTP, cancela peticiones lentas y devuelve JSON tipado.
type: manual
tags: [fetch, http, errores, abortcontroller, timeout, async]
technologies: [JavaScript, TypeScript]
createdAt: 2026-10-10
related: [manual/apis/conectar-gemini, manual/apis/paginacion-y-limites-de-tasa, lab/button-states]
references: [MDN: Usar Fetch | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch, MDN: Response.ok | https://developer.mozilla.org/en-US/docs/Web/API/Response/ok, MDN: AbortSignal.timeout() | https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static, MDN: AbortController | https://developer.mozilla.org/en-US/docs/Web/API/AbortController]
---

## Problema que resuelve

`fetch` tiene una trampa: **no lanza error cuando el servidor responde 404 o 500**. Solo falla si no hay red. Además, no tiene tiempo límite, así que una petición colgada puede dejar la interfaz en "Cargando…" para siempre.

## La función

```ts
export class HttpError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`HTTP ${status}`)
  }
}

export async function fetchJson<T>(url: string, options: RequestInit & { timeout?: number } = {}): Promise<T> {
  const { timeout = 8000, ...init } = options

  // AbortSignal.timeout cancela la petición si tarda demasiado
  const res = await fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(timeout),
    headers: { Accept: 'application/json', ...init.headers },
  })

  if (!res.ok) throw new HttpError(res.status, await res.text())
  return res.json() as Promise<T>
}
```

```mindmap
Los cuatro finales de una petición
- + 2xx :: res.ok es true y devuelve el JSON
- ! 4xx o 5xx :: lanza HttpError con el status
- ! TimeoutError :: el servidor tardó más del límite
- AbortError :: se canceló a propósito; no es un fallo
```

## Cómo usarla

```ts
interface Usuario {
  id: number
  nombre: string
}

try {
  const usuario = await fetchJson<Usuario>('/api/usuarios/1')
  console.log(usuario.nombre)
} catch (err) {
  if (err instanceof HttpError && err.status === 404) {
    console.log('No existe')
  } else if (err instanceof DOMException && err.name === 'TimeoutError') {
    console.log('El servidor tardó demasiado')
  } else {
    console.log('Sin conexión u otro error', err)
  }
}
```

## Enviar datos (POST)

```ts
await fetchJson('/api/notas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ texto: 'Hola' }),
})
```

## Cancelar al salir de un componente en React

Si el usuario cambia de página antes de que llegue la respuesta, conviene cancelar:

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetchJson<Usuario>('/api/usuarios/1', { signal: controller.signal })
    .then(setUsuario)
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err)
    })
  return () => controller.abort()
}, [])
```

## Errores frecuentes

- **Confiar en `catch` para los 4xx/5xx.** Sin comprobar `res.ok`, un 500 llega como "éxito" y falla después, al leer datos que no existen.
- **Llamar a `res.json()` en respuestas vacías.** Un `204 No Content` no tiene cuerpo y `json()` lanza error. Comprueba `res.status === 204` antes si tu API lo usa.
- **Mostrar el error de una petición cancelada.** Un `AbortError` es normal cuando el usuario se va; no es un fallo que deba ver.
- **Poner claves de API en el `fetch` del navegador.** Cualquiera puede verlas en las herramientas de desarrollo. Ver [Conectar la API de Gemini de forma segura](/manual/apis/conectar-gemini).
