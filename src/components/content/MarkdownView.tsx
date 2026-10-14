import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { Link } from 'react-router-dom'
import { isDiagramLanguage } from '../../lib/diagram'
import { resolveImage } from '../../lib/images'
import CodeBlock from '../code/CodeBlock'
import Diagram from './Diagram'

const components: Components = {
  // Una imagen sola en su párrafo se dibuja como <figure>; el <p> sobra (una figura no puede ir dentro)
  p: ({ node, children }) => {
    const only = node?.children.length === 1 ? node.children[0] : undefined
    return only?.type === 'element' && only.tagName === 'img' ? <>{children}</> : <p>{children}</p>
  },
  img: ({ src = '', alt = '', title }) => {
    const image = resolveImage(String(src))
    // Las pruebas impiden publicar imágenes rotas; esto solo se ve escribiendo en desarrollo
    if (!image) return <span className="text-danger">[Imagen no encontrada: {String(src)}]</span>
    return (
      <figure className="not-prose my-8">
        <img
          src={image.url}
          alt={alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full rounded-xl border border-surface/70 shadow-sm"
        />
        {title && <figcaption className="mt-2 text-center text-sm text-ink-soft">{title}</figcaption>}
      </figure>
    )
  },
  // CodeBlock ya renderiza su propio <pre>
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children ?? '')
    const lang = /language-([\w-]+)/.exec(className ?? '')?.[1]
    // ```flow y ```mindmap se dibujan como diagramas en vez de mostrarse como código
    if (isDiagramLanguage(lang)) return <Diagram lang={lang} source={text} />
    if (lang || text.includes('\n')) {
      return (
        <div className="my-5">
          <CodeBlock code={text.replace(/\n$/, '')} lang={lang ?? 'text'} />
        </div>
      )
    }
    return <code className="rounded bg-surface/70 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
  },
  // Una tabla ancha se desplaza dentro de su caja en vez de ensanchar toda la página
  table: ({ children }) => (
    <div className="overflow-x-auto" role="region" aria-label="Tabla" tabIndex={0}>
      <table>{children}</table>
    </div>
  ),
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
}

export default function MarkdownView({ source }: { source: string }) {
  return (
    <div className="prose max-w-none prose-headings:scroll-mt-24 prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-strong:text-ink prose-a:text-sage-deep prose-code:before:content-none prose-code:after:content-none prose-th:text-ink">
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  )
}
