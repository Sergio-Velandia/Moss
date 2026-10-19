---
title: La fase legal en un proyecto personal
description: Por qué un sitio personal también necesita privacidad, términos y licencia; cómo escribir solo lo que el sitio hace de verdad y qué cambia si un formulario recibe datos personales en Colombia (Ley 1581 de 2012).
type: manual
tags: [legal, privacidad, términos, licencia, datos personales, ley 1581, colombia]
technologies: [GitHub, Markdown]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/despliegue/migrar-a-un-dominio-nuevo, manual/git/un-readme-que-se-lee]
references: [Ley 1581 de 2012 (Función Pública) | https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981, Elegir una licencia de código | https://choosealicense.com/, Creative Commons BY 4.0 en español | https://creativecommons.org/licenses/by/4.0/deed.es]
---

## Problema que resuelve

«Es solo un proyecto personal» no impide que un visitante deje sus datos en tu formulario, que alguien copie tu código sin saber si puede, o que tu sitio guarde cosas en el navegador sin decirlo. Unas pocas páginas claras protegen a quien te visita y a ti, y además son una señal de trabajo profesional.

Es el **paso 9** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio).

> **Aviso:** esta guía explica cómo lo resolví en mis proyectos personales y es una base razonable, **no asesoría jurídica**. Si tu proyecto se vuelve comercial, recibe pagos o recoge datos personales a escala, revísalo con un profesional.

## La idea en una imagen

Las páginas legales son **el reglamento pegado en la puerta de un local**: dicen qué pasa adentro, qué puedes hacer y a quién reclamar. Un reglamento que promete cosas que el local no hace es peor que no tener ninguno. Por eso se escriben **después** de revisar qué hace de verdad el sitio.

## Las piezas

```mindmap
Fase legal
- Privacidad :: qué datos se tratan
  - navegador: localStorage y cookies
  - terceros: fuentes, hosting, formularios
- Términos :: reglas de uso
  - sin garantías
  - marcas de terceros
- Licencia :: qué pueden hacer con tu trabajo
  - código
  - contenido
- Datos personales :: si hay formulario
  - autorización y finalidad
  - derechos y contacto
```

En palabras: la fase legal tiene cuatro piezas. La política de privacidad dice qué datos se tratan, tanto en el navegador como en servicios de terceros. Los términos fijan las reglas de uso, sin garantías y aclarando las marcas de terceros. La licencia dice qué pueden hacer otros con tu código y tu contenido. Y si hay un formulario que recibe datos personales, hace falta explicar para qué se usan y cómo ejercer los derechos.

## 1. Primero, la auditoría

La política de privacidad describe **solo lo que el sitio hace**. Antes de escribirla, responde con el código delante:

- ¿Usa `localStorage`, `sessionStorage` o cookies? ¿Con qué claves y para qué?
- ¿Hace peticiones a terceros (fuentes, CDN, analítica, mapas, vídeos)?
- ¿Hay formularios, cuentas o comentarios? ¿A qué servicio van los datos?
- ¿Qué registra el proveedor de hosting por su cuenta?

## 2. Privacidad, términos y contacto

- **Privacidad:** lo que salió de la auditoría, el proveedor de hosting y un contacto. Si no recoges datos, dilo: también es información.
- **Términos:** uso del sitio, sin garantías, limitación de responsabilidad, marcas de terceros (y que no hay afiliación) y la fecha de actualización.
- **Contacto:** un correo del dominio, no el personal. Ver [Correo con tu dominio](/manual/despliegue/correo-con-tu-dominio).
- **Fecha visible de actualización.** Si cambia un dato que estas páginas publican (por ejemplo, el correo), cambia también la fecha.

## 3. Licencia

Sin licencia, por defecto nadie puede reutilizar tu código legalmente, aunque el repositorio sea público. Opciones típicas:

- **MIT** para el código: cualquiera puede usarlo citando el aviso de copyright.
- **CC BY 4.0** para el contenido (textos, diagramas): se puede reutilizar citando la fuente.

La licencia va en un archivo `LICENSE` en la raíz, en el campo `license` de `package.json`, en el README y enlazada desde el pie de página.

## 4. Si un formulario recibe datos personales (Colombia)

En Colombia, el tratamiento de datos personales lo regula la **Ley 1581 de 2012**. Para un sitio personal, lo esencial es:

- **Decir para qué** usarás los datos (por ejemplo, responder tu mensaje) y no usarlos para otra cosa.
- **Pedir la autorización** de quien los entrega, de forma clara.
- **Explicar los derechos** de quien los entrega (conocer, actualizar, rectificar y pedir que se borren sus datos) y **cómo ejercerlos**: a qué correo escribir.
- **Decir a qué servicio van:** si el formulario usa un servicio externo para enviar el mensaje, ese servicio recibe los datos.

## Así lo hice yo

- **Moss** tiene [términos](https://sergio-velandia.dev/Moss/terminos), [privacidad](https://sergio-velandia.dev/Moss/privacidad) y [protección de datos](https://sergio-velandia.dev/Moss/proteccion-de-datos), esta última con la Ley 1581 y los derechos ante la Superintendencia de Industria y Comercio. La privacidad nombra una por una las claves del navegador (`moss-theme`, `moss-lang` y `moss-route-progress`); se amplió cuando aparecieron claves nuevas ([`56984ee`](https://github.com/Sergio-Velandia/Moss/commit/56984ee)). Código bajo licencia MIT ([`LICENSE`](https://github.com/Sergio-Velandia/Moss/blob/main/LICENSE)), aunque a su `package.json` todavía le falta el campo `license`.
- **El dato de contacto vive en un solo archivo** ([`site.ts`](https://github.com/Sergio-Velandia/Moss/blob/main/src/data/site.ts)), con la fecha de actualización de las páginas legales. Al cambiar el correo, cambió también la fecha ([`d55db56`](https://github.com/Sergio-Velandia/Moss/commit/d55db56)).
- **Moss Nexus** hizo su fase legal paso a paso: plantilla de página legal ([`da0da87`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/da0da87)), privacidad ([`35d811b`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/35d811b)), contacto ([`b45c384`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/b45c384)) y una prueba que verifica las páginas legales y los enlaces del pie ([`d8e58e7`](https://github.com/Sergio-Velandia/Moss-Nexus/commit/d8e58e7)). Tiene tres licencias: MIT para el código, CC BY 4.0 para los textos de las plantillas ([`LICENSE-CONTENT`](https://github.com/Sergio-Velandia/Moss-Nexus/blob/main/LICENSE-CONTENT)) y uso libre, sin condiciones, para los flujos de n8n ([`LICENSE-WORKFLOWS`](https://github.com/Sergio-Velandia/Moss-Nexus/blob/main/LICENSE-WORKFLOWS)).
- **El portafolio todavía no tiene su fase legal.** Su formulario de contacto envía nombre, correo y mensaje a través de EmailJS, pero aún no hay página de privacidad ni archivo `LICENSE`; su `package.json` dice `"license": "ISC"`, el valor que npm pone por defecto, no una decisión. Es su próxima tarea, y por eso esta guía lo dice en lugar de esconderlo.

## Errores que cometí (o que casi cometo)

- **Cambiar un dato de contacto obliga a actualizar la fecha de las páginas legales.** Al pasar al correo del dominio, la fecha cambió en el mismo commit. Se detecta comparando la fecha visible con el último commit que tocó un dato publicado en esas páginas.

## Lista de comprobación

- [ ] Hice la auditoría con el código delante: almacenamiento del navegador, terceros, formularios y hosting.
- [ ] La privacidad describe solo lo que el sitio hace, con las claves del navegador por su nombre.
- [ ] Los términos dicen que no hay garantías y aclaran las marcas de terceros.
- [ ] Hay un contacto con el correo del dominio.
- [ ] Las páginas legales muestran su fecha de actualización y la cambio cuando cambia un dato publicado.
- [ ] Hay `LICENSE` en la raíz, el campo `license` en `package.json`, una sección en el README y un enlace en el pie.
- [ ] Si hay formulario: dice para qué se usan los datos, pide autorización, explica los derechos y nombra el servicio que los recibe.
- [ ] Una prueba comprueba que las rutas legales existen y que el pie las enlaza.
