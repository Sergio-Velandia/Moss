import { ExternalLink, GitBranch, Globe } from 'lucide-react'
import type { ProjectFacts as Facts } from '../../lib/content'
import { formatDate } from '../../lib/format'
import { useLang, useT } from '../../lib/i18n'
import { statusLabels } from '../../lib/projects'

const TEXT = {
  es: {
    label: 'Ficha del proyecto',
    status: 'Estado',
    documented: 'Documentado en',
    reviewed: 'Última revisión',
    site: 'Ver el sitio',
    repo: 'Ver el repositorio',
    newTab: ' (se abre en una pestaña nueva)',
  },
  en: {
    label: 'Project facts',
    status: 'Status',
    documented: 'Documented at',
    reviewed: 'Last reviewed',
    site: 'Visit the site',
    repo: 'View the repository',
    newTab: ' (opens in a new tab)',
  },
}

/** Datos que no deben caducar: salen del frontmatter y una prueba exige que existan. */
export default function ProjectFacts({ facts }: { facts: Facts }) {
  const lang = useLang()
  const t = useT(TEXT)
  const linkClass = 'inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold'
  // La ficha toma la paleta de su proyecto (.pt-<tema>; Nexus necesita además sus tokens .nexus)
  const theme = `pt-${facts.theme}${facts.theme === 'nexus' ? ' nexus' : ''}`

  return (
    <section
      aria-label={t.label}
      className={`${theme} mt-6 rounded-2xl border border-surface/70 border-t-2 border-t-(--pt-accent) bg-surface/50 p-5 shadow-sm backdrop-blur`}
    >
      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-ink-soft">{t.status}</dt>
          <dd className="mt-1 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-(--pt-accent)" />
              {statusLabels[lang][facts.status] ?? facts.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">{t.documented}</dt>
          <dd className="mt-1 font-mono font-medium tabular-nums" translate="no">
            {`v${facts.version}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">{t.reviewed}</dt>
          <dd className="mt-1 font-medium">
            <time dateTime={facts.reviewedAt}>{formatDate(facts.reviewedAt, lang)}</time>
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={facts.site} target="_blank" rel="noopener noreferrer" className={`pt-btn ${linkClass}`}>
          <Globe size={16} aria-hidden /> {t.site} <ExternalLink size={14} aria-hidden className="opacity-70" />
          <span className="sr-only">{t.newTab}</span>
        </a>
        <a href={facts.repo} target="_blank" rel="noopener noreferrer" className={`pt-btn-2 ${linkClass}`}>
          <GitBranch size={16} aria-hidden /> {t.repo} <ExternalLink size={14} aria-hidden className="opacity-70" />
          <span className="sr-only">{t.newTab}</span>
        </a>
      </div>
    </section>
  )
}
