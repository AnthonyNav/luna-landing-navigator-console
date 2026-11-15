import { describe, expect, it } from 'vitest'
import { fromGlobe, horizonMessage, landingMessage, psrItems, skyMessages, skyStateMessage, toGlobeSites } from './globeBridge'
import type { Evaluation, PsrNearby, Site } from '@/types'

const site = (o: Partial<Site> = {}) => ({ id: 'a', name: 'A', category: 'Artemis III', lat: -84.79, lon: 31.2, ...o }) as Site
const evaluation = (o: Record<string, unknown> = {}) =>
  ({
    site: { lat: -84.79, lon: 31.2, status: 'NO-GO' },
    timeline: [
      { sun_vector_3d: [0.1, 0.2, -0.9], earth_vector_3d: [-0.5, 0.1, -0.8] },
      { sun_vector_3d: [0.3, 0.1, -0.9], earth_vector_3d: [-0.4, 0.1, -0.9] },
    ],
    ...o,
  }) as unknown as Evaluation

describe('toGlobeSites', () => {
  it('copia los campos del contrato y marca el estado solo del sitio evaluado', () => {
    const out = toGlobeSites([site(), site({ id: 'b', name: 'B', lat: -88, lon: 10 })], evaluation())
    expect(out[0]).toEqual({ id: 'a', name: 'A', category: 'Artemis III', lat: -84.79, lon: 31.2, status: 'NO-GO' })
    expect(out[1].status).toBeUndefined()
  })
  it('sin evaluación no inventa estados', () => {
    expect(toGlobeSites([site()], null)[0].status).toBeUndefined()
  })
})

describe('skyMessages', () => {
  it('envía los vectores del paso tal cual, con lat/lon del sitio evaluado', () => {
    const m = skyMessages(evaluation(), 1)
    expect(m).toEqual([
      { type: 'SET_SUN_LOCAL', payload: { lat: -84.79, lon: 31.2, vector: [0.3, 0.1, -0.9] } },
      { type: 'SET_EARTH_LOCAL', payload: { lat: -84.79, lon: 31.2, vector: [-0.4, 0.1, -0.9] } },
    ])
  })
  it('no envía nada sin evaluación o con un paso inexistente', () => {
    expect(skyMessages(null, 0)).toEqual([])
    expect(skyMessages(evaluation(), 99)).toEqual([])
  })
  it('descarta vectores inválidos en lugar de inventar un Sol', () => {
    const bad = evaluation({ timeline: [{ sun_vector_3d: [1, 2], earth_vector_3d: [0, 1, Number.NaN] }] })
    expect(skyMessages(bad, 0)).toEqual([])
  })
})

describe('horizonMessage', () => {
  const profile = Array.from({ length: 360 }, (_, az) => ({ az_deg: az, horizon_el_deg: 1 + az / 100 }))
  it('envía el perfil de 360° tal cual con lat/lon del sitio evaluado', () => {
    const m = horizonMessage(evaluation({ horizon_profile: profile }))
    expect(m).toEqual({ type: 'SET_HORIZON', payload: { lat: -84.79, lon: 31.2, profile } })
  })
  it('sin evaluación o con un perfil incompleto no envía nada', () => {
    expect(horizonMessage(null)).toBeNull()
    expect(horizonMessage(evaluation({ horizon_profile: profile.slice(0, 3) }))).toBeNull()
  })
})

describe('skyStateMessage', () => {
  const t = (o = {}) => ({ sun_az_deg: 5.4, sun_el_deg: 6.5, sun_horizon_el_deg: 1.9, sun_visible: true,
    earth_az_deg: 322.1, earth_el_deg: 10.4, earth_horizon_el_deg: 3.2, earth_visible: true, ...o })
  it('copia azimut, elevación, horizonte y visibilidad del paso', () => {
    expect(skyStateMessage(evaluation({ timeline: [t()] }), 0)).toEqual({
      type: 'SET_SKY_STATE',
      payload: { sun: { az: 5.4, el: 6.5, horizonEl: 1.9, visible: true }, earth: { az: 322.1, el: 10.4, horizonEl: 3.2, visible: true } },
    })
  })
  it('conserva "oculto" cuando el astro queda bajo el terreno', () => {
    const m = skyStateMessage(evaluation({ timeline: [t({ sun_visible: false, sun_el_deg: 1.0 })] }), 0)
    expect(m && m.type === 'SET_SKY_STATE' && m.payload.sun.visible).toBe(false)
  })
  it('descarta pasos inexistentes o con números inválidos', () => {
    expect(skyStateMessage(null, 0)).toBeNull()
    expect(skyStateMessage(evaluation({ timeline: [t()] }), 5)).toBeNull()
    expect(skyStateMessage(evaluation({ timeline: [t({ sun_az_deg: Number.NaN })] }), 0)).toBeNull()
  })
})

describe('landingMessage', () => {
  it('usa solo lat/lon del sitio evaluado (el resto lo decide el globo)', () => {
    expect(landingMessage(evaluation())).toEqual({ type: 'PLAY_LANDING_SCENE', payload: { lat: -84.79, lon: 31.2 } })
    expect(landingMessage(null)).toBeNull()
  })
})

describe('psrItems', () => {
  it('pasa los PSR sin tocar la geometría', () => {
    const geometry = { type: 'MultiPolygon', coordinates: [[[[1, 2], [3, 4], [5, 6]]]] }
    const out = psrItems({ psrs: [{ gid: 7, name: null, distance_km: 3, geometry }] } as unknown as PsrNearby)
    expect(out).toEqual([{ gid: 7, name: null, geometry }])
    expect(psrItems(null)).toEqual([])
  })
})

describe('fromGlobe (seguridad)', () => {
  const win = {}
  const ok = { source: win, origin: 'http://localhost:5174', data: { type: 'READY' } }
  it('acepta solo el iframe del globo y su origen exacto', () => {
    expect(fromGlobe(ok, win, 'http://localhost:5174')).toEqual({ type: 'READY' })
    expect(fromGlobe({ ...ok, origin: 'http://evil.example' }, win, 'http://localhost:5174')).toBeNull()
    expect(fromGlobe({ ...ok, source: {} }, win, 'http://localhost:5174')).toBeNull()
    expect(fromGlobe(ok, null, 'http://localhost:5174')).toBeNull()
  })
  it('descarta datos que no son mensajes', () => {
    expect(fromGlobe({ ...ok, data: 'hola' }, win, 'http://localhost:5174')).toBeNull()
    expect(fromGlobe({ ...ok, data: null }, win, 'http://localhost:5174')).toBeNull()
    expect(fromGlobe({ ...ok, data: { type: 3 } }, win, 'http://localhost:5174')).toBeNull()
  })
})
