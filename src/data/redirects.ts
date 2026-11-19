/**
 * Guías que se retiraron al unirse con otra. Su URL no puede responder 404, porque otras guías, otros
 * proyectos o páginas de fuera pueden enlazarla. Este mapa es la única lista, y de él salen tres cosas:
 *
 * - el build crea en la URL vieja una página mínima que lleva a la nueva, con `noindex` y `canonical`
 *   al destino (GitHub Pages no permite redirecciones 301), y la deja fuera del sitemap;
 * - la app redirige si se llega navegando, conservando el #ancla;
 * - el progreso guardado de las rutas pasa del id viejo al nuevo.
 *
 * Las claves y los valores son ids del jardín (`manual/<carpeta>/<archivo>`). Los enlaces internos se
 * cambian al destino: la redirección es para lo que no se puede editar desde Moss.
 */
export const REDIRECTS: Readonly<Record<string, string>> = {
  'manual/n8n/webhook-basico': 'manual/n8n/entender-webhooks-y-triggers',
}

const SECTION_PATHS: Readonly<Record<string, string>> = {
  manual: 'manual',
  journal: 'bitacora',
  lab: 'laboratorio',
  route: 'rutas',
  project: 'proyectos',
}

/** De id del jardín a ruta del sitio, sin barras: `journal/x` → `bitacora/x` */
export function idToPath(id: string): string {
  const [section = '', ...rest] = id.split('/')
  return [SECTION_PATHS[section] ?? section, ...rest].join('/')
}

/** El id vigente de un paso: el destino si se retiró, el mismo si no */
export const currentId = (id: string): string => REDIRECTS[id] ?? id

/** Para una ruta del sitio (con o sin barras), la ruta de destino si es una URL retirada */
export function redirectForPath(pathname: string): string | undefined {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  const from = Object.keys(REDIRECTS).find((id) => idToPath(id) === path)
  return from ? `/${idToPath(REDIRECTS[from])}` : undefined
}
