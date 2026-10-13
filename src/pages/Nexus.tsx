import { motion } from 'motion/react'
import { ArrowUpRight, BookOpenText, Check, ClipboardPaste, Compass, Sprout, Workflow, X } from 'lucide-react'
// Las fuentes de Nexus se cargan solo en esta página. Registran "Inter Variable" y "JetBrains Mono Variable",
// nombres que el resto de Moss no usa, así que su tipografía no cambia.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import { NexusMark } from '../components/nexus/NexusMark'
import { site } from '../data/site'
import { useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    eyebrow: 'Sitio hermano de Moss',
    title: 'Flujos de n8n',
    titleAccent: 'listos para copiar',
    intro:
      'Moss Nexus es una librería de automatizaciones para n8n ya armadas, explicadas paso a paso y listas para pegar. Es para personas y equipos que saben qué quieren automatizar, pero no quieren empezar desde cero.',
    cta: 'Ir a Moss Nexus',
    newTab: ' (se abre en una pestaña nueva)',
    split: 'En Moss aprendes el porqué. En Nexus copias el flujo y lo usas.',
    problemEyebrow: 'El problema',
    problemTitle: 'Sabes el resultado.',
    problemTitleSoft: 'Lo difícil es el camino.',
    problemIntro:
      'Mucha gente se paraliza antes de terminar su primer flujo. No por falta de ideas, sino por todo lo técnico que hay en medio.',
    painsTitle: 'Sin Nexus, empiezas aquí',
    pains: ['Webhooks', 'JSON', 'Tokens y OAuth', 'Expresiones', 'Credenciales', 'Manejo de errores'],
    painsLabel: 'Conceptos técnicos que frenan',
    painsNote: 'Horas de tutoriales y pruebas a ciegas para algo que parecía sencillo.',
    gainsTitle: 'Con Nexus, empiezas con',
    gains: [
      'El flujo completo, ya conectado',
      'Qué hace cada paso, en palabras claras',
      'Qué cuentas necesitas antes de empezar',
      'Pasos numerados hasta tenerlo funcionando',
    ],
    howEyebrow: 'Cómo funciona',
    howTitle: 'Tres pasos',
    steps: [
      ['Explora', 'Busca por lo que quieres lograr o por la herramienta que ya usas: Gmail, Sheets, Slack…'],
      ['Entiende', 'Mira el mapa del flujo, para qué sirve cada paso y qué necesitas antes de empezar.'],
      ['Copia y pega', 'Un clic copia el flujo. Lo pegas en n8n, conectas tus credenciales y lo ajustas a tu caso.'],
    ] as [string, string][],
    ecoTitle: 'Aprende en Moss.',
    ecoAccent: 'Automatiza en Nexus.',
    ecoText:
      'Moss documenta el porqué: webhooks, APIs, errores y decisiones. Nexus convierte ese conocimiento en flujos que copias y usas hoy.',
    mossNode: 'Guías, manual y bitácora',
    nexusNode: 'Flujos listos para copiar',
    spanish: '',
    disclaimer: 'Proyecto independiente, sin relación oficial con n8n GmbH.',
  },
  en: {
    eyebrow: 'Moss’s sister site',
    title: 'n8n workflows',
    titleAccent: 'ready to copy',
    intro:
      'Moss Nexus is a library of n8n automations that are already built, explained step by step and ready to paste. It’s for people and teams who know what they want to automate but don’t want to start from scratch.',
    cta: 'Go to Moss Nexus',
    newTab: ' (opens in a new tab)',
    split: 'In Moss you learn the why. In Nexus you copy the workflow and use it.',
    problemEyebrow: 'The problem',
    problemTitle: 'You know the outcome.',
    problemTitleSoft: 'The path is the hard part.',
    problemIntro:
      'Many people stall before finishing their first workflow. Not for lack of ideas, but because of everything technical in between.',
    painsTitle: 'Without Nexus, you start here',
    pains: ['Webhooks', 'JSON', 'Tokens and OAuth', 'Expressions', 'Credentials', 'Error handling'],
    painsLabel: 'Technical concepts that slow you down',
    painsNote: 'Hours of tutorials and blind trial and error for something that looked simple.',
    gainsTitle: 'With Nexus, you start with',
    gains: [
      'The complete workflow, already connected',
      'What each step does, in plain words',
      'Which accounts you need before you begin',
      'Numbered steps until it works',
    ],
    howEyebrow: 'How it works',
    howTitle: 'Three steps',
    steps: [
      ['Explore', 'Search by what you want to achieve or by the tool you already use: Gmail, Sheets, Slack…'],
      ['Understand', 'See the workflow map, what each step is for and what you need before you start.'],
      ['Copy and paste', 'One click copies the workflow. Paste it into n8n, connect your credentials and adapt it to your case.'],
    ] as [string, string][],
    ecoTitle: 'Learn in Moss.',
    ecoAccent: 'Automate in Nexus.',
    ecoText:
      'Moss documents the why: webhooks, APIs, errors and decisions. Nexus turns that knowledge into workflows you copy and use today.',
    mossNode: 'Guides, manual and journal',
    nexusNode: 'Ready-to-copy workflows',
    spanish: 'Moss Nexus is in Spanish.',
    disclaimer: 'Independent project, not officially affiliated with n8n GmbH.',
  },
}

const stepIcons = [Compass, BookOpenText, ClipboardPaste]
const stepColors = ['var(--nx-moss)', 'var(--nx-amber)', 'var(--nx-coral)']

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 140, damping: 20, delay },
}) as const

function NexusLink({ label, newTab, className = '' }: { label: string; newTab: string; className?: string }) {
  return (
    <a
      href={site.nexusUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-nx-coral px-5 text-sm font-semibold text-nx-on-accent shadow-[0_8px_30px_-8px_var(--nx-coral)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] ${className}`}
    >
      {label} <ArrowUpRight size={16} aria-hidden />
      <span className="sr-only">{newTab}</span>
    </a>
  )
}

function Eyebrow({ children }: { children: string }) {
  return <p className="font-nexus-mono text-xs font-medium uppercase tracking-[0.18em] text-nx-moss">{children}</p>
}

export default function Nexus() {
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle('Moss Nexus')

  return (
    <div className="nexus relative overflow-hidden rounded-[2rem] bg-nx-bg font-nexus text-nx-ink">
      {/* Resplandores musgo y coral, como el fondo de Nexus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40rem 22rem at 0% -5%, var(--nx-glow-moss), transparent 70%), radial-gradient(36rem 20rem at 100% 0%, var(--nx-glow-coral), transparent 70%)',
        }}
      />

      {/* ——— Hero: el único momento animado de la página ——— */}
      <section aria-labelledby="nexus-title" className="relative px-5 pb-14 pt-12 text-center sm:px-10 sm:pt-16">
        <div aria-hidden className="nx-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="relative mx-auto max-w-3xl">
          <motion.p {...enter(0)} className="nx-glass mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-nx-ink-soft">
            <Sprout size={14} className="text-nx-moss" aria-hidden /> {t.eyebrow}
          </motion.p>

          <motion.div {...enter(0.04)} className="mt-6 flex justify-center">
            <NexusMark size={56} />
          </motion.div>

          <motion.h1
            {...enter(0.08)}
            id="nexus-title"
            className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]"
          >
            {t.title} <span className="nx-text-gradient">{t.titleAccent}</span>
          </motion.h1>

          <motion.p {...enter(0.12)} className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-nx-ink-soft">
            {t.intro}
          </motion.p>

          <motion.div {...enter(0.16)} className="mt-8 flex flex-col items-center gap-3">
            <NexusLink label={t.cta} newTab={t.newTab} />
            <p className="text-sm text-nx-ink-soft">
              {t.split}
              {t.spanish && <span className="block text-xs">{t.spanish}</span>}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ——— El problema ——— */}
      <section aria-labelledby="nexus-problem" className="relative px-5 py-12 sm:px-10">
        <Eyebrow>{t.problemEyebrow}</Eyebrow>
        <h2 id="nexus-problem" className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {t.problemTitle} <span className="text-nx-ink-soft">{t.problemTitleSoft}</span>
        </h2>
        <p className="mt-3 max-w-2xl text-nx-ink-soft">{t.problemIntro}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="nx-glass rounded-3xl p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold text-nx-ink-soft">
              <span className="grid size-6 place-items-center rounded-md bg-nx-coral/15 text-nx-coral">
                <X size={14} aria-hidden />
              </span>
              {t.painsTitle}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.painsLabel}>
              {t.pains.map((p, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-dashed border-nx-line-strong px-3 py-1.5 font-nexus-mono text-xs text-nx-ink-soft"
                  // Inclinación fija y pequeña: transmite desorden sin animar nada
                  style={{ transform: `rotate(${((i * 37) % 7) - 3}deg)` }}
                >
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-nx-ink-soft">{t.painsNote}</p>
          </div>

          <div className="rounded-3xl border border-nx-moss/25 bg-nx-moss/[0.07] p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold text-nx-moss">
              <span className="grid size-6 place-items-center rounded-md bg-nx-moss/20">
                <Check size={14} aria-hidden />
              </span>
              {t.gainsTitle}
            </p>
            <ul className="mt-6 space-y-3">
              {t.gains.map((g, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-nx-moss" aria-hidden />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ——— Cómo funciona ——— */}
      <section aria-labelledby="nexus-how" className="relative px-5 py-12 text-center sm:px-10">
        <Eyebrow>{t.howEyebrow}</Eyebrow>
        <h2 id="nexus-how" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.howTitle}
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {t.steps.map(([title, text], i) => {
            const Icon = stepIcons[i]
            const color = stepColors[i]
            return (
              <li key={i} className="nx-glass relative rounded-3xl p-6">
                <span
                  className="relative mx-auto grid size-[4.5rem] place-items-center rounded-2xl border border-nx-line bg-nx-surface"
                  style={{ boxShadow: `0 12px 30px -12px ${color}` }}
                >
                  <Icon size={28} style={{ color }} aria-hidden />
                  <span
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full font-nexus-mono text-xs font-bold text-nx-on-accent"
                    style={{ background: color }}
                  >
                    {i + 1}
                  </span>
                </span>
                {/* Conexión con el paso siguiente, como una arista del flujo */}
                {i < stepColors.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-6 top-[3.75rem] hidden h-0.5 w-6 md:block"
                    style={{ background: `linear-gradient(90deg, ${color}, ${stepColors[i + 1]})` }}
                  />
                )}
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-nx-ink-soft">{text}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {/* ——— Moss + Nexus y llamada final ——— */}
      <section aria-labelledby="nexus-eco" className="relative px-5 pb-10 pt-12 sm:px-10">
        <div className="nx-glass relative overflow-hidden rounded-[1.75rem] px-6 py-10 sm:px-10">
          <div aria-hidden className="nx-dot-grid absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 id="nexus-eco" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {t.ecoTitle} <span className="nx-text-gradient">{t.ecoAccent}</span>
              </h2>
              <p className="mt-4 max-w-lg text-nx-ink-soft">{t.ecoText}</p>
              <NexusLink label={t.cta} newTab={t.newTab} className="mt-7" />
            </div>

            {/* Dos nodos del ecosistema conectados */}
            <div aria-hidden className="mx-auto flex w-full max-w-xs flex-col">
              <div className="nx-glass flex items-center gap-4 rounded-2xl p-4">
                <span className="grid size-12 place-items-center rounded-xl bg-nx-moss/15 text-nx-moss">
                  <Sprout size={22} />
                </span>
                <span>
                  <span className="block font-semibold">Moss</span>
                  <span className="block text-sm text-nx-ink-soft">{t.mossNode}</span>
                </span>
              </div>
              <span className="mx-auto h-10 w-0.5 bg-gradient-to-b from-nx-moss to-nx-coral" />
              <div className="nx-glass flex items-center gap-4 rounded-2xl border-nx-coral/40 p-4">
                <span className="grid size-12 place-items-center rounded-xl bg-nx-coral/15 text-nx-coral">
                  <Workflow size={22} />
                </span>
                <span>
                  <span className="block font-semibold">Nexus</span>
                  <span className="block text-sm text-nx-ink-soft">{t.nexusNode}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-nx-ink-soft" lang={lang}>
          {t.disclaimer}
        </p>
      </section>
    </div>
  )
}
