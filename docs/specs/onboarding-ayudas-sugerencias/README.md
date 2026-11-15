# Spec: tour, ayudas "?" y sugerencias

**Estado:** decisiones tomadas el 2026-11-14 (D1–D12). Lista para implementar. No hay código de implementación.
**Rama:** `docs/spec-onboarding-ayudas`, desde `feat/simulacion-en-globo` (`29ba38b`).

## Objetivo

Que cualquier persona entienda la consola y sus resultados sin ayuda externa. Eso cubre a un juez no técnico en la demo en vivo, a un ingeniero de misión y a quien navega con teclado o lector de pantalla. La spec ataca tres frentes:

1. **Un tour** que lleva al primer veredicto en menos de un minuto.
2. **Ayudas "?"** que explican cada término y número, con una sugerencia de valor cuando aplica.
3. **Una "próxima acción"** clara en cada estado, para que nadie se quede sin saber qué sigue.

## Archivos

| Archivo | Contenido |
| --- | --- |
| [`audit.md`](audit.md) | Hallazgos con severidad, criterio de la rúbrica y evidencia. Incluye los términos sin explicar y las ayudas que ya existen |
| [`design.md`](design.md) | Qué se construye: el tour (§1), las ayudas y el glosario (§2), las sugerencias (§3) y las correcciones que sostienen las tres piezas (§4) |
| [`tasks.md`](tasks.md) | El plan en tareas de un commit, con criterios de aceptación y pruebas |
| [`evidencia/`](evidencia/) | Capturas del recorrido, a 1200 px y en JPEG |

## Reglas que no se negocian

- **El cliente no calcula física ni inventa umbrales (D-002, D-006).** Lo que es bueno o malo lo dice `site.checks[].level`. Los números de umbral salen del contrato.
- **Sin librerías nuevas.** El tour, las ayudas y las sugerencias se hacen con React, CSS, `<dialog>` y `popover` (`design.md` §1.8).
- **Se respetan el vidrio y `prefers-reduced-motion`.**
- **Textos de interfaz en inglés.** Specs y docs en español.

## Decisiones (2026-11-14)

| # | Tema | Decisión |
| --- | --- | --- |
| D1 | Pasos del tour | Siete pasos (`design.md` §1.3). Se ajustan después de probarlo si hace falta |
| D2 | El tour simula | Sí: el paso 2 corre una simulación real |
| D3 | Escenario del tour | **Apollo 11, 2026-12-13 00:00 UTC**, 14 días (decidido el 2026-11-14). Shackleton Rim quedó descartado: da NO-GO por pendiente (16°, el límite es 15°) en cualquier fecha. Con el Backend oficial, Apollo 11 da GO del 9 al 21 de diciembre; el 13, con 88 % de Sol y 100 % de Tierra |
| D4 | Demo y video | `?tour=0` basta |
| D5 | "Compare dates" | +7 y +14 días |
| D6 | Gravedad a igual nivel | Pendiente, después Sol, después Tierra |
| D7 | Correcciones base | Entran en esta spec, bloque A de `tasks.md`, antes del tour |
| D8 | Ambiente de la demo | Backend oficial. `.env.local` ya apunta ahí; el de Producción queda comentado |
| D9 | "Next step" | En los cuatro workspaces desde la primera entrega (C2–C5) |
| D10 | Revisión de los textos científicos | Se pide por el handoff (ver abajo). Hasta tener respuesta, `psr` y `power` quedan como "pendiente" |
| D11 | Fecha por defecto de la consola | Pasa de 2026-12-01 a **2026-12-13 00:00 UTC**, igual que el tour (tarea A8) |
| D12 | Nombre del campo de fecha | "Date" pasa a **"Landing date"** (y "Landing time (UTC)") para que no se confunda con el despegue desde la Tierra (tarea A1) |
| D13 | Mock | **Ya no se usa** (2026-11-14). Desarrollo, pruebas manuales y capturas van contra el Backend oficial. El mock es sintético (el Sol nunca se pone) y da veredictos que no corresponden a la realidad |

**Por qué se cambió la fecha por defecto (D11).** Con el Backend oficial y la configuración anterior (2026-12-01, 14 días, paso de 60 min), 11 de los 13 sitios del catálogo daban NO-GO y los otros dos, CAUTION. Esa fecha venía de `docs/07` del handoff como "valor de prueba" (`useMissionStore.ts:90`) y cae de noche o con poca luz en casi todos los sitios.

## Preguntas para el handoff

Son propuestas para `.handoff/PREGUNTAS.md`. No se editó el handoff: quien lo mantenga las copia con el siguiente id libre (hoy la última es `P-010`). La primera es la pregunta 10 que el usuario decidió pasar al handoff (D10); las de `power_factor` y PSR se fundieron en ella.

### Revisión de los textos científicos de las ayudas

- **Pregunta:** ¿Alguien del equipo de ciencia o backend puede revisar los textos en inglés de las ayudas antes de implementarlas? Son estos dos:
  - **`psr`:** "A permanently shadowed region (PSR) never sees the Sun. It is extremely cold and may hold water ice. This is the distance to the nearest one." ¿Es correcto? ¿Qué catálogo usa `/psr/nearby` y qué fuente se debe citar?
  - **`power`:** "Relative solar power at the time selected on the timeline, as reported by the server." ¿Qué es exactamente `power_factor` (y `avg_power_factor`)? La auditoría del globo (`contexto-sesiones/iniciativas/lunar-globe-renderer/CONOCIMIENTO.md`, 2026-11-14) vio un factor de unos 0.994 con el Sol a 6.5°, y un pico de 1 559 W frente a 1 524 W nominales: eso cuadra con un panel que sigue al Sol, no con uno horizontal. ¿Es así? ¿Por qué el pico supera el nominal? ¿Vale 0 con el Sol oculto?

  El resto del catálogo está en `docs/specs/onboarding-ayudas-sugerencias/design.md` §2.3–2.5 de la consola, por si quieren revisarlo completo.
- **Contexto:** spec de onboarding de la consola, `design.md` §2.4. Las métricas en pantalla son "Permanent shadow 1.8 km away" y "Solar power now · 71% of panel output". El contrato v1.3 sigue sin definir `power_factor`.
- **Bloquea:** no. Las dos ayudas salen con texto neutro hasta tener la respuesta.

### `hours_to_next_*` cuando el astro está oculto al inicio

- **Pregunta:** ¿`hours_to_next_earthset` (y `sunset`) cuenta hasta el primer ocaso de la ventana aunque el astro empiece oculto? ¿Habría forma de agregar `hours_to_next_earthrise` y `hours_to_next_sunrise` en un cambio aditivo?
- **Contexto:** A-06 en `audit.md`. Mientras tanto la consola deriva la salida del timeline (`design.md` §3.4), lo cual no es cálculo físico. Aun así, un campo del servidor sería más claro.
- **Bloquea:** no.

### Retirada: "el mock no sigue las reglas de `checks` de v1.2"

Se propuso y se retiró el mismo día. El recorrido usó un proceso del mock que llevaba corriendo desde antes de la versión actual (arrancó a las 16:24; `.handoff/mock/server.js` se sincronizó a las 20:29). Ese proceso viejo da `reasons` con un umbral de DTE del 50 % y no manda `checks`. El mock del handoff en `cb5d0e8` y en `377f143` ya manda `checks` con los mismos códigos y umbrales que el backend. Además, el mock ya no se usa (D13).

## Para otros equipos

- **Equipo del globo** (`luna-render-nasa-space-challenge`): el crédito "Textura de regolito procedural (ilustrativa)" está en español (`src/regolith.ts:42`). La interfaz es en inglés (criterio 8). Ya está anotado en `docs/06`.

## Anotado fuera de esta spec

- **"Terrain detail" debe usar la vista a ras de suelo del globo** (decisión del usuario, 2026-11-14). La escena local de Three.js no sirve para juzgar el terreno; la de alunizaje del globo, sí. Es un cambio de render que toca la consola, el globo y el backend (teselas de 40 m), así que no entra en esta spec. Está anotado en `docs/06-limitaciones-y-pendientes.md`, tabla "Render y calidad visual". Mientras no se haga, la ayuda `terrain-detail` (`design.md` §2.4) describe la escena que exista en ese momento.

## Verificación hecha y no hecha

- **Hecha:**
  - Recorrido en navegador con el globo local, a 1440 × 900 y con render por software, de los 4 workspaces, Simple y Detailed, pantalla completa, offline, teclado, la escena de alunizaje y Terrain detail. La evidencia de `evidencia/` sale del Backend oficial.
  - Consulta de `/health`, `/sites` y `/evaluate` del Backend oficial con `curl` (Shackleton Rim, Chang'e 4 y Apollo 11): responde y manda `checks`.
  - Detector de impeccable: 2 avisos aceptados.
  - Revisión de código con líneas verificadas.
- **No hecha:**
  - Pruebas en GPU real.
  - Pruebas con lector de pantalla (VoiceOver).
  - Pruebas con usuarios.
  - Capturas con `checks` traducidos: la consola todavía no los usa (A-04), así que eso solo se podrá ver al implementar B5.
