---
title: Capas CSS y tokens en Tailwind 4
description: Por qué una regla sin capa le gana a una utilidad de Tailwind, cómo aislar la paleta de un componente con variables y cómo leerlas con bg-(--variable).
type: manual
tags: [css, tailwind, cascade layers, variables css, design tokens, temas, especificidad]
technologies: [CSS, Tailwind]
createdAt: 2026-10-13
related: [lab/reto-paleta-con-variables, lab/reto-container-queries, project/moss]
references: [MDN: @layer | https://developer.mozilla.org/en-US/docs/Web/CSS/@layer, MDN: color-mix() | https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix, Tailwind: variables del tema | https://tailwindcss.com/docs/theme, Tailwind: estilos propios | https://tailwindcss.com/docs/adding-custom-styles, MDN: :focus-visible | https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible]
---

## Problema que resuelve

Escribes una regla con un selector más específico y aun así no se aplica. O pones `outline-none` en un input y el contorno sigue ahí. En Tailwind 4 casi siempre es lo mismo: **las capas de la cascada**. Tailwind organiza su CSS en capas (`base`, `components`, `utilities`) y el CSS que escribes fuera de una capa juega con otras reglas.

Esta guía cubre los tres casos que aparecieron construyendo Moss: el foco que no cambiaba de color, el doble anillo en los buscadores y cómo dar a cada proyecto su propia paleta sin tocar el resto del sitio.

## La regla que sorprende: sin capa gana

Entre declaraciones normales, **lo que no está en ninguna capa le gana a lo que está en una capa**, sin importar la especificidad. Las utilidades de Tailwind viven en `@layer utilities`; tu CSS suelto, no.

```mindmap
Quién gana en la cascada
- 1 · Importancia :: !important invierte el orden
- 2 · Capas :: sin capa gana a cualquier capa
  - después utilities
  - después components
  - al final base
- 3 · Especificidad :: solo dentro de la misma capa
- 4 · Orden :: la última regla, si todo empata
```

Dos consecuencias reales en Moss:

```css
/* index.css: sin capa */
:focus-visible {
  outline: 2px solid var(--c-sage-deep);
}
```

- **El doble anillo.** Los buscadores tenían `outline-none` (una utilidad, en capa) y su contenedor dibujaba un anillo con `focus-within`. La regla global, sin capa, le ganaba a `outline-none`: se veían dos anillos.
- **El foco que no cambiaba de color.** La página de Nexus redefinía el color del foco dentro de `@layer components`. Más específica, pero en capa: la regla global seguía ganando y el foco salía verde salvia en lugar de coral.

La solución en los dos casos fue la misma: escribir la excepción **también sin capa**, con un selector más específico.

```css
/* Sin capa, como la regla global; gana por especificidad */
[role="search"] input:focus-visible {
  outline: none; /* el contenedor ya marca el foco */
}
.nexus :focus-visible {
  outline-color: var(--nx-coral);
}
```

Y la regla inversa para tus clases de componente: **ponlas dentro de `@layer components`**, así una utilidad de Tailwind en el marcado puede ajustarlas sin pelear.

## Tokens: variables que cambian según el tema

Moss define sus colores como variables CSS y las expone a Tailwind con `@theme inline`, que crea utilidades como `bg-cream` o `text-sage-deep`:

```css
:root {
  --c-sage-deep: #476140;
}
:root[data-theme="dark"] {
  --c-sage-deep: #a9c795;
}
@theme inline {
  --color-sage-deep: var(--c-sage-deep);
}
```

`inline` hace que la utilidad use la variable, no su valor: al cambiar `data-theme`, todo se repinta sin volver a renderizar nada.

## Una paleta por componente: variables con alcance

Para que cada tarjeta de `/proyectos` tuviera la identidad de su proyecto, sin cambiar el resto del sitio, cada identidad es una clase que solo define variables:

```css
.pt-nexus {
  --pt-bg: color-mix(in oklab, var(--nx-surface) 72%, transparent);
  --pt-accent: var(--nx-coral);
  --pt-border-hover: color-mix(in oklab, var(--nx-coral) 55%, transparent);
}
.pt-portafolio {
  --pt-bg: #101009;
  --pt-accent: #c9a96e;
  --pt-border-hover: rgb(201 169 110 / 0.35);
}

@layer components {
  .pt-card {
    background: var(--pt-bg);
    border: 1px solid var(--pt-border);
    transition: border-color 0.22s ease;
  }
  .pt-card:is(:hover, :focus-visible) {
    border-color: var(--pt-border-hover);
  }
}
```

El componente es uno solo; cambia la clase que lo envuelve. Desde el marcado también se pueden leer las variables con la sintaxis de Tailwind 4, sin escribir CSS:

```tsx
<span className="bg-(--pt-accent) text-(--pt-ink-soft)" />
```

`color-mix()` sirve para derivar tonos (un borde al 55 % del acento) sin inventar otro color.

![Tres tarjetas de proyecto: Moss en salvia sobre crema, Moss Nexus en blanco con su botón coral y el portafolio en negro con detalles dorados](/imagenes/tarjetas-de-proyectos-992x312.webp "El mismo componente con tres juegos de variables")

Puedes probar la técnica en el reto [Una tarjeta, tres identidades](/laboratorio/reto-paleta-con-variables).

## Errores frecuentes

- **Subir la especificidad para ganar a una regla sin capa.** Dentro de una capa no sirve: la regla sin capa sigue ganando. Mueve la excepción fuera de la capa o la regla general dentro de una.
- **`@theme` sin `inline` para colores que cambian de tema.** El valor se copia en la utilidad y deja de seguir a la variable.
- **Colores sueltos en el marcado.** `bg-[#c9a96e]` repetido en diez sitios es una paleta que nadie puede cambiar. Si un color se repite, merece una variable.
- **Variables globales con nombres genéricos.** `--accent` en `:root` lo pisa cualquiera. Prefijos (`--nx-*`, `--pt-*`) y alcance por clase evitan choques entre identidades.
