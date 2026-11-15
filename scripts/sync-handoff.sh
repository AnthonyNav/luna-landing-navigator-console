#!/usr/bin/env bash
# Trae/actualiza una copia de SOLO LECTURA del repo handoff en .handoff/ y
# reporta qué cambió desde la última revisión. No edita nada del handoff.
# Ejecutar al empezar cada sesión y antes de implementar un módulo.
set -euo pipefail
REPO_URL="https://github.com/CarlitooooK/handoff-space-NASA-challenge.git"
cd "$(dirname "$0")/.."
LAST_FILE=".handoff-last-sync"   # hash revisado por última vez (se versiona)

if [ -d .handoff/.git ]; then git -C .handoff pull --ff-only --quiet
else git clone --quiet "$REPO_URL" .handoff; fi

NEW=$(git -C .handoff rev-parse --short HEAD)
OLD=$(cat "$LAST_FILE" 2>/dev/null || echo "")
echo "handoff: ${OLD:-<nunca>} -> $NEW"

if [ -n "$OLD" ] && [ "$OLD" != "$NEW" ]; then
  echo "--- Archivos cambiados en el handoff ---"
  git -C .handoff diff --stat "$OLD" "$NEW" -- docs contracts PREGUNTAS.md FRONTEND_API_GUIDE.md AGENTS.md COMO-USAR-ESTE-REPO.md contexto-sesiones || true
fi

if ! diff -q .handoff/contracts/openapi.json contracts/openapi.json >/dev/null; then
  echo "!! contracts/openapi.json cambió. Cópialo y regenera tipos:"
  echo "   cp .handoff/contracts/openapi.json contracts/openapi.json && npm run gen:types"
else
  echo "openapi.json al día."
fi
echo "Cuando termines de revisar:  echo $NEW > $LAST_FILE"
