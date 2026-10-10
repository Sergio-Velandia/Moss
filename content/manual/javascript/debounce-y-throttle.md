---
title: Debounce y throttle en JavaScript
description: Dos formas de limitar cuántas veces se ejecuta una función, cuándo usar cada una y cómo usarlas en React.
type: manual
tags: [debounce, throttle, rendimiento, eventos, búsqueda]
technologies: [JavaScript, TypeScript, React]
createdAt: 2026-10-10
related: [journal/como-funciona-la-busqueda-del-herbario]
---

## Problema que resuelve

Algunos eventos se disparan decenas de veces por segundo: escribir en un buscador, hacer scroll, redimensionar la ventana. Si cada uno lanza una petición o un cálculo costoso, la página se vuelve lenta o saturas una API.

## La diferencia en una frase

- **Debounce:** espera a que el evento **deje de ocurrir** durante X ms y entonces ejecuta una vez.
- **Throttle:** ejecuta **como máximo una vez** cada X ms mientras el evento sigue ocurriendo.

| Caso | Usa |
| --- | --- |
| Buscador que consulta una API al escribir | Debounce |
| Autoguardado de un formulario | Debounce |
| Posición del scroll, barra de progreso | Throttle |
| Arrastrar un elemento, `mousemove` | Throttle |

## Debounce

```ts
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

const buscar = debounce((q: string) => console.log('Buscando', q), 300)
input.addEventListener('input', (e) => buscar((e.target as HTMLInputElement).value))
```

Cada pulsación reinicia el temporizador; solo la última sobrevive.

## Throttle

```ts
export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait = 100) {
  let last = 0
  return (...args: A) => {
    const now = Date.now()
    if (now - last < wait) return
    last = now
    fn(...args)
  }
}

window.addEventListener('scroll', throttle(() => console.log(window.scrollY), 100))
```

## En React: un hook `useDebouncedValue`

En React es más cómodo retrasar el **valor** que la función:

```tsx
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, wait = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), wait)
    return () => clearTimeout(id) // si el valor cambia antes, se cancela
  }, [value, wait])
  return debounced
}

// Uso
const [q, setQ] = useState('')
const debouncedQ = useDebouncedValue(q)
useEffect(() => {
  if (debouncedQ) fetch(`/api/buscar?q=${encodeURIComponent(debouncedQ)}`)
}, [debouncedQ])
```

El input sigue respondiendo al instante (`q`), pero la petición solo sale cuando dejas de escribir.

## Errores frecuentes

- **Crear el debounce dentro del componente en cada render.** Cada render crea un temporizador nuevo y el debounce no funciona. Usa el hook anterior o envuelve la función en `useMemo`.
- **Olvidar limpiar el temporizador.** Si el componente se desmonta, el `setTimeout` sigue vivo y puede actualizar estado que ya no existe.
- **Debounce donde no hace falta.** Si el cálculo es local y barato (como filtrar 100 elementos), aplicarlo solo añade retraso.
