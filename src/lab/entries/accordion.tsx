import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Acordeón accesible',
  description: 'Preguntas que se despliegan con animación de altura, navegables con teclado y lector de pantalla.',
  technology: 'React',
  category: 'Interfaz',
  tags: ['acordeón', 'faq', 'desplegable', 'accesibilidad', 'aria', 'motion'],
  createdAt: '2026-10-10',
  usage:
    'Edita el arreglo `items`. Cambia `multiple` a true si quieres permitir varios paneles abiertos a la vez. Respeta el movimiento reducido gracias a MotionConfig.',
  dependencies: ['motion', 'lucide-react', 'tailwindcss'],
}

const items = [
  { q: '¿Qué es Moss?', a: 'Un jardín digital: mi biblioteca de snippets, guías y aprendizajes técnicos.' },
  { q: '¿Dónde vive el contenido?', a: 'En archivos Markdown y componentes dentro del repositorio, versionados con Git.' },
  { q: '¿Puedo copiar las demos?', a: 'Sí. Cada demo muestra su código fuente real, listo para pegar en tu proyecto.' },
]

const multiple = false

export default function Accordion() {
  const baseId = useId()
  const [open, setOpen] = useState<number[]>([0])

  const toggle = (i: number) =>
    setOpen((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : multiple ? [...prev, i] : [i]))

  return (
    <div className="w-full max-w-sm divide-y divide-cream-deep rounded-2xl bg-surface/70 shadow-sm">
      {items.map((item, i) => {
        const isOpen = open.includes(i)
        const buttonId = `${baseId}-btn-${i}`
        const panelId = `${baseId}-panel-${i}`
        return (
          <div key={item.q}>
            {/* Un <button> dentro de un encabezado: el patrón recomendado por WAI-ARIA */}
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition hover:text-sage-deep"
              >
                {item.q}
                <ChevronDown
                  size={16}
                  aria-hidden
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-ink-soft">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
