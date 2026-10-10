export interface ParsedMarkdown {
  data: Record<string, unknown>
  body: string
}

/**
 * Parser mínimo de frontmatter (subconjunto de YAML), suficiente para Moss:
 *   clave: texto
 *   clave: true | false
 *   clave: [uno, dos, tres]
 * Límites: sin listas multilínea, sin objetos anidados y sin comas dentro de los elementos de una lista.
 */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, body: raw }

  const data: Record<string, unknown> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx < 1 || line.trimStart().startsWith('#')) continue
    data[line.slice(0, idx).trim()] = parseValue(line.slice(idx + 1).trim())
  }
  return { data, body: raw.slice(match[0].length) }
}

function parseValue(value: string): unknown {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((s) => unquote(s.trim()))
      .filter(Boolean)
  }
  return unquote(value)
}

function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

export const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
export const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
