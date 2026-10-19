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
  byWeek,
  byTechnology,
  byType,
  type GardenItem,
  type GardenType,
  type MonthStat,
  type TechnologyStat,
  type TypeStat,
} from '../../lib/dashboard'
import { sectionNames, useLang, useT, type Lang } from '../../lib/i18n'
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
const typeSection = { laboratorio: 'lab', manual: 'manual', bitacora: 'journal' } as const

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const TEXT = {
  es: {
    sprouts: (n: number) => plural(n, 'brote nuevo', 'brotes nuevos'),
    items: (n: number) => plural(n, 'elemento', 'elementos'),
    noSprouts: 'todavía sin brotes nuevos',
    inMonths: (total: number, months: number) => ` · ${total} en ${plural(months, 'mes', 'meses')}`,
    inWeeks: (total: number, weeks: number) => ` · ${total} en ${plural(weeks, 'semana', 'semanas')}`,
    nothing: 'Aún no hay nada plantado.',
    table: 'Ver datos como tabla',
    currentMonth: ' (mes actual)',
    currentWeek: ' (semana actual)',
    growthCaption: 'Elementos plantados por mes',
    growthHeaders: ['Mes', 'Elementos'] as [string, string],
    growthCaptionWeeks: 'Elementos plantados por semana',
    growthHeadersWeeks: ['Semana', 'Elementos'] as [string, string],
    topTech: (tech: string, count: number, total: number) => `${tech} aparece en ${count} de ${plural(total, 'elemento', 'elementos')}`,
    noTechs: 'Aún no hay tecnologías registradas.',
    fewTechs: 'Hacen falta al menos tres tecnologías para dibujar la huella.',
    techCaption: 'Elementos que mencionan cada tecnología',
    techHeaders: ['Tecnología', 'Elementos'] as [string, string],
    typeCaption: 'Elementos por sección',
    typeHeaders: ['Sección', 'Elementos'] as [string, string],
    legend: 'Leyenda',
    withArticle: { laboratorio: 'El Laboratorio', manual: 'El Manual', bitacora: 'La Bitácora' } as Record<GardenType, string>,
    even: 'El jardín está repartido a partes iguales.',
    leader: (who: string, pct: number) => `${who} reúne el ${pct} % del jardín`,
    // Solo el artículo va en minúscula: "El Laboratorio y el Manual"
    tie: (a: string, b: string, pct: number) => `${a} y ${b.replace(/^(El|La) /, (x) => x.toLowerCase())} reúnen el ${pct} % cada uno`,
  },
  en: {
    sprouts: (n: number) => plural(n, 'new sprout', 'new sprouts'),
    items: (n: number) => plural(n, 'item', 'items'),
    noSprouts: 'no new sprouts yet',
    inMonths: (total: number, months: number) => ` · ${total} in ${plural(months, 'month', 'months')}`,
    inWeeks: (total: number, weeks: number) => ` · ${total} in ${plural(weeks, 'week', 'weeks')}`,
    nothing: 'Nothing has been planted yet.',
    table: 'View data as a table',
    currentMonth: ' (current month)',
    currentWeek: ' (current week)',
    growthCaption: 'Items planted per month',
    growthHeaders: ['Month', 'Items'] as [string, string],
    growthCaptionWeeks: 'Items planted per week',
    growthHeadersWeeks: ['Week', 'Items'] as [string, string],
    topTech: (tech: string, count: number, total: number) => `${tech} appears in ${count} of ${plural(total, 'item', 'items')}`,
    noTechs: 'No technologies recorded yet.',
    fewTechs: 'At least three technologies are needed to draw the footprint.',
    techCaption: 'Items that mention each technology',
    techHeaders: ['Technology', 'Items'] as [string, string],
    typeCaption: 'Items per section',
    typeHeaders: ['Section', 'Items'] as [string, string],
    legend: 'Legend',
    withArticle: { laboratorio: 'The Lab', manual: 'The Manual', bitacora: 'The Journal' } as Record<GardenType, string>,
    even: 'The garden is split evenly.',
    leader: (who: string, pct: number) => `${who} holds ${pct}% of the garden`,
    tie: (a: string, b: string, pct: number) => `${a} and ${b.replace(/^The /, 'the ')} hold ${pct}% each`,
  },
}
type Text = (typeof TEXT)[Lang]

export default function MossDashboard({ items }: { items: GardenItem[] }) {
  // Si el sistema pide menos movimiento, recharts tampoco anima
  const animate = !useReducedMotion()
  const lang = useLang()
  // Mientras el jardín tenga menos de tres meses, el ritmo se cuenta por semanas: un solo mes sería una sola barra
  const growth = useMemo(() => {
    const months = byMonth(items, undefined, 12, lang)
    return months.length >= 3 ? { periods: months, weekly: false } : { periods: byWeek(items, undefined, 12, lang), weekly: true }
  }, [items, lang])
  const technologies = useMemo(() => byTechnology(items), [items])
  const types = useMemo(() => byType(items), [items])

  return (
    <div className={dashboardGridClass}>
      <GrowthCard months={growth.periods} weekly={growth.weekly} animate={animate} />
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


// ——— Tabla alternativa ———

function DataTable({ caption, headers, rows }: { caption: string; headers: [string, string]; rows: [string, string][] }) {
  const t = useT(TEXT)
  return (
    <details className="text-xs">
      <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-lg text-ink-soft transition hover:text-sage-deep">
        {t.table}
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

function GrowthCard({ months, weekly, animate }: { months: MonthStat[]; weekly: boolean; animate: boolean }) {
  const t = useT(TEXT)
  const current = months.at(-1)
  const total = months.reduce((sum, m) => sum + m.count, 0)
  const tooltip = useMemo(
    () => tooltipFor<MonthStat>((m) => <TooltipCard title={capitalize(m.fullLabel)}>{t.sprouts(m.count)}</TooltipCard>),
    [t],
  )

  const summary = current ? (
    <p>
      {capitalize(current.fullLabel)}: {current.count === 0 ? t.noSprouts : t.sprouts(current.count)}
      {months.length > 1 && (weekly ? t.inWeeks(total, months.length) : t.inMonths(total, months.length))}
    </p>
  ) : (
    <p>{t.nothing}</p>
  )

  return (
    <ChartCard
      id="growth"
      index={0}
      summary={summary}
      footer={
        <DataTable
          caption={weekly ? t.growthCaptionWeeks : t.growthCaption}
          headers={weekly ? t.growthHeadersWeeks : t.growthHeaders}
          rows={months.map((m) => [`${capitalize(m.fullLabel)}${m.isCurrent ? (weekly ? t.currentWeek : t.currentMonth) : ''}`, String(m.count)])}
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
            content={tooltip}
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
  const t = useT(TEXT)
  const top = technologies[0]
  const tooltip = useMemo(
    () => tooltipFor<TechnologyStat>((x) => <TooltipCard title={x.technology}>{t.items(x.count)}</TooltipCard>),
    [t],
  )
  return (
    <ChartCard
      id="ecosystem"
      index={1}
      summary={
        top ? (
          <p>{t.topTech(top.technology, top.count, total)}</p>
        ) : (
          <p>{t.noTechs}</p>
        )
      }
      footer={
        <DataTable
          caption={t.techCaption}
          headers={t.techHeaders}
          rows={technologies.map((x) => [x.technology, String(x.count)])}
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
            <Tooltip content={tooltip} cursor={false} wrapperStyle={{ outline: 'none' }} />
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
          {t.fewTechs}
        </p>
      )}
    </ChartCard>
  )
}

// ——— 3. Dona: la distribución del jardín ———

/** Frase de la dona. Con empates nombra a todas las secciones empatadas, para no favorecer a ninguna. */
function distributionSummary(types: TypeStat[], total: number, t: Text) {
  if (total === 0) return t.nothing
  const max = Math.max(...types.map((x) => x.count))
  const leaders = types.filter((x) => x.count === max)
  if (leaders.length === types.length) return t.even
  if (leaders.length === 1) return t.leader(t.withArticle[leaders[0].type], leaders[0].percent)
  const [first, second] = leaders.map((x) => t.withArticle[x.type])
  return t.tie(first, second, leaders[0].percent)
}

function DistributionCard({ types, total, animate }: { types: TypeStat[]; total: number; animate: boolean }) {
  const lang = useLang()
  const t = useT(TEXT)
  const name = (type: GardenType) => sectionNames[lang][typeSection[type]]
  const tooltip = useMemo(
    () =>
      tooltipFor<TypeStat>((x) => (
        <TooltipCard title={sectionNames[lang][typeSection[x.type]]}>
          {t.items(x.count)} · {x.percent} %
        </TooltipCard>
      )),
    [t, lang],
  )
  return (
    <ChartCard
      id="distribution"
      index={2}
      summary={<p>{distributionSummary(types, total, t)}</p>}
      footer={
        <DataTable
          caption={t.typeCaption}
          headers={t.typeHeaders}
          rows={types.map((x) => [name(x.type), `${x.count} (${x.percent} %)`])}
        />
      }
    >
      <div className="flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {/* Sin capa de teclado: la dona no tiene eje que recorrer; la leyenda y la tabla dan los mismos datos */}
            <PieChart accessibilityLayer={false}>
              {/* Por encima del total central, que es un elemento HTML superpuesto */}
              <Tooltip content={tooltip} wrapperStyle={{ outline: 'none', zIndex: 10 }} />
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
            <span className="text-xs text-ink-soft">{t.items(total).replace(/^\d+ /, '')}</span>
          </div>
        </div>

        <ul className="mt-2 space-y-0.5 text-sm" aria-label={t.legend}>
          {types.map((x) => (
            <li key={x.type} className="flex h-7 items-center gap-2">
              <span className={`size-3 shrink-0 rounded-full ${typeSwatch[x.type]}`} aria-hidden />
              <span className="flex-1">{name(x.type)}</span>
              <span className="tabular-nums text-ink-soft">
                {x.count} · {x.percent} %
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
