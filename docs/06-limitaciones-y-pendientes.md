# 06. Limitaciones y pendientes

Lo que hoy se ve o se comporta mal, con su causa en el código, y lo que falta para refinar. Ordenado por impacto en la demo. Cada fila dice de qué repo depende arreglarlo.

## Render y calidad visual

| Problema | Causa | Depende de | Camino propuesto |
| --- | --- | --- | --- |
| El globo no es 100 % nuestro: imagen y relieve vienen de `trek.nasa.gov` y sin internet no hay superficie | `layers.ts`, `terrain.ts` y `polar.ts` del globo apuntan a Moon Trek | Globo + backend (`P-008`) | Que el backend sirva teselas de relieve desde los DEM que ya tiene (`LDEM_80S_40MPP_ADJ.TIF`, 40 m, y `ldem_64.tif`, 474 m) y el globo cambie solo `fetchDemTile`. La imagen podría quedarse en Moon Trek o servirse desde una copia propia |
| Abanico de imagen alrededor del polo sur (se ve al volar a Shackleton, Connecting Ridge, de Gerlache) | Mosaico polar reproyectado, máximo 267 m/px; ~10 km de radio (`docs/11` §7) | Globo | Teselas polares servidas en proyección estereográfica, o imagen del backend (`P-008`) |
| El relieve del globo y de la escena de alunizaje es grueso (~666 m/px, pasos de 77 m) | Nivel 5 del DEM de Moon Trek con 8 bits | Globo + backend | El mismo `P-008`. El parche de 40 m del backend no se usa en el globo |
| La escena local ("Terrain detail") se ve pobre: gris, sin imagen, 12 km | `TerrainMesh` usa solo alturas, `flatShading` y un material liso; el parche es de 128 × 128 | Consola | Si se conserva: textura de sombreado, escala vertical, horizonte y PSR. Si el globo gana detalle con `P-008`, se puede retirar |
| Fuera del polo el parche local no tiene detalle real | El backend usa `lola_global` (473,8 m nativos) interpolado a ~94 m | Consola + backend (datos) | Pedir `size_km` de 30 a 40 fuera del polo, como recomienda la respuesta de `P-006` (hoy siempre 12), y mostrar `grid.source` / `native_resolution_m` para no sugerir más precisión de la que hay |
| Mientras "Terrain detail" está abierto hay dos contextos WebGL y el globo sigue dibujando debajo | El globo no usa `requestRenderMode` y no existe un mensaje para pausarlo | Globo | Un mensaje `PAUSE`/`RESUME` o `requestRenderMode` en el globo |
| "Back to globe" corta la escena local sin fundido de salida | `SceneBackground` desmonta `LunarCanvas` en cuanto `viewMode` cambia; solo el globo hace la transición de 500 ms | Consola | Mantener la escena montada durante la salida y desmontarla al terminar la transición |
| La escena de alunizaje corre lenta sin GPU | El globo limita el paso a 0,1 s por fotograma | — | Probar siempre en una GPU real; las capturas automáticas usan render por software |

## Flujo y estado

| Problema | Causa | Camino propuesto |
| --- | --- | --- |
| Si falla `/terrain/patch` o `/psr/nearby`, toda la corrida falla aunque `/evaluate` haya respondido | `evaluate()` usa un solo `Promise.all` | `Promise.allSettled`: el veredicto no depende del parche ni de las PSR |
| Cambiar solo la fecha repite `/terrain/patch` y `/psr/nearby` | Pendiente marcado como `TODO` en `useMissionStore.evaluate` | Reusar el parche y las PSR si `lat`/`lon` no cambiaron |
| Si el globo vence su plazo después de evaluar, queda el placeholder en vez de la escena local | `viewMode` se decide al terminar `evaluate()`, cuando `link` aún era `loading` | Pasar a `'site'` cuando `link` cambia a `unavailable` con una evaluación presente |
| Elegir otro sitio o volver a evaluar durante la escena de alunizaje no la cambia de sitio | El puente omite `SELECT_SITE` mientras `landing.requested` | Cerrar la escena al cambiar de sitio, o reiniciarla en el nuevo |
| En History no hay forma de salir de la escena | History no tiene slot `top` | Salir de la escena al cambiar de workspace, o poner las píldoras en History |
| Cada evaluación del mismo sitio repite el vuelo de 2,5 s | El puente manda `SELECT_SITE` tras cada `evaluate()` | Enviarlo solo si cambió el sitio |
| El globo no tiene Sol antes de la primera evaluación | La consola solo tiene vectores dentro de `/evaluate` | Usar `GET /ephemeris` (v1.2, `P-007`) cuando el ambiente lo sirva |

## Datos y textos

| Problema | Causa | Camino propuesto |
| --- | --- | --- |
| La franja de créditos de la escena local dice "Ephemeris: NASA/JPL Horizons" | Texto fijo en `ConsoleShell.tsx`. El backend calcula con kernels SPICE (`de421`, `de440s`), no con Horizons | Cambiarlo a algo como "Terrain and ephemeris: Lunar Navigator API · source data: LOLA DEM, JPL DE ephemerides" (pendiente de confirmar) |
| Los créditos del globo incluyen texto en español ("Textura de regolito procedural (ilustrativa)") | `regolith.ts` del globo | Globo: traducir el crédito (la interfaz es en inglés) |
| Las razones del veredicto en Detailed están en español | Se muestran `site.reasons` | Usar `site.checks[].message` (v1.2, en inglés) cuando el ambiente sirva v1.2; mantener `reasons` como respaldo |
| La URL "Producción / Demo Pública" sirve v1.1 | Ver `docs/07` del handoff | Apuntar a "Backend oficial" para tener `checks`, `grid.source`, `/psr` y `/ephemeris`, o detectar capacidades |
| La telemetría y el descenso de la escena no son física y no cambian con un NO-GO | El contrato no tiene trayectoria ni resultado de aterrizaje | Mantener el rótulo "Illustrative"; no inventar datos |
| El mock no manda `engine` ni `timestamp_utc` en `/health` | `mock/server.js` del handoff | Se usa a propósito para detectar el mock; si el mock cambia, cambiar la detección |

## Opcionales aún sin hacer

- Interruptor de `SET_VEHICLES` (módulo y astronauta fuera de la escena), `docs/11` §6b.
- Indicador de carga con `LOADING {pending}`.
- Pasar `headingDeg`, `startAltM`, `durationS`, `distanceM` o `astronaut` a `PLAY_LANDING_SCENE` desde la interfaz (hoy van los valores por defecto del globo).
- Desplegar el globo y fijar `VITE_GLOBE_URL` de producción.
- Video demo y AI Tool Disclosure.
