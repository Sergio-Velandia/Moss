import { NavLink } from 'react-router-dom'
import { NexusMark } from './NexusMark'

/**
 * Acceso a /nexus en la navegación, con el estilo de Nexus (coral y su marca).
 * La clase .nexus le da los tokens --nx-*; la tipografía sigue siendo la de Moss para no cambiar la cabecera.
 */
export default function NexusNavLink({ variant, onNavigate }: { variant: 'header' | 'menu'; onNavigate?: () => void }) {
  const base =
    'nexus inline-flex items-center gap-1.5 rounded-xl border font-medium text-nx-coral transition-colors hover:bg-nx-coral/10'
  const size = variant === 'header' ? 'min-h-9 px-2' : 'min-h-11 px-3 py-2.5'
  return (
    <NavLink
      to="/nexus"
      onClick={onNavigate}
      className={({ isActive }) =>
        `${base} ${size} ${isActive ? 'border-nx-coral bg-nx-coral/15' : 'border-nx-coral/40'}`
      }
    >
      <NexusMark size={variant === 'header' ? 18 : 20} />
      {/* En la cabecera, entre md y lg solo cabe la marca: el nombre queda para lectores de pantalla */}
      <span className={variant === 'header' ? 'sr-only lg:not-sr-only' : ''}>Nexus</span>
    </NavLink>
  )
}
