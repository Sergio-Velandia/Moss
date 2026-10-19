---
title: Un README que se lee
description: Qué poner arriba, el enlace en vivo, cómo ejecutar el proyecto y cómo contribuir, con el antes y el después real del README de mi portafolio.
type: manual
tags: [readme, documentación, github, presentación, buenas prácticas]
technologies: [GitHub, Markdown]
createdAt: 2026-10-18
related: [route/publicar-y-mantener-un-sitio, manual/git/commits-con-intencion, journal/documentar-proyectos-sin-repetir-el-readme]
references: [GitHub: acerca de los README | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes, Keep a Changelog en español | https://keepachangelog.com/es-ES/1.1.0/]
---

## Problema que resuelve

El README es lo primero que ve quien abre tu repositorio: un reclutador, alguien que quiere usar tu proyecto o tú mismo dentro de un año. Si no dice en diez segundos **qué es, dónde verlo y cómo ejecutarlo**, la mayoría cierra la pestaña.

Es el **paso 3** de la ruta [Del repo a producción](/rutas/publicar-y-mantener-un-sitio).

## La idea en una imagen

Un README es **la portada y la contraportada de un libro**. La portada (arriba) tiene que decir de qué va y llamar a abrirlo: el título, una frase y el enlace al sitio en vivo. La contraportada (abajo) tiene los datos para quien ya se decidió: cómo instalarlo, cómo contribuir y la licencia. Nadie lee un índice de carpetas antes de saber de qué va el libro.

## Qué va y en qué orden

```mindmap
Un README que se lee
- Arriba :: los primeros diez segundos
  - nombre y una frase
  - enlace en vivo
  - captura o vista previa
- En medio :: para entenderlo
  - estado y versión
  - qué tiene
- Abajo :: para usarlo
  - cómo ejecutarlo
  - cómo contribuir
  - licencia
```

En palabras: arriba van el nombre, una frase de qué es y para quién, el enlace al sitio en vivo y una vista previa. En medio, el estado y la versión, y qué contiene. Abajo, cómo ejecutarlo en local, cómo contribuir o añadir contenido, y la licencia.

1. **Nombre y una frase.** No «Mi portafolio», sino qué es y para quién.
2. **Enlace en vivo** a la vista, en la primera pantalla. Es lo que más se pulsa.
3. **Vista previa.** Una captura actual. Si la interfaz cambió, la captura también.
4. **Estado y versión.** «En desarrollo», «estable» o «en mantenimiento», y la versión, que debe coincidir con `package.json` y con el CHANGELOG.
5. **Qué tiene.** Las secciones o funciones principales, sin copiar el sitio entero.
6. **Cómo ejecutarlo.** Los comandos exactos, en un bloque copiable:

   ```bash
   npm install
   npm run dev
   ```

7. **Cómo contribuir o añadir contenido.** Dónde va cada cosa y qué comprueban las pruebas.
8. **Stack y licencia.** Y, si usas marcas de terceros, que no hay afiliación.

## Mantenerlo vivo

Un README desactualizado engaña más que no tener ninguno. La regla de mis proyectos: **si un cambio altera algo que el README describe, el README se actualiza en la misma rama que el cambio**. Cuenta como cambio: una función nueva, un script nuevo, una URL nueva (por ejemplo, un dominio propio) o una captura que quedó vieja. Un arreglo interno no toca el README: no es un diario.

## Así lo hice yo

El README de mi portafolio es el mejor antes y después que tengo:

| | [Diciembre de 2025](https://github.com/Sergio-Velandia/mi-portafolio/blob/e4eb3f3/README.md) | [Hoy](https://github.com/Sergio-Velandia/mi-portafolio/blob/main/README.md) |
| --- | --- | --- |
| Primera línea | «💻 Mi Portafolio – Desarrollador Web» | Nombre, rol y país, con insignias |
| Enlace en vivo | No tenía | En la primera pantalla, en español y en inglés |
| Cómo ejecutarlo | No tenía | Bloque copiable con `npm install`, `npm run dev` y los demás comandos |
| Estructura | Un árbol de carpetas a mano, sin explicación | Estructura con qué hace cada parte |
| Despliegue | Solo «GitHub Pages – Hosting del sitio» | Dominio propio, por qué no lleva archivo `CNAME` y por qué el `base` de Vite no cambia |
| Largo | 43 líneas | 283 líneas, con secciones que se pueden saltar |

En el historial también se ve cómo **no** mantenerlo: varios commits seguidos llamados «Update README.md» ([`e4eb3f3`](https://github.com/Sergio-Velandia/mi-portafolio/commit/e4eb3f3), [`47e18db`](https://github.com/Sergio-Velandia/mi-portafolio/commit/47e18db), [`717c1a1`](https://github.com/Sergio-Velandia/mi-portafolio/commit/717c1a1)) que no dicen qué cambió. Y cómo sí: [`436e66d` «docs: actualiza urls y correo del readme al dominio propio»](https://github.com/Sergio-Velandia/mi-portafolio/commit/436e66d), en la misma tanda que el cambio de dominio.

En Moss, el README lleva una tabla de cada sección (rutas, laboratorio, manual), las instrucciones para añadir contenido y una lista de ideas pendientes, entre ellas la fase futura de metadatos para compartir. Puedes verlo en [el repositorio de Moss](https://github.com/Sergio-Velandia/Moss#readme).

## Errores que cometí (o que casi cometo)

- **Un README sin enlace en vivo ni instrucciones.** El de diciembre de 2025 presentaba el portafolio pero no decía dónde verlo ni cómo ejecutarlo. Se detecta leyendo solo la primera pantalla: si no sabes dónde está el sitio, falta lo más importante.
- **Commits «Update README.md» que no dicen nada.** Se detecta en `git log -- README.md`: si no puedes saber qué cambió sin abrir cada commit, el mensaje no sirve.

## Lista de comprobación

- [ ] La primera pantalla tiene el nombre, una frase de qué es y para quién, y el enlace en vivo.
- [ ] Hay una vista previa actual.
- [ ] El estado y la versión coinciden con `package.json` y el CHANGELOG.
- [ ] Los comandos para ejecutarlo están en un bloque copiable y funcionan en un clon limpio.
- [ ] Dice cómo contribuir o añadir contenido.
- [ ] Tiene licencia y, si hace falta, el aviso de que no hay afiliación con marcas de terceros.
- [ ] Cada cambio que lo afecta lo actualiza en la misma rama.
