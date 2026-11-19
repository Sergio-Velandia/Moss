---
title: Firebase sin backend: cuentas, reglas y datos de verdad
description: Cuentas con correo y Google, reglas de Firestore que protegen, topes que las reglas no saben contar, pruebas que de verdad pueden fallar y una privacidad que no promete de más. Todo sacado de Moss Taste, en el plan gratuito.
type: route
level: avanzado
order: 6
tags: [firebase, firestore, authentication, reglas de seguridad, privacidad, sitio estático, ruta]
technologies: [Firebase, Firestore, React, TypeScript]
createdAt: 2026-11-18
steps: [manual/firebase/cuentas-con-firebase-authentication, manual/firebase/reglas-de-firestore-que-protegen, manual/firebase/topes-cuando-las-reglas-no-cuentan, manual/firebase/probar-las-reglas-y-las-pruebas, manual/firebase/lo-que-el-panel-si-ve, manual/despliegue/fase-legal-en-un-proyecto-personal, journal/un-recetario-que-nunca-asume-cero]
---

## Para quién es

Para quien tiene un sitio estático (en GitHub Pages, por ejemplo) y necesita cuentas: que cada persona guarde lo suyo y nadie más lo toque, sin montar un servidor ni pagar uno. Ayuda haber usado React y saber qué es una base de datos de documentos; no hace falta haber usado Firebase.

Todo lo que cuenta sale de [Moss Taste](/proyectos/moss-taste), un recetario con cuentas en el plan gratuito de Firebase, y cada guía enlaza su código.

## Qué vas a poder hacer al terminar

```mindmap
Al terminar la ruta
- Cuentas :: correo y Google
  - errores en español
  - registrado no es lo mismo que existir
- Reglas :: que protegen de verdad
  - cada persona solo lo suyo
  - tipo y tamaño de cada campo
  - sabiendo cuánto cuesta cada regla
- Topes :: sin servidor que cuente
  - contadores que solo suben o bajan de a 1
- Confianza :: lo que se puede comprobar
  - pruebas que pueden fallar
  - una privacidad sin promesas falsas
```

## Cómo seguirla

Las cinco guías van en orden, y cada una se apoya en la anterior: las cuentas, las reglas que las protegen, los topes que las reglas no saben poner solas, cómo probar todo eso y qué hay que contarle a quien usa la app. Después vienen la fase legal, para escribir la política, y el artículo de la Bitácora que cuenta el proyecto completo. Marca cada paso como hecho al terminarlo: tu progreso se guarda en este navegador.

Una idea recorre toda la ruta: **la configuración de Firebase no es un secreto**. Viaja al navegador y cualquiera la puede leer. Lo que protege los datos son las reglas y la restricción de la clave por dominio, y por eso la ruta les dedica casi todo.

| # | Paso | Para leer |
| --- | --- | --- |
| 1 | Cuentas | [Cuentas con Firebase Authentication: correo y Google](/manual/firebase/cuentas-con-firebase-authentication) |
| 2 | Reglas | [Reglas de Firestore que de verdad protegen](/manual/firebase/reglas-de-firestore-que-protegen) |
| 3 | Topes | [Topes cuando las reglas no saben contar](/manual/firebase/topes-cuando-las-reglas-no-cuentan) |
| 4 | Pruebas | [Probar las reglas, y probar las pruebas](/manual/firebase/probar-las-reglas-y-las-pruebas) |
| 5 | Privacidad | [Lo que el panel sí ve](/manual/firebase/lo-que-el-panel-si-ve) |
| 6 | La política | [La fase legal en un proyecto personal](/manual/despliegue/fase-legal-en-un-proyecto-personal) |
| 7 | El proyecto completo | [Un recetario que nunca asume cero](/bitacora/un-recetario-que-nunca-asume-cero) (bitácora) |

Fuera de alcance, a propósito: subir archivos (Cloud Storage para Firebase exige el plan de pago) y las funciones en el servidor, que tampoco están en el plan gratuito.
