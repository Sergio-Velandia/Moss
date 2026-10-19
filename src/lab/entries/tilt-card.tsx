import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Tarjeta tilt 3D',
  description: 'Tarjeta que se inclina siguiendo el cursor, con perspectiva y vuelta suave.',
  technology: 'React',
  category: 'Interfaz',
  tags: ['tilt', '3d', 'hover', 'card', 'animación', 'accesibilidad'],
  createdAt: '2026-10-10',
  usage:
    'Envuelve cualquier contenido. Ajusta MAX_TILT para más o menos inclinación. Solo reacciona al ratón y se desactiva si el sistema pide movimiento reducido.',
  dependencies: ['motion'],
}

const MAX_TILT = 12 // grados

export default function TiltCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const reduceMotion = useReducedMotion()

  const onMove = (e: React.PointerEvent) => {
    // Con el dedo no hay "hover": el toque dejaría la tarjeta inclinada hasta tocar fuera.
    // Y con movimiento reducido no animamos nada.
    if (reduceMotion || e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -y * MAX_TILT * 2, ry: x * MAX_TILT * 2 })
  }

  const resting = tilt.rx === 0 && tilt.ry === 0

  return (
    <div style={{ perspective: 800 }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
        // Un estilo en línea siempre gana a una clase de Tailwind (como motion-reduce:), por eso
        // la preferencia de movimiento reducido se comprueba en JavaScript, arriba.
        style={{ transform: resting ? undefined : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
        className="w-64 rounded-2xl border border-surface/70 bg-gradient-to-br from-sage/40 to-lavender/50 p-6 shadow-md transition-transform duration-150 ease-out"
      >
        <h3 className="font-semibold">Hola, jardín</h3>
        <p className="mt-2 text-sm text-ink-soft">Mueve el cursor sobre la tarjeta.</p>
      </div>
    </div>
  )
}
