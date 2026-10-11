import { setLang, useLang, type Lang } from '../../lib/i18n'

const options: { lang: Lang; label: string; name: string }[] = [
  { lang: 'es', label: 'ES', name: 'Español' },
  { lang: 'en', label: 'EN', name: 'English' },
]

/** Dos botones con el idioma actual marcado: se ve de un vistazo en qué idioma estás. */
export default function LanguageToggle() {
  const lang = useLang()
  return (
    <div role="group" aria-label={lang === 'es' ? 'Idioma' : 'Language'} className="flex rounded-xl bg-cream-deep/70 p-0.5 text-xs font-medium">
      {options.map((o) => (
        <button
          key={o.lang}
          type="button"
          lang={o.lang}
          aria-pressed={lang === o.lang}
          aria-label={o.name}
          title={o.name}
          onClick={() => setLang(o.lang)}
          className={`inline-flex h-8 min-w-9 pointer-coarse:h-10 pointer-coarse:min-w-11 items-center justify-center rounded-[10px] px-2 transition-colors ${
            lang === o.lang ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
