import { Link } from 'react-router-dom'
import { useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    docTitle: 'Página no encontrada',
    title: 'Esta página no está en el jardín',
    body: 'Puede que el enlace haya cambiado o que todavía no se haya plantado.',
    home: 'Ir al inicio',
    search: 'Buscar en el Herbario',
  },
  en: {
    docTitle: 'Page not found',
    title: 'This page isn’t in the garden',
    body: 'The link may have changed, or it hasn’t been planted yet.',
    home: 'Go home',
    search: 'Search the Herbarium',
  },
}

export default function NotFound() {
  const t = useT(TEXT)
  useDocumentTitle(t.docTitle)
  return (
    <section className="py-10 text-center">
      <p className="text-5xl" aria-hidden>
        🌿
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-ink-soft">{t.body}</p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link to="/" className="inline-flex min-h-11 items-center text-sage-deep underline">
          {t.home}
        </Link>
        <Link to="/herbario" className="inline-flex min-h-11 items-center text-sage-deep underline">
          {t.search}
        </Link>
      </div>
    </section>
  )
}
