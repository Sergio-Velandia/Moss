import { site } from '../data/site'
import type { Lang } from './i18n'

/**
 * Formularios de «Propón una idea»: definición de campos, validación, armado del correo y envío por EmailJS.
 * La página los dibuja a partir de estas definiciones, así validación e interfaz no se desalinean.
 * Las etiquetas van en los dos idiomas de la interfaz; el correo que llega se arma siempre en español.
 * El correo de destino no está en el código: se configura en la plantilla de EmailJS.
 */

export type FormKind = 'propuesta' | 'conversacion'
export type Text = Record<Lang, string>

export interface Option {
  /** Lo que llega en el correo (en español) */
  value: string
  label: Text
}

export interface Field {
  name: string
  label: Text
  type: 'text' | 'email' | 'textarea' | 'radio' | 'checkbox'
  required?: boolean
  hint?: Text
  placeholder?: Text
  options?: Option[]
  autoComplete?: string
  maxLength?: number
}

export type Values = Record<string, string>

const TEXTO = 120
const PARRAFO = 2000

/** Campo trampa: invisible para las personas. Si llega con texto, lo llenó un bot y no se envía nada. */
export const HONEYPOT = 'sitio_web'

/** Valor de la opción que lleva al formulario de Moss Nexus */
export const N8N_OPTION = 'Un flujo de n8n'

/** Espera mínima entre dos envíos desde la misma visita, para frenar envíos repetidos */
export const COOLDOWN_MS = 60_000

const contacto: Field[] = [
  { name: 'nombre', label: { es: 'Tu nombre', en: 'Your name' }, type: 'text', required: true, autoComplete: 'name', maxLength: TEXTO },
  {
    name: 'correo',
    label: { es: 'Tu correo', en: 'Your email' },
    type: 'email',
    required: true,
    autoComplete: 'email',
    maxLength: TEXTO,
    hint: { es: 'Solo para responderte.', en: 'Only to reply to you.' },
  },
]

const autorizacion: Field = {
  name: 'autorizacion',
  label: {
    es: 'Autorizo el tratamiento de mis datos para que me respondan, según la política de privacidad.',
    en: 'I authorize the processing of my data so I can get a reply, according to the privacy policy.',
  },
  type: 'checkbox',
  required: true,
}

export const FORMS: Record<FormKind, { title: Text; fields: Field[] }> = {
  propuesta: {
    title: { es: 'Propón una idea', en: 'Suggest an idea' },
    fields: [
      ...contacto,
      {
        name: 'propuesta',
        label: { es: '¿Qué propones?', en: 'What are you suggesting?' },
        type: 'radio',
        required: true,
        options: [
          { value: 'Una guía para el Manual', label: { es: 'Una guía para el Manual', en: 'A guide for the Manual' } },
          { value: 'Una ruta de aprendizaje', label: { es: 'Una ruta de aprendizaje', en: 'A learning route' } },
          { value: 'Un experimento para el Laboratorio', label: { es: 'Un experimento para el Laboratorio', en: 'An experiment for the Lab' } },
          { value: N8N_OPTION, label: { es: 'Un flujo de n8n', en: 'An n8n workflow' } },
          { value: 'Otra cosa', label: { es: 'Otra cosa', en: 'Something else' } },
        ],
      },
      {
        name: 'tema',
        label: { es: 'El tema', en: 'The topic' },
        type: 'text',
        required: true,
        maxLength: TEXTO,
        placeholder: { es: 'Ejemplo: cómo probar un formulario de React', en: 'Example: how to test a React form' },
      },
      {
        name: 'problema',
        label: { es: '¿Qué problema o duda resolvería?', en: 'What problem or question would it solve?' },
        type: 'textarea',
        required: true,
        maxLength: PARRAFO,
        hint: {
          es: 'Cuéntame qué te costó entender o qué no encontraste explicado en ningún lado.',
          en: 'Tell me what was hard to understand or what you couldn’t find explained anywhere.',
        },
      },
      {
        name: 'contexto',
        label: { es: 'Contexto', en: 'Context' },
        type: 'textarea',
        maxLength: PARRAFO,
        hint: { es: 'Tu nivel o para quién sería: alguien que empieza, alguien con experiencia…', en: 'Your level or who it would be for: a beginner, someone experienced…' },
      },
      {
        name: 'negocio',
        label: { es: 'Negocio o proyecto', en: 'Business or project' },
        type: 'text',
        maxLength: TEXTO,
        autoComplete: 'organization',
        hint: { es: 'Si es para algo concreto. Si no, déjalo vacío.', en: 'If it’s for something specific. Otherwise, leave it empty.' },
      },
      {
        name: 'publicar',
        label: {
          es: 'Si la idea le sirve a más personas, acepto que se publique en Moss, sin mis datos ni los de mi negocio.',
          en: 'If the idea helps more people, I agree it can be published on Moss, without my data or my business’s.',
        },
        type: 'checkbox',
      },
      autorizacion,
    ],
  },
  conversacion: {
    title: { es: 'Habla conmigo', en: 'Talk to me' },
    fields: [
      ...contacto,
      { name: 'asunto', label: { es: 'Asunto', en: 'Subject' }, type: 'text', maxLength: TEXTO },
      { name: 'mensaje', label: { es: 'Mensaje', en: 'Message' }, type: 'textarea', required: true, maxLength: PARRAFO },
      autorizacion,
    ],
  },
}

/** Motivo por el que un campo no es válido; la página lo traduce */
export type FieldError = 'required' | 'choose' | 'consent' | 'email' | 'tooLong' | 'invalidOption'

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const texto = (v: string | undefined) => (v ?? '').trim()

/** Devuelve el motivo de error de cada campo inválido, en el orden del formulario */
export function validate(kind: FormKind, values: Values): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {}
  for (const f of FORMS[kind].fields) {
    const v = texto(values[f.name])
    if (f.required && !v) {
      errors[f.name] = f.type === 'checkbox' ? 'consent' : f.type === 'radio' ? 'choose' : 'required'
    } else if (f.type === 'email' && v && !CORREO.test(v)) {
      errors[f.name] = 'email'
    } else if (f.maxLength && v.length > f.maxLength) {
      errors[f.name] = 'tooLong'
    } else if (f.options && v && !f.options.some((o) => o.value === v)) {
      errors[f.name] = 'invalidOption'
    }
  }
  return errors
}

export interface EmailParams {
  tipo: string
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

/** Convierte las respuestas en un correo de texto en español: una línea o un bloque por campo respondido */
export function buildEmail(kind: FormKind, values: Values): EmailParams {
  const { title, fields } = FORMS[kind]
  const nombre = texto(values.nombre)
  const lineas: string[] = []
  for (const f of fields) {
    if (f.name === 'autorizacion') continue
    const v = texto(values[f.name])
    if (f.type === 'checkbox') {
      lineas.push(`${f.name === 'publicar' ? 'Acepta que se publique en Moss' : f.label.es}: ${v ? 'sí' : 'no'}`)
    } else if (v) {
      lineas.push(f.type === 'textarea' ? `${f.label.es}\n${v}\n` : `${f.label.es}: ${v}`)
    }
  }
  lineas.push('', 'Autorizó el tratamiento de sus datos para recibir respuesta.')
  const asunto =
    kind === 'propuesta'
      ? `[Moss] Propuesta de ${nombre}: ${texto(values.tema)}`
      : `[Moss] ${texto(values.asunto) || `Mensaje de ${nombre}`}`
  return { tipo: title.es, nombre, correo: texto(values.correo), asunto, mensaje: lineas.join('\n').trim() }
}

export const emailjsReady = () => Boolean(site.emailjs.serviceId && site.emailjs.templateId && site.emailjs.publicKey)

/** Milisegundos que faltan para poder enviar de nuevo (0 si ya se puede) */
export const cooldownLeft = (lastSent: number | null, now = Date.now()) =>
  lastSent === null ? 0 : Math.max(0, lastSent + COOLDOWN_MS - now)

/** Envía el correo con la API REST de EmailJS (sin su SDK, para no sumar dependencias) */
export async function sendEmail(params: EmailParams, fetchImpl: typeof fetch = fetch): Promise<void> {
  const { serviceId, templateId, publicKey } = site.emailjs
  const res = await fetchImpl('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: params }),
  })
  if (!res.ok) throw new Error(`EmailJS respondió ${res.status}`)
}
