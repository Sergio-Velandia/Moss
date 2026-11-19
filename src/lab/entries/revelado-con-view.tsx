import { useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Revelado al entrar en pantalla con view()',
  description: 'Tarjetas que aparecen al entrar en su contenedor de scroll, solo con CSS: animation-timeline: view(), sin JavaScript ni IntersectionObserver.',
  technology: 'CSS',
  category: 'Movimiento',
  tags: ['scroll', 'view()', 'animation-timeline', 'revelado', 'sin javascript'],
  createdAt: '2026-11-18',
  usage:
    'Baja dentro de la caja: cada tarjeta aparece mientras entra, y si subes, se va. animation-range: entry 0% entry 70% decide en qué tramo de la entrada ocurre. El JavaScript de la demo solo sirve al botón «Repetir», que vuelve la caja arriba.',
  notes: [
    'animation-timeline va después del atajo animation, que la reinicia; y lleva animation-duration: 1ms porque Firefox exige una duración distinta de cero.',
    'Todo va dentro de @supports (animation-timeline: view()): donde no hay soporte, las tarjetas se ven quietas desde el principio.',
    'Con prefers-reduced-motion no hay animación: las tarjetas están visibles y quietas.',
    'La caja con scroll se puede enfocar con el teclado y tiene nombre, para que también se pueda recorrer sin ratón.',
  ],
  related: ['manual/movimiento/animar-con-el-scroll-sin-javascript', 'lab/barra-de-progreso-con-scroll', 'lab/fade-in-list'],
}

const css = `
@keyframes rv-aparecer {
  from { opacity: 0; transform: translateY(1.5rem) scale(0.97); }
  to { opacity: 1; transform: none; }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .rv-tarjeta {
      animation: rv-aparecer linear both;
      animation-duration: 1ms; /* Firefox exige una duración distinta de cero */
      animation-timeline: view(); /* siempre después del atajo animation, que la reinicia */
      animation-range: entry 0% entry 70%;
    }
  }
}
`

const tarjetas = ['Plantar', 'Regar', 'Podar', 'Injertar', 'Cosechar', 'Guardar semillas', 'Compostar', 'Volver a plantar']

export default function ReveladoConView() {
  const caja = useRef<HTMLDivElement>(null)

  return (
    <div className="w-64">
      <style>{css}</style>
      <div
        ref={caja}
        tabIndex={0}
        role="region"
        aria-label="Tarjetas que aparecen al bajar"
        className="h-60 overflow-y-auto overscroll-contain rounded-xl border border-surface/70 bg-surface/40 p-3"
      >
        <p className="px-1 pb-24 text-xs text-ink-soft">Baja dentro de esta caja.</p>
        <ul className="space-y-3">
          {tarjetas.map((t) => (
            <li key={t} className="rv-tarjeta rounded-xl bg-surface/80 px-4 py-5 text-sm shadow-sm">
              {t}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => caja.current?.scrollTo({ top: 0 })}
        className="mt-2 inline-flex min-h-8 items-center gap-1.5 px-1 text-xs text-ink-soft transition hover:text-sage-deep"
      >
        <RotateCcw size={12} aria-hidden /> Repetir
      </button>
    </div>
  )
}
