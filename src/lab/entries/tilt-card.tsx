import { useRef, useState } from 'react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Tarjeta tilt 3D',
  description: 'Tarjeta que se inclina siguiendo el cursor, con perspectiva y vuelta suave.',
  technology: 'React',
  category: 'Tarjetas',
  tags: ['tilt', '3d', 'hover', 'card', 'animación'],
  createdAt: '2026-10-10',
  usage: 'Envuelve cualquier contenido. Ajusta MAX_TILT para más o menos inclinación.',
}

const MAX_TILT = 12 // grados

export default function TiltCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({ rx: 0, ry: 0 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    setStyle({ rx: -y * MAX_TILT * 2, ry: x * MAX_TILT * 2 })
  }

  return (
    <div style={{ perspective: 800 }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setStyle({ rx: 0, ry: 0 })}
        style={{ transform: `rotateX(${style.rx}deg) rotateY(${style.ry}deg)` }}
        className="w-64 rounded-2xl border border-white/70 bg-gradient-to-br from-sage/40 to-lavender/50 p-6 shadow-md transition-transform duration-150 ease-out motion-reduce:transform-none"
      >
        <h3 className="font-semibold">Hola, jardín</h3>
        <p className="mt-2 text-sm text-ink-soft">Mueve el cursor sobre la tarjeta.</p>
      </div>
    </div>
  )
}
