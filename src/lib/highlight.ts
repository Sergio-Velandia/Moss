import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

let highlighter: Promise<HighlighterCore> | null = null

// Solo cargamos los lenguajes que Moss usa. Para añadir uno nuevo, agrega su import aquí.
const getHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/sql.mjs'),
      import('shiki/langs/markdown.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  }))

export async function highlight(code: string, lang: string): Promise<string> {
  const h = await getHighlighter()
  // Genera variables CSS para los dos temas (--shiki-light / --shiki-dark); index.css elige según el tema activo
  return h.codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  })
}
