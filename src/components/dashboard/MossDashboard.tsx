import { useMemo, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Rectangle,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type PieSectorShapeProps,
  type TooltipContentProps,
} from 'recharts'
import {
  byMonth,
  byTechnology,
  byType,
  type GardenItem,
  type GardenType,
  type MonthStat,
  type TechnologyStat,
  type TypeStat,
} from '../../lib/dashboard'
import { dashboardGridClass } from './cards'
import { ChartCard } from './ChartCard'

// Colores siempre desde los tokens: al cambiar de tema, el SVG se repinta solo
const typeColor: Record<GardenType, string> = {
  manual: 'var(--c-chart-1)',
  laboratorio: 'var(--c-chart-2)',
  bitacora: 'var(--c-chart-3)',
}
const typeSwatch: Record<GardenType, string> = {
  manual: 'bg-chart-1',
  laboratorio: 'bg-chart-2',
  bitacora: 'bg-chart-3',
}
const typeWithArticle: Record<GardenType, string> = {
  laboratorio: 'El Laboratorio',
  manual: 'El Manual',
  bitacora: 'La Bitácora',
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function MossDashboard({ items }: { items: GardenItem[] }) {
  // Si el sistema pide menos movimiento, recharts tampoco anima
  const animate = !useReducedMotion()
  const months = useMemo(() => byMonth(items), [items])
  const technologies = useMemo(() => byTechnology(items), [items])
  const types = useMemo(() => byType(items), [items])

  return (
    <div className={dashboardGridClass}>
      <GrowthCard months={months} animate={animate} />
      <EcosystemCard technologies={technologies} total={items.length} animate={animate} />
      <DistributionCard types={types} total={items.length} animate={animate} />
    </div>
  )
}

// ——— Tooltip ———

function TooltipCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-surface/70 bg-surface/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-ink-soft">{children}</p>
    </div>
  )
}

/** Adapta el tooltip de recharts a una función que recibe el dato bajo el cursor. */
function tooltipFor<T>(render: (datum: T) => ReactNode) {
  return function ChartTooltip({ active, payload }: TooltipContentProps) {
    const datum = payload?.[0]?.payload as T | undefined
    return active && datum ? render(datum) : null
  }
}

const growthTooltip = tooltipFor<MonthStat>((m) => (
  <TooltipCard title={capitalize(m.fullLabel)}>{plural(m.count, 'brote nuevo', 'brotes nuevos')}</TooltipCard>
))
const ecosystemTooltip = tooltipFor<TechnologyStat>((t) => (
  <TooltipCard title={t.technology}>{plural(t.count, 'elemento', 'elementos')}</TooltipCard>
))
const distributionTooltip = tooltipFor<TypeStat>((t) => (
  <TooltipCard title={t.label}>
    {plural(t.count, 'elemento', 'elementos')} · {t.percent} %
  </TooltipCard>
))

// ——— Tabla alternativa ———

function DataTable({ caption, headers, rows }: { caption: string; headers: [string, string]; rows: [string, string][] }) {
  return (
    <details className="text-xs">
      <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-lg text-ink-soft transition hover:text-sage-deep">
        Ver datos como tabla
      </summary>
      <table className="mt-1 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-cream-deep text-ink-soft">
            <th scope="col" className="py-1.5 font-medium">{headers[0]}</th>
            <th scope="col" className="py-1.5 text-right font-medium">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-b border-cream-deep/70 last:border-0">
              <th scope="row" className="py-1.5 font-normal">{a}</th>
              <td className="py-1.5 text-right tabular-nums">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

// ——— 1. Barras: el ritmo de crecimiento ———

function GrowthCard({ months, animate }: { months: MonthStat[]; animate: boolean }) {
  const current = months.at(-1)
  const total = months.reduce((sum, m) => sum + m.count, 0)

  const summary = current ? (
    <p>
      {capitalize(current.fullLabel)}:{' '}
      {current.count === 0 ? 'todavía sin brotes nuevos' : plural(current.count, 'brote nuevo', 'brotes nuevos')}
      {months.length > 1 && ` · ${total} en ${plural(months.length, 'mes', 'meses')}`}
    </p>
  ) : (
    <p>Aún no hay nada plantado.</p>
  )

  return (
    <ChartCard
      id="growth"
      index={0}
      summary={summary}
      footer={
        <DataTable
          caption="Elementos plantados por mes"
          headers={['Mes', 'Elementos']}
          rows={months.map((m) => [`${capitalize(m.fullLabel)}${m.isCurrent ? ' (mes actual)' : ''}`, String(m.count)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} accessibilityLayer>
          <XAxis
            dataKey="label"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: 'var(--c-sage)', strokeOpacity: 0.5 }}
            tick={monthTick(months)}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            content={growthTooltip}
            cursor={{ fill: 'var(--c-sage)', fillOpacity: 0.14, radius: 10 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar
            dataKey="count"
            name="Elementos"
            radius={[8, 8, 3, 3]}
            maxBarSize={36}
            isAnimationActive={animate}
            shape={(props: BarShapeProps) => (
              <Rectangle {...props} fill={props.payload?.isCurrent ? 'var(--c-chart-2)' : 'var(--c-chart-1)'} />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface TickProps {
  x?: number | string
  y?: number | string
  payload?: { value: string; index: number }
}

/** Etiqueta del eje X: el mes actual va resaltado también en el texto, no solo en el color de la barra. */
function monthTick(months: MonthStat[]) {
  return function MonthTick({ x, y, payload }: TickProps) {
    const isCurrent = payload ? months[payload.index]?.isCurrent : false
    return (
      <text
        x={x}
        y={y}
        dy={14}
        textAnchor="middle"
        fontSize={12}
        fontWeight={isCurrent ? 600 : 400}
        fill={isCurrent ? 'var(--c-ink)' : 'var(--c-ink-soft)'}
      >
        {payload?.value}
      </text>
    )
  }
}

// ——— 2. Radar: el ecosistema ———

function EcosystemCard({ technologies, total, animate }: { technologies: TechnologyStat[]; total: number; animate: boolean }) {
  const top = technologies[0]
  return (
    <ChartCard
      id="ecosystem"
      index={1}
      summary={
        top ? (
          <p>
            {top.technology} aparece en {top.count} de {plural(total, 'elemento', 'elementos')}
          </p>
        ) : (
          <p>Aún no hay tecnologías registradas.</p>
        )
      }
      footer={
        <DataTable
          caption="Elementos que mencionan cada tecnología"
          headers={['Tecnología', 'Elementos']}
          rows={technologies.map((t) => [t.technology, String(t.count)])}
        />
      }
    >
      {/* Un radar necesita al menos tres ejes para dibujar una forma */}
      {technologies.length >= 3 ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={technologies} outerRadius="72%" accessibilityLayer style={{ overflow: 'visible' }}>
            <PolarGrid stroke="var(--c-sage)" strokeOpacity={0.35} />
            <PolarAngleAxis dataKey="technology" tick={{ fill: 'var(--c-ink-soft)', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={ecosystemTooltip} cursor={false} wrapperStyle={{ outline: 'none' }} />
            <Radar
              dataKey="value"
              name="Presencia"
              stroke="var(--c-chart-1)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              fill="var(--c-chart-1)"
              fillOpacity={0.3}
              dot={{ r: 2.5, fill: 'var(--c-chart-1)', strokeWidth: 0 }}
              isAnimationActive={animate}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <p className="flex h-full items-center justify-center text-center text-sm text-ink-soft">
          Hacen falta al menos tres tecnologías para dibujar la huella.
        </p>
      )}
    </ChartCard>
  )
}

// ——— 3. Dona: la distribución del jardín ———

/** Frase de la dona. Con empates nombra a todas las secciones empatadas, para no favorecer a ninguna. */
function distributionSummary(types: TypeStat[], total: number) {
  if (total === 0) return 'Aún no hay nada plantado.'
  const max = Math.max(...types.map((t) => t.count))
  const leaders = types.filter((t) => t.count === max)
  if (leaders.length === types.length) return 'El jardín está repartido a partes iguales.'
  if (leaders.length === 1) return `${typeWithArticle[leaders[0].type]} reúne el ${leaders[0].percent} % del jardín`
  const [first, second] = leaders.map((t) => typeWithArticle[t.type])
  // Solo el artículo va en minúscula: "El Laboratorio y el Manual"
  return `${first} y ${second.replace(/^(El|La) /, (a) => a.toLowerCase())} reúnen el ${leaders[0].percent} % cada uno`
}

function DistributionCard({ types, total, animate }: { types: TypeStat[]; total: number; animate: boolean }) {
  return (
    <ChartCard
      id="distribution"
      index={2}
      summary={<p>{distributionSummary(types, total)}</p>}
      footer={
        <DataTable
          caption="Elementos por sección"
          headers={['Sección', 'Elementos']}
          rows={types.map((t) => [t.label, `${t.count} (${t.percent} %)`])}
        />
      }
    >
      <div className="flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {/* Sin capa de teclado: la dona no tiene eje que recorrer; la leyenda y la tabla dan los mismos datos */}
            <PieChart accessibilityLayer={false}>
              {/* Por encima del total central, que es un elemento HTML superpuesto */}
              <Tooltip content={distributionTooltip} wrapperStyle={{ outline: 'none', zIndex: 10 }} />
              <Pie
                data={types}
                dataKey="count"
                nameKey="label"
                innerRadius="72%"
                outerRadius="98%"
                paddingAngle={3}
                cornerRadius={6}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={animate}
                shape={(props: PieSectorShapeProps) => (
                  <Sector {...props} fill={typeColor[(props.payload as TypeStat).type]} />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-ink-soft">{total === 1 ? 'elemento' : 'elementos'}</span>
          </div>
        </div>

        <ul className="mt-2 space-y-0.5 text-sm" aria-label="Leyenda">
          {types.map((t) => (
            <li key={t.type} className="flex h-7 items-center gap-2">
              <span className={`size-3 shrink-0 rounded-full ${typeSwatch[t.type]}`} aria-hidden />
              <span className="flex-1">{t.label}</span>
              <span className="tabular-nums text-ink-soft">
                {t.count} · {t.percent} %
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
