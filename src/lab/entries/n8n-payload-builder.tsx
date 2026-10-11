import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CircleAlert, CircleCheck, Copy, Plus, Trash2 } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Generador de payloads para n8n',
  description: 'Construye un JSON a partir de pares clave-valor, lo valida al vuelo y lo copia listo para probar un Webhook de n8n.',
  technology: 'React',
  category: 'Automatización',
  tags: ['n8n', 'webhook', 'json', 'payload', 'validación', 'portapapeles', 'curl'],
  createdAt: '2026-10-11',
  usage:
    'Usa puntos en la clave para anidar objetos (`cliente.nombre`). El tipo "JSON" acepta arreglos u objetos completos. Cambia `webhookUrl` por la Test URL de tu nodo Webhook y copia el JSON o el comando curl.',
  dependencies: ['lucide-react', 'tailwindcss'],
}

const webhookUrl = 'https://tu-n8n.example.com/webhook-test/nuevo-contacto'

type FieldType = 'texto' | 'número' | 'booleano' | 'JSON'
const fieldTypes: FieldType[] = ['texto', 'número', 'booleano', 'JSON']

interface Field {
  id: number
  key: string
  value: string
  type: FieldType
}

type Parsed = { ok: true; value: unknown } | { ok: false; error: string }

function parseValue(field: Field): Parsed {
  const raw = field.value.trim()
  switch (field.type) {
    case 'texto':
      return { ok: true, value: field.value }
    case 'número': {
      const n = Number(raw)
      return raw !== '' && Number.isFinite(n) ? { ok: true, value: n } : { ok: false, error: 'no es un número válido' }
    }
    case 'booleano':
      return { ok: true, value: raw === 'true' }
    case 'JSON':
      try {
        return { ok: true, value: JSON.parse(raw) }
      } catch {
        return { ok: false, error: 'no es JSON válido' }
      }
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Convierte las filas en un objeto. Las claves con puntos crean objetos anidados. */
function buildPayload(fields: Field[]) {
  // Sin prototipo: claves como "constructor" o "__proto__" se guardan como claves normales
  const emptyObject = () => Object.create(null) as Record<string, unknown>
  const payload = emptyObject()
  const errors: string[] = []

  fields.forEach((field, i) => {
    const row = `Fila ${i + 1}`
    const key = field.key.trim()
    // Una fila vacía no cuenta: así se puede añadir una sin que aparezca un error de inmediato
    if (key === '' && field.value.trim() === '') return
    if (key === '') return errors.push(`${row}: falta la clave.`)

    const path = key.split('.')
    if (path.some((p) => p === '')) return errors.push(`${row}: la clave "${key}" tiene un punto de más.`)

    const parsed = parseValue(field)
    if (!parsed.ok) return errors.push(`${row}: el valor de "${key}" ${parsed.error}.`)

    let cursor = payload
    for (const segment of path.slice(0, -1)) {
      if (!Object.hasOwn(cursor, segment)) cursor[segment] = emptyObject()
      const next = cursor[segment]
      if (!isObject(next)) return errors.push(`${row}: "${segment}" ya tiene un valor y no puede contener "${key}".`)
      cursor = next
    }

    const last = path[path.length - 1]
    if (Object.hasOwn(cursor, last)) return errors.push(`${row}: la clave "${key}" está repetida.`)
    cursor[last] = parsed.value
  })

  return { payload, errors }
}

const initialFields: Field[] = [
  { id: 1, key: 'nombre', value: 'Ada Lovelace', type: 'texto' },
  { id: 2, key: 'correo', value: 'ada@example.com', type: 'texto' },
  { id: 3, key: 'cliente.plan', value: 'pro', type: 'texto' },
  { id: 4, key: 'cliente.asientos', value: '5', type: 'número' },
  { id: 5, key: 'suscrito', value: 'true', type: 'booleano' },
  { id: 6, key: 'etiquetas', value: '["beta", "newsletter"]', type: 'JSON' },
]

type View = 'json' | 'curl'
type CopyStatus = 'idle' | 'copied' | 'error'

const inputClass =
  'min-h-10 w-full min-w-0 rounded-lg border border-cream-deep bg-surface px-2.5 text-sm text-ink placeholder:text-ink-soft/70'

export default function N8nPayloadBuilder() {
  const [fields, setFields] = useState(initialFields)
  const [view, setView] = useState<View>('json')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const nextId = useRef(initialFields.length + 1)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const { payload, errors } = useMemo(() => buildPayload(fields), [fields])
  const valid = errors.length === 0
  const json = JSON.stringify(payload, null, 2)
  // En curl el JSON va entre comillas simples: escapamos las que pueda contener
  const curl = `curl -X POST "${webhookUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(payload).replaceAll("'", "'\\''")}'`
  const output = view === 'json' ? json : curl

  const update = (id: number, patch: Partial<Field>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const changeType = (id: number, type: FieldType) =>
    // Al pasar a booleano, el valor tiene que ser true o false
    update(id, type === 'booleano' ? { type, value: 'true' } : { type })

  const add = () => setFields((prev) => [...prev, { id: nextId.current++, key: '', value: '', type: 'texto' }])
  const remove = (id: number) => setFields((prev) => prev.filter((f) => f.id !== id))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopyStatus('idle'), 1800)
  }

  return (
    <div className="grid w-full max-w-3xl gap-4 text-left md:grid-cols-2">
      {/* Editor de campos */}
      <div className="rounded-2xl bg-surface/70 p-4 shadow-sm">
        <div className="mb-2 hidden grid-cols-[1fr_1fr_6.5rem_2.5rem] gap-2 px-1 text-xs font-medium text-ink-soft sm:grid">
          <span>Clave</span>
          <span>Valor</span>
          <span>Tipo</span>
        </div>

        <ul className="space-y-3 sm:space-y-2">
          {fields.map((f, i) => (
            <li key={f.id} className="grid grid-cols-[1fr_2.5rem] gap-2 sm:grid-cols-[1fr_1fr_6.5rem_2.5rem]">
              <input
                value={f.key}
                onChange={(e) => update(f.id, { key: e.target.value })}
                placeholder="clave"
                aria-label={`Clave de la fila ${i + 1}`}
                spellCheck={false}
                className={`${inputClass} col-span-2 font-mono sm:col-span-1`}
              />
              {f.type === 'booleano' ? (
                <select
                  value={f.value}
                  onChange={(e) => update(f.id, { value: e.target.value })}
                  aria-label={`Valor de la fila ${i + 1}`}
                  className={`${inputClass} col-span-2 font-mono sm:col-span-1`}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  value={f.value}
                  onChange={(e) => update(f.id, { value: e.target.value })}
                  placeholder={f.type === 'JSON' ? '[1, 2] o {"a": 1}' : 'valor'}
                  aria-label={`Valor de la fila ${i + 1}`}
                  inputMode={f.type === 'número' ? 'decimal' : undefined}
                  spellCheck={false}
                  className={`${inputClass} col-span-2 font-mono sm:col-span-1`}
                />
              )}
              <select
                value={f.type}
                onChange={(e) => changeType(f.id, e.target.value as FieldType)}
                aria-label={`Tipo de la fila ${i + 1}`}
                className={inputClass}
              >
                {fieldTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={`Eliminar la fila ${i + 1}`}
                className="inline-flex min-h-10 items-center justify-center rounded-lg text-ink-soft transition hover:bg-cream-deep hover:text-danger"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={add}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-sage-deep transition hover:bg-sage/20"
        >
          <Plus size={16} aria-hidden /> Añadir campo
        </button>
      </div>

      {/* Resultado */}
      <div className="flex min-w-0 flex-col rounded-2xl bg-surface/70 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-cream-deep p-0.5 text-xs" role="group" aria-label="Formato de salida">
            {(['json', 'curl'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`min-h-8 rounded-md px-3 font-medium transition ${
                  view === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {v === 'json' ? 'JSON' : 'curl'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copy}
            disabled={!valid}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-on-accent shadow-sm transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copyStatus === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            <span aria-live="polite">
              {copyStatus === 'idle' ? 'Copiar' : copyStatus === 'copied' ? '¡Copiado!' : 'No se pudo copiar'}
            </span>
          </button>
        </div>

        <pre
          className={`mt-3 max-h-72 flex-1 overflow-auto rounded-xl bg-cream-deep/70 p-3 font-mono text-xs leading-relaxed transition-opacity ${
            valid ? '' : 'opacity-50'
          }`}
        >
          <code>{output}</code>
        </pre>

        {/* role="status" anuncia si el payload pasa a ser válido o inválido */}
        <div role="status" className="mt-3 text-sm">
          {valid ? (
            <p className="flex items-center gap-1.5 text-sage-deep">
              <CircleCheck size={16} aria-hidden /> JSON válido · {Object.keys(payload).length} claves en la raíz
            </p>
          ) : (
            <div className="text-danger">
              <p className="flex items-center gap-1.5 font-medium">
                <CircleAlert size={16} aria-hidden /> Corrige {errors.length === 1 ? 'un error' : `${errors.length} errores`}{' '}
                antes de copiar
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-6 text-xs">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
