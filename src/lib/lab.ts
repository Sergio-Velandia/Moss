import type { ComponentType } from 'react'

export type Technology = 'React' | 'CSS' | 'HTML' | 'JavaScript'

export interface LabLink {
  label: string
  url: string
}

export interface LabMeta {
  title: string
  description: string
  technology: Technology
  category: string
  tags: string[]
  /** Fecha ISO (YYYY-MM-DD) */
  createdAt: string
  updatedAt?: string
  usage: string
  dependencies?: string[]
  /** Notas de accesibilidad y movimiento que no caben en «Cómo usarlo» */
  notes?: string[]
  /** Dónde se usa esta pieza en una app real (sergio-velandia.dev/…) */
  usedIn?: LabLink[]
  /** Ids del jardín que la explican o la complementan (manual/…, journal/…, lab/…) */
  related?: string[]
}

export interface LabEntry extends LabMeta {
  slug: string
  Demo: ComponentType
  /** Código fuente real del archivo de la demo */
  source: string
}

type LabModule = { meta: LabMeta; default: ComponentType }

// Cada archivo en src/lab/entries/ es una entrada del Laboratorio.
// El código que se muestra es el propio archivo (?raw): una sola fuente de verdad.
const modules = import.meta.glob<LabModule>('../lab/entries/*.tsx', { eager: true })
const sources = import.meta.glob<string>('../lab/entries/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const labEntries: LabEntry[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod.meta,
    slug: path.split('/').pop()!.replace('.tsx', ''),
    Demo: mod.default,
    source: sources[path],
  }))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const getLabEntry = (slug: string) => labEntries.find((e) => e.slug === slug)
