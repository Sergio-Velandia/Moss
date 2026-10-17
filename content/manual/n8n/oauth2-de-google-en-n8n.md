---
title: Conectar Gmail, Google Calendar, Google Drive y Google Sheets a n8n con OAuth2
description: Crear el cliente OAuth en Google Cloud Console paso a paso para Gmail, Calendar, Drive y Sheets, con n8n en Docker o en n8n Cloud, y evitar el flujo que deja de funcionar a los siete días.
type: manual
tags: [oauth2, google cloud, gmail, google calendar, google drive, google sheets, credenciales, docker, seguridad]
technologies: [n8n, Google Cloud]
createdAt: 2026-10-15
updatedAt: 2026-10-16
related: [route/n8n-de-cero-a-produccion, manual/n8n/reporte-diario-automatico, manual/n8n/orquestacion-y-manejo-de-errores]
references: [n8n: OAuth2 de Google para un servicio | https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/, n8n: credenciales de Google | https://docs.n8n.io/integrations/builtin/credentials/google/, Google: empezar con Google Auth Platform | https://support.google.com/cloud/answer/15544987, Google: OAuth 2.0 para las APIs de Google | https://developers.google.com/identity/protocols/oauth2, Google: permisos de la API de Gmail | https://developers.google.com/workspace/gmail/api/auth/scopes, Google: permisos de la API de Calendar | https://developers.google.com/workspace/calendar/api/auth, Google: permisos de la API de Drive | https://developers.google.com/workspace/drive/api/guides/api-specific-auth, Google: permisos de la API de Sheets | https://developers.google.com/workspace/sheets/api/scopes]
---

## Problema que resuelve

Copias un flujo de Google de Moss Nexus y sus nodos piden una **credencial**. Puede ser la plantilla [Agenda del día por correo](https://sergio-velandia.dev/Moss-Nexus/plantillas/agenda-diaria-calendar/), que lee Google Calendar y envía un correo por Gmail, o la plantilla [Facturas de proveedores de Gmail a Google Drive con registro](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/), que guarda adjuntos en Drive y los anota en Google Sheets, o la plantilla [Reporte diario de ventas](https://sergio-velandia.dev/Moss-Nexus/plantillas/reporte-diario-ventas/), que lee una hoja de Google Sheets y envía el resumen por Gmail. n8n habla de *Client ID*, *Client Secret* y *OAuth Redirect URL*; Google Cloud Console, de proyectos, APIs, *Audience* y clientes. Sin saber qué es cada pieza, es fácil perder una tarde con errores que no explican nada.

Esta guía conecta **Gmail, Google Calendar, Google Drive y Google Sheets** con una cuenta de **Gmail personal**, primero en **n8n autoalojado con Docker** y después en **n8n Cloud**. Está escrita a partir de pruebas reales de las dos plantillas en una instalación local con Docker; la de facturas se probó en n8n 2.43.5 el 15/10/2026, con datos ficticios.

Es un paso de la ruta [n8n, de cero a producción](/rutas/n8n-de-cero-a-produccion): va después de entender los triggers y antes de los flujos de negocio, porque esos flujos casi siempre necesitan conectarse a un servicio de terceros. Si sabes crear una credencial OAuth2 con Google, el mismo esquema te servirá para otros servicios.

## Las piezas y cómo se relacionan

```mindmap
Conectar Google a n8n
- Proyecto :: el contenedor en Google Cloud
  - APIs habilitadas
  - Gmail API
  - Google Calendar API
  - Google Drive API
  - Google Sheets API
- Google Auth Platform :: quién puede autorizar
  - Branding: nombre y correo
  - Audience: External y usuarios de prueba
- Cliente OAuth :: la identidad de tu n8n
  - Web application
  - Client ID y Client Secret
  - URI de redirección
- n8n :: las credenciales
  - Gmail OAuth2 API
  - Google Calendar OAuth2 API
  - Google Drive OAuth2 API
  - Google Sheets OAuth2 API
```

Un solo proyecto y un solo cliente OAuth sirven para todas las credenciales de n8n. Cada credencial pide sus propios permisos cuando la conectas.

## Qué pasa cuando pulsas «Sign in with Google»

```flow
# El viaje de la autorización
n8n :: te envía a Google con el Client ID
Google :: inicias sesión y apruebas los permisos
? ¿La URI de redirección coincide?
+ Código a n8n :: lo cambia por tokens con el Client Secret y los renueva solo | ! No coincide :: error redirect_uri_mismatch
```

Por eso la *OAuth Redirect URL* es lo más delicado: Google solo devuelve el código a las direcciones que registraste, y tienen que coincidir **carácter por carácter**, con el protocolo, el puerto y la ruta.

## Antes de empezar

- Una cuenta de Google (aquí, Gmail personal).
- n8n en marcha (si aún no lo tienes, sigue [Instalar n8n](/manual/n8n/instalar-n8n)). En Docker, con la zona horaria de tu ciudad: la plantilla de agenda se dispara a las 7:00 y lee los eventos «de hoy», y la de facturas registra la fecha de cada correo.

```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/Bogota" -e TZ="America/Bogota" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

- El flujo importado en n8n, para tener a mano los nodos que piden la credencial:
  - **Agenda del día:** «Eventos de hoy» (Google Calendar) y «Enviar por Gmail».
  - **Facturas:** el Gmail Trigger, «Subir a Drive» (Google Drive) y «Registrar factura» (Google Sheets).
  - **Reporte de ventas:** «Leer ventas» (Google Sheets) y «Enviar reporte» (Gmail).

## Paso a paso con n8n en Docker

### 1. Copia la Redirect URL desde n8n

Abre cualquiera de los nodos de Google del flujo (por ejemplo, «Eventos de hoy» o el Gmail Trigger), elige **Create new credential** y deja la ventana abierta. n8n muestra el campo **OAuth Redirect URL**. En una instalación local con el puerto por defecto es:

```text
http://localhost:5678/rest/oauth2-credential/callback
```

Copia la que veas **en tu panel**, no la de esta guía: si cambiaste el puerto, usas un túnel o definiste `WEBHOOK_URL`, será distinta. Es la misma para todas las credenciales de Google. Google acepta `localhost` como redirección, así que no necesitas un dominio público ni HTTPS para probar en tu equipo.

### 2. Crea un proyecto en Google Cloud

1. Entra en [console.cloud.google.com](https://console.cloud.google.com/) con tu cuenta.
2. En el selector de proyecto de la barra superior, pulsa **New project**, ponle un nombre (por ejemplo, `n8n-local`) y créalo.
3. Comprueba que el selector muestra **tu proyecto nuevo**. Crear cosas en otro proyecto es uno de los errores más comunes.

### 3. Habilita las APIs

Cada plantilla usa solo las APIs que necesita. Habilita las de tu flujo; puedes volver a este paso cuando importes otro.

| API | Agenda del día | Facturas a Drive | Reporte de ventas |
| --- | --- | --- | --- |
| Gmail API | Sí | Sí | Sí |
| Google Calendar API | Sí | — | — |
| Google Drive API | — | Sí | Sí |
| Google Sheets API | — | Sí | Sí |

El reporte de ventas no tiene nodo de Drive, pero la documentación de n8n pide habilitar la **Google Drive API** en todo flujo que use Google Sheets: el nodo la usa para encontrar las hojas.

1. Ve a **APIs & Services → Library**.
2. Busca la API (por ejemplo, **Google Drive API**) y pulsa **Enable**.
3. Vuelve a la biblioteca y repite con cada una de las que necesites.

Sin este paso, la credencial se conecta bien, pero el nodo falla después con un error 403 que dice que la API no está habilitada.

### 4. Configura Google Auth Platform

Es lo que antes se llamaba «pantalla de consentimiento OAuth». La primera vez, Google te guía con **Get started**:

1. **App information (Branding):** un nombre que reconozcas (por ejemplo, «n8n de Sergio») y tu correo como correo de soporte.
2. **Audience:** con Gmail personal, elige **External**. *Internal* solo existe para organizaciones de Google Workspace.
3. **Contact information:** tu correo.
4. Acepta la política de datos de usuario de Google y termina.

Después, en **Audience → Test users**, pulsa **Add users** y añade **tu propio correo**. Con *External*, la app empieza en modo *Testing* y solo las personas de esa lista pueden autorizarla.

### 5. Crea el cliente OAuth

1. En **Google Auth Platform → Clients**, pulsa **Create client**.
2. **Application type:** **Web application**.
3. **Name:** algo como `n8n local`.
4. En **Authorized redirect URIs**, pulsa **Add URI** y pega la URL que copiaste en el paso 1.
5. Pulsa **Create**.

Google muestra el **Client ID** y el **Client Secret**. Cópialos en ese momento a un lugar seguro: en la consola actual el secreto puede no volver a mostrarse completo, y si lo pierdes tendrás que generar otro.

### 6. Termina las credenciales en n8n

1. En la ventana de credencial que dejaste abierta, pega el **Client ID** y el **Client Secret**.
2. Pulsa **Sign in with Google** y elige tu cuenta.
3. Google avisa de que **no ha verificado esta app**. Es normal: la app es tuya y está en modo de prueba. Pulsa **Continuar** (en algunas pantallas, primero *Configuración avanzada*).
4. Aprueba los permisos. La ventana se cierra y n8n marca la credencial como conectada.
5. Repite en cada nodo que pida una credencial distinta, **siempre con el mismo Client ID y el mismo Client Secret**:

| Credencial de n8n | Agenda del día | Facturas a Drive | Reporte de ventas |
| --- | --- | --- | --- |
| Gmail OAuth2 API | «Enviar por Gmail» | Gmail Trigger | «Enviar reporte» |
| Google Calendar OAuth2 API | «Eventos de hoy» | — | — |
| Google Drive OAuth2 API | — | «Subir a Drive» | — |
| Google Sheets OAuth2 API | — | «Registrar factura» | «Leer ventas» |

El Gmail Trigger usa la misma credencial **Gmail OAuth2 API** que el nodo de Gmail: si ya la creaste para otro flujo, selecciónala en lugar de crear otra.

### 7. Prueba el flujo

- **Agenda del día:** cambia `tu-correo@ejemplo.com` por tu correo en «Enviar por Gmail» y pulsa **Test workflow**. Deberías recibir la agenda de hoy. Si el día no tiene eventos, el correo llega igual y lo dice.
- **Facturas:** antes, prepara Gmail, Drive y Sheets como se explica en [la sección siguiente](#preparar-gmail-drive-y-sheets-para-las-facturas). Después envíate un correo con un PDF de prueba, etiquétalo `facturas` y pulsa **Test workflow**. El archivo debería aparecer en la carpeta de Drive y en una fila nueva de la hoja.
- **Reporte de ventas:** prepara una hoja nativa de Google Sheets con la pestaña «Ventas» y las columnas Fecha, Cliente, Producto y Total, pega su URL en «Leer ventas», cambia `tu-correo@ejemplo.com` en «Enviar reporte» y pulsa **Test workflow**. Recibirás el resumen de ayer; si ayer no hubo ventas, el correo llega igual y lo dice.

## Pruébalo con un flujo fácil

Si es tu primer flujo con Google, empieza por uno de **nivel fácil**. En Moss Nexus hay dos listos para copiar, de unos 20 minutos cada uno, que solo necesitan lo que ya hiciste en esta guía:

- **[Agenda del día por correo](https://sergio-velandia.dev/Moss-Nexus/plantillas/agenda-diaria-calendar/):** Google Calendar y Gmail. Te envía tus eventos cada mañana de lunes a viernes.
- **[Reporte diario de ventas](https://sergio-velandia.dev/Moss-Nexus/plantillas/reporte-diario-ventas/):** Google Sheets y Gmail. Te envía cada mañana cuántas ventas hubo ayer, cuánto sumaron y qué se vendió más.

Los dos arrancan con un Schedule Trigger y arman el mensaje en un nodo Code; la guía [Reporte diario automático](/manual/n8n/reporte-diario-automatico) explica esa idea en detalle. Cuando te salgan, la plantilla de facturas es el siguiente escalón: usa un trigger de Gmail, varias credenciales y más preparación.

## Preparar Gmail, Drive y Sheets para las facturas

La plantilla [Facturas de proveedores de Gmail a Google Drive con registro](https://sergio-velandia.dev/Moss-Nexus/plantillas/facturas-gmail-a-drive/) no solo necesita las credenciales: también espera encontrar una etiqueta en Gmail, una carpeta en Drive y una hoja con un formato concreto.

```flow
# Del correo al registro
Gmail Trigger :: cada 5 min busca has:attachment label:facturas y descarga los adjuntos
Separar adjuntos :: deja pasar PDF, XML y ZIP; imágenes solo si pesan 50 KB o más y no parecen logo o firma
Subir a Drive :: guarda cada archivo en la carpeta de destino
Registrar factura :: añade una fila en la pestaña Registro
```

El nodo Code «Separar adjuntos» existe porque los correos de proveedores suelen traer, además de la factura, el logo de la empresa y la imagen de la firma. Sin ese filtro, la carpeta de Drive se llena de imágenes pequeñas que no son facturas.

### Gmail: la etiqueta y el filtro

1. En Gmail, crea la etiqueta **`facturas`** (en minúsculas, como la busca el trigger).
2. Crea un filtro que la aplique sola: en la barra de búsqueda, abre las opciones de búsqueda, escribe en **De** las direcciones de tus proveedores (por ejemplo, `facturacion@proveedor-ejemplo.com`), marca **Tiene archivo adjunto** y pulsa **Crear filtro → Aplicar la etiqueta: facturas**.
3. El trigger solo ve los correos que tienen **a la vez** un adjunto y la etiqueta.

Si te envías el correo a ti mismo para probar, el filtro a veces no aplica la etiqueta. Ponla a mano en el correo y vuelve a probar.

### Drive: la carpeta de destino

1. Crea en Google Drive la carpeta donde quieres guardar las facturas.
2. Ábrela y copia la URL de la barra de direcciones. Tendrá esta forma:

   ```text
   https://drive.google.com/drive/folders/ID_DE_TU_CARPETA
   ```

3. En el nodo «Subir a Drive», en el campo de la carpeta, elige **By URL** y pega esa URL.

### Sheets: la hoja de registro

1. Crea la hoja desde Google Sheets (**Archivo → Nuevo → Hoja de cálculo**). Tiene que ser un **Google Sheet nativo**: un `.xlsx` subido a Drive se ve igual, pero la API de Sheets no puede escribir en él.
2. Nombra la pestaña **`Registro`**.
3. Escribe en la primera fila, una por celda y con este texto exacto:

   | A | B | C | D | E |
   | --- | --- | --- | --- | --- |
   | Fecha | Remitente | Asunto | Archivo | Enlace |

4. En el nodo «Registrar factura», elige la hoja **By URL** (`https://docs.google.com/spreadsheets/d/ID_DE_TU_HOJA/edit`) y la pestaña `Registro`. Si n8n no muestra las columnas, pulsa **Retry** en el mapeo.

## Con n8n Cloud

En n8n Cloud hay un atajo: los nodos de Gmail, Google Calendar, Google Drive y Google Sheets, y sus triggers, admiten **Managed OAuth2**. En la ventana de la credencial basta con pulsar **Sign in with Google**, sin crear proyecto, API ni cliente en Google Cloud. Es la opción recomendada en Cloud.

Si prefieres usar tu propio cliente (**Custom OAuth2**, en el desplegable de la credencial), los pasos son los mismos que en Docker. Solo cambia la **OAuth Redirect URL**: será la que muestre tu panel de n8n Cloud, con HTTPS. Cópiala de ahí y regístrala en el cliente.

La preparación de Gmail, Drive y Sheets para la plantilla de facturas es la misma en los dos casos.

```mindmap
Qué cambia según dónde corre n8n
- Docker local :: tu propio cliente OAuth
  - Redirect URL con localhost
  - proyecto y APIs a tu cargo
- n8n Cloud :: dos opciones
  - Managed OAuth2 sin Google Cloud
  - Custom OAuth2 con la URL del panel
```

## La trampa de los siete días

Con una cuenta de Gmail personal la app queda en *External* y en modo *Testing*. En ese modo, **Google hace caducar la autorización a los siete días**. El flujo funciona perfecto la primera semana y después falla al pedir los eventos, al leer el correo, al subir a Drive o al escribir en la hoja, aunque nadie haya tocado nada.

Afecta por igual a las cuatro credenciales, porque todas usan la misma app de Google. Si tienes varias, caducan todas.

Opciones, de más simple a más estable:

- **Reconectar cada semana:** abre cada credencial y vuelve a pulsar *Sign in with Google*. Sirve para pruebas.
- **Pasar la app a producción:** en **Audience**, cambia el estado de publicación a **In production**. Para un uso solo tuyo, el aviso de app no verificada sigue apareciendo al conectar, pero la autorización deja de caducar cada semana. Antes de usarla con más personas, revisa la política de verificación de Google: Gmail y Drive piden permisos que Google considera restringidos.
- **Usar n8n Cloud con Managed OAuth2,** donde la app la gestiona n8n.

Un [flujo de errores](/manual/n8n/orquestacion-y-manejo-de-errores) con Error Trigger te avisa el día que la autorización caduque, en lugar de enterarte cuando falte la agenda o una factura.

## Seguridad

- **El Client Secret es una contraseña.** No lo pegues en un nodo Code, en notas del flujo ni en capturas. Vive solo en la credencial de n8n.
- **Los permisos que pide cada credencial.** Por defecto, n8n pide permisos amplios para que el nodo sirva para todas sus operaciones:

  | Credencial | Permisos principales | Qué permiten |
  | --- | --- | --- |
  | Gmail | `https://mail.google.com/` | Acceso completo al correo: leer, etiquetar y enviar |
  | Google Drive | `…/auth/drive`, `…/auth/drive.appdata`, `…/auth/drive.photos.readonly` | Ver, crear y borrar **cualquier** archivo de tu Drive |
  | Google Sheets | `…/auth/spreadsheets`, `…/auth/drive.file`, `…/auth/drive.metadata` | Leer y editar tus hojas, y ver los datos de tus archivos de Drive para listarlas |

  Google clasifica `drive` y `drive.metadata` como permisos **restringidos**, y `spreadsheets` como **sensible** (ver [permisos de Drive](https://developers.google.com/workspace/drive/api/guides/api-specific-auth) y [permisos de Sheets](https://developers.google.com/workspace/sheets/api/scopes)). Las versiones recientes de n8n permiten elegir permisos propios en *Custom Scopes*: úsalo solo si sabes qué operaciones necesita tu flujo.
- **Compartir un flujo no comparte la credencial,** siempre que exportes el JSON sin datos de credenciales. Las plantillas de Moss Nexus pasan una prueba que lo garantiza.
- **No publiques tus IDs.** La URL de tu carpeta o de tu hoja no da acceso por sí sola, pero tampoco hace falta enseñarla: en capturas y ejemplos usa marcadores como `ID_DE_TU_CARPETA`.
- **Revoca lo que no uses.** Desde tu cuenta de Google (*Seguridad → Acceso de terceros*) puedes retirar el acceso a la app en cualquier momento.

## Lista de comprobación

- [ ] El selector de Google Cloud muestra el proyecto correcto.
- [ ] Están habilitadas las APIs de tu plantilla: Calendar y Gmail para la agenda; Gmail, Drive y Sheets para las facturas y para el reporte de ventas.
- [ ] Audience es *External* y tu correo está en *Test users*.
- [ ] El cliente es de tipo *Web application*.
- [ ] La URI de redirección es exactamente la que muestra n8n.
- [ ] Todas las credenciales usan el mismo Client ID y Client Secret.
- [ ] Facturas: existe la etiqueta `facturas` y un filtro que la aplica a los correos de tus proveedores.
- [ ] Facturas: la hoja es un Google Sheet nativo, con la pestaña `Registro` y la fila 1 `Fecha, Remitente, Asunto, Archivo, Enlace`.
- [ ] Sabes qué harás cuando pasen los siete días.

## Errores frecuentes

- **`redirect_uri_mismatch`.** La URI del cliente no coincide con la que envía n8n: falta el puerto, sobra una barra, es `http` en vez de `https`, o cambiaste de túnel. Copia otra vez la del panel de n8n y reemplázala en el cliente.
- **`access_denied` o «la app está en proceso de prueba».** Tu correo no está en *Test users*.
- **«Google no verificó esta app».** No es un error: en modo de prueba aparece siempre. Continúa si la app es tuya.
- **Error 403 o «API has not been used in project… or it is disabled».** La API correspondiente (Gmail, Calendar, Drive o Sheets) no está habilitada en el proyecto del cliente. Habilítala en **APIs & Services → Library**, espera un par de minutos y vuelve a ejecutar.
- **Funcionaba y dejó de funcionar a la semana.** Es la caducidad de los siete días del modo *Testing*.
- **La agenda sale vacía o del día equivocado.** La zona horaria de n8n no es la tuya: revisa `GENERIC_TIMEZONE` en Docker y *Settings → Timezone* en el flujo.
- **«This operation is not supported for this document. The document must not be an Office file».** La hoja es un `.xlsx` subido a Drive. Ábrela, elige **Archivo → Guardar como hoja de cálculo de Google** y usa la URL de la copia nueva en «Registrar factura».
- **«At least one value has to be added under 'Values to Send'» o «No columns found».** Falta la fila de encabezados exacta en la pestaña `Registro`. Escribe `Fecha, Remitente, Asunto, Archivo, Enlace` en la fila 1 y pulsa **Retry** en el mapeo de columnas.
- **«The item has no binary field 'archivo'».** Se editó el nodo Code «Separar adjuntos» y el binario ya no se llama `archivo`, o una expresión pide un campo que el Code dejó de crear. Revisa que el Code siga entregando el adjunto en el campo binario `archivo`.
- **El trigger no encuentra correos.** El correo no tiene la etiqueta `facturas` o no trae adjuntos. Si te lo enviaste a ti mismo, pon la etiqueta a mano.
