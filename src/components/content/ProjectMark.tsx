import { Sprout } from 'lucide-react'
import { NexusMark } from '../nexus/NexusMark'

/**
 * Marca de cada proyecto en su propio estilo: el brote de Moss, los dos nodos de Nexus, el monograma «SV»
 * del portafolio (en su cabecera usa Syne en negrita), la berenjena de Moss Taste y el favicon del hub, cuyas letras
 * son trazos (no dependen de la fuente). Va dentro de un elemento con la clase .pt-<tema>.
 */
export default function ProjectMark({ theme, size = 44 }: { theme: string; size?: number }) {
  if (theme === 'hub') {
    return (
      <span aria-hidden className="pt-mark inline-flex shrink-0">
        <svg width={size} height={size} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#0a0a09" stroke="rgb(201 169 110 / 0.35)" strokeWidth="1.5" />
          <path
            fill="#c9a96e"
            d="M5.17 35.13L12 35.13Q12.17 35.65 13.02 36.01Q13.87 36.38 15.31 36.56Q16.75 36.75 18.65 36.75Q20.52 36.75 21.61 36.64Q22.70 36.52 23.15 36.24Q23.60 35.95 23.60 35.45Q23.60 34.98 22.87 34.71Q22.15 34.45 20.30 34.35Q18.45 34.25 15.10 34.25Q12.60 34.25 10.79 34.01Q8.97 33.77 7.81 33.26Q6.65 32.75 6.10 31.96Q5.55 31.17 5.55 30.07Q5.55 28.17 6.84 26.94Q8.12 25.70 10.74 25.09Q13.35 24.47 17.27 24.47Q23.02 24.47 26.06 26.14Q29.10 27.80 29.10 30.92L22.62 30.92Q22.50 30.10 21.07 29.66Q19.65 29.23 17.02 29.23Q14.42 29.23 13.16 29.52Q11.90 29.82 11.90 30.55Q11.90 30.92 12.25 31.15Q12.60 31.38 13.46 31.51Q14.32 31.65 15.90 31.70Q17.47 31.75 19.90 31.75Q22.57 31.75 24.45 32.01Q26.32 32.27 27.49 32.80Q28.65 33.33 29.17 34.14Q29.70 34.95 29.70 36.05Q29.70 37.95 28.50 39.15Q27.30 40.35 24.70 40.92Q22.10 41.50 17.90 41.50Q15.52 41.50 13.54 41.23Q11.55 40.95 10 40.41Q8.45 39.88 7.37 39.09Q6.30 38.30 5.74 37.31Q5.17 36.33 5.17 35.13M49.60 41L40.90 41L31.20 25L38.25 25L45.25 38L52.25 25L59.20 25"
          />
        </svg>
      </span>
    )
  }
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
