import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { knowledgeItems, type ItemType } from '../lib/knowledge'
import { search } from '../lib/search'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TYPES: ItemType[] = ['route', 'lab', 'manual', 'journal', 'project']
/** Etiquetas visibles antes de pulsar "Ver todas" */
const VISIBLE_TAGS = 16
/** Sin búsqueda ni filtros, cada sección muestra solo sus elementos más recientes */
const PREVIEW = 4

const TEXT = {
  es: {
    title: 'El Herbario',
    intro: 'Busca en todo el jardín: demos, documentación y artículos, sin recordar dónde los guardaste.',
    placeholder: 'animación, consulta SQL, webhook…',
    searchLabel: 'Buscar en el jardín',
    searchTitle: (q: string) => `Buscar: ${q}`,
    type: 'Tipo',
    all: 'Todo',
    tech: 'Tecnología',
    allTechs: 'Todas',
    tags: 'Explorar por etiqueta',
    showAll: (n: number) => `Ver todas (${n})`,
    showLess: 'Ver menos',
    usedIn: (n: number) => `en ${n} elementos`,
    results: (n: number, q: string) => `${n} resultado${n === 1 ? '' : 's'} para “${q}”`,
    total: (n: number) => `${n} elementos en el jardín`,
    overview: (n: number) => `${n} elementos en el jardín. Aquí ves los más recientes de cada sección; busca o filtra para verlos todos.`,
    seeSection: (n: number, section: string) => `Ver los ${n} de ${section}`,
    empty: 'No encontré nada. Prueba con otras palabras o quita algún filtro.',
  },
  en: {
    title: 'The Herbarium',
    intro: 'Search the whole garden: demos, documentation and articles, without remembering where you put them.',
    placeholder: 'animation, SQL query, webhook…',
    searchLabel: 'Search the garden',
    searchTitle: (q: string) => `Search: ${q}`,
    type: 'Type',
    all: 'All',
    tech: 'Technology',
    allTechs: 'All',
    tags: 'Browse by tag',
    showAll: (n: number) => `Show all (${n})`,
    showLess: 'Show less',
    usedIn: (n: number) => `in ${n} items`,
    results: (n: number, q: string) => `${n} result${n === 1 ? '' : 's'} for “${q}”`,
    total: (n: number) => `${n} items in the garden`,
    overview: (n: number) => `${n} items in the garden. These are the most recent in each section; search or filter to see them all.`,
    seeSection: (n: number, section: string) => `See all ${n} in ${section}`,
    empty: 'Nothing found. Try other words or remove a filter.',
  },
}

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1 pointer-coarse:py-2 text-xs transition ${
    active ? 'bg-accent text-on-accent' : 'bg-surface/60 text-ink-soft hover:bg-sage/20'
  }`
}

// Las etiquetas más usadas primero: son las que más conectan el jardín
const tagCounts = (() => {
  const counts = new Map<string, number>()
  for (const item of knowledgeItems) for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
})()

export default function Herbario() {
  const lang = useLang()
  const t = useT(TEXT)
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const type = params.get('tipo') ?? ''
  const tech = params.get('tec') ?? ''
  const [showAllTags, setShowAllTags] = useState(false)
  const tagListId = useId()
  useDocumentTitle(q.trim() ? t.searchTitle(q.trim()) : t.title)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Sin búsqueda se muestra todo el jardín, lo más reciente primero
  const inputRef = useRef<HTMLInputElement>(null)
  // Solo enfocamos el buscador con ratón/teclado: en móvil el teclado en pantalla taparía los resultados
  useEffect(() => {
    if (!q && window.matchMedia('(hover: hover) and (pointer: fine)').matches) inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const base = useMemo(() => (q.trim() ? search(q) : knowledgeItems), [q])

  const technologies = useMemo(() => [...new Set(base.flatMap((i) => i.technologies))].sort(), [base])
  const results = base.filter(
    (i) => (!type || i.type === type) && (!tech || i.technologies.includes(tech)),
  )

  const tags = showAllTags ? tagCounts : tagCounts.slice(0, VISIBLE_TAGS)
  // Sin búsqueda ni filtros es un vistazo: volcar los ~70 elementos de golpe abruma
  const overview = !q.trim() && !type && !tech

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>

      <div
        role="search"
        className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-surface/70 bg-surface/60 px-4 shadow-sm backdrop-blur focus-within:ring-2 focus-within:ring-sage-deep"
      >
        <Search size={18} className="text-ink-soft" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.searchLabel}
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft"
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.type}>
          <span className="text-xs uppercase tracking-wide text-ink-soft">{t.type}</span>
          <button onClick={() => setParam('tipo', '')} aria-pressed={!type} className={chipClass(!type)}>
            {t.all}
          </button>
          {TYPES.map((x) => (
            <button key={x} onClick={() => setParam('tipo', x)} aria-pressed={type === x} className={chipClass(type === x)}>
              {sectionNames[lang][x]} ({base.filter((i) => i.type === x).length})
            </button>
          ))}
        </div>
        {technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.tech}>
            <span className="text-xs uppercase tracking-wide text-ink-soft">{t.tech}</span>
            <button onClick={() => setParam('tec', '')} aria-pressed={!tech} className={chipClass(!tech)}>
              {t.allTechs}
            </button>
            {technologies.map((x) => (
              <button key={x} onClick={() => setParam('tec', x)} aria-pressed={tech === x} className={chipClass(tech === x)}>
                {x}
              </button>
            ))}
          </div>
        )}
      </div>

      {!q.trim() && (
        <div className="mt-6">
          <h2 className="text-xs uppercase tracking-wide text-ink-soft">{t.tags}</h2>
          <ul id={tagListId} className="mt-2 flex flex-wrap gap-1.5" lang="es">
            {tags.map(([tag, count]) => (
              <li key={tag}>
                <button
                  onClick={() => setParam('q', tag)}
                  aria-label={count > 1 ? `#${tag}, ${t.usedIn(count)}` : undefined}
                  className="inline-flex items-center gap-1 rounded-full bg-surface/60 px-2.5 py-0.5 pointer-coarse:py-1.5 text-xs text-ink-soft transition hover:bg-sage/20"
                >
                  #{tag}
                  {count > 1 && <span className="tabular-nums text-ink-soft/80">{count}</span>}
                </button>
              </li>
            ))}
          </ul>
          {tagCounts.length > VISIBLE_TAGS && (
            <button
              type="button"
              onClick={() => setShowAllTags((v) => !v)}
              aria-expanded={showAllTags}
              aria-controls={tagListId}
              className="mt-2 inline-flex min-h-9 pointer-coarse:min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-medium text-sage-deep transition hover:bg-sage/20"
            >
              {showAllTags ? t.showLess : t.showAll(tagCounts.length)}
              <ChevronDown size={14} aria-hidden className={`transition-transform ${showAllTags ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-ink-soft" aria-live="polite">
        {q.trim() ? t.results(results.length, q.trim()) : overview ? t.overview(results.length) : t.total(results.length)}
      </p>

      {results.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <div className="mt-4 space-y-8">
          {TYPES.map((x) => {
            const group = results.filter((i) => i.type === x)
            if (group.length === 0) return null
            const shown = overview ? group.slice(0, PREVIEW) : group
            return (
              <div key={x}>
                <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">{sectionNames[lang][x]}</h2>
                <ul className="mt-2 divide-y divide-cream-deep rounded-2xl border border-surface/70 bg-surface/50">
                  {shown.map((i) => (
                    <li key={i.id}>
                      <Link to={i.url} className="block px-5 py-4 transition hover:bg-sage/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium" lang="es">{i.title}</span>
                          <span className="rounded-full bg-sage/30 px-2 py-0.5 text-xs text-sage-deep" lang="es">
                            {i.category}
                          </span>
                          {i.technologies.map((x) => (
                            <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-lavender-deep">
                              {x}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-ink-soft" lang="es">{i.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                {shown.length < group.length && (
                  <button
                    type="button"
                    onClick={() => setParam('tipo', x)}
                    className="mt-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-sage-deep transition hover:bg-sage/20"
                  >
                    {t.seeSection(group.length, sectionNames[lang][x])} →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
