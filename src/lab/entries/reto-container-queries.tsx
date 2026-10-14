import { useEffect, useId, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Reto: la cabecera que no cabe',
  description: 'Una navegación que decide por el ancho de la ventana se desborda dentro de una caja angosta. Las container queries de Tailwind 4 la arreglan.',
  technology: 'CSS',
  category: 'Retos Tailwind',
  tags: ['reto', 'tailwind', 'container queries', '@container', 'responsive', 'navegación'],
  createdAt: '2026-10-13',
  usage:
    'md:flex mira el ancho de la ventana; @md:flex mira el del contenedor marcado con @container (en Tailwind 4, @md son 28rem). Úsalo en componentes que viven en columnas, barras laterales o tarjetas, donde la ventana no dice cuánto espacio tienen. El aviso de desborde usa un ResizeObserver solo para la demo.',
  dependencies: ['lucide-react', 'tailwindcss'],
}

const links = ['Inicio', 'Laboratorio', 'Manual', 'Bitácora', 'Proyectos']

export default function RetoContainerQueries() {
  const sliderId = useId()
  const [width, setWidth] = useState(300)
  const [fixed, setFixed] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  // Solo para la demo: avisa si los enlaces se salen de la barra
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const check = () => setOverflows(bar.scrollWidth > bar.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [fixed])

  return (
    <div className="w-full max-w-xl text-left">
      <p className="text-sm font-medium">El reto</p>
      <p className="mt-1 text-sm text-ink-soft">
        La barra vive en una caja cuyo ancho cambias con el deslizador. Sin arreglo decide por la ventana (
        <code className="font-mono">md:</code>); con arreglo, por la caja (<code className="font-mono">@md:</code>).
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div role="group" aria-label="Versión" className="inline-flex rounded-lg bg-cream-deep p-0.5 text-xs">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={fixed === v}
              onClick={() => setFixed(v)}
              className={`min-h-9 rounded-md px-3 font-medium transition-colors ${fixed === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
            >
              {v ? 'Con arreglo' : 'Sin arreglo'}
            </button>
          ))}
        </div>
        <label htmlFor={sliderId} className="flex items-center gap-2 text-sm text-ink-soft">
          Ancho de la caja
          <input
            id={sliderId}
            type="range"
            min={220}
            max={560}
            step={10}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-32 accent-accent"
          />
          <span className="w-14 font-mono text-xs tabular-nums text-ink">{width} px</span>
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-cream-deep/60 p-4">
        {/* La caja que cambia de ancho es el contenedor: @container */}
        <div style={{ width }} className="@container max-w-full">
          <div ref={barRef} className="flex items-center gap-2 overflow-hidden rounded-xl bg-surface px-3 py-2 shadow-sm">
            <span className="shrink-0 text-sm font-semibold text-sage-deep">Moss</span>
            <nav aria-label="Navegación de ejemplo" className={`ml-auto gap-1 text-xs ${fixed ? 'hidden @md:flex' : 'hidden md:flex'}`}>
              {links.map((l) => (
                <span key={l} className="whitespace-nowrap rounded-lg px-2 py-1 text-ink-soft">
                  {l}
                </span>
              ))}
            </nav>
            <span
              aria-hidden
              className={`ml-auto inline-flex size-8 items-center justify-center rounded-lg text-ink-soft ${fixed ? '@md:hidden' : 'md:hidden'}`}
            >
              <Menu size={16} />
            </span>
          </div>
        </div>
      </div>

      <p aria-live="polite" className={`mt-3 text-sm ${overflows ? 'text-danger' : 'text-sage-deep'}`}>
        {overflows
          ? 'Los enlaces no caben: la barra mira la ventana, que es ancha, y no la caja, que es angosta.'
          : fixed
            ? 'La barra mira su caja: por debajo de 28rem (448 px) muestra el botón de menú.'
            : 'Cabe, pero solo por suerte: prueba a hacer la caja más angosta en una ventana ancha.'}
      </p>
    </div>
  )
}
