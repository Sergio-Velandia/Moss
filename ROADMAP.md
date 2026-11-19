# Hoja de ruta de Moss

Lo que falta, ordenado para retomarlo sin perder el hilo. Moss es **estable**: crece con contenido nuevo y se corrige cuando algo deja de ser cierto. Cada punto dice dónde se ve hoy como pendiente, para que el sitio y esta lista no se contradigan.

Reglas que siguen vigentes: un cambio por versión cuando es pequeño (PATCH), contenido nuevo en lotes (MINOR), nada se anuncia como hecho si no se probó, y los pendientes se muestran como «Próximamente» en el sitio.

## 1. En curso (ciclo de cierre)

- [x] **Metadatos para compartir y buscadores.** Páginas por ruta que responden 200, Open Graph, Twitter Card, `canonical` y `og:url` por página, `sitemap.xml` e imagen de vista previa propia (1200×630).
- [x] **`robots.txt` en la raíz del dominio:** `sergio-velandia.dev/robots.txt` responde 200 y señala los sitemaps de Moss, Moss Nexus y el portafolio. Vive en el repositorio raíz `Sergio-Velandia.github.io`, no en Moss.
- [ ] **Registrar los sitemaps en Google Search Console.**
- [ ] **Rehacer `public/og.png`**, la imagen general del sitio. Dice «15 pasos» para la ruta de n8n, que desde la v1.17.0 tiene 14, y pone «correo» bajo «Dominio propio», que ahora lo deja a su propia guía. No tiene fuente en el repositorio: conviene hacerla con una plantilla HTML, como las de la Bitácora (`scripts/og-bitacora.html`).

## 2. Contenido que las rutas ya anuncian

### Ruta «CSS y Tailwind» (8 guías «Próximamente»)

En el orden de la ruta; cada una se suma a su paso al publicarse:

1. El modelo de caja sin sorpresas.
2. Flexbox y grid para layouts reales.
3. Unidades y diseño responsive.
4. Tema claro y oscuro sin parpadeo.
5. Estados y variantes en Tailwind 4.
6. Contraste y foco visibles.
7. Animar sin molestar.
8. De diseño a componente.

### Ruta «Del repo a producción»

- [ ] Ampliar el paso 6 (dominio propio): qué es un registrador y la oferta del primer año frente a la renovación, por qué cuatro IPs, el archivo `CNAME` del repositorio raíz, la columna «Para qué sirve» en la tabla DNS y el diagrama del viaje de una petición.
- [ ] Guía de calidad automática para el paso 4: pruebas, lint y build en GitHub Actions, pruebas de datos y de guarda.
- [ ] Guía de versiones para el paso 2 (hoy el paso tiene solo el artículo «Versionar después»).

## 3. Laboratorio: Piezas Tailwind

El lote 1 (botones, tarjetas y chips) está publicado. Se anuncian en la portada del Laboratorio:

- [ ] Lote 2: campos de formulario con validación junto al campo, avisos y estados vacíos.
- [ ] Lote 3: navegación (barra superior y pie), pestañas y acordeón.
- [ ] Lote 4: modal accesible, skeleton e interruptor de tema.
- [ ] El chip que se puede quitar (×), cuando alguna app lo use.

### Movimiento y Firebase

- [ ] Probar las cinco piezas de Movimiento en Firefox y en Safari. Se verificaron en Edge (Chromium): las de `animation-timeline` dependen de un soporte que llegó a Firefox el 27 de octubre de 2026.
- [ ] Piezas para la ruta de Firebase, sin Firebase: el traductor de errores de Authentication, el contador como torniquete (qué acepta la regla al crear, borrar o «poner en 0»), los estados de la sesión (anónima, pendiente y activa), un validador de campos con `hasOnly` y `hasAll`, y la tabla de «debilitar una condición y ver qué prueba cae».
- [ ] Ajustar la pantalla de entrada de Moss según su propia hoja de tiempos ([Dirección de secuencia](https://sergio-velandia.dev/Moss/manual/movimiento/direccion-de-secuencia/)): separar los granos del nombre y darle un reposo de verdad antes de la salida, que hoy es de 80 ms.

## 4. Rendimiento

- [ ] Cargar el texto de cada documento solo al abrirlo. Hoy todo el contenido viaja en el JavaScript inicial (unos 300 kB, 95 kB con gzip) y crece con cada guía.

## 5. Proyectos hermanos (fuera de este repositorio)

- [ ] **Moss Taste, probar las pruebas de las reglas:** debilitar a propósito cada condición de la tabla de [Probar las reglas, y probar las pruebas](https://sergio-velandia.dev/Moss/manual/firebase/probar-las-reglas-y-las-pruebas/) y ver que alguna prueba falla. Empezar por `d.actualizada == request.time` en las notas: leyendo `reglas/firestore.test.ts`, ninguna prueba de las notas envía una fecha inventada (las recetas sí). Necesita Java 21 para el emulador. Si aparece un hueco, se cuenta en esa guía.

- [ ] **Moss Nexus, enlace de vuelta:** cada plantilla que cuenta una entrada de la Bitácora debería enlazarla en sus `guias`. `onboarding-empleado`, `tickets-soporte-con-ia`, `cobranza-facturas-vencidas`, `aprobacion-de-gastos` y `facturas-gmail-a-drive` → [Registrar primero, avisar después](https://sergio-velandia.dev/Moss/bitacora/registrar-primero-avisar-despues/). `facturas-gmail-a-drive` → [Mi filtro era correcto y estaba mal](https://sergio-velandia.dev/Moss/bitacora/mi-filtro-era-correcto-y-estaba-mal/). `agenda-diaria-calendar`, `facturas-gmail-a-drive`, `cobranza-facturas-vencidas` y `aprobacion-de-gastos` → [Las credenciales que caducan solas](https://sergio-velandia.dev/Moss/bitacora/las-credenciales-que-caducan-solas/). `alertas-de-errores-n8n` → [El flujo de errores que no se disparaba](https://sergio-velandia.dev/Moss/bitacora/el-flujo-de-errores-que-no-se-disparaba/). `resumen-correos-con-ia` y `tickets-soporte-con-ia` → [No te cases con un modelo](https://sergio-velandia.dev/Moss/bitacora/no-te-cases-con-un-modelo/).

- [ ] **Moss Nexus:** corregir en su CHANGELOG la frase de la v1.0.0 que dice que el proyecto «pasa a mantenimiento». Nexus es estable: crece con plantillas.
- [ ] **Moss Nexus:** probar las 4 plantillas «Sin probar» y sellar las que pasen. Cuando cambie el número, actualizar su ficha en Proyectos y la ruta de n8n.
- [ ] **Moss Nexus:** la plantilla `leads-a-hubspot-sin-duplicados` enlaza `Moss/manual/n8n/webhook-basico`, que se unió a «Entender webhooks y triggers» en la v1.17.0. La redirección la cubre, pero conviene apuntarla al destino.
- [x] **Portafolio:** la mención de Nexus («14 plantillas», «aún no probadas») y su fase legal se hicieron en su v1.1.0.
- [ ] **Portafolio:** mostrar las versiones actuales de Moss, Nexus y Taste (su propio ROADMAP lo anota), y crear el tag `v1.2.3`: su `package.json` y su CHANGELOG ya están en esa versión, pero el último tag es `v1.2.2`.
- [ ] **ECOSISTEMA.md:** versiones al día (dice Nexus v1.0.0 y Moss Taste v0.9.0), el hub de la raíz del dominio como proyecto, y las reglas para proyectos nuevos (subdominios, dominios autorizados de Firebase Auth, EmailJS con dominio permitido).

## 6. Ideas sin fecha

- Estado de error en la demo del botón con estados.
- Una categoría de pruebas en el Manual.
- Traducir también el contenido al inglés (por ejemplo, con archivos `.en.md` junto a los originales).
- Feed RSS de la Bitácora.
- Capturas de pantalla en el README.
