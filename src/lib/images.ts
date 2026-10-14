/**
 * Imágenes del contenido. Viven en content/images/ y en el Markdown se escriben así:
 *
 *   ![Texto alternativo](/imagenes/tarjetas-de-proyectos-992x312.webp "Pie de foto opcional")
 *
 * El nombre termina en -<ancho>x<alto>: así cada <img> lleva sus dimensiones y la página no salta al cargar.
 * Vite las incluye en el build con hash, y las pruebas exigen que cada imagen exista, tenga texto alternativo
 * y sus dimensiones.
 */
const files = import.meta.glob('/content/images/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const IMAGE_PREFIX = '/imagenes/'

export interface ContentImage {
  url: string
  width: number
  height: number
}

/** Ancho y alto a partir del nombre ("captura-992x312.webp" → 992 × 312) */
export function imageSize(name: string): { width: number; height: number } | null {
  const m = /-(\d+)x(\d+)\.\w+$/.exec(name)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null
}

/** "/imagenes/x-10x10.webp" → URL final del build, o null si no existe o no lleva dimensiones */
export function resolveImage(src: string): ContentImage | null {
  if (!src.startsWith(IMAGE_PREFIX)) return null
  const name = src.slice(IMAGE_PREFIX.length)
  const url = files[`/content/images/${name}`]
  const size = imageSize(name)
  return url && size ? { url, ...size } : null
}

/** Nombres de archivo de todas las imágenes disponibles (para detectar imágenes sin usar) */
export const contentImageNames = Object.keys(files).map((p) => p.split('/').pop()!)
