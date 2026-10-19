import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { site } from '../../data/site'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Pieza: botones con variantes',
  description: 'El botón de Moss y Moss Nexus en primario, secundario y fantasma, con estado de carga que no pierde el foco.',
  technology: 'React',
  category: 'Piezas Tailwind',
  tags: ['botón', 'variantes', 'tokens', 'foco', 'tailwind 4'],
  createdAt: '2026-10-18',
  usage:
    'Copia Button y úsalo como un <button> normal: <Button variant="secondary" onClick={…}>. Para una petición, pasa loading mientras espera la respuesta. Usa los tokens de color de Moss (accent, on-accent, surface, ink, ink-soft, sage, sage-deep): defínelos en tu @theme o cámbialos por los tuyos.',
  dependencies: ['lucide-react', 'tailwindcss'],
  notes: [
    'Cargando usa aria-disabled en lugar de disabled: un botón con disabled pierde el foco del teclado justo cuando lo pulsas, y el lector de pantalla no anuncia el cambio. Con aria-disabled el foco se queda y los clics se ignoran.',
    'disabled de verdad solo cuando la acción no está disponible. En mis apps no hay un botón deshabilitado suelto: solo se bloquea mientras carga.',
    'Foco visible propio (outline de 2 px en sage-deep), igual que el :focus-visible global de Moss, para que funcione aunque copies la pieza a otra app.',
    'Contraste AA medido con los tokens de Moss: primario 5,98:1 (claro) y 6,26:1 (oscuro); secundario y fantasma, por encima de 5,3:1 en los dos temas.',
    'Solo se animan transform (elevarse al pasar, encogerse al pulsar) y la rotación del icono. Con prefers-reduced-motion no hay desplazamiento ni giro; los cambios de color son inmediatos.',
    'Altura mínima de 44 px (min-h-11) para que sea fácil de tocar en el móvil.',
  ],
  usedIn: [
    { label: 'Moss Nexus: inicio', url: site.nexusUrl },
    { label: 'Moss: fichas de proyecto', url: 'https://sergio-velandia.dev/Moss/proyectos/moss-nexus/' },
  ],
  related: ['manual/css/capas-y-tokens-en-tailwind-4', 'journal/estados-de-un-boton', 'lab/button-states', 'lab/copy-button'],
}

const VARIANTS = {
  primary: 'bg-accent text-on-accent shadow-sm hover:-translate-y-0.5',
  secondary: 'border border-sage/60 bg-surface/70 text-ink hover:-translate-y-0.5 hover:border-sage-deep hover:text-sage-deep',
  ghost: 'text-ink-soft hover:bg-sage/20 hover:text-ink',
} as const

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-transform duration-200 ' +
  'active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-deep ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 ' +
  'aria-disabled:cursor-wait aria-disabled:opacity-80 aria-disabled:hover:translate-y-0 aria-disabled:active:scale-100 ' +
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS
  /** Mientras es true, el botón ignora los clics pero conserva el foco */
  loading?: boolean
  loadingText?: string
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText = 'Cargando…',
  type = 'button',
  className = '',
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-disabled={loading || undefined}
      onClick={(e) => {
        if (loading) return e.preventDefault()
        onClick?.(e)
      }}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden />}
      {loading ? loadingText : children}
    </button>
  )
}

export default function ButtonsDemo() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const save = () => {
    setLoading(true)
    setMessage('')
    timer.current = window.setTimeout(() => {
      setLoading(false)
      setMessage('Cambios guardados.')
    }, 1500)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Primario</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="ghost">Fantasma</Button>
        <Button disabled>Deshabilitado</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button loading={loading} loadingText="Guardando…" onClick={save}>
          Guardar
        </Button>
        <p role="status" className="min-w-36 text-sm text-ink-soft">
          {message}
        </p>
      </div>
    </div>
  )
}
