# Lunar Landing Navigator Console (frontend)

Frontend React de **Lunar Landing Site Navigator** (NASA Space Apps). El proyecto se *especifica* en otro repo, el **handoff**:
`https://github.com/CarlitooooK/handoff-space-NASA-challenge` — **fuente de verdad, solo lectura desde aquí.**
Este repo solo contiene código del cliente. Trabajamos dos personas: respeta los carriles de abajo.

## Antes de implementar (obligatorio, cada sesión)

1. `npm run sync:handoff` — actualiza la copia local `.handoff/` (gitignored) y lista qué cambió en `docs/`, `contracts/`, `mock/`, `PREGUNTAS.md`, etc. desde la última revisión (`.handoff-last-sync`).
2. Si cambió algo del módulo que vas a tocar, lee el cambio antes de escribir código. Si cambió `contracts/openapi.json`: `cp .handoff/contracts/openapi.json contracts/openapi.json && npm run gen:types`.
3. Revisa `.handoff/PREGUNTAS.md` (respuestas nuevas) y el `HANDOFF.md` de la iniciativa en `.handoff/contexto-sesiones/iniciativas/`.
4. Al terminar la revisión: `echo <hash> > .handoff-last-sync` y commitea.

Lectura base del handoff: `AGENTS.md`, `COMO-USAR-ESTE-REPO.md`, `contracts/lunar-landing-api-contract.md`, `FRONTEND_API_GUIDE.md`, `docs/02`, `05`, `06`, `07`, `09`. `docs/ideas/` es **no vinculante** (de ahí sale la estructura de carriles y la paleta).

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
src/core/{api,store,utils}   Carril 1: cliente HTTP, store Zustand (3 velocidades), utilidades
src/features/layout|timeline Carril 1: cascarón, navbar, scrubber, (Gantt pendiente)
src/features/sidebar|comparator  Carril 2: panel de control y comparador (/compare)
src/features/viewport3d      Carril 3: escena Three.js (terreno, Sol/Tierra, PSR, cámaras)
src/types/                   api.d.ts (generado) + index.ts (alias legibles)
```
Asignación de carriles entre las dos personas: _pendiente de definir_ (anótala aquí).

## Estado (fase 1: front mockeado)

Hecho: scaffold, tipos generados, cliente API con manejo de errores, store, shell 30/70 + timeline, selector de sitio, config de fecha, veredicto, KPIs, malla de terreno y luces Sol/Tierra básicas; verificado contra el mock (mismos campos que `openapi.json`).
Falta (por carril): horizon chart 2D, PSR overlay, modos de cámara, Gantt, comparador, toggles de capas, optimizar "solo cambio de fecha → solo /evaluate", i18n, video y AI disclosure.

## Preguntas pendientes hacia el handoff (aún no subidas a `PREGUNTAS.md`)

- **P-A · Formato de error:** `docs/06` documenta `{error:{code,message,details}}` (el mock lo cumple) pero `contracts/openapi.json` solo define `HTTPValidationError` (`{detail}`), y `FRONTEND_API_GUIDE.md` lee `detail`. El cliente soporta ambos. ¿Qué devuelve el backend en vivo?
- **P-B · URL base del mock:** `docs/07` da `http://localhost:3000` para `VITE_API_BASE_URL`, pero el mock sirve `/api/v1/*`; usamos `http://localhost:3000/api/v1`.
- **P-C · Rango de latitud:** `docs/06` limita a `[-90,-80]`; contrato/guía aceptan `-90..90` (sitios Apollo). El mock rechaza fuera de `[-90,-80]`.
- **P-D · Estado de `mock/`:** `handoff-api-frontend/HANDOFF.md` dice "no iniciado", el README dice listo (funciona). Además `mock/server.js` es CommonJS: aquí se aísla con `.handoff/package.json` (lo escribe `sync-handoff.sh`).
- **P-E:** `openapi-typescript@7` exige TypeScript 5 y el scaffold trae 7: se ejecuta vía `npx` (no está en devDependencies).
