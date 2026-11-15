# Product

<!-- impeccable:product-schema 1 -->

> Contexto de producto para diseñar la interfaz. La fuente de verdad es el handoff (`.handoff/`, ver `CLAUDE.md`): aquí solo se cita. Si algo choca, manda el handoff.

## Platform

web

## Stack

React 19 + TypeScript + Vite · Tailwind v4 · three + @react-three/fiber/drei · Zustand (ver `CLAUDE.md`). Globo lunar aparte con CesiumJS por iframe (D-011, `.handoff/docs/09-decisiones.md`).

## Users

Planificadores e ingenieros de misión, educadores y público general, y los jueces técnicos y no técnicos de NASA Space Apps. Detalle en `.handoff/docs/01-alcance.md` ("Quién lo usa").

## Product Purpose

Comparar en segundos sitios y fechas de aterrizaje lunar, mostrando el Sol y la Tierra contra el horizonte real (LOLA) para juzgar energía solar y enlace Direct-to-Earth. Éxito: saber en menos de 3 segundos si un `{sitio + fecha}` es `GO` / `CAUTION` / `NO-GO` y por qué. Ver `.handoff/docs/01-alcance.md` y `.handoff/docs/10-producto-y-necesidades.md`.

## Positioning

Las herramientas actuales (JPL Horizons, Quickmap, Moon Trek) obligan a cruzar varias interfaces. Aquí la efeméride y la topografía llegan predigeridas sobre un solo render 3D, y la misma simulación se muestra a distintos niveles de detalle: lenguaje llano para no especialistas y telemetría completa para ingenieros.

## Operating Context

- Escritorio, pantalla completa sin scroll. Se usa en vivo en la demo, en proyector y en un video de 2 minutos o menos.
- El timeline se carga una vez y se recorre en memoria (D-003).
- Datos: el Backend oficial de la API v1, solo por `VITE_API_BASE_URL` (ver `CLAUDE.md`). El mock no se usa.

## Capabilities and Constraints

- Endpoints, campos, errores y rangos: `contracts/openapi.json` y `.handoff/docs/06-contrato-y-errores.md`. La latitud vigente es `[-90, 90]` (D-010).
- `next_sunset_utc` y `next_earthset_utc` pueden venir en `null`.
- Vacío lunar: sin refracción. En el polo el Sol queda a unos 1.5–2° del horizonte.
- Sin decidir: si History se guarda en el dispositivo o en el servidor (el contrato no tiene endpoints para eso).

## Brand Commitments

- Textos de interfaz y documentación entregable **en inglés** (criterio 08, `.handoff/docs/04-reglas-del-reto.md`).
- Dirección visual propuesta (aún sin acordar): render de fondo siempre visible, paneles de vidrio oscuro flotantes con volumen y retroiluminación. Ver `.handoff/docs/ideas/console-ui-figma.md`.
- Atribución visible en la interfaz: NASA/JPL Horizons, LRO LOLA team.

## Evidence on Hand

- Figma: `.handoff/docs/ideas/console-ui-figma.md`. Sus valores son de muestra y su render es una ilustración vectorial.
- No hay imágenes reales del terreno en el diseño. Nada de datos inventados en la interfaz final.

## Product Principles

1. El render es el producto: los datos lo acompañan y nunca tapan el sitio de aterrizaje.
2. Una simulación, varios niveles de detalle: cada vista dice lo mismo en el lenguaje de su usuario.
3. El tiempo es el control principal: cada número responde "¿por cuánto tiempo más?".
4. Mostrar el porqué, no solo el qué: cada veredicto lleva sus razones.
5. Datos honestos: lo que es muestra se marca como muestra, un `null` se explica y nunca se inventa un valor.

## Accessibility & Inclusion

- Texto sobre vidrio con contraste de 4.5:1 o más, contra las zonas más claras y más oscuras del render.
- El estado nunca depende solo del color: `GO` / `CAUTION` / `NO-GO`, Sol y Tierra llevan siempre etiqueta o ícono.
- Números con `tabular-nums` para que no tiemblen al mover el slider.
