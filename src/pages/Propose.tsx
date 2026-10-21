import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowUpRight, CheckCircle2, Lightbulb, Loader2, MessageSquare, Send, ShieldAlert } from 'lucide-react'
import { site } from '../data/site'
import {
  buildEmail,
  cooldownLeft,
  emailjsReady,
  FORMS,
  HONEYPOT,
  N8N_OPTION,
  sendEmail,
  validate,
  type Field,
  type FieldError,
  type FormKind,
  type Values,
} from '../lib/contact-form'
import { useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TABS: { kind: FormKind; param: string; icon: typeof Lightbulb }[] = [
  { kind: 'propuesta', param: 'propuesta', icon: Lightbulb },
  { kind: 'conversacion', param: 'habla-conmigo', icon: MessageSquare },
]

const TEXT = {
  es: {
    title: 'Propón una idea',
    eyebrow: 'Hagamos crecer el jardín',
    intro:
      '¿Falta una guía, una ruta o un experimento que te habría ahorrado una tarde? Propónlo: puede convertirse en contenido nuevo de Moss. Y si prefieres conversar, escríbeme directamente.',
    tabsLabel: 'Tipo de mensaje',
    blurbs: { propuesta: 'Cuéntame qué falta y a quién le serviría.', conversacion: 'Escríbeme directamente, sin más preguntas.' },
    optional: '(opcional)',
    readPolicy: 'Leer la política',
    errors: {
      required: 'Este campo es obligatorio.',
      choose: 'Elige una opción.',
      consent: 'Necesito tu autorización para poder responderte.',
      email: 'Revisa el correo: debe tener la forma nombre@dominio.com.',
      invalidOption: 'Elige una de las opciones.',
    },
    tooLong: (n: number) => `Máximo ${n} caracteres.`,
    n8n: 'Los flujos de n8n tienen su propio formulario en Moss Nexus, con las preguntas que hacen falta para armar uno.',
    n8nLink: 'Proponer un flujo en Moss Nexus',
    newTab: ' (se abre en una pestaña nueva)',
    notReady: 'El envío todavía no está activo. Mientras tanto, escríbeme al correo que aparece en',
    notReadyLink: 'Protección de datos',
    requiredNote: 'Obligatorio',
    send: 'Enviar',
    sending: 'Enviando…',
    sendingStatus: 'Enviando tu mensaje…',
    errorStatus: 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo en un momento.',
    wait: (s: number) => `Acabas de enviar un mensaje. Espera ${s} segundos antes de enviar otro.`,
    fix: (n: number) => `Revisa ${n === 1 ? 'un campo marcado' : `${n} campos marcados`} antes de enviar.`,
    thanks: '¡Gracias! Tu mensaje llegó',
    reply: (email: string) => `Te responderé a ${email} en cuanto pueda.`,
    replyGeneric: 'Te responderé en cuanto pueda.',
    another: 'Enviar otro mensaje',
    honeypot: 'No llenes este campo',
    next: 'Qué pasa después',
    steps: [
      'Tu mensaje me llega por correo, con tus datos para responderte.',
      'Lo leo y te escribo, a veces con preguntas para entender mejor la idea.',
      'Si la idea le sirve a más personas y lo aceptaste, puede volverse una guía, una ruta o un experimento, sin tus datos.',
    ],
    noSecrets: 'No envíes contraseñas, tokens ni datos de otras personas.',
    noSecretsBody: 'Para entender la idea basta con describirla; si hace falta un ejemplo, usa datos inventados.',
    bug: '¿Encontraste un error en Moss? Es mejor reportarlo en',
    bugLink: 'GitHub Issues',
  },
  en: {
    title: 'Suggest an idea',
    eyebrow: 'Help the garden grow',
    intro:
      'Is there a guide, a route or an experiment that would have saved you an afternoon? Suggest it: it may become new content on Moss. And if you’d rather talk, write to me directly.',
    tabsLabel: 'Message type',
    blurbs: { propuesta: 'Tell me what’s missing and who it would help.', conversacion: 'Write to me directly, no more questions.' },
    optional: '(optional)',
    readPolicy: 'Read the policy',
    errors: {
      required: 'This field is required.',
      choose: 'Choose an option.',
      consent: 'I need your authorization to be able to reply.',
      email: 'Check the email: it should look like name@domain.com.',
      invalidOption: 'Choose one of the options.',
    },
    tooLong: (n: number) => `${n} characters maximum.`,
    n8n: 'n8n workflows have their own form on Moss Nexus, with the questions needed to build one.',
    n8nLink: 'Suggest a workflow on Moss Nexus',
    newTab: ' (opens in a new tab)',
    notReady: 'Sending isn’t active yet. In the meantime, write to the email shown on',
    notReadyLink: 'Data protection',
    requiredNote: 'Required',
    send: 'Send',
    sending: 'Sending…',
    sendingStatus: 'Sending your message…',
    errorStatus: 'It couldn’t be sent. Check your connection and try again in a moment.',
    wait: (s: number) => `You just sent a message. Wait ${s} seconds before sending another one.`,
    fix: (n: number) => `Check ${n === 1 ? 'the highlighted field' : `the ${n} highlighted fields`} before sending.`,
    thanks: 'Thank you! Your message arrived',
    reply: (email: string) => `I’ll reply to ${email} as soon as I can.`,
    replyGeneric: 'I’ll reply as soon as I can.',
    another: 'Send another message',
    honeypot: 'Don’t fill in this field',
    next: 'What happens next',
    steps: [
      'Your message reaches my inbox, with your details so I can reply.',
      'I read it and write back, sometimes with questions to understand the idea better.',
      'If the idea helps more people and you agreed, it can become a guide, a route or an experiment, without your data.',
    ],
    noSecrets: 'Don’t send passwords, tokens or other people’s data.',
    noSecretsBody: 'Describing the idea is enough; if an example helps, use made-up data.',
    bug: 'Found a bug in Moss? It’s better to report it on',
    bugLink: 'GitHub Issues',
  },
}

type T = (typeof TEXT)['es']

/** Último envío de esta visita: compartido entre las dos pestañas para que la espera no se salte cambiando de formulario */
let lastSent: number | null = null

const control =
  'w-full rounded-xl border border-ink-soft/70 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 sm:text-sm aria-[invalid=true]:border-danger'

function errorText(t: T, error: FieldError, field: Field) {
  return error === 'tooLong' ? t.tooLong(field.maxLength ?? 0) : t.errors[error]
}

function FieldControl({ field, error, formId, t }: { field: Field; error?: FieldError; formId: string; t: T }) {
  const lang = useLang()
  const id = `${formId}-${field.name}`
  const hintId = field.hint ? `${id}-ayuda` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const common = { id, name: field.name, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy }
  const label = (
    <>
      {field.label[lang]}
      {field.required ? <span className="text-danger"> *</span> : <span className="font-normal text-ink-soft"> {t.optional}</span>}
    </>
  )
  const help = (
    <>
      {field.hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-soft">
          {field.hint[lang]}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle size={14} aria-hidden /> {errorText(t, error, field)}
        </p>
      )}
    </>
  )

  if (field.type === 'checkbox') {
    return (
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
          <input {...common} type="checkbox" value="sí" className="mt-0.5 size-5 shrink-0 accent-accent" />
          <span>
            {field.label[lang]}
            {field.name === 'autorizacion' && (
              <>
                {' '}
                <Link to="/privacidad#formularios" className="font-medium text-sage-deep underline underline-offset-2">
                  {t.readPolicy}
                </Link>
              </>
            )}
            {field.required && <span className="text-danger"> *</span>}
          </span>
        </label>
        {help}
      </div>
    )
  }

  if (field.type === 'radio') {
    return (
      <fieldset aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
        <legend className="text-sm font-semibold text-ink">{label}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {field.options!.map((o, i) => (
            <label
              key={o.value}
              htmlFor={`${id}-${i}`}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-ink-soft/70 bg-surface/60 px-4 text-sm text-ink-soft hover:border-sage has-checked:border-accent has-checked:bg-accent/10 has-checked:text-ink"
            >
              <input id={`${id}-${i}`} type="radio" name={field.name} value={o.value} className="size-4 shrink-0 accent-accent" />
              {o.label[lang]}
            </label>
          ))}
        </div>
        {help}
      </fieldset>
    )
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="mt-2">
        {field.type === 'textarea' ? (
          <textarea {...common} rows={4} maxLength={field.maxLength} placeholder={field.placeholder?.[lang]} className={`${control} min-h-28 resize-y`} />
        ) : (
          <input
            {...common}
            type={field.type}
            maxLength={field.maxLength}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder?.[lang]}
            inputMode={field.type === 'email' ? 'email' : undefined}
            className={control}
          />
        )}
      </div>
      {help}
    </div>
  )
}

/** Lee el formulario según sus definiciones: las casillas sueltas como «sí» o vacío */
function readValues(form: HTMLFormElement, fields: Field[]): Values {
  const data = new FormData(form)
  const values: Values = { [HONEYPOT]: String(data.get(HONEYPOT) ?? '') }
  for (const f of fields) values[f.name] = String(data.get(f.name) ?? '')
  return values
}

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'wait'

function ContactForm({ kind, t }: { kind: FormKind; t: T }) {
  const lang = useLang()
  const { fields, title } = FORMS[kind]
  const formId = useId().replace(/:/g, '')
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [errors, setErrors] = useState<Record<string, FieldError>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [waitSeconds, setWaitSeconds] = useState(0)
  const [replyTo, setReplyTo] = useState('')
  const [proposal, setProposal] = useState('')
  const ready = emailjsReady()

  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus()
  }, [status])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const values = readValues(form, fields)
    // Un bot llenó el campo trampa: se le muestra éxito y no se envía nada
    if (values[HONEYPOT]) {
      setStatus('sent')
      return
    }
    const found = validate(kind, values)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setStatus('idle')
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (!ready) {
      setStatus('error')
      return
    }
    const left = cooldownLeft(lastSent)
    if (left > 0) {
      setWaitSeconds(Math.ceil(left / 1000))
      setStatus('wait')
      return
    }
    setStatus('sending')
    try {
      await sendEmail(buildEmail(kind, values))
      lastSent = Date.now()
      setReplyTo(values.correo)
      setStatus('sent')
      form.reset()
      setProposal('')
    } catch {
      setStatus('error')
    }
  }

  // Al corregir un campo, su error desaparece
  const onInput = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement
    if (target.name === 'propuesta') setProposal(target.value)
    if (errors[target.name]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== target.name)))
  }

  if (status === 'sent') {
    return (
      <div className="py-6 text-center" role="status">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent/15 text-sage-deep">
          <CheckCircle2 size={24} aria-hidden />
        </div>
        <h2 ref={doneRef} tabIndex={-1} className="mt-4 text-xl font-semibold">
          {t.thanks}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{replyTo ? t.reply(replyTo) : t.replyGeneric}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-sage/60 bg-surface/70 px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:border-sage-deep hover:text-sage-deep motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {t.another}
        </button>
      </div>
    )
  }

  const errorCount = Object.keys(errors).length
  return (
    <form noValidate onSubmit={onSubmit} onInput={onInput} onChange={onInput} aria-label={title[lang]} className="relative grid gap-6">
      {!ready && (
        <p className="flex items-start gap-2 rounded-xl border border-cream-deep bg-cream-deep/60 px-4 py-3 text-sm text-ink">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          <span>
            {t.notReady}{' '}
            <Link to="/proteccion-de-datos" className="font-medium text-sage-deep underline underline-offset-2">
              {t.notReadyLink}
            </Link>
            .
          </span>
        </p>
      )}
      {fields.map((f) => (
        <div key={f.name}>
          <FieldControl field={f} error={errors[f.name]} formId={formId} t={t} />
          {f.name === 'propuesta' && proposal === N8N_OPTION && (
            <p className="mt-3 rounded-xl border border-lavender/60 bg-lavender/20 px-4 py-3 text-sm text-ink">
              {t.n8n}{' '}
              <a
                href={`${site.nexusUrl}propon-un-flujo`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-sage-deep underline underline-offset-2"
              >
                {t.n8nLink} <ArrowUpRight size={14} aria-hidden />
                <span className="sr-only">{t.newTab}</span>
              </a>
            </p>
          )}
        </div>
      ))}
      {/* Campo trampa para bots: fuera de la vista, del teclado y de los lectores de pantalla */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={`${formId}-${HONEYPOT}`}>{t.honeypot}</label>
        <input id={`${formId}-${HONEYPOT}`} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 border-t border-cream-deep pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">
          <span className="text-danger">*</span> {t.requiredNote}
        </p>
        <button
          type="submit"
          aria-disabled={status === 'sending' || undefined}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-on-accent shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.97] aria-disabled:cursor-wait aria-disabled:opacity-80 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {status === 'sending' ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden /> : <Send size={16} aria-hidden />}
          {status === 'sending' ? t.sending : t.send}
        </button>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-ink empty:hidden">
        {status === 'sending'
          ? t.sendingStatus
          : status === 'error'
            ? t.errorStatus
            : status === 'wait'
              ? t.wait(waitSeconds)
              : errorCount
                ? t.fix(errorCount)
                : ''}
      </p>
    </form>
  )
}

export default function Propose() {
  const t = useT(TEXT)
  const lang = useLang()
  useDocumentTitle(t.title)
  const [params, setParams] = useSearchParams()
  const active = TABS.find((x) => x.param === params.get('formulario')) ?? TABS[0]
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const select = (i: number) => setParams(i === 0 ? {} : { formulario: TABS[i].param }, { replace: true, preventScrollReset: true })

  // Flechas izquierda y derecha entre pestañas, como pide el patrón de ARIA
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    select(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-wide text-sage-deep">{t.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">{t.intro}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div role="tablist" aria-label={t.tabsLabel} className="grid gap-3 sm:grid-cols-2">
            {TABS.map((tab, i) => {
              const selected = tab.kind === active.kind
              const Icon = tab.icon
              return (
                <button
                  key={tab.kind}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.param}`}
                  aria-selected={selected}
                  aria-controls={`panel-${tab.param}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-transform motion-reduce:transition-none ${
                    selected ? 'border-accent bg-accent/10' : 'border-surface/70 bg-surface/50 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'
                  }`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${selected ? 'bg-accent text-on-accent' : 'bg-sage/20 text-sage-deep'}`}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{FORMS[tab.kind].title[lang]}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">{t.blurbs[tab.kind]}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id={`panel-${active.param}`}
            role="tabpanel"
            aria-labelledby={`tab-${active.param}`}
            className="mt-4 rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur sm:p-8"
          >
            {/* key: al cambiar de pestaña, el formulario empieza limpio */}
            <ContactForm key={active.kind} kind={active.kind} t={t} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm">
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-soft">{t.next}</h2>
            <ol className="mt-4 space-y-4 text-sm text-ink-soft">
              {t.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sage/25 text-xs font-medium text-sage-deep">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-3 rounded-2xl border border-surface/70 bg-surface/50 p-5 text-sm text-ink-soft shadow-sm">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
            <p>
              <strong className="text-ink">{t.noSecrets}</strong> {t.noSecretsBody}
            </p>
          </div>
          <p className="px-1 text-xs text-ink-soft">
            {t.bug}{' '}
            <a href={`${site.repoUrl}/issues`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-sage-deep">
              {t.bugLink}
              <span className="sr-only">{t.newTab}</span>
            </a>
            .
          </p>
        </aside>
      </div>
    </section>
  )
}
