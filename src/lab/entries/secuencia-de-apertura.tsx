import { useState, type CSSProperties } from 'react'
import { RotateCcw, SkipForward } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Secuencia de apertura dirigida',
  description: 'Una apertura en cuatro actos (marco, protagonista, acompañamiento y reposo) cuyos retrasos salen de su propia hoja de tiempos.',
  technology: 'React',
  category: 'Movimiento',
  tags: ['secuencia', 'apertura', 'hoja de tiempos', 'escalonado', 'cámara', 'dirección'],
  createdAt: '2026-11-18',
  usage:
    'La tabla de abajo no describe la animación: la produce. Cada retraso del CSS sale de la columna «t» de HOJA, así que cambiar un tiempo en la tabla cambia la secuencia. «Saltar» lleva al estado final de inmediato, que es lo que también ve quien pide menos movimiento.',
  notes: [
    'El marco no mueve cada elemento: mueve la cámara, el contenedor, con un solo transform. Es un travelling con el costo de animar un elemento.',
    'El protagonista lleva anticipación y exceso en fotogramas intermedios: baja un poco, pasa de largo 4 px y se asienta.',
    'Con prefers-reduced-motion no hay secuencia: todo aparece con un fundido de 150 ms, sin retrasos.',
    'Se puede saltar en cualquier momento. Una apertura que no se puede saltar retrasa el contenido.',
  ],
  related: ['manual/movimiento/direccion-de-secuencia', 'lab/escalonado-por-onda', 'lab/revelado-por-mascara'],
}

// La hoja de tiempos: el CSS lee estos números, no al revés
const HOJA = [
  { t: 0, acto: 'Marco', que: 'La cámara se acerca y el fondo aparece', porque: 'Nadie lee aún: primero el lugar' },
  { t: 250, acto: 'Protagonista', que: 'El titular sube con anticipación y exceso', porque: 'Llega solo, cuando ya hay un marco' },
  { t: 900, acto: 'Acompañamiento', que: 'Tres etiquetas, 90 ms entre ellas', porque: 'Lo secundario, cuando el titular terminó' },
  { t: 1400, acto: 'Reposo', que: 'Nada se mueve', porque: 'El reposo también es parte de la secuencia' },
]
const ESCALON = 90

const css = `
@keyframes sa-camara { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: none; } }
@keyframes sa-titular {
  0% { opacity: 0; transform: translateY(22px) scale(0.985); }
  55% { opacity: 1; transform: translateY(-4px) scale(1.004); }
  100% { opacity: 1; transform: none; }
}
@keyframes sa-etiqueta { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes sa-fundido { from { opacity: 0; } }
.sa-camara { animation: sa-camara 600ms cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--t); }
.sa-titular { animation: sa-titular 650ms cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--t); }
.sa-etiqueta { animation: sa-etiqueta 300ms cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--t); }
.sa-saltada :is(.sa-camara, .sa-titular, .sa-etiqueta) { animation: none; }
@media (prefers-reduced-motion: reduce) {
  :is(.sa-camara, .sa-titular, .sa-etiqueta) { animation: sa-fundido 150ms linear both; animation-delay: 0ms; }
}
`

const tiempo = (ms: number) => ({ '--t': `${ms}ms` }) as CSSProperties
const etiquetas = ['Rutas', 'Laboratorio', 'Bitácora']

export default function SecuenciaDeApertura() {
  const [vez, setVez] = useState(0)
  const [saltada, setSaltada] = useState(false)
  const [marco, protagonista, acompanamiento] = HOJA

  return (
    <div className="w-72 max-w-full">
      <style>{css}</style>
      <div key={vez} className={`overflow-clip rounded-2xl ${saltada ? 'sa-saltada' : ''}`}>
        <div className="sa-camara bg-sage/30 px-5 py-6" style={tiempo(marco.t)}>
          <p className="sa-titular text-2xl leading-tight font-semibold tracking-tight" style={tiempo(protagonista.t)}>
            Un jardín que se recorre
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {etiquetas.map((e, i) => (
              <li key={e} className="sa-etiqueta rounded-full bg-surface/80 px-2.5 py-1" style={tiempo(acompanamiento.t + i * ESCALON)}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2 flex gap-3 text-xs">
        <button onClick={() => { setSaltada(false); setVez((n) => n + 1) }} className="inline-flex min-h-8 items-center gap-1.5 text-ink-soft hover:text-sage-deep">
          <RotateCcw size={12} aria-hidden /> Repetir
        </button>
        <button onClick={() => setSaltada(true)} className="inline-flex min-h-8 items-center gap-1.5 text-ink-soft hover:text-sage-deep">
          <SkipForward size={12} aria-hidden /> Saltar
        </button>
      </div>
      <table className="mt-3 w-full text-left text-[11px] leading-snug text-ink-soft">
        <caption className="sr-only">Hoja de tiempos de la secuencia</caption>
        <thead>
          <tr>
            <th scope="col" className="pr-2 font-medium">t</th>
            <th scope="col" className="pr-2 font-medium">Acto</th>
            <th scope="col" className="font-medium">Por qué</th>
          </tr>
        </thead>
        <tbody>
          {HOJA.map((h) => (
            <tr key={h.acto} className="align-top">
              <td className="pr-2 tabular-nums">{(h.t / 1000).toFixed(2).replace('.', ',')}</td>
              <td className="pr-2" title={h.que}>{h.acto}</td>
              <td>{h.porque}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
