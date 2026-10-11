import type { Lang } from './i18n'

export function formatDate(iso: string, lang: Lang = 'es'): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
}
