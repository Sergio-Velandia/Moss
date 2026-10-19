import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { site } from '../../data/site'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Pieza: tarjetas enlazadas',
  description: 'Tres tarjetas reales de Moss y Moss Nexus: la de contenido, la que cambia de identidad con variables y la que brilla bajo el puntero.',
  technology: 'React',
  category: 'Piezas Tailwind',
  tags: ['tarjeta', 'enlace', 'variables css', 'hover', 'tailwind 4'],
  createdAt: '2026-10-18',
  usage:
    'Cada tarjeta es un enlace completo: pásale href, un título y el texto. En una app con React Router, cambia el <a> por <Link to>. Para IdentityCard, pasa el color de acento en la prop accent (cualquier color CSS o var(--…)). Usa los tokens de Moss (surface, ink, ink-soft, sage, accent).',
  dependencies: ['lucide-react', 'tailwindcss'],
  notes: [
    'Toda la tarjeta es un solo enlace, con el título dentro: el lector de pantalla lee un enlace con nombre claro y el teclado tiene una sola parada por tarjeta. No metas botones ni otros enlaces dentro.',
    'El foco visible es el mismo que al pasar el ratón: borde, elevación y brillo también aparecen con Tab (focus-visible).',
    'Solo se animan transform (elevarse) y opacity (el brillo y el halo). El color del borde cambia sin transición.',
    'El brillo que sigue al puntero solo se calcula con ratón (pointerType «mouse»): en pantallas táctiles no hay hover y no tendría sentido.',
    'Con prefers-reduced-motion las tarjetas no se elevan y el brillo aparece sin fundido.',
    'Contraste AA medido con los tokens de Moss: el texto secundario (ink-soft) queda en 5,66:1 en claro y 7,30:1 en oscuro.',
    'IdentityCard cambia de paleta con una variable CSS con alcance (--card-accent), como las fichas de Proyectos: el mismo marcado sirve para todas las identidades.',
  ],
  usedIn: [
    { label: 'Moss: Proyectos', url: 'https://sergio-velandia.dev/Moss/proyectos/' },
    { label: 'Moss: inicio', url: 'https://sergio-velandia.dev/Moss/' },
    { label: 'Moss Nexus: plantillas', url: `${site.nexusUrl}plantillas/` },
  ],
  related: ['manual/css/capas-y-tokens-en-tailwind-4', 'lab/reto-paleta-con-variables', 'lab/reto-grid-min-w-0', 'lab/tilt-card'],
}

const LIFT =
  'transition-transform duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep ' +
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0'

type CardProps = { href: string; title: string; children: ReactNode; label?: string }

/** Tarjeta de contenido: Laboratorio, Manual e Inicio de Moss */
export function ContentCard({ href, title, children, label }: CardProps) {
  return (
    <a href={href} className={`flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur ${LIFT}`}>
      {label && <span className="w-fit rounded-full bg-sage/30 px-2 py-0.5 text-xs text-sage-deep">{label}</span>}
      <h3 className="mt-3 font-medium text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{children}</p>
    </a>
  )
}

/** Tarjeta con identidad propia: la paleta entra por una variable con alcance */
export function IdentityCard({ href, title, children, label, accent }: CardProps & { accent: string }) {
  return (
    <a
      href={href}
      style={{ '--card-accent': accent } as CSSProperties}
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-surface/70 bg-surface/70 p-5 shadow-sm hover:border-(--card-accent) focus-visible:border-(--card-accent) ${LIFT}`}
    >
      {/* Halo del color del proyecto: solo cambia su opacidad */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(20rem_10rem_at_85%_-10%,color-mix(in_oklab,var(--card-accent)_22%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      {label && (
        <span className="inline-flex w-fit items-center gap-1.5 text-xs text-ink-soft">
          <span aria-hidden className="size-2 rounded-full bg-(--card-accent)" />
          {label}
        </span>
      )}
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{children}</p>
    </a>
  )
}

/** Tarjeta de la galería de Moss Nexus: un brillo suave sigue al puntero */
export function GlowCard({ href, title, children, label }: CardProps) {
  const follow = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <a
      href={href}
      onPointerMove={follow}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface/70 bg-surface/60 p-5 shadow-sm hover:border-accent/50 focus-visible:border-accent/50 ${LIFT}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(18rem_circle_at_var(--mx,50%)_var(--my,0%),color-mix(in_oklab,var(--color-accent)_14%,transparent),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
      <span className="relative flex items-start justify-between gap-3">
        {label && <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{label}</span>}
        <ArrowUpRight
          size={18}
          aria-hidden
          className="ml-auto shrink-0 text-ink-soft transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
        />
      </span>
      <h3 className="relative mt-2 font-semibold leading-snug text-ink">{title}</h3>
      <p className="relative mt-2 text-sm text-ink-soft">{children}</p>
    </a>
  )
}

export default function CardsDemo() {
  return (
    <ul className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      <li>
        <ContentCard href="#tarjetas" title="Debounce y throttle" label="Manual">
          Cuándo esperar a que el usuario termine y cuándo limitar la frecuencia.
        </ContentCard>
      </li>
      <li>
        <IdentityCard href="#tarjetas" title="Moss Nexus" label="Proyecto" accent="var(--color-lavender-deep)">
          Flujos de n8n listos para copiar.
        </IdentityCard>
      </li>
      <li>
        <GlowCard href="#tarjetas" title="Reporte diario de ventas" label="Reportes">
          Cada mañana, el resumen de ayer en tu correo.
        </GlowCard>
      </li>
    </ul>
  )
}
