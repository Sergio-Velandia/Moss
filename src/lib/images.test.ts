import { describe, expect, it } from 'vitest'
import { journalPosts, manualDocs, projectDocs } from './content'
import { IMAGE_PREFIX, contentImageNames, imageSize, resolveImage } from './images'

const docs = [...manualDocs, ...journalPosts, ...projectDocs]
// ![alt](src "pie opcional")
const images = docs.flatMap((d) =>
  [...d.body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(([, alt, src]) => ({ id: d.id, alt, src })),
)

describe('imágenes del contenido', () => {
  it('lee las dimensiones del nombre del archivo', () => {
    expect(imageSize('captura-992x312.webp')).toEqual({ width: 992, height: 312 })
    expect(imageSize('sin-medidas.webp')).toBeNull()
  })

  it('solo resuelve rutas /imagenes/ que existen', () => {
    expect(resolveImage('https://example.com/x-10x10.webp')).toBeNull()
    expect(resolveImage(`${IMAGE_PREFIX}no-existe-10x10.webp`)).toBeNull()
  })

  it('cada imagen citada existe, tiene texto alternativo y dimensiones', () => {
    for (const { id, alt, src } of images) {
      expect(alt.trim().length, `${id}: ${src} sin texto alternativo`).toBeGreaterThan(10)
      expect(resolveImage(src), `${id}: ${src} no existe o no lleva -<ancho>x<alto> en el nombre`).not.toBeNull()
    }
  })

  it('no hay imágenes sin usar en content/images', () => {
    const used = new Set(images.map((i) => i.src.slice(IMAGE_PREFIX.length)))
    expect(contentImageNames.filter((n) => !used.has(n))).toEqual([])
  })
})
