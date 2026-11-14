// Colores de señal del Figma (variables CSS de index.css).
export const SIGNAL = {
  sun: 'var(--color-sun)', earth: 'var(--color-earth)', psr: 'var(--color-psr)', go: 'var(--color-go)',
  caution: 'var(--color-caution)', nogo: 'var(--color-nogo)', ink: 'var(--color-ink)', regolith: 'var(--color-regolith)',
} as const
export type Signal = keyof typeof SIGNAL
