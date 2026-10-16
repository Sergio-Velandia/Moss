---
title: Instalar n8n en tu equipo con Docker o empezar en n8n Cloud
description: Elegir entre n8n Cloud y n8n autoalojado, instalarlo con Docker sin perder tus flujos al reiniciar, con la zona horaria correcta, y saber cómo actualizarlo.
type: manual
tags: [instalación, docker, n8n cloud, autoalojado, zona horaria, primeros pasos]
technologies: [n8n, Docker]
createdAt: 2026-10-16
related: [route/n8n-de-cero-a-produccion, manual/n8n/webhook-basico, manual/n8n/oauth2-de-google-en-n8n]
references: [n8n: elegir entre Cloud y autoalojado | https://docs.n8n.io/choose-n8n/, n8n: instalar con Docker | https://docs.n8n.io/hosting/installation/docker/, n8n: instalar con npm | https://docs.n8n.io/hosting/installation/npm/, n8n: zona horaria e idioma | https://docs.n8n.io/hosting/configuration/environment-variables/timezone-localization/, n8n Cloud | https://docs.n8n.io/manage-cloud/overview/, Docker Desktop | https://docs.docker.com/desktop/]
---

## Problema que resuelve

Quieres empezar con n8n y lo primero que encuentras son tres caminos: n8n Cloud, Docker y npm. Si eliges mal, pasan cosas como estas: instalas algo que ya no se recomienda, reinicias el equipo y tus flujos desaparecen, o tu reporte «de las 7:00» llega a otra hora.

Esta guía te ayuda a elegir, instala n8n en tu equipo con Docker paso a paso y explica cómo actualizarlo sin perder nada. Es el **paso 1** de la ruta [n8n, de cero a producción](/rutas/n8n-de-cero-a-produccion): todos los demás pasos dan por hecho que tienes n8n abierto en el navegador.

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

- **¿Quieres empezar ya, sin instalar nada?** Usa **n8n Cloud**: crea una cuenta en [n8n.io](https://n8n.io/), abre tu espacio de trabajo y salta a [Comprobar que todo funciona](#comprobar-que-todo-funciona). Cuando acabe la prueba gratuita necesitarás un plan de pago.
- **¿Quieres que sea gratis y tener el control?** Usa **Docker**, la *Community edition* autoalojada. Es el camino del resto de esta guía y el que se usó para probar las plantillas de Moss Nexus.
- **¿Y npm?** Sirve para probar un rato con `npx n8n`, pero n8n lo marca como **obsoleto a partir de la versión 3.0** y pide una versión concreta de Node.js (entre la 20.19 y la 24.x). Para algo que vas a seguir usando, mejor Docker.

## Instalar con Docker paso a paso

```flow
# De cero a n8n en el navegador
Docker Desktop :: lo instalas una vez
Volumen n8n_data :: donde viven tus flujos y credenciales
docker run :: arranca n8n con tu zona horaria
Navegador :: en localhost:5678 creas la cuenta de propietario
+ Listo :: primer flujo
```

### 1. Instala Docker Desktop

Descarga [Docker Desktop](https://docs.docker.com/desktop/) para Windows, Mac o Linux, instálalo y ábrelo. Incluye todo lo que necesitas (Docker Engine y Docker Compose). En Windows, el instalador puede pedirte activar WSL 2: acepta y reinicia si te lo pide.

Comprueba que funciona abriendo una terminal:

```bash
docker --version
```

Si responde con un número de versión, sigue. Si dice que no encuentra el comando, Docker Desktop no está abierto o no terminó de instalarse.

### 2. Crea el volumen para tus datos

```bash
docker volume create n8n_data
```

Un **volumen** es una carpeta que Docker guarda aparte del contenedor. Ahí n8n escribe sus flujos, credenciales, historial de ejecuciones y la clave con la que cifra las credenciales. Sin volumen, todo se pierde cada vez que se borra el contenedor.

### 3. Busca tu zona horaria

Necesitas el nombre de tu zona horaria en el formato `Continente/Ciudad`, por ejemplo `America/Bogota`, `America/Mexico_City`, `America/Argentina/Buenos_Aires` o `Europe/Madrid`.

Si no la configuras, n8n usa `America/New_York`, y los nodos programados (Schedule Trigger) corren a la hora de Nueva York.

### 4. Arranca n8n

En **macOS, Linux o Git Bash**:

```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/Bogota" \
  -e TZ="America/Bogota" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

En **Windows PowerShell** la barra invertida no sirve para partir líneas; usa el comando en una sola línea:

```powershell
docker run -it --rm --name n8n -p 5678:5678 -e GENERIC_TIMEZONE="America/Bogota" -e TZ="America/Bogota" -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true -v n8n_data:/home/node/.n8n n8nio/n8n
```

Cambia `America/Bogota` por tu zona. Qué hace cada parte:

| Parte | Para qué sirve |
| --- | --- |
| `-p 5678:5678` | Abre n8n en el puerto 5678 de tu equipo. |
| `GENERIC_TIMEZONE` | La zona horaria de n8n: la usan el Schedule Trigger y las expresiones de fecha. |
| `TZ` | La zona horaria del sistema dentro del contenedor (lo que devuelve, por ejemplo, `date`). |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` | Protege el archivo de configuración donde está la clave de cifrado. |
| `-v n8n_data:/home/node/.n8n` | Guarda los datos en el volumen del paso 2. |
| `--rm` | Borra el contenedor al detenerlo. Los datos siguen en el volumen. |

La primera vez tarda un poco porque descarga la imagen. Cuando la terminal muestre que n8n está listo, sigue.

### 5. Abre n8n y crea tu cuenta

Abre [http://localhost:5678](http://localhost:5678) en el navegador. La primera vez, n8n te pide crear la **cuenta de propietario** (*owner*): correo, nombre y contraseña. Es una cuenta local de tu instalación, no una cuenta de n8n.io, y la necesitarás cada vez que entres.

## Comprobar que todo funciona

1. Crea un flujo nuevo, añade un **Schedule Trigger** y un nodo **Code** con este código:

   ```js
   return [{ json: { ahora: $now.toFormat('yyyy-MM-dd HH:mm'), zona: $now.zoneName } }]
   ```

2. Pulsa **Execute workflow**. La salida debe mostrar tu hora y tu zona (por ejemplo, `America/Bogota`). Si sale `America/New_York`, revisa `GENERIC_TIMEZONE`; también puedes ajustarla por flujo en *Settings → Timezone*.
3. Guarda el flujo, detén n8n en la terminal con **Ctrl + C** y vuelve a ejecutar el mismo `docker run`. El flujo debe seguir ahí: el volumen funciona.

Con eso ya puedes seguir con el paso 2 de la ruta, [Webhook básico en n8n](/manual/n8n/webhook-basico).

## El día a día

- **Encender n8n:** abre Docker Desktop y ejecuta el mismo `docker run` de siempre. Mientras la terminal siga abierta, n8n está encendido.
- **Apagarlo:** Ctrl + C en la terminal. Ojo: los flujos programados solo corren mientras n8n está encendido. Si apagas el equipo a las 6:00, el reporte de las 7:00 no sale.
- **Actualizar:** n8n publica una versión nueva casi cada semana. Para pasar a la última versión estable, detén n8n, descarga la imagen nueva y arráncalo otra vez con el mismo comando:

  ```bash
  docker pull n8nio/n8n
  ```

  Tus flujos siguen en el volumen. Antes de actualizar algo importante, exporta tus flujos o haz una copia del volumen.

## Seguridad

- **Este n8n es solo para tu equipo.** `localhost:5678` no se ve desde internet, y está bien así para aprender. Para recibir webhooks de servicios externos necesitas una URL pública: lo verás en [Entender webhooks y triggers](/manual/n8n/entender-webhooks-y-triggers).
- **El volumen guarda tus secretos.** Ahí están las credenciales y la clave que las cifra. No lo compartas, y si lo copias como respaldo, trátalo como una contraseña.
- **La cuenta de propietario protege tus credenciales.** Usa una contraseña de verdad, aunque n8n solo corra en tu equipo.

## Lista de comprobación

- [ ] `docker --version` responde.
- [ ] Existe el volumen `n8n_data`.
- [ ] El `docker run` lleva `-v n8n_data:/home/node/.n8n`.
- [ ] `GENERIC_TIMEZONE` y `TZ` tienen tu zona horaria.
- [ ] Creaste la cuenta de propietario en `localhost:5678`.
- [ ] El nodo Code de prueba muestra tu hora y tu zona.
- [ ] Un flujo guardado sigue ahí después de reiniciar n8n.

## Errores frecuentes

- **`docker: command not found` o «error during connect».** Docker Desktop no está abierto o no terminó de instalarse. Ábrelo, espera a que diga que está en marcha y repite.
- **«port is already allocated».** Ya hay algo en el puerto 5678, casi siempre otro n8n que dejaste encendido. Ciérralo, o usa otro puerto con `-p 5679:5678` y abre `localhost:5679`. Si cambias el puerto, la *OAuth Redirect URL* de tus credenciales también cambia.
- **«The container name "/n8n" is already in use».** Quedó un contenedor anterior con ese nombre. Bórralo con `docker rm n8n` y vuelve a arrancar.
- **Mis flujos desaparecieron al reiniciar.** Arrancaste sin `-v n8n_data:/home/node/.n8n`, o con otro nombre de volumen. Usa siempre el mismo comando.
- **En PowerShell, el comando falla en la segunda línea.** PowerShell no entiende la `\` al final de línea. Usa la versión en una sola línea.
- **El Schedule Trigger corre a otra hora.** Falta `GENERIC_TIMEZONE`, o el flujo tiene otra zona en *Settings → Timezone*.
