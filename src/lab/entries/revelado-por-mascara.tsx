import { useState, type CSSProperties } from 'react'
import { RotateCcw } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Revelado por máscara con clip-path',
  description: 'Un titular que se descubre de izquierda a derecha con clip-path: el texto no se mueve, se mueve la máscara.',
  technology: 'CSS',
  category: 'Movimiento',
  tags: ['clip-path', 'máscara', 'revelado', 'titular', 'keyframes'],
  createdAt: '2026-11-18',
  usage:
    'clip-path: inset(0 100% 0 0) esconde todo el texto, e inset(0) lo muestra entero. Animar entre los dos es una cortina que se abre. Cada línea entra 120 ms después que la anterior; cambia --retraso para acelerar o frenar.',
  notes: [
    'clip-path no es transform ni opacity: es una de las excepciones aceptables, porque el navegador puede componerlo sin recalcular la página. Úsalo en titulares, no en cien elementos.',
    'El texto está quieto y siempre con su color: el contraste es el mismo en el primer fotograma y en el último.',
    'Con prefers-reduced-motion no hay cortina: el titular aparece con un fundido de 150 ms.',
    'El titular sigue siendo texto: un lector de pantalla lo lee entero desde el principio.',
  ],
  related: ['manual/movimiento/las-reglas-que-no-se-negocian', 'manual/movimiento/direccion-de-secuencia', 'lab/secuencia-de-apertura'],
}

const css = `
@keyframes rm-cortina {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0); }
}
@keyframes rm-fundido {
  from { opacity: 0; }
}
.rm-linea {
  display: block;
  animation: rm-cortina 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * var(--retraso, 120ms));
}
@media (prefers-reduced-motion: reduce) {
  .rm-linea { animation: rm-fundido 150ms linear both; }
}
`

const lineas = ['Lo que se mueve', 'es la máscara,', 'no el texto.']

export default function ReveladoPorMascara() {
  const [vez, setVez] = useState(0)

  return (
    <div className="w-72">
      <style>{css}</style>
      {/* Cambiar la key reinicia la animación */}
      <p key={vez} className="text-3xl leading-tight font-semibold tracking-tight">
        {lineas.map((l, i) => (
          <span key={l} className="rm-linea" style={{ '--i': i } as CSSProperties}>
            {l}
          </span>
        ))}
      </p>
      <button
        onClick={() => setVez((n) => n + 1)}
        className="mt-3 inline-flex min-h-8 items-center gap-1.5 px-1 text-xs text-ink-soft transition hover:text-sage-deep"
      >
        <RotateCcw size={12} aria-hidden /> Repetir
      </button>
    </div>
  )
}
