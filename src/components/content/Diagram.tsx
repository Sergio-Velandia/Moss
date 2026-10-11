import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Split } from 'lucide-react'
import {
  parseDiagram,
  type DiagramLanguage,
  type DiagramNode,
  type FlowDiagram,
  type MindmapDiagram,
  type NodeKind,
} from '../../lib/diagram'

/**
 * Dibuja los bloques ```flow y ```mindmap del Markdown con HTML y CSS (tokens del tema).
 * Son listas reales: un lector de pantalla las recorre como pasos o como ramas.
 */
export default function Diagram({ lang, source }: { lang: DiagramLanguage; source: string }) {
  const diagram = useMemo(() => parseDiagram(lang, source), [lang, source])
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  // Se revela una sola vez, al entrar en pantalla
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        obs.disconnect()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <figure
      ref={ref}
      className={`diagram not-prose my-8 rounded-2xl border border-surface/70 bg-surface/40 p-4 sm:p-5 ${visible ? 'is-visible' : ''}`}
    >
      {diagram.type === 'flow' ? <FlowView flow={diagram} /> : <MindmapView map={diagram} />}
    </figure>
  )
}

const kindStyle: Record<NodeKind, string> = {
  default: 'border-cream-deep bg-surface',
  decision: 'border-lavender-deep/50 bg-lavender/25',
  success: 'border-sage-deep/50 bg-sage/20',
  error: 'border-danger/50 bg-danger/10',
}

const kindIcon = { decision: Split, success: CircleCheck, error: CircleAlert }
const kindName: Record<Exclude<NodeKind, 'default'>, string> = {
  decision: 'Decisión',
  success: 'Resultado correcto',
  error: 'Error',
}

const reveal = (i: number) => ({ '--i': i }) as CSSProperties

function NodeBox({ node, index, className = '' }: { node: DiagramNode; index: number; className?: string }) {
  const Icon = node.kind === 'default' ? null : kindIcon[node.kind]
  return (
    <div data-reveal style={reveal(index)} className={`rounded-xl border px-3 py-2 ${kindStyle[node.kind]} ${className}`}>
      <p className="flex items-start gap-1.5 text-sm font-medium leading-snug break-words hyphens-auto">
        {Icon && <Icon size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-soft" />}
        {node.kind !== 'default' && <span className="sr-only">{kindName[node.kind]}: </span>}
        <span className="min-w-0">{node.title}</span>
      </p>
      {node.detail && <p className="mt-0.5 text-xs leading-snug text-ink-soft break-words hyphens-auto">{node.detail}</p>}
    </div>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mb-4 text-sm font-medium text-ink">{children}</figcaption>
}

function FlowView({ flow }: { flow: FlowDiagram }) {
  // En pantallas medianas el flujo va en horizontal, como en un editor de nodos; con muchos pasos, en vertical
  const horizontal = flow.steps.length <= 5
  let order = 0
  return (
    <>
      {flow.caption && <Caption>{flow.caption}</Caption>}
      <ol className={`flex flex-col ${horizontal ? 'flow-h md:flex-row md:items-center' : ''}`}>
        {flow.steps.map((nodes, i) => (
          <li key={i} className={`flex flex-col ${horizontal ? 'md:min-w-0 md:flex-1 md:flex-row md:items-center' : ''}`}>
            {i > 0 && <span aria-hidden data-reveal style={reveal(order)} className="flow-link" />}
            {nodes.length === 1 ? (
              <NodeBox node={nodes[0]} index={order++} className={horizontal ? 'md:min-w-0 md:flex-1' : ''} />
            ) : (
              // Ramas paralelas del mismo paso
              <ul className={`grid gap-2 sm:grid-cols-2 ${horizontal ? 'md:flex md:min-w-0 md:flex-1 md:flex-col' : ''}`}>
                {nodes.map((node, j) => (
                  <li key={j}>
                    <NodeBox node={node} index={order++} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}

function MindmapView({ map }: { map: MindmapDiagram }) {
  let order = 1
  return (
    <>
      <figcaption className="mm-center-wrap">
        <span data-reveal style={reveal(0)} className="mm-center inline-block rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent">
          {map.center.title}
          {map.center.detail && <span className="block text-xs font-normal opacity-90">{map.center.detail}</span>}
        </span>
      </figcaption>
      <ul className="mm-branches">
        {map.branches.map((branch, i) => (
          <li key={i} data-reveal style={reveal(order++)} className="mm-branch">
            <div className={`h-full rounded-xl border p-3 ${kindStyle[branch.kind]}`}>
              <p className="text-sm font-medium leading-snug break-words hyphens-auto">{branch.title}</p>
              {branch.detail && <p className="mt-0.5 text-xs leading-snug text-ink-soft break-words hyphens-auto">{branch.detail}</p>}
              {branch.children.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {branch.children.map((child, j) => (
                    <li key={j} className="rounded-full bg-sage/20 px-2 py-0.5 text-xs text-ink">
                      {child.title}
                      {child.detail && <span className="text-ink-soft"> — {child.detail}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
