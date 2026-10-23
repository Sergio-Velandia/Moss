import { describe, expect, it } from 'vitest'
import { routeDocs, validateRoute, type Doc } from './content'
import { getGardenItems } from './dashboard'
import { knowledgeItems } from './knowledge'
import { getLegalPage } from './legal'
import { parseProgress, toggleInProgress } from './progress'
import { LAB_MINUTES, nextPending, routeMinutes, routeSteps, routesContaining, stepMinutes } from './routes'

const existing = new Set(knowledgeItems.map((i) => i.id))
const raw = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.ts'], { eager: true, query: '?raw', import: 'default' })

describe('rutas publicadas', () => {
  it('son cinco, en su orden, y todas cumplen las reglas', () => {
    expect(routeDocs.map((r) => r.slug)).toEqual([
      'n8n-de-cero-a-produccion',
      'css-y-tailwind',
      'frontend-con-react-y-tailwind',
      'datos-y-reportes-con-sql',
      'publicar-y-mantener-un-sitio',
    ])
    for (const r of routeDocs) expect(validateRoute(r, existing), r.id).toEqual([])
  })

  it('solo la ruta de n8n cierra con la invitación a Moss Nexus', () => {
    expect(routeDocs.filter((r) => r.route?.nexus).map((r) => r.slug)).toEqual(['n8n-de-cero-a-produccion'])
  })

  it('el tiempo estimado suma la lectura de cada documento y una estimación fija por demo', () => {
    const n8n = routeDocs[0]
    const steps = routeSteps(n8n)
    expect(steps).toHaveLength(n8n.route!.steps.length)
    expect(routeMinutes(n8n)).toBe(steps.reduce((s, x) => s + x.minutes, 0))
    expect(stepMinutes('lab/retry-backoff')).toBe(LAB_MINUTES)
  })
})

describe('validateRoute', () => {
  const base = routeDocs[0]
  const withSteps = (steps: string[], extra: Partial<NonNullable<Doc['route']>> = {}): Doc => ({
    ...base,
    route: { ...base.route!, steps, ...extra },
  })

  it('exige al menos cuatro pasos que existan y sin repetir', () => {
    expect(validateRoute(withSteps(base.route!.steps.slice(0, 3)), existing).join()).toMatch(/mínimo 4/)
    expect(validateRoute(withSteps([...base.route!.steps, 'manual/n8n/no-existe']), existing).join()).toMatch(/no existe/)
    const s = base.route!.steps
    expect(validateRoute(withSteps([...s, s[0]]), existing).join()).toMatch(/repetidos/)
  })

  it('exige mezclar secciones, un nivel conocido y no anidar rutas', () => {
    const onlyManual = base.route!.steps.filter((s) => s.startsWith('manual/'))
    expect(validateRoute(withSteps(onlyManual), existing).join()).toMatch(/dos secciones/)
    expect(validateRoute(withSteps(base.route!.steps, { level: 'experto' }), existing).join()).toMatch(/level/)
    expect(validateRoute(withSteps([...base.route!.steps, 'route/otra']), existing).join()).toMatch(/otra ruta/)
  })
})

describe('posición dentro de una ruta', () => {
  it('una pieza puede estar en varias rutas, con su anterior y su siguiente', () => {
    const positions = routesContaining('manual/javascript/verificar-la-interfaz-con-capturas')
    expect(positions.map((p) => p.route.slug).sort()).toEqual(['css-y-tailwind', 'frontend-con-react-y-tailwind', 'publicar-y-mantener-un-sitio'])
    const first = routesContaining('manual/n8n/instalar-n8n')[0]
    expect(first.index).toBe(0)
    expect(first.previous).toBeUndefined()
    expect(first.next?.id).toBe('manual/n8n/webhook-basico')
    const second = routesContaining('manual/n8n/webhook-basico')[0]
    expect(second.previous?.id).toBe('manual/n8n/instalar-n8n')
    expect(second.next?.id).toBe('lab/n8n-payload-builder')
    const last = routesContaining('journal/migrando-scripts-a-n8n')[0]
    expect(last.next).toBeUndefined()
  })

  it('continuar lleva al primer paso pendiente, o al principio si están todos', () => {
    expect(nextPending(['a', 'b', 'c'], ['a'])).toBe('b')
    expect(nextPending(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe('a')
    expect(nextPending(['a', 'b', 'c'], [])).toBe('a')
  })
})

describe('progreso guardado', () => {
  it('descarta datos corruptos en lugar de romper la página', () => {
    expect(parseProgress(null)).toEqual({})
    expect(parseProgress('no es json')).toEqual({})
    expect(parseProgress('[1,2]')).toEqual({})
    expect(parseProgress('{"ruta":["a",3,null,"b"],"otra":"x"}')).toEqual({ ruta: ['a', 'b'] })
  })

  it('marcar y desmarcar no muta el estado anterior', () => {
    const before = { ruta: ['a'] }
    const marked = toggleInProgress(before, 'ruta', 'b')
    expect(marked).toEqual({ ruta: ['a', 'b'] })
    expect(before).toEqual({ ruta: ['a'] })
    expect(toggleInProgress(marked, 'ruta', 'a')).toEqual({ ruta: ['b'] })
  })

  it('cada clave que el código guarda en el navegador está descrita en la política de privacidad', () => {
    const keys = new Set(Object.values(raw).flatMap((code) => [...code.matchAll(/['"](moss-[a-z-]+)['"]/g)].map((m) => m[1])))
    // Solo cuentan las que se usan con localStorage en ese mismo archivo
    const stored = [...keys].filter((k) => Object.values(raw).some((code) => code.includes(k) && code.includes('localStorage')))
    expect(stored.sort()).toEqual(['moss-lang', 'moss-route-progress', 'moss-theme'])
    const privacy = getLegalPage('privacidad')!.body
    for (const key of stored) expect(privacy, key).toContain(key)
  })
})

describe('integración', () => {
  it('el Herbario indexa las rutas y el tablero no las cuenta', () => {
    expect(knowledgeItems.filter((i) => i.type === 'route')).toHaveLength(5)
    expect(getGardenItems().some((i) => i.id.startsWith('route/'))).toBe(false)
  })

  it('las páginas existen en el router', () => {
    expect(raw['/src/App.tsx']).toContain('path="rutas"')
    expect(raw['/src/App.tsx']).toContain('path="rutas/:slug"')
  })
})
