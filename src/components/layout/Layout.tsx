import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Sprout } from 'lucide-react'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/laboratorio', label: 'Laboratorio' },
  { to: '/manual', label: 'Manual' },
  { to: '/bitacora', label: 'Bitácora' },
  { to: '/herbario', label: 'Herbario' },
]

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4">
      <header className="sticky top-3 z-10 mt-3 flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-4 py-3 shadow-sm backdrop-blur-md">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-sage-deep">
          <Sprout size={20} aria-hidden />
          Moss
        </NavLink>
        <nav aria-label="Principal" className="flex gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-xl px-3 py-1.5 transition-colors hover:bg-sage/20 ${
                  isActive ? 'bg-sage/30 text-sage-deep' : 'text-ink-soft'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 py-10">
        <Suspense fallback={<p className="text-sm text-ink-soft">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-xs text-ink-soft">
        Moss — Digital Garden · conocimiento que crece contigo
      </footer>
    </div>
  )
}
