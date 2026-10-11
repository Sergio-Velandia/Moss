---
title: Migrando scripts sueltos a flujos de n8n
description: Qué pasa al reemplazar scripts de Node.js y cron jobs aislados por flujos visuales en n8n - deuda técnica, depuración y orquestación de herramientas locales.
type: journal
category: Arquitectura
tags: [n8n, cron, node, deuda-técnica, orquestación, depuración, docker, automatización]
technologies: [n8n, Node.js, Docker]
createdAt: 2026-10-11
related: [manual/n8n/orquestacion-y-manejo-de-errores, manual/n8n/entender-webhooks-y-triggers, lab/n8n-flow-simulator]
---

## El cajón de los scripts

Todo desarrollador tiene un cajón así. El mío era una carpeta `scripts/` y una lista de entradas en `crontab`:

- Un script de Node.js que revisaba un formulario cada hora y copiaba las respuestas nuevas a una hoja de cálculo.
- Otro que comprobaba cada mañana si algún sitio había caído y me escribía si respondía con error.
- Uno para hacer copias de seguridad de una base de datos pequeña y subirlas a un almacenamiento externo.
- Varios de "una sola vez" que se quedaron para siempre.

Cada uno funcionaba. El problema era el conjunto.

## La deuda que no se ve

Un script aislado parece barato: cincuenta líneas, un `node script.js` en el cron y listo. Pero cada uno arrastraba una deuda pequeña que, sumada, pesaba:

- **Dependencias propias.** Cada script tenía su `package.json`, sus versiones y su forma de leer variables de entorno. Actualizar Node rompía uno distinto cada vez.
- **Credenciales repartidas.** Tokens en varios `.env`, algunos duplicados, ninguno con fecha de caducidad a la vista.
- **Errores mudos.** El cron ejecuta, y si el script falla, la salida va a un correo local que nadie lee. Me enteraba de que la copia de seguridad llevaba semanas fallando cuando la necesitaba.
- **Lógica repetida.** Reintentos, registros y avisos estaban escritos tres veces, de tres formas distintas, y ninguna completa.
- **Contexto perdido.** Volver a un script seis meses después significaba leerlo entero para recordar qué hacía, cuándo corría y qué pasaba si fallaba.

Ninguno de estos problemas era grave por separado. Juntos hacían que no quisiera tocar nada.

## Qué cambió con n8n

Pasé los scripts a flujos de n8n, uno por uno. No fue reescribir todo de golpe: empecé por el que más fallaba (la copia de seguridad) y fui moviendo el resto cuando lo tocaba por otro motivo.

### La deuda se concentra en un solo sitio

Las tres capas que repetía en cada script ahora son de la plataforma:

| Antes (script + cron) | Después (n8n) |
| --- | --- |
| `crontab` con expresiones sin comentar | **Schedule Trigger** con el horario legible en el propio flujo |
| Reintentos escritos a mano, distintos en cada script | **Retry On Fail** en el nodo que llama al exterior |
| Errores en un correo local | Un **flujo de errores** común que avisa a Discord y Telegram |
| Tokens en varios `.env` | **Credenciales** cifradas, compartidas entre flujos |
| Registro con `console.log` | Historial de **Executions** con los datos de cada paso |

La deuda no desaparece: se traslada a mantener una instancia de n8n. Pero es **una** deuda, en un solo lugar, en vez de una por script. Actualizar n8n es una tarea; actualizar diez scripts eran diez.

### Depurar viendo los datos

Este fue el cambio que más noté. Con un script, depurar era añadir `console.log`, ejecutar, leer la terminal y repetir. En n8n, cada ejecución guarda la entrada y la salida de **cada nodo**. Cuando algo falla, abro la ejecución y veo exactamente qué datos llegaron al nodo que falló y qué devolvió el anterior.

Eso convierte "el script no funciona" en "el nodo 4 recibió una fecha en otro formato". La pregunta pasa de *dónde* falla a *por qué* falla, y la segunda es mucho más fácil de responder. Además puedo fijar (*pin*) los datos de un nodo y seguir construyendo el resto del flujo sin volver a llamar a la API real en cada prueba.

Para explicar esta idea construí un [simulador de flujo](/laboratorio/n8n-flow-simulator) en el Laboratorio: tres nodos, cada uno con su estado visible. Es una versión de juguete, pero transmite lo esencial: ver el flujo es entenderlo.

### El flujo es su propia documentación

Un flujo bien nombrado se lee de izquierda a derecha: *Cada día a las 7:00 → Comprobar sitios → ¿Alguno falló? → Avisar*. Seis meses después no tengo que leer código para recordar qué hace. Las notas adhesivas (*sticky notes*) del lienzo guardan el porqué de las decisiones raras, justo al lado del nodo que lo necesita.

## Orquestar herramientas locales

No todo vive en la nube. Parte de mis automatizaciones tocan cosas de mi máquina o de mi red: un servicio en un puerto local, una carpeta de exportaciones, una herramienta de línea de comandos. Lo que mejor me funcionó:

- **n8n en Docker, en local.** Un `docker compose` con n8n y un volumen para sus datos. Arranca con el equipo y no ensucia el sistema.
- **Llegar a servicios del host.** Desde el contenedor, `localhost` es el propio contenedor. Para llamar a un servicio que corre en mi máquina uso `host.docker.internal` en la URL del *HTTP Request*.
- **Webhooks como interfaz.** En lugar de que n8n ejecute comandos en el host, prefiero que mis herramientas llamen a un webhook de n8n cuando terminan algo (un build, una exportación). La herramienta no sabe nada de n8n más allá de una URL, y n8n no necesita permisos sobre mi sistema.
- **Ejecutar comandos, con cuidado.** El nodo *Execute Command* existe, pero en un contenedor solo ve lo que hay dentro del contenedor, y en versiones recientes de n8n viene desactivado por defecto por seguridad. Cuando necesito lógica en el host, la expongo como un pequeño endpoint HTTP en vez de abrir la puerta a cualquier comando.
- **Flujos en Git.** Los flujos son JSON. Los exporto con `n8n export:workflow --all --separate --output=./workflows/` y los guardo en un repositorio. No es tan cómodo como versionar código, pero me permite ver qué cambió y volver atrás.

## Lo que no migré

n8n no es la respuesta a todo, y sería deshonesto decir lo contrario:

- **Lógica compleja sigue siendo código.** Si un paso necesita cien líneas de transformación, un nodo Code con cien líneas es peor que un script con pruebas. En esos casos dejo el código como un servicio pequeño y n8n solo lo llama.
- **Tareas que deben correr en milisegundos** o procesar volúmenes enormes no ganan nada con una capa visual en medio.
- **Un script de una sola vez** sigue siendo un script. Migrar algo que voy a ejecutar dos veces es trabajo sin retorno.

La regla que uso ahora: **si una tarea se repite, habla con otros servicios y su fallo me importa, va a n8n**. Si no cumple las tres, probablemente es un script.

## Lo que aprendí

La deuda técnica de los scripts sueltos no estaba en el código de cada uno, sino en todo lo que los rodeaba: cuándo corren, cómo fallan, dónde guardan sus secretos y cómo me entero de que algo salió mal. n8n no escribe mejor código que yo; lo que hace es darle un sitio común a todo eso.

Y al igual que en el resto de [Moss](/bitacora/la-naturaleza-de-moss), la mejor parte es la que no tengo que mantener.
