import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { knowledgeItems, typeLabel, type ItemType } from '../lib/knowledge'
import { search } from '../lib/search'

const TYPES: ItemType[] = ['lab', 'manual', 'journal']

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1 text-xs transition ${
    active ? 'bg-sage-deep text-white' : 'bg-white/60 text-ink-soft hover:bg-sage/20'
  }`
}

export default function Herbario() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const type = params.get('tipo') ?? ''
  const tech = params.get('tec') ?? ''

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Sin búsqueda se muestra todo el jardín, lo más reciente primero
  const base = useMemo(() => (q.trim() ? search(q) : knowledgeItems), [q])

  const technologies = useMemo(() => [...new Set(base.flatMap((i) => i.technologies))].sort(), [base])
  const results = base.filter(
    (i) => (!type || i.type === type) && (!tech || i.technologies.includes(tech)),
  )

  const allTags = useMemo(() => [...new Set(knowledgeItems.flatMap((i) => i.tags))].sort(), [])

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">El Herbario</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Busca en todo el jardín: demos, documentación y artículos, sin recordar dónde los guardaste.
      </p>

      <div
        role="search"
        className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-white/70 bg-white/60 px-4 py-2.5 shadow-sm backdrop-blur focus-within:ring-2 focus-within:ring-sage"
      >
        <Search size={18} className="text-ink-soft" aria-hidden />
        <input
          autoFocus
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="animación de entrada, consulta SQL para agrupar, webhook de n8n…"
          aria-label="Buscar en el jardín"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tipo de contenido">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Tipo</span>
          <button onClick={() => setParam('tipo', '')} aria-pressed={!type} className={chipClass(!type)}>
            Todo
          </button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => setParam('tipo', t)} aria-pressed={type === t} className={chipClass(type === t)}>
              {typeLabel[t]} ({base.filter((i) => i.type === t).length})
            </button>
          ))}
        </div>
        {technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tecnología">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Tecnología</span>
            <button onClick={() => setParam('tec', '')} aria-pressed={!tech} className={chipClass(!tech)}>
              Todas
            </button>
            {technologies.map((t) => (
              <button key={t} onClick={() => setParam('tec', t)} aria-pressed={tech === t} className={chipClass(tech === t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {!q.trim() && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Explorar por etiqueta</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setParam('q', t)}
                className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs text-ink-soft transition hover:bg-sage/20"
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-ink-soft" aria-live="polite">
        {q.trim() ? `${results.length} resultado${results.length === 1 ? '' : 's'} para “${q.trim()}”` : `${results.length} elementos en el jardín`}
      </p>

      {results.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          No encontré nada. Prueba con otras palabras o quita algún filtro. 🌱
        </p>
      ) : (
        <div className="mt-4 space-y-8">
          {TYPES.map((t) => {
            const group = results.filter((i) => i.type === t)
            if (group.length === 0) return null
            return (
              <div key={t}>
                <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">{typeLabel[t]}</h2>
                <ul className="mt-2 divide-y divide-cream-deep rounded-2xl border border-white/70 bg-white/50">
                  {group.map((i) => (
                    <li key={i.id}>
                      <Link to={i.url} className="block px-5 py-4 transition hover:bg-sage/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{i.title}</span>
                          <span className="rounded-full bg-sage/30 px-2 py-0.5 text-xs capitalize text-sage-deep">
                            {i.category}
                          </span>
                          {i.technologies.map((x) => (
                            <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-lavender-deep">
                              {x}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-ink-soft">{i.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
