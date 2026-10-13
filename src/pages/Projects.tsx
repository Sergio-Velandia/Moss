import { Link } from 'react-router-dom'
import { projectDocs } from '../lib/content'
import { useLang, useT } from '../lib/i18n'
import { statusLabels } from '../lib/projects'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    title: 'Proyectos',
    intro: 'Cómo están armados mis proyectos por dentro: arquitectura, flujo de datos, las decisiones que tomé y lo que aprendí.',
    empty: 'Aún no hay proyectos documentados.',
    version: (v: string) => `v${v}`,
  },
  en: {
    title: 'Projects',
    intro: 'How my projects are built inside: architecture, data flow, the decisions I made and what I learned.',
    empty: 'No projects documented yet.',
    version: (v: string) => `v${v}`,
  },
}

export default function Projects() {
  const t = useT(TEXT)
  const lang = useLang()
  useDocumentTitle(t.title)

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>

      {projectDocs.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectDocs.map((d) => (
            <li key={d.id}>
              <Link
                to={d.url}
                className="flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
              >
                <h2 className="font-medium" lang="es">{d.title}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-soft" lang="es">{d.description}</p>
                {d.project && (
                  <p className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-sage/30 px-2 py-0.5 text-sage-deep">{statusLabels[lang][d.project.status] ?? d.project.status}</span>
                    <span className="font-mono tabular-nums text-ink-soft" translate="no">
                      {t.version(d.project.version)}
                    </span>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {d.technologies.map((x) => (
                    <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
                      {x}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
