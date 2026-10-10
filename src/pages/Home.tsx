import { Link } from 'react-router-dom'
import { FlaskConical, BookOpen, Feather, Search } from 'lucide-react'

const pillars = [
  { to: '/laboratorio', title: 'El Laboratorio', desc: 'Componentes y snippets con vista previa en vivo.', Icon: FlaskConical },
  { to: '/manual', title: 'El Manual', desc: 'Documentación y lógica que cuesta reconstruir.', Icon: BookOpen },
  { to: '/bitacora', title: 'La Bitácora', desc: 'Aprendizajes, decisiones y reflexiones técnicas.', Icon: Feather },
  { to: '/herbario', title: 'El Herbario', desc: 'Búsqueda global para encontrarlo todo rápido.', Icon: Search },
]

export default function Home() {
  return (
    <section>
      <h1 className="text-4xl font-semibold tracking-tight">Tu jardín digital de código</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Planta, documenta, conecta, prueba y reutiliza. El conocimiento técnico no debería quedarse enterrado.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pillars.map(({ to, title, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Icon className="text-sage-deep" size={22} aria-hidden />
            <h2 className="mt-3 font-medium">{title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
