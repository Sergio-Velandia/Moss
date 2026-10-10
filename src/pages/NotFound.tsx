import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Página no encontrada')
  return (
    <section className="py-10 text-center">
      <p className="text-5xl" aria-hidden>
        🌿
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Esta página no está en el jardín</h1>
      <p className="mt-3 text-ink-soft">Puede que el enlace haya cambiado o que todavía no se haya plantado.</p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link to="/" className="inline-flex min-h-11 items-center text-sage-deep underline">
          Ir al inicio
        </Link>
        <Link to="/herbario" className="inline-flex min-h-11 items-center text-sage-deep underline">
          Buscar en el Herbario
        </Link>
      </div>
    </section>
  )
}
