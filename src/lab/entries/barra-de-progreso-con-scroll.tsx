import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Barra de progreso de lectura con scroll()',
  description: 'Una barra que avanza con el scroll de su contenedor, solo con CSS, y el interruptor que reproduce la trampa de overflow: hidden.',
  technology: 'CSS',
  category: 'Movimiento',
  tags: ['scroll', 'scroll()', 'animation-timeline', 'progreso', 'overflow', 'sin javascript'],
  createdAt: '2026-11-18',
  usage:
    'Baja dentro de la caja y la barra avanza. Con «overflow: hidden» en el envoltorio, ese envoltorio se vuelve el contenedor de scroll más cercano: la barra mira un scroll que nunca se mueve y se queda en cero. Con «overflow: clip» recorta igual, pero no es un contenedor de scroll, y todo vuelve a funcionar.',
  notes: [
    'Va atada al scroll, así que su curva es linear: la velocidad la pone la mano de quien baja.',
    'Solo anima transform: scaleX, con transform-origin a la izquierda.',
    'Donde no hay soporte para animation-timeline, la barra no se muestra: una barra quieta en cero confundiría más que no tenerla.',
    'Con prefers-reduced-motion la barra sigue: no se mueve sola, solo informa de un movimiento que hace la persona.',
  ],
  related: ['manual/movimiento/animar-con-el-scroll-sin-javascript', 'lab/revelado-con-view'],
}

const css = `
.pb-barra { display: none; }
@keyframes pb-crecer {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@supports (animation-timeline: scroll()) {
  .pb-barra {
    display: block;
    transform-origin: left;
    transform: scaleX(0); /* sin una línea de tiempo activa, la animación no se aplica: esto es lo que se ve */
    animation: pb-crecer linear both;
    animation-duration: 1ms; /* Firefox exige una duración distinta de cero */
    animation-timeline: scroll(nearest block); /* después del atajo animation */
  }
}
`

const parrafos = [
  'Un jardín no se termina: se recorre. Cada guía es un sendero, y esta barra dice cuánto falta del que estás leyendo.',
  'La barra no sabe nada de JavaScript. El navegador la avanza con el scroll del contenedor más cercano que tenga scroll.',
  'Ese «más cercano» es el detalle. Si algo entre la barra y la caja tiene overflow: hidden, se vuelve contenedor de scroll, aunque no tenga nada que desplazar.',
  'Y entonces la barra mira el scroll equivocado: uno que siempre está en cero.',
  'overflow: clip recorta lo mismo y no crea un contenedor de scroll. Para recortar, casi siempre es lo que querías.',
]

const opciones = [
  { texto: 'overflow: clip', valor: false },
  { texto: 'overflow: hidden', valor: true },
]

export default function BarraDeProgresoConScroll() {
  const caja = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)

  return (
    <div className="w-72">
      <style>{css}</style>
      <div role="group" aria-label="Overflow del envoltorio" className="mb-2 inline-flex rounded-lg bg-surface/60 p-0.5 text-xs">
        {opciones.map(({ texto, valor }) => (
          <button
            key={texto}
            aria-pressed={hidden === valor}
            onClick={() => setHidden(valor)}
            className={`min-h-8 rounded-md px-2.5 ${hidden === valor ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'}`}
          >
            <code>{texto}</code>
          </button>
        ))}
      </div>
      <div
        ref={caja}
        tabIndex={0}
        role="region"
        aria-label="Texto largo con barra de progreso"
        className="h-56 overflow-y-auto overscroll-contain rounded-xl border border-surface/70 bg-surface/40"
      >
        {/* El envoltorio: con hidden se vuelve el contenedor de scroll de la barra */}
        <div style={{ overflow: hidden ? 'hidden' : 'clip' }}>
          <div className="sticky top-0 h-1.5 bg-surface/80">
            <div aria-hidden className="pb-barra h-full bg-sage-deep" />
          </div>
          <div className="space-y-3 p-4 text-sm leading-relaxed">
            {parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
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
