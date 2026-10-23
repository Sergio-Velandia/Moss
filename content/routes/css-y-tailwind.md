---
title: CSS y Tailwind, de las bases a interfaces reales
description: De la cascada y los tokens a construir botones, tarjetas y chips accesibles con Tailwind 4, como en Moss y Moss Nexus. Con retos que reproducen errores reales y piezas listas para copiar.
type: route
level: inicial
order: 2
tags: [css, tailwind, diseño, accesibilidad, componentes, ruta]
technologies: [CSS, Tailwind, React]
createdAt: 2026-10-22
steps: [lab/reto-grid-min-w-0, lab/reto-container-queries, manual/css/capas-y-tokens-en-tailwind-4, lab/reto-paleta-con-variables, journal/estados-de-un-boton, lab/button-states, lab/pieza-botones, lab/pieza-chips, lab/copy-button, journal/accesibilidad-que-no-se-ve, lab/accordion, journal/tarjeta-tilt-3d-apuntes, lab/tilt-card, lab/fade-in-list, lab/skeleton-loader, lab/pieza-tarjetas, manual/javascript/verificar-la-interfaz-con-capturas]
---

## Para quién es

Para quien ya escribe algo de HTML y CSS, o usa Tailwind copiando clases, y quiere entender **por qué** se ven así las interfaces de Moss y Moss Nexus: qué decide el tamaño de una caja, por qué una regla no se aplica, cómo se cambia de tema sin duplicar estilos y qué hace que un botón sea accesible.

Si ya trabajas con React y quieres ir a la estructura del proyecto, los idiomas y los datos, la ruta hermana es [Frontend con React y Tailwind](/rutas/frontend-con-react-y-tailwind).

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Maquetar :: sin sorpresas
  - grid que no desborda
  - container queries
- Tematizar :: con tokens
  - capas y especificidad
  - una paleta por componente
- Construir :: piezas reales
  - botones con estados
  - chips y tarjetas
- Cuidar :: a quien lo usa
  - foco y contraste
  - animación que respeta el movimiento reducido
```

## Cómo seguirla

La ruta tiene **9 pasos**. Hoy cada paso tiene su práctica en el Laboratorio (un reto que reproduce un error real o una pieza lista para copiar) y, cuando existe, su guía o su artículo. Las guías que faltan se irán sumando una por una; mientras tanto, la tabla dice qué cubrirá cada una.

| # | Paso | Para leer | Para practicar |
| --- | --- | --- | --- |
| 1 | El modelo de caja sin sorpresas | Próximamente: padding, borde, `box-sizing`, márgenes que colapsan y `overflow`, con las tarjetas de Moss como ejemplo. | [Pieza: tarjetas enlazadas](/laboratorio/pieza-tarjetas) |
| 2 | Flexbox y grid para layouts reales | Próximamente: cuándo usar cada uno, `min-w-0` y la rejilla de tarjetas de Moss. | [Reto: la tarjeta que rompe la cuadrícula](/laboratorio/reto-grid-min-w-0) |
| 3 | Unidades y diseño responsive | Próximamente: rem, `dvh`, móvil primero, `pointer-coarse:` y container queries. | [Reto: la cabecera que no cabe](/laboratorio/reto-container-queries) |
| 4 | Tema claro y oscuro sin parpadeo | Próximamente: `data-theme`, el script antes de pintar y `theme-color`, como en Moss. | [Reto: una tarjeta, tres identidades](/laboratorio/reto-paleta-con-variables) |
| 5 | Tailwind 4: capas, `@theme` y tokens | [Capas CSS y tokens en Tailwind 4](/manual/css/capas-y-tokens-en-tailwind-4) | [Reto: una tarjeta, tres identidades](/laboratorio/reto-paleta-con-variables) |
| 6 | Estados y variantes | Próximamente: `hover`, `focus-visible`, `aria-pressed`, `disabled`, `group-*` y el mapa de variantes de un botón. Mientras tanto: [Un botón también tiene estados](/bitacora/estados-de-un-boton) (bitácora). | [Botón con estados](/laboratorio/button-states), [Pieza: botones](/laboratorio/pieza-botones), [Pieza: chips](/laboratorio/pieza-chips), [Botón de copiar](/laboratorio/copy-button) |
| 7 | Contraste y foco visibles | Próximamente: contraste AA medido, anillos de foco y tamaño táctil. Mientras tanto: [La accesibilidad que no se ve](/bitacora/accesibilidad-que-no-se-ve) (bitácora). | [Acordeón accesible](/laboratorio/accordion) |
| 8 | Animar sin molestar | Próximamente: solo `transform` y `opacity`, `prefers-reduced-motion` y duraciones. Mientras tanto: [Apuntes sobre la tarjeta tilt 3D](/bitacora/tarjeta-tilt-3d-apuntes) (bitácora). | [Tarjeta tilt 3D](/laboratorio/tilt-card), [Animación escalonada](/laboratorio/fade-in-list), [Skeleton loader](/laboratorio/skeleton-loader) |
| 9 | De diseño a componente | Próximamente: variantes en un mapa, props mínimas y verificar con capturas. Mientras tanto: [Verificar la interfaz con capturas reales](/manual/javascript/verificar-la-interfaz-con-capturas). | [Pieza: tarjetas enlazadas](/laboratorio/pieza-tarjetas) |

La lista de abajo sigue ese orden con lo que ya está publicado (17 lecturas y demos), así que el aviso de cada pieza dice su posición en esa lista, no el número del paso.

En los retos, primero mira el error con «Sin arreglo», intenta explicar por qué pasa y después compruébalo con «Con arreglo». En las piezas, el código de la pestaña «Código» se copia tal cual: las notas dicen qué tokens de color necesita en tu proyecto.
