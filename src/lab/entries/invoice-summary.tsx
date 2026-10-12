import { useId, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Resumen de factura con IVA',
  description: 'Líneas de factura con cantidades e IVA por producto (19 %, 5 % o exento), calculadas en pesos enteros y mostradas con Intl.',
  technology: 'React',
  category: 'Facturación',
  tags: ['factura', 'iva', 'dinero', 'intl', 'cop', 'redondeo', 'negocio'],
  createdAt: '2026-10-12',
  usage:
    'Los precios se guardan como enteros (pesos, o centavos si tu moneda los usa) y el IVA se redondea por línea con Math.round. Cambia `lines` por tus productos y `currency`/`locale` por tu país. Intl solo formatea: nunca vuelvas a calcular con el texto formateado.',
  dependencies: ['lucide-react', 'tailwindcss'],
}

type Rate = 19 | 5 | 0

interface Line {
  id: number
  concept: string
  /** Precio unitario en pesos enteros, sin IVA */
  unitPrice: number
  quantity: number
  rate: Rate
}

const lines: Line[] = [
  { id: 1, concept: 'Licencia de software (mes)', unitPrice: 89_900, quantity: 3, rate: 19 },
  { id: 2, concept: 'Soporte técnico (hora)', unitPrice: 75_000, quantity: 2, rate: 19 },
  { id: 3, concept: 'Libro de capacitación', unitPrice: 48_500, quantity: 1, rate: 0 },
  { id: 4, concept: 'Café para la reunión', unitPrice: 12_333, quantity: 4, rate: 5 },
]

const rateLabel: Record<Rate, string> = { 19: 'IVA 19 %', 5: 'IVA 5 %', 0: 'Exento' }

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** IVA de una línea en pesos enteros: se multiplica antes de dividir para no arrastrar decimales. */
export const lineTax = (subtotal: number, rate: Rate) => Math.round((subtotal * rate) / 100)

export default function InvoiceSummary() {
  const baseId = useId()
  const [items, setItems] = useState(lines)

  const setQuantity = (id: number, quantity: number) =>
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(0, Math.min(99, quantity)) } : l)))
  const setRate = (id: number, rate: Rate) => setItems((prev) => prev.map((l) => (l.id === id ? { ...l, rate } : l)))

  const rows = items.map((l) => {
    const subtotal = l.unitPrice * l.quantity
    return { ...l, subtotal, tax: lineTax(subtotal, l.rate) }
  })
  const subtotal = rows.reduce((s, r) => s + r.subtotal, 0)
  const taxByRate = ([19, 5] as const).map((rate) => ({
    rate,
    base: rows.filter((r) => r.rate === rate).reduce((s, r) => s + r.subtotal, 0),
    tax: rows.filter((r) => r.rate === rate).reduce((s, r) => s + r.tax, 0),
  }))
  const total = subtotal + taxByRate.reduce((s, t) => s + t.tax, 0)

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-surface/70 p-4 text-left shadow-sm sm:p-5">
      <ul className="divide-y divide-cream-deep">
        {rows.map((r) => {
          const qtyId = `${baseId}-qty-${r.id}`
          return (
            <li key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[1fr_auto_auto_6.5rem]">
              <div className="min-w-0 sm:col-start-1">
                <p className="text-sm font-medium">{r.concept}</p>
                <p className="text-xs text-ink-soft tabular-nums">{money.format(r.unitPrice)} c/u</p>
              </div>

              <div className="col-start-2 row-start-1 flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${r.concept}`}
                  onClick={() => setQuantity(r.id, r.quantity - 1)}
                  className="inline-flex size-9 pointer-coarse:size-11 items-center justify-center rounded-lg text-ink-soft transition hover:bg-cream-deep active:scale-95"
                >
                  <Minus size={14} aria-hidden />
                </button>
                <label htmlFor={qtyId} className="sr-only">Cantidad de {r.concept}</label>
                <input
                  id={qtyId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={r.quantity}
                  onChange={(e) => setQuantity(r.id, Number(e.target.value) || 0)}
                  className="h-9 w-12 rounded-lg border border-cream-deep bg-surface text-center text-base tabular-nums sm:text-sm"
                />
                <button
                  type="button"
                  aria-label={`Añadir una unidad de ${r.concept}`}
                  onClick={() => setQuantity(r.id, r.quantity + 1)}
                  className="inline-flex size-9 pointer-coarse:size-11 items-center justify-center rounded-lg text-ink-soft transition hover:bg-cream-deep active:scale-95"
                >
                  <Plus size={14} aria-hidden />
                </button>
              </div>

              <select
                value={r.rate}
                onChange={(e) => setRate(r.id, Number(e.target.value) as Rate)}
                aria-label={`Impuesto de ${r.concept}`}
                className="h-9 rounded-lg border border-cream-deep bg-surface px-2 text-base sm:col-start-3 sm:row-start-1 sm:text-xs"
              >
                {([19, 5, 0] as const).map((rate) => (
                  <option key={rate} value={rate}>
                    {rateLabel[rate]}
                  </option>
                ))}
              </select>

              <p className="text-right text-sm font-medium tabular-nums sm:col-start-4 sm:row-start-1">{money.format(r.subtotal)}</p>
            </li>
          )
        })}
      </ul>

      <dl className="mt-3 space-y-1 border-t border-cream-deep pt-3 text-sm tabular-nums">
        <div className="flex justify-between text-ink-soft">
          <dt>Subtotal</dt>
          <dd>{money.format(subtotal)}</dd>
        </div>
        {taxByRate
          .filter((t) => t.base > 0)
          .map((t) => (
            <div key={t.rate} className="flex justify-between text-ink-soft">
              <dt>
                IVA {t.rate} % <span className="text-xs">sobre {money.format(t.base)}</span>
              </dt>
              <dd>{money.format(t.tax)}</dd>
            </div>
          ))}
        <div className="flex justify-between pt-1 text-base font-semibold">
          <dt>Total a pagar</dt>
          {/* aria-live: al cambiar una cantidad, el lector de pantalla anuncia el nuevo total */}
          <dd aria-live="polite">{money.format(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
