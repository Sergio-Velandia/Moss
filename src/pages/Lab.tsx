import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useT } from '../lib/i18n'
import { labEntries } from '../lib/lab'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/** Valor interno de "sin filtro"; el texto visible depende del idioma */
const ALL = ''

const TEXT = {
  es: {
    title: 'El Laboratorio',
    intro: 'Componentes y snippets listos para probar, copiar y reutilizar.',
    tech: 'Tecnología',
    category: 'Categoría',
    all: 'Todas',
    empty: 'No hay entradas con esos filtros todavía. 🌱',
    nextLabel: 'Próximamente en Piezas Tailwind:',
    next: 'campos de formulario con validación, avisos y estados vacíos; navegación, pestañas y acordeón; modal, skeleton e interruptor de tema. Saldrán por lotes, cada pieza sacada de una app real.',
  },
  en: {
    title: 'The Lab',
    intro: 'Components and snippets ready to try, copy and reuse.',
    tech: 'Technology',
    category: 'Category',
    all: 'All',
    empty: 'No entries match those filters yet. 🌱',
    nextLabel: 'Coming soon in Tailwind Pieces:',
    next: 'form fields with validation, notices and empty states; navigation, tabs and accordion; modal, skeleton and theme toggle. They will ship in batches, each piece taken from a real app.',
  },
}

function Chips({
  label,
  options,
  value,
  onChange,
  allLabel,
}: {
  label: string
  allLabel: string
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
          className={`rounded-full px-3 py-1 pointer-coarse:py-2 text-xs transition ${
            value === o ? 'bg-accent text-on-accent' : 'bg-surface/60 text-ink-soft hover:bg-sage/20'
          }`}
        >
          {o === ALL ? allLabel : o}
        </button>
      ))}
    </div>
  )
}

export default function Lab() {
  const t = useT(TEXT)
  useDocumentTitle(t.title)
  const [tech, setTech] = useState(ALL)
  const [category, setCategory] = useState(ALL)

  const techs = useMemo(() => [...new Set(labEntries.map((e) => e.technology))], [])
  const categories = useMemo(() => [...new Set(labEntries.map((e) => e.category))], [])

  const visible = labEntries.filter(
    (e) => (tech === ALL || e.technology === tech) && (category === ALL || e.category === category),
  )

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        <span className="font-medium text-sage-deep">{t.nextLabel}</span> {t.next}
      </p>

      <div className="mt-6 space-y-2">
        <Chips label={t.tech} allLabel={t.all} options={techs} value={tech} onChange={setTech} />
        <Chips label={t.category} allLabel={t.all} options={categories} value={category} onChange={setCategory} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((e, i) => (
            <motion.div
              key={e.slug}
              // min-w-0: sin él, una demo ancha (una línea larga de código) ensancha toda la columna del grid
              className="min-w-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/laboratorio/${e.slug}`}
                className="flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* La demo se pinta a un ancho de escritorio (1/0,55 de la caja) y se reduce entera:
                    así las que se adaptan al ancho no se aplastan dentro de la miniatura */}
                <div className="relative h-56 overflow-hidden rounded-xl bg-cream-deep/60">
                  <div
                    className="pointer-events-none absolute left-0 top-0 flex h-[181.818%] w-[181.818%] origin-top-left scale-[0.55] items-center-safe justify-center p-6"
                    aria-hidden
                    inert
                  >
                    <e.Demo />
                  </div>
                </div>
                <h2 className="mt-4 font-medium" lang="es">{e.title}</h2>
                <p className="mt-1 text-sm text-ink-soft" lang="es">{e.description}</p>
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
