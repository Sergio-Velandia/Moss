---
title: Lo que el panel sí ve
description: Las reglas protegen los datos de una cuenta frente a las demás, no frente a quien administra el proyecto. Por qué «solo tú lo ves» sería falso, qué dice la interfaz en su lugar y qué hay que declarar en la política de privacidad.
type: manual
tags: [firebase, privacidad, consola, reglas de seguridad, política de privacidad, honestidad técnica]
technologies: [Firebase, Firestore]
createdAt: 2026-11-18
related: [route/firebase-sin-backend, manual/despliegue/fase-legal-en-un-proyecto-personal, manual/firebase/reglas-de-firestore-que-protegen, journal/un-recetario-que-nunca-asume-cero]
references: [Firebase: privacidad y seguridad | https://firebase.google.com/support/privacy, Firebase: cómo funcionan las reglas de seguridad | https://firebase.google.com/docs/rules/rules-behavior, Firebase: administrar usuarios | https://firebase.google.com/docs/auth/web/manage-users]
---

## Problema que resuelve

Con las reglas bien hechas, ninguna cuenta puede leer los datos de otra. Es fácil dar el paso siguiente y escribir en la interfaz «solo tú lo ves». Esa frase es falsa.

Las reglas de seguridad se aplican a lo que llega **desde el cliente**: tu app, o cualquier código que use la configuración pública. No se aplican a la consola de Firebase ni a las herramientas de servidor. Quien administra el proyecto abre la consola y ve cada documento de cada cuenta, y en Authentication, la lista de correos.

Es el **paso 5** de la ruta [Firebase sin backend](/rutas/firebase-sin-backend), y el que cierra la cuenta honesta con la persona que usa tu app.

## La idea en una imagen

Las reglas son **las cerraduras de los casilleros de un gimnasio**: ningún socio abre el casillero de otro. Pero el gimnasio tiene una llave maestra. Decir «nadie más puede abrir tu casillero» es mentir; lo honesto es «otros socios no pueden abrirlo», y explicar quién tiene la maestra y cuándo la usaría.

## Quién ve qué

```mindmap
Los datos de una cuenta
- Otras cuentas :: no los ven
  - lo impiden las reglas
  - probado contra el emulador
- Quien administra el proyecto :: sí puede verlos
  - Firestore en la consola
  - Authentication con los correos
- Google :: encargado del tratamiento
  - guarda y procesa los datos
  - según la privacidad de Firebase
- La propia persona :: todo lo suyo
  - exportar sus datos
  - borrar la cuenta
```

En palabras: otras cuentas no ven los datos, porque lo impiden las reglas, probadas contra el emulador. Quien administra el proyecto sí puede verlos desde la consola: los documentos de Firestore y, en Authentication, los correos. Google procesa los datos como encargado del tratamiento. Y la persona puede exportar todo lo suyo y borrar su cuenta.

## Lo que dice la interfaz

Moss Taste tiene una regla escrita para sus textos: **la interfaz dice «otras cuentas no la ven», nunca «solo la ves tú»**. Es una decisión registrada en el proyecto, con su motivo: quien administra el proyecto puede ver los datos en la consola de Firebase, y la política lo declara.

Así aparece en el sitio:

> Tus recetas son privadas: otras cuentas no las ven.

La diferencia parece de estilo, y no lo es. «Otras cuentas no las ven» es algo que las reglas garantizan y que una prueba comprueba. «Solo la ves tú» es una promesa que nadie en el proyecto puede cumplir sin cifrar los datos en el navegador, con una clave que el servidor nunca vea.

## Qué declarar en la política de privacidad

La política de Moss Taste responde, para las cuentas, estas preguntas. Es un buen molde:

| Pregunta | Qué responde |
| --- | --- |
| **Qué se guarda** | En Authentication: correo, identificador, método de acceso y fechas. La contraseña la maneja Firebase; el sitio no la guarda ni puede leerla. En Firestore: lo que la persona escribe o marca. |
| **Para qué** | Solo para usar la cuenta y para demostrar que autorizó el tratamiento. |
| **Quién lo ve** | Otras cuentas no pueden leer ni cambiar sus datos. Quien administra el proyecto técnicamente puede verlos en la consola, y solo lo haría para atender una solicitud suya o resolver un problema. |
| **Quién lo procesa** | Google, a través de Firebase, como encargado del tratamiento, con un enlace a su política. |
| **Por cuánto tiempo** | Hasta que borre su cuenta: el sitio no borra solo las cuentas inactivas. Y lo que dice Firebase sobre sus propios respaldos. |
| **Cómo ejercer sus derechos** | Exportar sus datos y borrar la cuenta desde la propia app, y un correo de contacto. |

Y una consecuencia práctica que se dice en voz alta: **no escribas en las notas nada que no quieras que se pueda leer**. No es una amenaza, es la verdad del sistema.

La autorización que la persona acepta guarda la **versión de la política** (su fecha) y la hora del servidor. Si cambia lo que se guarda o a quién se envía, la política y esa versión cambian en el mismo commit.

## Exportar y borrar, sin backend

Que la persona pueda llevarse y borrar sus datos no exige un servidor:

- **Exportar mis datos.** La app ya tiene en memoria el perfil, las notas, las recetas y la lista, y genera un JSON en el navegador. En el plan gratuito de Firebase no hay copias automáticas de la base, así que esta es la copia de cada persona, y la política lo dice.
- **Borrar la cuenta y los datos.** Primero se confirma la identidad (Firebase exige una sesión reciente para borrar una cuenta). Después se borra cada documento, de a uno, porque los [contadores](/manual/firebase/topes-cuando-las-reglas-no-cuentan) obligan a bajar con cada borrado; luego el perfil, y por último la cuenta de Authentication. Si se interrumpe, se puede repetir: lo ya borrado no vuelve.

```flow
# Borrar la cuenta y los datos
Confirmar identidad :: contraseña o Google otra vez
Notas y recetas :: de a una, bajando su contador
Perfil :: cuando los contadores llegan a 0
+ Cuenta de Authentication :: al final, cuando ya no queda nada
```

En palabras: borrar la cuenta empieza por confirmar la identidad, con la contraseña o con Google otra vez. Después se borran las notas y las recetas, una por una, bajando su contador. Cuando los contadores llegan a 0 se borra el perfil, y al final, cuando ya no queda nada, la cuenta de Authentication. Borrarla primero dejaría datos huérfanos que nadie puede borrar desde la app.

## Así lo hice yo

- **La política vive en el código**: [`Privacidad.tsx`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/pages/Privacidad.tsx), con un comentario que obliga a actualizarla si cambia lo que se guarda, y `VERSION_POLITICA` en [`config.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/config.ts).
- **Las frases de privacidad tienen prueba.** Una prueba de la app comprueba que una receta personal diga «Esta receta es privada: otras cuentas no la ven.».
- **Exportar y borrar** están en «Mi cocina», y su lógica en [`datos.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/datos.ts) y [`misDatos.ts`](https://github.com/Sergio-Velandia/Moss-Taste/blob/main/src/lib/cuentas/misDatos.ts).
- Contado desde el lado del proyecto, este es uno de los temas de [Un recetario que nunca asume cero](/bitacora/un-recetario-que-nunca-asume-cero).

## Errores frecuentes

- **«Solo tú puedes verlo»**, o «tus datos son privados» sin decir frente a quién.
- **Prometer cifrado** sin cifrar en el navegador. Firebase cifra en reposo, pero quien administra el proyecto sigue viendo los datos en claro en la consola.
- **Una política que no menciona la consola**, o que no nombra a Google como encargado.
- **Borrar la cuenta de Authentication primero.** Los datos de Firestore quedan sin dueño que pueda borrarlos desde la app.
- **No avisar que no hay respaldos** en el plan gratuito, y no ofrecer exportar.

## Lista de comprobación

- [ ] La interfaz dice frente a quién son privados los datos: otras cuentas, no «nadie».
- [ ] La política dice que quien administra el proyecto puede verlos en la consola, y cuándo lo haría.
- [ ] La política nombra a Google como encargado del tratamiento y enlaza su privacidad.
- [ ] La autorización guarda la versión de la política que se aceptó.
- [ ] La persona puede exportar sus datos y borrar su cuenta desde la app, en ese orden de borrado.
- [ ] Si no hay respaldos automáticos, la política lo dice.
