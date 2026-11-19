import { describe, expect, it } from 'vitest'
import { knowledgeItems } from '../lib/knowledge'
import { parseProgress } from '../lib/progress'
import { currentId, idToPath, redirectForPath, REDIRECTS } from './redirects'

const ids = new Set(knowledgeItems.map((i) => i.id))

describe('guías retiradas', () => {
  it('el origen ya no existe y el destino sí', () => {
    for (const [from, to] of Object.entries(REDIRECTS)) {
      expect(ids.has(from), from).toBe(false)
      expect(ids.has(to), to).toBe(true)
      // Sin cadenas: el destino no es a su vez una guía retirada
      expect(REDIRECTS[to], to).toBeUndefined()
    }
  })

  it('ningún contenido sigue enlazando a una guía retirada', () => {
    for (const item of knowledgeItems) {
      for (const r of item.related ?? []) expect(REDIRECTS[r], `${item.id} → ${r}`).toBeUndefined()
    }
  })

  it('pasa de id a ruta del sitio', () => {
    expect(idToPath('manual/n8n/webhook-basico')).toBe('manual/n8n/webhook-basico')
    expect(idToPath('journal/versionar-despues')).toBe('bitacora/versionar-despues')
    expect(idToPath('lab/pieza-botones')).toBe('laboratorio/pieza-botones')
  })

  it('reconoce la URL vieja con o sin barras y deja pasar las demás', () => {
    expect(redirectForPath('/manual/n8n/webhook-basico/')).toBe('/manual/n8n/entender-webhooks-y-triggers')
    expect(redirectForPath('manual/n8n/webhook-basico')).toBe('/manual/n8n/entender-webhooks-y-triggers')
    expect(redirectForPath('/manual/n8n/instalar-n8n')).toBeUndefined()
    expect(currentId('manual/n8n/instalar-n8n')).toBe('manual/n8n/instalar-n8n')
  })

  it('el progreso guardado pasa al id nuevo sin duplicarse', () => {
    const raw = JSON.stringify({ 'n8n-de-cero-a-produccion': ['manual/n8n/webhook-basico', 'manual/n8n/entender-webhooks-y-triggers', 'manual/n8n/instalar-n8n'] })
    expect(parseProgress(raw)).toEqual({ 'n8n-de-cero-a-produccion': ['manual/n8n/entender-webhooks-y-triggers', 'manual/n8n/instalar-n8n'] })
  })
})
