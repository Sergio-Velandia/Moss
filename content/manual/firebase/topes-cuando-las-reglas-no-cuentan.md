---
title: Topes cuando las reglas no saben contar
description: Las reglas de Firestore no pueden contar documentos. El truco es un contador en el perfil que solo puede subir o bajar exactamente 1, en la misma escritura que crea o borra el documento que cuenta.
type: manual
tags: [firebase, firestore, reglas de seguridad, topes, contadores, lotes, plan gratuito]
technologies: [Firebase, Firestore]
createdAt: 2026-11-18
related: [route/firebase-sin-backend, manual/firebase/reglas-de-firestore-que-protegen, manual/firebase/probar-las-reglas-y-las-pruebas, project/moss-taste]
references: [Firebase: escribir condiciones en las reglas | https://firebase.google.com/docs/firestore/security/rules-conditions, Firebase: transacciones y escrituras en lote | https://firebase.google.com/docs/firestore/manage-data/transactions, Firebase: referencia de reglas para Firestore | https://firebase.google.com/docs/reference/rules/rules.firestore]
---

## Problema que resuelve

Quieres un tope: como mucho 100 recetas personales por cuenta. En un sitio con servidor sería una línea: contar las recetas antes de guardar la nueva. Pero en un sitio estático el tope lo tienen que poner las reglas de Firestore, y **las reglas no pueden contar documentos**. Pueden mirar un documento concreto con `exists()` o `get()`, pero no preguntar cuántos hay en una colección.

Sin tope, una sola cuenta puede llenar la base y agotar el plan gratuito para todas las demás.

Es el **paso 3** de la ruta [Firebase sin backend](/rutas/firebase-sin-backend).

## La idea en una imagen

Un contador que el cliente puede escribir libremente es **un letrero de «aforo: 100» que cualquiera puede borrar con el dedo**. No es un tope: es una sugerencia.

El truco es convertirlo en **un torniquete**: no se puede mover sin que pase una persona, y solo gira de a uno. El contador no se escribe con el número que uno quiera: sube exactamente 1 cuando entra un documento nuevo, y baja exactamente 1 cuando sale uno, en la misma operación.

## El intento ingenuo

```js
// ❌ Un contador que la regla solo mira
allow create: if get(/databases/$(db)/documents/usuarios/$(uid)).data.conteoRecetas < 100;
```

Parece suficiente, pero el contador lo escribe el propio cliente. Basta con poner `conteoRecetas: 0` y la regla vuelve a dejar pasar todo. Y nada obliga a subirlo al crear una receta: se pueden crear recetas sin tocarlo.

## El contador que no se puede mentir

El contador vive en el perfil, junto con el id del último documento que lo movió. La regla exige tres cosas a la vez:

1. **Solo cambia en ±1.** Nunca a un valor cualquiera.
2. **Cambia en la misma escritura** que crea o borra el documento que cuenta. Las dos cosas van en un solo lote (`writeBatch`), y las reglas ven el estado antes y después del lote completo.
3. **El documento que lo movió queda nombrado** en el perfil (`ultimaReceta`), y la regla comprueba que ese documento exista después y no antes, o al revés si se borra.

```flow
# Crear una receta con su tope
Lote :: crea la receta y sube el contador del perfil
? ¿El contador subió exactamente 1?
? ¿La receta nombrada no existía antes y existe después?
? ¿El contador sigue en 100 o menos?
+ Se guardan las dos cosas | ! Se niega el lote entero
```

En palabras: crear una receta es un solo lote que escribe dos documentos, la receta y el perfil con el contador subido. La regla comprueba que el contador haya subido exactamente 1, que la receta nombrada en el perfil no existiera antes y sí exista después, y que el contador siga en 100 o menos. Si todo se cumple, se guardan las dos cosas. Si falla una, se niega el lote entero y no queda nada a medias.

### En la regla del perfil

```js
// El contador sigue igual (y su «último» también), o sube 1 con un documento nuevo, o baja 1 con uno borrado
function cambioDeContadorValido(uid, antes, despues, conteoAntes, conteoDespues, coleccion) {
  let ruta = /databases/$(db)/documents/usuarios/$(uid)/$(coleccion)/$(despues);
  return (conteoDespues == conteoAntes && despues == antes)
    || (conteoDespues == conteoAntes + 1 && !exists(ruta) && existsAfter(ruta))
    || (conteoDespues == conteoAntes - 1 && exists(ruta) && !existsAfter(ruta));
}
```

`exists()` mira la base antes del lote y `existsAfter()`, cómo quedaría después. Con las dos juntas, la regla sabe si el lote creó o borró ese documento concreto. El tope en sí es parte de la validación del perfil: `conteoRecetas` es un entero entre 0 y 100.

### En la regla de la receta

La receta, a su vez, solo se puede crear si el perfil sube en el mismo lote y la nombra:

```js
function subeContador(campoConteo, campoUltimo, id) {
  return getAfter(rutaPerfil(uid)).data[campoConteo] == get(rutaPerfil(uid)).data[campoConteo] + 1
    && getAfter(rutaPerfil(uid)).data[campoUltimo] == id;
}
```

Las dos reglas se vigilan entre sí: el perfil no puede cambiar el contador sin una receta que aparezca o desaparezca, y la receta no puede aparecer ni desaparecer sin mover el contador.

### En el cliente

```ts
const lote = writeBatch(db)
lote.set(doc(db, 'usuarios', uid, 'recetas', id), { ...receta, creada: serverTimestamp(), actualizada: serverTimestamp() })
lote.update(doc(db, 'usuarios', uid), { conteoRecetas: increment(1), ultimaReceta: id })
await lote.commit()
```

`increment(1)` suma en el servidor, sin leer antes el valor. Borrar es lo mismo con `lote.delete(...)` e `increment(-1)`.

## Lo que impide, caso por caso

| Intento | Por qué falla |
| --- | --- |
| Poner el contador en 0 | Solo puede cambiar en ±1 |
| Bajarlo en 1 sin borrar nada | El documento nombrado tiene que desaparecer en ese lote |
| Crear una receta sin subirlo | La regla de la receta exige que el perfil suba en el mismo lote |
| Crear dos recetas y subirlo una vez | Solo una queda nombrada; la otra no tiene un contador que la cubra |
| Cambiar una receta por otra con el contador igual | Si el contador no cambia, el «último» tampoco puede cambiar |
| Borrar el perfil para empezar de cero | El perfil solo se borra con los contadores en 0 |

La última es fácil de olvidar. Si el perfil se pudiera borrar con recetas vivas, un perfil nuevo empezaría en 0 con 100 recetas guardadas, y el tope se reiniciaría.

## El precio

- **Lecturas.** Crear una receta hace que las reglas consulten el perfil antes y después del lote, y la receta antes y después, además de comprobar el registro. Esas lecturas se cobran como cualquier otra (ver el [paso 2](/manual/firebase/reglas-de-firestore-que-protegen#3-cada-exists-y-get-cuesta-una-lectura)).
- **Borrar la cuenta es de a uno.** Cada receta y cada nota se borra con su propio lote, bajando el contador, y el perfil se borra al final, cuando los contadores están en 0. Si se interrumpe, se puede repetir: lo ya borrado no vuelve.
- **Un tope por colección**, cada uno con su contador y su «último». Moss Taste tiene dos: recetas (100) y favoritos y notas (300).

## Así lo hice yo

- **Los topes viven en dos lugares, a propósito.** En [`firestore.rules`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/firestore.rules), que es el que protege, y en `TOPES` ([`config.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/config.ts)), para que la interfaz avise antes de llegar al límite. Si cambia uno, cambia el otro, y las reglas se vuelven a pegar en la consola.
- **Las escrituras con contador pasan por una sola función** del cliente, `conContador`, que arma el lote. Así no hay un camino que se olvide de subirlo.
- **Cada fila de la tabla de arriba es una prueba** en [`reglas/firestore.test.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/reglas/firestore.test.ts), contra el emulador. La primera se llama «la prueba pedida: con 100 recetas no puede poner su contador en 0». Cómo se arman esas pruebas está en el [paso 4](/manual/firebase/probar-las-reglas-y-las-pruebas).

## Errores frecuentes

- **Escribir el contador con un valor calculado en el cliente** (`conteoRecetas: recetas.length + 1`). Dos pestañas a la vez lo desordenan. `increment(1)` y la regla de ±1 lo evitan.
- **Crear la receta y subir el contador en dos escrituras separadas.** La regla las rechaza, y es lo correcto: entre una y otra hay un estado que no cuadra.
- **Permitir borrar el perfil sin condiciones.** Reinicia todos los topes.
- **Olvidar el «último».** Sin el id nombrado, la regla no puede saber qué documento justificó el cambio.

## Lista de comprobación

- [ ] El contador solo puede cambiar en ±1, nunca a un valor cualquiera.
- [ ] Cambia en el mismo lote que crea o borra el documento, y ese documento queda nombrado.
- [ ] La regla del documento exige que el contador se mueva, y la del contador, que el documento aparezca o desaparezca.
- [ ] El perfil no se puede borrar con contadores mayores que 0.
- [ ] El tope de la interfaz y el de las reglas son el mismo número.
- [ ] Cada intento de la tabla tiene su prueba.
