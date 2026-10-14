import { useState } from 'react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Reto: la tarjeta que rompe la cuadrícula',
  description: 'Una línea larga de código ensancha toda la columna de un grid y desborda la pantalla. ¿Qué clase falta?',
  technology: 'CSS',
  category: 'Retos Tailwind',
  tags: ['reto', 'tailwind', 'grid', 'min-w-0', 'overflow', 'responsive', 'móvil'],
  createdAt: '2026-10-13',
  usage:
    'Una cuadrícula sin grid-cols-* (como la del Laboratorio por debajo de sm) tiene una columna implícita de tamaño auto, y sus elementos tienen min-width: auto: nunca se encogen por debajo de su contenido. Con min-w-0 en el elemento y overflow-x-auto en el bloque de código, la línea larga se desplaza dentro de la tarjeta. Las clases grid-cols-* de Tailwind 4 usan minmax(0, 1fr), por eso el error solo aparecía en móvil.',
  dependencies: ['tailwindcss'],
}

const longLine = 'const csv = toCsv(facturas, { separator: ";", bom: true, protectFormulas: true })'

export default function RetoGridMinW0() {
  const [fixed, setFixed] = useState(false)

  return (
    <div className="w-full max-w-md text-left">
      <p className="text-sm font-medium">El reto</p>
      <p className="mt-1 text-sm text-ink-soft">
        La caja punteada es un móvil de 240 px. La tarjeta tiene una línea de código larga. Sin arreglo, la columna del
        grid crece con ella y se sale de la pantalla.
      </p>

      <div role="group" aria-label="Versión" className="mt-3 inline-flex rounded-lg bg-cream-deep p-0.5 text-xs">
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

      {/* El marco exterior recorta lo que se sale, para que el desborde se vea sin romper esta página */}
      <div className="mt-4 overflow-hidden rounded-xl bg-cream-deep/60 p-4">
        <div className="relative w-60 rounded-lg border-2 border-dashed border-sage-deep/60 p-2">
          <span className="absolute -top-2.5 left-2 bg-cream-deep px-1 text-[10px] font-medium text-sage-deep">240 px</span>
          {/* Sin grid-cols-*: columna implícita de tamaño auto, como la cuadrícula del Laboratorio en móvil */}
          <div className="grid gap-2">
            <div className={fixed ? 'min-w-0' : ''}>
              <article className="rounded-lg bg-surface p-3 shadow-sm">
                <p className="text-sm font-medium">Exportar facturas</p>
                <pre className={`mt-2 rounded bg-cream-deep/80 p-2 font-mono text-[11px] ${fixed ? 'overflow-x-auto' : ''}`}>
                  <code>{longLine}</code>
                </pre>
              </article>
            </div>
          </div>
        </div>
      </div>

      <p aria-live="polite" className={`mt-3 text-sm ${fixed ? 'text-sage-deep' : 'text-danger'}`}>
        {fixed ? (
          <>
            <code className="font-mono">min-w-0</code> deja encoger el elemento del grid y{' '}
            <code className="font-mono">overflow-x-auto</code> desplaza la línea dentro de la tarjeta.
          </>
        ) : (
          <>
            Sin <code className="font-mono">grid-cols-*</code>, la columna es implícita y de tamaño auto: la tarjeta mide lo
            que su línea más larga y se sale.
          </>
        )}
      </p>
    </div>
  )
}
