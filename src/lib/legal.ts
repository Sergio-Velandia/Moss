import { site } from '../data/site'
import { asString, parseFrontmatter } from './frontmatter'

export interface LegalPage {
  slug: string
  title: string
  description: string
  body: string
  route: string
}

const files = import.meta.glob('/content/legal/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

// Variables disponibles en los textos legales: {{owner}}, {{email}}, {{site}}, {{repo}}, {{country}}
const values: Record<string, string> = {
  owner: site.ownerName,
  email: site.contactEmail,
  site: site.siteUrl,
  repo: site.repoUrl,
  country: site.country,
}

export const fillVariables = (text: string): string =>
  text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match)

export const legalPages: LegalPage[] = Object.entries(files).map(([path, raw]) => {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: asString(data.title, slug),
    description: asString(data.description),
    body: fillVariables(body),
    route: `/${slug}`,
  }
})

export const getLegalPage = (slug: string) => legalPages.find((p) => p.slug === slug)

// Orden fijo para el pie de página
const ORDER = ['terminos', 'privacidad', 'proteccion-de-datos']
export const legalLinks = [...legalPages].sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
