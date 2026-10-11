/**
 * Medidas de las tarjetas del tablero. Las comparten el tablero real (carga diferida) y su esqueleto,
 * así que ambos ocupan exactamente lo mismo y no hay saltos al cargar.
 */
export const dashboardCards = {
  growth: {
    title: 'El ritmo de crecimiento',
    className: 'md:col-span-2 lg:col-span-1',
    chartClass: 'h-[260px] lg:h-[200px]',
  },
  ecosystem: {
    title: 'El ecosistema',
    className: '',
    chartClass: 'h-[260px] lg:h-[210px]',
  },
  distribution: {
    title: 'La distribución del jardín',
    className: '',
    chartClass: 'h-[260px] lg:h-[236px]',
  },
} as const

export type DashboardCardId = keyof typeof dashboardCards

// Escritorio: columna lateral. Tableta: barras arriba a lo ancho y las otras dos debajo. Móvil: una columna.
export const dashboardGridClass = 'grid gap-4 md:grid-cols-2 lg:grid-cols-1'
