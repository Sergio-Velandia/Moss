import type { Lang } from './i18n'

/** Nombre visible de cada estado de proyecto (los valores válidos están en PROJECT_STATUSES) */
export const statusLabels: Record<Lang, Record<string, string>> = {
  es: { desarrollo: 'En desarrollo', estable: 'Estable', mantenimiento: 'En mantenimiento', pausado: 'Pausado' },
  en: { desarrollo: 'In development', estable: 'Stable', mantenimiento: 'Maintenance', pausado: 'Paused' },
}
