import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, RotateCcw } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import SpanishNote from '../components/content/SpanishNote'
import NexusCta from '../components/nexus/NexusCta'
import { getRoute } from '../lib/content'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { resetRoute, toggleStep, useRouteProgress } from '../lib/progress'
import { nextPending, routeMinutes, routeSteps } from '../lib/routes'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    notFound: 'No encontré esa ruta.',
    notFoundTitle: 'No encontrado',
    back: 'Rutas',
    levels: { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' } as Record<string, string>,
    steps: (n: number) => `${n} pasos`,
    minutes: (n: number) => `≈ ${n} min`,
    progress: (d: number, n: number) => `${d} de ${n} pasos hechos`,
    start: 'Empezar la ruta',
    continue: 'Continuar',
    again: 'Repasar desde el principio',
    reset: 'Reiniciar progreso',
    path: 'Pasos de la ruta',
    done: 'Hecho',
    markDone: (title: string) => `Marcar «${title}» como hecho`,
    challenge: 'Reto',
    saved: 'Tu progreso se guarda solo en este navegador.',
  },
  en: {
    notFound: 'I couldn’t find that route.',
    notFoundTitle: 'Not found',
    back: 'Routes',
    levels: { inicial: 'Beginner', intermedio: 'Intermediate', avanzado: 'Advanced' } as Record<string, string>,
    steps: (n: number) => `${n} steps`,
    minutes: (n: number) => `≈ ${n} min`,
    progress: (d: number, n: number) => `${d} of ${n} steps done`,
    start: 'Start the route',
    continue: 'Continue',
    again: 'Review from the start',
    reset: 'Reset progress',
    path: 'Route steps',
    done: 'Done',
    markDone: (title: string) => `Mark “${title}” as done`,
    challenge: 'Challenge',
    saved: 'Your progress is saved only in this browser.',
  },
}

export default function RouteDoc() {
  const { slug = '' } = useParams()
  const route = getRoute(slug)
  const lang = useLang()
  const t = useT(TEXT)
  const done = useRouteProgress(slug)
  useDocumentTitle(route?.title ?? t.notFoundTitle)

  if (!route?.route) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/rutas" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  const steps = routeSteps(route)
  const doneCount = steps.filter((s) => done.includes(s.id)).length
  const allDone = doneCount === steps.length
  const nextId = nextPending(steps.map((s) => s.id), done)
  const next = steps.find((s) => s.id === nextId)
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/rutas" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> {t.back}
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="es">{route.title}</h1>
      <p className="mt-2 text-ink-soft" lang="es">{route.description}</p>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-sage/30 px-2 py-0.5 text-sage-deep">{t.levels[route.route.level] ?? route.route.level}</span>
        <span className="text-ink-soft">{t.steps(steps.length)}</span>
        <span className="inline-flex items-center gap-1 text-ink-soft">
          <Clock size={12} aria-hidden /> {t.minutes(routeMinutes(route))}
        </span>
        {route.technologies.map((x) => (
          <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
            {x}
          </span>
        ))}
      </p>
      <SpanishNote />

      {/* Progreso */}
      <section aria-label={t.progress(doneCount, steps.length)} className="mt-6 rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span aria-live="polite" className="font-medium">{t.progress(doneCount, steps.length)}</span>
          <span className="font-mono tabular-nums text-ink-soft">{percent} %</span>
        </div>
        <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-cream-deep">
          {/* scaleX en vez de width: el navegador no recalcula el layout al avanzar */}
          <div className="h-full origin-left rounded-full bg-accent transition-transform duration-500" style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {next && (
            <Link
              to={next.item.url}
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent shadow-sm transition hover:brightness-110 active:scale-[0.97]"
            >
              {doneCount === 0 ? t.start : allDone ? t.again : `${t.continue}: `}
              {doneCount > 0 && !allDone && <span lang="es" className="ml-1">{next.item.title}</span>}
            </Link>
          )}
          {doneCount > 0 && (
            <button
              type="button"
              onClick={() => resetRoute(slug)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-ink-soft transition hover:bg-sage/20 hover:text-ink"
            >
              <RotateCcw size={14} aria-hidden /> {t.reset}
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-soft">{t.saved}</p>
      </section>

      <div className="mt-8" lang="es">
        <MarkdownView source={route.body} />
      </div>

      {/* Recorrido: un raíl une los pasos, como en un flujo */}
      <h2 className="mt-10 text-sm font-medium uppercase tracking-wide text-ink-soft">{t.path}</h2>
      <ol className="relative mt-4 space-y-3 before:absolute before:top-4 before:bottom-4 before:left-[1.1rem] before:w-px before:bg-sage/60">
        {steps.map((s, i) => {
          const isDone = done.includes(s.id)
          const isNext = !allDone && s.id === nextId
          const isChallenge = s.item.type === 'lab' && s.item.category.startsWith('Retos')
          return (
            <li key={s.id} className="relative flex gap-4">
              <span
                aria-hidden
                className={`relative z-10 mt-3 grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold tabular-nums transition-colors ${
                  isDone ? 'border-accent bg-accent text-on-accent' : isNext ? 'border-accent bg-surface text-sage-deep' : 'border-cream-deep bg-surface text-ink-soft'
                }`}
              >
                {isDone ? <Check size={16} /> : i + 1}
              </span>
              <div className={`flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3 rounded-2xl border bg-surface/50 p-4 ${isNext ? 'border-sage-deep/50' : 'border-surface/70'}`}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                    <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
                      {isChallenge ? t.challenge : sectionNames[lang][s.item.type]}
                    </span>
                    <span>{t.minutes(s.minutes)}</span>
                  </p>
                  <Link to={s.item.url} className="mt-1.5 block font-medium hover:text-sage-deep" lang="es">
                    {s.item.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-ink-soft" lang="es">{s.item.description}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={isDone}
                  aria-label={t.markDone(s.item.title)}
                  onClick={() => toggleStep(slug, s.id)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors ${
                    isDone ? 'border-accent bg-accent/15 text-sage-deep' : 'border-cream-deep text-ink-soft hover:border-sage-deep hover:text-sage-deep'
                  }`}
                >
                  <Check size={14} aria-hidden /> {t.done}
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      {route.route.nexus && <NexusCta />}
    </article>
  )
}
