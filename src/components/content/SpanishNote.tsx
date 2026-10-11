import { Languages } from 'lucide-react'
import { spanishContentNote, useLang } from '../../lib/i18n'

/** En inglés, avisa de que el contenido de la página está escrito en español. */
export default function SpanishNote() {
  if (useLang() !== 'en') return null
  return (
    <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-lavender/30 px-2.5 py-1 text-xs text-lavender-deep">
      <Languages size={14} aria-hidden /> {spanishContentNote}
    </p>
  )
}
