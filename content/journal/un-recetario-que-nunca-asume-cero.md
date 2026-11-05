---
title: Un recetario que nunca asume cero
description: Moss Taste calcula cuánto comprar y cuánto cuesta una receta. Construirlo me enseñó que lo difícil no era la cuenta, sino decir con honestidad lo que el número no sabe.
type: journal
category: Aprendizajes
tags: [moss taste, recetas, honestidad técnica, firebase, decisiones, ia]
technologies: [React, TypeScript, Firebase]
createdAt: 2026-11-05
related: [project/moss-taste, journal/lo-que-encontre-al-revisar-mi-propio-jardin, journal/documentar-proyectos-sin-repetir-el-readme]
---

## Dos preguntas

Las recetas de la casa vivían en hojas de Excel y cuadernos. Cada vez que había que cocinar para más gente, alguien sacaba cuentas a mano, y esas cuentas se perdían.

[Moss Taste](https://sergio-velandia.dev/Moss-Taste/) responde dos preguntas para las porciones que vas a servir: **cuánto hay que comprar y cuánto va a costar**. Pensé que lo difícil sería la multiplicación. No lo fue. Lo difícil fue decidir qué decir cuando el número no se sabe.

## Nunca asumir cero

Mientras cotizaba ingredientes, varios se quedaron sin precio. La salida fácil era contarlos como cero: la receta seguiría mostrando un total y nadie vería un hueco. Pero ese total sería mentira, y además saldría más barato de lo real.

Así que un precio puede estar vacío. La ficha dice «Sin precio» y el costo, «Pendiente».

```flow
# Lo que hace cada línea de la receta
Línea :: cantidad e ingrediente
? ¿Se puede calcular?
+ Suma al total :: con su precio y su fecha | ! No suma :: trae el motivo y el costo queda parcial
```

En palabras: cada línea de una receta intenta calcularse. Si puede, suma al total con su precio. Si no, trae el motivo por el que no pudo, no suma nada y el costo de la receta queda marcado como parcial.

El filtro de presupuesto llevó esa idea un paso más. Una receta con costo parcial no lo pasa, porque un costo parcial no es un costo. Pero tampoco desaparece: sale aparte, al final, diciendo qué le falta. Desaparecer en silencio habría parecido un error.

## Mostrar de menos

El mismo filtro compara el **extremo alto** del estimado, no el valor medio. Quien sale con $ 5.000 confiando en el filtro no puede encontrarse con $ 5.280 en la caja. Prefiero que el sitio muestre menos recetas a que prometa una que no alcanza.

Hay un límite que el propio sitio cuenta: algunas verduras llevan precio mayorista, así que en la tienda pueden salir más caras. No lo escondí; lo escribí.

## La merma contaba al revés

La sobrebarriga me dio la mejor lección. Tenía un precio «neto» de $ 27.900 el kilo, que ya descontaba el recorte. Encima, el cálculo sumaba la merma para saber cuánto comprar. El resultado se veía razonable, pero contaba el recorte al revés y bajaba el costo.

Lo rechacé. Quedaron dos reglas:

- **El precio del catálogo es lo que se paga:** $ 31.000 el kilo, con una merma del 10 % (estimada, hasta pesarla).
- **La merma es solo lo que se quita antes de cocinar.** Lo que suelta en la olla no cambia lo que se compra.

Un número que parece razonable es el más peligroso: nadie lo revisa.

## Dos totales que nunca se mezclan

La lista de compras muestra dos cifras: «Lo que cuestan estas recetas», proporcional a lo que usas, y «Lo que pagas hoy en caja», por empaques completos. Si una receta usa media taza de aceite, cuesta media taza, pero en la tienda pagas el frasco. Las dos son ciertas, y mezclarlas haría falsa cualquiera de las dos.

## Lo mismo, fuera de los números

La honestidad no se quedó en el costo:

- **«Otras cuentas no la ven», nunca «solo la ves tú».** Quien administra el proyecto puede ver los datos en la consola de Firebase, y la interfaz no promete lo que no es cierto.
- **Las ilustraciones de los platos son de IA,** y el sitio las etiqueta así.
- **El proyecto se hizo con Claude Code,** y todos los commits llevan su coautoría. Yo decidí, revisé y probé.

## Lo que encontré usándolo

Las pruebas pasaban, y aun así, al usarlo de verdad, aparecieron cosas que ninguna veía: cambiar las porciones subía la página hasta la cabecera, los botones de los temporizadores se montaban a 375 px y la pantalla encendida no se volvía a pedir al recargar.

Los temporizadores son mi ejemplo favorito. No cuentan segundos, sino la hora de fin: los navegadores frenan las pestañas en segundo plano, y una recarga no debe perder 2 h 30 de sobrebarriga.

## Lo que me llevo

- **Un número que no se sabe se dice.** Cero también es una afirmación, y casi siempre es falsa.
- **Equivocarse hacia el lado seguro es una decisión de diseño.** Mejor mostrar de menos que prometer de más.
- **Las reglas valen fuera de los números:** lo que el sitio dice de tus datos también tiene que ser cierto.
- **Probar en real no es opcional.** Ahí aparece lo que las pruebas no miran.

Cómo está armado por dentro (el cálculo, las recetas como archivos y las cuentas en el plan gratuito de Firebase) está en [su ficha de Proyectos](/proyectos/moss-taste).
