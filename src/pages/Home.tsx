import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookOpen, FlaskConical, Feather, FolderGit2, Route as RouteIcon, Search } from 'lucide-react'
import { DashboardSkeleton } from '../components/dashboard/ChartCard'
import { getGardenItems, selectItems } from '../lib/dashboard'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { knowledgeItems } from '../lib/knowledge'
import { useDocumentTitle } from '../lib/useDocumentTitle'

// recharts pesa: el tablero se descarga aparte, sin retrasar el resto del Inicio
const MossDashboard = lazy(() => import('../components/dashboard/MossDashboard'))
const garden = selectItems(getGardenItems())

// Rutas va primero: es la mejor puerta de entrada para quien llega por primera vez
const pillarIcons = { routes: RouteIcon, lab: FlaskConical, manual: BookOpen, journal: Feather, projects: FolderGit2, herbario: Search }
const pillarRoutes = {
  routes: '/rutas',
  lab: '/laboratorio',
  manual: '/manual',
  journal: '/bitacora',
  projects: '/proyectos',
  herbario: '/herbario',
}

const TEXT = {
  es: {
    title: 'Tu jardín digital de código',
    intro: 'Planta, documenta, conecta, prueba y reutiliza. El conocimiento técnico no debería quedarse enterrado.',
    placeholder: 'Busca animaciones, SQL, webhooks…',
    searchLabel: 'Buscar en el jardín',
    pillars: {
      routes: ['Rutas', 'Recorridos de principio a fin. Si no sabes por dónde empezar, empieza aquí.'],
      lab: ['El Laboratorio', 'Componentes y snippets con vista previa en vivo.'],
      manual: ['El Manual', 'Documentación y lógica que cuesta reconstruir.'],
      journal: ['La Bitácora', 'Aprendizajes, decisiones y reflexiones técnicas.'],
      projects: ['Proyectos', 'Cómo están hechos Moss, Moss Nexus y el portafolio.'],
      herbario: ['El Herbario', 'Búsqueda global para encontrarlo todo rápido.'],
    },
    recent: 'Recién plantado',
    vitals: 'Signos vitales del jardín',
    mockNote: 'Datos de ejemplo hasta que haya más contenido',
  },
  en: {
    title: 'Your digital code garden',
    intro: 'Plant, document, connect, test and reuse. Technical knowledge shouldn’t stay buried.',
    placeholder: 'Search animations, SQL, webhooks…',
    searchLabel: 'Search the garden',
    pillars: {
      routes: ['Routes', 'End-to-end paths. If you don’t know where to start, start here.'],
      lab: ['The Lab', 'Components and snippets with a live preview.'],
      manual: ['The Manual', 'Documentation and logic that’s hard to rebuild.'],
      journal: ['The Journal', 'Learnings, decisions and technical reflections.'],
      projects: ['Projects', 'How Moss, Moss Nexus and the portfolio are built.'],
      herbario: ['The Herbarium', 'Global search to find everything fast.'],
    },
    recent: 'Recently planted',
    vitals: 'Garden vital signs',
    mockNote: 'Sample data until there is more content',
  },
}

export default function Home() {
  useDocumentTitle()
  const lang = useLang()
  const t = useT(TEXT)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const recent = knowledgeItems.slice(0, 7)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/herbario${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  return (
    <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
      <div className="min-w-0">
        <h1 className="text-4xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          {t.intro}
        </p>

        <form onSubmit={submit} role="search" className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-surface/70 bg-surface/60 px-4 shadow-sm backdrop-blur focus-within:ring-2 focus-within:ring-sage-deep">
          <Search size={18} className="text-ink-soft" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.searchLabel}
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft"
          />
        </form>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {(Object.keys(pillarRoutes) as (keyof typeof pillarRoutes)[]).map((id, i) => {
            const [title, desc] = t.pillars[id]
            const Icon = pillarIcons[id]
            return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Link
                to={pillarRoutes[id]}
                className="block rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Icon className="text-sage-deep" size={22} aria-hidden />
                <h2 className="mt-3 font-medium">{title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{desc}</p>
              </Link>
            </motion.div>
            )
          })}
        </div>

        <h2 className="mt-12 text-sm font-medium uppercase tracking-wide text-ink-soft">{t.recent}</h2>
        <ul className="mt-3 divide-y divide-cream-deep rounded-2xl border border-surface/70 bg-surface/50">
          {recent.map((e) => (
            <li key={e.id}>
              <Link
                to={e.url}
                className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-sage/10"
              >
                <span lang="es">
                  <span className="font-medium">{e.title}</span>
                  <span className="ml-2 text-sm text-ink-soft">{e.category}</span>
                </span>
                <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-lavender-deep">{sectionNames[lang][e.type]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <aside aria-labelledby="vitals-title" className="mt-12 lg:mt-0">
        <h2 id="vitals-title" className="text-sm font-medium uppercase tracking-wide text-ink-soft">
          {t.vitals}
        </h2>
        {garden.isMock && <p className="mt-1 text-xs text-ink-soft">{t.mockNote}</p>}
        <div className="mt-3">
          <Suspense fallback={<DashboardSkeleton />}>
            <MossDashboard items={garden.items} />
          </Suspense>
        </div>
      </aside>
    </section>
  )
}
