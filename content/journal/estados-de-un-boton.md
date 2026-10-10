---
title: Un botón también tiene estados
description: Por qué un botón de guardar necesita al menos tres estados y qué evitar mientras carga.
type: journal
category: Aprendizajes
tags: [botón, ux, feedback, estados]
technologies: [React]
createdAt: 2026-10-08
related: [lab/button-states]
---

## El problema

Un botón que no responde al clic hace dudar: ¿se guardó o no? Entonces se vuelve a pulsar y se envía dos veces.

## Los tres estados mínimos

1. **Normal.** Listo para usarse.
2. **Cargando.** Muestra que algo está pasando y se desactiva para evitar envíos duplicados.
3. **Éxito.** Confirma el resultado durante un momento y vuelve al estado normal.

## Detalles que importan

- **Desactivar mientras carga**, para que un doble clic no dispare dos peticiones.
- **Cambiar el texto además del icono.** "Guardando…" se entiende aunque el icono no se vea bien.
- **El estado de error también existe.** La demo actual no lo cubre; es el siguiente paso pendiente.

## Resultado

Quedó como una demo en el Laboratorio, lista para copiar y conectar a una petición real.
