---
title: Paginación y límites de tasa en APIs de terceros
description: Traer todos los registros de una API paginada sin recibir 429, respetando Retry-After y reintentando con backoff y jitter.
type: manual
tags: [paginación, rate limit, 429, reintentos, backoff, jitter, integraciones, negocio]
technologies: [JavaScript, TypeScript, n8n]
createdAt: 2026-10-12
related: [lab/retry-backoff, manual/javascript/fetch-con-manejo-de-errores, manual/apis/idempotencia-en-pagos-y-webhooks]
references: [MDN: 429 Too Many Requests | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429, MDN: Retry-After | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After, AWS: backoff exponencial y jitter | https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/, n8n: nodo HTTP Request (paginación) | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/]
---

## Problema que resuelve

Hay que migrar 18.000 contactos del CRM antiguo, o sincronizar cada noche los productos del ERP con la tienda. La API devuelve 100 registros por página y permite, por ejemplo, 10 peticiones por segundo. El script ingenuo pide todas las páginas lo más rápido posible, recibe `429 Too Many Requests` a la página 40 y termina con datos a medias, sin que nadie sepa cuáles faltan.

```flow
# Una página cada vez, con freno
Pedir página :: con el cursor actual
? ¿Qué devolvió?
+ 200 :: guardar y seguir con el siguiente cursor | 429 o 503 :: esperar Retry-After o backoff | ! 4xx :: detener y avisar
? ¿Hay más páginas?
+ Fin :: todos los registros y un recuento
```

## Los dos tipos de paginación

| Tipo | Cómo se ve | Riesgo |
| --- | --- | --- |
| **Offset** | `?page=3&per_page=100` o `?offset=200` | Si se crean o borran registros mientras recorres, saltas o repites filas. |
| **Cursor** | `?cursor=eyJpZCI6...` y la respuesta trae `next_cursor` | Estable; el cursor marca dónde quedaste. Es la que conviene usar si la API la ofrece. |

## Reintentar bien: Retry-After, backoff y jitter

Ante un `429` (o un `503`), la API suele indicar cuánto esperar en el encabezado `Retry-After`: segundos (`Retry-After: 30`) o una fecha HTTP. Si no lo hace, espera cada vez más (**backoff exponencial**) y añade azar (**jitter**) para que varios procesos no vuelvan a la vez. El [simulador del Laboratorio](/laboratorio/retry-backoff) muestra por qué el azar importa.

```ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Milisegundos a esperar según Retry-After (segundos o fecha), o null si no viene. */
function retryAfterMs(res: Response): number | null {
  const value = res.headers.get('Retry-After')
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return seconds * 1000
  const date = Date.parse(value)
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now())
}

export async function fetchWithRetry(url: string, init: RequestInit = {}, maxAttempts = 5): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) })
    const retryable = res.status === 429 || res.status === 503
    if (!retryable || attempt === maxAttempts - 1) return res

    // "Full jitter": un valor al azar entre 0 y el máximo exponencial, con tope de 30 s
    const backoff = Math.random() * Math.min(30_000, 1000 * 2 ** attempt)
    await sleep(retryAfterMs(res) ?? backoff)
  }
}
```

Solo se reintentan `429` y `503`: un `400` o un `401` fallarán igual cada vez. Los errores de red y los tiempos límite también se pueden reintentar, pero solo si la petición es idempotente: un `GET` siempre; un `POST`, solo con [clave de idempotencia](/manual/apis/idempotencia-en-pagos-y-webhooks).

## Recorrer todas las páginas

```ts
interface Page<T> {
  data: T[]
  next_cursor: string | null
}

export async function fetchAll<T>(baseUrl: string, token: string): Promise<T[]> {
  const items: T[] = []
  let cursor: string | null = null
  let pages = 0

  do {
    const url = new URL(baseUrl)
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetchWithRetry(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Página ${pages + 1}: HTTP ${res.status}`)

    const page = (await res.json()) as Page<T>
    items.push(...page.data)
    cursor = page.next_cursor

    // Freno de seguridad: un cursor que nunca termina no debe dejar el proceso girando para siempre
    if (++pages > 10_000) throw new Error('Demasiadas páginas: revisa el cursor')
    await sleep(120) // margen bajo el límite de ~10 peticiones/segundo
  } while (cursor)

  return items
}
```

Al terminar, **compara el recuento** con el total que informe la API (muchas devuelven `total` o `count`). Una migración que "terminó bien" con 17.400 de 18.000 registros es peor que una que falla ruidosamente.

## En n8n

El nodo **HTTP Request** trae ambas cosas en *Options*:

- **Pagination:** modo *Update a Parameter in Each Request* (para offset o cursor, leyendo el siguiente valor de la respuesta con una expresión como `{{ $response.body.next_cursor }}`) o *Response Contains Next URL*. Define también la condición de parada.
- **Batching:** cuántas peticiones enviar por lote y cuánto esperar entre lotes, para no superar el límite de tasa.

Añade **Retry On Fail** con una espera razonable para los `429` esporádicos.

## Errores frecuentes

- **Ignorar Retry-After.** Reintentar antes de lo indicado alarga el bloqueo; algunas APIs penalizan con más tiempo.
- **Paginar por offset sobre datos que cambian.** Ordena por un campo estable (`id`) o usa cursor.
- **Guardar todo al final.** Si el proceso falla en la página 150, se pierde todo. Guarda por página y registra el último cursor para poder reanudar.
- **Reintentos sin tope.** Un error permanente se convierte en un bucle infinito. Limita intentos y avisa cuando se agoten.
