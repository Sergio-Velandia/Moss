---
title: Moss Taste
description: Recetario familiar en un sitio estático que responde con honestidad cuánto hay que comprar y cuánto va a costar, para las porciones que vas a servir.
type: project
status: estable
theme: taste
version: 1.1.0
reviewedAt: 2026-11-05
repo: https://github.com/Sergio-Velandia/Moss-Taste
site: https://sergio-velandia.dev/Moss-Taste/
tags: [arquitectura, recetas, firebase, cálculo, decisiones, sitio estático]
technologies: [React, TypeScript, Vite, Firebase]
createdAt: 2026-11-05
related: [journal/un-recetario-que-nunca-asume-cero, route/publicar-y-mantener-un-sitio, project/moss]
---

## Ficha

Moss Taste es un recetario familiar: calcula los ingredientes y el costo en pesos colombianos para cualquier número de porciones, y exporta la receta o una lista de compras. Las recetas vivían en hojas de Excel y cuadernos, y escalarlas o saber cuánto costaban se hacía a mano.

**Problema que resuelve:** responder dos preguntas sin adivinar: cuánto hay que comprar y cuánto va a costar. Lo usan la familia y los allegados, aunque cualquiera puede crear una cuenta. Cómo se usa está en el [README](https://github.com/Sergio-Velandia/Moss-Taste#readme) y en el propio [sitio](https://sergio-velandia.dev/Moss-Taste/).

**Estado real (v1.1.0, estable):** 6 recetas publicadas con su costo. Algunos precios están pendientes o son de referencia, y el sitio lo dice. Del 26 de octubre al 4 de noviembre de 2026 sumó 184 commits y 15 versiones, con 390 pruebas de la aplicación más las de las reglas de Firestore. Funciona en el plan gratuito de Firebase y en GitHub Pages. Se construyó con Claude Code, con coautoría visible en los commits; las ilustraciones de los platos también son de IA, y el sitio las etiqueta así.

## Arquitectura

```mindmap
Moss Taste
- Sitio estático :: GitHub Pages
  - React, Vite y TypeScript estricto
  - un index.html por ruta
- Recetas :: archivos del repositorio
  - una carpeta por receta
  - catálogo de ingredientes con precios
- Cálculo :: puro y sin React
  - calcularReceta
  - unidades, merma y costo
- Cuentas :: Firebase, solo para quien las usa
  - Authentication y Firestore lite
  - reglas con pruebas contra el emulador
```

En palabras: es un sitio estático en GitHub Pages, sin backend propio. Las recetas públicas son archivos del repositorio; el cálculo es una biblioteca pura, sin React; y Firebase solo entra para quien usa una cuenta.

Todo el cálculo pasa por una sola función, `calcularReceta(receta, porciones, catalogo)`. Si una línea no se puede calcular, trae el motivo y no suma al total. Agregar una receta es agregar una carpeta con su `receta.json` y su imagen, sin tocar ningún componente, y las pruebas fallan si una medida no se puede convertir.

## Flujo de datos

```flow
# De la receta a lo que pagas
Receta :: cantidades y porciones base
Catálogo :: precio, fecha, merma y empaque
calcularReceta :: escala, convierte y suma
? ¿Cada línea tiene precio?
+ Costo :: estimado de las porciones elegidas | ! Parcial :: dice qué falta, nunca asume cero
```

En palabras: la receta aporta cantidades y porciones, y el catálogo, el precio y la merma de cada ingrediente. `calcularReceta` escala y suma. Si todas las líneas tienen precio, sale el costo estimado; si falta alguno, el costo se marca como parcial y dice qué le falta.

Las cuentas siguen otro camino. Firebase se carga con `import()` desde un único archivo y solo cuando hace falta, así que quien solo mira recetas no lo descarga. Favoritos, notas y recetas personales viajan a Firestore, y sus reglas son código del repositorio, con pruebas contra el emulador.

## Decisiones

- **Decisión:** el filtro de presupuesto compara el extremo alto del estimado. **En vez de:** comparar el valor medio. **Porque:** quien sale con $ 5.000 confiando en el filtro no puede encontrarse con $ 5.280; es mejor mostrar de menos.
- **Decisión:** un precio puede estar en `null`: la ficha dice «Sin precio» y el costo, «Pendiente». **En vez de:** contarlo como cero o inventar un valor. **Porque:** un costo parcial no es un costo. Esa receta no pasa el filtro, pero sale aparte diciendo qué le falta, porque desaparecer en silencio parecería un error.
- **Decisión:** el precio del catálogo es lo que se paga, y la merma es solo lo que se quita antes de cocinar. **En vez de:** usar un precio «neto» que descuente el recorte. **Porque:** descontarlo del precio y además sumar la merma contaba al revés y bajaba el costo. Lo que el alimento suelta en la olla no cambia lo que se compra.
- **Decisión:** dos totales que nunca se mezclan: «Lo que cuestan estas recetas» y «Lo que pagas hoy en caja». **En vez de:** un solo total. **Porque:** uno es proporcional a lo usado y el otro es por empaques completos, y los dos son ciertos.
- **Decisión:** Firebase con `import()` y Firestore *lite*, 67 KB con gzip. **En vez de:** el SDK completo, 172 KB. **Porque:** quien solo mira recetas no debería descargarlo. A cambio se pierde el tiempo real, que un recetario no necesita.
- **Decisión:** una cuenta sin documento de perfil se trata como no registrada, y el perfil guarda la autorización. **En vez de:** preguntar antes de crear la cuenta. **Porque:** Firebase crea la cuenta de Google antes de poder preguntar nada, y evitarlo exige el plan de pago.
- **Decisión:** topes con contadores en el perfil, que solo suben o bajan de a 1 en la misma escritura que crea o borra el documento. **En vez de:** un backend que cuente. **Porque:** las reglas de Firestore no cuentan documentos, y el proyecto no tiene servidor.
- **Decisión:** los temporizadores cuentan por hora de fin. **En vez de:** restar segundos. **Porque:** los navegadores frenan las pestañas en segundo plano, y una recarga no debe perder 2 h 30 de sobrebarriga.
- **Decisión:** tema claro por defecto. **En vez de:** el oscuro del resto de la familia. **Porque:** es una app de cocina y se usa de día.

## Lecciones

- **Lo que dice la interfaz también es una decisión técnica.** Dice «otras cuentas no la ven», nunca «solo la ves tú»: quien administra el proyecto puede ver los datos en la consola de Firebase, y el sitio no promete lo que no es cierto.
- **Probar en real encontró lo que las pruebas no veían.** La pantalla encendida no se volvía a pedir tras recargar, los botones de los temporizadores se montaban a 375 px y `navigator.vibrate` se bloqueaba sin un toque previo.
- **Usarla también.** Cambiar las porciones subía la página hasta la cabecera; se arregló con `preventScrollReset` después de que apareciera usándola.
- **Un caché puede mentirle a las pruebas.** El de módulos de Vitest guardaba el resultado de `import.meta.glob` y no veía las carpetas de recetas nuevas.
- **Las imágenes generadas también se revisan.** La imagen para compartir salió primero con Times, porque la fuente no había cargado.

## Roadmap

Sin fechas:

- Sumar recetas de a poco y completar los precios pendientes.
- Algunas verduras llevan precio mayorista y pueden salir más caras en la tienda. El sitio lo dice; se corrige si aparece un precio mejor.
- Decidir si hacen falta avisos con el teléfono bloqueado y App Check. Para un uso familiar no se justifican hoy.
- Fuera de alcance a propósito: subir fotos, porque Cloud Storage exige el plan de pago.
