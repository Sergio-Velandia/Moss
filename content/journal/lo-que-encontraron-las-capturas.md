---
title: Lo que encontraron las capturas
description: Siete fallos que pasaron las pruebas, el lint y el build, y que solo aparecieron al mirar el sitio en un navegador de verdad.
type: journal
category: Aprendizajes
tags: [testing, capturas, playwright, responsive, accesibilidad, calidad]
technologies: [JavaScript, CSS]
createdAt: 2026-10-13
related: [manual/javascript/verificar-la-interfaz-con-capturas, lab/reto-grid-min-w-0, journal/accesibilidad-que-no-se-ve]
---

## Todo en verde, y aun así mal

Durante estos días, cada cambio en Moss terminó igual: pruebas en verde, lint limpio, build sin errores. Y casi cada vez, al abrir el sitio en un navegador y sacar capturas, apareció algo que ninguna de esas tres comprobaciones podía ver.

No eran fallos exóticos. Eran del tipo que una persona nota en el primer minuto y que el código, leído con atención, no delata.

```flow
# Dónde se escondía cada fallo
Pruebas :: la lógica es correcta
Lint y build :: el código compila y sigue las reglas
? ¿Se ve bien? :: nadie lo ha mirado
+ Capturas :: el navegador dice la verdad
```

## Lo que apareció

- **Un empate contado como victoria.** El tablero decía «El Laboratorio reúne el 35 % del jardín» cuando el Manual tenía exactamente lo mismo. La cifra era correcta; la frase, engañosa. Ahora los empates se nombran como empates.
- **Un tooltip debajo del texto.** Al pasar el cursor por la dona del tablero, el tooltip quedaba por detrás del total central y los dos textos se pisaban.
- **Una tarjeta que rompía el móvil.** La cuadrícula del Laboratorio desbordaba a 375 px. El culpable: un elemento de grid que no podía encogerse por debajo de una línea de código larga.
- **Palabras partidas por la mitad.** En los diagramas, "¿Respuesta?" se convertía en "¿Respues-ta?" y "import.meta.glob" se cortaba en una columna estrecha.
- **Una cabecera al límite.** A 768 px, la navegación ocupaba 734 de 734 píxeles disponibles. Añadir una sección más la habría desbordado; por eso el menú de escritorio empieza ahora en 1024 px.
- **Una demo que no demostraba nada.** El reto de la cuadrícula se suponía que mostraba el desborde, pero la tarjeta medía 220 px en las dos versiones. Al investigar, la causa del error original resultó ser otra: las clases `grid-cols-*` de Tailwind 4 ya usan `minmax(0, 1fr)`; el problema solo existía donde la cuadrícula no tenía columnas definidas.
- **Un favicon que nunca estuvo.** Daba 404 en producción desde la primera versión. Ninguna prueba miraba los recursos de `index.html`.

![Comparación del reto de la cuadrícula: sin arreglo, la tarjeta mide 530 píxeles y se sale del móvil de 240; con min-w-0, mide 220 y la línea de código se desplaza dentro](/imagenes/reto-cuadricula-antes-y-despues-944x194.webp "El fallo de la cuadrícula, reproducido en el Laboratorio")

## Por qué las pruebas no los ven

Las pruebas comprueban lo que alguien pensó en comprobar. Nadie escribe de antemano «el tooltip no debe quedar debajo del total» ni «la frase no debe favorecer a nadie en un empate». Esos fallos viven en la combinación de piezas que, por separado, funcionan.

Una captura no pregunta nada concreto: muestra todo a la vez. Por eso encuentra lo que no se buscaba.

```mindmap
Qué ve cada comprobación
- Pruebas :: lo que se previó
  - lógica y datos
- Build :: que el código encaje
  - tipos e imports
- Lint :: reglas del código
- Capturas :: lo que nadie previó
  - textos que engañan
  - piezas que se pisan
  - anchos que no caben
```

## Lo que aprendí

No sustituyo las pruebas por capturas: las dos se complementan. Pero ya no doy un cambio por terminado sin mirarlo en un navegador, en móvil y en escritorio, en los dos temas. Y cuando una captura encuentra algo, intento convertirlo en una comprobación automática para que no vuelva: la página que responde 404 aunque se vea bien, el elemento que desborda, la imagen sin dimensiones.

Lo más útil fue cambiar la pregunta. No «¿pasa todo?», sino «¿qué vería alguien que abre esto por primera vez?».
