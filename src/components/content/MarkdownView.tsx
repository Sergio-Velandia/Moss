import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { Link } from 'react-router-dom'
import CodeBlock from '../code/CodeBlock'

const components: Components = {
  // CodeBlock ya renderiza su propio <pre>
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children ?? '')
    const lang = /language-([\w-]+)/.exec(className ?? '')?.[1]
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
