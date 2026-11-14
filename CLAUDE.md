# Lunar Landing Navigator Console (frontend)

Frontend React de **Lunar Landing Site Navigator** (NASA Space Apps). El proyecto se *especifica* en otro repo, el **handoff**:
`https://github.com/CarlitooooK/handoff-space-NASA-challenge` — **fuente de verdad, solo lectura desde aquí.**
Este repo solo contiene código del cliente. Trabajamos dos personas: respeta los carriles de abajo.

## Antes de implementar (obligatorio, cada sesión)

1. `npm run sync:handoff` — actualiza la copia local `.handoff/` (gitignored) y lista qué cambió en `docs/`, `contracts/`, `mock/`, `PREGUNTAS.md`, etc. desde la última revisión (`.handoff-last-sync`).
2. Si cambió algo del módulo que vas a tocar, lee el cambio antes de escribir código. Si cambió `contracts/openapi.json`: `cp .handoff/contracts/openapi.json contracts/openapi.json && npm run gen:types`.
3. Revisa `.handoff/PREGUNTAS.md` (respuestas nuevas) y el `HANDOFF.md` de la iniciativa en `.handoff/contexto-sesiones/iniciativas/`.
4. Al terminar la revisión: `echo <hash> > .handoff-last-sync` y commitea.

Lectura base del handoff: `AGENTS.md`, `COMO-USAR-ESTE-REPO.md`, `contracts/lunar-landing-api-contract.md`, `FRONTEND_API_GUIDE.md`, `docs/02`, `05`, `06`, `07`, `09`. Para la integración del globo lunar (D-011): `.handoff/contexto-sesiones/_compartido/lunar-globe-renderer.md` y el `README.md` de su repo (`luna-render-nasa-space-challenge`, protocolo `postMessage` — fuente única). `docs/ideas/` es **no vinculante** (de ahí sale la estructura de carriles y la paleta).

## Reglas que no se rompen (resumen; la fuente es el handoff)

- **Contrato primero:** solo endpoints/campos de `contracts/openapi.json` (6 endpoints: health, sites, terrain/patch, evaluate, compare, psr/nearby). No inventes campos. Si doc y contrato chocan, manda el contrato.
- **No inventes datos ni reglas.** Si falta algo: pregunta en el handoff (`PREGUNTAS.md`, id `P-xxx`; no lo editamos desde aquí, ver "Preguntas pendientes") y marca el código con `// P-xxx`.
- **Errores: decidir por `error.code`, nunca por `message`** (`src/core/api/errors.ts`).
- **Cero red al mover el slider:** `POST /evaluate` trae `timeline[]` completo; el scrubber solo cambia `stepIndex` en el store (D-003).
- **El cliente no calcula física:** usa `horizon_profile` (360), `sun_vector_3d`, `earth_vector_3d` tal cual (D-002, D-006). Sin refracción atmosférica.
- **Ejes 3D:** `+X` Este, `+Y` arriba, `-Z` Norte; `elevations_m` row-major Norte→Sur, Oeste→Este con `PlaneGeometry.rotateX(-π/2)` (D-008).
- **Fechas** ISO-8601 UTC `YYYY-MM-DDTHH:mm:ssZ` (`toUtcIso`); campos `snake_case`.
- **URL del backend solo por env** (`VITE_API_BASE_URL`, incluye `/api/v1`). El túnel de Cloudflare cambia al reiniciar: nunca fija en código. Sin secretos en el repo (`.env.local` está ignorado).
- **Un dato vive en un solo lugar:** no copies docs del handoff aquí; cítalos por ruta. Excepciones: `contracts/openapi.json` (copia versionada del contrato, no se edita a mano) y `src/types/api.d.ts` (generado).
- Rúbrica NASA (8 criterios × 12.5 %): cuentan UX, estética, video ≤ 2 min y declaración de uso de IA.

## Stack y comandos

React 19 + TypeScript + Vite · Tailwind v4 · three + @react-three/fiber/drei · Zustand · Vitest · oxlint. Alias `@/` → `src/`.

| Comando | Qué hace |
| --- | --- |
| `npm run mock` | Levanta el mock del handoff (`.handoff/mock/server.js`, puerto 3000; requiere `sync:handoff` previo) |
| `npm run dev` | Vite. Con `.env.local` apuntando a `http://localhost:3000/api/v1` usa el mock |
| `npm run gen:types` | Regenera `src/types/api.d.ts` desde `contracts/openapi.json` |
| `npm run typecheck` / `test` / `lint` / `build` | Verificaciones |

Mock vs. backend en vivo: cambia solo `VITE_API_BASE_URL` (ver `.env.example`; URLs vigentes en `.handoff/docs/07-ambientes-y-pruebas.md`).

## Estructura (carriles para trabajar en paralelo sin pisarse)

```
src/core/{api,store,utils}   Carril 1: cliente HTTP, stores Zustand (misión + historial en localStorage), utilidades puras
src/core/config.ts           URLs por entorno (VITE_GLOBE_URL)
src/ui/                      Primitivas glass compartidas (Panel, Segmented, Input, Button, StatusChip, Meter…)
src/features/layout          Carril 1: cascarón (render de fondo + paneles flotantes), rail, top bar, pantalla completa (F)
src/features/timeline        Carril 1: dock del timeline (pistas Gantt, scrubber) y horizonte 360°
src/features/simulate        Carril 2: Setup y Results (Simple / Detailed)
src/features/comparator      Carril 2: escenarios A–E y matriz (POST /compare)
src/features/history|missions  Carril 2: historial local y recrear misiones reales
src/features/viewport3d      Carril 3: fondo (SceneBackground), hueco del globo (GlobeFrame), escena local Three.js
src/types/                   api.d.ts (generado) + index.ts (alias legibles)
```
Diseño: Figma de `.handoff/docs/ideas/console-ui-figma.md`. Tokens en `src/index.css` (`@theme` + utilidades `glass`, `raised`, `inset-well`, `btn-primary`, `glow`). Textos de interfaz en inglés.

Asignación de carriles entre las dos personas: _pendiente de definir_ (anótala aquí).

## Estado

Fase 1 de pantallas (rama `feat/consola-glass`): cascarón con render de fondo y paneles glass, Simulate (Simple/Detailed), Compare, History (localStorage), Missions (alunizajes reales con fuentes citadas), estados de carga/error/offline y pantalla completa.
Fondo (handoff `docs/11`, D-013): `viewMode` `globe` sin sitio evaluado y `site` tras evaluar; un solo render montado. El iframe del globo se monta si existe `VITE_GLOBE_URL`; si no, placeholder.
Puente con el globo (rama `feat/globe-bridge`): `globeProtocol.ts` (tipos, única copia del protocolo), `globeBridge.ts` (funciones puras con pruebas), `useGlobeBridge.ts` (único archivo que habla con el iframe) y `useGlobeStore`. Envía sitios, Sol y Tierra del paso del scrubber (`sun_vector_3d`/`earth_vector_3d` tal cual), PSR y la escena de alunizaje (botón "Landing scene", que pasa al globo y vuelve con "Exit scene"). `SITE_CLICKED`/`GLOBE_CLICKED` solo seleccionan (evaluar es del usuario). Sin `READY` en 8 s el fondo vuelve al placeholder. El descenso del globo es una curva ilustrativa: la interfaz lo rotula "illustrative". Falta `SET_VEHICLES` (interruptor) y probarlo en una GPU real.

## Preguntas hacia el handoff

`P-001`..`P-005` fueron **respondidas el 2026-11-14** (ver `.handoff/PREGUNTAS.md`, sección Respondidas). Lo acordado, ya en `docs/06` y `docs/07` del handoff:

- **Errores (contrato v1.1, D-010):** backend en vivo y mock responden `ErrorResponse` `{error:{code,message,details}}` (más `detail` opcional), con `ERR_NOT_FOUND` para rutas inexistentes. El cliente conserva el respaldo `{detail}` solo para el backend oficial, que aún no cumple `P-001` (`src/core/api/errors.ts`).
- **URL del mock:** `http://localhost:3000/api/v1`.
- **Latitud:** backend y mock aceptan `-90..90` y fechas `1900..2050`. El mock sirve 8 sitios (5 polares + Apollo 11, 15 y 17), así que Missions ya se prueba offline.
- **Mock CommonJS:** se aísla con `.handoff/package.json` (lo escribe `sync-handoff.sh`).
- **Tipos:** `openapi-typescript` se ejecuta vía `npx`, no está en devDependencies.
