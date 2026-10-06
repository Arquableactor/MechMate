#!/usr/bin/env bash
# Build de la app web (Flutter) → build/web, para el sitio estático de Render.
# Render no trae Flutter: si no está en el PATH, instala la versión FIJADA
# (la misma de CI) en $FLUTTER_HOME (por defecto ~/flutter).
# El cliente de la API (packages/mechmate_api) está versionado: no hace falta Java.
#
# Variables opcionales (si no se pasan, valen las de lib/core/config.dart):
#   API_BASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE
set -euo pipefail
cd "$(dirname "$0")/.."

FLUTTER_VERSION="${FLUTTER_VERSION:-3.41.2}"

if ! command -v flutter >/dev/null 2>&1; then
  FLUTTER_HOME="${FLUTTER_HOME:-$HOME/flutter}"
  if [ ! -x "$FLUTTER_HOME/bin/flutter" ]; then
    echo "Instalando Flutter $FLUTTER_VERSION en $FLUTTER_HOME…"
    git clone --depth 1 --branch "$FLUTTER_VERSION" https://github.com/flutter/flutter.git "$FLUTTER_HOME"
  fi
  export PATH="$FLUTTER_HOME/bin:$PATH"
fi

flutter --disable-analytics >/dev/null 2>&1 || true
flutter --version

defines=()
for name in API_BASE_URL AUTH0_DOMAIN AUTH0_CLIENT_ID AUTH0_AUDIENCE; do
  if [ -n "${!name:-}" ]; then defines+=("--dart-define=$name=${!name}"); fi
done

flutter pub get --enforce-lockfile
flutter build web --release "${defines[@]}"
echo "App web lista en apps/mobile/build/web"
