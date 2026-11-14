// Configuración por entorno. Las URLs nunca se fijan en código (docs/07 y docs/11 del handoff).
/** URL del globo lunar (D-011). Sin valor, el fondo global usa un placeholder. */
export const GLOBE_URL: string | undefined = import.meta.env.VITE_GLOBE_URL || undefined
