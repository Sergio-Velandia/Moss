import { useState, type CSSProperties } from 'react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Reto: una tarjeta, tres identidades',
  description: 'Cambiar la paleta de un componente sin duplicarlo ni encadenar condicionales de clases: variables CSS leídas con la sintaxis bg-(--variable) de Tailwind 4.',
  technology: 'CSS',
  category: 'Retos Tailwind',
  tags: ['reto', 'tailwind', 'variables css', 'temas', 'paleta', 'hover', 'design tokens'],
  createdAt: '2026-10-13',
  usage:
    'Cada identidad es un objeto de variables CSS (--card-bg, --card-accent…) que se aplica en el contenedor; el componente solo usa clases como bg-(--card-bg) y hover:border-(--card-accent). Añadir una paleta es añadir un objeto. Es la técnica de las tarjetas de /proyectos (clases .pt-* en index.css).',
  dependencies: ['tailwindcss'],
}

type Palette = 'salvia' | 'sandia' | 'oro'

// Cada identidad, como variables CSS. Contraste del texto ≥ 4.5:1 sobre su fondo en las tres.
// El botón también tiene sus variables: en «Oro» va con contorno, porque esa identidad nunca rellena de dorado
const palettes: Record<Palette, { name: string; vars: Record<string, string> }> = {
  salvia: {
    name: 'Salvia',
    vars: { '--card-bg': '#f6f4ec', '--card-ink': '#2f3a2c', '--card-soft': '#5b6657', '--card-accent': '#476140', '--card-border': '#dfe5d4', '--btn-bg': '#476140', '--btn-ink': '#ffffff', '--btn-border': '#476140' },
  },
  sandia: {
    name: 'Sandía',
    vars: { '--card-bg': '#1a2219', '--card-ink': '#e9efe0', '--card-soft': '#a9b5a2', '--card-accent': '#f2647a', '--card-border': '#2f3a2d', '--btn-bg': '#f2647a', '--btn-ink': '#0e130e', '--btn-border': '#f2647a' },
  },
  oro: {
    name: 'Oro',
    vars: { '--card-bg': '#101009', '--card-ink': '#f5f2ec', '--card-soft': '#a8a49a', '--card-accent': '#c9a96e', '--card-border': '#26251f', '--btn-bg': '#0a0a09', '--btn-ink': '#f5f2ec', '--btn-border': '#3a3830' },
  },
}

export default function RetoPaletaConVariables() {
  const [palette, setPalette] = useState<Palette>('sandia')
  const [fixed, setFixed] = useState(false)
  const vars = palettes[palette].vars

  return (
    <div className="w-full max-w-md text-left">
      <p className="text-sm font-medium">El reto</p>
      <p className="mt-1 text-sm text-ink-soft">
        Elige una paleta. Sin arreglo, los colores están escritos en las clases y la tarjeta no cambia; con arreglo,
        la tarjeta lee variables CSS.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div role="group" aria-label="Versión" className="inline-flex rounded-lg bg-cream-deep p-0.5 text-xs">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={fixed === v}
              onClick={() => setFixed(v)}
              className={`min-h-9 rounded-md px-3 font-medium transition-colors ${fixed === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
            >
              {v ? 'Con arreglo' : 'Sin arreglo'}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Paleta" className="flex gap-1.5">
          {(Object.keys(palettes) as Palette[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={palette === p}
              onClick={() => setPalette(p)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${palette === p ? 'border-ink text-ink' : 'border-cream-deep text-ink-soft hover:text-ink'}`}
            >
              <span aria-hidden className="size-3 rounded-full" style={{ background: palettes[p].vars['--card-accent'] }} />
              {palettes[p].name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-cream-deep/60 p-4" style={fixed ? (vars as CSSProperties) : undefined}>
        {fixed ? (
          // Con arreglo: una sola tarjeta que lee variables
          <a
            href="#reto-paleta"
            onClick={(e) => e.preventDefault()}
            className="group block rounded-2xl border border-(--card-border) bg-(--card-bg) p-5 text-(--card-ink) transition-colors hover:border-(--card-accent) focus-visible:border-(--card-accent)"
          >
            <p className="text-lg font-semibold">Moss Nexus</p>
            <p className="mt-1 text-sm text-(--card-soft)">Flujos de n8n listos para copiar.</p>
            <span className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-(--btn-border) bg-(--btn-bg) px-4 text-sm font-semibold text-(--btn-ink) transition group-hover:-translate-y-0.5 group-hover:border-(--card-accent)">
              Ver cómo está hecho
            </span>
          </a>
        ) : (
          // Sin arreglo: los colores viven en las clases; cambiar de paleta exigiría otra tarjeta
          <a
            href="#reto-paleta"
            onClick={(e) => e.preventDefault()}
            className="group block rounded-2xl border border-[#dfe5d4] bg-[#f6f4ec] p-5 text-[#2f3a2c] transition-colors hover:border-[#476140]"
          >
            <p className="text-lg font-semibold">Moss Nexus</p>
            <p className="mt-1 text-sm text-[#5b6657]">Flujos de n8n listos para copiar.</p>
            <span className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#476140] px-4 text-sm font-semibold text-white transition-transform group-hover:-translate-y-0.5">
              Ver cómo está hecho
            </span>
          </a>
        )}
      </div>

      <p aria-live="polite" className={`mt-3 text-sm ${fixed ? 'text-sage-deep' : 'text-danger'}`}>
        {fixed
          ? `Paleta «${palettes[palette].name}»: el contenedor define --card-bg, --card-accent y compañía, y la tarjeta no cambia ni una clase.`
          : `Elegiste «${palettes[palette].name}», pero la tarjeta sigue en salvia: sus colores están escritos en las clases.`}
      </p>
    </div>
  )
}
