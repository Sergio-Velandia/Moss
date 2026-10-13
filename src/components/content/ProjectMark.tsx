import { Sprout } from 'lucide-react'
import { NexusMark } from '../nexus/NexusMark'

/**
 * Marca de cada proyecto en su propio estilo: el brote de Moss, los dos nodos de Nexus y el monograma «SV»
 * del portafolio (en su cabecera usa Syne en negrita). Va dentro de un elemento con la clase .pt-<tema>.
 */
export default function ProjectMark({ theme, size = 44 }: { theme: string; size?: number }) {
  if (theme === 'nexus') {
    return (
      <span className="pt-mark inline-flex">
        <NexusMark size={size} />
      </span>
    )
  }
  if (theme === 'portafolio') {
    return (
      <span
        aria-hidden
        translate="no"
        style={{ width: size, height: size }}
        className="pt-mark pt-display inline-grid shrink-0 place-items-center rounded-[6px] border border-[#c9a96e]/35 bg-[#0a0a09] text-sm font-extrabold tracking-wide text-[#c9a96e]"
      >
        SV
      </span>
    )
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="pt-mark inline-grid shrink-0 place-items-center rounded-xl bg-sage/25 text-sage-deep"
    >
      <Sprout size={size * 0.5} />
    </span>
  )
}
