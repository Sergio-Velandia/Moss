import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { useT } from '../../lib/i18n'

const TEXT = {
  es: { copy: 'Copiar', copied: '¡Copiado!', collapse: 'Contraer', expand: (n: number) => `Ver todo (${n} líneas)` },
  en: { copy: 'Copy', copied: 'Copied!', collapse: 'Collapse', expand: (n: number) => `Show all (${n} lines)` },
}
interface Props {
  code: string
  lang?: string
  /** Líneas visibles cuando está contraído */
  collapsedLines?: number
}

export default function CodeBlock({ code, lang = 'tsx', collapsedLines = 14 }: Props) {
  const t = useT(TEXT)
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const lineCount = code.split('\n').length
  const collapsible = lineCount > collapsedLines

  useEffect(() => {
    let cancelled = false
    // Import dinámico: el resaltador no entra en el bundle inicial
    import('../../lib/highlight')
      .then(({ highlight }) => highlight(code, lang))
      .then((out) => {
        if (!cancelled) setHtml(out)
      })
      .catch(() => {
        /* si falla el resaltado, se muestra el código sin colores */
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* el portapapeles puede estar bloqueado; no hacemos nada */
    }
  }

  return (
    <div className="not-prose overflow-hidden rounded-2xl border border-surface/70 bg-surface/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-cream-deep px-4 py-2 text-xs text-ink-soft">
        <span className="font-mono uppercase tracking-wide">{lang}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 pointer-coarse:py-2 transition hover:bg-sage/20 active:scale-95"
          aria-live="polite"
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          {copied ? t.copied : t.copy}
        </button>
      </div>

      <div
        className="overflow-auto text-sm transition-[max-height] duration-300 [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:font-mono"
        style={{ maxHeight: collapsible && !expanded ? `${collapsedLines * 1.5 + 2}em` : '200em' }}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="p-4 font-mono">{code}</pre>
        )}
      </div>

      {collapsible && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1 border-t border-cream-deep py-2 text-xs text-ink-soft transition hover:bg-sage/10"
        >
          {expanded ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
          {expanded ? t.collapse : t.expand(lineCount)}
        </button>
      )}
    </div>
  )
}
