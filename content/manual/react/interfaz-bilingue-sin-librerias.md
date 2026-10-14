---
title: Interfaz bilingüe sin librerías
description: Un selector ES/EN con useSyncExternalStore, enlaces compartibles con ?lang= y contenido que sigue en su idioma, sin instalar nada.
type: manual
tags: [i18n, idiomas, useSyncExternalStore, accesibilidad, estado global]
technologies: [React, TypeScript]
createdAt: 2026-10-13
related: [manual/react/estructura-de-proyecto, project/moss, journal/accesibilidad-que-no-se-ve]
references: [React: useSyncExternalStore | https://react.dev/reference/react/useSyncExternalStore, MDN: atributo lang | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang, MDN: URLSearchParams | https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams]
---

## Problema que resuelve

Quieres que tu sitio se pueda leer en inglés, pero no tienes (ni quieres mantener) traducciones de todo el contenido. Lo que sí se puede traducir es la **interfaz**: navegación, botones, filtros y avisos. Para dos idiomas y textos cortos, una librería de i18n es más configuración que problema resuelto.

Esta es la solución que usa Moss: un estado pequeño fuera de React, un hook para leerlo y un objeto de textos por componente.

```mindmap
Interfaz bilingüe
- Estado :: fuera de React
  - getLang y setLang
  - suscriptores
- Origen :: de dónde sale el idioma
  - ?lang= en la URL
  - localStorage
  - español por defecto
- Textos :: junto a cada componente
  - TEXT con es y en
  - useT(TEXT)
- Accesibilidad :: que se lea bien
  - lang del documento
  - lang="es" en el contenido
```

## El estado: un "store" de diez líneas

El idioma vive fuera de React, igual que el tema claro y oscuro. Cualquier componente se suscribe con `useSyncExternalStore`, el hook de React pensado justamente para leer estados externos sin desincronizarse.

```ts
// src/lib/i18n.ts
import { useSyncExternalStore } from 'react'

export type Lang = 'es' | 'en'
const KEY = 'moss-lang'
const listeners = new Set<() => void>()
const isLang = (v: unknown): v is Lang => v === 'es' || v === 'en'

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLang(fromUrl)) return fromUrl // un enlace compartido manda
  try {
    const stored = localStorage.getItem(KEY)
    if (isLang(stored)) return stored // la última elección
  } catch {
    /* almacenamiento bloqueado: seguimos */
  }
  return 'es'
}

let current: Lang = initialLang()
document.documentElement.lang = current

export function setLang(lang: Lang) {
  current = lang
  document.documentElement.lang = lang // los lectores de pantalla cambian de voz
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* el idioma solo dura la sesión */
  }
  listeners.forEach((l) => l())
}

const subscribe = (cb: () => void) => (listeners.add(cb), () => void listeners.delete(cb))
export const useLang = () => useSyncExternalStore(subscribe, () => current, () => 'es' as const)
export const useT = <T,>(text: Record<Lang, T>): T => text[useLang()]
```

¿Por qué no un Context? Funciona igual de bien, pero obliga a envolver la app en un proveedor y a separarlo en su propio archivo para que el recargado en caliente de Vite no se queje. El store externo es un módulo normal: se puede llamar a `setLang` desde cualquier sitio, incluso fuera de un componente.

## Los textos: al lado de quien los usa

```tsx
const TEXT = {
  es: { title: 'El Herbario', results: (n: number) => `${n} resultado${n === 1 ? '' : 's'}` },
  en: { title: 'The Herbarium', results: (n: number) => `${n} result${n === 1 ? '' : 's'}` },
}

export default function Herbario() {
  const t = useT(TEXT)
  return <h1>{t.title}</h1>
}
```

- **Funciones para lo que cambia:** plurales y textos con números son funciones, no cadenas con marcadores.
- **TypeScript vigila:** si a `en` le falta una clave que tiene `es`, el tipo no coincide y el build falla.
- **Claves estables en las listas:** usa ids fijos como `key`, nunca el texto traducido. Si la `key` cambia con el idioma, React vuelve a crear el elemento y se pierde su estado.

## El flujo completo

```flow
# Del clic al texto traducido
Selector ES/EN :: setLang('en')
Store :: guarda, actualiza lang y avisa
useSyncExternalStore :: cada componente suscrito se vuelve a pintar
+ Interfaz en inglés :: el contenido sigue marcado como español
```

## El contenido que no se traduce

Las guías y artículos siguen en español. En inglés, la página lo dice y el contenido lleva `lang="es"`, para que un lector de pantalla no lo pronuncie con voz inglesa:

![Página de un proyecto de Moss con la interfaz en inglés: la ficha dice Status, Documented at y Last reviewed, y un aviso indica que el contenido está escrito en español](/imagenes/ficha-de-proyecto-en-ingles-1024x365.webp "La interfaz cambia de idioma; el contenido avisa de que sigue en español")

```tsx
<h1 lang="es">{doc.title}</h1>
<SpanishNote /> {/* "This content is written in Spanish." solo en inglés */}
<div lang="es">
  <MarkdownView source={doc.body} />
</div>
```

## Errores frecuentes

- **Olvidar `<html lang>`.** Cambiar los textos sin cambiar el atributo `lang` del documento hace que el lector de pantalla lea inglés con pronunciación española.
- **Traducir el texto dentro de la `key`.** El elemento se recrea al cambiar de idioma y pierde lo que tenía (foco, animaciones, estado).
- **Leer `localStorage` sin `try`.** En modo privado o con el almacenamiento bloqueado, `localStorage` lanza una excepción y la app no arranca.
- **Fechas a mano.** Usa `toLocaleDateString(lang, …)` en lugar de escribir los meses: "12 de octubre de 2026" y "October 12, 2026" salen del mismo código.
