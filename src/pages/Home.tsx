import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookOpen, FlaskConical, Feather, Search } from 'lucide-react'
import { knowledgeItems, typeLabel } from '../lib/knowledge'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const pillars = [
  { to: '/laboratorio', title: 'El Laboratorio', desc: 'Componentes y snippets con vista previa en vivo.', Icon: FlaskConical },
  { to: '/manual', title: 'El Manual', desc: 'Documentación y lógica que cuesta reconstruir.', Icon: BookOpen },
  { to: '/bitacora', title: 'La Bitácora', desc: 'Aprendizajes, decisiones y reflexiones técnicas.', Icon: Feather },
  { to: '/herbario', title: 'El Herbario', desc: 'Búsqueda global para encontrarlo todo rápido.', Icon: Search },
]

export default function Home() {
  useDocumentTitle()
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const recent = knowledgeItems.slice(0, 5)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/herbario${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  return (
    <section>
      <h1 className="text-4xl font-semibold tracking-tight">Tu jardín digital de código</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Planta, documenta, conecta, prueba y reutiliza. El conocimiento técnico no debería quedarse enterrado.
      </p>

      <form onSubmit={submit} role="search" className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-surface/70 bg-surface/60 px-4 shadow-sm backdrop-blur focus-within:ring-2 focus-within:ring-sage-deep">
        <Search size={18} className="text-ink-soft" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca animaciones, SQL, webhooks…"
          aria-label="Buscar en el jardín"
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-soft"
        />
      </form>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pillars.map(({ to, title, desc, Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <Link
              to={to}
              className="block rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon className="text-sage-deep" size={22} aria-hidden />
              <h2 className="mt-3 font-medium">{title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-medium uppercase tracking-wide text-ink-soft">Recién plantado</h2>
      <ul className="mt-3 divide-y divide-cream-deep rounded-2xl border border-surface/70 bg-surface/50">
        {recent.map((e) => (
          <li key={e.id}>
            <Link
              to={e.url}
              className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-sage/10"
            >
              <span>
                <span className="font-medium">{e.title}</span>
                <span className="ml-2 text-sm text-ink-soft">{e.category}</span>
              </span>
              <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-lavender-deep">{typeLabel[e.type]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
