import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Skeleton loader',
  description: 'Esqueleto de tarjeta con pulso suave mientras carga el contenido.',
  technology: 'React',
  category: 'Loaders',
  tags: ['loader', 'skeleton', 'tailwind', 'estado de carga'],
  createdAt: '2026-10-10',
  usage: 'Muestra <SkeletonCard /> mientras `loading` sea true y reemplázalo por el contenido real.',
  dependencies: ['tailwindcss'],
}

export default function SkeletonCard() {
  return (
    <div
      className="w-64 rounded-2xl border border-surface/70 bg-surface/60 p-4 shadow-sm"
      role="status"
      aria-label="Cargando contenido"
    >
      <div className="h-28 animate-pulse rounded-xl bg-sage/30" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-lavender/50" />
      <div className="mt-2 h-3 w-full animate-pulse rounded bg-cream-deep" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-cream-deep" />
    </div>
  )
}
