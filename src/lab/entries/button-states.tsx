import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { LabMeta } from '../../lib/lab'

export const meta: LabMeta = {
  title: 'Botón con estados',
  description: 'Botón con estados normal, cargando y éxito, con feedback visual.',
  technology: 'React',
  category: 'Botones',
  tags: ['botón', 'estados', 'feedback', 'loading'],
  createdAt: '2026-10-09',
  usage: 'Sustituye el setTimeout por tu petición real (fetch, mutación, etc.).',
  dependencies: ['lucide-react', 'tailwindcss'],
}

type Status = 'idle' | 'loading' | 'done'

export default function StatefulButton() {
  const [status, setStatus] = useState<Status>('idle')

  const click = () => {
    if (status !== 'idle') return
    setStatus('loading')
    setTimeout(() => {
      setStatus('done')
      setTimeout(() => setStatus('idle'), 1500)
    }, 1200)
  }

  return (
    <button
      onClick={click}
      disabled={status === 'loading'}
      className="inline-flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-70"
    >
      {status === 'loading' && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {status === 'done' && <Check size={16} aria-hidden />}
      {status === 'idle' ? 'Guardar' : status === 'loading' ? 'Guardando…' : '¡Listo!'}
    </button>
  )
}
