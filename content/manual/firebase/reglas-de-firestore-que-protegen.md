---
title: Reglas de Firestore que de verdad protegen
description: Mínimo privilegio, validación de tipo y tamaño en cada campo, fechas que pone el servidor, listas sin ciclos, y por qué cada exists() y get() dentro de una regla cuesta una lectura.
type: manual
tags: [firebase, firestore, reglas de seguridad, validación, mínimo privilegio, costos, sitio estático]
technologies: [Firebase, Firestore]
createdAt: 2026-11-18
related: [route/firebase-sin-backend, manual/firebase/cuentas-con-firebase-authentication, manual/firebase/topes-cuando-las-reglas-no-cuentan, project/moss-taste]
references: [Firebase: empezar con las reglas de Firestore | https://firebase.google.com/docs/firestore/security/get-started, Firebase: escribir condiciones en las reglas | https://firebase.google.com/docs/firestore/security/rules-conditions, Firebase: reglas que no son seguras | https://firebase.google.com/docs/rules/insecure-rules, Firestore: uso y límites | https://firebase.google.com/docs/firestore/quotas]
---

## Problema que resuelve

En un sitio estático no hay servidor entre el navegador y la base de datos. El navegador habla directo con Firestore, con una configuración que [cualquiera puede leer](/manual/firebase/cuentas-con-firebase-authentication#la-configuración-no-es-un-secreto). Eso significa que cualquiera puede escribir su propio código y pedirle a Firestore lo que quiera, saltándose tu interfaz.

Lo único que se interpone son **las reglas de seguridad**. Si una regla deja pasar algo, ese algo está abierto, aunque tu interfaz nunca lo pida.

Es el **paso 2** de la ruta [Firebase sin backend](/rutas/firebase-sin-backend).

## La idea en una imagen

Las reglas son **el portero que revisa cada paquete**, no la puerta. Tu interfaz es una puerta bonita, pero hay ventanas: cualquiera puede llegar a Firestore por otro lado. El portero no confía en la puerta: mira quién trae el paquete, a qué apartamento va y qué hay dentro, cada vez.

## Lo que revisa una regla, en orden

```flow
# Una escritura llega a Firestore
Petición :: desde tu app o desde cualquier otro código
? ¿Hay sesión y es la dueña de la ruta?
? ¿Tiene perfil? :: un exists(), que cuesta una lectura
? ¿Los campos son los esperados, con su tipo y su tamaño?
+ Se guarda | ! Se niega :: permission-denied
```

En palabras: cada petición llega a Firestore, venga de tu app o de otro código. La regla revisa primero que haya sesión y que la ruta sea de esa persona. Después, que tenga perfil, con una llamada `exists()` que cuesta una lectura. Por último, que los campos sean exactamente los esperados, con su tipo y su tamaño. Si todo se cumple, se guarda. Si falla algo, se niega con `permission-denied`.

## 1. Mínimo privilegio: lo que no se permite, se niega

Las reglas niegan todo por defecto. Cada `allow` abre algo, así que se escriben solo los que hacen falta, y nada más:

```js
match /usuarios/{uid} {
  allow get: if esDueno(uid);
  // Ni list: nadie puede listar a los usuarios
}
```

- **`get`, no `read`.** `read` incluye `list`, y `list` en `/usuarios` permite descargar todos los perfiles. Moss Taste permite leer un perfil (el propio), nunca listarlos.
- **Nada fuera de las rutas que usas.** Si una colección no tiene `match`, nadie la toca.
- **Las consultas a todas las cuentas** (`collectionGroup`) quedan negadas porque ninguna regla las permite.

`esDueno(uid)` es la base de casi todo:

```js
function esDueno(uid) {
  return request.auth != null && request.auth.uid == uid;
}
```

## 2. Validar cada campo, con su tipo y su tamaño

Que alguien sea el dueño no significa que lo que escribe sea válido. Sin validación, la dueña de una cuenta podría guardar un campo `admin: true`, una nota de 10 MB o un número donde va un texto.

```js
function textoHasta(valor, maximo) {
  return valor is string && valor.size() <= maximo;
}

// Simplificada de la de Moss Taste, que además valida el formato de la fecha en «probada»
function interaccionValida(d) {
  return d.keys().hasOnly(['favorita', 'probada', 'nota', 'actualizada'])
    && d.keys().hasAll(['favorita', 'probada', 'nota', 'actualizada'])
    && d.favorita is bool
    && textoHasta(d.nota, 2000)
    && d.actualizada == request.time;
}
```

- **`hasOnly` y `hasAll` juntos.** El primero impide campos de más; el segundo, que falte alguno. Con solo uno, la validación tiene un hueco.
- **El tipo antes que el tamaño.** `valor is string && valor.size() <= 2000`. Sin `is string`, `size()` también acepta listas y mapas.
- **Las fechas las pone el servidor.** `d.actualizada == request.time` obliga a usar `serverTimestamp()` en el cliente. Una fecha que manda el navegador se puede inventar.
- **Lo que no puede cambiar, se compara con lo guardado.** `request.resource.data.creada == resource.data.creada` impide reescribir la fecha de creación al editar.

### Las reglas no tienen ciclos

Las reglas no pueden recorrer una lista con un bucle, así que no pueden validar uno por uno los ingredientes de una receta. Moss Taste guarda cada ingrediente y cada paso como un texto JSON, y la regla limita la lista sin recorrerla:

```js
function listaDeTextos(valor, minimo, maximo, totalCaracteres) {
  return valor is list
    && valor.size() >= minimo && valor.size() <= maximo
    && valor.join('').size() <= totalCaracteres;
}
```

`size()` limita cuántos son, y `join('').size()` limita cuántos caracteres suman entre todos. El contenido de cada texto lo valida la app al leerlo: lo que no se puede leer como receta se trata como dato ilegible, no se muestra roto.

## 3. Cada `exists()` y `get()` cuesta una lectura

Una regla puede mirar otros documentos. Moss Taste lo hace para exigir el perfil antes de todo lo demás:

```js
function registrado(uid) {
  return exists(/databases/$(db)/documents/usuarios/$(uid));
}
```

Es cómodo, y tiene un precio que no se ve: **cada llamada a `exists()`, `get()`, `existsAfter()` o `getAfter()` dentro de una regla es una lectura de documento que se cobra**, aunque la regla termine negando la petición. Leer una nota cuesta entonces dos lecturas: la nota y el perfil que la regla consultó.

Además hay un límite: 10 llamadas por petición de un documento o una consulta, y 20 en lotes y transacciones. Si se pasa, la petición se niega. Firebase puede reutilizar algunas llamadas dentro de la misma petición sin contarlas.

En el plan gratuito, las lecturas tienen un tope diario. Cuando se acaba, Firestore responde `resource-exhausted`, y Moss Taste lo traduce como «Por hoy se llegó al límite del plan gratuito del recetario. Tus datos están a salvo; intenta de nuevo mañana».

Qué hacer con eso:

- **Usar `exists()` cuando de verdad protege algo.** En Moss Taste, `registrado()` es lo que impide que una cuenta sin autorización use la base. Vale su lectura.
- **No sumar consultas a otros documentos sin necesidad.** Cada documento distinto que la regla mira es, como mínimo, una lectura más. Firebase puede reutilizar dentro de la misma petición una llamada repetida al mismo documento, pero eso no convierte en gratis consultar uno más.
- **Contar las lecturas de las reglas al estimar el uso**, no solo las de tu código.

## Así lo hice yo

- **Un archivo, una fuente de verdad.** Las reglas de Moss Taste viven en [`firestore.rules`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/firestore.rules), en el repositorio. No se despliegan solas: se pegan en la consola de Firebase, y el CHANGELOG anota la fecha y la hora. Si la consola y el repositorio no coinciden, gana el repositorio.
- **Sin `firebase login` en el equipo.** Pegarlas a mano evita dejar en el computador una sesión con permisos sobre todo el proyecto.
- **Cada persona, solo lo suyo.** Perfil, notas y recetas personales viven bajo `/usuarios/{uid}`, y cada regla empieza por `esDueno(uid)`.
- **Sin perfil, nada.** Notas, favoritos y recetas exigen `registrado(uid)`. Es la mitad del servidor de [el caso pendiente](/manual/firebase/cuentas-con-firebase-authentication#el-caso-que-nadie-cuenta-existir-no-es-estar-registrado).
- **Los topes también son reglas,** con un truco propio, porque las reglas no saben contar. Es el [paso 3](/manual/firebase/topes-cuando-las-reglas-no-cuentan).

## Errores frecuentes

- **`allow read, write: if request.auth != null`.** Cualquier cuenta lee y escribe los datos de todas. Es la regla más común en tutoriales, y no protege nada entre cuentas.
- **Validar en la interfaz y no en la regla.** La interfaz se salta; la regla no.
- **Fechas del cliente.** `new Date()` en el navegador se puede cambiar. Usa `serverTimestamp()` y compáralo con `request.time`.
- **Reglas editadas en la consola** que ya no coinciden con las del repositorio, y que nadie probó.

## Lista de comprobación

- [ ] Cada `allow` empieza por comprobar quién es la dueña de la ruta.
- [ ] Ninguna regla permite `list` sobre una colección de usuarios.
- [ ] Cada documento valida sus campos con `hasOnly` y `hasAll`, y cada campo su tipo y su tamaño.
- [ ] Las fechas las pone el servidor, y lo que no debe cambiar se compara con lo guardado.
- [ ] Sabes cuántas lecturas suma cada regla con `exists()` o `get()`.
- [ ] Las reglas viven en el repositorio, y la consola tiene las mismas.
