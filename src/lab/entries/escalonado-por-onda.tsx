import { useState, type CSSProperties } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Escalonado por onda',
  description: 'Sesenta cuadros que entran según su distancia a un origen, no según su orden: una onda en vez de una máquina de escribir.',
  technology: 'React',
  category: 'Movimiento',
  tags: ['escalonado', 'stagger', 'onda', 'secuencia', 'retraso'],
  createdAt: '2026-11-18',
  usage:
    'Con «Por índice», cada cuadro espera al anterior: 60 × 25 ms son 1,5 s de máquina de escribir. Con «Por distancia», el retraso es la distancia al origen × 45 ms, así que los cuadros a la misma distancia entran juntos y la rejilla se llena en menos de medio segundo. Haz clic en un cuadro para mover el origen.',
  notes: [
    'Solo anima transform: scale y opacity.',
    'Los cuadros son decorativos (aria-hidden). Los botones dan lo mismo que el clic, así que también se usa con el teclado.',
    'Con prefers-reduced-motion no hay escalonado: la rejilla aparece entera con un fundido de 150 ms.',
  ],
  related: ['manual/movimiento/direccion-de-secuencia', 'lab/secuencia-de-apertura', 'lab/fade-in-list'],
}

const COLUMNAS = 10
const FILAS = 6
const PASO_DISTANCIA = 45 // ms por unidad de distancia
const PASO_INDICE = 25 // ms por elemento

const css = `
@keyframes eo-entrar {
  from { opacity: 0; transform: scale(0.4); }
  to { opacity: 1; transform: none; }
}
.eo-cuadro {
  animation: eo-entrar 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--retraso);
}
@media (prefers-reduced-motion: reduce) {
  .eo-cuadro { animation: eo-entrar 150ms linear both; animation-delay: 0ms; }
}
`

type Modo = 'distancia' | 'indice'

export default function EscalonadoPorOnda() {
  const [modo, setModo] = useState<Modo>('distancia')
  const [origen, setOrigen] = useState({ x: 0, y: 0 })
  const [vez, setVez] = useState(0)

  const retraso = (i: number) => {
    if (modo === 'indice') return i * PASO_INDICE
    const x = i % COLUMNAS
    const y = Math.floor(i / COLUMNAS)
    return Math.round(Math.hypot(x - origen.x, y - origen.y) * PASO_DISTANCIA)
  }
  const total = Math.max(...Array.from({ length: COLUMNAS * FILAS }, (_, i) => retraso(i)))
  const repetir = (cambio: () => void) => {
    cambio()
    setVez((n) => n + 1)
  }

  return (
    <div className="w-64">
      <style>{css}</style>
      <div key={vez} aria-hidden className="grid grid-cols-10 gap-1">
        {Array.from({ length: COLUMNAS * FILAS }, (_, i) => (
          <span
            key={i}
            onClick={() => repetir(() => { setModo('distancia'); setOrigen({ x: i % COLUMNAS, y: Math.floor(i / COLUMNAS) }) })}
            className="eo-cuadro aspect-square cursor-pointer rounded-[4px] bg-sage-deep/70"
            style={{ '--retraso': `${retraso(i)}ms` } as CSSProperties}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
        {modo === 'indice' ? 'Por índice' : 'Por distancia'}: el último entra a los {total} ms.
      </p>
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
        <button onClick={() => repetir(() => { setModo('distancia'); setOrigen({ x: 0, y: 0 }) })} className="min-h-8 text-ink-soft hover:text-sage-deep">
          Desde la esquina
        </button>
        <button onClick={() => repetir(() => { setModo('distancia'); setOrigen({ x: 4.5, y: 2.5 }) })} className="min-h-8 text-ink-soft hover:text-sage-deep">
          Desde el centro
        </button>
        <button onClick={() => repetir(() => setModo('indice'))} className="min-h-8 text-ink-soft hover:text-sage-deep">
          Por índice
        </button>
        <button onClick={() => setVez((n) => n + 1)} className="inline-flex min-h-8 items-center gap-1.5 text-ink-soft hover:text-sage-deep">
          <RotateCcw size={12} aria-hidden /> Repetir
        </button>
      </div>
    </div>
  )
}
