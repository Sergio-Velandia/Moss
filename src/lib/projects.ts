import type { Lang } from './i18n'

/** Nombre visible de cada estado de proyecto (los valores válidos están en PROJECT_STATUSES) */
export const statusLabels: Record<Lang, Record<string, string>> = {
  es: { activo: 'Activo', mantenimiento: 'En mantenimiento', pausado: 'Pausado' },
  en: { activo: 'Active', mantenimiento: 'Maintenance', pausado: 'Paused' },
}
