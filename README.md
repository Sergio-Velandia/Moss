# 🌱 Moss — Digital Garden

Mi "segundo cerebro" técnico: una biblioteca personal y visual donde guardo, documento, pruebo y reutilizo snippets, componentes, guías y artículos.

> El conocimiento técnico no debería quedarse enterrado; debería ser fácil de encontrar, entender, probar, conectar y reutilizar.

## Los cuatro pilares

| Pilar | Ruta | Qué es |
| --- | --- | --- |
| **El Laboratorio** | `/laboratorio` | Componentes y snippets con vista previa en vivo y código copiable |
| **El Manual** | `/manual` | Documentación, configuraciones y guías |
| **La Bitácora** | `/bitacora` | Blog técnico: aprendizajes, decisiones y errores |
| **El Herbario** | `/herbario` | Búsqueda global sobre todo el contenido |

## Stack

React · Vite · TypeScript · Tailwind CSS · React Router · Motion · Lucide · react-markdown · Shiki · MiniSearch · Vitest.

El contenido vive en archivos del repositorio, versionados con Git. Sin base de datos ni backend.

## Empezar

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # comprobación de tipos + build de producción
npm run test     # pruebas (búsqueda y contenido)
npm run lint
npm run check:publish   # falla si site.ts aún tiene datos sin rellenar
```

## Cómo añadir contenido

### Una demo al Laboratorio

Crea un archivo en `src/lab/entries/`, por ejemplo `mi-demo.tsx`. Exporta `meta` y el componente por defecto. El código que se muestra en la web es el propio archivo.

```tsx
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Mi demo',
  description: 'Qué hace, en una frase.',
  technology: 'React', // React | CSS | HTML | JavaScript
  category: 'Botones',
  tags: ['botón', 'hover'],
  createdAt: '2026-10-10',
  usage: 'Cómo se usa.',
  dependencies: ['lucide-react'], // opcional
}

export default function MiDemo() {
  return <button>Hola</button>
}
```

### Un documento al Manual

Crea `content/manual/<categoría>/<nombre>.md`. La carpeta es la categoría (`react`, `sql`, `apis`, `n8n`…).

### Un artículo a la Bitácora

Crea `content/journal/<nombre>.md`.

### Metadatos (frontmatter)

```md
---
title: Título del documento
description: Resumen en una frase
type: manual            # manual | journal
category: Arquitectura  # solo Bitácora; en el Manual la categoría es la carpeta
tags: [uno, dos]
technologies: [React, SQL]
createdAt: 2026-10-10
updatedAt: 2026-10-10   # opcional
draft: true             # opcional: oculto en la web publicada, visible en desarrollo
related: [lab/tilt-card, manual/sql/agrupar-con-group-by, journal/mi-articulo]
---
```

Los ids de `related` son `lab/<archivo>`, `manual/<categoría>/<archivo>` o `journal/<archivo>`. Una prueba automática avisa si alguno apunta a algo que no existe.

> El parser de frontmatter es mínimo a propósito: admite texto, `true/false` y listas en una línea `[a, b]`. No admite listas multilínea ni comas dentro de un elemento de la lista.

## Búsqueda

El Herbario indexa título, descripción, etiquetas, tecnologías y contenido completo (incluido el código de las demos). Ignora tildes y palabras vacías ("de", "para"…), tolera pequeñas erratas y exige todas las palabras de la consulta; si no hay resultados, acepta cualquiera. El índice se construye en el navegador la primera vez que se busca.

## Tema claro y oscuro

El botón de la cabecera alterna entre los dos temas. Sin elección manual, Moss sigue el tema del sistema; la elección se guarda en el navegador (`moss-theme`) y se aplica antes de pintar para evitar el parpadeo. Los colores son tokens en `src/index.css`: para cambiar la paleta basta con editar las variables de `:root` y `:root[data-theme="dark"]`.

## Accesibilidad y móvil

- Navegación por teclado completa, enlace "Saltar al contenido", foco visible y foco movido al contenido al cambiar de página.
- Menú móvil con `aria-expanded`, cierre con Escape y botones de al menos 44 px en pantallas táctiles.
- Cada página fija su propio título.
- Respeta `prefers-reduced-motion` (animaciones de entrada y tarjeta tilt).
- Contraste de colores comprobado contra WCAG 2.2 AA en ambos temas.
- El contenido Markdown no ejecuta HTML crudo.

## Páginas legales

`/terminos`, `/privacidad` y `/proteccion-de-datos` se escriben en `content/legal/*.md` y leen sus datos de `src/data/site.ts` (nombre, correo, dominio, país).

> ⚠️ **Antes de publicar:** completa `src/data/site.ts` y ejecuta `npm run check:publish`. Los textos son un borrador base redactado a partir de lo que Moss hace hoy (sin cuentas, formularios, cookies ni analítica); **no son asesoría legal**, conviene que los revise un profesional. Si añades analítica, cookies o formularios, actualiza antes la política de privacidad.

## Estructura

```
content/
├── manual/<categoría>/*.md
├── journal/*.md
└── legal/*.md
src/
├── components/   # layout, code, content
├── lab/entries/  # demos del Laboratorio
├── data/         # site.ts: datos del sitio para las páginas legales
├── lib/          # lab, content, knowledge, search, frontmatter, theme, legal
└── pages/
```

## Seguridad

Este repositorio es público. No se guardan claves reales: usa variables de entorno (`.env`, ignorado por Git) y valores ficticios en los ejemplos. Ver `.env.example`. Las demos son componentes locales preparados; Moss no ejecuta código arbitrario.

## Estado

🚧 En construcción. Hecho: fundamentos, Laboratorio, Manual, Bitácora, Herbario, tema claro/oscuro, accesibilidad, pruebas en móvil y páginas legales. Pendiente: capturas y despliegue.
