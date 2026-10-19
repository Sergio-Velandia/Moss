import { useState, type ReactNode } from 'react'
import { BadgeCheck, FlaskConical } from 'lucide-react'
import { site } from '../../data/site'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Pieza: chips, etiquetas e insignias',
  description: 'Los chips de filtro, las etiquetas, el chip con contador y las insignias de estado que usan Moss y Moss Nexus.',
  technology: 'React',
  category: 'Piezas Tailwind',
  tags: ['chip', 'etiqueta', 'filtro', 'insignia', 'aria-pressed', 'tailwind 4'],
  createdAt: '2026-10-18',
  usage:
    'FilterChips recibe las opciones, el valor actual y onChange: úsalo para filtrar una lista. Tag es solo texto, CountChip es un botón que filtra por esa etiqueta, y Badge marca un estado. Usa los tokens de Moss (accent, on-accent, surface, sage, sage-deep, lavender, lavender-deep, ink-soft).',
  dependencies: ['lucide-react', 'tailwindcss'],
  notes: [
    'Los chips de filtro son botones con aria-pressed dentro de un grupo con nombre (role="group" y aria-label): el lector de pantalla anuncia cada chip como un botón activado o no. Llevan type="button" para no enviar un formulario si están dentro de uno.',
    'El chip activo no depende solo del color: el lector lo anuncia por aria-pressed y en pantalla cambia el fondo entero, no un detalle.',
    'Contraste AA medido con los tokens de Moss: el texto más justo es el de la etiqueta verde (4,96:1 en claro, 5,89:1 en oscuro); el resto supera 5:1.',
    'Tag no es interactivo: es un <span>. Si una etiqueta lleva a algún sitio, usa CountChip (un botón) o un enlace, nunca un span con onClick.',
    'CountChip pone el número en su aria-label («#variables, en 4 piezas»): un número suelto junto a la etiqueta se entiende mal.',
    'En pantallas táctiles (pointer-coarse) los chips crecen hasta un alto cómodo de tocar.',
    'Solo cambian de color, sin animar: no hay nada que reducir con prefers-reduced-motion.',
    'Pendiente: no hay chip que se pueda quitar (×) porque todavía no lo uso en ninguna de mis apps.',
  ],
  usedIn: [
    { label: 'Moss Nexus: filtros de plantillas', url: `${site.nexusUrl}plantillas/` },
    { label: 'Moss: etiquetas de las tarjetas', url: 'https://sergio-velandia.dev/Moss/' },
    { label: 'Moss: fichas de proyecto', url: 'https://sergio-velandia.dev/Moss/proyectos/moss-nexus/' },
  ],
  related: ['manual/css/capas-y-tokens-en-tailwind-4', 'journal/accesibilidad-que-no-se-ve', 'lab/pieza-botones'],
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep'

/** Chips de filtro con una sola opción activa */
export function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span aria-hidden className="text-xs uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1 text-xs pointer-coarse:py-2 ${FOCUS} ${
            value === o ? 'bg-accent text-on-accent' : 'bg-surface/60 text-ink-soft hover:bg-sage/20'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

const TONES = {
  sage: 'bg-sage/30 text-sage-deep',
  lavender: 'bg-lavender/50 text-lavender-deep',
  neutral: 'bg-surface/60 text-ink-soft',
} as const

/** Etiqueta estática: categoría, tecnología o #tag */
export function Tag({ tone = 'neutral', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${TONES[tone]}`}>{children}</span>
}

/** Etiqueta que filtra, con cuántas veces aparece */
export function CountChip({ tag, count, onClick }: { tag: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 1 ? `#${tag}, en ${count} piezas` : undefined}
      className={`inline-flex items-center gap-1 rounded-full bg-surface/60 px-2.5 py-0.5 text-xs text-ink-soft hover:bg-sage/20 pointer-coarse:py-1.5 ${FOCUS}`}
    >
      #{tag}
      {count > 1 && <span className="tabular-nums">{count}</span>}
    </button>
  )
}

/** Insignia de estado: «Probado» (hecho) o «Ejemplo» (aviso, con borde punteado) */
export function Badge({ kind }: { kind: 'tested' | 'example' }) {
  if (kind === 'tested') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-sage-deep">
        <BadgeCheck size={14} aria-hidden />
        Probado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-soft/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
      <FlaskConical size={12} aria-hidden />
      Ejemplo
    </span>
  )
}

export default function ChipsDemo() {
  const [section, setSection] = useState('Todo')
  const [query, setQuery] = useState('')
  return (
    <div className="flex max-w-md flex-col gap-4">
      <FilterChips label="Sección" options={['Todo', 'Manual', 'Laboratorio']} value={section} onChange={setSection} />
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag tone="sage">css</Tag>
        <Tag tone="lavender">React</Tag>
        <Tag>#tokens</Tag>
        <CountChip tag="variables" count={4} onClick={() => setQuery('variables')} />
        <CountChip tag="foco" count={1} onClick={() => setQuery('foco')} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge kind="tested" />
        <Badge kind="example" />
      </div>
      <p role="status" className="min-h-5 text-sm text-ink-soft">
        {query && `Filtrando por #${query}`}
      </p>
    </div>
  )
}
