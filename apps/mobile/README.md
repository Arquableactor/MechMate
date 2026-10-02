# MechMate — app móvil (Flutter)

App del taller: clientes, vehículos, órdenes de trabajo, DVI, aprobación y cobro.
Proyecto Flutter propio, **fuera** del workspace pnpm/Turborepo.

## Correr

```bash
flutter pub get
flutter run -d chrome --web-port 5000        # contra la API de Render (por defecto)
flutter run -d chrome --web-port 5000 --dart-define=API_BASE_URL=http://localhost:3000   # API local
flutter test && flutter analyze
```

`--web-port 5000` es obligatorio en web: es la URL registrada en Auth0 (Callback, Logout y Web
Origins de la app "MechMate App (web)"). Otro puerto ⇒ Auth0 rechaza el login.

## Login (Auth0)

- Web: Universal Login por redirección; sesión en localStorage con refresh tokens rotativos.
- Android/iOS: navegador del sistema; tokens en Keystore/Keychain. Necesitan su propia app
  **Native** en Auth0: `--dart-define=AUTH0_CLIENT_ID=<client id native>`.
- Configuración (pública) en `lib/core/config.dart`; nada secreto vive en la app.

## Cliente de la API (generado — no se edita a mano)

`packages/mechmate_api` se genera desde el contrato `apps/api/openapi.json`
(`openapi-generator` 7.25, `dart-dio` + `json_serializable`). Tras cambiar la API:

```bash
pnpm --filter api openapi:export   # 1. contrato actualizado (desde la raíz del repo)
./tool/gen_api.sh                  # 2. cliente Dart regenerado (requiere Java 11+ y Node)
```

CI falla si el cliente no coincide con el contrato.

## Estructura

- `lib/core/` — config (`--dart-define`), cliente HTTP, router (go_router), tema (Material 3).
- `lib/features/<feature>/` — pantallas + providers (Riverpod) por funcionalidad.
- `test/support/fake_api.dart` — red simulada: el cliente generado corre de verdad en los tests.
