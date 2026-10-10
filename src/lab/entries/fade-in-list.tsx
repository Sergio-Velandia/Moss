import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Animación de entrada escalonada',
  description: 'Lista cuyos elementos aparecen uno tras otro con un fundido suave hacia arriba.',
  technology: 'React',
  category: 'Animaciones',
  tags: ['animación', 'entrada', 'fade', 'motion', 'lista', 'escalonada'],
  createdAt: '2026-10-10',
  usage: 'Cambia el delay (i * 0.08) para acelerar o frenar la secuencia. Respeta el movimiento reducido del sistema.',
  dependencies: ['motion', 'lucide-react'],
}

const items = ['Plantar', 'Documentar', 'Conectar', 'Probar', 'Reutilizar', 'Cultivar']

export default function FadeInList() {
  const reduceMotion = useReducedMotion()
  const [run, setRun] = useState(0)

  return (
    <div className="w-56">
      {/* Cambiar la key reinicia la animación */}
      <ul key={run} className="space-y-2">
        {items.map((text, i) => (
          <motion.li
            key={text}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="rounded-xl bg-white/70 px-4 py-2 text-sm shadow-sm"
          >
            {text}
          </motion.li>
        ))}
      </ul>
      <button
        onClick={() => setRun((n) => n + 1)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-soft transition hover:text-sage-deep"
      >
        <RotateCcw size={12} aria-hidden /> Repetir
      </button>
    </div>
  )
}
