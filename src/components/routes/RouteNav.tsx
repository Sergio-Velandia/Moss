import { Link } from 'react-router-dom'
import { Check, Route as RouteIcon } from 'lucide-react'
import { useLang, useT } from '../../lib/i18n'
import { toggleStep, useRouteProgress } from '../../lib/progress'
import { routesContaining, type RoutePosition } from '../../lib/routes'

const TEXT = {
  es: {
    label: 'Rutas de aprendizaje',
    step: (i: number, n: number) => `Paso ${i} de ${n}`,
    of: 'de la ruta',
    previous: 'Anterior',
    next: 'Siguiente',
    last: 'Último paso de la ruta',
    done: 'Hecho',
    markDone: 'Marcar este paso como hecho',
  },
  en: {
    label: 'Learning routes',
    step: (i: number, n: number) => `Step ${i} of ${n}`,
    of: 'of the route',
    previous: 'Previous',
    next: 'Next',
    last: 'Last step of the route',
    done: 'Done',
    markDone: 'Mark this step as done',
  },
}

function Position({ id, position }: { id: string; position: RoutePosition }) {
  const t = useT(TEXT)
  const { route, index, total, previous, next } = position
  const done = useRouteProgress(route.slug).includes(id)

  return (
    <li className="rounded-2xl border border-sage/50 bg-sage/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm">
          <RouteIcon size={16} className="shrink-0 text-sage-deep" aria-hidden />
          <span>
            <span className="font-medium">{t.step(index + 1, total)}</span> {t.of}{' '}
            <Link to={route.url} className="font-medium text-sage-deep underline-offset-2 hover:underline" lang="es">
              {route.title}
            </Link>
          </span>
        </p>
        <button
          type="button"
          aria-pressed={done}
          onClick={() => toggleStep(route.slug, id)}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors ${
            done ? 'border-accent bg-accent/15 text-sage-deep' : 'border-cream-deep bg-surface/60 text-ink-soft hover:border-sage-deep hover:text-sage-deep'
          }`}
        >
          <Check size={14} aria-hidden /> {done ? t.done : t.markDone}
        </button>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {previous ? (
          <Link to={previous.url} className="rounded-xl bg-surface/60 px-3 py-2 transition-colors hover:bg-surface">
            <span className="block text-xs text-ink-soft">{t.previous}</span>
            <span className="block font-medium" lang="es">{previous.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link to={next.url} className="rounded-xl bg-surface/60 px-3 py-2 text-right transition-colors hover:bg-surface">
            <span className="block text-xs text-ink-soft">{t.next}</span>
            <span className="block font-medium" lang="es">{next.title}</span>
          </Link>
        ) : (
          <Link to={route.url} className="rounded-xl bg-surface/60 px-3 py-2 text-right transition-colors hover:bg-surface">
            <span className="block text-xs text-ink-soft">{t.last}</span>
            <span className="block font-medium" lang="es">{route.title}</span>
          </Link>
        )}
      </div>
    </li>
  )
}

/** Si este contenido es un paso de alguna ruta, muestra dónde está y cómo seguir */
export default function RouteNav({ id }: { id: string }) {
  const lang = useLang()
  const t = useT(TEXT)
  const positions = routesContaining(id)
  if (positions.length === 0) return null
  return (
    <nav aria-label={t.label} lang={lang} className="mt-10">
      <ul className="space-y-3">
        {positions.map((p) => (
          <Position key={p.route.id} id={id} position={p} />
        ))}
      </ul>
    </nav>
  )
}
