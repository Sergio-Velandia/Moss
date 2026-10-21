import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { site } from '../data/site'
import Propose from '../pages/Propose'
import { COOLDOWN_MS, buildEmail, cooldownLeft, emailjsReady, FORMS, N8N_OPTION, sendEmail, validate, type Values } from './contact-form'
import { getLegalPage } from './legal'

const propuesta: Values = {
  nombre: 'Ana Prueba',
  correo: 'ana@example.com',
  propuesta: 'Una guía para el Manual',
  tema: 'Probar formularios de React',
  problema: 'No sé cómo probar la validación sin un navegador.',
  contexto: '',
  negocio: '',
  publicar: 'sí',
  autorizacion: 'sí',
}

const render = (url: string) => renderToString(createElement(MemoryRouter, { initialEntries: [url] }, createElement(Propose)))

describe('validación', () => {
  it('acepta una propuesta completa', () => {
    expect(validate('propuesta', propuesta)).toEqual({})
  })

  it('marca obligatorios, la opción y la autorización con su motivo, en orden', () => {
    const errors = validate('propuesta', { correo: 'no-es-un-correo' })
    expect(Object.keys(errors)).toEqual(['nombre', 'correo', 'propuesta', 'tema', 'problema', 'autorizacion'])
    expect(errors).toMatchObject({ nombre: 'required', correo: 'email', propuesta: 'choose', autorizacion: 'consent' })
  })

  it('rechaza opciones que no existen y textos demasiado largos', () => {
    expect(validate('propuesta', { ...propuesta, propuesta: 'Algo inventado' }).propuesta).toBe('invalidOption')
    expect(validate('conversacion', { nombre: 'A', correo: 'a@b.co', mensaje: 'x'.repeat(2001), autorizacion: 'sí' }).mensaje).toBe('tooLong')
  })

  it('ofrece la opción de n8n que lleva a Moss Nexus', () => {
    expect(FORMS.propuesta.fields.find((f) => f.name === 'propuesta')?.options?.map((o) => o.value)).toContain(N8N_OPTION)
  })

  it('todas las etiquetas, ayudas y opciones están en los dos idiomas', () => {
    for (const { title, fields } of Object.values(FORMS)) {
      expect(title.en).not.toBe('')
      for (const f of fields) {
        for (const text of [f.label, f.hint, f.placeholder, ...(f.options ?? []).map((o) => o.label)].filter(Boolean)) {
          expect(text!.es, f.name).not.toBe('')
          expect(text!.en, f.name).not.toBe('')
        }
      }
    }
  })
})

describe('correo armado', () => {
  it('propuesta: asunto con [Moss], textos en español y sin la autorización como campo', () => {
    const email = buildEmail('propuesta', propuesta)
    expect(email.asunto).toBe('[Moss] Propuesta de Ana Prueba: Probar formularios de React')
    expect(email.tipo).toBe('Propón una idea')
    expect(email.correo).toBe('ana@example.com')
    expect(email.mensaje).toContain('¿Qué propones?: Una guía para el Manual')
    expect(email.mensaje).toContain('¿Qué problema o duda resolvería?\nNo sé cómo probar')
    expect(email.mensaje).toContain('Acepta que se publique en Moss: sí')
    expect(email.mensaje).toContain('Autorizó el tratamiento de sus datos')
    expect(email.mensaje).not.toContain('Contexto')
  })

  it('conversación: el asunto usa el que escribió la persona o uno por defecto', () => {
    const base = { nombre: 'Ana', correo: 'a@b.co', mensaje: 'Hola', autorizacion: 'sí' }
    expect(buildEmail('conversacion', { ...base, asunto: 'Una duda' }).asunto).toBe('[Moss] Una duda')
    expect(buildEmail('conversacion', base).asunto).toBe('[Moss] Mensaje de Ana')
  })
})

describe('envío', () => {
  it('llama a la API REST de EmailJS con las credenciales públicas y las variables de la plantilla', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    await sendEmail(buildEmail('propuesta', propuesta), fetchMock as unknown as typeof fetch)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ service_id: site.emailjs.serviceId, template_id: site.emailjs.templateId, user_id: site.emailjs.publicKey })
    expect(Object.keys(body.template_params).sort()).toEqual(['asunto', 'correo', 'mensaje', 'nombre', 'tipo'])
  })

  it('lanza un error si EmailJS no responde bien', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    await expect(sendEmail(buildEmail('propuesta', propuesta), fetchMock as unknown as typeof fetch)).rejects.toThrow('400')
  })

  it('las credenciales están completas y la espera entre envíos funciona', () => {
    expect(emailjsReady()).toBe(true)
    expect(cooldownLeft(null)).toBe(0)
    expect(cooldownLeft(1000, 1000 + 10_000)).toBe(COOLDOWN_MS - 10_000)
    expect(cooldownLeft(1000, 1000 + COOLDOWN_MS)).toBe(0)
  })
})

describe('página Propón una idea', () => {
  it('abre la primera pestaña por defecto y la segunda con ?formulario=habla-conmigo', () => {
    const first = render('/propon-una-idea')
    expect(first).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>|aria-selected="true"[^>]*role="tab"/)
    expect(first).toContain('name="tema"')
    const second = render('/propon-una-idea?formulario=habla-conmigo')
    expect(second).toContain('name="mensaje"')
    expect(second).not.toContain('name="tema"')
  })

  it('tiene el campo trampa, enlaza la privacidad y no muestra ningún correo', () => {
    const html = render('/propon-una-idea')
    expect(html).toContain('name="sitio_web"')
    expect(html).toContain('href="/privacidad#formularios"')
    expect(html).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/)
    expect(html).not.toContain(site.contactEmail)
  })

  it('la privacidad explica los formularios y nombra a EmailJS', () => {
    const body = getLegalPage('privacidad')!.body
    expect(body).toContain('## Formularios')
    expect(body).toContain('EmailJS')
  })
})
