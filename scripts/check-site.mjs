// Comprueba que src/data/site.ts no conserva marcadores sin rellenar antes de publicar.
// Uso: npm run check:publish
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8')
const pending = [...src.matchAll(/^\s*(\w+):\s*'(\[[^'\]]*\][^']*)'/gm)].map((m) => `  ${m[1]}: ${m[2]}`)

if (pending.length > 0) {
  console.error('✖ Faltan datos en src/data/site.ts (se mostrarían tal cual en las páginas legales):')
  console.error(pending.join('\n'))
  process.exit(1)
}
console.log('✔ src/data/site.ts está completo.')
