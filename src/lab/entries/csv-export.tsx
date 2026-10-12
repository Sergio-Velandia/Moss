import { useState } from 'react'
import { Download } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Exportar a CSV que Excel abre bien',
  description: 'Genera un CSV con tildes, comas y comillas correctas, separador para Excel en español y protección contra fórmulas inyectadas.',
  technology: 'React',
  category: 'Datos',
  tags: ['csv', 'excel', 'exportar', 'bom', 'utf-8', 'csv injection', 'reportes', 'negocio'],
  createdAt: '2026-10-12',
  usage:
    'Llama a `toCsv(filas, opciones)` y descarga el resultado con un Blob. Excel en español espera ";" como separador y coma decimal; el BOM hace que reconozca UTF-8 y las tildes no salgan rotas. Con `protectFormulas`, un valor que empieza por =, +, - o @ se guarda como texto.',
  dependencies: ['lucide-react', 'tailwindcss'],
}

export interface CsvOptions {
  /** ";" para Excel en español (usa coma decimal); "," para Excel en inglés */
  separator: ';' | ','
  /** Marca de orden de bytes: hace que Excel lea el archivo como UTF-8 */
  bom: boolean
  /** Neutraliza valores que Excel interpretaría como fórmulas (inyección CSV) */
  protectFormulas: boolean
}

type Cell = string | number | null | undefined

function formatCell(value: Cell, { separator, protectFormulas }: CsvOptions): string {
  if (value === null || value === undefined) return ''
  // Con ";" Excel espera coma decimal: 1234.5 → 1234,5
  let text = typeof value === 'number' && separator === ';' ? String(value).replace('.', ',') : String(value)
  if (protectFormulas && typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  // RFC 4180: entre comillas si contiene el separador, comillas o saltos de línea; las comillas se duplican
  const needsQuotes = text.includes(separator) || /["\r\n]/.test(text)
  return needsQuotes ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(rows: Cell[][], options: CsvOptions): string {
  const body = rows.map((row) => row.map((cell) => formatCell(cell, options)).join(options.separator)).join('\r\n')
  return (options.bom ? '﻿' : '') + body
}

// Datos con los casos que suelen romper un CSV hecho a mano
const invoices: Cell[][] = [
  ['Factura', 'Cliente', 'Ciudad', 'Total', 'Nota'],
  ['FV-1021', 'Pérez, Ana', 'Bogotá', 1250000.5, ''],
  ['FV-1022', 'Ñandú S.A.S.', 'Medellín', 89900, 'Pago en dos cuotas'],
  ['FV-1023', 'Taller "El Rayo"', 'Cali', 342000, 'Entregar\nen portería'],
  ['FV-1024', 'Cliente sospechoso', 'Cúcuta', 15000, '=HYPERLINK("http://ejemplo.invalid";"Clic")'],
]

export default function CsvExport() {
  const [options, setOptions] = useState<CsvOptions>({ separator: ';', bom: true, protectFormulas: true })
  const csv = toCsv(invoices, options)

  const download = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'facturas.csv'
    a.click()
    // Liberamos la memoria del Blob cuando el navegador ya inició la descarga
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const toggle = (key: 'bom' | 'protectFormulas') => setOptions((o) => ({ ...o, [key]: !o[key] }))

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-surface/70 p-4 text-left shadow-sm sm:p-5">
      <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <legend className="sr-only">Opciones de exportación</legend>
        <label className="flex min-h-9 items-center gap-2">
          <span className="text-ink-soft">Separador</span>
          <select
            value={options.separator}
            onChange={(e) => setOptions((o) => ({ ...o, separator: e.target.value as CsvOptions['separator'] }))}
            className="h-9 rounded-lg border border-cream-deep bg-surface px-2 text-base sm:text-sm"
          >
            <option value=";">; (Excel en español)</option>
            <option value=",">, (Excel en inglés)</option>
          </select>
        </label>
        <label className="flex min-h-9 items-center gap-2">
          <input type="checkbox" checked={options.bom} onChange={() => toggle('bom')} className="size-4 accent-accent" />
          BOM UTF-8 (tildes correctas)
        </label>
        <label className="flex min-h-9 items-center gap-2">
          <input
            type="checkbox"
            checked={options.protectFormulas}
            onChange={() => toggle('protectFormulas')}
            className="size-4 accent-accent"
          />
          Proteger fórmulas
        </label>
      </fieldset>

      <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-cream-deep/70 p-3 font-mono text-xs leading-relaxed">
        <code>{options.bom ? <span className="text-ink-soft">[BOM]</span> : null}{csv.replace('﻿', '')}</code>
      </pre>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          {invoices.length - 1} facturas · {new Blob([csv]).size} bytes
        </p>
        <button
          type="button"
          onClick={download}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-on-accent shadow-sm transition hover:brightness-110 active:scale-95"
        >
          <Download size={16} aria-hidden /> Descargar facturas.csv
        </button>
      </div>
    </div>
  )
}
