import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Menu, Sprout, X } from 'lucide-react'
import { site } from '../../data/site'
import { sectionNames, useLang, useT } from '../../lib/i18n'
import { legalLinks } from '../../lib/legal'
import NexusNavLink from '../nexus/NexusNavLink'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'

const TEXT = {
  es: {
    home: 'Inicio',
    skip: 'Saltar al contenido',
    nav: 'Principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    loading: 'Cargando…',
    tagline: 'Moss — Digital Garden · conocimiento que crece contigo',
    legal: 'Información legal',
    code: 'Código en GitHub',
    portfolio: 'Mi portafolio',
    newTab: ' (se abre en una pestaña nueva)',
    legalTitles: {} as Record<string, string>,
  },
  en: {
    home: 'Home',
    skip: 'Skip to content',
    nav: 'Main',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    loading: 'Loading…',
    tagline: 'Moss — Digital Garden · knowledge that grows with you',
    legal: 'Legal information',
    code: 'Code on GitHub',
    portfolio: 'My portfolio',
    newTab: ' (opens in a new tab)',
    // Los textos legales están en español; en inglés solo se traduce el nombre del enlace
    legalTitles: { terminos: 'Terms and conditions', privacidad: 'Privacy policy', 'proteccion-de-datos': 'Data protection' } as Record<string, string>,
  },
}

export default function Layout() {
  const lang = useLang()
  const t = useT(TEXT)
  const sections = sectionNames[lang]
  const links = [
    { to: '/', label: t.home, end: true },
    { to: '/laboratorio', label: sections.lab },
    { to: '/manual', label: sections.manual },
    { to: '/bitacora', label: sections.journal },
    { to: '/herbario', label: sections.herbario },
    { to: '/proyectos', label: sections.project },
  ]
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Al cambiar de página: volver arriba y mover el foco al contenido (lectores de pantalla y teclado)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setMenuOpen(false)
    if (!window.location.hash) {
      window.scrollTo(0, 0)
      mainRef.current?.focus({ preventScroll: true })
    }
  }, [pathname])

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuBtnRef.current?.focus() // devolvemos el foco al botón que abrió el menú
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3 py-1.5 transition-colors hover:bg-sage/20 ${isActive ? 'bg-sage/30 text-sage-deep' : 'text-ink-soft'}`

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t.skip}
      </a>

      <header className="sticky top-3 z-20 mt-3 rounded-2xl border border-surface/60 bg-surface/70 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-1">
          <NavLink to="/" className="flex min-h-11 items-center gap-2 font-semibold text-sage-deep">
            <Sprout size={20} aria-hidden />
            Moss
          </NavLink>

          <div className="flex items-center gap-1">
            <nav aria-label={t.nav} className="hidden items-center gap-1 text-sm lg:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
              <NexusNavLink variant="header" />
            </nav>
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              ref={menuBtnRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? t.closeMenu : t.openMenu}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition hover:bg-sage/20 hover:text-ink lg:hidden"
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-movil" aria-label={t.nav} className="flex flex-col gap-1 border-t border-cream-deep p-2 text-base lg:hidden">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className={(s) => `${linkClass(s)} py-2.5`}
              >
                {l.label}
              </NavLink>
            ))}
            <NexusNavLink variant="menu" onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>

      <main id="contenido" ref={mainRef} tabIndex={-1} className="flex-1 break-words py-10 outline-none">
        <Suspense fallback={<p className="text-sm text-ink-soft">{t.loading}</p>}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>

      <footer className="border-t border-cream-deep py-6 text-xs text-ink-soft">
        <p className="text-center">{t.tagline}</p>
        <nav aria-label={t.legal} className="mt-2 flex flex-wrap justify-center gap-x-4">
          {legalLinks.map((p) => (
            <Link key={p.slug} to={p.route} className="inline-block py-1.5 underline-offset-2 hover:text-sage-deep hover:underline">
              {t.legalTitles[p.slug] ?? p.title}
            </Link>
          ))}
          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block py-1.5 underline-offset-2 hover:text-sage-deep hover:underline"
          >
            {t.code}<span className="sr-only">{t.newTab}</span>
          </a>
          <a
            href={site.portfolioUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block py-1.5 underline-offset-2 hover:text-sage-deep hover:underline"
          >
            {t.portfolio}<span className="sr-only">{t.newTab}</span>
          </a>
        </nav>
      </footer>
    </div>
  )
}
