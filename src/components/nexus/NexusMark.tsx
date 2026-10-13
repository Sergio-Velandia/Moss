/**
 * Marca de Moss Nexus: un nodo musgo conectado a un nodo coral. Mismo dibujo que en el sitio de Nexus.
 * Usa los tokens --nx-*, así que debe ir dentro de un elemento con la clase .nexus.
 */
export function NexusMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="shrink-0">
      <rect width="64" height="64" rx="16" fill="var(--nx-surface-2)" stroke="var(--nx-line-strong)" />
      <path d="M20 22c10 0 12 20 24 20" fill="none" stroke="var(--nx-coral)" strokeWidth="4" strokeLinecap="round" />
      <rect x="9" y="13" width="18" height="18" rx="6" fill="var(--nx-moss)" />
      <rect x="37" y="33" width="18" height="18" rx="6" fill="var(--nx-coral)" />
    </svg>
  )
}
