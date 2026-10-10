---
title: La accesibilidad que no se ve
description: Lo que aprendí al navegar Moss solo con el teclado: el foco al cambiar de página, el menú móvil y el movimiento reducido.
type: journal
category: Aprendizajes
tags: [accesibilidad, a11y, teclado, foco, aria, wcag]
technologies: [React, React Router]
createdAt: 2026-10-10
related: [lab/accordion, lab/copy-button, lab/fade-in-list]
---

## La prueba

Un día desconecté el ratón y traté de usar Moss solo con el teclado. Se veía bien, pero no se podía usar bien. Ninguno de estos problemas aparece en una captura de pantalla.

## 1. Al cambiar de página, el foco se quedaba atrás

En una SPA, React Router cambia el contenido sin recargar la página. El navegador no se entera: el foco sigue en el enlace que pulsaste y un lector de pantalla no anuncia nada nuevo.

**Solución:** al cambiar la ruta, vuelvo arriba y muevo el foco al `<main>`, que tiene `tabIndex={-1}` para poder recibirlo sin entrar en el orden del tabulador.

```tsx
useEffect(() => {
  window.scrollTo(0, 0)
  mainRef.current?.focus({ preventScroll: true })
}, [pathname])
```

Me salto el primer render: al abrir la web, el foco debe empezar arriba, en "Saltar al contenido".

## 2. "Saltar al contenido"

Es un enlace invisible hasta que recibe el foco. Sin él, alguien que usa el teclado tiene que recorrer toda la navegación en cada página.

## 3. El menú móvil

- `aria-expanded` dice si está abierto o cerrado.
- **Escape** lo cierra y devuelve el foco al botón que lo abrió. Si no, el foco se pierde en algo que ya no existe.
- Los botones miden al menos 44 px en pantallas táctiles.

## 4. Menos movimiento si el sistema lo pide

Algunas personas se marean con las animaciones. Con `MotionConfig reducedMotion="user"`, todas las animaciones de Motion respetan la preferencia `prefers-reduced-motion` del sistema, y la tarjeta tilt se queda quieta.

## 5. Cada página con su título

El título de la pestaña es lo primero que anuncia un lector de pantalla y lo que ves en el historial. Un pequeño hook `useDocumentTitle` lo actualiza en cada página.

## Lo que me llevo

- La accesibilidad se prueba **usándola**: teclado, zoom al 200 % y el lector de pantalla del sistema.
- Casi todo es HTML correcto: un `<button>` de verdad en lugar de un `<div>` con `onClick` ya resuelve la mitad.
- Las nuevas demos del Laboratorio ([acordeón](/laboratorio/accordion) y [botón de copiar](/laboratorio/copy-button)) nacieron con esta lista en mente.
