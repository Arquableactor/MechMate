#!/usr/bin/env bash
# Regenera el cliente Dart (packages/mechmate_api) desde el contrato de la API.
# Correr tras cualquier cambio en apps/api/openapi.json (pnpm --filter api openapi:export).
# Requiere Node (npx) y Java 11+ (openapi-generator); versión fijada en openapitools.json.
# Determinista: las versiones de json_serializable/build_runner salen de
# tool/mechmate_api.pubspec.lock (así CI puede verificar que el cliente está al día).
#   ./tool/gen_api.sh                 regenera con las versiones fijadas
#   ./tool/gen_api.sh --update-lock   además actualiza esas versiones
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=packages/mechmate_api
rm -rf "$OUT"
npx --yes @openapitools/openapi-generator-cli@2.41.0 generate \
  -i ../api/openapi.json \
  -g dart-dio \
  -c tool/openapi-generator.yaml \
  -o "$OUT" \
  --global-property apiTests=false,modelTests=false,apiDocs=false,modelDocs=false

# El generador declara SDK >=3.5, pero json_serializable actual emite sintaxis
# de Dart 3.8 (null-aware elements): se exige Dart 3.8+.
sed -i.bak -E "s/^  sdk: .*/  sdk: ^3.8.0/" "$OUT/pubspec.yaml" && rm "$OUT/pubspec.yaml.bak"

# json_serializable / copy_with: el código .g.dart se genera aquí y se versiona,
# así la app compila sin correr build_runner.
LOCK=tool/mechmate_api.pubspec.lock
if [[ "${1:-}" == "--update-lock" || ! -f "$LOCK" ]]; then
  (cd "$OUT" && dart pub get)
  cp "$OUT/pubspec.lock" "$LOCK"
else
  cp "$LOCK" "$OUT/pubspec.lock"
  (cd "$OUT" && dart pub get --enforce-lockfile)
fi
(cd "$OUT" && dart run build_runner build --delete-conflicting-outputs)
echo "Cliente regenerado en $OUT"
