import { Link } from 'react-router-dom'
import { Clock, Route as RouteIcon } from 'lucide-react'
import { routeDocs, type Doc } from '../lib/content'
import { useT } from '../lib/i18n'
import { useRouteProgress } from '../lib/progress'
import { routeMinutes, routeSteps } from '../lib/routes'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    title: 'Rutas',
    intro: 'Recorridos ordenados que juntan guías, demos, retos y artículos sobre un mismo tema, para aprenderlo de principio a fin.',
    empty: 'Aún no hay rutas.',
    levels: { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' } as Record<string, string>,
    steps: (n: number) => `${n} pasos`,
    minutes: (n: number) => `≈ ${n} min`,
    progress: (d: number, n: number) => (d === 0 ? 'Sin empezar' : d === n ? 'Completada' : `${d} de ${n} hechos`),
    techs: 'Tecnologías',
  },
  en: {
    title: 'Routes',
    intro: 'Ordered paths that bring together guides, demos, challenges and articles on one topic, to learn it from start to finish.',
    empty: 'No routes yet.',
    levels: { inicial: 'Beginner', intermedio: 'Intermediate', avanzado: 'Advanced' } as Record<string, string>,
    steps: (n: number) => `${n} steps`,
    minutes: (n: number) => `≈ ${n} min`,
    progress: (d: number, n: number) => (d === 0 ? 'Not started' : d === n ? 'Completed' : `${d} of ${n} done`),
    techs: 'Technologies',
  },
}

function RouteCard({ route }: { route: Doc }) {
  const t = useT(TEXT)
  const done = useRouteProgress(route.slug)
  const steps = routeSteps(route)
  const doneCount = steps.filter((s) => done.includes(s.id)).length
  const percent = steps.length ? doneCount / steps.length : 0

  return (
    <Link
      to={route.url}
      className="group flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition-colors hover:border-sage-deep/50 focus-visible:border-sage-deep/50"
    >
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden className="grid size-11 place-items-center rounded-xl bg-sage/25 text-sage-deep transition-transform duration-300 group-hover:scale-105">
          <RouteIcon size={22} />
        </span>
        <span className="rounded-full bg-sage/30 px-2 py-0.5 text-xs text-sage-deep">{t.levels[route.route?.level ?? ''] ?? route.route?.level}</span>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight" lang="es">{route.title}</h2>
      <p className="mt-1 flex-1 text-sm text-ink-soft" lang="es">{route.description}</p>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
        <span>{t.steps(steps.length)}</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} aria-hidden /> {t.minutes(routeMinutes(route))}
        </span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5 text-xs" aria-label={t.techs}>
        {route.technologies.map((x) => (
          <li key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
            {x}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-cream-deep">
          <div className="h-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${percent})` }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">{t.progress(doneCount, steps.length)}</p>
      </div>
    </Link>
  )
}

export default function Routes() {
  const t = useT(TEXT)
  useDocumentTitle(t.title)
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>
      {routeDocs.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {routeDocs.map((r) => (
            <li key={r.id} className="min-w-0">
              <RouteCard route={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
