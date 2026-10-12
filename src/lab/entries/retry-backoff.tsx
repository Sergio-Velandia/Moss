import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Reintentos con backoff y jitter',
  description: 'Visualiza cuándo reintentan tres clientes una API caída: sin jitter llegan todos a la vez; con jitter se reparten.',
  technology: 'React',
  category: 'Automatización',
  tags: ['reintentos', 'backoff', 'jitter', 'api', '429', 'rate limit', 'resiliencia'],
  createdAt: '2026-10-12',
  usage:
    '`delays()` calcula la espera de cada intento: base × 2^intento, con un tope. Con jitter ("full jitter") cada espera es un valor aleatorio entre 0 y ese máximo. La semilla hace la demo reproducible; en producción usa Math.random().',
  dependencies: ['lucide-react', 'tailwindcss'],
}

/** Generador pseudoaleatorio con semilla (mulberry32): misma semilla, mismos números. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Esperas (ms) antes de cada reintento. */
export function delays(attempts: number, base: number, cap: number, jitter: boolean, random: () => number) {
  return Array.from({ length: attempts }, (_, i) => {
    const max = Math.min(cap, base * 2 ** i)
    return jitter ? Math.round(random() * max) : max
  })
}

const clients = ['Cliente A', 'Cliente B', 'Cliente C']
const ATTEMPTS = 4
const CAP = 16_000

const seconds = (ms: number) => `${(ms / 1000).toLocaleString('es', { maximumFractionDigits: 1 })} s`

export default function RetryBackoff() {
  const [jitter, setJitter] = useState(false)
  const [base, setBase] = useState(1000)
  const [seed, setSeed] = useState(7)

  // Cada cliente tiene su propio azar; el instante de cada intento es la suma de las esperas previas
  const timelines = clients.map((name, c) => {
    const waits = delays(ATTEMPTS, base, CAP, jitter, seeded(seed * 31 + c))
    let t = 0
    return { name, hits: waits.map((w) => (t += w)) }
  })
  const end = Math.max(...timelines.flatMap((tl) => tl.hits)) * 1.05

  // Intentos que coinciden (±150 ms) con los de otro cliente: lo que satura la API al volver
  const collisions = timelines[0].hits.filter((h, i) =>
    timelines.slice(1).every((tl) => Math.abs(tl.hits[i] - h) < 150),
  ).length

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-surface/70 p-4 text-left shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div role="group" aria-label="Estrategia" className="inline-flex rounded-lg bg-cream-deep p-0.5 text-xs">
          {[false, true].map((j) => (
            <button
              key={String(j)}
              type="button"
              aria-pressed={jitter === j}
              onClick={() => setJitter(j)}
              className={`min-h-8 rounded-md px-3 font-medium transition-colors ${
                jitter === j ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {j ? 'Con jitter' : 'Sin jitter'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <span className="text-ink-soft">Espera base</span>
          <select
            value={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className="h-9 rounded-lg border border-cream-deep bg-surface px-2 text-base sm:text-sm"
          >
            {[500, 1000, 2000].map((b) => (
              <option key={b} value={b}>
                {seconds(b)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          disabled={!jitter}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-sage-deep transition hover:bg-sage/20 disabled:opacity-40"
        >
          <Shuffle size={14} aria-hidden /> Nueva tirada
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {timelines.map((tl) => (
          <li key={tl.name}>
            <p className="text-xs font-medium">{tl.name}</p>
            <div className="relative mt-1 h-6 rounded-full bg-cream-deep/80">
              {tl.hits.map((h, i) => (
                <span
                  key={i}
                  title={`Intento ${i + 2}: ${seconds(h)}`}
                  style={{ left: `${(h / end) * 100}%` }}
                  className="absolute top-1/2 inline-flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lavender-deep text-[10px] font-semibold text-surface"
                >
                  {i + 2}
                </span>
              ))}
            </div>
            <p className="sr-only">
              Reintentos en: {tl.hits.map(seconds).join(', ')}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm" aria-live="polite">
        {collisions > 0 ? (
          <span className="text-danger">
            Los tres clientes reintentan a la vez en {collisions} de {ATTEMPTS} intentos: la API recibe picos justo al recuperarse.
          </span>
        ) : (
          <span className="text-sage-deep">Los reintentos se reparten en el tiempo: la API se recupera sin picos.</span>
        )}
      </p>
    </div>
  )
}
