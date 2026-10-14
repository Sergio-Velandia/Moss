---
title: Documentar proyectos sin repetir el README
description: Cómo nació la sección Proyectos de Moss: explicar arquitectura, flujos y decisiones con su alternativa descartada, sin afirmar nada que el código no respalde.
type: journal
category: Arquitectura
tags: [documentación, arquitectura, decisiones, proyectos, honestidad técnica]
technologies: [Markdown, React]
createdAt: 2026-10-13
related: [project/moss, project/moss-nexus, project/portafolio, journal/versionar-despues]
---

## Lo que un README no cuenta

Un README responde dos preguntas: qué es esto y cómo lo pongo en marcha. Está bien que así sea. Pero deja fuera lo que más le sirve a alguien que quiere entender el trabajo: por qué está hecho así, qué alternativas se descartaron y qué salió mal por el camino.

La sección [Proyectos](/proyectos) de Moss nació para eso, con una regla estricta: **si algo ya está bien dicho en el README, se enlaza, no se repite.**

## Una plantilla que obliga a pensar

Todas las páginas de proyecto siguen las mismas secciones, en el mismo orden, y una prueba automática lo exige:

```mindmap
Página de un proyecto
- Ficha :: qué es y qué problema resuelve
  - versión documentada
  - última revisión
- Arquitectura :: cómo está armado
  - un diagrama
- Flujo de datos :: cómo viaja la información
  - un diagrama
- Decisiones :: con la alternativa descartada
  - mínimo cuatro
```

La sección de decisiones es la que más trabajo da. Cada una se escribe como **Decisión → En vez de → Porque**. Escribir la alternativa descartada obliga a reconocer que había otra opción razonable: «búsqueda en el navegador **en vez de** un servicio externo» dice mucho más que «usamos MiniSearch».

## No afirmar lo que no se puede comprobar

Al documentar Moss Nexus, el plan decía que sus flujos de n8n eran «reales y probados». Revisando el código, ninguna de las 14 plantillas tenía el sello «Probado»: todas se publican como «Sin probar», a propósito. La página dice eso, no lo que sonaba mejor.

Pasó más veces. Una frase sobre el origen de los flujos de Nexus no se podía verificar y se quitó. Otra decía que las credenciales de un formulario estaban restringidas por dominio, cuando el código solo indicaba hacerlo; se reformuló hasta que el autor lo confirmó.

```flow
# Cómo entra una afirmación en una página de proyecto
Afirmación :: lo que creo que es cierto
? ¿Está en el código o la documentación?
+ Se publica :: con el detalle verificado | Se reformula o se quita :: y se pregunta al autor
```

## Que no caduque

La documentación técnica envejece en silencio: el código cambia y el texto sigue afirmando lo de antes. Cada página de proyecto muestra **«Documentado en vX.Y.Z»** y **«Última revisión»**, y las pruebas fallan si falta alguno. No impide que una página quede vieja, pero hace visible desde cuándo lo está.

## Lo que es del autor

Las decisiones se pueden comprobar en el código; las lecciones, no. «Qué salió mal» y «qué haría distinto» son opiniones de quien construyó el proyecto. Se redactaron como borrador a partir del historial y del CHANGELOG, se marcaron como tal y no se publicaron hasta que el autor las aprobó.

## Lo que aprendí

Documentar bien no es escribir más, sino escribir lo que nadie más puede escribir: el porqué. Y una página que reconoce «esto aún no está probado» genera más confianza que una que promete todo.
