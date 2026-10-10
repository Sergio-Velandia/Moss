---
title: Estructura de proyecto React + Vite
description: Cómo organizo las carpetas de una app React con Vite para que siga siendo fácil de mantener al crecer.
type: manual
tags: [carpetas, arquitectura, organización]
technologies: [React, Vite, TypeScript]
createdAt: 2026-10-10
updatedAt: 2026-10-10
related: [journal/por-que-moss-no-usa-base-de-datos]
---

## Problema que resuelve

Cada proyecto nuevo empieza con carpetas improvisadas y, a las pocas semanas, nadie recuerda dónde vive cada cosa. Esta estructura es mi punto de partida por defecto.

## La estructura

```text
mi-app/
├── public/            # archivos estáticos (imágenes, favicon)
├── src/
│   ├── components/    # piezas de UI reutilizables
│   │   ├── layout/    # cabecera, pie, contenedores
│   │   └── ui/        # botones, tarjetas, inputs
│   ├── pages/         # una por ruta
│   ├── lib/           # lógica sin UI: utilidades, clientes de API
│   ├── data/          # datos estáticos y constantes
│   ├── styles/        # estilos globales
│   ├── App.tsx
│   └── main.tsx
├── .env.example       # variables de entorno de ejemplo (sin valores reales)
└── package.json
```

## Reglas que sigo

- **`components/` no conoce las rutas.** Si un componente necesita saber en qué página está, probablemente es una página.
- **La lógica sin UI va en `lib/`.** Así se puede probar y reutilizar sin montar React.
- **Un componente, un archivo.** Si un archivo supera unas 200 líneas, lo parto.
- **Los nombres dicen qué es, no dónde se usa:** `SearchBox.tsx`, no `HomeSearch.tsx`.

## Cuándo cambiar de estructura

Mientras haya menos de unas 30 piezas, agrupar por tipo (`components`, `pages`, `lib`) funciona bien. Cuando una funcionalidad empiece a tocar muchas carpetas a la vez, conviene agrupar **por funcionalidad** (`features/busqueda/`, `features/carrito/`).

## Errores frecuentes

- **Carpetas demasiado profundas.** Más de tres niveles vuelve incómodos los imports.
- **Un `utils.ts` gigante.** Si crece sin control, divídelo por tema (`fechas.ts`, `texto.ts`).
- **Subir `.env` al repositorio.** Usa `.env.example` con valores ficticios y añade `.env` al `.gitignore`.
