---
title: Elegir dónde correr n8n: Cloud, Docker o npm
description: Elegir entre n8n Cloud, Docker y npm, y entender por qué importan la versión fija, el volumen, la zona horaria y la clave de cifrado. La instalación paso a paso está en Primeros pasos de Moss Nexus.
type: manual
tags: [n8n cloud, autoalojado, docker, versión fija, volumen, zona horaria, clave de cifrado, primeros pasos]
technologies: [n8n, Docker]
createdAt: 2026-10-16
updatedAt: 2026-11-05
related: [route/n8n-de-cero-a-produccion, manual/n8n/webhook-basico, manual/n8n/oauth2-de-google-en-n8n]
references: [Moss Nexus: Primeros pasos | https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/, n8n: elegir entre Cloud y autoalojado | https://docs.n8n.io/choose-n8n/, n8n: instalar con Docker | https://docs.n8n.io/hosting/installation/docker/, n8n: instalar con npm | https://docs.n8n.io/hosting/installation/npm/, n8n: zona horaria e idioma | https://docs.n8n.io/hosting/configuration/environment-variables/timezone-localization/, n8n Cloud | https://docs.n8n.io/manage-cloud/overview/, Docker Desktop | https://docs.docker.com/desktop/]
---

## Problema que resuelve

Quieres empezar con n8n y lo primero que encuentras son tres caminos: n8n Cloud, Docker y npm. Si eliges mal, pasan cosas como estas: instalas algo que ya no se recomienda, reinicias el equipo y tus flujos desaparecen, o tu reporte «de las 7:00» llega a otra hora.

Esta guía te ayuda a elegir y explica el porqué de las decisiones que evitan esos problemas. Los comandos para instalar están en [Primeros pasos de Moss Nexus](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/), la única fuente de verdad sobre cómo montar n8n. Es el **paso 1** de la ruta [n8n, de cero a producción](/rutas/n8n-de-cero-a-produccion): todos los demás pasos dan por hecho que tienes n8n abierto en el navegador.

## Qué camino elegir

```mindmap
Dónde corre n8n
- n8n Cloud :: lo aloja n8n
  - sin instalar nada
  - prueba gratuita y luego plan de pago
  - Sign in with Google sin Google Cloud
- Docker :: en tu equipo o servidor
  - Community edition gratis
  - tus datos se quedan contigo
  - el método recomendado para autoalojar
- npm :: con Node.js
  - para probar rápido
  - obsoleto desde n8n 3.0
```

- **¿Quieres empezar ya, sin instalar nada?** Usa **n8n Cloud**: crea una cuenta en [n8n.io](https://n8n.io/), abre tu espacio de trabajo y sigue con [Webhook básico en n8n](/manual/n8n/webhook-basico). Cuando acabe la prueba gratuita necesitarás un plan de pago.
- **¿Quieres que sea gratis y tener el control?** Usa **Docker**, la *Community edition* autoalojada. Es el camino que se usó para probar las plantillas de Moss Nexus. Para instalarlo, sigue [Primeros pasos](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/).
- **¿Y npm?** Sirve para probar un rato, pero n8n lo marca como **obsoleto a partir de la versión 3.0** y pide una versión concreta de Node.js (entre la 20.19 y la 24.x). Para algo que vas a seguir usando, mejor Docker.

## Por qué importan estas cuatro cosas

[Primeros pasos](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/) ya deja resueltas estas cuatro decisiones en un archivo `docker-compose.yml`. Conviene entenderlas porque, cuando fallan, el síntoma aparece mucho después y lejos de la causa.

- **Versión fija.** n8n publica una versión nueva casi cada semana, y una plantilla probada en una versión no está probada en todas. Con `latest`, la versión puede cambiar sin que te enteres la próxima vez que bajes la imagen, y un flujo que funcionaba deja de hacerlo sin que hayas tocado nada. Con una versión fija, actualizar es una decisión tuya: exportas tus flujos, cambias la versión y compruebas que siguen funcionando.
- **Volumen.** Es un espacio que Docker guarda aparte del contenedor. Ahí n8n escribe tus flujos, credenciales, historial de ejecuciones y tu cuenta. Sin volumen, todo se pierde cada vez que se recrea el contenedor.
- **Zona horaria.** Si no la configuras, n8n usa `America/New_York`, y un Schedule Trigger «de las 7:00» corre a las 7:00 de Nueva York. También afecta a las expresiones de fecha. Se escribe como `Continente/Ciudad`, por ejemplo `America/Bogota` o `Europe/Madrid`.
- **Clave de cifrado.** n8n cifra con ella las credenciales que guardas. Si la pierdes, esas credenciales no se recuperan y tendrás que crearlas de nuevo. Por eso conviene definirla tú y guardar una copia en tu gestor de contraseñas, en lugar de dejar que n8n la genere y la guarde solo dentro del volumen.

Una más, que no se arregla con configuración: los flujos programados solo corren mientras n8n está encendido. Si apagas el equipo a las 6:00, el reporte de las 7:00 no sale.

### Si ya instalaste n8n con una versión anterior de esta guía

Esta guía antes usaba `docker run` con un volumen llamado `n8n_data`. Primeros pasos usa Docker Compose, que crea un volumen con otro nombre (`n8n-local_n8n_data`, si la carpeta se llama `n8n-local`). Por eso, al seguirla verás un n8n vacío: **tus flujos no se perdieron, siguen en el volumen anterior.**

Reutilizar ese volumen con una clave nueva tampoco es la solución: n8n no arranca y muestra `Mismatching encryption keys`, porque la clave no es la que cifró esas credenciales. Lo más simple es hacer esto antes de cambiar:

1. Descarga tus flujos desde el editor de n8n.
2. Monta n8n con Primeros pasos, importa los flujos y vuelve a conectar tus credenciales.
3. Conserva el volumen anterior hasta comprobar que todo funciona.

## Seguridad

- **Este n8n es solo para tu equipo.** `localhost:5678` no se ve desde internet, y está bien así para aprender. Para recibir webhooks de servicios externos necesitas una URL pública: lo verás en [Entender webhooks y triggers](/manual/n8n/entender-webhooks-y-triggers).
- **El volumen y la clave guardan tus secretos.** El volumen tiene las credenciales, y la clave las descifra. No los compartas, no subas la clave a ningún repositorio y, si copias el volumen como respaldo, trátalo como una contraseña.
- **La cuenta de propietario protege tus credenciales.** Usa una contraseña de verdad, aunque n8n solo corra en tu equipo.

## Lista de comprobación

- [ ] Elegiste un camino: n8n Cloud, o Docker para algo que vas a seguir usando.
- [ ] Si elegiste Docker, terminaste [Primeros pasos](https://sergio-velandia.dev/Moss-Nexus/primeros-pasos/), con sus comprobaciones del volumen y de la zona horaria.
- [ ] Sabes qué versión de n8n usas y que no cambia hasta que tú lo decidas.
- [ ] Tienes una copia de la clave de cifrado fuera del equipo.
- [ ] Sabes que tus flujos programados solo corren con n8n encendido.

Si algo falla al instalar, Primeros pasos explica los tropiezos más comunes, con su síntoma, su causa y qué hacer.

Con n8n abierto en el navegador, sigue con el paso 2 de la ruta: [Webhook básico en n8n](/manual/n8n/webhook-basico).
