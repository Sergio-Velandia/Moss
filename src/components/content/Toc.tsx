import { useEffect, useRef, useState } from 'react'
import type { Heading } from '../../lib/content'
import { useLang } from '../../lib/i18n'

// Una sección cuenta como «actual» cuando su título pasa bajo la cabecera fija
const ACTIVE_OFFSET = 120

export default function Toc({ headings }: { headings: Heading[] }) {
  const en = useLang() === 'en'
  const [active, setActive] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = null
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = h.id
        else if (el) break
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [headings])

  // En escritorio el índice es más bajo que la pantalla y tiene su propio scroll:
  // lleva el enlace actual a la vista sin mover la página
  useEffect(() => {
    const nav = listRef.current?.parentElement
    const link = active ? listRef.current?.querySelector<HTMLElement>(`[data-toc="${CSS.escape(active)}"]`) : null
    if (!nav || !link || nav.scrollHeight <= nav.clientHeight) return
    // El nav es relative: offsetTop del enlace ya se mide desde su borde superior
    const top = link.offsetTop
    if (top < nav.scrollTop + 24 || top + link.offsetHeight > nav.scrollTop + nav.clientHeight - 24) {
      nav.scrollTop = top - nav.clientHeight / 2 + link.offsetHeight / 2
    }
  }, [active])

  if (headings.length < 3) return null
  return (
    <nav
      aria-label={en ? 'Table of contents' : 'Tabla de contenido'}
      className="relative text-sm lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{en ? 'On this page' : 'En esta página'}</p>
      <ul ref={listRef} className="mt-2 border-l border-cream-deep" lang="es">
        {headings.map((h) => {
          const current = h.id === active
          return (
            <li key={h.id} className={h.level === 3 ? 'pl-6' : 'pl-3'}>
              <a
                href={`#${h.id}`}
                data-toc={h.id}
                aria-current={current ? 'location' : undefined}
                className={`inline-block py-1 transition hover:text-sage-deep ${current ? 'font-medium text-sage-deep' : 'text-ink-soft'}`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
