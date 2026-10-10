import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Botón de copiar al portapapeles',
  description: 'Copia un texto con un clic y confirma con un icono y un aviso para lectores de pantalla.',
  technology: 'React',
  category: 'Botones',
  tags: ['botón', 'portapapeles', 'clipboard', 'copiar', 'feedback', 'accesibilidad'],
  createdAt: '2026-10-10',
  usage:
    'Pasa el texto en `value`. navigator.clipboard solo funciona en HTTPS o localhost; si falla, el botón muestra "No se pudo copiar".',
  dependencies: ['lucide-react', 'tailwindcss'],
}

type Status = 'idle' | 'copied' | 'error'

function CopyButton({ value }: { value: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Limpiamos el temporizador si el componente desaparece antes de tiempo
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus('idle'), 1800)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-surface px-3 text-xs text-ink-soft shadow-sm transition hover:text-sage-deep active:scale-95"
    >
      {status === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      {/* aria-live anuncia el cambio de texto sin mover el foco */}
      <span aria-live="polite">
        {status === 'idle' ? 'Copiar' : status === 'copied' ? '¡Copiado!' : 'No se pudo copiar'}
      </span>
    </button>
  )
}

export default function CopyButtonDemo() {
  const command = 'npm create vite@latest moss -- --template react-ts'

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-xl bg-cream-deep/70 p-2 pl-4">
      <code className="flex-1 truncate font-mono text-xs">{command}</code>
      <CopyButton value={command} />
    </div>
  )
}
