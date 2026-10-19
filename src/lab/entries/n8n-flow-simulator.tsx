import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Circle, CircleCheck, CircleX, Globe, Loader2, Play, RotateCcw, Split, Webhook } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Simulador de flujo n8n',
  description:
    'Mini-canvas con tres nodos conectados (Webhook → Switch → HTTP Request): ejecuta el flujo, inspecciona cada nodo y fuerza sus estados.',
  technology: 'React',
  category: 'Automatización',
  tags: ['n8n', 'workflow', 'canvas', 'nodos', 'estados', 'webhook', 'switch', 'http', 'motion'],
  createdAt: '2026-10-11',
  usage:
    'Haz clic en un nodo para ver su configuración y cambiar su estado a mano. "Ejecutar flujo" recorre los nodos en orden: la prioridad del Webhook decide si el Switch deja pasar los datos, y en el HTTP Request puedes simular un fallo 503. Edita `nodes` para modelar otro flujo.',
  dependencies: ['motion', 'lucide-react', 'tailwindcss'],
}

type NodeId = 'webhook' | 'switch' | 'http'
type Status = 'idle' | 'loading' | 'success' | 'error'

interface FlowNode {
  id: NodeId
  name: string
  kind: string
  icon: LucideIcon
}

const nodes: FlowNode[] = [
  { id: 'webhook', name: 'Webhook', kind: 'Disparador', icon: Webhook },
  { id: 'switch', name: 'Switch', kind: 'Lógica', icon: Split },
  { id: 'http', name: 'HTTP Request', kind: 'Acción', icon: Globe },
]

const statusLabel: Record<Status, string> = {
  idle: 'Inactivo',
  loading: 'Ejecutando',
  success: 'Éxito',
  error: 'Fallo',
}

const statusIcon: Record<Status, LucideIcon> = {
  idle: Circle,
  loading: Loader2,
  success: CircleCheck,
  error: CircleX,
}

const statusStyle: Record<Status, string> = {
  idle: 'border-cream-deep text-ink-soft',
  loading: 'border-lavender-deep text-lavender-deep',
  success: 'border-sage-deep text-sage-deep',
  error: 'border-danger text-danger',
}

const idleStatuses: Record<NodeId, Status> = { webhook: 'idle', switch: 'idle', http: 'idle' }
const STEP_MS = 800

type Priority = 'alta' | 'baja'

export default function N8nFlowSimulator() {
  const panelId = useId()
  const [statuses, setStatuses] = useState(idleStatuses)
  const [selected, setSelected] = useState<NodeId>('webhook')
  const [priority, setPriority] = useState<Priority>('alta')
  const [failHttp, setFailHttp] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>(['Listo. Pulsa "Ejecutar flujo".'])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  // Si la demo desaparece a mitad de una ejecución, cancelamos los pasos pendientes
  useEffect(() => clearTimers, [])

  const setStatus = (id: NodeId, status: Status) => setStatuses((prev) => ({ ...prev, [id]: status }))
  const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

  const run = () => {
    clearTimers()
    setStatuses(idleStatuses)
    setRunning(true)
    setLog([])
    const write = (line: string) => setLog((prev) => [...prev, line])

    // Cada paso: el nodo pasa a "ejecutando" y, STEP_MS después, a su resultado
    const steps: { id: NodeId; result: Status; message: string }[] = [
      { id: 'webhook', result: 'success', message: `Webhook: POST recibido con prioridad "${priority}".` },
      {
        id: 'switch',
        result: 'success',
        message:
          priority === 'alta'
            ? 'Switch: la regla "alta" coincide → salida 0 (HTTP Request).'
            : 'Switch: ninguna regla coincide → salida de respaldo, sin conexión.',
      },
    ]
    if (priority === 'alta') {
      steps.push({
        id: 'http',
        result: failHttp ? 'error' : 'success',
        message: failHttp
          ? 'HTTP Request: 503 Service Unavailable. La ejecución se detiene.'
          : 'HTTP Request: 201 Created en 184 ms.',
      })
    }

    let t = 0
    for (const step of steps) {
      at(t, () => setStatus(step.id, 'loading'))
      t += STEP_MS
      at(t, () => {
        setStatus(step.id, step.result)
        write(step.message)
      })
    }
    at(t, () => {
      if (priority === 'baja') write('HTTP Request: no se ejecuta porque no le llegan datos.')
      setRunning(false)
    })
  }

  const reset = () => {
    clearTimers()
    setRunning(false)
    setStatuses(idleStatuses)
    setLog(['Flujo reiniciado.'])
  }

  const selectedNode = nodes.find((n) => n.id === selected)!

  return (
    // Decide las columnas por el ancho de su caja, no de la ventana: así también cabe en la miniatura del Laboratorio
    <div className="@container w-full max-w-3xl">
      <div className="grid gap-4 text-left @3xl:grid-cols-[1fr_17rem]">
        {/* Canvas */}
        <div className="flex min-w-0 flex-col rounded-2xl bg-surface/70 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Flujo: nuevo contacto</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-soft transition hover:bg-cream-deep hover:text-ink"
              >
                <RotateCcw size={14} aria-hidden /> Reiniciar
              </button>
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-on-accent shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {running ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Play size={14} aria-hidden />}
                {running ? 'Ejecutando…' : 'Ejecutar flujo'}
              </button>
            </div>
          </div>

          {/* Fondo de puntos, como el lienzo del editor de n8n */}
          <div className="mt-3 flex flex-col items-center rounded-xl bg-cream-deep/60 bg-[radial-gradient(var(--c-sage)_1px,transparent_1px)] bg-size-[16px_16px] p-5 sm:flex-row sm:items-stretch">
            {nodes.map((node, i) => {
              const status = statuses[node.id]
              const StatusIcon = statusIcon[status]
              const Icon = node.icon
              const isSelected = selected === node.id
              const prev = nodes[i - 1]
              return (
                <div key={node.id} className="contents">
                  {prev && <Connector from={statuses[prev.id]} to={status} />}
                  <motion.button
                    type="button"
                    onClick={() => setSelected(node.id)}
                    aria-pressed={isSelected}
                    aria-controls={panelId}
                    aria-label={`${node.name}, ${statusLabel[status]}`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative flex w-40 shrink-0 flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface px-2 py-4 sm:w-28 shadow-sm transition-colors ${
                      statusStyle[status]
                    } ${isSelected ? 'ring-2 ring-sage-deep ring-offset-2 ring-offset-cream-deep' : ''}`}
                  >
                    <Icon size={24} aria-hidden className="text-ink" />
                    <span className="text-sm font-medium text-ink">{node.name}</span>
                    <span className="text-[11px] text-ink-soft">{node.kind}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium">
                      <StatusIcon size={14} aria-hidden className={status === 'loading' ? 'animate-spin' : ''} />
                      {statusLabel[status]}
                    </span>
                  </motion.button>
                </div>
              )
            })}
          </div>

          <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-soft">Registro de ejecución</h3>
          <ol aria-live="polite" className="mt-1.5 min-h-16 space-y-1 font-mono text-xs text-ink-soft">
            {log.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        {/* Panel lateral */}
        <aside
          id={panelId}
          aria-label={`Configuración de ${selectedNode.name}`}
          className="overflow-hidden rounded-2xl bg-surface/70 p-4 shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs text-ink-soft">{selectedNode.kind}</p>
              <h3 className="text-base font-semibold">{selectedNode.name}</h3>

              <NodeConfig
                id={selected}
                priority={priority}
                onPriority={setPriority}
                failHttp={failHttp}
                onFailHttp={setFailHttp}
                disabled={running}
              />

              <p className="mt-4 text-xs font-medium text-ink-soft">Forzar estado</p>
              <div role="group" aria-label="Estado del nodo" className="mt-1.5 grid grid-cols-2 gap-1.5">
                {(Object.keys(statusLabel) as Status[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={statuses[selected] === s}
                    disabled={running}
                    onClick={() => setStatus(selected, s)}
                    className={`min-h-9 rounded-lg border px-2 text-xs font-medium transition disabled:opacity-50 ${
                      statuses[selected] === s ? `${statusStyle[s]} bg-surface` : 'border-transparent text-ink-soft hover:bg-cream-deep'
                    }`}
                  >
                    {statusLabel[s]}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  )
}

/** Línea entre dos nodos: se colorea cuando los datos ya pasaron y late mientras viajan. */
function Connector({ from, to }: { from: Status; to: Status }) {
  const passed = from === 'success' && to !== 'idle'
  const flowing = from === 'success' && to === 'loading'
  return (
    <div aria-hidden className="flex h-8 w-full items-center justify-center sm:h-auto sm:min-w-4 sm:flex-1">
      <div
        className={`h-full w-0.5 rounded-full transition-colors duration-300 sm:h-0.5 sm:w-full ${
          passed ? 'bg-sage-deep' : 'bg-sage/50'
        } ${flowing ? 'animate-pulse' : ''}`}
      />
    </div>
  )
}

interface ConfigProps {
  id: NodeId
  priority: Priority
  onPriority: (p: Priority) => void
  failHttp: boolean
  onFailHttp: (v: boolean) => void
  disabled: boolean
}

/** Configuración simulada de cada nodo: los parámetros que verías al abrirlo en n8n. */
function NodeConfig({ id, priority, onPriority, failHttp, onFailHttp, disabled }: ConfigProps) {
  const rows: Record<NodeId, [string, string][]> = {
    webhook: [
      ['HTTP Method', 'POST'],
      ['Path', 'nuevo-contacto'],
      ['Authentication', 'Header Auth'],
      ['Respond', 'Immediately'],
    ],
    switch: [
      ['Mode', 'Rules'],
      ['Valor', '{{ $json.body.prioridad }}'],
      ['Regla 0', 'is equal to "alta" → HTTP Request'],
      ['Fallback', 'Extra Output (sin conectar)'],
    ],
    http: [
      ['Method', 'POST'],
      ['URL', 'https://api.example.com/leads'],
      ['Retry On Fail', 'Sí · 3 intentos'],
      ['Timeout', '10 000 ms'],
    ],
  }

  return (
    <>
      <dl className="mt-3 space-y-2 text-xs">
        {rows[id].map(([label, value]) => (
          <div key={label}>
            <dt className="text-ink-soft">{label}</dt>
            <dd className="break-all font-mono text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {id === 'webhook' && (
        <label className="mt-4 block text-xs font-medium text-ink-soft">
          Cuerpo de prueba: prioridad
          <select
            value={priority}
            disabled={disabled}
            onChange={(e) => onPriority(e.target.value as Priority)}
            className="mt-1 block min-h-9 w-full rounded-lg border border-cream-deep bg-surface px-2 font-mono text-sm text-ink"
          >
            <option value="alta">alta</option>
            <option value="baja">baja</option>
          </select>
        </label>
      )}

      {id === 'switch' && (
        <p className="mt-4 rounded-lg bg-cream-deep/70 p-2 text-xs text-ink-soft">
          La prioridad actual es <code className="font-mono text-ink">"{priority}"</code>:{' '}
          {priority === 'alta' ? 'los datos seguirán hacia HTTP Request.' : 'el flujo terminará aquí.'}
        </p>
      )}

      {id === 'http' && (
        <label className="mt-4 flex min-h-9 items-center gap-2 text-xs text-ink">
          <input
            type="checkbox"
            checked={failHttp}
            disabled={disabled}
            onChange={(e) => onFailHttp(e.target.checked)}
            className="size-4 accent-accent"
          />
          Simular fallo (503) en la siguiente ejecución
        </label>
      )}
    </>
  )
}
