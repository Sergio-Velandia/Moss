import { Sprout } from 'lucide-react'
import { NexusMark } from '../nexus/NexusMark'

/**
 * Marca de cada proyecto en su propio estilo: el brote de Moss, los dos nodos de Nexus, el monograma «SV»
 * del portafolio (en su cabecera usa Syne en negrita) y la berenjena de Moss Taste. Va dentro de un elemento con la clase .pt-<tema>.
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
  if (theme === 'taste') {
    return (
      <span aria-hidden className="pt-mark inline-flex shrink-0">
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#6b3a8c" />
          <g transform="rotate(-30 16 16)">
            <ellipse cx="16" cy="18.6" rx="5.8" ry="9.6" fill="#faf7f2" />
            <path d="M9.6 11.4c2.6-2.6 10.2-2.6 12.8 0l-2.9 2.6-3.5-1.6-3.5 1.6z" fill="#6b3a8c" />
            <path d="M10.4 10.6c2.4-1.9 8.8-1.9 11.2 0" fill="none" stroke="#faf7f2" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="15.1" y="4.5" width="1.8" height="6" rx="0.9" fill="#faf7f2" />
          </g>
        </svg>
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
