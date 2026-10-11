import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useLang } from '../../lib/i18n'
import { dashboardCards, dashboardGridClass, type DashboardCardId } from './cards'

/** Carcasa común de las tarjetas: la usan el tablero y su esqueleto. */
interface ChartCardProps {
  id: DashboardCardId
  summary: ReactNode
  children: ReactNode
  footer: ReactNode
  /** Posición en el tablero, para escalonar la entrada. Sin ella no hay animación (esqueleto). */
  index?: number
}

export function ChartCard({ id, summary, children, footer, index }: ChartCardProps) {
  const card = dashboardCards[id]
  const lang = useLang()
  const animated = index !== undefined
  return (
    <motion.figure
      initial={animated ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.08, duration: 0.35, ease: 'easeOut' }}
      className={`m-0 flex min-w-0 flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur ${card.className}`}
    >
      <figcaption>
        <h3 className="text-sm font-medium">{card.title[lang]}</h3>
        <div className="mt-1 min-h-10 text-sm text-ink-soft">{summary}</div>
      </figcaption>
      <div className={`mt-3 min-w-0 ${card.chartClass}`}>{children}</div>
      <div className="mt-3">{footer}</div>
    </motion.figure>
  )
}

export function DashboardSkeleton() {
  const pulse = 'animate-pulse rounded-xl bg-cream-deep/80'
  const lang = useLang()
  return (
    <div className={dashboardGridClass} aria-busy="true" aria-label={lang === 'es' ? 'Cargando el tablero' : 'Loading the dashboard'}>
      {(Object.keys(dashboardCards) as DashboardCardId[]).map((id) => (
        <ChartCard
          key={id}
          id={id}
          summary={<span className={`${pulse} mt-1 block h-4 w-3/4`} />}
          footer={<span className={`${pulse} block h-11 w-40`} />}
        >
          <div className={`${pulse} h-full w-full`} />
        </ChartCard>
      ))}
    </div>
  )
}
