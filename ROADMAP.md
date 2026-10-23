# Hoja de ruta de Moss

Lo que falta, ordenado para retomarlo sin perder el hilo. Moss es **estable**: crece con contenido nuevo y se corrige cuando algo deja de ser cierto. Cada punto dice dónde se ve hoy como pendiente, para que el sitio y esta lista no se contradigan.

Reglas que siguen vigentes: un cambio por versión cuando es pequeño (PATCH), contenido nuevo en lotes (MINOR), nada se anuncia como hecho si no se probó, y los pendientes se muestran como «Próximamente» en el sitio.

## 1. En curso (ciclo de cierre)

- [ ] **Metadatos para compartir y buscadores.** Open Graph, Twitter Card, `canonical` y `og:url` con `https://sergio-velandia.dev/Moss/`, `sitemap.xml` e imagen de vista previa propia (1200×630). Las páginas por ruta que responden 200 ya están hechas.
- [ ] **`robots.txt` en el repositorio raíz** `Sergio-Velandia.github.io`, no en Moss: tiene que estar en la raíz del dominio y puede señalar el sitemap de cada proyecto. Hoy `sergio-velandia.dev/robots.txt` responde 404.

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

## 4. Rendimiento

- [ ] Cargar el texto de cada documento solo al abrirlo. Hoy todo el contenido viaja en el JavaScript inicial (unos 300 kB, 95 kB con gzip) y crece con cada guía.

## 5. Proyectos hermanos (fuera de este repositorio)

- [ ] **Moss Nexus:** corregir en su CHANGELOG la frase de la v1.0.0 que dice que el proyecto «pasa a mantenimiento». Nexus es estable: crece con plantillas.
- [ ] **Moss Nexus:** probar las 4 plantillas «Sin probar» y sellar las que pasen. Cuando cambie el número, actualizar su ficha en Proyectos y la ruta de n8n.
- [ ] **Portafolio:** actualizar la mención de Moss y Nexus (dice «14 plantillas» y «aún no probadas»), y hacer su fase legal (privacidad del formulario y archivo `LICENSE`).
- [ ] **ECOSISTEMA.md:** Moss y Nexus estables con su versión, URLs del dominio propio y las reglas para proyectos nuevos (subdominios, dominios autorizados de Firebase Auth, EmailJS con dominio permitido).

## 6. Ideas sin fecha

- Estado de error en la demo del botón con estados.
- Una categoría de pruebas en el Manual.
- Traducir también el contenido al inglés (por ejemplo, con archivos `.en.md` junto a los originales).
- Feed RSS de la Bitácora.
- Capturas de pantalla en el README.
