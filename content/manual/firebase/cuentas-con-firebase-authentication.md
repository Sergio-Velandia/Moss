---
title: Cuentas con Firebase Authentication: correo y Google
description: Correo y contraseña, Google, los errores de Firebase traducidos al español, recuperar la contraseña sin revelar quién tiene cuenta, y el caso que nadie cuenta: existir en Authentication no es estar registrado en tu app.
type: manual
tags: [firebase, authentication, cuentas, google, contraseñas, errores, sitio estático]
technologies: [Firebase, React, TypeScript]
createdAt: 2026-11-18
related: [route/firebase-sin-backend, manual/firebase/reglas-de-firestore-que-protegen, project/moss-taste, manual/apis/conectar-gemini]
references: [Firebase: empezar con Authentication en la web | https://firebase.google.com/docs/auth/web/start, Firebase: iniciar sesión con Google | https://firebase.google.com/docs/auth/web/google-signin, Firebase: administrar usuarios | https://firebase.google.com/docs/auth/web/manage-users, Firebase: la clave de API de Firebase | https://firebase.google.com/docs/projects/api-keys]
---

## Problema que resuelve

Un sitio estático en GitHub Pages no tiene servidor donde guardar usuarios. Firebase Authentication hace ese trabajo: crea las cuentas, guarda las contraseñas y habla con Google, sin que tu código toque nunca una contraseña.

Lo difícil no es conectarlo. Es todo lo que la documentación no cuenta: los errores llegan en inglés y con códigos, la recuperación de contraseña puede revelar quién tiene cuenta y, sobre todo, Google crea la cuenta **antes** de que tu app pueda preguntar nada.

Es el **paso 1** de la ruta [Firebase sin backend](/rutas/firebase-sin-backend). Todo lo que sigue sale de [Moss Taste](/proyectos/moss-taste), que usa Firebase en el plan gratuito.

## La idea en una imagen

Authentication es **la portería de un edificio**: sabe quién tiene llave y deja pasar a quien la muestra. Pero tener llave no te hace residente. La lista de residentes la lleva tu app, en un documento de perfil, y solo entra en ella quien aceptó las condiciones. La portería y la lista son dos cosas distintas, y casi todos los errores de este tema salen de confundirlas.

## Las piezas

```mindmap
Cuentas en un sitio estático
- Authentication :: quién tiene llave
  - correo y contraseña
  - Google con ventana emergente
  - recuperar la contraseña
- Perfil en Firestore :: quién es residente
  - se crea al aceptar la autorización
  - guarda la versión de la política
- Tu app :: un estado por cada caso
  - sin sesión
  - pendiente de aceptar
  - activa
- Configuración :: pública por diseño
  - claves en el navegador
  - restringida por dominio
```

En palabras: Authentication decide quién tiene una cuenta. El perfil en Firestore decide quién está registrado en tu app, y solo se crea al aceptar la autorización. Tu app distingue tres casos: sin sesión, pendiente de aceptar y activa. La configuración de Firebase es pública, y lo que la protege es otra cosa.

## La configuración no es un secreto

La configuración web de Firebase (`apiKey`, `authDomain`, `projectId`, `appId`) **viaja al navegador**. Cualquiera puede leerla en las herramientas de desarrollo de tu sitio. Esconderla no protege nada, y Firebase lo dice en su documentación.

Lo que protege los datos es otra cosa:

1. **Las reglas de Firestore**, que deciden quién lee y escribe cada documento. Es el [paso 2](/manual/firebase/reglas-de-firestore-que-protegen) de la ruta.
2. **La clave de API restringida por dominio**, en Google Cloud Console → *Credentials* → la clave del navegador → *Application restrictions* → *Websites*. Así la clave solo funciona desde tu sitio.
3. **Los dominios autorizados** de Authentication (*Settings* → *Authorized domains*), los únicos desde donde se puede iniciar sesión. Si cambias de dominio y no lo agregas aquí, las cuentas dejan de funcionar en silencio.

Aun así, los valores no van escritos en el código: van en un `.env` que Git ignora, con el prefijo `VITE_`, y el código los lee con `import.meta.env`. Así cada entorno pone los suyos, tu equipo y el build publicado, y sin ellos el sitio funciona igual, solo que sin cuentas.

> **En GitHub Actions, como Variables, no como Secrets.** El build corre en los servidores de GitHub, donde tu `.env` no existe. Moss Taste los guarda en *Settings → Secrets and variables → Actions → Variables*: GitHub enmascara los secretos y eso puede romper el build. Una configuración pública no necesita ser un secreto.

## Correo y contraseña

```ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

await createUserWithEmailAndPassword(auth, correo, contrasena)
await signInWithEmailAndPassword(auth, correo, contrasena)
```

La contraseña la guarda Firebase. Tu sitio no la ve después de enviarla, ni puede leerla. Firebase exige al menos 6 caracteres; Moss Taste pide 8 en su propia validación, antes de enviar nada, y traduce el rechazo de Firebase si llega igual.

## Google

```ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const google = new GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' })
await signInWithPopup(auth, google)
```

`prompt: 'select_account'` obliga a elegir la cuenta en lugar de entrar con la última que usó el navegador. En un computador compartido, eso evita entrar sin querer con la cuenta de otra persona.

Justo después de crear el objeto `auth`, `auth.languageCode = 'es'` hace que el correo de recuperación y la ventana de Google salgan en español.

## Los errores, traducidos

Firebase responde con códigos como `auth/invalid-credential`. Mostrar el código es inútil para quien lo lee, y mostrar el mensaje en inglés, también. Moss Taste los traduce a **lo que pasó y cómo arreglarlo**, y marca el campo al que pertenece el error para mostrarlo junto a él:

| Código | Qué dice la app | Campo |
| --- | --- | --- |
| `auth/email-already-in-use` | Ya hay una cuenta con ese correo. Entra con tu contraseña o con Google, o usa «Olvidé mi contraseña». | correo |
| `auth/invalid-email` | Revisa el correo: debe verse como nombre@correo.com. | correo |
| `auth/weak-password` | Esa contraseña es muy débil. Usa al menos 8 caracteres, mejor una frase que puedas recordar. | contraseña |
| `auth/invalid-credential` | El correo o la contraseña no coinciden. Revísalos, o usa «Olvidé mi contraseña». | contraseña |
| `auth/too-many-requests` | Hubo demasiados intentos seguidos. Espera unos minutos e intenta de nuevo. | — |
| `auth/popup-blocked` | El navegador bloqueó la ventana de Google. Permite las ventanas emergentes de este sitio e intenta de nuevo. | — |
| `auth/requires-recent-login` | Por seguridad, confirma tu identidad otra vez para continuar. | — |
| `auth/unauthorized-domain` | Las cuentas tienen un problema de configuración en este sitio. Escríbenos desde Contacto para corregirlo. | — |

Tres decisiones detrás de la tabla:

- **Correo y contraseña equivocados dicen lo mismo.** `invalid-credential`, `wrong-password` y `user-not-found` dan un solo mensaje. Decir «ese correo no existe» le confirma a cualquiera quién tiene cuenta.
- **Los errores de configuración no culpan a la persona.** Un dominio no autorizado o una clave restringida no es algo que quien entra pueda arreglar: se le dice que escriba.
- **Un código desconocido tiene un mensaje general**, nunca el texto crudo de Firebase.

El código vive en un solo archivo, [`errores.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/errores.ts), que también traduce los de Firestore: `permission-denied` (las reglas no lo dejaron) y `resource-exhausted` (se llegó al tope diario del plan gratuito).

## Recuperar la contraseña sin revelar quién tiene cuenta

`sendPasswordResetEmail` envía el enlace para crear una contraseña nueva. El mensaje que ve la persona es el mismo exista o no la cuenta:

> Si hay una cuenta con ese correo, te llega un correo con un enlace para crear una contraseña nueva. Revisa también el correo no deseado.

Si Firebase responde `auth/user-not-found`, la app no lo muestra como error: muestra ese mismo aviso. Por la misma razón de antes, la pantalla de recuperación no debe servir para averiguar qué correos están registrados.

## El caso que nadie cuenta: existir no es estar registrado

Cuando alguien pulsa «Entrar con Google» por primera vez, Firebase **crea la cuenta en Authentication en ese mismo instante**, antes de que tu código pueda mostrar una casilla de autorización. Evitarlo exige funciones que bloquean el registro en el servidor, y eso no está en el plan gratuito.

Así que hay que aceptar que existirán cuentas en Authentication que no aceptaron nada: la de quien entró con Google y cerró la pestaña, o la de quien creó la cuenta y se fue antes de terminar.

```flow
# De entrar con Google a estar registrado
Entrar con Google :: Firebase crea la cuenta ya
? ¿Tiene documento de perfil?
+ Activa :: carga sus datos | Pendiente :: ve la autorización y nada más
? ¿Acepta la autorización?
+ Se crea el perfil :: con la versión de la política y la hora del servidor | ! Rechaza :: la cuenta se borra
```

En palabras: entrar con Google crea la cuenta de inmediato. La app busca entonces el documento de perfil. Si existe, la sesión queda activa y carga sus datos. Si no existe, la cuenta queda pendiente: solo ve la autorización. Si acepta, se crea el perfil con la versión de la política y la hora del servidor. Si rechaza, la cuenta se borra.

La regla que lo sostiene: **una cuenta sin perfil se trata siempre como no registrada**, aunque exista en Authentication. No hay ningún camino que la deje usable, ni siquiera cerrar la pestaña a mitad: al volver, ve la autorización otra vez. Y las reglas de Firestore lo exigen también, así que aunque alguien se salte la interfaz, sin perfil no puede leer ni escribir nada más.

Con correo y contraseña es más sencillo, porque la casilla se marca **antes** de crear la cuenta. Pero si la pestaña se cierra entre crear la cuenta y crear el perfil, queda el mismo caso pendiente, y se resuelve igual.

## Así lo hice yo

- **Un estado por caso.** [`sesion.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/sesion.ts) distingue `anonima`, `pendiente`, `activa`, `cargando` y `error`. Si no se pudo leer el perfil, la sesión queda en error y nunca se le da paso: sin saber si aceptó, no se asume que sí.
- **El SDK solo cuando hace falta.** Firebase se carga con `import()` desde un único archivo, [`firebase.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/firebase.ts), y una prueba impide importarlo de forma estática. Quien solo mira recetas no lo descarga.
- **Confirmar identidad antes de lo irreversible.** Borrar la cuenta pide volver a entrar (`reauthenticateWithCredential` o `reauthenticateWithPopup`), porque Firebase responde `auth/requires-recent-login` si la sesión es vieja.

## Errores frecuentes

- **Las cuentas dejan de funcionar tras cambiar de dominio.** Falta el dominio nuevo en *Authorized domains*, o en la restricción de la clave de API.
- **La ventana de Google no abre.** Algunos navegadores bloquean las ventanas emergentes que no salen directamente de un clic, y una espera larga entre el clic y `signInWithPopup` (por ejemplo, cargar el SDK) puede hacerlo más probable. Moss Taste traduce `auth/popup-blocked` para que la persona sepa qué permitir.
- **Alguien entra con Google y no ve sus datos.** No tiene perfil: entró, cerró la pestaña y nunca aceptó. Es el estado pendiente, no un error.
- **El build publicado no tiene cuentas.** Las variables `VITE_` no están en el entorno del build de GitHub Actions.

## Lista de comprobación

- [ ] Las contraseñas las maneja Firebase; tu código nunca las guarda.
- [ ] La clave de API está restringida a los dominios de tu sitio, y esos dominios están en *Authorized domains*.
- [ ] Cada código de error tiene un mensaje en español que dice qué hacer, y los desconocidos, uno general.
- [ ] «Correo equivocado» y «contraseña equivocada» dicen lo mismo, y la recuperación no confirma qué correos existen.
- [ ] Una cuenta sin perfil se trata como no registrada, también en las reglas.
- [ ] Borrar la cuenta pide confirmar la identidad.
