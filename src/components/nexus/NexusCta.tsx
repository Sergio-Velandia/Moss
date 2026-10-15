import { ArrowUpRight } from 'lucide-react'
import { site } from '../../data/site'
import { useLang, useT } from '../../lib/i18n'
import { NexusMark } from './NexusMark'

const TEXT = {
  es: {
    eyebrow: 'Siguiente paso',
    title: 'Ya sabes cómo funciona. Ahora úsalo.',
    body: 'En Moss Nexus hay flujos de n8n ya armados y explicados paso a paso: los copias, los pegas en n8n, conectas tus cuentas y los ajustas a tu caso.',
    cta: 'Explorar Moss Nexus',
    newTab: ' (se abre en una pestaña nueva)',
    note: 'Proyecto independiente, sin relación oficial con n8n GmbH.',
  },
  en: {
    eyebrow: 'Next step',
    title: 'You know how it works. Now use it.',
    body: 'Moss Nexus has ready-made n8n workflows explained step by step: copy them, paste them into n8n, connect your accounts and adapt them to your case.',
    cta: 'Explore Moss Nexus',
    newTab: ' (opens in a new tab)',
    note: 'Independent project, not officially affiliated with n8n GmbH.',
  },
}

/** Cierre de una ruta: invita a Moss Nexus con su propio estilo (tokens .nexus). Enlaza al sitio, no a plantillas. */
export default function NexusCta() {
  const lang = useLang()
  const t = useT(TEXT)
  return (
    <aside lang={lang} aria-labelledby="nexus-cta" className="nexus pt-nexus mt-10 overflow-hidden rounded-3xl border border-nx-line-strong bg-nx-bg text-nx-ink shadow-sm">
      <div className="nx-dot-grid relative p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <NexusMark size={52} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nx-moss">{t.eyebrow}</p>
            <h2 id="nexus-cta" className="mt-1 text-xl font-semibold tracking-tight">
              {t.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-nx-ink-soft">{t.body}</p>
          </div>
        </div>
        <a
          href={site.nexusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pt-btn mt-6 inline-flex min-h-11 items-center gap-2 px-5 text-sm font-semibold"
        >
          {t.cta} <ArrowUpRight size={16} aria-hidden />
          <span className="sr-only">{t.newTab}</span>
        </a>
        <p className="mt-4 text-xs text-nx-ink-soft">{t.note}</p>
      </div>
    </aside>
  )
}
