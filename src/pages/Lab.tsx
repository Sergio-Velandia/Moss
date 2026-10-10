import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { labEntries } from '../lib/lab'

const ALL = 'Todas'

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="text-xs uppercase tracking-wide text-ink-soft">{label}</span>
      {[ALL, ...options].map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-full px-3 py-1 text-xs transition ${
            value === o ? 'bg-sage-deep text-white' : 'bg-white/60 text-ink-soft hover:bg-sage/20'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function Lab() {
  const [tech, setTech] = useState(ALL)
  const [category, setCategory] = useState(ALL)

  const techs = useMemo(() => [...new Set(labEntries.map((e) => e.technology))], [])
  const categories = useMemo(() => [...new Set(labEntries.map((e) => e.category))], [])

  const visible = labEntries.filter(
    (e) => (tech === ALL || e.technology === tech) && (category === ALL || e.category === category),
  )

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">El Laboratorio</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Componentes y snippets listos para probar, copiar y reutilizar.
      </p>

      <div className="mt-6 space-y-2">
        <Chips label="Tecnología" options={techs} value={tech} onChange={setTech} />
        <Chips label="Categoría" options={categories} value={category} onChange={setCategory} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No hay entradas con esos filtros todavía. 🌱</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e, i) => (
            <motion.div
              key={e.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/laboratorio/${e.slug}`}
                className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-xl bg-cream-deep/60 p-3">
                  <div className="pointer-events-none origin-center scale-[0.7]" aria-hidden>
                    <e.Demo />
                  </div>
                </div>
                <h2 className="mt-4 font-medium">{e.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{e.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">{e.technology}</span>
                  <span className="rounded-full bg-sage/30 px-2 py-0.5 text-sage-deep">{e.category}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
