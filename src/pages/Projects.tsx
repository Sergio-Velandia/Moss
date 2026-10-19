import { Link } from 'react-router-dom'
import ProjectMark from '../components/content/ProjectMark'
import '../lib/projectFonts'
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
    action: 'Ver cómo está hecho',
    techs: 'Tecnologías',
    published: 'Los tres viven en el mismo dominio y se publicaron igual.',
    route: 'Cómo los publiqué, paso a paso',
  },
  en: {
    title: 'Projects',
    intro: 'How my projects are built inside: architecture, data flow, the decisions I made and what I learned.',
    empty: 'No projects documented yet.',
    version: (v: string) => `v${v}`,
    action: 'See how it’s built',
    techs: 'Technologies',
    published: 'All three live on the same domain and were published the same way.',
    route: 'How I published them, step by step',
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
          {projectDocs.map((d) => {
            const theme = d.project?.theme ?? 'moss'
            return (
              <li key={d.id}>
                {/* Cada tarjeta con la paleta de su proyecto: .pt-<tema> (y .nexus para los tokens de Nexus) */}
                <Link
                  to={d.url}
                  className={`pt-card pt-${theme} ${theme === 'nexus' ? 'nexus rounded-3xl' : 'rounded-2xl'} flex h-full flex-col p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <ProjectMark theme={theme} />
                    {d.project && (
                      <p className="flex flex-col items-end gap-1 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-(--pt-ink-soft)">
                          <span aria-hidden className="size-1.5 rounded-full bg-(--pt-accent)" />
                          {statusLabels[lang][d.project.status] ?? d.project.status}
                        </span>
                        <span className="font-mono tabular-nums text-(--pt-ink-soft)" translate="no">
                          {t.version(d.project.version)}
                        </span>
                      </p>
                    )}
                  </div>
                  <h2 className="pt-display mt-4 text-lg font-semibold tracking-tight" lang="es">{d.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-(--pt-ink-soft)" lang="es">{d.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5 text-xs" aria-label={t.techs}>
                    {d.technologies.map((x) => (
                      <li key={x} className="pt-chip rounded-full px-2 py-0.5">
                        {x}
                      </li>
                    ))}
                  </ul>
                  {/* Señala la acción de la tarjeta: reacciona al hover de toda la tarjeta */}
                  <span className="pt-btn mt-5 inline-flex min-h-10 w-fit items-center px-4 text-sm font-semibold">{t.action}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        {t.published}{' '}
        <Link to="/rutas/publicar-y-mantener-un-sitio" className="inline-flex min-h-11 items-center gap-1 font-medium text-sage-deep underline underline-offset-4 hover:no-underline">
          {t.route} →
        </Link>
      </p>
    </section>
  )
}
