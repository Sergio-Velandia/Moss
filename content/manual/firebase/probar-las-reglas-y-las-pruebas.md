---
title: Probar las reglas, y probar las pruebas
description: Reglas de Firestore probadas contra el emulador con @firebase/rules-unit-testing, una prueba de control para que el rechazo no pase por otra razón, y la parte importante, debilitar una regla a propósito para ver que alguna prueba falla.
type: manual
tags: [firebase, firestore, reglas de seguridad, pruebas, emulador, vitest, mutaciones]
technologies: [Firebase, Firestore, Vitest]
createdAt: 2026-11-18
related: [route/firebase-sin-backend, manual/firebase/topes-cuando-las-reglas-no-cuentan, manual/javascript/verificar-la-interfaz-con-capturas, project/moss-taste]
references: [Firebase: probar las reglas de seguridad | https://firebase.google.com/docs/rules/unit-tests, Firebase: Emulator Suite | https://firebase.google.com/docs/emulator-suite, Firebase: referencia de rules-unit-testing | https://firebase.google.com/docs/reference/emulator-suite/rules-unit-testing/rules-unit-testing, Vitest | https://vitest.dev/guide/]
---

## Problema que resuelve

Las reglas de Firestore son código, y un error en ellas no se ve: el sitio funciona igual, solo que deja pasar lo que no debería. La única forma de saber que una regla protege es intentar romperla.

Pero hay una trampa más honda. Unas pruebas en verde dicen que pasaron, no que **podían fallar**. Una prueba que espera un rechazo pasa también si el rechazo llega por la razón equivocada, o si no comprueba nada. Por eso esta guía tiene dos mitades: probar las reglas, y después probar las pruebas.

Es el **paso 4** de la ruta [Firebase sin backend](/rutas/firebase-sin-backend).

## La idea en una imagen

Una prueba de una regla es **una alarma de humo**. Que no suene no significa que la casa esté a salvo: puede no tener batería. La única forma de saberlo es acercarle humo a propósito y ver que suena. Debilitar una regla es el humo.

## Las piezas

```mindmap
Probar reglas de Firestore
- Emulador :: Firestore en tu equipo
  - un proyecto demo- que nunca toca el real
  - necesita Java
- rules-unit-testing :: contextos y aserciones
  - una cuenta, otra cuenta, sin sesión
  - sembrar datos sin reglas
  - assertFails y assertSucceeds
- Prueba de control :: el rechazo es por la razón correcta
  - la dueña sí puede
- Debilitar a propósito :: probar las pruebas
  - quitar una condición
  - ver qué prueba falla
```

En palabras: el emulador corre Firestore en tu equipo, con un proyecto de nombre `demo-` que nunca toca el real, y necesita Java. `@firebase/rules-unit-testing` da contextos de distintas cuentas, permite sembrar datos sin reglas y tiene `assertFails` y `assertSucceeds`. Una prueba de control comprueba que la dueña sí puede, para que los rechazos signifiquen algo. Y debilitar una regla a propósito comprueba que las pruebas detectan el cambio.

## 1. El emulador

En `firebase.json`:

```json
{
  "firestore": { "rules": "firestore.rules" },
  "emulators": { "firestore": { "port": 8080 }, "ui": { "enabled": false }, "singleProjectMode": true }
}
```

Y un script que levanta el emulador, corre las pruebas y lo apaga:

```bash
npx --yes firebase-tools@15.35.0 emulators:exec --only firestore --project demo-mi-proyecto "vitest run --config vitest.reglas.config.ts"
```

- **Un proyecto `demo-`.** Firebase trata cualquier id que empieza por `demo-` como un proyecto de prueba: el emulador no intenta conectarse a nada real.
- **`firebase-tools` con versión fija, por `npx`.** No hace falta en `package.json`, y la versión fija evita que el emulador cambie entre una corrida y otra.
- **Java.** El emulador de Firestore corre sobre Java, y las versiones recientes de `firebase-tools` piden una reciente. Moss Taste documenta Java 21.
- **Una configuración de Vitest aparte**, con `fileParallelism: false`: todas las pruebas comparten el mismo emulador y lo limpian entre una y otra.

## 2. Una prueba de reglas

```ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const entorno = await initializeTestEnvironment({
  projectId: 'demo-mi-proyecto',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
})

const de = (uid: string) => entorno.authenticatedContext(uid).firestore()
const anonimo = () => entorno.unauthenticatedContext().firestore()

// Datos de partida, escritos saltándose las reglas
await entorno.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), 'usuarios/ana/interacciones/ajiaco'), { nota: 'Secreto de Ana' })
})

await assertFails(getDoc(doc(de('beto'), 'usuarios/ana/interacciones/ajiaco')))
await assertFails(getDoc(doc(anonimo(), 'usuarios/ana/interacciones/ajiaco')))
```

- **`authenticatedContext(uid)`** es una cuenta con sesión; `unauthenticatedContext()`, alguien sin sesión. No hace falta crear usuarios: el emulador acepta el `uid` que le digas.
- **`withSecurityRulesDisabled`** siembra los datos de partida. Sin eso, preparar un caso exigiría que la regla que pruebas ya funcionara.
- **`clearFirestore()` entre pruebas**, para que ninguna dependa de lo que dejó la anterior.
- **Los datos, ficticios.** Ana, Beto y un «sancocho ficticio», nunca correos ni nombres reales.

## 3. La prueba de control

La prueba de arriba pasa si Beto no puede leer la nota de Ana. Pero también pasaría si **nadie** pudiera leerla, ni siquiera Ana, por un error en la regla o en los datos sembrados. El rechazo estaría ahí, por la razón equivocada.

Por eso, antes de los rechazos, va el caso que debe funcionar:

```ts
it('la dueña sí puede leer lo suyo (la prueba de abajo no pasa por otra razón)', async () => {
  const nota = (await assertSucceeds(getDoc(doc(de('ana'), 'usuarios/ana/interacciones/ajiaco')))).data()?.nota
  expect(nota).toBe('Secreto de Ana')
})
```

Con la dueña pudiendo leer, que Beto no pueda significa algo. Lo mismo con las escrituras: después de un intento fallido de Beto, otra prueba lee como Ana y comprueba que el dato sigue intacto.

## 4. Probar las pruebas: debilitar una regla a propósito

Esta es la parte que casi nadie hace. Con todas las pruebas en verde:

1. **Elige una condición de una regla** y quítala o aflójala.
2. **Corre las pruebas.**
3. **Alguna tiene que fallar.** Si todas siguen en verde, esa condición no está cubierta por ninguna prueba: o sobra, o falta su prueba.
4. **Devuelve la regla a como estaba** y comprueba que vuelve todo a verde.

```flow
# Una mutación de la regla
Pruebas en verde :: con la regla real
Debilitar :: quitar una condición
? ¿Falla alguna prueba?
+ Cubierta :: la prueba detecta el cambio | ! Hueco :: ninguna prueba mira esa condición
Restaurar :: la regla real y todo en verde otra vez
```

En palabras: con las pruebas en verde, se quita o se afloja una condición de una regla y se corren las pruebas otra vez. Si alguna falla, esa condición está cubierta. Si ninguna falla, hay un hueco: ninguna prueba mira esa condición. Al final se restaura la regla real y todo vuelve a verde.

Mutaciones que valen la pena, con las reglas de Moss Taste como ejemplo:

| Debilitar | Qué prueba debería fallar |
| --- | --- |
| `allow get: if esDueno(uid)` → `if request.auth != null` | Otra cuenta registrada no puede leer el perfil |
| Quitar `&& registrado(uid)` de las recetas | Sin autorización no puede leer ni escribir recetas |
| Quitar `!exists(ruta) && existsAfter(ruta)` del contador | No puede subir el contador sin crear |
| Quitar `hasOnly` del perfil | El perfil no admite campos de más |
| Quitar `&& resource.data.conteoRecetas == 0` del borrado del perfil | No puede borrar el perfil para reiniciar los contadores |
| Quitar `d.actualizada == request.time` de las notas | Probablemente ninguna |

La última fila es el punto. Las recetas tienen su prueba de «fecha inventada», pero leyendo las pruebas de las notas, ninguna envía una fecha que no sea la del servidor. Si esa mutación deja todo en verde, es un hueco, y no se habría visto mirando la lista de pruebas en verde.

## Así lo hice yo

- **Las pruebas de Moss Taste** viven en [`reglas/firestore.test.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/reglas/firestore.test.ts) y corren con `npm run test:reglas`, aparte de `npm test`. Prueban el aislamiento entre cuentas (con su prueba de control), que sin autorización no hay cuenta usable, cada intento contra los contadores y el tipo y el tamaño de cada campo.
- **El ejercicio de debilitar las reglas** no consta en el repositorio de Moss Taste. La tabla de arriba es la lista para hacerlo, empezando por el hueco probable de las notas, y queda anotado como pendiente.
- **Donde sí pasó fue en las pruebas de Moss.** Al agregar las redirecciones de guías retiradas, escribí una prueba que comprobaba que ningún documento enlazara a una guía retirada, y pasó a la primera. El chequeo de tipos avisó después que leía un campo que no existe: la prueba recorría una lista vacía y no revisaba nada. La corregí en [`e4fbab2`](https://github.com/Sergio-Velandia/Moss/commit/e4fbab2) y, antes de darla por buena, la debilité a propósito: un enlace a la guía retirada en el texto de un documento, y otro en sus relacionados. Las dos veces falló. Recién ahí supe que servía.

## Errores frecuentes

- **Solo probar lo que debe fallar.** Sin la prueba de control, un rechazo puede ser por otra razón.
- **Sembrar con la misma regla que se prueba.** Si la regla está mal, el sembrado falla y la prueba no dice por qué. Usa `withSecurityRulesDisabled`.
- **Pruebas que comparten datos.** Sin `clearFirestore()`, el orden de las pruebas cambia el resultado.
- **Probar contra el proyecto real.** El prefijo `demo-` lo impide.
- **Confiar en que el verde significa algo** sin haber visto nunca una prueba fallar.

## Lista de comprobación

- [ ] Las reglas se prueban contra el emulador, con un proyecto `demo-`.
- [ ] Cada grupo de rechazos tiene su prueba de control: la dueña sí puede.
- [ ] Los datos de partida se siembran sin reglas, y la base se limpia entre pruebas.
- [ ] Debilitaste al menos una condición de cada regla y viste fallar alguna prueba.
- [ ] Las condiciones que ninguna prueba detectó tienen ahora su prueba, o se quitaron por sobrar.
