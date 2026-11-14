// Contrato: ISO-8601 UTC estricto YYYY-MM-DDTHH:mm:ssZ (sin milisegundos ni offsets).
export const toUtcIso = (d: Date): string => d.toISOString().replace(/\.\d{3}Z$/, 'Z')
export const formatUtc = (iso: string): string => iso.replace('T', ' ').replace(/:\d{2}(\.\d+)?Z$/, ' UTC')
